import { NextFunction, Request, Response } from 'express';
import catchAsync from '../helper/catchAsync.helper';
import remindService from '../services/remind.service';
import { GET } from '../core/success.response';

class RemindController {

    getAll = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const data = await remindService.getAll(req.body.user.user_id);
            GET(res, data);
        },
    );

}

export default new RemindController();