const express = require('express');
const googlespreadsheet = require('google-spreadsheet');
const {
    promisify
} = require('util');

const app = express();
const creds = require('./client_secret.json');
const doc = new googlespreadsheet('<spreadsheet key>');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static('public'));

async function onGet(req, res) {
    await promisify(doc.useServiceAccountAuth)(creds);
    const info = await promisify(doc.getInfo)();
    sheet = info.worksheets[4];
    
    //getRows return a object array
    //if limit = 1 then array length = 1
    const rows = await promisify(sheet.getRows)({
        offset: 2,
        limit: 500,
    });
    //fetch name from ID
    console.log(rows[0].姓名);

    res.json(rows);
}
app.get('/api', onGet);

async function onGetspecific(req, res) {
    await promisify(doc.useServiceAccountAuth)(creds);
    const info = await promisify(doc.getInfo)();
    sheet = info.worksheets[4];
    
    const studentID = req.params.ID;

    //getRows return a object array
    //if limit = 1 then array length = 1
    const rows = await promisify(sheet.getRows)({
        offset: 1,
        //limit: 500,
        //query: `學員證字號 = ${studentID}`
        query: `姓名 = ${studentID}`
    });
    //fetch name from ID
    //console.log(rows[0].姓名);
    //history
    rows.forEach(row => {
        console.log(row.課程名稱);
        console.log(row.課程日期mmddyyyy);
    })

    res.json(rows);
}
app.get('/api/:ID', onGetspecific);



async function onPost(req, res) {
    await promisify(doc.useServiceAccountAuth)(creds);
    const info = await promisify(doc.getInfo)();
    //註冊紀錄(上課資訊)
    sheet = info.worksheets[4];
    const newrow = req.body;

    //await promisify(sheet.addRow)(newrow);

    //console.log(req);
    console.log(req.body);

    //the json information
    for(let key in newrow) {
        console.log(req.body[key]);
    }

    res.json(newrow);
}
app.post('/api', onPost);


const port = process.env.PORT || 3000;

app.listen(port, function () {
    console.log(`Server listening on port ${port}!`);
});