import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { b2Client, BUCKET_NAME } from '@/lib/backblaze';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function POST(request: NextRequest) {
  try {
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

    const { filename, contentType, customerId, category } = await request.json();

    if (!filename || !contentType || !customerId || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Sanitize filename
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const timestamp = Date.now();
    const objectKey = `${customerId}/${category}/${timestamp}_${sanitizedFilename}`;

    // Generate Presigned URL for PUT
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: objectKey,
      ContentType: contentType,
    });

    // URL valid for 10 minutes
    const signedUrl = await getSignedUrl(b2Client, command, { expiresIn: 600 });

    return NextResponse.json({ 
      uploadUrl: signedUrl,
      key: objectKey
    });

  } catch (error: any) {
    console.error('Presigned URL error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
