import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  console.log('Upload request received');

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('Missing BLOB_READ_WRITE_TOKEN');
    return NextResponse.json({ success: false, error: 'Storage not configured. Check environment variables.' }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.warn('No file in form data');
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    console.log(`Uploading file: ${file.name}, size: ${file.size}`);
    const blob = await put(file.name, file, {
      access: 'public',
    });

    console.log('Upload successful:', blob.url);
    return NextResponse.json({
      success: true,
      url: blob.url,
    });
  } catch (error) {
    console.error('Vercel Blob Upload error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload image'
    }, { status: 500 });
  }
}
