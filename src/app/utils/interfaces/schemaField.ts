import { Properties } from 'src/app/utils/interfaces/schemaProperties';

export interface SchemaField {
    name?: string;
    type?: string;
    properties?: Properties;
    definition?: SchemaField[];
    _fieldId?: string;
    _placeholder?: string;
    _newField?: boolean;
    _disableType?: boolean;
}
