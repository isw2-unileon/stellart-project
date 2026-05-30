import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import FindArtists from '../pages/FindArtists';
import OpenCommissions from '../pages/OpenCommissions';
import Commissions from '../pages/Commissions';
import Explore from '../pages/Explore';
import ShippingAddresses from '../pages/ShippingAddresses';
import Orders from '../pages/Orders';
import Wishlist from '../pages/Wishlist';
import Profile from '../pages/Profile';
import ArtworkDetails from '../pages/ArtworkDetails';
import StartCommission from '../pages/StartCommission';

const apiMocks = vi.hoisted(() => ({
  loginUser: vi.fn(),
  registerUser: vi.fn(),
  getLoggedUser: vi.fn(),
  getArtistRanking: vi.fn(),
  getArtistsWithOpenCommissions: vi.fn(),
  getProfile: vi.fn(),
  updateOpenCommissions: vi.fn(),
  getBuyerCommissions: vi.fn(),
  getArtistCommissions: vi.fn(),
  searchArtworks: vi.fn(),
  createAddress: vi.fn(),
  getAddresses: vi.fn(),
  updateAddress: vi.fn(),
  deleteAddress: vi.fn(),
  getOrders: vi.fn(),
  shipOrder: vi.fn(),
  deliverOrder: vi.fn(),
  getArtwork: vi.fn(),
  getWishlist: vi.fn(),
  removeFromWishlist: vi.fn(),
  reportArtwork: vi.fn(),
  likeArtwork: vi.fn(),
  unlikeArtwork: vi.fn(),
  getMasterSkills: vi.fn(),
  getProfileSkills: vi.fn(),
  updateProfileAndSkills: vi.fn(),
  uploadAvatar: vi.fn(),
  addToWishlist: vi.fn(),
  getUserAddresses: vi.fn(),
  createOrder: vi.fn(),
  createCommission: vi.fn(),
  createAdvancePayment: vi.fn(),
  markPaymentPaid: vi.fn(),
}));

const toastMocks = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
  info: vi.fn(),
}));

vi.mock('../service/apiService', () => apiMocks);
vi.mock('sonner', () => ({ toast: toastMocks }));
vi.mock('../components/PaymentModal', () => ({
  default: ({ open }) => (open ? <div>Payment Modal Mock</div> : null),
}));
vi.mock('../components/ExploreGallery', () => ({
  default: () => <div>Explore Gallery Mock</div>,
}));
vi.mock('../components/ProfileGallery', () => ({
  default: () => <div>Profile Gallery Mock</div>,
}));
vi.mock('gsap', () => ({
  gsap: {
    to: vi.fn(() => ({ pause: vi.fn(), play: vi.fn(), kill: vi.fn() })),
  },
}));

function renderAt(path, element, routePath = path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={routePath} element={element} />
      </Routes>
    </MemoryRouter>
  );
}

describe('pages coverage additions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiMocks.getLoggedUser.mockResolvedValue({ id: 'u1', email: 'u1@test.com', user_metadata: { full_name: 'User One' } });
    apiMocks.getArtistRanking.mockResolvedValue([]);
    apiMocks.getArtistsWithOpenCommissions.mockResolvedValue([]);
    apiMocks.getProfile.mockResolvedValue({ id: 'u2', full_name: 'Artist Two', open_commissions: true });
    apiMocks.getBuyerCommissions.mockResolvedValue([]);
    apiMocks.getArtistCommissions.mockResolvedValue([]);
    apiMocks.searchArtworks.mockResolvedValue([]);
    apiMocks.getAddresses.mockResolvedValue([]);
    apiMocks.getOrders.mockResolvedValue([]);
    apiMocks.getArtwork.mockResolvedValue(null);
    apiMocks.getWishlist.mockResolvedValue([]);
    apiMocks.getMasterSkills.mockResolvedValue([]);
    apiMocks.getProfileSkills.mockResolvedValue([]);
    apiMocks.getUserAddresses.mockResolvedValue([]);
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: vi.fn(() => '[]'),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      configurable: true,
    });
  });

  it('renders Login page', () => {
    renderAt('/login', <Login />, '/login');
    expect(screen.getByText('Log in')).toBeDefined();
  });

  it('renders Register and validates password mismatch', async () => {
    renderAt('/register', <Register />, '/register');
    fireEvent.change(screen.getByPlaceholderText('Full Name'), { target: { value: 'User One' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'a' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: 'b' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => expect(toastMocks.error).toHaveBeenCalled());
  });

  it('renders FindArtists page', async () => {
    renderAt('/find-artists', <FindArtists />, '/find-artists');
    expect(await screen.findByText('Artists')).toBeDefined();
  });

  it('renders OpenCommissions page', async () => {
    renderAt('/commissions/open', <OpenCommissions />, '/commissions/open');
    expect(await screen.findByText('Commission Settings')).toBeDefined();
  });

  it('renders Commissions page', async () => {
    renderAt('/commissions', <Commissions />, '/commissions');
    expect(await screen.findByText('My Commissions')).toBeDefined();
  });

  it('renders Explore page and handles empty search', async () => {
    renderAt('/explore', <Explore />, '/explore');
    fireEvent.click(await screen.findByRole('button'));
    await waitFor(() => expect(toastMocks.error).toHaveBeenCalled());
  });

  it('renders ShippingAddresses page', async () => {
    renderAt('/shipping', <ShippingAddresses />, '/shipping');
    expect(await screen.findByText('Shipping Addresses')).toBeDefined();
  });

  it('renders Orders page', async () => {
    renderAt('/orders', <Orders />, '/orders');
    expect(await screen.findByText('Orders')).toBeDefined();
  });

  it('renders Wishlist page', async () => {
    renderAt('/wishlist', <Wishlist />, '/wishlist');
    expect(await screen.findByText('My Wishlist')).toBeDefined();
  });

  it('renders Profile page', async () => {
    apiMocks.getMasterSkills.mockResolvedValue([{ id: 's1', name: 'Painting' }]);
    apiMocks.getProfileSkills.mockResolvedValue([{ skill_id: 's1', level: 2 }]);
    renderAt('/profile', <Profile />, '/profile');
    expect(await screen.findByText('Profile Gallery Mock')).toBeDefined();
  });

  it('renders ArtworkDetails not found state', async () => {
    renderAt('/artwork-details/a1', <ArtworkDetails />, '/artwork-details/:id');
    expect(await screen.findByText('Artwork not found')).toBeDefined();
  });

  it('renders StartCommission page', async () => {
    apiMocks.getProfile.mockResolvedValue({ id: 'artist-1', full_name: 'Artist One' });
    renderAt('/commission/start/artist-1', <StartCommission />, '/commission/start/:artistId');
    expect(await screen.findByText('Request Commission')).toBeDefined();
  });
});
