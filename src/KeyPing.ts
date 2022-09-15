import { GetGroupParams, GroupMapping } from './SiteParsing';

export const PingForKey = (mapping: GroupMapping, outputStream: any): void => {
    GetGroupParams(mapping).then((params) => {
        outputStream.write(
            'At ' +
                new Date().toTimeString() +
                ' on ' +
                new Date().toDateString() +
                ` the key for ${mapping.groupName} was ${params.key}\n`
        );
    });
};
