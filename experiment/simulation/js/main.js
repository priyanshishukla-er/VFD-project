//Your JavaScript goes in here
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

let isRunning = false;
let hasFault = false;

const MAX_FREQUENCY = 50;
const RATED_VOLTAGE = 400;
const RATED_RPM = 1500;
const DC_BUS_VOLTAGE = 565;

function getSelectedFrequency() {
    const value = Number(frequencySlider.value);

    if (!Number.isFinite(value)) {
        return 0;
    }

    return Math.min(MAX_FREQUENCY, Math.max(0, value));
}

function addLog(message) {
    const item = document.createElement("li");
    const time = new Date().toLocaleTimeString();

    item.textContent = ${time} - ${message};
    activityLog.prepend(item);

    while (activityLog.children.length > 10) {
        activityLog.removeChild(activityLog.lastElementChild);
    }
}

function updateStatus() {
    if (hasFault) {
        statusBadge.textContent = "FAULT";
        statusBadge.classList.remove("running");
        driveStatus.textContent = "Drive stopped - fault detected";
        return;
    }

    if (isRunning) {
        statusBadge.textContent = "RUNNING";
        statusBadge.classList.add("running");
        driveStatus.textContent = "Drive is running";
    } else {
        statusBadge.textContent = "STOPPED";
        statusBadge.classList.remove("running");
        driveStatus.textContent = "Drive is stopped";
    }
}

function updateDisplay() {
    const selectedFrequency = getSelectedFrequency();
    const outputFrequency =
        isRunning && !hasFault ? selectedFrequency : 0;

    // HTML mein Hz pehle se likha hai, isliye yahan sirf number rakhein.
    setFrequency.textContent = selectedFrequency.toFixed(1);
    frequencyDisplay.textContent = outputFrequency.toFixed(1);

    const outputVoltage =
        (outputFrequency / MAX_FREQUENCY) * RATED_VOLTAGE;

    const motorRPM =
        (outputFrequency / MAX_FREQUENCY) * RATED_RPM;

    const percent =
        (outputFrequency / MAX_FREQUENCY) * 100;

    voltageDisplay.textContent = Math.round(outputVoltage);
    rpmDisplay.textContent = Math.round(motorRPM);
    dcBusDisplay.textContent =
        isRunning && !hasFault ? DC_BUS_VOLTAGE : 0;

    speedPercent.textContent = ${Math.round(percent)}%;
    speedBar.style.width = ${percent}%;

    if (isRunning && !hasFault && outputFrequency > 0) {
        motor.classList.add("running");
        motorStatus.textContent = "Motor: RUNNING";
    } else {
        motor.classList.remove("running");
        motorStatus.textContent = "Motor: OFF";
    }

    updateStatus();
}

function startDrive() {
    if (hasFault) {
        addLog("Cannot start: clear the selected fault first.");
        return;
    }

    if (getSelectedFrequency() <= 0) {
        addLog("Set a frequency above 0 Hz before starting.");
        return;
    }

    if (isRunning) {
        addLog("Drive is already running.");
        return;
    }

    isRunning = true;
    updateDisplay();
    addLog(Drive started at ${getSelectedFrequency().toFixed(1)} Hz.);
}

function stopDrive() {
    if (!isRunning) {
        addLog("Drive is already stopped.");
        updateDisplay();
        return;
    }

    isRunning = false;
    updateDisplay();
    addLog("Drive stopped.");
}

function resetDrive() {
    isRunning = false;
    frequencySlider.value = "25";
    faultSelect.value = "none";
    hasFault = false;

    updateFaultMessage();
    updateDisplay();
    addLog("Drive reset. Frequency set to 25 Hz.");
}

function updateFaultMessage() {
    const fault = faultSelect.value;

    faultMessage.className = "fault-message";

    const faultDetails = {
        none: {
            title: "System Normal",
            description:
                "No fault selected. The simulated drive is ready.",
            type: ""
        },
        overload: {
            title: "Motor Overload",
            description:
                "Possible cause: excessive motor load. Inspect the load and motor rating.",
            type: "error"
        },
        overvoltage: {
            title: "DC Bus Overvoltage",
            description:
                "Possible cause: high supply voltage or rapid deceleration. Check the drive settings.",
            type: "warning"
        },
        undervoltage: {
            title: "DC Bus Undervoltage",
            description:
                "Possible cause: low supply voltage or a loose power connection. Inspect the supply.",
            type: "warning"
        },
        overheat: {
            title: "Drive Overheating",
            description:
                "Possible cause: blocked ventilation or high ambient temperature. Check cooling.",
            type: "error"
        }
    };

    const details = faultDetails[fault];

    faultMessage.replaceChildren();

    const title = document.createElement("strong");
    title.textContent = details.title;

    const description = document.createElement("p");
    description.textContent = details.description;

    faultMessage.append(title, description);

    if (details.type) {
        faultMessage.classList.add(details.type);
    }

    const previousFaultState = hasFault;
    hasFault = fault !== "none";

    if (hasFault) {
        isRunning = false;
        addLog(Fault selected: ${details.title}. Drive stopped.);
    } else if (previousFaultState) {
        addLog("Fault cleared.");
    }

    updateDisplay();
}

frequencySlider.addEventListener("input", () => {
    updateDisplay();
});

startBtn.addEventListener("click", startDrive);
stopBtn.addEventListener("click", stopDrive);
resetBtn.addEventListener("click", resetDrive);

faultSelect.addEventListener("change", updateFaultMessage);

// Initial screen
updateFaultMessage();
updateDisplay();
addLog("VFD simulation initialized.");
