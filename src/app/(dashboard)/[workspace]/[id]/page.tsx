'use client';

import { useParams } from 'next/navigation';
import MotorPolicyDetails from '@/components/features/policies/details/MotorPolicyDetails';
import HealthPolicyDetails from '@/components/features/policies/details/HealthPolicyDetails';

export default function DynamicPolicyDetailsPage() {
  const params = useParams();
  const workspace = params.workspace as string;

  if (workspace === 'motor') return <MotorPolicyDetails />;
  if (workspace === 'health') return <HealthPolicyDetails />;

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
      <p className="font-black uppercase tracking-widest">Invalid Workspace / Details Not Supported</p>
    </div>
  );
}
