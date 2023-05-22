import express from 'express';
import WebSocket from 'ws';
import mongoose from 'mongoose';
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
app.use(express.json());

// Connect to MongoDB
const uri = "mongodb+srv://sandun:sandun@cluster0.sjboy.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(uri, {});


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Define a MongoDB schema and model
const mySchema = new mongoose.Schema({
    DI: String,
    T1: String,
    T2: String,
    T3: String,
    T4: String,
});

const MyModel = mongoose.model('MyModel', mySchema);

// Define a route for handling POST requests
app.post('/data', async (req, res) => {
    try {
        console.log(req.body)
        const data = JSON.parse(JSON.stringify(req.body))
        const myData = new MyModel(data);
        await myData.save();
        res.send(myData);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

app.get('/', async (req, res) => {
    try {
        res.send("Root poc be");
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

// Define a WebSocket server
const wsServer = new WebSocket.Server({ port: 8080 });

wsServer.on('connection', (ws) => {
    console.log('WebSocket client connected');

    ws.on('message', async (message) => {
        const result  = await MyModel.find().sort({$natural: -1 }).limit(15);
        const data = [];
        for (const resultElement of result) {
            data.push(resultElement)
        }
        ws.send(JSON.stringify(data), {binary:false});
    });

    ws.on('close', () => {
        console.log('WebSocket client disconnected');
    });
});

// Start the server
const PORT = 3001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
