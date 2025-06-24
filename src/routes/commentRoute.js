const { Router } = require('express');
const commentRouter = Router({ mergeParams: true });
const { Blog, User, Comment } = require('../models');
const { isValidObjectId, startSession } = require('mongoose');

commentRouter.get('/', async(req, res) => {
    try {
        let { page=0 } = req.query;
        page = parseInt(page);
        const { blogId } = req.params;
        if(!isValidObjectId(blogId))
            return res.status(400),send({ error: 'blogId is invalid'});

        const comments = await Comment.find({ blog: blogId }).sort({ createdAt: -1 }).skip( page * 3 ).limit(3);
        return res.send({ comments });
    } catch(e) {
        console.log(e);
        res.status(500).send({ error: e.messge });
    }
})

commentRouter.post('/', async(req, res) => {
    // const session = await startSession();
    let comment;
    try {
        // await session.withTransaction(async () =>{
            const { blogId } = req.params;
            const { content, userId } = req.body;

            if(!isValidObjectId(blogId))
                return res.status(400),send({ error: 'blogId is invalid'});
            if(!isValidObjectId(userId))
                return res.status(400),send({ error: 'userId is invalid'});
            if(typeof content !== 'string')
                return res.status(400),send({ error: 'content is required'});

            const [blog, user] = await Promise.all([
                Blog.findById(blogId, {}, {}),
                User.findById(userId, {}, {})
            ]);

            if(!blog || !user) return res.status(400).send({ error: 'blog or user does not exist' });
            if(!blog.islive) return res.status(400).send({ error: 'blog is not available' })

            comment = new Comment({ content, user, userFullName: `${user.name.first} ${user.name.last}`, blog: blogId });
            // blog.commentCnt++;
            // blog.comments.push(comment);
            // if(blog.commentCnt > 3) blog.comments.shift();

            // await Promise.all([
            //     comment.save({}),
            //     blog.save()
            //     // Blog.updateOne({ _id: blogId }, { $inc: { commentCnt: 1 } })
            //     // Blog.updateOne({ _id: blogId }, { $push: { comments: comment } })
            // ]);
        // });

        await Promise.all([ comment.save(), Blog.updateOne({ _id: blogId }, { $inc: { commentCnt: 1 }, $push: { comments: { $each: [comment], $slice: -3 } } })]);

        return res.send({ comment });
    } catch(e) {
        console.log(e);
        res.status(500).send({ error: e.messge });
    }
    //  finally {
    //     await session.endSession();
    // }
})

commentRouter.patch("/:commentId", async (req, res) => {
    const { commnetId } = req.params;
    const { content } = req.body;
    if(typeof content !== "string")
        return res.status(400).send({error: "content is required"});

    const comment = await Promise.all([
        Comment.findOneAndUpdate({ _id: commnetId }, { content }, { new: true }),
        Blog.updateOne({ 'comments._id': commentId }, { "comments.$.content": content })
    ]);
    return res.send({ comment });
})

commentRouter.delete("/:commentId", async(req, res) => {
    const { commentId } = req.params;
    const comment = await Comment.findOneAndDelete({ _id: commentId });
    await Blog.updateOne({ "comments_id": commentId }, { $pull: {comments: { _id: commentId }}});

    return res.send({ comment });
})

module.exports = { commentRouter };