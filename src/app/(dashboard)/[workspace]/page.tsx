'use client';

import { useParams } from 'next/navigation';
import MotorDashboard from '@/components/features/dashboards/MotorDashboard';
import HealthDashboard from '@/components/features/dashboards/HealthDashboard';
import OthersDashboard from '@/components/features/dashboards/OthersDashboard';
import BackboneDashboard from '@/components/features/dashboards/BackboneDashboard';

export default function DynamicDashboardPage() {
  const params = useParams();
  const workspace = params.workspace as string;

  if (workspace === 'motor') return <MotorDashboard />;
  if (workspace === 'health') return <HealthDashboard />;
  if (workspace === 'others') return <OthersDashboard />;

  return <BackboneDashboard />;
}
