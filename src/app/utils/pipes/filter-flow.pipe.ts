import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filterFlow',
    pure: false
})
export class FilterFlowPipe implements PipeTransform {
    transform(items: any, prtnrFilter: string, txtFilter?: string) {
        if (txtFilter && txtFilter.trim() && Array.isArray(items)) {
            if (txtFilter) {
                const filterKeys = txtFilter.toLowerCase();
                return items.filter(ptr => ptr.partner === prtnrFilter)
                    .filter(item => item.name ? item.name.toLowerCase().includes(filterKeys) : false);
            }
        } else {
            return items.filter(ptr => ptr.partner === prtnrFilter);
        }
    }
}

