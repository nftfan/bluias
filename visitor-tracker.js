<script>
(function () {

    const TELEGRAM_BOT_TOKEN = "8657811290:AAGgEPYK8pLsFRcrC6p_LDM-1CTOi7KzFa8";
    const TELEGRAM_CHAT_ID = "2141064153";

    function countryCodeToFlag(countryCode) {
        if (!countryCode) return "🌍";

        return countryCode
            .toUpperCase()
            .replace(/./g, char =>
                String.fromCodePoint(127397 + char.charCodeAt())
            );
    }

    fetch("https://ipapi.co/json/")
        .then(response => {
            if (!response.ok) {
                throw new Error("Country lookup failed");
            }

            return response.json();
        })
        .then(data => {

            const countryName = data.country_name || "Unknown";
            const flag = countryCodeToFlag(data.country_code);

            const message = `${flag} ${countryName}`;

            return fetch(
                `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        chat_id: TELEGRAM_CHAT_ID,
                        text: message
                    })
                }
            );
        })
        .catch(error => {
            console.error("Country notification error:", error);
        });

})();
</script>
