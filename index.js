let slash=process.platform=="win32"?"\\":"/", dir=__dirname+slash;
var http=require('node:http'), fs=require('node:fs')
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

let DEFAULT=dir+'default'+slash
function read(path){
  fs.lstatSync(path)
  if(fs.lstatSync(path).isFile())
    return ab2str(fs.readFileSync(path));
  const folder={__proto__:null}
  fs.readdirSync(path).forEach(part=> folder[part]=read(path+slash+part) )
  return folder
}
const ASSETS=read(dir+'default')
ASSETS['']=ab2str(fs.readFileSync(DEFAULT+'os.html'))
ASSETS['applications']=JSON.stringify( read(dir+'applications') )
ASSETS['main']=JSON.stringify( read(DEFAULT+'main') )


http.createServer(async function(req,res){
  if(req.url[0]==="/") req.url=req.url.substr(1);
  return res.end(ASSETS[req.url]||''); //simple server for now
}).listen(8080)