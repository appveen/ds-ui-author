import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filterApp',
    pure: false
})
export class FilterPipe implements PipeTransform {

    transform(items: any, filter?: string) {
        if (filter && Array.isArray(items)) {
            const filterKeys = filter.toLowerCase();
            return items.filter(item => item._id.toLowerCase().includes(filterKeys));
        } else {
            return items;
        }
    }
}
