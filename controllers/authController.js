const User = require('../models/User');
const { hashPassword, comparePassword } = require('../middleware/authHashpassword');
const jwt = require('jsonwebtoken');

// Register
const registerUser = async(req, res) => {
    try {
        const { name, email, password, contactnumber, address, role } = req.body;

        if(!name){
            return res.json({
                error: 'Name is required'
            })
        };

        if(!email){
            return res.json({
                error: 'Email is required'
            })
        };    

        if(!password || password.length < 6){
            return res.json({
                error: 'Password is required and should be minimum 6 characters long'
            })
        };

        if(!contactnumber){
            return res.json({
                error: 'Contact number is required'
            })
        };

        if(!address){
            return res.json({
                error: 'Address is required'
            })
        };

        const existemail = await User.findOne({email});
        if(existemail){
            return res.json({
                error: 'Email is already in use'
            })
        };       

        const hashedPassword = await hashPassword(password);

        const user = await User.create({
            name,
            email,            
            password: hashedPassword,
            contactnumber,
            address,
            role
        });       

        return res.json({
            user            
        })

    } catch (error) {
        console.log(error);
        res.status(500).send('Server error');
    }
}

//Login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({email});

        if(!email){
            return res.json({
                error: 'Email is required'
            })
        }; 

        if(!password){
            return res.json({
                error: 'Password is required'
            })
        };

        if(!user){
            return res.json({
                error: 'No user found'
            })
        };

        const match = await comparePassword(password, user.password);

        if(match){
            jwt.sign({
                id: user._id
            }, process.env.JWT_SECRET, {expiresIn: '1d'}, (err, token) => {
                if(err) throw err;
                res.cookie('token', token).json(user)
            })                
           
        }
        if(!match){
            res.json({
                error: 'Password is incorrect'            
            })
        }
    } catch (error) {
        console.log(error);
    }
}

//view profile
const getProfile = async (req, res) => {
    try {        
        res.json(req.user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};


module.exports = {
    registerUser,
    loginUser,
    getProfile
}