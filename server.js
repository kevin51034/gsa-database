const express = require('express');
const googlespreadsheet = require('google-spreadsheet');
const {
    promisify
} = require('util');



const app = express();
const creds = require('./client_secret.json');
const doc = new googlespreadsheet('<spreadsheet key>');

async function onGet(req, res) {
    await promisify(doc.useServiceAccountAuth)(creds);
    const info = await promisify(doc.getInfo)();
    sheet = info.worksheets[3];

    const rows = await promisify(sheet.getRows)({
        offset: 1,
        limit: 5
    });

    
    console.log(sheet);
    console.log(rows);
    res.json(rows);
}
app.get('/api', onGet);


/*
async function accessSpreadsheet() {
    const doc = new googlespreadsheet('<spreadsheet key>');
    await promisify(doc.useServiceAccountAuth)(creds);
    const info = await promisify(doc.getInfo)();
    sheet = info.worksheets;


}
accessSpreadsheet();*/


const port = process.env.PORT || 3000;

app.listen(port, function () {
    console.log(`Server listening on port ${port}!`);
});