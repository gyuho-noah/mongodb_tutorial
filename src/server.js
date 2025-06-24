const express = require('express');
const app = express();
const { userRouter, blogRouter } = require('./routes');
const mongoose = require('mongoose');
const { generateFakeData } = require('../faker');
const { generateFake2Data } = require('../faker2');

const server = async() => {
    try {
        const { MONGO_URI, PORT } = process.env;
        if(!MONGO_URI) throw new Error("MONGO_URI is required!!");

        await mongoose.connect(MONGO_URI);

        mongoose.set({ debug:true });
        
        app.use(express.json());
        app.use('/user', userRouter);
        app.use('/blog', blogRouter);
        app.listen(PORT, async () => {
            console.log(`server listening on port ${PORT}`);
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