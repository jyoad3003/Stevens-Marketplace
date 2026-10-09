import { dbConnection } from './mongoConnection.js';

// CS 546 BRIDGE:
// Exactly like Lab 4, this helper file lets us get a reference
// to a specific MongoDB collection without writing repetitive code.

const getCollectionFn = (collection) => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }
    return _col;
  };
};

// We will export functions to get our specific collections
export const users = getCollectionFn('users');
export const projects = getCollectionFn('projects');
export const connections = getCollectionFn('connections');
