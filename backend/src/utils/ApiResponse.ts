import { Response } from 'express';

export class ApiResponse {
    static success(res: Response, data: any, message: string = 'Success', statusCode: number = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
        });
    }

    static created(res: Response, data: any, message: string = 'Created successfully') {
        return ApiResponse.success(res, data, message, 201);
    }

    static noContent(res: Response) {
        return res.status(204).send();
    }
}
