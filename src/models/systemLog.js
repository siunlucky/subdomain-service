import mongoose from 'mongoose';

const SystemLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: false
    },
    ipAddress: {
        type: String,
        required: true
    },
    device: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true
    },
    method: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
}, { timestamps: true });

const SystemLog = mongoose.model("systemLog", SystemLogSchema);

export default SystemLog;