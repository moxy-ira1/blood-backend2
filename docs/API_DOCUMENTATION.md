# Blood Donation Management System - API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

### Overview
The system uses three different authentication methods based on user role:
- **Owner**: Email + Password + JWT
- **Worker**: Phone + OTP + JWT  
- **Donor**: ID Number + JWT

### Response Format
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "owner|worker|donor",
    "profile": { ... }
  }
}
```

## Endpoints

### Authentication

#### Owner Login
```http
POST /auth/owner/login
```

**Request Body:**
```json
{
  "email": "owner@bloodbank.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt-token",
  "user": {
    "id": "uuid",
    "email": "owner@bloodbank.com",
    "role": "owner",
    "btd": {
      "id": "uuid",
      "name": "Central Blood Bank",
      "licenseNumber": "BTD-001"
    }
  }
}
```

#### Send Worker OTP
```http
POST /auth/worker/send-otp
```

**Request Body:**
```json
{
  "phone": "+2348012345678"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully",
  "phone": "+2348012345678"
}
```

#### Worker Login
```http
POST /auth/worker/login
```

**Request Body:**
```json
{
  "phone": "+2348012345678",
  "otp": "123456"
}
```

#### Donor Login
```http
POST /auth/donor/login
```

**Request Body:**
```json
{
  "idNumber": "12345678901"
}
```

**Response:**
```json
{
  "token": "jwt-token",
  "donor": {
    "id": "uuid",
    "donorId": "DONOR001",
    "firstName": "John",
    "lastName": "Doe",
    "bloodType": "O+",
    "eligibilityStatus": "eligible",
    "lastDonationDate": "2024-01-01T00:00:00.000Z",
    "totalDonations": 5
  }
}
```

#### Verify Token
```http
POST /auth/verify-token
Authorization: Bearer <token>
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer <token>
```

---

### Donors

#### Create Donor
```http
POST /donors
Authorization: Bearer <token>
```

**Request Body:**
```json
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

#### Get All Donors
```http
GET /donors?page=1&limit=10&bloodType=O+&eligibilityStatus=eligible&isActive=true
Authorization: Bearer <token>
```

