import { Request, Response, NextFunction } from "express";
import { Authenticate } from "./CommonAuth";
import { ValidateSignature } from "../utility";
import { UserNotAuthorisedError } from "../errors";

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
    } as Partial<Response>;
  });

  test("Should call next() when the user is authorised", async () => {
    mockedValidateSignature.mockResolvedValue(true);

    await Authenticate(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    expect(ValidateSignature).toHaveBeenCalledWith(mockRequest);
    expect(nextFunction).toHaveBeenCalled();
  });

  test("Should call next with UserNotAuthorisedError when user not authorised", async () => {
    const error = new UserNotAuthorisedError();
    mockedValidateSignature.mockImplementation(() => {
      throw error;
    });

    await Authenticate(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    expect(ValidateSignature).toHaveBeenCalledWith(mockRequest);
    expect(nextFunction).toHaveBeenCalledWith(error);
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  test.todo(
    "Should call next with MissingOrMalformedAuthorizationHeaderError when missing signature",
  );

  test.todo(
    "Should call next with MissingOrMalformedAuthorizationHeaderError when missing Bearer",
  );
});
