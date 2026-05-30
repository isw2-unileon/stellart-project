import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockConfirmCardPayment = vi.fn();
const mockGetElement = vi.fn().mockReturnValue({});

vi.mock('@stripe/stripe-js', () => ({
    loadStripe: vi.fn(() => Promise.resolve({})),
}));

vi.mock('@stripe/react-stripe-js', () => ({
    Elements: ({ children }) => <div>{children}</div>,
    CardNumberElement: (props) => <div data-testid="card-number-element" />,
    CardExpiryElement: (props) => <div data-testid="card-expiry-element" />,
    CardCvcElement: (props) => <div data-testid="card-cvc-element" />,
    useStripe: () => ({ confirmCardPayment: mockConfirmCardPayment }),
    useElements: () => ({ getElement: mockGetElement }),
}));

vi.mock('../service/apiService', () => ({
    createPaymentIntent: vi.fn(),
    supabase: null,
}));

vi.mock('sonner', () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
    },
}));

import PaymentModal from '../components/PaymentModal';
import { createPaymentIntent } from '../service/apiService';
import { toast } from 'sonner';

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
        expect(screen.getByTestId('card-number-element')).toBeDefined();
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

        const submitButton = screen.getByRole('button', { name: /Pay/ });
        expect(submitButton.textContent).toContain('150.50');
    });

    it('shows error when payment fails', async () => {
        createPaymentIntent.mockResolvedValue({ client_secret: 'test_secret' });
        mockConfirmCardPayment.mockResolvedValue({
            error: { message: 'Your card was declined.' },
        });

        render(<PaymentModal {...defaultProps} />);

        const submitButton = screen.getByRole('button', { name: /Pay/ });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Your card was declined.')).toBeDefined();
        });
        expect(mockOnFailure).toHaveBeenCalled();
    });

    it('calls onSuccess when payment succeeds', async () => {
        createPaymentIntent.mockResolvedValue({ client_secret: 'test_secret' });
        mockConfirmCardPayment.mockResolvedValue({
            paymentIntent: { id: 'pi_123', status: 'succeeded' },
        });

        render(<PaymentModal {...defaultProps} />);

        const submitButton = screen.getByRole('button', { name: /Pay/ });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockOnSuccess).toHaveBeenCalledWith({
                paymentIntentId: 'pi_123',
                amount: 99.00,
            });
        });
        expect(toast.success).toHaveBeenCalledWith('Payment successful!');
    });

    it('shows error when createPaymentIntent throws', async () => {
        createPaymentIntent.mockRejectedValue(new Error('Network error'));

        render(<PaymentModal {...defaultProps} />);

        const submitButton = screen.getByRole('button', { name: /Pay/ });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Network error')).toBeDefined();
        });
        expect(mockOnFailure).toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalledWith('Payment failed. Please try again.');
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

    it('displays Stripe test mode notice', () => {
        render(<PaymentModal {...defaultProps} />);
        
        expect(screen.getByText(/Powered by Stripe/)).toBeDefined();
    });
});
