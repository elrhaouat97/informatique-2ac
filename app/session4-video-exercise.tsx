"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Expand, ExternalLink, Film, Minimize, Pause, Play, RotateCcw, VolumeX } from "lucide-react";
import { publicAsset } from "../lib/public-assets";
import { Session3Text as Text } from "./session3-translation";
import { s4t as t, type Session4VideoActivity } from "./session4-data";
import type { Session4Draft } from "./session4-model";
import { session4U2Url } from "./session4-video-data";
import { confirmedVideoQuestions, limitVideoPosition, pendingVideoQuestion, videoQuestionMarker } from "./session4-video-model";

const clock=(second:number)=>Math.floor(second/60)+":"+String(Math.floor(second)%60).padStart(2,"0");

export function Session4VideoExercise({activity,draft,onChange}:{
  activity:Session4VideoActivity;
  draft:Session4Draft;
  onChange:(patch:Partial<Session4Draft>)=>void;
}){
  const {video}=activity;
  const container=useRef<HTMLElement>(null);
  const player=useRef<HTMLVideoElement>(null);
  const savedPosition=useRef(draft.videoPosition??0);
  const heading=useRef<HTMLHeadingElement>(null);
  const confirmed=confirmedVideoQuestions(video,draft);
  const pending=pendingVideoQuestion(video,draft);
  const initialPosition=limitVideoPosition(video,draft,draft.videoPosition??0);
  const [position,setPosition]=useState(initialPosition);
  const [duration,setDuration]=useState(0);
  const [playing,setPlaying]=useState(false);
  const [unavailable,setUnavailable]=useState(false);
  const [expanded,setExpanded]=useState(false);
  const [nativeFullscreen,setNativeFullscreen]=useState(false);
  const [attempted,setAttempted]=useState(false);
  const [questionIndex,setQuestionIndex]=useState<number|null>(
    pending>=0&&initialPosition>=video.questions[pending].second?pending:null
  );
  const question=questionIndex===null?null:video.questions[questionIndex];
  const correct=questionIndex!==null&&confirmed[questionIndex];
  const [nominalMinutes,nominalSeconds]=video.duration.split(":").map(Number);
  const totalDuration=duration||nominalMinutes*60+nominalSeconds;

  useEffect(()=>{
    if(draft.videoPosition!==undefined)return;
    const markers=video.questions.filter((_,index)=>confirmed[index]).map(item=>videoQuestionMarker(item.id));
    onChange({videoPosition:0,checks:[...new Set([...draft.checks,...markers])]});
    // Migrate the answers saved before questions were embedded in the video.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[activity.id]);

  useEffect(()=>{
    if(questionIndex!==null)heading.current?.focus({preventScroll:true});
  },[questionIndex]);

  useEffect(()=>{
    if(!expanded)return;
    const close=(event:KeyboardEvent)=>{if(event.key==="Escape"&&!document.fullscreenElement)setExpanded(false);};
    window.addEventListener("keydown",close);
    return()=>window.removeEventListener("keydown",close);
  },[expanded]);

  useEffect(()=>{
    const sync=()=>{const active=document.fullscreenElement===container.current;setNativeFullscreen(active);setExpanded(active);};
    document.addEventListener("fullscreenchange",sync);
    return()=>document.removeEventListener("fullscreenchange",sync);
  },[]);

  async function toggleFullscreen(){
    const section=container.current;
    if(!section)return;
    if(document.fullscreenElement===section){
      await document.exitFullscreen();
      return;
    }
    if(expanded){setExpanded(false);return;}
    if(section.requestFullscreen){
      try{await section.requestFullscreen();return;}catch{/* Keep questions accessible when fullscreen is unavailable. */}
    }
    setExpanded(true);
  }

  function savePosition(second:number){
    const next=Math.max(0,Math.floor(second*10)/10);
    setPosition(next);
    if(Math.abs(savedPosition.current-next)<0.5)return;
    savedPosition.current=next;
    onChange({videoPosition:next});
  }

  function showQuestion(index:number){
    const clip=player.current;
    const second=video.questions[index].second;
    if(clip){
      if(Math.abs(clip.currentTime-second)>0.01)clip.currentTime=second;
      clip.pause();
    }
    setPlaying(false);
    setAttempted(false);
    setQuestionIndex(index);
    savePosition(second);
  }

  function capture(){
    const clip=player.current;
    if(!clip)return;
    if(pending>=0&&clip.currentTime>=video.questions[pending].second-0.08){
      showQuestion(pending);
      return;
    }
    savePosition(clip.currentTime);
  }

  function play(){
    const clip=player.current;
    if(!clip||questionIndex!==null)return;
    clip.muted=true;
    clip.volume=0;
    void clip.play().catch(error=>{if(error.name!=="AbortError")setUnavailable(true);});
  }

  function seek(second:number){
    const clip=player.current;
    if(!clip)return;
    const target=limitVideoPosition(video,draft,second);
    if(pending>=0&&target>=video.questions[pending].second){
      showQuestion(pending);
      return;
    }
    clip.currentTime=target;
    setQuestionIndex(null);
    savePosition(target);
  }

  function validate(){
    if(!question)return;
    setAttempted(true);
    if(draft.selections[question.id]!==question.answer)return;
    onChange({checks:[...new Set([...draft.checks,videoQuestionMarker(question.id)])],videoPosition:question.second});
  }

  function continueVideo(){
    const clip=player.current;
    if(!clip)return;
    if(pending>=0&&video.questions[pending].second<=clip.currentTime+0.15){
      showQuestion(pending);
      return;
    }
    setQuestionIndex(null);
    setAttempted(false);
    if(Number.isFinite(clip.duration)&&clip.currentTime>=clip.duration-0.1)return;
    void clip.play().catch(error=>{if(error.name!=="AbortError")setUnavailable(true);});
  }

  function replayGesture(){
    if(!question||!player.current)return;
    const second=Math.max(0,question.second-6);
    player.current.currentTime=second;
    setQuestionIndex(null);
    setAttempted(false);
    savePosition(second);
    void player.current.play().catch(error=>{if(error.name!=="AbortError")setUnavailable(true);});
  }

  return <section ref={container} className={`s4-interactive-video ${expanded?"expanded":""}`} data-display={nativeFullscreen?"fullscreen":expanded?"expanded":"embedded"} aria-label="Vidéo avec questions intégrées">
    <header>
      <span><Film size={18} aria-hidden="true"/><Text value={t("Observe, réponds, puis continue","شاهد وأجب ثم تابع")}/></span>
      <button type="button" aria-expanded={expanded} onClick={()=>void toggleFullscreen()}>
        {expanded?<Minimize size={17}/>:<Expand size={17}/>}
        <Text value={expanded?t("Quitter le plein écran","مغادرة ملء الشاشة"):t("Plein écran","ملء الشاشة")}/>
      </button>
    </header>
    <div className="s4-video-viewport">
      <video ref={player} src={session4U2Url+video.file} muted playsInline preload="none" disablePictureInPicture
        poster={publicAsset(`session4/videos/${activity.label}.webp`)} aria-label={video.title.fr}
        onLoadedMetadata={event=>{
          const clip=event.currentTarget;
          clip.muted=true;clip.volume=0;
          setDuration(clip.duration);
          clip.currentTime=limitVideoPosition(video,draft,draft.videoPosition??0);
        }}
        onVolumeChange={event=>{
          const clip=event.currentTarget;
          if(!clip.muted)clip.muted=true;
          if(clip.volume!==0)clip.volume=0;
        }}
        onTimeUpdate={capture}
        onSeeking={capture}
        onPause={()=>{setPlaying(false);if(player.current)savePosition(player.current.currentTime);}}
        onPlay={()=>setPlaying(true)}
        onPlaying={()=>setUnavailable(false)}
        onEnded={()=>{setPlaying(false);capture();}}
        onError={()=>setUnavailable(true)}/>
      {question?<div className="s4-video-question-overlay">
        <div className="s4-video-question-card">
          <span className="s4-video-pause-label"><Pause size={15}/><Text value={t(`Question ${questionIndex!+1} / ${video.questions.length}`,`السؤال ${questionIndex!+1} / ${video.questions.length}`)}/></span>
          <h3 ref={heading} tabIndex={-1}><Text value={question.prompt}/></h3>
          <div className="s4-video-choices" role="group" aria-label={question.prompt.fr}>
            {question.choices.map(choice=><button type="button" key={choice.id}
              aria-pressed={draft.selections[question.id]===choice.id}
              onClick={()=>{
                setAttempted(false);
                onChange({selections:{...draft.selections,[question.id]:choice.id},
                  checks:draft.checks.filter(id=>id!==videoQuestionMarker(question.id))});
              }}><Text value={choice.label}/></button>)}
          </div>
          {correct?<p className="s4-video-answer-feedback good" role="status"><CheckCircle2 size={18}/><Text value={question.explanation}/></p>
            :attempted&&<p className="s4-video-answer-feedback" role="status"><Text value={t("Revois le geste et essaie de nouveau.","أعد مشاهدة العملية ثم حاول من جديد.")}/></p>}
          <div className="s4-video-question-actions">
            <button type="button" onClick={replayGesture}><RotateCcw size={16}/><Text value={t("Revoir le geste","إعادة مشاهدة العملية")}/></button>
            {correct?<button type="button" className="s4-primary" onClick={continueVideo}><Play size={17}/><Text value={t("Continuer la vidéo","متابعة الفيديو")}/></button>
              :<button type="button" className="s4-primary" disabled={!draft.selections[question.id]} onClick={validate}><Text value={t("Valider ma réponse","تأكيد جوابي")}/></button>}
          </div>
        </div>
      </div>:!playing&&<button type="button" className="s4-video-big-play" onClick={play} disabled={unavailable}>
        <Play size={34}/><Text value={t("Lire la vidéo","تشغيل الفيديو")}/>
      </button>}
    </div>
    <div className="s4-video-controls">
      <button type="button" disabled={questionIndex!==null||unavailable} aria-label={playing?"Mettre la vidéo en pause":"Lire la vidéo"} onClick={()=>{if(playing)player.current?.pause();else play();}}>
        {playing?<Pause size={19}/>:<Play size={19}/>}
      </button>
      <span className="s4-video-clock">{clock(position)} / {duration?clock(duration):video.duration}</span>
      <input type="range" min={0} max={totalDuration} step={0.1} value={Math.min(position,totalDuration)}
        disabled={!duration||questionIndex!==null} aria-label="Position dans la vidéo"
        onChange={event=>seek(Number(event.target.value))}/>
      <span className="s4-video-muted"><VolumeX size={18}/><Text value={t("Sans son","بدون صوت")}/></span>
    </div>
    <nav className="s4-video-checkpoints" aria-label="Questions de la vidéo">
      {video.questions.map((item,index)=><button type="button" key={item.id}
        disabled={(pending>=0&&index>pending)||(!confirmed[index]&&position<item.second-0.1)} aria-current={questionIndex===index?"step":undefined}
        data-done={confirmed[index]} onClick={()=>showQuestion(index)}>
        {confirmed[index]&&<CheckCircle2 size={15}/>}
        <Text value={t(`Question ${index+1}`,`السؤال ${index+1}`)}/><small>{clock(item.second)}</small>
      </button>)}
    </nav>
    {unavailable&&<p className="s4-video-unavailable" role="status"><Text value={t("Le chargement a échoué. Vérifie la connexion et réessaie.","فشل التحميل. تحقق من الاتصال ثم أعد المحاولة.")}/><button type="button" onClick={()=>{setUnavailable(false);player.current?.load();}}><Text value={t("Réessayer","إعادة المحاولة")}/></button></p>}
    <footer className="s4-video-links">
      <a href={session4U2Url+"s"+video.source} target="_blank" rel="noreferrer"><ExternalLink size={14}/><Text value={t("Support de la vidéo","مصدر الفيديو")}/></a>
      <span><Text value={t(`${confirmed.filter(Boolean).length} / ${video.questions.length} questions validées`,`تم تأكيد ${confirmed.filter(Boolean).length} من أصل ${video.questions.length} أسئلة`)}/></span>
    </footer>
  </section>;
}
