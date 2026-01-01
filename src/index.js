import { config } from "./config.js";
import { sendMailWithGraphicCards } from "./scrapper.js";
import { checkNeobyte } from "./sites/neobyteScrapper.js";
import { checkPcComponentes, checkPcComponentes2 } from "./sites/pccomponentesScrapper.js";

if (!config.CHROMIUM_PATH) {
  throw new Error("CHROMIUM_PATH no definido en .env");
}

async function runChecks(parallel = true) {
  let results = [];

  if (parallel) {
    // EJECUCIÓN SIMULTÁNEA
    const [neobyteResult, pccomResult, pccomResult2] = await Promise.all([
      checkNeobyte(),
      checkPcComponentes(),
      checkPcComponentes2()
    ]);

    results = [
      ...neobyteResult,
      ...pccomResult,
      ...pccomResult2
    ];
  } else {
    // EJECUCIÓN SECUENCIAL
    results.push(...await checkNeobyte());
    results.push(...await checkPcComponentes());
    results.push(...await checkPcComponentes2());
  }

  if (results.length > 0) {
    await sendMailWithGraphicCards(results);
  }
}

runChecks(config.EXECUTION_PARALLEL);

