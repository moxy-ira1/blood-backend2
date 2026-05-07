const moment = require('moment');
const crypto = require('crypto');

// Date utilities
const dateUtils = {
  formatDate: (date) => {
    return moment(date).format('YYYY-MM-DD');
  },

  formatDateTime: (date) => {
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
  },

  formatReadableDate: (date) => {
    return moment(date).format('MMMM Do, YYYY');
  },

  formatReadableDateTime: (date) => {
    return moment(date).format('MMMM Do, YYYY h:mm A');
  },

  addDays: (date, days) => {
    return moment(date).add(days, 'days').toDate();
  },

  subtractDays: (date, days) => {
    return moment(date).subtract(days, 'days').toDate();
  },

  daysBetween: (date1, date2) => {
    return moment(date2).diff(moment(date1), 'days');
  },

  isExpired: (expiryDate) => {
    return moment(expiryDate).isBefore(moment());
  },

  isExpiringSoon: (expiryDate, days = 7) => {
    return moment(expiryDate).isBefore(moment().add(days, 'days'));
  },

  getAge: (dateOfBirth) => {
    return moment().diff(moment(dateOfBirth), 'years');
  }
};

// String utilities
const stringUtils = {
  capitalize: (str) => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  capitalizeWords: (str) => {
    if (!str) return str;
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  },

  slugify: (str) => {
    return str
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  },

  generateRandomString: (length = 10) => {
    return crypto.randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length);
  },

  generateId: (prefix = '') => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
  },

  truncate: (str, length = 50, suffix = '...') => {
    if (!str || str.length <= length) return str;
    return str.substring(0, length - suffix.length) + suffix;
  },

  escapeHtml: (str) => {
    if (!str) return str;
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return str.replace(/[&<>"']/g, (m) => map[m]);
  }
};

// Number utilities
const numberUtils = {
  formatCurrency: (amount, currency = 'NGN') => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },

  formatNumber: (num) => {
    return new Intl.NumberFormat().format(num);
  },

  round: (num, decimals = 2) => {
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
  },

  clamp: (num, min, max) => {
    return Math.min(Math.max(num, min), max);
  },

  isBetween: (num, min, max) => {
    return num >= min && num <= max;
  },

  percentage: (part, total) => {
    if (total === 0) return 0;
    return (part / total) * 100;
  }
};

// Array utilities
const arrayUtils = {
  unique: (arr) => {
    return [...new Set(arr)];
  },

  groupBy: (arr, key) => {
    return arr.reduce((groups, item) => {
      const group = item[key];
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  },

  sortBy: (arr, key, direction = 'asc') => {
    return [...arr].sort((a, b) => {
      if (direction === 'desc') {
        return b[key] > a[key] ? 1 : -1;
      }
      return a[key] > b[key] ? 1 : -1;
    });
  },

  chunk: (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  },

  flatten: (arr) => {
    return arr.reduce((flat, item) => {
      return flat.concat(Array.isArray(item) ? arrayUtils.flatten(item) : item);
    }, []);
  }
};

// Object utilities
const objectUtils = {
  pick: (obj, keys) => {
    return keys.reduce((result, key) => {
      if (obj.hasOwnProperty(key)) {
        result[key] = obj[key];
      }
      return result;
    }, {});
  },

  omit: (obj, keys) => {
    const result = { ...obj };
    keys.forEach(key => delete result[key]);
    return result;
  },

  isEmpty: (obj) => {
    return Object.keys(obj).length === 0;
  },

  deepClone: (obj) => {
    return JSON.parse(JSON.stringify(obj));
  },

  merge: (target, source) => {
    return { ...target, ...source };
  },

  getNestedValue: (obj, path, defaultValue = null) => {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : defaultValue;
    }, obj);
  }
};

// File utilities
const fileUtils = {
  getFileExtension: (filename) => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  },

  getFileName: (path) => {
    return path.split('/').pop().split('\\').pop();
  },

  getFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  isValidImage: (filename) => {
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    const extension = fileUtils.getFileExtension(filename).toLowerCase();
    return validExtensions.includes(extension);
  },

  isValidDocument: (filename) => {
    const validExtensions = ['pdf', 'doc', 'docx', 'txt', 'csv'];
    const extension = fileUtils.getFileExtension(filename).toLowerCase();
    return validExtensions.includes(extension);
  }
};

// Validation utilities
const validationUtils = {
  isEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isPhone: (phone) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  },

  isUUID: (uuid) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },

  isStrongPassword: (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength && 
           hasUpperCase && 
           hasLowerCase && 
           hasNumbers && 
           hasSpecialChar;
  },

  isBloodType: (bloodType) => {
    const validTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    return validTypes.includes(bloodType);
  }
};

// Response utilities
const responseUtils = {
  success: (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  },

  error: (res, message, statusCode = 400, details = null) => {
    return res.status(statusCode).json({
      success: false,
      message,
      details,
      timestamp: new Date().toISOString()
    });
  },

  paginated: (res, data, pagination, message = 'Success') => {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination,
      timestamp: new Date().toISOString()
    });
  }
};

// Error utilities
const errorUtils = {
  createError: (message, statusCode = 400, code = null) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.code = code;
    return error;
  },

  isOperational: (error) => {
    return error.statusCode && error.statusCode < 500;
  },

  logError: (error, context = {}) => {
    console.error('Error:', {
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode,
      code: error.code,
      context,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  dateUtils,
  stringUtils,
  numberUtils,
  arrayUtils,
  objectUtils,
  fileUtils,
  validationUtils,
  responseUtils,
  errorUtils
};
