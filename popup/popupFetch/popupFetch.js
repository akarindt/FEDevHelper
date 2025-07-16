// DOM Elements
const methodSelect = document.getElementById("popup-fetch__method");
const urlInput = document.getElementById("popup-fetch__url");
const sendBtn = document.getElementById("popup-fetch__send-btn");
const responseText = document.getElementById("popup-fetch__response-text");
const responseHeadersText = document.getElementById("popup-fetch__response-headers-text");
const statusElement = document.getElementById("popup-fetch__status");
const timeElement = document.getElementById("popup-fetch__time");
const bodyContent = document.getElementById("popup-fetch__body-content");
const addHeaderBtn = document.getElementById("popup-fetch__add-header");
const headersContainer = document.querySelector(".popup-fetch__headers-container");
const prettifyBtn = document.getElementById("popup-fetch__prettify-btn");
const copyResponseBtn = document.getElementById("popup-fetch__copy-response-btn");
const saveBtn = document.getElementById("popup-fetch__save-btn");
const loadBtn = document.getElementById("popup-fetch__load-btn");
const clearBtn = document.getElementById("popup-fetch__clear-btn");
const authContent = document.getElementById("popup-fetch__auth-content");

// Storage key
const STORAGE_KEY = "fedevhelper_fetch_requests";

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    setupEventListeners();
    setupTabs();
    setupBodyTypeHandlers();
    setupAuthTypeHandlers();
    loadSavedRequest();
});

// Setup event listeners
function setupEventListeners() {
    sendBtn.addEventListener("click", makeRequest);
    addHeaderBtn.addEventListener("click", addHeaderRow);
    prettifyBtn.addEventListener("click", prettifyResponse);
    copyResponseBtn.addEventListener("click", copyResponse);
    saveBtn.addEventListener("click", saveRequest);
    loadBtn.addEventListener("click", loadRequest);
    clearBtn.addEventListener("click", clearAll);

    // Enter key to send request
    urlInput.addEventListener("keypress", e => {
        if (e.key === "Enter") {
            makeRequest();
        }
    });
}

// Setup tabs functionality
function setupTabs() {
    // Request tabs
    document.querySelectorAll(".popup-fetch__tab").forEach(tab => {
        tab.addEventListener("click", () => {
            const tabName = tab.dataset.tab;

            // Remove active class from all tabs and panels
            document
                .querySelectorAll(".popup-fetch__tab")
                .forEach(t => t.classList.remove("active"));
            document
                .querySelectorAll(".popup-fetch__tab-panel")
                .forEach(p => p.classList.remove("active"));

            // Add active class to clicked tab and corresponding panel
            tab.classList.add("active");
            document.getElementById(`popup-fetch__${tabName}-tab`).classList.add("active");
        });
    });

    // Response tabs
    document.querySelectorAll(".popup-fetch__response-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            const tabName = tab.dataset.tab;

            // Remove active class from all response tabs and panels
            document
                .querySelectorAll(".popup-fetch__response-tab")
                .forEach(t => t.classList.remove("active"));
            document
                .querySelectorAll(".popup-fetch__response-panel")
                .forEach(p => p.classList.remove("active"));

            // Add active class to clicked tab and corresponding panel
            tab.classList.add("active");
            document.getElementById(`popup-fetch__${tabName}`).classList.add("active");
        });
    });
}

// Setup body type handlers
function setupBodyTypeHandlers() {
    document.querySelectorAll('input[name="bodyType"]').forEach(radio => {
        radio.addEventListener("change", e => {
            const bodyType = e.target.value;

            if (bodyType === "none") {
                bodyContent.disabled = true;
                bodyContent.value = "";
                bodyContent.placeholder = "Request body content";
            } else {
                bodyContent.disabled = false;

                if (bodyType === "json") {
                    bodyContent.placeholder = '{\n  "key": "value"\n}';
                } else if (bodyType === "text") {
                    bodyContent.placeholder = "Raw text content";
                } else if (bodyType === "form") {
                    bodyContent.placeholder = "key1=value1&key2=value2";
                }
            }
        });
    });
}

// Setup auth type handlers
function setupAuthTypeHandlers() {
    document.querySelectorAll('input[name="authType"]').forEach(radio => {
        radio.addEventListener("change", e => {
            const authType = e.target.value;
            updateAuthContent(authType);
        });
    });
}

