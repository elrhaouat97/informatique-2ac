import type { Session4Draft } from "./session4-model.ts";
import type { Session4Video } from "./session4-video-data.ts";

export const videoQuestionMarker=(id:string)=>"video-"+id;

export function confirmedVideoQuestions(video:Session4Video,draft:Session4Draft){
 return video.questions.map(question=>
  draft.selections[question.id]===question.answer&&(
   draft.checks.includes(videoQuestionMarker(question.id))||draft.videoPosition===undefined
  ));
}

export function pendingVideoQuestion(video:Session4Video,draft:Session4Draft){
 return confirmedVideoQuestions(video,draft).findIndex(confirmed=>!confirmed);
}

export function limitVideoPosition(video:Session4Video,draft:Session4Draft,requested:number){
 const next=pendingVideoQuestion(video,draft);
 const position=Number.isFinite(requested)?Math.max(0,requested):0;
 return next<0?position:Math.min(position,video.questions[next].second);
}
