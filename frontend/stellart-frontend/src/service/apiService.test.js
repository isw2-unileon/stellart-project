import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitContact } from './apiService';

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

describe('apiService - submitContact', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('sends POST request with correct payload', async () => {
        mockFetch.mockResolvedValueOnce({ ok: true });
        
        const formData = { name: 'John', title: 'Test', message: 'Hello' };
        await submitContact(formData);
        
        expect(mockFetch).toHaveBeenCalledWith(
            `${BACKEND_URL}/contact`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            }
        );
    });

    it('throws error when response is not ok', async () => {
        mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
        
        const formData = { name: 'John', title: 'Test', message: 'Hello' };
        
        await expect(submitContact(formData)).rejects.toThrow('Failed to submit contact form');
    });

    it('sends correct data structure', async () => {
        mockFetch.mockResolvedValueOnce({ ok: true });
        
        const formData = {
            name: 'Jane Doe',
            title: 'Bug Report',
            message: 'Found a serious bug'
        };
        
        await submitContact(formData);
        
        const callArgs = mockFetch.mock.calls[0];
        const sentBody = JSON.parse(callArgs[1].body);
        
        expect(sentBody).toEqual({
            name: 'Jane Doe',
            title: 'Bug Report',
            message: 'Found a serious bug'
        });
    });

    it('handles empty fields correctly', async () => {
        mockFetch.mockResolvedValueOnce({ ok: true });
        
        const formData = { name: '', title: '', message: '' };
        await submitContact(formData);
        
        expect(mockFetch).toHaveBeenCalled();
    });
});
