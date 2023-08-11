const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const Address = require("../models/userAddressModel");
const User = require("../models/userModel");
const profileHelper = require("../helpers/profileHelper");

const Order = require("../models/orderModel");
const { ObjectId } = require("mongodb");

const easyinvoice = require('easyinvoice');
const fs=require('fs')

const bcrypt = require("bcrypt");

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

// Load profile
const profile = async (req, res) => {
  try {
    const user = res.locals.user;
    console.log(user);
    const orders = await profileHelper.getOrderDetails(user._id);

   const address = await Address.find();
const arr = address.map((x) => x.addresses);

    res.render("dashboard", { user, arr, orders });
  } catch (error) {
    console.log(error.message);
  }
};

///submitt address

const submitAddress = async (req, res) => {
  try {
    const userId = res.locals.user._id;
    console.log(userId);
    const name = req.body.name;
    const mobileNumber = req.body.mno;
    const address = req.body.address;
    const locality = req.body.locality;
    const city = req.body.city;
    const pincode = req.body.pincode;
    const state = req.body.state;

    // Create a new address object
    const newAddress = {
      name: name,
      mobileNumber: mobileNumber,
      address: address,
      locality: locality,
      city: city,
      pincode: pincode,
      state: state,
    };

    const updatedUser = await profileHelper.updateAddress(userId, newAddress);
    if (!updatedUser) {
      // No matching document found, create a new one
      await profileHelper.createAddress(userId, newAddress);
    }

    res.json({ message: "Address saved successfully!" });

    console.log(result);

    res.redirect("/profile"); // Redirect to the profile page after saving the address
  } catch (error) {
    console.log(error.message);
  }
};

///edit address

const editAddress = async (req, res) => {
  console.log("hai");
  const id = req.body.id;
  const name = req.body.name;
  const address = req.body.address;
  const locality = req.body.locality;
  const city = req.body.city;
  const pincode = req.body.pincode;
  const state = req.body.state;
  const mobileNumber = req.body.mobileNumber;

  const update = await Address.updateOne(
    { "addresses._id": id }, // Match the document with the given ID
    {
      $set: {
        "addresses.$.name": name,
        "addresses.$.address": address,
        "addresses.$.locality": locality,
        "addresses.$.city": city,
        "addresses.$.pincode": pincode,
        "addresses.$.state": state,
        "addresses.$.mobileNumber": mobileNumber,
      },
    }
  );

  res.redirect("/profile");
};

///delete address

const deleteAddress = async (req, res) => {
  const userId = res.locals.user._id;
  console.log(userId);
  const addId = req.body.addressId;
  console.log("user" + userId);
  console.log(addId);

  const deleteobj = await Address.updateOne(
    { user: userId }, // Match the user based on the user ID
    { $pull: { addresses: { _id: addId } } } // Remove the object with matching _id from addresses array
  );

  res.redirect("/profile");
};

///edit info

const editInfo = async (req, res) => {
  try {
    const userId = res.locals.user._id;
    console.log("userid:" + userId);
    const { fname, lname, email, mobile } = req.body;

    const result = await User.updateOne(
      { _id: userId }, // Specify the user document to update based on the user ID
      { $set: { fname, lname, email, mobile } } // Set the new field values
    );

    res.redirect("/profile");
  } catch (error) {
    console.log(error.message);
  }
};

//editPassword
const editPassword = async (req, res) => {
  try {
    const newPass = req.body.newPass;
    console.log(newPass);
    const confPass = req.body.confPass;
    console.log(confPass);
    
    const userId = res.locals.user._id;

    console.log(userId);

    if (newPass === confPass) {
      const spassword = await securePassword(confPass);

      const result = await User.updateOne(
        { _id: userId },
        { $set: { password: spassword } }
      );

      console.log(result)
      res.redirect("/profile");
    }
  } catch (error) {
    console.log(error.message);
  }
};


///viewOrder
const viewOrder = async (req, res) => {
  try {
    const orderId = req.query.id;
    const result = await profileHelper.getOrderDataById(orderId);

    const timestamp = result[0].date;
    const date = new Date(timestamp);

    const formattedDate = date.toLocaleDateString("en-US");
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });

  

    res.render("profileOrderSlip", { result, formattedDate, formattedTime });
  } catch (error) {
    console.log(error.message);
  }
};

const cancelOrder = async (req, res) => {
  try {
   const  orderId = req.body.orderId;
    const status = req.body.status;
    console.log(orderId);
    const result = await Order.updateOne(
      { "orders._id": new ObjectId(orderId) },
      {
        $set: { "orders.$.orderStatus": status },
      }
    );

  res
      .status(200)
      .json({ success: true, message: "Order status updated successfully." });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ success: false, message: "Error updating order status." });
  }
};



