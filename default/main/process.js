(async function(){
  const {define} = require('utils')
  const {readFolder,readFile} = require('filesystem')
  const {dragElement,taskbar,getBackground,iconCache,section} = require('display')
  const {permissionList,permissionManage,make_permissions,enforcePermissions} = require('sandbox')
  const processes={__proto__:null} //each process has {path,name,author,permissions,startTime}
  Object.defineProperty(processes,'length',{writable:true,configurable:false,value:0,enumerable:false})
  function invalidID(id){
    return Number(id).toString()!==id.toString() || id<Number.MIN_SAFE_INTEGER || id>Number.MAX_SAFE_INTEGER
  }
  function processWrapper(ID,NAME,BACKGROUND,src){ //returns DOM element that u will put a process in
    let x=null, y=null, posX=null, posY=null, min=true, max=false, s=-1;
    let ELEM=document.createElement('div')
    let processHead=document.createElement('div')
    let bold=document.createElement('b')
    let buttons=document.createElement('span')
    let close=document.createElement('button') //first button
    let maximise=document.createElement('button') //second button
    let unMaximise=document.createElement('button') //third button
    let processBody=document.createElement('iframe')

    let elements={ELEM,processHead,buttons,unMaximise,maximise,close,processBody}
    Object.keys(elements).forEach(name=> elements[name].classList.add(name) )
    unMaximise.classList.add('a_button')
    maximise.classList.add('a_button')
    close.classList.add('a_button')

    let icon = document.createElement('img')
    icon.src = BACKGROUND
    ELEM.append(processHead,processBody)
    processHead.append(icon,bold,buttons)
    buttons.append(unMaximise,maximise,close) //more would come

    bold.innerText=NAME
    close.onmousedown=function(){ killProcess(ID) }
    close.innerHTML='x';
    close.title='Close'
    maximise.onmousedown=function(){
      if(max) return null;
      (max=true, min=false);
      x=ELEM.offsetHeight;
      y=ELEM.offsetWidth;
      posX=ELEM.offsetTop;
      posY=ELEM.offsetLeft;
      s=setInterval(_=>{
        ELEM.style.top='0px';
        ELEM.style.left='0px';
        ELEM.style.height=section.offsetHeight;
        ELEM.style.width=section.offsetWidth;
      },50)
    }
    maximise.innerHTML='+';
    maximise.title='Maximize'
    unMaximise.innerHTML='-';
    unMaximise.title='Minimize'
    unMaximise.onmousedown=function(){
      if(min) return null;
      (min=true, max=false);
      clearInterval(s);
      ELEM.style.top=posX+'px';
      ELEM.style.left=posY+'px';
      ELEM.style.height=x+'px';
      ELEM.style.width=y+'px';
    }
    processBody.src=src
    document.getElementById('content').appendChild(ELEM)
    dragElement(ELEM,processHead)
    return ELEM
  }
  async function spawnProcess(path,arg=""){ //returns ID if successful
    let folder=readFolder(path)
    if(typeof folder!=="object") throw 'must give folder of program';
    if(!folder['index.html'] || !folder['manifest.json'])
      throw 'given folder is not a program since a program needs "index.html" and "manifest.json"';
    let manifest=JSON.parse(readFile(path+'/manifest.json')), src=SRC(path+'/index.html')
    if(["name","author"].some(key=> typeof manifest[key]!=="string"||manifest[key].length<1 ))
      throw 'in "manifest.json", there must be non-empty STRINGS of "name" and "author"';
    if(!(manifest.permissions instanceof Array)  ||  manifest.permissions.some(perm=> !permissionList[perm] ))
      throw '"manifest.json" should only include actual permissions.. the list is:\n'+Object.keys(permissionList);
    let background=getBackground(path)
    if(background===null)
      throw "given folder is not a program since it doesn't have a 'background' image";

    if(!CORE.perms[manifest.name]) await permissionManage(manifest);
    taskbar(path);
    iconCache[path].classList.add('opened')
    //iconCache[path].style="background-color: lightblue;";
    let ID=processes.length++, ELEM=processWrapper(ID,manifest.name,background), controls={__proto__:null};

    processes[ID]={
      path,
      name:manifest.name,
      author:manifest.author,
      permissions: {...CORE.perms[manifest.name]},
      startTime: Date.now()
    }
    Object.defineProperty(processes[ID],'APP',{enumerable:false,value:ELEM})
    
    return ID
  }
  function killProcess(id){
    if(invalidID(id)) return false; //process "id" MUST represent a proper number
    if(typeof processes[id]==="undefined") return false; //process does NOT exist
    let process=processes[id]
    process.APP.remove()
    delete processes[id];
    processes.length--;
    if(processes.length===0 || Object.keys(processes).every(ID=>processes[ID].path!==process.path)){
      if(!CORE.desktop.pinned.includes( process.path )){
        iconCache[process.path].remove();
        delete iconCache[process.path];
      }
      else  iconCache[process.path].classList.remove('opened');
    }
    return true
  }
  function listProcesses(){
    return JSON.parse(  JSON.stringify(processes)  )
  }
  module.exports={processes,processWrapper,killProcess,listProcesses,spawnProcess,invalidID}
})()