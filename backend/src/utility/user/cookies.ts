import { Response } from "express";

export const setRefreshTokenCookie = (res: Response, token: string) => {
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });
};
  

export const clearRefreshTokenCookie = (res: Response) => {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
};