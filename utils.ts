import { FIRSTNAMES, SURNAMES } from './constants';
import { Player, Position, Team, Match, CrestData, PlayerStatChanges, Personality } from './types';

const ROLE_POOL: Record<Position, string[]> = {
  POR: ['POR'],
  DEF: ['LTI', 'LTD', 'DCI', 'DCD', 'LIB'],
  MED: ['MCI', 'MCD', 'MC', 'EIZ', 'EDE'],
  DEL: ['EI', 'ED', 'DC', 'DI', 'DD']
};

const PERSONALITIES: Personality[] = ['LEAL', 'AMBICIOSO', 'REBELDE', 'PROFESIONAL'];

const TEAM_COLORS = [
  '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ffffff', '#09090b', '#06b6d4', '#f97316',
  '#a855f7', '#14b8a6', '#6366f1', '#84cc16', '#dc2626', '#1d4ed8', '#047857', '#b45309', '#be185d', '#0f172a'
];

const PATTERNS: CrestData['pattern'][] = ['STRIPES', 'DIAGONAL', 'CROSS', 'PLAIN', 'CHEVRON', 'CHECKERED', 'STARS'];
const SHAPES: CrestData['shape'][] = ['SHIELD', 'CIRCLE', 'DIAMOND', 'HEXAGON', 'SQUARE'];
const SYMBOLS = [
  '⚽', '🛡️', '🦁', '🦅', '🔥', '⭐', '👑', '⚡', '🐉', '🐺', 
  '🐘', '🐃', '🦈', '🐅', '🐆', '🏹', '⚔️', '⚓', '🏔️', '🌋', 
  '🌙', '☀️', '☘️', '🌹', '⚜️', '💎', '🧤', '🏆', '👟', '📢', 
  '🪐', '🌀', '🔱', '⛩️', '🎡', '🏰', '🗿', '🎭', '🎨', '🛸'
];

export const calculateTSI = (p: Pick<Player, 'h_porteria' | 'h_defensa' | 'h_jugadas' | 'h_anotacion' | 'age'>): number => {
  const suma = (p.h_porteria * 3) + p.h_defensa + p.h_jugadas + p.h_anotacion;
  return Math.floor(suma * 100 * (p.age < 25 ? 1 : p.age < 30 ? 0.8 : 0.6));
};

export const calculateTeamPrestige = (team: Team): number => {
  const basePrestige = (4 - team.division) * 30;
  const performanceBonus = (team.pts / (team.pj || 1)) * 5;
  return Math.min(100, basePrestige + performanceBonus);
};

export const evaluateProjectSuitability = (amount: number, playerValue: number, prestige: number, ambition: number): number => {
  const moneyRatio = amount / (playerValue || 1);
  const moneyScore = Math.min(100, moneyRatio * 50); 
  const prestigeWeight = ambition / 100;
  const moneyWeight = 1 - prestigeWeight;
  return (prestige * prestigeWeight) + (moneyScore * moneyWeight);
};

export const generatePlayer = (division: number, free: boolean = false, teamName: string = "Libre"): Player => {
  const first = FIRSTNAMES[Math.floor(Math.random() * FIRSTNAMES.length)];
  const last = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
  const pos: Position = (['POR', 'DEF', 'MED', 'DEL'])[Math.floor(Math.random() * 4)] as Position;
  const age = 17 + Math.floor(Math.random() * 18);
  const base = division === 1 ? 12 : (division === 2 ? 8 : 5);
  const actualBase = free ? 4 + Math.floor(Math.random() * 8) : base;

  let h_porteria = 1 + Math.floor(Math.random() * 3);
  let h_defensa = 1 + Math.floor(Math.random() * (actualBase + 2));
  let h_jugadas = 1 + Math.floor(Math.random() * (actualBase + 2));
  let h_anotacion = 1 + Math.floor(Math.random() * (actualBase + 2));

  if (pos === 'POR') h_porteria = actualBase + Math.floor(Math.random() * 5);
  else if (pos === 'DEF') h_defensa = actualBase + Math.floor(Math.random() * 5);
  else if (pos === 'MED') h_jugadas = actualBase + Math.floor(Math.random() * 5);
  else if (pos === 'DEL') h_anotacion = actualBase + Math.floor(Math.random() * 5);

  const pool = ROLE_POOL[pos];
  const preferredRoles = [pool[Math.floor(Math.random() * pool.length)]];
  
  const p: Player = {
    id: Math.random().toString(36).substr(2, 9),
    name: `${first} ${last}`,
    pos,
    age,
    goals: 0,
    team: teamName,
    h_porteria,
    h_defensa,
    h_jugadas,
    h_anotacion,
    tsi: 0,
    value: 0,
    currentRole: null,
    isTransferListed: false,
    preferredRoles,
    ambition: 20 + Math.floor(Math.random() * 70),
    potential: 30 + Math.floor(Math.random() * 70),
    trainingFocus: 'NONE',
    trainingIntensity: 'MED',
    fatigue: Math.floor(Math.random() * 10),
    injuryWeeks: 0,
    lastSeasonChanges: { h_porteria: 0, h_defensa: 0, h_jugadas: 0, h_anotacion: 0 },
    personality: PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)],
    happiness: 70 + Math.floor(Math.random() * 30),
    moralStatus: 'Contento'
  };

  p.tsi = calculateTSI(p);
  p.value = p.tsi * 120;

  return p;
};

