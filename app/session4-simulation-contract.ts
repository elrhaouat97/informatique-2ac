export const session4SimulatorSteps={identity:2,ping:3,sharing:5,messenger:5,repair:4,assessment:3} as const;
export type Session4SimulatorMode=keyof typeof session4SimulatorSteps;
export type Session4SimulatorState={version:2;mode:Session4SimulatorMode;checks:boolean[];completed:boolean;snapshot:Record<string,unknown>;evidence:Record<string,unknown>};
export function isSession4SimulatorState(value:unknown,mode:Session4SimulatorMode):value is Session4SimulatorState{
 const v=value as Session4SimulatorState|null;
 return Boolean(v&&v.version===2&&v.mode===mode&&Array.isArray(v.checks)&&v.checks.length===session4SimulatorSteps[mode]&&v.checks.every(x=>typeof x==='boolean')&&typeof v.completed==='boolean'&&v.completed===v.checks.every(Boolean)&&v.snapshot&&typeof v.snapshot==='object'&&v.evidence&&typeof v.evidence==='object');
}
export function session4SimulatorPassed(value:unknown,mode:Session4SimulatorMode){return isSession4SimulatorState(value,mode)&&value.completed;}
