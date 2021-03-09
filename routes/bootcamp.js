const express = require('express');
const {
    getBootcamp,
    getBootcamps,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampInRadius,
    uploadBootcampImage
} = require('../controllers/bootcamp');
const router = express.Router();

// Include other resource router
const courseRouter = require('./course');
const { protect, authorize } = require('../middleware/auth');

const Bootcamp = require('../models/Bootcamp');
const advanceResult = require('../middleware/advanceResult');

// Reroute into other resource router
router.use('/:bootcampId/courses', courseRouter);

router.route('/')
.get(advanceResult(Bootcamp, 'courses'), getBootcamps)
.post(protect, authorize('publisher', 'admin'), createBootcamp);

router.route('/:id')
.get(getBootcamp)
.put(protect, authorize('publisher', 'admin'), updateBootcamp)
.delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

router.route('/radius/:zipcode/:distance')
.get(getBootcampInRadius);

router.route('/:id/photo')
    .put(protect, authorize('publisher', 'admin'), uploadBootcampImage);

module.exports = router;