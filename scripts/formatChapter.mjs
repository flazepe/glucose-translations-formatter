import { format } from "https://esm.run/prettier";
import htmlPlugin from "https://esm.run/prettier/plugins/html.mjs";
import { log } from "./index.mjs";

export default async function (file) {
	log(`Formatting ${file.name}`);

	let text = `<?xml version="1.0" encoding="utf-8"?>
		<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
		<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
			<head>
				<title>Chapter</title>
				<link href="../Styles/Style.css" type="text/css" rel="stylesheet"/>
			</head>
			<body>${await file.text()}</body>
		</html>`;

	log(`Wrapped ${file.name} with XML`);

	const chapterMatch = text.match(/<h1><a href=".*?">(.*?)<\/a><\/h1>/);
	if (chapterMatch) text = text.replace(chapterMatch[0], `<h1><a href="Contents.xhtml">${chapterMatch[1]}</a></h1>`);

	const footnoteCount = 0;

	for (const match of text.match(/<a href=".*?">.*?<sup>.*?\[\d+?\].*?<\/sup>.*?<\/a>/g) ?? []) {
		// Determine footnote number
		const n = match.split("[")[1].split("]")[0];

		// Replace with a proper reference
		text = text.replace(match, `<a epub:type="noteref" id="Return${n}" href="#TN${n}">${match.match(/<a.*?>(.*?)<\/a>/)[1]}</a>`);

		// Increase footnote count
		footnoteCount++;

		log(`Found and fixed ${footnoteCount} footnote shortcut(s) from ${file.name}`);
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

	log(`Added ${footnoteCount} footnote(s) at the bottom of the body of ${file.name}`);

	text = await format(text, {
		parser: "html",
		plugins: [htmlPlugin],
		printWidth: 100,
		tabWidth: 4
	});

	log(`Formatted ${file.name}`);

	return {
		filename: file.name,
		blob: new Blob([text], { type: "application/xml" })
	};
}
