import { BusinessLogicError } from '../core/error.response';
import { getConnection } from '../dbs/init.mysql';
import remindModel from '../models/remind.model';
class RemindService {
    async getAll(userID: number) {
        try {
            const { conn } = await getConnection();
            try {
                const result = await remindModel.getAll(conn, userID);
                return result;
            } catch (error) {
                throw error;
            }
        } catch (error) {
            throw error;
        }
    }

    async getByVehicleId(vehicleId: string) {
        try {
            const { conn } = await getConnection();
            try {
                const result = await remindModel.getByVehicleId(
                    conn,
                    vehicleId,
                );
                return result;
            } catch (error) {
                throw error;
            }
        } catch (error) {
            throw error;
        }
    }
    async addRemind(data: any) {
        try {
            const { conn } = await getConnection();
            try {
                const remind = await remindModel.addRemind(conn, data);
                return remind;
            } catch (error) {
                throw error;
            } finally {
                conn.release();
            }
        } catch (error: any) {
            console.log(error);
            throw error;
        }
    }
    async updateNotifiedOff(remindID: number) {
        try {
            const { conn } = await getConnection();
            try {
                const remind = await remindModel.updateNotifiedOff(
                    conn,
                    remindID,
                );
                return remind;
            } catch (error) {
                throw error;
            } finally {
                conn.release();
            }
        } catch (error: any) {
            throw new BusinessLogicError(
                'Đã xảy ra lỗi',
                [error.msg as never],
                error.status,
            );
        }
    }
    async update(data: any, remindID: number) {
        try {
            const { conn } = await getConnection();
            try {
                const remind = await remindModel.updateRemind(
                    conn,
                    data,
                    remindID,
                );
                return remind;
            } catch (error) {
                throw error;
            } finally {
                conn.release();
            }
        } catch (error: any) {
            throw new BusinessLogicError(
                'Đã xảy ra lỗi',
                [error.msg as never],
                error.status,
            );
        }
    }
    async updateNotifiedOn(remindID: number) {
        try {
            const { conn } = await getConnection();
            try {
                const remind = await remindModel.updateNotifiedON(
                    conn,
                    remindID,
                );
                return remind;
            } catch (error) {
                throw error;
            } finally {
                conn.release();
            }
        } catch (error: any) {
            throw new BusinessLogicError(
                'Đã xảy ra lỗi',
                [error.msg as never],
                error.status,
            );
        }
    }

    async search(userID: number, query: Object) {
        try {
            const { conn } = await getConnection();
            try {
                const result = await remindModel.search(conn, userID, query);
                return result;
            } catch (error) {
                throw error;
            }
        } catch (error) {
            throw error;
        }
    }
    async updateIsDeleted(remindID: number) {
        try {
            const { conn } = await getConnection();
            try {
                const remind = await remindModel.updateIsDeleted(
                    conn,
                    remindID,
                );
                return remind;
            } catch (error) {
                throw error;
            } finally {
                conn.release();
            }
        } catch (error: any) {
            throw new BusinessLogicError(
                'Đã xảy ra lỗi',
                [error.msg as never],
                error.status,
            );
        }
    }
    async finishRemind(remindID: number, user_id: number, data: any) {
        try {
            const { conn } = await getConnection();
            try {
                const remind = await remindModel.finishRemind(
                    conn,
                    remindID,
                    user_id,
                    data,
                );
                return remind;
            } catch (error) {
                throw error;
            } finally {
                conn.release();
            }
        } catch (error) {
            throw error;
        }
    }
    async getFinishRemind(vehicleID: string, user_id: number) {
        try {
            const { conn } = await getConnection();
            try {
                const remind = await remindModel.getFinishRemind(
                    conn,
                    vehicleID,
                    user_id,
                );
                return remind;
            } catch (error) {
                throw error;
            } finally {
                conn.release();
            }
        } catch (error) {
            throw error;
        }
    }

    async getAllGPS(query: any) {
        try {
            const { conn } = await getConnection();
            try {
                const result = await remindModel.getAllGPS(query);
                return result;
            } catch (error) {
                throw error;
            } finally {
                conn.release();
            }
        } catch (error) {
            throw error;
        }
    }

    async getCategoryAll(userId: any) {
        try {
            const { conn } = await getConnection();
            try {
                const result = await remindModel.getCategoryAll(userId);
                return result;
            } catch (error) {
                throw error;
            } finally {
                conn;
            }
        } catch (error) {
            throw error;
        }
    }

    async getScheduleByRemindId(remindID: number) {
        try {
            const { conn } = await getConnection();
            try {
                const result = await remindModel.getScheduleByRemindId(
                    remindID,
                );
                return result;
            } catch (error) {
                throw error;
            } finally {
                conn.release();
            }
        } catch (error) {
            throw error;
        }
    }
}

export default new RemindService();
