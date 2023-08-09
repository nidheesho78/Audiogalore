const Admin = require("../models/adminModel");
const User = require("../models/userModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const jwt = require("jsonwebtoken");
const adminHelper = require("../helpers/adminHelper");
const { ObjectId } = require("mongodb");

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, "my-secret", {
    expiresIn: maxAge,
  });
};

/////load login page

const loadLogin = async (req, res) => {

 
  try {
    res.render("sign-in", { message: "" });
  } catch (error) {
    console.log(error.message);
  } 
};

///verify login

const verifyLogin = async (req, res) => {
  try {
    const userName = req.body.userName;
    const password = req.body.password;
    const adminData = await Admin.findOne({ userName: userName });
    if (adminData.password === password) {
      // const passwordMatch = await bcrypt.compare(password,userData.password)
      if (adminData) {
        const token = createToken(adminData._id);
        res.cookie("jwtadmin", token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.redirect("/admin/dashboard");
      } else {
        res.render("sign-in", { message: "Email and Password are Incorrect" });
      }
    } else {
      res.render("sign-in", { message: "Email and Password are Incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};


const loadDashboard = async (req, res) => {
  try {
     const page = parseInt(req.query.page) || 1; // Default to page 1
    const pageSize = parseInt(req.query.pageSize) || 5; // Default to 5 rows per page

    const skip = (page - 1) * pageSize;
    const orders = await Order.aggregate([
      { $unwind: "$orders" },
      {
        $group: {
          _id: null,
          totalPriceSum: { $sum: { $toInt: "$orders.totalPrice" } },
          count: { $sum: 1 },
        },
      },
    ]);

    const salesData = await Order.aggregate([
      { $skip: skip },
      { $limit: pageSize },
      { $unwind: "$orders" },
      {
        $match: {
          "orders.orderStatus": "Delivered"  // Consider only completed orders
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {  // Group by the date part of createdAt field
              format: "%Y-%m-%d",
              date: "$orders.createdAt"
            }
          },
          dailySales: { $sum: { $toInt: "$orders.totalPrice" } }  // Calculate the daily sales
        } 
      }, 
      {
        $sort: {
          _id: 1  // Sort the results by date in ascending order
        }
      }
    ])
    const categorySales = await Order.aggregate([
      { $unwind: "$orders" },
      { $unwind: "$orders.productDetails" },
      {
        $match: {
          "orders.orderStatus": "Delivered",
        },
      },
      {
        $project: {
          CategoryId: "$orders.productDetails.category",
          totalPrice: {
            $multiply: [
              { $toDouble: "$orders.productDetails.productPrice" },
              { $toDouble: "$orders.productDetails.quantity" },
            ],
          },
        },
      },
      {
        $group: {
          _id: "$CategoryId",
          PriceSum: { $sum: "$totalPrice" },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      {
        $unwind: "$categoryDetails",
      },
      {
        $project: {
          categoryName: "$categoryDetails.name",
          PriceSum: 1,
          _id: 0,
        },
      },
    ]);

   
    const monthlySalesData = await Order.aggregate([
      { $unwind: "$orders" },
      {
        $match: {
          "orders.orderStatus": "Delivered", // Consider only completed orders
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { // Group by the year and month part of createdAt field
              format: "%Y-%m",
              date: "$orders.createdAt",
            },
          },
          monthlySales: { $sum: { $toInt: "$orders.totalPrice" } }, // Calculate the monthly sales
        },
      },
      {
        $sort: {
          _id: 1, // Sort the results by date in ascending order
        },
      },
    ]);

    const yearlySalesData = await Order.aggregate([
      { $unwind: "$orders" },
      {
        $match: {
          "orders.orderStatus": "Delivered", // Consider only completed orders
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { // Group by the year part of createdAt field
              format: "%Y",
              date: "$orders.createdAt",
            },
          },
          yearlySales: { $sum: { $toInt: "$orders.totalPrice" } }, // Calculate the yearly sales
        },
      },
      {
        $sort: {
          _id: 1, // Sort the results by date in ascending order
        },
      },
    ]);

    const salesCount = await Order.aggregate([
      { $unwind: "$orders" },
      {
        $match: {
          "orders.orderStatus": "Delivered"  
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {  // Group by the date part of createdAt field
              format: "%Y-%m-%d",
              date: "$orders.createdAt"
            }
          },
          orderCount: { $sum: 1 }  // Calculate the count of orders per date
        }
      },
      {
        $sort: {
          _id: 1  // Sort the results by date in ascending order
        }
      }
    ])



    const categoryCount  = await Category.find({}).count()

    const productsCount  = await Product.find({}).count()

    const onlinePay = await adminHelper.getOnlineCount()
    const walletPay = await adminHelper.getWalletCount()
    const codPay = await adminHelper.getCodCount()


    const latestorders = await Order.aggregate([
      {$unwind:"$orders"},
      {$sort:{
        'orders.createdAt' :-1
      }},
      {$limit:10}
    ]) 


      res.render('dashboard',{orders,productsCount,categoryCount,
        onlinePay,salesData,order:latestorders,salesCount,
        walletPay,codPay,categorySales, monthlySalesData,
      yearlySalesData,})
  } catch (error) {
      console.log(error)
  }
}


//loadusers

const loadUsers = async (req, res) => {
  try {
    const search = "";
    if (req.query.search) {
      search = req.query.search;
    }
    const usersData = await User.find({
      $or: [
        { fname: { $regex: ".*" + search + ".*" } },
        { lname: { $regex: ".*" + search + ".*" } },
        { email: { $regex: ".*" + search + ".*" } },
        { mobile: { $regex: ".*" + search + ".*" } },
      ],
    });
    console.log(usersData);

    res.render("users1", { user: usersData });
  } catch (error) {
    console.log(error.message);
  }
};



//block user

const blockUser = async (req, res) => {
  try {
    const id = req.query.id;
    await User.findByIdAndUpdate({ _id: id }, { $set: { is_blocked: true } });
    res.redirect("/admin/users");
  } catch (error) {
    console.log(error);
  }
};

///load edit user

const loadEditUser = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.findById({ _id: id });
    if (userData) {
      res.render("editUser", { user: userData });
    } else {
      res.redirect("/admin/users");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//update user
const updateUser = async (req, res) => {
  try {
    const userData = await User.findByIdAndUpdate(
      { _id: req.body.id },
      {
        $set: {
          fname: req.body.fname,
          lname: req.body.lname,
          email: req.body.email,
          mobile: req.body.mobile,
        },
      }
    );
    res.redirect("/admin/users");
  } catch (error) {
    console.log(error.message);
  }
};

//unblockuser

const unBlockUser = async (req, res) => {
  try {
    const id = req.query.id;
    await User.findByIdAndUpdate({ _id: id }, { $set: { is_blocked: false } });
    res.redirect("/admin/users");
  } catch (error) {
    console.log(error);
  }
};


const orderList = async (req, res) => {
  try {
   

    const totalOrders = await Order.aggregate([
      { $unwind: "$orders" },
      { $group: { _id: null, count: { $sum: 1 } } },
    ]);
    const count = totalOrders.length > 0 ? totalOrders[0].count : 0;
  


    const orders = await Order.aggregate([
      { $unwind: "$orders" },
      { $sort: { "orders.createdAt": -1 } },
    
    ]);

    res.render("orderList", { orders });
  } catch (error) {
    console.log(error.message);
  }
};

//change status

const changeStatus = async(req,res)=>{
  console.log("haiii");
  let orderId = req.body.orderId
  let status = req.body.status
  console.log(orderId)
  adminHelper.changeOrderStatus(orderId, status).then((response) => {
    console.log(response);
    res.send(response);
  });

}



// const cancelOrder = (req,res) => {
//   try {
//     const orderId=req.body.orderId
//     const status=req.body.status
//     return new Promise(async (resolve, reject) => {
//       Order.findOne({ "orders._id": new ObjectId(orderId) }).then((orders) => {
//         const order = orders.orders.find((order) => order._id == orderId);

//         if (status == 'Cancel Accepted' || status == 'Cancel Declined'|| status=='Direct Cancel') {
//           Order.updateOne(
//             { "orders._id": new ObjectId(orderId) },
//             {
//               $set: {
               
//                 "orders.$.orderStatus": status,
//                 "orders.$.paymentStatus": "No Refund"
//               }
//             }
//           ).then((response) => {
//             resolve(response);
            
//           });
//         }
//       });
//     });
//   } catch (error) {
//     console.log(error.message);
//     }
//   };



const cancelOrder = (req, res) => {
  try {
    console.log("primaryy");
    const orderId = req.body.orderId;
    const status = req.body.status;
    console.log("status", status);
    return new Promise(async (resolve, reject) => {
      Order.findOne({ "orders._id": new ObjectId(orderId) }).then((orders) => {
        const order = orders.orders.find((order) => order._id == orderId);

        if (
          status == "Cancel Accepted" ||
          status == "Cancel Declined" ||
          status == "Direct Cancel"
        ) {
          Order.updateOne(
            { "orders._id": new ObjectId(orderId) },
            {
              $set: {
                "orders.$.orderStatus": status,
                "orders.$.paymentStatus": "No Refund",
                 "orders.$.canceledAt": new Date()
              },
            }
          ).then((response) => {
            resolve(response);
          });
        }

        if (
          order.paymentMethod == "wallet" ||
          order.paymentMethod == "razorpay"
        ) {
          console.log("one");

          if (status == "Cancel Accepted" ||status == " Direct Cancel") {
            console.log("two");
   

            Order.updateOne(
              { "orders._id": new ObjectId(orderId) },
              {
                $set: {
                  "orders.$.orderStatus": status,
                  "orders.$.paymentStatus": "Refund Credited to Wallet",
                  
                

                },
              }
            ).then(async (response) => {
              const userId = res.locals.user._id;
              console.log("CANCEL",response);

              console.log(response);
              const user = await User.findOne({ _id: userId });
              const currentWalletAmount = parseInt(user.wallet);
              const orderTotalPrice = parseInt(order.totalPrice);
              user.wallet = (currentWalletAmount + orderTotalPrice).toString();
              await user.save();

              const walletTransaction = {
                date: new Date(),
                type: "Credit",
                amount: order.totalPrice,
              };
              const walletupdated = await User.updateOne(
                { _id: userId },
                {
                  $push: { walletTransaction: walletTransaction },
                }
              );
              resolve(response);
            });
          }
          // if(status == ' Cancel Declined'){
          //   Order.updateOne(
          //     { "orders._id": new ObjectId(orderId) },
          //     {
          //       $set: {
          //         "orders.$.cancelStatus": status,
          //         "orders.$.orderStatus": status,
          //         "orders.$.paymentStatus": "No Refund"
          //       }
          //     }
          //   ).then((response) => {
          //     resolve(response);
          //   });
          // }
        }
      });
    });
  } catch (error) {
    console.log(error.message);
  }
};



const orderDetails = async (req,res)=>{
    try {
      const id = req.query.id
      console.log(id);
      adminHelper.findOrder(id).then((orders) => {
        const address = orders[0].shippingAddress
        const products = orders[0].productDetails 
        res.render('orderSlip',{orders,address,products}) 
      });
  
        
    } catch (error) {
      console.log(error.message);
    }
  
  }

//return order

// const returnOrder = async(req,res)=>{
//   const orderId = req.body.orderId
//   const status = req.body.status
 


//   adminHelper.returnOrder(orderId,status).then((response) => {
//     res.send(response);
//   });

// }

// const cancelOrder = async(req,res)=>{
//   const userId = req.body.userId

//   const orderId = req.body.orderId
//   const status = req.body.status

//   adminHelper.cancelOrder(orderId,userId,status).then((response) => {
//     res.send(response);
//   });

// }
const returnOrder = async(req,res)=>{
  const orderId = req.body.orderId
  console.log(orderId,'////////////')
  const status = req.body.status
  console.log(status,'dsafsdfsdfdsfdf')
  const user = req.body.user
  console.log(user,'hbhjnj')


  adminHelper.returnOrder(orderId,user,status).then((response) => {
    res.send(response);
  });

}  




////salesReport
const getSalesReport = async (req, res) => {
  const report = await adminHelper.getSalesReport();
  let details = [];
   let totalSales = 0;
  const getDate = (date) => {
    const orderDate = new Date(date);
    const day = orderDate.getDate();
    const month = orderDate.getMonth() + 1;
    const year = orderDate.getFullYear();
    return `${isNaN(day) ? "00" : day} - ${isNaN(month) ? "00" : month} - ${
      isNaN(year) ? "0000" : year
    }`;
  };

  report.forEach((orders) => {
    details.push(orders.orders);
    totalSales += parseFloat(orders.orders.totalPrice); 
  });

  res.render("salesReport", { details, getDate,  totalSales });
};

const postSalesReport = (req, res) => {
  const admin = req.session.admin;
  const details = [];
   let totalSales = 0;
  const getDate = (date) => {
    const orderDate = new Date(date);
    const day = orderDate.getDate();
    const month = orderDate.getMonth() + 1;
    const year = orderDate.getFullYear();
    return `${isNaN(day) ? "00" : day} - ${isNaN(month) ? "00" : month} - ${
      isNaN(year) ? "0000" : year
    }`;
  };

 adminHelper.postReport(req.body).then((orderData) => {
    console.log(orderData, "orderData");
    orderData.forEach((orders) => {
      details.push(orders.orders);
    totalSales += parseFloat(orders.orders.totalPrice);

    });
    console.log(details, "details");
    res.render("salesReport", { details, getDate, totalSales });
  });
};





const getCancelReport = async (req, res) => {
  const report = await adminHelper.getCancelReport();
  let details = [];
  const getDate = (date) => {
    const cancelDate = new Date(date);
    const day = cancelDate.getDate();
    const month = cancelDate.getMonth() + 1;
    const year = cancelDate.getFullYear();
    return `${isNaN(day) ? "00" : day} - ${isNaN(month) ? "00" : month} - ${
      isNaN(year) ? "0000" : year
    }`;
  };

  report.forEach((orders) => {
    details.push(orders.orders);
  });

  res.render("cancelReport", { details, getDate });
};

const postCancelReport = (req, res) => {
  const admin = req.session.admin;
  const details = [];
  const getDate = (date) => {
    const cancelDate = new Date(date);
    const day = cancelDate.getDate();
    const month = cancelDate.getMonth() + 1;
    const year = cancelDate.getFullYear();
    return `${isNaN(day) ? "00" : day} - ${isNaN(month) ? "00" : month} - ${
      isNaN(year) ? "0000" : year
    }`;
  };

  adminHelper.postCancelReport(req.body).then((orderData) => {
    orderData.forEach((orders) => {
      details.push(orders.orders);
    });
    console.log(details, "details");
    res.render("cancelReport", { details, getDate });
  });
};




const logout = (req, res) => {
  res.clearCookie("jwtadmin"); 
  res.redirect("/admin");
};

module.exports = {
  loadLogin,
  loadDashboard,
  verifyLogin,
  loadUsers,
  blockUser,
  loadEditUser,
  updateUser,
  unBlockUser,
  logout,
  orderList,
  changeStatus,
  cancelOrder,
  orderDetails,
  returnOrder,
  getSalesReport,
  postSalesReport,
 getCancelReport,
 postCancelReport
  
};
