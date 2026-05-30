import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AvatarDropdown from '../components/AvatarDropdwon';
import ProfileGallery from '../components/ProfileGallery';
import ImageUpload from '../components/UploadArtwork/ImageUpload';
import UploadInfo from '../components/UploadArtwork/UploadInfo';
import ExploreGallery from '../components/ExploreGallery';
import Header from '../components/layout/Header';

const apiMocks = vi.hoisted(() => ({
  getLoggedUser: vi.fn(),
  getProfile: vi.fn(),
  logoutUser: vi.fn(),
  getArtworksByArtist: vi.fn(),
  deleteArtwork: vi.fn(),
  deleteArtworkImage: vi.fn(),
  uploadImage: vi.fn(),
  getWishlist: vi.fn(),
  addToWishlist: vi.fn(),
  removeFromWishlist: vi.fn(),
  reportArtwork: vi.fn(),
  likeArtwork: vi.fn(),
  unlikeArtwork: vi.fn(),
  getTrendingArtworks: vi.fn(),
  getUserAddresses: vi.fn(),
  createOrder: vi.fn(),
}));

const toastMocks = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
}));

vi.mock('../service/apiService', () => apiMocks);
vi.mock('sonner', () => ({ toast: toastMocks }));
vi.mock('../components/PaymentModal', () => ({
  default: ({ open }) => (open ? <div>Payment Modal Mock</div> : null),
}));

describe('component coverage additions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiMocks.getLoggedUser.mockResolvedValue(null);
    apiMocks.getProfile.mockResolvedValue(null);
    apiMocks.getArtworksByArtist.mockResolvedValue([]);
    apiMocks.getTrendingArtworks.mockResolvedValue([]);
    apiMocks.getWishlist.mockResolvedValue([]);
    apiMocks.getUserAddresses.mockResolvedValue([]);
    apiMocks.uploadImage.mockResolvedValue('https://cdn/image.png');
    Object.defineProperty(URL, 'createObjectURL', {
      writable: true,
      value: vi.fn(() => 'blob:preview'),
    });
  });

  it('renders avatar dropdown for unauthenticated users', async () => {
    render(
      <MemoryRouter>
        <AvatarDropdown />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByRole('button')).toBeDefined());
    expect(screen.getByText('👤')).toBeDefined();
  });

  it('renders profile gallery empty state', async () => {
    render(<ProfileGallery profileId="artist-1" />);
    expect(await screen.findByText('No artworks available')).toBeDefined();
  });

  it('handles image upload selection', () => {
    const onFileSelect = vi.fn();
    const { container } = render(<ImageUpload onFileSelect={onFileSelect} />);
    const fileInput = container.querySelector('input[type="file"]');
    if (!fileInput) {
      throw new Error('file input not found');
    }
    const file = new File(['a'], 'test.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(onFileSelect).toHaveBeenCalled();
  });

  it('validates missing file on upload info submit', async () => {
    render(
      <MemoryRouter>
        <UploadInfo file={null} />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByPlaceholderText(/neo-tokyo night/i), {
      target: { value: 'Artwork' },
    });
    fireEvent.click(screen.getByRole('button', { name: /publish artwork/i }));
    await waitFor(() => {
      expect(toastMocks.error).toHaveBeenCalled();
    });
  });

  it('renders explore gallery placeholder cards when no data', async () => {
    render(
      <MemoryRouter>
        <ExploreGallery artworks={[]} />
      </MemoryRouter>
    );
    expect(await screen.findByText('Neon City')).toBeDefined();
  });

  it('renders register header variant on /login', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Header />
      </MemoryRouter>
    );
    expect(screen.getByText('STELLART')).toBeDefined();
  });

  it('renders general header login button for guests', async () => {
    render(
      <MemoryRouter initialEntries={['/explore']}>
        <Header />
      </MemoryRouter>
    );
    expect(await screen.findByText('Log in')).toBeDefined();
  });
});
