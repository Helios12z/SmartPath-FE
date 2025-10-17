'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardContent } from '@/components/ui/card';

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Messages</h1>
              <p className="text-muted-foreground">Chat with friends and groups</p>
            </div>

            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Messages feature coming soon</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
