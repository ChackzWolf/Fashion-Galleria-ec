const BannerModel = require("../../../models/Banner");
const CategoryModel = require("../../../models/Category");
const ProductModel = require('../../../models/Product')


const indexView = async (req,res) => {
    try{
        const category = await CategoryModel.find()// hardcoding 
        const mensCategory = await CategoryModel.find({_id:'65996c9ed92f9b905b20f697'});// hardcoding 
        const womensCategory = await CategoryModel.find({_id:'65996cabd92f9b905b20f69d'});// hardcoding 
        let cartCount = 0;
        if(req.session.user !== undefined ) cartCount = await userFunc.getCartCount(req.session.user._id);
        console.log(cartCount, 'cart count')
       

        const products = await ProductModel.find({listStatus: true, deleteStatus: false}).limit(8)
        console.log('2',products)
        const mensProduct = await ProductModel.find({listStatus: true, deleteStatus: false,category:mensCategory[0]._id}).limit(8).populate('category')
        console.log('3')
        const womensProduct = await ProductModel.find({listStatus:true,deleteStatus:false,category:womensCategory[0]._id}).limit(8).populate('category')
        console.log('5')
        const banner = await BannerModel.find({listStatus:true});

        console.log('1')
        res.render("user/index",{products,mensProduct,womensProduct,category,banner,mensCategory,womensCategory,cartCount}); 
    }catch(error){
        console.log(error,  'indexView')
        res.status(500).json({ status: false, error: "Something went wrong on the server." });

    }    
}






const blogView = async(req,res)=> {
    try{
        const userId = req.session.user._id;
        const cartCount = await userFunc.getCartCount(userId)

        return res.render("user/blog",{cartCount});
    }catch(error){
        res.status(500).json({ status: false, error: "Something went wrong on the server." });
    }

};



const contactView = async(req,res) =>{
    try{
        const email = session.email
        await sendMail(email);
        return res.render("user/contact");
    }catch(error){
        res.status(500).json({ status: false, error: 'Something went wrong on the server.' });
    }
};

module.exports = {
    indexView,
    blogView,
    contactView
};
