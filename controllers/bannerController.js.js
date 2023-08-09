

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
    bannerHelper.addBannerHelper(req.body, req.file.filename).then(( response) => {
        if (response) {
            res.redirect("/admin/addBanner");
        } else {
            res.status(505);
        }
    });
}
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

// module.exports.editBanner = (req,res) => {
//   bannerHelper.editBannerHelper(req.query.id).then((response) => {
//         res.render("updateBanner",{banner:response});
//     });
// }

module.exports.getEditBanner = (req,res) => {

}


module.exports.postEditBanner = (req,res) => {

}

module.exports.deleteBanner = async (req,res) => {
  bannerHelper.deleteBannerHelper(req.query.id).then(() => {
        res.redirect("/admin/listBanner")
    });
} 