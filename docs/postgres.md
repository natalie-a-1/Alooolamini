# Alooola Mini PostgreSQL Schema

This schema matches the demo flows:
- Onboarding: financial goals, risk tolerance, starter amount
- Households / joint accounts
- Spending: categories + transactions
- Discover: curated portfolios
- Ask AI: assistant chat
- Referrals

## Conventions
- Primary keys: `uuid` (default `gen_random_uuid()`)
- Timestamps: `created_at`, `updated_at` (UTC)
- Money: `numeric(12,2)`
- Percent: `numeric(6,2)`

## Enums (Postgres enums or CHECK constraints)
- `member_role`: `owner`, `member`, `viewer`
- `member_status`: `pending`, `accepted`
- `invite_status`: `pending`, `accepted`, `expired`, `revoked`
- `risk_tolerance`: `conservative`, `moderate`, `aggressive`
- `txn_type`: `debit`, `credit`
- `referral_event_type`: `click`, `signup`, `complete`
- `assistant_sender`: `user`, `assistant`, `system`

---

## Identity

### users
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| email | text | unique |
| name | text | nullable |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

## Auth & sessions
Store raw secrets never; keep token hashes and short expirations for reset flows.

### user_auth
| column | type | notes |
|---|---|---|
| user_id | uuid | PK, FK users.id |
| password_hash | text | hash only (bcrypt/argon2) |
| password_updated_at | timestamptz | |
| mfa_enabled | boolean | default false |
| mfa_secret | text | encrypted if stored |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### refresh_tokens
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK users.id |
| token_hash | text | store hash only |
| user_agent | text | nullable |
| ip_address | inet | nullable |
| expires_at | timestamptz | |
| revoked_at | timestamptz | nullable |
| replaced_by_id | uuid | nullable, FK refresh_tokens.id |
| created_at | timestamptz | |

### password_resets
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK users.id |
| token_hash | text | store hash only |
| expires_at | timestamptz | |
| used_at | timestamptz | nullable |
| created_at | timestamptz | |

### email_verifications
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK users.id |
| token_hash | text | store hash only |
| expires_at | timestamptz | |
| verified_at | timestamptz | nullable |
| created_at | timestamptz | |

---

## Profiles

### user_profiles
| column | type | notes |
|---|---|---|
| user_id | uuid | PK, FK users.id |
| avatar_url | text | nullable |
| profession | text | nullable |
| member_tier | text | nullable (e.g., professional) |
| member_since | date | nullable |
| timezone | text | nullable |
| locale | text | nullable |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

## Households and joint access

### households
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| name | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### household_members
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| household_id | uuid | FK households.id |
| user_id | uuid | FK users.id |
| role | member_role | |
| status | member_status | |
| invited_at | timestamptz | nullable |
| joined_at | timestamptz | nullable |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### invites
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| household_id | uuid | FK households.id |
| email | text | |
| token | text | unique |
| status | invite_status | |
| expires_at | timestamptz | |
| accepted_at | timestamptz | nullable |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

## Accounts and spending

### accounts
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| household_id | uuid | FK households.id |
| name | text | |
| type | text | checking/savings/credit |
| institution | text | nullable |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### categories
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| household_id | uuid | nullable |
| name | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### transactions
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| household_id | uuid | FK households.id |
| account_id | uuid | FK accounts.id |
| attributed_user_id | uuid | FK users.id |
| category_id | uuid | FK categories.id |
| txn_type | txn_type | debit/credit |
| amount | numeric(12,2) | positive |
| currency | text | default USD |
| merchant | text | |
| txn_date | date | |
| note | text | nullable |
| created_at | timestamptz | |
| updated_at | timestamptz | |

Optional (if you want "undo" + audit): add `transaction_events` to track edits.

---

## Balances, transfers, and rewards

### account_balances
Snapshot of current/available for fast UI reads.

| column | type | notes |
|---|---|---|
| account_id | uuid | PK, FK accounts.id |
| available_balance | numeric(12,2) | |
| current_balance | numeric(12,2) | |
| as_of | timestamptz | |

### transfers
For peer-to-peer transfers and “Move Funds”.

| column | type | notes |
|---|---|---|
| id | uuid | PK |
| household_id | uuid | FK households.id |
| from_user_id | uuid | FK users.id |
| to_user_id | uuid | FK users.id |
| amount | numeric(12,2) | positive |
| currency | text | default USD |
| note | text | nullable |
| status | text | pending/posted/failed/reversed |
| created_at | timestamptz | |
| posted_at | timestamptz | nullable |

### funding_sources
Bank cards/accounts for “Add Funds”.

| column | type | notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK users.id |
| provider | text | plaid/stripe/etc |
| provider_ref | text | token/id from provider |
| label | text | nullable |
| type | text | bank/card |
| last4 | text | nullable |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### reward_accounts
| column | type | notes |
|---|---|---|
| user_id | uuid | PK, FK users.id |
| balance | numeric(12,2) | current rewards |
| lifetime_earned | numeric(12,2) | |
| reward_rate_pct | numeric(6,2) | |
| updated_at | timestamptz | |

### reward_events
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK users.id |
| amount | numeric(12,2) | positive |
| event_type | text | spend/referral/promo/adjustment |
| source_type | text | transaction/referral/etc |
| source_id | uuid | nullable |
| created_at | timestamptz | |

---

## Onboarding (screens 1-3)

### goal_options
Seed these rows once (retirement, wealth_building, education_fund, property_investment, emergency_fund, other).

| column | type | notes |
|---|---|---|
| id | uuid | PK |
| key | text | unique |
| label | text | |
| created_at | timestamptz | |

### user_goal_selections
Multi-select goals per user.

