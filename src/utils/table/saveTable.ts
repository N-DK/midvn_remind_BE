import { PoolConnection } from 'mysql2';
import { setting } from '../../constants/setting.constant';
import getTableName from './getTableName';
import { tableExists } from './checkTableExists';
import createTable from './createTable';

export const saveTable = async (con: PoolConnection, deviceId: number) => {
    const tableName = getTableName(
        setting.initialNameOfTableReportChargingStation,
        deviceId,
    );
    const isExists = await tableExists(con, tableName);

    if (!isExists) await createTable(con, tableName);

    return tableName;
};
