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
(async()=>{ //note that folder paths DO NOT end in slash
  if(window.LOADED) return null;
  window.LOADED=true;
  const version="1.0.0";
  //todo: separate UI from OS but firstly finish up processWrapper and spawnProcess

  const clock = document.querySelector("#clock");
  function displayTime() {
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
  function randString(){
    return BTOA(ab2str(crypto.getRandomValues(new Uint8Array(32))));
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
    let elem=document.createElement('div')
    let background=getBackground(path)
    elem.id=BTOA(path)
    style.innerHTML+=`#${BTOA(path)}{background-image: url("${background}");\n`
    elem.classList.add('pinned')
    elem.onclick=function(){ spawnProcess(path) }
    elem.title=path.split('/').at(-1)
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
  const CORE=JSON.parse(localStorage.core)
  const iconCache={__proto__:null}
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
  let {pinned}=CORE.desktop, foot=document.getElementById('foot')
  document.head.appendChild(style)
  pinned.forEach(app=> taskbar(app) )
  function dragElement(elmnt,head) { //adapted from https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_draggable
    let div=document.createElement('div');
    div.style="display:none;width:100%;height:100%;opacity:0;background-color:transparent;z-index:2147483647;position:absolute;";
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
      section.onmouseup = closeDragElement; //document
      section.onmouseleave = closeDragElement; //document
      section.onmousemove = elementDrag; //document
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
    }

    function closeDragElement() {
      /* stop moving when mouse button is released:*/
      div.style.display = "none";
      dragging = false;
      div.onmouseup = null;
      div.onmousemove = null;
      section.onmouseup = null; //document
      section.onmousemove = null; //document
    }
  }
  //window stuff end

  //os stuff begin
  //filesystem stuff start
  const occupied=new Map(), updates=new Map();
  function unOccupy(resource,file,operation){
    //operation types w(writefile),wf(writefolder),  r(readfile),rf(readfolder)
    occupied.delete(resource)
    updates.get(resource)?.forEach(fn=>fn(file,operation))
  }
  async function waitToOccupy(resource){
    if(occupied.has(resource)){
      await new Promise(r=>{
        const s=setInterval(function(){
          if(!occupied.has(resource)) return r(clearInterval(s));
        })
      })
    }
    occupied.set(resource,true);
  }
  function readFile(path="unnamed.txt"){ //reads from localStorage
    return localStorage["files://"+path] || null;
  }
  async function writeFile(path="unnamed.txt",data=""){
    if(typeof path!=="string" || typeof data!=="string") return false;
    const split=path.split('/'), fileName=split.splice(split.length-1,1)[0], folderPath=split.join('/');
    if(!readFolder(folderPath)) return false;
    await waitToOccupy(folderPath);
    localStorage["files://"+path] = data;
    let folder=readFolder(folderPath);
    folder[fileName]=data.length;
    localStorage["folders://"+folderPath]=JSON.stringify(folder);
    //the 2 lines above update the file's folder with the file info (length)
    unOccupy(folderPath,fileName,"w");
    return true;
  }
  async function removeFile(path="unnamed.txt"){
    if(typeof path!=="string") return false;
    const split=path.split('/'), fileName=split.splice(split.length-1,1)[0], folderPath=split.join('/');
    if(!readFile(path)) return false;
    await waitToOccupy(folderPath);
    let folder=readFolder(folderPath);
    delete localStorage["files://"+path];
    delete folder[fileName];
    localStorage["folders://"+folderPath]=JSON.stringify(folder);
    unOccupy(folderPath,fileName,"r");
    return true;
  }
  function readFolder(path=""){
    if(typeof path!=="string") return false;
    return JSON.parse(localStorage["folders://"+path] || "null");
  }
  async function writeFolder(path="",name="unnamed folder"){
    //form of metadata: {[fileName]: data length for file and -1 for folder}
    if(typeof path!=="string" || typeof name!=="string") return false;
    const fullPath="folders://"+(path.length>0?path+'/':path)+name;
    if(!readFolder(path) || name.includes('/') || localStorage[fullPath]) return false;
    await waitToOccupy(path);
    localStorage[fullPath] = JSON.stringify({}); //metadata (empty)
    let folder=readFolder(path);
    folder[name]=-1; //"length" for a folder
    localStorage["folders://"+path]=JSON.stringify(folder);
    unOccupy(path,name,"wf");
    return true;
  }
  async function removeFolder(path="",name="unnamed folder"){
    if(typeof path!=="string" || typeof name!=="string") return false;
    const suffix=(path.length>0?path+'/':path)+name, fullPath="folders://"+suffix, folder=readFolder(path);
    if(!folder || name.includes('/') || !localStorage[fullPath]) return false;
    await waitToOccupy(path);
    let target=readFolder(suffix), keys=Object.keys(target);
    for(let i=0;i<keys.length;i++){
      if(target[keys[i]].length+1) await removeFile(suffix+"/"+keys[i]);
      else await removeFolder(suffix,keys[i]);
    }
    delete localStorage[fullPath];
    delete folder[name];
    unOccupy(path,name,"rf");
  }
  function factoryReset(keepOS){ //well we know what this does >:D
    localStorage.clear();
    if(keepOS) localStorage.core=JSON.stringify(CORE);
    location.reload();
  }
  //filesystem stuff stop


  const processes={__proto__:null} //each process has {path,name,author,permissions,startTime}
  Object.defineProperty(processes,'length',{writable:true,configurable:false,value:0,enumerable:false})
  function invalidID(id){
    return Number(id).toString()!==id.toString() || id<Number.MIN_SAFE_INTEGER || id>Number.MAX_SAFE_INTEGER
  }
  const permissionList={
    "prompts": "allows an app to show 'prompt', 'alert' and 'confirm' elements which temporarily block other elements on a page", //bypassable and since it's a week left I won't bother patching
    "internet": "allows an application to communicate with the internet",
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
  function make_permissions(perms){
    const permissions={__proto__:null}, keys=Object.keys(permissionList)
    for(let i=0;i<keys.length;i++) permissions[keys[i]]=false;
    for(let i=0;i<perms.length;i++) permissions[perms[i]]=true;
    permissions['local read']=true
    return permissions
  }
  //todo: FRAME dragElement logic inside this function
  function enforcePermissions(WINDOW,permissions,key,channel,controls,original,localFiles){
    if(WINDOW.SANDBOXED) return true; //this window already sandboxed
    const {defineProperty,getOwnPropertyDescriptor:describe,freeze}=WINDOW.Object, {URL:Url}=WINDOW;
    function define(obj,key,data,type="value"){
      defineProperty(obj,key,{configurable:false,writable:false,[type]:data})
    }
    freeze(Url);
    freeze(Url.prototype);
    freeze(WINDOW.Event);
    freeze(WINDOW.MessageEvent);
    freeze(WINDOW.Event.prototype);
    freeze(WINDOW.MessageEvent.prototype);
    define(WINDOW,"SANDBOXED",true);
    const bind=(WINDOW.Function.prototype.bind.call).bind(WINDOW.Function.prototype.bind);

    //prerun setting up (the very first window before the start of the process)
    if(original){
      localFiles.__proto__ = null
      controls = {__proto__:null}
      channel = new BroadcastChannel(key)
      const {now}=Date, processEpoch=now()
      const requestIDs=new Map([[1,null]]), string=WINDOW.String
      const requestIDSet=bind(requestIDs.set,requestIDs)
      const requestIDGet=bind(requestIDs.get,requestIDs)
      const requestIDDelete=bind(requestIDs.delete,requestIDs)
      const postMessage=bind(channel.postMessage,channel)
      WINDOW.setInterval(function(){postMessage(original)}, 1e3);
      channel.onmessage=function(ev){
        const result=ev.data
        if(result[0] === 0)
          return localFiles[result[1][0]] = result[1][1];
        requestIDGet(result[0])(result[1])
        if(result[0] > processEpoch) requestIDDelete(result[0]); //result[0] is id, result[1] is data
      }
      async function requester(type="",args=[]){
        const id=now()
        if(requestIDs[id]) throw 'Process limit of ONE syscall per millisecond exceeded';
        let work=null, prom=new Promise(r=>work=r)
        requestIDSet(id,work)
        postMessage([type,args,id])
        let result=await prom;
        return result;
      }
      define(controls,'local_read',function(fileName){ //always granted
        if(fileName[0]!=='/') fileName='/'+fileName;
        return localFiles[fileName]||"about:blank";
      })
      define(controls,'exit',function(){ requester('process kill',[]) })
      if(permissions['local write']){
        define(controls,'local_write',async function(fileName,data){
          return await requester('local write',[fileName,data])
        })
      }
      if(permissions['global read']){
        define(controls,'read',async function(fileName,data,isFolder=false){
          return await requester('global read',[fileName,data,isFolder])
        })
      }
      if(permissions['global write']){
        define(controls,'write',async function(fileName,data,isFolder=false){
          return await requester('global write',[fileName,data,isFolder])
        })
      }
      if(permissions['process messaging']){
        define(controls,'message',async function(pid,data){
          return await requester('process messaging',[pid,string(data)])
        })
      }
      if(permissions['process view']){
        define(controls,'ps',async function(){
          return await requester('process view',[])
        })
      }
      if(permissions['process kill']){
        define(controls,'kill',async function(pid){
          return await requester('process kill',[pid])
        })
      }
      if(permissions['process spawn']){
        define(controls,'spawn',async function(path,arg=""){
          return await requester('process spawn',[path,arg])
        })
      }
      if(permissions['admin']){
        define(controls,'reset',async function(){return await requester('admin',['reset'])})
        define(controls,'restart',async function(){return await requester('admin',['restart'])})
        define(controls,'update_core',async function(newCoreObj){
          return await requester('admin',['update',[newCoreObj]])
        })
        define(controls,'change_perms',async function(appPath,newAppPerms){
          return await requester('admin',['modify',[appPath,newAppPerms]])
        })
      }
      function set(fn){requestIDSet(1,typeof fn==="function"?fn:null)}
      function get(){return requestIDGet(1)}
      defineProperty(controls,'onmessage',{configurable:false,enumerable:true,get,set})
      freeze(controls)
    }

    //making sure permissions r enforced for every iframe THIS iframe can control
    const contentWindow=describe(WINDOW.HTMLIFrameElement.prototype,'contentWindow').get;
    define(WINDOW.HTMLIFrameElement.prototype,"contentWindow",function(){
      const subWindow=bind(contentWindow,this)()
      enforcePermissions(subWindow,permissions,key,channel,controls)
      return subWindow
    })

    //controlling global functions based on permissions
    const write=bind(describe(WINDOW.Document.prototype,'write').value,WINDOW.document)
    const writeln=bind(describe(WINDOW.Document.prototype,'writeln').value,WINDOW.document)
    const appendDocument=bind(describe(WINDOW.Document.prototype,'append').value,WINDOW.document)
    const createElement=bind(describe(WINDOW.Document.prototype,'createElement').value,WINDOW.document)
    const iframeSrc=describe(WINDOW.HTMLIFrameElement.prototype,'src'), {get:iGet,set:iSet}=iframeSrc
    const scriptSrc=describe(WINDOW.HTMLScriptElement.prototype,'src'), {get:sGet,set:sSet}=scriptSrc
    const linkHref=describe(WINDOW.HTMLLinkElement.prototype,'href'), {get:lGet,set:lSet}=linkHref
    const aHref=describe(WINDOW.HTMLAnchorElement.prototype,'href'), {get:aGet,set:aSet}=aHref
    const innerHTMLGet=describe(WINDOW.Element.prototype,'innerHTML').get
    const innerHTMLSet=describe(WINDOW.Element.prototype,'innerHTML').set
    const appendElement=describe(WINDOW.Element.prototype,'append').value
    const appendChild=describe(WINDOW.Node.prototype,'appendChild').value
    const children=describe(WINDOW.Element.prototype,'children').get
    const proto=describe(WINDOW.Object.prototype,'__proto__'), protoset=proto.set
    proto.set=function(value){if(value===null)bind(protoset,this)(value);}
    define(WINDOW.Object.prototype,'__proto__',proto)
    const a=createElement('a');
    function urlSubstitute(url){
      bind(aSet,a)(url);
      url = new Url(bind(aGet,a)());
      if(url.origin===location.origin) return controls.local_read(url.pathname);
      return permissions['internet']? url.href: "about:blank";
    }
    function recursivelySanitise(node){
      (node.href, node.src); //allow modfied global properties to do their thing (they use urlSubstitute)
      let subElements=bind(children,node)()
      for(let i=0;i<subElements.length;i++) recursivelySanitise(subElements[i]);
    }
    function htmlSourceSanitise(data){
      if(typeof data==="string"){
        var html=createElement('html')
        bind(innerHTMLSet,html)(data)
      }
      else html=data;
      recursivelySanitise(html);
      return bind(innerHTMLGet,html)()
    }
    ;(iframeSrc.configurable=false, scriptSrc.configurable=false, linkHref.configurable=false, aHref.configurable=false);
    iframeSrc.set=function(value){bind(iSet,this)(urlSubstitute(value))}
    iframeSrc.get=function(){return bind(iGet,this)()}
    defineProperty(WINDOW.HTMLIFrameElement.prototype,'src',iframeSrc)
    scriptSrc.set=function(value){bind(sSet,this)(urlSubstitute(value))}
    scriptSrc.get=function(){return bind(sGet,this)()}
    defineProperty(WINDOW.HTMLScriptElement.prototype,'src',scriptSrc)
    linkHref.set=function(value){bind(lSet,this)(urlSubstitute(value))}
    linkHref.get=function(){return bind(lGet,this)()}
    defineProperty(WINDOW.HTMLLinkElement.prototype,'href',linkHref)
    aHref.set=function(value){bind(aSet,this)(urlSubstitute(value))}
    aHref.get=function(){return bind(aGet,this)()}
    defineProperty(WINDOW.HTMLAnchorElement.prototype,'href',aHref)
    define(WINDOW.Document.prototype,'write',function(){
      const str=arguments[0];
      for(let i=1;i<arguments.length;i++) str+=arguments[i];
      return write(htmlSourceSanitise(str));
    })
    define(WINDOW.Document.prototype,'writeln',function(){
      const str=arguments[0];
      for(let i=1;i<arguments.length;i++) str+=arguments[i];
      return writeln(htmlSourceSanitise(str));
    })
    define(WINDOW.Document.prototype,'append',function(){
      for(let i=0;i<arguments.length;i++) recursivelySanitise(argments[i]);
      return appendDocument(...arguments);
    })
    define(WINDOW.Element.prototype,'append',function(){
      for(let i=0;i<arguments.length;i++) recursivelySanitise(argments[i]);
      return bind(appendElement,this)(...arguments);
    })
    define(WINDOW.Node.prototype,'appendChild',function(child){
      recursivelySanitise(child)
      return bind(appendChild,this)(child)
    })
    const open=describe(WINDOW.XMLHttpRequest.prototype,'open')
    define(WINDOW.XMLHttpRequest.prototype,'open',function(method,url,isAsync,username,password){
      return bind(open,this)(method,urlSubstitute(url),isAsync,username,password)
    })
    const FETCH=describe(WINDOW,'fetch')
    define(WINDOW,'fetch',function(resource,options){
      return FETCH(urlSubstitute(resource),options)
    })
    if(!permissions['admin']&&!permissions['internet']){
      (delete WINDOW.WebSocket, delete WINDOW.open, delete WINDOW.Worker, delete WINDOW.SharedWorker);
      (delete WINDOW.RTCPeerConnection, delete WINDOW.webkitRTCPeerConnection);
      WINDOW.addEventListener('beforeunload',function(){ controls.exit() })
    }
    if(!permissions['admin']&&!permissions['prompts']) (delete WINDOW.alert, delete WINDOW.prompt, delete WINDOW.confirm);
    define(WINDOW,'controls',controls); //controls for syscalls a process might do
  }

  function processWrapper(ID,NAME,BACKGROUND,content){ //returns DOM element that u will put a process in
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
    //todo: put a display and let the user choose which permissions
    //what is done right now? grants all permissions ;-;
    CORE.perms[manifest.name]=make_permissions(manifest.permissions)
    localStorage.core=JSON.stringify(CORE)
  }
  async function spawnProcess(path,arg=""){ //returns ID if successful
    let [curr,next]=traverse(path)
    let folder=curr[next]
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
    taskbar(path);
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
