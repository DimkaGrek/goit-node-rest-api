import bcrypt from 'bcrypt';
import authServices from '../services/authServices.js';
import { User } from '../models/User.js';
import HttpError from '../helpers/HttpError.js';
import jwt from 'jsonwebtoken';

const signup = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await authServices.findUser({ email });

        if (user) {
            throw HttpError(409, 'Email in use');
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            ...req.body,
            password: hashPassword,
        });

        res.status(201).json({
            username: newUser.username,
            email: newUser.email,
            subscription: 'starter',
        });
    } catch (error) {
        next(error);
    }
};

const signin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await authServices.findUser({ email: email });

        if (!user) {
            throw HttpError(401, 'Email or password wrong');
        }

        const comparePassword = await authServices.validatePassword(
            password,
            user.password
        );

        if (!comparePassword) {
            throw HttpError(401, 'Email or password wrong');
        }

        const { _id: id } = user;

        const payload = {
            id,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '23h',
        });
        await authServices.updateUser({ _id: id }, { token });

        const userDTO = {
            email: user.email,
            subscription: user.subscription,
        };

        res.json({
            token: token,
            user: userDTO,
        });
    } catch (error) {
        next(error);
    }
};

const getCurrent = async (req, res, next) => {
    try {
        const { username, email, subscription } = req.user;

        res.json({
            username,
            email,
            subscription,
        });
    } catch (error) {
        next(error);
    }
};

const signout = async (req, res, next) => {
    try {
        const { _id } = req.user;
        await authServices.updateUser({ _id }, { token: '' });

        res.status(204).json();
    } catch (error) {
        next(error);
    }
};

const updateUserSubscription = async (req, res, next) => {
    try {
        const { subscription } = req.body;
        const user = await authServices.updateUser(req.user._id, {
            subscription,
        });

        const userDTO = {
            email: user.email,
            subscription: user.subscription,
        };

        res.json(userDTO);
    } catch (error) {
        next(error);
    }
};

export default {
    signup,
    signin,
    getCurrent,
    signout,
    updateUserSubscription,
};
