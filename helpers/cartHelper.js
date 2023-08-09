const Cart = require("../models/cartModel");
const Product = require("../models/productModel");



const addCart = (productId, userId, quantity, price, name) => {
  
   try {
  const totalPrice = quantity * price;

  const productObj = {
    name: name,
    productId: productId,
    userId: userId,
    quantity: quantity,
    total: totalPrice,
  };

 
    return new Promise((resolve, reject) => {
      Cart.findOne({ user: userId }).then(async (cart) => {
        if (cart) {
          const productExist = await Cart.findOne({
            "cartItems.productId": productId,
          });

          if (productExist) {
            Cart.updateOne(
              { user: userId, "cartItems.productId": productId },
              {
                $inc: {
                  "cartItems.$.quantity": quantity,
                  "cartItems.$.total": totalPrice,
                },
                $set: {
                  subTotal: cart.subTotal + totalPrice, // Update the subTotal field by adding the new total price
                },
              }
            ).then((response) => {
              resolve({ response, status: false });
            });
          } else {
            Cart.updateOne(
              { user: userId },
              {
                $push: { cartItems: productObj },
                $inc: { subTotal: totalPrice },
              }
            ).then((response) => {
              resolve({ status: true });
            });
          }
        } else {
          const newCart = await Cart({
            user: userId,
            cartItems: productObj,
            subTotal: totalPrice,
          });
          await newCart.save().then((response) => {
            resolve({ status: true });
          });
        }
      });
    });
  } catch (error) {
    console.log(error.message);
  }
};

// const addCart = (productId, userId, quantity, price, name) => {
//   const totalPrice = quantity * price;

//   const productObj = {
//     name: name,
//     productId: productId,
//     userId: userId,
//     quantity: quantity,
//     total: totalPrice,
//   };

//   try {
//     return new Promise((resolve, reject) => {
//       Cart.findOne({ user: userId }).then(async (cart) => {
//         if (cart) {
//           // Check if the product exists in the cart
//           const productExist = await Cart.findOne({
//             "cartItems.productId": productId,
//           });

//           if (productExist) {
//             // Check if adding the quantity exceeds stock limit
//             if (quantity > Product.stock) {
//       return { status: false, message: "Not enough stock available." };
//     }

//             Cart.updateOne(
//               { user: userId, "cartItems.productId": productId },
//               {
//                 $inc: {
//                   "cartItems.$.quantity": quantity,
//                   "cartItems.$.total": totalPrice,
//                 },
//                 $set: {
//                   subTotal: cart.subTotal + totalPrice,
//                 },
//               }
//             ).then((response) => {
//               resolve({ response, status: false });
//             });
//           } else {
//             Cart.updateOne(
//               { user: userId },
//               {
//                 $push: { cartItems: productObj },
//                 $inc: { subTotal: totalPrice },
//               }
//             ).then((response) => {
//               resolve({ status: true });
//             });
//           }
//         } else {
//           const newCart = await Cart({
//             user: userId,
//             cartItems: productObj,
//             subTotal: totalPrice,
//           });
//           await newCart.save().then((response) => {
//             resolve({ status: true });
//           });
//         }
//       });
//     });
//   } catch (error) {
//     console.log(error.message);
//   }
// };


const deleteProduct = async (data) => {
  const cartId = data.cartId;
  const proId = data.proId;
  const product = await Product.findOne({ _id: proId });
  const cart = await Cart.findOne({
    _id: cartId,
    "cartItems.productId": data.proId,
  });

  return new Promise((resolve, reject) => {
    try {
      const cartItem = cart.cartItems.find((item) =>
        item.productId.equals(data.proId)
      );
      const quantityToRemove = cartItem.quantity;
      Cart.updateOne(
        { _id: cartId, "cartItems.productId": proId },
        {
          $inc: { subTotal: product.price * quantityToRemove * -1 },
          $pull: { cartItems: { productId: proId } },
        }
      ).then(() => {
        resolve({ status: true });
      });
    } catch (error) {
      throw error;
    }
  });
};

module.exports = {
  addCart,
  deleteProduct,
};
