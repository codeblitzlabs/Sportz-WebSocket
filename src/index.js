import express from 'express';
import {matchesRouter} from "./routes/matches.js";
import http from 'http';
import {attachWebSocketServer} from "./ws/server.js";

import {securityMiddleware} from "./arcjet.js";


const PORT = parseInt(process.env.PORT || '8000', 10)
const HOST = process.env.HOST || '0.0.0.0'

const app = express();
const server = http.createServer(app);

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from Express server!');
});

app.use(securityMiddleware());
app.use('/matches' , matchesRouter);

const {broadcastMatchCreated} = attachWebSocketServer(server)
app.locals.broadcastMatchCreated = broadcastMatchCreated

server.listen(PORT, HOST, () => {
  const baseUrl = HOST === "0.0.0.0" ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`
  console.log(`Server listening at ${baseUrl}`);
  console.log(`Websocket Server is Running on ${baseUrl.replace('http', 'ws')}/ws`)
})
