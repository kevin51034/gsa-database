const express = require('express');
const {
    GoogleSpreadsheet
} = require('google-spreadsheet');

// moment js
var moment = require('moment');

const app = express();


// gsa-database
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

// get specific sheet
async function onGetspecific(req, res) {
    const sheetID = req.params.ID;
    // work with course sheet
    if (req.params.ID == 5) {
        const sheet = doc.sheetsByIndex[sheetID]
        const rows = await sheet.getRows({
            offset: 1
        });
        // push course info into json
        const resJson = {};
        var key = '中心課程';
        resJson[key] = [];
        for (let i = 0; i < rows.length; i++) {
            // filter out the course by time
            if(moment().isBetween(moment(rows[i].課程開始日期, 'MMMM Do YYYY'), moment(rows[i].課程結束日期, 'MMMM Do YYYY'))) {
                var temp = {
                    課程名稱: `${rows[i].課程名稱}`,
                };
                resJson[key].push(temp);
            }
        }
        res.json(resJson);
    }

    // work with center sheet
    if (req.params.ID == 2) {
        const sheet = doc.sheetsByIndex[sheetID];
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
    const sheet = doc.sheetsByIndex[4];

    const rows = await sheet.getRows();
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

    const sheet = doc.sheetsByIndex[4]

    // the rest of the Info
    const courseSheet = doc.sheetsByIndex[5]
    const crows = await courseSheet.getRows();
    let courseRows = crows.filter(crows => crows.課程名稱 == req.body.課程名稱);
    //console.log(courseRows[0]);

    const studentSheet = doc.sheetsByIndex[3]
    const srows = await studentSheet.getRows();
    let studentRows = srows.filter(srows => srows.學員證字號 == req.body.學員證字號);
    //console.log(studentRows[0]);

    req.body.中心ID = `${courseRows[0].中心ID}`;
    req.body.課程ID = `${courseRows[0].課程ID}`;
    req.body.課程類型 = `${courseRows[0].課程類型}`;
    req.body.課程主題 = `${courseRows[0].課程主題}`;
    req.body.課程日期 = moment().format('MMMM Do YYYY');
    req.body.簽到時間 = moment().format('HH:mm:ss');

    if (studentRows[0]) {
        req.body.身分證字號 = `${studentRows[0].身分證字號}`;
    }

    //console.log(req.body);

    const newrow = {
        姓名: `${req.body.姓名}`,
        學員證字號: `${req.body.學員證字號}`,
        樂齡學習中心名稱: `${req.body.樂齡學習中心名稱}`,
        課程名稱: `${req.body.課程名稱}`,
        拓點村里: `${req.body.拓點村里}`,
        中心ID: `${req.body.中心ID}`,
        課程ID: `${req.body.課程ID}`,
        課程類型: `${req.body.課程類型}`,
        課程主題: `${req.body.課程主題}`,
        課程日期: `${req.body.課程日期}`,
        簽到時間: `${req.body.簽到時間}`,
    }

    await sheet.addRow(newrow);
    res.json({
        response: 'success'
    });
}
app.post('/api', onPost);


async function onPatch(req, res) {
    const sheet = doc.sheetsByIndex[4]
    const rows = await sheet.getRows();

    let thisRows = rows.filter(rows => rows.學員證字號 == req.body.學員證字號);

    for (let i = thisRows.length - 1; i >= 0; i--) {
        // match
        if (thisRows[i].姓名 == req.body.姓名 &&
            thisRows[i].學員證字號 == req.body.學員證字號 &&
            thisRows[i].課程日期 == moment().format('MMMM Do YYYY') &&
            thisRows[i].樂齡學習中心名稱 == req.body.樂齡學習中心名稱 &&
            thisRows[i].課程名稱 == req.body.課程名稱 &&
            thisRows[i].拓點村里 == req.body.拓點村里) {

            thisRows[i].簽退時間 = moment().format('HH:mm:ss');

            const countMs = moment(thisRows[i].簽退時間, 'HH:mm:ss') - moment(thisRows[i].簽到時間, 'HH:mm:ss');
            // have to use utc
            const countHours = moment.utc(countMs, 'x').format('HH:mm:ss');
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

    const sheet = doc.sheetsByIndex[4]

    // the rest of the Info
    const courseSheet = doc.sheetsByIndex[5]
    const crows = await courseSheet.getRows();
    let courseRows = crows.filter(crows => crows.課程名稱 == req.body.課程名稱);

    const studentSheet = doc.sheetsByIndex[3]
    const srows = await studentSheet.getRows();
    let studentRows = srows.filter(srows => srows.學員證字號 == req.body.學員證字號);

    req.body.中心ID = `${courseRows[0].中心ID}`;
    req.body.課程ID = `${courseRows[0].課程ID}`;
    req.body.課程類型 = `${courseRows[0].課程類型}`;
    req.body.課程主題 = `${courseRows[0].課程主題}`;

    if (studentRows[0]) {
        req.body.身分證字號 = `${studentRows[0].身分證字號}`;
    }

    const countMs = moment(req.body.簽退時間, 'HH:mm:ss') - moment(req.body.簽到時間, 'HH:mm:ss');
    // have to use utc
    const countHours = moment.utc(countMs, 'x').format('HH:mm:ss');
    req.body.時數 = countHours;

    const formatDate = moment(req.body.課程日期, 'YYYY-MM-DD').format('MMMM Do YYYY')

    await sheet.addRow({
        姓名: `${req.body.姓名}`,
        學員證字號: `${req.body.學員證字號}`,
        樂齡學習中心名稱: `${req.body.樂齡學習中心名稱}`,
        課程名稱: `${req.body.課程名稱}`,
        拓點村里: `${req.body.拓點村里}`,
        中心ID: `${req.body.中心ID}`,
        課程ID: `${req.body.課程ID}`,
        課程類型: `${req.body.課程類型}`,
        課程主題: `${req.body.課程主題}`,
        課程日期: `${formatDate}`,
        簽到時間: `${req.body.簽到時間}`,
        簽退時間: `${req.body.簽退時間}`,
        時數: `${req.body.時數}`,
    });

    res.json({
        response: 'success'
    });
}
app.post('/api/customize', onPostCustomize);


// statistics
async function onPostStatistics(req, res) {

    const statisticSheet = doc.sheetsByIndex[9]
    await statisticSheet.clear();
    await statisticSheet.setHeaderRow([
        '填報年度',
        '填報月份',
        '課程上課時段',
        '課程ID',
        '課程名稱',
        '課程類型',
        '講師姓名',
        '辦理場次',
        '辦理總時數',
        '女性總參加人次',
        '男性總參加人次',
        '總參加人次'
    ])

    //  sign in info
    const signInOutSheet = doc.sheetsByIndex[4]
    const signInOutRows = await signInOutSheet.getRows({
        offset: 2
        //offset: 900
    });

    // course info
    const courseSheet = doc.sheetsByIndex[5]
    const crows = await courseSheet.getRows({
        offset: 2
    });

    const newStatisticRows = [];
    const monthStatisticRows = [];
    // map through the sign in row to get new array and patch into the statistics sheet
    for (i = 0; i < crows.length; i++) {
        //console.log('course iterator');

        // filter the course name
        let statisticRows = signInOutRows.filter(signInOutRows => signInOutRows.課程名稱 == `${crows[i].課程名稱}`);
        //filter the year
        statisticRows = statisticRows.filter(statisticRows => moment(statisticRows.課程日期, 'MMMM Do YYYY').year() == (`${parseInt(crows[i].學年度) +1912}`));
        // filter the month
        for (j = 0; j < 12; j++) {
            monthStatisticRows[j] = statisticRows.filter(statisticRows => moment(statisticRows.課程日期, 'MMMM Do YYYY').month() == j);
        }
        let countPeople = []; // no duplicate
        let countPeopleMan = 0; // no duplicate
        let countPeopleWomen = 0;   // no duplicate
        for (j = 0; j < 12; j++) {
            if (monthStatisticRows[j].length > 0) {
                //console.log('month iterator');
                let manCount = 0;
                let womenCount = 0;
                let countSession = [];
                for (x = 0; x < monthStatisticRows[j].length; x++) {
                    var month = moment(monthStatisticRows[j][x].課程日期, 'MMMM Do YYYY').format("MMMM");
                    // count the session of the course
                    if (countSession.indexOf(monthStatisticRows[j][x].課程日期) == -1) {
                        //console.log('push')
                        countSession.push(monthStatisticRows[j][x].課程日期);
                    }
                    // count people number
                    if (monthStatisticRows[j][x].性別 == '男') {
                        manCount++;
                    } else {
                        womenCount++;
                    }
                    // count people number without duplicate
                    if (countPeople.indexOf(monthStatisticRows[j][x].學員證字號) == -1) {
                        //console.log('push')
                        countPeople.push(monthStatisticRows[j][x].學員證字號);
                        if(monthStatisticRows[j][x].性別 == '男') {
                            countPeopleMan++;
                        }else {
                            countPeopleWomen++;
                        }
                    }
                }
                let temp = {
                    填報年度: `${crows[i].學年度}`,
                    填報月份: `${month}`,
                    課程上課時段: `${crows[i].課程上課時段}`,
                    課程ID: `${crows[i].課程ID}`,
                    課程名稱: `${crows[i].課程名稱}`,
                    課程類型: `${crows[i].課程類型}`,
                    講師姓名: `${crows[i].講師姓名}`,
                    辦理場次: `${countSession.length}`,
                    辦理總時數: `${parseInt(crows[i].課程時數)*countSession.length}`,
                    女性總參加人次: `${womenCount}`,
                    男性總參加人次: `${manCount}`,
                    總參加人次: `${womenCount + manCount}`
                }
                if (temp !== {}) {
                    newStatisticRows.push(temp);
                }
            }
        }
        crows[i].女性總參加人數 = countPeopleWomen;
        crows[i].男性總參加人數 = countPeopleMan;
        crows[i].參加總人數 = `${countPeopleWomen + countPeopleMan}`;

        await crows[i].save();
    }

    await statisticSheet.addRows(newStatisticRows);
    res.json({
        response: 'success'
    });
}
app.post('/api/statistics', onPostStatistics);


const port = process.env.PORT || 3000;

app.listen(port, function () {
    console.log(`Server listening on port ${port}!`);
});