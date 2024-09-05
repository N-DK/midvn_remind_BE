import { PoolConnection } from 'mysql2';
import DatabaseModel from './database.model';
import { tables } from '../constants/tableName.constant';


class RemindModel extends DatabaseModel {
    constructor() {
        super();
    }
    async getAll(con:PoolConnection, userID: number){
        const result = await this.selectWithJoins(
            con,
            tables.tableVehicleNoGPS,
            `${tables.tableVehicleNoGPS}.id AS vehicle_id,
             ${tables.tableVehicleNoGPS}.license_plate AS license_plate,
             ${tables.tableVehicleNoGPS}.user_id AS user_id,
             ${tables.tableVehicleNoGPS}.license AS license,
             ${tables.tableVehicleNoGPS}.create_time AS create_time,
             ${tables.tableVehicleNoGPS}.update_time AS update_time,

             ${tables.tableRemind}.id AS remind_id,
             ${tables.tableRemind}.name AS remind_name,
             ${tables.tableRemind}.img_url AS img_url,
             ${tables.tableRemind}.note_repair AS note_repair,
             ${tables.tableRemind}.history_repair AS history_repair,
             ${tables.tableRemind}.current_kilometres AS current_kilometres,
             ${tables.tableRemind}.cumulative_kilometers AS cumulative_kilometers,
             ${tables.tableRemind}.expiration_time AS expiration_time,
             ${tables.tableRemind}.time_before AS time_before,
             ${tables.tableRemind}.is_notified AS is_notified,
             ${tables.tableRemind}.is_received AS is_received,
             ${tables.tableRemind}.create_time AS create_time,
             ${tables.tableRemind}.update_time AS update_time,
             
             ${tables.tableRemindCategory}.id AS category_id,
             ${tables.tableRemindCategory}.name AS category_name,
             ${tables.tableRemindCategory}.desc AS category_desc,
             ${tables.tableRemindCategory}.icon AS category_icon,
             ${tables.tableRemindCategory}.create_time AS category_create_time,
             ${tables.tableRemindCategory}.update_time AS category_update_time,
             ${tables.tableRemindCategory}.is_deleted AS category_is_deleted`,

             `${tables.tableVehicleNoGPS}.user_id = ? AND ${tables.tableVehicleNoGPS}.is_deleted = 0`
             [userID],
             [
                {table1: tables.tableRemindVehicle, on: `${tables.tableVehicleNoGPS}.id = ${tables.tableRemindVehicle}.vehicle_id`, type:'INNER'},
                {table2: tables.tableRemind, on:  `${tables.tableRemind}.id = ${tables.tableRemindVehicle}.remind_id`, type:'INNER'},
                {table3: tables.tableRemindCategory, on: `${tables.tableRemind}.remind_category_id = ${tables.tableRemindCategory}.id`, type:'INNER'},
             ]
        );
        return result;
    }

}

export default new RemindModel();