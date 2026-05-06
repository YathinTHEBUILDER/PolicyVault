import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { b2Client, BUCKET_NAME } from '@/lib/backblaze';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  if (!key) {
    return NextResponse.json({ error: 'Missing key' }, { status: 400 });
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

  // Get user role
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  const role = roleData?.role;

  // Key structure: {customer_id}/{category}/{filename}
  const customerIdFromKey = key.split('/')[0];

  // Permission check
  if (role === 'admin' || role === 'staff') {
    // Admins and staff have access to everything
  } else if (role === 'customer') {
    // Customers can only access their own files
    if (user.id !== customerIdFromKey) {
       // Check if customer phone matches auth phone
       const { data: customerData } = await supabase
         .from('customers')
         .select('id, phone_primary')
         .eq('id', customerIdFromKey)
         .single();
       
       if (!customerData || customerData.id !== customerIdFromKey) {
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
       }
    }
  } else {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    // Generate signed URL from Backblaze B2
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(b2Client, command, { expiresIn: 3600 });

    if (!url) {
      return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 });
    }

    // Get actual document record for audit
    const { data: doc } = await supabase
      .from('documents')
      .select('id')
      .eq('storage_object_key', key)
      .single();

    // Log access in audit_logs
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      user_role: role as string,
      action: 'DOWNLOAD',
      table_name: 'documents',
      record_id: doc?.id || null,
      new_values: { key }
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
