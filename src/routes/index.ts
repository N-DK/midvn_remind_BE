import { Express } from 'express';
import remindCategoryRoute from './remindCategory.route';
import vehicleNoGPSRoute from './vehicleNoGPS.route';

export default (app: Express) => {
    remindCategoryRoute(app);
    vehicleNoGPSRoute(app);
};
