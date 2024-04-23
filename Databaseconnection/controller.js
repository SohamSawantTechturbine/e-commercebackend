const express = require("express");
const fs=require("fs");
const mongoose = require("mongoose");
const { mongoconnection, model, UserCart, product } = require("./connection");
const router = express.Router();
const jwt = require("jsonwebtoken");
const stripe=require("stripe")("sk_test_51P8Kf4SEE7AHIzyhaGw9cbgIQ0aMRbPBw5HrDFF00ck35W6VcUzqfewkjcvtXKOMP4WOwmtdO2TVmj4LcDnjeQRK009SzlyP4O");
//const { generateToken } = require("./router");
const secretKey = "sohamsawant";


function generateToken(user) {
    return jwt.sign({ id: user.id }, secretKey);
  }



 
  async function createcheckoutsession(req, res) {
    const { products, productprice } = req.body;

  
    const lineItems = products.map((product) => ({
        price_data: {
            currency: 'usd',
            product_data: {
                name: product.productTitle,
                images: [product.productimage] 
            },
            unit_amount: product.productPrice * 100 
        },
        quantity: product.quantity,
         
    }));

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
           success_url: 'http://localhost:5173//success', // URL to redirect to after successful payment
           cancel_url: 'http://localhost:5173//cancel',   // URL to redirect to after cancelled payment
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
}




async function addtocart(req, res) {
    const { product } = req.body;

    if (req.user) {
        const userId = req.user.id;

        const existingCart = await UserCart.findOne({ userId: userId });

        if (product) {
            if (existingCart) {
                const existingProductIndex = existingCart.products.findIndex(item => item.productId.toString() === product._id.toString());

                if (existingProductIndex !== -1) {
                    existingCart.products[existingProductIndex].quantity++;
                    existingCart.products[existingProductIndex].productTotalPrice = existingCart.products[existingProductIndex].quantity * existingCart.products[existingProductIndex].productPrice;
                } else {
                    existingCart.products.push({
                        productId: product._id,
                        productTitle: product.title,
                        productPrice: product.price,
                        productdescription: product.productdescription,
                        productcategory: product.category,
                        productimage: product.image,
                        quantity: 1,
                        productTotalPrice: product.price
                    });
                }

                await existingCart.save();
             
                res.status(200).json({ success: true, cart: existingCart });
            } else {
                const cartItem = new UserCart({
                    userId: userId,
                    products: [{
                        productId: product._id,
                        productTitle: product.title,
                        productPrice: product.price,
                        productdescription: product.productdescription,
                        productcategory: product.category,
                        productimage: product.image,
                        quantity: 1,
                        productTotalPrice: product.price
                    }]
                });

                await cartItem.save();
               
                res.status(200).json({ success: true, cart: cartItem });
            }
        }
    } else {
        res.status(401).json({ success: false, message: "User not found" });
    }
}




async function productsdetails(req, res) {
    try {
        const { productIds } = req.body;
        const products = await product.find({ _id: { $in: productIds } });
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching product details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}




async function getcartdata(req, res) {
    try {
      
      if (!req.user) {
        console.log('User not authenticated');
        return res.status(401).json({ error: 'User not authenticated' });
      }
  
   
      const userId = req.user.id;
  
      
      const existingCart = await UserCart.findOne({ userId: userId });
  
      if (existingCart) {
        // If cart data exists, send it as a response
        const cartDataString = JSON.stringify(existingCart.products);
        fs.appendFile("soham.txt", cartDataString, (data, err) => {
          console.log("file created");
        });
        res.status(200).json({ cart: existingCart.products, quantities: existingCart.quantities });
      } else {
        res.status(200).json({ cart: [], quantities: {} });
      }
    } catch (error) {
      // Handle any errors that occur during the process
      console.error('Error fetching cart data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }






  async function removeFromCart(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { productId } = req.params;
        const userId = req.user.id;

        const existingCart = await UserCart.findOne({ userId: userId });

        if (!existingCart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        existingCart.products = existingCart.products.filter(product => product.productId.toString() !== productId);
        await existingCart.save();

        res.status(200).json({ success: true, message: 'Product removed from cart successfully' });
    } catch (error) {
        console.error('Error removing product from cart:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}





async function logindata(req, res) {
    const { username, password } = req.body;
    try {
        const result = await model.findOne({ username, password });
        //   console.log(result)
        if (result) {
            const token = generateToken(result);
            const cartData = await UserCart.findOne({ userId: result._id });
            console.log(cartData, "data")
            res.json({ result, token, cartData });
        } else {

            res.json(null);
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
async function registerdata(req, res) {
    const body = req.body;
    try {
        const result = await model.create(body);
        console.log(result);
        res.status(200).json(result); // Send response with inserted data
    } catch (error) {
        console.error("Error inserting data:", error);
        res.status(500).send("Error inserting data");
    }
}
async function addQuantity(req,res){
    try {
        const { productId } = req.params;
        const { quantity } = req.body;
    
        if (!req.user) {
          return res.status(401).json({ error: 'User not authenticated' });
        }
    
        const userId = req.user.id;
    
        const existingCart = await UserCart.findOne({ userId: userId });
    
        if (!existingCart) {
          return res.status(404).json({ error: 'Cart not found' });
        }
    
        // Find the product in the cart and update its quantity
        const productIndex = existingCart.products.findIndex(product => product.productId.toString() === productId);
        if (productIndex !== -1) {
          existingCart.products[productIndex].quantity = quantity;
        } else {
          // Handle case where product is not found in the cart
          return res.status(404).json({ error: 'Product not found in cart' });
        }
    
        await existingCart.save();
    
        res.status(200).json({ success: true, message: 'Quantity updated successfully' });
      } catch (error) {
        console.error('Error updating quantity:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
}
async function removeQuantity(req,res){
    try {
        const { productId } = req.params;
        const { quantity } = req.body;
    
        if (!req.user) {
          return res.status(401).json({ error: 'User not authenticated' });
        }
    
        const userId = req.user.id;
    
        const existingCart = await UserCart.findOne({ userId: userId });
    
        if (!existingCart) {
          return res.status(404).json({ error: 'Cart not found' });
        }
    
        // Find the product in the cart and update its quantity
        const productIndex = existingCart.products.findIndex(product => product.productId.toString() === productId);
        if (productIndex !== -1) {
          existingCart.products[productIndex].quantity = quantity;
        } else {
          // Handle case where product is not found in the cart
          return res.status(404).json({ error: 'Product not found in cart' });
        }
    
        await existingCart.save();
    
        res.status(200).json({ success: true, message: 'Quantity updated successfully' });
      } catch (error) {
        console.error('Error updating quantity:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
}
module.exports = { createcheckoutsession,addtocart, productsdetails, logindata, registerdata,getcartdata,removeFromCart,addQuantity,removeQuantity }
