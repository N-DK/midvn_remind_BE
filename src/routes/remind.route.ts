import express, { Express, Router } from 'express';
import { body, query, param } from 'express-validator';
import constants from '../constants/msg.constant';
import { verifyToken } from '../middlewares/verifyToken.middleware';
import remindController from '../controllers/remind.controller';

const router: Router = express.Router();

router.get('/get-all', verifyToken, remindController.getAll);

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

router.post('/add-remind', verifyToken, [], remindController.addRemind);

export default (app: Express) => {
    app.use('/api/v1/remind/main', router);
};
