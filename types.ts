// client/types.ts

export interface RosterFighter {
  id: string;
  'FIRST': string;
  'LAST': string;  
  'GYM': string;
  GENDER: string;
  WEIGHTCLASS: number;
  AGE: number;
  RANK: number;
  'DOB': string;
}

export interface WeighinFighter{
  id: string;
  WEIGHT: number;
  'FIRST': string;
  'LAST': string;  
  'GYM': string;
  GENDER: string;
  'WEIGHTCLASS': number;
  AGE: number;
  'DOB': string;
}
   
  export interface Bout {
    Fighter1: WeighinFighter;
    Fighter2: WeighinFighter;
  }

export interface EventDetails {
  'Event Name': string;
  'Venue Name': string;
  'Venue location': string;
  'Day Before Weigh ins': string;
  'Day Before Weight Location': string;
  'Weigh ins info': string;
  'Competition Date': string;
  'Doors Open': string;
  'Rules Meeting': string;
  'Bouts Start': string;
  'Number Mats': string;
}