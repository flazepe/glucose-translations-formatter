import { existsSync } from "fs";
import { mkdir, readdir, writeFile } from "fs/promises";
import { format } from "prettier";
import formatters from "./formatters/index.mjs";

export const INPUT_FOLDER = "_input",
	OUTPUT_FOLDER = "_output";

for (const filename of await readdir(INPUT_FOLDER)) {
	let text;

	// Formatters
	if (filename.startsWith("Chapter")) {
		console.log(`Formatting chapter file: ${filename}`);
		text = await formatters.chapter(filename);
	} else {
		continue;
	}

	// Format text
	if (!existsSync(OUTPUT_FOLDER)) await mkdir(OUTPUT_FOLDER);
	writeFile(`${OUTPUT_FOLDER}/${filename}`, await format(text, { parser: "html", printWidth: 100, tabWidth: 4 }));

	console.log(`Formatted and saved ${filename}`);
}

console.log("Done!");
