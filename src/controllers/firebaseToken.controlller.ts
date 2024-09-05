import e, { Request, Response } from 'express';
import { CREATED, GET, UPDATE,DELETE } from '../core/success.response';
import catchAsync from '../helper/catchAsync.helper';
import VehicleNoGPSService from '../services/tokenFirebase.service';

class TokenFirebaseController{
    addFirebaseToken = catchAsync(async (req:Request, res:Response) => {
        const userId = req.body.user.user_id;
        const data = req.body;
        const addToken = await VehicleNoGPSService.addToken(data,userId);
        CREATED(res, addToken);
    });
}

export default new TokenFirebaseController;