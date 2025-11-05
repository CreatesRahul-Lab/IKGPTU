import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GraduationCap, Users, BarChart3, Clock, Shield, Bell } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <div>
                <h1 className="font-bold text-base sm:text-xl">IK Gujral PTU</h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground hidden xs:block">Attendance System</p>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm">Login</Button>
              </Link>
              <Link href="/signup" className="hidden sm:inline-block">
                <Button size="sm" className="text-xs sm:text-sm">Student Signup</Button>
              </Link>
              <Link href="/signup" className="sm:hidden">
                <Button size="sm" className="text-xs">Signup</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-10 sm:py-16 md:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Smart Attendance Management
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 px-4">
            Streamline attendance tracking for IK Gujral Punjab Technical University
            with real-time updates, automated reporting, and comprehensive analytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8">
                Get Started
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <h3 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Key Features</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          <FeatureCard
            icon={<Clock className="h-10 w-10 text-blue-600" />}
            title="Real-time Updates"
            description="Get instant notifications when attendance is marked via Server-Sent Events"
          />
          <FeatureCard
            icon={<BarChart3 className="h-10 w-10 text-purple-600" />}
            title="Analytics Dashboard"
            description="Comprehensive statistics and insights for students, teachers, and admins"
          />
          <FeatureCard
            icon={<Users className="h-10 w-10 text-green-600" />}
            title="Role-based Access"
            description="Separate dashboards for students, teachers, and administrators"
          />
          <FeatureCard
            icon={<Bell className="h-10 w-10 text-orange-600" />}
            title="Leave Management"
            description="Apply for medical or duty leave with easy approval workflow"
          />
          <FeatureCard
            icon={<Shield className="h-10 w-10 text-red-600" />}
            title="Secure & Reliable"
            description="Enterprise-grade security with encrypted data storage"
          />
          <FeatureCard
            icon={<GraduationCap className="h-10 w-10 text-indigo-600" />}
            title="Subject-wise Tracking"
            description="Track attendance for each subject separately with detailed reports"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-12 sm:mt-20 py-6 sm:py-8 bg-white">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="text-sm sm:text-base">&copy; {new Date().getFullYear()} IK Gujral Punjab Technical University</p>
          <p className="text-xs sm:text-sm mt-2">
            Jalandhar-Kapurthala Highway, Kapurthala - 144603, Punjab, India
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="mb-3 sm:mb-4">{icon}</div>
      <h4 className="text-lg sm:text-xl font-semibold mb-2">{title}</h4>
      <p className="text-sm sm:text-base text-muted-foreground">{description}</p>
    </div>
  );
}
