import express from 'express';
const router = express.Router();
import jobSeekerController from '../controllers/jobSeekerController';
import authMiddleware from '../middleware/authMiddleware';
const { verifyToken, isAdmin, isEmployer, isJobSeeker } = authMiddleware;
import validationMiddleware from '../middleware/validationMiddleware';

// Profile routes
router.get('/profile', verifyToken, isJobSeeker, jobSeekerController.getProfile);
router.put('/:id', verifyToken, isAdmin, jobSeekerController.updateProfile);
router.put('/change-email', verifyToken, isJobSeeker, jobSeekerController.changeEmail);

// Favorite jobs
router.get('/favorite-jobs', verifyToken, isJobSeeker, jobSeekerController.getFavoriteJobs);
router.post('/favorite-jobs', verifyToken, isJobSeeker, jobSeekerController.addFavoriteJob);
router.delete('/favorite-jobs/:id', verifyToken, isJobSeeker, jobSeekerController.removeFavoriteJob);

//Admin
router.get('/', verifyToken, isAdmin, jobSeekerController.getAllJobSeekers);
router.get('/:id', verifyToken, isAdmin, jobSeekerController.getJobSeekerById);
router.delete('/:id', verifyToken, isAdmin, jobSeekerController.deleteJobSeekerById);

export default router;