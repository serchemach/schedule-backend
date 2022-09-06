import { JSDOM } from 'jsdom';
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
            return new Document();
        });
};

type Schedule = {
    entries: string[];
    date: string;
};

export const GetWeekSchedule = async (
    timeperiodStart: string,
    timeperiodEnd: string,
    classCode: string
): Promise<Schedule[]> => {
    // Fetch the page and decode using cp1251 because cyrillics
    const schedulePageHtml: Document = await FetchPageAndDecode(
        `https://www.mstu.edu.ru/study/timetable/schedule.php?key=${classCode}&perstart=${timeperiodStart}&perend=${timeperiodEnd}`
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
            const entryData: string = scheduleEntry.textContent;
            if (entryData.length > 1) {
                currentSchedule.entries.push(entryData);
            }
        });

        console.log(currentSchedule);

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

export const GetGroupKey = async (mapping: GroupMapping): Promise<string> => {
    const page = await GetGroupPage(
        mapping.departmentNumber,
        mapping.courseYear
    );
    const links = page.querySelectorAll('.table-responsive .table tr');

    let result = '';

    links.forEach((link) => {
        if (link.textContent.includes(mapping.groupName)) {
            console.log(link?.querySelector('a')?.textContent);

            result = link
                .querySelector('a')
                .getAttribute('href')
                .replace('schedule.php?', '')
                .split('&')[0]
                .replace('key=', '');
        }
    });

    return result;
};
