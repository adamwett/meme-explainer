// Use dotenv to read .env vars into Node
require("dotenv").config();

// Imports dependencies and set up http server
const request = require("request");
const express = require("express");
const { urlencoded, json } = require("body-parser");
const app = express();

// Parse application/x-www-form-urlencoded
app.use(urlencoded({ extended: true }));

// Parse application/json
app.use(json());

// Respond with 'Hello World' when a GET request is made to the homepage
app.get("/", (_req, res) => {
    res.send("https://adamwett.xyz/");
});

// Adds support for GET requests to our webhook
app.get("/webhook", (req, res) => {

    // Your verify token. Should be a random string.
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

    // Parse the query params
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {
        // Checks the mode and token sent is correct
        if (mode === "subscribe" && token === VERIFY_TOKEN) {
            // Responds with the challenge token from the request
            console.log("WEBHOOK_VERIFIED");
            res.status(200).send(challenge);
        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
});

// Creates the endpoint for your webhook
app.post("/webhook", (req, res) => {
    const body = req.body;

    console.log("WEBHOOK CALLED");
    console.log(req.body);

    // see if this is an instagram webhook request
    if (body.object === "instagram") {
        // loop thru the entries
        for (const entry of body.entry) {
            // loop thru the changes
            console.log(JSON.stringify(entry));
            // for (const change in entry.changes) {
            //     // put it in JSON and log it
            //     console.log(JSON.stringify(change));
            // };
        };
        return;
    }


    // Returns a '404 Not Found'
    res.sendStatus(404);

});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
    console.log(`Your app is listening on port ${listener.address().port}`);
});
