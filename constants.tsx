
import React from 'react';

export const COLORS = {
  bg: 'bg-zinc-950',
  panel: 'bg-zinc-900',
  text: 'text-zinc-100',
  pitch: 'bg-emerald-800',
  green: '#00e676',
  red: '#ff5252',
  blue: '#2979ff',
  yellow: '#ffd600'
};

export const POSITION_COLORS: Record<string, { bg: string, text: string, border: string, light: string }> = {
  POR: { bg: 'bg-yellow-500', text: 'text-yellow-950', border: 'border-yellow-200', light: 'bg-yellow-500/10 text-yellow-500' },
  DEF: { bg: 'bg-blue-600', text: 'text-blue-50', border: 'border-blue-400', light: 'bg-blue-500/10 text-blue-400' },
  MED: { bg: 'bg-emerald-600', text: 'text-emerald-50', border: 'border-emerald-400', light: 'bg-emerald-500/10 text-emerald-400' },
  DEL: { bg: 'bg-red-600', text: 'text-red-50', border: 'border-red-400', light: 'bg-red-500/10 text-red-400' }
};

export const FORMATIONS = ["4-4-2", "4-3-3", "2-5-3", "5-4-1"];

export const FORMATION_COORDS: Record<string, Record<string, { x: number; y: number }>> = {
  "4-4-2": {
    "POR": { x: 50, y: 92 },
    "LTI": { x: 15, y: 75 },
    "DCI": { x: 38, y: 80 },
    "DCD": { x: 62, y: 80 },
    "LTD": { x: 85, y: 75 },
    "EIZ": { x: 15, y: 50 },
    "MCI": { x: 35, y: 55 },
    "MCD": { x: 65, y: 55 },
    "EDE": { x: 85, y: 50 },
    "DI": { x: 38, y: 20 },
    "DD": { x: 62, y: 20 }
  },
  "4-3-3": {
    "POR": { x: 50, y: 92 },
    "LTI": { x: 15, y: 75 },
    "DCI": { x: 38, y: 80 },
    "DCD": { x: 62, y: 80 },
    "LTD": { x: 85, y: 75 },
    "MCI": { x: 25, y: 55 },
    "MC": { x: 50, y: 50 },
    "MCD": { x: 75, y: 55 },
    "EI": { x: 20, y: 20 },
    "DC": { x: 50, y: 15 },
    "ED": { x: 80, y: 20 }
  },
  "2-5-3": {
    "POR": { x: 50, y: 92 },
    "DCI": { x: 35, y: 80 },
    "DCD": { x: 65, y: 80 },
    "EIZ": { x: 10, y: 55 },
    "MCI": { x: 30, y: 55 },
    "MC": { x: 50, y: 50 },
    "MCD": { x: 70, y: 55 },
    "EDE": { x: 90, y: 55 },
    "EI": { x: 20, y: 20 },
    "DC": { x: 50, y: 15 },
    "ED": { x: 80, y: 20 }
  },
  "5-4-1": {
    "POR": { x: 50, y: 92 },
    "LTI": { x: 12, y: 75 },
    "DCI": { x: 30, y: 82 },
    "LIB": { x: 50, y: 85 },
    "DCD": { x: 70, y: 82 },
    "LTD": { x: 88, y: 75 },
    "EIZ": { x: 15, y: 50 },
    "MCI": { x: 38, y: 55 },
    "MCD": { x: 62, y: 55 },
    "EDE": { x: 85, y: 50 },
    "DC": { x: 50, y: 20 }
  }
};

