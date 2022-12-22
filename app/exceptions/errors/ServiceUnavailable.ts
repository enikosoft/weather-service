import {HttpException} from '../HttpException';

export class ServiceUnavailable extends HttpException {
  constructor(message, status?) {
    super(status, message);

    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);

    this.message = message || 'Service Unavailable';
    this.status = status || 503;
  }
}
