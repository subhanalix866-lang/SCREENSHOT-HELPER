// Cloudflare Worker: Gemini key यहाँ छुपी रहती है
const ALLOWED=['gemini-3.1-flash-lite','gemini-flash-lite-latest','gemini-flash-latest'];
const DAILY=40; // हर यूज़र (IP) के लिए रोज़ की लिमिट
export default{async fetch(req,env){
 const cors={'Access-Control-Allow-Origin':env.ALLOW_ORIGIN||'*','Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type'};
 if(req.method==='OPTIONS')return new Response(null,{headers:cors});
 if(req.method!=='POST')return new Response('ok',{headers:cors});
 const m=new URL(req.url).searchParams.get('model')||ALLOWED[0];
 if(!ALLOWED.includes(m))return new Response('bad model',{status:400,headers:cors});
 if((+req.headers.get('content-length')||0)>8e6)return new Response('too big',{status:413,headers:cors});
 if(env.LIMITS){const ip=req.headers.get('CF-Connecting-IP')||'x';const k=ip+':'+new Date().toISOString().slice(0,10);
  const n=+(await env.LIMITS.get(k))||0;if(n>=DAILY)return new Response('limit',{status:429,headers:cors});
  await env.LIMITS.put(k,String(n+1),{expirationTtl:90000})}
 const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+m+':generateContent',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':env.GEMINI_KEY},body:req.body});
 return new Response(r.body,{status:r.status,headers:{...cors,'Content-Type':'application/json'}});
}}
