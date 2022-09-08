import * as fs from 'fs';
import { GetGroupKey, GroupMapping } from './SiteParsing';

export const GetGroupMappingsFromFile = (filename: string): GroupMapping[] => {
    try {
        const fileBuffer = fs.readFileSync(filename);
        const decoder = new TextDecoder('utf8');
        return JSON.parse(decoder.decode(fileBuffer)) as GroupMapping[];
    } catch (err) {
        console.error(err);
        return [];
    }
};

export const WriteGroupMappingsToFile = (
    filename: string,
    mappings: GroupMapping[]
): void => {
    try {
        fs.writeFileSync(filename, JSON.stringify(mappings));
    } catch (err) {
        console.error(err);
    }
};

// type CachedMapping = {
//     cachTime: number;
//     cachedValue: string;
// };

// class MappingCacher {
//     storedKeys: Map<string, CachedMapping>;

//     constructor(groupMappings: GroupMapping[]) {
//         this.storedKeys = new Map<string, CachedMapping>();

//         groupMappings.forEach((mapping) => {
//             this.storedKeys.set(mapping.groupName, {
//                 cachTime: new Date(),
//                 cachedValue: '',
//             });
//         });
//     }

//     get getKey(mapping: GroupMapping) {
//         let key = this.storedKeys.get(mapping.groupName);
//         const currentTime = (new Date()).getTime();
//         const timeDifferenceHours = (currentTime - key.cachTime) / 1000 / 60 / 60;
//         if(key.cachedValue === '' || timeDifferenceHours > 1){
            
//         }
//         else{
//             return key.cachedValue;
//         }
//     }
// }
