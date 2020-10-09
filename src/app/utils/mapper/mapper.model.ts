export class Definition {
    id: string;
    depth: Array<any>;
    objKey: string;
    key: string;
    name: string;
    properties: any;
    type: string;
    definition: Definition[];
    parent: string;
    lastChild: boolean;
    path: string;
    fullPath: string;
    dataPath: string;
    formatType: string;
    hasRoot: boolean;
    rootKey: string;
    xpath: string;
    static getInstance() {
        return new Definition();
    }

    constructor() {

    }

    patch(values: any) {
        if (values) {
            this.id = values.id;
            this.depth = values.depth;
            this.key = values.key;
            this.objKey = values.objKey;
            this.fullPath = values.fullPath;
            this.dataPath = values.dataPath;
            this.path = values.path;
            this.name = values.name;
            this.type = values.type;
            this.formatType = values.formatType;
            this.lastChild = values.lastChild;
            this.hasRoot = values.hasRoot;
            this.rootKey = values.rootKey;
            this.xpath = values.xpath;
            this.parent = values.parent;
            if (values.properties) {
                this.properties = JSON.parse(JSON.stringify(values.properties));
            }
            if (values.definition) {
                this.definition = JSON.parse(JSON.stringify(values.definition));
            }
        }
    }

    /**
     * @description returns if the toggle symbol should be shown
     * @returns boolean
     */
    get canToggle() {
        let flag = false;
        if (this.type === 'Object') {
            flag = true;
        }
        if (this.type === 'Array' && this.definition && this.definition[0]
            && this.definition[0].key === '_self' && this.definition[0].type === 'Object') {
            flag = true;
        }
        return flag;
    }
    get isArray() {
        return this.type === 'Array';
    }
    get isObject() {
        return this.type === 'Object';
    }

    get valid() {
        return Boolean(this.name && this.name.trim());
    }

    get isHeader() {
        return this.path.indexOf('$headers') > -1;
    }
}

export class Mapping {
    source?: Definition[] = [];
    target?: Definition;
    formula?: any;
    formulaHTML?: string;
    lastChild?: boolean;
    constructor() {
        this.formula = {};
    }
    /**
     * @description returns if a source can de added to the this mapping.
     * @returns boolean
     */
    get disabled() {
        let flag = false;
        if (this.target.isArray || this.target.canToggle) {
            flag = true;
        }
        return flag;
    }
    /**
     * @description returns if the function symbol should be shown.
     * @returns boolean
     */
    get hasFunction() {
        return this.source.length > 1 || (Object.keys(this.formula).length !== 0);
    }
    static getInstance() {
        return new Mapping();
    }
}
