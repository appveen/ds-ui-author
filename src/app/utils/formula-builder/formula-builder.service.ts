import { Injectable } from '@angular/core';
import * as uuid from 'uuid/v1';
import { MapperFormula } from './formula-builder';

@Injectable({
    providedIn: 'root'
})
export class FormulaBuilderService {

    restrictedKeys: Array<string>;
    constructor() {
        const self = this;
        self.restrictedKeys = [
            'Control',
            'Shift',
            'Alt',
            'CapsLock',
            'Tab',
            'Escape',
            'Meta'
        ];
    }

    restrictKey(event: KeyboardEvent) {
        const self = this;
        if (self.restrictedKeys.indexOf(event.key) > -1) {
            return true;
        } else {
            return false;
        }
    }

    removeFunction(func: MapperFormula, operation: string) {
        const self = this;
        if (func.operation === operation) {
            func.operation = null;
            func.type = null;
            func.label = null;
            func.args = [];
        } else {
            if (!func.args) {
                func.args = [];
            }
            func.args.forEach(fn => {
                self.removeFunction(fn, operation);
            });
        }
    }

    cleanPayload(data: MapperFormula) {
        const self = this;
        delete data.id;
        delete data.label;
        if (data.args && data.args.length > 0) {
            data.args.forEach(e => {
                self.cleanPayload(e);
            });
        }
    }

    patchData(data: MapperFormula) {
        const self = this;
        const functionList = self.getFunctionList();
        const t1 = functionList.find(e => Boolean(e.items.find(i => i.operation === data.operation)));
        if (t1) {
            const t2 = t1.items.find(i => i.operation === data.operation);
            data.label = t2.label;
            data.operationType = t2.operationType;
        } else {
            if (data.dataKey) {
                const temp = data.dataKey.split('.').filter(e => e && e !== '_data').pop();
                data.label = temp;
                delete data.operationType;
                delete data.operation;
            } else {
                delete data.operationType;
                delete data.operation;
                data.label = data.value;
            }
        }
        data.id = uuid();
        if (data.args && data.args.length > 0) {
            data.args.forEach(e => {
                self.patchData(e);
            });
        }
    }

