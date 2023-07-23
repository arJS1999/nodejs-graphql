const express = require('express');
const router = express.Router();
const datamodel = require('../util/datamodel');
const csrf=require('csurf');
const csrfprotect=csrf();
router.use(csrfprotect);

//login
router.get('/',async(req,res,next)=>{
    res.render('login',{csrftoken:req.csrfToken()})
  })
  router.post('/handle',async(req,res,next)=>{
    const name=req.body.name
    const pass=req.body.password
    datamodel.findAll({where:{password:pass}}).then(response=>{
      if(response.length){
  const valid=response[0].name.includes(name);
  
  if(valid){
    let session = req.session;
    session.user = response[0].name;
    res.redirect('/app/fetch')
  }else{
  res.render('login',{msg:"Invalid Username and Password",csrftoken:req.csrfToken()})
  }
      }else{
  res.render('login',{msg:'User does not exits',csrftoken:req.csrfToken()});
      }
    })
  })




  module.exports=router;
