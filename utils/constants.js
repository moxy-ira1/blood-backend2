// Blood donation system constants

// Blood types
const BLOOD_TYPES = {
  A_POSITIVE: 'A+',
  A_NEGATIVE: 'A-',
  B_POSITIVE: 'B+',
  B_NEGATIVE: 'B-',
  AB_POSITIVE: 'AB+',
  AB_NEGATIVE: 'AB-',
  O_POSITIVE: 'O+',
  O_NEGATIVE: 'O-'
};

// User roles
const USER_ROLES = {
  OWNER: 'owner',
  WORKER: 'worker',
  DONOR: 'donor'
};

// Donation status
const DONATION_STATUS = {
  COMPLETED: 'completed',
  IN_PROGRESS: 'in_progress',
  CANCELLED: 'cancelled',
  DEFERRED: 'deferred'
};

// Eligibility status
const ELIGIBILITY_STATUS = {
  ELIGIBLE: 'eligible',
  NOT_ELIGIBLE: 'not_eligible',
  PENDING: 'pending'
};

// Inventory status
const INVENTORY_STATUS = {
  AVAILABLE: 'available',
  EXPIRED: 'expired',
  DISCARDED: 'discarded',
  USED: 'used',
  QUARANTINED: 'quarantined'
};

// Blood test results
const TEST_RESULTS = {
  POSITIVE: 'positive',
  NEGATIVE: 'negative',
  PENDING: 'pending'
};

// Notification types
const NOTIFICATION_TYPES = {
  DONATION_SUCCESS: 'donation_success',
  BLOOD_TEST_RESULT: 'blood_test_result',
  ELIGIBILITY_CHANGE: 'eligibility_change',
  BLOOD_EXPIRY: 'blood_expiry',
  SYSTEM_ALERT: 'system_alert',
  REMINDER: 'reminder'
};

// Message types
const MESSAGE_TYPES = {
  DONOR_TO_WORKER: 'donor_to_worker',
  DONOR_TO_BTD: 'donor_to_btd',
  WORKER_TO_DONOR: 'worker_to_donor',
  BTD_TO_DONOR: 'btd_to_donor',
  WORKER_TO_BTD: 'worker_to_btd',
  BTD_TO_WORKER: 'btd_to_worker'
};

// Priority levels
const PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Donation types
const DONATION_TYPES = {
  WHOLE_BLOOD: 'whole_blood',
  PLASMA: 'plasma',
  PLATELETS: 'platelets',
  RED_BLOOD_CELLS: 'red_blood_cells'
};

// Audit actions
const AUDIT_ACTIONS = {
  CREATE_DONATION: 'CREATE_DONATION',
  CREATE_BLOOD_TEST: 'CREATE_BLOOD_TEST',
  UPDATE_USER: 'UPDATE_USER',
  INVENTORY_UPDATE: 'INVENTORY_UPDATE',
  CREATE_MESSAGE: 'CREATE_MESSAGE',
  CREATE_NOTIFICATION: 'CREATE_NOTIFICATION',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  DELETE_DONATION: 'DELETE_DONATION',
  UPDATE_DONOR: 'UPDATE_DONOR',
  CREATE_WORKER: 'CREATE_WORKER',
  UPDATE_WORKER: 'UPDATE_WORKER',
  DELETE_WORKER: 'DELETE_WORKER',
  CREATE_DONOR: 'CREATE_DONOR',
  IMPORT_DONOR: 'IMPORT_DONOR'
};

// Auth methods
const AUTH_METHODS = {
  ID_NUMBER: 'id_number',
  PHONE: 'phone',
  EMAIL: 'email'
};

// Gender options
const GENDER = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other'
};

