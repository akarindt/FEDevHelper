// DOM elements
let inputTextarea;
let outputTextarea;
let formatBtn;
let minifyBtn;
let validateBtn;
let clearBtn;
let copyBtn;
let statusDiv;

const initializeElements = () => {
    inputTextarea = document.getElementById("popup-json__input");
    outputTextarea = document.getElementById("popup-json__output");
    formatBtn = document.getElementById("popup-json__format-btn");
    minifyBtn = document.getElementById("popup-json__minify-btn");
    validateBtn = document.getElementById("popup-json__validate-btn");
    clearBtn = document.getElementById("popup-json__clear-btn");
    copyBtn = document.getElementById("popup-json__copy-btn");
    statusDiv = document.getElementById("popup-json__status");
};

const attachEventListeners = () => {
    formatBtn.addEventListener("click", formatJSON);
    minifyBtn.addEventListener("click", minifyJSON);
    validateBtn.addEventListener("click", validateJSON);
    clearBtn.addEventListener("click", clearAll);
    copyBtn.addEventListener("click", copyResult);

    inputTextarea.addEventListener("input", () => {
        if (inputTextarea.value.trim()) {
            enableButtons();
        } else {
            disableButtons();
        }
        clearStatus();
    });
};

const formatJSON = () => {
    const input = inputTextarea.value.trim();

    if (!input) {
        showError("Please enter JSON data to format");
        return;
    }

    try {
        setButtonLoading(formatBtn, true);
        const parsed = JSON.parse(input);
        const formatted = JSON.stringify(parsed, null, 2);
        outputTextarea.value = formatted;
        showSuccess("JSON formatted successfully!");
        enableCopyButton();
    } catch (error) {
        showError("Invalid JSON: " + error.message);
        outputTextarea.value = "";
    } finally {
        setButtonLoading(formatBtn, false);
    }
};

const minifyJSON = () => {
    const input = inputTextarea.value.trim();

    if (!input) {
        showError("Please enter JSON data to minify");
        return;
    }

    try {
        setButtonLoading(minifyBtn, true);
        const parsed = JSON.parse(input);
        const minified = JSON.stringify(parsed);
        outputTextarea.value = minified;
        showSuccess("JSON minified successfully!");
        enableCopyButton();
    } catch (error) {
        showError("Invalid JSON: " + error.message);
        outputTextarea.value = "";
    } finally {
        setButtonLoading(minifyBtn, false);
    }
};

const validateJSON = () => {
    const input = inputTextarea.value.trim();

    if (!input) {
        showError("Please enter JSON data to validate");
        return;
    }

    try {
        setButtonLoading(validateBtn, true);
        const parsed = JSON.parse(input);

        // Count properties for objects, elements for arrays
        let info = "";
        if (Array.isArray(parsed)) {
            info = ` (${parsed.length} items)`;
        } else if (typeof parsed === "object" && parsed !== null) {
            info = ` (${Object.keys(parsed).length} properties)`;
        }

        showSuccess(`✅ Valid JSON${info}`);
        outputTextarea.value = "JSON is valid!";
    } catch (error) {
        showError("❌ Invalid JSON: " + error.message);
        outputTextarea.value = "";
    } finally {
        setButtonLoading(validateBtn, false);
    }
};

const clearAll = () => {
    inputTextarea.value = "";
    outputTextarea.value = "";
    clearStatus();
    disableButtons();
};

const copyResult = async () => {
    const result = outputTextarea.value;

    if (!result) {
        showError("Nothing to copy");
        return;
    }

    try {
        setButtonLoading(copyBtn, true);
        await navigator.clipboard.writeText(result);
        showSuccess("Copied to clipboard!");
    } catch (error) {
        // Fallback for older browsers
        try {
            outputTextarea.select();
            document.execCommand("copy");
            showSuccess("Copied to clipboard!");
        } catch (fallbackError) {
            showError("Failed to copy to clipboard");
        }
    } finally {
        setButtonLoading(copyBtn, false);
    }
};

const enableButtons = () => {
    formatBtn.disabled = false;
    minifyBtn.disabled = false;
    validateBtn.disabled = false;
};

const disableButtons = () => {
    formatBtn.disabled = true;
    minifyBtn.disabled = true;
    validateBtn.disabled = true;
    copyBtn.disabled = true;
};

const enableCopyButton = () => {
    copyBtn.disabled = false;
};

const setButtonLoading = (button, isLoading) => {
    if (isLoading) {
        button.classList.add("popup-json__button--loading");
        button.disabled = true;
    } else {
        button.classList.remove("popup-json__button--loading");
        button.disabled = false;
    }
};

const showSuccess = message => {
    statusDiv.className = "popup-json__status popup-json__status--success show";
    statusDiv.textContent = message;
    setTimeout(clearStatus, 3000);
};

const showError = message => {
    statusDiv.className = "popup-json__status popup-json__status--error show";
    statusDiv.textContent = message;
    setTimeout(clearStatus, 5000);
};

const showInfo = message => {
    statusDiv.className = "popup-json__status popup-json__status--info show";
    statusDiv.textContent = message;
    setTimeout(clearStatus, 3000);
};

const clearStatus = () => {
    statusDiv.className = "popup-json__status";
    setTimeout(() => {
        statusDiv.textContent = "";
    }, 300);
};

// Add some sample JSON on load for demonstration
const loadSampleJSON = () => {
    const sampleJSON = {
        name: "John Doe",
        age: 30,
        email: "john.doe@example.com",
        address: {
            street: "123 Main St",
            city: "New York",
            zipCode: "10001",
        },
        hobbies: ["reading", "coding", "traveling"],
        isActive: true,
    };

    // Only load sample if input is empty
    if (!inputTextarea.value.trim()) {
        inputTextarea.value = JSON.stringify(sampleJSON);
        enableButtons();
    }
};

// Initialize the popup
document.addEventListener("DOMContentLoaded", () => {
    initializeElements();
    attachEventListeners();
    disableButtons();

    // Load sample JSON after a short delay
    setTimeout(loadSampleJSON, 500);
});

// Add keyboard shortcuts
document.addEventListener("keydown", event => {
    if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
            case "Enter":
                event.preventDefault();
                formatJSON();
                break;
            case "l":
                event.preventDefault();
                clearAll();
                break;
        }
    }
});
