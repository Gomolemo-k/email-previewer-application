import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EmailUpload } from '../email-upload';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock fetch
const mockFetch = vi.fn();

global.fetch = mockFetch;

// Mock File and DataTransfer for drag and drop events
class MockFile {
  name: string;
  type: string;
  size: number;
  
  constructor(name: string, type: string, size: number) {
    this.name = name;
    this.type = type;
    this.size = size;
  }
}

global.File = MockFile as any;

describe('EmailUpload', () => {
  // Mock authClient
  const mockAuthClient = {
    getSession: vi.fn(),
  };

  // Mock authClient module after defining mockAuthClient
  vi.mock('@/lib/auth-client', () => ({
    authClient: mockAuthClient,
  }));

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render upload component', () => {
    mockAuthClient.getSession.mockResolvedValue({ data: { user: { id: 'test-user-id' } } });
    
    render(<EmailUpload />);
    
    expect(screen.getByText('title')).toBeInTheDocument();
    expect(screen.getByText('drag-and-drop')).toBeInTheDocument();
  });

  it('should handle file selection', async () => {
    mockAuthClient.getSession.mockResolvedValue({ data: { user: { id: 'test-user-id' } } });
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: 'File uploaded successfully' }),
    });

    render(<EmailUpload />);
    
    const fileInput = screen.getByTestId('file-input') as HTMLInputElement;
    const file = new File('test.eml', 'message/rfc822', 1024);
    
    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });
    
    fireEvent.change(fileInput);
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  it('should reject invalid file types', async () => {
    mockAuthClient.getSession.mockResolvedValue({ data: { user: { id: 'test-user-id' } } });
    
    render(<EmailUpload />);
    
    const fileInput = screen.getByTestId('file-input') as HTMLInputElement;
    const file = new File('test.txt', 'text/plain', 1024);
    
    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });
    
    fireEvent.change(fileInput);
    
    await waitFor(() => {
      expect(screen.getByText('invalid-file-type')).toBeInTheDocument();
    });
  });

  it('should reject files that are too large', async () => {
    mockAuthClient.getSession.mockResolvedValue({ data: { user: { id: 'test-user-id' } } });
    
    render(<EmailUpload />);
    
    // Create a file larger than 10MB (10 * 1024 * 1024 bytes)
    const file = new File('large-file.eml', 'message/rfc822', 15 * 1024 * 1024);
    const fileInput = screen.getByTestId('file-input') as HTMLInputElement;
    
    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });
    
    fireEvent.change(fileInput);
    
    await waitFor(() => {
      expect(screen.getByText('file-too-large')).toBeInTheDocument();
    });
  });

  it('should handle drag and drop events', () => {
    mockAuthClient.getSession.mockResolvedValue({ data: { user: { id: 'test-user-id' } } });
    
    render(<EmailUpload />);
    
    const dropZone = screen.getByTestId('drop-zone');
    
    fireEvent.dragOver(dropZone);
    expect(dropZone).toHaveClass('border-primary');
    
    fireEvent.dragLeave(dropZone);
    expect(dropZone).not.toHaveClass('border-primary');
  });
});