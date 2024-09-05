import express, { Express, Router } from "express";
import { body, query, param } from "express-validator";
import constants from "../constants/msg.constant";
import { verifyToken } from "../middlewares/verifyToken.middleware";
import remindController from "../controllers/remind.controller";

const router: Router = express.Router();

router.get("/get-all", verifyToken, remindController.getAll);

// payload:
// {
//   cate_id: 1,
//   is_notified: 0,
//   note_repair: "Thay nhớt",
//   time_expire: 1000,
//   km_expire: 1000,
//   time_before: 1,
//   vehicles: ["1", "2", "3"]
// }

router.get(
  "/get-vehicle-id/:id",
  [param("id", constants.VALIDATE_DATA).isNumeric()],
  verifyToken,
  remindController.getByVehicleId
);

router.post("/add-remind", verifyToken, [], remindController.addRemind);

router.patch('/update-notified-off/:id',
    verifyToken,
    [param("id", constants.VALIDATE_DATA).isNumeric()],
    remindController.updateNotifiedOff
)

router.patch('/update-notified-on/:id',
    verifyToken,
    [param("id", constants.VALIDATE_DATA).isNumeric()],
    remindController.updateNotifiedOn
)
export default (app: Express) => {
  app.use("/api/v1/remind/main", router);
};
