const fontDetectorButton = document.getElementById("font-detector");
const checkLoadTimeButton = document.getElementById("check-loadtime");
const uriEncoderDecoderButton = document.getElementById("uri-encoder-decoder");

chrome.runtime.onMessage.addListener((message, _) => {
    if (message.fonts) {
        chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
            const JSONString = {
                url: tab.url,
                fonts: message.fonts,
            };

            localStorage.setItem("detectedFonts", JSON.stringify(JSONString));
            chrome.windows.create({
                url: chrome.runtime.getURL("popup/popupFont/popupFont.html"),
                type: "popup",
                width: 600,
                height: 800,
                focused: true,
            });
        });
    }

    if (message.performance) {
        chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
            const JSONString = {
                url: tab.url,
                metrics: message.performance,
            };

            localStorage.setItem("performanceData", JSON.stringify(JSONString));
            chrome.windows.create({
                url: chrome.runtime.getURL("popup/popupLoadTime/popupLoadTime.html"),
                type: "popup",
                width: 600,
                height: 800,
                focused: true,
            });
        });
    }
});

fontDetectorButton.addEventListener("click", async () => {
    const [tab, _] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["scripts/fontDetector.js"],
    });
});

checkLoadTimeButton.addEventListener("click", async () => {
    const [tab, _] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["scripts/checkLoadTime.js"],
    });
});

uriEncoderDecoderButton.addEventListener("click", async () => {
    chrome.windows.create({
        url: chrome.runtime.getURL("popup/popupUriEncoder/popupUriEncoder.html"),
        type: "popup",
        width: 600,
        height: 700,
        focused: true,
    });
});
