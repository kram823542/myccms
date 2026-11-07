# Backend configuration

Submission windows use India Standard Time and are enforced by the backend. Set these optional values in `BACKEND/.env` to change them; values use 24-hour `HH:mm` format and the end time is exclusive:

```env
ACTION_PLAN_WINDOW_START=08:00
ACTION_PLAN_WINDOW_END=11:00
WORK_DONE_WINDOW_START=17:00
WORK_DONE_WINDOW_END=22:00
```

Authenticated clients can read the current windows and open/closed state from `GET /api/v1/submission-windows`.
