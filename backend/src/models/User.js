const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  transform: (doc, ret) => ({ id: ret._id.toString(), name: ret.name, email: ret.email }),
});

module.exports = model('User', userSchema);
