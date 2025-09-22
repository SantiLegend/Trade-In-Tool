export enum BoatType {
  PONTOON = 'Pontoon',
  FISHING = 'Fishing',
  DECK_BOAT = 'Deck Boat',
  BOWRIDER = 'Bowrider',
  CRUISER = 'Cruiser',
  WAKE_SKI = 'Wake/Ski Boat',
  OTHER = 'Other'
}

export enum CosmeticCondition {
  EXCELLENT = 'Excellent',
  GOOD = 'Good',
  FAIR = 'Fair',
  POOR = 'Poor'
}

export enum MechanicalCondition {
  TURN_KEY = 'Turn-Key',
  MINOR_ISSUES = 'Minor Issues',
  NEEDS_REPAIR = 'Needs Repair'
}

export interface BoatFormData {
  boatType: BoatType | '';
  year: string;
  make: string;
  model: string;
  hin: string;
  engineMake: string;
  horsepower: string;
  engineHours: string;
  trailer: boolean;
  cosmeticCondition: CosmeticCondition | '';
  mechanicalCondition: MechanicalCondition | '';
  photos: File[];
  fullName: string;
  email: string;
  phone: string;
  postalCode: string;
}

export interface ComparableBoat {
  make: string;
  model: string;
  year: number;
  price: number;
  source: string;
}

export interface Estimate {
  low: number;
  high: number;
  reasoning: string;
  comparables: ComparableBoat[];
  valueAddingFeatures: string[];
  potentialDeductions: string[];
  leadQuality: 'High' | 'Medium' | 'Low';
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}