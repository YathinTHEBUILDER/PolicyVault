'use client';

import { useParams } from 'next/navigation';
import MotorDashboard from '@/components/features/dashboards/MotorDashboard';
import HealthDashboard from '@/components/features/dashboards/HealthDashboard';
import OthersDashboard from '@/components/features/dashboards/OthersDashboard';

export default function DynamicDashboardPage() {
  const params = useParams();
  const workspace = params.workspace as string;

  if (workspace === 'motor') return <MotorDashboard />;
  if (workspace === 'health') return <HealthDashboard />;
  if (workspace === 'others') return <OthersDashboard />;

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
      <p className="font-black uppercase tracking-widest">Invalid Workspace</p>
    </div>
  );
}
