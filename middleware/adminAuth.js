const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwtadmin;

  // check json web token exists & is verified
  if (token) {
    jwt.verify(token, "my-secret", (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.redirect("/admin");
      } else {
        next();
      }
    });
  } else {
    res.redirect("/admin");
  }
};


// check current user
const checkUser = (req, res, next) => {
  const token = req.cookies.jwtadmin;
  if (token) {
    jwt.verify(token, "my-secret", async (err, decodedToken) => {
      if (err) {
        res.locals.admin = null;
        next();
      } else {
        const admin = await Admin.findById(decodedToken.id);
        res.locals.admin = admin;
        next();
      }
    });
  } else {
    res.locals.admin = null;
    next();
  }
};

const isLogin = async (req, res, next) => {
  try {

  const token = req.cookies.jwtadmin;
      if(token){
        
          next();
      }
      else{

        console.log("two");
          res.redirect('/admin');
      }
      
      
  } catch (error) {
    console.log(error.message);
  }
};

const isLogout = async (req, res, next) => {
  try {
    console.log("hai");
    const token = req.cookies.jwtadmin;
    if (token) {
      console.log("yrpoodap");
      res.redirect("/admin/dashboard");
    } else {
      next();
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = { requireAuth, checkUser, isLogout, isLogin };
