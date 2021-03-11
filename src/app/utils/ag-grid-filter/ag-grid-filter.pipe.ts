import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'agGridFilter',
})
export class AgGridFilterPipe implements PipeTransform {
  transform(array: any[], filterObj: Record<string, any>): any[] {
    if (!array?.length || !filterObj || !Object.keys(filterObj).length) {
      return array;
    }
    let temp = [...array];
    Object.keys(filterObj).forEach(field => {
      if (!!filterObj[field].filter) {
        let filter = filterObj[field].filter;
        if (typeof filter === 'string' && filter.charAt(0) === '{') {
          filter = JSON.parse(filter);
        }
        if (typeof filter === 'string' && filter.charAt(0) === '/' && filter.charAt(filter.length - 1) === '/') {
          const filterString = filter.slice(1, -1);
          temp = temp.filter(tempItem => {
            const value = this.getFieldValue(tempItem, field);
            return typeof value === 'string' && value.toLowerCase().includes(filterString.toLowerCase());
          });
        }
        if (typeof filter === 'string' && filter.charAt(0) !== '/') {
          temp = temp.filter(tempItem => {
            const value = this.getFieldValue(tempItem, field);
            return typeof value === 'string' && value === filter;
          });
        }
        if (typeof filter === 'object' && field in filter) {
          const filterValue = filter[field];
          if (typeof filterValue === 'object' && '$in' in filterValue) {
            temp = temp.filter(tempItem => {
              const value = this.getFieldValue(tempItem, field);
              return !filterValue['$in'].length || filterValue['$in'].includes(value);
            });
          } else if (typeof filterValue === 'object' && ('$gte' in filterValue || '$lte' in filterValue)) {
            temp = temp.filter(tempItem => {
              const value = this.getFieldValue(tempItem, field);
              if (!value) {
                return false;
              }
              try {
                const date = new Date(value);
                const gte = !('$gte' in filterValue) || date >= new Date(filterValue['$gte']);
                const lte = !('$lte' in filterValue) || date <= new Date(filterValue['$lte']);
                return gte && lte;
              } catch (e) {
                return false;
              }
            });
          } else if (
            typeof filterValue === 'string' &&
            filterValue.charAt(0) === '/' &&
            filterValue.charAt(filterValue.length - 1) === '/'
          ) {
            const filterString = filterValue.slice(1, -1);
            temp = temp.filter(tempItem => {
              const value = this.getFieldValue(tempItem, field);
              return typeof value !== 'string' || value.toLowerCase().includes(filterString.toLowerCase());
            });
          } else if (typeof filterValue === 'string' && filterValue.charAt(0) !== '/') {
            temp = temp.filter(tempItem => {
              const value = this.getFieldValue(tempItem, field);
              return typeof value !== 'string' || value === filterValue;
            });
          } else if (typeof filterValue === 'number') {
            temp = temp.filter(tempItem => {
              const value = this.getFieldValue(tempItem, field);
              return typeof value !== 'number' || value === filterValue;
            });
          }
        }
      }
    });
    return temp;
  }

  private getFieldValue(obj, field: string): any {
    let temp = { ...obj };
    field.split('.').forEach(key => {
      temp = !!temp && ![undefined, null].includes(temp[key]) ? temp[key] : null;
    });
    return temp;
  }
}
