import { App } from "./app";

export class User {
    _id: string;
    basicDetails: BasicDetails;
    enableSessionRefresh: boolean;
    username: string;
    sessionTime: number;
    accessControl: AccessControl;
    description: string;
    apps: App[];
    token: string;
    rToken: string;
    expiresIn: number;
    serverTime: number;
    auth: Auth;
    isSuperAdmin: boolean;
    rbacUserTokenDuration: number;
    rbacUserTokenRefresh: boolean;
    rbacUserToSingleSession: boolean;
    rbacUserCloseWindowToLogout: boolean;
    rbacBotTokenDuration: number;
    rbacHbInterval: number;
    privateFilter: boolean;
    googleApiKey: string;
    b2BAgentMaxFileSize: string;
    enableSearchIndex: boolean;
    b2BFlowRejectZoneAction: string;
    uuid: string;
    checked: boolean;
    errorMessage: string;
    lastLogin: any;
    bot: boolean;
    transactions: boolean;
    b2BFlowMaxConcurrentFiles: number;
    b2BEnableTimebound: boolean;
    b2BEnableTrustedIp: boolean;
    verifyDeploymentUser: boolean;
    constructor(data?) {
        if (data) {
            Object.assign(this, data);
        }
    }
}


export class Auth {
    isLdap: boolean;
    dn: string;
    authType: string;
    adAttribute: string;
    validAuthTypes: Array<string>;
    constructor(data?) {
        if (data) {
            Object.assign(this, data);
        }
    }
}
export class AccessControl {
    apps: null | App[];
    accessLevel: string;
    constructor(data?) {
        if (data) {
            Object.assign(this, data);
        }
    }
}

export class BasicDetails {
    name: string;
    alternateEmail: string;
    phone: string;
    constructor(data?) {
        if (data) {
            Object.assign(this, data);
        }
    }
}
