'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function GroupsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Study Groups</h1>
                <p className="text-muted-foreground">Collaborate with peers</p>
              </div>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Group
              </Button>
            </div>

            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Study groups feature coming soon</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
