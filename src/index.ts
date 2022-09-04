import express, { Express, Request, Response } from 'express';
import { GetSchedule } from './SiteParsing';


const app = express()

let coolString = "";
GetSchedule("2022.08.29-2022.09.04", "123").then(
    (array) => {
        coolString = array.join('\n');
    }
);

app.use(express.urlencoded({ extended: true }));
app.all('/', (req, res) => {
    // tslint:disable-next-line:no-console
    console.log("Just got a request!")
    res.send(coolString);
})

app.post('/get-key', (req, res) => {
    let result: string = "Results are as such: \n";
    result += req.body.department;
    result += "\n" + req.body.classYear;

    res.send(result);
});


app.listen(process.env.PORT || 3000)


