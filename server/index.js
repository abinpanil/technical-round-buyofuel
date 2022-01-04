const express = require('express');
const mongoose = require('mongoose');

const Users = require("./models/user");
const Category = require("./models/category");
const Product = require("./models/products");

// server setup
const PORT = 4000;
const app = express();
app.listen(process.env.PORT || PORT);

// midlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// setup database
mongoose.connect('mongodb+srv://user:user@cluster0.sqieg.mongodb.net/test', err => {
    if (!err) console.log('database connected');
})


// api
app.post("/createUser", async (req, res) => {
    try {
        let { username, password } = req.body;
        // vlidation
        if (!username || !password)
            return res
                .status(400)
                .json({ error: "Must fill all fields" });
        // check user exist or not
        let existingUser = await Users.findOne({ username: username });
        if (!existingUser) {
            let saveUser = new Users({
                username: username,
                password: password
            });
            let saveIt = await saveUser.save();
            res.json(saveIt);
        } else {
            res.json({ error: "User already registerd." });
        }
    } catch (e) {
        res.status(500).send();
    }
})

app.get("/loginUser", async (req, res) => {
    try {
        let { username, password } = req.body;
        let checkUser = await Users.findOne({ username: username });
        // validation
        if (!username || !password)
            return res
                .send(400)
                .json({ error: "Must fill all fields" });
        if (!checkUser) {
            res.json({ error: "User not found" })
        } else {
            if (password !== checkUser.password) {
                res.json({ "error": "Authenticationf failed" });
                return;
            } else {
                res.json({ logedin: true, user: checkUser });
            }
        }
    } catch (e) {
        res.status(500).send();
    }
})

app.get("/category", async (req, res) => {
    let allCategorys = await Category.find();

    res.json(allCategorys);
})

app.post("/createCategory", async (req, res) => {
    try {
        let { categoryName } = req.body;

        // check cateogry exist or not
        let existingCategory = await Category.findOne({ categoryName: categoryName });
        if (!existingCategory) {
            let saveCategory = new Category({
                categoryName: categoryName
            });
            let saveIt = await saveCategory.save();
            res.json(saveIt);
        } else {
            res.json({ error: "Category already created." });
        }
    } catch (e) {
        res.status(500).send();
    }
})

app.post("/addNewProoduct", async (req, res) => {
    let { name, price, category, seller } = req.body;

    let newProduct = new Product({
        name, price, category, seller
    });
    let saveProduct = await newProduct.save();
    res.json(saveProduct);
})

app.post("/getProducts", async (req, res) => {

    let { name, category, seller } = req.query;

    if (!name) name = "";
    if (!category) category = "";
    if (!seller) seller = "";

    try {
        let allProducts = await Product.find({ name: { $regex: name, $options: "i" }, category: { $regex: category, $options: "i" }, seller: { $regex: seller, $options: "i" } });
        res.json(allProducts);
    } catch (e) {
        res.json({ error: "something went wrong!!" });
    }
})

app.delete("/deleteProduct/:id", async (req, res) => {
    try {
        let { id } = req.params;
        let deleteProduct = await Product.deleteOne({ _id: id });
        res.json(deleteProduct);
    } catch (e) {
        res.json({ error: "Something went wrong on deleting!!" });
    }
})