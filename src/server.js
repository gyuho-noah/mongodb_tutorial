const express = require('express');
const app = express();
const { userRouter, blogRouter } = require('./routes');
const mongoose = require('mongoose');
const { generateFakeData } = require('../faker');
const { generateFake2Data } = require('../faker2');

const MONGO_URI = 'mongodb+srv://gyuho:VxLnXbHkSVsfIlCF@mongodbtutorial.pllpevu.mongodb.net/blogService?retryWrites=true&w=majority&appName=MongoDBTutorial';

const server = async() => {
    try {
        await mongoose.connect(MONGO_URI);

        mongoose.set({ debug:true });
        
        app.use(express.json());
        app.use('/user', userRouter);
        app.use('/blog', blogRouter);
        app.listen(3000, async () => {
            console.log('server listen');
            // await generateFakeData(1000000, 5, 20);
            // for(let i=0; i<20; i++) {
            //     await generateFake2Data(10, 2, 10);
            // }
        });
    } catch (err) {
        console.log(err);
    }
}

server();