const userController = require('../../controllers/userControllers/crud');
const router = require('express').Router();

router.post('/create', userController.createUser);
// http://localhost:3876/api/users/create

router.get('/all', userController.getAllUser);
// http://localhost:3876/api/users/all

router.get('/:id', userController.getUserById);
// http://localhost:3876/api/users/612f7b1b4b3e0b0015f3b3b1

router.put('/update/:id', userController.updateUser);
// http://localhost:3876/api/users/update/612f7b1b4b3e0b0015f3b3b1

router.delete('/delete/:id', userController.deleteUser);
// http://localhost:3876/api/users/delete/612f7b1b4b3e0b0015f3b3b1

module.exports = router;
