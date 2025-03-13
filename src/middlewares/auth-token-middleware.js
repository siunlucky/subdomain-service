import statusCodes from '../errors/status-codes.js';
import BaseError from '../base_classes/base-error.js';
import jwt from 'jsonwebtoken';

const authToken = (req, res, next) => {
   const authHeader = req.get('Authorization');

   const token = authHeader && authHeader.split(' ')[1];

   if (token == null)
        throw new BaseError(
            401,
            statusCodes.UNAUTHORIZED.message,
            'UNAUTHORIZED',
            'User Have Not Login',
        );

   jwt.verify(
        token,
        process.env.JWT_SECRET || '',
        (err, user) => {
            if (err) {
                console.log(err.message)
                if (err.message == 'invalid signature') {
                    throw new BaseError(
                        403,
                        statusCodes.FORBIDDEN.message,
                        'FORBIDDEN',
                        'Invalid Signature',
                    );
                } else if (err.message == 'invalid token') {
                    throw new BaseError(
                        403,
                        statusCodes.FORBIDDEN.message,
                        'FORBIDDEN',
                        'Invalid Token',
                    );
                } else if (err.message == 'jwt expired') {
                    throw new BaseError(
                        403,
                        statusCodes.FORBIDDEN.message,
                        'FORBIDDEN',
                        "Token Expired"
                    );
                } else {
                    throw new BaseError(
                        403,
                        statusCodes.FORBIDDEN.message,
                        'FORBIDDEN',
                        'Token Is Invalid Or No Longer Valid',
                    );
                }
            }

            req.app.locals.user = user;

            return next();
        },
    );
};

export default authToken;