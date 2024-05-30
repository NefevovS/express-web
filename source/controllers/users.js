import { randomBytes } from 'node:crypto';

import { pbkdf2Promisified, signPromisified } from '../utility.js';
import { addUser } from '../models/users.js';

export async function register(req, res) {
    const salt = randomBytes(16);
    const hash = await pbkdf2Promisified(req.body.password, salt,
                                         100000, 32, 'sha256');
    const user = {
        username: req.body.username,
        password: hash,
        salt: salt
    };
    await addUser(user);
    res.status(201);
    res.end();
}

export async function login(req, res) {
    const secret = process.env.SECRETKEY;
    const token = await signPromisified({ name: req.__user.username },
                                        secret);
    res.json({ token: token });
}
