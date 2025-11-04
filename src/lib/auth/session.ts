import { getServerSession } from 'next-auth';
import { authOptions } from './auth-options';
import { redirect } from 'next/navigation';

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export async function requireAuth() {
  const session = await getSession();
  
  if (!session || !session.user) {
    redirect('/login');
  }
  
  return session.user;
}

export async function requireRole(roles: ('student' | 'teacher' | 'admin')[]) {
  const user = await requireAuth();
  
  if (!roles.includes(user.role)) {
    redirect('/unauthorized');
  }
  
  return user;
}
