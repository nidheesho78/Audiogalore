const User = require("../models/userModel");
const Product = require("../models/productModel");
const jwt = require("jsonwebtoken");
const otpHelper = require('../helpers/otpHelper')
const Banner = require('../models/bannerModel')
const Address = require("../models/userAddressModel");
const Cart = require("../models/cartModel");
const Category = require("../models/categoryModel");
const { ObjectId } = require("mongodb"); 
const bcrypt = require("bcrypt");
const profileHelper = require('../helpers/profileHelper')
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({ id }, "my-secret", {
        expiresIn: maxAge,
    });
};



const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
};
 module.exports.homeLoad = async (req, res) => {

    try {

      const banner = await Banner.find({})
        const category = await Category.find({ })
      
        const product = await Product.find({}).skip(2).limit(5)
        console.log(product);

        const user = res.locals.user
        console.log(user);
        res.render("home", { user, product,category,banner });

    } catch (error) {
        console.log(error.message);
        res.redirect('/404Error')
    }
};



///register user page

module.exports.loadRegister = async (req, res) => {
    try {
        res.render("register");
    } catch (error) {
        console.log(error.message);
        res.redirect('/500Error')
    }
};


//submit register  and send otp
module.exports.insertUser = async (req, res) => {
  try {
    const email = req.body.email;
    const num = req.body.mno;
    const fname = req.body.fname.trim();
    const lname = req.body.lname.trim();
    const password = req.body.password.trim();
    const confpass  = req.body.confpass.trim();
    if (!email || !num || !fname || !lname || !password || !confpass) {
      return res.render("register", { message: "Please fill in all the fields" });
    }


    const existingUser = await User.findOne({ email: email });
    const existingNum = await User.findOne({ mobile: num });

    if (existingUser) {
      return res.render("register", { message: "Email already exists" });
    }
    if (existingNum) {e
      return res.render("register", { message: "Number already exists" });
    }

    if (/\d/.test(req.body.fname) || /\d/.test(req.body.lname)) {
      return res.render("register", {
        message: "Name should not contain numbers",
      });
    }

    if (!/^(\+91)?\d{10}$/.test(num)) {
      return res.render("register", { message: "Mobile number should contain +91 as prefix and should not contain any characters and symbol" });
    }

  
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%#?&])[a-zA-Z\d@$!%#?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.render("register", { message: "Password must conatain 1 special character 1 uppercase character and 1 number and strength should be 8" });
    }
    const confPassRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%#?&])[a-zA-Z\d@$!%#?&]{8,}$/;
    if(!confPassRegex.test(confpass)){
      return res.render("register", { message: "Password must conatain 1 special character 1 uppercase character and 1 number and strength should be 8" });

    }
     if (password !== confpass) {
      return res.render("register", { message: "Passwords do not match" });
    }

    await otpHelper.sendOtp(num);
    try {
      req.session.userData = req.body;
      req.session.mobile = num;
      res.render("verifyOtp");
    } catch (error) {
      console.log(error.message); 
      res.redirect("/error-500");
    }
  } catch (error) {
    console.log(error.message);
  }
};


///login page


module.exports.loginLoad = async (req, res) => {
    try {
      if(res.locals.user!=null){
        res.redirect('/')
      }else{

        
        res.render("userLogin");
      }

     
    } catch (error) {
        console.log(error.message);
        res.redirect('500Error')
    }
};

//verify login

module.exports.verifyLogin = async (req, res) => {
    try {


        const emailRegex = /^([a-zA-Z0-9\._]+)@([a-zA-Z0-9]+)\.([a-z]+)(\.[a-z]+)?$/;

        
        const email = req.body.email;
        const password = req.body.password;

        if (!email) {
            return res.render("userLogin", { message: "Email must be filled" });
        }
        if (!emailRegex.test(email)) {
            return res.render("userLogin", { message: "Invalid email format" });
        }

        if (!password) {
            return res.render("userLogin", { message: "Password must be filled" });
        }



        const userData = await User.findOne({ email: email });

        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            console.log(passwordMatch);
            if (passwordMatch) {
                if (userData.is_blocked == true) {
                    return res.render("userLogin", { message: "Your Account is Blocked" });
                } else {
                    const token = createToken(userData._id);
                    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
                    req.session.id = userData._id;
                    return res.redirect("/");
                   
                }
            } else {
                return res.render("userLogin", { message: "Email and Password are Incorrect" });
            }
        } else {
            return res.render("userLogin", { message: "Email and Password are Incorrect" });
        }
    } catch (error) {
        console.log(error.message);
    }
};





