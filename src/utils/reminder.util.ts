import { PoolConnection } from 'mysql2';
import DatabaseModel from '../models/database.model';
import { getConnection } from '../dbs/init.mysql';
import { tables } from '../constants/tableName.constant';
import multer from 'multer';
import path from 'path';

const dataBaseModel = new DatabaseModel();

let connection: PoolConnection;
let storage: any;

const reminder = {
    init: async () => {
        const { conn } = await getConnection();
        connection = conn;
        // Cấu hình lưu trữ file
        storage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, 'uploads/'); // Thư mục lưu trữ file
            },
            filename: (req, file, cb) => {
                cb(null, Date.now() + path.extname(file.originalname)); // Đặt tên file
            },
        });
    },
    getRemindsByVehicleId: async (vehicleId: string) => {
        const results: any = await dataBaseModel.selectWithJoins(
            connection,
            tables.tableRemindVehicle,
            `${tables.tableRemindCategory}.*, ${tables.tableRemindVehicle}.*, ${tables.tableRemind}.*`,
            'vehicle_id = ? AND is_notified = 0 AND is_received = 0',
            [vehicleId],
            [
                {
                    table: tables.tableRemind,
                    on: `${tables.tableRemind}.id = ${tables.tableRemindVehicle}.remind_id`,
                    type: 'LEFT',
                },
                {
                    table: tables.tableRemindCategory,
                    on: `${tables.tableRemindCategory}.id = ${tables.tableRemind}.remind_category_id`,
                    type: 'LEFT',
                },
            ],
        );

        return results;
    },
    // Cấu hình upload
    upload: multer({
        storage: storage,
        limits: { fileSize: 1024 * 1024 * 5 }, // Giới hạn kích thước file 5MB
        fileFilter: (req, file, cb) => {
            const filetypes = /jpeg|jpg|png|gif/;
            const extname = filetypes.test(
                path.extname(file.originalname).toLowerCase(),
            );
            const mimetype = filetypes.test(file.mimetype);

            if (mimetype && extname) {
                return cb(null, true);
            } else {
                cb(new Error('Only images are allowed!'));
            }
        },
    }),
};

export default reminder;
