const http = require('http');
const fs = require('fs');
const qs = require('querystring');
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://joyho796:Z135qet!@cluster0.h00z1.mongodb.net/stock_app?retryWrites=true&w=majority";
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", function() {
console.log("Listening on Port 3000");
});
http.createServer(function (req, res) {

     if (req.url == "./") {
          file = 'index.html';
          fs.readFile(file, function(err, txt) {
               res.writeHead(200, {'Content-Type': 'text/html'});
               res.write(txt);
               res.end();
          });
     } else if (req.url == "./search") {
          MongoClient.connect(url, { useUnifiedTopology: true },
               function(err, db) {
               if(err) { return console.log(err); return; }

               var dbo = db.db("stock_app");
               var collection = dbo.collection("companies");

               file = 'search.html';
               fs.readFile(file, function(err, txt) {
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    pdata = "";
                    req.on('data', data => {
                         pdata += data.toString();
                    });

                    req.on('end', () => {
                         pdata = qs.parse(pdata);
                         method = pdata['method'];
                         queryString = pdata['query'];
                         query = {};
                         if (method == "company name") {
                              query = {name: { $regex: new RegExp("^" + queryString.toLowerCase(), "i") }};
                         } else if (method == "stock ticker") {
                              query = {ticker: { $regex: new RegExp("^" + queryString.toLowerCase(), "i") }};
                         }

                         collection.find(query).toArray(function(err, result) {
                              if (err) throw err;
                              res.write("<h1>Stock Ticker App</h1>");
                              res.write("<div><h3 style='font-weight:normal'>Your search <i>\""+queryString+"\"</i> by "+method+" returned the following companies:</h3>");

                              if(result.length == 0 || queryString == "") {
                                   res.write("<p>No results found</p>")
                              } else {
                                   for(i=0;i<result.length;i++){
                                       res.write("<p> Company Name: "+result[i].name+"<br>Stock Ticker: "+result[i].ticker+"</p><br>");
                                   }
                              }

                              res.write("</div>");
                              res.write(txt);

                         });


                    });
               });

              console.log("connected to database successfully");
          })



     } else {
          res.writeHead(200, {'Content-Type':'text/html'});
          res.write ("Unknown page request");
          res.end();
     }


}).listen(8080);
