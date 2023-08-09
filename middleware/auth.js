const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  // check json web token exists & is verified
  if (token) {
    jwt.verify(token, "my-secret", (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.redirect("/login");
      } else {
        console.log(decodedToken);
        next();
      }
    });
  } else {
    res.redirect("/login");
  }
};

// check current user
const checkUser = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, "my-secret", async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        next();
      } else {
        const user = await User.findById(decodedToken.id);
        res.locals.user = user;
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};

const isLogin= async(req,res,next)=>{
  try {

  const token = req.cookies.jwt;
      if(token){
       
          next();
      }
      else{

        console.log("two");
          res.redirect('/login');
      }
      
      
  } catch (error) {
      console.log(error.message);
  }
}

const isLogout= async(req,res,next)=>{
  try {
    const token = req.cookies.jwt;
    if (token) {
      res.redirect("/");
    } else {
      next();
    }
  } catch (error) {
    console.log(error.message);
  }
};

//check blocked

const checkBlocked = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, "my-secret", async (err, decodedToken) => {
      const user = await User.findById(decodedToken.id);
      if (user.is_blocked == true) {
        res.clearCookie("jwt");
        res.redirect("/login");
      } else {
        next();
      }
    });
    
  } else {
    next();
  }
};


module.exports = { 
  requireAuth,
   checkUser,
   isLogin,
   isLogout,
   checkBlocked 
  };
