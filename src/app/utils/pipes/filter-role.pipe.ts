import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filterRole',
    pure: false
})
export class FilterRolePipe implements PipeTransform {
    transform(items: any, filter?: string) {
        if (filter && filter.trim() && Array.isArray(items)) {
            if (filter) {
                const filterKeys = filter.toLowerCase();
                return items.filter(item => item.name ? item.name.toLowerCase().includes(filterKeys) : false);
            }
        } else {
            return items;
        }
    }
}

