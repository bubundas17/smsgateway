const rp = require('request-promise');

const SmsHelper = require('smshelper');

class BulkSms {
    constructor(config) {
        let mainconfig = config || {};

        // Initalizing Veriables
        this.cookie = rp.jar();
        this.username = mainconfig.username;
        this.password = mainconfig.password;
        this.route = mainconfig.route || "Transactional";
        this.baseurl = mainconfig.baseurl || "http://sms2.indiaonlinesolution.com/index.php";
        this.sufix = mainconfig.sufix || "/smsapi";
        this.id = config.id || "DREAMS";

        // Error Checking
        if (!this.username && !this.password) {
            throw new Error("Please Enter SMS Gateway's Username And Password.")
        }


    }

    async login() {
        try {
            let data = await rp.post({
                uri: this.uri("/pages/loginuserid"),
                jar: this.cookie,
                headers: {
                    "x-requested-with": "XMLHttpRequest",
                },
                form: {
                    username: this.username,
                    password: this.password
                }
            })
            setInterval(async () => {
                await this.login()
            }, 45*60*1000)
            return data
        } catch (e) {
            throw e;
        }
    }

    checkBalance() {

    }

    async sendSms(message, numbers, route) {
        try {
            return await rp.post({
                uri: this.uri("/sms/sendsms"),
                jar: this.cookie,
                headers: {
                    "x-requested-with": "XMLHttpRequest",
                },
                form: {
                    routeid: this.route,
                    senderid: this.id,
                    contactnumberst: numbers.join('\n'),
                    msgtype: "textmsg",
                    smscontent: message,
                    // schedulenew: null,
                    totalsms: SmsHelper.parts(message),
                    totalcontacts: numbers.length,
                    // scheduleison: undefined
                }
            })
        } catch (e) {
            throw e;
        }
    }

    uri(uri) {
        return this.baseurl + uri
    }

    smsLength(message){
        let bytesPerSms = 1120;
        let bytes = this.getByteLength(message)
        return Math.ceil(bytes/bytesPerSms)
    }
    getByteLength(normal_val) {
        // Force string type
        normal_val = String(normal_val);

        var byteLen = 0;
        for (var i = 0; i < normal_val.length; i++) {
            var c = normal_val.charCodeAt(i);
            byteLen += 	c < (1 <<  7) ? 1 :
                c < (1 << 11) ? 2 :
                    c < (1 << 16) ? 3 :
                        c < (1 << 21) ? 4 :
                            c < (1 << 26) ? 5 :
                                c < (1 << 31) ? 6 : Number.NaN;
        }
        return byteLen*8;
    }
}

module.exports = BulkSms;