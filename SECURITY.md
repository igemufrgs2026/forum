# Security

The v2 backend only exposes an explicit public record allowlist; name, contact, address and device serial stay in the spreadsheet. Public POST supports add only. Update/delete are denied; authorized Google Sheets editors manage records directly.
Server validation, formula escaping, locking and idempotent request IDs protect data integrity. Browser passwords and admin exports were removed.

These fixes only apply after updating the Google Apps Script deployment. Publishing frontend changes alone does not secure the old endpoint. Update or archive other old deployments and keep the spreadsheet private.

Anonymous submissions remain possible, with no identity verification or robust abuse protection yet. Before scaling up, add moderation and server-side anti-abuse controls. The `FORUM_ACCEPT_SUBMISSIONS` script property can pause writes. Public coordinates require an explicit project decision about acceptable precision.

Do not put credentials or private records in public issues. Contact the team privately through an established channel. Never place secrets in frontend configuration.