**Response:**
```json
{
  "donors": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

#### Get Donor by ID
```http
GET /donors/:donorId
Authorization: Bearer <token>
```

#### Update Donor
```http
PUT /donors/:donorId
Authorization: Bearer <token>
```

#### Get Donors by Blood Type
```http
GET /donors/blood-type/:bloodType?page=1&limit=10
Authorization: Bearer <token>
```

#### Get Eligible Donors
```http
GET /donors/eligible?page=1&limit=10&bloodType=O+
Authorization: Bearer <token>
```

#### Deactivate/Activate Donor
```http
PUT /donors/:donorId/deactivate
PUT /donors/:donorId/activate
Authorization: Bearer <token>
```

#### Get Donor Statistics
```http
GET /donors/stats
Authorization: Bearer <token>
```

---

### Blood Tests

#### Create Blood Test
```http
POST /blood-tests
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "donorId": "uuid",
  "hivResult": "negative",
  "hepatitisBResult": "negative",
  "hepatitisCResult": "negative",
  "malariaResult": "negative",
  "hemoglobinLevel": 14.5,
  "testNotes": "All tests normal"
}
```

#### Update Blood Test
```http
PUT /blood-tests/:testId
Authorization: Bearer <token>
```

#### Complete Blood Test
```http
POST /blood-tests/:testId/complete
Authorization: Bearer <token>
```

#### Get Blood Tests by Donor
```http
GET /blood-tests/donor/:donorId?page=1&limit=10&status=eligible
Authorization: Bearer <token>
```

#### Get Blood Test by ID
```http
GET /blood-tests/:testId
Authorization: Bearer <token>
```

#### Get All Blood Tests
```http
GET /blood-tests/all?page=1&limit=10&status=eligible&dateFrom=2024-01-01&dateTo=2024-12-31
Authorization: Bearer <token>
```

#### Get Blood Test Statistics
```http
GET /blood-tests/all/stats
Authorization: Bearer <token>
```

---

### Donations

#### Create Donation
```http
POST /donations
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "donorId": "uuid",
  "quantityML": 450,
  "donationType": "whole_blood",
  "bloodPressure": {
    "systolic": 120,
    "diastolic": 80
  },
  "pulse": 72,
  "temperature": 36.5,
  "weight": 70,
  "hemoglobinLevel": 14.5,
  "donationNotes": "Successful donation"
}
```

#### Update Donation Status
```http
PUT /donations/:donationId/status
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "completed",
  "notes": "Donation completed successfully"
}
```

#### Get Donations by Donor
```http
GET /donations/donor/:donorId?page=1&limit=10&status=completed
Authorization: Bearer <token>
```

#### Get Donation by ID
```http
GET /donations/:donationId
Authorization: Bearer <token>
```

#### Get All Donations
```http
GET /donations/all?page=1&limit=10&status=completed&bloodType=O+&dateFrom=2024-01-01&dateTo=2024-12-31
Authorization: Bearer <token>
```

#### Check Donor Eligibility
```http
GET /donations/eligibility/:donorId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "isEligible": true,
  "reasons": [],
  "nextEligibleDate": null
}
```

#### Get Donation Statistics
```http
GET /donations/stats?dateFrom=2024-01-01&dateTo=2024-12-31
Authorization: Bearer <token>
```

---

### Inventory

#### Get All Inventory
```http
GET /inventory?page=1&limit=10&status=available&bloodType=O+&expiryFrom=2024-01-01&expiryTo=2024-12-31
Authorization: Bearer <token>
```

#### Get Inventory by Blood Type
```http
GET /inventory/blood-type/:bloodType?page=1&limit=10&status=available
Authorization: Bearer <token>
```

#### Get Inventory Item by ID
```http
GET /inventory/:inventoryId
Authorization: Bearer <token>
```

#### Update Inventory Status
```http
PUT /inventory/:inventoryId/status
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "used",
  "reason": "Used for emergency surgery"
}
```

#### Use Blood
```http
POST /inventory/:inventoryId/use
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "useFor": "Emergency surgery"
}
```

#### Discard Blood
```http
POST /inventory/:inventoryId/discard
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "reason": "Contaminated during storage"
}
```

#### Check Expired Blood
```http
POST /inventory/check-expired
Authorization: Bearer <token>
```

#### Get Expiring Soon Blood
```http
GET /inventory/expiring-soon?days=7
Authorization: Bearer <token>
```

#### Get Inventory Statistics
```http
GET /inventory/stats
Authorization: Bearer <token>
```

---

### Messages

#### Send Message
```http
POST /messages
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "receiverId": "uuid",
  "subject": "Donation Inquiry",
  "content": "I would like to schedule a donation",
  "messageType": "donor_to_worker",
  "priority": "medium",
  "attachmentUrl": "https://example.com/file.pdf"
}
```

#### Get Messages
```http
GET /messages?page=1&limit=10&type=all&isRead=false
Authorization: Bearer <token>
```

#### Get Message by ID
```http
GET /messages/:messageId
Authorization: Bearer <token>
```

#### Mark Message as Read
```http
PUT /messages/:messageId/read
Authorization: Bearer <token>
```

#### Mark Multiple Messages as Read
```http
PUT /messages/mark-read
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "messageIds": ["uuid1", "uuid2", "uuid3"]
}
```

#### Delete Message
```http
DELETE /messages/:messageId
Authorization: Bearer <token>
```

#### Get Conversation
```http
GET /messages/conversation/:otherUserId?page=1&limit=50
Authorization: Bearer <token>
```

#### Get Unread Count
```http
GET /messages/unread/count
Authorization: Bearer <token>
```

#### Get Message Statistics
```http
GET /messages/stats
Authorization: Bearer <token>
```

---

### Notifications

#### Get Notifications
```http
GET /notifications?page=1&limit=10&type=donation_success&isRead=false&priority=high
Authorization: Bearer <token>
```

#### Get Notification by ID
```http
GET /notifications/:notificationId
Authorization: Bearer <token>
```

#### Mark Notification as Read
```http
PUT /notifications/:notificationId/read
Authorization: Bearer <token>
```

#### Mark Multiple Notifications as Read
```http
PUT /notifications/mark-read
Authorization: Bearer <token>
```

#### Mark All Notifications as Read
```http
PUT /notifications/mark-all-read
Authorization: Bearer <token>
```

#### Delete Notification
```http
DELETE /notifications/:notificationId
Authorization: Bearer <token>
```

#### Get Unread Count
```http
GET /notifications/unread/count
Authorization: Bearer <token>
```

#### Create Reminder
```http
POST /notifications/reminder
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Donation Reminder",
  "message": "You are eligible to donate blood",
  "scheduledFor": "2024-02-01T10:00:00.000Z"
}
```

#### Create System Alert (Owner Only)
```http
POST /notifications/system-alert
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "System Maintenance",
  "message": "System will be down for maintenance",
  "priority": "high"
}
```

#### Send Scheduled Notifications (Owner Only)
```http
POST /notifications/send-scheduled
Authorization: Bearer <token>
```

#### Get Notification Statistics
```http
GET /notifications/stats
Authorization: Bearer <token>
```

---

### Audit Logs

#### Get All Audit Logs
```http
GET /audit?page=1&limit=10&action=CREATE_DONATION&entityType=Donor&userId=uuid&status=success&dateFrom=2024-01-01&dateTo=2024-12-31
Authorization: Bearer <token>
```

#### Get Audit Log by ID
```http
GET /audit/:auditLogId
Authorization: Bearer <token>
```

#### Get Audit Logs by Entity
```http
GET /audit/entity/:entityType/:entityId?action=CREATE_DONATION
Authorization: Bearer <token>
```

#### Get Audit Logs by User
```http
GET /audit/user/:userId?action=CREATE_DONATION&entityType=Donor
Authorization: Bearer <token>
```

#### Get Audit Statistics
```http
GET /audit/stats?dateFrom=2024-01-01&dateTo=2024-12-31
Authorization: Bearer <token>
```

#### Get Recent Activity
```http
GET /audit/activity/recent?limit=10
Authorization: Bearer <token>
```

#### Get Failed Attempts
```http
GET /audit/attempts/failed?page=1&limit=10
Authorization: Bearer <token>
```

#### Export Audit Logs
```http
GET /audit/export?action=CREATE_DONATION&dateFrom=2024-01-01&dateTo=2024-12-31
Authorization: Bearer <token>
```

---

### Users (Owner Only)

#### Create User
```http
POST /users
Authorization: Bearer <token>
```

#### Get All Users
```http
GET /users?page=1&limit=10&role=donor&isActive=true
Authorization: Bearer <token>
```

#### Get User by ID
```http
GET /users/:userId
Authorization: Bearer <token>
```

#### Update User
```http
PUT /users/:userId
Authorization: Bearer <token>
```

#### Deactivate/Activate User
```http
PUT /users/:userId/deactivate
PUT /users/:userId/activate
Authorization: Bearer <token>
```

#### Get User Statistics
```http
GET /users/stats
Authorization: Bearer <token>
```

---

### Workers (Owner Only)

#### Create Worker
```http
POST /workers
Authorization: Bearer <token>
```

#### Get All Workers
```http
GET /workers?page=1&limit=10&btdId=uuid&isActive=true
Authorization: Bearer <token>
```

#### Get Workers by BTD
```http
GET /workers/btd/:btdId?page=1&limit=10
Authorization: Bearer <token>
```

#### Get Worker by ID
```http
GET /workers/:workerId
Authorization: Bearer <token>
```

#### Update Worker
```http
PUT /workers/:workerId
Authorization: Bearer <token>
```

#### Deactivate/Activate/Delete Worker
```http
PUT /workers/:workerId/deactivate
PUT /workers/:workerId/activate
DELETE /workers/:workerId
Authorization: Bearer <token>
```

#### Get Worker Statistics
```http
GET /workers/stats
Authorization: Bearer <token>
```

---

### Import/Export (Owner Only)

#### Export Donors
```http
GET /import-export/donors?bloodType=O+&eligibilityStatus=eligible&isActive=true
Authorization: Bearer <token>
```

#### Export Donations
```http
GET /import-export/donations?bloodType=O+&status=completed&dateFrom=2024-01-01&dateTo=2024-12-31
Authorization: Bearer <token>
```

#### Export Inventory
```http
GET /import-export/inventory?bloodType=O+&status=available&expiryFrom=2024-01-01
Authorization: Bearer <token>
```

#### Export Blood Tests
```http
GET /import-export/blood-tests?overallResult=eligible&dateFrom=2024-01-01&dateTo=2024-12-31
Authorization: Bearer <token>
```

#### Import Donors
```http
POST /import-export/donors
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request:**
```
file: donors.csv
```

