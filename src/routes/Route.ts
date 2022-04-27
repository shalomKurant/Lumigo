import express from 'express';
import controller from "../controllers/Controller";
const router = express.Router();

const setRouter = (app: any) => {
    router.post('/message', (req, res) => controller.postMessage(req, res));

    router.get('/statistics', (req, res) => controller.getStastistics(req, res));
        
    app.use(express.json());
    
    app.use('/', router);
};

export { setRouter };