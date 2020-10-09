export interface Properties {
    _description?: string;
    _typeChanged?: string;
    _detailedType?: DetailedType;
    _listInput?: string;
    name?: string;
    type?: string;

    required?: boolean;
    enum?: Array<any>;
    minlength?: number;
    maxlength?: number;
    pattern?: string;
    email?: boolean;
    password?: boolean;
    fieldLength?: number;
    longText?: boolean;
    richText?: boolean;
    hasTokens?: Array<any>;

    min?: number;
    max?: number;
    currency?: Currency;
    natural?: boolean;

    dateType?: string;
    relatedTo?: string;
    relatedSearchField?: string;
    relatedViewFields?: Array<any>;
    schema?: string;
    attributeList?: Array<any>;
    geoType?: string;
    createOnly?: boolean;
    unique?: boolean;
    precision?: number;
}

export enum Currency {
    INR = 'INR',
    USD = 'USD',
    GBP = 'GBP',
    EUR = 'EUR'
}

export enum DetailedType {
    none = '',
    enum = 'enum',
    rich = 'rich',
    long = 'long',
    password = 'password',
    email = 'email',
    currency = 'currency'
}

