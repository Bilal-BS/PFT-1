
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

export function formatCurrency(amount, currency = 'LKR') {
    try {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2
        }).format(amount)
    } catch (e) {
        return `${currency} ${Number(amount).toFixed(2)}`
    }
}

/**
 * Advanced historical conversion logic.
 * It expects rates to be an array of objects with { from_currency, to_currency, rate, rate_date }
 * If targetDate is provided, it finds the rate active on that date.
 */
export function convertCurrency(amount, from, to, rates = [], targetDate = null) {
    if (from === to) return amount;
    if (!rates || rates.length === 0) return amount;

    const getLatestRate = (f, t, date) => {
        const list = rates.filter(r => r.from_currency === f && r.to_currency === t);
        if (list.length === 0) return null;

        if (date) {
            // Find the rate where rate_date <= targetDate, sorted by date DESC
            const sorted = list.filter(r => new Date(r.rate_date) <= new Date(date))
                .sort((a, b) => new Date(b.rate_date) - new Date(a.date));
            return sorted[0] || list[0]; // Fallback to any if no match for date
        }
        // Else just get the most recent one overall
        return list.sort((a, b) => new Date(b.rate_date) - new Date(a.date))[0];
    };

    const direct = getLatestRate(from, to, targetDate);
    if (direct) return amount * direct.rate;

    const inverse = getLatestRate(to, from, targetDate);
    if (inverse) return amount / inverse.rate;

    // Multi-hop via USD
    const fromToUsd = getLatestRate(from, 'USD', targetDate);
    const usdToTo = getLatestRate('USD', to, targetDate);
    if (fromToUsd && usdToTo) return (amount * fromToUsd.rate) * usdToTo.rate;

    // Inverse Multi-hop
    const usdToFrom = getLatestRate('USD', from, targetDate);
    if (usdToFrom && usdToTo) return (amount / usdToFrom.rate) * usdToTo.rate;

    return amount; // Absolute fallback
}

export const CURRENCIES = [
    { code: 'LKR', symbol: 'Rs.', name: 'Sri Lankan Rupee' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'AED', symbol: 'Dh', name: 'UAE Dirham' },
    { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
    { code: 'QAR', symbol: '﷼', name: 'Qatari Riyal' },
    { code: 'KWD', symbol: 'KD', name: 'Kuwaiti Dinar' },
    { code: 'OMR', symbol: '﷼', name: 'Omani Rial' },
    { code: 'BHD', symbol: '.د.ب', name: 'Bahraini Dinar' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
    { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
    { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
    { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
    { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
    { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
    { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
    { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
    { code: 'THB', symbol: '฿', name: 'Thai Baht' },
    { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
    { code: 'MVR', symbol: 'Rf', name: 'Maldivian Rufiyaa' },
]
