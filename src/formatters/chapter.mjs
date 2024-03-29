import { readFile } from "fs/promises";
import { INPUT_FOLDER } from "../index.mjs";

export default async function (filename) {
	let text = `<?xml version="1.0" encoding="utf-8"?>
		<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
		<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
			<head>
				<title>Chapter</title>
				<link href="../Styles/Style.css" type="text/css" rel="stylesheet"/>
			</head>
			<body>${await readFile(`${INPUT_FOLDER}/${filename}`, "utf8")}</body>
		</html>`,
		footnoteCount = 0;

	console.log(`Wrapped ${filename} with XML`);

	const chapterMatch = text.match(/<h1><a href="(.+?)">(.+?)<\/a><\/h1>/);
	if (chapterMatch) text = text.replace(chapterMatch[0], `<h1><a href="Contents.xhtml">${chapterMatch[2]}</a></h1>`);

	// Match footnote shortcuts
	for (const match of text.match(/<a href="(.+?)"><sup>\[\d+?\]/g)) {
		// Determine footnote number from the shortcut
		const n = match.split("[")[1].slice(0, -1);

		// Replace the shortcut with a proper reference
		text = text.replace(match, `<a epub:type="noteref" id="Return${n}" href="#TN${n}"><sup>[${n}]`);

		// Increase footnote count
		footnoteCount++;

		console.log(`Found and fixed ${footnoteCount} footnote shortcut(s) from ${filename}`);
	}

	// Locate the body closing tag
	const bodyClosingTag = text.indexOf("</body>");

	// Add footnotes at the end of the body
	text = `${text.slice(0, bodyClosingTag)}
		<hr>

		${Array(footnoteCount)
			.fill()
			.map(
				(_, index) => `<aside epub:type="footnote" id="TN${index + 1}">
					<p id="footnote"><a epub:type="noteref" href="#Return${index + 1}">[${index + 1}]</a>: </p>
				</aside>`
			)
			.join("\n\n")}
		</body>
	</html>`;

	console.log(`Added ${footnoteCount} footnote(s) at the bottom of the body of ${filename}`);

	return text;
}
