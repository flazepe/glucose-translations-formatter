import JSZip from "https://esm.run/jszip";
import formatChapter from "./formatChapter.mjs";

document.getElementById("files").onchange = async function () {
	const a = document.createElement("a");

	if (this.files.length > 1) {
		const zip = new JSZip();

		for (const file of this.files) {
			const { filename, blob } = await formatChapter(file);
			zip.file(filename, blob);
		}

		log(`Zipped ${this.files.length} files`);

		a.download = "chapters.zip";
		a.href = URL.createObjectURL(await zip.generateAsync({ type: "blob" }));
	} else {
		const { filename, blob } = await formatChapter(this.files[0]);

		a.download = filename;
		a.href = URL.createObjectURL(blob);
	}

	log("Downloading formatted file(s)");

	a.click();
};

export function log(message) {
	document.getElementById("logs").innerText += `\n${message}`;
}
