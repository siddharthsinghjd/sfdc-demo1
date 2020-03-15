var express = require('express');
var bodyParser = require('body-parser');
var pg = require('pg');
path = require("path");

//var mime = require('mime');
//var fs = require('fs');

var app = express();

app.set('port', process.env.PORT || 5000);

/*
* PG Client connection
*/
pg.defaults.ssl = true;

//var dbString = process.env.DATABASE_URL;
var dbString = 'postgres://uhwerlkmaxpvuu:8028d54b17f3b1e9219748ade2b3fbd052832452f2948c6687467c8bcf119322@ec2-35-174-88-65.compute-1.amazonaws.com:5432/d26nvbvsr8gkrp';

var sharedPgClient;

pg.connect(dbString, function(err,client){
    if(err){
        console.error("PG Connection Error")
    }
    console.log("Connected to Postgres");
    sharedPgClient = client;
});

/*
 * ExpressJS View Templates
 */
app.set("views", path.join(__dirname, "./app/views"));
app.set("view engine", "ejs");

app.get("/",function defaultRoute(req, res){
    var query = "SELECT * FROM salesforce.Contact";
    var result = [];
    sharedPgClient.query(query, function(err, result){
       // console.log("Jobs Query Result Count: " + result.rows.length);
        res.render("index.ejs", {connectResults: result.rows});
    });
});

app.get("/accounts",function defaultRoute(req, res){
    var query = "SELECT * FROM salesforce.account";
    var result = [];
    sharedPgClient.query(query, function(err, result){
       // console.log("Jobs Query Result Count: " + result.rows.length);
        res.render("index1.ejs", {connectResults: result.rows});
    });
});

app.get("/contacts",function defaultRoute(req, res){
    var query = "SELECT * FROM salesforce.Contact";
    var result = [];
    sharedPgClient.query(query, function(err, result){
      //  console.log(result.rows);
        //console.log("Jobs Query Result Count: " + result.rows.length);
        res.render("index2.ejs", {connectResults: result.rows});
    });
});

app.get("/createContact",function defaultRoute(req, res){
    var name = 'hello';
    res.render("index3.ejs", {sid:name});
});

app.get("/createAccount",function defaultRoute(req, res){
    var name = 'hello';
    res.render("index4.ejs", {sid:name});
});

app.use(express.static('public'));
app.use(bodyParser.json());

console.log(process.env.DATABASE_URL);

app.post('/update1', function(req, res) {
    sharedPgClient.query('INSERT INTO salesforce.Contact (Phone, MobilePhone, FirstName, LastName, Email) VALUES ($1, $2, $3, $4, $5)',
    [req.body.phone.trim(), req.body.phone.trim(), req.body.firstName.trim(), req.body.lastName.trim(), req.body.email.trim()],
    function(err, result) {
     // done();
      if (err) {
          res.status(400).json({error: err.message});
      }
      else {
          // this will still cause jquery to display 'Record updated!'
          // eventhough it was inserted
          res.json(result);
      }
    });
 });

 app.post('/update2', function(req, res) {
    sharedPgClient.query('INSERT INTO salesforce.Account (Name, AccountNumber, BillingCity) VALUES ($1, $2, $3)',
    [req.body.name.trim(), req.body.accountnumber.trim(), req.body.billingcity.trim()],
    function(err, result) {
     // done();
      if (err) {
          res.status(400).json({error: err.message});
      }
      else {
          // this will still cause jquery to display 'Record updated!'
          // eventhough it was inserted
          res.json(result);
      }
    });
 });

app.post('/update3', function(req, res) {
    sharedPgClient.query(
        'UPDATE salesforce.Contact SET Phone = $1, MobilePhone = $1 WHERE LOWER(FirstName) = LOWER($2) AND LOWER(LastName) = LOWER($3) AND LOWER(Email) = LOWER($4)',
        [req.body.phone.trim(), req.body.firstName.trim(), req.body.lastName.trim(), req.body.email.trim()],
        function(err, result) {
            if (err != null || result.rowCount == 0) {
            sharedPgClient.query('INSERT INTO salesforce.Contact (Phone, MobilePhone, FirstName, LastName, Email) VALUES ($1, $2, $3, $4, $5)',
              [req.body.phone.trim(), req.body.phone.trim(), req.body.firstName.trim(), req.body.lastName.trim(), req.body.email.trim()],
              function(err, result) {
               // done();
                if (err) {
                    res.status(400).json({error: err.message});
                }
                else {
                    // this will still cause jquery to display 'Record updated!'
                    // eventhough it was inserted
                    res.json(result);
                }
              });
            }
            else {
                //done();
                res.json(result);
            }
        }
    ); 
});

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
