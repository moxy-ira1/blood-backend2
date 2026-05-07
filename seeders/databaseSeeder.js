const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { User, BTD, Worker, Donor } = require('../models');

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Create Owner User
    const ownerPassword = await bcrypt.hash('owner123', 10);
    const owner = await User.create({
      id: uuidv4(),
      email: 'owner@lifbank.com',
      password: ownerPassword,
      phone: '+1234567890',
      role: 'owner',
      isActive: true
    });

    // Create BTD (Blood Transfusion Department)
    const btd = await BTD.create({
      id: uuidv4(),
      userId: owner.id,
      name: 'Central Blood Bank',
      licenseNumber: 'BBL-2024-001',
      address: '123 Medical Center Drive',
      city: 'Lagos',
      state: 'Lagos State',
      country: 'Nigeria',
      phoneNumber: '+2348001234567',
      email: 'info@centralbloodbank.com',
      operatingHours: {
        monday: { open: '08:00', close: '18:00' },
        tuesday: { open: '08:00', close: '18:00' },
        wednesday: { open: '08:00', close: '18:00' },
        thursday: { open: '08:00', close: '18:00' },
        friday: { open: '08:00', close: '18:00' },
        saturday: { open: '09:00', close: '15:00' },
        sunday: { closed: true }
      },
      isActive: true
    });

    // Create Worker User
    const workerPassword = await bcrypt.hash('worker123', 10);
    const workerUser = await User.create({
      id: uuidv4(),
      email: 'worker@lifbank.com',
      password: workerPassword,
      phone: '+1234567891',
      role: 'worker',
      isActive: true
    });

    // Create Worker Profile
    const worker = await Worker.create({
      id: uuidv4(),
      userId: workerUser.id,
      btdId: btd.id,
      firstName: 'John',
      lastName: 'Smith',
      employeeId: 'EMP-2024-001',
      position: 'Phlebotomist',
      department: 'Donation Services',
      qualifications: ['Certified Phlebotomist', 'BLS Certified'],
      hireDate: new Date('2024-01-15'),
      isActive: true
    });

    // Create Donor Users
    const donorPasswords = await Promise.all([
      bcrypt.hash('donor123', 10),
      bcrypt.hash('donor456', 10),
      bcrypt.hash('donor789', 10)
    ]);

    const donors = [];
    
    // Donor 1 - O+ Blood Type
    const donor1User = await User.create({
      id: uuidv4(),
      email: 'donor1@lifbank.com',
      password: donorPasswords[0],
      phone: '+1234567892',
      role: 'donor',
      isActive: true
    });

    const donor1 = await Donor.create({
      id: uuidv4(),
      userId: donor1User.id,
      donorId: 'DON-2024-001',
      firstName: 'Alice',
      lastName: 'Johnson',
      dateOfBirth: new Date('1990-05-15'),
      gender: 'female',
      bloodType: 'O+',
      phoneNumber: '+1234567892',
      email: 'alice.johnson@email.com',
      address: '456 Donor Street',
      city: 'Lagos',
      state: 'Lagos State',
      idNumber: 'ID-123456789',
      eligibilityStatus: 'eligible',
      lastDonationDate: new Date('2024-01-10'),
      totalDonations: 5,
      isRegisteredByWorker: true,
      registeredByWorkerId: worker.id,
      isActive: true
    });

    donors.push(donor1);

    // Donor 2 - A+ Blood Type
    const donor2User = await User.create({
      id: uuidv4(),
      email: 'donor2@lifbank.com',
      password: donorPasswords[1],
      phone: '+1234567893',
      role: 'donor',
      isActive: true
    });

    const donor2 = await Donor.create({
      id: uuidv4(),
      userId: donor2User.id,
      donorId: 'DON-2024-002',
      firstName: 'Bob',
      lastName: 'Williams',
      dateOfBirth: new Date('1985-08-22'),
      gender: 'male',
      bloodType: 'A+',
      phoneNumber: '+1234567893',
      email: 'bob.williams@email.com',
      address: '789 Donor Avenue',
      city: 'Abuja',
      state: 'FCT',
      idNumber: 'ID-987654321',
      eligibilityStatus: 'eligible',
      lastDonationDate: new Date('2023-12-15'),
      totalDonations: 3,
      isRegisteredByWorker: true,
      registeredByWorkerId: worker.id,
      isActive: true
    });

    donors.push(donor2);

    // Donor 3 - B+ Blood Type
    const donor3User = await User.create({
      id: uuidv4(),
      email: 'donor3@lifbank.com',
      password: donorPasswords[2],
      phone: '+1234567894',
      role: 'donor',
      isActive: true
    });

    const donor3 = await Donor.create({
      id: uuidv4(),
      userId: donor3User.id,
      donorId: 'DON-2024-003',
      firstName: 'Carol',
      lastName: 'Davis',
      dateOfBirth: '1992-03-10',
      gender: 'female',
      bloodType: 'B+',
      phoneNumber: '+1234567894',
      email: 'carol.davis@email.com',
      address: '321 Donor Road',
      city: 'Port Harcourt',
      state: 'Rivers State',
      idNumber: 'ID-456789123',
      eligibilityStatus: 'pending',
      totalDonations: 0,
      isRegisteredByWorker: false,
      isActive: true
    });

    donors.push(donor3);

    console.log('Database seeding completed successfully!');
    console.log('\n=== LOGIN CREDENTIALS ===');
    console.log('Owner Login:');
    console.log('  Email: owner@lifbank.com');
    console.log('  Password: owner123');
    console.log('\nWorker Login:');
    console.log('  Email: worker@lifbank.com');
    console.log('  Password: worker123');
    console.log('\nDonor Logins:');
    console.log('  Donor 1 (O+): donor1@lifbank.com / donor123');
    console.log('  Donor 2 (A+): donor2@lifbank.com / donor456');
    console.log('  Donor 3 (B+): donor3@lifbank.com / donor789');
    console.log('\n==========================');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

module.exports = seedDatabase;
