const express = require('express')
const userRoute = express()
const userController = require('../controllers/userController')
const productController = require('../controllers/productController')
const profileController = require('../controllers/profileController')
const OrderController = require('../controllers/orderController')
const cartController = require('../controllers/cartController')
const couponController = require('../controllers/couponController')
const wishListController = require('../controllers/wishListController')




const validate = require('../middleware/auth');
const cookieparser = require('cookie-parser')
const nocache = require('nocache')
userRoute.use(nocache())
const session = require('express-session');

userRoute.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  }));




//view engine

userRoute.set('views','./views/users')

//Parsing

userRoute.use(express.json())
userRoute.use(express.urlencoded({extended:true}))
userRoute.use(cookieparser())




//home page
userRoute.all('*',validate.checkUser)
userRoute.get('/',userController.homeLoad)

//register 
userRoute.get('/register',validate.isLogout,userController.loadRegister)
userRoute.post('/register',userController.insertUser)
// userRoute.get('/verifyOtp',validate.isLogout,userController.getMobile)
userRoute.post('/verifyOtp',validate.isLogout,userController.verifyOtp)

//Login
userRoute.get('/login',validate.isLogout,userController.loginLoad)
userRoute.post('/login',userController.verifyLogin)
userRoute.get('/logout',userController.logout)



//Resend OTP
userRoute.get('/resendOtp',validate.isLogout,userController.resendOTP)

//forgot Password
 
userRoute.get('/forgotPassword',validate.isLogout,userController.loadForgotPassword)
userRoute.post('/sendOtp',validate.isLogout,userController.resetPasswordOtpVerify)
userRoute.get('/forgetOtp',validate.isLogout,userController.forgetOtp)
userRoute.get('/forgotPasswordOtp',validate.isLogout,userController.forgotPasswordOtp)

 
//SET New password in forgot password
userRoute.post('/setNewPassword',userController.resetPasswordOtpVerify)

userRoute.post('/submitChangedPassword',userController.setNewPassword)

 
//shopp

userRoute.get('/shop',validate.requireAuth,validate.checkBlocked,userController.displayProduct)
userRoute.get('/caregoryWiseSorting',validate.requireAuth,validate.checkBlocked,userController.categoryPage)
userRoute.get('/searchProduct', validate.requireAuth,validate.checkBlocked,userController.searchProduct);
userRoute.get('/priceFilter', validate.requireAuth,validate.checkBlocked,userController.priceFilter);
userRoute.get('/priceFilter2',validate.requireAuth,validate.checkBlocked,userController.priceFilter2);


//product details
userRoute.get('/productDetails',validate.requireAuth,validate.checkBlocked,productController.productDetails)



// cart

userRoute.post('/addToCart',validate.requireAuth,validate.checkBlocked,cartController.addToCart)   //add to cart
userRoute.get('/viewCart',validate.requireAuth,validate.checkBlocked,cartController.viewCart)      //load cart page
userRoute.post('/updatecart',validate.requireAuth,validate.checkBlocked,cartController.updatecart)  //update cart
userRoute.delete('/delete-product-cart',validate.requireAuth,validate.checkBlocked,cartController.deleteCart)  //deleteCart 





//profile


userRoute.get('/profile',validate.requireAuth,validate.checkBlocked,profileController.profile)  //load profile
userRoute.post('/submitAddress',validate.requireAuth,validate.checkBlocked,profileController.submitAddress)  //submitAddress
userRoute.post('/submitAddressCheckOut',validate.requireAuth,validate.checkBlocked,userController.submitAddressCheckOut)
userRoute.post('/updateAddress',validate.requireAuth,validate.checkBlocked,profileController.editAddress)  //updateAddress
userRoute.post('/deleteAddress',validate.requireAuth,validate.checkBlocked,profileController.deleteAddress)  //updateAddress
userRoute.post('/editInfo',validate.requireAuth,validate.checkBlocked,profileController.editInfo)  //editInfo,
userRoute.post('/editPassword',validate.requireAuth,validate.checkBlocked,profileController.editPassword)  //editPassword
userRoute.get('/viewOrder',validate.requireAuth,validate.checkBlocked,profileController.viewOrder)  //viewOrder
userRoute.put('/cancelOrder',validate.requireAuth,validate.checkBlocked,profileController.cancelOrder)  //cancelOrd
userRoute.get('/deleteAddress',validate.requireAuth,validate.checkBlocked,profileController.deleteAddress)  //updateAddress

userRoute.get('/profileOrderList',validate.requireAuth,validate.checkBlocked,profileController.profileOrderList)  //load profile
userRoute.get('/profileDetails',validate.requireAuth,validate.checkBlocked,profileController.profileDetails)  //load address
userRoute.get('/profileAddress',validate.requireAuth,validate.checkBlocked,profileController.profileAddress)  //load address
userRoute.get('/wallet',validate.requireAuth,validate.checkBlocked,profileController.walletTransaction)

 

//check out

userRoute.get('/checkout',validate.requireAuth,validate.checkBlocked,userController.checkout)  //updateAddress
userRoute.post('/checkout',validate.requireAuth,validate.checkBlocked,userController.changePrimary)  //updateAddress

 

///order
userRoute.post('/confirmOrder',validate.requireAuth,validate.checkBlocked,OrderController.confirmOrder)  //place order
userRoute.get('/orderSlip',validate.requireAuth,validate.checkBlocked,OrderController.orderSlip)  //orderSlip
userRoute.get('/download-invoiceProfile',validate.requireAuth,validate.checkBlocked,profileController.downloadInvoiceProfile)  //orderSlip
userRoute.get('/download-invoice',validate.requireAuth,validate.checkBlocked,OrderController.downloadInvoice)
userRoute.post('/paymentFailed',validate.requireAuth,validate.checkBlocked,OrderController.paymentFailed)
 
//couponn
userRoute.get('/couponVerify/',validate.requireAuth,validate.checkBlocked,couponController.verifyCoupon)  //verifyPayment
userRoute.get('/applyCoupon/',validate.requireAuth,validate.checkBlocked,couponController.applyCoupon)  //verifyPayment



//payment
userRoute.post('/verifyPayment',validate.requireAuth,validate.checkBlocked,OrderController.verifyPayment)  //verifyPayment

 
//washlist
userRoute.get('/loadWishlist/',validate.requireAuth,validate.checkBlocked,wishListController.getWishList)  //verifyPayment
userRoute.post('/add-to-wishlist/',validate.requireAuth,validate.checkBlocked,wishListController.addWishList)  //verifyPayment
userRoute.delete('/remove-product-wishlist',validate.requireAuth,validate.checkBlocked,wishListController.removeProductWishlist)  //verifyPayment


//error

userRoute.get('/404Error',userController.error404)
userRoute.get('/403Error',userController.error403)
userRoute.get('/500Error',userController.error500)



module.exports = userRoute