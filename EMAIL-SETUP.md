# Shoply v0.8 Email Security Setup

Shoply v0.8 **does not display login or password-reset codes in the browser**. Codes are emailed through SMTP.

## Gmail setup (easy localhost option)

1. Turn on 2-Step Verification on the Gmail/Google account you want to send from.
2. Create a Google **App Password** for Shoply.
3. Copy `.env.example` to a new file named `.env.local` in the Shoply project root.
4. Fill these values:

```env
SESSION_SECRET=replace-this-with-a-long-random-secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
EMAIL_FROM=Shoply Local <your-email@gmail.com>
```

5. Restart Shoply (`Ctrl + C`, then `START.bat`).
6. Sign in with your merchant email/password. Shoply will email a 6-digit code.

> Use a Gmail **App Password**, not your normal Gmail password.

## Other SMTP providers

You can use another SMTP provider. Set its host, port, secure mode, username, password and from-address in `.env.local`.

Typical ports:
- `465` with `SMTP_SECURE=true`
- `587` with `SMTP_SECURE=false`

## Security behavior

- Login code: expires after 10 minutes.
- Password reset code: expires after 15 minutes.
- Codes are stored only as keyed HMAC-SHA256 hashes in `data/db.json`.
- A code can be used once.
- Five incorrect attempts invalidate the challenge.
- Resending is rate-limited to once per 60 seconds.
- Password reset codes are never placed in URLs or rendered on the page.
