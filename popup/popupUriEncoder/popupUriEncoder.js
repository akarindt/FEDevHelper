// DOM elements
let inputTextarea;
let outputTextarea;
let encodeBtn;
let decodeBtn;
let clearBtn;
let copyBtn;

const initializeElements = () => {
    inputTextarea = document.getElementById("popup-uri__input");
    outputTextarea = document.getElementById("popup-uri__output");
    encodeBtn = document.getElementById("popup-uri__encode-btn");
    decodeBtn = document.getElementById("popup-uri__decode-btn");
    clearBtn = document.getElementById("popup-uri__clear-btn");
    copyBtn = document.getElementById("popup-uri__copy-btn");
};

const attachEventListeners = () => {
    encodeBtn.addEventListener("click", encodeURIText);
    decodeBtn.addEventListener("click", decodeURIText);
    clearBtn.addEventListener("click", clearAll);
    copyBtn.addEventListener("click", copyResult);

    inputTextarea.addEventListener("input", () => {
        if (inputTextarea.value.trim()) {
            enableButtons();
        } else {
            disableButtons();
        }
    });
};

const encodeURIText = () => {
    const input = inputTextarea.value.trim();

    if (!input) {
        showError("Please enter a URI to encode");
        return;
    }

    try {
        setButtonLoading(encodeBtn, true);
        const encoded = encodeURIComponent(input);
        outputTextarea.value = encoded;
        showSuccess();
        enableCopyButton();
    } catch (error) {
        showError("Error encoding URI: " + error.message);
    } finally {
        setButtonLoading(encodeBtn, false);
    }
};

const decodeURIText = () => {
    const input = inputTextarea.value.trim();

    if (!input) {
        showError("Please enter a URI to decode");
        return;
    }

    try {
        setButtonLoading(decodeBtn, true);

        let decoded;
        try {
            decoded = decodeURIComponent(input);
        } catch {
            decoded = decodeURI(input);
        }

        outputTextarea.value = decoded;
        showSuccess();
        enableCopyButton();
    } catch (error) {
        showError("Error decoding URI: Invalid URI format");
    } finally {
        setButtonLoading(decodeBtn, false);
    }
};

const clearAll = () => {
    inputTextarea.value = "";
    outputTextarea.value = "";
    resetStyles();
    disableButtons();
    disableCopyButton();
};

const copyResult = async () => {
    const result = outputTextarea.value;

    if (!result) {
        showError("No result to copy");
        return;
    }

    try {
        await navigator.clipboard.writeText(result);
        showCopySuccess();
    } catch (error) {
        fallbackCopy(result);
    }
};

const fallbackCopy = text => {
    outputTextarea.select();
    outputTextarea.setSelectionRange(0, 99999);

    try {
        document.execCommand("copy");
        showCopySuccess();
    } catch (error) {
        showError("Failed to copy to clipboard");
    }
};

const showSuccess = () => {
    resetStyles();
    outputTextarea.classList.add("popup-uri__textarea--success");
};

const showError = message => {
    resetStyles();
    inputTextarea.classList.add("popup-uri__textarea--error");
    outputTextarea.value = `Error: ${message}`;
};

const showCopySuccess = () => {
    const originalText = copyBtn.textContent;
    copyBtn.textContent = "Copied!";
    copyBtn.style.backgroundColor = "#10b981";

    setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.style.backgroundColor = "";
    }, 1500);
};

const resetStyles = () => {
    inputTextarea.classList.remove("popup-uri__textarea--error", "popup-uri__textarea--success");
    outputTextarea.classList.remove("popup-uri__textarea--error", "popup-uri__textarea--success");
};

const enableButtons = () => {
    encodeBtn.disabled = false;
    decodeBtn.disabled = false;
    clearBtn.disabled = false;
};

const disableButtons = () => {
    encodeBtn.disabled = true;
    decodeBtn.disabled = true;
    clearBtn.disabled = true;
};

const enableCopyButton = () => {
    copyBtn.disabled = false;
};

const disableCopyButton = () => {
    copyBtn.disabled = true;
};

const setButtonLoading = (button, isLoading) => {
    if (isLoading) {
        button.classList.add("popup-uri__button--loading");
        button.disabled = true;
    } else {
        button.classList.remove("popup-uri__button--loading");
        button.disabled = false;
    }
};

const isValidURI = str => {
    try {
        new URL(str);
        return true;
    } catch {
        return false;
    }
};

const parseURIComponents = uri => {
    try {
        const url = new URL(uri);
        return {
            protocol: url.protocol,
            hostname: url.hostname,
            port: url.port,
            pathname: url.pathname,
            search: url.search,
            hash: url.hash,
        };
    } catch {
        return null;
    }
};

const encodeQueryParams = params => {
    return Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join("&");
};

const decodeQueryParams = queryString => {
    const params = {};
    const searchParams = new URLSearchParams(queryString);

    for (const [key, value] of searchParams) {
        params[key] = value;
    }

    return params;
};

document.addEventListener("DOMContentLoaded", () => {
    initializeElements();
    attachEventListeners();
});
