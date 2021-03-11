export class App {
    _id: string;
    type: string;
    description: string;
    appCenterStyle: AppCenterStyle;
    logo: Logo;
    users: Array<string>;
    groups: Array<string>;
    selected: boolean;
    headers: Array<Header>;
    serviceVersionValidity: {
        validityValue: any;
        validityType: string
    };
    workflowConfig: {
        user: boolean,
        bot: boolean,
        group: boolean
    };
    agentTrustedIP: {
        list: Array<string>;
        enabled: boolean;
    };
    disableInsights: boolean;
    constructor(data?) {
        if (data) {
            Object.assign(this, data);
        }
    }
}

export class AppCenterStyle {
    theme: string;
    bannerColor: boolean;
    primaryColor: string;
    textColor: string;
    constructor(data?) {
        if (data) {
            Object.assign(this, data);
        }
    }
}

export class Logo {
    full: string;
    thumbnail: string;
    constructor(data?) {
        if (data) {
            Object.assign(this, data);
        }
    }
}

export class Header {
    key: string;
    value: string;
    header: string;
    constructor(data?) {
        if (data) {
            Object.assign(this, data);
        }
    }
}
