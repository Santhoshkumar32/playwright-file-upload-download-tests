# Playwright File Upload & Download Tests

End-to-end automation for file upload, download, and share flows on [File.io](https://file.io), which redirects to the [LimeWire](https://limewire.com) sharing UI. Built with [Playwright](https://playwright.dev/) and JavaScript using the Page Object Model.

## Prerequisites

- **Node.js** 18 or later ([download](https://nodejs.org/))
- **npm** (included with Node.js)
- A stable internet connection (tests run against the live site)
- **Gmail credentials** (only required for the QR share-by-email test; see [Gmail setup](#gmail-setup))

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

   To install only Chromium (the browser used by this project):

   ```bash
   npx playwright install chromium
   ```

4. **Configure environment variables** (for the Gmail test):

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set your sender account and [Gmail App Password](https://support.google.com/accounts/answer/185833):

   ```
   GMAIL_USER=your_sender_email@gmail.com
   GMAIL_APP_PASSWORD=your_gmail_app_password
   ```

   `.env` is gitignored; never commit real credentials.

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
│   └── gmailHelper.js           # Send QR image via Gmail (Nodemailer)
├── downloads/                   # Created at runtime (gitignored)
├── .env.example                 # Template for Gmail credentials
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
- Opens **Share**, downloads the QR image from the page (saved as `downloaded_image.svg` in `downloads/`).
- Sends the QR image as an email attachment using Gmail (`GmailHelper` + credentials from `.env`).
- Update the recipient address in the spec if you want mail sent to a different inbox.

## Running tests

Run all tests:

```bash
npx playwright test
```

Run a single spec file:

```bash
npx playwright test tests/test-cases-for-upload-download-file.spec.js
```

Run one test by title:

```bash
npx playwright test -g "upload and download functionality"
npx playwright test -g "download the qr"
```

Run with the Playwright UI (interactive):

```bash
npx playwright test --ui
```

Run in headed mode (browser visible):

```bash
npx playwright test --headed
```

## Test report

After a run, open the HTML report:

```bash
npx playwright show-report
```

Failed tests retain traces when configured (`trace: 'retain-on-failure'` in `playwright.config.js`). View a trace:

```bash
npx playwright show-trace test-results/<run-folder>/trace.zip
```

## Configuration

Key settings in `playwright.config.js`:

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

Downloaded files are saved under `downloads/` in the project root (created automatically during tests).

## Gmail setup

The QR share test uses [Nodemailer](https://nodemailer.com/) with Gmail SMTP:

1. Use a Google account with 2-Step Verification enabled.
2. Create an **App Password** for “Mail” (not your regular account password).
3. Copy `.env.example` to `.env` and fill in `GMAIL_USER` and `GMAIL_APP_PASSWORD`.
4. Ensure the recipient email in `tests/test-cases-for-upload-download-file.spec.js` is correct for your environment.

If Gmail variables are missing or invalid, the QR email step will fail.

## Troubleshooting

- **Browsers not found** — Run `npx playwright install` again.
- **Timeouts** — Upload and download depend on network speed; config uses 30–120s timeouts. Retry on a slow connection.
- **Redirect not detected** — The first upload must redirect to a LimeWire URL; check connectivity and that File.io is reachable.
- **Gmail / SMTP errors** — Confirm App Password, 2FA, and that `GMAIL_USER` matches the account that created the password.
- **Stale report server** — If `npx playwright show-report` fails because port 9323 is in use, stop the other process or use `npx playwright show-report --port 9324`.
- **Leftover downloads** — Delete the `downloads/` folder manually if a test exits before cleanup.

## Dependencies

| Package            | Purpose                                      |
| ------------------ | -------------------------------------------- |
| `@playwright/test` | Test runner, browser automation, assertions  |
| `adm-zip`          | Verify contents of downloaded ZIP archives   |
| `dotenv`           | Load Gmail credentials from `.env`           |
| `nodemailer`       | Send QR image attachments via Gmail SMTP     |
