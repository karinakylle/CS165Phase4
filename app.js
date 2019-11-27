//use path module
const path = require('path');
//use express module
const express = require('express');
//use hbs view engine
const hbs = require('hbs');
//use bodyParser middleware
const bodyParser = require('body-parser');
//use mysql database
const mysql = require('mysql');
const app = express();
 
//Create conn
const conn = mysql.createConnection({
  host: 'localhost',
  user: 'karinakylle',
  password: 'Karinaang5199!',
  database: 'AngK'
});
 
//connect to database
conn.connect((err) =>{
  if(err) throw err;
  console.log('Mysql Connected...');
});
 
//set views file
app.set('views',path.join(__dirname,'views'));
//set view engine
app.set('view engine', 'hbs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//set public folder as static folder for static file
//app.use('/assets',express.static(__dirname + '/public'));
 
















//route for list of applications (READ)
app.get('/list',(req, res) => {
  let sql = "SELECT App_Number, TIN, Physical_ID, Full_Name, Gender, Employer_Name, Blood_Type FROM TIN_Details NATURAL JOIN ApplicationForm NATURAL JOIN Employer NATURAL JOIN Physical_Details";
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    res.send(results);
    console.log(results);
  });
});
 














//route for creating ang application (CREATE)
app.post('/apply',(req, res) => {

	conn.beginTransaction(async (err) => {
	  if (err) { throw err; }
	  var appFormData = {};

	  let data ={TIN : req.body.tin , Full_Name : req.body.full_name, Present_Add : req.body.present_add, Gender : req.body.gender, Birth_Date : req.body.birth_date, TelCP_No: req.body.telcp_no, Birth_Place : req.body.birth_place, Nationality : req.body.nationality, Signature: req.body.signature, EA: req.body.ea, Father_Name: req.body.father_name, Mother_Name: req.body.mother_name, Spouse_Name: req.body.spouse_name, Civil_Status: req.body.civil_status};
	  await conn.query('INSERT INTO TIN_Details SET ?', data, (err, results, fields) => {
	    if (err) {
	      return conn.rollback(() => {
	        throw err;
	      });
	    }
	  });

	  let sql = "SELECT Employer_Name FROM Employer WHERE Employer_Name=?";
	  data = {Employer_Name : req.body.employer_name};

	  let query = await conn.query(sql, data, async (err, results) => {
	  	if(err) throw err;
	  	if(!results) {
	  		let data = {Employer_Name: req.body.employer_name, Employer_No : req.body.employer_no, Employer_Add : req.body.employer_add};
			  await conn.query('INSERT INTO Employer SET ?', data, (err, results, fields) => {
			    if (err) {
			      return conn.rollback(() => {
			        throw err;
			      });
			    }
			 	});
	  	}
	 });
	//console.log({inserted_physicalID});
	console.log({appFormData})
  data = {Blood_Type : req.body.blood_type , Hair : req.body.hair , Eyes : req.body.eyes , Complx : req.body.complx , Height : req.body.height , Weight : req.body.weight, Built : req.body.built};
  await conn.query('INSERT INTO Physical_Details SET ?', data, (err, results, fields) => {
    if (err) {
      return conn.rollback(() => {
        throw err;
      });
    }
    let x = results.insertId
    appFormData = {TIN : req.body.tin, Employer_Name : req.body.employer_name, Physical_ID : x};
	  conn.query('INSERT INTO ApplicationForm SET ?', appFormData, (err, results, fields) => {
	    if (err) {
	      return conn.rollback(() => {
	        throw err;
	      });
	    }
	    conn.commit((err) => {
	      if (err) {
	        return conn.rollback(() => {
	          throw err;
	        });
	        res.redirect('/list');
	      }
	    });
	  });
  });
});
});























//route for updating an application
 app.post('/update/:app_number',(req, res) => {
 		conn.beginTransaction(async (err) => {
	  if (err) { throw err; }
	  var appFormData = {};

	  let data = {App_Number: req.params.app_number}
	  await conn.query('SELECT * FROM ApplicationForm WHERE ?', data, (err, results, fields) => {
	    if (err) {
	      return conn.rollback(() => {
	        throw err;
	      });
	    }
		  let sql = "UPDATE TIN_Details SET ? WHERE TIN =" + results[0].TIN;
		  data ={TIN : req.body.tin , Full_Name : req.body.full_name, Present_Add : req.body.present_add, Gender : req.body.gender, Birth_Date : req.body.birth_date, TelCP_No: req.body.telcp_no, Birth_Place : req.body.birth_place, Nationality : req.body.nationality, Signature: req.body.signature, EA: req.body.ea, Father_Name: req.body.father_name, Mother_Name: req.body.mother_name, Spouse_Name: req.body.spouse_name, Civil_Status: req.body.civil_status};
		  let query = await conn.query(sql, data, async (err, results) => {
		    if (err) {
		      return conn.rollback(() => {
		        throw err;
		      });
		    }

		  sql = "UPDATE Physical_Details SET ? WHERE Physical_ID =" + results[0].Physical_ID;
		  data = {Blood_Type: req.body.blood_type, Hair: req.body.hair, Eyes: req.body.eyes, Complx: req.body.complx, Height: req.body.height, Weight: req.body.weight, Built: req.body.built};
		  query = await conn.query(sql, data, async (err, results) => {
		    if (err) {
		      return conn.rollback(() => {
		        throw err;
		      });
		    }
	  });
	});














//route for deleting an application
app.post('/delete/:app_number',(req, res) => {
	conn.beginTransaction(async (err) => {
	  if (err) { throw err; }
	  let data = {App_Number: req.params.app_number}
	  await conn.query('SELECT * FROM ApplicationForm WHERE ?', data, (err, results, fields) => {
	    if (err) {
	      return conn.rollback(() => {
	        throw err;
	      });
	    }
		  let sql = "DELETE FROM Physical_Details WHERE ?";
		  data = {Physical_ID : results[0].Physical_ID};
		  let query = await conn.query(sql, data, async (err, results) => {
		    if (err) {
		      return conn.rollback(() => {
		        throw err;
		      });
		    }

		  sql = "DELETE FROM TIN_Details WHERE ?";
		  data = {TIN : results[0].TIN};
		  query = await conn.query(sql, data, async (err, results) => {
		    if (err) {
		      return conn.rollback(() => {
		        throw err;
		      });
		    }

		  sql = "DELETE FROM ApplicationForm WHERE TIN ="  + results[0].TIN + "AND Physical_ID=" + results[0].Physical_ID;
		  data = {TIN : results[0].TIN, Physical_ID : results[0].Physical_ID};
		  query = await conn.query(sql, data, async (err, results) => {
		    if (err) {
		      return conn.rollback(() => {
		        throw err;
		      });
		    }
		 });
	  });
	});
});
 
//server listening
app.listen(8000, () => {
  console.log('Server is running at port 8000');
});