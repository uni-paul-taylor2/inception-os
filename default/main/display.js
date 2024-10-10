(async function(){
  const {mimeTypes,define,BTOA} = require('utils')
  const {readFolder} = require('filesystem')
  const clock = document.querySelector("#clock");
  function displayTime() {
    let day = new Date().toLocaleDateString()
    let time = new Date().toLocaleTimeString("en-US", { hour12: false })
    clock.innerHTML = day + " " + time;
  }
  displayTime()
  setInterval(displayTime,1000)
  function getBackground(path){
    let folder=readFolder(path)
    let background=null, backgrounds=Object.keys(mimeTypes)
      .filter(m=>mimeTypes[m].includes('image'))
      .map(a=>`background.${a}`)
    for(let i=0;i<backgrounds.length;i++){
      const bg=backgrounds[i]
      const fullPath=(path.length>0?path+'/':path)+bg
      if(folder[bg]){
        background=SRC(fullPath)
        break
      }
    }
    return background
  }
  function taskbar(path){
    if(iconCache[path]) return null;
    let elem=document.createElement('div')
    let background=getBackground(path)
    elem.id=BTOA(path)
    style.innerHTML+=`\n#${BTOA(path)}{background-image: url("${background}");}`
    elem.classList.add('pinned')
    elem.onclick=function(){ require('process').spawnProcess(path) }
    elem.title=path.split('/').at(-1)
    iconCache[path]=elem
    foot.appendChild(elem)
  }
  const iconCache={__proto__:null}
  let section=document.getElementById('content'), Z=1, front=null;
  let {css}=CORE, {background}=CORE.desktop, style=document.createElement('style')
  css=css.split('\\\\').join(background.file?SRC(background.src):background.src)
  style.innerHTML=css
  let {pinned}=CORE.desktop, foot=document.getElementById('foot')
  function initDisplay(){
    document.head.appendChild(style)
    pinned.forEach(app=> taskbar(app) )
  }
  function dragElement(elmnt,head) { //adapted from https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_draggable
    let div=document.createElement('div');
    div.style="display:none;width:100%;height:100%;opacity:0;background-color:transparent;z-index:2147483647;position:absolute;";
    elmnt.prepend(div);
    setTimeout(_=> (elmnt.style.zIndex=++Z,front=elmnt) ,1)
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0, dragging = false;
    div.onmousedown = dragMouseDown;
    head.onmousedown = dragMouseDown;
    elmnt.onmousedown=function(){ (elmnt.style.zIndex=++Z,front=elmnt) }
    setInterval(function(){
      div.style.display=!dragging&&(front===elmnt)?"none":"initial";
    },50)
    function dragMouseDown(e) {
      front = elmnt;
      dragging = true;
      e ||= window.event;
      e.preventDefault();
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
  module.exports={dragElement,getBackground,taskbar,initDisplay}
})()