export class FormulaBuilder {
}

export interface FunctionList {
    selected?: boolean;
    category?: string;
    items?: Array<any>;
}

export class MapperFunction {
    label: string;
    description: string;
    operation: string;
    operationType: string;
    args: Array<MapperFunctionArgs>;
    constructor(data?: MapperFunction) {
        if (data) {
            Object.assign(this, data);
            if (data.args) {
                this.args = data.args.map(e => new MapperFunctionArgs(e));
            }
        }
    }
}

export class MapperFunctionArgs extends MapperFunction {
    id: string;
    type: MapperFunctionArgsType;
    value: any;
    constructor(data?: MapperFunctionArgs) {
        super(data)
        if (data) {
            Object.assign(this, data);
        }
    }
}

enum MapperFunctionArgsType {
    FIXED = 'FIXED',
    VALUE = 'VALUE',
    DEDUCED = 'DEDUCED'
}

export interface MapperFormula {
    id?: string;
    label?: string;
    type?: string;
    value?: string;
    dataKey?: string;
    operation?: string;
    operationType?: string;
    args?: Array<MapperFormula>;
}
