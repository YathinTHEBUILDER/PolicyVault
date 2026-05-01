'use client';

import { BackboneSidebar } from '@/components/layout/BackboneSidebar';
import { WorkspaceLayout } from '@/components/layout/WorkspaceLayout';

export default function BackboneLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceLayout
      sidebar={<BackboneSidebar />}
      themeColor="text-emerald-600"
      softBg="bg-emerald-50"
      label="Backbone Management"
      accentBg="bg-emerald-600"
      borderColor="border-emerald-100"
    >
      {children}
    </WorkspaceLayout>
  );
}
