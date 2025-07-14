(() => {
    const getLoadTimes = () => {
        const navigation = performance.getEntriesByType("navigation")[0];

        if (!navigation) {
            return {};
        }

        const metrics = {};
        metrics.loadComplete = navigation.loadEventEnd - navigation.navigationStart;
        metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.navigationStart;

        metrics.redirectTime = navigation.redirectEnd - navigation.redirectStart;
        metrics.domainLookup = navigation.domainLookupEnd - navigation.domainLookupStart;
        metrics.connect = navigation.connectEnd - navigation.connectStart;
        metrics.waitForResponse = navigation.responseStart - navigation.requestStart;
        metrics.response = navigation.responseEnd - navigation.responseStart;
        metrics.domProcessing = navigation.domInteractive - navigation.responseEnd;
        metrics.parseTime = navigation.domInteractive - navigation.domLoading;
        metrics.executeScripts = navigation.domContentLoadedEventStart - navigation.domInteractive;
        metrics.domContentLoadedEvent =
            navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
        metrics.waitForResources = navigation.loadEventStart - navigation.domContentLoadedEventEnd;
        metrics.loadEvent = navigation.loadEventEnd - navigation.loadEventStart;

        return metrics;
    };

    chrome.runtime.sendMessage({ performance: getLoadTimes() });
})();
