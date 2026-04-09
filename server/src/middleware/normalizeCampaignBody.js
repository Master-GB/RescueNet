const parseJsonField = (value, fieldName) => {
  try {
    return JSON.parse(value);
  } catch {
    const error = new Error(`Invalid JSON format for ${fieldName}`);
    error.statusCode = 400;
    throw error;
  }
};

const normalizeBankDetails = (body) => {
  if (typeof body.bankDetails === "string") {
    const parsed = parseJsonField(body.bankDetails, "bankDetails");
    if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
      const error = new Error("bankDetails must be a JSON object");
      error.statusCode = 400;
      throw error;
    }
    body.bankDetails = parsed;
    return;
  }

  const keyMap = {
    "bankDetails.accountName": "accountName",
    "bankDetails.accountNumber": "accountNumber",
    "bankDetails.bankName": "bankName",
    "bankDetails.branchName": "branchName",
    "bankDetails[accountName]": "accountName",
    "bankDetails[accountNumber]": "accountNumber",
    "bankDetails[bankName]": "bankName",
    "bankDetails[branchName]": "branchName",
  };

  const extracted = {};
  let hasAnyBankDetailsField = false;

  Object.entries(keyMap).forEach(([sourceKey, targetKey]) => {
    if (body[sourceKey] !== undefined) {
      extracted[targetKey] = body[sourceKey];
      delete body[sourceKey];
      hasAnyBankDetailsField = true;
    }
  });

  if (hasAnyBankDetailsField) {
    body.bankDetails = {
      ...(body.bankDetails || {}),
      ...extracted,
    };
  }
};

const normalizeAcceptedItems = (body) => {
  if (typeof body.acceptedItems !== "string") {
    return;
  }

  const raw = body.acceptedItems.trim();
  if (!raw) {
    body.acceptedItems = [];
    return;
  }

  if (raw.startsWith("[")) {
    const parsed = parseJsonField(raw, "acceptedItems");
    if (!Array.isArray(parsed)) {
      const error = new Error("acceptedItems must be a JSON array");
      error.statusCode = 400;
      throw error;
    }
    body.acceptedItems = parsed;
    return;
  }

  body.acceptedItems = raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

export const normalizeCampaignBody = (req, res, next) => {
  try {
    req.body = req.body || {};
    normalizeBankDetails(req.body);
    normalizeAcceptedItems(req.body);
    next();
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Invalid campaign payload",
    });
  }
};
