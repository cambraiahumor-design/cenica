"""
Cria template de e-mail + automação de boas-vindas no Brevo
para a lista "Somos cênica - #5".

Uso:
    python brevo_automacao_boasvindas.py

Requisitos:
    pip install requests
"""

import json
import requests

# ── Configuração ──────────────────────────────────────────────────────────────
API_KEY = "COLE_SUA_API_KEY_AQUI"   # xkeysib-...
LIST_ID = 5                          # ID da lista "Somos cênica - #5"
SENDER_EMAIL = "somos.cenica@gmail.com"
SENDER_NAME  = "Somos Cênica"

HEADERS = {
    "accept": "application/json",
    "content-type": "application/json",
    "api-key": API_KEY,
}

# ── HTML do e-mail ─────────────────────────────────────────────────────────────
EMAIL_HTML = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Inscrição Confirmada — Manual Humano</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f5f5f5">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" bgcolor="#ffffff"
               style="border-radius:8px;overflow:hidden;max-width:600px;">

          <!-- Cabeçalho -->
          <tr>
            <td align="center" bgcolor="#1a1a2e"
                style="padding:40px 40px 32px;">
              <p style="margin:0;font-size:13px;letter-spacing:4px;
                         color:#c9a84c;text-transform:uppercase;">
                Somos Cênica
              </p>
              <h1 style="margin:12px 0 0;font-size:28px;color:#ffffff;
                          font-weight:normal;letter-spacing:1px;">
                Sua inscrição está confirmada
              </h1>
              <p style="margin:8px 0 0;font-size:16px;color:#c9a84c;
                         font-style:italic;">
                Manual Humano
              </p>
            </td>
          </tr>

          <!-- Corpo -->
          <tr>
            <td style="padding:40px 40px 32px;color:#333333;">
              <p style="font-size:16px;line-height:1.7;margin:0 0 24px;">
                Olá! 👋
              </p>
              <p style="font-size:16px;line-height:1.7;margin:0 0 24px;">
                Que alegria ter você com a gente! Sua inscrição para a palestra
                <strong>Manual Humano</strong> está confirmada. Guarda essas
                informações:
              </p>

              <!-- Bloco de detalhes -->
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="background:#f9f5ee;border-left:4px solid #c9a84c;
                            border-radius:4px;margin-bottom:32px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <p style="margin:0 0 12px;font-size:15px;">
                      📅 <strong>Data:</strong> 22 de maio de 2026, quinta-feira, às 20h
                    </p>
                    <p style="margin:0 0 12px;font-size:15px;">
                      📍 <strong>Local:</strong> Teatro Torquato Neto — Teresina, PI
                    </p>
                    <p style="margin:0;font-size:15px;">
                      ⏱️ <strong>Duração:</strong> 1h30
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Botão CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <a href="https://www.sympla.com.br/evento/palestra-manual-humano/3398331"
                       target="_blank"
                       style="display:inline-block;background:#c9a84c;color:#1a1a2e;
                              font-size:15px;font-weight:bold;letter-spacing:1px;
                              text-decoration:none;padding:14px 36px;
                              border-radius:4px;text-transform:uppercase;">
                      Ver meu ingresso no Sympla
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:15px;line-height:1.7;margin:0 0 16px;">
                Qualquer dúvida, é só responder este e-mail.
              </p>
              <p style="font-size:15px;line-height:1.7;margin:0;">
                Até lá! 🎭<br/>
                <strong>João Cambraia</strong><br/>
                <em>Somos Cênica</em>
              </p>
            </td>
          </tr>

          <!-- Rodapé -->
          <tr>
            <td align="center" bgcolor="#1a1a2e"
                style="padding:20px 40px;">
              <p style="margin:0;font-size:12px;color:#888888;">
                Você recebeu este e-mail porque se inscreveu em um evento da Somos Cênica.<br/>
                <a href="{{unsubscribe}}" style="color:#c9a84c;">Cancelar inscrição</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

# ── 1. Criar template ──────────────────────────────────────────────────────────
def criar_template():
    print("Criando template de e-mail...")
    payload = {
        "templateName": "Boas-vindas Manual Humano",
        "subject": "Sua inscrição está confirmada — Manual Humano",
        "htmlContent": EMAIL_HTML,
        "sender": {"name": SENDER_NAME, "email": SENDER_EMAIL},
        "isActive": True,
    }
    r = requests.post(
        "https://api.brevo.com/v3/smtp/templates",
        headers=HEADERS,
        json=payload,
    )
    r.raise_for_status()
    template_id = r.json()["id"]
    print(f"  Template criado — ID: {template_id}")
    return template_id


# ── 2. Criar automação ─────────────────────────────────────────────────────────
def criar_automacao(template_id: int):
    print("Criando automação...")
    payload = {
        "name": "Boas-vindas Somos Cênica — Lista #5",
        "status": "active",
        "trigger": {
            "type": "contactAdded",
            "params": {"listId": LIST_ID},
        },
        "conditions": [],
        "actions": [
            {
                "type": "sendTransactionalEmail",
                "params": {
                    "emailTemplateId": template_id,
                },
            }
        ],
    }
    r = requests.post(
        "https://api.brevo.com/v3/automations",
        headers=HEADERS,
        json=payload,
    )
    r.raise_for_status()
    automation_id = r.json().get("id") or r.json().get("automationId")
    print(f"  Automação criada — ID: {automation_id}")
    return automation_id


# ── Main ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    if API_KEY == "COLE_SUA_API_KEY_AQUI":
        print("ERRO: Substitua API_KEY pela sua chave do Brevo antes de rodar.")
        raise SystemExit(1)

    template_id  = criar_template()
    automation_id = criar_automacao(template_id)

    print()
    print("=== Tudo pronto! ===")
    print(f"  Template ID  : {template_id}")
    print(f"  Automação ID : {automation_id}")
    print()
    print("Para testar: adicione manualmente um contato à lista #5 no Brevo")
    print("e aguarde alguns minutos — o e-mail de boas-vindas será disparado.")
