
export type Position = 'POR' | 'DEF' | 'MED' | 'DEL';
export type TrainingIntensity = 'LOW' | 'MED' | 'HIGH' | 'EXTREME';
export type PlayerRole = 'CLAVE' | 'TITULAR' | 'ROTACION' | 'PROPESA';
export type Personality = 'LEAL' | 'AMBICIOSO' | 'REBELDE' | 'PROFESIONAL';

export interface PlayerStatChanges {
  h_porteria: number;
  h_defensa: number;
  h_jugadas: number;
  h_anotacion: number;
}

export type EventType = 'goal' | 'yellow' | 'red' | 'injury' | 'chance' | 'save';

export interface MatchEvent {
  m: number;
  msg: string;
  type: EventType;
}

export interface Negotiation {
  id: string;
  playerId: string;
  playerName: string;
  sellerTeamName: string;
  amount: number;
  status: 'CLUB_REJECTED' | 'CLUB_ACCEPTED' | 'PLAYER_NEGOTIATING' | 'AGREED' | 'FAILED';
  playerBonus: number;
  promisedRole: PlayerRole;
  clubMessage: string;
  playerMessage: string;
}

export interface Player {
  id: string;
  name: string;
  pos: Position;
  age: number;
  goals: number;
  team: string;
  h_porteria: number;
  h_defensa: number;
  h_jugadas: number;
  h_anotacion: number;
  tsi: number;
  value: number;
  currentRole: string | null;
  isTransferListed: boolean;
  preferredRoles: string[];
  ambition: number; 
  potential: number;
  trainingFocus: 'NONE' | 'GK' | 'DEF' | 'MID' | 'ATT';
  trainingIntensity: TrainingIntensity;
  fatigue: number; 
  injuryWeeks: number; 
  lastSeasonChanges?: PlayerStatChanges;
  personality: Personality;
  happiness: number; 
  moralStatus: string;
}

export interface CrestData {
  primaryColor: string;
  secondaryColor: string;
  pattern: 'STRIPES' | 'DIAGONAL' | 'CROSS' | 'PLAIN' | 'CHEVRON';
  shape: 'SHIELD' | 'CIRCLE' | 'DIAMOND';
  symbol: string;
}

export interface Team {
  id: string;
  name: string;
  division: number;
  isUser: boolean;
  budget: number;
  capacity: number;
  squad: Player[];
  pts: number;
  pj: number;
  gf: number;
  gc: number;
  formation: string;
  lineup: Record<string, string | null>; 
  crest: CrestData;
}

export interface Match {
  loc: Team;
  vis: Team;
  played: boolean;
  score: [number, number];
  division: number;
  week: number;
  events?: MatchEvent[];
}

export type ViewType = 'TACTICS' | 'LEAGUE' | 'SQUAD' | 'MARKET' | 'SCOUT' | 'NEGOTIATIONS' | 'TEAM_DETAIL' | 'TRAINING';

export interface LeagueState {
  week: number;
  seasonCount: number;
  teams: Team[];
  freeAgents: Player[];
  calendar: Record<number, Match[][]>;
  negotiations: Negotiation[];
  pendingAuctions: string[]; 
}

export interface Offer {
  id: string;
  playerId: string;
  playerName: string;
  fromTeamId: string;
  fromTeamName: string;
  amount: number;
  playerAccepts: boolean;
  refusalReason?: string;
}

export interface SeasonRecord {
  seasonNumber: number;
  champions: Record<number, string>;
  pichichis: Record<number, { name: string; team: string; goals: number }>;
}

export interface Bid {
  teamId: string;
  teamName: string;
  amount: number;
  prestige: number;
}

export interface AuctionState {
  player: Player;
  currentBid: number;
  highestBidderId: string | null;
  highestBidderName: string;
  highestBidderIsUser: boolean;
  round: number;
  status: 'IDLE' | 'BIDDING' | 'FINISHED';
  rivals: Team[];
  logs: string[];
  allBids: Bid[];
}
