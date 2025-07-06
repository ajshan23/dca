import mongoose, { Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export enum UserRole {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  USER = "user",
}

export interface IUser extends Document {
  username: string;
  passwordHash: string;
  role: UserRole;
  comparePassword(password: string): Promise<boolean>;
  updatePassword(newPassword: string): Promise<void>;
  hasRole(role: UserRole): boolean;
  hasAnyRole(roles: UserRole[]): boolean;
}

interface IUserModel extends Model<IUser> {
  isUsernameTaken(username: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
      match: /^[a-zA-Z0-9_]+$/,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.passwordHash;
        return ret;
      },
    },
  }
);

// Static methods
userSchema.statics.isUsernameTaken = async function (username: string) {
  const user = await this.findOne({ username });
  return !!user;
};

// Instance methods
userSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.updatePassword = async function (newPassword: string) {
  this.passwordHash = await bcrypt.hash(newPassword, 12);
  await this.save();
};

userSchema.methods.hasRole = function (role: UserRole) {
  return this.role === role;
};

userSchema.methods.hasAnyRole = function (roles: UserRole[]) {
  return roles.includes(this.role);
};

const User = mongoose.model<IUser, IUserModel>("User", userSchema);

export default User;
