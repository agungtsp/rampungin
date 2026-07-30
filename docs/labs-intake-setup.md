# Rampungin Labs — intake setup

Native form on `/labs` → `POST /api/labs/submit` → Supabase `labs_submissions` → Telegram.

## 1. Apply migration

```bash
# from rampungin/
npx supabase db push
# or run supabase/migrations/20260730120000_labs_submissions.sql in the SQL editor
```

## 2. Env (`.env.local`)

```bash
TELEGRAM_BOT_TOKEN=123456:ABC...
TELEGRAM_CHAT_ID=-100...   # or personal chat id
```

How to get chat id: message the bot, then open  
`https://api.telegram.org/bot<TOKEN>/getUpdates` and copy `chat.id`.

## 3. Admin list

Logged-in users with `profiles.is_admin = true` can open `/admin/labs`.

## Form fields

Name · Email · WhatsApp · Audience · Problem · Repeating tasks · Time/week · Expectations · Notes (optional)

If the visitor is logged in, `user_id` is stored too.
