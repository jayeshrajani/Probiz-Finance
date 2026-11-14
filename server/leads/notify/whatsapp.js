// New-lead alert to admin WhatsApp numbers through the Meta WhatsApp Cloud API. Off until the env vars are set.
const { record } = require('../events');

const env = () => ({
  token: process.env.WHATSAPP_TOKEN,
  phoneId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  template: process.env.WHATSAPP_TEMPLATE,
  language: process.env.WHATSAPP_TEMPLATE_LANG || 'en',
  version: process.env.WHATSAPP_API_VERSION || 'v21.0',
  to: String(process.env.WHATSAPP_ALERT_TO || '')
    .split(',')
    .map((n) => n.replace(/[^\d]/g, ''))
    .filter(Boolean),
  siteUrl: (process.env.SITE_URL || 'https://probizfinance.com').replace(/\/$/, ''),
});

const enabled = () => {
  const e = env();
  return Boolean(e.token && e.phoneId && e.template && e.to.length);
};

// Template body variables, in order: {{1}} product, {{2}} name, {{3}} phone, {{4}} admin link.
function templatePayload(e, lead, to, label) {
  const text = (v) => ({ type: 'text', text: String(v || '-').slice(0, 200) });
  return {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: e.template,
      language: { code: e.language },
      components: [
        {
          type: 'body',
          parameters: [text(label), text(lead.name), text(lead.phone), text(`${e.siteUrl}/admin-panel/leads/${lead.type}/${lead._id}`)],
        },
      ],
    },
  };
}

async function notifyNewLead(lead, label, fetchImpl = fetch) {
  if (!enabled()) return;
  const e = env();
  const url = `https://graph.facebook.com/${e.version}/${e.phoneId}/messages`;
  const results = await Promise.all(
    e.to.map(async (to) => {
      const res = await fetchImpl(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${e.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(templatePayload(e, lead, to, label)),
      });
      const body = await res.json().catch(() => ({}));
      return { to: `...${to.slice(-4)}`, ok: res.ok, status: res.status, error: res.ok ? null : body?.error?.message || null };
    })
  );
  const failed = results.filter((r) => !r.ok);
  await record(lead._id, failed.length ? 'notification.failed' : 'notification.sent', { kind: 'system' }, { channel: 'whatsapp', results });
}

module.exports = { notifyNewLead, enabled, templatePayload };
