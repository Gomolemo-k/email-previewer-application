import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EmailFileTable } from '../email-file-table';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ExternalLink: () => <div data-testid="external-link-icon" />,
  Minimize2: () => <div data-testid="minimize-icon" />,
  Maximize2: () => <div data-testid="maximize-icon" />,
  X: () => <div data-testid="close-icon" />,
  Trash2: () => <div data-testid="trash-icon" />,
}));

// Mock fetch
const mockFetch = vi.fn();

global.fetch = mockFetch;

// Mock window events
const mockAddEventListener = vi.spyOn(window, 'addEventListener');
const mockRemoveEventListener = vi.spyOn(window, 'removeEventListener');

describe('EmailFileTable', () => {
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

  it('should render loading state initially', () => {
    mockAuthClient.getSession.mockResolvedValue({ data: { user: { id: 'test-user-id' } } });
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ files: [] }),
    });

    render(<EmailFileTable />);
    
    expect(screen.getByText('title')).toBeInTheDocument();
  });

  it('should show empty state when no files exist', async () => {
    mockAuthClient.getSession.mockResolvedValue({ data: { user: { id: 'test-user-id' } } });
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ files: [] }),
    });

    render(<EmailFileTable />);
    
    await waitFor(() => {
      expect(screen.getByText('no-files')).toBeInTheDocument();
    });
  });

  it('should render file table when files exist', async () => {
    const mockFiles = [
      {
        id: 'file-1',
        filename: 'test1.eml',
        fileType: 'eml',
        fileSize: 1024,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'file-2',
        filename: 'test2.html',
        fileType: 'html',
        fileSize: 2048,
        createdAt: new Date().toISOString(),
      },
    ];

    mockAuthClient.getSession.mockResolvedValue({ data: { user: { id: 'test-user-id' } } });
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ files: mockFiles }),
    });

    render(<EmailFileTable />);
    
    await waitFor(() => {
      expect(screen.getByText('test1.eml')).toBeInTheDocument();
    });
    
    expect(screen.getByText('test2.html')).toBeInTheDocument();
    expect(screen.getByText('EML')).toBeInTheDocument();
    expect(screen.getByText('HTML')).toBeInTheDocument();
  });

  it('should handle file deletion', async () => {
    const mockFiles = [
      {
        id: 'file-to-delete',
        filename: 'test.eml',
        fileType: 'eml',
        fileSize: 1024,
        createdAt: new Date().toISOString(),
      },
    ];

    mockAuthClient.getSession.mockResolvedValue({ data: { user: { id: 'test-user-id' } } });
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ files: mockFiles }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'File deleted successfully' }),
      });

    render(<EmailFileTable />);
    
    await waitFor(() => {
      expect(screen.getByText('test.eml')).toBeInTheDocument();
    });
    
    const deleteButton = screen.getByTestId('trash-icon').closest('button');
    if (deleteButton) {
      fireEvent.click(deleteButton);
    }
    
    await waitFor(() => {
      expect(screen.queryByText('test.eml')).not.toBeInTheDocument();
    });
  });

  it('should handle file deletion error', async () => {
    const mockFiles = [
      {
        id: 'file-to-delete',
        filename: 'test.eml',
        fileType: 'eml',
        fileSize: 1024,
        createdAt: new Date().toISOString(),
      },
    ];

    mockAuthClient.getSession.mockResolvedValue({ data: { user: { id: 'test-user-id' } } });
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ files: mockFiles }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Failed to delete file' }),
      });

    render(<EmailFileTable />);
    
    await waitFor(() => {
      expect(screen.getByText('test.eml')).toBeInTheDocument();
    });
    
    const deleteButton = screen.getByTestId('trash-icon').closest('button');
    if (deleteButton) {
      fireEvent.click(deleteButton);
    }
    
    // The file should still be in the table since deletion failed
    await waitFor(() => {
      expect(screen.getByText('test.eml')).toBeInTheDocument();
    });
  });
});