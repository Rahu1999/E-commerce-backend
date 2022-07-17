const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.get(`/`, async (req, res) =>{

    // for facthing name email and phone only we can use this.
    // const userList = await User.find().select('name phone email');
    const userList = await User.find().select('-passwordHash');

    if(!userList) {
        res.status(500).json({success: false})
    } 
    res.send(userList);
})

router.get('/:id', async (req,res)=>{
    const user = await User.findById(req.params.id).select('-passwordHash');
    if(!user){
        res.status(500).json({message: 'The user with the given ID was not found'})
    }
    res.status(200).send(user);
})

router.post(`/`,async (req,res)=>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password,10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })
    user = await user.save();

    if(!user){
        return res.status(404).send('The user cannot be created..')
    }
    else{
        res.send(user);
    }
})

router.put('/:id', async(req,res)=>{
    const userExist = await User.findById(req.params.id);

    let newPassword
    if(req.body.password){
        newPassword = bcrypt.hashSync(req.body.password,10)
    }
    else{
        newPassword = userExist.passwordHash;
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            email: req.body.email,
            passwordHash: newPassword,
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            street: req.body.street,
            apartment: req.body.apartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country,
        },
        {new: true},
    )
    if(!user){
        res.status(500).json({message: 'The user with the given ID was not found'})
    }
    res.status(200).send(user);
})

router.post('/login', async (req,res)=>{
    const user = await User.findOne({email: req.body.email});
    const secret = process.env.secret;
    if(!user){
        return  res.status(404).send('User not found');
    }

    if(user && bcrypt.compareSync(req.body.password, user.passwordHash)){
        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin
            },
            secret,
            {expiresIn: '1d'}   //1d for oane day  &  1w for one week
        )
     return   res.status(200).send({user: user.email, token: token});
    }else{
          res.status(404).send('password is wrong!!')
    }
    
   
})

router.post(`/register`,async (req,res)=>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password,10),   // in req.body   password
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })
    console.log("user====>"+JSON.stringify(user))
    user = await user.save();

    if(!user){
        return res.status(404).send('The user cannot be created..')
    }
    else{
        res.send(user);
    }
})

router.get(`/get/count`,async (req,res)=>{
    const userCount = await User.countDocuments((count)=> count)

    if(!userCount){
        res.status(500).json({success:false})
    }
    res.send({
        userCount: userCount
    });
})

router.delete(`/:id`,(req,res)=>{
    User.findByIdAndDelete(req.params.id).then(user =>{
        if(user){
            return res.status(200).json({success:true , message: 'user deleted Successfully..'})
        }
        else{
            return res.status(404).json({success:false, message: 'user not found...'})
        }
    }).catch(err=>{
      return  res.status(400).json({success:false, error:err})
    })
})

module.exports =router;