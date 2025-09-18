import { NextRequest, NextResponse } from 'next/server';
import { readdir, unlink } from 'fs/promises';
import { join } from 'path';
import { auth } from '@/lib/auth';

// Upload directory
const UPLOAD_DIR = join(process.cwd(), 'uploads');

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const fileId = params.id;
    
    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    // Find the file in the upload directory that matches the file ID and user ID
    const files = await readdir(UPLOAD_DIR);
    const fileToDelete = files.find(file => {
      // Check if the file contains the user ID and file ID in the correct format
      // Format: originalName-userId-fileId.extension
      return file.includes(`-${session.user.id}-${fileId}.`);
    });
    
    if (!fileToDelete) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    const filePath = join(UPLOAD_DIR, fileToDelete);
    
    // Delete the file
    await unlink(filePath);
    
    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}