///resend otp

module.exports.resendOTP = async (req, res) => {
    const mobileNumber = req.session.mobile;
    try {
        // Retrieve user data from session storage
        const userData = req.session.userData;
       

        if (!userData) {
            res.status(400).json({ message: "Invalid or expired session" });
        }

        // Generate and send new OTP using Twilio
           await otpHelper.sendOtp(mobileNumber);

        req.session.otp = otp;

    
      
        console.log(`Resend Otp is ${otp}`);

        res.render("verifyOtp", { message: "OTP Resend Successfully" });
    } catch (error) {
        console.error("Error: ", error);
        res.render("verifyOtp", { message: "Failed to send otp" });
    }
};
module.exports.getMobile = async (req,res) =>{
  try{
    res.render('verifyOtp')
  }
  catch(error){
    console.log(error.message)
  }
}
module.exports.forgetOtp = async (req, res) => {
    const mobileNumber = req.session.mobile;
    try {
        // Retrieve user data from session storage
        if (!mobileNumber) {
      return res.status(400).json({ message: "Mobile number not found in session" });
    }

       

        // Generate and send new OTP using Twilio
        const otp = otpHelper.sendOtp()
    // await otpHelper.sendOtp(mobileNumber,otp)
         
        req.session.otp = otp;

       
        console.log(`Resend Otp is ${otp}`);

        res.render("otpGen", { message: "OTP Resend Successfully" });
    } catch (error) {
        console.error("Error: ", error);
        res.render("otpGen", { message: "Failed to send otp" });
    }
};
///verify otp
module.exports.verifyOtp = async (req, res) => {
  try {
    const otp = req.body.otp;

  
    const userData = req.session.userData;
    const verified = await otpHelper.verifyCode(userData.mno, otp);

    if (verified) {
      const spassword = await securePassword(userData.password);
      const user = new User({
        fname: userData.fname,
        lname: userData.lname,
        email: userData.email,
        mobile: userData.mno,
        password: spassword,
        is_admin: 0,
      });
      const userDataSave = await user.save();
      if (userDataSave) {
        const token = createToken(user._id);
        res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
        // res.redirect("/");
        res.send(
          '<script>alert("Verification success"); window.location.href = "/login";</script>'
        );
      } else {
        res.render("register", { message: "Registration Failed" });
      }
    } else {
      res.render("verifyOtp", { message: "Wrong Otp" });
    }
  } catch (error) {
    console.log(error.message);
  }
};



///load  forgotpassword page

module.exports.loadForgotPassword = async (req, res) => {
    try {
        res.render("forgetPassword");
    } catch (error) {
        console.log(error.message);
        res.redirect('/500Error')
    }
};

//// forgot password otp verofication

module.exports.forgotPasswordOtp = async (req, res) => {

    try{

    req.session.mobile = req.query.mobileNumber
    const user = await User.findOne({ mobile: req.query.mobileNumber });
   
    if (!user) {
        res.render("forgetPassword", { message: "User Not Registered" });
    } else {
      await otpHelper.sendOtp(req.session.mobile);
      
   

     
        req.session.email = user.email;
        res.render("otpGen", { mobile: req.query.mobileNumber });
    }

} catch(error) {
    console.log(error.message)
}

}



module.exports.resetPasswordOtpVerify = async (req, res) => {
    try {
        const mobile = req.session.mobile;
        const otp = req.session.otp;
        console.log(mobile);
        console.log("session otp", otp);
        const reqOtp = req.body.otp;

    const verified = await otpHelper.verifyCode(mobile, reqOtp);

        const otpHolder = await User.find({ mobile: req.body.mobile });
       if (verified) {
            res.render("changePassword",);
        } else {
            res.render("forgetPassword",{message:"Wrong OTP"})
            
        } 
    } catch (error) {
        console.log(error);
        res.redirect('/500Error')
    }
};



