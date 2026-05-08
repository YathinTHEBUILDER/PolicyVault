'use client';

import { useParams } from 'next/navigation';
import RenewalsView from '@/components/workspaces/RenewalsView';

export default function DynamicRenewalsPage() {
  const params = useParams();
  const workspace = params.workspace as string;

  return <RenewalsView category={workspace as any} />;
}
