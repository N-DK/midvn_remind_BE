import { PoolConnection } from "mysql2";
import DatabaseModel from "./database.model";
import { tables } from "../constants/tableName.constant";
import redisModel from "./redis.model";

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
               ${tables.tableRemind}.img_url AS remind_img_url,
               ${tables.tableRemind}.note_repair AS note_repair,
               ${tables.tableRemind}.history_repair AS history_repair,
               ${tables.tableRemind}.current_kilometers AS current_kilometers,
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
          on: `${tables.tableVehicleNoGPS}.license_plate = ${tables.tableRemindVehicle}.vehicle_id`,
          type: "LEFT",
        },
        {
          table: tables.tableRemind,
          on: `${tables.tableRemindVehicle}.remind_id = ${tables.tableRemind}.id`,
          type: "LEFT",
        },
        {
          table: tables.tableRemindCategory,
          on: `${tables.tableRemind}.remind_category_id = ${tables.tableRemindCategory}.id`,
          type: "LEFT",
        },
      ]
    );

    return result;
  }

  async getByVehicleId(con: PoolConnection, vehicleID: string) {
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
                 ${tables.tableRemind}.img_url AS remind_img_url,
                 ${tables.tableRemind}.note_repair AS note_repair,
                 ${tables.tableRemind}.history_repair AS history_repair,
                 ${tables.tableRemind}.current_kilometers AS current_kilometers,
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
          on: `${tables.tableVehicleNoGPS}.license_plate = ${tables.tableRemindVehicle}.vehicle_id`,
          type: "LEFT",
        },
        {
          table: tables.tableRemind,
          on: `${tables.tableRemindVehicle}.remind_id = ${tables.tableRemind}.id`,
          type: "LEFT",
        },
        {
          table: tables.tableRemindCategory,
          on: `${tables.tableRemind}.remind_category_id = ${tables.tableRemindCategory}.id`,
          type: "LEFT",
        },
      ]
    );
    return result;
  }

  async addRemind(con: PoolConnection, data: any) {
    console.log(data);
    const remind_id = await this.insert(con, tables.tableRemind, {
      img_url: data?.img_url ?? null,
      note_repair: data?.note_repair ?? null,
      history_repair: data?.history_repair ?? null,
      current_kilometers: data?.current_kilometers ?? 0,
      cumulative_kilometers: data?.cumulative_kilometers ?? 0,
      expiration_time: data?.time_expire ?? 0,
      is_deleted: 0,
      time_before: data?.time_before ?? INFINITY,
      is_notified: data?.is_notified ?? 0,
      is_received: data?.is_received ?? 0,
      remind_category_id: data.remind_category_id,
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

    // save redis
    const isRedisReady = redisModel.redis.instanceConnect.isReady;
    if (isRedisReady) {
      await redisModel.hSet(
        "remind",
        remind_id,
        JSON.stringify({
          img_url: data?.img_url ?? null,
          note_repair: data?.note_repair ?? null,
          history_repair: data?.history_repair ?? null,
          current_kilometers: data?.current_kilometers ?? 0,
          cumulative_kilometers: data?.km_expire ?? 0,
          expiration_time: data?.time_expire ?? 0,
          is_delete: 0,
          time_before: data?.time_before ?? INFINITY,
          is_notified: data?.is_notified ?? 0,
          is_received: data?.is_received ?? 0,
          remind_category_id: data.cate_id,
          vehicles: data?.vehicles,
          create_time: Date.now(),
        }),
        "remind.models.ts",
        Date.now()
      );
    }

    return result;
  }

  async updateNotifiedOff(con: PoolConnection, remindID: number) {
    const result = await this.update(
      con,
      tables.tableRemind,
      { is_notified: 1 },
      "id",
      remindID
    );

    const isRedisReady = redisModel.redis.instanceConnect.isReady;

    const { data } = await redisModel.hGetAll(
      "remind",
      "remind.model.ts",
      Date.now()
    );
    const reminds: any = isRedisReady ? Object.values(data) : result;

    if (isRedisReady) {
      const remindIndex = reminds.findIndex(
        (remind: any) => remind.id === remindID
      );

      if (remindIndex !== -1) {
        let remind = JSON.parse(reminds[remindIndex]);
        remind.is_notified = 1;
        await redisModel.hSet(
          "remind",
          remindID,
          JSON.stringify(remind),
          "remind.models.ts",
          Date.now()
        );
      } else {
        console.log(`Remind with ID ${remindID} not found in Redis`);
      }
    }
    return result;
  }

  async updateNotifiedON(con: PoolConnection, remindID: number) {
    const result = await this.update(
      con,
      tables.tableRemind,
      { is_notified: 0 },
      "id",
      remindID
    );
    const isRedisReady = redisModel.redis.instanceConnect.isReady;

    const { data } = await redisModel.hGetAll(
      "remind",
      "remind.model.ts",
      Date.now()
    );
    const reminds: any = isRedisReady ? Object.values(data) : result;

    if (isRedisReady) {
      const remindIndex = reminds.findIndex(
        (remind: any) => remind.id === remindID
      );

      if (remindIndex !== -1) {
        let remind = JSON.parse(reminds[remindIndex]);
        remind.is_notified = 0;
        await redisModel.hSet(
          "remind",
          remindID,
          JSON.stringify(remind),
          "remind.models.ts",
          Date.now()
        );
      } else {
        console.log(`Remind with ID ${remindID} not found in Redis`);
      }
    }

    return result;
  }

  async updateRemind(con: PoolConnection, data: any, remindID: number) {
    const result = await this.update(
      con,
      tables.tableRemind,
      {
        img_url: data?.img_url ?? null,
        note_repair: data?.note_repair ?? null,
        history_repair: data?.history_repair ?? null,
        current_kilometers: data?.current_kilometers ?? 0,
        cumulative_kilometers: data?.cumulative_kilometers ?? 0,
        expiration_time: data?.time_expire ?? 0,
        time_before: data?.time_before ?? INFINITY,
        is_notified: data?.is_notified ?? 0,
        is_received: data?.is_notified ?? 0,
        update_time: Date.now(),
      },
      "id",
      remindID
    );
    const isRedisReady = redisModel.redis.instanceConnect.isReady;
    if (isRedisReady) {
      await redisModel.hSet(
        "remind",
        remindID,
        JSON.stringify(result),
        "remind.models.ts",
        Date.now()
      );
    }
    return result;
  }

  async search(con: PoolConnection, userID: number, query: any) {
    let params: any[] = [userID];
    let whereClause = `${tables.tableVehicleNoGPS}.user_id = ? AND ${tables.tableVehicleNoGPS}.is_deleted = 0 AND 
            (
                note_repair LIKE '%${query.keyword}%' OR
                cumulative_kilometers LIKE '%${query.keyword}%' OR
                ${tables.tableRemindCategory}.name LIKE '%${query.keyword}%' OR
                ${tables.tableVehicleNoGPS}.license_plate LIKE '%${query.keyword}%' OR 
                ${tables.tableVehicleNoGPS}.license LIKE '%${query.keyword}%'
            )`;
    // if (query.license_plate) {
    //     whereClause += ' AND license_plate LIKE ?';
    //     params.push(`%${query.license_plate}%`);
    // }
    // if (query.license) {
    //     whereClause += ' AND license LIKE ?';
    //     params.push(`%${query.license}%`);
    // }

    const result = await this.selectWithJoins(
      con,
      tables.tableVehicleNoGPS,
      `${tables.tableVehicleNoGPS}.license_plate AS license_plate,
               ${tables.tableVehicleNoGPS}.user_id AS user_id,
               ${tables.tableVehicleNoGPS}.license AS license,
               ${tables.tableVehicleNoGPS}.create_time AS vehicle_create_time,
               ${tables.tableVehicleNoGPS}.update_time AS vehicle_update_time,
               
               ${tables.tableRemind}.id AS remind_id,
               ${tables.tableRemind}.img_url AS remind_img_url,
               ${tables.tableRemind}.note_repair AS note_repair,
               ${tables.tableRemind}.history_repair AS history_repair,
               ${tables.tableRemind}.current_kilometers AS current_kilometers,
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

      whereClause,
      params,
      [
        {
          table: tables.tableRemindVehicle,
          on: `${tables.tableVehicleNoGPS}.license_plate = ${tables.tableRemindVehicle}.vehicle_id`,
          type: "LEFT",
        },
        {
          table: tables.tableRemind,
          on: `${tables.tableRemindVehicle}.remind_id = ${tables.tableRemind}.id`,
          type: "LEFT",
        },
        {
          table: tables.tableRemindCategory,
          on: `${tables.tableRemind}.remind_category_id = ${tables.tableRemindCategory}.id`,
          type: "LEFT",
        },
      ]
    );

    return result;
  }
  async updateIsDeleted(con: PoolConnection, remindID: number) {
    const result = await this.update(
      con,
      tables.tableRemind,
      { is_deleted: 1 },
      "id",
      remindID
    );
    const isRedisReady = redisModel.redis.instanceConnect.isReady;

    const { data } = await redisModel.hGetAll(
      "remind",
      "remind.model.ts",
      Date.now()
    );
    const reminds: any = isRedisReady ? Object.values(data) : result;
    if (isRedisReady) {
      const remindIndex = reminds.findIndex(
        (remind: any) => remind.id === remindID
      );

      if (remindIndex !== -1) {
        let remind = JSON.parse(reminds[remindIndex]);
        remind.is_deleted = 1;
        await redisModel.hSet(
          "remind",
          remindID,
          JSON.stringify(remind),
          "remind.models.ts",
          Date.now()
        );
      } else {
        console.log(`Remind with ID ${remindID} not found in Redis`);
      }
    }
    return result;
  }
}

export default new RemindModel();
