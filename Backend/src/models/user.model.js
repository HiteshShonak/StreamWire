import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import { jwtService } from "../services/auth.service.js";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: 3,
      lowercase: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        "Please fill a valid email address",
      ],
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
    avatar: {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    coverImage: {
      url: { type: String },
      public_id: { type: String },
    },
    // --- 📺 Content Consumption ---
    // (watchHistory, watchLater, and likes are now handled via separate Models)
    feedPreferences: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 20;
        },
        message: 'Feed preferences cannot contain more than 20 tags'
      }
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    refreshTokens: [
      {
        token: { type: String, required: true },
        createdAt: { type: Date, default: Date.now, expires: "30d" },
      },
    ],
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
    // --- ⚙️ StreamWire Status Management ---
    accountStatus: {
      type: String,
      enum: ["ACTIVE", "DEACTIVATED", "DELETED_PENDING", "BANNED"],
      default: "ACTIVE",
    },
    // --- 🛡️ Identity & Privacy Engine ---
    isProfilePublic: {
      type: Boolean,
      default: true, // Controls library tab visibility (Likes, Playlists)
    },
    isIdentityCloaked: {
      type: Boolean,
      default: false, // The "Global Switch" for retroactive anonymity
    },
  },
  { timestamps: true }
);

// --- 🔎 SEARCH ENGINE INDEX ---
userSchema.index(
  { username: "text", fullName: "text" },
  { weights: { username: 10, fullName: 5 }, name: "UserSearchIndex" }
);

// --- 🔐 MIDDLEWARE ---
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// --- 🛠️ INSTANCE METHODS ---
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwtService.generateAccessToken(this);
};

userSchema.methods.generateRefreshToken = function () {
  return jwtService.generateRefreshToken(this._id);
};

userSchema.methods.addRefreshToken = async function (newToken) {
  if (this.refreshTokens.length >= 5) {
    this.refreshTokens.shift();
  }
  this.refreshTokens.push({ token: newToken });
  await this.save({ validateBeforeSave: false });
};

userSchema.plugin(mongooseAggregatePaginate);

export const User = mongoose.model("User", userSchema);