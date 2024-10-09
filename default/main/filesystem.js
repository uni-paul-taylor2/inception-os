(async function(){
  //do note that the folder naming convention does NOT have / at the end of the folder name
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
    localStorage["folders://"+path]=JSON.stringify({});
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
  function initFileSystem(){
    localStorage.clear();
    localStorage.core=JSON.stringify(CORE);
    localStorage["folders://"]=JSON.stringify({});
  }
  module.exports={readFile,writeFile,removeFile,readFolder,writeFolder,removeFolder,factoryReset,initFileSystem}
})()