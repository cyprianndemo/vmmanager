import React, { useState } from 'react';
import { TextField, Button, FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';

const PaymentDetailsForm = ({ onSubmit, isProcessing }) => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      paymentMethod,
      cardNumber,
      expiryDate,
      cvv,
      phoneNumber
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormControl fullWidth margin="normal">
        <InputLabel>Payment Method</InputLabel>
        <Select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          required
        >
          <MenuItem value="Stripe">Credit Card (Stripe)</MenuItem>
          <MenuItem value="MPESA">MPESA</MenuItem>
          <MenuItem value="PayPal">PayPal</MenuItem>
        </Select>
      </FormControl>

      {paymentMethod === 'Stripe' && (
        <>
          <TextField
            fullWidth
            label="Card Number"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Expiry Date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="CVV"
            value={cvv}
            onChange={(e) => setCvv(e.target.value)}
            margin="normal"
            required
          />
        </>
      )}

      {paymentMethod === 'MPESA' && (
        <TextField
          fullWidth
          label="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          margin="normal"
          required
        />
      )}

      <Box sx={{ mt: 2 }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Complete Payment'}
        </Button>
      </Box>
    </form>
  );
};

export default PaymentDetailsForm;