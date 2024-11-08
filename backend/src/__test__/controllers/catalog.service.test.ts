// import { register } from "../index";
//
// describe("test", () => {
//   beforeEach(() => {});
//   afterEach(() => {});
//
//   it("should throw 400 error if id is empty string", async () => {
//     const mReq = { params: { id: "" } };
//     const mRes = {};
//     const mNext = jest.fn();
//     await register(mReq, mRes, mNext);
//     expect(mNext).toBeCalledWith(new Error("invalid."));
//   });
//
// describe("GET /", () => {
//   it('responds with "Welcome to unit testing guide for nodejs, typescript and express!"', async () => {
//     const response = await request(app).get("/");
//
//     expect(response.status).toBe(200);
//     expect(response.text).toBe(
//       "Welcome to unit testing guide for nodejs, typescript and express!"
//     );
//   });
//
//   // it('should retrieve one member by id and send response correctly', async () => {
//   //   const mUserRegister = { id: '1', username: 'KF1' };
//   //   jest.spyOn(MemberService, 'retrieveOneMember').mockResolvedValueOnce(mUserRegister);
//   //   const mReq = { params: { id: '1' } };
//   //   const mRes = { status: jest.fn().mockReturnThis(), send: jest.fn() };
//   //   const mNext = jest.fn();
//   //   await retrieveMember(mReq, mRes, mNext);
//   //   expect(MemberService.retrieveOneMember).toBeCalledWith('1');
//   //   expect(mRes.status).toBeCalledWith(200);
//   //   expect(mRes.send).toBeCalledWith({ member_detail: { id: '1', username: 'KF1' } });
//   // });
//
//   test("example test", () => {
//     const a = 10;
//     expect(a).toEqual(10);
//   });
//
// })
// }

describe("test", () => {
  it("placeholder", () => {
    expect(true).toBe(true)
  })
})
