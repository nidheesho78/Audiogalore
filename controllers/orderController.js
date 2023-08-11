const Cart = require("../models/cartModel");

const orderHelper = require("../helpers/orderHelper");
const Order = require("../models/orderModel");
const { ObjectId } = require("mongodb");

const couponHelper = require("../helpers/couponHelper");

const easyinvoice = require('easyinvoice');
const fs=require('fs')


const confirmOrder = async (req, res) => {
  try {
    const user = res.locals.user;
    const data = req.body;
    const couponCode=req.body.couponCode
    try {
      const response = await orderHelper.placeOrder(data, user);
      console.log(response, "response");

      if (data.paymentOption === "cod") {
        res.json({ codStatus: true });
      
      } 
      else if (data.paymentOption === "wallet") {
        res.json({ orderStatus: true });
        await Cart.deleteOne({ user:user._id  })
      }else {
        if (data.paymentOption === "razorpay") {
          const orderId = await orderHelper.getOrderId(user._id);
          const total = await orderHelper.findLastTotal(user._id);
          const order = await orderHelper.generateRazorpay(
            orderId.toString(),
            total
          );

          res.json({ order: order });
        }
      }
      const addCouponToUser= await couponHelper.addCouponToUser(couponCode,user._id);
    

    } catch (error) {
      console.log("got here ----");
      console.log({ error: error.message }, "errr");
      res.json({ status: false, error: error.message });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const orderSlip = async (req, res) => {
  try {
    const userId = res.locals.user._id;

    const result = await orderHelper.getOrderNumber(userId);

    const date = result[0].lastOrder.createdAt.toLocaleDateString();
    const product = result[0].productDetails;
    console.log( 'product', product );
    //console.log( result);

    const order = {
      id: result[0].lastOrder._id.toString(),
      total: result[0].lastOrder.totalPrice,
      date: date,
      payment: result[0].lastOrder.paymentMethod,
      name: result[0].lastOrder.name,
      street: result[0].address.address,
      locality: result[0].address.locality,
      city: result[0].address.city,
      state: result[0].address.state,
      pincode: result[0].address.pincode,
      product: result[0].productDetails,
    };

    res.render("order", { order });
  } catch (error) {
    console.error(error);
  }
};

//verify payment

const verifyPayment = (req, res) => {
  try {
    console.log(req.body);
const user = res.locals.user
  orderHelper
    .verifyPayment(req.body)
    .then(() => {
      orderHelper.changePaymentStatus(req.body.order.receipt,user).then(() => {
        console.log("payment succcessfull");
        res.json({ status: true });
      });
    })
    .catch((err) => {
      console.log("err", err);
      res.json({ status: false, errMsg: "Payment Failed" });
    });
    
  } catch (error) {

    console.log(error.message);
    
  }
}

// const downloadInvoice = async (req, res) => {
//   try {
//     uderId = res.locals.user._id;

//     result = await orderHelper.getOrderNumber(uderId);

//     const date = result[0].lastOrder.createdAt.toLocaleDateString();
//     const product = result[0].productDetails;

//     //console.log( result);

//     const order = {
//       id: result[0].lastOrder._id.toString(),
//       total: parseInt(result[0].lastOrder.totalPrice),
//       date: date,
//       payment: result[0].lastOrder.paymentMethod,
//       name: result[0].lastOrder.name,
//       street: result[0].address.address,
//       locality: result[0].address.locality,
//       city: result[0].address.city,
//       state: result[0].address.state,
//       pincode: result[0].address.pincode,
//       product: result[0].productDetails,
//     };

//     const products = order.product.map((product) => ({
//       quantity: parseInt(product.quantity),
//       description: product.productName,
//       "tax-rate": 0,
//       price: parseInt(product.productPrice),
//     }));

//     var data = {
//       customize: {},
//       images: {
//         // logo: "https://public.easyinvoice.cloud/img/logo_en_original.png",

//         background: "https://public.easyinvoice.cloud/img/watermark-draft.jpg",
//       },

//       sender: {
//         company: "Lace it",
//         address: "Kottayam,Kerala",
//         zip: "686633",
//         city: "Kottayam",
//         country: "India",
//       },

//       client: {
//         company: order.name,
//         address: order.street,
//         zip: order.pincode,
//         city: order.city,
//         // state:" <%=order.state%>",
//         country: "India",
//       },
//       information: {
//         number: order.id,

//         date: order.date,
//         // Invoice due date
//         "due-date": "Nil",
//       },

//       products: products,
//       // The message you would like to display on the bottom of your invoice
//       "bottom-notice": "Thank you,Keep shopping.",
//     };

//     // Create your invoice! Easy!
//     easyinvoice.createInvoice(data, async function (result) {
//       //The response will contain a base64 encoded PDF file
//       // console.log("PDF base64 string: ", result.pdf);
//       await fs.writeFileSync("invoice.pdf", result.pdf, "base64");

//       // Set the response headers for downloading the file
//       res.setHeader(
//         "Content-Disposition",
//         'attachment; filename="invoice.pdf"'
//       );
//       res.setHeader("Content-Type", "application/pdf");

//       // Create a readable stream from the PDF base64 string
//       const pdfStream = new Readable();
//       pdfStream.push(Buffer.from(result.pdf, "base64"));
//       pdfStream.push(null);

//       // Pipe the stream to the response
//       pdfStream.pipe(res);
//     });
//   } catch (error) {
//     console.log(error.message);
//   }
// };


const downloadInvoice = async (req, res) => {
  try {
    const userId = res.locals.user._id;

    const result = await orderHelper.getOrderNumber(userId);

    const date = result[0].lastOrder.createdAt.toLocaleDateString();
    const product = result[0].productDetails;

    const order = {
      id: result[0].lastOrder._id.toString(),
      total: parseInt(result[0].lastOrder.totalPrice),
      date: date,
      payment: result[0].lastOrder.paymentMethod,
      name: result[0].lastOrder.name,
      street: result[0].address.address,
      locality: result[0].address.locality,
      city: result[0].address.city,
      state: result[0].address.state,
      pincode: result[0].address.pincode,
      product: result[0].productDetails,
    };

    const products = order.product.map((product) => ({
      quantity: parseInt(product.quantity),
      description: product.productName,
      "tax-rate": 0,
      price: parseInt(product.productPrice),
    }));

    const data = {
      customize: {},
      images: {
        background: "https://public.easyinvoice.cloud/img/watermark-draft.jpg",
      },
      sender: {
        company: "Lace it",
        address: "Kottayam, Kerala",
        zip: "686633",
        city: "Kottayam",
        country: "India",
      },
      client: {
        company: order.name,
        address: order.street,
        zip: order.pincode,
        city: order.city,
        country: "India",
      },
      information: {
        number: order.id,
        date: order.date,
        "due-date": "Nil",
      },
      products: products,
      "bottom-notice": "Thank you, Keep shopping.",
    };

    // Create your invoice! Easy!
    easyinvoice.createInvoice(data, async function (result) {
      try {
        // Write the PDF to a file
        await fs.writeFileSync("invoice.pdf", result.pdf, "base64");

        // Set the response headers for downloading the file
        res.setHeader("Content-Disposition", 'attachment; filename="invoice.pdf"');
        res.setHeader("Content-Type", "application/pdf");

        // Create a readable stream from the PDF base64 string
     const pdfStream = fs.createReadStream("invoice.pdf");

        // Pipe the stream to the response
        pdfStream.pipe(res);
      } catch (error) {
        console.error("Error writing PDF to file:", error.message);
        res.status(500).send("Error generating invoice");
      }
    });
  } catch (error) {
    console.log("Error generating invoice:", error.message);
    res.status(500).send("Error generating invoice");
  }
};


const paymentFailed=async(req,res)=>{

   try {

    console.log("cameeeeeeeeeee");

  
    const order = req.body
    console.log('order',order);
    console.log(order.order.receipt);
    const deleted = await Order.updateOne(
      { "orders._id": new ObjectId(order.order.receipt) },
      { $pull: { orders: { _id:new ObjectId(order.order.receipt) } } }

    )

    console.log(deleted);
    res.send({status:true})
  } catch (error) {
    
  }


}






module.exports = {
  confirmOrder,
  orderSlip,
  verifyPayment,
  downloadInvoice,
paymentFailed


 
  
};
