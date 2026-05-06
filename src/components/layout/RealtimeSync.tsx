'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function RealtimeSync() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Listen for any changes on relevant tables to keep the UI in sync across the platform
    const channel = supabase
      .channel('global-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        () => {
          console.log('🔄 Database change detected, refreshing UI...');
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router]);

  return null;
}
