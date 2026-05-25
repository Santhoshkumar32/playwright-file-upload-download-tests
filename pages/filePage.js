import { expect } from "@playwright/test";
import path from "path";
import { DownloadHelper } from "../utils/downloadHelper.js";
import { GmailHelper } from "../utils/gmailHelper.js";

const TEST_DATA_DIR = path.resolve(__dirname, "../test-data");

export class FilePage {
  constructor(page) {
    this.page = page;
    this.downloadHelper = DownloadHelper;
    this.gmailHelper = GmailHelper;

    this.btnUploadFile = "//label[@for='select-files-input']";
    this.menuListItems = "(//button[@aria-haspopup='menu'])[1]";
    this.menuItemAddFiles = "//div[@role='menuitem']//span[text()='Add Files']";
    this.btnDownloadAllFiles = "//button//span[text()='Download All']";
    this.fileNameLocator = (fileName) =>
      `//span[@content-item-decryption-id and contains(normalize-space(.), "${fileName}")]`;
    this.uploadingIndicator = (fileName) =>
      `//span[@content-item-decryption-id and contains(normalize-space(.), "${fileName}")] /ancestor::div[contains(@class,"aspect-square")] //div[contains(text(), "%")]`;
    this.imgQRShare = (fileName) => `//h2[text()="${fileName}"]//ancestor::div[2]//div//img`
    this.btnShare = '//span[text()="Share"]';
    this.txtUploadIndicator = '//div[contains(text(), "%")]';
  }

  async navigateToHomePage() {
    await this.page.goto("/");
    await this.page.waitForLoadState("networkidle");
  }

  // Waits for the app to redirect to LimeWire after the initial file upload
  async waitForPageRedirect() {
    await expect(this.page).toHaveURL(/limewire/, { timeout: 60000 });
    await this.page.waitForLoadState("domcontentloaded");
  }

  async uploadFile(selector, fileName) {
    const filePath = path.resolve(TEST_DATA_DIR, fileName);

    const fileChooserPromise = this.page.waitForEvent("filechooser");
    await this.page.locator(selector).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);
  }

  async verifyFileVisible(fileName) {
    await expect(
      this.page.locator(this.fileNameLocator(fileName)),
    ).toBeVisible();
  }

  async waitForUploadToComplete(fileName) {

    try {
      await uploadProgress.waitFor({ state: "visible", timeout: 5000 });
    } catch {
      // Progress percentage may not appear if upload completes quickly
    }
    await this.page
      .locator(this.uploadingIndicator(fileName))
      .waitFor({ state: "hidden", timeout: 60000 });
  }

  async waitForAllUploadsToComplete() {
    await expect(this.page.locator(this.txtUploadIndicator)).toHaveCount(0, {
      timeout: 60000,
    });
  }

  async uploadInitialFileAndVerify(fileName) {
    await this.uploadFile(this.btnUploadFile, fileName);
    await this.waitForPageRedirect();
    await this.waitForUploadToComplete(fileName);
    await this.verifyFileVisible(fileName);
  }

  async addFileAndVerify(fileName) {
    await this.page.locator(this.menuListItems).click();
    await this.uploadFile(this.menuItemAddFiles, fileName);
    await this.waitForUploadToComplete(fileName);
    await this.verifyFileVisible(fileName);
  }

  async verifyFileCount(count) {
    let fileCount;
    if (count == 1) {
      fileCount = "1 File";
    }
    else {
      fileCount = count + " Files";
    }
    await expect(this.page.getByText(fileCount)).toBeVisible({
      timeout: 30000,
    });
  }

  async downloadAllFiles() {
    return await this.downloadHelper.downloadFileAndReturnPath(
      this.page,
      this.btnDownloadAllFiles,
    );
  }

  async verifyDownloadedFiles(filePath, extension, expectedFiles) {
    await this.downloadHelper.verifyFilesInsideZip(
      filePath,
      extension,
      expectedFiles,
    );
  }

  async deleteDownloadedFile(filePath) {
    await this.downloadHelper.deleteFile(filePath);
  }

  async clickOnShareAndDownloadTheQR(fileName) {
    await this.page.locator(this.btnShare).click();
    const imgSrc = await this.page.locator(this.imgQRShare(fileName)).getAttribute('src');
    const filePath = await this.downloadHelper.downloadFileFromUrl(this.page, imgSrc);
    return filePath;
  }

  async sendQRImageInGmail(toEmail, filePath) {
    await this.gmailHelper.sendImageInGmail(toEmail, filePath);
  }
}
