// Import required modules
const http = require('http'); 
const noblox = require('noblox.js'); 
const axios = require("axios"); 
const dotenv = require('dotenv'); 
dotenv.config(); // Load environment variables from .env file

// Webhook URL for Discord (replace with your actual webhook)
const webhookUrl = "https://discord.com/api/webhooks//";

// Function to send a message to the Discord webhook
async function sendMessageToWebhook(url, message) {
    try {
        console.log("✉️ Sending message to webhook...");
        await axios.post(url, { content: message }); // Send the message using axios POST
        console.log('✅ Message sent to webhook successfully.');
    } catch (error) {
        console.error('❌ Failed to send message to webhook:', error.message);
    }
}

// Function to fetch the user's name from Roblox API using their UserID
async function getUserName(userId) {
    try {
        const response = await axios.get(`https://users.roblox.com/v1/users/${userId}`); // Roblox API call to get user data
        if (response.data && response.data.name) {
            return response.data.name; // Return the username if found
        } else {
            return "Unknown User"; // Return a fallback name if not found
        }
    } catch (error) {
        console.error(`❌ Error fetching user name for user ID ${userId}:`, error.message);
        const message = `❌ Error fetching user name for user ID ${userId}: ${error.message}`;
        sendMessageToWebhook(webhookUrl, message); // Send error message to webhook
        return;
    }
}

// Function to start the application and log in to Roblox
async function startApp() {
    try {
        const currentUser = await noblox.setCookie(process.env.ROBLOX_COOKIE); // Log in to Roblox using cookie from environment variables
        console.log(`✅ Logged in as ${currentUser.UserName} [${currentUser.UserID}]`);
        const message = `Logged in as ${currentUser.UserName} [${currentUser.UserID}]`;
        sendMessageToWebhook(webhookUrl, message); // Notify successful login via webhook
    } catch (error) {
        console.error(`❌ Error starting the application: ${error.message}`);
        const message = `❌ Error starting the application: ${error.message}`;
        sendMessageToWebhook(webhookUrl, message); // Notify error via webhook
    }
}

// Start the application
startApp();

// Create an HTTP server to handle promotion and demotion requests
const server = http.createServer(async (req, res) => {
    // Handle promotion requests
    if (req.method === 'POST' && req.url === '/promoteUser') {
        let data = '';

        // Collect incoming data chunks
        req.on('data', chunk => {
            data += chunk;
        });

        // Once data collection is complete
        req.on('end', async () => {
            try {
                const jsonData = JSON.parse(data); // Parse the incoming JSON data

                console.log('✅ Received data for promotion:');
                console.log(jsonData);
                const getData = jsonData[0]; // Assuming jsonData is an array with one object

                if (getData) {
                    const groupId = getData.GroupID; // Extract GroupID from data
                    const robloxId = getData.UserID; // Extract UserID from data

                    console.log(`✅ GroupId: ${groupId}`);
                    console.log(`✅ UserId: ${robloxId}`);

                    // Fetch the user's name based on the provided user ID
                    const userName = await getUserName(robloxId);

                    // Function to promote the user in the group
                    async function promoteUser() {
                        try {
                            await noblox.changeRank(groupId, robloxId, 1); // Promote the user in the Roblox group
                            console.log(`✅ User ${userName} (${robloxId}) promoted in group`);
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end('User promoted successfully!');
                            const message = `✅ Success promoting ${userName} (${robloxId}) in ${groupId}`;
                            sendMessageToWebhook(webhookUrl, message); // Notify success via webhook
                        } catch (error) {
                            console.error(`❌ Error promoting user ${userName} (${robloxId}): ${error.message}`);
                            const message = `❌ Error promoting user ${userName} (${robloxId}): ${error.message}`;
                            sendMessageToWebhook(webhookUrl, message); // Notify error via webhook
                        }
                    }

                    promoteUser(); // Call the function to promote the user
                } else {
                    console.error('❓ No data available for promotion.');
                    const message = `❓ No data available for promotion.`;
                    sendMessageToWebhook(webhookUrl, message); // Notify missing data via webhook
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end('If this log is your only message, an error has most likely occurred on your side. (Promotion)');
            } catch (error) {
                console.error('❌ Error parsing JSON for promotion:', error);
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Bad Request');
                const message = `❌ Error parsing JSON for promotion: ${error}`;
                sendMessageToWebhook(webhookUrl, message); // Notify error via webhook
            }
        });
    }
    // Handle demotion requests
    else if (req.method === 'POST' && req.url === '/demoteUser') {
        let data = '';

        // Collect incoming data chunks
        req.on('data', chunk => {
            data += chunk;
        });

        // Once data collection is complete
        req.on('end', async () => {
            try {
                const jsonData = JSON.parse(data); // Parse the incoming JSON data

                console.log('✅ Received data for demotion:');
                console.log(jsonData);
                const getData = jsonData[0]; // Assuming jsonData is an array with one object

                if (getData) {
                    const groupId = getData.GroupID; // Extract GroupID from data
                    const robloxId = getData.UserID; // Extract UserID from data

                    console.log(`✅ GroupId: ${groupId}`);
                    console.log(`✅ UserId: ${robloxId}`);

                    // Fetch the user's name based on the provided user ID
                    const userName = await getUserName(robloxId);

                    // Function to demote the user in the group
                    async function demoteUser() {
                        try {
                            await noblox.changeRank(groupId, robloxId, -1); // Demote the user in the Roblox group
                            console.log(`✅ User ${userName} (${robloxId}) demoted in group`);
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end('User demoted successfully!');
                            const message = `✅ Success demoting ${userName} (${robloxId}) in ${groupId}`;
                            sendMessageToWebhook(webhookUrl, message); // Notify success via webhook
                        } catch (error) {
                            console.error(`❌ Error demoting user ${userName} (${robloxId}): ${error.message}`);
                            const message = `❌ Error demoting user ${userName} (${robloxId}): ${error.message}`;
                            sendMessageToWebhook(webhookUrl, message); // Notify error via webhook
                        }
                    }

                    demoteUser(); // Call the function to demote the user
                } else {
                    console.error('❓ No data available for demotion.');
                    const message = `❓ No data available for demotion.`;
                    sendMessageToWebhook(webhookUrl, message); // Notify missing data via webhook
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end('If this log is your only message, an error has most likely occurred on your side. (Demotion)');
            } catch (error) {
                console.error(`❌ Error parsing JSON for demotion: ${error}`);
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Bad Request');
                const message = `❌ Error parsing JSON for demotion: ${error}`;
                sendMessageToWebhook(webhookUrl, message); // Notify error via webhook
            }
        });
    }
    // Handle other routes (404 Not Found)
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

// Start the server and listen on the specified port
const port = process.env.PORT || 10000; // Use the port from environment variables or default to 10000
server.listen(port, () => {
    console.log(`✅ Server is running on port ${port}`);
    const message = `✅ Server is running on port ${port}`;
    sendMessageToWebhook(webhookUrl, message); // Notify server startup via webhook
});

