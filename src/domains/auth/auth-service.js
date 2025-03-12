import BaseError from "../../base_classes/base-error.js";
import User from "../../models/user.js";
import { generateVerifEmail } from "../../utils/bodyEmail.js";
import generateToken from "../../utils/generateToken.js";
import sendEmail from "../../utils/sendEmail.js";
import { parseJWT } from "../../utils/parseToken.js";

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

        const token = await generateToken(user._id);

        if (!user.verifiedAt){
            const verificationLink = `${process.env.BE_URL}/api/v1/auth/verify/${token}`;
            const emailHtml = generateVerifEmail(verificationLink);

            await sendEmail(
                user.email,
                "Verifikasi Email dari Hiji: Omni Ads Channel",
                "Terima kasih telah mendaftar di Hiji: Omni Ads Channel! Untuk melanjutkan, silakan verifikasi email Anda dengan mengklik tautan berikut:",
                emailHtml
            );

            throw BaseError.badRequest("Email not verified, Please check your email to verify your account.");
        }

        // const token = await generateToken(user._id);

        return token;
    }

    async register(data) {
        let user = await User.findOne({
            username: data.username
        });

        if (user) {
            throw BaseError.badRequest("Username already exists");
        }

        user = await User.findOne({
            email: data.email
        });

        if (user) {
            throw BaseError.badRequest("Email already exists");
        }

        user = await User.findOne({
            phone_number: data.phone_number
        })

        if (user) {
            throw BaseError.badRequest("Phone Number already exists")
        }

        user = new User(data);
        
        const createdUser = await user.save();
        
        if (!createdUser) {
            throw Error("Failed to register");
        }

        const token = await generateToken(createdUser._id);
        const verificationLink = `${process.env.BE_URL}/api/v1/auth/verify/${token}`;
        const emailHtml = generateVerifEmail(verificationLink);

        await sendEmail(
            createdUser.email,
            "Verifikasi Email dari Hiji: Omni Ads Channel",
            "Terima kasih telah mendaftar di Hiji: Omni Ads Channel! Untuk melanjutkan, silakan verifikasi email Anda dengan mengklik tautan berikut:",
            emailHtml
        );

        return {message: "User registered successfully. Please check your email to verify your account."};
    }

    async verify(token) {
        const userId = parseJWT(token);

        if (!userId) {
            throw BaseError.badRequest("Invalid token");
        }

        const user = await User.findById(userId.id);

        if (user.verifiedAt){
            return {status: 400}
        }

        if (!user) {
            return "User not found";
        }

        user.verifiedAt = Date.now();
        await user.save();

        return { message: "Email verified successfully" };
    }
}

export default new AuthService();