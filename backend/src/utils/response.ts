import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T | undefined;
  message?: string | undefined;
  error?: string | undefined;
}

export const success = <T>(res: Response, data: T, message: string = '', statusCode: number = 200): void => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message: message || 'Success'
  };
  res.status(statusCode).json(response);
};

export const error = (res: Response, message: string, statusCode: number = 400, errorCode: string = ''): void => {
  const response: ApiResponse = {
    success: false,
    message,
    error: errorCode as string | undefined
  };
  res.status(statusCode).json(response);
};

export const serverError = (res: Response, message: string = 'Internal server error'): void => {
  error(res, message, 500, 'INTERNAL_SERVER_ERROR');
};

export const notFound = (res: Response, message: string = 'Resource not found'): void => {
  error(res, message, 404, 'NOT_FOUND');
};

export const unauthorized = (res: Response, message: string = 'Unauthorized'): void => {
  error(res, message, 401, 'UNAUTHORIZED');
};

export const forbidden = (res: Response, message: string = 'Forbidden'): void => {
  error(res, message, 403, 'FORBIDDEN');
};

export const badRequest = (res: Response, message: string = 'Bad request'): void => {
  error(res, message, 400, 'BAD_REQUEST');
};

