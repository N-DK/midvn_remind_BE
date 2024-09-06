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

router.patch(
  "/update-notified-off/:id",
  verifyToken,
  [param("id", constants.VALIDATE_DATA).isNumeric()],
  remindController.updateNotifiedOff
);

router.patch(
  "/update-notified-on/:id",
  verifyToken,
  [param("id", constants.VALIDATE_DATA).isNumeric()],
  remindController.updateNotifiedOn
);

router.put(
  "/update/:id",
  [
    // param("id", constants.VALIDATE_DATA).isNumeric(),
    // body("name").isString().withMessage(constants.VALIDATE_DATA),
    // body("img_url").isString().withMessage(constants.VALIDATE_DATA),
    // body("note_repair").isString().withMessage(constants.VALIDATE_DATA),
    // body("history_repair").isString().withMessage(constants.VALIDATE_DATA),
    // body("current_kilometres").withMessage(constants.VALIDATE_DATA),
    // body("cumulative_kilometers").withMessage(constants.VALIDATE_DATA),
    // body("expiration_time").withMessage(constants.VALIDATE_DATA),
    // body("time_before").withMessage(constants.VALIDATE_DATA),
    // body("is_notified").withMessage(constants.VALIDATE_DATA),
    // body("is_received").withMessage(constants.VALIDATE_DATA),
    // body("update_time").withMessage(constants.VALIDATE_DATA),
  ],
  verifyToken,
  remindController.update
);


export default (app: Express) => {
  app.use("/api/v1/remind/main", router);
};
