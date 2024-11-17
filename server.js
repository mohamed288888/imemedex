const express = require('express');
const cors = require('cors');
const fetch = require('cross-fetch'); // لإرسال طلبات HTTP
const { Connection } = require('@solana/web3.js');
const dotenv = require('dotenv');
const path = require('path'); // لإدارة الملفات الثابتة

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'https://www.imeme.app',
  methods: ['GET', 'POST'],
  credentials: true,
}));

// إعداد اتصال Solana
const connection = new Connection(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com');

// Function to get a quote
const getQuote = async (inputMint, outputMint, amount, slippageBps) => {
  try {
    console.log('Requesting quote with:', { inputMint, outputMint, amount, slippageBps });
    const response = await fetch(
      `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const quoteResponse = await response.json();
    console.log('Quote Response:', JSON.stringify(quoteResponse, null, 2));

    if (!quoteResponse) {
      throw new Error('Quote not found: response is empty');
    }

    return quoteResponse; // Return the entire quoteResponse
  } catch (error) {
    console.error('Error in getQuote:', error);
    throw error;
  }
};

// Function to get swap transaction
const getSwapTransaction = async (quoteResponse, userPublicKey, wrapAndUnwrapSol = true) => {
  try {
    console.log('Requesting swap transaction with:', { quoteResponse, userPublicKey });
    const response = await fetch('https://quote-api.jup.ag/v6/swap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        quoteResponse,
        userPublicKey,
        wrapAndUnwrapSol,
        feeAccount: null, // Add fee account if needed
      }),
    });

    const responseBody = await response.text();

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${responseBody}`);
    }

    const swapResponse = JSON.parse(responseBody);
    console.log('Swap Response:', JSON.stringify(swapResponse, null, 2));

    if (!swapResponse.swapTransaction) {
      throw new Error('Swap transaction could not be created. Please check the swap details and try again.');
    }

    return swapResponse;
  } catch (error) {
    console.error('Error in getSwapTransaction:', error);
    throw error;
  }
};

// API endpoint to handle quotes and swaps
app.post('/quote', async (req, res) => {
  try {
    console.log('Received quote request:', req.body);
    const { inputMint, outputMint, amount, slippageBps, userPublicKey } = req.body;

    const missingParams = [];
    if (!inputMint) missingParams.push('inputMint');
    if (!outputMint) missingParams.push('outputMint');
    if (!amount) missingParams.push('amount');
    if (slippageBps === undefined) missingParams.push('slippageBps');
    if (!userPublicKey) missingParams.push('userPublicKey');

    if (missingParams.length > 0) {
      return res.status(400).json({ error: `Missing required parameters: ${missingParams.join(', ')}` });
    }

    // Get quote
    const quoteResponse = await getQuote(inputMint, outputMint, amount, slippageBps);

    // Get swap transaction
    const swapResponse = await getSwapTransaction(quoteResponse, userPublicKey);

    res.json(swapResponse);
  } catch (error) {
    console.error('Error during quote:', error);
    res.status(500).json({ error: error.message });
  }
});

// مسار لاختبار الخادم
app.get('/ping', (req, res) => {
  res.status(200).send('Pong');
});

// إعداد خدمة الملفات الثابتة (واجهة React الأمامية)
app.use(express.static(path.join(__dirname, 'frontend', 'build')));

// لأي طلب غير معروف، إعادة ملف index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});

// بدء تشغيل الخادم
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
