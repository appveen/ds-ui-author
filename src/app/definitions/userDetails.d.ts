export interface UserDetails {
    basicDetails?: BasicDetails;
    enableSessionRefresh?: boolean;
    _deleted?: boolean;
    _version?: number;
    _id?: string;
    username?: string;
    sessionTime?: number;
    accessControl?: AccessControl;
    description?: string;
    _lastUpdated?: string;
    _createdAt?: string;
    domains?: Domain[];
    token?: string;
    rToken?: string;
    expiresIn?: number;
    auth?: Auth;
    isSuperAdmin?: boolean;

}

export interface Auth {
    dn?: string;
    authType?:string;
}
export interface AccessControl {
    domains?: null | Domain[];
    accessLevel?: string;
}

export interface BasicDetails {
    name?: string;
    email?: string;
    phone?: string;
}

export interface Domain {
    _id?: string;
    type?: Type;
    description?: null | string;
}

export enum Type {
    Distribution = 'Distribution',
    Management = 'Management',
}
