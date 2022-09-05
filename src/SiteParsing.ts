import { JSDOM } from 'jsdom';
global.DOMParser = new JSDOM().window.DOMParser;

type Schedule = {
    entries: string[];
    date: string;
}

export const GetSchedule = async (
    timeperiodStart: string,
    timeperiodEnd: string,
    classCode: string
): Promise<Schedule[]> => {
    // Fetch the page and decode using cp1251 because cyrillics
    const schedulePageHtml: Document = await fetch(
        `https://www.mstu.edu.ru/study/timetable/schedule.php?key=${classCode}&perstart=${timeperiodStart}&perend=${timeperiodEnd}`
    )
        .then((response) => {
            return response.arrayBuffer();
        })
        .then((buffer) => {
            const decoder = new TextDecoder('cp1251');
            return decoder.decode(buffer);
        })
        .then((html) => {
            const parser = new DOMParser();
            return parser.parseFromString(html, 'text/html');
        })
        .catch((err) => {
            // tslint:disable-next-line:no-console
            console.log('Failed to fetch page: ', err);
            return undefined;
        });

    const elements = schedulePageHtml?.querySelectorAll(
        '.col-md-12 .row .col-md-12'
    );

    const result: Schedule[] = [];
    elements.forEach((schedule) => {
        if(!schedule.querySelector('.title')){
            return ;
        }

        const currentSchedule: Schedule = {
            entries: [],
            date: schedule.querySelector('.title').textContent,
        };

        const scheduleEntries = schedule.querySelectorAll('.title ~ *');
        scheduleEntries.forEach((scheduleEntry) => {
            const entryData: string = scheduleEntry.textContent;
            if (entryData.length > 1) {
                currentSchedule.entries.push(entryData);
            }
        });

        // tslint:disable-next-line:no-console
        console.log(currentSchedule);

        result.push(currentSchedule);
    });

    return result;
};

// const GetGroupMappings = () => {};
