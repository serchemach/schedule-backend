import {GetGroupKey, GroupMapping} from './SiteParsing'

export const PingForKey = (mapping: GroupMapping, outputStream: any): void => {
	GetGroupKey(mapping).then((key) => {
		outputStream.write('At ' + new Date().toTimeString() + ' on ' + 
			new Date().toDateString() + ` the key was ${key}\n`);
	});
}




