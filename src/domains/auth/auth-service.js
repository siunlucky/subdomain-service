import BaseError from "../../base_classes/base-error.js";
import User from "../../models/user.js";
import { generateVerifEmail } from "../../utils/bodyEmail.js";
import generateToken from "../../utils/generateToken.js";
import sendEmail from "../../utils/sendEmail.js";
import { parseJWT } from "../../utils/parseToken.js";
import joi from "joi";

class AuthService {
    async login(username, password) {
        let user = await User.findOne({
            username
        });

        if (!user) {
            user = await User.findOne({
                email: username
            });

            if (!user) {
                throw BaseError.badRequest("Invalid credentials");
            }
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            throw BaseError.badRequest("Invalid credentials");
        }

        

        if (!user.verifiedAt){
            const token = generateToken(user._id, "5m");
            const verificationLink = `${process.env.BE_URL}/api/v1/auth/verify/${token}`;
            const emailHtml = generateVerifEmail(verificationLink);

            sendEmail(
                user.email,
                "Verifikasi Email dari Hiji: Omni Ads Channel",
                "Terima kasih telah mendaftar di Hiji: Omni Ads Channel! Untuk melanjutkan, silakan verifikasi email Anda dengan mengklik tautan berikut:",
                emailHtml
            );

            throw BaseError.badRequest("Email not verified, Please check your email to verify your account.");
        }

        const token = generateToken(user._id, "30d");

        return token;
    }

    async register(data) {
        const usernameExist = await User.findOne({
            username: data.username
        });

        const emailExist = await User.findOne({
            email: data.email
        })

        const phoneExist = await User.findOne({
            phone_number: data.phone_number
        })

        if (usernameExist || emailExist || phoneExist) {
            let validation = "";
            let stack = [];

            if (usernameExist) {
                validation = "Username already taken.";

                stack.push({
                    message: "Username already taken.",
                    path: ["username"]
                });
            }

            if (emailExist) {
                validation += "Email already taken.";

                stack.push({
                    message: "Email already taken.",
                    path: ["email"]
                });
            }

            if (phoneExist) {
                validation += "Phone number already taken.";

                stack.push({
                    message: "Phone number already taken.",
                    path: ["phone_number"]
                });
            }

            throw new joi.ValidationError(validation, stack);
        }

        const user = new User(data);
        
        const createdUser = await user.save();
        
        if (!createdUser) {
            throw Error("Failed to register");
        }

        const token = generateToken(createdUser._id, "5m");
        const verificationLink = `${process.env.BE_URL}/api/v1/auth/verify/${token}`;
        const emailHtml = generateVerifEmail(verificationLink);

        sendEmail(
            createdUser.email,
            "Verifikasi Email dari Hiji: Omni Ads Channel",
            "Terima kasih telah mendaftar di Hiji: Omni Ads Channel! Untuk melanjutkan, silakan verifikasi email Anda dengan mengklik tautan berikut:",
            emailHtml
        );

        return {message: "User registered successfully. Please check your email to verify your account."};
    }

    async verify(token) {
        const userId = parseJWT(token);

        console.log(userId)

        if (!userId) {
            return { status: 400, message: "Invalid token" };
        }

        const user = await User.findById(userId.id);

        if (!user) {
            return { status: 400, message: "Not Found" }
        }

        if (user.verifiedAt){
            return { status: 400, message: "Email already verified" };
        }

        user.verifiedAt = Date.now();
        await user.save();

        return { status: 200, message: "Email verified successfully" };
    }

    async getProfile(id) {
        const user = await User.findById(id, { password: 0 });

        if (!user) {
            throw BaseError.notFound("User not found");
        }

        return user;
    }

    async updateProfile(id, data) {
        const user = await User.findById(id);

        if (!user) {
            throw BaseError.notFound("User not found");
        }

        const updatedUser = await User
            .findByIdAndUpdate(
                id,
                data,
                {
                    new: true,
                    runValidators: true
                }
            );

        return updatedUser;
    }
}

export default new AuthService();