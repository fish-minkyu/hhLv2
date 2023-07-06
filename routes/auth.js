const express = require("express")
const router = express.Router()
const jwt = require("jsonwebtoken")
const User = require("../schemas/user.js")

/*
닉네임, 비밀번호를 request에서 전달받기
로그인 버튼을 누른 경우 닉네임과 비밀번호가 데이터베이스에 등록됐는지 확인한 뒤, 
하나라도 맞지 않는 정보가 있다면 "닉네임 또는 패스워드를 확인해주세요."라는 에러 메세지를 response에 포함하기
로그인 성공 시, 로그인에 성공한 유저의 정보를 JWT를 활용하여 클라이언트에게 Cookie로 전달하기
*/

// 로그인 API
router.post("/login", async(req, res) => {
    const {nickname, password} = req.body
    const user = await User.findOne({nickname})
    try {
        if(!user || password !== user.password) {
            res.status(412).json({errMessage: '닉네임 또는 패스워드를 확인해주세요.'})
            return
        } 
        const token 
        = jwt.sign({userId: user.userId, nickname: user.nickname}, 'secretKey')

        res.cookie('Authorization', `Bearer ${token}`)
        res.status(200).json({token})

    } catch (err) {
        res.status(400).json({errMessage: '로그인에 실패하였습니다.'})
    }
})


module.exports = router