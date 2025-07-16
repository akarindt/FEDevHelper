// DOM elements
let urlInput;
let useCurrentBtn;
let runTestBtn;
let clearBtn;
let statusDiv;
let resultsDiv;

const initializeElements = () => {
    urlInput = document.getElementById("popup-lighthouse__url");
    useCurrentBtn = document.getElementById("popup-lighthouse__use-current");
    runTestBtn = document.getElementById("popup-lighthouse__run-test");
    clearBtn = document.getElementById("popup-lighthouse__clear-btn");
    statusDiv = document.getElementById("popup-lighthouse__status");
    resultsDiv = document.getElementById("popup-lighthouse__results");
};

const attachEventListeners = () => {
    useCurrentBtn.addEventListener("click", setCurrentTabUrl);
    runTestBtn.addEventListener("click", runLighthouseTest);
    clearBtn.addEventListener("click", clearResults);
};

const setCurrentTabUrl = async () => {
    try {
        // Get tab info from localStorage (passed from main popup)
        const storedTabInfo = localStorage.getItem("lighthouseTabInfo");
        if (storedTabInfo) {
            const tabInfo = JSON.parse(storedTabInfo);
            if (tabInfo && tabInfo.url) {
                urlInput.value = tabInfo.url;
                showInfo(`Loaded tab: ${new URL(tabInfo.url).hostname}`);
                return;
            }
        }

        // Fallback: try to get current tab (might not work in popup window)
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url) {
            urlInput.value = tab.url;
            showInfo(`Current tab URL loaded: ${new URL(tab.url).hostname}`);
        } else {
            showError("Could not get current tab URL");
        }
    } catch (error) {
        showError("Error getting current tab: " + error.message);
    }
};

const runLighthouseTest = async () => {
    const url = urlInput.value.trim();

    if (!url) {
        showError("Please enter a URL or use current tab");
        return;
    }

    if (!isValidUrl(url)) {
        showError("Please enter a valid URL");
        return;
    }

    try {
        setButtonLoading(runTestBtn, true);
        showInfo("Running Lighthouse analysis...");

        // Get tab info from localStorage (passed from main popup)
        const storedTabInfo = localStorage.getItem("lighthouseTabInfo");
        let tabId = null;

        if (storedTabInfo) {
            const tabInfo = JSON.parse(storedTabInfo);
            tabId = tabInfo.id;
        }

        // If we don't have stored tab info, try to find the tab by URL
        if (!tabId) {
            const tabs = await chrome.tabs.query({});
            const matchingTab = tabs.find(tab => tab.url === url);
            if (matchingTab) {
                tabId = matchingTab.id;
            } else {
                showError(
                    "Could not find the tab to analyze. Please make sure the tab is still open."
                );
                return;
            }
        }

        // Run performance analysis on the target tab
        const results = await runPerformanceAnalysis(tabId, url);

        displayResults(results);
        showSuccess("Lighthouse analysis completed!");
    } catch (error) {
        showError("Error running Lighthouse test: " + error.message);
    } finally {
        setButtonLoading(runTestBtn, false);
    }
};

const runPerformanceAnalysis = async (tabId, url) => {
    return new Promise((resolve, reject) => {
        // Inject performance measurement script
        chrome.scripting.executeScript(
            {
                target: { tabId: tabId },
                func: measurePerformance,
            },
            results => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                    return;
                }

                if (results && results[0] && results[0].result) {
                    const performanceData = results[0].result;
                    const analysis = analyzePerformanceMetrics(performanceData, url);
                    resolve(analysis);
                } else {
                    reject(new Error("Could not gather performance data"));
                }
            }
        );
    });
};

// This function runs in the context of the webpage
function measurePerformance() {
    try {
        const navigation = performance.getEntriesByType("navigation")[0];
        const paint = performance.getEntriesByType("paint");

        const metrics = {
            // Core Web Vitals and other metrics
            domContentLoaded: navigation
                ? Math.round(
                      navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
                  )
                : 0,
            loadComplete: navigation
                ? Math.round(navigation.loadEventEnd - navigation.loadEventStart)
                : 0,
            firstPaint: paint.find(p => p.name === "first-paint")?.startTime || 0,
            firstContentfulPaint:
                paint.find(p => p.name === "first-contentful-paint")?.startTime || 0,

            // Page info
            url: window.location.href,
            title: document.title,

            // Basic accessibility checks
            hasAltText: Array.from(document.querySelectorAll("img")).every(img => img.alt !== ""),
            hasHeadings: document.querySelectorAll("h1, h2, h3, h4, h5, h6").length > 0,
            hasMetaDescription: !!document.querySelector('meta[name="description"]'),
            hasMetaViewport: !!document.querySelector('meta[name="viewport"]'),

            // Performance info
            resourceCount: performance.getEntriesByType("resource").length,

            // Basic SEO checks
            hasTitle: !!document.title && document.title.length > 0,
            titleLength: document.title.length,

            // HTTPS check
            isHTTPS: window.location.protocol === "https:",

            // Basic best practices
            hasServiceWorker: "serviceWorker" in navigator,

            // Page size estimation (rough)
            estimatedPageSize: Math.round(
                performance.getEntriesByType("resource").reduce((total, resource) => {
                    return total + (resource.transferSize || 0);
                }, 0) / 1024
            ), // in KB
        };

        return metrics;
    } catch (error) {
        return { error: error.message };
    }
}

