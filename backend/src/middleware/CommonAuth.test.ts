import { Request, Response, NextFunction } from "express";
import { Authenticate } from "./CommonAuth";
import { ValidateSignature } from "../utility";

jest.mock("../utility", () => ({
  ValidateSignature: jest.fn(),
}));

const mockedValidateSignature = ValidateSignature as jest.Mock;

describe("CommonAuth", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
  });

  test("Should call next() when the user is authorized", async () => {
    mockedValidateSignature.mockResolvedValue(true);

    await Authenticate(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    expect(ValidateSignature).toHaveBeenCalledWith(mockRequest);
    expect(nextFunction).toHaveBeenCalled();
  });

  test("Should return 401 with message: user not authorized", async () => {
    mockedValidateSignature.mockResolvedValue(false);

    await Authenticate(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    expect(ValidateSignature).toHaveBeenCalledWith(mockRequest);
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "user not authorized",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });
});
