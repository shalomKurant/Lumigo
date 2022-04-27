import { Request, Response } from 'express';
import { getManager } from '../server';
import { IMessage, IQueueItem, MessageType } from '../types/Types';
import cluster from 'cluster';

const postMessage = async (req: Request, res: Response) => {
    const recivedMessage: IQueueItem =  {
        message: req.body
    } 
    const message: IMessage = {
        processId: process.pid,
        type: MessageType.PUSH_TO_QUEUE,
        queueItem: recivedMessage
    } 
    getManager().actionByType(message);
    res.status(200).send("Ok");
};

const getStastistics = async (req: Request, res: Response) => {
    const total = getManager().totalInvocation;
    res.status(200).send({
        active_instances: Object.keys(cluster.workers).length,
        total_invocation: total
    })

}
export default {postMessage, getStastistics};
