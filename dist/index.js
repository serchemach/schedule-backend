"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const SiteParsing_1 = require("./SiteParsing");
const app = (0, express_1.default)();
let coolString = "";
(0, SiteParsing_1.GetSchedule)("2022.08.29-2022.09.04", "123").then((array) => {
    coolString = array.join('\n');
});
app.use(express_1.default.urlencoded({ extended: true }));
app.all('/', (req, res) => {
    // tslint:disable-next-line:no-console
    console.log("Just got a request!");
    res.send(coolString);
});
app.post('/get-key', (req, res) => {
    let result = "Results are as such: \n";
    result += req.body.department;
    result += "\n" + req.body.classYear;
    res.send(result);
});
app.listen(process.env.PORT || 3000);
//# sourceMappingURL=index.js.map