module.exports.setNewPassword = async (req, res) => {

    
    const newpw = req.body.newPassword;
    console.log("new password :",newpw)
    const confpw = req.body.confirmPassword;
    console.log("confirm Password :",confpw)
    const mobile = req.session.mobile;
    const email = req.session.email;
    console.log(mobile);
    console.log(email);

    if (newpw === confpw) {
        const spassword = await securePassword(newpw);
        const newUser = await User.updateOne(
            { email: email },
            { $set: { password: spassword } }
        );
        res.redirect('/login')
        console.log("Password updated successfully");
    } else {
        res.render("resetPassword", {
            message: "Password and Confirm Password is not matching",
        });
    }
};

  

module.exports.displayProduct = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
   
    const limit = 6;
    const skip = (page - 1) * limit; //
    const totalProducts = await Product.countDocuments({ is_listed: true }); // Get the total number of products
    console.log(totalProducts);
    const totalPages = Math.ceil(totalProducts / limit); // Calculate the total number of pages
    

  
    const categories = await Category.find({ isListed: true });
    const catId = await Category.aggregate([
      {
        $match: {
          isListed: true,
        },
      },

      {
        $project: {
          _id: 1,
        },
      },
    ]);

    const products = await Product.find({
      category: { $in: catId },
      is_listed: true,
    })
      .skip(skip)
      .limit(limit);

    console.log(categories);
    res.render("shop", {
      product: products, 
      categories,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.log(error.message);
    res.redirect('/500Error')
  }
};

module.exports.categoryPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const skip = (page - 1) * limit; //

    const categoryId = req.query.id;

    const categories = await Category.find({ isListed: true });

    const product = await Product.aggregate([
      {
        $match: {
          category: new ObjectId(categoryId),
          is_listed: true,
        },
      },
    ])
      .skip(skip)
      .limit(limit);

    const pro = await Product.aggregate([
      {
        $match: {
          category: new ObjectId(categoryId),
          is_listed: true,
        },
      },
    ]);

    const totalProducts = pro.length;

    const totalPages = Math.ceil(totalProducts / limit); // Calculate the total number of pages

    res.render("shopCategory", {
      product,
      categories,
      currentPage: page,
      totalPages,
      categoryId,
    });
  } catch (err) {
    console.log("category page error", err);
  }
};

//search product

module.exports.searchProduct = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;

    const limit = 6;
    const skip = (page - 1) * limit; //
    const searchQuery = req.query.search || "";

    const categories = await Category.find({ isListed: true });
    const catId = await Category.aggregate([
      {
        $match: {
          isListed: true,
        },
      },

      {
        $project: {
          _id: 1,
        },
      },
    ]);

    // Build the search filter
    const searchFilter = {
      $and: [
        { category: { $in: catId } },
        { is_listed: true },
        {
          $or: [
            { name: { $regex: new RegExp(searchQuery, "i") } },
            // You can add more conditions to the $or array if needed
          ],
        },
      ],
    };

    const totalProducts = await Product.countDocuments(searchFilter);

    const totalPages = Math.ceil(totalProducts / limit);

    const product = await Product.find(searchFilter).skip(skip).limit(limit);

    res.render("shopSearch", {
      product,
      categories,
      currentPage: page,
      totalPages,
      searchQuery,
    });
  } catch (error) {}
};

//priceFilter
module.exports.priceFilter = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;

    const limit = 6;
    const skip = (page - 1) * limit; //

    const filter = req.query.filter;

    const categories = await Category.find({ isListed: true });
    const catId = await Category.aggregate([
      {
        $match: {
          isListed: true,
        },
      },

      {
        $project: {
          _id: 1,
        },
      },
    ]);

    const pro = await Product.find({
      category: { $in: catId },
      is_listed: true,
    });

    let products;

    if (filter === "lh") {
      products = await Product.find({
        category: { $in: catId },
        is_listed: true,
      })
        .sort({ price: 1 })
        .skip(skip)
        .limit(limit);
      // console.log(products);
    } else if (filter === "hl") {
      products = await Product.find({
        category: { $in: catId },
        is_listed: true,
      })
        .sort({ price: -1 })
        .skip(skip)
        .limit(limit);
      // console.log(products);
    }

    const totalProducts = pro.length;

    const totalPages = Math.ceil(totalProducts / limit);
    res.render("shopPriceFilter", {
      product: products,
      categories,
      currentPage: page,
      totalPages,
      filter,
    });
  } catch (error) {
    console.log(error.message);
  }
};

