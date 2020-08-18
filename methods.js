
// ------------------------------------------------------------
// SETUP

// Read methods

var questions=[];
var answers=[];
var nmethods=methodTable.length;
var representedworks=new Set();
for (var i = 0; i < nmethods; i++) {
  var methodworks=methodTable[i].split('/');
  var s=[];
  for (var j=1; j<methodworks.length; j++) {
    s.push(methodworks[j]);
    representedworks.add(methodworks[j]);
  }
  questions.push(methodworks[0])
  answers.push(s);
}

// Read works and populate table

p=document.getElementById('pause');
p.addEventListener('touchstart',function(ev){ev.preventDefault(); pausemousedown()},{passive:false});

var worksrow=document.getElementById('works');
var works=[];
for (var i = 0; i < workTable.length; i++) {
  var newcell=worksrow.insertCell();
  var coltable=document.createElement('table');
  coltable.className='col';
  newcell.appendChild(coltable);

  for (var j=0; j<workTable[i].length; j++) {
    data=workTable[i][j].split('/');
    var c=coltable.insertRow().insertCell();
    setupworkcell(c,data[0],data[1]);
  }
  nworks=works.length;
};

function setupworkcell(c,id,name){
  c.id=id;
  c.innerHTML=name; 
  if (includeAll || representedworks.has(id)) {
    works.push(id);
    c.className='normal';
    c.addEventListener('mousedown',function(ev){workmousedown(ev,this)});
    c.addEventListener('mouseup',function(ev){workmouseup(ev,this)});
    c.addEventListener('touchstart',function(ev){workmousedown(ev,this)},{passive:false});
    c.addEventListener('touchend',function(ev){workmouseup(ev,this)},{passive:false});
  } else {
    c.className='grayed'; 
  }
}

// Set up global variables and initial weights

var method,answer,selected,togo,errors,starttime,elapsed,paused,pausestarted;

var wt=[];
for (var i = 0; i < nmethods; i++) {
  wt[i]=initialweight;
}

// Start

paused=false;
startturn();

// -------------------------------------------
// EVENTS

function pausemousedown(){
  if(paused) {
    starttime+=(new Date()).getTime()-pausestarted;
    paused=false;
  } else {
    pausestarted=(new Date()).getTime();
    paused=true;
  }
  togglepauseeffects();
}

function workmousedown(ev,elt){
  if (!paused) {  
    ev.preventDefault();
    if (!selected.has(elt.id)) {
      if (answer.has(elt.id)) {
        elt.className='right';
        togo-=1;
      } else {
        elt.className='wrong';
        errors+=1;
      }
      selected.add(elt.id);
    }
  }
};

function workmouseup(ev,elt){
  if (!paused) { 
    ev.preventDefault();
    if (togo<=0) {
        endturn();
        startturn();
    }
  }
};

// -------------------------------------------
// OTHER FUNCTIONS

function randmethod(last){
  var tot=0;
  for (var i = 0; i < nmethods; i++) {
    tot+=(i==last ? 0 : wt[i]);
  }
  var r=tot*Math.random();
  for (var i = 0; i < nmethods; i++) {
    r-=(i==last ? 0 : wt[i]);
    if (r<=0) {
      return i;
    }
  }
}

function updateweight(w,elapsed,errors){
  return Math.min(initialweight,inertia*w+(1-inertia)*(elapsed+penalty*errors));
}

function startturn(){
  method=randmethod(method);
  document.getElementById('method').innerHTML=questions[method];
  answer=new Set(answers[method]);
  selected=new Set();
  togo=answer.size;
  errors=0;
  for (var i = 0; i < nworks; i++) {
    document.getElementById(works[i]).className='normal';
  }
  starttime=(new Date()).getTime();
}

function endturn(){
  elapsed=((new Date()).getTime()-starttime)/1000;
  wt[method]=updateweight(wt[method],elapsed,errors)  
  document.getElementById('percentage').innerHTML=percent().toFixed(1)+'%';  
  console.log(wt);
}

function percent(){
  var tot=0;
  for (var i = 0; i < nmethods; i++) {
    tot+=wt[i];
  }
  return 100*(1-Math.pow(tot/nmethods/initialweight,progressstretch))
}

function togglepauseeffects(){
    var p=document.getElementById('pause');
    if (paused) {
        p.className='pausepressed'
    } else {
        p.className='normal'
    };
    for (var i = 0; i < nworks; i++) {
        if (!selected.has(works[i])) {
            if (paused) {
                document.getElementById(works[i]).className='frozen';
            } else {
                document.getElementById(works[i]).className='normal';
            }
            
        }
    }
}
