import { PoolConnection } from "mysql2";
import DatabaseModel from "./database.model";
import { tables } from "../constants/tableName.constant";

const INFINITY = 2147483647;

class RemindModel extends DatabaseModel {
  constructor() {
    super();
  }
  async getAll(con: PoolConnection, userID: number) {
    const result = await this.selectWithJoins(
      con,
      tables.tableVehicleNoGPS,
      `${tables.tableVehicleNoGPS}.id AS vehicle_id,
             ${tables.tableVehicleNoGPS}.license_plate AS license_plate,
             ${tables.tableVehicleNoGPS}.user_id AS user_id,
             ${tables.tableVehicleNoGPS}.license AS license,
             ${tables.tableVehicleNoGPS}.create_time AS vehicle_create_time,
             ${tables.tableVehicleNoGPS}.update_time AS vehicle_update_time,
             
             ${tables.tableRemind}.id AS remind_id,
             ${tables.tableRemind}.name AS remind_name,
             ${tables.tableRemind}.img_url AS remind_img_url,
             ${tables.tableRemind}.note_repair AS note_repair,
             ${tables.tableRemind}.history_repair AS history_repair,
             ${tables.tableRemind}.current_kilometres AS current_kilometres,
             ${tables.tableRemind}.cumulative_kilometers AS cumulative_kilometers,
             ${tables.tableRemind}.expiration_time AS expiration_time,
             ${tables.tableRemind}.time_before AS time_before,
             ${tables.tableRemind}.is_notified AS is_notified,
             ${tables.tableRemind}.is_received AS is_received,
             ${tables.tableRemind}.create_time AS remind_create_time,
             ${tables.tableRemind}.update_time AS remind_update_time,
             
             ${tables.tableRemindCategory}.id AS category_id,
             ${tables.tableRemindCategory}.name AS category_name,
             ${tables.tableRemindCategory}.desc AS category_desc,
             ${tables.tableRemindCategory}.icon AS category_icon,
             ${tables.tableRemindCategory}.create_time AS category_create_time,
             ${tables.tableRemindCategory}.update_time AS category_update_time,
             ${tables.tableRemindCategory}.is_deleted AS category_is_deleted`,

      `${tables.tableVehicleNoGPS}.user_id = ? AND ${tables.tableVehicleNoGPS}.is_deleted = 0`,
      [userID],
      [
        {
          table: tables.tableRemindVehicle,
          on: `${tables.tableVehicleNoGPS}.id = ${tables.tableRemindVehicle}.vehicle_id`,
          type: "INNER",
        },
        {
          table: tables.tableRemind,
          on: `${tables.tableRemindVehicle}.remind_id = ${tables.tableRemind}.id`,
          type: "INNER",
        },
        {
          table: tables.tableRemindCategory,
          on: `${tables.tableRemind}.remind_category_id = ${tables.tableRemindCategory}.id`,
          type: "INNER",
        },
      ]
    );

    return result;
  }
  async getByVehicleId(con: PoolConnection, vehicleID: number) {
    const result = await this.selectWithJoins(
      con,
      tables.tableVehicleNoGPS,
      `${tables.tableVehicleNoGPS}.id AS vehicle_id,
               ${tables.tableVehicleNoGPS}.license_plate AS license_plate,
               ${tables.tableVehicleNoGPS}.user_id AS user_id,
               ${tables.tableVehicleNoGPS}.license AS license,
               ${tables.tableVehicleNoGPS}.create_time AS vehicle_create_time,
               ${tables.tableVehicleNoGPS}.update_time AS vehicle_update_time,
               
               ${tables.tableRemind}.id AS remind_id,
               ${tables.tableRemind}.name AS remind_name,
               ${tables.tableRemind}.img_url AS remind_img_url,
               ${tables.tableRemind}.note_repair AS note_repair,
               ${tables.tableRemind}.history_repair AS history_repair,
               ${tables.tableRemind}.current_kilometres AS current_kilometres,
               ${tables.tableRemind}.cumulative_kilometers AS cumulative_kilometers,
               ${tables.tableRemind}.expiration_time AS expiration_time,
               ${tables.tableRemind}.time_before AS time_before,
               ${tables.tableRemind}.is_notified AS is_notified,
               ${tables.tableRemind}.is_received AS is_received,
               ${tables.tableRemind}.create_time AS remind_create_time,
               ${tables.tableRemind}.update_time AS remind_update_time,
               
               ${tables.tableRemindCategory}.id AS category_id,
               ${tables.tableRemindCategory}.name AS category_name,
               ${tables.tableRemindCategory}.desc AS category_desc,
               ${tables.tableRemindCategory}.icon AS category_icon,
               ${tables.tableRemindCategory}.create_time AS category_create_time,
               ${tables.tableRemindCategory}.update_time AS category_update_time,
               ${tables.tableRemindCategory}.is_deleted AS category_is_deleted`,

      `${tables.tableVehicleNoGPS}.license_plate = ? AND ${tables.tableVehicleNoGPS}.is_deleted = 0`,
      [vehicleID],
      [
        {
          table: tables.tableRemindVehicle,
          on: `${tables.tableVehicleNoGPS}.id = ${tables.tableRemindVehicle}.vehicle_id`,
          type: "INNER",
        },
        {
          table: tables.tableRemind,
          on: `${tables.tableRemindVehicle}.remind_id = ${tables.tableRemind}.id`,
          type: "INNER",
        },
        {
          table: tables.tableRemindCategory,
          on: `${tables.tableRemind}.remind_category_id = ${tables.tableRemindCategory}.id`,
          type: "INNER",
        },
      ]
    );
    return result;
  }

  async addRemind(con: PoolConnection, data: any) {
    const remind_id = await this.insert(con, tables.tableRemind, {
      img_url: data?.img_url ?? null,
      note_repair: data?.note_repair ?? null,
      history_repair: data?.history_repair ?? null,
      current_kilometers: data?.current_kilometers ?? 0,
      cumulative_kilometers: data?.cumulative_kilometers ?? 0,
      expiration_time: data?.expiration_time ?? 0,
      is_delete: 0,
      time_before: data?.time_before ?? INFINITY,
      is_notified: data?.is_notified ?? 0,
      is_received: data?.is_received ?? 0,
      remind_category_id: data.cate_id,
      create_time: Date.now(),
    });

    let queryText = `INSERT INTO ${tables.tableRemindVehicle} (remind_id, vehicle_id) VALUES `;

    data?.vehicles?.forEach((item: any) => {
      queryText += `(${remind_id}, '${item}'),`;
    });

    queryText = queryText.slice(0, -1);

    const result = await new Promise((resolve, reject) => {
      con.query(queryText, (err: any, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    return result;
  }
}

export default new RemindModel();
