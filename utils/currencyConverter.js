const axios = require('axios');

const FIXER_API_KEY = process.env.FIXER_API_KEY;
const FIXER_URL = `https://data.fixer.io/api/latest?access_key=${FIXER_API_KEY}`;

async function convertCurrency(amount, fromCurrency, toCurrency) {
    try {
        const response = await axios.get(FIXER_URL);

        if (!response.data.success) {
            throw new Error('Failed to fetch exchange rates');
        }

        const rates = response.data.rates;

        if (!rates[fromCurrency] || !rates[toCurrency]) {
            throw new Error('Invalid currency provided.');
        }

        // Convert amount from source currency to EUR (base), then to target currency
        const amountInEUR = amount / rates[fromCurrency];
        const convertedAmount = amountInEUR * rates[toCurrency];

        return convertedAmount;

    } catch (error) {
        console.error('Currency conversion error:', error.message);
        throw error;
    }
};

module.exports = convertCurrency;
