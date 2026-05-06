'use client';

import { useParams, usePathname } from 'next/navigation';
import { MotorSidebar } from '@/components/layout/MotorSidebar';
import { HealthSidebar } from '@/components/layout/HealthSidebar';
import { OthersSidebar } from '@/components/layout/OthersSidebar';
import { BackboneSidebar } from '@/components/layout/BackboneSidebar';
import { WorkspaceLayout } from '@/components/layout/WorkspaceLayout';
import { ReactNode } from 'react';

export default function DynamicWorkspaceLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const workspace = params.workspace as string;

  let sidebar = <BackboneSidebar />;
  let themeColor = "text-emerald-600";
  let softBg = "bg-emerald-50";
  let label = "Backbone Management";
  let accentBg = "bg-emerald-600";
  let borderColor = "border-emerald-100";

  if (workspace === 'motor') {
    sidebar = <MotorSidebar />;
    themeColor = "text-blue-600";
    softBg = "bg-blue-50";
    label = "Motor System";
    accentBg = "bg-blue-600";
    borderColor = "border-blue-100";
  } else if (workspace === 'health') {
    sidebar = <HealthSidebar />;
    themeColor = "text-rose-600";
    softBg = "bg-rose-50";
    label = "Health System";
    accentBg = "bg-rose-600";
    borderColor = "border-rose-100";
  } else if (workspace === 'others') {
    sidebar = <OthersSidebar />;
    themeColor = "text-indigo-600";
    softBg = "bg-indigo-50";
    label = "Commercial Hub";
    accentBg = "bg-indigo-600";
    borderColor = "border-indigo-100";
  }

  return (
    <WorkspaceLayout
      sidebar={sidebar}
      themeColor={themeColor}
      softBg={softBg}
      label={label}
      accentBg={accentBg}
      borderColor={borderColor}
    >
      {children}
    </WorkspaceLayout>
  );
}
