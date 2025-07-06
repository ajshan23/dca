import mongoose, { Document, Model } from "mongoose";

export interface ICategory extends Document {
  name: string;
  description?: string;
}

interface ICategoryModel extends Model<ICategory> {
  isNameTaken(name: string): Promise<boolean>;
}

const categorySchema = new mongoose.Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.statics.isNameTaken = async function (name: string) {
  const category = await this.findOne({ name });
  return !!category;
};

const Category = mongoose.model<ICategory, ICategoryModel>(
  "Category",
  categorySchema
);

export default Category;