const analyzePerformanceMetrics = (metrics, url) => {
    if (metrics.error) {
        throw new Error(metrics.error);
    }

    // Calculate scores based on common Lighthouse thresholds
    const scores = {
        performance: calculatePerformanceScore(metrics),
        accessibility: calculateAccessibilityScore(metrics),
        bestPractices: calculateBestPracticesScore(metrics),
        seo: calculateSEOScore(metrics),
    };

    return {
        url: metrics.url || url,
        title: metrics.title || "Unknown",
        scores: scores,
        metrics: {
            "First Contentful Paint": formatTime(metrics.firstContentfulPaint),
            "DOM Content Loaded": formatTime(metrics.domContentLoaded),
            "Load Complete": formatTime(metrics.loadComplete),
            "Resource Count": metrics.resourceCount.toString(),
            "Estimated Page Size": `${metrics.estimatedPageSize} KB`,
            HTTPS: metrics.isHTTPS ? "Yes" : "No",
        },
        recommendations: generateRecommendations(metrics, scores),
    };
};

const calculatePerformanceScore = metrics => {
    let score = 100;

    // FCP scoring (0-1.8s = good, 1.8-3s = needs improvement, >3s = poor)
    if (metrics.firstContentfulPaint > 3000) score -= 30;
    else if (metrics.firstContentfulPaint > 1800) score -= 15;

    // Load time scoring
    if (metrics.loadComplete > 5000) score -= 25;
    else if (metrics.loadComplete > 3000) score -= 10;

    // Page size scoring
    if (metrics.estimatedPageSize > 3000)
        score -= 20; // >3MB
    else if (metrics.estimatedPageSize > 1500) score -= 10; // >1.5MB

    // Resource count
    if (metrics.resourceCount > 100) score -= 15;
    else if (metrics.resourceCount > 50) score -= 5;

    return Math.max(0, Math.round(score));
};

const calculateAccessibilityScore = metrics => {
    let score = 100;

    if (!metrics.hasAltText) score -= 25;
    if (!metrics.hasHeadings) score -= 25;
    if (!metrics.hasMetaViewport) score -= 25;

    return Math.max(0, Math.round(score));
};

const calculateBestPracticesScore = metrics => {
    let score = 100;

    if (!metrics.isHTTPS) score -= 40;
    if (!metrics.hasServiceWorker) score -= 10;

    return Math.max(0, Math.round(score));
};

const calculateSEOScore = metrics => {
    let score = 100;

    if (!metrics.hasTitle) score -= 30;
    else if (metrics.titleLength < 10 || metrics.titleLength > 60) score -= 15;

    if (!metrics.hasMetaDescription) score -= 25;
    if (!metrics.hasMetaViewport) score -= 20;
    if (!metrics.hasHeadings) score -= 15;

    return Math.max(0, Math.round(score));
};

const generateRecommendations = (metrics, scores) => {
    const recommendations = [];

    if (scores.performance < 70) {
        if (metrics.firstContentfulPaint > 3000) {
            recommendations.push("Optimize First Contentful Paint (currently > 3s)");
        }
        if (metrics.estimatedPageSize > 1500) {
            recommendations.push("Reduce page size by optimizing images and assets");
        }
        if (metrics.resourceCount > 50) {
            recommendations.push("Reduce number of HTTP requests");
        }
    }

    if (scores.accessibility < 80) {
        if (!metrics.hasAltText) recommendations.push("Add alt text to all images");
        if (!metrics.hasHeadings) recommendations.push("Use proper heading structure (h1-h6)");
        if (!metrics.hasMetaViewport) recommendations.push("Add viewport meta tag");
    }

    if (scores.bestPractices < 80) {
        if (!metrics.isHTTPS) recommendations.push("Use HTTPS for security");
        if (!metrics.hasServiceWorker)
            recommendations.push("Consider implementing a service worker");
    }

    if (scores.seo < 80) {
        if (!metrics.hasTitle || metrics.titleLength < 10)
            recommendations.push("Add descriptive page title");
        if (!metrics.hasMetaDescription) recommendations.push("Add meta description");
        if (!metrics.hasHeadings) recommendations.push("Use proper heading structure for SEO");
    }

    return recommendations;
};

