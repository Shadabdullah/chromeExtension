// Function to handle button click (copy data to storage)
async function copyToStorage() {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const tab = tabs[0];
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => {
                const content =  Array.from(document.querySelectorAll('p')).map(p => p.textContent);
                console.log(content)
                chrome.runtime.sendMessage({ action: 'copy', content });
            }
        });
        document.getElementById("copy").innerText = 'Copied';
    });
}




// Event listeners for copy and paste buttons
document.getElementById("copy").addEventListener('click', copyToStorage);


// Function to save data to storage
function saveData(data) {
    const expirationTime = Date.now() + 5 * 60 * 1000; // Set expiration time (5 minutes)
    chrome.storage.local.set({ 'storedData': { data, expirationTime } });
    
}



// Function to clear stored data
function clearStoredData() {
    chrome.storage.local.remove('storedData');
}


chrome.runtime.onMessage.addListener(async (message) => {
    if (message.action === 'copy') {
        clearStoredData();
        saveData(message.content);

    }

    
});

function retrieveData() {
    return new Promise((resolve) => {
        chrome.storage.local.get('storedData', (result) => {
            const storedData = result.storedData;
            if (storedData && storedData.expirationTime > Date.now()) {
                const contentToPaste = storedData.data.join('\n');
                resolve(contentToPaste);
            } else {
                resolve(null);
            }
        });
    });
}

// Function to handle button click (paste data)
async function pasteFromStorage() {
    const content = await retrieveData();
    console.log("ENtering")
    console.log(content)
    if (content) {
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            const tab = tabs[0];
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                args:[content] ,
                function: (content) => {
                    console.log("Nicve")
                 
                },
               
            });
        });
    }
}
document.getElementById("paste").addEventListener('click',pasteFromStorage);