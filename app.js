const express = require("express");
const app = express();
const bcrypt = require("bcrypt")

const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const PORT = 3000




const MONGO_URI = "mongodb+srv://tannushree:admin_tannushree@cluster0.tq26bem.mongodb.net/BlogDB?retryWrites=true&w=majority"


app.use(bodyParser.urlencoded({ extended: true }))

app.set("view engine", "ejs")

app.use(express.static("public"))

// connecting to the db
mongoose.connect(MONGO_URI)
    .then(() => {
        // if the connection to db is successfull only then our app server will start
        app.listen(PORT, () => {
            console.log("Connected to DB\nServer started on port ", PORT)
        })
    })
    .catch((err) => {
        console.log(err);
    })

//Blog Schema//
const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        minLength: 6
    },
    content: {
        type: String,
        required: true,
        minLength: 5
    }
})

// user schema
// name : String , required
// email : String , required , unique
// password : String , required , minLength : 6

const userSchema = {
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    }

}



//model
const Blog = new mongoose.model("blog", blogSchema);

const User = new mongoose.model("user", userSchema);






app.get("/", (req, res) => {
    res.render("Home")
})

// app.get("/compose", (req, res) => {
//     res.render("Compose.ejs");

// })



//
app.post("/compose", (req, res) => {
    var title = req.body.title
    var content = req.body.content
    console.log(title);
    console.log(content);

    const new_item = new Blog({
        title: title,
        content: content
    })
    new_item.save()
        .then(() => {
            console.log("Items Added Successfully");
            res.redirect("/blogs")
        })
        .catch((err) => {
            console.log(err);
        })

})

app.get("/blogs", (req, res) => {
    Blog.find({})
        .then((foundBlogs) => {
            console.log("blogs => ", foundBlogs);
            res.render("Blogs.ejs", {
                blogs_array: foundBlogs
            })

        })

        .catch((error) => {
            console.log(error);

        })


})


// auth routes

app.get("/signup", (req, res) => {
    res.render("signup");

})

app.get("/login", (req, res) => {
    res.render("login");

})

app.post("/signup", (req, res) => {
    var name = req.body.name
    var email = req.body.email
    var pass = req.body.password


    bcrypt.hash(pass, 10, function (err, hash) {
        if (err) {
            console.log(err);
        } else {
            const new_user = new User({
                name: name,
                email: email,
                password: hash
            })
            new_user.save()
                .then(() => {
                    console.log("new user added");
                    res.redirect("/blogs");
                })
                .catch((err) => {
                    console.log(err);

                }
                )
        }
    });



})

app.post("/login", (req, res) => {
    var email = req.body.email;
    var pass = req.body.password

    //check if email is present in database//
    User.find({ email: email })
        .then((foundUser) => {


            console.log(foundUser)

            if (foundUser.length === 0) {
                res.send("no user found");
                // terminate and do not move ahead
                return;
            }

            bcrypt.compare(pass ,foundUser[0].password).then(function(result) {
               if(result){
                res.render("compose")
               }else{
                res.redirect("/")
                console.log(result, "password doesn't match");
               }
            });

            // if (foundUser[0].password === pass) {
            //     res.render("compose")
            //     // res.send("successfully logged in");
            // } else {
            //     console.log("password is incorrect");
            // }
        })
        .catch((err) => {
            console.log(err);

        })
})
