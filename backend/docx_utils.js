const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs');
const path = require('path');

/**
 * Replaces text in a .docx file and saves it
 * This uses a basic string replacement over the document XML to preserve generic formatting
 * @param {string} inputPath 
 * @param {string} outputPath 
 * @param {Object} replacements { 'Old Text': 'New Text' }
 */
function generateDocument(inputPath, outputPath, replacements) {
    return new Promise((resolve, reject) => {
        try {
            // Load the docx file as a binary string
            const content = fs.readFileSync(inputPath, 'binary');

            // Unzip the file
            const zip = new PizZip(content);

            // Loop through all files in the docx (document.xml, header.xml, footer.xml etc)
            for (const filename in zip.files) {
                if (filename.endsWith('.xml')) {
                    let text = zip.files[filename].asText();

                    // Simple global string replace for each key
                    for (const [oldText, newText] of Object.entries(replacements)) {
                        if (oldText) {
                            // We replace exactly what is matched.
                            // Note: Word sometimes splits text into multiple XML nodes. 
                            // If the user's template contains exact strings unbroken, this works perfectly. 
                            // Otherwise, they should ensure the template text is typed continuously.
                            text = text.split(oldText).join(newText);
                        }
                    }

                    zip.file(filename, text);
                }
            }

            // Generate the new docx file
            const buf = zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });
            fs.writeFileSync(outputPath, buf);
            resolve(outputPath);

        } catch (error) {
            reject(error);
        }
    });
}

module.exports = { generateDocument };
