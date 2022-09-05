import { JSDOM } from 'jsdom'
global.DOMParser = new JSDOM().window.DOMParser

type ScheduleEntry = {
	entryNumber: number;
	entryData: string;
}

type Schedule = ScheduleEntry[];

export const GetSchedule = async (
    timeperiodString: string,
    classCode: string
): Promise<Schedule[]> => {
    const [timeperiodStart, timeperiodEnd] = timeperiodString
        .split('-')
        .map((item) => item.replaceAll('.', '-'));
    // Using a cors proxy because mstu.edu.ru doesn't return the necessary headers on a get request
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

    const elements = schedulePageHtml?.querySelectorAll('.col-md-12 .row .col-md-12');
    let result: Schedule[] = [];
    elements.forEach((schedule)=>{
    	
        // tslint:disable-next-line:no-console
        console.log(item.textContent);

        result.push(item.textContent);
    })

    return result;
};



const GetGroupMappings = () => {
	
}

