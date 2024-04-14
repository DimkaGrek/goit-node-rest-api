import bcrypt from 'bcrypt';
import authServices from '../services/authServices.js';
import { User } from '../models/User.js';
import HttpError from '../helpers/HttpError.js';
import jwt from 'jsonwebtoken';
import gravatar from 'gravatar';
import path from 'path';
import fs from 'fs/promises';
import jimp from 'jimp';
import { nanoid } from 'nanoid';
import MailService from '../services/MailService.js';

const avatarsDir = path.join('./', 'public', 'avatars');

const signup = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await authServices.findUser({ email });

        if (user) {
            throw HttpError(409, 'Email in use');
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const avatarUrl = gravatar.url(email);

        const verificationToken = nanoid();

        await MailService.sendActivationMail(
            email,
            `${process.env.API_URL}:${process.env.PORT}${process.env.API_PREFIX}/users/verify/${verificationToken}`
        );

        const newUser = await User.create({
            ...req.body,
            password: hashPassword,
            avatarUrl,
            verificationToken,
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

        if (!user.verify) {
            throw HttpError(403, 'User is not yet verified');
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

const verify = async (req, res, next) => {
    try {
        const { verificationToken } = req.params;
        const user = await User.findOne({ verificationToken });
        if (!user) {
            throw HttpError(404);
        }
        await User.findByIdAndUpdate(user._id, {
            verify: true,
            verificationToken: '',
        });

        res.json({
            message: 'Email verify success',
        });
    } catch (error) {
        next(error);
    }
};

const resendEmail = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            throw HttpError(404);
        }
        if (user.verify) {
            throw HttpError(400, 'Verification has already been passed');
        }

        await MailService.sendActivationMail(
            email,
            `${process.env.API_URL}:${process.env.PORT}${process.env.API_PREFIX}/users/verify/${user.verificationToken}`
        );

        res.json({
            message: 'Email send success',
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

const resizeImage = async (filename, width, height) => {
    try {
        const file = await jimp.read(filename);

        await file.resize(width, height).writeAsync(filename);
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const updateAvatar = async (req, res, next) => {
    try {
        const { _id } = req.user;
        const { path: tempUpload, filename } = req.file;
        await resizeImage(tempUpload, 250, 250);
        const avatarName = `${_id}_${filename}`;
        const resultUpload = path.join(avatarsDir, avatarName);

        await fs.rename(tempUpload, resultUpload);

        const avatarUrl = path.join('avatars', avatarName);

        await authServices.updateUser(_id, { avatarUrl });

        res.json({ avatarUrl });
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
    updateAvatar,
    verify,
    resendEmail,
};
