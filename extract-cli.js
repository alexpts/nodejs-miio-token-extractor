const inquirer = require("inquirer");
let { AuthMiIO, ApiMiIO } = require('./index');

let authMiIO = new AuthMiIO;
let apiMiIO = new ApiMiIO;

let inputPrompt = [
    {
        name: 'country',
        message: 'Your country: ',
        type: 'list',
        default: "cn",
        choices: [
            { name: "China", value: "cn"},
            { name: "Russia", value: "ru"},
            { name: "USA", value: "us"},
            { name: "Taiwan", value: "tw"},
            { name: "Singapore", value: "sg"},
            { name: "Germany", value: "de"},
            { name: "India", value: "in"},
            { name: "India", value: "i2"},
        ]
    },
    {
        name: 'login',
        message: 'Your login (userId/email/phone):',
        type: 'string',
    },
    {
        name: 'password',
        message: 'Your password: ',
        type: 'password',
    },
];

(async () => {
    let { login, password, country } = await inquirer.prompt(inputPrompt);
    console.log('Auth...');
    let { userId, token, ssecurity } = await authMiIO.login(login, password);

    console.log('Get devises list...');
    let devices = await apiMiIO.getDeviceList(userId, ssecurity, token, country);
    devices = devices.map(device => {
        let { did, token, name, localip, model, mac } = device;
        return { did, token, name, localip, model, mac };
    });

    console.log(devices);
})();