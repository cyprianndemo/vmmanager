const axios = require('axios');
const moment = require('moment');
require('dotenv').config();

const mpesaApiUrl = process.env.MPESA_API_URL || 'https://sandbox.safaricom.co.ke';
const consumerKey = process.env.MPESA_CONSUMER_KEY;
const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
const businessShortCode = process.env.MPESA_BUSINESS_SHORT_CODE;
const passkey = process.env.MPESA_PASSKEY;
const callBackURL = process.env.CALLBACK_URL;

const generatePassword = () => {
  const timestamp = moment().format('YYYYMMDDHHmmss');
  const password = Buffer.from(`${businessShortCode}${passkey}${timestamp}`).toString('base64');
  return { password, timestamp };
};

const getAccessToken = async () => {
  try {
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const response = await axios.get(`${mpesaApiUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting M-Pesa access token:', error);
    throw error;
  }
};

const initiateSTKPush = async ({ phoneNumber, amount, accountReference, transactionDesc }) => {
  try {
    const accessToken = await getAccessToken();
    const { password, timestamp } = generatePassword();
    const formattedAmount = Math.ceil(amount);

    const response = await axios.post(
      `${mpesaApiUrl}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: formattedAmount,
        PartyA: phoneNumber,
        PartyB: businessShortCode,
        PhoneNumber: phoneNumber,
        CallBackURL: callBackURL,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.data.ResponseCode === "0") {
      return {
        success: true,
        requestId: response.data.CheckoutRequestID,
        message: response.data.ResponseDescription
      };
    } else {
      throw new Error(response.data.errorMessage || 'STK Push failed');
    }
  } catch (error) {
    console.error('Error initiating STK Push:', error);
    throw error;
  }
};

module.exports = {
  initiateSTKPush,
};
