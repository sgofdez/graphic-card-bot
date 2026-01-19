import { getConfig } from "./config.js";
import { sendMailWithGraphicCards } from "./scrapper.js";
import { PcComponentesScrapper } from "./sites/pccomponentesScrapper.js";
import { NeobyteScrapper } from "./sites/neobyteScrapper.js";

async function main() {
  const config = await getConfig();

  if (!config.CHROMIUM_PATH) {
    throw new Error("CHROMIUM_PATH no definido en .env");
  }

  async function runChecks(parallel = true) {
    let results = [];

    // Obtener links desde config.LINKS (array)
    const pccomLinks = config.LINKS.filter(l => l.type === 'pccomponentes').map(l => l.url);
    const neobyteLinks = config.LINKS.filter(l => l.type === 'neobyte').map(l => l.url);

    if (pccomLinks.length === 0 && neobyteLinks.length === 0) {
      console.log('No hay links configurados en config.local.js (LINKS)');
      return;
    }

    if (parallel) {
      // EJECUCIÓN SIMULTÁNEA
      const promises = [];

      for (const link of pccomLinks) {
        const pcComScrapper = new PcComponentesScrapper(link);
        promises.push(pcComScrapper.checkOffers(config));
      }

      for (const link of neobyteLinks) {
        const neobyteScrapper = new NeobyteScrapper(link);
        promises.push(neobyteScrapper.checkOffers(config));
      }

      results = (await Promise.all(promises)).flat();


    } else {
      // EJECUCIÓN SECUENCIAL
      for (const link of pccomLinks) {
        const pcComScrapper = new PcComponentesScrapper(link);
        const pccomResults = await pcComScrapper.checkOffers(config);
        results = results.concat(pccomResults);
      }

      for (const link of neobyteLinks) {
        const neobyteScrapper = new NeobyteScrapper(link);
        const neobyteResults = await neobyteScrapper.checkOffers(config);
        results = results.concat(neobyteResults);
      }
    }

    if (results.length > 0) {
      await sendMailWithGraphicCards(results, config);
    }
  }

  await runChecks(config.EXECUTION_PARALLEL);
}

main();

