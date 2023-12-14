// client/types.ts

import firebase from 'firebase/app';
import 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';


export interface RosterFighter {
  pmt_id: string;
  first: string;
  last: string;  
  gym: string;
  gender: string;
  weight: number;
  dob: string;
  weightclass: number;
  email: string;
  id?: string;
  win: number;
  loss: number;
  total: number;
  phone: string;
  coachesphone: string;

}

export interface FighterProfile  {
  first: string;
  last: string;
  gym: string;
  dob: string;
  gender: string;
  win: number;
  loss: number;
  dq: number;
  ex: number;
  weightclass: number;
  pmt_id: string;
  email: string;
  pmt_rank: number;
  age: number;
  total: number;
  } 

export interface WeighinFighter {
  pmt_id: string;
  first: string;
  last: string;  
  gym: string;
  gender: string;
  weight: number;
  weightclass: number;
  win: number;
  loss: number;
  age: number;
  id?: string; 
  dob: string;
}

export interface Event {
  'event_name': string;
  'venue_name': string;
  'Venue_location': string;
  'Day Before Weigh ins': string;
  'Day Before Weight Location': string;
  'Weigh ins info': string;
  'Competition Date': Timestamp | string;
  'Doors Open': string;
  'Rules Meeting': string;
  'Bouts Start': string;
  'Number Mats': string;
  address: string;
  id: string;
}


export interface ResultBout {
  fighter1: ResultsFighter;
  fighter2: ResultsFighter;
  [key: string]: any;
  boutid?: string;
}

    export interface ResultsFighter  {
      result: string;
      first: string;
      last: string;
      gym: string;
      gender: string;
      weightclass: number;
      dob: string;
      pmt_id: string;
      event: string;
      mat: string;
      match_type: string;
      weighin: number
      docId?: string;
      opponent_id?: string;
      bout_num?: number;
      age: number;
      id?: string; 
      win: number;
      loss: number;
      eventId?: string; 
      boutid?: string;
      fighterNumber?: '1' | '2'; 
      email?: string;

    }

    export interface FighterProfile  {
      first: string;
      last: string;
      gym: string;
      dob: string;
      gender: string;
      win: number;
      loss: number;
      dq: number;
      ex: number;
      weightclass: number;
      pmt_id: string;
      email: string;
      pmt_rank: number;
      age: number;
      total: number;
      } 

      export interface Official {
        first: string;
        last: string;  
        position: string;
        email: string;
        phone: string;
        id?: string; 
        city: string;
        state: string;
        payment: string;
        photo: string;
      }

export interface GymProfile {
  gym: string;
  win: number;
  loss: number;
  logo: string;
  webpage: string;
  address: string;
  city: string;
  state: string;
  id?: string;
  boysWin: number;
  boysLoss: number;
  girlsWin: number;
  girlsLoss: number;
  menWin: number;
  menLoss: number;
  womanWin: number;
  womanLoss: number;
  total: number;
}