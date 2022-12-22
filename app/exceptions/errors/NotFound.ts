import {HttpException} from '../HttpException';

export class NotFound extends HttpException {
  constructor(message, status?) {
    super(status, message);

    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);

    this.message = message || "The requested resource couldn't be found";
    this.status = status || 404;
  }
}
