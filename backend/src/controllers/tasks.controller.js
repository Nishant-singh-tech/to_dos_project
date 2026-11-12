const Task = require('../models/Task');
const { nextDue } = require('../utils/recurrence');

const mine = (req) => ({ user: req.userId });
const dedupe = (tags) => [...new Set(tags)];

// New tasks go to the top of the manual order.
async function topOrder(req) {
  const first = await Task.findOne(mine(req)).sort({ order: 1 }).select('order');
  return first ? first.order - 1 : 0;
}

exports.list = async (req, res) => {
  res.json(await Task.find(mine(req)).sort({ order: 1, createdAt: -1 }));
};

exports.create = async (req, res) => {
  const body = { ...req.body };
  if (body.tags) body.tags = dedupe(body.tags);
  if (body.done) body.completedAt = new Date();
  const task = await Task.create({ ...body, user: req.userId, order: await topOrder(req) });
  res.status(201).json(task);
};

exports.update = async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, ...mine(req) });
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const wasDone = task.done;
  const patch = { ...req.body };
  if (patch.tags) patch.tags = dedupe(patch.tags);
  task.set(patch);
  if (patch.done !== undefined && patch.done !== wasDone) task.completedAt = patch.done ? new Date() : null;
  await task.save();

  // Completing a recurring task creates the next occurrence.
  let next = null;
  if (!wasDone && task.done && task.recurrence !== 'none') {
    next = await Task.create({
      user: req.userId,
      title: task.title,
      notes: task.notes,
      priority: task.priority,
      tags: task.tags,
      recurrence: task.recurrence,
      due: nextDue(task.due, task.recurrence),
      order: await topOrder(req),
    });
  }
  res.json({ task, next });
};

exports.remove = async (req, res) => {
  const { deletedCount } = await Task.deleteOne({ _id: req.params.id, ...mine(req) });
  if (!deletedCount) return res.status(404).json({ error: 'Task not found' });
  res.json({ ok: true });
};

exports.reorder = async (req, res) => {
  const ops = req.body.ids.map((id, i) => ({
    updateOne: { filter: { _id: id, ...mine(req) }, update: { $set: { order: i } } },
  }));
  if (ops.length) await Task.bulkWrite(ops);
  res.json({ ok: true });
};

exports.completeAll = async (req, res) => {
  await Task.updateMany({ ...mine(req), done: false }, { $set: { done: true, completedAt: new Date() } });
  res.json({ ok: true });
};

exports.clearCompleted = async (req, res) => {
  await Task.deleteMany({ ...mine(req), done: true });
  res.json({ ok: true });
};
