import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// Ensure the upload directory exists
const UPLOAD_DIR = join(process.cwd(), 'uploads');

export async function POST(request: NextRequest) {
  try {
    // Create upload directory if it doesn't exist
    await mkdir(UPLOAD_DIR, { recursive: true });

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['message/rfc822', 'text/html'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['eml', 'html'];

    if (!validExtensions.includes(fileExtension || '') || 
        !validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only .eml and .html files are allowed.' },
        { status: 400 }
      );
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum file size is 10MB.' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `${file.name.replace(/\.[^/.]+$/, '')}-${uniqueSuffix}.${fileExtension}`;
    const filepath = join(UPLOAD_DIR, filename);

    // Save file to disk
    await writeFile(filepath, buffer);

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      filename,
      filepath
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Email upload endpoint' });
}