import { JSDOM } from 'jsdom'
global.DOMParser = new JSDOM().window.DOMParser

export const GetSchedule = async (
    timeperiodString: string,
    classCode: string
): Promise<string[]> => {
    const [timeperiodStart, timeperiodEnd] = timeperiodString
        .split('-')
        .map((item) => item.replaceAll('.', '-'));
    // Using a cors proxy because mstu.edu.ru doesn't return the necessary headers on a get request
    const schedulePageHtml: Document = await fetch(
        `https://www.mstu.edu.ru/study/timetable/schedule.php?key=${classCode}&perstart=${timeperiodStart}&perend=${timeperiodEnd}`
    )
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
    const result: string[] = [];
    elements.forEach((item)=>{
        // tslint:disable-next-line:no-console
        console.log(item.textContent);

        result.push(item.textContent);
    })

    return result;
};