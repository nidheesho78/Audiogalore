 const Banner = require('../models/bannerModel')
const mongoose = require('mongoose')


module.exports.addBannerHelper = async(texts,Image) => {
    return new Promise(async (resolve,reject) => {
        const banner = new Banner({
            title:texts.title,
             subTitle:texts.subTitle,
            price:texts.price,
             link: texts.link,
            image: Image,
        });
         await banner.save().then((response) => {
            resolve(response);
    });
});
}


module.exports.bannerListHelper = async () => {
   
    try{

    return new Promise(async (resolve, reject) => {
        await Banner.find().then((response) => {
            resolve(response);
        });
    });
}catch(error){
    console.log(error.message,'Banner List Helper')
}
}

module.exports.deleteBannerHelper = async (deleteId) => {
     try {
        return new Promise(async (resolve, reject) => {
            await Banner.deleteOne({ _id: deleteId }).then(() => {
                resolve();
            });
        });
    } catch (error) {
        console.log(error.message);
    }
}

module.exports.editBannerHelper = async (bannerId) => {
    try {
        return new Promise((resolve, reject) => {
        Banner.aggregate([
            {
                $match:{_id:new mongoose.Types.ObjectId(bannerId) }
            },{
                $project:{
                    title:1,
                    image:1,
                    description:1
                }
            }
        ])
        .then((response) => {
            resolve(response);
          });
        });
      } catch (error) {
        console.log(error.message);
      } 
}
