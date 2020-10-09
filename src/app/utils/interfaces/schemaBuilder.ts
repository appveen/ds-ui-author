export interface ActionConfig {
    loading: boolean;
    status: boolean;
    message: string;
}

export interface EditConfig {
    status: boolean;
    loading?: boolean;
    id?: string;
}
export interface VersionConfig {
    type?: string;
    value?: string;
    isCustomValue?: boolean;
    customValue?: number;
    customValueSuffix?: string;
}

export interface DeleteModalConfig {
    title: string;
    message: string;
    trueButton: string;
    falseButton: string;
    showButtons: boolean;
}
