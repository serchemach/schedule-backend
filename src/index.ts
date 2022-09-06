import express, { Express, Request, Response } from 'express';
import {
    GetGroupKey,
    GetGroupMappings,
    GetWeekSchedule,
    GroupMapping,
} from './SiteParsing';
import * as dotenv from 'dotenv'
dotenv.config()

const app = express();

// let coolString = '';
// GetWeekSchedule('2022-08-29', '2022-09-04', '123').then((array) => {
//     coolString = array
//         .map(
//             (schedule) =>
//                 schedule.date + '<br />' + schedule.entries.join('<br />')
//         )
//         .join('<br /> <br />');
// });

const departmentNumbers = ['1', '2', '3', '4'];
const classYearNumbers = ['1', '2', '3', '4', '5', '6'];
// console.log(process.env.MAPPINGS)
let mappings: GroupMapping[] = [];

GetGroupMappings(departmentNumbers, classYearNumbers).then((array) => {
    // coolString += JSON.stringify(array);
    console.log(JSON.stringify(array));
    mappings = array;

    // GetGroupKey(array[0]).then((link) => {
    //     coolString += '<br/>' + link;
    // });
});

app.use(express.urlencoded({ extended: true }));
// app.all('/', (req, res) => {
//     console.log('Just got a request!');
//     res.send(coolString);
// });

app.get('/get-schedule', (req, res) => {
    console.log(req.query.groupName);
    const mapping = mappings.find(
        (value) => value.groupName === req.query.groupName
    );
    if (!mapping || !req.query.periodStart || !req.query.periodEnd) {
        res.status(404);
    } else {
        GetGroupKey(mapping).then((key) => {
            GetWeekSchedule(
                req.query.periodStart as string,
                req.query.periodEnd as string,
                key
            ).then((schedule) => {
                res.send(JSON.stringify(schedule));
            });
        });
    }
});

app.get('/group-names', (req, res) => {
    res.send(JSON.stringify(mappings.map((mapping) => mapping.groupName)));
});

// app.post('/get-key', (req, res) => {
//     let result: string = 'Results are as such: \n';
//     result += req.body.department;
//     result += '\n' + req.body.classYear;

//     res.send(result);
// });

app.listen(process.env.PORT || 3000);