**CSV Format:**
```csv
donorId,firstName,lastName,email,phone,dateOfBirth,gender,bloodType,address,city,state,idNumber,eligibilityStatus,totalDonations,isActive
DONOR001,John,Doe,john@example.com,+2348012345678,1990-01-01,male,O+,123 Main St,Lagos,Lagos,12345678901,eligible,5,true
```

#### Get Export History
```http
GET /import-export/history
Authorization: Bearer <token>
```

#### Download Export File
```http
GET /import-export/download/:filename
Authorization: Bearer <token>
```

#### Delete Export File
```http
DELETE /import-export/files/:filename
Authorization: Bearer <token>
```

---

## Error Responses

### Standard Error Format
```json
{
  "error": "Error message",
  "details": "Additional error details (optional)",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (Validation error)
- `401` - Unauthorized (Invalid/missing token)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found (Resource doesn't exist)
- `409` - Conflict (Duplicate resource)
- `500` - Internal Server Error

### Common Error Messages
- `"Invalid credentials"` - Wrong email/password/OTP/ID
- `"Access denied"` - Insufficient permissions
- `"Donor not found"` - Donor doesn't exist
- `"Donor is not eligible for donation"` - Eligibility check failed
- `"Must wait X more days before next donation"` - 56-day rule violation
- `"Blood has expired"` - Expired blood cannot be used
- `"Invalid file type"` - Only CSV files allowed
- `"File size too large"` - Exceeds size limit

---

## Rate Limiting

All endpoints are rate-limited to prevent abuse:
- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Pagination

Most list endpoints support pagination:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

**Response Format:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

---

## Search & Filtering

Many endpoints support filtering via query parameters:
- Date ranges: `dateFrom`, `dateTo`
- Status filters: `status`, `isActive`
- Type filters: `bloodType`, `role`, `type`
- Text search: `search` (where available)

---

## File Uploads

For file upload endpoints:
- **Max size**: 10MB
- **Allowed types**: CSV only
- **Encoding**: multipart/form-data

---

## WebSocket Support

Real-time notifications are supported via WebSocket connections:
- **URL**: `ws://localhost:3000/ws`
- **Authentication**: JWT token in query string
- **Events**: New notifications, messages, system alerts

---

## API Versioning

Current version: v1
- Base URL includes version: `/api/v1/`
- Backward compatibility maintained
- Version specified in headers: `Accept: application/vnd.bloodbank.v1+json`

---

## Testing

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600
}
```

---

## SDK Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

// Login
const login = async (email, password) => {
  const response = await axios.post('/api/auth/owner/login', {
    email,
    password
  });
  return response.data.token;
};

// Create donor
const createDonor = async (token, donorData) => {
  const response = await axios.post('/api/donors', donorData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
```

### Python
```python
import requests

# Login
def login(email, password):
    response = requests.post('/api/auth/owner/login', json={
        'email': email,
        'password': password
    })
    return response.json()['token']

# Create donor
def create_donor(token, donor_data):
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.post('/api/donors', json=donor_data, headers=headers)
    return response.json()
```

---

## Support

For API support:
- Documentation: Check this guide
- Issues: Create GitHub issue
- Email: api-support@bloodbank.com
- Status: Check `/health` endpoint
