import jwt from "jsonwebtoken";
import { AuthPayload } from "../../../../shared/types/user";

export const GenerateAccessToken = (payload: AuthPayload) => {
    return jwt.sign(payload, process.env.PAYLOAD_SECRET!, { expiresIn: "1d" });
  };
  
  export const GenerateRefreshToken = (payload: AuthPayload) => {
    return jwt.sign(payload, process.env.PAYLOAD_SECRET!, { expiresIn: "1d" });
  };
  
