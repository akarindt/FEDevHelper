(function () {
    "use strict";

    // Prevent multiple instances
    if (window.fedevhelperRuler) {
        window.fedevhelperRuler.destroy();
    }

    // Ruler tool object
    window.fedevhelperRuler = {
        isActive: false,
        overlay: null,
        tooltip: null,
        measureBox: null,
        isDragging: false,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,

        init() {
            this.createOverlay();
            this.createTooltip();
            this.createMeasureBox();
            this.attachEvents();
            this.isActive = true;
            console.log("FEDevHelper Ruler Tool activated! Click and drag to measure.");
        },

        createOverlay() {
            this.overlay = document.createElement("div");
            this.overlay.id = "fedevhelper-ruler-overlay";
            this.overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 150, 255, 0.1);
                z-index: 999999;
                cursor: crosshair;
                pointer-events: all;
            `;
            document.body.appendChild(this.overlay);
        },

        createTooltip() {
            this.tooltip = document.createElement("div");
            this.tooltip.id = "fedevhelper-ruler-tooltip";
            this.tooltip.style.cssText = `
                position: fixed;
                background: #333;
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-family: 'OpenSans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 12px;
                font-weight: bold;
                z-index: 1000000;
                pointer-events: none;
                white-space: nowrap;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                display: none;
            `;
            document.body.appendChild(this.tooltip);
        },

        createMeasureBox() {
            this.measureBox = document.createElement("div");
            this.measureBox.id = "fedevhelper-ruler-measure-box";
            this.measureBox.style.cssText = `
                position: fixed;
                border: 2px solid #0096ff;
                background: rgba(0, 150, 255, 0.2);
                z-index: 1000000;
                pointer-events: none;
                display: none;
            `;
            document.body.appendChild(this.measureBox);

            // Create width label
            this.widthLabel = document.createElement("div");
            this.widthLabel.id = "fedevhelper-ruler-width-label";
            this.widthLabel.style.cssText = `
                position: fixed;
                background: #333;
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-family: 'OpenSans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 13px;
                font-weight: bold;
                z-index: 1000001;
                pointer-events: none;
                white-space: nowrap;
                display: none;
            `;
            document.body.appendChild(this.widthLabel);

            // Create height label
            this.heightLabel = document.createElement("div");
            this.heightLabel.id = "fedevhelper-ruler-height-label";
            this.heightLabel.style.cssText = `
                position: fixed;
                background: #333;
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-family: 'OpenSans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 13px;
                font-weight: bold;
                z-index: 1000001;
                pointer-events: none;
                white-space: nowrap;
                display: none;
            `;
            document.body.appendChild(this.heightLabel);
        },

        attachEvents() {
            this.overlay.addEventListener("mousedown", this.handleMouseDown.bind(this));
            document.addEventListener("mousemove", this.handleMouseMove.bind(this));
            document.addEventListener("mouseup", this.handleMouseUp.bind(this));
            document.addEventListener("keydown", this.handleKeyDown.bind(this));

            // Element hover detection
            this.overlay.addEventListener("mouseover", this.handleElementHover.bind(this));
        },

        handleMouseDown(e) {
            if (e.target !== this.overlay) return;

            this.isDragging = true;
            this.startX = e.clientX;
            this.startY = e.clientY;
            this.currentX = e.clientX;
            this.currentY = e.clientY;

            this.measureBox.style.display = "block";
            this.widthLabel.style.display = "block";
            this.heightLabel.style.display = "block";
            this.updateMeasureBox();
            e.preventDefault();
        },

        handleMouseMove(e) {
            this.currentX = e.clientX;
            this.currentY = e.clientY;

            if (this.isDragging) {
                this.updateMeasureBox();
                this.updateDimensionLabels();
            } else {
                // Show element dimensions on hover
                this.showElementInfo(e);
            }
        },

        handleMouseUp(e) {
            if (this.isDragging) {
                this.isDragging = false;
                // Keep the measurement box visible for a moment
                setTimeout(() => {
                    if (this.measureBox) {
                        this.measureBox.style.display = "none";
                        this.widthLabel.style.display = "none";
                        this.heightLabel.style.display = "none";
                    }
                }, 3000);
            }
        },

        handleKeyDown(e) {
            if (e.key === "Escape") {
                this.destroy();
            }
        },

        handleElementHover(e) {
            if (this.isDragging) return;

            // Get the element under the cursor (excluding our overlay)
            this.overlay.style.pointerEvents = "none";
            const elementBelow = document.elementFromPoint(e.clientX, e.clientY);
            this.overlay.style.pointerEvents = "all";

            if (
                elementBelow &&
                elementBelow !== document.body &&
                elementBelow !== document.documentElement
            ) {
                this.highlightElement(elementBelow);
                this.showElementDimensions(elementBelow, e);
            }
        },

        highlightElement(element) {
            // Remove previous highlights
            const prevHighlight = document.getElementById("fedevhelper-element-highlight");
            if (prevHighlight) {
                prevHighlight.remove();
            }

            const rect = element.getBoundingClientRect();
            const highlight = document.createElement("div");
            highlight.id = "fedevhelper-element-highlight";
            highlight.style.cssText = `
                position: fixed;
                top: ${rect.top}px;
                left: ${rect.left}px;
                width: ${rect.width}px;
                height: ${rect.height}px;
                border: 2px solid #ff6b35;
                background: rgba(255, 107, 53, 0.1);
                z-index: 999998;
                pointer-events: none;
            `;
            document.body.appendChild(highlight);
        },

        showElementDimensions(element, e) {
            const rect = element.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(element);

            const width = Math.round(rect.width);
            const height = Math.round(rect.height);
            const tag = element.tagName.toLowerCase();
            const className = element.className ? `.${element.className.split(" ").join(".")}` : "";
            const id = element.id ? `#${element.id}` : "";

            this.tooltip.innerHTML = `
                <div>${tag}${id}${className}</div>
                <div>${width} × ${height} px</div>
                <div style="font-size: 10px; opacity: 0.8;">Margin: ${computedStyle.marginTop} ${computedStyle.marginRight} ${computedStyle.marginBottom} ${computedStyle.marginLeft}</div>
                <div style="font-size: 10px; opacity: 0.8;">Padding: ${computedStyle.paddingTop} ${computedStyle.paddingRight} ${computedStyle.paddingBottom} ${computedStyle.paddingLeft}</div>
            `;

            this.tooltip.style.display = "block";
            this.tooltip.style.left = e.clientX + 15 + "px";
            this.tooltip.style.top = e.clientY - 10 + "px";

            // Adjust position if tooltip goes off screen
            const tooltipRect = this.tooltip.getBoundingClientRect();
            if (tooltipRect.right > window.innerWidth) {
                this.tooltip.style.left = e.clientX - tooltipRect.width - 15 + "px";
            }
            if (tooltipRect.bottom > window.innerHeight) {
                this.tooltip.style.top = e.clientY - tooltipRect.height - 15 + "px";
            }
        },

        showElementInfo(e) {
            if (!this.isDragging) {
                this.tooltip.style.display = "none";
                const highlight = document.getElementById("fedevhelper-element-highlight");
                if (highlight) {
                    highlight.remove();
                }
            }
        },

        updateMeasureBox() {
            const left = Math.min(this.startX, this.currentX);
            const top = Math.min(this.startY, this.currentY);
            const width = Math.abs(this.currentX - this.startX);
            const height = Math.abs(this.currentY - this.startY);

            this.measureBox.style.left = left + "px";
            this.measureBox.style.top = top + "px";
            this.measureBox.style.width = width + "px";
            this.measureBox.style.height = height + "px";
        },

        updateTooltip() {
            const width = Math.abs(this.currentX - this.startX);
            const height = Math.abs(this.currentY - this.startY);

            this.tooltip.innerHTML = `
                <div>📏 ${Math.round(width)} × ${Math.round(height)} px</div>
                <div style="font-size: 10px; opacity: 0.8;">Area: ${Math.round(width * height)} px²</div>
            `;

            this.tooltip.style.display = "block";

            // Position tooltip at the bottom-right corner of the measurement box
            const left = Math.min(this.startX, this.currentX);
            const top = Math.min(this.startY, this.currentY);
            const boxWidth = Math.abs(this.currentX - this.startX);
            const boxHeight = Math.abs(this.currentY - this.startY);

            // Position at bottom-right corner of the box
            let tooltipX = left + boxWidth + 5;
            let tooltipY = top + boxHeight + 5;

            // Adjust position if tooltip goes off screen
            const tooltipRect = this.tooltip.getBoundingClientRect();
            if (tooltipX + tooltipRect.width > window.innerWidth) {
                tooltipX = left - tooltipRect.width - 5; // Move to left side
            }
            if (tooltipY + tooltipRect.height > window.innerHeight) {
                tooltipY = top - tooltipRect.height - 5; // Move above the box
            }

            // Ensure tooltip doesn't go off the left or top edges
            if (tooltipX < 0) {
                tooltipX = 5;
            }
            if (tooltipY < 0) {
                tooltipY = 5;
            }

            this.tooltip.style.left = tooltipX + "px";
            this.tooltip.style.top = tooltipY + "px";
        },

        updateDimensionLabels() {
            const width = Math.abs(this.currentX - this.startX);
            const height = Math.abs(this.currentY - this.startY);
            const left = Math.min(this.startX, this.currentX);
            const top = Math.min(this.startY, this.currentY);

            // Update width label (positioned above the top edge, centered)
            this.widthLabel.textContent = `W = ${Math.round(width)}px`;
            this.widthLabel.style.left = left + width / 2 - 35 + "px"; // Approximate center
            this.widthLabel.style.top = top - 25 + "px";

            // Update height label (positioned to the right edge, centered vertically)
            this.heightLabel.textContent = `H = ${Math.round(height)}px`;
            this.heightLabel.style.left = left + width + 15 + "px";
            this.heightLabel.style.top = top + height / 2 + "px"; // Center vertically

            // Adjust positions if they go off screen
            if (parseInt(this.widthLabel.style.left) < 0) {
                this.widthLabel.style.left = "5px";
            }
            if (parseInt(this.widthLabel.style.top) < 0) {
                this.widthLabel.style.top = top + 5 + "px"; // Move below if no space above
            }

            if (parseInt(this.heightLabel.style.left) + 70 > window.innerWidth) {
                this.heightLabel.style.left = left - 40 + "px"; // Move to left side
            }
            if (parseInt(this.heightLabel.style.top) < 0) {
                this.heightLabel.style.top = "10px";
            }
        },

        destroy() {
            if (this.overlay) {
                this.overlay.remove();
            }
            if (this.tooltip) {
                this.tooltip.remove();
            }
            if (this.measureBox) {
                this.measureBox.remove();
            }
            if (this.widthLabel) {
                this.widthLabel.remove();
            }
            if (this.heightLabel) {
                this.heightLabel.remove();
            }
            if (this.instructionTooltip) {
                this.instructionTooltip.remove();
            }

            // Remove element highlights
            const highlight = document.getElementById("fedevhelper-element-highlight");
            if (highlight) {
                highlight.remove();
            }

            // Remove event listeners
            document.removeEventListener("mousemove", this.handleMouseMove);
            document.removeEventListener("mouseup", this.handleMouseUp);
            document.removeEventListener("keydown", this.handleKeyDown);

            this.isActive = false;
            console.log("FEDevHelper Ruler Tool deactivated.");
        },
    };

    // Initialize the ruler tool
    window.fedevhelperRuler.init();

    // Show instruction
    const instructionTooltip = document.createElement("div");
    instructionTooltip.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #333;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        z-index: 1000001;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    instructionTooltip.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 8px;">📏 Ruler Tool Active</div>
        <div style="font-size: 12px;">
            • Hover over elements to see dimensions<br>
            • Click and drag to measure areas<br>
            • Press ESC to exit
        </div>
    `;
    document.body.appendChild(instructionTooltip);

    // Store reference to instruction tooltip for cleanup
    window.fedevhelperRuler.instructionTooltip = instructionTooltip;
})();
