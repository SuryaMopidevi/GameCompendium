// seedProducts.js
const mongoose = require("mongoose");
const Product = require("../models/Products"); 
const sampleProducts=require("./sampleData");

mongoose.connect("mongodb+srv://mopidevisurya001:LDKwroVkGXJU95R4@cluster0.9anfhmy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
.then(async () => {
  await Product.deleteMany({});//clears old data
  await Product.insertMany(sampleProducts);
  console.log(sampleProducts)
  console.log("✅ Sample products inserted");
  mongoose.disconnect();
})
.catch((err) => {
  console.error("MongoDB connection error:", err);
});
