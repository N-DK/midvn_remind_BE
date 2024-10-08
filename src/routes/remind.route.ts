import express, { Express, Router } from 'express';
import { body, query, param } from 'express-validator';
import constants from '../constants/msg.constant';
import { verifyToken } from '../middlewares/verifyToken.middleware';
import remindController from '../controllers/remind.controller';
import reminder from '../utils/reminder.util';

const router: Router = express.Router();

router.get('/get-all', verifyToken, (req, res, next) => {
    const { keyword, vehicle_id } = req.query;
    if (typeof keyword === 'string' && keyword.trim() !== '') {
        remindController.search(req, res, next);
    } else if (typeof vehicle_id === 'string' && vehicle_id.trim() !== '') {
        remindController.getByVehicleId(req, res, next);
    } else {
        remindController.getAll(req, res, next);
    }
});

router.get('/get-remind/:id', verifyToken, remindController.getRemindById);

router.get('/gps/get-all', verifyToken, remindController.getAllGPS);

router.get(
    '/get-vehicle-id/:id',
    [param('id', constants.VALIDATE_DATA).isString()],
    verifyToken,
    remindController.getByVehicleId,
);

router.post(
    '/add-remind',
    reminder.upload.array('images', 10),
    [
        body('remind_category_id', constants.VALIDATE_DATA).isNumeric(),
        body('is_notified', constants.VALIDATE_DATA).isNumeric(),
        body('note_repair', constants.NOT_EMPTY).isString(),
        body('expiration_time', constants.VALIDATE_DATA).isNumeric(),
    ],
    verifyToken,
    remindController.addRemind,
);

router.post(
    '/add-remind-gps',
    reminder.upload.array('images', 10),
    [
        body('remind_category_id', constants.VALIDATE_DATA).isNumeric(),
        body('is_notified', constants.VALIDATE_DATA).isNumeric(),
        body('note_repair', constants.NOT_EMPTY).isString(),
        body('expiration_time', constants.VALIDATE_DATA).isNumeric(),
    ],
    verifyToken,
    remindController.addRemindGPS,
);

router.get('/get-category-all', verifyToken, remindController.getCategoryAll);

router.patch(
    '/update-notified-off/:id',
    [param('id', constants.VALIDATE_DATA).isNumeric()],
    verifyToken,
    remindController.updateNotifiedOff,
);

router.patch(
    '/update-notified-on/:id',
    [param('id', constants.VALIDATE_DATA).isNumeric()],
    verifyToken,
    remindController.updateNotifiedOn,
);

router.put(
    '/update/:id',
    reminder.upload.array('images', 10),
    verifyToken,
    remindController.update,
);

router.put(
    '/delete/:id',
    [param('id', constants.VALIDATE_DATA).isNumeric()],
    verifyToken,
    remindController.updateIsDeleted,
);

router.post(
    '/finish-remind/:id',
    reminder.upload.array('images', 10),
    [param('id', constants.VALIDATE_DATA).isNumeric()],
    verifyToken,
    remindController.finishRemind,
);

router.get(
    '/get-finish-remind/:id',
    [param('id', constants.VALIDATE_DATA)],
    verifyToken,
    remindController.getFinishRemind,
);

router.get(
    '/get-schedule/:id',
    verifyToken,
    remindController.getScheduleByRemindId,
);

router.post(
    '/delete-multi-remind',
    verifyToken,
    remindController.deleteMultiRemind,
);

router.get('/get/unfinished', verifyToken, remindController.getUnfinished);

router.get('/get/finished', verifyToken, remindController.getFinished);

router.get(
    '/get/vehicle/:id',
    verifyToken,
    remindController.getVehicleByRemindId,
);

export default (app: Express) => {
    app.use('/api/v1/remind/main', router);
};
