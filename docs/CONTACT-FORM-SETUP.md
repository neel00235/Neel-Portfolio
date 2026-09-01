# Contact Form Setup: Gmail SMTP Configuration

This guide explains how to configure the contact form to send emails directly via Gmail SMTP.

---

## 1. Important Background: App Password vs "API Key"

There is **no static "Gmail API key"** that authorizes sending mail on behalf of a Gmail user account.

Gmail supports two authentication mechanisms:
1. **Gmail App Password (Recommended & Supported)**: A 16-character credential generated in your Google Account security settings specifically for SMTP over TLS/SSL (`smtp.gmail.com:465`).
2. **Gmail REST API (OAuth 2.0)**: Requires setting up a Google Cloud Project, configuring OAuth consent screens, creating Client ID/Secret pairs, and implementing a refresh token flow. It does not use static API keys.

**Use the Gmail App Password method below.**

---

## 2. Generating Your Gmail App Password (Step-by-Step)

1. Open your browser and go to:
   <https://myaccount.google.com/security>

2. Ensure **2-Step Verification** is turned **ON**.
   > *Note:* Google does not permit App Passwords unless 2-Step Verification is active on the account.

3. Navigate directly to the App Passwords management page:
   <https://myaccount.google.com/apppasswords>
   *(If this URL redirects or shows an error, 2-Step Verification was only just turned on; wait 2–3 minutes and try again).*

4. In the **App name** input field, enter a descriptive label:
   `neelpatel.com contact form`
   Click **Create**.

5. A modal dialog will display a **16-character password** formatted in four groups of four letters (e.g. `abcd efgh ijkl mnop`).
   > **Important:** Copy this password immediately. Google will never display it to you again once the dialog is closed. If you misplace it, delete the entry and create a new one.

---

## 3. Configuring Your Local Environment

Create or edit your local environment file at `.env.local` (this file is excluded from git by `.gitignore`):

```bash
SMTP_USER=neelpatel00235@gmail.com
SMTP_APP_PASSWORD=abcdefghijklmnop
CONTACT_TO=neelpatel00235@gmail.com
```

> **Note:**
> - Paste the App Password **without spaces** (`abcdefghijklmnop`).
> - Keep `SMTP_USER` and `CONTACT_TO` set to your email address (`neelpatel00235@gmail.com`).
> - Never commit `.env.local` to git or share this password in screenshots.

---

## 4. Running and Testing the Server

Because SMTP requires a Node server runtime (browsers cannot connect to raw TCP SMTP sockets, and credentials must never be exposed client-side), build and run in server mode:

```bash
# Build the server target (enables src/app/api/contact/route.server.ts)
npm run build:server

# Or run the development server
npm run dev
```

When you submit the contact form:
- The client POSTs to `/api/contact`.
- The server validates all fields, checks rate limits (5 requests per 10 minutes per IP), validates honeypot fields (`_gotcha`), and delivers the message via Gmail SMTP (`smtp.gmail.com:465`).
- The email arrives at `neelpatel00235@gmail.com` with `Reply-To` set to the visitor's email address, so clicking **Reply** in Gmail directly responds to the visitor.

---

## 5. Deployment Options

### Option A: Node / Serverless Deployment (SMTP Enabled)
Deploy to Vercel, Netlify (with functions), Render, Railway, or any Node server:
1. Set the build command to:
   ```bash
   npm run build:server
   ```
2. Configure the environment variables in your hosting provider's dashboard:
   - `BUILD_TARGET=server`
   - `SMTP_USER=neelpatel00235@gmail.com`
   - `SMTP_APP_PASSWORD=your-16-char-app-password`
   - `CONTACT_TO=neelpatel00235@gmail.com`

### Option B: Pure Static Export (Formspree Fallback)
If you deploy the static export (`npm run build` emitting `out/`):
- `/api/contact` returns `404 Not Found` because there is no backend server.
- The client automatically detects the `404` and seamlessly falls back to the Formspree endpoint (`NEXT_PUBLIC_FORM_ENDPOINT`), ensuring the form still delivers emails without breaking.

---

## 6. Gmail SMTP Limits & Notes
- **Daily Quota:** Free Gmail accounts permit sending up to ~500 emails per day.
- **Port:** Uses Port 465 with SSL/TLS (`secure: true`).
- **Password Invalidation:** If you change your Google Account master password or disable 2-Step Verification, existing App Passwords are automatically revoked.
