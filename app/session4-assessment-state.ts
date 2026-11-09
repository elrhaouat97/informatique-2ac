import {freshSession4Draft,type Session4Draft} from "./session4-model.ts";
import {isSession4SimulatorState,type Session4SimulatorState} from "./session4-simulation-contract.ts";
import {validSession4Choices} from "../supabase/functions/informatique-2ac-api/session4-evaluation.ts";
import {validSession4AppliedAnswers} from "../supabase/functions/informatique-2ac-api/session4-applied-evaluation.ts";

type PreviousQuiz={version:1;index:number;choices:Record<string,number>;submitted:boolean};
export type Session4AppliedState={version:3;shuffleRound:number;part:number;answers:Record<string,number>;network:Session4Draft;terminal:Session4Draft;simulator:Session4SimulatorState|null;submitted:boolean;previousQuiz?:PreviousQuiz};
export function isPreviousSession4Quiz(value:unknown):value is PreviousQuiz{
 const s=value as PreviousQuiz|null;
 return !!s&&s.version===1&&Number.isInteger(s.index)&&typeof s.submitted==="boolean"&&validSession4Choices(s.choices);
}
export function initialSession4Applied(previous?:unknown):Session4AppliedState{
 return {version:3,shuffleRound:1,part:0,answers:{},network:freshSession4Draft(),terminal:freshSession4Draft(),simulator:null,submitted:false,
  ...(isPreviousSession4Quiz(previous)?{previousQuiz:previous}:{})};
}
function validDraft(value:unknown):value is Session4Draft{
 const d=value as Session4Draft|null;
 return !!d&&!!d.selections&&typeof d.selections==="object"&&!Array.isArray(d.selections)&&Object.values(d.selections).every(v=>typeof v==="string")
  &&Array.isArray(d.checks)&&d.checks.every(v=>typeof v==="string")&&Array.isArray(d.commands)&&d.commands.every(v=>typeof v==="string")
  &&typeof d.tested==="boolean"&&typeof d.output==="string"&&typeof d.command==="string"&&typeof d.ip==="string"&&typeof d.host==="string"
  &&(d.terminalHistory===undefined||Array.isArray(d.terminalHistory)&&d.terminalHistory.every(v=>typeof v==="string"));
}
export function validSession4AppliedState(value:unknown):value is Session4AppliedState{
 const s=value as Session4AppliedState|null;
 return !!s&&s.version===3&&Number.isInteger(s.shuffleRound)&&s.shuffleRound>=1&&Number.isInteger(s.part)&&s.part>=0&&s.part<4
  &&typeof s.submitted==="boolean"&&validSession4AppliedAnswers(s.answers)&&validDraft(s.network)&&validDraft(s.terminal)
  &&(s.simulator===null||isSession4SimulatorState(s.simulator,"assessment"))
  &&(s.previousQuiz===undefined||isPreviousSession4Quiz(s.previousQuiz));
}
