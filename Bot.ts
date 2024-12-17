import { Bot } from "grammy";
import cron from "node-cron";
import { findSmallestDate, getCRSF } from "./helpers/functions";
import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import { PROXIES } from "./helpers/constants";
import moment from "moment";

const bot = new Bot("7717614867:AAHk04tDUIo-r1XfYq2qa-GxEVHw1-bJ5yw");

const channelId = "-1002361577211"; // Or use a numerical ID for a group

(async () => {
    const notifiedDates: string[] = [];
    let cookie = "";
    let csrf = "";
    let agent: HttpsProxyAgent<string>;

    const setCookie = (headers: any) => {
        cookie = headers["set-cookie"]?.[0];
    };

    const resetCookies = () => {
        cookie = "";
    };

    const init = async () => {
        // creating proxy agent
        agent = new HttpsProxyAgent(
            PROXIES[Math.floor(Math.random() * PROXIES.length)]
        );

        // Step 1: Loading sign in page to create session and get csrf from login page which will be used in all next requests
        const res1 = await axios.get(
            "https://ais.usvisa-info.com/en-am/niv/users/sign_in",
            {
                httpsAgent: agent,
                httpAgent: agent,
            }
        );

        setCookie(res1.headers);

        csrf = getCRSF(res1.data);

        // Step 2: log in with session id from step first
        const formData = new FormData();
        formData.append("user[email]", "mirose.and.co@gmail.com");
        formData.append("user[password]", "12345678");
        formData.append("policy_confirmed", "1");
        formData.append("commit", "Sign In");

        const res2 = await axios.post(
            "https://ais.usvisa-info.com/en-am/niv/users/sign_in",
            formData,
            {
                httpsAgent: agent,
                httpAgent: agent,
                headers: {
                    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                    "accept-encoding": "gzip, deflate, br, zstd",
                    "accept-language": "en-US,en;q=0.9",
                    "cache-control": "max-age=0",
                    connection: "keep-alive",
                    host: "ais.usvisa-info.com",
                    "if-none-match": 'W/"d3d10dcacb37046ed590b12345dd5d65"',
                    referer: "users/sign_in",
                    "sec-ch-ua":
                        '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": '"Windows"',
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "navigate",
                    "sec-fetch-site": "same-origin",
                    "sec-fetch-user": "?1",
                    "upgrade-insecure-requests": "1",
                    "user-agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
                    "x-csrf-token": csrf,
                    "x-requested-with": "XMLHttpRequest",
                    Cookie: cookie,
                },
            }
        );

        setCookie(res2.headers);

        // Step 3: Loading appoinment page to update csrf token
        const res3 = await axios.get(
            "https://ais.usvisa-info.com/en-am/niv/schedule/63415770/appointment",
            {
                httpsAgent: agent,
                httpAgent: agent,
                headers: {
                    Cookie: cookie,
                    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                    "Accept-Encoding": "gzip, deflate, br, zstd",
                    "Accept-Language": "en-US,en;q=0.9",
                    Connection: "keep-alive",
                    Host: "ais.usvisa-info.com",
                    Referer:
                        "https://ais.usvisa-info.com/en-am/niv/users/sign_in",
                    "Sec-Fetch-Dest": "document",
                    "Sec-Fetch-Mode": "navigate",
                    "Sec-Fetch-Site": "same-origin",
                    "Sec-Fetch-User": "?1",
                    "Upgrade-Insecure-Requests": 1,
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
                    "sec-ch-ua":
                        '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "Windows",
                },
            }
        );

        csrf = getCRSF(res3.data);

        setCookie(res3.headers);

        console.log(csrf, "appointments csrf");
    };

    // set cookies and tokens before starting
    await init();

    // Step 4: Setting cron to check availible dates every minute
    let cronWorkedCount = 0;
    cron.schedule("* * * * *", async () => {
        try {
            // reset cookies/tokens every 20 minute
            if (cronWorkedCount >= 20) {
                await resetCookies();
                await init();
                cronWorkedCount = 0;
            }

            // get availible days
            const res4 = await axios.get(
                "https://ais.usvisa-info.com/en-am/niv/schedule/63415770/appointment/days/122.json",
                {
                    httpsAgent: agent,
                    httpAgent: agent,
                    headers: {
                        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                        "accept-encoding": "gzip, deflate, br, zstd",
                        "accept-language": "en-US,en;q=0.9",
                        Connection: "keep-alive",
                        Host: "ais.usvisa-info.com",
                        "if-none-match": 'W/"d3d10dcacb37046ed590b12345dd5d65"',
                        Referer:
                            "https://ais.usvisa-info.com/en-am/niv/schedule/63415770/appointment",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "navigate",
                        "sec-fetch-site": "same-origin",
                        "user-agent":
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
                        "x-csrf-token": csrf,
                        "x-requested-with": "XMLHttpRequest",
                        "sec-ch-ua":
                            '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
                        "sec-ch-ua-mobile": "?0",
                        "sec-ch-ua-platform": '"Windows"',
                        Cookie: cookie,
                    },
                }
            );

            setCookie(res4.headers);

            const days: { date: string }[] = res4.data;

            console.log(days, "days");

            if (!days) return;

            // find smallest date
            const smallestAvailibleDate = findSmallestDate(
                days.map(({ date }) => date)
            );

            if (
                !notifiedDates.includes(smallestAvailibleDate) &&
                moment(smallestAvailibleDate).diff(moment(), "days") < 150
            ) {
                notifiedDates.push(smallestAvailibleDate);
                // getting availible times for smallest day

                const res5 = await axios.get(
                    `https://ais.usvisa-info.com/en-am/niv/schedule/63415770/appointment/times/122.json?date=${smallestAvailibleDate}&appointments[expedite]=false`,
                    {
                        httpsAgent: agent,
                        httpAgent: agent,
                        headers: {
                            Cookie: cookie,
                            Accept: "application/json, text/javascript, */*; q=0.01",
                            "accept-encoding": "gzip, deflate, br, zstd",
                            "accept-language": "en-US,en;q=0.9",
                            Connection: "keep-alive",
                            Host: "ais.usvisa-info.com",
                            "if-none-match":
                                'W/"d3d10dcacb37046ed590b12345dd5d65"',
                            Referer:
                                "https://ais.usvisa-info.com/en-am/niv/schedule/63415770/appointment",
                            "sec-fetch-dest": "empty",
                            "sec-fetch-mode": "cors",
                            "sec-fetch-site": "same-origin",
                            "user-agent":
                                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
                            "x-csrf-token": csrf,
                            "x-requested-with": "XMLHttpRequest",
                            "sec-ch-ua":
                                '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
                            "sec-ch-ua-mobile": "?0",
                            "sec-ch-ua-platform": '"Windows"',
                        },
                    }
                );

                setCookie(res5.headers);

                // send message to channel
                bot.api.sendMessage(
                    channelId,
                    //@ts-ignore
                    `Hey!!!😀\nNew date availible 🥳, hurry up!\n${smallestAvailibleDate}\nquantity ${res5.data.available_times.length}`
                );
            }
        } catch (e) {
            console.log(e);
        } finally {
            cronWorkedCount++;
        }
    });
})();
