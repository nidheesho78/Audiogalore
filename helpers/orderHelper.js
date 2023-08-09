const mongoose = require("mongoose");
const Order = require("../models/orderModel");
const User = require("../models/userModel");

const Cart = require("../models/cartModel");
const Address = require("../models/userAddressModel");
const { ObjectId } = require("mongodb");
const Razorpay = require("razorpay");
const { createHmac } = import("node:crypto");


require('dotenv').config();
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
 

const placeOrder = (data, user) => {
  try {
    return new Promise(async (resolve, reject) => {
      const productDetails = await Cart.aggregate([
        {
          $match: {
            user: user._id.toString(),
          },
        },
        {
          $unwind: "$cartItems",
        },
        {
          $project: {
            item: "$cartItems.productId",
            quantity: "$cartItems.quantity",
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "item",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        {
          $unwind: "$productDetails",
        },
        {
          $project: {
            productId: "$productDetails._id",
            productName: "$productDetails.name",
            productPrice: "$productDetails.price",
            quantity: "$quantity",
            category: "$productDetails.category",
            image: "$productDetails.images",
          },
        },
      ]);
      const addressData = await Address.aggregate([
        {
          $match: { user: user._id.toString() },
        },
        {
          $unwind: "$addresses",
        },
        {
          $match: { "addresses._id": new ObjectId(data.addressId) },
        },
        {
          $project: { item: "$addresses" },
        },
      ]);
      let status, orderStatus;
      if (data.paymentOption == "cod") {
        (status = "Success"), (orderStatus = "Placed");
      }else if (data.paymentOption === "wallet") {
        const userData = await User.findById({ _id:user._id });
        // console.log(userData.wallet );
        // console.log(data.total);

        const walletAmount=parseInt(userData.wallet )
        const total=parseInt(data.total)

        console.log(walletAmount);
        console.log(total);

        if(walletAmount<total){
          flag = 1;
          reject(new Error("Insufficient wallet balance!"));
          
          return 



        }

      else  {
          userData.wallet -= data.total;

          await userData.save();
            (status = "Success"), (orderStatus = "Placed");
             const walletTransaction = {
                    date:new Date(),
                    type:"Debit",
                    amount:data.total,

                  }
                  const walletupdated = await User.updateOne(
                    { _id: user._id },
                    {
                      $push: { walletTransaction: walletTransaction },
                    }
                  )
        }
      }else {
                (status = "Pending"), (orderStatus = "Pending");
              }

      const orderData = {
        _id: new mongoose.Types.ObjectId(),
        name: addressData[0].item.name,
        paymentStatus: status,
        paymentMethod: data.paymentOption,
        productDetails: productDetails,
        shippingAddress: addressData[0],
        orderStatus: orderStatus,
        totalPrice: data.total,
        discountPercentage:data.discountPercentage,
        discountAmount:data.discountAmount,
        couponCode:data.couponCode,
        createdAt: new Date(),
        canceledAt:"" 
      };

      const order = await Order.findOne({ user: user._id });
      if (order) {
        await Order.updateOne(
          { user: user._id },
          {
            $push: { orders: orderData },
          }
        ).then((response) => {
          resolve(response);
        });
      } else {
        const newOrder = Order({
          user: user._id,
          orders: orderData,
        });
        await newOrder.save().then((response) => {
          resolve(response);
        });
      }
     
    });
  } catch (error) {
    console.log(error.message);
  }
};

//order number  for orderslip

const getOrderNumber = async (userId) => {
  try {
    const result = await Order.aggregate([
      {
        $match: {
          user: userId,
        },
      },
      {
        $project: {
          lastOrder: {
            $arrayElemAt: ["$orders", -1],
          },
          address: {
            $arrayElemAt: ["$orders.shippingAddress.item", 0],
          },
          productDetails: {
            $arrayElemAt: ["$orders.productDetails", -1],
          },
        },
      },
    ]).exec();

    return result;
  } catch (error) {
    throw error;
  }
};

const getOrderData = async (userId) => {
  try {
    const result = Order.aggregate([
      {
        $match: {
          user: userId,
        },
      },
      {
        $unwind: "$orders",
      },
      {
        $project: {
          _id: "$orders._id",
          date: "$orders.createdAt",
          status: "$orders.orderStatus",
          total: "$orders.totalPrice",
          quantity: { $sum: "$orders.productDetails.quantity" },
        },
      },
    ]).exec();

    return result;
  } catch (error) {
    throw error;
  }
};

//get orderid for razor pay

const getOrderId = async (user) => {
  try {
    const orderId = await Order.aggregate([
      {
        $match: {
          user: new Object(user),
        },
      },
      {
        $project: {
          lastOrder: {
            $arrayElemAt: ["$orders", -1],
          },
        },
      },
      {
        $project: {
          lastOrderId: "$lastOrder._id",
        },
      },
    ]);

    const result = orderId[0].lastOrderId;
    return result;
  } catch (error) {
    console.log(error.message);
  }
};

///findLastOredrTotal

const findLastTotal = async (user) => {
  try {
    const total = await Order.aggregate([
      { $match: { user: new Object(user) } },
      { $unwind: "$orders" },
      { $sort: { "orders.createdAt": -1 } },
      { $limit: 1 },
      { $project: { _id: 0, totalPrice: "$orders.totalPrice" } },
    ]);

    return total[0].totalPrice;
  } catch (error) {
    console.log(error.message);
  }
};

const generateRazorpay = async (orderId, total) => {
  try {
    var options = {
      amount: parseInt(total * 100), // amount in the smallest currency unit
      currency: "INR",
      receipt: orderId,
    };
    return new Promise((resolve, reject) => {
      instance.orders.create(options, function (err, order) {
        if (err) {
          reject(err);
        } else {
          resolve(order);
        }
      });
    });
  } catch (error) {
    console.log(error.message);
  }
};

//verify payment

const crypto = require("crypto");
const verifyPayment = async (details) => {
  try{
  
  return new Promise((resolve, reject) => {
    let hmac = crypto.createHmac("sha256", "AE9kou8SqSQALEZIpsaIXSF8");

    const orderID = details.payment.razorpay_order_id;
    const paymentID = details.payment.razorpay_payment_id;
    const signature = details.payment.razorpay_signature;

    hmac.update(orderID + "|" + paymentID);
    hmac = hmac.digest("hex");
    console.log("here", hmac);
    if (hmac == signature) {
      resolve();
    } else {
      reject();
    }
  });
}catch(error){
  console.log(error.message,'Verify Payment')
}
};

const changePaymentStatus = async (orderId,user) => {
  return new Promise(async (resolve, reject) => {
    try {
     
      await Order.updateOne(
        { "orders._id": new ObjectId(orderId) },
        { $set: { "orders.$.orderStatus": "Placed" } }
      );

      await Cart.deleteOne({ user:user._id });

      resolve();
    } catch (error) {
      reject(error);
    }
  });
};


module.exports = {
  placeOrder,
  getOrderNumber,
  getOrderData,
  getOrderId,
  generateRazorpay,
  findLastTotal,
  verifyPayment,
  changePaymentStatus,
};
