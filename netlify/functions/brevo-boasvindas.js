// Netlify Function — recebe webhook do Brevo (list_addition na lista #5)
// e envia e-mail de boas-vindas via template transacional ID 5.

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const TEMPLATE_ID   = 5;
const TARGET_LIST   = 5;

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  // Verifica se é evento de adição à lista correta
  const lists = payload.list_id || [];
  if (!lists.includes(TARGET_LIST)) {
    return { statusCode: 200, body: "Ignored — different list" };
  }

  const email = payload.email;
  if (!email) {
    return { statusCode: 400, body: "Missing email" };
  }

  // Envia e-mail transacional
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      templateId: TEMPLATE_ID,
      to: [{ email }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Brevo error:", err);
    return { statusCode: 500, body: "Email send failed" };
  }

  console.log(`E-mail de boas-vindas enviado para ${email}`);
  return { statusCode: 200, body: "OK" };
};
