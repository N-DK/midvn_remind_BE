import e, { Request, Response } from 'express';
import { CREATED, GET, UPDATE, DELETE } from '../core/success.response';
import catchAsync from '../helper/catchAsync.helper';
import VehicleNoGPSService from '../services/tokenFirebase.service';

class TokenFirebaseController {
    addFirebaseToken = catchAsync(async (req: Request, res: Response) => {
        const userId = req.body.user.userId;
        const data = req.body;
        const parentID = req.body.user.parentId;
        const addToken = await VehicleNoGPSService.addToken(
            data,
            userId,
            parentID,
        );
        CREATED(res, addToken);
    });

    deleteFirebaseToken = catchAsync(async (req: Request, res: Response) => {
        const data = req.body;
        const userId = req.body.user.userId;
        const addToken = await VehicleNoGPSService.deleteToken(data,userId);
        DELETE(res, addToken);
    });
}

export default new TokenFirebaseController();
