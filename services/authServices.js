import { User } from '../models/User.js';
import bcrypt from 'bcrypt';

const findUser = (filter) => User.findOne(filter);

const validatePassword = (password, hashPassword) =>
    bcrypt.compare(password, hashPassword);

const updateUser = async (id, data) =>
    User.findByIdAndUpdate(id, data, { new: true });

export default {
    findUser,
    validatePassword,
    updateUser,
};
