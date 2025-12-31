import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { config } from "./config.js";
import fs from 'fs';
import path, { join } from 'path';
import handlebars from 'handlebars';
import { sendMail } from "./mailer.js";

// Usar el plugin stealth para evitar detección de Cloudflare
puppeteer.use(StealthPlugin());

export async function getInstancePuppeteer(url) {
  const browser = await puppeteer.launch({
    executablePath: config.CHROMIUM_PATH,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
      "--disable-infobars",
      "--window-size=1920,1080",
    ],
    ignoreDefaultArgs: ["--enable-automation"],
  });

  const page = await browser.newPage();

  // Configurar viewport para parecer más humano
  await page.setViewport({ width: 1920, height: 1080 });

  await page.setUserAgent(config.USER_AGENT);

  // Ocultar que estamos usando webdriver
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
  });

  await page.goto(url, {
    waitUntil: "networkidle2",
    timeout: 60000,
  });

  return { browser, page };
}

export function getImportantGraphicCards(cards) {
  const finalPriceWarning = config.FINAL_PRICE_WARNING;
  const discountPercentageWarning = config.DISCOUNT_PERCENTAGE_WARNING;
  const discountPriceWarning = config.DISCOUNT_PRICE_WARNING;

  return cards.filter((card) => {
    const meetsFinalPrice = card.finalPrice <= finalPriceWarning;
    const meetsDiscount =
      card.discount >= discountPercentageWarning &&
      card.finalPrice <= discountPriceWarning;

    return meetsFinalPrice || meetsDiscount;
  });
}



export async function sendMailWithGraphicCards(importantProducts) {
  try {
    // Leer o inicializar el store
    let priceStore = {};
    if (fs.existsSync(config.storePath)) {
      try {
        priceStore = JSON.parse(fs.readFileSync(config.storePath, 'utf8'));
      } catch (e) {
        priceStore = {};
      }
    }

    // Filtrar solo productos cuyo finalPrice haya cambiado o sean nuevos
    const changedProducts = importantProducts.filter(card => {
      const prev = priceStore[card.id];
      return prev === undefined || prev !== card.finalPrice;
    });

    if (changedProducts.length === 0) {
      console.log('No hay cambios de precio, no se envía correo.');
      return;
    } else {
      console.log(`Se encontraron ${changedProducts.length} productos con cambios de precio.`);
    }

    // Actualizar el store con los nuevos precios
    changedProducts.forEach(card => {
      priceStore[card.id] = card.finalPrice;
    });
    fs.writeFileSync(config.storePath, JSON.stringify(priceStore, null, 2), 'utf8');

    // Registrar helper 'eq' para Handlebars
    handlebars.registerHelper('eq', function(a, b) {
      return a === b;
    });

    const templatePath = join(process.cwd(), 'src', 'templates', 'graphic-card-offer.hbs');
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(templateSource);
    const html = template({ cards: changedProducts });

    await sendMail({
      subject: 'Ofertas importantes de tarjetas gráficas',
      html,
    });
  } catch (error) {
    console.error('Error sending graphic cards email:', error);
  }
}
