import express, { Express, Request, Response } from 'express';
import {
    GetGroupKey,
    GetGroupMappings,
    GetWeekSchedule,
    GroupMapping,
} from './SiteParsing';
import * as dotenv from 'dotenv';
import { GetGroupMappingsFromFile, WriteGroupMappingsToFile } from './Caching';
import { PingForKey } from './KeyPing';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
dotenv.config();

const app = express();

const departmentNumbers = ['1', '2', '3', '4'];
const classYearNumbers = ['1', '2', '3', '4', '5', '6'];
const mappings: GroupMapping[] = GetGroupMappingsFromFile('mappings.mp');
console.log(mappings);

if (!existsSync('log')) {
    mkdirSync('log');
}
const logFileStream = createWriteStream(
    'log/' + new Date().toDateString() + '.log',
    {
        flags: 'as+',
    }
);

const pingFileStream = createWriteStream('pingLog.txt', { flags: 'as+' });

const pingInterval = setInterval(
    () => PingForKey(mappings[0], pingFileStream),
    1000 * 60 * 50
);

app.use(express.urlencoded({ extended: true }));

app.get('/get-schedule', (req, res) => {
    console.log(req.query.groupName + ' requested');
    const mapping = mappings.find(
        (value) => value.groupName === req.query.groupName
    );
    if (!mapping || !req.query.periodStart || !req.query.periodEnd) {
        res.status(404);

        logFileStream.write(
            new Date().toTimeString() +
                ' recieved invalid request from ' +
                req.ip +
                '\n'
        );
    } else {
        GetGroupKey(mapping).then((key) => {
            GetWeekSchedule(
                req.query.periodStart as string,
                req.query.periodEnd as string,
                key
            ).then((schedule) => {
                res.send(JSON.stringify(schedule));

                logFileStream.write(
                    new Date().toTimeString() +
                        ' successfully returned the schedule for ' +
                        req.ip +
                        ' with groupName: ' +
                        mapping.groupName +
                        '\n'
                );
            });
        });
    }
});

app.get('/group-names', (req, res) => {
    res.send(JSON.stringify(mappings.map((mapping) => mapping.groupName)));
    logFileStream.write(
        new Date().toTimeString() +
            ' successfully returned group names for ' +
            req.ip +
            '\n'
    );
});

app.listen(process.env.PORT || 3000);
