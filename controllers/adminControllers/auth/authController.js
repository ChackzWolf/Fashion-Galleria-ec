const bcrypt = require("bcryptjs/dist/bcrypt");
const AdminModel = require("../../../models/Admin");




 
const loginView = (req,res)=>{
    try{
        res.render("admin/login")
    }catch(error){
        res.status(500).render("user/error-handling");
    }
 }

const adminLogout = (req,res)=>{
    try{
       req.session.destroy((err)=>{
           console.log("session deleted")
           res.redirect("/admin/login")
           }) ;
    }catch(error){
       res.status(500).render("user/error-handling");
    }
}

const loginAdmin = async (req,res)=>{
    try{
         const adminData = await AdminModel.findOne({adminID:req.body.adminID})
        if(req.body.adminID != ''){
            if(adminData){    
              if(await bcrypt.compare(req.body.password, adminData.password)){ 
                 req.session.admin = admin; 
                 res.redirect('/admin')
              }
              else{
                const failedPassword = true;
                res.redirect(`/admin/login?failedPassword=${failedPassword}`)
                console.log("Password not matching.")
              }
           }else{
                const failedEmail = true 
                res.redirect(`/admin/login?failedEmail=${failedEmail}`);
                console.log("email is not matching.")
            }
        }else{
            const fieldEmpty = true
            res.redirect(`/admin/login?fieldEmpty=${fieldEmpty}`);
            console.log("Field is empty");
        }
    }catch(error){
        res.status(500).render("user/error-handling"); 
    }
}



module.exports = {
    loginView,
    adminLogout,
    loginAdmin,
}  