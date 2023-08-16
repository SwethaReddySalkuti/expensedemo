const User = require('../models/user');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

function isstringinvalid(string){
    if(string == undefined ||string.length === 0){
        return true
    } else {
        return false
    }
}

 const signup = async (req, res)=>{
    
    const { name, email, password } = req.body;
    if(isstringinvalid(name) || isstringinvalid(email || isstringinvalid(password))){
        return res.status(400).json({err: "Bad parameters . Something is missing"})
    }
    
        const user = new User({
            name : name,
            email: email,
            password : password,
        })
        user
        .save()
        .then( result => {
            console.log('user sign up success');
            res.status(201).json({message: 'Successfuly create new user'})
        })
        .catch(err => {
            res.status(500).json(err);
        })
        
 
    

}

const generateAccessToken = (id, name) => {
    return jwt.sign({ userId : id, name: name} ,process.env.TOKEN_SECRET);
}

const login = async (req, res) => {
   
    const { email, password } = req.body;
    if(isstringinvalid(email) || isstringinvalid(password)){
        return res.status(400).json({message: 'EMail idor password is missing ', success: false})
    }
    User.findOne({ email : email })
    .then((user) => {
        
        if(user){  
            if(user.password === password){
                return res.status(200).json({success: true, message: "User logged in successfully", token: generateAccessToken(user.id, user.name)})
            }
            else{
            return res.status(400).json({success: false, message: 'Password is incorrect'})
           }
        } else {
            return res.status(404).json({success: false, message: 'User Doesnot exitst'})
        }
    })
    .catch((err) =>{
        res.status(500).json({message: err, success: false})
    }
    )
}




module.exports = {
    signup,
    login,
    generateAccessToken,
   


}


























































//bcrypt