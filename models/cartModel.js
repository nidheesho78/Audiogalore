const mongoose = require("mongoose");
const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.String,
    ref: "User",
  },
  cartItems: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name:{type:String},
      quantity: { type: Number, default: 1 }, // Add the quantity field
      total: { type: Number },
    },
  ],
  subTotal:{
    type:Number
  }
});
module.exports = mongoose.model("Cart", cartSchema);
