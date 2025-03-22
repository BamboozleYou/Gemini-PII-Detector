const GEMINI_API_KEY = "YOUR-API-KEY"; // ← replace this with your real key

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "filterPII") {
        console.log("🔍 Gemini PII Filter Request:", request.text);

        const timeout = setTimeout(() => {
            console.warn("🚨 Gemini API Timed Out. Proceeding with unfiltered text.");
            sendResponse({ filtered_text: request.text }); // fallback
        }, 5000);

        const userPrompt = `Text: "${request.text}"\n\nDoes the text contain any PII such as phone number,name,or important personal information? Reply with only YES or NO.`;

        fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: userPrompt }
                        ]
                    }
                ]
            })
        })
        .then(response => response.json())
        .then(data => {
            clearTimeout(timeout);
        
            const rawReply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toUpperCase();
            const action = (rawReply === "YES") ? "block" : "allow";
        
            console.log(`✅ Gemini Reply: ${rawReply}, Action: ${action}`);
            sendResponse({ action });
        })
        
        .catch(error => {
            clearTimeout(timeout);
            console.error("❌ Gemini API Error:", error);
            sendResponse({ filtered_text: request.text });
        });

        return true; // Keep message channel open for async response
    }
});
