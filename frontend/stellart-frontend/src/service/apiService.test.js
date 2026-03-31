import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSubmitContact = vi.hoisted(() => vi.fn());

vi.mock('./apiService', () => ({
    submitContact: mockSubmitContact,
    supabase: {},
    getLoggedUser: vi.fn(),
    registerUser: vi.fn(),
    loginUser: vi.fn(),
    logoutUser: vi.fn(),
}));

import { submitContact } from './apiService';

describe('apiService - submitContact', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('sends POST request with correct payload', async () => {
        mockSubmitContact.mockResolvedValueOnce(undefined);
        
        const formData = { name: 'John', title: 'Test', message: 'Hello' };
        await submitContact(formData);
        
        expect(mockSubmitContact).toHaveBeenCalledWith(formData);
    });

    it('throws error when submission fails', async () => {
        mockSubmitContact.mockRejectedValueOnce(new Error('Failed'));
        
        const formData = { name: 'John', title: 'Test', message: 'Hello' };
        
        await expect(submitContact(formData)).rejects.toThrow('Failed');
    });

    it('sends correct data structure', async () => {
        mockSubmitContact.mockResolvedValueOnce(undefined);
        
        const formData = {
            name: 'Jane Doe',
            title: 'Bug Report',
            message: 'Found a serious bug'
        };
        
        await submitContact(formData);
        
        expect(mockSubmitContact).toHaveBeenCalledWith({
            name: 'Jane Doe',
            title: 'Bug Report',
            message: 'Found a serious bug'
        });
    });

    it('handles empty fields correctly', async () => {
        mockSubmitContact.mockResolvedValueOnce(undefined);
        
        const formData = { name: '', title: '', message: '' };
        await submitContact(formData);
        
        expect(mockSubmitContact).toHaveBeenCalledWith({ name: '', title: '', message: '' });
    });
});
