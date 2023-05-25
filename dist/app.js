"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const app = (0, express_1.default)();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
app.use(express_1.default.json());
app.use(cors());
const wsPort = process.env.WS_PORT || 8080;
// Connect to MongoDB
const uri = "mongodb+srv://sandun:sandun@cluster0.sjboy.mongodb.net/?retryWrites=true&w=majority";
mongoose_1.default.connect(uri, {});
const db = mongoose_1.default.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
// Define a MongoDB schema and model
const mySchema = new mongoose_1.default.Schema({
    DI: String,
    T1: String,
    T2: String,
    T3: String,
    T4: String,
});
const MyModel = mongoose_1.default.model('MyModel', mySchema);
// Define a route for handling POST requests
app.post('/data', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body);
        const data = JSON.parse(JSON.stringify(req.body));
        const myData = new MyModel(data);
        yield myData.save();
        res.send(myData);
    }
    catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
}));
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(wsPort);
        res.send("Root poc be");
    }
    catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
}));
io.on('connection', (socket) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('A user connected');
    // Handle 'message' events
    socket.on('message', (message) => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield MyModel.find().sort({ $natural: -1 }).limit(15);
        const data = [];
        for (const resultElement of result) {
            data.push(resultElement);
        }
        io.emit(JSON.stringify(data));
    }));
    // Handle 'disconnect' events
    socket.on('disconnect', () => {
        console.log('WebSocket client disconnected');
    });
}));
// Set the port to listen on
const port = process.env.PORT || 3000;
// Start the server
const PORT = process.env.PORT || 3000;
http.listen(3000, () => {
    console.log(`Websocket Server is running on port ${port}`);
});
