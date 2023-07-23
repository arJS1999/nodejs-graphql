const Crudmodel= require('../Model/user');
const prodtable= require('../Model/product');
const jwt = require('jsonwebtoken')
const express=require('express')
const request=require('request')
const app=express()
const cron=require('node-cron');
const nodemailer=require('nodemailer')

async function dis(req, res) {
	console.log('hi');
	await prodtable.aggregate([{ $project: { _id: 1, name: 1, total: { $subtract: [ "$price", "$discount" ] } } }])
		.then(response => {
			res.json({
				response
			})
		}).catch(error => {
			res.json({
				error
			});
		});
}

// Insert record using Cron
async function run(req, res) {
	url = 'http://localhost:8080/app/api/getdata';
	request(url, function (error, response) {
		console.log(typeof (response.body));
		var type = JSON.parse(response.body);

		cron.schedule('*/5 * * * * *', async () => {
			for (var i = 0; i < type.response.length; i++) {

				console.log(type.response[i].age);
				const authen = await new Crudmodel({
					age: type.response[i].age,
					name: type.response[i].name,
					password: type.response[i].password
				});
				authen.save();
			}
		});

	});

}
	

// Crud Operation
async function create(req, res, next) {
	let authen = await new Crudmodel({
		name: req.body.name,
		password: req.body.password,
		age: req.body.age,
	});
	authen.save()
		.then(response => {
			res.json({
				message: 'inserted',
			});

		}).catch(error => {
			
			res.json({
				error
			});
		});
}
async function get(req, res) {
	console.log('hi');
	await Crudmodel.find()
		.then(response => {
			res.json({
				response
			});
		}).catch(error => {
			res.json({
				error
			});
		});
}
async function update(req, res) {
	const updateid = req.body._id;
	console.log(updateid);
	const updatedata = {
		name: req.body.name,
		id: req.body.id,
		password: req.body.password
	};
	await Crudmodel.findByIdAndUpdate(updateid, { $set: updatedata })
		.then(response => {
			res.json({
				response
			});
		}).catch(error => {
			res.json({
				error
			});
		});
}
async function remove(req, res) {
	console.log(req.params.id);
	const crudid = req.params.id;
	await Crudmodel.findByIdAndRemove(crudid)
		.then(response => {
			res.json({
				response
			});
		}).catch(error => {
			res.json({
				error
			});
		});
}




//aggregation
async function sort(req, res) {
	//asc,dsc
	// {$group:{_id:"$age"}},{$sort:{_id:1}}
	console.log('hi');
	await Crudmodel.aggregate([{ $sort: { age:-1 } }])
		.then(response => {
			res.render('sort', {
				response
			});
		}).catch(error => {
			res.json({
				error
			});
		});
}
async function limit(req, res) {
	console.log('hi');
	await Crudmodel.aggregate([{ $limit: 3}])
		.then(response => {
			res.render('limit', {
				response
			});
		}).catch(error => {
			res.json({
				error
			});
		});
}
async function gt(req, res) {
	console.log('hi');
	//lt,gt,lte,gte
	await Crudmodel.aggregate([{ $match: { age: { $gt: 24 } } }])
		.then(response => {
			res.render('gt', {
				response
			});
		}).catch(error => {
			res.json({
				error
			});
		});
}
async function group(req, res) {
	// {$group:{_id :{name:"$name",password:"$password"}}}
	// { $group: { _id: "$age",count:{$sum:1} } }
	await Crudmodel.aggregate([{ $group: { _id: "$age" } }])
		.then(response => {
			res.render('group', {
				response
			});
		}).catch(error => {
			res.json({
				error
			});
		});
}
async function match(req, res) {
	await Crudmodel.aggregate([{ $group: { _id: { age: "$age", name: "$name" } } },
	{ $match: { "_id.age": { $gt: 22 } } }])
		.then(response => {
			res.render('group', {
				response
			});
		}).catch(error => {
			res.json({
				error
			});
		});
}
async function count(req, res) {
	// {$count:"count"}
	// {$match:{age:{$gt:22}}},{$count:"count"}
	await Crudmodel.aggregate([{ $group: { _id: "$age" } }, { $count: "count" }])
		.then(response => {
			res.render('count', {
				response
			});
		}).catch(error => {
			res.json({
				error
			});
		});
}
async function project(req, res) {
	await Crudmodel.aggregate([{ $project: { _id: 0, age:1,password: 1 } }])
		.then(response => {
			res.render('project', {
				response
			});
		}).catch(error => {
			res.json({
				error
			});
		});
}
async function paginate(req, res) {
	await Crudmodel.paginate({},{page:req.query.page,limit:req.query.limit})
		.then(response => {
			res.render('pagination', {
				response
			});
		}).catch(error => {
			res.json({
				error
			});
		});
}



//string
async function concat(req, res) {
	console.log('hi');
	// {$toUpper:["$name"]}
	//{$toLower:["$name"]}
	await Crudmodel.aggregate([{$project:{'start':{$concat:["$name","+","$name"]}}}])
		.then(response => {
			res.json({response});
		}).catch(error => {
			res.json({
				error
			});
		});
}

//date
async function dateex(req, res) {
	console.log('hi');
	// $dayOfYear
	//$month
	//$hour
	await Crudmodel.aggregate([{$project:{name:1,"month":{$year:"$createdAt"}}}])
		.then(response => {
			res.json({response});
		}).catch(error => {
			res.json({
				error
			});
		});
}


//condition
async function condition(req, res) {
	//$avg
	//$max
	console.log('hi');
	await Crudmodel.aggregate([{
		$group:
		  {
			_id: "$name",
			avgQuantity: { $min:"$age"}
		  }
	  }])
		.then(response => {
			res.json({response});
		}).catch(error => {
			res.json({
				error
			});
		});
}


//sort by count
async function sortby(req, res) {
	console.log('hi');
	await Crudmodel.aggregate([{ $sortByCount: "$age"}])
		.then(response => {
			res.json({response})
		}).catch(error => {
			res.json({
				error
			});
		});
}


// Mail
var transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
	  user: 'ar78711717@gmail.com',
	  pass: ''
	}
  });
  var mailOptions = {
	from: 'ar78711717@gmail.com',
	to: 'lovelyrahman270@gmail.com',
	subject: 'Sending Email using NodeMailer',
	// text: `HI Iam Abdul`
	html: '<h1>Bold Letter</h1>'        
  };
  async function mail(){
  transporter.sendMail(mailOptions, function(error, info){
	if (error) {
	  console.log(error);
	} else {
	  console.log('Email sent: ' + info.response);
	}
  });
}




module.exports={create,get,sort,update,remove,run,limit,gt,dis,group,match,count,sortby,project,condition,paginate,mail,concat,dateex}