import mongoose, { Document, Model, Schema } from "mongoose";
import { IProductAssignment } from "./productAssignmentModel";

export interface IEmployee extends Document {
  empId: string;
  name: string;
  email?: string;
  department?: string;
  position?: string;
  assignments?: mongoose.Types.ObjectId[] | IProductAssignment[];
}

interface IEmployeeModel extends Model<IEmployee> {
  isEmpIdTaken(empId: string): Promise<boolean>;
}

const employeeSchema = new Schema<IEmployee, IEmployeeModel>(
  {
    empId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 50,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 100,
    },
    department: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    position: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    assignments: [
      {
        type: Schema.Types.ObjectId,
        ref: "ProductAssignment",
      },
    ],
  },
  {
    timestamps: true,
  }
);

employeeSchema.statics.isEmpIdTaken = async function (empId: string) {
  const employee = await this.findOne({ empId });
  return !!employee;
};

const Employee = mongoose.model<IEmployee, IEmployeeModel>(
  "Employee",
  employeeSchema
);

export default Employee;
