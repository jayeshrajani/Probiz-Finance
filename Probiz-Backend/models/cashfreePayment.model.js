const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

/**
 * Local record of Cashfree PG orders/payments for auditing and dashboards.
 * Synced on createOrder, getOrder, getPayments, and webhook callbacks.
 */
const cashfreePaymentSchema = new Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    cfOrderId: { type: String, default: '' },
    orderAmount: { type: Number },
    orderCurrency: { type: String, default: 'INR' },
    orderStatus: { type: String, default: 'ACTIVE' },
    paymentSessionId: { type: String, default: '' },
    /** Business use-case: itr | gumasta | msme | general */
    purpose: {
      type: String,
      enum: ['itr', 'gumasta', 'msme', 'general'],
      default: 'general'
    },
    userId: { type: ObjectId, ref: 'User', required: false },
    customerDetails: {
      customerId: { type: String, default: '' },
      customerName: { type: String, default: '' },
      customerEmail: { type: String, default: '' },
      customerPhone: { type: String, default: '' }
    },
    orderNote: { type: String, default: '' },
    /** Latest payments array from Cashfree GET /orders/{id}/payments */
    payments: { type: [Schema.Types.Mixed], default: [] },
    latestPaymentStatus: { type: String, default: '' },
    lastWebhookType: { type: String, default: '' },
    lastWebhookAt: { type: Date },
    lastSyncedAt: { type: Date },
    /** Last full order object from Cashfree (optional debug/audit) */
    rawOrderFromCashfree: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

module.exports = mongoose.model('CashfreePayment', cashfreePaymentSchema);
