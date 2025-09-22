import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import EmailPreviewPage from '../page';

// Mock next/navigation
const mockRouter = {
  back: vi.fn(),
  push: vi.fn(),
  replace: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
  refresh: vi.fn(),
};

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/en/email-preview/test-file-id',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Download: () => <div data-testid="download-icon" />,
  ExternalLink: () => <div data-testid="external-link-icon" />,
  Monitor: () => <div data-testid="monitor-icon" />,
  Tablet: () => <div data-testid="tablet-icon" />,
  Smartphone: () => <div data-testid="smartphone-icon" />,
  ArrowLeft: () => <div data-testid="arrow-left-icon" />,
}));

// Mock authClient using factory function
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    getSession: vi.fn(),
  },
}));

// Mock fetch
const mockFetch = vi.fn();

global.fetch = mockFetch;

describe('EmailPreviewPage', () => {
  const { authClient } = require('@/lib/auth-client');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render loading state initially', () => {
    authClient.getSession.mockResolvedValue({ data: { user: { id: 'test-user-id' } } });
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ files: [] }),
    });

    render(<EmailPreviewPage params={{ fileId: 'test-file-id' }} />);
    
    expect(screen.getByText('title')).toBeInTheDocument();
  });

  it('should show file not found when file does not exist', async () => {
    authClient.getSession.mockResolvedValue({ data: { user: { id: 'test-user-id' } } });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ files: [] }),
    });

    render(<EmailPreviewPage params={{ fileId: 'non-existent-file-id' }} />);
    
    await waitFor(() => {
      expect(screen.getByText('file-not-found')).toBeInTheDocument();
    });
  });

  it('should render email preview when file exists', async () => {
    const mockFile = {
      id: 'test-file-id',
      filename: 'test.eml',
      fileType: 'eml',
      fileSize: 1024,
      createdAt: new Date().toISOString(),
    };

    authClient.getSession.mockResolvedValue({ data: { user: { id: 'test-user-id' } } });
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ files: [mockFile] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('Test email content'),
      });

    render(<EmailPreviewPage params={{ fileId: 'test-file-id' }} />);
    
    await waitFor(() => {
      expect(screen.getByText('test.eml')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText('Test email content')).toBeInTheDocument();
    });
  });

  it('should handle file content loading error', async () => {
    const mockFile = {
      id: 'test-file-id',
      filename: 'test.eml',
      fileType: 'eml',
      fileSize: 1024,
      createdAt: new Date().toISOString(),
    };

    authClient.getSession.mockResolvedValue({ data: { user: { id: 'test-user-id' } } });
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ files: [mockFile] }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Failed to fetch file content' }),
      });

    render(<EmailPreviewPage params={{ fileId: 'test-file-id' }} />);
    
    await waitFor(() => {
      expect(screen.getByText('content-fetch-error')).toBeInTheDocument();
    });
  });
});