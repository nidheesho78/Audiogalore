const moongoose= require('mongoose')

const couponSchema=new moongoose.Schema({
    couponCode:{
        type:String,
    },
    validity:{

        type:Date,
        default:new Date()

    },
    minPurchase:{type :Number},
    minDiscountPercentage:{type:Number},
    maxDiscountValue:{type :Number},
    description:{type:String},
    createdAt:{
        type:Date,
        default:new Date()
    }
})

module.exports=moongoose.model('Coupon',couponSchema)