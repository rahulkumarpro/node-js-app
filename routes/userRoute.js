import express from 'express';
import User from '../models/user.js';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';


const router = express.Router();


// create user

router.post('/register',async(req,res)=>{
    const {name,email,password} = req.body;
    try{
        const existingUser = await User.findOne({email});
        if(existingUser) return res.status(400).json({msg:"User already exists"});

        const hashedPassword = await bcrypt.hash(password,10);

        const newUser = new User({
            name,
            email,
            password:hashedPassword,
        });
        await newUser.save();
        res.status(201).json({msg:'User created successfully'});
    }catch(err){
        res.status(500).json({msg:"server error"});
    }
})

// update user

router.put('/:id',async(req,res)=>{
    const {id} = req.params;
    const {name,email,is_active} = req.body;

    try{
        const user = await User.findByIdAndUpdate(
            id,
            {name,email,is_active},
            {new:true}
        );
        if(!user) return res.status(404).json({msg:"user not found"});
        res.json(user);
    }catch(err){
        res.status(404).json({error:"server error"});
    }
});

// fetch active user list
router.get('/',async(req,res)=>{
    try{
        const users = await User.find({is_active:true}).select('-password');
        res.json(users);
    }catch(err){
        res.status(500).json({error:'Server Error'});
    }
});

// fetch single active user

router.get('/:id',async(req,res)=>{
    const {id} = req.params;
    try{
        const user = await User.findOne({_id:id,is_active:true}).select('-password');
        if(!user) return res.status(404).json({msg:'User not found or inactive'});
        res.json(user);
    }catch(err){
        res.status(500).json({error:'Server error'});
    }
});


// Login Api

router.post('/login',async(req,res)=>{
    const {email,password} = req.body;

    try{
        const user = await User.findOne({email});
        if(!user) return res.status(404).json({msg:"user not found"});
        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch) return res.status(400).json({msg:"Invalid credentials"});

        const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'1h'});

        res.json({
            token,
            user:{
                id:user._id,
                name:user.name,
                email:user.email,
                is_active:user.is_active,
            }
        });
    }catch(err){
        res.status(500).json({error:'server error'});
    }
})

export default router;
