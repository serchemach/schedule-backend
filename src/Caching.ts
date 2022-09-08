import * as fs from 'fs'
import { GroupMapping } from './SiteParsing';

export const GetGroupMappingsFromFile = (filename: string): GroupMapping[] => {
    try{
        const fileBuffer = fs.readFileSync(filename);
        const decoder = new TextDecoder('utf8');
        return JSON.parse(decoder.decode(fileBuffer)) as GroupMapping[];
    }
    catch (err){
        console.error(err);
        return [];
    }
}

export const WriteGroupMappingsToFile = (filename: string, mappings: GroupMapping[]): void => {
    try{
        fs.writeFileSync(filename, JSON.stringify(mappings));
    }
    catch (err) {
        console.error(err);
    }
}

