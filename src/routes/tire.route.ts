import express, { Express, Router } from "express";
import { body, query, param } from "express-validator";
import constants from "../constants/msg.constant";
import { verifyToken } from "../middlewares/verifyToken.middleware";
import tireController from "../controllers/tire.controller";
const router: Router = express.Router();

router.get(
  "/get-all/:vehicleId",
  verifyToken,
  tireController.getTireByVehicleId
);
router.post(
  "/add-tire",
  verifyToken,
  [
    body("seri", constants.NOT_EMPTY)
      .isString()
      .withMessage(constants.VALIDATE_DATA),
    body("size", constants.NOT_EMPTY)
      .isString()
      .withMessage(constants.VALIDATE_DATA),
    body("brand", constants.NOT_EMPTY)
      .isString()
      .withMessage(constants.VALIDATE_DATA),
    body("license_plate", constants.NOT_EMPTY)
      .isString()
      .withMessage(constants.VALIDATE_DATA),
  ],
  tireController.addTire
);
router.patch("/delete-tire/:id", verifyToken, tireController.deleteTire);
router.patch("/restore-tire/:id", verifyToken, tireController.restoreTire);

router.get(
  "/search",
  [
    body("license_plate", constants.NOT_EMPTY)
      .isString()
      .withMessage(constants.VALIDATE_DATA),
    body("keyword", constants.NOT_EMPTY)
      .isString()
      .withMessage(constants.VALIDATE_DATA),
  ],
  verifyToken,
  tireController.search
);

router.put(
  "/update-tire/:tire_id",
  verifyToken,
  [
    body("seri", constants.NOT_EMPTY)
      .isString()
      .withMessage(constants.VALIDATE_DATA),
    body("size", constants.NOT_EMPTY)
      .isString()
      .withMessage(constants.VALIDATE_DATA),
    body("brand", constants.NOT_EMPTY)
      .isString()
      .withMessage(constants.VALIDATE_DATA),
  ],
  tireController.updateTire
);

export default (app: Express) => {
  app.use("/api/v1/remind/tire", router);
};
