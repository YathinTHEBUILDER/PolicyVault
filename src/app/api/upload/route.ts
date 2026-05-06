import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { b2Client, BUCKET_NAME } from '@/lib/backblaze';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const customerId = formData.get('customerId') as string;
    const category = formData.get('category') as string;
    const policyId = formData.get('policyId') as string || null;
    const policyType = formData.get('policyType') as string || null;
    const documentType = formData.get('documentType') as string || null;

    if (!file || !customerId || !category) {
      console.error('Upload Error: Missing required fields', { hasFile: !!file, customerId, category });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log(`Starting upload for file: ${file.name} (${file.size} bytes)`);

    // Validation
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only PDF and images are allowed.' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size too large. Max 10MB.' }, { status: 400 });
    }

    // Sanitize filename
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const timestamp = Date.now();
    const objectKey = `${customerId}/${category}/${timestamp}_${sanitizedFilename}`;

    // Upload to Backblaze
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log('File buffered, uploading to Backblaze...');
    
    await b2Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: objectKey,
        Body: buffer,
        ContentType: file.type,
      })
    );

    console.log('Upload to Backblaze successful, recording in DB...');

    // Store in DB
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert({
        customer_id: customerId,
        policy_id: policyId,
        policy_type: policyType,
        document_type: documentType || category,
        document_name: file.name,
        storage_object_key: objectKey,
        file_size_bytes: file.size,
        mime_type: file.type,
        uploaded_by: user.id,
      })
      .select()
      .single();

    if (dbError) {
      console.error('DB Error:', dbError);
      return NextResponse.json({ error: 'Failed to record document in database' }, { status: 500 });
    }

    // Update specific tables if needed (e.g., profile photo, policy file)
    if (category === 'kyc' && (documentType === 'aadhaar' || documentType === 'pan')) {
       // Optional: Update customer record if needed
    }

    return NextResponse.json({ 
      success: true, 
      document,
      key: objectKey
    });

  } catch (error: any) {
    console.error('Critical Upload Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
