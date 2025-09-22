# Email Preview Feature Documentation

## Overview

The Email Preview feature allows users to view their uploaded email files in three different responsive preview panes: Desktop, Tablet, and Mobile. This helps users quickly check how their emails will appear on different devices.

## Features

### Three-Pane Preview

The preview interface displays the email content simultaneously in three views:

1. **Desktop Preview**: 1200px wide view
2. **Tablet Preview**: 768px wide view
3. **Mobile Preview**: 375px wide view

### Responsive Design

Each preview pane is designed to be responsive:

- Desktop pane expands to fill available space up to 1200px
- Tablet pane is fixed at 768px wide
- Mobile pane is fixed at 375px wide
- All panes are scrollable for content that exceeds their dimensions

### File Format Support

The preview feature supports multiple email file formats:

- **.eml files**: Displayed as plain text
- **.html files**: Rendered as HTML in iframes

### Navigation

Users can easily navigate between the file listing and preview views:

- Back button to return to the file listing
- Download button to save the original file
- Open in new tab option for full-screen viewing

## Technical Implementation

### Frontend Components

#### EmailPreviewPage Component

The main component responsible for displaying the email preview:

- Located at: `src/app/[locale]/(protected)/email-preview/[fileId]/page.tsx`
- Uses React hooks for state management
- Fetches file metadata and content from backend APIs
- Implements responsive preview panes with proper dimensions

#### Key Features

1. **File Data Fetching**: Uses the `/api/get-email-files` endpoint to retrieve file metadata
2. **File Content Loading**: Uses the `/api/get-email-file-content/[filename]` endpoint to retrieve file content
3. **Loading States**: Shows loading spinner while fetching data
4. **Error Handling**: Displays user-friendly error messages when API calls fail
5. **Retry Functionality**: Allows users to retry failed content loading
6. **Responsive Preview Panes**: Implements three preview panes with specific dimensions
7. **File Format Handling**: Properly displays both .eml and .html files

### Backend API

#### GET /api/get-email-file-content/[filename]

Endpoint to retrieve the content of a specific email file:

- Authentication required
- Only allows access to files belonging to the authenticated user
- Returns file content with appropriate content type headers
- Handles errors gracefully with appropriate HTTP status codes

## User Experience

### Loading States

- Shows a spinner while fetching file metadata
- Shows a spinner while loading file content
- Displays appropriate messages for error states
- Provides visual feedback during all operations

### Error Handling

- Displays toast notifications for errors
- Provides clear error messages to help users understand what went wrong
- Allows users to retry failed operations
- Shows specific error messages for different failure scenarios

### Accessibility

- Proper labeling for screen readers
- Keyboard navigation support
- Sufficient color contrast for readability
- Responsive design for all device sizes

## Security

### Content Security

- Email HTML content is displayed in iframes to prevent XSS attacks
- Plain text content is properly escaped
- File access is restricted to authenticated users
- File paths are not exposed to the frontend

### Data Validation

- File type validation on upload
- User authentication verified before content access
- Input sanitized to prevent injection attacks

## Performance

### Optimization Techniques

- Efficient data fetching with proper error handling
- Lazy loading of file content when needed
- Proper caching of API responses
- Optimized iframe rendering for HTML content

### Resource Management

- Proper cleanup of event listeners
- Memory-efficient handling of large email files
- Optimized rendering for multiple preview panes

## Testing

### Unit Tests

Unit tests are implemented for:

- EmailPreviewPage component rendering
- File data fetching and error handling
- Content loading functionality
- User interactions with the preview interface

### Integration Tests

Integration tests cover:

- End-to-end email preview workflow
- API endpoint responses
- User authentication flows
- File content rendering across different formats

## Future Improvements

### Planned Features

1. **Preview Customization**: Allow users to customize preview dimensions
2. **Device Simulation**: Add more device types and orientations
3. **Interactive Preview**: Enable interaction with HTML content in preview
4. **Comparison Mode**: Allow side-by-side comparison of different email versions

### Performance Enhancements

1. **Content Caching**: Implement caching for frequently accessed email content
2. **Lazy Loading**: Optimize iframe loading for better performance
3. **Progressive Enhancement**: Add progressive enhancement for better user experience

## Troubleshooting

### Common Issues

1. **Content Not Displaying**: Check file format support and content encoding
2. **Loading Errors**: Verify API endpoint availability and network connectivity
3. **Preview Issues**: Ensure iframe sandboxing is properly configured

### Debugging Tips

1. Check browser console for JavaScript errors
2. Verify API responses in browser dev tools
3. Check server logs for backend errors
4. Ensure file storage directory has proper permissions
5. Test with different email file formats