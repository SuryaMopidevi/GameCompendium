import React,{ useState, useEffect }  from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
  Button,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
} from '@mui/material';

function LandingPage() {
  const [product, setProduct] = useState(null);
  const [variant, setVariant] = useState('');
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  useEffect(() => {
    axios.get('http://localhost:4000')
      .then(response => {
        const firstProduct = response.data[0];
        console.log(firstProduct)
        setProduct(firstProduct);
        setVariant(firstProduct?.variants[0] || '');
      })
      .catch(error => console.error(error));
  }, []);

  const handleBuyNow = () => {
    navigate('/checkout', { state: { product, variant, quantity } });
  };

  if (!product) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box display="flex" justifyContent="center" mt={5}>
      <Card sx={{ maxWidth: 400, p: 2 }}>
        <CardMedia
          component="img"
          height="300"
          image={product.image}
          alt={product.title}
          sx={{ objectFit: 'contain' }}
        />
        <CardContent>
          <Typography variant="h5" gutterBottom>{product.title}</Typography>
          <Typography variant="body1" paragraph>{product.description}</Typography>
          <Typography variant="h6" color="primary">Price: ₹{product.price}</Typography>

          <FormControl fullWidth margin="normal">
            <InputLabel>Variant</InputLabel>
            <Select
              value={variant}
              onChange={(e) => setVariant(e.target.value)}
              label="Variant"
            >
              {product.variants.map((v, index) => (
                <MenuItem key={index} value={v}>{v}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Quantity"
            type="number"
            inputProps={{ min: 1, max: product.inventory }}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            fullWidth
            margin="normal"
          />

          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            onClick={handleBuyNow}
          >
            Buy Now
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export default LandingPage;
