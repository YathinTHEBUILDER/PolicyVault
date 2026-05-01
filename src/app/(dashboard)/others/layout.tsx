'use client';

import { OthersSidebar } from '@/components/layout/OthersSidebar';
import { WorkspaceLayout } from '@/components/layout/WorkspaceLayout';

export default function OthersLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceLayout
      sidebar={<OthersSidebar />}
      themeColor="text-indigo-600"
      softBg="bg-indigo-50"
      label="Commercial System"
      accentBg="bg-indigo-600"
      borderColor="border-indigo-100"
    >
      {children}
    </WorkspaceLayout>
  );
}
