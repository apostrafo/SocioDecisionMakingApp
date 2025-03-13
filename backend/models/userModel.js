const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Prašome įvesti vardą'],
    },
    email: {
      type: String,
      required: [true, 'Prašome įvesti el. paštą'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Prašome įvesti galiojantį el. paštą',
      ],
    },
    password: {
      type: String,
      required: [true, 'Prašome įvesti slaptažodį'],
      minlength: [6, 'Slaptažodis turi būti bent 6 simbolių ilgio'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

// Slaptažodžio šifravimas prieš išsaugojimą
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Slaptažodžio lyginimo metodas
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User; 