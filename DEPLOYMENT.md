# Blood Bank System - Deployment Guide

## Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- Docker & Docker Compose (optional)
- Git

## Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual configuration
   ```

## Database Setup

### Option 1: Local MySQL
1. Create database:
   ```sql
   CREATE DATABASE blood_bank_system;
   ```

2. Update `.env` with your MySQL credentials

3. Run migrations and seed:
   ```bash
   npm run seed
   ```

### Option 2: Docker (Recommended)
```bash
docker-compose up -d
```

## Deployment Methods

### 1. Traditional Deployment

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

### 2. Docker Deployment

**Build and run:**
```bash
docker-compose up -d --build
```

**View logs:**
```bash
docker-compose logs -f api
```

### 3. Cloud Deployment

**Heroku:**
```bash
# Install Heroku CLI
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set DB_HOST=your-db-host
# Set other environment variables
git push heroku main
```

**AWS/Azure/GCP:**
- Use the provided Dockerfile
- Ensure database connectivity
- Set environment variables in cloud platform

## Environment Variables Required

**Database:**
- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

**Security:**
- `JWT_SECRET` (must be strong and unique)

**Optional Services:**
- `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS` (for email notifications)
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` (for SMS OTP)

## Health Checks

The application includes a health check endpoint:
```
GET /health
```

Returns:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600
}
```

## Security Considerations

1. **Change default passwords** in production
2. **Use strong JWT secret** (at least 32 characters)
3. **Enable HTTPS** in production
4. **Set up proper CORS** origins
5. **Regular database backups**
6. **Monitor logs** for suspicious activity

## Monitoring

- Application logs: Console output or cloud logging service
- Database monitoring: MySQL slow query log
- Performance monitoring: Consider APM tools
- Error tracking: Consider Sentry or similar

## Scaling

**Horizontal Scaling:**
- Use load balancer (nginx/HAProxy)
- Multiple API instances behind load balancer
- Shared database or read replicas

**Vertical Scaling:**
- Increase server resources
- Optimize database queries
- Add caching layer (Redis)

## Backup Strategy

**Database:**
```bash
# Daily backup
mysqldump -u root -p blood_bank_system > backup_$(date +%Y%m%d).sql
```

**Files:**
- Backup uploaded files regularly
- Store backups in separate location

## Troubleshooting

**Common Issues:**

1. **Database connection failed**
   - Check MySQL service status
   - Verify credentials in .env
   - Ensure database exists

2. **Migration errors**
   - Drop and recreate database
   - Run `npm run seed` again

3. **Permission errors**
   - Check file permissions for uploads directory
   - Ensure proper user ownership

4. **Port conflicts**
   - Change PORT in .env
   - Check for other services using same port

## Default Login Credentials (After Seeding)

**Owner:**
- Email: owner@lifbank.com
- Password: owner123

**Worker:**
- Email: worker@lifbank.com
- Password: worker123

**Donors:**
- Donor 1: donor1@lifbank.com / donor123
- Donor 2: donor2@lifbank.com / donor456
- Donor 3: donor3@lifbank.com / donor789

⚠️ **Important:** Change these passwords in production!

## Support

For deployment issues:
1. Check application logs
2. Verify environment variables
3. Test database connectivity
4. Review this documentation
