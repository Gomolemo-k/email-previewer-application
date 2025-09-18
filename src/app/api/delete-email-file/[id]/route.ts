import { NextRequest, NextResponse } from 'next/server';
import { readdir, unlink } from 'fs/promises';
import { join } from 'path';
import { auth } from '@/lib/auth';

// Upload directory
const UPLOAD_DIR = join(process.cwd(), 'uploads');

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params before accessing properties
    const { id: fileId } = await params;
    
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

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    // Find the file in the upload directory that matches the file ID
    const files = await readdir(UPLOAD_DIR);
    const fileToDelete = files.find(file => {
      // Check if the file ends with the fileId followed by an extension
      // This handles complex filenames where the fileId is at the end
      const fileNameWithoutExtension = file.substring(0, file.lastIndexOf('.'));
      return fileNameWithoutExtension.endsWith(`-${fileId}`);
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