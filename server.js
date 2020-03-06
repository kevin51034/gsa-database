const express = require('express');
const {
    GoogleSpreadsheet
} = require('google-spreadsheet');

// moment js
var moment = require('moment');

const app = express();
const creds = require('./client_secret.json');
const doc = new GoogleSpreadsheet('<spreadsheet key>');

app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));

app.use(express.static('public'));

// connect do gsa-database
async function main() {
    console.log('connect database...');
    // new version  npm 3.0.8
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo(); // loads document properties and worksheets
}
main();


async function onGet(req, res) {
    sheet4 = doc.sheetsByIndex[4];
    const rows = await sheet4.getRows({
        offset: 2
    });
    console.log(rows.length);
    // push course info into json
    const resJson = {};
    var key = '註冊紀錄';
    resJson[key] = [];
    for (let i = 0; i < rows.length; i++) {
        var temp = {
            變項名稱: `${rows[i].變項名稱}`,
            身分證字號: `${rows[i].身分證字號}`,
            學員證字號: `${rows[i].學員證字號}`,
            姓名: `${rows[i].姓名}`,
            中心ID: `${rows[i].中心ID}`,
            樂齡學習中心名稱: `${rows[i].樂齡學習中心名稱}`,
            課程ID: `${rows[i].課程ID}`,
            課程名稱: `${rows[i].課程名稱}`,
            課程類型: `${rows[i].課程類型}`,
            課程主題: `${rows[i].課程主題}`,
            拓點村里: `${rows[i].拓點村里}`,
            課程日期: `${rows[i].課程日期}`,
            簽到時間: `${rows[i].簽到時間}`,
            簽退時間: `${rows[i].簽退時間}`,
            時數: `${rows[i].時數}`,
        };
        resJson[key].push(temp);
    }
    res.json(resJson);

    //res.json(studentInfo);
}
app.get('/api', onGet);


// get specific sheet
async function onGetspecific(req, res) {
    const sheetID = req.params.ID;
    // work with course sheet
    if (req.params.ID == 5) {
        sheet = doc.sheetsByIndex[sheetID]
        const rows = await sheet.getRows({
            offset: 1
        });
        // push course info into json
        const resJson = {};
        var key = '中心課程';
        resJson[key] = [];
        for (let i = 0; i < rows.length; i++) {
            var temp = {
                課程名稱: `${rows[i].課程名稱}`,
            };
            resJson[key].push(temp);
        }
        res.json(resJson);
    }

    // work with center sheet
    if (req.params.ID == 2) {
        sheet = doc.sheetsByIndex[sheetID]
        const rows = await sheet.getRows({
            offset: 0
        });
        // push course info into json
        const resJson = {};
        var key = '樂齡中心資料';
        resJson[key] = [];
        for (let i = 0; i < rows.length; i++) {
            var temp = {
                樂齡學習中心名稱: `${rows[i].樂齡學習中心名稱}`,
                拓點村里: `${rows[i].拓點村里}`,
            };
            resJson[key].push(temp);
        }
        res.json(resJson);
    }
    //res.json(rows);
}
app.get('/api/:ID', onGetspecific);

// get today info
async function onGetDateHistory(req, res) {
    sheet = doc.sheetsByIndex[4]

    const rows = await sheet.getRows();
    //console.log(sheet.rowCount);
    // select todays history
    let todayRows = rows.filter(rows => rows.課程日期 == moment().format('MMMM Do YYYY'));

    // push course info into json
    const resJson = {};
    var key = '今日簽到紀錄';
    resJson[key] = [];
    for (let i = 0; i < todayRows.length; i++) {
        var temp = {
            變項名稱: `${todayRows[i].變項名稱}`,
            身分證字號: `${todayRows[i].身分證字號}`,
            學員證字號: `${todayRows[i].學員證字號}`,
            姓名: `${todayRows[i].姓名}`,
            中心ID: `${todayRows[i].中心ID}`,
            樂齡學習中心名稱: `${todayRows[i].樂齡學習中心名稱}`,
            拓點社區: `${todayRows[i].拓點社區}`,
            課程ID: `${todayRows[i].課程ID}`,
            課程名稱: `${todayRows[i].課程名稱}`,
            課程類型: `${todayRows[i].課程類型}`,
            課程主題: `${todayRows[i].課程主題}`,
            拓點村里: `${todayRows[i].拓點村里}`,
            課程日期: `${todayRows[i].課程日期}`,
            簽到時間: `${todayRows[i].簽到時間}`,
            簽退時間: `${todayRows[i].簽退時間}`,
            時數: `${todayRows[i].時數}`,
        };
        resJson[key].push(temp);
    }
    res.json(resJson);
    //res.json(todayRows[0]);
}
app.get('/api/4/today', onGetDateHistory);


