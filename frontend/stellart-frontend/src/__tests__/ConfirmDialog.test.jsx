import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmDialog from '../components/ConfirmDialog';

describe('ConfirmDialog', () => {
    const defaultProps = {
        open: true,
        onOpenChange: vi.fn(),
        title: 'Test Title',
        description: 'Test Description',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        onConfirm: vi.fn()
    };

    it('renders nothing when open is false', () => {
        const { container } = render(
            <ConfirmDialog {...defaultProps} open={false} />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders with title and description', () => {
        render(<ConfirmDialog {...defaultProps} />);
        
        expect(screen.getByText('Test Title')).toBeDefined();
        expect(screen.getByText('Test Description')).toBeDefined();
    });

    it('renders confirm and cancel buttons with correct text', () => {
        render(<ConfirmDialog {...defaultProps} />);
        
        expect(screen.getByText('Confirm')).toBeDefined();
        expect(screen.getByText('Cancel')).toBeDefined();
    });

    it('calls onOpenChange with false when cancel is clicked', () => {
        const onOpenChange = vi.fn();
        render(
            <ConfirmDialog 
                {...defaultProps} 
                onOpenChange={onOpenChange} 
            />
        );
        
        fireEvent.click(screen.getByText('Cancel'));
        
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('calls onConfirm when confirm is clicked', () => {
        const onConfirm = vi.fn();
        const onOpenChange = vi.fn();
        render(
            <ConfirmDialog 
                {...defaultProps} 
                onConfirm={onConfirm}
                onOpenChange={onOpenChange}
            />
        );
        
        fireEvent.click(screen.getByText('Confirm'));
        
        expect(onConfirm).toHaveBeenCalled();
    });

    it('calls onOpenChange when confirm is clicked', () => {
        const onConfirm = vi.fn();
        const onOpenChange = vi.fn();
        render(
            <ConfirmDialog 
                {...defaultProps} 
                onConfirm={onConfirm}
                onOpenChange={onOpenChange}
            />
        );
        
        fireEvent.click(screen.getByText('Confirm'));
        
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('uses custom confirm and cancel text', () => {
        render(
            <ConfirmDialog 
                {...defaultProps} 
                confirmText="Yes, do it"
                cancelText="No, go back"
            />
        );
        
        expect(screen.getByText('Yes, do it')).toBeDefined();
        expect(screen.getByText('No, go back')).toBeDefined();
    });
});
