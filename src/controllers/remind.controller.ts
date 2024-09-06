import { NextFunction, Request, Response } from 'express';
import catchAsync from '../helper/catchAsync.helper';
import remindService from '../services/remind.service';
import { CREATED, GET, UPDATE } from '../core/success.response';

class RemindController {
    getAll = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const data = await remindService.getAll(req.body.user.userId);
            GET(res, data);
        },
    );

    getByVehicleId = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const data = await remindService.getByVehicleId(
                parseInt(req.params.id),
            );
            GET(res, data);
        },
    );

    addRemind = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const data = req.body;
            const remind = await remindService.addRemind(data);
            CREATED(res, remind);
        },
    );
    updateNotifiedOff = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const result = await remindService.updateNotifiedOff(
                parseInt(req.params.id),
            );
            UPDATE(res, result);
        },
    );
    updateNotifiedOn = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const result = await remindService.updateNotifiedOn(
                parseInt(req.params.id),
            );
            UPDATE(res, result);
        },
    );

    search = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const data = await remindService.search(
                req.body.user.userId,
                req.query,
            );
            GET(res, data);
        },
    );
}

export default new RemindController();
