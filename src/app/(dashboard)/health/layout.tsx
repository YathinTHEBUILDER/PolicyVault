'use client';

import { HealthSidebar } from '@/components/layout/HealthSidebar';
import { WorkspaceLayout } from '@/components/layout/WorkspaceLayout';

export default function HealthLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceLayout
      sidebar={<HealthSidebar />}
      themeColor="text-rose-600"
      softBg="bg-rose-50"
      label="Health System"
      accentBg="bg-rose-600"
      borderColor="border-rose-100"
    >
      {children}
    </WorkspaceLayout>
  );
}
