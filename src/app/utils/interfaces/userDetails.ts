import { Metadata } from 'src/app/utils/interfaces/metadata';
import { App } from 'src/app/utils/interfaces/app';

export interface UserDetails {
    _id?: string;
    _metadata?: Metadata;
    basicDetails?: BasicDetails;
    enableSessionRefresh?: boolean;
    username?: string;
    sessionTime?: number;
    accessControl?: AccessControl;
    description?: string;
    apps?: App[];
    token?: string;
    rToken?: string;
    expiresIn?: number;
    serverTime?: number;
    auth?: Auth;
    isSuperAdmin?: boolean;
    rbacUserTokenDuration?: number;
    rbacUserTokenRefresh?: boolean;
    rbacUserToSingleSession?: boolean;
    rbacUserCloseWindowToLogout?: boolean;
    rbacBotTokenDuration?: number;
    rbacHbInterval?: number;
    rbacPasswordLength?: number;
    rbacPasswordComplexity?: boolean;
    privateFilter?: boolean;
    googleApiKey?: string;
    b2BAgentMaxFileSize?: string;
    enableSearchIndex?: boolean;
    b2BFlowRejectZoneAction?: string;
    uuid?: string;
    checked?: boolean;
    errorMessage?: string;
    lastLogin?: any;
    bot?: boolean;
    transactions?: boolean;
    b2BFlowMaxConcurrentFiles?: number;
    b2BEnableTimebound?: boolean;
    b2BEnableTrustedIp?: boolean;
    b2BEnable?: boolean;
    verifyDeploymentUser?: boolean;
    defaultTimezone?: string;
    experimentalFeatures?: boolean;
    fqdn?: string;
    allowedFileExt?: string[];
}

export interface Auth {
    dn?: string;
    authType?: string;
    adAttribute?: string;
    validAuthTypes?: Array<string>;
}
export interface AccessControl {
    apps?: null | App[];
    accessLevel?: string;
}

export interface BasicDetails {
    name?: string;
    alternateEmail?: string;
    phone?: string;
}

export enum Type {
    Distribution = 'Distribution',
    Management = 'Management',
}
