import Joi from "joi";

const loginSchema = Joi.object({
    username : Joi.string().required(),
    password : Joi.string().required()
});

const registerSchema = Joi.object({
    name : Joi.string().required(),
    username : Joi.string().required(),
    email : Joi.string().email().required(),
    password : Joi.string().required(),
    phone_number : Joi.string().required(),
})

export { loginSchema, registerSchema };