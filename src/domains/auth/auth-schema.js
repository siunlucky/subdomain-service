import Joi from "joi";

const loginSchema = Joi.object({
    username : Joi.string()
        .required()
        .messages({
            "string.empty": "Username is required."
        }),
    password : Joi.string()
        .required()
        .messages({
            "string.empty": "Password is required."
        })
});

const registerSchema = Joi.object({
    name : Joi.string().required().min(4)
        .messages({
            "string.empty": "Name is required.",
            "string.min": "Name must be at least 4 characters long."
        }),
    username : Joi.string().required().min(4)
        .messages({
            "string.empty": "Username is required."
        }),
    email : Joi.string()
        .email()
        .required()
        .messages({
            "string.empty": "Email is required.",
            "string.email": "Email must be a valid email address."
        }),
    password : Joi.string()
        .required()
        .min(8)
        .pattern(/^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/)
        .messages({
            "string.empty": "Password is required.",
            "string.min": "Password must be at least 8 characters long.",
            "string.pattern.base": "Password must be at least 8 characters long, contain at least 1 uppercase letter, and 1 special character."
        }),
    phone_number : Joi.string()
        .required()
        .pattern(/^[0-9]{10,}$/)
        .messages({
            "string.empty": "Phone number is required.",
            "string.pattern.base": "Phone number must be at least 10 characters long."
        }),
    })

export { loginSchema, registerSchema };