| column | type | notes |
|---|---|---|
| user_id | uuid | FK users.id |
| goal_id | uuid | FK goal_options.id |
| created_at | timestamptz | |

Primary key: `(user_id, goal_id)`

### user_investment_profile
Stores risk tolerance + starting amount choice.

| column | type | notes |
|---|---|---|
| user_id | uuid | PK, FK users.id |
| risk_tolerance | risk_tolerance | |
| starter_amount | numeric(12,2) | nullable |
| starter_amount_custom | numeric(12,2) | nullable |
| goal_other_text | text | nullable |
| completed_at | timestamptz | nullable |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

## Discover (curated portfolios)

### curated_portfolios
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| name | text | |
| description | text | nullable |
| risk_tolerance | risk_tolerance | |
| one_year_return_pct | numeric(6,2) | nullable |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### portfolio_holdings
Stores the composition shown as tickers like MPW, WELL, DOC.

| column | type | notes |
|---|---|---|
| id | uuid | PK |
| portfolio_id | uuid | FK curated_portfolios.id |
| symbol | text | |
| weight_pct | numeric(6,2) | |
| created_at | timestamptz | |

Unique: `(portfolio_id, symbol)`

### user_portfolio_positions
Tracks which portfolio a user chose or invested in.

| column | type | notes |
|---|---|---|
| id | uuid | PK |
| household_id | uuid | FK households.id |
| user_id | uuid | FK users.id |
| portfolio_id | uuid | FK curated_portfolios.id |
| amount_invested | numeric(12,2) | |
| created_at | timestamptz | |

---

## Portfolio performance

### portfolio_snapshots
Time series for Home screen chart + portfolio value.

| column | type | notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK users.id |
| household_id | uuid | FK households.id |
| portfolio_id | uuid | nullable, FK curated_portfolios.id |
| total_value | numeric(12,2) | |
| gain_amount | numeric(12,2) | nullable |
| gain_percent | numeric(6,2) | nullable |
| as_of | timestamptz | |

### portfolio_positions
User holdings inside a portfolio (optional if you only show curated holdings).

| column | type | notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK users.id |
| portfolio_id | uuid | FK curated_portfolios.id |
| symbol | text | |
| quantity | numeric(18,6) | |
| cost_basis | numeric(12,2) | nullable |
| market_value | numeric(12,2) | nullable |
| as_of | timestamptz | |

---

## Ask AI (assistant)

### assistant_threads
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK users.id |
| household_id | uuid | nullable |
| title | text | nullable |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### assistant_messages
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| thread_id | uuid | FK assistant_threads.id |
| sender | assistant_sender | |
| content | text | |
| created_at | timestamptz | |

Optional (nice for grounding): `assistant_context` with links to portfolio ids or transaction ids.

---

## Advisor scheduling

### advisors
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| name | text | |
| bio | text | nullable |
| timezone | text | |
| specialties | text[] | nullable |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### advisor_slots
Bookable time windows.

| column | type | notes |
|---|---|---|
| id | uuid | PK |
| advisor_id | uuid | FK advisors.id |
| start_at | timestamptz | |
| end_at | timestamptz | |
| status | text | available/held/booked |
| held_by_user_id | uuid | nullable, FK users.id |
| created_at | timestamptz | |

### advisor_appointments
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| advisor_id | uuid | FK advisors.id |
| user_id | uuid | FK users.id |
| slot_id | uuid | FK advisor_slots.id |
| status | text | scheduled/completed/canceled/no_show |
| notes | text | nullable |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

## Referrals

### referrals
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| owner_user_id | uuid | FK users.id |
| code | text | unique |
| created_at | timestamptz | |

### referral_events
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| referral_id | uuid | FK referrals.id |
| event_type | referral_event_type | |
| meta | jsonb | nullable |
| created_at | timestamptz | |

---

## Notifications & devices

### user_devices
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK users.id |
| platform | text | ios/android/web |
| push_token | text | nullable |
| last_seen_at | timestamptz | nullable |
| created_at | timestamptz | |

### notifications
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK users.id |
| type | text | |
| title | text | |
| body | text | |
| data | jsonb | nullable |
| read_at | timestamptz | nullable |
| created_at | timestamptz | |

---

## Indexes and constraints (recommended)
- users: unique index on `email`
- user_auth: PK `user_id`
- refresh_tokens: index `(user_id)`, unique `token_hash`
- password_resets: index `(user_id)`, unique `token_hash`
- email_verifications: index `(user_id)`, unique `token_hash`
- user_profiles: PK `user_id`
- household_members: unique `(household_id, user_id)`
- invites: unique `token`, index `(household_id, email)`
- categories: unique `(household_id, name)` when household_id is not null
- transactions: index `(household_id, txn_date desc, id desc)`
- transactions: index `(account_id, txn_date desc)`
- account_balances: PK `account_id`
- transfers: index `(household_id, created_at desc)`, index `(from_user_id)`, index `(to_user_id)`
- funding_sources: index `(user_id)`
- reward_accounts: PK `user_id`
- reward_events: index `(user_id, created_at)`
- portfolio_holdings: unique `(portfolio_id, symbol)`
- portfolio_snapshots: index `(user_id, as_of desc)`
- portfolio_positions: unique `(user_id, portfolio_id, symbol, as_of)`
- user_goal_selections: PK `(user_id, goal_id)`
- assistant_messages: index `(thread_id, created_at)`
- advisor_slots: index `(advisor_id, start_at)`
- advisor_appointments: index `(user_id, created_at)`
- referrals: unique index on `code`
- referral_events: index `(referral_id, created_at)`
- user_devices: unique `push_token`, index `(user_id)`
- notifications: index `(user_id, created_at)`, index `(user_id, read_at)`
