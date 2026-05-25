


import { test } from "@playwright/test";
import { FilePage } from "../pages/filePage.js";

const CSV_FILE = "sample-data.csv";
const IMAGE_FILE = "sample-image.jpg";
const PDF_FILE = "sample-document.pdf";

const EXPECTED_FILES = [CSV_FILE, IMAGE_FILE, PDF_FILE];

test.describe("This testcase verifies the upload and download functionality", () => {
  let filePage;
  let downloadedFilePath;
  let downloadedQRPath;

  test.beforeEach(async ({ page }) => {
    filePage = new FilePage(page);
    await filePage.navigateToHomePage();
  });

  test.afterEach(async () => {
    if (downloadedFilePath) {
      await filePage.deleteDownloadedFile(downloadedFilePath);
    }
  });

  test("This testcase verifies the upload and download functionality", async () => {
    await test.step("Upload CSV and verify the csv is uploaded", async () => {
      await filePage.uploadInitialFileAndVerify(CSV_FILE);
    });

    await test.step("Upload image and pdf and verify both are uploaded", async () => {
      await filePage.addFileAndVerify(IMAGE_FILE);
      await filePage.addFileAndVerify(PDF_FILE);
    });

    await test.step("Verify total file count is matching in UI", async () => {
      await filePage.waitForAllUploadsToComplete();
      await filePage.verifyFileCount(EXPECTED_FILES.length);
    });

    await test.step("Download all files and verify", async () => {
      downloadedFilePath = await filePage.downloadAllFiles();
      await filePage.verifyDownloadedFiles(downloadedFilePath, EXPECTED_FILES);
    });
  });

  test("This test download the qr in the website", async () => {

    await test.step("Upload a file and verify the file uploaded", async () => {

      await filePage.uploadInitialFileAndVerify(CSV_FILE);
    })

    await test.step("Verify file count matching in the ui", async () => {
      await filePage.verifyFileCount(1);
    })

    await test.step("Download the QR image by clicking on share button", async () => {
      downloadedQRPath = await filePage.clickOnShareAndDownloadTheQR(CSV_FILE);
    })

    await test.step("Share the qr image downloaded in gmail", async () => {
      await filePage.sendQRImageInGmail("santhoshk1836@gmail.com", downloadedQRPath);
    })
  })
});
