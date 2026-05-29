import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SkillBar from '../components/SkillBar';

describe('SkillBar', () => {
    it('renders the label', () => {
        render(<SkillBar label="Drawing" />);
        expect(screen.getByText('Drawing')).toBeDefined();
    });

    it('uses the default initial value of 50', () => {
        render(<SkillBar label="Drawing" />);
        expect(screen.getByText('50/100')).toBeDefined();
    });

    it('respects a provided initial value', () => {
        render(<SkillBar label="Painting" initialValue={80} />);
        expect(screen.getByText('80/100')).toBeDefined();
    });

    it('updates the displayed value when the slider changes', () => {
        render(<SkillBar label="Sketching" initialValue={20} />);
        const slider = screen.getByRole('slider');
        fireEvent.change(slider, { target: { value: '65' } });
        expect(screen.getByText('65/100')).toBeDefined();
    });

    it('calls onChange with the label and new value', () => {
        const onChange = vi.fn();
        render(<SkillBar label="Inking" initialValue={10} onChange={onChange} />);
        const slider = screen.getByRole('slider');
        fireEvent.change(slider, { target: { value: '42' } });
        expect(onChange).toHaveBeenCalledWith('Inking', 42);
    });

    it('does not throw when onChange is not provided', () => {
        render(<SkillBar label="Coloring" />);
        const slider = screen.getByRole('slider');
        expect(() => fireEvent.change(slider, { target: { value: '30' } })).not.toThrow();
    });
});
