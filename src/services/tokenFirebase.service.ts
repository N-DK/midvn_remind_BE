import { BusinessLogicError } from '../core/error.response';
import { getConnection } from '../dbs/init.mysql';
import TokenFirebase from '../models/firebaseToken.model';

class TokenFirebaseService {
    async addToken(data: any, userID: number, parentId: number) {
        try {
            const { conn } = await getConnection();
            try {
                const result = await TokenFirebase.addToken(
                    conn,
                    data,
                    userID,
                    parentId,
                );
                return result;
            } catch (error) {
                throw error;
            } finally {
                conn.release();
            }
        } catch (error: any) {
            throw error;
        }
    }
    async deleteToken(data: any) {
        try {
            const { conn } = await getConnection();
            try {
                const result = await TokenFirebase.deleteToken(conn, data);
                return result;
            } catch (error) {
                throw error;
            } finally {
                conn.release();
            }
        } catch (error: any) {
            throw error;
        }
    }
}
export default new TokenFirebaseService();
