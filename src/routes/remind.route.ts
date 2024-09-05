import express, { Express, Router } from 'express';
import { body, query, param } from 'express-validator';
import constants from '../constants/msg.constant';
import { verifyToken } from '../middlewares/verifyToken.middleware';
const router: Router = express.Router();

router.get('/get-all',
    verifyToken,
    
)

export default (app: Express) => {
    app.use('/api/v1/remind/main', router);
};
