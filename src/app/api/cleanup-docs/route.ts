import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { docs } = await req.json();
    
    if (!docs || !Array.isArray(docs)) {
      return NextResponse.json({ error: 'Invalid documents list' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log('🧹 API Cleanup triggered for:', docs.length, 'documents');

    for (const doc of docs) {
      if (doc.key) {
        await supabase.storage.from('policy-vault').remove([doc.key]);
      }
      if (doc.id) {
        await supabase.from('documents').delete().eq('id', doc.id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Cleanup API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
