const express=require('express')
const mongoose=require('mongoose')
const morgan=require('morgan')
const bodyParser=require('body-parser')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const Crudmodel= require('./Model/user');
const multer=require('multer')
const path=require('path')
const app=express()
const dotenv=require("dotenv")
var http = require('http');
const fs=require('fs')
const route=require('./Route/route')
const login=require('./Route/login')
const graphqlHttp=require('express-graphql').graphqlHTTP;
const graphqlschema=require('./graphql/schema');
const graphqlresolver=require('./graphql/resolver');
var session = require('express-session')({
  secret: 'secret',
  resave: false,
  saveUninitialized: true
}); 
const AWS=require("aws-sdk")
dotenv.config()


const s3=new AWS.S3({
  accessKeyId:process.env.ACCESS_KEY,
  secretAccessKey:process.env.SECRET_KEY
})

const uploadFile=(file)=>{
  const fileContent=fs.readFileSync(file)
  const params={
    Bucket:"abdul-practise",
    Key:"image.jpg",
    Body:fileContent,
    ContentType:"image/JPG"
  }
  s3.upload(params,(err,data)=>{
    if(err){
      console.log(err)
    }else{
      console.log("File uploaded Successfully",data.Location)
    }
  })
}

uploadFile("Images/1649574763678.jpg")





// Middleware

// app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(path.join(__dirname, 'Images')));
app.use('/Images', express.static('Images'));
app.use( cors({
  origin: "http://localhost:3000",
}))
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}));
app.set('view engine','ejs')
app.set('views', [path.join(__dirname, 'views'),
                  path.join(__dirname, 'views/login')]);
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use(session);
app.use(function (req, res, next) {
  res.locals.user = req.session.user;
  next();
});

mongoose.connect('mongodb://localhost:27017/task',{useNewUrlParser:true})
.then(()=>console.log('db connected'))
.catch(err=>console.error('could not connected'));
const sequelize = require('./util/database');




// Image Upload
const storage=multer.diskStorage({
  destination:async(req,file,cb)=>{
    cb(null, 'Images')
  },
  filename:async(req,file,cb)=>{
    cb(null,Date.now()+path.extname(file.originalname))
  }
})
app.use(multer({storage:storage}).single('image'))




// Jwt Authentication
app.post('/app/login',async function(req,res){
  let authen=await new Crudmodel({
    id:req.body.id,
     name:req.body.name,
    password: req.body.password
    })
  const token= jwt.sign({authen},'secretkey')
  authen.save()
  .then(response=>{
    res.json({
      response,token
    })
  }).catch(error=>{
    res.json({
      error
    })

  })
})
app.get('/app/loginauth/:token',async function(req,res){
  console.log(req.params.token)
  let token=req.params.token
  let verifytoken= jwt.verify(token,'secretkey');
  if(verifytoken){
    console.log('success')
   await Crudmodel.find()
    	.then(response=>{
    		res.json({
    			response
    		})
    	}).catch(error=>{
    		res.json({
          error
        })

      })
    
  }
  else{
    console.log('failed')
  }

})




var server = http.createServer(app);
var soc = require('socket.io');
const io = new soc.Server(server,{
  cors:{
    origin:"*"
  }
})
io.on( "connect", function( socket ) {
console.log( "a user has connected!" ,socket.id);

socket.on( "disconnect", function() {
console.log( "user disconnected",socket.id );
});

socket.on("joinroom",(data)=>{
  socket.join(data)
console.log('user ID: '+socket.id+' joined room:'+data);

});


socket.on("sendmessage",(data)=>{
  socket.to(data.room).emit("receive_message",data)
  console.log(data)
})

socket.on( "event", function( ass ) {
  console.log(ass)
  }); 
});



app.use('/graph',graphqlHttp({
  schema:graphqlschema,
  rootValue:graphqlresolver,
  graphiql:true
}))
// sequelize.sync().then(res => {
// })
// .catch(err=>{
//   console.log(err)
// });
app.use('/app', route);
app.use('/login', login);
app.get('/', async function(req, res) {
  res.sendFile(path.join(__dirname, './views/soc.html'));
})
server.listen(8000, () => {

  console.log("Server is running on port 8000");
});
// app.listen(8080, () => {
//   console.log("Server is running on port 8080");
// });