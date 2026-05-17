# RAWBY — Stripe Payment Setup Guide
### For the account holder and their accountant

---

## What is this?

RAWBY is a web application for filmmaking challenges. It will offer a paid subscription tier. **Stripe** is the payment processor — a globally trusted platform used by millions of businesses (Spotify, Amazon, Deliveroo, etc.).

As the developer is under 18, Stripe requires an adult to own the account and be legally responsible for it.

---

## What Stripe does

- Collects subscription payments from users (credit card, debit card)
- Handles all payment security (PCI-DSS compliant — no card data ever touches our server)
- Deposits revenue to the registered bank account after deducting its fee
- Provides invoices and transaction records automatically

**Stripe's fee:** 1.5% + €0.25 per successful transaction (European cards). No monthly fee. You only pay when you earn.

---

## What the account holder needs to do

### 1. Register on Stripe

Go to **stripe.com** → "Start now" → create an account with your email address.

During setup, Stripe will ask for:

| What | Details |
|------|---------|
| Business type | Individual / Sole trader (Egyéni vállalkozó) |
| Legal name | Your full legal name |
| Business name | Can be "RAWBY" or your vállalkozás name |
| Tax ID | Your **adószám** (vállalkozói adószám) |
| Address | Your registered business address |
| Phone number | For verification |
| ID document | Government-issued photo ID or passport |
| Bank account | Hungarian IBAN (to receive payouts) |

### 2. Verify identity

Stripe will verify your identity automatically — you upload a photo of your ID through their secure portal. Takes a few minutes.

### 3. Wait for approval

Stripe reviews accounts within 1–2 business days. You'll receive an email when activated.

### 4. Share API keys with the developer

Once approved, go to **Stripe Dashboard → Developers → API Keys** and share:
- Publishable key
- Secret key

The developer handles all technical integration. You do not need to touch any code.

---

## How money flows

```
User pays subscription
        ↓
Stripe collects payment (secure)
        ↓
Stripe deducts its fee (1.5% + €0.25)
        ↓
Stripe deposits net amount to your bank account
(payout schedule: daily or weekly, your choice)
```

You see every transaction in real time at **dashboard.stripe.com**.

---

## For the accountant

### Income classification (Hungary)

Revenue received through Stripe counts as **vállalkozói bevétel** (business income) of the egyéni vállalkozó. It is treated the same as any other service income.

### What Stripe provides

- Monthly and annual **revenue reports** (downloadable from Dashboard)
- **Payout summaries** showing gross income and fees
- Individual **charge records** with timestamps and amounts
- Automatic currency conversion if needed (revenue in EUR or HUF depending on configuration)

### VAT considerations

- If the subscription is sold to **Hungarian users**: standard HUF pricing, Hungarian VAT rules apply
- If sold to **EU users outside Hungary**: OSS (One Stop Shop) scheme may apply once revenue crosses EU thresholds
- If sold to **non-EU users**: generally outside HU VAT scope

Recommend discussing with accountant whether to register for the EU VAT OSS scheme from the start if international users are expected.

### What to record

Each month, download from Stripe Dashboard:
- **Payouts report** (what hit your bank account)
- **Balance transactions** (gross revenue minus Stripe fees)

The difference between gross and net is the Stripe fee — this is a deductible business expense.

---

## Legal relationship

The account holder (the parent) is the **legal owner** of the Stripe account and is responsible for tax compliance. The developer (the minor) is the technical operator only and has no legal or financial liability for the payments.

This arrangement is standard for minor developers working on apps — the adult handles the business/financial side, the developer handles the product.

---

## Questions

**Stripe support:** support.stripe.com  
**RAWBY developer contact:** zaron.films@gmail.com
