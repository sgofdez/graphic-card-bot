import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { config } from "./config.js";
import fs from 'fs';
import { join } from 'path';
import handlebars from 'handlebars';
import { sendMail } from "./mailer.js";
import { connect } from "puppeteer-real-browser";

// Usar el plugin stealth para evitar detección de Cloudflare
puppeteer.use(StealthPlugin());

export async function getInstancePuppeteer(url) {
  const { browser, page } = await connect({
    headless: false,

    args: [],

    customConfig: {},

    turnstile: true,

    connectOption: {},

    disableXvfb: false,
    ignoreAllFlags: false,
  });
  await page.goto(url);

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
