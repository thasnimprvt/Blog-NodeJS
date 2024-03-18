const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminLayout = '../views/layout/admin';
const jwtsecret = process.env.JWT_SECRET;


// check login
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if (!token){
        return res.status(401).json({ message: 'unautherized'});
    }
    try{
        const decoded = jwt.verify(token, jwtsecret);
        req.userId = decoded.userId;
        next();
    }catch(error){
        res.status(401).json({ message: 'unautherized'});
    }
}

router.get('/admin',async (req, res) => {
   
    try{
        const locals = {
            title: 'Admin',
            description: 'Simple Blog created with NodeJs, Express & MongoDb.'
        }
        res.render('admin/index', {locals, layout: adminLayout});
    }catch(error){
        console.log(error);
    }
});


// admin - check login
router.post('/admin',async (req, res) => {
   
    try{
        const {username, password} = req.body;
        const user = await User.findOne({ username });
        if (!user){
            return res.status(401).json({message: 'invalid credentials'});
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid){
            return res.status(401).json({message: 'invalid credentials'});
        }
        const token = jwt.sign({ userId: user._id}, jwtsecret);
        res.cookie('token', token, {httpOnly: true});
        res.redirect('/dashboard');
    }catch(error){
        console.log(error);
    }
});



// Admin - Dashboard
router.get('/dashboard', authMiddleware, async(req, res) => {
    try{
        const locals = {
            title: 'Dashboard',
            description: 'Simple Blog created with NodeJs, Express & MongoDb.'
        }
        const data = await Post.find();
        res.render('admin/dashboard', {
            locals,
            data,
            layout: adminLayout
        });
    }catch(error){
        console.log(error);
    }
});

// GET _ Admin - Create New post
router.get('/add-post', authMiddleware, async(req, res) => {
    try{
        const locals = {
            title: 'Add Post',
            description: 'Simple Blog created with NodeJs, Express & MongoDb.'
        }
        res.render('admin/add-post', {
            locals,
            layout: adminLayout
        });
    }catch(error){
        console.log(error);
    }
});



// POST _ Admin - Create New post
router.post('/add-post', authMiddleware, async(req, res) => {
    try{
        console.log(req.body);
        try{
            const post = new Post({
                title: req.body.title,
                body: req.body.body
            });
            await Post.create(post);
            res.redirect('/dashboard');
        }catch(error){
            console.log(error);
        }
    }catch(error){
        console.log(error);
    }
});



//Admin - GET_View or edit post
router.get('/edit-post/:id', authMiddleware, async(req, res) => {
    try{
        const locals = {
            title: 'Edit Post',
            description: 'Simple Blog created with NodeJs, Express & MongoDb.'
        }
        const data =  await Post.findOne({ _id: req.params.id});
        res.render('admin/edit-post',{
            locals,
            data,
            layout: adminLayout
        });
    }catch(error){
        console.log(error);
    }
});


//Admin - PUT_View or edit post
router.put('/edit-post/:id', authMiddleware, async(req, res) => {
    try{
        await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.body,
            updatedAt: Date.now(),
        })
        res.redirect(`/edit-post/${req.params.id}`);
    }catch(error){
        console.log(error);
    }
});




//Admin - DELETE_ detete post
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {

    try {
      await Post.deleteOne( { _id: req.params.id } );
      res.redirect('/dashboard');
    } catch (error) {
      console.log(error);
    }
  
  });

//Admin - GET_logout
router.get('/logout',(req, res) => {
    res.clearCookie('token');
    //res.json({ message: 'Logout successful'});
    res.redirect('/');
});



// Reister
// router.post('/register',async (req, res) => {
   
//     try{
//         const {username, password} = req.body;
//         hashedPassword = await bcrypt.hash(password, 10);
//         try{
//             const user = await User.create({username, password: hashedPassword});
//             res.status(201).json({ message: 'User created', user});
//         }catch(error){
//             if (error.code === 11000){
//                 res.status(409).json({message: 'user already exist'});
//             }
//             res.status(500).json({message: 'Internal server error'});
//         }
        
//     }catch(error){
//         console.log(error);
//     }
// });


module.exports = router;