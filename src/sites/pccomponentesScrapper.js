import { getImportantGraphicCards, getInstancePuppeteer } from "../scrapper.js";

export async function checkPcComponentes() {
  const PRODUCT_URL =
    "https://www.pccomponentes.com/tarjetas-graficas/geforce-rtx-5080/grafica-nvidia?seller=pccomponentes";
  const { browser, page } = await getInstancePuppeteer(PRODUCT_URL);

  await new Promise(resolve => setTimeout(resolve, 2000));

  await rejectCookies(page);
  await lowerPriceAsc(page);

  const products = await getInfoCards(page);
  browser.close();

  return getImportantGraphicCards(products);
}

export async function checkPcComponentes2() {
  const PRODUCT_URL =
    "https://www.pccomponentes.com/tarjetas-graficas/geforce-rtx-5080/grafica-nvidia?seller=marketplace";
  const { browser, page } = await getInstancePuppeteer(PRODUCT_URL);

  await new Promise(resolve => setTimeout(resolve, 2000));

  await rejectCookies(page);
  await lowerPriceAsc(page);

  const products = await getInfoCards(page, true);
  browser.close();

  return getImportantGraphicCards(products);
}


export async function rejectCookies(page) {
  const buttonId = "cookiesrejectAll";
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

export async function lowerPriceAsc(page) {
  const buttonId = "sorting-price_asc";

  try {
    const button = await page.waitForSelector(`#${buttonId}`, {
      timeout: 10000,
    });
    await button.click();
  } catch (error) {
    console.log(error);
    return;
  }
}

export async function getInfoCards(page, externalShop = false) {
  await page.waitForSelector(
    "#category-list-product-grid a[data-testid='normal-link']",
    { timeout: 10000 }
  );

  const container = await page.$("#category-list-product-grid");
  if (!container) throw new Error("Contenedor no encontrado");

  const cards = await container.$$("a[data-testid='normal-link']");
  if (cards.length === 0) throw new Error("No se encontraron tarjetas");

  const results = [];

  for (const card of cards) {
    const title = await card.evaluate((el) => el.getAttribute("title"));

    const url = await card.evaluate((el) => el.href);

    const id = await card.evaluate((el) => el.getAttribute("data-product-id")) + (externalShop ? "-pccom-marketplace" : "-pccom");

    const imgContainer = await card.$(".product-card img");
    let imgUrl = null;
    if (imgContainer) {
      imgUrl = await imgContainer.evaluate((el) => el.src);
    }

    const finalPrice = await card.evaluate((el) =>
      Number(el.getAttribute("data-product-price"))
    );

    const discount = await card.evaluate((el) =>
      Number(el.getAttribute("data-product-total-discount"))
    );

    const stock = await card.evaluate((el) =>
      el.getAttribute("data-product-stock-web")
    );

    const originalpriceContainer = await card.$(
      "span[data-e2e='crossedPrice']"
    );

    let originalPrice = finalPrice;
    if (originalpriceContainer) {
      originalPrice = await originalpriceContainer.evaluate((el) => {
        const clean = el.textContent
          .replace(/\./g, "") // quita puntos de miles
          .replace(/,/, ".")   // cambia la coma decimal por punto
          .replace(/[^\d.]/g, "") // elimina cualquier otro caracter
          .trim();
        return Number(clean);
      });
    }

    results.push({
      id,
      title,
      url,
      finalPrice,
      originalPrice,
      discount,
      stock,
      imgUrl,
      shop: externalShop ? "PcComponentes Marketplace" : "PcComponentes",
    });
  }

  return results;
}
