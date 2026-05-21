import type { NextFunction, Request, Response } from "express";
interface IUser {
    _id: string;
    name: String;
    email: string;
    password: string;
    role: string;
    playlist: string[];
}
interface AuthenticatedRequest extends Request {
    user?: IUser | null;
}
export declare const isAuth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
declare const uploadFile: (req: Request, res: Response, next: NextFunction) => void;
export default uploadFile;
//# sourceMappingURL=middleware.d.ts.map