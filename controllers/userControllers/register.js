
const UserModel = require("../../models/userModels/user");
const { generateToken } = require("../../utils/generateToken");
const { errorLogs } = require('../../utils/logging');
const { generateVerifEmail } = require('../../utils/bodyEmail');
const { sendEmail } = require('../../utils/sendEmail');


exports.registerUser = async (req, res) => {
    const { username, email, password, nomor, language } = req.body;

    try {
        let user = await User.findOne({ username });

        if (user) {
            return res.status(400).json({
                message:
                    language === "id"
                        ? "Nama pengguna sudah digunakan "
                        : "Username already exists"
            });
        }

        user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({
                message:
                    language === "id" ? "Email sudah digunakan" : "Email already exists"
            });
        }

        user = await User.findOne({ nomor });

        if (user) {
            return res.status(400).json({
                message:
                    language === "id"
                        ? "Nomor WhatsApp sudah digunakan"
                        : "Phone number already exists"
            });
        }

        user = new User({ username, email, password, nomor });

        const createdUser = await user.save();
        const token = generateToken(createdUser._id);
        const verificationUrl = `${process.env.BE_URL}be/api/auth/verify/${token}`;
        const emailHtml = generateVerifEmail(verificationUrl);

        await sendEmail(
            createdUser.email,
            "Verifikasi Email dari Premium Portal",
            "Terima kasih telah mendaftar di Premium Portal! Untuk melanjutkan, silakan verifikasi email Anda dengan mengklik tautan berikut:",
            emailHtml
        );

        res.status(201).json({
            message:
                "User registered successfully. Please check your email to verify your account."
        });
    } catch (error) {
        console.log(error);
        errorLogs(req, res, error.message);
        res.status(500).json({ message: "Server error" });
    }
};
