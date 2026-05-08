'use client';

import { useParams } from 'next/navigation';
import MotorPolicyForm from '@/components/features/policies/forms/MotorPolicyForm';
import HealthPolicyForm from '@/components/features/policies/forms/HealthPolicyForm';
import OthersPolicyForm from '@/components/features/policies/forms/OthersPolicyForm';

export default function DynamicNewPolicyPage() {
  const params = useParams();
  const workspace = params.workspace as string;

  if (workspace === 'motor') return <MotorPolicyForm />;
  if (workspace === 'health') return <HealthPolicyForm />;
  if (workspace === 'others') return <OthersPolicyForm />;

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
      <p className="font-black uppercase tracking-widest">Invalid Workspace</p>
    </div>
  );
}
