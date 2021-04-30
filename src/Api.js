const fetch = require("node-fetch");
const crypto = require('crypto');


module.exports = class MiIOApi {

    #apiUrl = 'https://api.io.mi.com/app';
    #allowCounty = ["", "ru", "us", "tw", "sg", "cn", "de", "in", "i2"];

    constructor(country = '') {
        this.#apiUrl = this.getApiUrl(country);
    }

    getApiUrl(country) {
        if (this.#allowCounty.includes(country) === false) {
            throw new Error('Country is not allow');
        }

        let countryDomain = country ?
            country === 'cn' ? '' : country + '.'
            : '';

        return `https://${countryDomain}api.io.mi.com/app`;
    }

    generateNonce = (security) => {
        let nonce = crypto.randomBytes(12);
        let value = Buffer.from(security, "base64");
        value = Buffer.concat([value, nonce]);

        return {
            nonce: nonce.toString('base64'),
            signedNonce: crypto.createHash('sha256').update(value).digest('base64'),
        };
    }

    /**
     * @param {string} uri
     * @param {string} signedNonce
     * @param {string} nonce
     * @param {{}} data
     * @return {string}
     */
    generateSignature(uri, signedNonce, nonce, data = {}) {
        let signatureParams = [uri, signedNonce, nonce, `data=${JSON.stringify(data)}`];
        let signedString = signatureParams.join('&');

        return crypto.createHmac('sha256', Buffer.from(signedNonce, "base64"))
            .update(signedString)
            .digest('base64');
    }

    async getDeviceList(userId, security, token, country = null) {
        let url = country === null ? this.#apiUrl : this.getApiUrl(country);

        let { nonce, signedNonce } = this.generateNonce(security);
        let data = {getVirtualModel: false, getHuamiDevices: 0};

        let action = '/home/device_list';
        let signature = this.generateSignature(action, signedNonce, nonce, data);

        let body = new URLSearchParams;
        body.append('_nonce', nonce);
        body.append('signature', signature);
        body.append('data', JSON.stringify(data));

        let response = await fetch(url + action, {
            method: 'POST',
            headers: {
                'x-xiaomi-protocal-flag-cli': 'PROTOCAL-HTTP2',
                'Cookie': `userId=${userId}; serviceToken=${token}`,
            },
            body: body
        });

        let json = await response.json();
        return json.result.list;
    }
}