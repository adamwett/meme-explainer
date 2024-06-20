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
    res.send("Hello World");
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

    // Checks if this is an event from a page subscription
    if (body.object === "page") {
        // Iterates over each entry - there may be multiple if batched

        // biome-ignore lint: shut up
        body.entry.forEach((entry) => {
            // Gets the body of the webhook event
            const webhookEvent = entry.messaging[0];
            console.log(webhookEvent);

            // Get the sender PSID
            const senderPsid = webhookEvent.sender.id;
            console.log(`Sender PSID: ${senderPsid}`);

            // Check if the event is a message or postback and
            // pass the event to the appropriate handler function
            if (webhookEvent.message) {
                handleMessage(senderPsid, webhookEvent.message);
            } else if (webhookEvent.postback) {
                handlePostback(senderPsid, webhookEvent.postback);
            }
        });

        // Returns a '200 OK' response to all requests
        res.status(200).send("EVENT_RECEIVED");
    } else {
        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
    console.log(`Your app is listening on port ${listener.address().port}`);
});
