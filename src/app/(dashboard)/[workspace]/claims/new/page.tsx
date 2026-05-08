'use client';

import { useParams } from 'next/navigation';
import MotorClaimForm from '@/components/features/claims/forms/MotorClaimForm';
import HealthClaimForm from '@/components/features/claims/forms/HealthClaimForm';

export default function DynamicNewClaimPage() {
  const params = useParams();
  const workspace = params.workspace as string;

  if (workspace === 'motor') return <MotorClaimForm />;
  if (workspace === 'health') return <HealthClaimForm />;

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
      <p className="font-black uppercase tracking-widest">Invalid Workspace / Claims Not Supported</p>
    </div>
  );
}
