const loadPerformanceData = () => {
    const currentURLAnchor = document.getElementById("popup-loadtime__url");
    const loadingDiv = document.getElementById("popup-loadtime__loading");
    const metricsContainer = document.getElementById("popup-loadtime__metrics-container");
    const noDataDiv = document.getElementById("popup-loadtime__no-data");
    const storedData = localStorage.getItem("performanceData");

    if (storedData) {
        try {
            const data = JSON.parse(storedData);
            const metrics = data.metrics;
            currentURLAnchor.textContent = data.url;
            currentURLAnchor.setAttribute("href", data.url);
            currentURLAnchor.setAttribute("target", "_blank");

            if (metrics && Object.keys(metrics).length > 0) {
                displayMetrics(metrics);
                metricsContainer.style.display = "flex";
                loadingDiv.style.display = "none";
                return;
            }
            noDataDiv.style.display = "block";
        } catch (error) {
            noDataDiv.style.display = "block";
        }

        loadingDiv.style.display = "none";
        return;
    }
};

const displayMetrics = metrics => {
    const metricsEl = document.getElementById("popup-loadtime__metrics");

    const metricsConfig = [
        { key: "loadComplete", label: "Loaded", showIfZero: true },
        { key: "domContentLoaded", label: "Load Time" },
        { key: "redirectTime", label: "Redirect" },
        { key: "domainLookup", label: "Domain Lookup" },
        { key: "connect", label: "Connect" },
        { key: "waitForResponse", label: "Wait for Response" },
        { key: "response", label: "Response" },
        { key: "domProcessing", label: "DOM Processing" },
        { key: "parseTime", label: "Parse" },
        { key: "executeScripts", label: "Execute Scripts after Parsing" },
        { key: "domContentLoadedEvent", label: "DOMContentLoaded Event" },
        { key: "waitForResources", label: "Wait for Resources" },
        { key: "loadEvent", label: "Load Event" },
    ];

    metricsConfig.forEach(config => {
        if (metrics[config.key] !== undefined && (metrics[config.key] > 0 || config.showIfZero)) {
            const metricItem = document.createElement("div");
            metricItem.className = "popup-loadtime__metric";

            const value = metrics[config.key];
            const formattedValue = formatTime(value);

            metricItem.innerHTML = `
                <div class="popup-loadtime__metric-label">${config.label}</div>
                <div class="popup-loadtime__metric-value">
                    <span class="popup-loadtime__metric-time">${formattedValue.value}</span>
                    <span class="popup-loadtime__metric-unit">${formattedValue.unit}</span>
                </div>
            `;

            metricsEl.appendChild(metricItem);
        }
    });

    const refreshButton = document.getElementById("popup-loadtime__button--refresh");
    refreshButton.addEventListener("click", () => {
        localStorage.removeItem("performanceData");
        alert("Please click the 'Check load time' button again to refresh the analysis.");
        window.close();
    });
};

const formatTime = milliseconds => {
    if (milliseconds === 0) {
        return { value: "n/a", unit: "" };
    }

    if (milliseconds >= 1000) {
        const seconds = (milliseconds / 1000).toFixed(2);
        return { value: seconds, unit: "s" };
    } else {
        const ms = Math.round(milliseconds);
        return { value: ms, unit: "ms" };
    }
};

document.addEventListener("DOMContentLoaded", loadPerformanceData);
