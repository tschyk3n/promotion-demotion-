const http = require('http');
const noblox = require('noblox.js');
const axios = require("axios");
const dotenv = require('dotenv');
dotenv.config();

// Webhook URL
const webhookUrl = "https://discord.com/api/webhooks//";

// Function to send a message to the webhook
async function sendMessageToWebhook(url, message) {
    try {
        console.log("✉️ Sending message to webhook...");
        await axios.post(url, {
            content: message
        });
        console.log('✅ Message sent to webhook successfully.');
    } catch (error) {
        console.error('❌ Failed to send message to webhook:', error.message);
    }
}

// Function to fetch the user's name from Roblox API
async function getUserName(userId) {
    try {
        const response = await axios.get(`https://users.roblox.com/v1/users/${userId}`);
        if (response.data && response.data.name) {
            return response.data.name;
        } else {
            return "Unknown User";
        }
    } catch (error) {
        console.error(`❌ Error fetching user name for user ID ${userId}:`, error.message);
        const message = `❌ Error fetching user name for user ID ${userId}: ${error.message}`;
        sendMessageToWebhook(webhookUrl, message);
        return;
    }
}

// Function to start the application
async function startApp() {
    try {
        const currentUser = await noblox.setCookie(process.env.ROBLOX_COOKIE);
        console.log(`✅ Logged in as ${currentUser.UserName} [${currentUser.UserID}]`);
        const message = `Logged in as ${currentUser.UserName} [${currentUser.UserID}]`;
        sendMessageToWebhook(webhookUrl, message);
    } catch (error) {
        console.error(`❌ Error starting the application: ${error.message}`);
        const message = `❌ Error starting the application: ${error.message}`;
        sendMessageToWebhook(webhookUrl, message);
    }
}

startApp();

const server = http.createServer(async (req, res) => {
    if (req.method === 'POST' && req.url === '/promoteUser') {
        let data = '';

        req.on('data', chunk => {
            data += chunk;
        });

        req.on('end', async () => {
            try {
                const jsonData = JSON.parse(data);

                console.log('✅ Received data for promotion:');
                console.log(jsonData);
                const getData = jsonData[0]; // Assuming jsonData is an array with one object

                if (getData) {
                    const groupId = getData.GroupID;
                    const robloxId = getData.UserID;

                    console.log(`✅ GroupId: ${groupId}`);
                    console.log(`✅ UserId: ${robloxId}`);

                    // Fetch the user's name based on the provided user ID
                    const userName = await getUserName(robloxId);

                    async function promoteUser() {
                        try {
                            await noblox.changeRank(groupId, robloxId, 1);
                            console.log(`✅ User ${userName} (${robloxId}) promoted in group`);            
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end('User promoted successfully!');
                            const message = `✅ Success promoting ${userName} (${robloxId}) in ${groupId}`;
                            sendMessageToWebhook(webhookUrl, message);
                        } catch (error) {
                            console.error(`❌ Error promoting user ${userName} (${robloxId}): ${error.message}`);
                            const message = `❌ Error promoting user ${userName} (${robloxId}): ${error.message}`;
                            sendMessageToWebhook(webhookUrl, message);
                        }
                    }

                    promoteUser()
                } else {
                    console.error('❓ No data available for promotion.');
                    const message = `❓ No data available for promotion.`;
                    sendMessageToWebhook(webhookUrl, message);
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end('If this log is your only message, an error has most likely occured on your side. (Promotion)');
            } catch (error) {
                console.error('❌ Error parsing JSON for promotion:', error);
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Bad Request');
                 const message = `❌ Error parsing JSON for promotion: ${error}`;
                 sendMessageToWebhook(webhookUrl, message);
            }
        });
    } else if (req.method === 'POST' && req.url === '/demoteUser') {
        let data = '';

        req.on('data', chunk => {
            data += chunk;
        });

        req.on('end', async () => {
            try {
                const jsonData = JSON.parse(data);

                console.log('✅ Received data for demotion:');
                console.log(jsonData);
                const getData = jsonData[0];

                if (getData) {
                    const groupId = getData.GroupID;
                    const robloxId = getData.UserID;

                    console.log(`✅ GroupId: ${groupId}`);
                    console.log(`✅ UserId: ${robloxId}`);

                    // Fetch the user's name based on the provided user ID
                    const userName = await getUserName(robloxId);

                    async function demoteUser() {
                        try {
                            await noblox.changeRank(groupId, robloxId, -1);
                            console.log(`✅ User ${userName} (${robloxId}) demoted in group`);
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end('User demoted successfully!');
                            const message = `✅ Success demoting ${userName} (${robloxId}) in ${groupId}`;
                            sendMessageToWebhook(webhookUrl, message);
                        } catch (error) {
                            console.error(`❌ Error demoting user ${userName} (${robloxId}): ${error.message}`);
                            const message = `❌ Error demoting user ${userName} (${robloxId}): ${error.message}`;
                            sendMessageToWebhook(webhookUrl, message);
                        }
                    }

                    demoteUser()
                } else {
                    console.error('❓ No data available for demotion.');
                    const message = `❓ No data available for demotion.`;
                    sendMessageToWebhook(webhookUrl, message);
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end('If this log is your only message, an error has most likely occured on your side. (Demotion)');
            } catch (error) {
                console.error(`❌ Error parsing JSON for demotion: ${error}`);
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Bad Request');
                const message = `❌ Error parsing JSON for demotion: ${error}`;
                sendMessageToWebhook(webhookUrl, message);
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

const port = process.env.PORT || 10000;
server.listen(port, () => {
    console.log(`✅ Server is running on port ${port}`);
    const message = `✅ Server is running on port ${port}`;
    sendMessageToWebhook(webhookUrl, message);
});

console.log("Idk")
