"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSchedule = void 0;
const jsdom_1 = require("jsdom");
global.DOMParser = new jsdom_1.JSDOM().window.DOMParser;
const GetSchedule = (timeperiodString, classCode) => __awaiter(void 0, void 0, void 0, function* () {
    const [timeperiodStart, timeperiodEnd] = timeperiodString
        .split('-')
        .map((item) => item.replaceAll('.', '-'));
    // Using a cors proxy because mstu.edu.ru doesn't return the necessary headers on a get request
    const schedulePageHtml = yield fetch(`https://www.mstu.edu.ru/study/timetable/schedule.php?key=${classCode}&perstart=${timeperiodStart}&perend=${timeperiodEnd}`)
        .then((response) => {
        // tslint:disable-next-line:no-console
        console.log("p134513554541553515135");
        return response.arrayBuffer();
    })
        .then((buffer) => {
        const decoder = new TextDecoder('cp1251');
        return decoder.decode(buffer);
    })
        .then((html) => {
        const parser = new DOMParser();
        // tslint:disable-next-line:no-console
        console.log(html);
        return parser.parseFromString(html, 'text/html');
    })
        .catch((err) => {
        // tslint:disable-next-line:no-console
        console.log('Failed to fetch page: ', err);
        return undefined;
    });
    const elements = schedulePageHtml.querySelectorAll('.col-md-12 .row .col-md-12');
    const result = [];
    elements.forEach((item) => {
        // tslint:disable-next-line:no-console
        console.log(item.textContent);
        result.push(item.textContent);
    });
    return result;
});
exports.GetSchedule = GetSchedule;
//# sourceMappingURL=SiteParsing.js.map