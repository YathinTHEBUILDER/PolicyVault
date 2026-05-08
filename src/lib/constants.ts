export const SITE_URL = 'https://policy-vault.vercel.app';

export const POLICY_CATEGORIES = {
  MOTOR: "motor",
  HEALTH: "health",
  OTHERS: "others",
} as const;

export const MOTOR_VEHICLE_CATEGORIES = {
  TWO_WHEELER: "Two Wheeler",
  PRIVATE_CAR: "Private Car",
  THREE_WHEELER: "Three Wheeler",
  PCV: "PCV (Passenger Commercial Vehicle)",
  COMMERCIAL_VEHICLE: "Commercial Vehicle",
  OTHERS: "Others",
} as const;

export const MOTOR_VEHICLE_SUB_TYPES = {
  [MOTOR_VEHICLE_CATEGORIES.TWO_WHEELER]: [
    "Motorcycle",
    "Scooter",
    "Moped",
    "Electric Two Wheeler",
    "Other Two Wheeler",
  ],
  [MOTOR_VEHICLE_CATEGORIES.PRIVATE_CAR]: [
    "Hatchback",
    "Sedan",
    "SUV / MUV",
    "Electric Car",
    "Luxury Car",
    "Other Private Car",
  ],
  [MOTOR_VEHICLE_CATEGORIES.THREE_WHEELER]: [
    "Passenger Auto Rickshaw",
    "Goods Auto Rickshaw",
    "Electric Auto",
    "Tempo Passenger",
    "Other Three Wheeler",
  ],
  [MOTOR_VEHICLE_CATEGORIES.PCV]: [
    "Taxi / Cab",
    "School Bus",
    "Staff Bus",
    "Mini Bus",
    "Maxi Cab",
    "Contract Carriage",
    "Other PCV",
  ],
  [MOTOR_VEHICLE_CATEGORIES.COMMERCIAL_VEHICLE]: [
    "Light Commercial Vehicle (LCV)",
    "Intermediate Commercial Vehicle (ICV)",
    "Heavy Commercial Vehicle (HCV)",
    "Pickup Truck",
    "Mini Truck",
    "Refrigerated Vehicle",
    "Other Commercial Vehicle",
  ],
  [MOTOR_VEHICLE_CATEGORIES.OTHERS]: [
    "Lorry",
    "Tipper",
    "Tanker",
    "Trailer",
    "JCB / Excavator",
    "Crane",
    "Tractor",
    "Harvester",
    "Forklift",
    "Concrete Mixer",
    "Roller / Road Compactor",
    "Generator Vehicle",
    "Other Miscellaneous Vehicle",
  ],
} as const;

export const POLICY_TYPES = {
  [POLICY_CATEGORIES.MOTOR]: Object.values(MOTOR_VEHICLE_CATEGORIES),
  [POLICY_CATEGORIES.HEALTH]: ["Individual", "Family Floater", "Group Health", "Top-up", "Critical Illness"],
  [POLICY_CATEGORIES.OTHERS]: [
    "Fire and Allied Perils",
    "Marine Cargo",
    "Marine Hull",
    "General Liability",
    "Workmen's Compensation",
    "Shop Owner's Policy",
    "Office Package",
    "Contractor's All Risk",
    "Directors and Officers",
    "Cyber Liability",
    "Professional Indemnity",
  ],
} as const;

export const MOTOR_POLICY_TYPES = {
  FIRST_PARTY: "first_party",
  THIRD_PARTY: "third_party",
} as const;

export const CLAIM_STATUS = {
  REGISTERED: "Registered",
  SURVEY_PENDING: "Survey Pending",
  SURVEY_DONE: "Survey Done",
  APPROVED: "Approved",
  SETTLED: "Settled",
  REJECTED: "Rejected",
  DISPUTED: "Disputed",
} as const;

export const ROLES = {
  ADMIN: "admin",
  STAFF: "staff",
  CUSTOMER: "customer",
} as const;
