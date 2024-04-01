import Joi from 'joi';

export const userSingSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

export const userSubscription = Joi.object({
    subscription: Joi.string().valid('starter', 'pro', 'business').required(),
});