export const FIRSTNAMES = [
  'Mateo', 'Thiago', 'Killian', 'Erling', 'Jude', 'Bukayo', 'Vinicius', 'Takefusa', 'Mohammed', 'Samuel',
  'Gianluigi', 'Alessandro', 'Hans', 'Bjorn', 'Luka', 'Kevin', 'Bruno', 'Cristiano', 'Lionel', 'Neymar',
  'Antoine', 'Robert', 'Harry', 'Karim', 'Zlatan', 'Marcus', 'Phil', 'Jack', 'Declan', 'Rodri',
  'Gavi', 'Pedri', 'Xavi', 'Iker', 'Carles', 'Raul', 'David', 'Luis', 'Angel', 'Enzo',
  'Julian', 'Alexis', 'Darwin', 'Federico', 'Santiago', 'Miguel', 'Joao', 'Ruben', 'Bernardo', 'Diogo',
  'Rafael', 'Ousmane', 'Kingsley', 'Dayot', 'William', 'Ibrahima', 'Theo', 'Lucas', 'Mike', 'Benjamin',
  'Jules', 'Eduardo', 'Aurelien', 'Christopher', 'Moussa', 'Youssouf', 'Boubacar', 'Yassine', 'Achraf', 'Hakim',
  'Sofyan', 'Azzedine', 'Selim', 'Youssef', 'Bono', 'Sadio', 'Kalidou', 'Edouard', 'Idrissa', 'Cheikhou',
  'Boulaye', 'Ismaila', 'Nicolas', 'Wilfried', 'Sebastian', 'Victor', 'Kelechi', 'Wilfred', 'Alex', 'Joe',
  'Riyad', 'Said', 'Ismael', 'Ramy', 'Thomas', 'Jordan', 'Inaki', 'Nico', 'Tariq', 'Salis',
  'Kamaldeen', 'Ernest', 'Alphonso', 'Jonathan', 'Cyle', 'Tajon', 'Stephen', 'Milan', 'Dusan', 'Filip',
  'Sergej', 'Aleksandar', 'Nemanja', 'Jan', 'Josko', 'Marcelo', 'Ivan', 'Andrej', 'Christian', 'Piotr',
  'Arkadiusz', 'Matty', 'Nicola', 'Jakub', 'Dominik', 'Willi', 'Peter', 'Adam', 'Barnabas', 'Roland',
  'Patrik', 'Tomas', 'Vaclav', 'Vladimir', 'Yannick', 'Leandro', 'Jeremy', 'Amadou', 'Thibaut', 'Romelu',
  'Youri', 'Dodi', 'Timothy', 'Arthur', 'Zeno', 'Johan', 'Charles', 'Aster', 'Orel', 'Matz',
  'Eder', 'Gabriel', 'Fabio', 'Roberto', 'Paolo', 'Franco', 'Marco', 'Davide', 'Filippo', 'Sandro'
];

export const SURNAMES = [
  'García', 'Silva', 'Mbappé', 'Haaland', 'Bellingham', 'Saka', 'Junior', 'Kubo', 'Salah', 'Eto\'o',
  'Buffon', 'Bastoni', 'Müller', 'Schmidt', 'Modrić', 'De Bruyne', 'Fernandes', 'Ronaldo', 'Messi', 'Griezmann',
  'Lewandowski', 'Kane', 'Benzema', 'Ibrahimović', 'Rashford', 'Foden', 'Grealish', 'Rice', 'Rodri', 'Gavi',
  'Pedri', 'Hernández', 'Casillas', 'Puyol', 'González', 'Beckham', 'Suárez', 'Di María', 'Fernández', 'Álvarez',
  'Mac Allister', 'Núñez', 'Valverde', 'Giménez', 'Almirón', 'Cancelo', 'Dias', 'Jota', 'Leão', 'Dembélé',
  'Coman', 'Upamecano', 'Saliba', 'Konaté', 'Maignan', 'Pavard', 'Koundé', 'Camavinga', 'Tchouaméni', 'Nkunku',
  'Diaby', 'Fofana', 'Kamara', 'Bounou', 'Hakimi', 'Ziyech', 'Amrabat', 'Ounahi', 'Amallah', 'En-Nesyri',
  'Mané', 'Koulibaly', 'Mendy', 'Gueye', 'Kouyaté', 'Dia', 'Sarr', 'Pépé', 'Zaha', 'Haller',
  'Osimhen', 'Iheanacho', 'Ndidi', 'Iwobi', 'Aribo', 'Mahrez', 'Benrahma', 'Bennacer', 'Bennacer', 'Bensebaini', 'Partey',
  'Kudus', 'Ayew', 'Williams', 'Lamptey', 'Samed', 'Sulemana', 'Nuamah', 'Davies', 'David', 'Larin',
  'Buchanan', 'Eustaquio', 'Škriniar', 'Vlahović', 'Kostić', 'Milinković-Savić', 'Mitrović', 'Gudelj', 'Oblak', 'Gvardiol',
  'Brozović', 'Kovačić', 'Perišić', 'Kramarić', 'Pulišić', 'Zielinski', 'Milik', 'Cash', 'Zalewski', 'Szymański',
  'Kiwior', 'Szoboszlai', 'Orbán', 'Gulácsi', 'Ádám', 'Varga', 'Sallai', 'Schick', 'Souček', 'Coufal',
  'Hložek', 'Doku', 'Trossard', 'Onana', 'Lukaku', 'Tielemans', 'Lukebakio', 'Castagne', 'Theate', 'Bakayoko',
  'De Ketelaere', 'Vranckx', 'Mangala', 'Sels', 'Rossi', 'Mancini', 'Ricci', 'Colombo', 'Esposito', 'Riva'
];

export const GOAL_COMMS = ["¡GOOOOOOOOOOL!", "¡GOL! El balón besa las mallas.", "¡A LA CAZUELA!", "¡DIRECTO AL ÁNGULO!"];
