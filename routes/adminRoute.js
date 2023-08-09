const express = require('express')
const adminRoute = express()
const adminController = require('../controllers/adminController')
const productController = require('../controllers/productController')
const categoryController = require('../controllers/categoryController')
const bannerController = require('../controllers/bannerController.js')
const multer = require('../multer/multer.js')
const couponController = require('../controllers/couponController')
const validate = require('../middleware/adminAuth');
const session = require('express-session');
const cookieparser = require('cookie-parser')
const nocache = require('nocache')
adminRoute.use(nocache())
adminRoute.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  }));

//view engine

adminRoute.set('views','./views/admin')

//Parsing

adminRoute.use(express.json())
adminRoute.use(express.urlencoded({extended:true}))
adminRoute.use(cookieparser())
//adminRoute.get('*',validate.checkUser)



//home page
adminRoute.get('/',validate.isLogout,adminController.loadLogin)
adminRoute.post('/login',adminController.verifyLogin)
adminRoute.get('/dashboard',validate.requireAuth,validate.requireAuth,adminController.loadDashboard)
adminRoute.get('/loadCategory',validate.requireAuth,validate.requireAuth,categoryController.loadCategory)
adminRoute.post('/addCategory',validate.requireAuth,categoryController.createCategory)
adminRoute.get('/addCategory',validate.requireAuth,validate.requireAuth,categoryController.showCategory)





adminRoute.get('/changeStatus',validate.requireAuth,validate.requireAuth,categoryController.changeStatus)
adminRoute.get('/editCategory',validate.requireAuth,validate.requireAuth,categoryController.loadUpdateCategory)
adminRoute.post('/editCategory',validate.requireAuth,categoryController.updateCategory)
adminRoute.get('/deleteCategory',validate.requireAuth,validate.requireAuth,categoryController.deleteCategory)


adminRoute.get('/users',validate.requireAuth,validate.requireAuth,adminController.loadUsers)
adminRoute.get('/blockUser',validate.requireAuth,validate.requireAuth,adminController.blockUser)
adminRoute.get('/unBlockUser',validate.requireAuth,validate.requireAuth,adminController.unBlockUser)
adminRoute.get('/editUser',validate.requireAuth,validate.requireAuth,adminController.loadEditUser)
adminRoute.post('/editUser',adminController.updateUser)
adminRoute.get('/addProduct',validate.requireAuth,validate.requireAuth,productController.loadProducts)
adminRoute.post( "/addProduct",multer.upload, productController.createProduct)


///product list

adminRoute.get('/productList',validate.requireAuth,validate.requireAuth,productController.loadProductList)  //loadproduct list
adminRoute.get('/editProductList',validate.requireAuth,validate.requireAuth,productController.editProductList)  //editProductList
adminRoute.post('/updateProductList',multer.update,validate.requireAuth,productController.updateProductList)  //editProductList
adminRoute.get('/deleteProduct',validate.requireAuth,productController.deleteProduct)

//order
adminRoute.get('/orderList',validate.requireAuth,adminController.orderList)
adminRoute.put('/orderStatus',validate.requireAuth,adminController.changeStatus)
adminRoute.put('/cancelOrder',validate.requireAuth,adminController.cancelOrder)  ///cancel order
adminRoute.get('/orderDetails',validate.requireAuth,adminController.orderDetails)  ///cancel order
adminRoute.put('/returnOrder',validate.requireAuth,adminController.returnOrder)  ///return order
adminRoute.get('/salesReport',validate.requireAuth,adminController.getSalesReport )  ///return order
adminRoute.post('/salesReport',validate.requireAuth,adminController.postSalesReport )  ///return order
adminRoute.get('/cancelReport',validate.requireAuth, adminController.getCancelReport);
adminRoute.post('/cancelReport',validate.requireAuth, adminController.postCancelReport);

//Banner
adminRoute.get('/addBanner',validate.requireAuth,bannerController.getAddBanner )  ///return order
adminRoute.post('/addBanner',validate.requireAuth,multer.addBannerupload,bannerController.postAddBanner)
adminRoute.get('/listBanner',validate.requireAuth,bannerController.bannerList)
adminRoute.get("/editBanner",validate.requireAuth, bannerController.getEditBanner)
adminRoute.post("/editBanner",multer.editBannerupload,validate.requireAuth, bannerController.postEditBanner)
adminRoute.get('/deleteBanner',bannerController.deleteBanner)




//coupon

adminRoute.get('/addCoupon',validate.requireAuth,couponController.loadCouponAdd)
adminRoute.post('/addCoupon',couponController.addCoupon)
adminRoute.get('/generate-coupon-code',validate.requireAuth,couponController.generateCouponCode)
adminRoute.get('/couponList',validate.requireAuth,couponController.couponList)

adminRoute.delete('/removeCoupon',couponController.removeCoupon)











adminRoute.get('/logout',validate.requireAuth,adminController.logout)
module.exports = adminRoute