const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');
const { Op } = require("sequelize");
const { check, validationResult } = require('express-validator/check');

const { sequelize, models } = require('../db');

/* Handler function to wrap each route. */
function asyncHandler(cb){
    return async(req, res, next) => {
        try {
            await cb(req, res, next)
        } catch(error){
            res.status(500).send(error);
        }
    }
}

// Get references to the models.
const { User, Course } = models;

/**
 * Middleware to authenticate the request using Basic Authentication.
 * @param {Request} req - The Express Request object.
 * @param {Response} res - The Express Response object.
 * @param {Function} next - The function to call to pass execution to the next middleware.
 */
const authenticateUser = asyncHandler(async(req, res, next) => {
    let message = null;

    // Get the user's credentials from the Authorization header.
    const credentials = auth(req);

    if (credentials) {
        // Look for a user whose `emailAddress` matches the credentials `name` property.
        const user = await User.findOne({
            where: {
                emailAddress: credentials.name
            }
        });

        if (user) {
            const authenticated = bcryptjs
                .compareSync(credentials.pass, user.password);
            if (authenticated) {

                // Store the user on the Request object.
                req.currentUser = user;
            } else {
                message = `Authentication failure for username: ${user.emailAddress}`;
            }
        } else {
            message = `User not found for username: ${credentials.name}`;
        }
    } else {
        message = 'Auth header not found';
    }

    if (message) {
        console.warn(message);
        res.status(401).json({ message: 'Access Denied' });
    } else {
        next();
    }
});


//User routes:

/*
    Route that returns the current authenticated user. 
    Bonus 3: Excludes createdAt, updatedAt.
*/
router.get('/users', authenticateUser, (req, res) => {
    const { id, firstName, lastName, emailAddress } = req.currentUser;
  
    res.json({
        id, 
        firstName, 
        lastName, 
        emailAddress 
    });
});

/* 
    Route that creates a new user.
    Bonus 1: Checks that email address is valid 
    and checks that email does not already exist in db.
*/
router.post('/users', [
    check('firstName')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please provide a value for "firstName"'),
    check('lastName')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please provide a value for "lastName"'),
    check('password')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please provide a value for "password"'),
    check('emailAddress')
        .exists({ checkNull: true, checkFalsy: true })
        .isEmail()
        .withMessage('Please provide a value for "emailAddress"'),
], asyncHandler(async(req, res) => {

    // Attempt to get the validation result from the Request object.
    const errors = validationResult(req);

    // If there are validation errors...
    if (!errors.isEmpty()) {
        // Use the Array `map()` method to get a list of error messages.
        const errorMessages = errors.array().map(error => error.msg);

        // Return the validation errors to the client.
        return res.status(400).json({ errors: errorMessages });
    }

    const existingUser = await User.findOne({
        where: {
            emailAddress: req.body.emailAddress.trim()
        }
    });


    if (!existingUser) {

        let { firstName, lastName, emailAddress, password } = req.body;

        password = bcryptjs.hashSync(password);
    
        const userProps = {
            firstName,
            lastName,
            emailAddress,
            password
        }
    
        try {
            const createdUser = await User.create(userProps);
    
            // Set the status to 201 Created and set the Location header to "/".
            if (createdUser) {
                res.status(201).setHeader('Location', '/');
                return res.end();
            }
        } catch (error) {
            throw error;
        }    

    } else {
        return res.status(400).json({ error: 'User already exists' });
    }

}));

//Courses Routes:

/*
    GET /api/courses 200 - Returns a list of courses 
    (including the user that owns each course).
    Bonus 3: Excludes the createdAt, updatedAt properties.
*/
router.get('/courses', asyncHandler(async(req, res) => {
    const courses = await Course.findAll({
        attributes: ['id', 'userId', 'title', 'description', 'estimatedTime', 'materialsNeeded']
    });
    return res.json(courses);
}));

// GET /api/courses/:id 200 - Returns the course (including the user that owns the course) for the provided course ID
router.get('/courses/:id', asyncHandler(async(req, res) => {
    const { id } = req.params;
    const course = await Course.findByPk(id);
    return res.json(course);
}));

// Route that creates a new course.
router.post('/courses', authenticateUser, [
    check('title')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please provide a value for "title"'),
    check('description')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please provide a value for "description"'),
], asyncHandler(async(req, res) => {

    // Attempt to get the validation result from the Request object.
    const errors = validationResult(req);

    // If there are validation errors...
    if (!errors.isEmpty()) {
        // Use the Array `map()` method to get a list of error messages.
        const errorMessages = errors.array().map(error => error.msg);

        // Return the validation errors to the client.
        return res.status(400).json({ errors: errorMessages });
    }

    const existingCourse = await Course.findOne({
        where: {
            title: req.body.title.trim()
        }
    });


    if (!existingCourse) {

        try {
            const createdCourse = await Course.create(req.body);
    
            // Set the status to 201 Created and set the Location header to the URI for the course.
            if (createdCourse) {
                res.status(201).setHeader('Location', `/course/${createdCourse.id}`);
                return res.end();
            }
        } catch (error) {
            throw error;
        }    

    } else {
        return res.status(400).json({ error: `Course with title "${req.body.title}" already exists.` });
    }

}));

/*
    PUT /api/courses/:id 204 - Updates a course and returns no content.
    Bonus 2: Users can only edit their own courses.
*/
router.put('/courses/:id', authenticateUser, [
    check('title')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please provide a value for "title"'),
    check('description')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please provide a value for "description"'),
], asyncHandler(async(req, res) => {

    // Attempt to get the validation result from the Request object.
    const errors = validationResult(req);

    // If there are validation errors...
    if (!errors.isEmpty()) {
        // Use the Array `map()` method to get a list of error messages.
        const errorMessages = errors.array().map(error => error.msg);

        // Return the validation errors to the client.
        return res.status(400).json({ errors: errorMessages });
    }
    
    const { id } = req.params;
    try {
        const foundCourse = await Course.findByPk(id);

        if (foundCourse) {
            if (req.currentUser.id === foundCourse.userId) {
                await Course.update(req.body, {
                    where: {
                        id
                    }
                });
                return res.sendStatus(204);
            } else {
                return res.status(403).json({ error: `Users can only edit their own courses.` });
            }
        } else {
            return res.status(400).json({ error: `Course with id: ${id} not found.` });
        }
    } catch (error) {
        throw error;
    }

}));

/*
    DELETE /api/courses/:id 204 - Deletes a course only for a user who is enrolled in the course.
    Bonus 2: Users can only delete their own courses.
*/
router.delete('/courses/:id', authenticateUser, asyncHandler(async(req, res) => {
    const { id } = req.params;
    const foundCourse = await Course.findByPk(id);
    if (foundCourse) {
        if (req.currentUser.id === foundCourse.userId) {
            await Course.destroy({
                where: {
                    id
                }
            });
            return res.sendStatus(204);
        } else {
            return res.status(403).json({ error: `Users can only delete their own courses.` });
        }
    } else {
        return res.status(400).json({ error: `Course with id: ${id} not found.` });
    }
}));

module.exports = router;