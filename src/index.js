import { config } from "./config.js";
import { sendMailWithGraphicCards } from "./scrapper.js";
import { checkAmazon, checkAmazon2 } from "./sites/amazonScrapper.js";
import { checkNeobyte } from "./sites/neobyteScrapper.js";
import { checkPcComponentes, checkPcComponentes2 } from "./sites/pccomponentesScrapper.js";
import { execSync } from "child_process";

const cleanup = () => {
  try {
    execSync("pkill -f Xvfb");
    console.log("Xvfb cerrado en cleanup");
  } catch (e) {
  }
};

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
    console.log("Empieza consulta...")
    //results.push(...await checkNeobyte());
    // results.push(...await checkPcComponentes());
    // results.push(...await checkPcComponentes2());
    results.push(...await checkAmazon());
    results.push(...await checkAmazon2());
  }
  
  if (results.length > 0) {
    await sendMailWithGraphicCards(results);
    cleanup();
  }
}

runChecks(config.EXECUTION_PARALLEL);

process.on("exit", cleanup);
process.on("SIGINT", cleanup);   // Ctrl+C
process.on("SIGTERM", cleanup);  // kill
process.on("uncaughtException", (err) => {
  console.error(err);
  cleanup();
  process.exit(1);
});