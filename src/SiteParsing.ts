import { JSDOM } from 'jsdom';
import fetch from 'cross-fetch';
global.DOMParser = new JSDOM().window.DOMParser;

const FetchPageAndDecode = async (
    url: string,
    init?: RequestInit
): Promise<Document> => {
    return await fetch(url, init)
        .then((response) => {
            return response.arrayBuffer();
        })
        .then((buffer) => {
            const decoder = new TextDecoder('cp1251');
            return decoder.decode(buffer);
        })
        .then((html) => {
            const parser = new DOMParser();
            // console.log(parser.parseFromString(html, 'text/html').textContent);
            // console.log(html);
            return parser.parseFromString(html, 'text/html');
        })
        .catch((err) => {
            console.log('Failed to fetch page: ', err);
            return undefined;
        });
};

type ScheduleEntry = {
    entryNumber: string;
    entryName: string;
    entryProfessorName: string;
    entryClassroomName: string;
};

type Schedule = {
    entries: ScheduleEntry[];
    date: string;
};

export const GetWeekSchedule = async (
    timeperiodStart: string,
    timeperiodEnd: string,
    classCode: string,
    perKind: string
): Promise<Schedule[]> => {
    // Fetch the page and decode using cp1251 because cyrillics
    const schedulePageHtml: Document = await FetchPageAndDecode(
        `https://www.mstu.edu.ru/study/timetable/schedule.php?key=${classCode}&perstart=${timeperiodStart}&perend=${timeperiodEnd}&perkind=${perKind}`
    );

    const elements = schedulePageHtml?.querySelectorAll(
        '.col-md-12 .row .col-md-12'
    );

    const result: Schedule[] = [];
    elements.forEach((schedule) => {
        if (!schedule.querySelector('.title')) {
            return;
        }

        const currentSchedule: Schedule = {
            entries: [],
            date: schedule.querySelector('.title').textContent,
        };

        const scheduleEntries = schedule.querySelectorAll('.title ~ *');
        scheduleEntries.forEach((scheduleEntry) => {
            const entryData = scheduleEntry.querySelectorAll('td');

            /* Because MSTU displays classes in a table, when there are two classes happening
               simultaniously, they needed to choose how to number the classes.
               And they just decided not to number duplicate ones at all.
               So let's hope querySelectorAll returns the entries in the original order,
               and use the previous number */

            const entry: ScheduleEntry = {
                entryNumber:
                    entryData[0].textContent ||
                    currentSchedule.entries[currentSchedule.entries.length - 1]
                        .entryNumber,
                entryName: entryData[1].textContent,
                entryProfessorName: entryData[2].textContent,
                entryClassroomName: entryData[3].textContent,
            };

            currentSchedule.entries.push(entry);
        });

        result.push(currentSchedule);
    });

    return result;
};

export type GroupMapping = {
    departmentNumber: string;
    courseYear: string;
    groupName: string;
};

const GetGroupPage = async (
    departmentNumber: string,
    courseYear: string
): Promise<Document> => {
    const postForm = new URLSearchParams();
    postForm.set('facs', departmentNumber);
    postForm.set('courses', courseYear);
    postForm.set('mode', '1');
    postForm.set('pers', '0');

    return await FetchPageAndDecode(
        'https://www.mstu.edu.ru/study/timetable/',
        {
            method: 'POST',
            body: postForm,
        }
    );
};

export const GetGroupMappings = async (
    departmentNumbers: string[],
    courseYearNumbers: string[]
): Promise<GroupMapping[]> => {
    const mappings: GroupMapping[] = [];

    await Promise.all(
        departmentNumbers.map(async (departmentNumber) => {
            await Promise.all(
                courseYearNumbers.map(async (courseYear) => {
                    const response = await GetGroupPage(
                        departmentNumber,
                        courseYear
                    );

                    console.log(departmentNumber + ' ' + courseYear);

                    const groupButtons = response.querySelectorAll(
                        '.table-responsive .table .btn.btn-default'
                    );
                    groupButtons.forEach((button) =>
                        mappings.push({
                            groupName: button.textContent,
                            departmentNumber,
                            courseYear,
                        })
                    );
                })
            );
        })
    );

    console.log('Finally finished');
    return mappings;
};

type GroupParams = {
    key: string,
    perKind: string
}

export const GetGroupParams = async (mapping: GroupMapping): Promise<GroupParams> => {
    const page = await GetGroupPage(
        mapping.departmentNumber,
        mapping.courseYear
    );
    const links = page.querySelectorAll('.table-responsive .table tr');

    const result = {
        key: '',
        perKind: ''
    };

    links.forEach((link) => {
        if (link?.querySelector('a')?.textContent === mapping.groupName) {
            console.log(link?.querySelector('a')?.textContent + ' served');
            // console.log(link?.textContent);

            const paramsArray = link
                .querySelector('a')
                .getAttribute('href')
                .replace('schedule.php?', '')
                .split('&');

            result.key = paramsArray[0].replace('key=', '');
            result.perKind = paramsArray[3].replace('perkind=', '');
        }
    });

    return result;
};
