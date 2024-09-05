import { PoolConnection } from 'mysql2';
import DatabaseModel from './database.model';
import { tables } from '../constants/tableName.constant';

class RemindCategoryModel extends DatabaseModel {
    constructor() {
        super();
    }

    public async getAllRows(con: PoolConnection){
        const result = await this.select(
            con,
            tables.tableRemindCategory,
            '*',
            'id IS NOT NULL',
            [],
        );
        return result;
    }
    async getByUserID(con: PoolConnection, userID: number){
        const result = await this.select(
            con,
            tables.tableRemindCategory,
            '*',
            'user_id = ? OR user_id IS NULL',
            [userID]
        );
        return result;
    }
}

export default new RemindCategoryModel();
