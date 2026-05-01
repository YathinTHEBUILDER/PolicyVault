'use client';

import { MotorSidebar } from '@/components/layout/MotorSidebar';
import { WorkspaceLayout } from '@/components/layout/WorkspaceLayout';

export default function MotorLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceLayout
      sidebar={<MotorSidebar />}
      themeColor="text-blue-600"
      softBg="bg-blue-50"
      label="Motor System"
      accentBg="bg-blue-600"
      borderColor="border-blue-100"
    >
      {children}
    </WorkspaceLayout>
  );
}
