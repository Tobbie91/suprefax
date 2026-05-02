export const verifyNIN = async (nin) => {
  const res = await fetch("https://api.youverify.co/v2/api/identity/ng/nin", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.YOUVERIFY_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ nin }),
  });

  return res.json();
};
