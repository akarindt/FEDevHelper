// DOM Elements
const currentUrlElement = document.getElementById("popup-rule__current-url");
const urlPatternInput = document.getElementById("popup-rule__url-pattern");
const actionSelect = document.getElementById("popup-rule__action");
const customContentDiv = document.getElementById("popup-rule__custom-content");
const customInput = document.getElementById("popup-rule__custom-input");
const priorityInput = document.getElementById("popup-rule__priority");
const addBtn = document.getElementById("popup-rule__add-btn");
const useCurrentBtn = document.getElementById("popup-rule__use-current-btn");
const rulesListDiv = document.getElementById("popup-rule__rules-list");
const exportBtn = document.getElementById("popup-rule__export-btn");
const importBtn = document.getElementById("popup-rule__import-btn");
const fileInput = document.getElementById("popup-rule__file-input");

// Storage key for page rules
const STORAGE_KEY = "fedevhelper_page_rules";

// Initialize the popup
document.addEventListener("DOMContentLoaded", () => {
    loadCurrentPageInfo();
    loadExistingRules();
    setupEventListeners();
});

// Load current page information
function loadCurrentPageInfo() {
    const tabInfo = localStorage.getItem("pageRuleTabInfo");
    if (tabInfo) {
        const { url, title } = JSON.parse(tabInfo);
        currentUrlElement.textContent = url;
        currentUrlElement.title = `${title}\n${url}`;
    }
}

// Setup event listeners
function setupEventListeners() {
    actionSelect.addEventListener("change", handleActionChange);
    addBtn.addEventListener("click", addNewRule);
    useCurrentBtn.addEventListener("click", useCurrentUrl);
    exportBtn.addEventListener("click", exportRules);
    importBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", importRules);
}

// Handle action selection change
function handleActionChange() {
    const selectedAction = actionSelect.value;
    if (selectedAction === "custom-css") {
        customContentDiv.style.display = "block";
        document.querySelector('[for="popup-rule__custom-input"]').textContent = "Custom CSS:";
        customInput.placeholder = "Enter your custom CSS here...";
    } else {
        customContentDiv.style.display = "none";
    }
}

// Use current URL as pattern
function useCurrentUrl() {
    const tabInfo = localStorage.getItem("pageRuleTabInfo");
    if (tabInfo) {
        const { url } = JSON.parse(tabInfo);
        try {
            const urlObj = new URL(url);
            urlPatternInput.value = `${urlObj.protocol}//${urlObj.hostname}/*`;
        } catch (e) {
            urlPatternInput.value = url;
        }
    }
}

// Add new rule
function addNewRule() {
    const urlPattern = urlPatternInput.value.trim();
    const action = actionSelect.value;
    const customContent = customInput.value.trim();
    const priority = parseInt(priorityInput.value) || 1;

    if (!urlPattern) {
        alert("Please enter a URL pattern");
        return;
    }

    const rule = {
        id: Date.now().toString(),
        urlPattern,
        action,
        customContent: action === "custom-css" ? customContent : "",
        priority,
        enabled: true,
        createdAt: new Date().toISOString(),
    };

    const rules = getStoredRules();
    rules.push(rule);
    saveRules(rules);

    // Clear form
    urlPatternInput.value = "";
    customInput.value = "";
    priorityInput.value = "1";
    actionSelect.value = "block-ads";
    handleActionChange();

    loadExistingRules();
}

