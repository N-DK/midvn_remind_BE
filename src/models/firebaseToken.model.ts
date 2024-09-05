
import { PoolConnection } from "mysql2";
import DatabaseModel from "./database.model";
import { tables } from "../constants/tableName.constant";
import { BusinessLogicError } from "../core/error.response";
import { StatusCodes } from "../core/httpStatusCode";
class TokenFirebase extends DatabaseModel {
  constructor() {
    super();
  }

  async addToken(conn: PoolConnection, data: any, userID: number) {
    const tokenIsExist:any = await this.select(
      conn,
      tables.tableTokenFirebase,
      "*",
      "token = ?",
      [data.token]
    );
    console.log(tokenIsExist);
    if (tokenIsExist && tokenIsExist.length > 0) {
      throw new BusinessLogicError(
        "Token đã tồn tại",
        ["Thêm token mới thất bại" as never],
        StatusCodes.CONFLICT
      );
    }

    const result = await this.insert(conn, tables.tableTokenFirebase, {
      user_id: userID,
      token: data.token,
      created_at: Date.now(),
    });

    return result;
  }
}
export default new TokenFirebase();