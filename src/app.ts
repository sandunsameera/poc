import express from 'express';
import mongoose from 'mongoose';
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const app = express();

const http = require('http').Server(app);
const io = require('socket.io')(http,{
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

app.use(express.json());
app.use(cors());

const wsPort = process.env.WS_PORT || 8080


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
        console.log(wsPort)
        res.send("Root poc be");
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

io.on('connection', async (socket:any) => {
    console.log('A user connected');
    // Handle 'message' events
    socket.on('message', async (message:any) => {
        const result  = await MyModel.find().sort({$natural: -1 }).limit(15);
        const data = [];
        for (const resultElement of result) {
            data.push(resultElement)
        }
        io.emit(JSON.stringify(data));
    });

    // Handle 'disconnect' events
    socket.on('disconnect', () => {
        console.log('WebSocket client disconnected');
    });
});

// Set the port to listen on
const port = process.env.PORT || 3000;


http.listen(port, () => {
    console.log(`Websocket Server is running on port ${port}`);
});
