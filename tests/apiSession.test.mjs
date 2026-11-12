import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {SourceTextModule,SyntheticModule} from 'node:vm';

async function makeApi() {
  let globalFailures=0;
  const module=new SourceTextModule(await readFile(new URL('../src/hooks/useApiClient.jsx',import.meta.url),'utf8'),{initializeImportMeta(meta){meta.env={VITE_API_URL:'https://api.example.test'}}});
  await module.link(specifier=>{
    let exports;
    if(specifier==='react')exports={useState:()=>[null,()=>{}],useCallback:fn=>fn};
    else if(specifier.endsWith('/tokenStore'))exports={clearAuth:()=>{},getAccessToken:()=> 'test-token',getRefreshToken:()=> 'refresh-token',refreshTokens:async()=>{},setTokens:()=>{}};
    else if(specifier.includes('ServerStatus'))exports={default:()=>({setServerDown:()=>globalFailures++})};
    else if(specifier.includes('Nickname'))exports={default:()=>({setNickname:()=>{},setGravatar:()=>{}})};
    else throw new Error(specifier);
    return new SyntheticModule(Object.keys(exports),function(){for(const [name,value] of Object.entries(exports))this.setExport(name,value)});
  });
  await module.evaluate();
  return {api:module.namespace.useApiClient(),failures:()=>globalFailures};
}

test('API requests and 401 retries carry the route cookie',async()=>{
 const original=globalThis.fetch;
 const calls=[];
 globalThis.fetch=async(url,options)=>{calls.push(options);return new Response(JSON.stringify(calls.length===1?{code:'AUTH_001'}:{ok:true}),{status:calls.length===1?401:200})};
 try {const {api}=await makeApi();assert.deepEqual(await api.post('https://api.example.test/api/plan/id/chatbot-apply',{}),{ok:true});assert.equal(calls.length,2);for(const call of calls)assert.equal(call.credentials,'include')}
 finally {globalThis.fetch=original}
});

test('AI service errors preserve the typed code without marking the whole server down',async()=>{
 const original=globalThis.fetch;
 globalThis.fetch=async()=>new Response(JSON.stringify({code:'CHATBOT_001',message:'AI unavailable'}),{status:503});
 try {const {api,failures}=await makeApi();await assert.rejects(api.post('https://api.example.test/api/plan/id/chatbot',{}),error=>error.code==='CHATBOT_001'&&error.status===503);assert.equal(failures(),0)}
 finally {globalThis.fetch=original}
});

test('unclassified server errors still trigger the global outage state',async()=>{
 const original=globalThis.fetch;
 globalThis.fetch=async()=>new Response('{}',{status:500});
 try {const {api,failures}=await makeApi();await assert.rejects(api.get('https://api.example.test/api/plan/id'));assert.equal(failures(),1)}
 finally {globalThis.fetch=original}
});
