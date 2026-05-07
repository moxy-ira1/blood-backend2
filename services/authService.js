const jwt = require('jsonwebtoken');
const { User, BTD, Worker, Donor, AuthMethod, AuditLog } = require('../models');
const bcrypt = require('bcryptjs');
const twilio = require('twilio');
const nodemailer = require('nodemailer');

class AuthService {
  constructor() {
    // Initialize Twilio client only if credentials are available
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    } else {
      console.warn('Twilio credentials not found. OTP functionality will be disabled.');
      this.twilioClient = null;
    }
    
    // Initialize email transporter only if credentials are available
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      this.emailTransporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    } else {
      console.warn('Email credentials not found. Email functionality will be disabled.');
      this.emailTransporter = null;
    }
  }

  generateToken(userId, role) {
    return jwt.sign(
      { userId, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  async ownerLogin(email, password, ipAddress, userAgent) {
    try {
      const user = await User.findOne({
        where: { email, role: 'owner', isActive: true },
        include: [{ model: BTD, as: 'btd' }]
      });

      if (!user || !(await user.comparePassword(password))) {
        await this.logAudit(null, 'LOGIN', 'User', null, 'Failed owner login attempt', ipAddress, userAgent, null, null, 'failure', 'Invalid credentials');
        throw new Error('Invalid credentials');
      }

      const token = this.generateToken(user.id, user.role);
      
      user.lastLogin = new Date();
      await user.save();

      await this.logAudit(user.id, 'LOGIN', 'User', user.id, 'Owner login successful', ipAddress, userAgent);

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          btd: user.btd
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async sendWorkerOTP(phone) {
    try {
      const user = await User.findOne({
        where: { phone, role: 'worker', isActive: true },
        include: [{ model: Worker, as: 'worker', include: [{ model: BTD, as: 'btd' }] }]
      });

      if (!user) {
        throw new Error('Worker not found');
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await user.update({ 
        otp, 
        otpExpiry,
        lastLogin: new Date()
      });

      // Send OTP only if Twilio client is available
      if (this.twilioClient) {
        await this.twilioClient.messages.create({
          body: `Your Blood Bank System OTP is: ${otp}. Valid for 10 minutes.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phone
        });
      } else {
        console.log(`OTP for ${phone}: ${otp} (Twilio not configured)`);
      }

      return { message: 'OTP sent successfully', phone };
    } catch (error) {
      throw error;
    }
  }

  async workerLogin(phone, otp, ipAddress, userAgent) {
    try {
      const user = await User.findOne({
        where: { phone, role: 'worker', isActive: true },
        include: [{ model: Worker, as: 'worker', include: [{ model: BTD, as: 'btd' }] }]
      });

      if (!user || !user.otp || user.otp !== otp) {
        await this.logAudit(null, 'LOGIN', 'User', null, 'Failed worker login attempt', ipAddress, userAgent, null, null, 'failure', 'Invalid OTP');
        throw new Error('Invalid OTP');
      }

      if (new Date() > user.otpExpiry) {
        throw new Error('OTP expired');
      }

      const token = this.generateToken(user.id, user.role);

      await user.update({ 
        otp: null, 
        otpExpiry: null,
        lastLogin: new Date()
      });

      await this.logAudit(user.id, 'LOGIN', 'User', user.id, 'Worker login successful', ipAddress, userAgent);

      return {
        token,
        user: {
          id: user.id,
          phone: user.phone,
          role: user.role,
          worker: user.worker
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async donorLogin(idNumber, ipAddress, userAgent) {
    try {
      const donor = await Donor.findOne({
        where: { idNumber, isActive: true },
        include: [{ model: User, as: 'user' }]
      });

      if (!donor || !donor.user.isActive) {
        await this.logAudit(null, 'LOGIN', 'Donor', null, 'Failed donor login attempt', ipAddress, userAgent, null, null, 'failure', 'Invalid ID number');
        throw new Error('Invalid ID number');
      }

      const token = this.generateToken(donor.user.id, 'donor');

      await donor.user.update({ lastLogin: new Date() });

      await this.logAudit(donor.user.id, 'LOGIN', 'Donor', donor.id, 'Donor login successful', ipAddress, userAgent);

      return {
        token,
        donor: {
          id: donor.id,
          donorId: donor.donorId,
          firstName: donor.firstName,
          lastName: donor.lastName,
          bloodType: donor.bloodType,
          eligibilityStatus: donor.eligibilityStatus,
          lastDonationDate: donor.lastDonationDate,
          totalDonations: donor.totalDonations
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId, {
        attributes: ['id', 'email', 'phone', 'role', 'isActive']
      });

      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      return user;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async logAudit(userId, action, entityType, entityId, description, ipAddress, userAgent, oldValue = null, newValue = null, status = 'success', errorMessage = null) {
    try {
      await AuditLog.create({
        userId,
        action,
        entityType,
        entityId,
        description,
        ipAddress,
        userAgent,
        oldValue,
        newValue,
        status,
        errorMessage
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }

  async createAuthMethod(donorId, method, identifier) {
    try {
      await AuthMethod.create({
        donorId,
        method,
        identifier,
        isActive: true
      });
    } catch (error) {
      throw error;
    }
  }

  async sendEmailNotification(to, subject, text) {
    try {
      await this.emailTransporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }
}

module.exports = new AuthService();
