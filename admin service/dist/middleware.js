import axios from "axios";
import dotenv from 'dotenv';
dotenv.config();
export const isAuth = async (req, res, next) => {
    try {
        const token = req.headers.token;
        if (!token) {
            res.status(403).json({
                message: "Please Login",
            });
            return;
        }
        ;
        const { data } = await axios.get(`${process.env.User_URL}/api/v1/user/me`, {
            headers: {
                token,
            },
        });
        req.user = data;
        next();
    }
    catch (error) {
        res.status(403).json({
            message: "Please Login",
        });
    }
};
// multer set up
import multer from 'multer';
const storage = multer.memoryStorage();
const upload = multer({ storage });
const uploadFile = (req, res, next) => {
    upload.single("file")(req, res, (err) => {
        if (err) {
            res.status(400).json({ message: err.message });
            return;
        }
        next();
    });
};
export default uploadFile;
//# sourceMappingURL=middleware.js.map