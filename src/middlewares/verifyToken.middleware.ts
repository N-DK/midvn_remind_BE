import { Request, Response, NextFunction } from 'express';
import { Api401Error } from '../core/error.response';

export const verifyToken = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const token = req.headers['x-mobicam-token'] as string;
    if (!token) {
        return next(new Api401Error('No token provided'));
    }
    const user = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64').toString(),
    );
    if (user) {
        req.body.user = user;
        next();
    } else {
        return next(new Api401Error('Unauthorized'));
    }
};
