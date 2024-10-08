import { NextFunction, Request, Response } from 'express';
import catchAsync from '../helper/catchAsync.helper';
import remindCategoryService from '../services/remindCategory.service';
import { GET } from '../core/success.response';

class RemindCategoryController {
    getAllRows = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const data = await remindCategoryService.getAllRows();
            GET(res, data);
        },
    );
    getByUserId = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const data = await remindCategoryService.getByUserID(
                req.body.user.userId,
            );
            GET(res, data);
        },
    );

    addCategory = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const dataBody = req.body;
            const data = await remindCategoryService.addCategory(
                dataBody,
                parseInt(req.body.user.userId),
            );
            GET(res, data);
        },
    );
}

export default new RemindCategoryController();
