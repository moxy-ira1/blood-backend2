# Blood Bank System - Render Deployment Guide

## Deploy to Render with PostgreSQL

### Prerequisites
- Render account (free tier available)
- GitHub repository with your code
- PostgreSQL database on Render

### Step 1: Prepare Your Repository

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Render deployment"
   git push origin main
   ```

2. **Ensure your repository has:**
   - `package.json` with start script
   - `server.js` as main file
   - All dependencies in package.json
   - `.gitignore` file (already created)

### Step 2: Set Up PostgreSQL Database on Render

1. **Create PostgreSQL Database**
   - Go to Render Dashboard
   - Click "New" → "PostgreSQL"
   - Choose a name (e.g., `bloodbank-db`)
   - Select free tier or appropriate plan
   - Click "Create Database"

2. **Get Database Connection Details**
   - Go to your database dashboard
   - Copy the following:
     - Database URL (Internal)
     - Database URL (External)
     - Username
     - Password
     - Database Name

### Step 3: Create Web Service

1. **Create New Web Service**
   - Go to Render Dashboard
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select the repository

2. **Configure Build and Start Settings**
   ```
   Build Command: npm install
   Start Command: npm start
   ```

3. **Set Environment Variables**
   Go to "Environment" tab and add:

   **Database Configuration:**
   ```
   NODE_ENV=production
   DB_DIALECT=postgres
   DB_HOST=your-db-host
   DB_USER=your-db-username
   DB_PASSWORD=your-db-password
   DB_NAME=your-db-name
   DATABASE_URL=postgres://username:password@host:5432/dbname
   ```

   **JWT Configuration:**
   ```
   JWT_SECRET=your-super-secure-jwt-secret-at-least-32-characters
   JWT_EXPIRES_IN=7d
   ```

   **Server Configuration:**
   ```
   PORT=10000
   ```

   **Optional Services:**
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   
   TWILIO_ACCOUNT_SID=your-twilio-sid
   TWILIO_AUTH_TOKEN=your-twilio-token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

### Step 4: Update Database Models for PostgreSQL

The models are already compatible with PostgreSQL, but ensure you have the `pg` package installed (already added to package.json).

### Step 5: Initialize Database

Since Render doesn't automatically run seeders, you have two options:

**Option A: Manual Seeding (Recommended for testing)**
1. Deploy the service first
2. Access the service URL
3. Create an admin user through the registration process
4. Manually add test data through the application

**Option B: Auto-Seeding (Advanced)**
Create a new file `render-init.js`:

```javascript
const { sequelize } = require('./models');
const seedDatabase = require('./seeders/databaseSeeder');

async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    await sequelize.sync({ force: false });
    console.log('Database synchronized successfully.');
    
    // Only seed if no users exist
    const { User } = require('./models');
    const userCount = await User.count();
    if (userCount === 0) {
      await seedDatabase();
      console.log('Database seeded successfully!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

initDatabase();
```

Update your start script in package.json:
```json
{
  "scripts": {
    "start": "node render-init.js && node server.js"
  }
}
```

### Step 6: Deploy

1. **Push changes to GitHub**
   ```bash
   git add .
   git commit -m "Configure for Render deployment"
   git push origin main
   ```

2. **Render will automatically deploy**
   - Watch the build logs
   - Check for any errors
   - Service will be available at `https://your-service-name.onrender.com`

### Step 7: Test Your Deployment

1. **Health Check**
   Visit: `https://your-service-name.onrender.com/health`
   Should return: `{"status":"OK","timestamp":"...","uptime":...}`

2. **API Endpoints**
   - Test authentication: `POST /api/auth/owner-login`
   - Test registration: `POST /api/auth/register-donor`

3. **Frontend Integration**
   Update your frontend API base URL to point to your Render service.

### Environment Variables Reference

**Required Variables:**
```
NODE_ENV=production
DB_DIALECT=postgres
DB_HOST=your-db-host
DB_USER=your-db-username  
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
JWT_SECRET=your-jwt-secret
PORT=10000
```

**Optional Variables:**
```
DATABASE_URL=postgres://user:pass@host:5432/dbname
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890
```

### Troubleshooting

**Common Issues:**

1. **Database Connection Failed**
   - Verify DATABASE_URL is correct
   - Check if database is running
   - Ensure SSL is properly configured

2. **Build Failed**
   - Check package.json dependencies
   - Verify start command exists
   - Review build logs

3. **Application Crashes**
   - Check environment variables
   - Review application logs
   - Test health endpoint

4. **CORS Issues**
   - Add frontend URL to CORS origins
   - Check if frontend is also deployed

### Monitoring

**Render Dashboard:**
- Monitor service health
- View logs and metrics
- Set up alerts for downtime

**Database Monitoring:**
- Monitor connection limits
- Check storage usage
- Set up backups

### Scaling

**Render Free Tier Limits:**
- 750 hours/month
- 512MB RAM
- Shared CPU
- 10GB PostgreSQL storage

**Upgrading:**
- Choose appropriate plan based on usage
- Monitor performance metrics
- Scale database independently

### Security Best Practices

1. **Environment Variables**
   - Never commit secrets to Git
   - Use strong JWT secrets
   - Rotate passwords regularly

2. **Database Security**
   - Use SSL connections (configured)
   - Limit database access
   - Regular backups

3. **API Security**
   - Enable rate limiting (already configured)
   - Use HTTPS (automatic on Render)
   - Validate all inputs

### Default Login (After Seeding)

If you used the auto-seeding option:
```
Owner: owner@lifbank.com / owner123
Worker: worker@lifbank.com / worker123
Donors: donor1@lifbank.com / donor123
```

⚠️ **Important:** Change these passwords in production!

### Support

For Render-specific issues:
1. Check Render documentation
2. Review Render status page
3. Contact Render support

For application issues:
1. Check application logs
2. Verify environment variables
3. Test database connectivity
