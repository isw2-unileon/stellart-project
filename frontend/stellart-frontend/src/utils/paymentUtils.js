export const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
};

export const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
        return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
};

export const validateCardNumber = (cardNumber) => {
    const cleaned = cardNumber.replace(/\s+/g, '');
    if (!/^\d{16}$/.test(cleaned)) return false;
    let sum = 0;
    let isEven = false;
    for (let i = cleaned.length - 1; i >= 0; i--) {
        let digit = parseInt(cleaned.charAt(i), 10);
        if (isEven) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        isEven = !isEven;
    }
    return sum % 10 === 0;
};

export const validateExpiry = (expiry) => {
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
    const [month, year] = expiry.split('/').map(Number);
    if (month < 1 || month > 12) return false;
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    if (year < currentYear || (year === currentYear && month < currentMonth)) return false;
    return true;
};

export const validateCVC = (cvc) => {
    return /^\d{3}$/.test(cvc);
};
