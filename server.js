const express = require('express');
const bodyParser = require('body-parser');
const { SvfDownloader, TwoLeggedAuthenticationProvider } = require('./index.js');

const APS_CLIENT_ID = "g52vzzN7IGofaM4QAZGWARyuiBkMctsnzm5yYAEe70rQK0LJ";
const APS_CLIENT_SECRET = "1cJJ7XLtGM29MdhPjqtUWgQvBS0v2oVWvbk3lhvynf3gtZVB0wAwV7tRyAMjHdrw";
const APS_REGION = 'US';

const app = express();
const PORT = 3011;

app.use(bodyParser.json());

async function runDownload(urn) {
    const outputDir = 'C:\Users\TWINUser-26\Downloads\SVF#@';
    try {
        console.log('Starting download process...');
        console.log('URN:', urn);
        console.log('Output Directory:', outputDir);

        const authenticationProvider = new TwoLeggedAuthenticationProvider(APS_CLIENT_ID, APS_CLIENT_SECRET);
        console.log('Authentication provider initialized.');

        const downloader = new SvfDownloader(authenticationProvider);
        console.log('Downloader initialized.');

        const download = downloader.download(urn, { outputDir, log: console.log, region: APS_REGION });
        console.log('Download started.');

        await download.ready;
        console.log('Download completed.');
        return { success: true, message: 'Download completed successfully' };
    } catch (error) {
        console.error('Error during download process:', error);
        return { success: false, message: error.message };
    }
}

app.post('/download-svf', async (req, res) => {
    const { urn } = req.body;
    
    if (!urn) {
        return res.status(400).json({ success: false, message: "URN and outputDirectory are required" });
    }

    const result = await runDownload(urn);
    res.json(result);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
