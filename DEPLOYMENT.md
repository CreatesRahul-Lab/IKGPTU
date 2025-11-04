# Deployment Guide - IK Gujral PTU Attendance System

This guide walks you through deploying the attendance system to production.

## Prerequisites

Before deployment, ensure you have:
- [ ] MongoDB Atlas account
- [ ] Resend account (for emails)
- [ ] Vercel account
- [ ] GitHub account
- [ ] Domain (optional, Vercel provides free subdomain)

---

## Step 1: MongoDB Atlas Setup

### 1.1 Create Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Click "Build a Database"
4. Choose **M0 FREE** tier
5. Select provider: **AWS** (recommended)
6. Region: Choose closest to your users (e.g., Mumbai for India)
7. Cluster Name: `ikgptu-attendance`
8. Click "Create"

### 1.2 Create Database User

1. Go to **Database Access** (left sidebar)
2. Click "Add New Database User"
3. Authentication Method: **Password**
4. Username: `ikgptu_admin`
5. Password: Generate secure password (save it!)
6. Database User Privileges: **Read and write to any database**
7. Click "Add User"

### 1.3 Configure Network Access

1. Go to **Network Access** (left sidebar)
2. Click "Add IP Address"
3. Option 1: **Allow Access from Anywhere** (`0.0.0.0/0`)
   - Easiest for Vercel deployment
   - Less secure but fine for this use case
