# playwright-file-upload-download-tests


This project automates the file upload and download workflow on [File.io](https://file.io) using [Playwright](https://playwright.dev/) with JavaScript.

## Prerequisites

- **Node.js** 18 or later ([download](https://nodejs.org/))
- **npm** (included with Node.js)
- A stable internet connection (tests run against the live site)

## Setup

1. **Clone the repository** (or open the project folder):

   ```bash
   git clone <repository-url>
   cd playwright-file-upload-download-tests
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

## Project structure

```
project-consark/
├── pages/
│   └── filePage.js              # Page object for upload/download flows
├── tests/
│   └── test-cases-for-upload-download-file.spec.js
├── test-data/                   # Sample files used in tests
│   ├── sample-data.csv
│   ├── sample-document.pdf
│   └── sample-image.jpg
├── utils/
│   └── downloadHelper.js        # Download, file verification, cleanup
├── playwright.config.js
└── package.json
```

## Running tests

Run all tests:

```bash
npx playwright test
```

Run a single spec file:

```bash
npx playwright test tests/test-cases-for-upload-download-file.spec.js
```

Run with the Playwright UI (interactive):

```bash
npx playwright test --ui
```

Run in headed mode (browser visible) — already the default in `playwright.config.js`:

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

## What the tests do

The main spec uploads three files (CSV, image, PDF) to LimeWire, checks that the file count is correct, downloads all files as a ZIP, verifies the ZIP contents, and removes the downloaded file from the local `downloads/` folder.

## Configuration

Key settings in `playwright.config.js`:

| Setting      | Value                             |
| ------------ | --------------------------------- |
| Base URL     | `https://file.io`                 |
| Browser      | Chromium (Desktop Chrome profile) |
| Headless     | `true`                            |
| Test timeout | 120 seconds                       |
| Reporter     | HTML                              |

Downloaded files are saved under `downloads/` in the project root (created automatically during tests).

## Troubleshooting

- **Browsers not found** — Run `npx playwright install` again.
- **Timeouts** — Upload/download depends on network speed; timeouts are set to 60–120s in config. Retry on a slow connection.
- **Stale report server** — If `npx playwright show-report` fails because port 9323 is in use, stop the other process or use `npx playwright show-report --port 9324`.
- **Leftover downloads** — Delete the `downloads/` folder manually if a test exits before cleanup.

## Dependencies

- `@playwright/test` — test runner and assertions
- `adm-zip` — verify contents of downloaded ZIP archives
