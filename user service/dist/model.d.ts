import mongoose, { Document } from "mongoose";
interface IUser extends Document {
    name: String;
    email: string;
    password: string;
    role: string;
    playlist: string[];
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUser>;
export {};
//# sourceMappingURL=model.d.ts.map