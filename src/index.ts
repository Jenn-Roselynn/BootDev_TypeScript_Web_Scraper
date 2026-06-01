import { getHTML } from "./crawl.js";

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

  const html = await getHTML(baseURL);
  if (html) {
    console.log(html);
  }

  process.exit(0);
}

main();