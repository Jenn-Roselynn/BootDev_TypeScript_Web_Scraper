import { crawlSiteAsync } from "./crawl.js";

async function main() {
  if (process.argv.length < 5) {
    console.log("not enough arguments provided");
    console.log("usage: npm run start <URL> <maxConcurrency> <maxPages>");
    process.exit(1);
  }
  if (process.argv.length > 5) {
    console.log("too many command line args");
    process.exit(1);
  }

  const baseURL = process.argv[2];
  const maxConcurrency = parseInt(process.argv[3], 10);
  const maxPages = parseInt(process.argv[4], 10);

  if (isNaN(maxConcurrency) || isNaN(maxPages)) {
    console.log("maxConcurrency and maxPages must be numbers");
    process.exit(1);
  }

  console.log(`starting crawl of: ${baseURL}`);
  console.log(`concurrency: ${maxConcurrency}, max pages: ${maxPages}`);

  const pages = await crawlSiteAsync(baseURL, maxConcurrency, maxPages);

  console.log("Finished crawling.");
  const firstPage = Object.values(pages)[0];
  if (firstPage) {
    console.log(
      `First page record: ${firstPage["url"]} - ${firstPage["heading"]}`,
    );
  }

  process.exit(0);
}

main();