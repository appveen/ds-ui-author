import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filterTeam',
    pure: false
})
export class FilterTeamPipe implements PipeTransform {
    transform(list: any, filter: string) {
        const res = [];
        if (!list || list.length === 0 || !filter) {
            return list;
        }
        const reg = new RegExp(filter.toLowerCase());
        list.forEach(i => {
            if (i.name.toLowerCase().match(reg)) {
                res.push(i);
            }
        });
        return res;
    }
}
