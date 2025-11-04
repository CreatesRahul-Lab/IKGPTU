import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db/mongodb';
import Student from '@/models/Student';
import Faculty from '@/models/Faculty';

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
          await connectDB();
          
          // Try to find user in Student collection first
          let user = await Student.findOne({ 
            email: credentials.email.toLowerCase() 
          }).select('+password');
          
          let role: 'student' | 'teacher' | 'admin' = 'student';
          let userDoc: any = user;

          // If not found in Student, try Faculty collection
          if (!user) {
            userDoc = await Faculty.findOne({ 
              email: credentials.email.toLowerCase() 
            }).select('+password');
            
            if (userDoc) {
              role = 'teacher';
            }
          }

          if (!userDoc) {
            throw new Error('Invalid email or password');
          }

          if (!userDoc.isActive) {
            throw new Error('Account is deactivated. Please contact admin.');
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            userDoc.password
          );

          if (!isPasswordValid) {
            throw new Error('Invalid email or password');
          }

          return {
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
