const couponHelper = require("../helpers/couponHelper");
const Coupon = require("../models/couponModel");




// load add coupon

const loadCouponAdd = async (req, res) => {
  try {
    res.render("addCoupon");
  } catch (error) {
    console.log(error.message);
  }
};

///generateCouponCode

const generateCouponCode = async (req, res) => {
  try {
   const couponCode=await couponHelper.generateCouponCode()
   res.send(couponCode)
 
  } catch (error) {
    console.log(error.message);
  }
};

//addd coupon

const addCoupon=async(req,res)=>{
  try {

  

    const data={
      couponCode: req.body.coupon,
      validity: req.body.validity,
      minPurchase: req.body.minPurchase,
      minDiscountPercentage: req.body.minDiscountPercentage,
      maxDiscountValue: req.body.maxDiscount,
      description: req.body.description,
    }

    const response= await couponHelper.addCouponData(data)
    res.json(response)
    
  } catch (error) {

    console.log(error.message);
    
  }
}


//show coupon list
const couponList= async(req,res)=>{
  try {

    const couponList = await Coupon.find()
    res.render('couponList',{couponList})

    
  } catch (error) {
    
  }
}


//remove coupon

const removeCoupon= async(req,res)=>{
  try {

    const id = req.body.couponId
    const result=await Coupon.deleteOne({_id:id})
    console.log(result);
    res.json({status:true})

    
  } catch (error) {

 

    console.log(error.message);
    
  }
}
const verifyCoupon = async (req, res) => {
  try {
    const userId = res.locals.user._id;
    const couponCode = req.query.couponCode;

    const responce = await couponHelper.verifyCouponData(couponCode, userId);
    res.send(responce)
    console.log("responce",responce);
  } catch (error) {
    console.log(error.message);
  }
};




//apply coupon

const applyCoupon= async (req,res)=>{
  try {

    const userId=res.locals.user._id;
    const subTotal=req.query.subTotal
    const couponCode=req.query.couponCode
    console.log(userId);
    console.log(subTotal);
    console.log(couponCode);


    const response= await couponHelper.applyCoupon(userId,subTotal,couponCode)
    console.log( "response",  response);
    res.send(response)


    
  } catch (error) {
    console.log(error.message);
  }
};




module.exports = {
  verifyCoupon,
  applyCoupon,
  loadCouponAdd,
    generateCouponCode,
    addCoupon,
    couponList,
    removeCoupon
};