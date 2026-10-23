<script>
(function () {

    // IMPORTANT:
    // Put your Telegram bot token and chat ID here.
    // If this code is public on GitHub Pages, the token will also be public.
    const TELEGRAM_BOT_TOKEN = "8657811290:AAGgEPYK8pLsFRcrC6p_LDM-1CTOi7KzFa8";
    const TELEGRAM_CHAT_ID = "2141064153";


    function escapeTelegramHtml(value) {
        return String(value || "").replace(/[&<>]/g, function (character) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;"
            }[character];
        });
    }


    function getDevice() {
        const ua = navigator.userAgent;

        if (/tablet|ipad/i.test(ua)) return "Tablet";
        if (/mobile|android|iphone|ipod/i.test(ua)) return "Mobile";

        return "Desktop";
    }


    function getOS() {
        const ua = navigator.userAgent;

        if (/Windows/i.test(ua)) return "Windows";
        if (/Android/i.test(ua)) return "Android";
        if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
        if (/Mac OS X/i.test(ua)) return "macOS";
        if (/Linux/i.test(ua)) return "Linux";

        return "Unknown";
    }


    function getBrowser() {
        const ua = navigator.userAgent;

        if (/Edg/i.test(ua)) return "Edge";
        if (/OPR|Opera/i.test(ua)) return "Opera";
        if (/Chrome/i.test(ua)) return "Chrome";
        if (/Firefox/i.test(ua)) return "Firefox";
        if (/Safari/i.test(ua)) return "Safari";

        return "Unknown";
    }


    function getReferralSource() {

        if (!document.referrer) {
            return "Direct visit";
        }

        try {

            const url = new URL(document.referrer);
            const host = url.hostname.toLowerCase();

            if (host.includes("instagram")) return "Instagram";
            if (host.includes("facebook") || host.includes("fb.com")) return "Facebook";
            if (host.includes("google")) return "Google";
            if (host.includes("t.co") || host.includes("twitter") || host.includes("x.com")) return "X / Twitter";
            if (host.includes("tiktok")) return "TikTok";
            if (host.includes("youtube")) return "YouTube";
            if (host.includes("telegram") || host.includes("t.me")) return "Telegram";
            if (host.includes("reddit")) return "Reddit";
            if (host.includes("linkedin")) return "LinkedIn";
            if (host.includes("pinterest")) return "Pinterest";

            return host.replace(/^www\./, "");

        } catch (error) {

            return document.referrer;
        }
    }


    function getUTMSource() {

        try {

            const params = new URLSearchParams(window.location.search);

            return {
                source: params.get("utm_source"),
                medium: params.get("utm_medium"),
                campaign: params.get("utm_campaign")
            };

        } catch (error) {

            return {
                source: null,
                medium: null,
                campaign: null
            };
        }
    }


    fetch("https://ipapi.co/json/")
        .then(function (response) {

            if (!response.ok) {
                throw new Error("Location lookup failed");
            }

            return response.json();
        })

        .then(function (data) {

            const referral = getReferralSource();
            const utm = getUTMSource();

            let message =
`🚨 <b>New Bluias Visitor</b>

🌐 <b>Website:</b> www.bluias.com
📄 <b>Page:</b> ${escapeTelegramHtml(location.href)}

📍 <b>IP:</b> ${escapeTelegramHtml(data.ip || "Unknown")}
🇺🇳 <b>Country:</b> ${escapeTelegramHtml(data.country_name || "Unknown")}
🏙 <b>City:</b> ${escapeTelegramHtml(data.city || "Unknown")}
📌 <b>Region:</b> ${escapeTelegramHtml(data.region || "Unknown")}

💻 <b>Device:</b> ${getDevice()}
🖥 <b>OS:</b> ${getOS()}
🌍 <b>Browser:</b> ${getBrowser()}

📐 <b>Screen:</b> ${screen.width} × ${screen.height}
🌎 <b>Language:</b> ${escapeTelegramHtml(navigator.language)}

🔗 <b>Referral:</b> ${escapeTelegramHtml(referral)}
🔗 <b>Full Referrer:</b> ${escapeTelegramHtml(document.referrer || "Direct visit")}`;

            if (utm.source) {
                message += `

📣 <b>UTM Source:</b> ${escapeTelegramHtml(utm.source)}`;
            }

            if (utm.medium) {
                message += `
📣 <b>UTM Medium:</b> ${escapeTelegramHtml(utm.medium)}`;
            }

            if (utm.campaign) {
                message += `
📣 <b>UTM Campaign:</b> ${escapeTelegramHtml(utm.campaign)}`;
            }

            message += `

🕐 <b>Time:</b> ${escapeTelegramHtml(new Date().toLocaleString())}`;


            return fetch(
                `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        chat_id: TELEGRAM_CHAT_ID,
                        text: message,
                        parse_mode: "HTML"
                    })
                }
            );
        })

        .then(function (response) {

            if (!response.ok) {
                throw new Error("Telegram request failed");
            }

            return response.json();
        })

        .then(function (result) {

            console.log("Bluias visitor notification sent:", result);
        })

        .catch(function (error) {

            console.error("Bluias visitor tracker error:", error);
        });

})();
</script>