// sign in post form
async function onPost(req, res) {

    sheet = doc.sheetsByIndex[4]

    // the rest of the Info
    courseSheet = doc.sheetsByIndex[5]
    const crows = await courseSheet.getRows();
    let courseRows = crows.filter(crows => crows.課程名稱 == req.body.課程名稱);
    //console.log(courseRows[0]);

    studentSheet = doc.sheetsByIndex[3]
    const srows = await studentSheet.getRows();
    let studentRows = srows.filter(srows => srows.學員證字號 == req.body.學員證字號);
    //console.log(studentRows[0]);

    req.body.中心id = `${courseRows[0].中心ID}`;
    req.body.課程id = `${courseRows[0].課程ID}`;
    req.body.課程類型 = `${courseRows[0].課程類型}`;
    req.body.課程主題 = `${courseRows[0].課程主題}`;
    req.body.課程日期 = moment().format('MMMM Do YYYY');
    req.body.簽到時間 = moment().format('HH:mm:ss');

    if (studentRows[0]) {
        req.body.身分證字號 = `${studentRows[0].身分證字號}`;
    }

    //console.log(req.body);

    await sheet.addRow({
        姓名: `${req.body.姓名}`,
        學員證字號: `${req.body.學員證字號}`,
        樂齡學習中心名稱: `${req.body.樂齡學習中心名稱}`,
        課程名稱: `${req.body.課程名稱}`,
        拓點村里: `${req.body.拓點村里}`,
        中心ID: `${req.body.中心id}`,
        課程ID: `${req.body.課程id}`,
        課程類型: `${req.body.課程類型}`,
        課程主題: `${req.body.課程主題}`,
        課程日期: `${req.body.課程日期}`,
        簽到時間: `${req.body.簽到時間}`,
    });
    res.json({
        response: 'success'
    });
}
app.post('/api', onPost);


// sign out post form
async function onPatch(req, res) {

    sheet = doc.sheetsByIndex[4]
    const rows = await sheet.getRows();
    //console.log(req.body);

    let thisRows = rows.filter(rows => rows.學員證字號 == req.body.學員證字號);

    //console.log(thisRows);

    for (let i = thisRows.length - 1; i >= 0; i--) {
        // match
        if (thisRows[i].姓名 == req.body.姓名 &&
            thisRows[i].學員證字號 == req.body.學員證字號 &&
            thisRows[i].課程日期 == moment().format('MMMM Do YYYY') &&
            thisRows[i].樂齡學習中心名稱 == req.body.樂齡學習中心名稱 &&
            thisRows[i].課程名稱 == req.body.課程名稱 &&
            thisRows[i].拓點村里 == req.body.拓點村里) {

            thisRows[i].簽退時間 = moment().format('HH:mm:ss');

            //console.log(moment(thisRows[i].簽退時間 , 'HH:mm:ss') - moment(thisRows[i].簽到時間 , 'HH:mm:ss'));
            const countMs = moment(thisRows[i].簽退時間, 'HH:mm:ss') - moment(thisRows[i].簽到時間, 'HH:mm:ss');
            // have to use utc
            const countHours = moment.utc(countMs, 'x').format('HH:mm:ss');
            //console.log(countHours);
            thisRows[i].時數 = countHours;

            await thisRows[i].save();

            res.json({
                response: 'success'
            });
            break;
        } else if (i == 0) {
            res.json({
                response: 'fail'
            });
            break;
        }
    }
}
app.patch('/api', onPatch);


// Customize post form
async function onPostCustomize(req, res) {

    sheet = doc.sheetsByIndex[4]

    // the rest of the Info
    courseSheet = doc.sheetsByIndex[5]
    const crows = await courseSheet.getRows();
    let courseRows = crows.filter(crows => crows.課程名稱 == req.body.課程名稱);
    //console.log(courseRows[0]);

    studentSheet = doc.sheetsByIndex[3]
    const srows = await studentSheet.getRows();
    let studentRows = srows.filter(srows => srows.學員證字號 == req.body.學員證字號);
    //console.log(studentRows[0]);

    req.body.中心id = `${courseRows[0].中心ID}`;
    req.body.課程id = `${courseRows[0].課程ID}`;
    req.body.課程類型 = `${courseRows[0].課程類型}`;
    req.body.課程主題 = `${courseRows[0].課程主題}`;

    if (studentRows[0]) {
        req.body.身分證字號 = `${studentRows[0].身分證字號}`;
    }

    const countMs = moment(req.body.簽退時間, 'HH:mm:ss') - moment(req.body.簽到時間, 'HH:mm:ss');
    // have to use utc
    const countHours = moment.utc(countMs, 'x').format('HH:mm:ss');
    req.body.時數 = countHours;
    //console.log(req.body);

    await sheet.addRow({
        姓名: `${req.body.姓名}`,
        學員證字號: `${req.body.學員證字號}`,
        樂齡學習中心名稱: `${req.body.樂齡學習中心名稱}`,
        課程名稱: `${req.body.課程名稱}`,
        拓點村里: `${req.body.拓點村里}`,
        中心ID: `${req.body.中心id}`,
        課程ID: `${req.body.課程id}`,
        課程類型: `${req.body.課程類型}`,
        課程主題: `${req.body.課程主題}`,
        課程日期: `${req.body.課程日期}`,
        簽到時間: `${req.body.簽到時間}`,
        簽退時間: `${req.body.簽退時間}`,
        時數: `${req.body.時數}`,
    });

    res.json({
        response: 'success'
    });
}
app.post('/api/customize', onPostCustomize);

async function onPatchDate(req, res) {
    const sheet = doc.sheetsByIndex[4]
    const rows = await sheet.getRows({
        offset:2,
        limit: 900
    });

    for(let i = 0;i<rows.length;i++) {
        rows[i].課程日期 = moment(rows[i].課程日期, 'MM-DD-YYYY').format('MMMM Do YYYY');
        console.log(rows[i].課程日期);
        await rows[i].save();
    }

}
app.patch('/api/date', onPatchDate);


const port = process.env.PORT || 3030;

app.listen(port, function () {
    console.log(`Server listening on port ${port}!`);
});