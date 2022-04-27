import { EventType, IMessage, IQueueItem, MessageType } from "../types/Types";
import { MessageLogger } from "./MessageLogger";

export class FunctionExecution {
    private logger: MessageLogger;

    constructor() {
        this.logger = new MessageLogger();

        process.on(EventType.MESSAGE, (message: IMessage) => {
            this.runFunction(message.queueItem);
        });
    }

    public async runFunction(item: IQueueItem): Promise<void> {
        setTimeout(() => {
            const message: IMessage = {
                processId: process.pid,
                type: MessageType.PROCESS_FINISH,
                queueItem: item
            }
            this.logger.logMessage(message.queueItem.message);
            process.send(message);
        }, 10000);
    }
}