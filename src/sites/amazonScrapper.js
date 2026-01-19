import { getImportantGraphicCards, getInstancePuppeteer } from "../scrapper.js";

export async function checkAmazon() {
  const PRODUCT_URL =
    "https://www.amazon.es/ASUS-GeForce-Compatible-Ventiladores-Axial-Tech/dp/B0DS65VMC6?th=1";
  const { browser, page } = await getInstancePuppeteer(PRODUCT_URL);

  await new Promise(resolve => setTimeout(resolve, 6000)); // Cloudlflare delay

  await rejectCookies(page);

  const products = await getInfoCards(page);
  browser.close();

  return getImportantGraphicCards(products);
}

export async function rejectCookies(page) {
  const buttonId = "sp-cc-accept";
  try {
    const button = await page.waitForSelector(`#${buttonId}`, {
      timeout: 5000,
    });
    await button.click();
  } catch (error) {
    console.log(error);
    return;
  }
}

export async function checkAmazon2() {
  const PRODUCT_URL =
    "https://www.amazon.es/ASUS-GeForce-Compatible-Ventiladores-Axial-Tech/dp/B0DS65KD1C?th=1";
  const { browser, page } = await getInstancePuppeteer(PRODUCT_URL);

  await new Promise(resolve => setTimeout(resolve, 6000)); // Cloudlflare delay

  await rejectCookies(page);

  const products = await getInfoCards(page);
  browser.close();

  return getImportantGraphicCards(products);
}

export async function rejectCookies(page) {
  const buttonId = "sp-cc-accept";
  try {
    const button = await page.waitForSelector(`#${buttonId}`, {
      timeout: 5000,
    });
    await button.click();
  } catch (error) {
    console.log(error);
    return;
  }
}

export async function getInfoCards(page) {
  const results = [];

  const finalPrice = await page.$eval(
    "#corePrice_feature_div .a-offscreen",
    el => {
      console.log("llego");
      const priceText = el.textContent.trim();
      const clean = priceText
        .replace(/\./g, "") // quita puntos de miles
        .replace(/,/, ".")   // cambia la coma decimal por punto
        .replace(/[^\d.]/g, ""); // elimina cualquier otro caracter
      return Number(clean);
    }
  ).catch(() => null);

  const ssfData = await page.$eval(
    '#ssf-primary-widget-desktop',
    el => {
      const raw = el.getAttribute('data-ssf-share-icon');
      if (!raw) return null;

      // Decodificar HTML entities usando el DOM
      const decoded = new DOMParser()
        .parseFromString(raw, 'text/html')
        .documentElement.textContent;

      try {
        return JSON.parse(decoded);
      } catch {
        return null;
      }
    }
  ).catch(() => null);

  if (!ssfData || !finalPrice) return [];

  const title = ssfData.title;

  const url = ssfData.url;

  const id = ssfData.shareDataAttributes.asin + "-ama";

  const imgUrl = ssfData.image;

  const discount = 0;

  const stock = true;

  const originalPrice = 0;

  results.push({
    id,
    title,
    url,
    finalPrice,
    originalPrice,
    discount,
    stock,
    imgUrl,
    shop: "Amazon",
  });

  return results;
}

