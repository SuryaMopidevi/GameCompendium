import { useState } from 'react';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Grid,
} from '@mui/material';

function CheckoutPage() {
  const { state } = useLocation();
  const { product, variant, quantity } = state || {};
  const navigate = useNavigate();
  const unitPrice = product?.price || 0;
  const subtotal = unitPrice * quantity;
  const total = subtotal;

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required.';
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format.';
    if (!/^[0-9]{10}$/.test(formData.phone)) newErrors.phone = 'Phone must be 10 digits.';
    if (!formData.address.trim()) newErrors.address = 'Address is required.';
    if (!formData.city.trim()) newErrors.city = 'City is required.';
    if (!formData.state.trim()) newErrors.state = 'State is required.';
    if (!/^\d{5,6}$/.test(formData.zipCode)) newErrors.zipCode = 'Zip code must be 5 or 6 digits.';
    if (!/^\d{16}$/.test(formData.cardNumber)) newErrors.cardNumber = 'Card number must be 16 digits.';
    
    const expiry = new Date(formData.expiryDate);
    const today = new Date();
    if (!formData.expiryDate || expiry <= today) newErrors.expiryDate = 'Expiry must be a future date.';
    
    if (!/^\d{3}$/.test(formData.cvv)) newErrors.cvv = 'CVV must be 3 digits.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const orderData = {
      ...formData,
      productId: product._id,
      variant,
      quantity,
    };

    try {
      const response = await axios.post("http://localhost:4000/api/orders", orderData);
      const { orderNumber } = response.data;
      navigate('/thank-you', { state: { orderNumber } });
    } catch (error) {
      if (error.response?.status === 402) {
        alert("❌ Transaction declined. Please check your card.");
      } else if (error.response?.status === 503) {
        alert("⚠️ Payment gateway error. Please try again later.");
      } else {
        alert("❌ Something went wrong. Please try again.");
      }
    }
  };

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Checkout
      </Typography>

      {product && (
        <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6">Order Summary</Typography>
          <Typography><strong>Product:</strong> {product.title}</Typography>
          <Typography><strong>Variant:</strong> {variant}</Typography>
          <Typography><strong>Quantity:</strong> {quantity}</Typography>
          <Typography><strong>Unit Price:</strong> ₹{unitPrice}</Typography>
          <Typography><strong>Total:</strong> ₹{total}</Typography>
        </Paper>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {[
            { name: 'fullName', label: 'Full Name' },
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'phone', label: 'Phone Number' },
            { name: 'address', label: 'Address' },
            { name: 'city', label: 'City' },
            { name: 'state', label: 'State' },
            { name: 'zipCode', label: 'Zip Code' },
            { name: 'cardNumber', label: 'Card Number' },
            { name: 'expiryDate', label: 'Expiry Date', type: 'date' },
            { name: 'cvv', label: 'CVV' },
          ].map(({ name, label, type = 'text' }) => (
            <Grid item xs={12} sm={type === 'date' ? 6 : 12} key={name}>
              <TextField
                fullWidth
                type={type}
                name={name}
                label={label}
                value={formData[name]}
                onChange={handleChange}
                error={!!errors[name]}
                helperText={errors[name]}
                InputLabelProps={type === 'date' ? { shrink: true } : {}}
              />
            </Grid>
          ))}
        </Grid>

        <Box mt={3} textAlign="center">
          <Button variant="contained" color="primary" type="submit">
            Place Order
          </Button>
        </Box>
      </form>
    </Box>
  );
}

export default CheckoutPage;
