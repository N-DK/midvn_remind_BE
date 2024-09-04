import express, { Express, Router } from 'express';
import { body, query, param } from 'express-validator';
import constants from '../constants/msg.constant';
import vehicleNoGPSController from '../controllers/vehicleNoGPS.controller';
import { verifyToken } from '../middlewares/verifyToken.middleware';

const router: Router = express.Router();

router.get('/get-all', verifyToken, vehicleNoGPSController.getVehicleNoGPS);
router.post(
    '/add-vehicle',
    verifyToken,
    vehicleNoGPSController.addVehicleNoGPS,
);

export default (app: Express) => {
    app.use('/api/v1/remind/vehicle-no-gps', router);
};
