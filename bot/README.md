# Telegram bot (v2)

Scheduled Node bot (no dependencies, Node 18+). Scans the same categories as
the browser tool, compares with the last run in `data/state.json`, and sends
new deals, price drops and restocks to Telegram.

## Setup

```bash
cp .env.example .env   # then fill in TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID
node bot/run.js --dry-run   # prints what would be sent, sends nothing
node bot/run.js             # live run
```

Get the token from `@BotFather` (`/newbot`) and the chat ID from
`@userinfobot`. The bot only needs the values in `.env`; never commit `.env`.

## Scheduling

Run it on a schedule, for example every morning at 09:00 IST with cron:

```cron
0 9 * * * cd /path/to/Myntra-Deals && node bot/run.js >> bot/run.log 2>&1
```

State lives in `data/state.json`: each deal alerts once, and again only on a
further price drop; restocks alert too. Records older than 30 days are pruned.
