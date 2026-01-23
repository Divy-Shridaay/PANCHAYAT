import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

const pdfDir = 'public/help-docs';
const newAuthor = 'Shridaay Technolabs';

async function updatePdfMetadata() {
    try {
        const files = fs.readdirSync(pdfDir).filter(file => file.endsWith('.pdf'));

        for (const file of files) {
            const filePath = path.join(pdfDir, file);
            console.log(`Processing: ${file}`);

            const existingPdfBytes = fs.readFileSync(filePath);
            const pdfDoc = await PDFDocument.load(existingPdfBytes);

            pdfDoc.setAuthor(newAuthor);
            pdfDoc.setProducer(newAuthor);
            pdfDoc.setCreator(newAuthor);

            const pdfBytes = await pdfDoc.save();
            fs.writeFileSync(filePath, pdfBytes);
            console.log(`Successfully updated: ${file}`);
        }
        console.log('All PDFs updated successfully.');
    } catch (error) {
        console.error('Error updating PDF metadata:', error);
    }
}

updatePdfMetadata();
