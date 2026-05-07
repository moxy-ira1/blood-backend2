# Blood Donation Management System

A comprehensive backend system for managing blood donations, donor eligibility, blood testing, inventory, and communications for blood banks.

## 🩸 Features

### Core Functionality
- **User Management**: Multi-role system (Owner/BTD Admin, Worker, Donor)
- **Authentication**: JWT for owners, OTP for workers, ID number login for donors
- **Blood Testing**: Complete blood test workflow with eligibility evaluation
- **Donation Process**: 56-day rule enforcement and donation tracking
- **Inventory Management**: Blood stock tracking with expiry monitoring
- **Messaging System**: Communication between donors, workers, and BTD
- **Notifications**: Automated alerts for donations, test results, and expiry
- **Audit Logging**: Complete audit trail of all critical actions
- **Import/Export**: Data management with CSV import/export

### Business Logic
- **Eligibility Rules**: HIV, Hepatitis B/C, Malaria, Hemoglobin level validation
- **Donation Rules**: 56-day cooldown between donations
- **Inventory Rules**: 42-day blood expiry with automatic marking
- **Role-Based Access**: Secure access control for different user types

## 🏗️ Architecture

### Technology Stack
- **Backend**: Node.js + Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT + OTP
- **Communication**: Email (Nodemailer) + SMS (Twilio)
- **Validation**: Joi
- **File Processing**: CSV import/export

### Project Structure
```
blood-bank-system/
├── config/
│   └── database.js          # Database configuration
├── controllers/             # HTTP request handlers
│   ├── authController.js
│   ├── donorController.js
│   ├── workerController.js
│   ├── bloodTestController.js
│   ├── donationController.js
│   ├── inventoryController.js
│   ├── messageController.js
│   ├── notificationController.js
│   ├── auditController.js
│   ├── userController.js
│   └── importExportController.js
├── middleware/              # Custom middleware
│   ├── authMiddleware.js
│   └── roleMiddleware.js
├── models/                  # Database models
│   ├── index.js
│   ├── User.js
│   ├── Donor.js
│   ├── Worker.js
│   ├── BTD.js
│   ├── AuthMethod.js
│   ├── BloodTest.js
│   ├── Donation.js
│   ├── Inventory.js
│   ├── Message.js
│   ├── Notification.js
│   └── AuditLog.js
├── routes/                  # API routes
│   ├── auth.js
│   ├── donors.js
│   ├── workers.js
│   ├── bloodTests.js
│   ├── donations.js
│   ├── inventory.js
│   ├── messages.js
│   ├── notifications.js
│   ├── audit.js
│   ├── users.js
│   └── importExport.js
├── services/               # Business logic
│   ├── authService.js
│   ├── donorService.js
│   ├── workerService.js
│   ├── bloodTestService.js
│   ├── donationService.js
│   ├── inventoryService.js
│   ├── messageService.js
│   ├── notificationService.js
│   ├── auditService.js
│   ├── userService.js
│   └── importExportService.js
├── utils/                   # Utility functions
│   ├── constants.js
│   ├── helpers.js
│   └── validation.js
├── uploads/                 # File upload directory
├── exports/                 # Generated export files
├── .env.example             # Environment variables template
├── package.json
├── server.js                # Main application file
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd blood-bank-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=blood_bank_system
   DB_USER=root
   DB_PASSWORD=your_password

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d

   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password

   # Twilio Configuration
   TWILIO_ACCOUNT_SID=your-twilio-account-sid
   TWILIO_AUTH_TOKEN=your-twilio-auth-token
   TWILIO_PHONE_NUMBER=your-twilio-phone-number

   # System Configuration
   BLOOD_EXPIRY_DAYS=42
   DONATION_COOLDOWN_DAYS=56
   HEMOGLOBIN_THRESHOLD=12.5
   ```

4. **Setup database**
   ```bash
   # Create database
   mysql -u root -p
   CREATE DATABASE blood_bank_system;
   EXIT;

   # The application will auto-create tables on first run
   ```

5. **Create required directories**
   ```bash
   mkdir uploads exports
   ```

6. **Start the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## 📡 API Documentation

### Authentication Endpoints

#### Owner Login
```http
POST /api/auth/owner/login
Content-Type: application/json

{
  "email": "owner@bloodbank.com",
  "password": "password123"
}
```

#### Worker OTP Request
```http
POST /api/auth/worker/send-otp
Content-Type: application/json

{
  "phone": "+2348012345678"
}
```

#### Worker Login
```http
POST /api/auth/worker/login
Content-Type: application/json

{
  "phone": "+2348012345678",
  "otp": "123456"
}
```

#### Donor Login
```http
POST /api/auth/donor/login
Content-Type: application/json

{
  "idNumber": "12345678901"
}
```

### Donor Management

#### Create Donor (Owner/Worker)
```http
POST /api/donors
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "donor@example.com",
  "phone": "+2348012345678",
  "donorId": "DONOR001",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "bloodType": "O+",
  "address": "123 Main St",
  "city": "Lagos",
  "state": "Lagos",
  "idNumber": "12345678901"
}
```

#### Get Donors (Owner/Worker)
```http
GET /api/donors?page=1&limit=10&bloodType=O+
Authorization: Bearer <token>
```

