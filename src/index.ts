import express, { Express, Request, Response } from 'express';
import { GetGroupMappings, GetWeekSchedule } from './SiteParsing';

const app = express();

let coolString = '';
GetWeekSchedule('2022-08-29', '2022-09-04', '123').then((array) => {
    coolString = array
        .map(
            (schedule) =>
                schedule.date + '<br />' + schedule.entries.join('<br />')
        )
        .join('<br /> <br />');
});

GetGroupMappings(['1'], ['1']).then((array) => {
    coolString += JSON.stringify(array);
});

app.use(express.urlencoded({ extended: true }));
app.all('/', (req, res) => {
    // tslint:disable-next-line:no-console
    console.log('Just got a request!');
    res.send(coolString);
});

app.post('/get-key', (req, res) => {
    let result: string = 'Results are as such: \n';
    result += req.body.department;
    result += '\n' + req.body.classYear;

    res.send(result);
});

app.listen(process.env.PORT || 3000);
