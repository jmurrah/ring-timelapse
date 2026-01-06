import { fileURLToPath } from "node:url";
import { argv } from "node:process";
import { setup } from "./utils/setup.js";

const isMain = fileURLToPath(import.meta.url) === argv[1];

if (isMain) {
  await setup();
}
