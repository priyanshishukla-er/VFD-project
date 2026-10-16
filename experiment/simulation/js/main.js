document.addEventListener("DOMContentLoaded", function () {
    const frequencySlider = document.getElementById("speed");
    const setFrequency = document.getElementById("setFrequency");
    const frequencyDisplay = document.getElementById("frequency");

    const startBtn = document.getElementById("startBtn");
    const stopBtn = document.getElementById("stopBtn");
    const resetBtn = document.getElementById("resetBtn");

    const statusBadge = document.getElementById("statusBadge");
    const driveStatus = document.getElementById("driveStatus");
    const voltageDisplay = document.getElementById("voltage");
    const rpmDisplay = document.getElementById("rpm");
    const dcBusDisplay = document.getElementById("dcBus");

    const motor = document.getElementById("motor");
    const motorStatus = document.getElementById("motorStatus");
    const speedPercent = document.getElementById("speedPercent");
    const speedBar = document.getElementById("speedBar");

    const faultSelect = document.getElementById("faultSelect");
    const faultMessage = document.getElementById("faultMessage");
    const activityLog = document.getElementById("activityLog");

    // Check important HTML elements
    if (
        !frequencySlider || !setFrequency || !frequencyDisplay ||
        !startBtn || !stopBtn || !resetBtn
    ) {
        console.error(
            "Required elements missing. Check HTML IDs and script path."
        );
        return;
    }

    let isRunning = false;
    let hasFault = false;

    function getFrequency() {
        const value = Number(frequencySlider.value);
        return Number.isFinite(value)
            ? Math.max(0, Math.min(50, value))
            : 0;
    }

    function addLog(message) {
        if (!activityLog) return;

        const item = document.createElement("li");
        item.textContent = new Date().toLocaleTimeString() + " - " + message;
        activityLog.prepend(item);

        while (activityLog.children.length > 10) {
            activityLog.lastElementChild.remove();
        }
    }

    function updateDisplay() {
        const selectedFrequency = getFrequency();
        const outputFrequency =
            isRunning && !hasFault ? selectedFrequency : 0;

        setFrequency.textContent = selectedFrequency.toFixed(1);
        frequencyDisplay.textContent = outputFrequency.toFixed(1);

        const voltage = outputFrequency / 50 * 400;
        const rpm = outputFrequency / 50 * 1500;
        const percent = outputFrequency / 50 * 100;

        if (voltageDisplay) voltageDisplay.textContent = Math.round(voltage);
        if (rpmDisplay) rpmDisplay.textContent = Math.round(rpm);
        if (dcBusDisplay) {
            dcBusDisplay.textContent =
                isRunning && !hasFault ? "565" : "0";
        }

        if (speedPercent) {
            speedPercent.textContent = Math.round(percent) + "%";
        }
        if (speedBar) speedBar.style.width = percent + "%";

        if (motor) motor.classList.toggle(
            "running",
            isRunning && !hasFault && outputFrequency > 0
        );

        if (motorStatus) {
            motorStatus.textContent =
                isRunning && !hasFault && outputFrequency > 0
                    ? "Motor: RUNNING"
                    : "Motor: OFF";
        }

        if (statusBadge) {
            statusBadge.textContent = hasFault
                ? "FAULT"
                : isRunning ? "RUNNING" : "STOPPED";

            statusBadge.classList.toggle("running", isRunning && !hasFault);
        }

        if (driveStatus) {
            driveStatus.textContent = hasFault
                ? "Drive stopped - fault detected"
                : isRunning ? "Drive is running" : "Drive is stopped";
        }
    }

    // START button
    startBtn.addEventListener("click", function () {
        if (hasFault) {
            addLog("Clear the fault before starting.");
            return;
        }

        if (getFrequency() <= 0) {
            addLog("Set frequency above 0 Hz first.");
            return;
        }

        isRunning = true;
        updateDisplay();
        addLog("Drive started at " + getFrequency() + " Hz.");
        console.log("START clicked");
    });

    // STOP button
    stopBtn.addEventListener("click", function () {
        isRunning = false;
        updateDisplay();
        addLog("Drive stopped.");
        console.log("STOP clicked");
    });

    // RESET button
    resetBtn.addEventListener("click", function () {
        isRunning = false;
        hasFault = false;
        frequencySlider.value = "25";

        if (faultSelect) faultSelect.value = "none";
        if (faultMessage) {
            faultMessage.className = "fault-message";
            faultMessage.innerHTML =
                "<strong>System Normal</strong><p>No fault selected. The simulated drive is ready.</p>";
        }

        updateDisplay();
        addLog("Simulation reset. Frequency set to 25 Hz.");
        console.log("RESET clicked");
    });

    // Frequency slider
    frequencySlider.addEventListener("input", updateDisplay);

    // Troubleshooting selector
    if (faultSelect) {
        faultSelect.addEventListener("change", function () {
            const fault = faultSelect.value;
            hasFault = fault !== "none";

            if (hasFault) isRunning = false;

            const messages = {
                none: ["System Normal", "No fault selected.", ""],
                overload: [
                    "Motor Overload",
                    "Inspect the motor load and motor rating.",
                    "error"
                ],
                overvoltage: [
                    "DC Bus Overvoltage",
                    "Check supply voltage and deceleration settings.",
                    "warning"
                ],
                undervoltage: [
                    "DC Bus Undervoltage",
                    "Check the incoming power supply.",
                    "warning"
                ],
                overheat: [
                    "Drive Overheating",
                    "Check ventilation and cooling.",
                    "error"
                ]
            };

            const details = messages[fault] || messages.none;

            if (faultMessage) {
                faultMessage.className =
                    "fault-message" + (details[2] ? " " + details[2] : "");
                faultMessage.innerHTML =
                    "<strong></strong><p></p>";
                faultMessage.querySelector("strong").textContent = details[0];
                faultMessage.querySelector("p").textContent = details[1];
            }

            addLog(
                hasFault
                    ? "Fault selected: " + details[0]
                    : "Fault cleared."
            );

            updateDisplay();
        });
    }

    updateDisplay();
    addLog("VFD simulation loaded successfully.");
    console.log("VFD JavaScript loaded successfully.");
});