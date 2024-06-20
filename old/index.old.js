require("dotenv").config();
const { IgApiClient } = require('instagram-private-api');
const { get } = require('request-promise');
const ig = new IgApiClient();
const fs = require('node:fs');

const login = async () => {
    ig.state.generateDevice(process.env.IG_USERNAME);
    await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
};

const post = async (url, caption) => {
    const imageBuffer = await get({
        url: url,
        encoding: null,
    });
    await ig.publish.photo({
        file: imageBuffer,
        caption: caption,
    });
};

const jsonDMs = async () => {
    const [threads] = await ig.feed.directInbox().items();
    return JSON.stringify(threads);
};

const write = (data) => {
    fs.writeFile('data.json', data, (err) => { });
};




const main = async () => {

    console.log("Running...");
    await login();
    console.log("Logged in!");
    const dms = await jsonDMs();
    write(dms);
    console.log("Exiting successfully...");
};

main();
