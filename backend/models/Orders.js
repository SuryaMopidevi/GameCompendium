const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: String,
  customer: {
    fullName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
  },
  product: {
    id: mongoose.Schema.Types.ObjectId,
    title: String,
    variant: String,
    quantity: Number,
    price: Number,
    subtotal: Number,
  },
  payment: {
    cardNumber: String,
    expiryDate: String,
    cvv: String,
    status : String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Order", orderSchema);
