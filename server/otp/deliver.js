// OTP delivery: WhatsApp (Meta Cloud API authentication template) first, SMS through MSG91 as the fallback.
// Off until configured; local development can use OTP_DEV_MODE=1 (code returned to the browser, never in production).

const whatsappEnv = () => ({
  token: process.env.WHATSAPP_TOKEN,
  phoneId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  template: process.env.WHATSAPP_OTP_TEMPLATE,
  language: process.env.WHATSAPP_OTP_TEMPLATE_LANG || 'en',
  version: process.env.WHATSAPP_API_VERSION || 'v21.0',
});

const msg91Env = () => ({
  authKey: process.env.MSG91_AUTH_KEY,
  templateId: process.env.MSG91_OTP_TEMPLATE_ID,
});

const whatsappReady = () => {
  const e = whatsappEnv();
  return Boolean(e.token && e.phoneId && e.template);
};
const smsReady = () => {
  const e = msg91Env();
  return Boolean(e.authKey && e.templateId);
};
const devMode = () => process.env.OTP_DEV_MODE === '1' && process.env.NODE_ENV !== 'production';

// Authentication templates take the code twice: in the body and in the "copy code" button.
async function viaWhatsapp(phone, code, minutes, fetchImpl = fetch) {
  const e = whatsappEnv();
  const res = await fetchImpl(`https://graph.facebook.com/${e.version}/${e.phoneId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${e.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: `91${phone}`,
      type: 'template',
      template: {
        name: e.template,
        language: { code: e.language },
        components: [
          { type: 'body', parameters: [{ type: 'text', text: code }] },
          { type: 'button', sub_type: 'url', index: '0', parameters: [{ type: 'text', text: code }] },
        ],
      },
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`WhatsApp ${res.status}: ${body?.error?.message || 'send failed'}`);
  }
}

// MSG91 SendOTP with our own code (we verify it ourselves); the template holds ##OTP##.
async function viaSms(phone, code, minutes, fetchImpl = fetch) {
  const e = msg91Env();
  const query = new URLSearchParams({ template_id: e.templateId, mobile: `91${phone}`, otp: code, otp_expiry: String(minutes), realTimeResponse: '1' });
  const res = await fetchImpl(`https://control.msg91.com/api/v5/otp?${query}`, {
    method: 'POST',
    headers: { authkey: e.authKey, 'content-type': 'application/json' },
    body: '{}',
    signal: AbortSignal.timeout(10000),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.type === 'error') throw new Error(`MSG91 ${res.status}: ${body.message || 'send failed'}`);
}

// Returns the channel used. `prefer` is 'whatsapp' (default) or 'sms' ("send by SMS instead").
async function deliver(phone, code, minutes, prefer = 'whatsapp') {
  const order = prefer === 'sms' ? ['sms', 'whatsapp'] : ['whatsapp', 'sms'];
  const senders = { whatsapp: [whatsappReady, viaWhatsapp], sms: [smsReady, viaSms] };
  let lastError = null;
  for (const channel of order) {
    const [ready, send] = senders[channel];
    if (!ready()) continue;
    try {
      await send(phone, code, minutes);
      return channel;
    } catch (err) {
      lastError = err;
      console.error(`[otp] ${channel} send failed`, err.message);
    }
  }
  if (devMode()) return 'dev';
  const err = new Error(lastError ? 'OTP delivery failed' : 'OTP delivery is not configured');
  err.code = lastError ? 'OTP_SEND_FAILED' : 'OTP_NOT_CONFIGURED';
  throw err;
}

const channels = () => ({ whatsapp: whatsappReady(), sms: smsReady(), dev: devMode() });

module.exports = { deliver, channels, devMode };
