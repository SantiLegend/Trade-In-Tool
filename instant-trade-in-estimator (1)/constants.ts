import { BoatType, CosmeticCondition, MechanicalCondition } from './types';

export const BOAT_TYPES: BoatType[] = [
  BoatType.PONTOON,
  BoatType.FISHING,
  BoatType.DECK_BOAT,
  BoatType.BOWRIDER,
  BoatType.CRUISER,
  BoatType.WAKE_SKI,
  BoatType.OTHER,
];

export const BOAT_MAKES: string[] = [
    "Legend",
    "Lund",
    "Princecraft",
    "Crestliner",
    "Alumacraft",
    "Bayliner",
    "Sea Ray",
    "Tahoe",
    "Four Winns",
    "Glastron",
    "Mastercraft",
    "Malibu",
    "Correct Craft / Nautique",
    "Tige",
    "Bennington",
    "Sylvan",
    "Manitou",
    "Harris",
    "Other"
];

export const ENGINE_MAKES: string[] = [
    "Mercury",
    "Yamaha",
    "Honda",
    "Evinrude",
    "Suzuki",
    "Tohatsu",
    "Johnson",
    "Volvo Penta",
    "Mercruiser",
    "Other"
];

export const YEARS: string[] = Array.from({ length: new Date().getFullYear() - 1979 }, (_, i) => (new Date().getFullYear() - i).toString());

export const COSMETIC_CONDITIONS = [
  { value: CosmeticCondition.EXCELLENT, label: 'Excellent', description: 'Showroom new, no visible flaws.' },
  { value: CosmeticCondition.GOOD, label: 'Good', description: 'Minor cosmetic blemishes, well-maintained.' },
  { value: CosmeticCondition.FAIR, label: 'Fair', description: 'Normal wear and tear, some scratches or dings.' },
  { value: CosmeticCondition.POOR, label: 'Poor', description: 'Visible damage, needs cosmetic work.' },
];

export const MECHANICAL_CONDITIONS = [
  { value: MechanicalCondition.TURN_KEY, label: 'Turn-Key', description: 'All systems work perfectly.' },
  { value: MechanicalCondition.MINOR_ISSUES, label: 'Minor Issues', description: 'Runs well but has small, non-critical issues.' },
  { value: MechanicalCondition.NEEDS_REPAIR, label: 'Needs Repair', description: 'Major mechanical issues need to be addressed.' },
];
