

document.addEventListener("DOMContentLoaded", function() {
    setInterval(retrieveDataFromServer, 5000);
});

function retrieveDataFromServer() {
    fetch("/getGameData") 
    .then(response => {
        console.log("Received response:", response);
        return response.json();
    })
    .then(data => {
        console.log("Received data from the server:", data);
    })
    .catch(error => {
        console.error("Error retrieving data:", error);
    });
}