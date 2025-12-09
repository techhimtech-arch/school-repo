const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  register,
  getMyProfile,
  updateMyProfile
} = require('../controllers/user.controller');

// Public route - User registration (only for STUDENT_PARENT)
router.post('/register', register);

// Protected routes - All authenticated users
router.use(verifyToken);

// Get own profile
router.get('/profile', getMyProfile);
router.put('/profile', updateMyProfile);

// Admin only routes - User management
router.use(allowRoles(['SUPER_ADMIN']));

router.get('/', getAllUsers);
router.get('/:user_id', getUserById);
router.post('/', createUser);
router.put('/:user_id', updateUser);
router.delete('/:user_id', deleteUser);

module.exports = router;

