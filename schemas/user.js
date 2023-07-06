const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({

    nickname: {type: String, required: true, unique: true},
    password: {type: String, required: true}

})

// get의 콜백함수대로 userId 생성
// mongoDB _id를 "userId"에 넣고 16진수 문자열로 바꾸어라
UserSchema.virtual("userId").get(function() {
    return this._id.toHexString()
})

// toJSON으로 형변환을 할 때, 가상값도 출력해라
UserSchema.set("toJSON", {
    virtuals: true
})

module.exports = mongoose.model("User", UserSchema)