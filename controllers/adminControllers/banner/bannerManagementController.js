const BannerModel = require("../../../models/Banner");

const mainBannerView = async(req,res)=>{
    try{
        const banner = await BannerModel.findOne()
        res.render("admin/main-banner-view",{banner})
    }catch(error){
        res.status(500).render("user/error-handling"); 
    }
}



const bannerListView = async(req,res)=>{
    try{
        const pageNum =  req.query.page;
        const perPage = 6 ;
        let docCount
        let pages
        
        const documents = await BannerModel.countDocuments();
        const banner = await BannerModel.find().skip((pageNum - 1) * perPage).limit(perPage)
        docCount = documents
        pages = Math.ceil(docCount / perPage)

        let countPages = []
        for (let i = 0; i < pages; i++) {

            countPages[i] = i + 1
        }
        res.render("admin/banner-list",{banner,countPages})

    }catch(error){
        res.status(500).render("user/error-handling"); 
    }
}





const addBanner = async(req,res)=>{
    try{
        const {caption,description} = req.body;
        const images = req.files
                    .filter((file) =>
                          file.mimetype === "image/png" || file.mimetype === "image/jpeg" || file.mimetype === "image/webp")
                    .map((file) => file.filename);
        console.log(images,'imagesdd')
        if(images.length === 1){
            const data = {
                caption:caption,
                description:description,
                imageUrl:images
                
            }
    
            console.log('data',data);
            let banner = await BannerModel.create(data);
            console.log(banner);
            res.render("admin/main-banner-view")

        }else{
            const noImage = true;
            res.render("admin/main-banner-view",{noImage})
        }
    }catch(error){
        res.status(500).render("user/error-handling"); 
    }
}




const listUnlistBanner = async(req,res)=>{
    try{
        const bannerId = req.params.id;
        const singleBanner = await BannerModel.findById({_id:bannerId});
        if(singleBanner){
            const updateBanner = await BannerModel.updateOne({_id:bannerId},{$set:{listStatus:!singleBanner.listStatus}});
            if(updateBanner){
                console.log('updated')
                const banner = await BannerModel.find();
                res.render("admin/banner-list",{banner})
            }else{
                const errMsg = true
                const banner = await BannerModel.find()
                res.render("admin/banner-list",{banner,errMsg})
            }
        }else{
            const errMsg = true
            const banner = await BannerModel.find()
            res.render("admin/banner-list",{banner,errMsg})
        }
    }catch(error){
        res.status(500).render("user/error-handling"); 
    }

}


const deleteBanner = async(req,res)=>{
    try{
        const bannerId = req.params.id;
        const chosenBanner = await BannerModel.findById({_id:bannerId})
        if(!chosenBanner){
            return res.status(404).json({message: "banner not found."});
        }else{
            // Delete each image associated with the product
            for (const imageUrl of chosenBanner.imageUrl) {
                fileHandler.deleteFile(imageUrl);
            }
            await BannerModel.deleteOne({_id:bannerId});
            const banner = await BannerModel.find();
            res.render("admin/banner-list",{banner})  
        }
    }catch(error){
        res.status(500).render("user/error-handling"); 
    }
}




module.exports = {
    mainBannerView,
    addBanner,
    bannerListView,
    listUnlistBanner,
    deleteBanner,
}  