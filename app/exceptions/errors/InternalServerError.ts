import {HttpException} from '../HttpException';

export class InternalServerError extends HttpException {
  constructor(message, status?) {
    super(status, message);

    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);

    this.message = message || 'Internal Server Error';
    this.status = status || 500;
  }
}
