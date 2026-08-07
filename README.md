# Rabus Hair Africa Braiding — Booking Website

A full booking website for an African hair braiding salon in Chicago, IL. Customers browse styles, sign in with Google, pick a date and time, and submit a booking request. The salon owner is notified by email and can **approve** or **reschedule** the appointment in one tap — the customer is then automatically emailed the outcome.

**🔗 Live site:https://rabushairbraids.netlify.app/

📍 **Find the salon on Google Maps:** Rabus Hair Africa Braiding is listed on Google Maps at [209 W 91st St, Chicago, IL 60620](https://www.google.com/maps?q=209+W+91st+St,+Chicago,+IL+60620) — the location is embedded live on the site's contact section.

---

## Screenshots

<!-- Add your screenshots to a /screenshots folder and update the paths below -->
| Home | Booking Flow | Gallery |
|------|--------------|---------|
| ![Home](screenshots/home.png) | ![Booking](screenshots/booking.png) | ![Gallery](screenshots/gallery.png) |

---

## Features

- **Google Sign-In** via Supabase Auth (PKCE flow, reliable on mobile), with session persistence across pages
- **Multi-step booking flow:** Terms gate -> Sign In -> Category (Adult / Kids) -> Service -> Phone -> Date & Time -> Review
- **Approve / reschedule flow:** each booking writes to Supabase and emails the salon owner, who approves it or proposes a new time in one tap; the customer is instantly emailed the outcome via EmailJS
- **Adult & Kids menus** with live "with weave / without weave" pricing for kids
- **Open calendar** with per-day time slots, closed-day handling, and past-date blocking
- **Compulsory Terms gate** with single-use OAuth ticket so the gate is enforced on every visit
- **Filterable gallery** with a full-screen lightbox
- Fully responsive luxury black / metallic-pink / gold design

---

## Tech Stack

- **Front-end:** HTML5, CSS3 (Flexbox / Grid), vanilla JavaScript — no build step
- **Auth & Database:** Supabase (Postgres + Google OAuth)
- **Transactional email:** EmailJS — salon-notify, approve, and reschedule templates
- **Hosting:** Netlify (static)

---

## Configuration

This repo ships with **placeholder credentials** in `config.js` — no real keys are included. To run it yourself, open `config.js` and plug in your own Supabase and EmailJS values (every sensitive field is marked `YOUR_...`).

See `EMAILJS-SETUP.md` for the EmailJS template setup, and `bookings.sql` for the Supabase table schema.

> **Security note:** the Supabase `anon` key is safe to expose in front-end code **only when Row-Level Security (RLS) is enabled** on your tables. Enable RLS and add an insert policy so the public can create bookings but cannot read or modify them.

---

## Running locally

It's a static site — no install needed. Clone the repo, add your credentials to `config.js`, and open `index.html`, or serve it:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

---

## About

Built by **Victor Bright** — Chronicle Web. One of several production booking sites delivered for US-based salon businesses.
