// require stuff
var express          = require("express");
var app              = express();
var bodyParser       = require("body-parser");
var mongoose         = require("mongoose");
var methodOverride   = require("method-override")
var expressSanitizer = require("express-sanitizer");

// some settings
mongoose.connect("mongodb://localhost/RESTful_blog");
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer()); // important that it will come after the body parser
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(methodOverride("_method"));

// mongoose settings
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    Created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

// routes
app.get("/", function(req, res){
    res.redirect("/blogs");
});

// index route
app.get("/blogs", function(req, res){
    Blog.find({}, function(err, allBlogs){
        if(err){
            console.log(err);
        }
        else{
            res.render("index", {blogs: allBlogs});            
        }

    });
});

// new route
app.get("/blogs/new", function(req, res){
    res.render("new");
});

// create route
app.post("/blogs", function(req, res){
    
    // clear all unnecessery html tags that a kaker can put here
    req.body.blog.body = req.sanitize(req.body.blog.body);
    
    // create a new blog
    Blog.create(req.body.blog, function(err, createdBlog){
        
        // if we have an error say it
        if(err){
            console.log(err);
            res.render("new");
        }
        else{
            res.redirect("/blogs");
        }
    });
});

// show route
app.get("/blogs/:id",function(req,res){
    Blog.findById(req.params.id,function(err, post){
        
        // if we have an error say it
        if(err){
            console.log(err);
            res.redirect("/blogs");
        }
        else{
            res.render("show", {blog: post});
        }
    });
});

// edit route
app.get("/blogs/:id/edit", function(req, res){
    Blog.findById(req.params.id,function(err, post){
        if(err){
            res.redirect("/blogs");
        }
        else{
                res.render("edit", {blog: post});     
        }
    });
});

// update route
app.put("/blogs/:id", function(req, res){
    
    // sanitize some stuf off
    req.body.blog.body = req.sanitize(req.body.blog.body);
    
    // update the existing blog
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err){
            console.log(err);
            res.redirect("/blogs");
        }
        else{
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

// delete route
app.delete("/blogs/:id", function(req, res){
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.redirect("/blogs");
        }
    });
});

// listen man
app.listen(process.env.PORT, process.env.IP,function(){
    console.log("We are up!");
});