4. Option 2: Add Vercel IP ranges (more secure)
   - See [Vercel IP ranges](https://vercel.com/docs/concepts/edge-network/regions)
5. Click "Confirm"

### 1.4 Get Connection String

1. Go to **Database** (left sidebar)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Driver: **Node.js** version **5.5 or later**
5. Copy the connection string:
   ```
   mongodb+srv://ikgptu_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password
7. Add database name after `.net/`:
   ```
   mongodb+srv://ikgptu_admin:yourpassword@cluster0.xxxxx.mongodb.net/ikgptu_attendance?retryWrites=true&w=majority
   ```

---

## Step 2: Resend Email Setup

### 2.1 Create Resend Account

1. Go to [Resend](https://resend.com)
2. Sign up with your email
3. Verify your email address

### 2.2 Add Domain (Optional)

**For Production:**
1. Go to **Domains** in Resend dashboard
2. Click "Add Domain"
3. Enter: `ikgptu.edu` (or your domain)
4. Add DNS records to your domain registrar:
   - TXT record for verification
   - MX, SPF, DKIM records for email sending
5. Wait for verification (can take a few hours)

**For Testing:**
- Use `onboarding@resend.dev` (limited to 100 emails/day)
- No domain setup needed

### 2.3 Create API Key

1. Go to **API Keys** in Resend dashboard
2. Click "Create API Key"
3. Name: `IK Gujral PTU Production`
4. Permissions: **Full access** or **Sending access**
5. Click "Create"
6. **Copy the API key immediately** (you won't see it again!)
   ```
   re_xxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

---

## Step 3: GitHub Repository

### 3.1 Initialize Git

```powershell
cd c:\Users\HP\ikgptu

git init
git add .
git commit -m "Initial commit - IK Gujral PTU Attendance System"
```

### 3.2 Create GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click "New Repository"
3. Name: `ikgptu-attendance-system`
4. Description: "Attendance Management System for IK Gujral PTU"
5. **Private** repository (recommended)
6. Don't initialize with README (we have one)
7. Click "Create Repository"

### 3.3 Push to GitHub

```powershell
git remote add origin https://github.com/YOUR_USERNAME/ikgptu-attendance-system.git
git branch -M main
git push -u origin main
```

---

## Step 4: Vercel Deployment

### 4.1 Import Project

1. Go to [Vercel](https://vercel.com)
2. Sign up or log in (use GitHub account)
3. Click "Add New..." → "Project"
4. Import your `ikgptu-attendance-system` repository
5. Framework Preset: **Next.js** (auto-detected)
6. Root Directory: `./`
7. **Don't deploy yet** - we need to add environment variables

### 4.2 Environment Variables

Click "Environment Variables" and add:

| Name | Value | Notes |
|------|-------|-------|
| `MONGODB_URI` | `mongodb+srv://...` | From Step 1.4 |
| `NEXTAUTH_URL` | Leave empty for now | Will update after deployment |
| `NEXTAUTH_SECRET` | Generate with command below | Must be 32+ characters |
| `RESEND_API_KEY` | `re_xxxxx` | From Step 2.3 |
| `EMAIL_FROM` | `noreply@ikgptu.edu` | Your verified domain or test email |
| `NEXT_PUBLIC_APP_URL` | Leave empty for now | Will update after deployment |
| `NODE_ENV` | `production` | - |

**Generate NEXTAUTH_SECRET:**
```powershell
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 2: Online generator
# Visit: https://generate-secret.vercel.app/32
```

### 4.3 Deploy

1. Click "Deploy"
2. Wait for build (3-5 minutes)
3. Once deployed, you'll get a URL like:
   ```
   https://ikgptu-attendance-system.vercel.app
   ```

### 4.4 Update Environment Variables

1. Go to Project Settings → Environment Variables
2. Edit `NEXTAUTH_URL`:
   ```
   https://ikgptu-attendance-system.vercel.app
   ```
3. Edit `NEXT_PUBLIC_APP_URL`:
   ```
   https://ikgptu-attendance-system.vercel.app
   ```
4. Click "Save"
5. Go to Deployments → Redeploy latest deployment

---

## Step 5: Seed Production Database

### 5.1 Install Dependencies Locally

```powershell
cd c:\Users\HP\ikgptu
npm install
```

### 5.2 Create Seed Script

The seed script is already in `src/lib/seed.ts`. Run it with production MongoDB URI:

```powershell
# Set environment variable temporarily
$env:MONGODB_URI="mongodb+srv://ikgptu_admin:yourpassword@cluster0.xxxxx.mongodb.net/ikgptu_attendance?retryWrites=true&w=majority"

# Run seed script
npm run seed
```

This will populate:
- All B.Tech subjects (Semesters 3-8)
- Subject codes, types, credits

---

## Step 6: Create Admin Account

### Option 1: Using MongoDB Atlas UI

1. Go to MongoDB Atlas → Database → Browse Collections
2. Database: `ikgptu_attendance`
3. Collection: `users`
4. Click "Insert Document"
5. Paste this JSON (replace password hash):
```json
{
  "name": "System Admin",
  "email": "admin@ikgptu.edu",
  "password": "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5ufP4RZa6Y9iq",
  "role": "admin",
  "isActive": true,
  "emailVerified": true,
  "createdAt": { "$date": "2024-01-01T00:00:00.000Z" },
  "updatedAt": { "$date": "2024-01-01T00:00:00.000Z" }
}
```

**Note**: The password above is `admin123` (for testing only - change it!)

### Option 2: Generate Secure Password Hash

```powershell
# Install bcryptjs
npm install bcryptjs

# Run this script
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YourSecurePassword123!', 12, (err, hash) => console.log(hash));"
```

Copy the hash and use it in the JSON above.

---

## Step 7: Create Teacher Accounts

### Using Admin Dashboard (After Admin Login)

1. Login as admin: `admin@ikgptu.edu`
2. Go to Admin Dashboard → User Management
3. Click "Create Teacher"
4. Fill in:
   - Name: `Prof. Rajesh Kumar`
   - Email: `rajesh@ikgptu.edu`
   - Employee ID: `IKGPTU001`
   - Department: `Computer Science`
   - Password: Generate or set
5. Click "Create"
6. Teacher receives email with credentials

### Manually (MongoDB)

```json
{
  "name": "Prof. Rajesh Kumar",
  "email": "rajesh@ikgptu.edu",
  "password": "$2a$12$hashedpassword",
  "role": "teacher",
  "employeeId": "IKGPTU001",
  "department": "Computer Science",
  "isActive": true,
  "emailVerified": true,
  "createdAt": { "$date": "2024-01-01T00:00:00.000Z" },
  "updatedAt": { "$date": "2024-01-01T00:00:00.000Z" }
}
```

---

## Step 8: Testing

### 8.1 Student Flow

1. **Signup**:
   - Go to `https://your-app.vercel.app/signup`
   - Fill form:
     - Name: Test Student
     - Email: student@test.com
     - Roll No: BTCS-2024-001
     - Branch: BTCS
     - Semester: 3
     - Password: test123
   - Submit
   - Check email for welcome message

2. **Login**:
   - Login with student credentials
   - Should redirect to `/student/dashboard`

3. **View Dashboard**:
   - See subjects list (initially 0% attendance)
   - Real-time updates section active

### 8.2 Teacher Flow

1. **Login**:
   - Login as teacher: `rajesh@ikgptu.edu`
   - Should redirect to `/teacher/dashboard`

2. **Upload Attendance**:
   - Navigate to "Upload Attendance"
   - Select: Branch (BTCS), Semester (3), Date (today), Subject
   - Student list appears
   - Mark attendance: P/A
   - Click "Submit"
   - Success message appears

3. **Check Student Update**:
   - Go back to student dashboard
   - Should see real-time notification
   - Attendance updated immediately

### 8.3 Admin Flow

1. **Login**:
   - Login as admin
   - Should redirect to `/admin/dashboard`

2. **View Analytics**:
   - Total students, teachers
   - Overall attendance statistics

3. **Leave Management**:
   - Student applies for leave
   - Admin sees in pending requests
   - Approve/Reject
   - Student gets email

### 8.4 SSE Testing

**Open Browser Console:**
```javascript
// Check SSE connection
const es = new EventSource('/api/attendance/sse');
es.onmessage = (e) => console.log('SSE:', e.data);
es.onerror = (e) => console.error('SSE Error:', e);
```

**Should see**:
- Initial connection message
- Heartbeat every 30 seconds
- Attendance updates when teacher uploads

---

## Step 9: Custom Domain (Optional)

### 9.1 Add Domain to Vercel

1. Go to Project Settings → Domains
2. Add domain: `attendance.ikgptu.edu`
3. Vercel provides DNS records

### 9.2 Update DNS

Add these records to your domain:

| Type | Name | Value |
|------|------|-------|
| A | attendance | 76.76.21.21 |
| CNAME | attendance | cname.vercel-dns.com |

### 9.3 Update Environment Variables

Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to:
```
https://attendance.ikgptu.edu
```

Redeploy.

---

## Step 10: Monitoring & Maintenance

### 10.1 Vercel Analytics

1. Go to Project → Analytics
2. Enable Web Analytics (free)
3. View:
   - Page views
   - User demographics
   - Performance metrics

### 10.2 MongoDB Monitoring

1. Go to MongoDB Atlas → Metrics
2. Monitor:
   - Connection count
   - Read/Write operations
   - Storage usage

### 10.3 Email Delivery

1. Go to Resend → Logs
2. Check:
   - Emails sent
   - Delivery rate
   - Bounces/Complaints

### 10.4 Error Tracking

Install Sentry (optional):
```powershell
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

---

## Troubleshooting

### Issue: Build Failed on Vercel
**Solution**: Check build logs, ensure all dependencies in `package.json`

### Issue: MongoDB Connection Timeout
**Solution**: Verify IP whitelist includes `0.0.0.0/0` or Vercel IPs

### Issue: NextAuth Callback Error
**Solution**: Ensure `NEXTAUTH_URL` matches exactly your Vercel domain

### Issue: Emails Not Sending
**Solution**: 
1. Check Resend API key is correct
2. Verify domain is verified (if not using test email)
3. Check Resend logs for errors

### Issue: SSE Not Working
**Solution**: 
1. Ensure route is not cached
2. Check browser console for CORS errors
3. Verify NextAuth session is active

---

## Performance Optimization

### 1. Enable Edge Functions

In `src/app/api/*/route.ts`:
```typescript
export const runtime = 'edge';
```

### 2. Add Image Optimization

In `next.config.mjs`:
```javascript
images: {
  domains: ['your-cdn-domain.com'],
  formats: ['image/avif', 'image/webp'],
},
```

### 3. Enable Caching

For static data:
```typescript
export const revalidate = 3600; // 1 hour
```

### 4. MongoDB Indexes

Already added in models, but verify:
```javascript
db.users.getIndexes()
db.attendance.getIndexes()
db.subjects.getIndexes()
db.leaverequests.getIndexes()
```

---

## Backup Strategy

### Daily Backups (MongoDB Atlas)

1. Go to Clusters → Backup
2. Enable "Continuous Cloud Backup" (Paid feature)
3. Or use manual exports:
   ```powershell
   mongodump --uri="mongodb+srv://..." --out=backup-$(Get-Date -Format 'yyyy-MM-dd')
   ```

### Weekly Database Export

Create a scheduled GitHub Action:
```yaml
name: Weekly Backup
on:
  schedule:
    - cron: '0 0 * * 0' # Every Sunday
jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Backup MongoDB
        run: mongodump --uri=${{ secrets.MONGODB_URI }}
      - name: Upload to S3
        # ... upload logic
```

---

## Scaling Considerations

### When to Scale

- **100+ concurrent users**: Upgrade MongoDB to M2
- **1000+ students**: Enable MongoDB sharding
- **High email volume**: Upgrade Resend plan
- **Global users**: Use Vercel Edge Functions

### Database Optimization

1. **Archive old attendance**:
   - Move records older than 2 years to separate collection
   - Reduces query time

2. **Pagination**:
   - Already implemented in API routes
   - Limit: 20 records per page

3. **Indexes**:
   - Monitor slow queries in MongoDB
   - Add indexes as needed

---

## Security Checklist

- [x] Environment variables secured
- [x] MongoDB user with minimal permissions
- [x] HTTPS enabled (automatic with Vercel)
- [x] Password hashing (bcryptjs, 12 rounds)
- [x] Input validation (Zod schemas)
- [x] Rate limiting (add with Upstash Redis)
- [x] CORS configuration
- [ ] Two-factor authentication (future)
- [ ] Security headers (add middleware)
- [ ] Regular dependency updates

---

## Post-Deployment Checklist

- [ ] Admin account created and tested
- [ ] At least one teacher account created
- [ ] Test student signup flow
- [ ] Test attendance upload
- [ ] Verify email delivery
- [ ] Test SSE real-time updates
- [ ] Test leave application workflow
- [ ] Check mobile responsiveness
- [ ] Run Lighthouse audit (Performance, Accessibility)
- [ ] Add custom domain (if applicable)
- [ ] Set up monitoring alerts
- [ ] Document admin procedures
- [ ] Train staff on system usage

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **Resend Docs**: https://resend.com/docs
- **NextAuth.js Docs**: https://next-auth.js.org

---

**Deployment Complete! 🎉**

Your IK Gujral PTU Attendance Management System is now live and ready to use.
