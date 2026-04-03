import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PaymentModal from '../components/PaymentModal';

vi.mock('sonner', () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
    },
}));

describe('PaymentModal', () => {
    const mockOnClose = vi.fn();
    const mockOnSuccess = vi.fn();
    const mockOnFailure = vi.fn();

    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        item: { title: 'Test Art', artist: '@test', img: 'test.jpg' },
        amount: 99.00,
        onSuccess: mockOnSuccess,
        onFailure: mockOnFailure,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders modal when isOpen is true', () => {
        render(<PaymentModal {...defaultProps} />);
        
        expect(screen.getByText('Secure Checkout')).toBeDefined();
        expect(screen.getByPlaceholderText('4111 1111 1111 1111')).toBeDefined();
    });

    it('does not render modal when isOpen is false', () => {
        render(<PaymentModal {...defaultProps} isOpen={false} />);
        
        expect(screen.queryByText('Secure Checkout')).toBeNull();
    });

    it('displays item information', () => {
        render(<PaymentModal {...defaultProps} />);
        
        expect(screen.getByText('Test Art')).toBeDefined();
        expect(screen.getByText('@test')).toBeDefined();
    });

    it('displays correct amount in pay button', () => {
        render(<PaymentModal {...defaultProps} amount={150.50} />);
        
        expect(screen.getByText('Pay $150.50')).toBeDefined();
    });

    it('shows validation errors for empty fields', async () => {
        render(<PaymentModal {...defaultProps} />);
        
        const payButton = screen.getByText('Pay $99.00');
        fireEvent.click(payButton);
        
        await waitFor(() => {
            expect(screen.getByText('Card number is required')).toBeDefined();
            expect(screen.getByText('Expiry date is required')).toBeDefined();
            expect(screen.getByText('CVC is required')).toBeDefined();
        });
    });

    it('shows validation error for invalid card number', async () => {
        render(<PaymentModal {...defaultProps} />);
        
        const cardInput = screen.getByPlaceholderText('4111 1111 1111 1111');
        await userEvent.type(cardInput, '1234567890123456');
        
        const payButton = screen.getByText('Pay $99.00');
        fireEvent.click(payButton);
        
        await waitFor(() => {
            expect(screen.getByText('Invalid card number')).toBeDefined();
        });
    });

    it('shows validation error for invalid expiry', async () => {
        render(<PaymentModal {...defaultProps} />);
        
        const expiryInput = screen.getByPlaceholderText('MM/YY');
        await userEvent.type(expiryInput, '13/28');
        
        const payButton = screen.getByText('Pay $99.00');
        fireEvent.click(payButton);
        
        await waitFor(() => {
            expect(screen.getByText('Invalid or expired date')).toBeDefined();
        });
    });

    it('shows validation error for invalid CVC', async () => {
        render(<PaymentModal {...defaultProps} />);
        
        const cvcInput = screen.getByPlaceholderText('123');
        await userEvent.type(cvcInput, '12');
        
        const payButton = screen.getByText('Pay $99.00');
        fireEvent.click(payButton);
        
        await waitFor(() => {
            expect(screen.getByText('Invalid CVC')).toBeDefined();
        });
    });

    it('closes modal on close button click', () => {
        render(<PaymentModal {...defaultProps} />);
        
        const closeButton = screen.getByRole('button', { name: '' });
        fireEvent.click(closeButton);
        
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('displays default secure checkout title', () => {
        render(<PaymentModal {...defaultProps} />);
        
        expect(screen.getByText('Secure Checkout')).toBeDefined();
    });

    it('displays correct title for advance payment', () => {
        render(<PaymentModal {...defaultProps} paymentType="advance" />);
        
        expect(screen.getByText('Pay Advance (50%)')).toBeDefined();
    });

    it('displays correct title for remaining payment', () => {
        render(<PaymentModal {...defaultProps} paymentType="remaining" />);
        
        expect(screen.getByText('Pay Remaining Balance')).toBeDefined();
    });

    it('displays demo notice', () => {
        render(<PaymentModal {...defaultProps} />);
        
        expect(screen.getByText(/No real payment is processed/)).toBeDefined();
    });
});
