export const C = {
  bg: '#07080C',
  card: '#12141C',
  card2: '#1A1D28',
  line: '#252938',
  text: '#F5F7FA',
  dim: '#8A90A2',
  lime: '#B8FF2C',
  amber: '#FFC83D',
  red: '#FF4D5E',
  violet: '#8B5CFF',
  blue: '#4DA3FF',
  black: '#050608',
};

export type Level = 'good' | 'warn' | 'bad';

export const levelColor = (l: Level) =>
  l === 'good' ? C.lime : l === 'warn' ? C.amber : C.red;
