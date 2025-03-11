import BaseError from "../../base_classes/base-error.js";
import User from "../../models/user.js";
import generateToken from "../../utils/generateToken.js";

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

        const isMatch = await User.matchPassword(password);

        if (!isMatch) {
            throw BaseError.badRequest("Invalid credentials");
        }

        const token = await generateToken(user._id);

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

        user = new User(data);

        await user.save();

        if (!user) {
            throw Error("Failed to register");
        }

        return user;
    }
}

export default new AuthService();