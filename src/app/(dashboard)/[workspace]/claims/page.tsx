'use client';

import { useParams } from 'next/navigation';
import ClaimsView from '@/components/workspaces/ClaimsView';

export default function DynamicClaimsPage() {
  const params = useParams();
  const workspace = params.workspace as string;

  return <ClaimsView category={workspace as any} />;
}
