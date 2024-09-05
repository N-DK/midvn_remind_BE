import { NextFunction, Request, Response } from "express";
import catchAsync from "../helper/catchAsync.helper";
import remindService from "../services/remind.service";
import { CREATED, GET } from "../core/success.response";

class RemindController {
  getAll = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const data = await remindService.getAll(req.body.user.user_id);
      GET(res, data);
    }
  );

  getByVehicleId = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const data = await remindService.getByVehicleId(parseInt(req.params.id));
      GET(res, data);
    }
  );

  addRemind = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const data = req.body;
      const remind = await remindService.addRemind(data);
      CREATED(res, remind);
    }
  );
}

export default new RemindController();
