const { Schema, model } = require('mongoose');

const taskSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    notes: { type: String, default: '', maxlength: 1000 },
    priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    due: { type: String, default: '' }, // YYYY-MM-DD
    tags: { type: [String], default: [] },
    recurrence: { type: String, enum: ['none', 'daily', 'weekly', 'monthly'], default: 'none' },
    done: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    order: { type: Number, default: 0 }, // manual drag-and-drop position
  },
  { timestamps: true }
);

taskSchema.index({ user: 1, order: 1 });

taskSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.user;
    return ret;
  },
});

module.exports = model('Task', taskSchema);
