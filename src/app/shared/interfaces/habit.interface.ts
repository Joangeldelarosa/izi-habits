export type HabitFrequency = 'daily' | 'weekly';

export interface IHabitTag {
  id: string;
  name: string;
  color: string;
  type: HabitTagTypeEnum;
  icon?: string;
}

export enum HabitTagTypeEnum {
  HEALTH = 'health',
  BUSINESS = 'business',
  PERSONAL = 'personal',
  LEARNING = 'learning',
  FITNESS = 'fitness',
}

export const DEFAULT_TAGS: Omit<IHabitTag, 'id'>[] = [
  { name: 'Salud', color: '#16A34A', type: HabitTagTypeEnum.HEALTH },
  { name: 'Negocios', color: '#2563EB', type: HabitTagTypeEnum.BUSINESS },
  { name: 'Personal', color: '#9333EA', type: HabitTagTypeEnum.PERSONAL },
  { name: 'Aprendizaje', color: '#EA580C', type: HabitTagTypeEnum.LEARNING },
  { name: 'Fitness', color: '#DC2626', type: HabitTagTypeEnum.FITNESS },
];

export interface IHabitProgress {
  date: string; // ISO string
  completed: boolean;
  notes?: string;
}

export interface IHabit {
  id: string;
  name: string;
  description?: string;
  targetDays: number;
  currentStreak: number;
  bestStreak: number;
  tags: IHabitTag[];
  createdAt: string; // ISO string
  progress: { [key: string]: IHabitProgress }; // key es la fecha en formato ISO
  isActive: boolean;
  color?: string;
}

export interface IHabitStateModel {
  habits: { [key: string]: IHabit };
  selectedHabitId: string | null;
  tags: IHabitTag[];
  loading: boolean;
  error: string | null;
}
