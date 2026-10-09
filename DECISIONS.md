# Home in Bloom — decisions still needed

Everything below was **not** in the brief. Nothing here was invented silently: it is either an
estimate (labelled), a yellow `[Decision needed]` marker in the legal pages, or left out.

## Missing content
- **Reviews** — you said you have real ones, but none were provided. The section is hidden until you add them to `reviews: []` in `assets/config.js` (shape documented there).
- **Photos** — none yet; the site uses illustrated flowers/sparkles instead. No before/after or team photos are shown.

## Pricing (all ESTIMATES in `assets/config.js` — edit freely)
- Standard clean = $70 + $25/bedroom + $30/bathroom + size add-on ($0–$160), rounded to $5. Example 2bd/1ba, 1,000–1,500 sq ft = $175.
- Multipliers on Standard: Deep ×1.6, Move In/Out ×1.75, Post-Construction ×2.25, Airbnb ×0.9.
- Office: $0.14/sq ft + $20/restroom. Windows: $8 one side / $14 inside+outside, per window.
- Extras ($6–$45) are typical-market guesses.
- **Recurring discount order**: $20/$30 is taken off *after* the $150 minimum, so a weekly small home can total under $150 (e.g. $145). Should the minimum apply after the discount?
- Is the discount **per visit** (assumed) or one-time? Which services qualify (assumed Standard + Office only)?

## Policies
- **Cancellation**: $75 fee is stated, but no notice window (24h? 48h?), and nothing on rescheduling.
- **Refunds**: not specified; Terms has a marker.
- **Payment timing / deposit**: Venmo only. Is a deposit required? When is payment due? Site currently says "pay after we confirm your final price".
- Terms/Privacy are drafts built only from the facts above — have a lawyer or template service review them. They make no insurance/bonding/guarantee claims; add those only if true.
- Privacy: data retention period, and name of any form service used.

## Booking mechanics
- **Email confirmations (you said yes)**: a static site cannot send email. Today, booking opens the customer's email app with details addressed to houseinbloom@gmail.com (no automatic confirmation to the customer). To fix: create a Formspree/Basin/etc. form with an auto-responder and paste its URL into `formEndpoint` in `config.js`; or ask for a backend.
- Arrival windows (Morning / Midday / Afternoon / Flexible) are generic — give real hours/days of operation.
- ZIP check accepts Massachusetts ZIPs only (01xxx, 02xxx, 05501, 05544).
- No availability calendar: dates are requests you confirm manually.

## Brand
- Name consistency: brand is "Home in Bloom", email is **houseinbloom**@gmail.com, domain is **homeinbloom**.com. Confirm which you want.
- Business legal name / mailing address (usually wanted in Terms/footer): not provided.
- Service checklists on the Services page ("what's included") are my drafts — correct them to what you actually do.
- Phone number intentionally not displayed (the optional phone field in the booking form is collected privately).
- The 21st.dev inspiration links were not pulled in; the look is a custom pink/sage palette with bloom + sparkle motifs. Send screenshots if you want the torn-postcard/painted-cover style matched.

## Deploying
Static files, no build. Upload `home-in-bloom/` to Netlify/Vercel/GitHub Pages and point homeinbloom.com at it.
