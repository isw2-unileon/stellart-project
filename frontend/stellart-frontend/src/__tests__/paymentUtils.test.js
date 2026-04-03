import { describe, it, expect } from 'vitest';
import {
    formatCardNumber,
    formatExpiry,
    validateCardNumber,
    validateExpiry,
    validateCVC
} from '../utils/paymentUtils';

describe('paymentUtils', () => {
    describe('formatCardNumber', () => {
        it('formats card number with spaces every 4 digits', () => {
            expect(formatCardNumber('4111111111111111')).toBe('4111 1111 1111 1111');
        });

        it('handles already formatted card number', () => {
            expect(formatCardNumber('4111 1111 1111 1111')).toBe('4111 1111 1111 1111');
        });

        it('removes non-digit characters', () => {
            expect(formatCardNumber('4111-1111-1111-1111')).toBe('4111 1111 1111 1111');
        });

        it('handles partial input', () => {
            expect(formatCardNumber('4111')).toBe('4111');
            expect(formatCardNumber('411111')).toBe('4111 11');
        });

        it('handles empty input', () => {
            expect(formatCardNumber('')).toBe('');
        });

        it('handles input with letters only', () => {
            expect(formatCardNumber('abcd')).toBe('abcd');
        });
    });

    describe('formatExpiry', () => {
        it('adds slash after 2 digits', () => {
            expect(formatExpiry('12')).toBe('12/');
            expect(formatExpiry('1228')).toBe('12/28');
        });

        it('removes non-digit characters', () => {
            expect(formatExpiry('12/28')).toBe('12/28');
            expect(formatExpiry('12-28')).toBe('12/28');
        });

        it('handles empty input', () => {
            expect(formatExpiry('')).toBe('');
        });

        it('handles single digit', () => {
            expect(formatExpiry('1')).toBe('1');
        });
    });

    describe('validateCardNumber', () => {
        it('validates correct card numbers', () => {
            expect(validateCardNumber('4111111111111111')).toBe(true);
            expect(validateCardNumber('4532015112830366')).toBe(true);
            expect(validateCardNumber('5425233430109903')).toBe(true);
        });

        it('rejects invalid card numbers', () => {
            expect(validateCardNumber('4111111111111112')).toBe(false);
            expect(validateCardNumber('1234567890123456')).toBe(false);
        });

        it('rejects card numbers with wrong length', () => {
            expect(validateCardNumber('411111111111111')).toBe(false);
            expect(validateCardNumber('41111111111111111')).toBe(false);
            expect(validateCardNumber('4111111111')).toBe(false);
        });

        it('validates only digit strings', () => {
            expect(validateCardNumber('4111111111111111')).toBe(true);
        });

        it('rejects empty input', () => {
            expect(validateCardNumber('')).toBe(false);
        });
    });

    describe('validateExpiry', () => {
        it('validates future dates', () => {
            expect(validateExpiry('12/28')).toBe(true);
            expect(validateExpiry('12/30')).toBe(true);
        });

        it('rejects past dates', () => {
            expect(validateExpiry('01/20')).toBe(false);
        });

        it('rejects invalid months', () => {
            expect(validateExpiry('13/28')).toBe(false);
            expect(validateExpiry('00/28')).toBe(false);
        });

        it('rejects invalid format', () => {
            expect(validateExpiry('1228')).toBe(false);
            expect(validateExpiry('12-28')).toBe(false);
            expect(validateExpiry('12/2')).toBe(false);
            expect(validateExpiry('1/28')).toBe(false);
        });

        it('rejects empty input', () => {
            expect(validateExpiry('')).toBe(false);
        });
    });

    describe('validateCVC', () => {
        it('validates 3-digit CVC', () => {
            expect(validateCVC('123')).toBe(true);
            expect(validateCVC('000')).toBe(true);
            expect(validateCVC('999')).toBe(true);
        });

        it('rejects invalid CVC', () => {
            expect(validateCVC('12')).toBe(false);
            expect(validateCVC('1234')).toBe(false);
            expect(validateCVC('abc')).toBe(false);
        });

        it('rejects empty input', () => {
            expect(validateCVC('')).toBe(false);
        });
    });
});
