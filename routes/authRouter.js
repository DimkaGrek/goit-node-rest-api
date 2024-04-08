import express from 'express';
import authController from '../controllers/authController.js';
import { userSingSchema, userSubscription } from '../schemas/usersSchema.js';
import validateBody from '../helpers/validateBody.js';
import authenticate from '../middlewares/authenticate.js';
import upload from '../middlewares/upload.js';

const authRouter = express.Router();

// sign up
authRouter.post(
    '/register',
    validateBody(userSingSchema),
    authController.signup
);

// sign in
authRouter.post('/login', validateBody(userSingSchema), authController.signin);

authRouter.get('/current', authenticate, authController.getCurrent);
authRouter.post('/logout', authenticate, authController.signout);
authRouter.patch(
    '',
    validateBody(userSubscription),
    authenticate,
    authController.updateUserSubscription
);
authRouter.patch(
    '/avatars',
    authenticate,
    upload.single('avatar'),
    authController.updateAvatar
);

export default authRouter;
