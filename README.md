# Playwright File Upload & Download Tests

End-to-end automation for file upload, download, and share flows on [File.io](https://file.io), which redirects to the [LimeWire](https://limewire.com) sharing UI. Built with [Playwright](https://playwright.dev/) and JavaScript using the Page Object Model.

## Prerequisites

- **Node.js** 18 or later ([download](https://nodejs.org/))
- **npm** (included with Node.js)
- A stable internet connection (tests run against the live site)
- A **`.env` file** with Gmail settings (required for the QR share-by-email test; see [Environment variables](#environment-variables))

## Setup

1. **Clone the repository** (or open the project folder):

   ```bash
   git clone <repository-url>
   cd playwright-file-upload-download-tests-main
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Install Playwright browsers** (required on first setup):

   ```bash
   npx playwright install
   ```

   Chromium only (the browser used by this project):

   ```bash
   npx playwright install chromium
   ```

4. **Create your `.env` file**:

   ```bash
   cp .env.example .env
   ```

   Fill in all three variables (see [Environment variables](#environment-variables)). `.env` is gitignored—do not commit it.

## Environment variables

Configuration lives in `.env` at the project root. Copy from `.env.example`:

| Variable               | Description |
| ---------------------- | ----------- |
| `GMAIL_USER`           | Gmail address used to send the QR email (SMTP sender). |
| `GMAIL_APP_PASSWORD`   | [Gmail App Password](https://support.google.com/accounts/answer/185833) for that account (not your normal login password). Spaces in the value are fine. |
| `QR_RECEIVER_EMAIL`    | Inbox that receives the QR image attachment in the share test. |

Example (placeholder values):

```env
GMAIL_USER="your_sender_email@gmail.com"
GMAIL_APP_PASSWORD="your_gmail_app_password"
QR_RECEIVER_EMAIL="receiver_email@example.com"
```

The QR test reads `QR_RECEIVER_EMAIL` from the environment; you do not need to edit the spec to change the recipient. `GmailHelper` loads `.env` via `dotenv` when tests run.

**Gmail account requirements**

1. Enable 2-Step Verification on the Google account used for `GMAIL_USER`.
2. Create an App Password for “Mail”.
3. Use that App Password as `GMAIL_APP_PASSWORD`.

If any variable is missing or wrong, the QR email step will fail.

## Project structure

```
├── pages/
│   └── filePage.js              # Page object: upload, download, share, QR
├── tests/
│   └── test-cases-for-upload-download-file.spec.js
├── test-data/                   # Sample files used in tests
│   ├── sample-data.csv
│   ├── sample-document.pdf
│   └── sample-image.jpg
├── utils/
│   ├── downloadHelper.js        # ZIP download, verification, URL-based saves
│   └── gmailHelper.js           # Send QR image via Gmail (Nodemailer + dotenv)
├── downloads/                   # Created at runtime (gitignored)
├── .env                         # Local secrets (gitignored)
├── .env.example                 # Template for required variables
├── playwright.config.js
└── package.json
```

## What the tests do

### 1. Upload and download all files

- Opens File.io and uploads a CSV (initial upload triggers redirect to LimeWire).
- Adds an image and PDF via **Add Files**.
- Waits for uploads to finish and asserts the UI shows **3 Files**.
- Clicks **Download All**, saves the ZIP under `downloads/`, and verifies it contains all three sample files.
- Deletes the downloaded ZIP in `afterEach` cleanup.

### 2. Download QR and share via Gmail

- Uploads a single CSV and verifies **1 File** in the UI.
- Opens **Share**, downloads the QR image (saved as `downloaded_image.svg` in `downloads/`).
- Emails the QR image to `QR_RECEIVER_EMAIL` using `GMAIL_USER` / `GMAIL_APP_PASSWORD`.
- Removes both ZIP and QR downloads in `afterEach` when present.

## Running tests

Run all tests:

```bash
npx playwright test
```

Run the spec file:

```bash
npx playwright test tests/test-cases-for-upload-download-file.spec.js
```

Run one test by title:

```bash
npx playwright test -g "upload and download functionality"
npx playwright test -g "download the qr"
```

Interactive UI:

```bash
npx playwright test --ui
```

Headed mode (visible browser):

```bash
npx playwright test --headed
```

## Test report

Open the HTML report after a run:

```bash
npx playwright show-report
```

Failed tests keep traces (`trace: 'retain-on-failure'` in `playwright.config.js`):

```bash
npx playwright show-trace test-results/<run-folder>/trace.zip
```

## Playwright configuration

| Setting            | Value                             |
| ------------------ | --------------------------------- |
| Base URL           | `https://file.io`                 |
| Browser            | Chromium (Desktop Chrome profile) |
| Headless           | `true`                            |
| Test timeout       | 120 seconds                       |
| Expect timeout     | 60 seconds                        |
| Navigation timeout | 120 seconds                       |
| Action timeout     | 30 seconds                        |
| Reporter           | HTML                              |
| Parallelism        | `fullyParallel: true`             |

Artifacts are written under `downloads/` (created automatically; gitignored).

## Troubleshooting

- **Browsers not found** — Run `npx playwright install` again.
- **Timeouts** — Upload/download depends on network speed; config uses 30–120s timeouts.
- **Redirect not detected** — First upload must reach a LimeWire URL; check that File.io is reachable.
- **Gmail / SMTP errors** — Verify App Password, 2FA, and that `GMAIL_USER` owns the App Password.
- **`QR_RECEIVER_EMAIL` undefined** — Ensure `.env` exists in the project root and includes `QR_RECEIVER_EMAIL`; restart the test run after editing `.env`.
- **Stale report server** — If port 9323 is busy: `npx playwright show-report --port 9324`.
- **Leftover downloads** — Delete `downloads/` manually if a test exits before cleanup.

## Dependencies

| Package            | Purpose                                     |
| ------------------ | ------------------------------------------- |
| `@playwright/test` | Test runner, browser automation, assertions |
| `adm-zip`          | Verify downloaded ZIP contents              |
| `dotenv`           | Load `.env` for Gmail and receiver email    |
| `nodemailer`       | Send QR attachments via Gmail SMTP            |
