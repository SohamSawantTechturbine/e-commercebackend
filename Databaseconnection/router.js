
const express = require("express");
const mongoose = require("mongoose");
const { mongoconnection,model,UserCart,product } = require("./connection");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { createcheckoutsession,addtocart, productsdetails, logindata, registerdata,getcartdata,removeFromCart ,addQuantity,removeQuantity} = require("./controller");
const secretKey = "sohamsawant";
const { ObjectId } = mongoose.Types;


function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token,secretKey, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}
  router.post("/product-data", async (req, res) => {
    try {
      
      const products = await product.find();
      res.status(200).json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  router.post("/create-checkout-session",createcheckoutsession)
  router.post("/register-data", registerdata)
  router.post("/login-data", logindata)
   
  router.post('/products-details', productsdetails)
  router.delete('/removeFromCart/:productId',authenticateToken, removeFromCart);

router.post("/add-to-cart", authenticateToken,addtocart)
   router.get("/getcartdata",authenticateToken,getcartdata)

   router.put('/addQuantity/:productId',authenticateToken, addQuantity)
  
  // Endpoint to remove quantity for a product in the cart
  router.put('/removeQuantity/:productId',authenticateToken,removeQuantity)
  
  
  module.exports = { router};