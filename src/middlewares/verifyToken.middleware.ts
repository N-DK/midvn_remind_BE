import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { Api401Error } from '../core/error.response';
import configureEnvironment from '../config/dotenv.config';
import { buffer } from 'stream/consumers';

const { JWT_SECRET_KEY } = configureEnvironment();

export const verifyToken = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const token = req.headers['x-mobicam-token'] as string;
    if (!token) {
        return next(new Api401Error('No token provided'));
    }
    // buffer from base64
    const user = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64').toString(),
    );
    if (user) {
        req.body.user = user;
        next();
    } else {
        return next(new Api401Error('Unauthorized'));
    }
    // jwt.verify(token, JWT_SECRET_KEY as string, (err: any, user: any) => {
    //     if (err) {
    //         return next(new Api401Error('Unauthorized'));
    //     }
    //     req.body.user = user;
    //     next();
    // });
};