//profile Order List

const profileOrderList=async(req,res)=>{
  try {
    const user = res.locals.user;
    console.log(user);
    const result = await profileHelper.getOrderDetails(user._id)
    const orders = result.reverse()


    if(orders){
      res.render("profileOrderList",{orders})
    }else{

       res.render('profileOrderList',{orders:[]})

    }
   
    
  } catch (error) {
    console.log(error.message);
  }
}

//profile address

const profileAddress = async (req, res) => {
  try {
    const user = res.locals.user._id;

    const result = await Address.find({ user: user });

    if(result.length>0){
    const address = result[0].addresses;


      res.render("address", { address });
    }else{
      res.render("address", { address:[] });

    }

  } catch (error) {
    console.log(error.message);
  }
};



const profileDetails=async(req,res)=>{
  try {

    const id=res.locals.user._id
    const user=await User.findOne({_id:id})
   


    res.render('profileDetails',{user})
    
  } catch (error) {

    console.log(error.message);
    
  }
}

const downloadInvoiceProfile = async (req, res) => {
  try {
    const id = req.query.id;
    newId = new ObjectId(id);

    const orderDetails = await Order.aggregate([
      {
        $unwind: "$orders", // Assuming the array field containing orders is named "orders"
      },
      {
        $match: {
          "orders._id": newId,
        },
      },
    ]);

    console.log(orderDetails);


    const order = {
      id: orderDetails[0].orders._id.toString(),
      total:parseInt( orderDetails[0].orders.totalPrice),
      date: orderDetails[0].orders.createdAt,
      payment: orderDetails[0].orders.paymentMethod,
      name: orderDetails[0].orders.name,
      street: orderDetails[0].orders.shippingAddress.item.address,
      locality: orderDetails[0].orders.shippingAddress.item.locality,
      city: orderDetails[0].orders.shippingAddress.item.city,
      state: orderDetails[0].orders.shippingAddress.item.state,
      pincode: orderDetails[0].orders.shippingAddress.item.pincode,
      product: orderDetails[0].orders.productDetails,
    };


       let timestamp = order.date;
    let date = new Date(timestamp);

    const formattedDate = date.toLocaleDateString("en-US");
   



    const products = order.product.map((product) => ({
      quantity: parseInt(product.quantity),
      description: product.productName,
      "tax-rate": 0,
      price: parseInt(product.productPrice),
      
    }));

    var data = {
      customize: {},
      images: {
        // logo: "https://public.easyinvoice.cloud/img/logo_en_original.png",

        background: "https://public.easyinvoice.cloud/img/watermark-draft.jpg",
      },

      sender: {
        company: "Audiogalore",
        address: "Alappuzha,Kerala",
        zip: "689624",
        city: "Alappuzha",
        country: "India",
      },

      client: {
        company: order.name,
        address: order.street,
        zip: order.pincode,
        city: order.city,
        // state:" <%=order.state%>",
        country: "India",
      },
      information: {
        number: order.id,

        date:formattedDate,
        // Invoice due date
        "due-date": "Nil",
      },

      products: products,
      // The message you would like to display on the bottom of your invoice
      "bottom-notice": "Thank you,Keep shopping.",
    };

    // Create your invoice! Easy!
    easyinvoice.createInvoice(data, async function (result) {
      //The response will contain a base64 encoded PDF file
      // console.log("PDF base64 string: ", result.pdf);
     await fs.promises.writeFile("invoice.pdf", result.pdf, "base64"); // Use fs.promises.writeFile for async writing


      // Set the response headers for downloading the file
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="invoice.pdf"'
      );
      res.setHeader("Content-Type", "application/pdf");

     
       const pdfStream = fs.createReadStream("invoice.pdf");

      // Pipe the stream to the response
      pdfStream.pipe(res);
    });



    

    console.log("order",order);
  } catch (error) {
    console.log(error.message);
  }
};


const walletTransaction = async(req,res)=>{
  try {
    const user = res.locals.user
    // const userData= await User.findOne({_id:user._id})
    const wallet = await User.aggregate([
      {$match:{_id:user._id}},
      {$unwind:"$walletTransaction"},
      {$sort:{"walletTransaction.date":-1}},
      {$project:{walletTransaction:1,wallet:1}}
    ])

    res.render('walletDetails',{wallet})
    
  } catch (error) {
    console.log(error.message);
  }


}






module.exports = {
  profile,
  submitAddress,
  editAddress,
  deleteAddress,
  editInfo,
  editPassword,
  viewOrder,
 cancelOrder,
 profileOrderList,
 profileAddress,
 profileDetails,
 downloadInvoiceProfile,
 walletTransaction
 
};