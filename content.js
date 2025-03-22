console.log("✅ PII Detection Filter Content Script Loaded");

let latestUserInput = "";
let typingTimeout;

function findActiveInputField() {
    let inputField = document.querySelector("textarea:not([style*='display: none'])") 
                     || document.querySelector("div[contenteditable='true']");
    if (!inputField || inputField.offsetParent === null || inputField.offsetHeight === 0) {
        return null;
    }
    return inputField;
}

function findSendButton() {
    return document.querySelector("button[data-testid='send-button']");
}

function disableSendButton() {
    let sendButton = findSendButton();
    if (sendButton) {
        sendButton.disabled = true;
    }
}

function enableSendButton() {
    let sendButton = findSendButton();
    if (sendButton) {
        sendButton.disabled = false;
    }
}

function showDetectionPopup() {
    alert("🚨 Personal Information detected in your message!\n It is against the corporate policy.\n Message will not be sent");
}

function checkPIIonSend(inputField) {
    let userInput = inputField.innerText;
    if (userInput === "") return;
    
    disableSendButton(); // Temporarily disable send button while checking
    
    chrome.runtime.sendMessage(
        { action: "filterPII", text: userInput },
        (response) => {
            if (response?.action === "block") {
                console.log("🚨 PII detected by Gemini before sending.");
                showDetectionPopup();
                enableSendButton(); // Re-enable send button if PII detected
            } else {
                console.log("✅ No PII detected by Gemini, sending message.");

                let sendButton = findSendButton();
                if (sendButton) {
                    sendButton.removeEventListener("click", handleSendButtonClick, true); // Temporarily remove listener
                    
                    // Simulate a real user click using a pointer event
                    let event = new MouseEvent("click", {
                        bubbles: true,
                        cancelable: true,
                        view: window
                    });
                    sendButton.dispatchEvent(event);

                    setTimeout(() => {
                        sendButton.addEventListener("click", handleSendButtonClick, true); // Reattach listener
                    }, 100);
                }
            }
        }
    );
}

function attachEnterKeyListener() {
    document.removeEventListener("keydown", handleEnterKeyPress, true);
    document.addEventListener("keydown", handleEnterKeyPress, true);
}

function handleEnterKeyPress(event) {
    if (event.key === "Enter" && !event.shiftKey) {
        const inputField = findActiveInputField();
        if (!inputField) return;

        event.preventDefault();      // 🛑 Stop native behavior
        event.stopPropagation();
        checkPIIonSend(inputField)
    }     // 🛑 Stop event bubbling
}

function attachFilterToSendButton() {
    let sendButton = findSendButton();
    if (!sendButton) return;
    sendButton.removeEventListener("click", handleSendButtonClick);
    sendButton.addEventListener("click", handleSendButtonClick, true);
}

function handleSendButtonClick(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const inputField = findActiveInputField();
    if (!inputField) return;
    
    checkPIIonSend(inputField);
}

function observeUIChanges() {
    const observer = new MutationObserver(() => {
        attachFilterToSendButton();
        attachEnterKeyListener();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    attachFilterToSendButton();
    attachEnterKeyListener();
}

observeUIChanges();