const getUniqueHash = (str: string) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
};

export const createTeam = (name: string, division: number, isUser: boolean = false): Team => {
  const squad = Array.from({ length: 18 }, () => generatePlayer(division, false, name));
  const h = getUniqueHash(name);
  
  const team: Team = {
    id: Math.random().toString(36).substr(2, 9),
    name,
    division,
    isUser,
    budget: (4 - division) * 2000000,
    capacity: (4 - division) * 8000,
    squad,
    pts: 0,
    pj: 0,
    gf: 0,
    gc: 0,
    formation: '4-4-2',
    lineup: {},
    crest: {
      primaryColor: TEAM_COLORS[h % TEAM_COLORS.length],
      secondaryColor: TEAM_COLORS[(h * 7) % TEAM_COLORS.length],
      pattern: PATTERNS[(h * 13) % PATTERNS.length],
      shape: SHAPES[(h * 17) % SHAPES.length],
      symbol: SYMBOLS[(h * 31) % SYMBOLS.length]
    }
  };

  if (!isUser) {
    const sorted = [...squad].sort((a, b) => b.tsi - a.tsi);
    const starterPositions = ["POR", "LTI", "DCI", "DCD", "LTD", "EIZ", "MCI", "MCD", "EDE", "DI", "DD"];
    starterPositions.forEach((pos, i) => {
        team.lineup[pos] = sorted[i].id;
        sorted[i].currentRole = pos;
    });
    for (let i = 11; i < 18; i++) {
        const subPos = `S${i - 10}`;
        team.lineup[subPos] = sorted[i].id;
        sorted[i].currentRole = subPos;
    }
  }

  return team;
};

export const generateCalendar = (teams: Team[]): Record<number, Match[][]> => {
  const calendar: Record<number, Match[][]> = { 1: [], 2: [], 3: [] };
  [1, 2, 3].forEach(div => {
    let divTeams = teams.filter(t => t.division === div);
    const n = divTeams.length;
    const schedule: Match[][] = [];
    for (let r = 0; r < (n - 1); r++) {
      const roundMatches: Match[] = [];
      for (let m = 0; m < n / 2; m++) {
        const homeIdx = (r + m) % (n - 1);
        const awayIdx = (n - 1 - m + r) % (n - 1);
        let home = divTeams[homeIdx];
        let away = divTeams[awayIdx];
        if (m === 0) home = divTeams[n - 1];
        roundMatches.push({ loc: r % 2 === 0 ? home : away, vis: r % 2 === 0 ? away : home, played: false, score: [0, 0], division: div, week: r + 1 });
      }
      schedule.push(roundMatches);
    }
    const vuelta = schedule.map((round, idx) => round.map(m => ({ ...m, loc: m.vis, vis: m.loc, week: (n - 1) + idx + 1 })));
    calendar[div] = [...schedule, ...vuelta];
  });
  return calendar;
};

export const posOrder: Record<Position, number> = { POR: 0, DEF: 1, MED: 2, DEL: 3 };