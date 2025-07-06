import mongoose, { Document, Model } from "mongoose";

export interface IBranch extends Document {
  name: string;
}

interface IBranchModel extends Model<IBranch> {
  isNameTaken(name: string): Promise<boolean>;
}

const branchSchema = new mongoose.Schema<IBranch>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
  },
  {
    timestamps: true,
  }
);

branchSchema.statics.isNameTaken = async function (name: string) {
  const branch = await this.findOne({ name });
  return !!branch;
};

const Branch = mongoose.model<IBranch, IBranchModel>("Branch", branchSchema);

export default Branch;
