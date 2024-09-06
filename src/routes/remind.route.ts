import express, { Express, Router } from 'express';
import { body, query, param } from 'express-validator';
import constants from '../constants/msg.constant';
import { verifyToken } from '../middlewares/verifyToken.middleware';
import remindController from '../controllers/remind.controller';

const router: Router = express.Router();

router.get('/get-all', verifyToken, remindController.getAll);

router.get(
    '/get-vehicle-id/:id',
    [param('id', constants.VALIDATE_DATA).isNumeric()],
    verifyToken,
    remindController.getByVehicleId,
);

// payload:
// {
//   remind_category_id: 1,
//   is_notified: 0,
//   note_repair: "Thay nhớt",
//   expiration_time: 1000,
//   cumulative_kilometers: 1000,
//   time_before: 1,
//   vehicles: ["1", "2", "3"]
// }

router.post(
    '/add-remind',
    verifyToken,
    [
        body('remind_category_id', constants.VALIDATE_DATA).isNumeric(),
        body('is_notified', constants.VALIDATE_DATA).isNumeric(),
        body('note_repair', constants.NOT_EMPTY).isString(),
        body('expiration_time', constants.VALIDATE_DATA).isNumeric(),
        body('time_before', constants.VALIDATE_DATA).isNumeric(),
        body('vehicles', constants.VALIDATE_DATA).isArray(),
    ],
    remindController.addRemind,
);

// search
router.get('/search', verifyToken, remindController.search);

router.patch(
    '/update-notified-off/:id',
    verifyToken,
    [param('id', constants.VALIDATE_DATA).isNumeric()],
    remindController.updateNotifiedOff,
);

router.patch(
    '/update-notified-on/:id',
    verifyToken,
    [param('id', constants.VALIDATE_DATA).isNumeric()],
    remindController.updateNotifiedOn,
);
export default (app: Express) => {
    app.use('/api/v1/remind/main', router);
};
