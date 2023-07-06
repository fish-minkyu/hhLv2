const express = require("express");
const router = express.Router();
const User = require("../schemas/user.js")


// 회원가입 API
router.post("/signup", async(req, res) => {
    const {nickname, password, confirm} = req.body
    const existAccount = await User.findOne({nickname}) //mongoDB에서 조건에 해당하는 문서 검색, {nickname}이 검색 조건
    
    function rightSyntax(item) { 
        const regex = /^[a-zA-Z0-9]{3,}$/
        return regex.test(item)
    }
       
    try {             
        if (password !== confirm) {
            res.status(412).json({errorMessage: '패스워드가 일치하지 않습니다.'})
            return
        } 

        if (existAccount) {  
            res.status(412).json({errorMessage: '중복된 닉네임입니다.'})
            return
        } 
       
        if (!rightSyntax(nickname)) {
            res.status(412).json({errorMessage: '닉네임의 형식이 일치하지 않습니다.'})
            return
        } 

        if (password.includes(nickname)) {
            res.status(412).json({errorMessage: '패스워드에 닉네임이 포함되어 있습니다.'})
            return
        } 

        if (password.length < 4 || password.includes(nickname)) {
            res.status(412).json({errorMessage: '패스워드 형식이 일치하지 않습니다.'})
            return
        } 
        
        const user = new User({nickname, password})
        await user.save()
        console.log(user)
        res.status(201).json({message: '회원가입에 성공하였습니다.'})

    } catch (err) {
        console.log(err)
        res.status(400).json({errMessage: '요청한 데이터 형식이 올바르지 않습니다.'})
    }
})


module.exports = router