// Load and display existing rules
function loadExistingRules() {
    const rules = getStoredRules();

    if (rules.length === 0) {
        rulesListDiv.innerHTML = '<div class="popup-rule__no-rules">No rules created yet</div>';
        return;
    }

    // Sort rules by priority (descending) and creation date
    rules.sort((a, b) => {
        if (a.priority !== b.priority) {
            return b.priority - a.priority;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const rulesHtml = rules.map(rule => createRuleHtml(rule)).join("");
    rulesListDiv.innerHTML = rulesHtml;

    // Add event listeners to rule buttons
    rules.forEach(rule => {
        const toggleBtn = document.getElementById(`toggle-${rule.id}`);
        const deleteBtn = document.getElementById(`delete-${rule.id}`);

        if (toggleBtn) {
            toggleBtn.addEventListener("click", () => toggleRule(rule.id));
        }
        if (deleteBtn) {
            deleteBtn.addEventListener("click", () => deleteRule(rule.id));
        }
    });
}

// Create HTML for a single rule
function createRuleHtml(rule) {
    const actionLabels = {
        "block-ads": "Block Advertisements",
        "block-trackers": "Block Trackers",
        "force-https": "Force HTTPS",
        "custom-css": "Inject Custom CSS",
        "disable-js": "Disable JavaScript",
    };

    const actionLabel = actionLabels[rule.action] || rule.action;
    const disabledClass = rule.enabled ? "" : "disabled";
    const toggleText = rule.enabled ? "Disable" : "Enable";
    const toggleClass = rule.enabled ? "active" : "";

    return `
        <div class="popup-rule__rule-item ${disabledClass}">
            <div class="popup-rule__rule-header">
                <div class="popup-rule__rule-url">${escapeHtml(rule.urlPattern)}</div>
                <div class="popup-rule__rule-priority">P${rule.priority}</div>
            </div>
            <div class="popup-rule__rule-details">
                <div class="popup-rule__rule-action"><strong>Action:</strong> ${actionLabel}</div>
                ${rule.customContent ? `<div class="popup-rule__rule-custom">${escapeHtml(rule.customContent)}</div>` : ""}
            </div>
            <div class="popup-rule__rule-actions">
                <button 
                    id="toggle-${rule.id}" 
                    class="popup-rule__rule-button popup-rule__toggle-button ${toggleClass}"
                >
                    ${toggleText}
                </button>
                <button 
                    id="delete-${rule.id}" 
                    class="popup-rule__rule-button popup-rule__delete-button"
                >
                    Delete
                </button>
            </div>
        </div>
    `;
}

// Toggle rule enabled/disabled
function toggleRule(ruleId) {
    const rules = getStoredRules();
    const rule = rules.find(r => r.id === ruleId);
    if (rule) {
        rule.enabled = !rule.enabled;
        saveRules(rules);
        loadExistingRules();
    }
}

// Delete a rule
function deleteRule(ruleId) {
    if (confirm("Are you sure you want to delete this rule?")) {
        const rules = getStoredRules();
        const filteredRules = rules.filter(r => r.id !== ruleId);
        saveRules(filteredRules);
        loadExistingRules();
    }
}

// Export rules to JSON file
function exportRules() {
    const rules = getStoredRules();
    const dataStr = JSON.stringify(rules, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(dataBlob);
    link.download = `fedevhelper-page-rules-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
}

// Import rules from JSON file
function importRules(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const importedRules = JSON.parse(e.target.result);

            if (!Array.isArray(importedRules)) {
                alert("Invalid file format. Expected an array of rules.");
                return;
            }

            // Validate rule structure
            const validRules = importedRules.filter(rule => {
                return rule.urlPattern && rule.action && rule.id;
            });

            if (validRules.length === 0) {
                alert("No valid rules found in the file.");
                return;
            }

            // Merge with existing rules (avoid duplicates by ID)
            const existingRules = getStoredRules();
            const existingIds = new Set(existingRules.map(r => r.id));

            const newRules = validRules.filter(rule => !existingIds.has(rule.id));
            const mergedRules = [...existingRules, ...newRules];

            saveRules(mergedRules);
            loadExistingRules();

            alert(`Successfully imported ${newRules.length} new rules.`);
        } catch (error) {
            alert("Error reading file. Please ensure it's a valid JSON file.");
        }
    };

    reader.readAsText(file);
    event.target.value = ""; // Reset file input
}

// Storage helper functions
function getStoredRules() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Error loading rules:", error);
        return [];
    }
}

function saveRules(rules) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
    } catch (error) {
        console.error("Error saving rules:", error);
        alert("Error saving rules. Storage might be full.");
    }
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
