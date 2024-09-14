import express, { Express, Router } from 'express';
import { body, query, param } from 'express-validator';
import constants from '../constants/msg.constant';
import { verifyToken } from '../middlewares/verifyToken.middleware';
import tokenFirebaseController from '../controllers/firebaseToken.controlller';

const router: Router = express.Router();

router.post(
    '/add',
    [
        body('token', constants.NOT_EMPTY)
            .isString()
            .withMessage(constants.VALIDATE_DATA),
    ],
    verifyToken,
    tokenFirebaseController.addFirebaseToken,
);

router.delete(
    '/delete',
    [
        body('token', constants.NOT_EMPTY)
            .isString()
            .withMessage(constants.VALIDATE_DATA),
    ],
    verifyToken,
    tokenFirebaseController.deleteFirebaseToken,
);
export default (app: Express) => {
    app.use('/api/v1/token-firebase', router);
};
