import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter, useNavigate} from 'react-router-dom';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {SocialPage} from '../../src/components/planmate2/social/pages/SocialPage';
import {ChatModal} from '../../src/components/planmate2/social/molecules/ChatModal';
import NotificationCenter from '../../src/components/planmate2/notifications/NotificationCenter';
import {useSocialEvents} from '../../src/components/planmate2/social/hooks/queries';
import '../../src/index.css';
import {usePost} from '../../src/components/planmate2/community/hooks/queries';
const EditPage=React.lazy(()=>import('../../src/components/planmate2/community/pages/CommunityCreatePage').then(m=>({default:m.CommunityCreatePage})));
function MissingPost(){const q=usePost(60,true);return <p>{q.isError?'게시글 없음':q.isPending?'조회 중':'게시글 있음'}</p>}
const me='11111111-1111-4111-8111-111111111111';
const other={userId:'22222222-2222-4222-8222-222222222222', nickname:'친구테스트',profileImageUrl:null,avatarHash:null,deleted:false};
localStorage.setItem('accessToken',`test.${btoa(JSON.stringify({sub:me,exp:Math.floor(Date.now()/1000)+3600}))}.test`);
localStorage.setItem('userId',me);
const state=window.qa={delay:location.search.includes("delay"),calls:[],requests:[{id:7,requester:other,createdAt:new Date().toISOString()}],status:'PENDING',sent:[],messages:[],alarms:[{id:1,title:'새 친구 요청',body:'친구테스트님에게서 친구 요청이 도착했습니다.',type:'NOTIFICATION_TYPE_FRIEND_REQUESTED',createdAt:new Date().toISOString(),readAt:null,action:{route:'SOCIAL_FRIEND_REQUESTS',parameters:{friendRequestId:'7'}}}]};
window.fetch=async (input, options={})=>{
 const u=new URL(String(input),location.href);const p=u.pathname;state.calls.push({path:p,method:options.method??'GET'});
 if(state.delay) await new Promise(r=>setTimeout(r,600));
 let data={items:[]};
 if(p==='/api/feed/posts/60')return new Response(JSON.stringify({message:'게시글 없음'}),{status:404,headers:{'Content-Type':'application/json'}});
 if(p==='/api/community/posts/85')return new Response(JSON.stringify({id:85,userId:other.userId,title:'타인 제목 노출 금지',content:[],createdAt:new Date().toISOString()}),{status:200,headers:{'Content-Type':'application/json'}});
 if(p.endsWith('/unread-count'))data={count:state.alarms.filter(x=>!x.readAt).length};
 else if(p==='/api/notifications')data={items:state.alarms,nextCursor:null};
 else if(p==='/api/notifications/read-friend-request'){state.alarms.forEach(x=>x.readAt=new Date().toISOString());data=null;}
 else if(p==='/api/collaboration-requests/pending')data={requests:[]};
 else if(p.endsWith('/friend-requests/statuses'))data=[{id:7,status:state.status}];
 else if(p.endsWith('/friend-requests/sent'))data=state.sent;
 else if(p.endsWith('/friend-requests/7/accept')||p.endsWith('/friend-requests/7/reject')){state.status=p.endsWith('accept')?'ACCEPTED':'REJECTED';state.requests=[];data={status:state.status};}
 else if(p==='/api/social/friend-requests'&&options.method==='POST'){state.sent=[{id:9,addresseeId:other.userId,status:'PENDING'}];data={status:'PENDING'};}
 else if(p==='/api/social/friend-requests')data={items:state.requests};
 else if(p==='/api/social/friends')data={items:state.status==='ACCEPTED'?[other]:[],totalElements:state.status==='ACCEPTED'?1:0};
 else if(p.endsWith('/users/search'))data={items:[other]};
 else if(p.endsWith('/chat/rooms'))data=options.method==='POST'?{roomId:42,partner:other}:{items:[{roomId:42,partner:other,unreadCount:0,lastMessage:null,lastMessageAt:null}],totalElements:1};
 else if(p.endsWith('/messages')){if(options.method==='POST')state.messages.unshift({id:state.messages.length+1,roomId:42,senderId:me,content:JSON.parse(options.body).content,createdAt:new Date().toISOString()});data={messages:state.messages};}
 return new Response(data===null?null:JSON.stringify(data),{status:data===null?204:200,headers:{'Content-Type':'application/json'}});
};
class FakeEvents extends EventTarget {static sources=[]; url; closed=false; onerror; constructor(url){super();this.url=url;FakeEvents.sources.push(this);setTimeout(()=>this.dispatchEvent(new MessageEvent(url.includes('/social/')?'connected':'connect',{data:'{}'})),100);}close(){this.closed=true;} }
window.EventSource=FakeEvents;window.qaEvents=FakeEvents;
const client=new QueryClient({defaultOptions:{queries:{retry:false}}});window.qaClient=client;
function Harness(){const [partner,setPartner]=useState(null);const nav=useNavigate();useSocialEvents(true);if(location.search.includes('edit'))return <React.Suspense fallback={<p>편집 확인 중</p>}><EditPage type="free" editPostId={85} onBack={()=>{}} onSubmit={()=>{}}/></React.Suspense>;if(location.search.includes('missing'))return <MissingPost/>;return <><div className="relative h-20"><NotificationCenter onOpen={()=>{}}/></div><SocialPage onOpenChat={setPartner} onNavigate={v=>nav('/'+v)}/><button onClick={()=>setPartner(other)}>테스트 대화 열기</button><ChatModal isOpen={!!partner} otherUser={partner} onClose={()=>setPartner(null)}/></>}
createRoot(document.getElementById('root')).render(<QueryClientProvider client={client}><BrowserRouter><Harness/></BrowserRouter></QueryClientProvider>);
