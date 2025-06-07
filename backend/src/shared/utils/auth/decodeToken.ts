import jwt from "jsonwebtoken";
import { UserPayload } from "../../types/user";

export const DecodeToken = (token: string) => {
    return jwt.verify(token, process.env.PAYLOAD_SECRET!) as UserPayload;
};