import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db/mongodb';
import Student from '@/models/Student';
import Faculty from '@/models/Faculty';
import Admin from '@/models/Admin';
import { cache, cacheKeys } from '@/lib/cache';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide email and password');
        }

        try {
          const email = credentials.email.toLowerCase();
          const cacheKey = cacheKeys.user(email);
          
          await connectDB();
          
          // Parallel queries for better performance
          const [student, faculty, admin] = await Promise.all([
            Student.findOne({ email }).select('+password').lean().exec(),
            Faculty.findOne({ email }).select('+password').lean().exec(),
            Admin.findOne({ email }).select('+password').lean().exec(),
          ]);

          const userDoc: any = student || faculty || admin;
          const role: 'student' | 'teacher' | 'admin' = student ? 'student' : faculty ? 'teacher' : 'admin';

          if (!userDoc) {
            throw new Error('Invalid email or password');
          }

          if (userDoc.isActive === false) {
            throw new Error('Account is deactivated. Please contact admin.');
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            userDoc.password
          );

          if (!isPasswordValid) {
            throw new Error('Invalid email or password');
          }

          const userData = {
            id: userDoc._id.toString(),
            email: userDoc.email,
            name: userDoc.name,
            role: role,
            rollNo: userDoc.rollNo,
            branch: userDoc.branch,
            semester: userDoc.semester,
            employeeId: undefined,
            department: undefined,
          };

          // Cache user data (without password) for 5 minutes
          cache.set(cacheKey, userData, 5 * 60 * 1000);

          return userData;
        } catch (error: any) {
          throw new Error(error.message || 'Authentication failed');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.rollNo = user.rollNo;
        token.branch = user.branch;
        token.semester = user.semester;
        token.employeeId = user.employeeId;
        token.department = user.department;
      }

      // Handle session update
      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'student' | 'teacher' | 'admin';
        session.user.rollNo = token.rollNo as string | undefined;
        session.user.branch = token.branch as string | undefined;
        session.user.semester = token.semester as number | undefined;
        session.user.employeeId = token.employeeId as string | undefined;
        session.user.department = token.department as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
