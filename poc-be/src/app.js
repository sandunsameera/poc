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
const ws_1 = __importDefault(require("ws"));
const mongoose_1 = __importDefault(require("mongoose"));
const app = (0, express_1.default)();
// Connect to MongoDB
mongoose_1.default.connect('mongodb://localhost/mydb', {});
const db = mongoose_1.default.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
// Define a MongoDB schema and model
const mySchema = new mongoose_1.default.Schema({
    DI: String,
    T1: Number,
    T2: Number,
    T3: Number,
    T4: Number,
});
const MyModel = mongoose_1.default.model('MyModel', mySchema);
// Define a route for handling POST requests
app.post('/data', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = JSON.parse(JSON.stringify(req.body));
        const myData = new MyModel(data);
        yield myData.save();
        res.sendStatus(200);
    }
    catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
}));
// Define a WebSocket server
const wsServer = new ws_1.default.Server({ port: 8080 });
wsServer.on('connection', (ws) => {
    console.log('WebSocket client connected');
    ws.on('message', (message) => {
        console.log(`Received message: ${message}`);
        ws.send(`Received message: ${message}`);
    });
    ws.on('close', () => {
        console.log('WebSocket client disconnected');
    });
});
// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
