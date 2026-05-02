import crypto from "crypto";

export const signHash = (data) => {
  return crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");
};

export const verifyHash = (data, hash) => {
  return signHash(data) === hash;
};
