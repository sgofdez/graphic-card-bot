import { config } from "./config.js";
import { sendMailWithGraphicCards } from "./scrapper.js";
import { checkNeobyte } from "./sites/neobyteScrapper.js";
import { checkPcComponentes, checkPcComponentes2 } from "./sites/pccomponentesScrapper.js";

if (!config.CHROMIUM_PATH) {
  throw new Error("CHROMIUM_PATH no definido en .env");
}

(async () => {
  const [neobyteResult, pccomResult, pccomResult2] = await Promise.all([
    checkNeobyte(),
    checkPcComponentes(),
    checkPcComponentes2()
  ]
  );

  const allResults = [
    ...neobyteResult,
    ...pccomResult,
    ...pccomResult2
  ];

  if (allResults.length > 0) {
    await sendMailWithGraphicCards(allResults);
  }

})();
