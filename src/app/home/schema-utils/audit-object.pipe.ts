import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';

@Pipe({ name: 'objectpipecount' })
export class ObjectPipeCounter implements PipeTransform {
    transform(value: any): string {
        let displayCounter;
        if (typeof (value) === 'string') {
            displayCounter = _.size(JSON.parse(value)) + ' fields';
        } else {
            displayCounter = _.size(value) + ' fields';
        }
        return displayCounter;
    }
}

@Pipe({ name: 'urlTruncate' })
export class UrlTruncate implements PipeTransform {
    transform(value: any): string {
        const start = value.indexOf('?');
        const actionUrl = value.substring(0, start);
        if (actionUrl.length > 0) {
            return actionUrl;
        } else {
            return value;
        }
    }
}



@Pipe({ name: 'weburlTruncate' })
export class WebhookUrlTruncate implements PipeTransform {
    transform(value: any): string {
        const start = 18;
        const actionUrl = value.substring(0, start);
        if (actionUrl.length > 0) {
            return actionUrl;
        } else {
            return value;
        }
    }
}
