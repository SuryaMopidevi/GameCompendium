import { useEffect, useState } from 'react';
import React from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  Paper,
  Divider,
  CircularProgress,
} from '@mui/material';

function ThankYouPage() {
  const { state } = useLocation();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://localhost:4000/getOrders/${state.orderNumber}`)
      .then(response => {
        const productDetails = response.data[0];
        setProduct(productDetails);
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
      });
  }, [state.orderNumber]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="md">
        <Typography variant="h5" color="error" textAlign="center" mt={4}>
          Order not found.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ padding: 4, mt: 5 }}>
        <Typography variant="h4" gutterBottom>
          Thank You for Your Purchase!
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Order Number: <strong>{product.orderNumber}</strong>
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h5" gutterBottom>Product Details</Typography>
        <Typography variant="body1">Title: {product.product.title}</Typography>
        <Typography variant="body1">Price: ${product.product.price}</Typography>
        <Typography variant="body1">Variant: {product.product.variant}</Typography>
        <Typography variant="body1">Quantity: {product.product.quantity}</Typography>
        <Typography variant="body1">Subtotal: ${product.product.subtotal}</Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h5" gutterBottom>Customer Details</Typography>
        <Typography variant="body1">Name: {product.customer.fullName}</Typography>
        <Typography variant="body1">Phone: {product.customer.phone}</Typography>
        <Typography variant="body1">Email: {product.customer.email}</Typography>
        <Typography variant="body1">Address: {product.customer.address}, {product.customer.city}, {product.customer.state} - {product.customer.zipCode}</Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h5" gutterBottom>Payment Details</Typography>
        <Typography variant="body1">Card Number: {product.payment.cardNumber}</Typography>
        <Typography variant="body1">CVV: {product.payment.cvv}</Typography>
        <Typography variant="body1">Expiry Date: {product.payment.expiryDate}</Typography>
        <Typography variant="body1">Status: {product.payment.status}</Typography>
      </Paper>
    </Container>
  );
}

export default ThankYouPage;
