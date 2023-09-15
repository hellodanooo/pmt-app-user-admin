// client/types.ts

export interface RosterFighter {
  id: number;
  first_name: string;
  last_name: string;  
  gym: string;
  gender: string;
  weight: number;
  date_of_birth: string;
}


   
  export interface Bout {
    Fighter1: RosterFighter;
    Fighter2: RosterFighter;
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