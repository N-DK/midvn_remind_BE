import e, { Request, Response } from 'express';
import { CREATED, GET, UPDATE, DELETE } from '../core/success.response';
import vehicleNoGPSService from '../services/vehicleNoGPS.service';
import catchAsync from '../helper/catchAsync.helper';

class VehicleNoGPSController {
    getVehicleNoGPS = catchAsync(async (req: Request, res: Response) => {
        const vehicles = await vehicleNoGPSService.getVehicleNoGPS(
            req.body.user.userId,
        );
        GET(res, vehicles);
    });

    getVehicleNoGPSbyID = catchAsync(async (req: Request, res: Response) => {
        const vehicle = await vehicleNoGPSService.getVehicleNoGPSbyID(
            req.params.id,
        );
        GET(res, vehicle);
    });

    addVehicleNoGPS = catchAsync(async (req: Request, res: Response) => {
        const data = req.body;
        const user_id = req.body.user.userId;
        const result = await vehicleNoGPSService.addVehicleNoGPS(data, user_id);
        CREATED(res, result);
    });

    updateVehicleNoGPS = catchAsync(async (req: Request, res: Response) => {
        const data = req.body;
        const result = await vehicleNoGPSService.updateVehicleNoGPS(
            data,
            parseInt(req.params.id),
        );
        UPDATE(res, result);
    });
    deleteVehicleNoGPS = catchAsync(async (req: Request, res: Response) => {
        const user_id = req.body.user.userId;
        const result = await vehicleNoGPSService.deleteVehicleNoGPS(
            parseInt(req.params.id),
            user_id,
        );
        DELETE(res, result);
    });
    search = catchAsync(async (req: Request, res: Response)=> {
        const user_id = req.body.user.userId;
        const dataBody = req.body;
        const data = await vehicleNoGPSService.search(
            dataBody,
            user_id
        );
        GET(res, data);
    });
}

export default new VehicleNoGPSController();
