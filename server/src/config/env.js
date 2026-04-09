import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..", "..");

dotenv.config({
	path: [
		path.join(projectRoot, ".env.local"),
		path.join(projectRoot, ".env"),
		path.join(projectRoot, "src", ".env"),
	],
});
