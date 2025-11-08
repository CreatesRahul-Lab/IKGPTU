'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginType, setLoginType] = useState<'student' | 'faculty' | 'admin'>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        // Redirect will be handled by middleware based on role
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-3 sm:p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
            <div>
              <h1 className="font-bold text-xl sm:text-2xl">IK Gujral PTU</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Attendance System</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader className="space-y-1 p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl font-bold">Login</CardTitle>
            <CardDescription className="text-sm">
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="space-y-3">
                <Label>Login as</Label>
                <div className="flex flex-wrap gap-4 sm:gap-6">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="student"
                      name="loginType"
                      value="student"
                      checked={loginType === 'student'}
                      onChange={(e) => setLoginType(e.target.value as 'student' | 'faculty' | 'admin')}
                      disabled={loading}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="student" className="font-normal cursor-pointer">
                      Student
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="faculty"
                      name="loginType"
                      value="faculty"
                      checked={loginType === 'faculty'}
                      onChange={(e) => setLoginType(e.target.value as 'student' | 'faculty' | 'admin')}
                      disabled={loading}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="faculty" className="font-normal cursor-pointer">
                      Faculty
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="admin"
                      name="loginType"
                      value="admin"
                      checked={loginType === 'admin'}
                      onChange={(e) => setLoginType(e.target.value as 'student' | 'faculty' | 'admin')}
                      disabled={loading}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="admin" className="font-normal cursor-pointer">
                      Admin
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={
                    loginType === 'student' 
                      ? 'student@example.com' 
                      : loginType === 'admin'
                      ? 'admin@ikgptu.ac.in'
                      : 'teacher@ikgptu.ac.in'
                  }
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm space-y-2">
              {loginType !== 'admin' && (
                <div>
                  <span className="text-muted-foreground">Don't have an account? </span>
                  {loginType === 'student' ? (
                    <Link href="/signup" className="text-primary hover:underline font-medium">
                      Sign up as Student
                    </Link>
                  ) : (
                    <Link href="/teacher/signup" className="text-primary hover:underline font-medium">
                      Sign up as Faculty
                    </Link>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
