const express = require("express")
const router = express.Router() 
const authMiddleWare = require("../middleware/auth-middleware.js")

// 스키마 연결
const Comments = require("../schemas/comments.js")
const Post = require("../schemas/post.js")

// 1. 댓글 목록 조회 (GET)
router.get("/posts/:postId/comments", async(req, res) => {
    const {postId} = req.params
    const existPost = await Post.findOne({_id: postId}).exec()
    const item = await Comments.find({}).exec()

    try {
        // 댓글을 작성할 게시글이 존재하지 않는 경우
        if (!existPost) {
            res.status(404).json({errorMessage: '게시글이 존재하지 않습니다.'})
            return
        }

        const commentList = item.map((item) => {
            return {
                commentId: item['_id'],
                userId: item['userId'],
                nickname: item['nickname'],
                comment: item['comment'],
                createdAt: item['createdAt'],
                updatedAt: item['updatedAt']
            }
        })
        res.status(200).json({comments: commentList})

    } catch (err) {
        console.log(err)
        res.status(400).json({errorMessage: '댓글 조회에 실패하였습니다.'})
    }
})


// 2. 댓글 작성 (POST)
router.post("/posts/:postId/comments", authMiddleWare, async(req, res) => {
    const {postId} = req.params
    const {comment} = req.body
    const {userId, nickname} = res.locals.user
    const existPost = await Post.findOne({_id: postId}).exec()

    try {
        // 댓글을 작성할 게시글이 존재하지 않는 경우
        if (!existPost) {
            res.status(404).json({errorMessage: '게시글이 존재하지 않습니다.'})
            return
        }

        if (!comment) {
            res.status(412).json({errorMessage: '댓글을 내용을 입력해주세요.'})
            return
        }

        await Comments.create({postId, userId, nickname, comment})
        res.status(200).json({message: '댓글을 생성하였습니다.'})
    } catch (err) {
        res.status(400).json({errorMessage: '댓글 작성에 실패하였습니다.'})
    }
})


// 3. 댓글 수정 (PUT)
router.put("/posts/:postId/comments/:commentId", authMiddleWare, async (req, res) => {
    const {postId, commentId} = req.params
    const {userId} = res.locals.user
    const {comment} = req.body
    const existPost = await Post.findOne({_id: postId}).exec()
    const existComment = await Comments.findOne({_id: commentId})

    try {
        // 게시글이 존재하지 않는 경우 404
        if (!existPost) {
            res.status(404).json({errorMessage: '게시글이 존재하지 않습니다.'})
            return
        }
        // 댓글이 존재하지 않는 경우 404
        if (!existComment) {
            res.status(404).json({errorMessage: '댓글이 존재하지 않습니다.'})
            return
        }
        // 댓글의 수정 권한이 없는 경우 403
        if (userId !== existComment.userId) {
            res.status(403).json({errorMessage: '댓글의 수정권한이 존재하지 않습니다.'})
            return
        }

        if (!comment) {
            res.status(400).json({errorMessage: '댓글 내용을 입력해주세요.'})
            return
        }

        const updatedResult =
        await Comments.updateOne({_id: commentId}, {$set: {comment, updatedAt: Date.now()}})
        if (updatedResult.acknowledged) {
            res.status(200).json({message: '댓글을 수정하였습니다.'})
        } else {
            res.status(400).json({errorMessage: '댓글 수정에 실패햐였습니다.'})
        }
     
    } catch (err) {
        console.log(err)
        res.status(400).json({errorMessage: '댓글 수정에 실패하였습니다.'})
    }
})


// 4. 댓글 삭제 (DELETE)
router.delete("/posts/:postId/comments/:commentId", authMiddleWare, async(req, res) => {
    const {postId, commentId} = req.params
    const {userId} = res.locals.user
    const existPost = await Post.findOne({_id: postId}).exec()
    const existComment = await Comments.findOne({_id: commentId}).exec()

    try {
       // 게시글이 존재하지 않는 경우 404
       if (!existPost) {
        res.status(404).json({errorMessage: '게시글이 존재하지 않습니다.'})
        return
       }
       // 댓글 삭제 권한이 없는 경우 403
       if (userId !== existComment.userId) {
        res.status(403).json({errorMessage: '댓글의 삭제 권한이 존재하지 않습니다.'})
        return
       }
       // 댓글이 존재하지 않는 경우 404
       if (!existComment) {
        res.status(404).json({errorMessage: '댓글이 존재하지 않습니다.'})
        return
       }
       // 댓글 삭제가 실패한 경우 400
        const deletedComment = Comments.deleteOne({_id: commentId})
       if ((await deletedComment).acknowledged) {
        res.status(200).json({message: '댓글을 삭제하였습니다.'})
       } else {
        res.status(404).json({errorMessage: '댓글 삭제가 정상적으로 처리되지 않았습니다.'})
        return
       }

    } catch {
        res.status(400).json({errorMessage: '댓글 삭제에 실패하였습니다.'})
    }
})


module.exports = router
