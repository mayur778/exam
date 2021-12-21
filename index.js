const express = require("express");
const app = express();
const session = require("express-session");
const fileupload = require("express-fileupload");
const mongoose = require("mongoose");

app.use(session({
    secret:"cbnjwlec",
    saveUninitialized: true,
    resave: false
}))

mongoose.connect(
    "mongodb://localhost/exam1",
    {useNewUrlParser:true,useUnifiedTopology:true},
    (err) => {
        if(!err){console.log("connected")}
        else{console.log(err)}
    }
);

const userSchema = new mongoose.Schema({
    name:String,
    address:String,
    email:String,
    pic:String,
    password:String

});

const userModel = mongoose.model("user", userSchema);

app.use(express.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.set("static", "/views/");

app.get("/getImage/:image", (req,res) => {
    return res.sendFile("./public/images/"+req.params.image, {root: "./"})
})

app.get("/loginpage", (req,res) => {
    res.render("login");
});

app.post("/login", async(req,res) => {
    const id = req.body.name;
    const password = req.body.password;

    const user = await userModel.findOne({name:id});

    if(user.password === password)
    {   
        req.session.userName = true;
        res.redirect("/");
    }
    else{
        console.log("not found user");
    }

})

app.get("/logout", (req,res)=>{
    req.session.destroy((err)=>{
        if(!err){res.redirect("/loginpage")}
        else{console.log(err)}
    })
})


app.get("/", (req,res) => {
    try {
        if(req.session.userName)
        {
            userModel.find({}).then(data => {
                return res.render("display", {data});
            })
        }
        else{
            res.redirect("/loginpage");
        }
        
    } catch (error) {
        return res.status(402).json(error);
    }
})

app.get("/insertpage", (req,res) => {
    if(req.session.userName)
        {
            res.render("insert");
        }
        else{
            res.redirect("/loginpage");
        }
    
})

app.post("/insert",fileupload({
    useTempFiles:true,
    tempFileDir:"/tmp/"
}), (req,res) => {
    
    try {
        req.files.image.mv("./public/images/"+req.files.image.name);
    var image = req.files.image.name;
    const data = new userModel({
        name:req.body.name,
        address:req.body.adress,
        email:req.body.email,
        pic:image,
        password:req.body.password
    })
    data.save().then(result => {
        return res.redirect("/");
    })

    } catch (error) {
        return res.status(401).json(error);
    }
})

app.get("/delete/:id", (req,res) => {
    try {
        userModel.deleteOne({_id:req.params.id}).then(result => {
            return res.redirect("/");
        })
    } catch (error) {
        return res.status(401).json(error);
    }
})



app.listen(5000);
