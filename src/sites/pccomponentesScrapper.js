import { getImportantGraphicCards, getInstancePuppeteer } from "../scrapper.js";


export class PcComponentesScrapper {

  url = ""
  externalShop = false;

  constructor(url) {
    this.url = url
    this.externalShop = this.url.includes('seller=marketplace');
  }

  async checkOffers(config) {
    const { browser, page } = await getInstancePuppeteer(this.url, config);

    console.info(`Buscando ofertas en ${this.url}`);


    await new Promise(resolve => setTimeout(resolve, 6000)); // Cloudlflare delay


    await this.rejectCookies(page);
    await this.lowerPriceAsc(page);

    const products = await this.getInfoCards(page);
    browser.close();

    return getImportantGraphicCards(products, this.url, config);
  }

  async rejectCookies(page) {
    const buttonId = "cookiesrejectAll";
    try {
      const button = await page.waitForSelector(`#${buttonId}`, {
        timeout: 5000,
      });
      await button.click();
    } catch (error) {
      return;
    }
  }

  async lowerPriceAsc(page) {
    const buttonId = "sorting-price_asc";

    try {
      const button = await page.waitForSelector(`#${buttonId}`, {
        timeout: 10000,
      });
      await button.click();
    } catch (error) {
      console.log('No se pudo ordenar por precio ascendente');
      return;
    }
  }

  async getInfoCards(page) {

    // Esperar a que exista al menos uno de los dos contenedores
    await page.waitForFunction(() => {
      return document.getElementById('category-list-product-grid') || document.getElementById('search-results-product-grid');
    }, { timeout: 50000 });

    let container = await page.$("#category-list-product-grid");
    if (!container) container = await page.$("#search-results-product-grid");
    if (!container) throw new Error("Contenedor no encontrado");

    const cards = await container.$$("a[data-testid='normal-link']");
    if (cards.length === 0) throw new Error("No se encontraron tarjetas");

    const results = [];

    for (const card of cards) {
      const title = await card.evaluate((el) => el.getAttribute("title"));

      const url = await card.evaluate((el) => el.href);

      const id = await card.evaluate((el) => el.getAttribute("data-product-id")) + (this.externalShop ? "-pccom-marketplace" : "-pccom");

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
        shop: this.externalShop ? "PcComponentes Marketplace" : "PcComponentes",
      });
    }

    return results;
  }
}



