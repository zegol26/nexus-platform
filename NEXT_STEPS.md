# Nexus Platform Next Steps

## Admin Access Control

- Admin menu must be able to grant/revoke app access per user.
- Admin menu must be able to grant/revoke access per lesson, not only per app.
- New registered users should not automatically access paid apps or lessons.
- Registration should create the user only; app/lesson access should be assigned by admin or payment validation.

## Payment Gateway

- Future payment gateway integration should validate successful payment before granting access.
- Payment duration should set `AppUserAccess.accessStartsAt` and `AppUserAccess.accessExpiresAt`.
- Payment records should be auditable for admin.
- Access should expire automatically based on paid duration.

## Suggested Schema Later

- `PaymentTransaction`
- `LessonAccess`
- `SubscriptionPlan`
- `AccessGrantAudit`
