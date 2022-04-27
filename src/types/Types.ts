export interface IQueueItem {
    message: {message: string};
    procesId?: number;
}

export interface IMessage {
    processId: number;
    type: MessageType;
    queueItem?: IQueueItem;
}

export enum MessageType {
    PROCESS_FINISH = "processFinish",
    PUSH_TO_QUEUE = "pushToQueue",
    EXECUTE_FUNCTION = "executeFunction"
}

export enum EventType {
    ON_LINE = "online",
    MESSAGE = "message",
    EXIT = "exit"
}

export const exportFileName: string = "messages.json";