import path from "path";
import fs from "fs";
import AdmZip from "adm-zip";
import { expect } from "@playwright/test";

export const DownloadHelper = {
  async downloadFileAndReturnPath(page, selector, timeout = 30000) {
    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout }),
      page.locator(selector).click(),
    ]);

    // Create downloads directory if it doesn't exist
    const downloadsDir = path.join(process.cwd(), "downloads");
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    const suggestedFilename = download.suggestedFilename();
    const filePath = path.join(downloadsDir, suggestedFilename);
    await download.saveAs(filePath);

    expect(
      fs.existsSync(filePath),
      `Downloaded file should exist at path: ${filePath}`,
    ).toBeTruthy();

    return filePath;
  },

  async verifyFileExists(filePath) {
    expect(
      fs.existsSync(filePath),
      `Downloaded file not found: ${filePath}`,
    ).toBeTruthy();
  },

  async verifyFileExtension(filePath, expectedExtension) {
    const actualExtension = path.extname(filePath);

    expect(
      actualExtension,
      `Expected downloaded file extension to be ${expectedExtension}, but got ${actualExtension}`,
    ).toBe(expectedExtension);
  },

  async verifyExpectedFilesArePresent(actualFiles, expectedFiles) {
    for (const expectedFile of expectedFiles) {
      expect(
        actualFiles,
        `Expected file "${expectedFile}" was not found inside ZIP. Actual files: ${actualFiles.join(", ")}`,
      ).toContain(expectedFile);
    }
  },

  async verifyFilesInsideZip(filePath, expectedFiles = []) {
    this.verifyFileExists(filePath);
    this.verifyFileExtension(filePath, ".zip");
    const zipFile = new AdmZip(path.resolve(filePath));

    const actualFiles = zipFile
      .getEntries()
      .filter((entry) => !entry.isDirectory)
      .map((entry) => path.basename(entry.entryName));

    this.verifyExpectedFilesArePresent(actualFiles, expectedFiles);
  },

  async deleteFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return;
      }
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error(`Failed to delete file ${filePath}:`, err.message);
    }
  },

  async downloadFileFromUrl(
    page,
    url,
    filename = "downloaded_image.svg",
    savePath = null
  ) {

    expect(url).toBeTruthy();
    expect(url).toBeTruthy();

    if (!savePath) {
      savePath = path.join(process.cwd(), "downloads");
    }
    await fs.promises.mkdir(savePath, { recursive: true });
    const filePath = path.join(savePath, filename);
    const bytes = await page.evaluate(async (blobUrl) => {
      const response = await fetch(blobUrl);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();

      return Array.from(new Uint8Array(arrayBuffer));
    }, url);

    let buffer = Buffer.from(bytes);
    await fs.promises.writeFile(filePath, buffer);
    return filePath;
  }
};
