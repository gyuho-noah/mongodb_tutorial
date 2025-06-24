const { Router } = require('express');
const blogRouter = Router();
const { Blog, User, Comment } = require('../models');
const { isValidObjectId } = require('mongoose');
const { commentRouter } = require('./commentRoute');

blogRouter.use("/:blogId/comment", commentRouter);

blogRouter.get('/', async(req, res) => {
    try {
        let { page = 0 } = req.query;
        page = parseInt(page);
        const blogs = await Blog.find({}).sort({ updatedAt: -1 }).skip(page * 3).limit(3);
        return res.send({ blogs });
    } catch(e) {
        console.log(e);
        res.status(500).send({ error: e.messge });
    }
})

blogRouter.get('/:blogId', async(req, res) => {
    try {
        const { blogId } = req.params;
        if(!isValidObjectId(blogId))
            res.status(400).send({error: 'blogId is invalid'});
        const blog = await Blog.findById(blogId);
        // const commentCnt = await Comment.find({ blog:blogId }).countDocuments();
        
        res.send({ blog, commentCnt });
    } catch(e) {
        console.log(e);
        res.status(500).send({ error: e.messge });
    }
})

blogRouter.post('/', async(req, res) => {
    try {
        console.log(req.body);
        const { title, content, islive, userId } = req.body;
        if(typeof title !== 'string')
            return res.status(400).send({error: 'title is required'});
        if(typeof content !== 'string')
            return res.status(400).send({error: 'content is required'});
        if(!islive && typeof islive !== 'boolean')
            return res.status(400).send({error: 'islive must be a boolean'});
        if(!isValidObjectId(userId))
            return res.status(400).send({error: 'userId is invalid'});

        let user = await User.findById(userId);

        if(!user)
            return res.status(400).send({error: 'user does not exist'});

        let blog = new Blog({ ...req.body, user });
        await blog.save();
        return res.send({ blog });
    } catch(e) {
        console.log(e);
        return res.status(500).send({ error: e.messge });
    }
})

blogRouter.put('/:blogId', async(req, res) => {
    try {
        const blogId = req.params;
        if(isValidObjectId(blogId))
            res.status(400).send({error: 'blogId is invalid'});

        const { title, content } = req.body;
        if(typeof title !== 'string')
            res.status(400).send({error: 'title is required'});
        if(typeof content !== 'string')
            res.status(400).send({error: 'content is required'});

        const blog = await Blog.findOneAndUpdate({ _id: blogId }, { title, content }, { new: true });
        return res.send({ blog })
    } catch(e) {
        console.log(e);
        res.status(500).send({ error: e.messge });
    }
})

blogRouter.patch('/:blogId/live', async(req, res) => {
    try {
        const blogId = req.params;
        if(isValidObjectId(blogId))
            res.status(400).send({error: 'blogId is invalid'});

        const { islive } = req.body;
        if(typeof islive !== 'boolean')
            res.status(400).send({error: 'islive must be a boolean'});

        const blog = await Blog.findByIdAndUpdate(blogId, { islive }, { new: true} );
        return res.send({ blog });
    } catch(e) {
        console.log(e);
        res.status(500).send({ error: e.messge });
    }
})

module.exports = { blogRouter };