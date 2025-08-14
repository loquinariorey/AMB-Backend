import express from 'express';
const router = express.Router();

// Import default export object from jobController
import jobController from '../controllers/jobController';

// Import auth middlewares
import authMiddleware from '../middleware/authMiddleware';
const { verifyToken, isEmployer, isJobSeeker, isAdmin, isOwner } = authMiddleware;
import validationMiddleware from '../middleware/validationMiddleware';
const { jobValidation, idParamValidation } = validationMiddleware;
import upload from "../middleware/upload_aws";

// Public routes
router.get('/', jobController.getAllJobs);
router.get('/featured', jobController.getFeaturedJobs);
router.get('/recommended', jobController.getTopRecommendedJobs);

// Job recommendations for job seekers
router.get('/recommendations', verifyToken, isJobSeeker, jobController.getRecommendedJobs);
router.get('/favourites', verifyToken, isJobSeeker, jobController.getFavouriteJobs);

// Get job by ID with ID validation
router.get('/:id', idParamValidation, jobController.getJobById);

// Add favourite jobs by JobSeeker
router.post('/favourite', verifyToken, isJobSeeker, jobController.addFavouriteJob);

// Create a job
router.post(
    '/',
    verifyToken,
    // isEmployer,
    upload.fields([
        { name: "staffImages", maxCount: 10 },
        { name: "introImages", maxCount: 10 },
        { name: "thumbnail", maxCount: 1 },
    ]),
    jobValidation,
    jobController.createJob
);


// Update a job
router.put('/:id', verifyToken, upload.fields([
    { name: "staffImages", maxCount: 10 },
    { name: "introImages", maxCount: 10 },
    { name: "thumbnail", maxCount: 1 },
]), jobValidation, jobController.updateJob);

// Delete a job
router.delete('/:id', verifyToken, idParamValidation, jobController.deleteJob);

export default router;
