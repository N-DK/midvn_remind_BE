import express, { Express, Router } from 'express';
import { body, query, param } from 'express-validator';
import constants from '../constants/msg.constant';
import { verifyToken } from '../middlewares/verifyToken.middleware';
import remindController from '../controllers/remind.controller';

const router: Router = express.Router();

// router.get("/get-all", verifyToken, remindController.getAll);

// router.get("/search", verifyToken, remindController.search);

router.get('/get-all', verifyToken, (req, res, next) => {
    const { keyword } = req.query;
    if (typeof keyword === 'string' && keyword.trim() !== '') {
        remindController.search(req, res, next);
    } else {
        remindController.getAll(req, res, next);
    }
});

router.get(
    '/get-vehicle-id/:id',
    [param('id', constants.VALIDATE_DATA).isString()],
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
        body('km_before', constants.VALIDATE_DATA).isNumeric(),
        body('vehicles', constants.VALIDATE_DATA).isArray(),
        body('schedule', constants.VALIDATE_DATA).isArray()
    ],
    remindController.addRemind,
);

// search

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

router.put(
    '/update/:id',
    [
        // param("id", constants.VALIDATE_DATA).isNumeric(),
        // body("name").isString().withMessage(constants.VALIDATE_DATA),
        // body("img_url").isString().withMessage(constants.VALIDATE_DATA),
        // body("note_repair").isString().withMessage(constants.VALIDATE_DATA),
        // body("history_repair").isString().withMessage(constants.VALIDATE_DATA),
        // body("current_kilometres").withMessage(constants.VALIDATE_DATA),
        // body("cumulative_kilometers").withMessage(constants.VALIDATE_DATA),
        // body("expiration_time").withMessage(constants.VALIDATE_DATA),
        // body("time_before").withMessage(constants.VALIDATE_DATA),
        // body("is_notified").withMessage(constants.VALIDATE_DATA),
        // body("is_received").withMessage(constants.VALIDATE_DATA),
        // body("update_time").withMessage(constants.VALIDATE_DATA),
    ],
    verifyToken,
    remindController.update,
);

/**
 * @swagger
 * /items:
 *   post:
 *     summary: Retrieve a list of items
 *     responses: 
 *       200:
 *         description: A list of items.
 */
router.put(
    '/update-is-deleted/:id',
    [param('id', constants.VALIDATE_DATA).isNumeric()],
    verifyToken,
    remindController.updateIsDeleted,
);
// yes ==> call api current_kilometers = current_kilometers of result return from api, cumulative_kilometers = cumulative_kilometers of remind_id
//         expiration_time = Date.now() + (Date.now() - expiration_time of remind_id)
//         time_before = time_before of remind_id
//         return {expiration_time, time_before, cumulative_kilometers}
// no ==> is_received = 1, update_time = Date.now() return {}
// router.patch(
//     '/finish-remind/:id',
//     [
//         param('id', constants.VALIDATE_DATA).isNumeric(),
//         body('is_continue', constants.VALIDATE_DATA).isNumeric(),
//     ],
//     verifyToken,
//     remindController.finishRemind,
// );
export default (app: Express) => {
    app.use('/api/v1/remind/main', router);
};
