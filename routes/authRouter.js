import express from 'express';
import authController from '../controllers/authController.js';
import { userSingSchema, userSubscription } from '../schemas/usersSchema.js';
import validateBody from '../helpers/validateBody.js';
import authenticate from '../middlewares/authenticate.js';

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

export default authRouter;
