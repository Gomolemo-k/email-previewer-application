# Email File Listing Feature Documentation

## Overview

The Email File Listing feature allows users to view all uploaded email files in a tabular format. Users can see file metadata, preview files, and delete files they no longer need.

## Features

### File Table Display

The file listing is displayed in a responsive table with the following columns:

- **Filename**: The original name of the uploaded file
- **File Type**: The file extension (e.g., .eml, .html)
- **File Size**: The size of the file in a human-readable format
- **Upload Date**: The date and time when the file was uploaded
- **Actions**: Buttons for viewing, previewing, and deleting files

### File Actions

Users can perform the following actions on each file:

1. **View**: Navigate to the email preview page for that file
2. **Preview**: Open a preview dialog to quickly view the file content
3. **Delete**: Remove the file from the system (with confirmation)

### Responsive Design

The file table is designed to work on all device sizes:

- On desktop screens, all columns are visible
- On mobile screens, the table becomes scrollable horizontally
- The action buttons are grouped together for better usability on small screens

## Technical Implementation

### Frontend Components

#### EmailFileTable Component

The main component responsible for displaying the file listing:

- Located at: `src/components/dashboard/email-file-table.tsx`
- Uses React hooks for state management
- Fetches file data from the backend API
- Implements real-time updates when new files are uploaded

#### Key Features

1. **Data Fetching**: Uses the `/api/get-email-files` endpoint to retrieve file metadata
2. **Real-time Updates**: Listens for `fileUploaded` events to refresh the file list
3. **Loading States**: Shows loading spinner while fetching data
4. **Error Handling**: Displays user-friendly error messages when API calls fail
5. **Empty State**: Shows a message when no files have been uploaded yet
6. **File Preview**: Includes a built-in preview dialog for quick file viewing
7. **File Deletion**: Implements delete functionality with user confirmation

### Backend API

#### GET /api/get-email-files

Endpoint to retrieve all email files for the current user:

- Authentication required
- Returns a list of files with metadata
- Only returns files belonging to the authenticated user
- Handles errors gracefully with appropriate HTTP status codes

#### DELETE /api/delete-email-file/[id]

Endpoint to delete a specific email file:

- Authentication required
- Only allows deletion of files belonging to the authenticated user
- Returns success or error messages
- Handles file system operations safely

## User Experience

### Loading States

- Shows a spinner while fetching file data
- Displays appropriate messages for empty states
- Provides visual feedback during file operations

### Error Handling

- Displays toast notifications for errors
- Provides clear error messages to help users understand what went wrong
- Allows users to retry failed operations

### Accessibility

- Proper labeling for screen readers
- Keyboard navigation support
- Sufficient color contrast for readability
- Responsive design for all device sizes

## Security

### File Access Control

- Files are stored with user-specific naming conventions
- Users can only see and delete their own files
- API endpoints authenticate users before allowing file operations
- File paths are not exposed to the frontend for security

### Data Validation

- File type validation on upload
- File size limits enforced
- User input sanitized to prevent injection attacks

## Performance

### Optimization Techniques

- Efficient data fetching with proper error handling
- Lazy loading of file content when needed
- Proper caching of API responses
- Optimized rendering for large file lists

## Testing

### Unit Tests

Unit tests are implemented for:

- EmailFileTable component rendering
- File data fetching and error handling
- File deletion functionality
- User interactions with the table

### Integration Tests

Integration tests cover:

- End-to-end file listing workflow
- API endpoint responses
- User authentication flows
- File upload and listing integration

## Future Improvements

### Planned Features

1. **Sorting**: Allow users to sort files by different columns
2. **Pagination**: Implement pagination for large file lists
3. **Filtering**: Add search and filter capabilities
4. **Bulk Actions**: Enable selection and bulk operations on multiple files

### Performance Enhancements

1. **Virtual Scrolling**: Implement virtual scrolling for very large file lists
2. **Caching**: Add more sophisticated caching mechanisms
3. **Prefetching**: Implement prefetching for better perceived performance

## Troubleshooting

### Common Issues

1. **Files Not Displaying**: Check user authentication and file permissions
2. **Loading Errors**: Verify API endpoint availability and network connectivity
3. **Delete Failures**: Ensure user has proper permissions and file exists

### Debugging Tips

1. Check browser console for JavaScript errors
2. Verify API responses in browser dev tools
3. Check server logs for backend errors
4. Ensure file storage directory has proper permissions