### Blood Testing

#### Create Blood Test (Worker)
```http
POST /api/blood-tests
Authorization: Bearer <token>
Content-Type: application/json

{
  "donorId": "donor-uuid",
  "hivResult": "negative",
  "hepatitisBResult": "negative",
  "hepatitisCResult": "negative",
  "malariaResult": "negative",
  "hemoglobinLevel": 14.5
}
```

#### Complete Blood Test (Worker)
```http
POST /api/blood-tests/:testId/complete
Authorization: Bearer <token>
```

### Donation Process

#### Create Donation (Worker)
```http
POST /api/donations
Authorization: Bearer <token>
Content-Type: application/json

{
  "donorId": "donor-uuid",
  "quantityML": 450,
  "bloodPressure": {
    "systolic": 120,
    "diastolic": 80
  },
  "pulse": 72,
  "temperature": 36.5,
  "weight": 70,
  "hemoglobinLevel": 14.5
}
```

#### Check Donor Eligibility
```http
GET /api/donations/eligibility/:donorId
Authorization: Bearer <token>
```

### Inventory Management

#### Get Inventory (Owner/Worker)
```http
GET /api/inventory?bloodType=O+&status=available
Authorization: Bearer <token>
```

#### Mark Blood as Used (Worker)
```http
POST /api/inventory/:inventoryId/use
Authorization: Bearer <token>
Content-Type: application/json

{
  "useFor": "Emergency surgery"
}
```

#### Check Expired Blood
```http
POST /api/inventory/check-expired
Authorization: Bearer <token>
```

### Messaging

#### Send Message
```http
POST /api/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "receiverId": "receiver-uuid",
  "subject": "Donation Inquiry",
  "content": "I would like to schedule a donation",
  "messageType": "donor_to_worker",
  "priority": "medium"
}
```

### Notifications

#### Get Notifications
```http
GET /api/notifications?page=1&limit=10&isRead=false
Authorization: Bearer <token>
```

#### Mark as Read
```http
PUT /api/notifications/:notificationId/read
Authorization: Bearer <token>
```

### Import/Export

#### Export Donors (Owner)
```http
GET /api/import-export/donors?bloodType=O+
Authorization: Bearer <token>
```

#### Import Donors (Owner)
```http
POST /api/import-export/donors
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: donors.csv
```

## 🔧 Configuration

### Database Setup
The system uses MySQL with Sequelize ORM. Tables are automatically created on first run.

### Email Configuration
Configure SMTP settings in `.env` for email notifications:
- Gmail: Use App Password for authentication
- Other providers: Update host/port accordingly

### SMS Configuration
Set up Twilio account and configure credentials in `.env` for OTP sending.

### System Parameters
- `BLOOD_EXPIRY_DAYS`: Days before blood expires (default: 42)
- `DONATION_COOLDOWN_DAYS`: Days between donations (default: 56)
- `HEMOGLOBIN_THRESHOLD`: Minimum hemoglobin level (default: 12.5)

## 🧪 Testing

### Running Tests
```bash
npm test
```

### Test Coverage
- Authentication flows
- Business logic validation
- API endpoints
- Database operations

## 📊 Business Rules

### Blood Testing Rules
1. **Positive Result**: Any positive test (HIV, Hepatitis B/C, Malaria) = NOT ELIGIBLE
2. **Hemoglobin**: Level below threshold = NOT ELIGIBLE
3. **Overall**: All tests negative AND hemoglobin ≥ threshold = ELIGIBLE

### Donation Rules
1. **Eligibility**: Donor must be marked as eligible
2. **Cooldown**: Must respect 56-day rule between donations
3. **Process**: Validate → Check eligibility → Check cooldown → Create donation → Update inventory

### Inventory Rules
1. **Expiry**: 42 days from collection date
2. **Auto-marking**: Expired blood automatically marked
3. **Usage**: Expired blood cannot be used

## 🔒 Security

### Authentication
- **Owner**: Email + password + JWT
- **Worker**: Phone + OTP + JWT
- **Donor**: ID number + JWT

### Authorization
- Role-based access control
- Resource ownership validation
- Request logging and audit trails

### Data Protection
- Password hashing with bcrypt
- JWT token expiration
- Input validation and sanitization
- SQL injection prevention (Sequelize ORM)

## 📝 Audit Trail

All critical actions are logged:
- User authentication
- Donor creation/updates
- Blood tests
- Donations
- Inventory changes
- System configuration

## 🚀 Deployment

### Production Setup
1. Set `NODE_ENV=production`
2. Configure production database
3. Set up SSL certificates
4. Configure reverse proxy (nginx)
5. Set up process manager (PM2)
6. Configure monitoring

### Environment Variables
Required for production:
- `NODE_ENV=production`
- `DB_*` database settings
- `JWT_SECRET` (strong secret)
- `EMAIL_*` email settings
- `TWILIO_*` SMS settings

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Create GitHub issue
- Email: support@bloodbank.com
- Documentation: Check API docs above

## 📈 Monitoring

### Health Check
```http
GET /health
```

### Metrics
- User activity
- Donation statistics
- Inventory levels
- System performance

### Logs
- Application logs
- Audit logs
- Error tracking
- Performance monitoring

---

**Built with ❤️ for blood banks and donors**
