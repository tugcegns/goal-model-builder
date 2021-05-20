import React, {useState} from 'react';
import { Button } from "react-bootstrap";

// Code borrowed from https://github.com/codingWithElias/react-stopwatch

function BtnComponent(props) {
    return (
      <div>
        {(props.status === 0)? 
          <Button onClick={props.start}>Start</Button> : ""
        }
  
        {(props.status === 1)? 
          <div>
            <Button onClick={props.stop}>Stop</Button>
            <Button onClick={props.reset}>Reset</Button>
          </div> : ""
        }
  
       {(props.status === 2)? 
          <div>
            <Button onClick={props.resume}>Resume</Button>
            <Button onClick={props.reset}>Reset</Button>
          </div> : ""
        }
       
      </div>
    );
  }

  function DisplayComponent(props) {
    const h = () => {
       if(props.time.h === 0){
         return '';
       }else {
         return <span>{(props.time.h >= 10)? props.time.h : "0"+ props.time.h}</span>;
       }
    }
    return (
      <div>
         {h()}&nbsp;&nbsp;
         <span>{(props.time.m >= 10)? props.time.m : "0"+ props.time.m}</span>&nbsp;:&nbsp;
         <span>{(props.time.s >= 10)? props.time.s : "0"+ props.time.s}</span>&nbsp;:&nbsp;
         <span>{(props.time.ms >= 10)? props.time.ms : "0"+ props.time.ms}</span>
      </div>
    );
  }

function Chronometer () {
  const [time, setTime] = useState({ms:0, s:0, m:0, h:0});
  const [interv, setInterv] = useState();
  const [status, setStatus] = useState(0);
  // Not started = 0
  // started = 1
  // stopped = 2

  const start = () => {
    run();
    setStatus(1);
    setInterv(setInterval(run, 500));
  };

  var updatedMs = time.ms, updatedS = time.s, updatedM = time.m, updatedH = time.h;

  const run = () => {
    updatedMs+=50;
    if(updatedM === 60){
      updatedH++;
      updatedM = 0;
    }
    if(updatedS === 60){
      updatedM++;
      updatedS = 0;
    }
    if(updatedMs === 100){
      updatedS++;
      updatedMs = 0;
    }
    return setTime({ms:updatedMs, s:updatedS, m:updatedM, h:updatedH});
  };

  const stop = () => {
    clearInterval(interv);
    setStatus(2);
  };

  const reset = () => {
    clearInterval(interv);
    setStatus(0);
    setTime({ms:0, s:0, m:0, h:0})
  };

  const resume = () => start();


  return (
    <div className="main-section">
     <div className="clock-holder">
          <div className="stopwatch">
               <DisplayComponent time={time}/>
               <BtnComponent status={status} resume={resume} reset={reset} stop={stop} start={start}/>
          </div>
     </div>
    </div>
  );
}

export default Chronometer;