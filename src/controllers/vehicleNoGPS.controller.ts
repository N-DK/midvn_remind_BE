import e, { Request, Response } from 'express';
import { CREATED, GET } from '../core/success.response';
import vehicleNoGPSService from '../services/vehicleNoGPS.service';
import catchAsync from '../helper/catchAsync.helper';

class VehicleNoGPSController {
    getVehicleNoGPS = catchAsync(async (req: Request, res: Response) => {
        // LOG USER
        console.log(req.body.user);

        const vehicles = await vehicleNoGPSService.getVehicleNoGPS();
        GET(res, vehicles);
    });

    addVehicleNoGPS = catchAsync(async (req: Request, res: Response) => {
        const data = req.body;
        const result = await vehicleNoGPSService.addVehicleNoGPS(data);
        CREATED(res, result);
    });
}

export default new VehicleNoGPSController();
