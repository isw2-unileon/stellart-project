import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button, buttonVariants } from '../components/ui/button';

describe('Button', () => {
    it('renders its children', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByText('Click me')).toBeDefined();
    });

    it('renders as a <button> element by default', () => {
        render(<Button>Default</Button>);
        expect(screen.getByRole('button')).toBeDefined();
    });

    it('calls the click handler when clicked', () => {
        const onClick = vi.fn();
        render(<Button onClick={onClick}>Press</Button>);
        fireEvent.click(screen.getByText('Press'));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('applies variant classes from buttonVariants', () => {
        render(<Button variant="destructive">Danger</Button>);
        const btn = screen.getByRole('button');
        expect(btn.className).toContain('bg-destructive');
    });

    it('applies size classes', () => {
        render(<Button size="sm">Small</Button>);
        const btn = screen.getByRole('button');
        expect(btn.className).toContain('h-8');
    });

    it('merges a custom className', () => {
        render(<Button className="custom-class">Custom</Button>);
        expect(screen.getByRole('button').className).toContain('custom-class');
    });

    it('is disabled when the disabled prop is set', () => {
        render(<Button disabled>Disabled</Button>);
        expect(screen.getByRole('button').disabled).toBe(true);
    });

    it('renders the child element when asChild is true', () => {
        render(
            <Button asChild>
                <a href="/somewhere">Link button</a>
            </Button>
        );
        const link = screen.getByRole('link', { name: 'Link button' });
        expect(link).toBeDefined();
        expect(link.getAttribute('href')).toBe('/somewhere');
    });

    it('buttonVariants returns a class string', () => {
        expect(typeof buttonVariants({ variant: 'outline' })).toBe('string');
    });
});
