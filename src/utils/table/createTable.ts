import { PoolConnection } from 'mysql2';

const createTable = async (db: PoolConnection, tableName: string) => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS ${tableName} (
            id int(11) NOT NULL AUTO_INCREMENT,
            imei varchar(45) NOT NULL,
            lat varchar(45) NOT NULL,
            lng varchar(45) NOT NULL,
            start_time bigint(20) DEFAULT NULL,
            tollboth_name varchar(255) NOT NULL,
            dri varchar(45) DEFAULT NULL,
            create_at bigint(20) DEFAULT NULL,
            PRIMARY KEY (id),
            KEY idx_imei_tollboth_name (imei, tollboth_name)
        )`;

    try {
        db.query(createTableQuery, (err) => {
            if (err) {
                throw new Error(
                    `Failed to create table ${tableName}: ${err.message}`,
                );
            }
        });
    } catch (err: any) {
        throw new Error(`Failed to create table ${tableName}: ${err.message}`);
    }
};

export default createTable;