    getFunctionList(): Array<any> {
        return [
            {
                selected: true,
                category: 'String',
                items: [
                    {
                        operationType: 'function',
                        label: 'SUBSTRING',
                        operation: 'fn:substring',
                        args: [
                            {
                                id: uuid(),
                                type: 'string',
                                description: 'string'
                            },
                            {
                                id: uuid(),
                                type: 'number',
                                description: 'starting index'
                            },
                            {
                                id: uuid(),
                                type: 'number',
                                description: 'length'
                            }
                        ]
                    },
                    {
                        operationType: 'function',
                        label: 'CONCAT',
                        operation: 'fn:concat',
                        args: [
                            {
                                id: uuid(),
                                type: 'string',
                                description: 'first string'
                            },
                            {
                                id: uuid(),
                                type: 'string',
                                description: 'second string'
                            }
                        ]
                    },
                    {
                        operationType: 'function',
                        label: 'CONTAINS',
                        operation: 'fn:contains',
                        args: [
                            {
                                id: uuid(),
                                type: 'string',
                                description: 'source string'
                            },
                            {
                                id: uuid(),
                                type: 'string',
                                description: 'string to find'
                            }
                        ]
                    },
                    {
                        operationType: 'function',
                        label: 'REPLACE',
                        operation: 'fn:replace',
                        args: [
                            {
                                id: uuid(),
                                type: 'string',
                                description: 'source string'
                            },
                            {
                                id: uuid(),
                                type: 'string',
                                description: 'pattern'
                            },
                            {
                                id: uuid(),
                                type: 'string',
                                description: 'replace with'
                            }
                        ]
                    },
                    {
                        operationType: 'function',
                        label: 'LOWER-CASE',
                        operation: 'fn:lower-case',
                        args: [
                            {
                                id: uuid(),
                                type: 'string',
                                description: 'source string'
                            }
                        ]
                    },
                    {
                        operationType: 'function',
                        label: 'UPPER-CASE',
                        operation: 'fn:upper-case',
                        args: [
                            {
                                id: uuid(),
                                type: 'string',
                                description: 'source string'
                            }
                        ]
                    }
                ]
            },
            {
                selected: false,
                category: 'Number',
                items: [
                    {
                        operationType: 'operator',
                        label: '+',
                        operation: '+',
                        args: [
                            {
                                id: uuid(),
                                type: 'number',
                                description: 'first number'
                            },
                            {
                                id: uuid(),
                                type: 'number',
                                description: 'second number'
                            }
                        ]
                    },
                    {
                        operationType: 'operator',
                        label: '-',
                        operation: '-',
                        args: [
                            {
                                id: uuid(),
                                type: 'number',
                                description: 'first number'
                            },
                            {
                                id: uuid(),
                                type: 'number',
                                description: 'second number'
                            }
                        ]
                    },
                    {
                        operationType: 'operator',
                        label: '*',
                        operation: '*',
                        args: [
                            {
                                id: uuid(),
                                type: 'number',
                                description: 'first number'
                            },
                            {
                                id: uuid(),
                                type: 'number',
                                description: 'second number'
                            }
                        ]
                    },
                    {
                        operationType: 'function',
                        label: 'MIN',
                        operation: 'fn:min',
                        args: [
                            {
                                id: uuid(),
                                type: 'array',
                                description: 'array of numbers'
                            }
                        ]
                    },
                    {
                        operationType: 'function',
                        label: 'MAX',
                        operation: 'fn:max',
                        args: [
                            {
                                id: uuid(),
                                type: 'array',
                                description: 'array of numbers'
                            }
                        ]
                    },
                    {
                        operationType: 'function',
                        label: 'AVG',
                        operation: 'fn:avg',
                        args: [
                            {
                                id: uuid(),
                                type: 'array',
                                description: 'array of numbers'
                            }
                        ]
                    },
                    {
                        operationType: 'function',
                        label: 'SUM',
                        operation: 'fn:sum',
                        args: [
                            {
                                id: uuid(),
                                type: 'array',
                                description: 'array of numbers'
                            }
                        ]
                    },
                    {
                        operationType: 'function',
                        label: 'CEILING',
                        operation: 'fn:ceiling',
                        args: [
                            {
                                id: uuid(),
                                type: 'number',
                                description: 'source number'
                            }
                        ]
                    },
                    {
                        operationType: 'function',
                        label: 'FLOOR',
                        operation: 'fn:floor',
                        args: [
                            {
                                id: uuid(),
                                type: 'number',
                                description: 'source number'
                            }
                        ]
                    },
                    {
                        operationType: 'function',
                        label: 'ROUND',
                        operation: 'fn:round-half-to-even',
                        args: [
                            {
                                id: uuid(),
                                type: 'number',
                                description: 'source number'
                            }
                        ]
                    },
                    {
                        operationType: 'function',
                        label: 'DIV',
                        operation: 'div',
                        args: [
                            {
                                id: uuid(),
                                type: 'number',
                                description: 'first number'
                            },
                            {
                                id: uuid(),
                                type: 'number',
                                description: 'second number'
                            }
                        ]
                    },
                    {
                        operationType: 'function',
                        label: 'MOD',
                        operation: 'mod',
                        args: [
                            {
                                id: uuid(),
                                type: 'number',
                                description: 'first number'
                            },
                            {
                                id: uuid(),
                                type: 'number',
                                description: 'second number'
                            }
                        ]
                    }
                ]
            },
            {
                selected: false,
                category: 'Date',
                items: [
                    {
                        operationType: 'function',
                        label: 'Parse',
                        operation: 'fn:parse',
                        args: [
                            {
                                id: uuid(),
                                type: 'string',
                                description: 'first string'
                            },
                            {
                                id: uuid(),
                                type: 'date',
                                description: 'first date'
                            }
                        ]
                    },
                    {
                        operationType: 'function',
                        label: 'Format',
                        operation: 'fn:format',
                        args: [
                            {
                                id: uuid(),
                                type: 'string',
                                description: 'first string'
                            },
                            {
                                id: uuid(),
                                type: 'date',
                                description: 'first date'
                            }
                        ]
                    }
                ]
            }
        ];
    }
}
