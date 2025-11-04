# Quick Installation Guide - IK Gujral PTU Attendance System

## ⚡ Quick Start (5 Minutes)

### Step 1: Install Dependencies

```powershell
cd c:\Users\HP\ikgptu
npm install
```

This will install all required packages (~5 minutes on first install).

### Step 2: Set Up Environment Variables

Copy the example file:
```powershell
copy .env.example .env
```

Edit `.env` with your values:
```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ikgptu_attendance?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Email Service (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@ikgptu.edu

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

**Generate NEXTAUTH_SECRET:**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Step 3: Set Up MongoDB

**Option 1: MongoDB Atlas (Recommended for Production)**

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up (free M0 tier)
3. Create a cluster
4. Create database user
5. Whitelist your IP or use `0.0.0.0/0`
6. Get connection string
7. Paste in `.env` as `MONGODB_URI`

**Option 2: Local MongoDB**

```powershell
# Download MongoDB Community Server
# Install and run mongod
# Use: MONGODB_URI=mongodb://localhost:27017/ikgptu_attendance
```

### Step 4: Set Up Email Service

1. Go to [resend.com](https://resend.com)
2. Sign up (free tier: 100 emails/day)
3. Get API key
4. Paste in `.env` as `RESEND_API_KEY`

For testing, use `EMAIL_FROM=onboarding@resend.dev`

### Step 5: Seed Database

```powershell
npm run seed
```

This creates all subjects for semesters 3-8.

### Step 6: Run Development Server

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🎉 You're Ready!

### Default URLs:
- **Landing Page**: http://localhost:3000
- **Login**: http://localhost:3000/login
- **Signup**: http://localhost:3000/signup

### Create Your First Admin:

Connect to MongoDB and insert:

```javascript
db.users.insertOne({
  name: "Admin",
  email: "admin@ikgptu.edu",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5ufP4RZa6Y9iq",
  role: "admin",
  isActive: true,
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

**Default Password**: `admin123` (change this!)

---

## 🧪 Test the System

### 1. Student Flow

**Signup:**
```
URL: http://localhost:3000/signup
Name: Test Student
Email: student@test.com
Roll No: BTCS-2024-001
Branch: BTCS
Semester: 3
Password: test123
```

**Login:**
```
URL: http://localhost:3000/login
Email: student@test.com
Password: test123
```

### 2. Admin Flow

**Login:**
```
Email: admin@ikgptu.edu
Password: admin123
```

**Create Teacher:**
```
Go to: Admin Dashboard → User Management → Create Teacher
Name: Prof. Test
Email: teacher@test.com
Employee ID: IKGPTU001
Department: Computer Science
Password: teacher123
```

### 3. Teacher Flow

**Login:**
```
Email: teacher@test.com
Password: teacher123
```

**Upload Attendance:**
```
Go to: Teacher Dashboard → Upload Attendance
Branch: BTCS
Semester: 3
Date: Today
Subject: Data Structure & Algorithms
Mark students as Present/Absent
Submit
```

**Check Student Dashboard:**
- Student should see real-time update
- Attendance percentage updated

---

## 📚 Documentation

- **README.md** - Project overview
- **DOCUMENTATION.md** - Complete technical docs
- **DEPLOYMENT.md** - Production deployment guide
- **PROJECT_SUMMARY.md** - What's included

---

## 🐛 Common Issues

### Issue: npm install fails
**Fix:**
```powershell
# Clear cache
npm cache clean --force
# Try again
npm install
```

### Issue: MongoDB connection error
**Fix:**
- Check `MONGODB_URI` is correct
- Verify IP is whitelisted
- Check database user credentials

### Issue: NextAuth error
**Fix:**
- Verify `NEXTAUTH_SECRET` is set (32+ characters)
- Check `NEXTAUTH_URL` matches your URL

### Issue: Emails not sending
**Fix:**
- Verify `RESEND_API_KEY` is correct
- Check email quotas (100/day on free tier)
- Use `onboarding@resend.dev` for testing

### Issue: Port 3000 already in use
**Fix:**
```powershell
# Use different port
$env:PORT=3001; npm run dev
```

---

## 🚀 Deploy to Production

See **DEPLOYMENT.md** for complete guide:
- MongoDB Atlas setup
- Resend configuration
- Vercel deployment
- Environment variables
- Custom domain
- Monitoring

---

## 📦 What's Installed

After `npm install`, you'll have:
- Next.js 14 (App Router)
- React 18
- TypeScript
- TailwindCSS
- MongoDB & Mongoose
- NextAuth.js
- Resend (email)
- React Query
- ShadCN UI components
- Zod validation
- And more... (see package.json)

---

## 🎯 Next Actions

1. ✅ Install dependencies
2. ✅ Configure environment variables
3. ✅ Set up MongoDB
4. ✅ Set up email service
5. ✅ Seed database
6. ✅ Run dev server
7. ✅ Create admin account
8. ✅ Test all features
9. ⏭️ Customize as needed
10. ⏭️ Deploy to production

---

## 💡 Tips

- **Development**: Use local MongoDB for testing
- **Email Testing**: Resend free tier is sufficient
- **Database**: Seed script is re-runnable (won't duplicate)
- **Passwords**: Always use strong passwords in production
- **Backups**: Set up regular MongoDB backups

---

## 📞 Need Help?

Check documentation:
1. README.md - Quick reference
2. DOCUMENTATION.md - Technical details
3. DEPLOYMENT.md - Deployment steps
4. PROJECT_SUMMARY.md - Feature list

All code is well-commented for easy understanding!

---

**Happy Coding! 🎉**

The IK Gujral PTU Attendance Management System is ready to use!
