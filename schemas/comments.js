const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({

    postId: {type: String, required: true},
    userId: {type: String, required: true},
    nickname: {type: String, required: true},
    comment: {type: String, required: true},
    createdAt: {type: Date, default: Date.now, required: true},
    updatedAt: {type: Date, default: Date.now, required: true}
    
});


module.exports = mongoose.model("Comment", commentSchema);