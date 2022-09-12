const express = require('express');
const router = express.Router();

//mongoose user model
const User = require('./../models/User')

//password handler
const bcrypt = require('bcrypt');

//signup
router.post('/signup', (req, res) => {
    let {name, email, password, dateOfBirth} = req.body;
    name = name.trim();
    email = email.trim();
    password = password.trim();
    dateOfBirth = dateOfBirth.trim();

    if(name == "" || email == "" || password == "" || dateOfBirth == ""){
        res.json({
            status: "FAILED",
            message: "Empty input fields!"
        })
    }else if (!/^[a-zA-Z]*$/.test(name)){
        res.json({
            status: "FAILED",
            message: "Invalid Name entered"
        })
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)){
        res.json({
            status: "FAILED",
            message: "Invalid Email entered"
        })
    } else if (!new Date(dateOfBirth).getTime()) {
        res.json({
            status: "FAILED",
            message: "Invalid Date of Birth entered"
        })
    } else if (password.lenght < 8) {
        res.json({
            status: "FAILED",
            message: "Password is too short!"
        })
    } else {
        // checking if user exists
        User.find({email}).then(result => {
            if (result.lenght){
                // A user has already been created
                res.json({
                    status: "FAILED",
                    message: "User with the provided email already exists"
                })
            } else {
                // Try to create user

                //password handling
                const salRounds = 10;
                bcrypt.hash(password, salRounds).then(hashedPassword => {
                    const newUser = new User({
                        name,
                        email,
                        password: hashedPassword,
                        dateOfBirth
                    })

                    newUser.save().then(result =>{
                        res.json({
                            status: "SUCCESS",
                            message: "Signup Successful",
                            data: result
                        })
                    }) .catch(err =>{
                        res.json({
                            status: "FAILED",
                            message: "An error occurred while saving the user account"
                        })
                    });

                }).catch(err => {
                    res.json({
                        status: "FAILED",
                        message: "An error occurred while hashing the password"
                    })
                })
            }
        }).catch(err => {
            console.log(err);
            res.json({
                status: "FAILED",
                message: "An error occured while checking for exsiting user!"
            })
        })
    }
})

//sign-in
router.post('/signin', (req, res) => {
    let {email, password} = req.body;
    email = email.trim();
    password = password.trim();

    if(email == "" || password == ""){
        res.json({
            status: "FAILED",
            message: "Empty Credentials Supplied!!"
        })
    }else {
        User.find({email}).then(data => {
            if(data.length){
                //user exists
                const hashedPassword = data[0].password;
                bcrypt.compare(password,hashedPassword).then(result => {
                    if (result) {
                        // Password match
                        res.json({
                            status: "SUCCESS",
                            message: "Signin successful",
                            data: data
                        })
                    }else {
                        res.json({
                            status: "FAILED",
                            message: "Invalid password entered"
                        })
                    }
                 })
                 .catch(err => {
                    res.json({
                        status: "FAILED",
                        message: `An error occurred while comparing passwords`
                    })
                    
                 })
            } else {
                    res.json({
                        status: "FAILED",
                        message: "invalid credentials entered"
                    })     
            }  
        })
        .catch(err => {
            res.json({
                status: "FAILED",
                message: `An error occurred while checking for existing user`,
            })
            
         })
    }
})

module.exports = router;