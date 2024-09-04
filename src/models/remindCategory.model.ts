import { PoolConnection } from 'mysql2';
import DatabaseModel from './database.model';
import { tables } from '../constants/tableName.constant';

class RemindCategoryModel extends DatabaseModel {
    constructor() {
        super();
    }

    public async getAllRows(con: PoolConnection): Promise<any> {
        const result = await this.select(
            con,
            tables.tableRemindCategory,
            '*',
            'id IS NOT NULL',
            [],
        );
        return result;
    }
}

export default new RemindCategoryModel();
