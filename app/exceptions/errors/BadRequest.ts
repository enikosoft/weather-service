import {HttpException} from '../HttpException';

export class BadRequest extends HttpException {
  constructor(message, status?) {
    super(message, status);

    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);

    this.message = message || 'Bad Request';
    this.status = status || 400;
  }
}
