const express = require('express')
const router = express.Router({ mergeParams: true })
const catchAsync = require('../utils/catchAysnc')
const { reviewSchema } = require('../schema')
const ExpressError = require('../utils/ExpressError')
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')
const reviews = require('../controllers/reviews')

//<----- requiring models ----->
const Campground = require('../models/campground')
const Review = require('../models/review')

//<-------- routes ------->
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router