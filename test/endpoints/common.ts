import * as chai from 'chai';
import chaiHttp = require('chai-http');
import * as http from 'http';
import * as mongoose from 'mongoose';

chai.use(chaiHttp);

/** Authenticates and return cookie with token */
export async function authenticate(server: http.Server, userName: string, password: string): Promise<string[]> {
  const response = await chai
    .request(server)
    .post('/users/authenticate')
    .send(({ userName, password }));

  return response.get('Set-Cookie');
}

/** normalize some fields like _id */
export function normalizeAddedData<T>(addedData: mongoose.Document[]): T[] {
  return addedData.map<T>((document) => ({
    ...document.toObject(),
    _id: document._id.toString(),
    ...document.get('created_date') ? { created_date: new Date(document.get('created_date')) } : {},
  }));
}

/** Normalizes received value like date */
// tslint:disable:no-any
export function normalizeRecievedData<T>(received: any | any[]): T | T[] {

  const getExtended = (value: any) => ({
    ...value,
    ...value.created_date ? { created_date: new Date(value.created_date) } : {},
  });

  if (!Array.isArray(received)) {
    return getExtended(received);
  }

  return received.map<T>(getExtended);
}
// tslint:enable:no-any
