import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Footer from '../components/layout/Footer';

function renderFooter() {
    return render(
        <MemoryRouter>
            <Footer />
        </MemoryRouter>
    );
}

describe('Footer', () => {
    it('renders the section headings', () => {
        renderFooter();
        expect(screen.getByText('Platform')).toBeDefined();
        expect(screen.getByText('Account')).toBeDefined();
    });

    it('renders the main navigation links', () => {
        renderFooter();
        expect(screen.getByRole('link', { name: 'Explore' })).toBeDefined();
        expect(screen.getByRole('link', { name: 'Commissions' })).toBeDefined();
        expect(screen.getByRole('link', { name: 'Find Artists' })).toBeDefined();
        expect(screen.getByRole('link', { name: 'Profile' })).toBeDefined();
        expect(screen.getByRole('link', { name: 'Wishlist' })).toBeDefined();
    });

    it('points links to the expected routes', () => {
        renderFooter();
        expect(screen.getByRole('link', { name: 'Explore' }).getAttribute('href')).toBe('/explore');
        expect(screen.getByRole('link', { name: 'Upload Artwork' }).getAttribute('href')).toBe('/profile/upload');
    });

    it('renders the current year in the copyright notice', () => {
        renderFooter();
        const year = new Date().getFullYear().toString();
        expect(screen.getByText(new RegExp(year))).toBeDefined();
    });
});
