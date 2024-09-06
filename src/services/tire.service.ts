import { PoolConnection } from "mysql2";
import { BusinessLogicError } from "../core/error.response";
import { StatusCodes } from "../core/httpStatusCode";
import { getConnection } from "../dbs/init.mysql";
import tireModel from "../models/tire.model";
import { tables } from "../constants/tableName.constant";

class TireService {
  async getTiresByVehicleId(vehicleId: string) {
    try {
      const { conn } = await getConnection();
      try {
        const data = await tireModel.getTiresByVehicleId(conn, vehicleId);
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

  async addTire(data: any) {
    try {
      const { conn } = await getConnection();
      try {
        const tire = await tireModel.addTire(conn, data);
        return tire;
      } catch (error) {
        throw error;
      } finally {
        conn.release();
      }
    } catch (error: any) {
      throw new BusinessLogicError(
        "Đã xảy ra lỗi",
        [error.msg as never],
        error.status
      );
    }
  }

  async updateTire(data: any) {
    try {
      const { conn } = await getConnection();
      try {
        const tire = await tireModel.updateTire(conn, data);
        return tire;
      } catch (error) {
        throw error;
      } finally {
        conn.release();
      }
    } catch (error: any) {
      throw new BusinessLogicError(
        `${error.msg}`,
        [error.msg as never],
        error.status
      );
    }
  }

  async deleteTire(tire_id: number) {
    try {
      const { conn } = await getConnection();
      try {
        const tire = await tireModel.deleteTire(conn, tire_id);
        return tire;
      } catch (error) {
        throw error;
      } finally {
        conn.release();
      }
    } catch (error: any) {
      throw new BusinessLogicError(
        `${error.msg}`,
        [error.msg as never],
        error.status
      );
    }
  }

  async restoreTire(tire_id: number) {
    try {
      const { conn } = await getConnection();
      try {
        const tire = await tireModel.restoreTire(conn, tire_id);
        return tire;
      } catch (error) {
        throw error;
      } finally {
        conn.release();
      }
    } catch (error: any) {
      throw new BusinessLogicError(
        `${error.msg}`,
        [error.msg as never],
        error.status
      );
    }
  }
  async search(data: any) {
    try {
      const { conn } = await getConnection();
      try {
        const tires = await tireModel.search(conn, data);
        return tires;
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

export default new TireService();
