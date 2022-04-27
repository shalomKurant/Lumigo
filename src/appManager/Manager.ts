import cluster, {Worker} from 'cluster';
import { EventType, IMessage, IQueueItem, MessageType } from '../types/Types';
import { QueueManager } from './QueueManager';

export class Manager {
    private freeWorkers: object = {};
    public totalInvocation: number = 0;

    constructor(private queueManager: QueueManager) {}

    public setupWorkerProcesses() {
        this.handleMessageFromWorker();
    }

    private handleMessageFromWorker(): void {
        cluster.on(EventType.MESSAGE, (worker: Worker, message: IMessage) => {
            this.actionByType(message, worker);
        });
    }

    public actionByType(message: IMessage, worker?: Worker): void {
        switch (message.type) {
            case MessageType.PROCESS_FINISH:
                this.killProcessAfterFunctionExecute(worker);
                break;
            case MessageType.PUSH_TO_QUEUE:
                this.totalInvocation++;
                this.runProcessForNewItem(message);
            break;
        }
    }

    private runProcessForNewItem(message: IMessage): void {
        let worker: Worker;
        const workersId: string[] = Object.keys(this.freeWorkers); 
        if (workersId.length) {
            worker = this.freeWorkers[workersId[0]];
            delete this.freeWorkers[workersId[0]];
        } else {
            worker = cluster.fork();
        }
        this.queueManager.pushToQueue({ ...message.queueItem, procesId: worker.id });
        const currenToExecute: IQueueItem = this.queueManager.getLastItem();
        this.sendMessageToSpesificProcess(currenToExecute.procesId.toString(), currenToExecute);
    }

    private sendMessageToSpesificProcess(procesId: string, item: IQueueItem): void {
        for (const [id, worker] of Object.entries(cluster.workers)) {
            if (id === procesId) {
                const eventMessage: IMessage = {
                    processId: <any> id, 
                    type: MessageType.EXECUTE_FUNCTION,
                    queueItem: item
                }
                worker.send(eventMessage);
                return;
            }
        }
    }

    private executeNextInQueue(): void {
        const item: IQueueItem = this.queueManager.getLastItem();
        if (!item) return;

        this.sendMessageToSpesificProcess(item.procesId.toString(), item);
    }

    private killProcessAfterFunctionExecute(worker: Worker): void {
        if (this.queueManager.hasItemsInQueue()) {
            this.executeNextInQueue();
        } else {
            this.freeWorkers[worker.id] = {
                worker, 
                insertTime: new Date() 
            };
            this.removeUnuseWorkers();
        }
    }

    private removeUnuseWorkers(): void {
        setInterval(() => {
            for (const [id, workerInfo] of Object.entries(this.freeWorkers)) {
                const currentTime: Date = new Date();
                const insertTime: Date = workerInfo.insertTime;
                var diffInSeconds: number = (currentTime.getTime() - insertTime.getTime()) / 1000;
                
                if (diffInSeconds > 10) {
                    delete this.freeWorkers[id];
                    cluster.workers[id].kill();
                }
            }
        }, 10000);
    }
}