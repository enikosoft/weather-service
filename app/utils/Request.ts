import {InternalServerError} from './../exceptions/errors';
import axios from 'axios';
import {RequestType} from '../types/requestTypes';

export class Api {
  private method;
  private url;
  private data;

  // tslint:disable-next-line: no-any
  constructor(method: RequestType, url: string, data?: any) {
    this.method = method;
    this.url = url;
    this.data = data;
  }

  async request() {
    const result = await axios({
      method: this.method,
      url: this.url,
      ...(this.data ? {data: this.data} : {}),
    });

    if (result.data && result.status === 200) {
      return result.data;
    }

    throw new InternalServerError('Error occured during API request.');
  }
}
