import { IQueueItem } from "../types/Types";

export class QueueManager {
    private readonly items: IQueueItem[] = [];

    public pushToQueue(item: IQueueItem): void {
        this.items.push(item);
    }

    public hasItemsInQueue(): boolean {
        return this.items.length > 0;
    }

    public getLastItem(): IQueueItem {
        return this.items.pop();
    }
}