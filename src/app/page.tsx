import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GraduationCap, Users, BarChart3, Clock, Shield, Bell } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="font-bold text-xl">IK Gujral PTU</h1>
              <p className="text-xs text-muted-foreground">Attendance Management System</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Student Signup</Button>
            </Link>
            <Link href="/teacher/signup">
              <Button variant="outline">Teacher Signup</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Smart Attendance Management
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Streamline attendance tracking for IK Gujral Punjab Technical University
            with real-time updates, automated reporting, and comprehensive analytics.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">Key Features</h3>
        <div className="grid md:grid-cols-3 gap-8">
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
      <footer className="border-t mt-20 py-8 bg-white">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} IK Gujral Punjab Technical University</p>
          <p className="text-sm mt-2">
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
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="mb-4">{icon}</div>
      <h4 className="text-xl font-semibold mb-2">{title}</h4>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
