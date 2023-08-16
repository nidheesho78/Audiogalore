const cartHelper = require("../helpers/cartHelper");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");


const addToCart = async (req, res) => {
  try {
    console.log("hereee");
    const product = await Product.findById(req.body.productId);
    const price = product.price;

    const productId = req.body.productId;
    const name = req.body.name;
    const quantity = req.body.quantity;

    const response = await cartHelper.addCart(
      productId,
      res.locals.user._id,
      quantity,
      price,
      name
    );

    res.send(response);
  } catch (error) {
    console.log(error);
  }
};



const viewCart = async (req, res) => {
  try {
    const cartData = await Cart.findOne({ user: res.locals.user._id }); ///to find cart of user
    if (cartData) {
      const subTotal = cartData.subTotal;
      const cartId = cartData._id;
      const productIds = cartData.cartItems.map((item) =>
        item.productId.toString()
      ); ///to fetch product ids
      const products = await Product.find({ _id: { $in: productIds } }); ///found products with product id

      const productList = cartData.cartItems.map((cartItem) => {
        const product = products.find(
          (item) => item._id.toString() === cartItem.productId.toString()
        );
        return {
          product,
          quantity: cartItem.quantity,
          total: cartItem.total,
        };
      });

      // console.log(productList);

      res.render("cart2", { productList, subTotal, cartId });
    } else {
     
      res.render("cart2", { productList: [] });
    }
  } catch (error) {
    console.log(error);
    // Handle the error appropriately, such as sending an error response
    res.status(500).send("Internal Server Error");
  }
};



// const updatecart = async (req, res) => {
//   try {
//     const productId = req.body.productId;
//     const quantity = req.body.quantity;

//     const product = await Product.findById(productId);
//     const price = product.price;
//     const totalPrice = quantity * price;

//     const cart = await Cart.findOneAndUpdate(
//       { "cartItems.productId": productId },
//       {
//         $set: {
//           "cartItems.$.quantity": quantity,
//           "cartItems.$.total": totalPrice,
//         },
//       },
//       { new: true } // This option ensures that the updated cart document is returned
//     );

//     // Calculate the sum of all cartItems.total values
//     const subTotal = cart.cartItems.reduce((acc, item) => acc + item.total, 0);
//     await Cart.updateOne({ _id: cart._id }, { $set: { subTotal: subTotal } });

//     res.json({ totalPrice, subTotal });
//     // console.log("Cart updated:", cart);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };


const updatecart = async (req, res) => {
  try {
    const productId = req.body.productId;
    const newQuantity = req.body.quantity;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const oldCartItem = await Cart.findOne({
      "cartItems.productId": productId,
    });
    if (!oldCartItem) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    const availableStock = product.stock + oldCartItem.cartItems[0].quantity;

    if (newQuantity > availableStock) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    const price = product.price;
    const totalPrice = newQuantity * price;

    const cart = await Cart.findOneAndUpdate(
      { "cartItems.productId": productId },
      {
        $set: {
          "cartItems.$.quantity": newQuantity,
          "cartItems.$.total": totalPrice,
        },
      },
      { new: true }
    );

    const subTotal = cart.cartItems.reduce((acc, item) => acc + item.total, 0);
    await Cart.updateOne({ _id: cart._id }, { $set: { subTotal: subTotal } });

    res.json({ totalPrice, subTotal });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
    res.redirect('/404Error')

  }
};

const deleteCart=async(req,res)=>{
  try{
  
 cartHelper.deleteProduct(req.body).then((response)=>{
  res.send(response)
 })


}catch(error){
  console.log(error.message)
}
};

module.exports = {
  addToCart,
  viewCart,
  updatecart,
deleteCart
};
