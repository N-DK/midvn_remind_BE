import { BusinessLogicError } from '../core/error.response';
import { getConnection } from '../dbs/init.mysql';
import remindCategoryModel from '../models/remindCategory.model';

class RemindCategoryService {
    async getAllRows() {
        try {
            const { conn } = await getConnection();
            try {
                const data = await remindCategoryModel.getAllRows(conn);
                return data;
            } catch (error) {
                throw error;
            } finally {
                conn.release();
            }
        } catch (error: any) {
            throw new BusinessLogicError(error.msg);
        }
    }
}

export default new RemindCategoryService();
