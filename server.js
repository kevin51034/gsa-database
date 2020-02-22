const express = require('express');
const googlespreadsheet = require('google-spreadsheet');
const {
    promisify
} = require('util');

// moment js
var moment = require('moment');

const app = express();
const creds = require('./client_secret.json');
const doc = new googlespreadsheet('<spreadsheet key>');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static('public'));

async function onGet(req, res) {
    await promisify(doc.useServiceAccountAuth)(creds);
    const info = await promisify(doc.getInfo)();
    sheet4 = info.worksheets[4];
    //sheet5 = info.worksheets[5];
    //getRows return a object array
    //if limit = 1 then array length = 1
    const studentInfo = await promisify(sheet4.getRows)({
        offset: 2,
        //limit: 500,
    });


    res.json(studentInfo);
}
app.get('/api', onGet);


// get specific sheet
async function onGetspecific(req, res) {
    await promisify(doc.useServiceAccountAuth)(creds);
    const info = await promisify(doc.getInfo)();
    
    const sheetID = req.params.ID;
    sheet = info.worksheets[sheetID];

    //getRows return a object array
    //if limit = 1 then array length = 1
    const rows = await promisify(sheet.getRows)({
        offset: 1,
        //limit: 500,
        //query: `學員證字號 = ${studentID}`

        //query: `姓名 = ${studentID}`
    });
    //fetch name from ID
    //console.log(rows[0].姓名);
    //history


    res.json(rows);
}
app.get('/api/:ID', onGetspecific);



async function onPost(req, res) {
    await promisify(doc.useServiceAccountAuth)(creds);
    const info = await promisify(doc.getInfo)();
    //註冊紀錄(上課資訊)
    sheet = info.worksheets[4];

    //the rest of the Info
    courseSheet = info.worksheets[5];
    const courseRows = await promisify(courseSheet.getRows)({
        offset: 1,
        //limit: 500,
        query: `課程名稱 = ${req.body.課程名稱}`
    });

    studentSheet = info.worksheets[3];
    const studentRows = await promisify(studentSheet.getRows)({
        offset: 1,
        //limit: 500,
        query: `學員證字號 = ${req.body.學員證字號}`
    });

    //console.log(req.body);
    //console.log(courseRows[0]);
    //console.log(studentRows[0]);

    req.body.中心id = `${courseRows[0].中心id}`;
    req.body.課程id = `${courseRows[0].課程id}`;
    req.body.課程類型 = `${courseRows[0].課程類型}`;
    req.body.課程主題 = `${courseRows[0].課程主題}`;

    if(studentRows[0]){
        req.body.身分證字號 = `${studentRows[0].身分證字號}`;
    }

    console.log(req.body);

    const newrow = req.body;
    await promisify(sheet.addRow)(newrow);

    //console.log(req);

    res.json({
        response: 'success'
    });
}
app.post('/api', onPost);


async function onPatch(req, res) {
    await promisify(doc.useServiceAccountAuth)(creds);
    const info = await promisify(doc.getInfo)();
    //註冊紀錄(上課資訊)
    sheet = info.worksheets[4];

    console.log(req.body);
    const date = new Date();
    //console.log(date.toLocaleDateString());

    const rows = await promisify(sheet.getRows)({
        offset: 1,
        //limit: 500,
        query: `姓名 = ${req.body.姓名}`, 
        //query: `課程日期yyyymmdd = ${date.toLocaleDateString()}`,
        query: `樂齡學習中心名稱 = ${req.body.樂齡學習中心名稱}`,
        query: `課程名稱 = ${req.body.課程名稱}`,
        query: `拓點村里 = ${req.body.拓點村里}`,
        query: `課程日期yyyymmdd = ${req.body.課程日期yyyymmdd}`,
        query: `學員證字號 = ${req.body.學員證字號}`,
    });

    console.log(rows);
    console.log(rows.length);

    //console.log(rows[rows.length-1]);

    for(let i = rows.length-1;i>=0;i--){
        // match
        if(rows[i].姓名 ==  req.body.姓名 &&
            rows[i].學員證字號 ==  req.body.學員證字號 &&
            rows[i].課程日期yyyymmdd ==  req.body.課程日期yyyymmdd &&
            rows[i].樂齡學習中心名稱 ==  req.body.樂齡學習中心名稱 &&
            rows[i].課程名稱 ==  req.body.課程名稱 &&
            rows[i].拓點村里 ==  req.body.拓點村里) {

            rows[i].簽退時間 = date.toLocaleTimeString('it-IT');
            //console.log(date.toDateString());

            //console.log(rows[i].簽到時間);
            //console.log(rows[i].簽退時間);
            //console.log(moment(rows[i].簽到時間 , 'HH:mm:ss'));
            //console.log(moment(rows[i].簽退時間 , 'HH:mm:ss'));

            //console.log(moment(rows[i].簽退時間 , 'HH:mm:ss') - moment(rows[i].簽到時間 , 'HH:mm:ss'));
            const countMs = moment(rows[i].簽退時間 , 'HH:mm:ss') - moment(rows[i].簽到時間 , 'HH:mm:ss');
            // have to use utc
            const countHours = moment.utc(countMs , 'x').format('HH:mm:ss');
            console.log(countHours);
            rows[i].時數 = countHours;

            await rows[i].save();
        
            res.json({
                response: 'success'
            });
            break;
        }
        else if (i == 0) {
            res.json({
                response: 'fail'
            });
            break;
        }
    }


}
app.patch('/api', onPatch);


const port = process.env.PORT || 3000;

app.listen(port, function () {
    console.log(`Server listening on port ${port}!`);
});