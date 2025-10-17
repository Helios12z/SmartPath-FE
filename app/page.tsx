'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { GraduationCap, BookOpen, Users, MessageSquare, Award, TrendingUp } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push('/forum');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: MessageSquare,
      title: 'Discussion Forums',
      description: 'Engage in meaningful conversations about courses and topics',
    },
    {
      icon: BookOpen,
      title: 'Study Materials',
      description: 'Access and share course materials, notes, and resources',
    },
    {
      icon: Users,
      title: 'Study Groups',
      description: 'Form groups with peers to collaborate and learn together',
    },
    {
      icon: Award,
      title: 'Reputation System',
      description: 'Earn points for helpful contributions to the community',
    },
    {
      icon: TrendingUp,
      title: 'Personalized Feed',
      description: 'AI-powered recommendations based on your interests',
    },
    {
      icon: MessageSquare,
      title: 'Real-time Chat',
      description: 'Connect with friends and group members instantly',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-950">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center p-4 bg-blue-500 rounded-2xl mb-6">
            <GraduationCap className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600">
            Welcome to SmartPath
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            A modern platform where university students connect, collaborate, and excel together.
            Join discussions, share knowledge, and build your academic network.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="text-lg px-8">
                Get Started
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-20 text-center">
          <Card className="max-w-3xl mx-auto bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold mb-4">Ready to Join the Community?</h2>
              <p className="text-lg text-blue-50 mb-8">
                Connect with thousands of students, share your knowledge, and accelerate your learning journey.
              </p>
              <Link href="/auth/register">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  Create Your Account
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
