/*
nyt article scraper with mongoose
*/

//dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

//models
//var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

//scrapers
var request = require("request");
var cheerio = require("cheerio");


//initialize express
var app = express();

//use morgan and body parser with app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
	extended: false
}));

//make public a static dir
app.use(express.static("public"));

//database config with mongoose
mongoose.connect("mongodb://localhost/mongoosescraper");
var db = mongoose.connection;

//show any mongoose errors
db.on("errors", function(error){
	console.log("mongoose errorL ", error);
});

//routes
app.get("/scrape", function(req, res){

  request("http://www.nytimes.com", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);

      var result = {};

    // Now, we grab every h2 within an article tag, and do the following:
    $("h2.story-heading").each(function(i, element) {

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(element).children().text();
      result.link = $(element).children().attr("href");;

      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)
      var entry = new Article(result);

      // Now, save that entry to the db
       entry.save(function(err, doc) {
         // Log any errors
         if (err) {
           console.log(err);
         }
         // Or log the doc
         else {
           console.log(doc);
         }
       });

    });
  });
  // Tell the browser that we finished scraping the text
  res.send("Scrape Complete");
});



// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {
  // Grab every doc in the Articles array
  Article.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});



// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
