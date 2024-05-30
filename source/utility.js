import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pbkdf2 } from 'node:crypto';
import { promisify } from 'node:util';
import jwt from 'jsonwebtoken';

const currentDir = dirname(dirname(fileURLToPath(import.meta.url)));
export { currentDir };

const pbkdf2Promisified = promisify(pbkdf2);
export { pbkdf2Promisified };

const signPromisified = promisify(jwt.sign);
export { signPromisified };

const verifyPromisified = promisify(jwt.verify);
export { verifyPromisified};
