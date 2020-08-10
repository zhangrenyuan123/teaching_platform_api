module.exports = function(phoneNum, randomNum) {
    const tencentcloud = require('tencentcloud-sdk-nodejs');

    const SmsClient = tencentcloud.sms.v20190711.Client;
    const models = tencentcloud.sms.v20190711.Models;
    const Credential = tencentcloud.common.Credential;
    const ClientProfile = tencentcloud.common.ClientProfile;
    const HttpProfile = tencentcloud.common.HttpProfile;

    let cred = new Credential("AKIDkJex9AvlOOI6zlEjpgJgniU0HH2WnriQ", "cy3tUs6D9oCJDqCH6l9G72g4BBSbdZJn");
    let httpProfile = new HttpProfile();
    httpProfile.endpoint = "sms.tencentcloudapi.com";
    let clientProfile = new ClientProfile();
    clientProfile.httpProfile = httpProfile;
    let client = new SmsClient(cred, "ap-beijing", clientProfile);

    let req = new models.SendSmsRequest();

    let params = `{"PhoneNumberSet":["${phoneNum}"],"TemplateID":"566688","Sign":"张人元学习日记","TemplateParamSet":["${randomNum}"],"SmsSdkAppid":"1400343139"}`
    req.from_json_string(params);


    client.SendSms(req, function(errMsg, response) {

        if (errMsg) {
            return errMsg;
        }
        console.log(response.to_json_string());
    });
}