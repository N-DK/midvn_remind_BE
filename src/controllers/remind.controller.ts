import { NextFunction, Request, Response } from 'express';
import catchAsync from '../helper/catchAsync.helper';
import remindService from '../services/remind.service';
import { CREATED, GET, UPDATE } from '../core/success.response';
import reminder from '../utils/reminder.util';

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
                req.query.vehicle_id as string,
            );
            GET(res, data);
        },
    );

    // checked
    addRemind = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            if (Array.isArray(req.files) && req.files.length > 0) {
                req.body.img_url = reminder.convertImage(req.files);
            }

            if (typeof req.body.vehicles === 'string') {
                req.body.vehicles = JSON.parse(req.body.vehicles);
            }
            if (typeof req.body.schedules === 'string') {
                req.body.schedules = JSON.parse(req.body.schedules);
            }

            const data = req.body;

            const remind = await remindService.addRemind(data);

            await reminder.moveToUploads(
                req.body.vehicles,
                req.body.img_url,
                remind,
            );

            await reminder.clearUploadsFolder(req.body.img_url);

            CREATED(res, remind);
        },
    );

    // checked
    addRemindGPS = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            if (Array.isArray(req.files) && req.files.length > 0) {
                req.body.img_url = reminder.convertImage(req.files);
            }

            if (typeof req.body.vehicles === 'string') {
                req.body.vehicles = JSON.parse(req.body.vehicles);
            }
            if (typeof req.body.schedules === 'string') {
                req.body.schedules = JSON.parse(req.body.schedules);
            }

            const data = req.body;

            const remind = await remindService.addRemindGPS(data);

            if (Array.isArray(remind)) {
                for (const item of remind) {
                    await reminder.moveToUploads(
                        [item.vehicle],
                        req.body.img_url,
                        item.id,
                    );
                }
                await reminder.clearUploadsFolder(req.body.img_url);
            } else {
                await reminder.moveToUploads(
                    req.body.vehicles,
                    req.body.img_url,
                    remind.id,
                );
                await reminder.clearUploadsFolder(req.body.img_url);
            }

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

    // checked
    update = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            req.body.img_url = null;
            if (Array.isArray(req.files) && req.files.length > 0) {
                req.body.img_url = reminder.convertImage(req.files);
            }

            if (typeof req.body.vehicles === 'string') {
                req.body.vehicles = JSON.parse(req.body.vehicles);
            }
            if (typeof req.body.schedules === 'string') {
                req.body.schedules = JSON.parse(req.body.schedules);
            }
            const data = req.body;

            const remind = await remindService.update(
                data,
                parseInt(req.params.id),
            );

            await reminder.clearUploads(
                req.body.vehicles,
                remind.id ?? parseInt(req.params.id),
            );

            await reminder.moveToUploads(
                req.body.vehicles,
                req.body.img_url,
                remind.id ?? parseInt(req.params.id),
            );

            await reminder.clearUploadsFolder(req.body.img_url);

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

    // checked
    updateIsDeleted = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const result = await remindService.updateIsDeleted(
                parseInt(req.params.id),
            );
            await reminder.clearUploads(null, parseInt(req.params.id));
            UPDATE(res, result);
        },
    );

    finishRemind = catchAsync(
        async (req: Request, res: Response, Next: NextFunction) => {
            if (Array.isArray(req.files) && req.files.length > 0) {
                req.body.img_url = reminder.convertImage(req.files);
            }

            if (typeof req.body.vehicles === 'string') {
                req.body.vehicles = JSON.parse(req.body.vehicles);
            }
            if (typeof req.body.schedules === 'string') {
                req.body.schedules = JSON.parse(req.body.schedules);
            }

            const result = await remindService.finishRemind(
                parseInt(req.params.id),
                req.body?.user?.level === 10
                    ? req.body.user.userId
                    : req.body.user.parentId,
                req.body,
            );

            if (req.body.note_repair)
                await reminder.clearUploads(result?.vehicles, result?.id);

            const images = result?.img_url.split(', ');

            const img_urls = [];
            for (const image of images) {
                const index = img_urls.findIndex((img) =>
                    img.includes(image.split('/')[2]),
                );
                if (index < 0) {
                    img_urls.push(image);
                }
            }

            await reminder.clearUploadsThumbnailByRemind(
                parseInt(req.params.id),
            );

            console.log('img_urls', img_urls);

            await reminder.moveToUploads(
                result?.vehicles,
                req.body.note_repair ? req.body.img_url : img_urls.join(', '),
                result?.id,
            );
            reminder.clearUploadsFolder(
                req.body.note_repair
                    ? req.body.img_url ?? result?.img_url
                    : result?.img_url,
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
                req.body?.user?.level === 10
                    ? req.body?.user?.userId
                    : req.body?.user?.parentId,
            );
            GET(res, data);
        },
    );

    getScheduleByRemindId = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const data = await remindService.getScheduleByRemindId(
                parseInt(req.params.id),
            );
            GET(res, data);
        },
    );

    deleteMultiRemind = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const result = await remindService.deleteMultiRemind(req.body);
            UPDATE(res, result);
        },
    );

    getRemindById = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const data = await remindService.getRemindById(
                parseInt(req.params.id),
            );
            GET(res, data);
        },
    );

    getUnfinished = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const data = await remindService.getUnfinished(
                req.body.user.userId,
                req.query,
            );
            GET(res, data.data, 0, data.totalRecord);
        },
    );

    getFinished = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const data = await remindService.getFinished(
                req.body.user.userId,
                req.query,
            );
            GET(res, data.data, 0, data.totalRecord);
        },
    );

    getVehicleByRemindId = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const data = await remindService.getVehicleByRemindId(
                Number(req.params.id),
            );
            GET(res, data);
        },
    );
}

export default new RemindController();
