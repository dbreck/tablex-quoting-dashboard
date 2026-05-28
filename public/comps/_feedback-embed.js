/*
 * ClearPH Feedback loader for public design comps.
 *
 * Lets an external reviewer leave annotated feedback on this static comp
 * with no login. Fetches a fresh, short-lived WP-bridge identity token from
 * the dashboard (/api/feedback-token), sets window.CLEARPH_FEEDBACK_TOKEN,
 * then loads the feedback embed.js. embed.js reads the token synchronously
 * on init, so the token MUST be set before it runs — we append embed.js only
 * after the fetch resolves.
 *
 * Re-export note: comp HTML is re-exported wholesale from claude.ai/design.
 * After a re-export, re-add this one line before </body>:
 *   <script src="/comps/_feedback-embed.js" defer></script>
 */
(function () {
  "use strict";
  if (window.__CLEARPH_COMP_FEEDBACK_BOOTED) return;
  window.__CLEARPH_COMP_FEEDBACK_BOOTED = true;

  fetch("/api/feedback-token", { credentials: "omit" })
    .then(function (res) {
      if (!res.ok) throw new Error("feedback-token " + res.status);
      return res.json();
    })
    .then(function (data) {
      if (!data || !data.token || !data.apikey) {
        throw new Error("feedback-token: malformed response");
      }
      var origin = data.embedOrigin || "https://embed.feedback.clearph.com";
      window.CLEARPH_FEEDBACK_TOKEN = data.token;

      var s = document.createElement("script");
      s.src = origin + "/embed.js?apikey=" + encodeURIComponent(data.apikey);
      s.async = true;
      document.body.appendChild(s);
    })
    .catch(function (err) {
      // Non-fatal: the comp still renders, just without the feedback rail.
      console.info("[CLEARPH_COMP_FEEDBACK] disabled:", err && err.message);
    });
})();
