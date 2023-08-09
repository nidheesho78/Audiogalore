const mongoose = require("mongoose")
const userSchema  = mongoose.Schema({
    fname:{
        type:String,
        required:true
    },
    lname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
   
    mobile:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    is_blocked:{
        type:Number,
        required:true,
        default:false
    },
   
    
      wallet: {
        type: String,
        default:2000000.00,
      },
       walletTransaction:{
        type:Array
    },
      coupons:{
        type:Array,
      },
});

// userSchema.methods.generateJWT = function(){
//     const token = jwt.sign({
//         _id:this._id,
//         number:this.mobile
//     },process.env.JWT_SECRET_KEY,{expiresIn : '7d'})
// }

module.exports = mongoose.model('User',userSchema)