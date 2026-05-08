'use client';

import { useParams } from 'next/navigation';
import EndorsementsView from '@/components/workspaces/EndorsementsView';

export default function DynamicEndorsementsPage() {
  const params = useParams();
  const workspace = params.workspace as string;

  return <EndorsementsView category={workspace as any} />;
}
