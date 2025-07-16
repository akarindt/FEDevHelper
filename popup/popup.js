const fontDetectorButton = document.getElementById("font-detector");
const checkLoadTimeButton = document.getElementById("check-loadtime");
const uriEncoderDecoderButton = document.getElementById("uri-encoder-decoder");
const colorPickerButton = document.getElementById("color-picker");
const jsonFormatterButton = document.getElementById("json-formatter");
const lighthouseTestButton = document.getElementById("lighthouse-test");
const rulerToolButton = document.getElementById("ruler-tool");
const fetchToolButton = document.getElementById("fetch-tool");

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

colorPickerButton.addEventListener("click", async () => {
    chrome.windows.create({
        url: chrome.runtime.getURL("popup/popupColorPicker/popupColorPicker.html"),
        type: "popup",
        width: 600,
        height: 800,
        focused: true,
    });
});

jsonFormatterButton.addEventListener("click", async () => {
    chrome.windows.create({
        url: chrome.runtime.getURL("popup/popupJsonFormatter/popupJsonFormatter.html"),
        type: "popup",
        width: 600,
        height: 900,
        focused: true,
    });
});

lighthouseTestButton.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const tabInfo = {
        url: tab.url,
        title: tab.title,
        id: tab.id,
    };

    localStorage.setItem("lighthouseTabInfo", JSON.stringify(tabInfo));
    chrome.windows.create({
        url: chrome.runtime.getURL("popup/popupLighthouse/popupLighthouse.html"),
        type: "popup",
        width: 650,
        height: 800,
        focused: true,
    });
});

rulerToolButton.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["scripts/ruler.js"],
    });

    // Close the popup to not interfere with measurements
    window.close();
});

fetchToolButton.addEventListener("click", async () => {
    chrome.windows.create({
        url: chrome.runtime.getURL("popup/popupFetch/popupFetch.html"),
        type: "popup",
        width: 800,
        height: 900,
        focused: true,
    });
});
