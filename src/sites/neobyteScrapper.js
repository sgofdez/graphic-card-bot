import { getImportantGraphicCards, getInstancePuppeteer, sendMailWithGraphicCards } from "../scrapper.js";

export class NeobyteScrapper {

  url = ""

  constructor(url) {
    this.url = url
  }

  async checkOffers(config) {
    const { browser, page } = await getInstancePuppeteer(this.url, config);

    console.info(`Buscando ofertas en ${this.url}`);

    await new Promise(resolve => setTimeout(resolve, 6000)); // Cloudlflare delay

    const products = await this.getInfoCards(page);
    browser.close();

    return getImportantGraphicCards(products, this.url, config);
  }

  async getInfoCards(page) {
    await page.waitForSelector(
      ".products-grid .product-miniature",
      { timeout: 10000 }
    );

    const container = await page.$(".products-grid");
    if (!container) throw new Error("Contenedor no encontrado");

    const cards = await container.$$(".product-miniature");
    if (cards.length === 0) throw new Error("No se encontraron tarjetas");

    const results = [];

    for (const card of cards) {

      const urlContainer = await card.$(".thumbnail-container a");
      let url = null;
      if (urlContainer) {
        url = await urlContainer.evaluate((el) => el.href);
      }

      const id = await card.evaluate((el) => el.getAttribute("data-id-product")) + "-neo";

      const imgContainer = await card.$(".product-thumbnail img");
      let imgUrl = null;
      if (imgContainer) {
        imgUrl = await imgContainer.evaluate((el) => el.src);
      }

      const cardDataContainer = await card.$(".product-description");
      let title = null;
      let finalPrice = null;
      let discount = 0;
      let stock = null;
      let originalPrice = null;
      if (cardDataContainer) {
        title = await cardDataContainer.evaluate((el) => {
          const titleElement = el.querySelector(".product-title");
          return titleElement ? titleElement.textContent.trim() : null;
        });

        finalPrice = await cardDataContainer.evaluate((el) => {
          const priceElement = el.querySelector(".product-price-and-shipping .product-price");
          return priceElement ? Number(priceElement.getAttribute("content")) : null;
        });

        originalPrice = await cardDataContainer.evaluate((el) => {
          const discountElement = el.querySelector(".regular-price");
          if (discountElement) {
            // Elimina puntos de miles y cambia la coma decimal por punto
            const clean = discountElement.textContent
              .replace(/\./g, "") // quita puntos de miles
              .replace(/,/, ".")   // cambia la coma decimal por punto
              .replace(/[^\d.]/g, "") // elimina cualquier otro caracter
              .trim();
            return Number(clean);
          }
          return null;
        });

        if (originalPrice && finalPrice) {
          discount = Math.round(((originalPrice - finalPrice) / originalPrice) * 100);
        } else {
          discount = 0;
        }

        if (originalPrice === null) {
          originalPrice = finalPrice;
        }
      }

      stock = true;


      results.push({
        id,
        title,
        url,
        finalPrice,
        originalPrice,
        discount,
        stock,
        imgUrl,
        shop: "Neobyte",
      });
    }

    return results;
  }

}