// Update auth content based on type
function updateAuthContent(authType) {
    authContent.innerHTML = "";

    if (authType === "bearer") {
        authContent.innerHTML = `
            <input type="text" id="bearer-token" class="popup-fetch__auth-input" placeholder="Bearer token" />
        `;
    } else if (authType === "basic") {
        authContent.innerHTML = `
            <input type="text" id="basic-username" class="popup-fetch__auth-input" placeholder="Username" />
            <input type="password" id="basic-password" class="popup-fetch__auth-input" placeholder="Password" />
        `;
    }
}

// Add header row
function addHeaderRow() {
    const headerRow = document.createElement("div");
    headerRow.className = "popup-fetch__header-row";
    headerRow.innerHTML = `
        <input type="text" placeholder="Header name" class="popup-fetch__header-key" />
        <input type="text" placeholder="Header value" class="popup-fetch__header-value" />
        <button class="popup-fetch__remove-header">×</button>
    `;

    headerRow.querySelector(".popup-fetch__remove-header").addEventListener("click", () => {
        headerRow.remove();
    });

    headersContainer.appendChild(headerRow);
}

// Get headers from UI
function getHeaders() {
    const headers = {};

    // Get custom headers
    document.querySelectorAll(".popup-fetch__header-row").forEach(row => {
        const key = row.querySelector(".popup-fetch__header-key").value.trim();
        const value = row.querySelector(".popup-fetch__header-value").value.trim();

        if (key && value) {
            headers[key] = value;
        }
    });

    // Add auth headers
    const authType = document.querySelector('input[name="authType"]:checked').value;
    if (authType === "bearer") {
        const token = document.getElementById("bearer-token")?.value.trim();
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
    } else if (authType === "basic") {
        const username = document.getElementById("basic-username")?.value.trim();
        const password = document.getElementById("basic-password")?.value.trim();
        if (username && password) {
            headers["Authorization"] = `Basic ${btoa(username + ":" + password)}`;
        }
    }

    // Add content-type for body requests
    const bodyType = document.querySelector('input[name="bodyType"]:checked').value;
    if (bodyType === "json" && bodyContent.value.trim()) {
        headers["Content-Type"] = "application/json";
    } else if (bodyType === "form" && bodyContent.value.trim()) {
        headers["Content-Type"] = "application/x-www-form-urlencoded";
    }

    return headers;
}

// Get request body
function getRequestBody() {
    const bodyType = document.querySelector('input[name="bodyType"]:checked').value;

    if (bodyType === "none" || !bodyContent.value.trim()) {
        return null;
    }

    return bodyContent.value.trim();
}

// Make HTTP request
async function makeRequest() {
    const url = urlInput.value.trim();
    const method = methodSelect.value;

    if (!url) {
        alert("Please enter a URL");
        return;
    }

    // Update UI
    sendBtn.classList.add("loading");
    sendBtn.disabled = true;
    responseText.textContent = "Loading...";
    statusElement.textContent = "";
    timeElement.textContent = "";

    const startTime = Date.now();

    try {
        const headers = getHeaders();
        const body = getRequestBody();

        const options = {
            method,
            headers,
        };

        if (body && method !== "GET" && method !== "HEAD") {
            options.body = body;
        }

        console.log("Making request:", { url, options });

        const response = await fetch(url, options);
        const endTime = Date.now();
        const duration = endTime - startTime;

        // Update status and time
        updateStatus(response.status, response.statusText);
        timeElement.textContent = `${duration}ms`;

        // Get response headers
        const responseHeaders = {};
        response.headers.forEach((value, key) => {
            responseHeaders[key] = value;
        });

        responseHeadersText.textContent = JSON.stringify(responseHeaders, null, 2);

        // Get response body
        const contentType = response.headers.get("content-type") || "";
        let responseBody;

        if (contentType.includes("application/json")) {
            try {
                responseBody = await response.json();
                responseText.textContent = JSON.stringify(responseBody, null, 2);
            } catch (e) {
                responseBody = await response.text();
                responseText.textContent = responseBody;
            }
        } else {
            responseBody = await response.text();
            responseText.textContent = responseBody;
        }
    } catch (error) {
        console.error("Fetch error:", error);
        updateStatus(0, "Network Error");
        responseText.textContent = `Error: ${error.message}`;
        timeElement.textContent = `${Date.now() - startTime}ms`;
    } finally {
        sendBtn.classList.remove("loading");
        sendBtn.disabled = false;
    }
}

