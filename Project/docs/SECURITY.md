# PharmaStock Security

## Implemented controls

- Passwords are hashed with bcrypt and are excluded from normal queries by the `User` schema.
- JWTs include an issuer, audience, expiry, subject, role, and email. The API reloads the active user on every authenticated request.
- Role authorization is enforced by Express middleware: `Admin`, `Inventory Manager`, `Pharmacist`, `Sales Staff`, and `Viewer` have separate capabilities.
- Login has a dedicated rate limit; the API has a global rate limit.
- Helmet supplies secure HTTP response headers; CORS uses an explicit origin allowlist.
- JSON and URL-encoded request bodies are limited to 1 MB.
- All write inputs pass centralized validation before controllers execute.
- Search terms are escaped before use in regular expressions.
- Audit records capture actor, action, entity, IP address, metadata, and timestamp.
- Stock writes use MongoDB transactions and guarded quantity updates. There is no non-atomic fallback.
- Error responses hide internal 5xx details when `NODE_ENV=production`.

## Secret handling

Never commit `.env`, database credentials, JWT secrets, or seed passwords. Use a secret manager or protected CI environment variables in deployed environments. Rotate a JWT secret by invalidating existing sessions and restarting the API.

The seed requires both an explicit reset confirmation and `SEED_PASSWORD`. It is development-only and must not be run against production.

## Production checklist

- Use MongoDB Atlas or another replica-set deployment; a standalone server cannot execute stock transactions.
- Set a random `JWT_SECRET` of at least 32 characters.
- Set `NODE_ENV=production` and a narrow `CLIENT_ORIGIN` allowlist.
- Terminate TLS at the edge and use an encrypted MongoDB connection string.
- Restrict database network access and use a least-privilege database user.
- Configure log aggregation without logging passwords, JWTs, or full request bodies.
- Review audit retention and notification storage growth.
- Run dependency audits and keep CI blocking on high/critical findings.
- Rotate any credential that has appeared in source control, logs, screenshots, or coursework artifacts.

## Historical artifacts

The repository contains historical practical documents from earlier coursework. They are preserved as submitted artifacts and are not application configuration. Any credential found in those documents must be considered exposed and rotated outside the application.
