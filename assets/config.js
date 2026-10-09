/* Home in Bloom — single source of truth for business info and pricing.
   Values marked ESTIMATE were not supplied by the owner; see DECISIONS.md. */
window.HIB = {
  business: {
    name: 'Home in Bloom',
    tagline: 'A fresh start for every home',
    email: 'houseinbloom@gmail.com',
    venmo: 'isabella-Peronni',
    area: 'Massachusetts'
  },

  // Provided by owner
  minimum: 150,
  cancelFee: 75,
  recurring: {
    none:     { label: 'One time',       discount: 0 },
    biweekly: { label: 'Every 2 weeks',  discount: 20 },
    weekly:   { label: 'Weekly',         discount: 30 }
  },

  // Set to a Formspree/Basin/etc. endpoint to submit bookings without opening an
  // email app (and to enable automatic customer confirmation emails). Blank = mailto fallback.
  formEndpoint: '',

  // Add real reviews here once supplied. The reviews section stays hidden while empty.
  // Shape: { quote: 'Exact text from the customer', name: 'First name + initial', detail: 'Optional (e.g. Worcester)' }
  reviews: [],

  // ---- ESTIMATE pricing (owner asked for reasonable estimates) ----
  home: {
    base: 70, perBed: 25, perBath: 30,
    sqftBands: [
      { id: 'lt1000',  label: 'Under 1,000 sq ft', add: 0 },
      { id: '1000',    label: '1,000 – 1,500 sq ft', add: 25 },
      { id: '1500',    label: '1,500 – 2,000 sq ft', add: 55 },
      { id: '2000',    label: '2,000 – 3,000 sq ft', add: 100 },
      { id: '3000',    label: '3,000+ sq ft', add: 160 }
    ]
  },
  office: { perSqft: 0.14, perRestroom: 20 },
  windows: { perOneSide: 8, perBothSides: 14 },
  extras: [
    { id: 'fridge',    label: 'Inside refrigerator', price: 35 },
    { id: 'oven',      label: 'Inside oven',         price: 35 },
    { id: 'cabinets',  label: 'Inside cabinets',     price: 45 },
    { id: 'baseboards',label: 'Baseboards (detailed)', price: 40 },
    { id: 'blinds',    label: 'Blinds',              price: 35 },
    { id: 'laundry',   label: 'Laundry (wash, dry, fold)', price: 25 },
    { id: 'dishes',    label: 'Dishes',              price: 20 },
    { id: 'pets',      label: 'Pet hair add-on',     price: 30 },
    { id: 'windows',   label: 'Interior windows (per window)', price: 6, qty: true }
  ],

  services: [
    { id: 'standard', group: 'Residential', name: 'Standard Cleaning', model: 'home', mult: 1, recurring: true,
      blurb: 'Regular upkeep to keep your home fresh, tidy and comfortable.',
      includes: ['Dusting surfaces & décor', 'Kitchen counters, sink & appliance exteriors', 'Bathrooms scrubbed & sanitized', 'Floors vacuumed & mopped', 'Beds made on request, trash emptied'] },
    { id: 'deep', group: 'Residential', name: 'Deep Cleaning', model: 'home', mult: 1.6,
      blurb: 'A top-to-bottom reset — ideal for a first visit or a seasonal refresh.',
      includes: ['Everything in Standard Cleaning', 'Baseboards, door frames & vents', 'Heavy buildup in kitchen & bathrooms', 'Detailed edges, corners & hard-to-reach spots'] },
    { id: 'move', group: 'Residential', name: 'Move In / Move Out Cleaning', model: 'home', mult: 1.75,
      blurb: 'An empty-home clean so you can hand over keys or move in with confidence.',
      includes: ['Deep-clean level detail in every room', 'Inside cabinets, drawers & closets', 'Appliances wiped inside and out', 'Floors, tracks & sills'] },
    { id: 'postcon', group: 'Residential', name: 'Post-Construction Cleaning', model: 'home', mult: 2.25,
      blurb: 'Removes dust and debris left behind after a renovation or build.',
      includes: ['Fine construction dust on all surfaces', 'Fixtures, vents & trim', 'Floors and window sills', 'Final detail pass'] },
    { id: 'airbnb', group: 'Residential', name: 'Airbnb / Turnover Cleaning', model: 'home', mult: 0.9,
      blurb: 'Fast, consistent turnovers so every guest arrives to a spotless stay.',
      includes: ['Full clean between guests', 'Bed linens changed (yours or supplied)', 'Bathrooms & kitchen reset', 'Restock check & damage heads-up'] },
    { id: 'office', group: 'Commercial', name: 'Office Cleaning', model: 'office', recurring: true,
      blurb: 'A clean, professional workplace — one-time or on a schedule.',
      includes: ['Desks & common areas', 'Restrooms & break rooms', 'Trash & recycling', 'Floors vacuumed & mopped'] },
    { id: 'window', group: 'Commercial', name: 'Window Cleaning', model: 'windows',
      blurb: 'Streak-free glass for storefronts, offices and homes.',
      includes: ['Glass cleaned inside, outside or both', 'Frames & sills wiped', 'Priced per window'] }
  ]
};
