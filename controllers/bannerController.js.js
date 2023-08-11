

const bannerHelper = require('../helpers/bannerHelper')

module.exports.getAddBanner = async(req,res)=>{
    try{
        res.render('addBanner') 
    }
    catch(error){
        console.log(error);
    }
}
 module.exports.postAddBanner = (req, res) => {
    try{
    bannerHelper.addBannerHelper(req.body, req.file.filename).then(( response) => {
        if (response) {
            res.redirect("/admin/addBanner");
        } else {
            res.status(505);
        }
    });
}catch(error){
    console.log(error.message)
}
 };
module.exports.bannerList = async (req,res) => {
   try{
        bannerHelper.bannerListHelper().then((response)=> {
            res.render('listBanner',{banners:response})

        })  
    }
    catch(error){
        console.log(error);
    }
}






module.exports.deleteBanner = async (req,res) => {
    try{
  bannerHelper.deleteBannerHelper(req.query.id).then(() => {
        res.redirect("/admin/listBanner")
    });
} catch(error){
    console.log(error.message)
}
};