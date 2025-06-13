// index.js
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const app = express();
dotenv.config()
const PORT = process.env.PORT || 5000;
const URL=process.env.URL
const Product = require("./models/Products")
const Order = require("./models/Orders");
const { v4: uuidv4 } = require("uuid");
const cors = require('cors');
app.use(cors());
// Middleware to parse JSON
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST, 
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
});
// console.log(process.env.MAILTRAP_EMAIL)
// console.log(process.env.MAILTRAP_HOST)
// console.log(process.env.MAILTRAP_PASS)
// console.log(process.env.MAILTRAP_USER)
const sendEmail = async (type, order, customerEmail) => {
  let subject = '';
  let html = '';

  if (type === 'approved') {
    subject = `Order Confirmed - ${order.orderNumber}`;
    html = `
      <h2>Thank you for your order!</h2>
      <p>Order Number: <strong>${order.orderNumber}</strong></p>
      <p>Product: ${order.product.title} - ${order.product.variant}</p>
      <p>Quantity: ${order.product.quantity}</p>
      <p>Total: $${order.product.subtotal}</p>
      <p>Shipping to: ${order.customer.fullName}, ${order.customer.address}, ${order.customer.city}</p>
      <p>We will notify you once the order is shipped.</p>
    `;
  } else if (type === 'declined') {
    subject = "Transaction Failed - Please Retry";
    html = `
      <h2>Transaction Declined</h2>
      <p>We're sorry, your recent attempt to place an order was declined.</p>
      <p>Please check your card details and try again.</p>
      <p>If the problem persists, contact support.</p>
    `;
  }

  const mailOptions = {
    from: process.env.MAILTRAP_EMAIL,
    to: customerEmail,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
}

// POST /api/orders
app.post("/api/orders", async (req, res) => {
  const {
    fullName, email, phone, address, city,
    state, zipCode, cardNumber, expiryDate, cvv,
    productId, variant, quantity
  } = req.body;

  try {
    // Simulate a payment transaction outcome
    const outcomes = ['approved', 'declined', 'error'];
    const transactionResult = outcomes[Math.floor(Math.random() * outcomes.length)];

    // For gateway failure
    if (transactionResult === 'error') {
      return res.status(503).json({ error: "Payment gateway error. Try again later." });
    }

    // For declined payment
    if (transactionResult === 'declined') {
       await sendEmail('declined', {}, email);  // Pass email from form
      return res.status(402).json({ error: "Transaction declined. Please check your card details." });
    }

    // Proceed if transaction approved
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    if (product.inventory < quantity) {
      return res.status(400).json({ error: "Not enough inventory" });
    }

    const orderNumber = uuidv4().slice(0, 8).toUpperCase();

    const order = new Order({
      orderNumber,
      customer: { fullName, email, phone, address, city, state, zipCode },
      product: {
        id: product._id,
        title: product.title,
        variant,
        quantity,
        price: product.price,
        subtotal: product.price * quantity,
      },
      payment: { cardNumber, expiryDate, cvv, status : transactionResult}
    });

    await order.save();

    product.inventory -= quantity;
    await product.save();

    // Send success email via Mailtrap (optional)
    await sendEmail('approved', order, email);
    res.status(201).json({ message: "Order placed", orderNumber });

  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Basic route
app.get('/', async(req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get('/getOrders/:orderNumber', async (req, res) => {
  const { orderNumber } = req.params;
  try {
    const orders = await Order.find({ orderNumber });
    if (!orders.length) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


mongoose.connect(URL)
  
    .then((e) => {
        console.log('mongoose connected succesfully........')
    })
    .catch((e) => {
      console.log(URL);
      console.log(e)
        console.log("Connection FAILED")
    })

app.listen(PORT, () => {
    console.log(`server listening on ${PORT}`)
})