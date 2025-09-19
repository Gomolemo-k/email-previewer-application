import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { auth } from '@/lib/auth';

// Upload directory
const UPLOAD_DIR = join(process.cwd(), 'uploads');

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
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

    // Validate filename
    if (!params.filename) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 }
      );
    }

    // Construct the full file path
    const filePath = join(UPLOAD_DIR, params.filename);
    
    // Verify that the file belongs to the user by checking the filename format
    // Format: originalName-userId-fileId.extension
    const fileNameParts = params.filename.split('.');
    const fileExtension = fileNameParts.pop() || '';
    const nameAndIds = fileNameParts.join('.');
    
    // Check if the file belongs to the current user
    // The filename format is: originalName-userId-fileId.extension
    // So we need to check if the filename contains the user ID
    if (!nameAndIds.includes(`-${session.user.id}-`)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Read file content
    const fileContent = await readFile(filePath, 'utf-8');
    
    // Set appropriate content type based on file extension
    const headers = new Headers();
    if (fileExtension === 'html') {
      headers.set('Content-Type', 'text/html; charset=utf-8');
    } else {
      headers.set('Content-Type', 'text/plain; charset=utf-8');
    }
    
    return new NextResponse(fileContent, {
      headers
    });
  } catch (error: any) {
    console.error('Error retrieving file content:', error);
    
    // Check if file not found
    if (error.code === 'ENOENT') {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to retrieve file content' },
      { status: 500 }
    );
  }
}