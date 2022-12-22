import {HttpException} from '@exceptions/HttpException';
import {NextFunction, Request, Response} from 'express';
import {getErrorResponse} from '@app/types/responseType';

const errorMiddleware = (error: HttpException, req: Request, res: Response, next: NextFunction) => {
  try {
    const status: number = error.status || 500;

    const errorResp = getErrorResponse(error);
    res.status(status).json(errorResp);
  } catch (error) {
    next(error);
  }
};

export default errorMiddleware;
