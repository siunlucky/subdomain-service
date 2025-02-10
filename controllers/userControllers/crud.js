const UserModel = require("../../models/userModels/user");
const mongoose = require('mongoose');
const { errorLogs } = require('../../utils/logging');


exports.createUser = async (req, res) => {
    try {
        const { nama, username, password, isActive, token, status, role } = req.body;
        const newUser = new UserModel({
            nama,
            username,
            password,
            isActive,
            token,
            status,
            role
        });
        await newUser.save();
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        errorLogs(error.message, req, res);
        console.log(error);
        res.status(400).json({ message: error.message });
    }
};

exports.getAllUser = async (req, res) => { // with pagination
    try {
        const { page = 1, limit = 10 } = req.query;
        const users = await UserModel.find()
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
        const count = await UserModel.countDocuments();
        res.status(200).json({
            users,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        errorLogs(error.message, req, res);
        console.log(error);
        res.status(400).json({ message: error.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await UserModel.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        errorLogs(error.message, req, res);
        console.log(error);
        res.status(400).json({ message: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama, username, password, isActive, token, status, role } = req.body;
        const user = await UserModel.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.nama = nama;
        user.username = username || user.username;
        user.password = password || user.password;
        user.isActive = isActive || user.isActive;
        user.token = token || user.token;
        user.status = status || user.status;
        user.role = role || user.role;
        await user.save();
        res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
        errorLogs(error.message, req, res);
        console.log(error);
        res.status(400).json({ message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await UserModel.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        await user.remove();
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        errorLogs(error.message, req, res);
        console.log(error);
        res.status(400).json({ message: error.message });
    }
};