//pricefilter2

module.exports.priceFilter2 = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;

    const limit = 2;
    const skip = (page - 1) * limit;

    const filter = req.query.filter;


    const categories = await Category.find({ isListed: true });
    const catId = await Category.aggregate([
      {
        $match: {
          isListed: true,
        },
      },

      {
        $project: {
          _id: 1,
        },
      },
    ]);

    let products;
    let filterCondition = {};

    if (filter === "1-5000") {
      filterCondition = { $gte: 1, $lte: 5000 };
    } else if (filter === "5000-10000") {
      filterCondition = { $gte: 5000, $lte: 10000 };
    } else if (filter === "10000-20000") {
      filterCondition = { $gte: 10000, $lte: 20000 };
    } else if (filter === "above20000") {
      filterCondition = { $gte: 20000 };
    }

    products = await Product.find({
      category: { $in: catId },
      is_listed: true,
      price: filterCondition,
    });

    const totalProducts = products.length;
    const totalPages = Math.ceil(totalProducts / limit);

    products = await Product.find({
      category: { $in: catId },
      is_listed: true,
      price: filterCondition,
    })
      .skip(skip)
      .limit(limit);



    res.render("shopPriceFilter2", {
      product: products,
      categories,
      currentPage: page,
      totalPages,
      filter,
    });
  } catch (error) {
    console.log(error.message);
  }
};

//load checkout

module.exports.checkout = async (req, res) => {
  try {
    const user = res.locals.user
    const userId = res.locals.user._id;
    const CartData = await Cart.find({ user: userId });
   

    if (CartData.length === 0) {
      res.redirect("/viewCart");
    }


    else if (CartData[0].cartItems.length === 0) {
     
      res.redirect("/viewCart");
    } else {
      const result = await Address.find({ user: userId }, { addresses: 1 });
        let primary = [];
      let addArray = [];

      if (result.length > 0) {
        primary = result[0].addresses[0];
        addArray = result[0].addresses;
      }

      const cart = CartData[0];

    


      res.render("checkout", { user, addArray, cart });
    }
 } catch (error) {
    console.log(error.message);
    res.redirect("/500Error");
  }
};

///changePrimary

module.exports.changePrimary = async (req, res) => {
  try {
    const userId = res.locals.user._id.toString();
    const result = req.body.addressRadio;

    const user = await Address.find({ user: userId });

    const addressIndex = user[0].addresses.findIndex((address) =>
      address._id.equals(result)
    );
    if (addressIndex === -1) {
      throw new Error("Address not found");
    }

    const removedAddress = user[0].addresses.splice(addressIndex, 1)[0];
    user[0].addresses.unshift(removedAddress);

    const final = await Address.updateOne(
      { user: userId },
      { $set: { addresses: user[0].addresses } }
    );

    res.redirect("/checkout");
  } catch (error) {
    console.log(error.message);
    res.redirect('/500Error')
  };
};
module.exports.submitAddressCheckOut = async (req, res) => {
  try {
    const userId = res.locals.user._id;
   
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

    res.redirect("/checkout"); 
  } catch (error) {
    console.log(error.message);
  }
};


module.exports.logout = async (req, res) => {
  try{
    res.cookie("jwt", "", { maxAge: 1 });
    res.redirect("/");
  }catch(error){
    console.log("Error in logout" ,error);
    res.redirect("/Error404");
  }
};

 module.exports.error404 = async(req,res)=>{
  try {
    res.render('404Error')
    
  } catch (error) {
    console.log(error.message);
    
  }
}
module.exports.error403 = async(req,res)=>{
  try {
    res.render('403Error')
    
  } catch (error) {
    console.log(error.message);
    
  }
}

module.exports.error500 = async(req,res)=>{
  try {
    res.render('500Error')
    
  } catch (error) {
    console.log(error.message);
    
  }
}