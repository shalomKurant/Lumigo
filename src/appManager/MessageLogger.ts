import { exportFileName } from "../types/Types";

const fs = require('fs');
const lockFile = require('lockfile');
const path = require('path');
const filePath = path.resolve(__dirname, 'messages.json');
const lockPath = path.resolve(__dirname, 'messages.json.lock');
const lockOptions = {
    wait: 1000,
    stale: 5000,
    retries: 100,
    retryWait: 1000
  };

export class MessageLogger {
    public logMessage(message: {message: string}): void {
        lockFile.lock(exportFileName + '.lock', lockOptions, (error) => {      
            if (error) { console.error(error); }

            const oldJson = fs.readFileSync(exportFileName, 'utf8');
            const newJson = JSON.parse(oldJson).concat([message]);        
            fs.writeFileSync(exportFileName, JSON.stringify(newJson), 'utf8');
        });
    }
}