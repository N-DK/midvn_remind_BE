import { PoolConnection } from 'mysql2';
import DatabaseModel from './database.model';
import { tables } from '../constants/tableName.constant';

class TireModel extends DatabaseModel {
    constructor() {
        super();
    }

    async getTiresByVehicleId(conn: PoolConnection, vehicleId: string) {
        const result = await this.select(
            conn,
            tables.tableTire,
            'id, seri, size, brand, license_plate',
            'license_plate = ? AND is_deleted = 0',
            [vehicleId],
        );

        return result;
    }

    async addTire(conn: PoolConnection, data: any) {
        const { seri, size, brand, license_plate } = data;
        const queryText = `UPDATE ${tables.tableTire} 
            SET is_deleted = 0, update_time = ${Date.now()} 
            WHERE seri = '${seri}' AND license_plate = '${license_plate}' AND is_deleted = 1`;

        try {
            const updateResult: any = await new Promise((resolve, reject) => {
                conn.query(queryText, (err: any, result: any) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });

            if (updateResult && updateResult.affectedRows > 0) {
                return updateResult;
            }

            const insertResult = await this.insert(conn, tables.tableTire, {
                seri,
                size,
                brand,
                license_plate,
                create_time: Date.now(),
            });
            return insertResult;
        } catch (error: any) {
            throw new Error(`Error in addTire: ${error.message}`);
        }
    }

    async updateTire(conn: PoolConnection, data: any) {
        const { tire_id, seri, size, brand } = data;
        const result = await this.update(
            conn,
            tables.tableTire,
            { seri, size, brand, update_time: Date.now() },
            'id',
            tire_id,
        );

        return result;
    }

    async deleteTire(conn: PoolConnection, tire_id: number) {
        const result = await this.update(
            conn,
            tables.tableTire,
            { is_deleted: 1, update_time: Date.now() },
            'id',
            tire_id,
        );

        return result;
    }

    async restoreTire(conn: PoolConnection, tire_id: number) {
        const result = await this.update(
            conn,
            tables.tableTire,
            { is_deleted: 0, update_time: Date.now() },
            'id',
            tire_id,
        );

        return result;
    }
    async search(conn: PoolConnection, data: any) {
        const result = await this.select(
            conn,
            tables.tableTire,
            '*',
            `license_plate = '${data.vehicleID}' AND (seri LIKE '%${data.keyword}%' OR brand LIKE '%${data.keyword}%')`,
        );
        return result;
    }
}

export default new TireModel();
