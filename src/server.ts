import http from 'http';
import express from 'express';
import cluster from 'cluster';
import { setRouter } from './routes/Route';
import { Manager } from './appManager/Manager';
import { QueueManager } from './appManager/QueueManager';
import { FunctionExecution } from './appManager/FunctionExecution';
import { exportFileName } from './types/Types';
const fs = require('fs');
const app = express();

let manager: Manager = null;

const setUpExpress = () => {
    setRouter(app);
    const httpServer = http.createServer(app);
    const PORT: any = process.env.PORT ?? 8000;
    httpServer.listen(PORT, () => console.log(`The server is running on port ${PORT}`));  
};

const setupServer = () => {
    if (cluster.isPrimary) {
        const queueManager = new QueueManager();
        const processManager = new Manager(queueManager)
        processManager.setupWorkerProcesses();
        manager = processManager;
        setUpExpress();
        fs.writeFileSync(exportFileName, JSON.stringify([]), 'utf8');
    } else {
        new FunctionExecution();
    }
};

const getManager = (): Manager => {
    return manager;
}
setupServer();

export { app, getManager };