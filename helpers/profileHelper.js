const { response } = require("express");
const Address = require("../models/userAddressModel");
const Order = require("../models/orderModel");
const { ObjectId } = require("mongodb");

// Helper function to update the user's address
const updateAddress = async (userId, newAddress) => {
  try{
  const updatedUser = await Address.findOneAndUpdate(
    { user: userId },
    { $push: { addresses: newAddress } },
    { new: true }
  );

  return updatedUser;
}
catch(error){
  console.log(error.message)
}
};

// Helper function to create a new user address
const createAddress = async (userId, newAddress) => {
  try{
  const userAddress = new Address({
    user: userId,
    addresses: [newAddress],
  });
  await userAddress.save();
}catch(error){
  console.log(error.message)
}
};

//get order details

const getOrderDetails = async (userId) => {
  try {
    const result = await Order.aggregate([
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
          date: {
            $dateToString: {
              format: "%d %m %Y",
              date: "$orders.createdAt",
              timezone: "Asia/Kolkata",
            },
          },
          status: "$orders.orderStatus",
          total: "$orders.totalPrice",
        },
      },
    ]);

    console.log("result", result);
    return result;
  } catch (error) {
    console.log(error.message);
  }
};

const getOrderDataById = async (orderId) => {
  try {
    const idString = orderId;
    const objectId = new ObjectId(idString);
    console.log(objectId);

    const result = await Order.aggregate([
      {
        $match: {
          "orders._id": objectId,
        },
      },
      {
        $unwind: "$orders",
      },
      {
        $match: {
          "orders._id": objectId,
        },
      },
      {
        $project: {
          order_id: { $toString: "$orders._id" },
          name: "$orders.name",
          payment_status: "$orders.paymentStatus",
          payment_method: "$orders.paymentMethod",
          product_details: "$orders.productDetails",
          shipping_address: "$orders.shippingAddress.item",
          date: "$orders.createdAt",
          discountPercentage:"$orders.discountPercentage",
          discountAmount:"$orders.discountAmount",
          couponCode:"$orders.couponCode",
          total: { $toDouble: "$orders.totalPrice" },
          orderStatus: "$orders.orderStatus",
        },
      },
    ]);

    return result;
    
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  updateAddress,
  createAddress,
  getOrderDetails,
  getOrderDataById,
};
