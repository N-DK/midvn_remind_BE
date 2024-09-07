import express, { Express, Router } from 'express';
import { body, query, param } from 'express-validator';
import constants from '../constants/msg.constant';
import vehicleNoGPSController from '../controllers/vehicleNoGPS.controller';
import { verifyToken } from '../middlewares/verifyToken.middleware';

const router: Router = express.Router();

router.get('/get-all', verifyToken, vehicleNoGPSController.getVehicleNoGPS);

router.get(
    '/get/:id',
    [param('id', constants.VALIDATE_DATA).isNumeric()],
    verifyToken,
    vehicleNoGPSController.getVehicleNoGPSbyID,
);

router.post(
    '/add-vehicle',
    [
        body().isArray().withMessage(constants.VALIDATE_DATA),
        body('*.license_plate', constants.NOT_EMPTY)
            .isString()
            .withMessage(constants.VALIDATE_DATA),
        // body("*.license", constants.NOT_EMPTY)
        //   .isString()
        //   .withMessage(constants.VALIDATE_DATA),
    ],
    verifyToken,
    vehicleNoGPSController.addVehicleNoGPS,
);

router.put(
    '/update-vehicle/:id',
    [
        param('id', constants.VALIDATE_DATA).isNumeric(),
        body('license_plate', constants.NOT_EMPTY)
            .isString()
            .withMessage(constants.VALIDATE_DATA),
        body('license', constants.NOT_EMPTY)
            .isString()
            .withMessage(constants.VALIDATE_DATA),
    ],
    verifyToken,
    vehicleNoGPSController.updateVehicleNoGPS,
);

router.put(
    '/delete-vehicle/:id',
    [param('id', constants.VALIDATE_DATA).isNumeric()],
    verifyToken,
    vehicleNoGPSController.deleteVehicleNoGPS,
);

router.get(
    '/search',
    body('keyword', constants.NOT_EMPTY)
        .isString()
        .withMessage(constants.VALIDATE_DATA),
    verifyToken,
    vehicleNoGPSController.search,
);

router.delete('/convert-toNoGPS');
export default (app: Express) => {
    app.use('/api/v1/remind/vehicle-no-gps', router);
};
