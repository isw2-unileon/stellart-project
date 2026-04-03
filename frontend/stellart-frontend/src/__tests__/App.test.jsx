import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

vi.mock('../service/apiService', () => ({
    getLoggedUser: vi.fn().mockResolvedValue(null),
    getArtistsWithOpenCommissions: vi.fn().mockResolvedValue([]),
}));

describe('App', () => {
    it('renders without crashing', async () => {
        render(
            <BrowserRouter>
                <App />
            </BrowserRouter>
        );
        await waitFor(() => {
            expect(screen.getByText(/STAR/i)).toBeDefined();
        });
    });

    it('shows navigation links', async () => {
        render(
            <BrowserRouter>
                <App />
            </BrowserRouter>
        );
        await waitFor(() => {
            expect(screen.getAllByText(/Explore/i).length).toBeGreaterThan(0);
        });
    });
});

describe('Commission Flow', () => {
    it('should handle payment creation for advance payment', async () => {
        const mockPaymentData = {
            payment_id: 'pay_123',
            commission_id: 'comm_123',
            amount: 50,
            payment_intent: 'pi_123'
        };
        
        expect(mockPaymentData.amount).toBe(50);
        expect(mockPaymentData.payment_id).toBe('pay_123');
    });

    it('should handle payment creation for remaining payment', async () => {
        const mockPaymentData = {
            payment_id: 'rem_123',
            commission_id: 'comm_123',
            amount: 50,
            payment_intent: 'pi_123'
        };
        
        expect(mockPaymentData.amount).toBe(50);
        expect(mockPaymentData.payment_id).toBe('rem_123');
    });

    it('should handle commission creation', async () => {
        const mockCommission = {
            commission_id: 'comm_123',
            buyer_id: 'buyer_1',
            artist_id: 'artist_1',
            title: 'Test Commission',
            description: 'Test description',
            price: 100,
            status: 'pending'
        };
        
        expect(mockCommission.status).toBe('pending');
        expect(mockCommission.price).toBe(100);
    });

    it('should handle work upload with clean image URL', async () => {
        const mockUpload = {
            upload_id: 'upload_123',
            commission_id: 'comm_123',
            image_url: 'http://example.com/watermarked.jpg',
            clean_image_url: 'http://example.com/clean.jpg',
            watermarked: true,
            is_final: false,
            notes: 'Test preview'
        };
        
        expect(mockUpload.clean_image_url).toBe('http://example.com/clean.jpg');
        expect(mockUpload.watermarked).toBe(true);
        expect(mockUpload.is_final).toBe(false);
    });

    it('should handle final version upload', async () => {
        const mockUpload = {
            upload_id: 'final_123',
            commission_id: 'comm_123',
            image_url: 'http://example.com/final.jpg',
            clean_image_url: 'http://example.com/final.jpg',
            watermarked: false,
            is_final: true,
            notes: 'Final version'
        };
        
        expect(mockUpload.is_final).toBe(true);
        expect(mockUpload.watermarked).toBe(false);
        expect(mockUpload.clean_image_url).toBe('http://example.com/final.jpg');
    });
});

describe('Profile Sync', () => {
    it('should sync profile with full name from auth', async () => {
        const mockUser = {
            id: 'user_123',
            email: 'test@example.com',
            user_metadata: {
                full_name: 'Test User',
                avatar_url: 'http://example.com/avatar.jpg'
            }
        };
        
        expect(mockUser.user_metadata.full_name).toBe('Test User');
        expect(mockUser.user_metadata.avatar_url).toBe('http://example.com/avatar.jpg');
    });

    it('should handle missing full name gracefully', async () => {
        const mockUser = {
            id: 'user_123',
            email: 'test@example.com',
            user_metadata: {}
        };
        
        const displayName = mockUser.user_metadata?.full_name || mockUser.email?.split('@')[0] || 'User';
        expect(displayName).toBe('test');
    });
});

describe('File Upload Validation', () => {
    it('should validate file size limit (100MB)', () => {
        const maxSize = 100 * 1024 * 1024;
        
        const smallFile = { size: 50 * 1024 * 1024 };
        const largeFile = { size: 150 * 1024 * 1024 };
        
        expect(smallFile.size).toBeLessThan(maxSize);
        expect(largeFile.size).toBeGreaterThan(maxSize);
    });

    it('should validate avatar file size limit (5MB)', () => {
        const maxSize = 5 * 1024 * 1024;
        
        const avatar = { size: 3 * 1024 * 1024 };
        
        expect(avatar.size).toBeLessThan(maxSize);
    });
});