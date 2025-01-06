import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const version = process.argv[2];

if (!version) {
  console.error("Version is required");
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const manifestPath = path.resolve(__dirname, "../manifest.json");

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

manifest.version = version;

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

console.log(`Updated manifest.json to version ${version}`);
