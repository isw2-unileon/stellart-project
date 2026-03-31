import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Contact from './Contact';
import * as apiService from '../service/apiService';

vi.mock('../service/apiService', () => ({
    submitContact: vi.fn()
}));

describe('Contact', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders all form fields', () => {
        render(<Contact />);
        
        expect(screen.getByPlaceholderText('Name')).toBeDefined();
        expect(screen.getByPlaceholderText('Title')).toBeDefined();
        expect(screen.getByPlaceholderText('How can we help?')).toBeDefined();
        expect(screen.getByText('Send message')).toBeDefined();
    });

    it('shows page title and description', () => {
        render(<Contact />);
        
        expect(screen.getByText('Contact')).toBeDefined();
        expect(screen.getByText("Found an issue? We're here to help.")).toBeDefined();
    });

    it('updates form fields on input', () => {
        render(<Contact />);
        
        const nameInput = screen.getByPlaceholderText('Name');
        const titleInput = screen.getByPlaceholderText('Title');
        const messageInput = screen.getByPlaceholderText('How can we help?');
        
        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        fireEvent.change(titleInput, { target: { value: 'Test Title' } });
        fireEvent.change(messageInput, { target: { value: 'Test message content' } });
        
        expect(nameInput.value).toBe('John Doe');
        expect(titleInput.value).toBe('Test Title');
        expect(messageInput.value).toBe('Test message content');
    });

    it('calls submitContact with form data on submit', async () => {
        apiService.submitContact.mockResolvedValue(undefined);
        render(<Contact />);
        
        fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByPlaceholderText('Title'), { target: { value: 'Bug Report' } });
        fireEvent.change(screen.getByPlaceholderText('How can we help?'), { target: { value: 'Found a bug' } });
        
        fireEvent.click(screen.getByText('Send message'));
        
        await waitFor(() => {
            expect(apiService.submitContact).toHaveBeenCalledWith({
                name: 'John Doe',
                title: 'Bug Report',
                message: 'Found a bug'
            });
        });
    });

    it('shows success state after successful submission', async () => {
        apiService.submitContact.mockResolvedValue(undefined);
        render(<Contact />);
        
        fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'John' } });
        fireEvent.change(screen.getByPlaceholderText('Title'), { target: { value: 'Title' } });
        fireEvent.change(screen.getByPlaceholderText('How can we help?'), { target: { value: 'Message' } });
        
        fireEvent.click(screen.getByText('Send message'));
        
        await waitFor(() => {
            expect(screen.getByText('Message sent!')).toBeDefined();
            expect(screen.getByText("We'll get back to you soon.")).toBeDefined();
        });
    });

    it('shows loading state while submitting', async () => {
        apiService.submitContact.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
        render(<Contact />);
        
        fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'John' } });
        fireEvent.change(screen.getByPlaceholderText('Title'), { target: { value: 'Title' } });
        fireEvent.change(screen.getByPlaceholderText('How can we help?'), { target: { value: 'Message' } });
        
        fireEvent.click(screen.getByText('Send message'));
        
        expect(screen.getByText('Sending...')).toBeDefined();
    });

    it('shows error state on submission failure', async () => {
        apiService.submitContact.mockRejectedValue(new Error('Failed'));
        render(<Contact />);
        
        fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'John' } });
        fireEvent.change(screen.getByPlaceholderText('Title'), { target: { value: 'Title' } });
        fireEvent.change(screen.getByPlaceholderText('How can we help?'), { target: { value: 'Message' } });
        
        fireEvent.click(screen.getByText('Send message'));
        
        await waitFor(() => {
            expect(screen.getByText('Failed to send. Please try again.')).toBeDefined();
        });
    });

    it('allows sending another message after success', async () => {
        apiService.submitContact.mockResolvedValue(undefined);
        render(<Contact />);
        
        fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'John' } });
        fireEvent.change(screen.getByPlaceholderText('Title'), { target: { value: 'Title' } });
        fireEvent.change(screen.getByPlaceholderText('How can we help?'), { target: { value: 'Message' } });
        
        fireEvent.click(screen.getByText('Send message'));
        
        await waitFor(() => {
            expect(screen.getByText('Message sent!')).toBeDefined();
        });
        
        fireEvent.click(screen.getByText('Send another message'));
        
        expect(screen.getByPlaceholderText('Name')).toBeDefined();
        expect(screen.getByText('Send message')).toBeDefined();
    });

    it('requires all fields', () => {
        render(<Contact />);
        
        const nameInput = screen.getByPlaceholderText('Name');
        const titleInput = screen.getByPlaceholderText('Title');
        const messageInput = screen.getByPlaceholderText('How can we help?');
        
        expect(nameInput.required).toBe(true);
        expect(titleInput.required).toBe(true);
        expect(messageInput.required).toBe(true);
    });
});
