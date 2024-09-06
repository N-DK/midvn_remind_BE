import { NextFunction, Request, Response } from 'express';
import catchAsync from '../helper/catchAsync.helper';
import tireService from '../services/tire.service';
import { CREATED, GET, UPDATE } from '../core/success.response';

class TireController {
    getTireByVehicleId = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const { vehicleId } = req.params;
            const tires = await tireService.getTiresByVehicleId(vehicleId);
            GET(res, tires);
        },
    );

    addTire = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            // { seri, size, brand, vehicleId }
            const data = req.body;
            const tire = await tireService.addTire(data);
            CREATED(res, tire);
        },
    );

    updateTire = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            // { tire_id, seri, size, brand }
            const tire_id = req.params;
            const data = { ...req.body, ...tire_id };
            const tire = await tireService.updateTire(data);
            UPDATE(res, tire);
        },
    );

    deleteTire = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const { id } = req.params;
            const tire = await tireService.deleteTire(Number(id));
            UPDATE(res, tire);
        },
    );

    restoreTire = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const { id } = req.params;
            const tire = await tireService.restoreTire(Number(id));
            UPDATE(res, tire);
        },
    );
    search = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const dataBody = req.body;
            const data = await tireService.search(dataBody);
            GET(res, data);
        }
    )
}

export default new TireController();
