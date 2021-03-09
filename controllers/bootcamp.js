const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const path = require('path');

const bootcampController = {
    
    // @desc        Get all bootcamps
    // @route       GET /api/v1/bootcamps/
    // @access      Public
    getBootcamps : asyncHandler(async (req, res, next) => {
        res.status(200).json(res.advancedResult);
    }),

    // @desc        Get single bootcamp
    // @route       GET /api/v1/bootcamps/:id
    // @access      Public
    getBootcamp : asyncHandler(async (req, res, next) => {
        const bootcamp = await Bootcamp.findById(req.params.id);

        if(!bootcamp){
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
        }

        res.status(200).json({
            success: true,
            data: bootcamp
        });
    
    }),

    // @desc        Create single bootcamp
    // @route       POST /api/v1/bootcamps/
    // @access      Private
    createBootcamp : asyncHandler(async (req, res, next) => {
        // Add user to body
        req.body.user = req.user.id;

        // Check for published bootcamp
        const publishedBootcamp = await Bootcamp.findOne({user: req.user.id});

        // If user is not admin they can only add one bootcamp
        if(publishedBootcamp && req.user.role !== 'admin'){
            return next(new ErrorResponse(`The user with id ${req.user.id} has already published a bootcamp`, 400));
        }

        const bootcamp = await Bootcamp.create(req.body);
        res.status(200).json({
            success: true,
            data: bootcamp
        });
    }),

    // @desc        Update single bootcamp
    // @route       PUT /api/v1/bootcamps/:id
    // @access      Private
    updateBootcamp : asyncHandler(async (req, res, next) => {
        let bootcamp = await Bootcamp.findById(req.params.id)

        if(!bootcamp){
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
        }

        // Make sure user is bootcamp owner
        if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this bootcamp`, 401));
        }

        bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })

        res.status(200).json({ 
            success: true, 
            data: bootcamp 
        });
        
    }),

    // @desc        Delete single bootcamp
    // @route       DELETE /api/v1/bootcamps/:id
    // @access      Private
    deleteBootcamp : asyncHandler(async (req, res, next) => {
        const bootcamp = await Bootcamp.findById(req.params.id)

        if(!bootcamp){
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
        }

        // Make sure user is bootcamp owner
        if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this bootcamp`, 401));
        }

        bootcamp.remove();

        res.status(200).json({ 
            success: true, 
            data: {} 
        });
    }),

    // @desc        Get bootcamps within a radius
    // @route       GET /api/v1/bootcamps/radius/:zipcode/:distance
    // @access      Public
    getBootcampInRadius : asyncHandler(async (req, res, next) => {
        const { zipcode, distance } = req.params;
        
        // Get lat/lng from geocoder
        const loc = await geocoder.geocode(zipcode);
        const lat = loc[0].latitude;
        const lng = loc[0].longitude;

        // Calc radius using radians
        // Divide distance by radius of earth
        // Earth radius = 3,963 mi / 6,378 km
        const radius = distance / 6378;
        const bootcamps = await Bootcamp.find({
            location: {
                $geoWithin: {
                    $centerSphere: [[lng, lat], radius]
                }
            }
        })

        res.status(200).json({
            success: true,
            count: bootcamps.length,
            data: bootcamps
        })
    }),

    // @desc        Upload photo fo bootcamp
    // @route       PUT /api/v1/bootcamps/:id/photo
    // @access      Private
    uploadBootcampImage : asyncHandler(async (req, res, next) => {
        const bootcamp = await Bootcamp.findById(req.params.id);

        if(!bootcamp){
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
        }

        // Make sure user is bootcamp owner
        if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this bootcamp`, 401));
        }

        if(!req.files){
            return next(new ErrorResponse(`Please upload a file`, 400));
        }

        const file = req.files.file;

        // Make sure that the image is a photo
        if(!file.mimetype.startsWith('image')){
            return next(new ErrorResponse(`Please upload an image file`, 400));
        }

         if(file.size > process.env.MAX_FILE_SIZE){
            return next(new ErrorResponse(`The image size should be less than 10MB`, 400));
         }

         file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

         file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
            if(err){
                console.log(err);
                return next(new ErrorResponse('Problem with file upload', 500))
            }

            let result = await Bootcamp.findByIdAndUpdate(req.params.id, {photo: file.name}, {
                new: true
            });

            res.status(200).json({
                success: true,
                data: result
            })
         })
    })

}

module.exports = bootcampController;