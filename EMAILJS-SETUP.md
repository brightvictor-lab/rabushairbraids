# Rabus Hair — EmailJS Booking Flow (Approve / Reschedule)

Replaces the old Twilio SMS with email notifications, like BeeGold.

## The flow
1. Client books → row saved to Supabase as **pending**
2. **Salon (Mrs. Rashidat) gets an email** with the booking details + **Approve** and **Reschedule** buttons
3. She taps **Approve** → client gets an "approved" email; row → **approved**
4. Or **Reschedule** → she picks a new date/time + note → client gets a "reschedule" email; row → **reschedule**

## Setup (5 steps)

### 1. Supabase
Run `bookings.sql` in the Supabase SQL editor (safe to re-run). It adds the
`reschedule_date`, `reschedule_time`, `salon_note` columns and the RLS policies
the approve/reschedule pages need.

### 2. EmailJS account
- Sign up at emailjs.com → add an email service (e.g. Gmail) → note the **Service ID** and **Public Key**.
- Create **THREE templates** (below). Note each **Template ID**.

### 3. Paste keys into `config.js`
Fill every `PASTE_...` in the `EMAILJS` block:
- `publicKey`, `serviceId` — same across salon + client
- `salonTemplate`, `approveTemplate`, `rescheduleTemplate`
- `salonEmail` — Mrs. Rashidat's email (where bookings are sent)

### 4. Templates & variables

**Template A — Salon notification** (`salonTemplate`), sent **to** `{{salon_email}}`:
```
reference, menu, service, price, duration,
client_name, client_email, client_phone,
booking_date, booking_time,
approve_link, reschedule_link
```
Put two buttons in the template:
- Approve → link to `{{approve_link}}`
- Reschedule → link to `{{reschedule_link}}`

**Template B — Client approved** (`approveTemplate`), sent **to** `{{to_email}}`:
```
to_email, client_name, service, booking_date, booking_time, reference
```

**Template C — Client reschedule** (`rescheduleTemplate`), sent **to** `{{to_email}}`:
```
to_email, client_name, service, reference,
old_date, old_time, new_date, new_time, salon_note
```

### 5. Deploy
Push to GitHub → Netlify auto-deploys. No server function needed (EmailJS is
browser-side). The old `netlify/functions/send-sms.js` has been removed.

## Notes
- Approve/reschedule pages have **duplicate-send protection** (local + Supabase
  status check) so Gmail link-prefetch can't fire the email twice.
- All keys in `config.js` are public/browser-safe by design (EmailJS + Supabase anon).
