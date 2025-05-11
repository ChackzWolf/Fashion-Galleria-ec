const CouponModel = require('../../../models/Coupon');

const couponListView = async(req,res)=>{
    try{
        const pageNum = parseInt(req.query.page) || 1;
        const perPage = 6
        let docCount
        let pages
        const listedCoupon = await CouponModel.find().skip((pageNum - 1) * perPage).limit(perPage)
        const documents = await CouponModel.countDocuments()
        docCount = documents
        pages = Math.ceil(docCount / perPage)

        let countPages = []
        for (let i = 0; i < pages; i++) {

            countPages[i] = i + 1
        }
        res.render("admin/listed-coupon",{listedCoupon,countPages});
    }catch(error){
        res.status(500).render("user/error-handling") 
    }

}

const addCouponView = (req,res) =>{
    try{
        res.render("admin/add-coupon");
    }catch(error){
        res.status(500).render("user/error-handling")
    }
}

const editCouponDetails = async(req,res)=>{
    try{
        const editCoupon = await CouponModel.findOne({_id:req.query.id});
        res.render("admin/edit-coupon-details",{editCoupon});
    }catch(error){
        res.status(500).render("user/error-handling");
    }
}


const editCoupon = async(req,res)=>{
    try{
        const {id,couponName,couponType,percentageValue,description} = req.body;
        const updateData = {
            couponCode:couponName,
            couponType:couponType,
            offerPercentage:percentageValue,
            description:description
        }
        if(couponName !== '' && couponType !== undefined && percentageValue >0 ){
            const couponExist = await CouponModel.findOne({_id:id})
            if(couponExist){
                const update = await CouponModel.updateOne({_id:id},{$set: updateData});
                if(update){
                    const updated = true;
                    const listedCoupon = await CouponModel.find();
                    res.render('admin/listed-coupon',{updated,listedCoupon});
                }
            }
        }
    }catch(error){
        res.status(500).render("user/error-handling");
    }
}


const deleteCoupon = async(req,res)=>{
    try{
        const couponId = req.params.id;
        const deletedCoupon = await CouponModel.deleteOne({_id:couponId});
        if(deletedCoupon){
            const couponDeleted = true;
            const listedCoupon = await CouponModel.find();
            res.render("admin/listed-coupon",{couponDeleted,listedCoupon});
        }else{
            const couponDeletedFailed = true;
            const listedCoupon = await CouponModel.find();
            res.render("admin/listed-coupon",{couponDeletedFailed,listedCoupon});
        }
    }catch(error){
        res.status(500).render("user/error-handling");
    }
}



// to add new coupon fucntion
const addNewCoupon = async(req,res)=>{
    try{
        const {couponName,couponType,description} = req.body;
        const percentageValue = parseFloat(req.body.percentageValue);
    
        const data = {
            couponCode:couponName,
            offerPercentage:percentageValue,
            couponType:couponType,
            description:description,
            listStatus:true
        }
    
        if (couponName !== '' && !isNaN(percentageValue) && couponType !== undefined){
            console.log(data,'dataaaaaa')
              const couponExists = await CouponModel.findOne({couponCode:couponName});
              if(!couponExists){
                    console.log("coupon deos'nt exists")
                    const coupon = await CouponModel.create(data)
                    if(coupon){
                        console.log('coupon created')
                        let msgTrue = true;
                        res.render("admin/add-coupon",{msgTrue})
                    }else{
                        console.log('coupon not created')
                        let msgFalse = true;
                        res.render("admin/add-coupon",{msgFalse});
                    }
              }else{
                console.log('coupon already exists')
                let msgExists = true;
                res.render("admin/add-coupon",{msgExists});
              }
        }else{
            console.log('couponCode is empty')
            let msgCouponEmpty = true;
            res.render("admin/add-coupon",{msgCouponEmpty});
        }
    }catch(error){
        res.status(500).render("user/error-handling")
    }
}





const listUnlistCoupon = async(req,res)=>{
    try{
        const coupon = await CouponModel.findById({_id:req.params.id});
        if(coupon){
            const update = await CouponModel.updateOne({_id:coupon.id},{$set:{listStatus:!coupon.listStatus}});
            if(update){
                const listedCoupon = await CouponModel.find();
                res.render("admin/listed-coupon",{listedCoupon})
            }
        }    
    }catch(error){
        res.status(500).render("user/error-handling")
    }
}


module.exports = {
    addCouponView,
    addNewCoupon,
    couponListView,
    listUnlistCoupon,
    editCouponDetails,
    editCoupon,
    deleteCoupon,
}  