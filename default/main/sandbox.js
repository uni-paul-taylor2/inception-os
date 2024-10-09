(async function(){
  const permissionList={
    "prompts": "allows an app to show 'prompt', 'alert' and 'confirm' elements which temporarily block other elements on a page",
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
  async function permissionManage(manifest){ //manages the permissions of an app
    //todo: put a display and let the user choose which permissions
    //what is done right now? grants all permissions ;-;
    CORE.perms[manifest.name]=await make_permissions(manifest.permissions)
    localStorage.core=JSON.stringify(CORE)
  }
  //enforcePermissions runs INSIDE a process before it's ready :D
  function enforcePermissions(WINDOW,permissions,channel,controls,original,localFiles){ //original and localFiles only get used in the initial WINDOW
    if(WINDOW.SANDBOXED) return true; //this window is already sandboxed
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
    //so this is SOME operating system interfacing being setup inside the process
    if(original){
      localFiles.__proto__ = null
      controls = {__proto__:null}
      channel = new BroadcastChannel(original) //the 'original' variable is a secret, needless to say
      const {now}=Date, processEpoch=now()
      const requestIDs=new Map([[1,null]]), string=WINDOW.String
      const requestIDSet=bind(requestIDs.set,requestIDs)
      const requestIDGet=bind(requestIDs.get,requestIDs)
      const requestIDHas=bind(requestIDs.has,requestIDs)
      const requestIDDelete=bind(requestIDs.delete,requestIDs)
      const postMessage=bind(channel.postMessage,channel)
      WINDOW.setInterval(function(){postMessage(original)}, 1e3);
      //if the process is hanging, this above obviously this won't get called
      //if 5 seconds go without a process doing this call, it has to exit
      channel.onmessage=function(ev){
        const [id,data]=ev.data //result[0] is id, result[1] is data
        //when id is 0, a new file is being added to the process' directory
        if(id===0)
          return localFiles[data[0]] = data[1]; //data when id is 0 is: [filename,contents]
        //in the lines below, there maaaay be implementation of the requestIDs map being used by operating system made callbacks for things
        //else there would be no if statement of id>processEpoch
        requestIDGet(id)(data)
        if(id>processEpoch) requestIDDelete(id);
      }
      async function requester(type="",args=[]){
        const id=now()
        if(requestIDHas(id)) throw 'Process limit of ONE syscall per millisecond exceeded';
        let work=null, prom=new Promise(r=>work=r)
        requestIDSet(id,work)
        postMessage([type,args,id])
        return await prom
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
      enforcePermissions(subWindow,permissions,channel,controls)
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
  module.exports = {permissionList,permissionManage,make_permissions,enforcePermissions}
})()