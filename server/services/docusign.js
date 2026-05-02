import axios from "axios";

export const sendEnvelope = async (email, accountId) => {
  const res = await axios.post(
    `https://demo.docusign.net/restapi/v2.1/accounts/${accountId}/envelopes`,
    {
      emailSubject: "Sign Your Loan Agreement - Suprefax",
      recipients: {
        signers: [{ email, name: email, recipientId: "1" }],
      },
      status: "sent",
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.DOCUSIGN_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res.data;
};
