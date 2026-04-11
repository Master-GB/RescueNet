import { jest } from "@jest/globals";
import { normalizeCampaignBody } from "../../../middleware/normalizeCampaignBody.js";

const makeRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe("normalizeCampaignBody middleware", () => {
  test("parses bankDetails JSON string into object", () => {
    const req = {
      body: {
        bankDetails:
          '{"accountName":"A","accountNumber":"1","bankName":"B","branchName":"C"}',
      },
    };
    const res = makeRes();
    const next = jest.fn();

    normalizeCampaignBody(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.body.bankDetails).toEqual({
      accountName: "A",
      accountNumber: "1",
      bankName: "B",
      branchName: "C",
    });
  });

  test("parses acceptedItems JSON array string", () => {
    const req = { body: { acceptedItems: '["Food","Water"]' } };
    const res = makeRes();
    const next = jest.fn();

    normalizeCampaignBody(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.body.acceptedItems).toEqual(["Food", "Water"]);
  });

  test("parses acceptedItems comma-separated string", () => {
    const req = { body: { acceptedItems: "Food, Water,  Medicine " } };
    const res = makeRes();
    const next = jest.fn();

    normalizeCampaignBody(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.body.acceptedItems).toEqual(["Food", "Water", "Medicine"]);
  });

  test("normalizes bankDetails from dotted multipart fields", () => {
    const req = {
      body: {
        "bankDetails.accountName": "RescueNet",
        "bankDetails.accountNumber": "12345",
        "bankDetails.bankName": "BOC",
        "bankDetails.branchName": "Colombo",
      },
    };
    const res = makeRes();
    const next = jest.fn();

    normalizeCampaignBody(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.body.bankDetails).toEqual({
      accountName: "RescueNet",
      accountNumber: "12345",
      bankName: "BOC",
      branchName: "Colombo",
    });
    expect(req.body["bankDetails.accountName"]).toBeUndefined();
  });

  test("returns 400 for invalid bankDetails JSON", () => {
    const req = { body: { bankDetails: "{not-valid-json}" } };
    const res = makeRes();
    const next = jest.fn();

    normalizeCampaignBody(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining("bankDetails"),
      })
    );
  });
});
