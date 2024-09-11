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
            const data = await remindService.getByVehicleId(req.params.id);
            GET(res, data);
        },
    );

    addRemind = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            if (Array.isArray(req.files) && req.files.length > 0) {
                req.body.img_url = req.files
                    .map((file) => file.path)
                    .join(', ');
            }

            if (typeof req.body.vehicles === 'string') {
                req.body.vehicles = JSON.parse(req.body.vehicles);
            }
            if (typeof req.body.schedules === 'string') {
                req.body.schedules = JSON.parse(req.body.schedules);
            }

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
    update = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const data = req.body;
            const remind = await remindService.update(
                data,
                parseInt(req.params.id),
            );
            UPDATE(res, remind);
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
    updateIsDeleted = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const result = await remindService.updateIsDeleted(
                parseInt(req.params.id),
            );
            UPDATE(res, result);
        },
    );
    finishRemind = catchAsync(
        async (req: Request, res: Response, Next: NextFunction) => {
            const result = await remindService.finishRemind(
                parseInt(req.params.id),
                req.body?.user?.level === 10
                    ? req.body.user.userId
                    : req.body.user.parentId,
            );
            UPDATE(res, result);
        },
    );
    getFinishRemind = catchAsync(
        async (req: Request, res: Response, Next: NextFunction) => {
            const result = await remindService.getFinishRemind(
                req.params.id,
                req.body.user.userId,
            );
            GET(res, result);
        },
    );

    getAllGPS = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const data = await remindService.getAllGPS(req.query);
            GET(res, data);
        },
    );

    getCategoryAll = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const data = await remindService.getCategoryAll(
                req.body.user.userId,
            );
            GET(res, data);
        },
    );
}

export default new RemindController();