// HTTP status codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// Error messages
const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  DONOR_NOT_FOUND: 'Donor not found',
  WORKER_NOT_FOUND: 'Worker not found',
  BTD_NOT_FOUND: 'BTD not found',
  DONATION_NOT_FOUND: 'Donation not found',
  BLOOD_TEST_NOT_FOUND: 'Blood test not found',
  INVENTORY_NOT_FOUND: 'Inventory item not found',
  MESSAGE_NOT_FOUND: 'Message not found',
  NOTIFICATION_NOT_FOUND: 'Notification not found',
  ACCESS_DENIED: 'Access denied',
  INVALID_TOKEN: 'Invalid or expired token',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  PHONE_ALREADY_EXISTS: 'Phone already exists',
  ID_NUMBER_ALREADY_EXISTS: 'ID number already exists',
  DONOR_ID_ALREADY_EXISTS: 'Donor ID already exists',
  EMPLOYEE_ID_ALREADY_EXISTS: 'Employee ID already exists',
  LICENSE_NUMBER_ALREADY_EXISTS: 'License number already exists',
  DONOR_NOT_ELIGIBLE: 'Donor is not eligible for donation',
  DONATION_COOLDOWN_ACTIVE: 'Donor must wait longer before next donation (56-day rule)',
  BLOOD_EXPIRED: 'Blood has expired',
  INSUFFICIENT_INVENTORY: 'Insufficient blood inventory',
  INVALID_BLOOD_TYPE: 'Invalid blood type',
  INVALID_FILE_TYPE: 'Invalid file type',
  FILE_TOO_LARGE: 'File size too large',
  VALIDATION_ERROR: 'Validation error',
  DATABASE_ERROR: 'Database error',
  SERVER_ERROR: 'Internal server error'
};

// Success messages
const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully',
  DONOR_CREATED: 'Donor created successfully',
  DONOR_UPDATED: 'Donor updated successfully',
  DONOR_DELETED: 'Donor deleted successfully',
  WORKER_CREATED: 'Worker created successfully',
  WORKER_UPDATED: 'Worker updated successfully',
  WORKER_DELETED: 'Worker deleted successfully',
  DONATION_CREATED: 'Donation recorded successfully',
  DONATION_UPDATED: 'Donation updated successfully',
  BLOOD_TEST_CREATED: 'Blood test created successfully',
  BLOOD_TEST_UPDATED: 'Blood test updated successfully',
  INVENTORY_UPDATED: 'Inventory updated successfully',
  MESSAGE_SENT: 'Message sent successfully',
  NOTIFICATION_CREATED: 'Notification created successfully',
  FILE_UPLOADED: 'File uploaded successfully',
  FILE_DOWNLOADED: 'File downloaded successfully',
  DATA_EXPORTED: 'Data exported successfully',
  DATA_IMPORTED: 'Data imported successfully'
};

// Email templates
const EMAIL_TEMPLATES = {
  WELCOME_DONOR: {
    subject: 'Welcome to Blood Bank System',
    template: 'welcome-donor'
  },
  DONATION_SUCCESS: {
    subject: 'Thank You for Your Blood Donation',
    template: 'donation-success'
  },
  BLOOD_TEST_RESULTS: {
    subject: 'Your Blood Test Results',
    template: 'blood-test-results'
  },
  ELIGIBILITY_CHANGED: {
    subject: 'Your Donation Eligibility Status',
    template: 'eligibility-changed'
  },
  APPOINTMENT_REMINDER: {
    subject: 'Donation Appointment Reminder',
    template: 'appointment-reminder'
  },
  BLOOD_NEEDED: {
    subject: 'Urgent: Blood Needed',
    template: 'blood-needed'
  }
};

// SMS templates
const SMS_TEMPLATES = {
  OTP: 'Your Blood Bank System OTP is: {otp}. Valid for 10 minutes.',
  DONATION_REMINDER: 'Reminder: You are eligible to donate blood. Visit us today!',
  APPOINTMENT_CONFIRMED: 'Your donation appointment is confirmed for {date} at {time}.',
  BLOOD_NEEDED: 'Urgent: {bloodType} blood needed. Please donate if you can.',
  THANK_YOU: 'Thank you for donating {quantity}ml of {bloodType} blood. You saved lives!'
};

