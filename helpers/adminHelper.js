const Order = require("../models/orderModel");
const User = require("../models/userModel")

const { ObjectId } = require("mongodb");
//changeOrderStatus

const changeOrderStatus = (orderId, status) => {
  try {
    return new Promise((resolve, reject) => {
      Order.updateOne(
        { "orders._id": new ObjectId(orderId) },
        {
          $set: { "orders.$.orderStatus": status },
        }
      ).then((response) => {
       
        resolve(response);
      });
    });
  } catch (error) {
    console.log(error.message);
  }
};

//find order

const findOrder = (orderId) => {
  try {
    return new Promise((resolve, reject) => {
      Order.aggregate([
        {
          $match: {
            "orders._id": new ObjectId(orderId),
          },
        },
        { $unwind: "$orders" },
      ]).then((response) => {
        const orders = response
          .filter((element) => {
            if (element.orders._id == orderId) {
              return true;
            }
            return false;
          })
          .map((element) => element.orders);

        resolve(orders);
      });
    });
  } catch (error) {
    console.log(error.message);
  }
};

// ///return order
// const returnOrder = (orderId, status) => {
//   try {
//     return new Promise(async (resolve, reject) => {
//       Order.findOne({ "orders._id": new ObjectId(orderId) })
//         .then((orders) => {
//           const order = orders.orders.find((order) => order._id == orderId);

//           if (status == "Return Declined") {
//             Order.updateOne(
//               { "orders._id": new ObjectId(orderId) },
//               {
//                 $set: {
//                   "orders.$.orderStatus": status,
//                   "orders.$.paymentStatus": "No Refund",
//                 },
//               }
//             ).then((response) => {
//               resolve(response);
//             });
//           } else if (status == "Return Accepted") {
//             Order.updateOne(
//               { "orders._id": new ObjectId(orderId) },
//               {
//                 $set: {
//                   "orders.$.orderStatus": status,
//                   "orders.$.paymentStatus": "Refund Credited to Wallet",
//                 },
//               }
//             ).then((response) => {
//               resolve(response);
//             });
//           }
//         })
//         .catch((error) => {
//           reject(error);
//         });
//     });
//   } catch (error) {
//     console.log(error.message);
//   }
// };
//  const cancelOrder = (orderId,userId, status) => {
//     try {

     
//       return new Promise(async (resolve, reject) => {
//         Order.findOne({ "orders._id": new ObjectId(orderId) }).then(async(orders) => {
//           const order = orders.orders.find((order) => order._id == orderId);
//           if(order.paymentMethod=='cod'){
  
//           if (status == 'Cancel Accepted') {
//             Order.updateOne(
//               { "orders._id": new ObjectId(orderId) },
//               {
//                 $set: {
//                   "orders.$.cancelStatus": status,
//                   "orders.$.orderStatus": status,
//                   "orders.$.paymentStatus": "No Refund"
//                 }
//               }
//             )
            
            
//           }else if(status == 'Cancel Declined'){
//             Order.updateOne(
//               { "orders._id": new ObjectId(orderId) },
//               {
//                 $set: {
//                   "orders.$.cancelStatus": status,
//                   "orders.$.orderStatus": status,
//                   "orders.$.paymentStatus": "No Refund"
//                 }
//               }
//             ).then(async(response) => {
//               resolve(response);
//             });
            

//           }
//         }else if(order.paymentMethod=='wallet'||order.paymentMethod=='razorpay'){
//                     console.log(status);

//           if (status == 'Cancel Accepted') {
//   Order.updateOne(
//     { "orders._id": new ObjectId(orderId) },
//     {
//       $set: {
//         "orders.$.cancelStatus": status,
//         "orders.$.orderStatus": status,
//         "orders.$.paymentStatus": "Refund Credited to Wallet"
//       }
//     }
//   ).then(async (response) => {
//     console.log("Fetching user with ID:", userId);
//     const user = await User.findOne({ _id: userId });
//     console.log("Fetched user:", user);

//     user.wallet += parseInt(order.totalPrice);
//     await user.save();
    
//     const walletTransaction = {
//       date: new Date(),
//       type: "Credit",
//       amount: order.totalPrice,
//     };
//     const walletupdated = await User.updateOne(
//       { _id: userId },
//       {
//         $push: { walletTransaction: walletTransaction },
//       }
//     );
//     resolve(response);
//   });



//           }else if(status == 'Cancel Declined'){
//             Order.updateOne(
//               { "orders._id": new ObjectId(orderId) },
//               {
//                 $set: {
//                   "orders.$.cancelStatus": status,
//                   "orders.$.orderStatus": status,
//                   "orders.$.paymentStatus": "No Refund"
//                 }
//               }
//             ).then((response) => {
//               resolve(response);
//             });
//           }

