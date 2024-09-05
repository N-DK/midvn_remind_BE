import { BusinessLogicError } from '../core/error.response';
import { getConnection } from '../dbs/init.mysql';
import remindModel from '../models/remind.model';
class RemindService{
    async getAll(userID: number){
        try{
            const { conn } = await getConnection();
            try{
                const result = await remindModel.getAll(conn,userID);
                return result;
            }catch(error){
                throw error;
            }
        }catch(error){
           throw error;
        }
    }
    async getByVehicleId(vehicleId: number){
        try{
            const { conn } = await getConnection();
            try{
                const result = await remindModel.getByVehicleId(conn,vehicleId);
                return result;
            }catch(error){
                throw error;
            }
        }catch(error){
            throw error;
        }
    }
}

export default new RemindService();