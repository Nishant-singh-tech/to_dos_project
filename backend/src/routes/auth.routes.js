const router = require('express').Router();
const c = require('../controllers/auth.controller');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { asyncHandler: h } = require('../middleware/error');
const { registerSchema, loginSchema } = require('../schemas');

router.post('/register', validate(registerSchema), h(c.register));
router.post('/login', validate(loginSchema), h(c.login));
router.get('/me', auth, h(c.me));

module.exports = router;
