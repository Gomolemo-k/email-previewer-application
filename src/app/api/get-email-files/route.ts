import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db/index';
import { emailFile } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';

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