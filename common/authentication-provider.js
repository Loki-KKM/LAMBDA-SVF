"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwoLeggedAuthenticationProvider = exports.BasicAuthenticationProvider = void 0;
const authentication_1 = require("@aps_sdk/authentication");
const autodesk_sdkmanager_1 = require("@aps_sdk/autodesk-sdkmanager");
class BasicAuthenticationProvider {
    constructor(accessToken) {
        this.accessToken = accessToken;
    }
    async getToken(scopes) {
        // TODO: check if the hard-coded token has all the needed scopes
        return this.accessToken;
    }
}
exports.BasicAuthenticationProvider = BasicAuthenticationProvider;
class TwoLeggedAuthenticationProvider {
    constructor(clientId, clientSecret) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.authenticationClient = new authentication_1.AuthenticationClient(autodesk_sdkmanager_1.SdkManagerBuilder.create().build());
    }
    async getToken(scopes) {
        const credentials = await this.authenticationClient.getTwoLeggedToken(this.clientId, this.clientSecret, scopes);
        return credentials.access_token;
    }
}
exports.TwoLeggedAuthenticationProvider = TwoLeggedAuthenticationProvider;