// System limits
const LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_LOCKOUT_TIME: 15 * 60 * 1000, // 15 minutes
  OTP_EXPIRY_TIME: 10 * 60 * 1000, // 10 minutes
  DONATION_COOLDOWN_DAYS: 56,
  BLOOD_EXPIRY_DAYS: 42,
  HEMOGLOBIN_THRESHOLD: 12.5,
  MIN_AGE: 18,
  MAX_AGE: 65,
  MIN_WEIGHT: 50, // kg
  MAX_DONATION_QUANTITY: 550, // ml
  MIN_DONATION_QUANTITY: 250 // ml
};

// Pagination defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

// Cache keys
const CACHE_KEYS = {
  USER_PREFIX: 'user:',
  DONOR_PREFIX: 'donor:',
  INVENTORY_PREFIX: 'inventory:',
  STATS_PREFIX: 'stats:',
  SESSION_PREFIX: 'session:',
  OTP_PREFIX: 'otp:'
};

// Cache TTL (in seconds)
const CACHE_TTL = {
  USER: 3600, // 1 hour
  DONOR: 1800, // 30 minutes
  INVENTORY: 300, // 5 minutes
  STATS: 600, // 10 minutes
  SESSION: 86400, // 24 hours
  OTP: 600 // 10 minutes
};

// API endpoints
const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    VERIFY_TOKEN: '/api/auth/verify-token'
  },
  DONORS: {
    LIST: '/api/donors',
    CREATE: '/api/donors',
    UPDATE: '/api/donors/:id',
    DELETE: '/api/donors/:id',
    ELIGIBLE: '/api/donors/eligible'
  },
  DONATIONS: {
    LIST: '/api/donations',
    CREATE: '/api/donations',
    UPDATE: '/api/donations/:id',
    DELETE: '/api/donations/:id',
    ELIGIBILITY: '/api/donations/eligibility/:donorId'
  },
  INVENTORY: {
    LIST: '/api/inventory',
    STATS: '/api/inventory/stats',
    EXPIRING_SOON: '/api/inventory/expiring-soon'
  },
  NOTIFICATIONS: {
    LIST: '/api/notifications',
    MARK_READ: '/api/notifications/:id/read',
    UNREAD_COUNT: '/api/notifications/unread/count'
  }
};

// Environment variables
const ENV_VARS = {
  NODE_ENV: 'NODE_ENV',
  PORT: 'PORT',
  DB_HOST: 'DB_HOST',
  DB_PORT: 'DB_PORT',
  DB_NAME: 'DB_NAME',
  DB_USER: 'DB_USER',
  DB_PASSWORD: 'DB_PASSWORD',
  JWT_SECRET: 'JWT_SECRET',
  JWT_EXPIRES_IN: 'JWT_EXPIRES_IN',
  EMAIL_HOST: 'EMAIL_HOST',
  EMAIL_PORT: 'EMAIL_PORT',
  EMAIL_USER: 'EMAIL_USER',
  EMAIL_PASS: 'EMAIL_PASS',
  TWILIO_ACCOUNT_SID: 'TWILIO_ACCOUNT_SID',
  TWILIO_AUTH_TOKEN: 'TWILIO_AUTH_TOKEN',
  TWILIO_PHONE_NUMBER: 'TWILIO_PHONE_NUMBER',
  BLOOD_EXPIRY_DAYS: 'BLOOD_EXPIRY_DAYS',
  DONATION_COOLDOWN_DAYS: 'DONATION_COOLDOWN_DAYS',
  HEMOGLOBIN_THRESHOLD: 'HEMOGLOBIN_THRESHOLD'
};

module.exports = {
  BLOOD_TYPES,
  USER_ROLES,
  DONATION_STATUS,
  ELIGIBILITY_STATUS,
  INVENTORY_STATUS,
  TEST_RESULTS,
  NOTIFICATION_TYPES,
  MESSAGE_TYPES,
  PRIORITY,
  DONATION_TYPES,
  AUDIT_ACTIONS,
  AUTH_METHODS,
  GENDER,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  EMAIL_TEMPLATES,
  SMS_TEMPLATES,
  LIMITS,
  PAGINATION,
  CACHE_KEYS,
  CACHE_TTL,
  API_ENDPOINTS,
  ENV_VARS
};
