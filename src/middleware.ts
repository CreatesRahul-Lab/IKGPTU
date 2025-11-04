import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Redirect to appropriate dashboard based on role
    if (path === '/dashboard') {
      if (token?.role === 'student') {
        return NextResponse.redirect(new URL('/student/dashboard', req.url));
      } else if (token?.role === 'teacher') {
        return NextResponse.redirect(new URL('/teacher/dashboard', req.url));
      } else if (token?.role === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      }
    }

    // Protect student routes
    if (path.startsWith('/student') && token?.role !== 'student') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    // Protect teacher routes
    if (path.startsWith('/teacher') && token?.role !== 'teacher') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    // Protect admin routes
    if (path.startsWith('/admin') && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/dashboard',
    '/student/:path*',
    '/teacher/:path*',
    '/admin/:path*',
  ],
};
