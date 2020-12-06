const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const authenticate  = require('../middleware/auth');
const User = require('../models/user');
const UserAddress = require('../models/userAddress');
const fs = require('fs');
var privateKEY  = fs.readFileSync('./private.key', 'utf8'); //<-- move to .env for advance security
var i  = 'Test';          // Issuer //<-- move to .env for advance security
var s  = 'some@user.com'; // Subject //<-- move to .env for advance security
var a  = 'http://test.in'; // Audience//<-- move to .env for advance security
var signOptions = { //<-- move to .env for advance security
    issuer:  i,
    subject:  s,
    audience:  a,
    expiresIn:  "1h",
    algorithm:  "RS256"
};
router.post('/signup', (req, res, next) => {
    console.log(req.body.email);
    User.findOne({email: req.body.email})
    .exec()
    .then(user => {
        if(user){
            return res.status(500).json({
                message: 'Email already in use'
            })
        }else{
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if(err){
                    return res.status(500).json({
                        error: 'Something went wrong'
                    });
                }else{
                    const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        email: req.body.email,
                        password: hash,
                        createdAt: new Date().toISOString(),
                        isAdmin: req.body.isAdmin
                    });
                    user.save()
                    .then(doc => {
                        res.status(201).json({
                            message: 'Account created successfully'
                        });
                    })
                    .catch(er => {
                        res.status(500).json({
                            error: er
                        });
                    });
                }
                
            });
        }
        
    });
});
router.post('/login', async (req, res, next) => {
    await User.findOne({email: req.body.email})
    .select('_id firstName lastName email password isAdmin')
    .exec()
    .then(user => {
        if(user){
            bcrypt.compare(req.body.password, user.password, (err, result) => {
                if(err){
                    return res.status(500).json({
                        message: 'Login Failed'
                    })
                }else{
                    if(result){
                        console.log("user.isAdmin>>>"+user)
                        const payload = {
                            userId: user._id,
                            isAdmin: user.isAdmin
                        }
                        jwt.sign(payload, privateKEY, signOptions, (err, token) => {
                            if(err){
                                return res.status(500).json({
                                    message: 'Login Failed'
                                });
                            }else{
                                res.status(200).json({
                                    message: {
                                        user: {
                                            userId: user._id,
                                            firstName: user.firstName,
                                            lastName: user.lastName,
                                            email: user.email,
                                            isAdmin: user.isAdmin
                                        },
                                        token: token
                                    }
                                })
                            }
                        })
                    }else{
                        res.status(500).json({
                            message: 'Incorrect username or password'
                        });
                    }
                }
            });
        }else{
            res.status(500).json({
                message: 'Email doesn\'t not exists'
            });
        }
    })
    .catch(error => {
        res.status(500).json({
            error: error
        });
    })
});
router.post('/new-address', authenticate, (req, res, next) => {
    UserAddress.findOne({"user": req.body.userId})
    .exec()
    .then(user => {
        if(user){
            UserAddress.findOneAndUpdate({"user": req.body.userId}, {
                $push: {
                    "address": req.body.address
                }
            }, {
                new: true
            })
            .then(doc => {
                res.status(201).json({
                    message: doc
                });
            });
        }else{
            const userAddress = new UserAddress({
                _id: new mongoose.Types.ObjectId(),
                user: req.body.userId,
                address: req.body.address
            });
            userAddress.save()
            .then(doc => {
                res.status(201).json({
                    message: doc
                });
            })
            .catch(error => {
                res.status(500).json({
                    error: error
                });
            })
        }
    });
});
router.get('/get-addresses/:userId', authenticate, (req, res, next) => {
    console.log(req.params.userId);
    UserAddress.findOne({"user": req.params.userId})
    .select('_id user address')
    .exec()
    .then(user => {
        res.status(200).json({
            message: user
        })
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({
            error: error
        })
    })
});
module.exports = router;