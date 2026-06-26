import { Response } from 'express';
import { ApiResponse } from '../types';

export function sendSuccess<T>(res: Response, message: string, data?: T): Response<ApiResponse<T>> {
 return res.status(200).json({
 success: true,
 message,
 data,
 });
}

export function sendError(res: Response, message: string, statusCode: number = 400): Response<ApiResponse<void>> {
 return res.status(statusCode).json({
 success: false,
 message,
 });
}
