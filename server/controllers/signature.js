import { db } from "../db/index.js";

export const sign = async (req, res) => {
  const { application_id, party } = req.body;

  await db.query(
    `UPDATE signatures SET signed=true, signed_at=NOW()
     WHERE application_id=$1 AND party=$2`,
    [application_id, party]
  );

  res.json({ message: "Signed" });
};

export const getSignatures = async (req, res) => {
  const { id } = req.params;
  const result = await db.query(
    "SELECT * FROM signatures WHERE application_id=$1",
    [id]
  );
  res.json(result.rows);
};
