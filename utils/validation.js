const Joi = require('joi');

// Common validation schemas
const schemas = {
  // Pagination
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  }),

  // Date range
  dateRange: Joi.object({
    dateFrom: Joi.date().iso(),
    dateTo: Joi.date().iso().min(Joi.ref('dateFrom'))
  }),

  // Blood type
  bloodType: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),

  // User roles
  role: Joi.string().valid('owner', 'worker', 'donor'),

  // Status enums
  donationStatus: Joi.string().valid('completed', 'in_progress', 'cancelled', 'deferred'),
  eligibilityStatus: Joi.string().valid('eligible', 'not_eligible', 'pending'),
  inventoryStatus: Joi.string().valid('available', 'expired', 'discarded', 'used', 'quarantined'),
  testResult: Joi.string().valid('positive', 'negative', 'pending'),
  notificationType: Joi.string().valid('donation_success', 'blood_test_result', 'eligibility_change', 'blood_expiry', 'system_alert', 'reminder'),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),

  // Contact info
  email: Joi.string().email(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),

  // UUID
  uuid: Joi.string().uuid(),

  // Password
  password: Joi.string().min(6),

  // Name
  name: Joi.string().min(1).max(255),

  // Address
  address: Joi.string().min(1),

  // ID Number
  idNumber: Joi.string().min(1),

  // Text
  text: Joi.string().min(1),

  // Optional text
  optionalText: Joi.string().allow(null, ''),

  // Number
  number: Joi.number(),

  // Positive number
  positiveNumber: Joi.number().positive(),

  // Integer
  integer: Joi.number().integer(),

  // Positive integer
  positiveInteger: Joi.number().integer().positive(),

  // Date
  date: Joi.date(),

  // Boolean
  boolean: Joi.boolean(),

  // Array
  array: Joi.array(),

  // JSON
  json: Joi.object()
};

// Validation middleware factory
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source]);
    
    if (error) {
      return res.status(400).json({
        error: error.details[0].message,
        details: error.details
      });
    }
    
    req[source] = value;
    next();
  };
};

// Custom validation functions
const validateBloodType = (bloodType) => {
  const validTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  return validTypes.includes(bloodType);
};

const validatePhone = (phone) => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateIdNumber = (idNumber) => {
  // Basic validation - can be enhanced based on country requirements
  return idNumber && idNumber.length >= 6 && idNumber.length <= 20;
};

const validateAge = (dateOfBirth, minAge = 18, maxAge = 65) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age >= minAge && age <= maxAge;
};

const validateDonationEligibility = (donor) => {
  const issues = [];
  
  if (donor.eligibilityStatus !== 'eligible') {
    issues.push('Donor is not eligible for donation');
  }
  
  if (donor.lastDonationDate) {
    const cooldownDays = parseInt(process.env.DONATION_COOLDOWN_DAYS) || 56;
    const lastDonation = new Date(donor.lastDonationDate);
    const today = new Date();
    const daysSinceLastDonation = Math.floor((today - lastDonation) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastDonation < cooldownDays) {
      issues.push(`Must wait ${cooldownDays - daysSinceLastDonation} more days (56-day rule)`);
    }
  }
  
  return {
    isEligible: issues.length === 0,
    issues
  };
};

const validateBloodTestResults = (testResults) => {
  const requiredFields = ['hivResult', 'hepatitisBResult', 'hepatitisCResult', 'malariaResult', 'hemoglobinLevel'];
  const missingFields = requiredFields.filter(field => testResults[field] === undefined || testResults[field] === null);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required test results: ${missingFields.join(', ')}`);
  }
  
  const hemoglobinThreshold = parseFloat(process.env.HEMOGLOBIN_THRESHOLD) || 12.5;
  let isEligible = true;
  const reasons = [];
  
  if (testResults.hivResult === 'positive') {
    isEligible = false;
    reasons.push('HIV positive');
  }
  
  if (testResults.hepatitisBResult === 'positive') {
    isEligible = false;
    reasons.push('Hepatitis B positive');
  }
  
  if (testResults.hepatitisCResult === 'positive') {
    isEligible = false;
    reasons.push('Hepatitis C positive');
  }
  
  if (testResults.malariaResult === 'positive') {
    isEligible = false;
    reasons.push('Malaria positive');
  }
  
  if (testResults.hemoglobinLevel < hemoglobinThreshold) {
    isEligible = false;
    reasons.push(`Hemoglobin level too low (${testResults.hemoglobinLevel} g/dL)`);
  }
  
  return {
    isEligible,
    reasons,
    overallResult: isEligible ? 'eligible' : 'not_eligible'
  };
};

// Sanitization functions
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
};

const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;
  
  const sanitized = {};
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      sanitized[key] = sanitizeString(obj[key]);
    } else if (typeof obj[key] === 'object') {
      sanitized[key] = sanitizeObject(obj[key]);
    } else {
      sanitized[key] = obj[key];
    }
  }
  
  return sanitized;
};

module.exports = {
  schemas,
  validate,
  validateBloodType,
  validatePhone,
  validateEmail,
  validateIdNumber,
  validateAge,
  validateDonationEligibility,
  validateBloodTestResults,
  sanitizeString,
  sanitizeObject
};
