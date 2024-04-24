const mongoose = require("mongoose");

function mongoconnection() {
  return mongoose.connect("mongodb://localhost:27017/E-commerce");
}

const schema = new mongoose.Schema({
  username: {
    type: String,
  },
  password: {
    type: String,
    required: true, 
  },
   cartdata:{
    type :mongoose.Schema.Types.ObjectId,
    ref:'usercart'
   }
});
const usercart=new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'product'
    },
    productTitle:{
     type:String
    },
    productPrice:{
      type:String
    },
    quantity: {
      type: Number,
      default: 1
    },
    productimage:{type:String},
    productTotalPrice:Number,
  }]

})
const userproductdetails=new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'product'
    },
    productTitle:{
     type:String
    },
    productPrice:{
      type:String
    },
    quantity: {
      type: Number,
      default: 1
    },
    productimage:{type:String},
    productTotalPrice:Number,
  }]

})
const products=new mongoose.Schema({
  id:String,
  title:String,
  price:Number,
  description:String,
  category:String,
  image:String,
  // name:String,
  // phone:String,
  rating: {
    rate: {
      type: Number,
      
    },
    count: {
      type: Number,
     
    },
  },

})
const model = mongoose.model("User", schema); 
const UserCart = mongoose.model("UserCart", usercart); 
const product=mongoose.model("product",products)
const productdetail=mongoose.model("productdetail",userproductdetails)
module.exports = { mongoconnection, model,UserCart,product,productdetail }; 
