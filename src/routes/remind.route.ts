import express, { Express, Router } from 'express';
import { body, query, param } from 'express-validator';
import constants from '../constants/msg.constant';
import { verifyToken } from '../middlewares/verifyToken.middleware';
import remindController from '../controllers/remind.controller';

const router: Router = express.Router();

router.get('/get-all',
    verifyToken,
    remindController.getAll
)

export default (app: Express) => {
    app.use('/api/v1/remind/main', router);
};
