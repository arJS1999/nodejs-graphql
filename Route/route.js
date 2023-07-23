const path=require('path')
const express = require('express');
const router = express.Router();
const userController= require('../Controller/usercontroller');
const datamodel = require('../util/datamodel');
const { response } = require('express');
const { check, validationResult }= require('express-validator');
const auth=require('../Auth/auth')
const fs=require('fs');
const csrf=require('csurf');
const csrfprotect=csrf();
router.use(csrfprotect);
const multer=require('multer')



//valid form
router.get('/validform',auth,async (req, res, next) => {
  res.render('valid',{csrftoken:req.csrfToken()});
 
});
router.post('/valid', [
  check('name', 'Name length should be 5 to 20 characters')
                  .isAlpha().withMessage('Name must be alphabetic.'),
  check('pass', 'Password length should be 5 to 10 characters')
                  .isInt().withMessage('Must be a integer number'),
  check('gender', 'Password length should be 5 to 10 characters')
                  .exists().withMessage('please select gender'),
  check('date').custom((date, { req }) => {
                      const startDate = new Date(date)
                      const endDate = new Date(req.body.edate)
                      if (startDate >= endDate) {
                          throw new Error(
          'Start date of project must be before End date')
                      }
                      return true
                  }),
          
  check('country', 'Password length should be 5 to 10 characters')
                  .isIn(['IND', 'AUS']).withMessage('please select country')

],async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errmsg=errors.array();
    res.render('valid',{errmsg,csrftoken:req.csrfToken()});
}   else{
  res.redirect('/app/fetch')

}
})
router.get('/logout',async(req,res)=>{
  req.session.destroy();
  res.redirect('/app/sequelform');
});




// Dynamic insert Data
const products=[];
router.get('/product', async (req, res, next) => {
    res.sendFile(path.join(__dirname, '../views/product.html'));
   
  });
router.post('/add', async(req, res, next) => {
     products.push({ title: req.body.title },{concept:req.body.concept});
    console.log(products)
    res.render('viewpro',{products})

  });




  
 

// Controller Api
router.post('/create',userController.create);
router.get('/api/getdata',userController.get);
router.post('/update',userController.update);
router.post('/delete/:id',userController.remove);
router.get('/api/sort',userController.sort);
router.get('/api/run',userController.run);
router.get('/api/limit',userController.limit);
router.get('/api/gt',userController.gt);
router.get('/api/group',userController.group);
router.get('/api/match',userController.match);
router.get('/api/count',userController.count);
router.get('/api/project',userController.project);
router.get('/api/paginate',userController.paginate);
router.get('/api/concat',userController.concat);
router.get('/api/date',userController.dateex);
router.get('/api/condition',userController.condition);
router.get('/api/sortby',userController.sortby);
router.get('/api/dis',userController.dis);

router.get('/api/mail',userController.mail);




// Sequelize Api
router.get('/sequelform',async (req, res, next) => {
  res.render('sequeal',{csrftoken:req.csrfToken()});
});
router.post('/addsequal',[
  check('name', 'Name length should be 5 to 20 characters')
                  .isLength({ min: 5, max: 20 }).isAlpha().withMessage('Name must be alphabetic.'),
  check('password', 'Password length should be 5 to 10 characters')
                  .isLength({ min: 5, max: 10 }).isInt().withMessage('Must be a integer number'),
  check('image').custom((value, {req}) => {
                          if(req.file.mimetype === 'image/jpeg' && req.file.size < 1024*1024){
                              return '.jpg'; 
                          }else{
                            return false;
                          
                          }
                      })
                  .withMessage('Please only choose jpg format and Image no longer 1MB size') ,

],async (req,res)=>{
  console.log(req.body.password)
  console.log(req.body.name)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errmsg=errors.array();
    res.render('sequeal',{errmsg,csrftoken:req.csrfToken()});
}
else{
  let name = req.body.name;
  let password=req.body.password;
  let image=req.file.filename;
  console.log(password)
  console.log(name)
  console.log(image);
  await datamodel.create({
    name:name,
    password:password,
    image:image
  }).then(result=>{
    let session = req.session;
            session.user = result.name;
    res.setHeader('Set-Cookie','Access=true')
      res.redirect('/app/fetch')
    })
    .catch(err =>{ console.log(err)
  });
}
});
router.post('/updatesequal',(req,res)=>{
  let newimg='';
  console.log("delete"+req.body.image1)
  if(req.file){
    newimg=req.file.filename;
  }else{
    newimg=req.body.image1;
  }
  let name = req.body.name;
  let password=req.body.password;
  let id=req.body.id;

  datamodel.update({name:name,password:password,image:newimg},{where:{id:id}})
  .then(result=>{
    console.log("response:"+req.body.image1); 
    // fs.unlink('Images/'+req.body.image1,(err)=>{
    //   console.log(err);
    // });
    res.redirect('/app/fetch')
    }).catch(err =>{ console.log(err)
  });
    
});
router.get('/fetch', auth,async(req, res, next)=> { 
  // const data=req.get('Cookie').split('=')[1]==="true";
  await datamodel.findAll()
  .then(response=>{
      // res.render('sequeldata',{response,Access:data});
      res.render('sequeldata',{response});
    console.log(Access)
  })
    .catch(err=>console.log(err));
});
router.get('/edit',async(req,res)=>{ 
  var id;
  console.log('hi')
  console.log(req.query.id)
  if (req.query.id!=null){
    id = req.query.id;
    console.log(id);
  }else{id=1;}
  await datamodel.findByPk(id)
  .then(response=>{
    console.log(response);
    res.render('sequeledit',{response,csrftoken:req.csrfToken()});
  })
  .catch(err=>console.log(err));
});
router.get('/delete',async(req,res)=>{ 
  var id;
  console.log('hi')
  console.log(req.query.id)
  if (req.query.id!=null){
    id = req.query.id;
    console.log(id);
  }else{id=1;}
  await datamodel.destroy({where:{id:id}})
  .then(response=>{
    console.log(response);
    res.redirect('back');
  })
  .catch(err=>console.log(err));
});
  

module.exports=router;
