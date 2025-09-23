import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readdir } from 'fs/promises';
import { join } from 'path';
import { getDb } from '@/db/index';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { getAllPricePlans } from '@/lib/price-plan';
import { getActiveSubscriptionAction } from '@/actions/get-active-subscription';
import { getLifetimeStatusAction } from '@/actions/get-lifetime-status';

// Ensure the upload directory exists
const UPLOAD_DIR = join(process.cwd(), 'uploads');

// Supported email file types and their MIME types
const SUPPORTED_FILE_TYPES = {
  // Email formats
  'eml': 'message/rfc822',
  'msg': 'application/vnd.ms-outlook',
  'mbox': 'application/mbox',
  'mbx': 'application/mbox',
  // HTML formats
  'html': 'text/html',
  'htm': 'text/html',
  // Text formats
  'txt': 'text/plain',
  // Archive formats that might contain emails
  'pst': 'application/vnd.ms-outlook',
  'ost': 'application/vnd.ms-outlook'
};

// Get array of supported extensions
const SUPPORTED_EXTENSIONS = Object.keys(SUPPORTED_FILE_TYPES);

// Get user's current plan limits
async function getUserPlanLimits(userId: string) {
  // Get all plans
  const plans = getAllPricePlans();
  const freePlan = plans.find((plan) => plan.isFree);
  
  try {
    // Check if user has lifetime access
    const lifetimeResult = await getLifetimeStatusAction({ userId });
    if (lifetimeResult?.data?.success && lifetimeResult.data.isLifetimeMember) {
      // Lifetime users get pro plan limits
      const lifetimePlan = plans.find((plan) => plan.isLifetime);
      return lifetimePlan?.features?.fileUpload || { maxFileSize: 20, maxFiles: 50 };
    }
    
    // Check if user has active subscription
    const subscriptionResult = await getActiveSubscriptionAction({ userId });
    if (subscriptionResult?.data?.success && subscriptionResult.data.data) {
      // Find the plan that matches the subscription
      const subscription = subscriptionResult.data.data;
      const plan = plans.find((p) => 
        p.prices.find((price) => price.priceId === subscription.priceId)
      );
      
      if (plan) {
        return plan.features?.fileUpload || { maxFileSize: 20, maxFiles: 50 };
      }
    }
    
    // Default to free plan limits
    return freePlan?.features?.fileUpload || { maxFileSize: 5, maxFiles: 5 };
  } catch (error) {
    console.error('Error getting user plan limits:', error);
    // Default to free plan limits if there's an error
    return freePlan?.features?.fileUpload || { maxFileSize: 5, maxFiles: 5 };
  }
}

// Count user's uploaded files
async function countUserFiles(userId: string): Promise<number> {
  try {
    const files = await readdir(UPLOAD_DIR);
    // Filter files that belong to the current user
    // Format: originalName-userId-uuid.extension
    const userFiles = files.filter(file => 
      file.includes(`-${userId}-`) && 
      SUPPORTED_EXTENSIONS.some(ext => file.endsWith(`.${ext}`))
    );
    return userFiles.length;
  } catch (error) {
    console.error('Error counting user files:', error);
    return 0;
  }
}

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

    // Get user's plan limits
    const userLimits = await getUserPlanLimits(session.user.id);
    const maxFileSizeMB = userLimits.maxFileSize || 5;
    const maxFileSizeBytes = maxFileSizeMB * 1024 * 1024;
    const maxFiles = userLimits.maxFiles || 5;

    // Count current user files
    const currentFileCount = await countUserFiles(session.user.id);
    
    // Check if user has reached file limit
    if (currentFileCount >= maxFiles) {
      return NextResponse.json(
        { 
          error: `File limit reached. Your plan allows up to ${maxFiles} files. Please delete some files or upgrade your plan.` 
        },
        { status: 400 }
      );
    }

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
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const expectedMimeType = SUPPORTED_FILE_TYPES[fileExtension as keyof typeof SUPPORTED_FILE_TYPES];

    // Check if file extension is supported
    if (!SUPPORTED_EXTENSIONS.includes(fileExtension || '')) {
      return NextResponse.json(
        { 
          error: `Invalid file type. Supported formats: ${SUPPORTED_EXTENSIONS.join(', ')}.` 
        },
        { status: 400 }
      );
    }

    // For MIME type validation, we're less strict to allow for variations
    // but we still check if the MIME type is in the expected range
    const isMimeTypeValid = expectedMimeType 
      ? file.type === expectedMimeType || file.type === 'application/octet-stream' || file.type.startsWith('text/')
      : true;

    // Special handling for Outlook files which might have generic MIME types
    const isOutlookFile = fileExtension === 'msg' || fileExtension === 'pst' || fileExtension === 'ost';
    
    if (!isMimeTypeValid && !isOutlookFile && file.type !== 'application/octet-stream') {
      console.warn(`Unexpected MIME type for .${fileExtension} file: ${file.type}`);
      // We'll still allow the file for now, but log the mismatch
    }

    // Check file size against user's plan limit
    if (file.size > maxFileSizeBytes) {
      return NextResponse.json(
        { 
          error: `File too large. Your plan allows up to ${maxFileSizeMB}MB files.` 
        },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename with user ID
    const uniqueId = uuidv4();
    const filename = `${file.name.replace(/\.[^/.]+$/, '')}-${session.user.id}-${uniqueId}.${fileExtension}`;
    const filepath = join(UPLOAD_DIR, filename);

    // Save file to disk
    await writeFile(filepath, buffer);

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      fileId: uniqueId,
      filename: file.name,
      filepath: filepath,
      fileType: fileExtension,
      limits: {
        maxFileSize: maxFileSizeMB,
        maxFiles: maxFiles,
        currentFiles: currentFileCount + 1
      }
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
  return NextResponse.json({ 
    message: 'Email upload endpoint',
    supportedFormats: SUPPORTED_EXTENSIONS
  });
}