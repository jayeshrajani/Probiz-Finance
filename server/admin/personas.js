// Employee personas. Sales executives only add leads; operations work them, first at L1, then at L2.
const PERSONAS = {
  sales: { label: 'Sales executive', level: null, emailTag: 'sales' },
  ops_l1: { label: 'Operations L1', level: 'l1', emailTag: 'opsl1' },
  ops_l2: { label: 'Operations L2', level: 'l2', emailTag: 'opsl2' },
};
const STAGES = ['l1', 'l2'];
const STAGE_LABEL = { l1: 'Operations L1', l2: 'Operations L2' };
const EMAIL_DOMAIN = 'probiz.com';

// Employees created before personas existed count as Operations L1 until an admin changes them.
const personaOf = (employee) => (PERSONAS[employee?.persona] ? employee.persona : 'ops_l1');
const levelOf = (persona) => PERSONAS[persona]?.level || null;
const stageOf = (lead) => (lead?.stage === 'l2' ? 'l2' : 'l1');

// "Jayesh Rajani" + sales -> jayesh.sales@probiz.com; n > 1 gives jayesh2.sales@probiz.com.
function staffEmail(name, persona, n = 1) {
  const first = String(name || '').trim().split(/\s+/)[0].normalize('NFKD').toLowerCase().replace(/[^a-z0-9]/g, '') || 'staff';
  return `${first}${n > 1 ? n : ''}.${PERSONAS[persona].emailTag}@${EMAIL_DOMAIN}`;
}

module.exports = { PERSONAS, STAGES, STAGE_LABEL, EMAIL_DOMAIN, personaOf, levelOf, stageOf, staffEmail };
