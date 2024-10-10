(async function(){
  const u=location.origin, FILESYSTEM=require('filesystem')
  //----------------------load OS files start
  if(!CORE.css) CORE.css=await get(u+'/style.css');
  if(!CORE.perms) CORE.perms=await get(u+'/perms.json',"json");
  if(!CORE.desktop) CORE.desktop=await get(u+'/desktop.json',"json");
  localStorage.core=JSON.stringify(CORE)
  //----------------------load OS files stop
  
  //----------------------load applications start
  async function recursiveWrite(folder,path){
    const keys=Object.keys(folder)
    for(let i=0;i<keys.length;i++){
      const fullPath=(path.length>0?path+'/':path)+keys[i]
      if(typeof folder[keys[i]]!=="object"){
        await FILESYSTEM.writeFile(fullPath, folder[keys[i]])
        continue
      }
      await FILESYSTEM.writeFolder(path, keys[i])
      await recursiveWrite(folder[keys[i]], fullPath)
    }
  }
  if(!FILESYSTEM.readFolder("")){
    const files=await get(u+'/applications',"json")
    FILESYSTEM.initFileSystem()
    await recursiveWrite(files,"")
    //files=null
  }
  //----------------------load applications stop
  
  
  const DISPLAY = require('display'), PROCESS=require('process'), SANDBOX=require('sandbox'), UTILS=require('utils')
  //UTILS provide helper functions for everything
  //DISPLAY sets up the display with things that can be clicked that can launch a PROCESS
  //each process has SANDBOX logic with permissions through which each process can communicate with other processes and use the FILESYSTEM
  
  
  DISPLAY.initDisplay()
  window.fs=FILESYSTEM
  window.require=require
  module.exports={DISPLAY,PROCESS,SANDBOX,FILESYSTEM,UTILS}
})()