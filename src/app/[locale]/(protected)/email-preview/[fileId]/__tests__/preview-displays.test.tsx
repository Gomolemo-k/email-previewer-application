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
  Laptop: () => <div data-testid="laptop-icon" />,
  MonitorSpeaker: () => <div data-testid="monitor-speaker-icon" />,
}));

// Mock authClient using factory function
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    getSession: vi.fn(),
    useSession: vi.fn(() => ({ data: { user: { id: 'test-user-id' } } })),
  },
}));

// Mock fetch
const mockFetch = vi.fn();

global.fetch = mockFetch;

describe('EmailPreviewPage - Preview Displays', () => {
  const { authClient } = require('@/lib/auth-client');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render HTML email preview with device frames', async () => {
    const mockFile = {
      id: 'test-file-id',
      filename: 'test.html',
      fileType: 'html',
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
        text: () => Promise.resolve('<h1>Test Email Content</h1>'),
      });

    render(<EmailPreviewPage params={{ fileId: 'test-file-id' }} />);

    // Wait for the content to load
    await waitFor(() => {
      expect(screen.getByText('test.html')).toBeInTheDocument();
    });

    // Check that device selection options are displayed
    await waitFor(() => {
      expect(screen.getByText('select-devices')).toBeInTheDocument();
    });
  });

  it('should render EML email preview with scrollable area', async () => {
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
        text: () => Promise.resolve('From: test@example.com\nTo: user@example.com\nSubject: Test Email\n\nThis is a test email.'),
      });

    render(<EmailPreviewPage params={{ fileId: 'test-file-id' }} />);

    // Wait for the content to load
    await waitFor(() => {
      expect(screen.getByText('test.eml')).toBeInTheDocument();
    });

    // Check that device selection options are displayed
    await waitFor(() => {
      expect(screen.getByText('select-devices')).toBeInTheDocument();
    });
  });

  it('should render preview for selected devices', async () => {
    const mockFile = {
      id: 'test-file-id',
      filename: 'test.html',
      fileType: 'html',
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
        text: () => Promise.resolve('<h1>Test Email Content</h1>'),
      });

    render(<EmailPreviewPage params={{ fileId: 'test-file-id' }} />);

    // Wait for the content to load
    await waitFor(() => {
      expect(screen.getByText('test.html')).toBeInTheDocument();
    });
  });
});