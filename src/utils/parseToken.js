import jwt from 'jsonwebtoken';

export function parseJWT(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        console.error('Invalid token:', error.message);
        return null;
    }
}