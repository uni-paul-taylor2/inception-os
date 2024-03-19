/*<div style="width:100%;height:100%;opacity:0;background-color:transparent;z-index:200;position:absolute;"></div>
const bc = new BroadcastChannel("test_channel");
bc.onmessage=console.warn
let html=new Blob(["<html><head><script>window.x=25;console.log('working...');(new BroadcastChannel('test_channel')).postMessage('hiii')</script></head></html>"],{type:"text/html"})
let iframe=document.createElement('iframe')
iframe.src=URL.createObjectURL(html)
document.body.appendChild(iframe)*/
/*onmessage=console.warn
let html=new Blob(["<html><head><script>window.x=25;console.log('working...');(window.parent).postMessage('hiii')</script></head></html>"],{type:"text/html"})
let iframe=document.createElement('iframe')
iframe.src=URL.createObjectURL(html)
document.body.appendChild(iframe)*/
(async()=>{ //so much code so u the marker can make ur own app on the browser OS and run it >:D
//there is A LOT MORE that can be implemented visually due to the existing functionality in this file
//process sandboxing is WEAK, no right click options, no settings bar, pin and unpin options
//unfortunately, also no setting files by extension to open with a chosen program
//however the FOUNDATION to build all of that exists already as you can see ;-;
if(window.LOADED) return null;
window.LOADED=true;
const version="1.0.0";
//delete localStorage.files; delete localStorage.core; //still testing so don't wanna cache yet

const clock = document.querySelector("#clock");
function displayTime() {

    // let date = new Date().toLocaleString('en-US', {
    //   hour12: false
    // });
    let day = new Date().toLocaleDateString()
    let time = new Date().toLocaleTimeString("en-US", { hour12: false })
    clock.innerHTML = day + " " + time;
}
displayTime()
setInterval(displayTime,1000);

//background image: https://wallpaper-mania.com/wp-content/uploads/2018/09/High_resolution_wallpaper_background_ID_77701347521.jpg
//background image: https://img.freepik.com/free-photo/abstract-design-background-smooth-flowing-lines_1048-14640.jpg
//window stuff begin
const mimeTypes={__proto__:null,"aac":"audio/aac","abw":"application/x-abiword","arc":"application/x-freearc","avif":"image/avif","avi":"video/x-msvideo","azw":"application/vnd.amazon.ebook","bin":"application/octet-stream","bmp":"image/bmp","bz":"application/x-bzip","bz2":"application/x-bzip2","cda":"application/x-cdf","csh":"application/x-csh","css":"text/css","csv":"text/csv","doc":"application/msword","docx":"application/vnd.openxmlformats-officedocument.wordprocessingml.document","eot":"application/vnd.ms-fontobject","epub":"application/epub+zip","gz":"application/gzip","gif":"image/gif","ico":"image/vnd.microsoft.icon","ics":"text/calendar","jar":"application/java-archive","js":"text/javascript","json":"application/json","jsonld":"application/ld+json","mjs":"text/javascript","mp3":"audio/mpeg","mp4":"video/mp4","mpeg":"video/mpeg","mpkg":"application/vnd.apple.installer+xml","odp":"application/vnd.oasis.opendocument.presentation","ods":"application/vnd.oasis.opendocument.spreadsheet","odt":"application/vnd.oasis.opendocument.text","oga":"audio/ogg","ogv":"video/ogg","ogx":"application/ogg","opus":"audio/opus","otf":"font/otf","png":"image/png","pdf":"application/pdf","php":"application/x-httpd-php","ppt":"application/vnd.ms-powerpoint","pptx":"application/vnd.openxmlformats-officedocument.presentationml.presentation","rar":"application/vnd.rar","rtf":"application/rtf","sh":"application/x-sh","svg":"image/svg+xml","tar":"application/x-tar","ts":"video/mp2t","ttf":"font/ttf","txt":"text/plain","vsd":"application/vnd.visio","wav":"audio/wav","weba":"audio/webm","webm":"video/webm","webp":"image/webp","woff":"font/woff","woff2":"font/woff2","xhtml":"application/xhtml+xml","xls":"application/vnd.ms-excel","xlsx":"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","xml":"application/xml","xul":"application/vnd.mozilla.xul+xml","zip":"application/zip","3gp":"video/3gpp","3g2":"video/3gpp2","7z":"application/x-7z-compressed","htm":"text/html","html":"text/html","jpeg":"image/jpeg","jpg":"image/jpeg","mid":"audio/midi","midi":"audio/midi","tif":"image/tiff","tiff":"image/tiff"}
//scraped from https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
function define(obj,key,data,type="value"){
  Object.defineProperty(obj,key,{configurable:false,writable:false,[type]:data})
}
function BTOA(txt){
  let str=btoa(txt), replace={__proto__:null,'+':'-', '/':'_'}
  return str.split('').filter(a=>a!=='=')
  .map(a=>replace[a]||a).join('')
}
let ab_map=[], str_map={__proto__:null}
for(let i=0;i<256;i++){
  ab_map.push(String.fromCharCode(i));
  str_map[ab_map[i]]=i;
}
function str2ab(str) {
  let buf=new ArrayBuffer(str.length), bufView=new Uint8Array(buf);
  for (let i=0;i<str.length;i++) bufView[i]=str_map[str[i]];
  return buf;
}
function ab2str(buf) {
  let arr=new Uint8Array(buf), chars="";
  for(let i=0;i<arr.length;i++) chars+=ab_map[arr[i]];
  return chars;
}
function getBackground(path){
  let folder=readFolder(path)
  let background=null, backgrounds=Object.keys(mimeTypes)
    .filter(m=>mimeTypes[m].includes('image'))
    .map(a=>`background.${a}`)
  backgrounds.forEach(bg=>{
    if(folder[bg]) (console.log(path+bg),background=window.SRC(path+bg));
  })
  return background
}
function taskbar(path){
  if(iconCache[path]) return null;
  if(path.at(-1)!=='/') path+='/'; //have / at the end by force
  let elem=document.createElement('div')
  let background=getBackground(path)
  elem.id=BTOA(path)
  style.innerHTML+=`#${BTOA(path)}{background-image: url("${background}");\n`
  elem.classList.add('pinned')
  elem.onclick=function(){ spawnProcess(path) }
  elem.title=path.split('/').at(-2)
  iconCache[path]=elem
  foot.appendChild(elem)
}
if(localStorage.version!==version){
  let css=await(await fetch(location.origin+'/style.css')).text()
  let desktop=await(await fetch(location.origin+'/desktop.json')).json()
  let perms=await(await fetch(location.origin+'/perms.json')).json()
  localStorage.core=JSON.stringify({desktop,css,perms})
  localStorage.files=await(await fetch(location.origin+'/applications')).text()
  localStorage.version=version;
}
const FILES=JSON.parse(localStorage.files), CORE=JSON.parse(localStorage.core), iconCache={__proto__:null}
//setInterval(_=>{ delete localStorage.files; delete localStorage.core; },50) //still testing so don't wanna cache yet
function factoryReset(){ //well we know what this does >:D
  localStorage.clear();
  location.reload();
}
define(window,'SRC',function(path){
  let data=readFile(path), ext=path.split('.').at(-1).toLowerCase()
  let url=URL.createObjectURL(new Blob([str2ab(data)],{type:mimeTypes[ext]||'text/plain'}))
  setTimeout(_=>URL.revokeObjectURL(url),5e3)
  return url
})
let section=document.getElementById('content'), Z=1, front=null;
let {css}=CORE, {background}=CORE.desktop, style=document.createElement('style')
css=css.split('\\\\').join(background.file?SRC(background.src):background.src)
style.innerHTML=css
//setTimeout(_=>{ //useless setTimeout since script defer tag is used
  let {pinned}=CORE.desktop, foot=document.getElementById('foot')
  document.head.appendChild(style)
  pinned.forEach(app=> taskbar(app) )
//})
function dragElement(elmnt,head,FRAME) { //adapted from https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_draggable
  let div=document.createElement('div');
  div.style="display:none;width:100%;height:100%;opacity:0;background-color:transparent;z-index:200;position:absolute;";
  elmnt.prepend(div);
  setTimeout(_=> (elmnt.style.zIndex=++Z,front=elmnt) ,1)
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0, dragging = false;
  div.onmousedown = dragMouseDown;
  head.onmousedown = dragMouseDown;
  elmnt.onmousedown=function(){ (elmnt.style.zIndex=++Z,front=elmnt) }
  //FRAME.document.addEventListener('click',elmnt.onclick)
  //setTimeout(_=> FRAME.document.onclick=elmnt.onclick ,1)
  setInterval(function(){
    div.style.display=!dragging&&(front===elmnt)?"none":"initial";
  },50)
  function dragMouseDown(e) {
    front = elmnt;
    dragging = true;
    e ||= window.event;
    e.preventDefault();
    //elmnt.style.zIndex=++Z;
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    div.style.display="initial";
    //div.onmouseup = closeDragElement; //document
    //div.onmouseleave = closeDragElement;
    section.onmouseup = closeDragElement; //document
    section.onmouseleave = closeDragElement; //document
    section.onmousemove = elementDrag; //document
    //div.onmouseup = closeDragElement;
    //div.onmousemove = elementDrag;
    // call a function whenever the cursor moves:
    //div.onmousemove = elementDrag; //document
    //FRAME.document.onmousemove = elementDragInside;
  }

  function elementDrag(e) {
    e ||= window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    let X,Y; //(<=/>=), (+/-)1 ... NOW it's (</>), (+/-)0
    if(elmnt.offsetTop<section.offsetTop) X=section.offsetTop;
    else if(elmnt.offsetTop>(section.offsetTop+section.offsetHeight)-head.offsetHeight)
      X=((section.offsetTop+section.offsetHeight)-head.offsetHeight);
    else X=elmnt.offsetTop - pos2;
    if(elmnt.offsetLeft<section.offsetLeft) Y=section.offsetLeft;
    else if(elmnt.offsetLeft>(section.offsetLeft+section.offsetWidth)-head.offsetWidth)
      Y=((section.offsetLeft+section.offsetWidth)-head.offsetWidth);
    else Y=elmnt.offsetLeft - pos1;
    elmnt.style.top=X+'px';
    elmnt.style.left=Y+'px';
    //elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    //elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }
  function elementDragInside(e) { //trying the movement handling in iframe again, I do my worst at night it seems
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - (e.clientX+elmnt.offsetLeft);
    pos2 = pos4 - (e.clientY+elmnt.offsetTop+head.offsetHeight);
    pos3 = (e.clientX+elmnt.offsetLeft);
    pos4 = (e.clientY+elmnt.offsetTop+head.offsetHeight);
    //console.log([e.clientX,pos3],[e.clientY,pos4])
    let X,Y; //(<=/>=), (+/-)1 ... NOW it's (</>), (+/-)0
    if(elmnt.offsetTop<section.offsetTop) X=section.offsetTop;
    else if(elmnt.offsetTop>(section.offsetTop+section.offsetHeight)-head.offsetHeight)
      X=((section.offsetTop+section.offsetHeight)-head.offsetHeight);
    else X=elmnt.offsetTop - pos2;
    if(elmnt.offsetLeft<section.offsetLeft) Y=section.offsetLeft;
    else if(elmnt.offsetLeft>(section.offsetLeft+section.offsetWidth)-head.offsetWidth)
      Y=((section.offsetLeft+section.offsetWidth)-head.offsetWidth);
    else Y=elmnt.offsetLeft - pos1;
    elmnt.style.top=X+'px';
    elmnt.style.left=Y+'px';
    //elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    //elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    /* stop moving when mouse button is released:*/
    div.style.display = "none";
    dragging = false;
    div.onmouseup = null;
    div.onmousemove = null;
    section.onmouseup = null; //document
    section.onmousemove = null; //document
    FRAME.document.onmousemove = null;
  }
}
//window stuff end

//os stuff begin
function traverse(path="",folder=false,read_folder=false){
  let type=(folder?'folder':'file')
  if(typeof path!=="string")
    throw type+' path MUST be a string';
  if(folder&&read_folder&&path.length===0) return [FILES];

  if(path.at(-1)==="/") path=path.substring(0,path.length-1);
  let TEMP=FILES, PATH=path.split('/')
  if(PATH.length>=31) throw 'too many subdirectories';
  if(PATH.some(sub=> sub.length<1 )) throw 'malformed path string';

  for(let i=0;i<PATH.length-1;i++){
    if(!TEMP[ PATH[i] ]  ||  typeof TEMP[ PATH[i] ]!=="object")
      throw type+' does not exist';
    TEMP=TEMP[ PATH[i] ]
  }
  return [TEMP,PATH.at(-1)]
}


function readFile(path="unnamed.txt"){ //reads from localStorage
  let [curr,next]=traverse(path)
  curr=curr[next]
  if(typeof curr==="undefined") throw 'file does not exist';
  if(typeof curr==="object") throw 'FOLDER selected when FILE should be read';
  return curr
}
function writeFile(path="unnamed.txt",data=""){
  if(typeof data!=="string") throw 'data in file MUST be a string';
  let [curr,next]=traverse(path)
  curr[next]=data
  localStorage.files=JSON.stringify(FILES)
  return true
}
function readFolder(path=""){
  let [curr,next]=traverse(path,true,true), folder=curr
  if(path.length>0) folder=curr[next];
  if(typeof folder===undefined) throw 'folder does not exist';
  if(typeof folder==="string") throw 'FILE selected when FOLDER should be read';
  let arr=Object.keys(folder), obj={__proto__:null}
  for(let i=0;i<arr.length;i++){
    let key=arr[i], isFolder=typeof folder[key]==="object"
    let size=isFolder? JSON.stringify(folder[key]).length-2: folder[key].length;
    obj[key]={isFolder, size}
  }
  return obj
}
function writeFolder(path="",name="unnamed folder"){
  if(name.includes('/')) throw 'name of new folder CANNOT contain "/"';
  let [curr,next]=traverse(path,true)
  if(typeof curr!=="object") throw 'cannot write a folder inside a file';
  curr[next][name]={}
  localStorage.files=JSON.stringify(FILES)
  return true
}


const processes={__proto__:null} //each process has {path,name,author,permissions,startTime}
Object.defineProperty(processes,'length',{writable:true,configurable:false,value:0,enumerable:false})
function invalidID(id){
  return Number(id).toString()!==id.toString() || id<Number.MIN_SAFE_INTEGER || id>Number.MAX_SAFE_INTEGER
}
const permissionList={
  "prompts": "allows an app to show 'prompt', 'alert' and 'confirm' elements which temporarily block other elements on a page", //bypassable and since it's a week left I won't bother patching
  "local read": "allows an app to READ in its own directory ALONE (this is always granted)",
  "local write": "allows an app to WRITE in its own directory ALONE",
  "global read": "permits an app to READ files ANYWHERE in your browser OS",
  "global write": "permits an app to WRITE files ANYWHERE in your browser OS",
  "process view": "grants app ability to see all current processes",
  "process messaging": "grants app ability to communicate with other processes",
  "process spawn": "grants app ability to spawn processes of its own",
  "process kill": "grants app ability to kill other processes",
  "admin": "ridiculously op permission making u edit the core"
}
const permissionFunctions={
  "prompts": function(WINDOW,PATH){
    define(WINDOW,'alert',window.alert.bind(WINDOW))
    define(WINDOW,'prompt',window.prompt.bind(WINDOW))
    define(WINDOW,'confirm',window.confirm.bind(WINDOW))
  },
  "local read": function(WINDOW,PATH){
    define(WINDOW.controls,'readLocal',function(path=""){
      if(path[0]==='/') path=path.substring(1);
      return readFile(PATH+path)
    })
    define(WINDOW.controls,'readLocalFolder',function(path=""){
      if(path[0]==='/') path=path.substring(1);
      return readFolder(PATH+path)
    })
  },
  "local write": function(WINDOW,PATH){
    define(WINDOW.controls,'writeLocal',function(path=""){
      if(path[0]==='/') path=path.substring(1);
      return writeFile(PATH+path)
    })
    define(WINDOW.controls,'writeLocalFolder',function(path=""){
      if(path[0]==='/') path=path.substring(1);
      return readFolder(PATH+path)
    })
  },
  "global read": function(WINDOW,PATH){
    define(WINDOW.controls,'read',readFile)
    define(WINDOW.controls,'readFolder',readFolder)
  },
  "global write": function(WINDOW,PATH){
    define(WINDOW.controls,'write',writeFile)
    define(WINDOW.controls,'writeFolder',writeFolder)
  },
  "process view": function(WINDOW,PATH){
    define(WINDOW.controls,'processes',listProcesses,"get")
  },
  "process messaging": function(WINDOW,PATH){ //I could've made it send and forget but I made it send and await response
    function set(fn){
      if(typeof fn!=="function") throw '"fn" MUST be a function that receives messages';
      processes[WINDOW.controls.ID].listener=fn;
    }
    function get(){
      return processes[WINDOW.controls.ID].listener
    }
    let lastUsed=new Date(0);
    async function message(id,text){
      if(invalidID(id)) throw 'process "id" MUST represent a proper number';
      if(Date.now()-lastUsed<50) throw 'processes are limited to send messages once every 50 ms';
      if(processes[id].listener===null) throw 'the process by given id has NO LISTENER';
      if(!processes[id]) throw 'the process by given id DOES NOT EXIST';

      lastUsed=Date.now()
      let work=null, fail=null
      let prom=new Promise((resolve,reject)=>  (work=resolve,fail=reject)  );
      setTimeout(async function(){
        try{  resolve(String(await processes[id].listener(String(text))))  }
        catch(err){  fail('process listener threw error:\n\n'+err)  }
      })
      return await prom
    }

    Object.defineProperty(WINDOW.controls,'onmessage',{configurable:false,writable:false,set,get}) //message listener stuff
    define(WINDOW.controls,'message',message) //message sender stuff
  },
  "process spawn": function(WINDOW,PATH){
    define(WINDOW.controls,'spawn',spawnProcess)
  },
  "process kill": function(WINDOW,PATH){
    define(WINDOW.controls,'kill',killProcess)
  },
  "admin": function(WINDOW,PATH){ //for another time
    define(WINDOW.controls,'core',CORE)
    define(WINDOW.controls,'parent',window)
    define(WINDOW.controls,'files',FILES)
  }
}

function processWrapper(ID,NAME,BACKGROUND){ //returns DOM element that u will put a process in
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
  icon.src = BACKGROUND;
  ELEM.append(processHead,processBody)
  processHead.append(icon,bold,buttons)
  buttons.append(unMaximise,maximise,close) //more would come

  bold.innerText=NAME
  close.onclick=function(){ killProcess(ID) }
  close.innerHTML='x';
  close.title='Close'
  maximise.onclick=function(){
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
  unMaximise.onclick=function(){
    if(min) return null;
    (min=true, max=false);
    clearInterval(s);
    ELEM.style.top=posX+'px';
    ELEM.style.left=posY+'px';
    ELEM.style.height=x+'px';
    ELEM.style.width=y+'px';
  }
  processBody.src='about:blank'
  document.getElementById('content').appendChild(ELEM)
  processBody.contentWindow.parent=undefined; //easily bypassed but like I said, I'm rushing
  dragElement(ELEM,processHead,processBody.contentWindow)
  return [ELEM,processBody.contentWindow]
}
async function permissionManage(manifest){ //manages the permissions of an app
  //I should put a display and let the user choose which permissions but right now I am rushing to have it VISUALLY working
  CORE.perms[manifest.name]={'local read':true}
  manifest.permissions.forEach(perm=>{
    CORE.perms[manifest.name][perm]=true
  })
  localStorage.core=JSON.stringify(CORE)
}
async function spawnProcess(path,arg=""){ //returns ID if successful
  let [curr,next]=traverse(path)
  let folder=curr[next]
  if(path.at(-1)!=='/') path+='/'; //have / at the end by force
  if(typeof folder!=="object") throw 'must give folder of program';
  if(!folder['index.html'] || !folder['manifest.json'])
    throw 'given folder is not a program since a program needs "index.html" and "manifest.json"';
  let manifest=JSON.parse(folder['manifest.json']), index=folder['index.html']
  if(["name","author"].some(key=> typeof manifest[key]!=="string"||manifest[key].length<1 ))
    throw 'in "manifest.json", there must be non-empty STRINGS of "name" and "author"';
  if(!(manifest.permissions instanceof Array)  ||  manifest.permissions.some(perm=> !permissionList[perm] ))
    throw '"manifest.json" should only include actual permissions.. the list is:\n'+Object.keys(permissionList);
  let background=getBackground(path)
  if(background===null)
    throw "given folder is not a program since it doesn't have a 'background' image";

  if(!CORE.perms[manifest.name]) await permissionManage(manifest);
  taskbar(path); CORE.perms[manifest.name]['local read']=true;
  iconCache[path].classList.add('opened')
  //iconCache[path].style="background-color: lightblue;";
  let ID=processes.length++, [ELEM,WINDOW]=processWrapper(ID,manifest.name,background), controls={__proto__:null};
  (delete WINDOW.alert, delete WINDOW.prompt, delete WINDOW.confirm); //only put back if prompts permission granted
  define(WINDOW,'controls',controls)
  Object.keys(CORE.perms[manifest.name]).forEach(permission=>{
    console.log([permission,CORE.perms[manifest.name]])
    permissionFunctions[permission](WINDOW,path)
  })
  const BLOB=WINDOW.Blob
  define(WINDOW,'SRC',function(path){
    let data=WINDOW.controls.readLocal(path), ext=path.split('.').at(-1).toLowerCase()
    let url=WINDOW.URL.createObjectURL(new BLOB([str2ab(data)],{type:mimeTypes[ext]||'text/plain'}))
    setTimeout(_=>WINDOW.URL.revokeObjectURL(url),5e3)
    return url
  })
  define(WINDOW,'ARG',String(arg))

  processes[ID]={
    path,
    name:manifest.name,
    author:manifest.author,
    permissions: {...CORE.perms[manifest.name]},
    startTime: Date.now()
  }
  Object.defineProperty(processes[ID],'APP',{enumerable:false,value:{ELEM,WINDOW}})

  setTimeout(_=>{
    let html=WINDOW.document.createElement('html')
    html.innerHTML=index
    WINDOW.document.write(index)
    //WINDOW.document.children[0].remove()
    //WINDOW.document.appendChild(html)
  })
  return ID
}
function killProcess(id){
  if(invalidID(id)) throw 'process "id" MUST represent a proper number';
  if(typeof processes[id]==="undefined") throw 'process does NOT exist';
  let process=processes[id]
  process.APP.ELEM.remove()
  delete processes[id];
  processes.length--;
  if(processes.length===0 || Object.keys(processes).every(ID=>processes[ID].path!==process.path)){
    if(!CORE.desktop.pinned.includes( process.path )){
      iconCache[process.path].remove();
      delete iconCache[process.path];
    }
    else  iconCache[process.path].classList.remove('opened');
  }
  console.log(processes)
}
function listProcesses(){
  return JSON.parse(  JSON.stringify(processes)  )
}
//os stuff end
})()