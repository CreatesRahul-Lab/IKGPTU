import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'student' | 'teacher' | 'admin';
      rollNo?: string;
      branch?: string;
      semester?: number;
      employeeId?: string;
      department?: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role: 'student' | 'teacher' | 'admin';
    rollNo?: string;
    branch?: string;
    semester?: number;
    employeeId?: string;
    department?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    role: 'student' | 'teacher' | 'admin';
    rollNo?: string;
    branch?: string;
    semester?: number;
    employeeId?: string;
    department?: string;
  }
}
