const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({

    userId: {type: String, required: true},
    nickname: {type: String, required: true},
    title: {type: String, required: true},
    content: {type: String, required: true},
    createdAt: {type: Date, default: Date.now, required: true},
    updatedAt: {type: Date, default: Date.now, required: true}

});


module.exports = mongoose.model("Post", postSchema);