// Update status display
function updateStatus(status, statusText) {
    statusElement.textContent = `${status} ${statusText}`;

    // Remove previous classes
    statusElement.classList.remove("success", "error", "info");

    // Add appropriate class
    if (status >= 200 && status < 300) {
        statusElement.classList.add("success");
    } else if (status >= 400) {
        statusElement.classList.add("error");
    } else if (status > 0) {
        statusElement.classList.add("info");
    }
}

// Prettify response
function prettifyResponse() {
    try {
        const content = responseText.textContent;
        const parsed = JSON.parse(content);
        responseText.textContent = JSON.stringify(parsed, null, 2);
    } catch (e) {
        // Not JSON, try to format as best as possible
        console.log("Cannot prettify - not valid JSON");
    }
}

// Copy response to clipboard
async function copyResponse() {
    try {
        await navigator.clipboard.writeText(responseText.textContent);
        const originalText = copyResponseBtn.textContent;
        copyResponseBtn.textContent = "Copied!";
        setTimeout(() => {
            copyResponseBtn.textContent = originalText;
        }, 2000);
    } catch (e) {
        console.error("Failed to copy:", e);
    }
}

// Save current request
function saveRequest() {
    const request = {
        method: methodSelect.value,
        url: urlInput.value,
        headers: getHeaders(),
        body: getRequestBody(),
        bodyType: document.querySelector('input[name="bodyType"]:checked').value,
        authType: document.querySelector('input[name="authType"]:checked').value,
        timestamp: new Date().toISOString(),
    };

    const requests = getSavedRequests();
    requests.unshift(request);

    // Keep only last 10 requests
    if (requests.length > 10) {
        requests.splice(10);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    alert("Request saved!");
}

// Load saved request
function loadRequest() {
    const requests = getSavedRequests();

    if (requests.length === 0) {
        alert("No saved requests found");
        return;
    }

    // For now, load the most recent request
    // In a full implementation, you'd show a list to choose from
    const request = requests[0];

    methodSelect.value = request.method;
    urlInput.value = request.url;

    // Set body type and content
    if (request.bodyType) {
        document.querySelector(`input[name="bodyType"][value="${request.bodyType}"]`).checked =
            true;
        setupBodyTypeHandlers();
        document
            .querySelector(`input[name="bodyType"][value="${request.bodyType}"]`)
            .dispatchEvent(new Event("change"));
    }

    if (request.body) {
        bodyContent.value = request.body;
    }

    // Set auth type
    if (request.authType) {
        document.querySelector(`input[name="authType"][value="${request.authType}"]`).checked =
            true;
        updateAuthContent(request.authType);
    }

    alert("Request loaded!");
}

// Get saved requests
function getSavedRequests() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        return [];
    }
}

// Load most recent saved request on startup
function loadSavedRequest() {
    const requests = getSavedRequests();
    if (requests.length > 0) {
        // Don't auto-load, just keep the default example URL
    }
}

// Clear all inputs
function clearAll() {
    if (confirm("Clear all fields?")) {
        methodSelect.value = "GET";
        urlInput.value = "";
        bodyContent.value = "";
        responseText.textContent = 'Click "Send" to make a request';
        responseHeadersText.textContent = "";
        statusElement.textContent = "";
        timeElement.textContent = "";

        // Reset radio buttons
        document.querySelector('input[name="bodyType"][value="none"]').checked = true;
        document.querySelector('input[name="authType"][value="none"]').checked = true;

        // Clear headers
        const headerRows = document.querySelectorAll(".popup-fetch__header-row");
        headerRows.forEach((row, index) => {
            if (index > 0) {
                // Keep the first row
                row.remove();
            } else {
                row.querySelector(".popup-fetch__header-key").value = "";
                row.querySelector(".popup-fetch__header-value").value = "";
            }
        });

        // Reset body and auth content
        setupBodyTypeHandlers();
        document
            .querySelector('input[name="bodyType"][value="none"]')
            .dispatchEvent(new Event("change"));
        updateAuthContent("none");
    }
}
