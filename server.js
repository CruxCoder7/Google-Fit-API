import dotenv from "dotenv"
dotenv.config()
import express, { urlencoded, json } from "express"
import request from "request"
import urlParse from "url-parse"
import queryParse from "query-string"
import cors from "cors"
import { google } from "googleapis"
import axios from "axios"


const app = express();

app.use(urlencoded({ extended: true }))
app.use(json())
app.use(cors())

app.get("/", (req, res) => {
    const ouath2client = new google.auth.OAuth2(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        "http://localhost:3000/steps"
    )
    const scopes = ["https://www.googleapis.com/auth/fitness.activity.read profile email openid"]
    const url = ouath2client.generateAuthUrl({
        access_type: "offline",
        scope: scopes,
        state: JSON.stringify({ callbackUrl: req.body.callbackUrl, userID: req.body.userid })
    })

    request(url, (err, response, body) => {
        console.log("error", err);
        console.log("statuscode", response && response.statusCode)
        res.send({ url })
    })
})

app.get("/steps", async (req, res) => {
    const queryURL = new urlParse(req.url);
    const code = queryParse.parse(queryURL.query).code;
    const ouath2client = new google.auth.OAuth2(
        "586194342035-9hg6btal5a96cacefgd744s8hm0ibn8u.apps.googleusercontent.com",
        "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",
        "http://localhost:3000/steps"
    )

    const tokens = await ouath2client.getToken(code);

    try {
        const result = await axios({
            method: "GET",
            headers: {
                authorization: "Bearer " + tokens.tokens.access_token
            },
            "Content-Type": "application/json",
            url: `https://www.googleapis.com/fitness/v1/users/me/dataSources/derived:com.google.step_count.delta:407408718192:Example Manufacturer:ExampleTablet:1000001:MyDataSource`
        })
        console.log(result);
    } catch (error) {
        console.log(error);
    }

    res.send("HELLO");
})

app.listen(3000, () => {
    console.log("listening");
})