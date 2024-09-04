import express, { Express, Router } from 'express';
import { body, query, param } from 'express-validator';
import constants from '../constants/msg.constant';
import remindCategoryController from '../controllers/remindCategory.controller';

const router: Router = express.Router();

router.get('/get-all', remindCategoryController.getAllRows);

export default (app: Express) => {
    app.use('/api/v1/remind/category', router);
};
