const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');

const authController = {

    // @desc        Register User
    // @route       POST /api/v1/auth/register
    // @access      Public
    register: asyncHandler(async (req, res, next) => {
        const { name, email, password, role } = req.body;
        const user = await User.create({
            name, email, role, password
        });

        sendTokenResponse(user, 200, res);
    }),

    // @desc        Login User
    // @route       POST /api/v1/auth/login
    // @access      Public
    login: asyncHandler(async (req, res, next) => {
        const { email, password } = req.body;
        
        // Validate email and password
        if(!email || !password){
            return next(new ErrorResponse(`Please provide an email and password`, 400));
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if(!user){
            return next(new ErrorResponse(`Invalid credentials`, 401));
        }

        // check if password matches
        const result = await user.matchPassword(password);

        if(!result){
            return next(new ErrorResponse(`Invalid credentials`, 401));
        }

        sendTokenResponse(user, 200, res);
    }),

    // @desc        Get current logged in user
    // @route       POST /api/v1/auth/me
    // @access      Private
    getMe: asyncHandler(async (req, res, next) => {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: user
        })
    })

}

// Get token from model and create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    }

    if(process.env.NODE_ENV === 'production'){
        options.secure = true;
    }

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token
        })
}

module.exports = authController;