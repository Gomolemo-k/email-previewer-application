import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db/index';
import { emailFile } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    // Authenticate the user
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

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

    // Get database connection
    const db = await getDb();

    // Insert file into database
    const newEmailFile = await db.insert(emailFile).values({
      id: uuidv4(),
      userId: session.user.id,
      filename: file.name,
      fileType: fileExtension || '',
      fileSize: file.size,
      content: buffer,
    }).returning();

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      fileId: newEmailFile[0].id,
      filename: newEmailFile[0].filename,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate the user
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get database connection
    const db = await getDb();

    // Get all email files for the user
    const userFiles = await db.select().from(emailFile).where(
      eq(emailFile.userId, session.user.id)
    );

    return NextResponse.json({
      message: 'Email files retrieved successfully',
      files: userFiles.map(file => ({
        id: file.id,
        filename: file.filename,
        fileType: file.fileType,
        fileSize: file.fileSize,
        createdAt: file.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error retrieving files:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve files' },
      { status: 500 }
    );
  }
}