const displayResults = results => {
    const scoresHtml = `
        <div class="popup-lighthouse__score">
            <div class="popup-lighthouse__score-item">
                <span class="popup-lighthouse__score-value" style="color: ${getScoreColor(results.scores.performance)}">${results.scores.performance}</span>
                <span class="popup-lighthouse__score-label">Performance</span>
            </div>
            <div class="popup-lighthouse__score-item">
                <span class="popup-lighthouse__score-value" style="color: ${getScoreColor(results.scores.accessibility)}">${results.scores.accessibility}</span>
                <span class="popup-lighthouse__score-label">Accessibility</span>
            </div>
            <div class="popup-lighthouse__score-item">
                <span class="popup-lighthouse__score-value" style="color: ${getScoreColor(results.scores.bestPractices)}">${results.scores.bestPractices}</span>
                <span class="popup-lighthouse__score-label">Best Practices</span>
            </div>
            <div class="popup-lighthouse__score-item">
                <span class="popup-lighthouse__score-value" style="color: ${getScoreColor(results.scores.seo)}">${results.scores.seo}</span>
                <span class="popup-lighthouse__score-label">SEO</span>
            </div>
        </div>
    `;

    const metricsHtml = Object.entries(results.metrics)
        .map(
            ([name, value]) => `
        <div class="popup-lighthouse__metric">
            <span class="popup-lighthouse__metric-name">${name}</span>
            <span class="popup-lighthouse__metric-value ${getMetricClass(name, value)}">${value}</span>
        </div>
    `
        )
        .join("");

    const recommendationsHtml =
        results.recommendations.length > 0
            ? `
        <div style="margin-top: 16px;">
            <h4 style="margin-bottom: 8px; color: #374151;">Recommendations:</h4>
            <ul style="list-style-type: disc; padding-left: 20px;">
                ${results.recommendations.map(rec => `<li style="margin-bottom: 4px; font-size: 13px;">${rec}</li>`).join("")}
            </ul>
        </div>
    `
            : "";

    resultsDiv.innerHTML = `
        <h3 style="margin-bottom: 12px; color: #374151;">Results for: ${results.title}</h3>
        ${scoresHtml}
        <h4 style="margin-bottom: 8px; color: #374151;">Metrics:</h4>
        ${metricsHtml}
        ${recommendationsHtml}
    `;

    resultsDiv.classList.add("show");
};

const getScoreColor = score => {
    if (score >= 90) return "#10b981"; // green
    if (score >= 50) return "#f59e0b"; // orange
    return "#ef4444"; // red
};

const getMetricClass = (name, value) => {
    // Simple classification based on metric name and value
    if (name.includes("Paint") || name.includes("Load")) {
        const numValue = parseFloat(value);
        if (numValue < 1500) return "popup-lighthouse__metric-value--good";
        if (numValue < 3000) return "popup-lighthouse__metric-value--needs-improvement";
        return "popup-lighthouse__metric-value--poor";
    }

    if (name === "HTTPS" && value === "Yes") return "popup-lighthouse__metric-value--good";
    if (name === "HTTPS" && value === "No") return "popup-lighthouse__metric-value--poor";

    return "";
};

const clearResults = () => {
    resultsDiv.classList.remove("show");
    resultsDiv.innerHTML = "";
    clearStatus();
};

const formatTime = ms => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
};

const isValidUrl = string => {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
};

const setButtonLoading = (button, isLoading) => {
    if (isLoading) {
        button.classList.add("popup-lighthouse__button--loading");
        button.disabled = true;
    } else {
        button.classList.remove("popup-lighthouse__button--loading");
        button.disabled = false;
    }
};

const showSuccess = message => {
    statusDiv.className = "popup-lighthouse__status popup-lighthouse__status--success show";
    statusDiv.textContent = message;
    setTimeout(clearStatus, 3000);
};

const showError = message => {
    statusDiv.className = "popup-lighthouse__status popup-lighthouse__status--error show";
    statusDiv.textContent = message;
    setTimeout(clearStatus, 5000);
};

const showInfo = message => {
    statusDiv.className = "popup-lighthouse__status popup-lighthouse__status--info show";
    statusDiv.textContent = message;
    setTimeout(clearStatus, 3000);
};

const clearStatus = () => {
    statusDiv.className = "popup-lighthouse__status";
    setTimeout(() => {
        statusDiv.textContent = "";
    }, 300);
};

// Clean up localStorage
const cleanupStorage = () => {
    localStorage.removeItem("lighthouseTabInfo");
};

// Initialize the popup
document.addEventListener("DOMContentLoaded", () => {
    initializeElements();
    attachEventListeners();

    // Auto-load current tab URL
    setCurrentTabUrl();
});

// Clean up when the window is closed
window.addEventListener("beforeunload", cleanupStorage);
