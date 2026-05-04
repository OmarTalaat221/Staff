export const ROLES = [
  { key: "all", label: "All Staff" },
  { key: "waiter", label: "Waiters" },
  { key: "kitchen", label: "Kitchen" },
  { key: "cashier", label: "Cashier" },
  { key: "manager", label: "Manager" },
];

export const CATEGORIES = [
  { key: "opening", label: "Opening" },
  { key: "service", label: "Service" },
  { key: "hygiene", label: "Hygiene" },
  { key: "closing", label: "Closing" },
  { key: "emergency", label: "Emergency" },
  { key: "training", label: "Training" },
];

export const PRIORITIES = [
  { key: "critical", label: "Critical" },
  { key: "high", label: "High" },
  { key: "normal", label: "Normal" },
];

export const SOPS = [
  {
    id: "1",
    title: "Morning Opening Checklist",
    category: "opening",
    roles: ["all", "manager"],
    priority: "critical",
    steps: [
      { id: "1-1", text: "Unlock all entrances and disable alarm system." },
      { id: "1-2", text: "Turn on all lights, HVAC, and equipment." },
      {
        id: "1-3",
        text: "Inspect dining area — tables, chairs, floors, windows.",
      },
      { id: "1-4", text: "Check and restock all condiment stations." },
      {
        id: "1-5",
        text: "Verify POS systems and printers are operational.",
        note: "Report any issues to manager immediately.",
      },
      { id: "1-6", text: "Review daily specials and menu changes with team." },
      { id: "1-7", text: "Complete staff sign-in and assign station duties." },
    ],
    tips: "Opening manager must sign off before first guests are admitted.",
  },
  {
    id: "2",
    title: "Table Service Standards",
    category: "service",
    roles: ["all", "waiter"],
    priority: "high",
    steps: [
      { id: "2-1", text: "Greet guests within 60 seconds of being seated." },
      {
        id: "2-2",
        text: "Present menus and offer water/welcome drink immediately.",
      },
      { id: "2-3", text: "Take orders accurately — repeat back to confirm." },
      {
        id: "2-4",
        text: "Communicate any allergens or special requests to kitchen.",
        note: "Allergy orders must use RED ticket slip.",
      },
      { id: "2-5", text: "Check back within 2 minutes of food delivery." },
      {
        id: "2-6",
        text: "Clear plates only when all guests at the table are finished.",
      },
      {
        id: "2-7",
        text: "Present bill promptly when requested. Never rush guests.",
      },
    ],
    tips: "Smile, maintain eye contact, and use the guest's name when known.",
  },
  {
    id: "3",
    title: "Food Hygiene & Safety",
    category: "hygiene",
    roles: ["all", "kitchen", "waiter"],
    priority: "critical",
    steps: [
      {
        id: "3-1",
        text: "Wash hands for 20 seconds before every food interaction.",
      },
      { id: "3-2", text: "Wear gloves when handling ready-to-eat food." },
      {
        id: "3-3",
        text: "Check and log refrigerator temperatures every 2 hours.",
        note: "Cold storage must be at or below 4 degrees C at all times.",
      },
      {
        id: "3-4",
        text: "Label all food containers with date and time of preparation.",
      },
      {
        id: "3-5",
        text: "Follow FIFO (First In, First Out) for all perishables.",
      },
      {
        id: "3-6",
        text: "Sanitize all surfaces every 30 minutes during service.",
      },
      {
        id: "3-7",
        text: "Dispose of expired items immediately and log in waste register.",
      },
    ],
    tips: "Health inspections can happen unannounced. Always maintain standards.",
  },
  {
    id: "4",
    title: "Kitchen Order Flow",
    category: "service",
    roles: ["all", "kitchen"],
    priority: "high",
    steps: [
      {
        id: "4-1",
        text: "Acknowledge every ticket aloud when received on KDS.",
      },
      {
        id: "4-2",
        text: 'Call out "Corner!" and "Behind!" when moving in kitchen.',
      },
      { id: "4-3", text: "Plate food on clean, pre-warmed plates only." },
      {
        id: "4-4",
        text: 'Call "Service!" and place food on pass within 30 seconds of plating.',
      },
      {
        id: "4-5",
        text: "Never let plated food sit on pass for more than 2 minutes.",
        note: "Alert floor manager if runner is not available.",
      },
      {
        id: "4-6",
        text: "Communicate 86'd items immediately to floor staff and POS.",
      },
    ],
    tips: "A clean station is a fast station. Keep your mise en place tight.",
  },
  {
    id: "5",
    title: "End of Day Closing",
    category: "closing",
    roles: ["all", "manager"],
    priority: "critical",
    steps: [
      {
        id: "5-1",
        text: "Complete last seating and ensure all guests have departed.",
      },
      {
        id: "5-2",
        text: "Run end-of-day POS report and reconcile cash drawer.",
      },
      {
        id: "5-3",
        text: "Deep clean all kitchen equipment, surfaces, and floors.",
      },
      {
        id: "5-4",
        text: "Store all food properly — wrap, label, and refrigerate.",
      },
      { id: "5-5", text: "Empty and sanitize all bins. Replace liners." },
      {
        id: "5-6",
        text: "Lock all windows, service doors, and storage areas.",
      },
      {
        id: "5-7",
        text: "Set alarm and secure main entrance. Log closing time.",
      },
    ],
    tips: "Closing manager is the last person out and responsible for final security check.",
  },
  {
    id: "6",
    title: "Fire & Emergency Procedure",
    category: "emergency",
    roles: ["all"],
    priority: "critical",
    steps: [
      { id: "6-1", text: "On fire alarm: stay calm. Do NOT use elevators." },
      {
        id: "6-2",
        text: "Guide all guests to nearest exit calmly and clearly.",
      },
      {
        id: "6-3",
        text: "Kitchen staff: turn off all gas and electrical equipment first.",
      },
      {
        id: "6-4",
        text: "Manager: take reservation list to account for all guests.",
      },
      {
        id: "6-5",
        text: "Assemble at designated muster point (car park east side).",
      },
      {
        id: "6-6",
        text: "Do not re-enter building until fire service gives all-clear.",
      },
      {
        id: "6-7",
        text: "Complete incident report within 24 hours.",
        note: "Emergency contacts: Fire 123 | Police 122 | Manager +20 100 000 0000",
      },
    ],
    tips: "Practice fire drills are held every 3 months. Attendance is mandatory.",
  },
  {
    id: "7",
    title: "New Staff Onboarding",
    category: "training",
    roles: ["all", "manager"],
    priority: "normal",
    steps: [
      {
        id: "7-1",
        text: "Complete HR paperwork and uniform collection on Day 1.",
      },
      {
        id: "7-2",
        text: "Shadow an experienced team member for the first full shift.",
      },
      {
        id: "7-3",
        text: "Review all SOPs in this app and acknowledge completion.",
      },
      {
        id: "7-4",
        text: "Complete food safety certification (if required for role).",
      },
      { id: "7-5", text: "Pass POS system practical test with supervisor." },
      {
        id: "7-6",
        text: "Meet all department heads and learn emergency exits.",
      },
    ],
    tips: "New staff should never be left unsupervised during the first week.",
  },
];
