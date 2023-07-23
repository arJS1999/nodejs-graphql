module.exports = async(req,res,next)=>{
    console.log(req.session);
    
    if(req.session && req.session.user){
        next();
    }else{
        errormsg='Access denied';
        res.render('sequeal',{msg:errormsg,csrftoken:req.csrfToken()})
    }
};