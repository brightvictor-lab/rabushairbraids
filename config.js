/* ============================================================
   RABUS HAIR AFRICA BRAIDING — CONFIG
   Loaded before booking.js.
   ------------------------------------------------------------
   NOTE: Keys below are PUBLIC / browser-safe by design.
   - Supabase publishable (anon) key: safe in the front-end ONLY when
     Row-Level Security (RLS) is enabled on your Supabase tables.
   EmailJS keys are public/browser-safe by design (EmailJS is built
   for client-side use). No server function is required.
   ============================================================ */

window.RH_CONFIG = {

  /* ---------- SITE ---------- */
  // Leave empty ("") — the site then automatically uses whatever URL it is
  // deployed on (test subdomain OR final domain) for the Google redirect.
  // Just make sure the deployed URL is listed in Supabase ->
  // Authentication -> URL Configuration -> Redirect URLs.
  SITE_URL: "",

  /* ---------- SALON DETAILS ---------- */
  SALON: {
    name:     "Rabus Hair Africa Braiding",
    address:  "209 W 91st St, Chicago, IL 60620",
    phone:    "+1 (312) 647-0604",
    phoneRaw: "+13126470604"
  },

  /* ---------- SUPABASE ----------
     Create a Supabase project for Rabus, then paste the keys below.
     bookings table columns:
       reference, service, price, duration_hrs, client_name,
       client_email, client_phone, booking_date, booking_time, status
     Enable the Google provider (paste Google OAuth Client ID +
     Secret inside Supabase) and add SITE_URL as a Redirect URL. */
  SUPABASE: {
    url:            "YOUR_SUPABASE_URL",
    anonKey:        "YOUR_SUPABASE_ANON_KEY",
    publishableKey: "YOUR_SUPABASE_PUBLISHABLE_KEY"
  },

  /* ---------- EMAILJS ----------
     Create an EmailJS account (emailjs.com) -> add an email service ->
     create THREE templates, then paste the IDs below.

     salonTemplate     -> emailed to the SALON on each booking; contains the
                          Approve + Reschedule buttons (links).
     approveTemplate   -> emailed to the CLIENT when the salon taps Approve.
     rescheduleTemplate-> emailed to the CLIENT when the salon reschedules.

     publicKey + serviceId are the same across all three (one account/service).
     See README.md for the exact template variable names. */
  EMAILJS: {
    salon: {
      publicKey:  "YOUR_EMAILJS_PUBLIC_KEY",
      serviceId:  "YOUR_EMAILJS_SERVICE_ID",
      salonTemplate: "YOUR_SALON_TEMPLATE_ID",
      salonEmail: "YOUR_SALON_EMAIL"   // where booking notifications are sent
    },
    client: {
      publicKey:  "YOUR_EMAILJS_PUBLIC_KEY_2",
      serviceId:  "YOUR_EMAILJS_SERVICE_ID_2",
      approveTemplate:    "YOUR_APPROVE_TEMPLATE_ID",
      rescheduleTemplate: "YOUR_RESCHEDULE_TEMPLATE_ID"
    }
  }

  /* ---------- BOOKING SMS (Twilio) ----------
     Configured in Netlify -> Site settings -> Environment variables:
       TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_PHONE / SALON_PHONE
     No keys are needed in this file. */
};
