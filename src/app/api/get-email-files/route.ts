import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { auth } from '@/lib/auth';

// Upload directory
const UPLOAD_DIR = join(process.cwd(), 'uploads');

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

    // Check if upload directory exists
    try {
      const files = await readdir(UPLOAD_DIR);
      
      // Filter files that belong to the current user
      // Format: originalName-userId-uuid.extension
      const userFiles = files.filter(file => 
        file.includes(`-${session.user.id}-`) && 
        (file.endsWith('.eml') || file.endsWith('.html'))
      );
      
      const emailFiles = await Promise.all(
        userFiles.map(async (file) => {
          const filePath = join(UPLOAD_DIR, file);
          const fileStat = await stat(filePath);
          
          // Extract original filename and ID from the file name
          // Format: originalName-userId-uuid.extension
          // We need to extract the parts carefully to handle filenames that may contain dashes
          const fileNameParts = file.split('.');
          const fileExtension = fileNameParts.pop() || '';
          const nameAndIds = fileNameParts.join('.');
          
          // Find the last occurrence of userId in the filename
          const userIdIndex = nameAndIds.lastIndexOf(`-${session.user.id}-`);
          if (userIdIndex === -1) {
            // This shouldn't happen if our filter worked correctly, but just in case
            throw new Error('Invalid filename format');
          }
          
          // Extract original filename (everything before the last userId)
          const originalFileName = nameAndIds.substring(0, userIdIndex) + '.' + fileExtension;
          
          // Extract the part after userId to get the fileId
          const idsPart = nameAndIds.substring(userIdIndex + session.user.id.length + 2); // +2 for the two dashes
          const fileId = idsPart; // The remaining part is the fileId
          
          return {
            id: fileId,
            filename: originalFileName,
            fileType: fileExtension,
            fileSize: fileStat.size,
            createdAt: fileStat.birthtime,
          };
        })
      );

      return NextResponse.json({
        message: 'Email files retrieved successfully',
        files: emailFiles,
      });
    } catch (error) {
      // If directory doesn't exist, return empty array
      return NextResponse.json({
        message: 'Email files retrieved successfully',
        files: [],
      });
    }
  } catch (error) {
    console.error('Error retrieving files:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve files' },
      { status: 500 }
    );
  }
}