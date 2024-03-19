import { mongoose } from "mongoose";
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
  watchHistory: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Video'
    }
  ],
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

userSchema.methods.isPasswordCorrect = async function (password) {
  return await becrypt.compare(password, this.password);
};

userSchema.methods.createAccessToken = function () {
  return jwt.sign(
    {
      userId: this._id,
      email: this.email,
      username: this.username
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  );
};

userSchema.methods.createRefreshToken = function () {
  return jwt.sign(
    {
      userId: this._id
    }
    ,
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  );

}

export const User = mongoose.model('User', userSchema);