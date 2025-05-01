const ProductModel = require('../../../models/Product');


const productOfferList = async(req,res)=>{
    try{
        const productsOffer = await ProductModel.find({productOffer:true});
        const productsNoOffer = await ProductModel.find({productOffer:false});
        res.render("admin/product-offer-list",{productsOffer,productsNoOffer});
    }catch(error){
        res.status(500).render("user/error-handling");
    }
}

const addPrdouctOfferView = async(req,res)=> {
    try{
        const productId = req.query.id;
        const singleProduct = await ProductModel.findOne({_id:productId});
        res.render("admin/add-product-offer-view",{singleProduct});
    }catch(error){
        res.status(500).render("user/error-handling"); 
    }
}

const addProductOffer = async(req,res)=>{
    try{
        const {id,offerPercentage} = req.body;
        console.log(req.body.id,'id');
        console.log(offerPercentage,'offer percentage');
        const product = await ProductModel.findOne({_id:id});
        const offerPrice = adminFunc.reducePercentageFromPrice(product.price,offerPercentage);
        if(offerPercentage > 0 ){
            const addOffer = await ProductModel.updateOne({_id:id},{$set:{offerPrice:offerPrice,productOffer:true}})
            if(addOffer){
                const msg = true;
                const productsOffer = await ProductModel.find({productOffer:true});
                const productsNoOffer = await ProductModel.find({productOffer:false});
                res.render("admin/product-offer-list",{productsOffer,productsNoOffer,msg});
            }else{
                const errMsg = true;
                const singleProduct = await ProductModel.findOne({_id:id});
                res.render("admin/add-product-offer-view",{singleProduct,errMsg});
            }
        }else{
            const empty =true;
            const singleProduct = await ProductModel.findOne({_id:id});
            res.render("admin/add-product-offer-view",{singleProduct,empty});
        }
    }catch(error){
        res.status(500).render("user/error-handling"); 
    }
}

const editProductOfferView = async(req,res)=>{
    try{
        const productId = req.query.id;
        const singleProduct = await ProductModel.findOne({_id:productId});
        // percentage defference of orginal value and discount value
        const percentage = adminFunc.calculatePercentageDifference(singleProduct.price, singleProduct.offerPrice)
        res.render("admin/edit-product-offer-view",{singleProduct,percentage});
    }catch(error){
        res.status(500).render("user/error-handling"); 
    }
}


const removeProductOffer = async(req,res)=>{
    try{
        const productId = req.params.id;
        console.log(productId)
        const removeProduct = await ProductModel.updateOne({_id:productId},{$set:{offerPrice:0,productOffer:false}});
        const removed = true;
        const productsOffer = await ProductModel.find({productOffer:true});
        const productsNoOffer = await ProductModel.find({productOffer:false});
        res.render("admin/product-offer-list",{productsOffer,productsNoOffer,removed})
    }catch(error){
        res.status(500).render("user/error-handling"); 
    }
}

module.exports = {
    removeProductOffer,
    editProductOfferView,
    addProductOffer,
    productOfferList,
    addPrdouctOfferView,
}  
