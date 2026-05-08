'use client';

import { useParams } from 'next/navigation';
import MotorPoliciesList from '@/components/features/policies/MotorPoliciesList';
import HealthPoliciesList from '@/components/features/policies/HealthPoliciesList';
import OthersPoliciesList from '@/components/features/policies/OthersPoliciesList';

export default function DynamicPoliciesPage() {
  const params = useParams();
  const workspace = params.workspace as string;

  if (workspace === 'motor') return <MotorPoliciesList />;
  if (workspace === 'health') return <HealthPoliciesList />;
  if (workspace === 'others') return <OthersPoliciesList />;

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
      <p className="font-black uppercase tracking-widest">Invalid Workspace</p>
    </div>
  );
}
