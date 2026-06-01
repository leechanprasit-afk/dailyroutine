// All static data and type definitions for Focus with Lee

export type RoutineStatus = 'pending' | 'done' | 'skip' | 'snoozed' | 'active';

export type RoutineType =
  | 'alarm'
  | 'medication'
  | 'exercise'
  | 'stretch'
  | 'lunch'
  | 'focus'
  | 'dinner'
  | 'winddown'
  | 'bedtime';

export interface Exercise {
  name: string;
  durationSeconds: number;
  description: string;
}

export interface FocusBlock {
  label: string;
  durationMinutes: number;
  color: string;
}

export interface LunchMenuItem {
  id: string;
  name: string;
  protein: string;
  emoji: string;
}

export interface RoutineItem {
  id: string;
  time: string; // "HH:MM" 24h format
  timeLabel: string; // display label "6:30 AM"
  title: string;
  message: string;
  type: RoutineType;
  color: string; // tailwind bg class
  exercises?: Exercise[];
  focusBlocks?: FocusBlock[];
  showLunchMenu?: boolean;
}

export const DEFAULT_EXERCISES: Exercise[] = [
  {
    name: 'Squat',
    durationSeconds: 60,
    description: 'Stand feet shoulder-width apart, lower hips slowly, keep back straight.',
  },
  {
    name: 'Wall Push-up',
    durationSeconds: 60,
    description: 'Place hands on wall, lean in and push back. Great for upper body.',
  },
  {
    name: 'March in Place',
    durationSeconds: 60,
    description: 'Lift knees alternately while swinging arms. Gets the heart going gently.',
  },
  {
    name: 'Standing Side Leg Lift',
    durationSeconds: 60,
    description: 'Hold a wall for balance, lift one leg sideways, alternate sides.',
  },
  {
    name: 'Shoulder Roll + Deep Breathing',
    durationSeconds: 60,
    description: 'Roll shoulders back slowly, take 3 deep breaths between rolls.',
  },
];

export const DEFAULT_LUNCH_MENU: LunchMenuItem[] = [
  { id: '1', name: 'Boiled Eggs + Salad', protein: '~18g protein', emoji: '🥚' },
  { id: '2', name: 'Chicken Wrap', protein: '~30g protein', emoji: '🌯' },
  { id: '3', name: 'Greek Yogurt + Berries', protein: '~15g protein', emoji: '🫐' },
  { id: '4', name: 'Tuna Sandwich', protein: '~25g protein', emoji: '🥪' },
  { id: '5', name: 'Tofu Stir-fry', protein: '~20g protein', emoji: '🥢' },
  { id: '6', name: 'Salmon + Steamed Veggies', protein: '~35g protein', emoji: '🐟' },
];

export const DEFAULT_FOCUS_BLOCKS: FocusBlock[] = [
  { label: 'Accounting Work', durationMinutes: 60, color: '#a8c8e8' },
  { label: 'LeeTalk Video', durationMinutes: 60, color: '#f9a8c9' },
  { label: 'Etsy Product Finalization', durationMinutes: 120, color: '#a8d5b5' },
];

export const FOCUS_QUOTES = [
  'One thing at a time.',
  'Small progress is still progress.',
  'Focus now, freedom later.',
  'You are doing great, Lee.',
  'Stay with it. Just a little longer.',
  'Breathe. Focus. Repeat.',
  'This moment is enough.',
  'Your effort today builds tomorrow.',
];

export const DEFAULT_ROUTINES: RoutineItem[] = [
  {
    id: 'wake-up',
    time: '06:30',
    timeLabel: '6:30 AM',
    title: 'Wake Up',
    message: 'Good morning Lee. Wake up on time. Start your day gently.',
    type: 'alarm',
    color: '#fef3e2',
  },
  {
    id: 'morning-medication',
    time: '07:30',
    timeLabel: '7:30 AM',
    title: 'Morning Medication',
    message: 'Time to take your morning medication.',
    type: 'medication',
    color: '#fce7f3',
  },
  {
    id: 'exercise',
    time: '09:00',
    timeLabel: '9:00 AM',
    title: '5-Minute Exercise',
    message: 'Time to move your body. 5 exercises, 1 minute each.',
    type: 'exercise',
    color: '#dcfce7',
    exercises: DEFAULT_EXERCISES,
  },
  {
    id: 'stretch',
    time: '11:00',
    timeLabel: '11:00 AM',
    title: 'Stretch Break',
    message: 'Stand up, stretch your body, relax your neck and shoulders.',
    type: 'stretch',
    color: '#e0f2fe',
  },
  {
    id: 'lunch',
    time: '12:00',
    timeLabel: '12:00 PM',
    title: 'Lunch Reminder',
    message: 'Time for lunch. Please eat enough protein today.',
    type: 'lunch',
    color: '#fef9c3',
    showLunchMenu: true,
  },
  {
    id: 'afternoon-focus',
    time: '13:00',
    timeLabel: '1:00 PM',
    title: 'Afternoon Focus Block',
    message: 'Time to focus on your most important work.',
    type: 'focus',
    color: '#ede9fe',
    focusBlocks: DEFAULT_FOCUS_BLOCKS,
  },
  {
    id: 'dinner',
    time: '17:00',
    timeLabel: '5:00 PM',
    title: 'Dinner Reminder',
    message: 'Time for dinner. Choose something nourishing and protein-rich.',
    type: 'dinner',
    color: '#fef3e2',
  },
  {
    id: 'wind-down',
    time: '20:00',
    timeLabel: '8:00 PM',
    title: 'Wind Down',
    message: 'Put your hands away from work. Listen to music, rest, or sit quietly.',
    type: 'winddown',
    color: '#f3e8ff',
  },
  {
    id: 'bedtime',
    time: '21:30',
    timeLabel: '9:30 PM',
    title: 'Bedtime Routine',
    message: 'Start getting ready for bed. Tomorrow will be better when you rest well.',
    type: 'bedtime',
    color: '#dbeafe',
  },
];

export const TYPE_ICONS: Record<RoutineType, string> = {
  alarm: '☀️',
  medication: '💊',
  exercise: '🏃‍♀️',
  stretch: '🧘‍♀️',
  lunch: '🥗',
  focus: '🎯',
  dinner: '🍽️',
  winddown: '🎵',
  bedtime: '🌙',
};
