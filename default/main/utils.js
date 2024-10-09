(async function(){
  const {readFile} = require('filesystem')
  async function get(url){
    return await(await fetch(location.origin+'/'+url)).text()
  }
  const mimeTypes={__proto__:null,"aac":"audio/aac","abw":"application/x-abiword","arc":"application/x-freearc","avif":"image/avif","avi":"video/x-msvideo","azw":"application/vnd.amazon.ebook","bin":"application/octet-stream","bmp":"image/bmp","bz":"application/x-bzip","bz2":"application/x-bzip2","cda":"application/x-cdf","csh":"application/x-csh","css":"text/css","csv":"text/csv","doc":"application/msword","docx":"application/vnd.openxmlformats-officedocument.wordprocessingml.document","eot":"application/vnd.ms-fontobject","epub":"application/epub+zip","gz":"application/gzip","gif":"image/gif","ico":"image/vnd.microsoft.icon","ics":"text/calendar","jar":"application/java-archive","js":"text/javascript","json":"application/json","jsonld":"application/ld+json","mjs":"text/javascript","mp3":"audio/mpeg","mp4":"video/mp4","mpeg":"video/mpeg","mpkg":"application/vnd.apple.installer+xml","odp":"application/vnd.oasis.opendocument.presentation","ods":"application/vnd.oasis.opendocument.spreadsheet","odt":"application/vnd.oasis.opendocument.text","oga":"audio/ogg","ogv":"video/ogg","ogx":"application/ogg","opus":"audio/opus","otf":"font/otf","png":"image/png","pdf":"application/pdf","php":"application/x-httpd-php","ppt":"application/vnd.ms-powerpoint","pptx":"application/vnd.openxmlformats-officedocument.presentationml.presentation","rar":"application/vnd.rar","rtf":"application/rtf","sh":"application/x-sh","svg":"image/svg+xml","tar":"application/x-tar","ts":"video/mp2t","ttf":"font/ttf","txt":"text/plain","vsd":"application/vnd.visio","wav":"audio/wav","weba":"audio/webm","webm":"video/webm","webp":"image/webp","woff":"font/woff","woff2":"font/woff2","xhtml":"application/xhtml+xml","xls":"application/vnd.ms-excel","xlsx":"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","xml":"application/xml","xul":"application/vnd.mozilla.xul+xml","zip":"application/zip","3gp":"video/3gpp","3g2":"video/3gpp2","7z":"application/x-7z-compressed","htm":"text/html","html":"text/html","jpeg":"image/jpeg","jpg":"image/jpeg","mid":"audio/midi","midi":"audio/midi","tif":"image/tiff","tiff":"image/tiff"}
  //scraped from https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
  function define(obj,key,data,type="value"){
    Object.defineProperty(obj,key,{configurable:false,writable:false,[type]:data})
  }
  function BTOA(txt){ //makes txt friendly for an html id
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
  define(window,'SRC',function(path){
    console.log(path)
    let data=readFile(path), ext=path.split('.').at(-1).toLowerCase()
    let url=URL.createObjectURL(new Blob([str2ab(data)],{type:mimeTypes[ext]||'text/plain'}))
    setTimeout(_=>URL.revokeObjectURL(url),5e3)
    return url
  })
  module.exports={BTOA,ab2str,str2ab,randString,mimeTypes,define,get,ab_map,str_map}
})()