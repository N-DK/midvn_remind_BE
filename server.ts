import http from 'http';
import process from 'process';
import app from './src/app';
import configureEnvironment from './src/config/dotenv.config';
import fs from 'fs';
import https from 'https';

const { PORT: PORT_ENV, NODE_ENV, DOMAIN_NAME } = configureEnvironment();
console.log('environment ::::', NODE_ENV);

const PORT = PORT_ENV || 3055;

// start server nodejs
const server = http.createServer(app).listen(PORT, () => {
    console.log(`Domain server :::: ${DOMAIN_NAME}:${PORT}`);
});

// config sv SSL
// const privateKey = fs.readFileSync(
//     '/etc/letsencrypt/live/yowork.optech.vn/privkey.pem',
// );
// const certificate = fs.readFileSync(
//     '/etc/letsencrypt/live/yowork.optech.vn/fullchain.pem',
// );
// const credentials = { key: privateKey, cert: certificate };

// const server = https.createServer(credentials, app);
// server.listen(PORT, () => {
//     console.log(`Domain server :::: ${DOMAIN_NAME}:${PORT}`);
// });

// const task = require("./src/tasks/issure.task");
process.on('SIGINT', () => {
    // task.checkOverload().stop();
    server.close(() => console.log('Exit server express'));
    process.exit();

    // notify send (ping....)
});
