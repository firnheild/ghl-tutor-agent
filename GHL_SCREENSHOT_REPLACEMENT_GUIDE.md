# GHL Screenshot Replacement Guide

Use this guide when replacing the current redacted mock visuals with real screenshots from a demo or training GoHighLevel account.

## Rule

Only use screenshots from an account you control or have permission to use for training. Never include real client leads, phone numbers, email addresses, API keys, webhook URLs, billing details, private messages, account IDs, or medical/financial information.

## Screenshot Set

Replace the files in `public/ghl-snippets/` or update `content/visual-snippets.json` with new paths.

| File | What To Capture | What To Redact |
| --- | --- | --- |
| `orientation-dashboard.svg` | Launchpad or dashboard with left navigation visible. | Account name, revenue, client metrics, IDs. |
| `crm-contacts.svg` | Contacts list plus one contact detail area showing tags/fields. | Names, phone, email, notes, addresses. |
| `pipeline-opportunities.svg` | Opportunities board with stage columns. | Lead names, deal values, client notes. |
| `calendar-booking.svg` | Calendar availability, booking rules, or booking link preview. | Staff private calendars, real bookings. |
| `forms-funnels.svg` | Form builder, funnel page, and thank-you page. | Domain, client copy, real submissions. |
| `conversations-inbox.svg` | Conversations inbox with mock replies. | Real messages, phone numbers, email addresses. |
| `workflow-builder.svg` | Workflow canvas with trigger, actions, waits, and conditions. | Real message copy, webhook URLs, API actions. |
| `client-implementation.svg` | Checklist, settings, QA notes, or handoff plan. | Client names, internal documents. |
| `external-automation.svg` | GHL webhook boundary plus Make, n8n, Zapier, Sheets, or Slack. | Webhook URLs, tokens, secrets, workspace names. |
| `portfolio-proof.svg` | Final proof pack or case study layout. | Any real personal or client data. |

## Recommended Workflow

1. Create fake contacts and fake opportunities first.
2. Screenshot only demo data.
3. Crop tightly around the UI area being taught.
4. Redact sensitive values before adding the file to the repo.
5. Keep filenames stable when possible so lesson content does not need code changes.
6. Re-run `npm.cmd run build` after replacing assets.

## Quality Standard

A premium screenshot should help the student answer: "Where is this in GHL, what am I looking at, and what should I do next?"
