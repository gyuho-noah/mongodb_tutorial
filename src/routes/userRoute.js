const { Router } = require('express');
const userRouter = Router();
const { User, Blog, Comment } = require('../models');
const { isValidObjectId } = require('mongoose');

userRouter.get('/', async (req, res) => {
    try {
        let { page } = req.query;
        page = parseInt(page);
        const users = await User.find({}).sort({ updatedAt: -1 }).skip(page * 3).limit(3);;
        return res.send(users);
    } catch(error) {
        console.log(error);
        return res.status(500).send({error : error.message});
    }
})

userRouter.get('/:userId', async(req, res) => {
    try {
        const { userId } = req.params;
        if(!isValidObjectId(userId)) return res.status(400).send({error : 'invalid userId'});
        const user = await User.findOne({_id: userId});
        return res.send({ user });
    } catch(e) {
        console.log(e);
        return res.status(500).send({error : e.message});
    }
})

userRouter.post('/', async (req, res) => {
    try{
        let { username, name } = req.body
        const user = new User(req.body);
        await user.save();
        return res.send({result : 200, resultMessage : "success", user});
    }catch (error) {
        console.log(error);
        return res.status(500).send({error : error.message});
    }
})

userRouter.put('/:userId', async(req, res) => {
    try{
        const { userId } = req.params
        if(!mongoose.isValidObjectId(userId)) return res.status(400).send({error : 'invalid userId'});
        const { name, age } = req.body;
        if(!age && !name)
            return res.status(400).send({error: 'age or name is required'});
        if(!age && typeof age !== 'number')
            return res.status(400).send({error : 'age must be a number'});
        if(!name && typeof name.first !== 'string' && typeof name.last !== 'string');
            return res.status(400).send({error: 'first and last name are strings'});

        // let updateBody = {};
        // if(!name) updateBody.name = name;
        // if(!age) updateBody.age = age;

        // const user = await User.findByIdAndUpdate(userId, updateBody, { new: true });
        let user = await User.findById(userId);
        if(age) user.age = age;
        if(name) {
            user.name = name;
            await Promise.all([
                Blog.updateMany({ 'user._id': userId }, { 'user.name': name }),
                Blog.updateMany(
                    {},
                    { 'comments.$[].userFullName': `${name.first} ${user.last}`},
                    {arrayFilters: [{'element.user': userId}]}
                )
            ])
        }
        await user.save();
        return res.send({result : 200, resultMessage : "success", user});
    }catch (error) {
        console.log(error);
        return res.status(500).send({error : error.message});
    }
})

userRouter.delete('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        if(!mongoose.isValidObjectId(userId)) return res.status(400).send({error : 'invalid userId'});
        const user = await User.findOneAndDelete({_id: userId});
        await Promise.all([
            Blog.deleteMany({ 'user._id': userId }),
            Blog.updateMany({ 'comments.user': userId }, {$pull: { comments: { user: userId } }}),
            Comment.deleteMany({ user: userId })
        ]);
        return res.send({ user });
    } catch(e) {
        console.log(error);
        return res.status(500).send({error : error.message});
    }
})

module.exports = {
    userRouter
}