//         }
//         });
//       });
//     } catch (error) {
//       console.log(error.message);
//     }
//   };

 const returnOrder = (orderId,user,status) => {
  try {
    console.log('returnOrderUSERdata',user);
    const USER=user
    console.log('returnOrderUSER',USER);
    return new Promise(async (resolve, reject) => {
      Order.findOne({ "orders._id": new ObjectId(orderId) })
        .then((orders) => {
          const order = orders.orders.find((order) => order._id == orderId);

          if (status == "Return Declined") {
            Order.updateOne(
              { "orders._id": new ObjectId(orderId) },
              {
                $set: {
                  "orders.$.orderStatus": status,
                  "orders.$.paymentStatus": "No Refund",
                },
              }
            ).then((response) => {
              resolve(response);
            })
            .catch((error) => {
              console.log('errorryyy rr',error);
              reject(error);
            });
          } else if (status == "Return Accepted") {
            Order.updateOne(
              { "orders._id": new ObjectId(orderId) },
              {
                $set: {
                  "orders.$.orderStatus": status,
                  "orders.$.paymentStatus": "Refund Credited to Wallet",
                },
              }
            ).then(async (response) => {
              console.log('USER',user);
              const userr = await User.findOne({ _id: user._id});
              
              const currentWalletAmount = parseInt(userr.wallet);
              const orderTotalPrice = parseInt(order.totalPrice);
              userr.wallet = (currentWalletAmount + orderTotalPrice).toString();
              await userr.save();
              const walletTransaction = {
                date:new Date(),
                type:"Credit",
                amount:order.totalPrice,
              }
              const walletupdated = await User.updateOne(
                { _id: user._id },
                {
                  $push: { walletTransaction: walletTransaction },
                }
              )
              resolve(response);
            }).catch((error) => {
              console.log('errorrrr',error);
              reject(error);
            });
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  } catch (error) {
    console.log(error.message);
  }
};

const getOnlineCount = () => {
  try{
  return new Promise(async (resolve, reject) => {
    const response = await Order.aggregate([
      {
        $unwind: "$orders",
      },
      {
        $match: {
          "orders.paymentMethod": "razorpay",
        },
      },
      {
        $group: {
          _id: null,
          totalPriceSum: { $sum: { $toInt: "$orders.totalPrice" } },
          count: { $sum: 1 },
        },
      },
    ]);
    resolve(response);
  });
}catch(error){
  console.log(error.message,'getOnlineCount')
}
};

///get sales report

const getSalesReport = () => {
  try {
    return new Promise((resolve, reject) => {
      Order.aggregate([
        {
          $unwind: "$orders",
        },
        {
          $match: {
            "orders.orderStatus": "Delivered",
          },
        },
      ]).then((response) => {
        resolve(response);
      });
    });
  } catch (error) {
    console.log(error.message);
  }
};

const postReport = (date) => {
  console.log(date, "date+++++");
  try {
    const start = new Date(date.startdate);
    const end = new Date(date.enddate);
    return new Promise((resolve, reject) => {
      Order.aggregate([
        {
          $unwind: "$orders",
        },
        {
          $match: {
            $and: [
              { "orders.orderStatus": "Delivered" },
              {
                "orders.createdAt": {
                  $gte: start,
                  $lte: new Date(end.getTime() + 86400000),
                },
              },
            ],
          },
        },
      ])
        .exec()
        .then((response) => {
          console.log(response, "response---");
          resolve(response);
        });
    });
  } catch (error) {
    console.log(error.message);
  }
};
const getWalletCount =  () => {
  try{


    return new Promise(async (resolve, reject) => {
      const response = await Order.aggregate([
        {
          $unwind: "$orders",
        },
        {
          $match: {
            "orders.paymentMethod": "wallet",
            "orders.orderStatus": "Delivered" 

          },
        },
        {
          $group:{
            _id: null,
          totalPriceSum: { $sum: { $toInt: "$orders.totalPrice" } },
          count: { $sum: 1 }

          }

        }

      ]);
      resolve(response);
    });
  }catch(error){
    console.log(error.message)
  }
  }

  const getCodCount =  () => {
    try{
    return new Promise(async (resolve, reject) => {
      const response = await Order.aggregate([
        {
          $unwind: "$orders",
        },
        {
          $match: {
            "orders.paymentMethod": "cod",
            "orders.orderStatus": "Delivered" 

          },
        },
        {
          $group:{
            _id: null,
          totalPriceSum: { $sum: { $toInt: "$orders.totalPrice" } },
          count: { $sum: 1 }

          }

        }

      ]);
      resolve(response);
    });
  }catch(error){
    conosle.log(error.message)
  }
  }



const getCancelReport = () => {
  try {
    return new Promise((resolve, reject) => {
      Order.aggregate([
        {
          $unwind: "$orders",
        },
        {
          $match: {
            "orders.orderStatus": "Cancel Accepted", // Assuming the order status for cancellation is "Cancelled"
          },
        },
      ]).then((response) => {
        resolve(response);
      });
    });
  } catch (error) {
    console.log(error.message);
  }
};

const postCancelReport = (date) => {
  
  try {
    const start = new Date(date.startdate);
    const end = new Date(date.enddate);
    return new Promise((resolve, reject) => {
      Order.aggregate([
        {
          $unwind: "$orders",
        },
        {
          $match: {
            $and: [
              { "orders.orderStatus": "Cancel Accepted" }, // Assuming orderStatus field represents the order status
              {
                "orders.canceledAt": {
                  $gte: start,
                  $lte: new Date(end.getTime() + 86400000),
                },
              },
            ],
          },
        },
        {
          $project: {
            _id: '$orders._id',
            shippingAddress: '$orders.shippingAddress',
            productDetails: '$orders.productDetails',
            totalPrice: '$orders.totalPrice',
            paymentMethod: '$orders.paymentMethod',
            canceledAt: '$orders.canceledAt',
          orderStatus: "$orders.orderStatus", 
          
          },
        },
      ])
      .exec()
      .then((response) => {
        console.log(response, "response---");
        resolve(response);
      });
    });
  } catch (error) {
    console.log(error.message);
  }
};


module.exports = {
  findOrder,
  // cancelOrder,
  changeOrderStatus,
  returnOrder,
  getOnlineCount,
  getSalesReport,
  postReport,
   getWalletCount,
    getCodCount,
  getCancelReport,
  postCancelReport
};
 