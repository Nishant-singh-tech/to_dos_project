const router = require('express').Router();
const { isValidObjectId } = require('mongoose');
const c = require('../controllers/tasks.controller');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { asyncHandler: h } = require('../middleware/error');
const { createTaskSchema, updateTaskSchema, reorderSchema } = require('../schemas');

router.use(auth); // every task route requires a logged-in user

router.param('id', (req, res, next, id) =>
  isValidObjectId(id) ? next() : res.status(400).json({ error: 'Invalid task id' })
);

router.get('/', h(c.list));
router.post('/', validate(createTaskSchema), h(c.create));

// Fixed paths must come before '/:id'
router.put('/reorder', validate(reorderSchema), h(c.reorder));
router.post('/complete-all', h(c.completeAll));
router.delete('/completed', h(c.clearCompleted));

router.patch('/:id', validate(updateTaskSchema), h(c.update));
router.delete('/:id', h(c.remove));

module.exports = router;
