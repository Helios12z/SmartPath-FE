'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { format, formatDistanceToNow, isAfter, parseISO } from 'date-fns';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge as UiBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { mockStore } from '@/lib/mockStore';
import type { EventItem, EventRegistration } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { CalendarDays, Clock, MapPin, Users as UsersIcon, Sparkles, Video } from 'lucide-react';

type EventWithMeta = EventItem & {
  host: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
  } | null;
  goingCount: number;
  interestedCount: number;
};

const mapEventWithMeta = (
  event: EventItem,
  registrations: EventRegistration[],
): EventWithMeta => {
  const host = mockStore.getUserById(event.host_id);
  const relevant = registrations.filter((item) => item.event_id === event.id);
  return {
    ...event,
    host: host
      ? {
          id: host.id,
          full_name: host.full_name,
          avatar_url: host.avatar_url,
        }
      : null,
    goingCount: relevant.filter((item) => item.status === 'going').length,
    interestedCount: relevant.filter((item) => item.status === 'interested').length,
  };
};

export default function EventsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);

  useEffect(() => {
    setEvents(mockStore.getEvents());
    setRegistrations(mockStore.getEventRegistrations());
  }, []);

  const refreshRegistrations = useCallback(() => {
    setRegistrations(mockStore.getEventRegistrations());
  }, []);

  const eventsWithMeta = useMemo(
    () => events.map((event) => mapEventWithMeta(event, registrations)),
    [events, registrations],
  );

  const upcomingEvents = useMemo(
    () =>
      eventsWithMeta
        .filter((event) => {
          const current = new Date();
          return isAfter(parseISO(event.end_at), current);
        })
        .sort(
          (a, b) =>
            parseISO(a.start_at).getTime() - parseISO(b.start_at).getTime(),
        ),
    [eventsWithMeta],
  );

  const pastEvents = useMemo(
    () =>
      eventsWithMeta
        .filter((event) => {
          const current = new Date();
          return !isAfter(parseISO(event.end_at), current);
        })
        .sort(
          (a, b) =>
            parseISO(b.start_at).getTime() - parseISO(a.start_at).getTime(),
        ),
    [eventsWithMeta],
  );

  const getUserStatus = useCallback(
    (eventId: string) => {
      if (!user) return null;
      const registration = registrations.find(
        (item) => item.event_id === eventId && item.user_id === user.id,
      );
      return registration?.status ?? null;
    },
    [registrations, user],
  );

  const handleStatusChange = (eventId: string, status: 'going' | 'interested') => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to update your event status.',
        variant: 'destructive',
      });
      return;
    }

    const currentStatus = getUserStatus(eventId);
    if (currentStatus === status) {
      mockStore.removeEventRegistration(user.id, eventId);
      toast({
        title: 'Status removed',
        description: 'You are no longer marked for this event.',
      });
    } else {
      mockStore.upsertEventRegistration(user.id, eventId, status);
      toast({
        title: status === 'going' ? 'See you there!' : 'Marked as interested',
        description:
          status === 'going'
            ? 'You will receive reminders for this event.'
            : 'We will keep you posted with updates.',
      });
    }

    refreshRegistrations();
  };

  const renderEventCard = (event: EventWithMeta) => {
    const userStatus = getUserStatus(event.id);
    const startDate = parseISO(event.start_at);
    const endDate = parseISO(event.end_at);
    const now = new Date();

    return (
      <Card key={event.id} className="overflow-hidden border border-slate-200 dark:border-slate-800">
        {event.banner_url && (
          <div className="h-40 w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.banner_url}
              alt={event.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-xl font-semibold">{event.title}</CardTitle>
            <UiBadge variant="outline">{event.category}</UiBadge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-3">{event.description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <CalendarDays className="h-4 w-4 mt-0.5 text-blue-500" />
              <div>
                <p className="font-medium text-foreground">
                  {format(startDate, 'EEEE, MMM d • h:mm a')}
                </p>
                <p>
                  Ends {format(endDate, 'MMM d, h:mm a')} •{' '}
                  {formatDistanceToNow(endDate, { addSuffix: true })}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-blue-500" />
              <div>
                <p className="font-medium text-foreground">{event.location}</p>
                <p>
                  {event.is_virtual ? 'Hybrid / Virtual option available' : 'On campus'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <UsersIcon className="h-4 w-4 mt-0.5 text-blue-500" />
              <div>
                <p className="font-medium text-foreground">
                  {event.goingCount} going · {event.interestedCount} interested
                </p>
                {event.capacity && (
                  <p>{event.capacity - event.goingCount} seats remaining</p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 mt-0.5 text-blue-500" />
              <div>
                <p className="font-medium text-foreground">
                  {isAfter(endDate, now) ? 'Upcoming' : 'Completed'}
                </p>
                <p>
                  {isAfter(endDate, now)
                    ? `Starts ${formatDistanceToNow(startDate, { addSuffix: true })}`
                    : `Completed ${formatDistanceToNow(endDate, { addSuffix: true })}`}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={event.host?.avatar_url ?? undefined} alt={event.host?.full_name} />
                <AvatarFallback>
                  {event.host?.full_name?.charAt(0).toUpperCase() ?? 'H'}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="font-medium text-foreground">
                  Hosted by {event.host?.full_name ?? 'SmartPath Team'}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="h-3 w-3" />
                  <span>Curated for ambitious students</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {event.is_virtual && (
                <UiBadge variant="secondary" className="flex items-center gap-1">
                  <Video className="h-3 w-3" />
                  Virtual access
                </UiBadge>
              )}
              <Button
                variant={userStatus === 'going' ? 'default' : 'outline'}
                onClick={() => handleStatusChange(event.id, 'going')}
              >
                I&apos;m going
              </Button>
              <Button
                variant={userStatus === 'interested' ? 'default' : 'outline'}
                onClick={() => handleStatusChange(event.id, 'interested')}
              >
                Interested
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Community Events</h1>
              <p className="text-muted-foreground">
                Join upcoming workshops, panels, and community experiences curated for SmartPath members.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span>{upcomingEvents.length} upcoming</span>
              <span>•</span>
              <span>{pastEvents.length} past</span>
            </div>
          </div>

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Upcoming Events</h2>
              {upcomingEvents.length > 0 && (
                <UiBadge variant="secondary">{upcomingEvents.length}</UiBadge>
              )}
            </div>
            {upcomingEvents.length === 0 ? (
              <Card className="p-10 text-center">
                <p className="text-muted-foreground">
                  No upcoming events yet. Check back soon or mark your interests to get notified first.
                </p>
              </Card>
            ) : (
              <div className="grid gap-6">
                {upcomingEvents.map((event) => renderEventCard(event))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Past Highlights</h2>
              {pastEvents.length > 0 && (
                <UiBadge variant="outline">{pastEvents.length}</UiBadge>
              )}
            </div>
            {pastEvents.length === 0 ? (
              <Card className="p-10 text-center">
                <p className="text-muted-foreground">
                  Once events wrap up they will appear here with resources and recordings.
                </p>
              </Card>
            ) : (
              <div className="grid gap-6">
                {pastEvents.map((event) => renderEventCard(event))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
