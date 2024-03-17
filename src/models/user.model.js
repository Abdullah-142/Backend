import { Mongoose } from "mongoose";
import { Schema } from "mongoose";
import becrypt from "bcrypt";
import jwt from "jsonwebtoken";


const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  fullname: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    required: true,
  },
  backgroundImage: {
    type: String,
  },
  refreshToken: {
    type: String,
  },

}, {
  timestamps: true,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await becrypt.hash(this.password, 10);
  next();
});

const User = Mongoose.model('User', userSchema);