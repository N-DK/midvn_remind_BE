import { Express } from 'express';
import remindCategoryRoute from './remindCategory.route';
import vehicleNoGPSRoute from './vehicleNoGPS.route';
import tireRoute from './tire.route';
import tokenFirebaseRoute from './tokenFirebase.route';


export default (app: Express) => {
    remindCategoryRoute(app);
    vehicleNoGPSRoute(app);
    tireRoute(app);
    tokenFirebaseRoute(app);
};
