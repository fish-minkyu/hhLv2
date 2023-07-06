const express = require("express")
const router = express.Router()
const jwt = require("jsonwebtoken")
const User = require("../schemas/user.js")

module.exports = async (req, res, next) => {
    const {Authorization} = req.cookies
    const [authType, authToken] = (Authorization ?? "").split(" ")

    if (authType !== 'Bearer' || !authToken) {
        res.status(401).send({errorMessage: '로그인이 필요한 기능입니다.'})
        return
    }

    try {
        const {userId, nickname} = jwt.verify(authToken, 'secretKey')

        const user = await User.findById(userId)
        res.locals.user = user // user라는 이름의 객체
        // console.log('locals.user입니다', res.locals.user) 
        next()
        
    } catch (err) {
        console.log(err)
        res.status(401).send({errorMessage: '전달된 쿠키에서 오류가 발생하였습니다.'});
        return
    }
}
