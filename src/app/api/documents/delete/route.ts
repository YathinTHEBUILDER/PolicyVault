import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { b2Client, BUCKET_NAME } from '@/lib/backblaze';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

export async function POST(request: NextRequest) {
  try {
    const { id, storageKey } = await request.json();

    if (!id || !storageKey) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // 1. Delete from Backblaze B2
    console.log(`Deleting from B2: ${storageKey}`);
    try {
      await b2Client.send(
        new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: storageKey,
        })
      );
    } catch (b2Error: any) {
      console.error('B2 Deletion Warning:', b2Error);
      // We continue even if B2 fails (maybe file already gone)
    }

    // 2. Delete from Database
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (dbError) {
      console.error('DB Deletion Error:', dbError);
      return NextResponse.json({ error: 'Failed to delete from database' }, { status: 500 });
    }

    // 3. Log Audit
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      user_role: 'admin',
      action: 'DELETE',
      table_name: 'documents',
      record_id: id,
      new_values: { storageKey }
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Critical Delete Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
