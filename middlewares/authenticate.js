import HttpError from '../helpers/HttpError.js';
import authServices from '../services/authServices.js';
import jwt from 'jsonwebtoken';

const { JWT_SECRET } = process.env;

const authenticate = async (req, _, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return next(HttpError(401, 'Authorization header not found'));
    }

    const [bearer, token] = authorization.split(' ');

    if (bearer !== 'Bearer') {
        return next(HttpError(401, 'Bearer not found'));
    }

    try {
        const { id } = jwt.verify(token, JWT_SECRET);
        const user = await authServices.findUser({ _id: id });

        if (!user) {
            return next(HttpError(401, 'Not authorized'));
        }

        if (user.token !== token) {
            return next(HttpError(401, 'Not authorized'));
        }

        req.user = user;
        next();
    } catch (error) {
        next(HttpError(401, 'Not authorized'));
    }
};

export default authenticate;
