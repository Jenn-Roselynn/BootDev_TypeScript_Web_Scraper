import { crawlPage } from "./crawl.js";

async function main() {
  if (process.argv.length < 3) {
    console.log("no website provided");
    process.exit(1);
  }
  if (process.argv.length > 3) {
    console.log("too many command line args");
    process.exit(1);
  }

  const baseURL = process.argv[2];
  console.log(`starting crawl of: ${baseURL}`);

  const pages = await crawlPage(baseURL);

  console.log("--- crawl complete ---");
  for (const page of Object.entries(pages)) {
    console.log(page);
  }

  process.exit(0);
}

main();