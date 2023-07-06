const express = require('express')
const router = express.Router()
const authMiddleWare = require("../middleware/auth-middleware.js")

// 스키마 연결
const Post = require("../schemas/post.js")

// 1. 전체 게시글 목록 조회 API
router.get('/posts', async (req, res) => {
	try{
		const postList = await Post.find({}).sort({createdAt: -1}).exec() // Post 컬렉션 all 불러오기
		const board = postList.map((item) => {
			return { // 객체구조분해할당: 키값 변경
				postId: item["_id"], // _id 필드는 mongoDB가 default로 주는 id값
				userId: item["userId"],
				nickname: item["nickname"],
				title: item["title"],
				createdAt: item["createdAt"],
				updatedAt: item["updatedAt"]
				}
		})
		res.status(200).json({posts: board})
	} catch (err) {
		res.status(500).json({message: err.message})
	}
})


// 2. 게시글 작성 API
// authMiddleWare -> jwt토큰 받아서 userId로 확인하기
router.post('/posts', authMiddleWare, async (req, res) => {
	const {title, content} = req.body
	const {userId, nickname} = res.locals.user

	try {
		if (!Object.keys(req.body).length) {
			res.status(412).json({errorMessage: '데이터 형식이 올바르지 않습니다.'})
			return
		}

		if (!title || title.length > 20) {
			res.status(412).json({errorMessage: '게시글 제목의 형식이 일치하지 않습니다.'})
			return
		}

		if (!content || content.length > 500) {
			res.status(412).json({errorMessage: '게시글 내용의 형식이 일치하지 않습니다.'})
			return
		}

		await Post.create({userId, nickname, title, content})
		res.status(201).json({message: '게시글 작성에 성공하였습니다.'})

	} catch (err) {
		console.log(err)
		res.status(412).json({errorMessage: '게시글 작성에 실패하였습니다.'})
	}
})

// 3. 게시글 상세 조회 API (GET)
router.get("/posts/:postId", async(req, res) => {
	try {
		const {postId} = req.params 
		const item = await Post.findOne({_id: postId}) 
		const selectedPost = {
			postId: item['_id'],       
			userId: item['userId'],
			nickname: item['nickname'],
			title: item['title'],
			content: item['content'],
			createdAt: item['createdAt'],
			updatedAt: item['updatedAt']
		}
		res.status(200).json({post: selectedPost})

	} catch (err) {
		console.log(err)
		res.status(400).json({errorMessage: '게시글 조회에 실패하였습니다.' })
	}
})

// 토큰을 검사하여, 해당 사용자가 작성한 게시글만 수정 가능
// 4. 게시글 수정 API (PUT)
router.put("/posts/:postId", authMiddleWare, async(req, res) => {
	const {postId} = req.params
	const {title, content} = req.body
	const {userId} = res.locals.user

	const post = await Post.findOne({_id: postId}).exec()

	try {
		if (!Object.keys(req.body).length) {
			res.status(412).json({errorMessage: '데이터 형식이 올바르지 않습니다.'})
			return
		}

		if (!title || title.length > 20) {
			res.status(412).json({errorMessage: '게시글 제목의 형식이 올바르지 않습니다.'})
			return
		}

		if (!content || content.length > 500) {
			res.status(412).json({errorMessage: '게시글 내용의 형식이 올바르지 않습니다.'})
			return
		}

		if (userId !== post.userId) {
			res.status(403).json({errorMessage: '게시글 수정의 권한이 존재하지 않습니다.'})
			return
		}

		const updateResult = 
		await Post.updateOne({_id: postId}, {$set: {title, content, updatedAt: Date.now()}})

		if(updateResult.acknowledged) {
			res.status(200).json({message: "게시글을 수정하였습니다."})
		} else {
			res.status(401).json({errorMessage: '게시글이 정상적으로 수정되지 않았습니다.'})
		}

	} catch (err) {
		res.status(400).json({errorMessage: '게시글 수정에 실패하였습니다.'})
	}
})




// 5. 게시글 삭제 API (DELETE)
router.delete("/posts/:postId", authMiddleWare, async (req, res) => {
	const {postId} = req.params
	const {userId} = res.locals.user

	const existPost = await Post.findOne({_id: postId}).exec()

	try {
		if (!userId) {
			res.status(403).json({errorMessage: '게시글의 삭제 권한이 존재하지 않습니다.'})
		}
	
		if (!existPost) {
			res.status(404).json({errorMessage: '게시글이 존재하지 않습니다.'})
		}

		const deleteResult = await existPost.deleteOne({_id: postId})

		if (deleteResult.acknowledged) {
			res.status(200).json({message: '게시글을 삭제하였습니다.'})
		} else {
			res.status(401).json({errorMessage: '게시글을 삭제하였습니다.'})
		}
	
	} catch (err) {
		res.status(400).json({errorMessage: '게시글 삭제에 실패하였습니다.' })
	}
})


module.exports = router
