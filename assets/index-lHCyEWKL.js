(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))o(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const a of i.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&o(a)}).observe(document,{childList:!0,subtree:!0});function e(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function o(s){if(s.ep)return;s.ep=!0;const i=e(s);fetch(s.href,i)}})();const bt={nodes:new Map,selectedNodeId:null,mode:"editor",previewCurrentNodeId:null,scale:.7,pan:{x:255,y:15}};let z={...bt};const q=new Set;function gt(t){return q.add(t),()=>q.delete(t)}function d(){return z}function u(t){z={...z,...t},q.forEach(n=>n(z))}function U(t){const n=new Map;return t.forEach((e,o)=>{n.set(o,{...e,position:{...e.position},options:e.options.map(s=>({...s}))})}),n}async function yt(){var i;const t=await fetch("./flow_data.json");if(!t.ok)throw new Error(`Failed to load flow data: ${t.status}`);const n=await t.json(),e=new Map;for(const a of n.nodes)e.set(a.id,{id:a.id,type:a.type,text:a.text,position:{...a.position},options:(a.options||[]).map(l=>({label:l.label,nextId:l.nextId}))});const o=[...e.values()].find(a=>a.type==="start"),s=o?o.id:(i=n.nodes[0])==null?void 0:i.id;return u({nodes:e,previewCurrentNodeId:s}),{nodes:e,startNodeId:s}}function wt(t){const n={meta:{theme:"dark",canvas_size:{w:1200,h:800}},nodes:[...t.values()].map(a=>({id:a.id,type:a.type,text:a.text,position:{...a.position},options:a.options.map(l=>({label:l.label,nextId:l.nextId}))}))},e=JSON.stringify(n,null,2),o=new Blob([e],{type:"application/json"}),s=URL.createObjectURL(o),i=document.createElement("a");i.href=s,i.download="flow_data.json",i.click(),URL.revokeObjectURL(s)}const xt=50;let y=[],w=-1;function L(){const{nodes:t}=d();y=y.slice(0,w+1),y.push(U(t)),y.length>xt&&y.shift(),w=y.length-1,F()}function V(){w<=0||(w--,u({nodes:U(y[w])}),F())}function Z(){w>=y.length-1||(w++,u({nodes:U(y[w])}),F())}function Et(){return w>0}function Lt(){return w<y.length-1}const j=new Set;function It(t){return j.add(t),()=>j.delete(t)}function F(){j.forEach(t=>t({canUndo:Et(),canRedo:Lt()}))}function $t(){y=[],w=-1,L()}const Mt="modulepreload",Bt=function(t,n){return new URL(t,n).href},K={},Nt=function(n,e,o){let s=Promise.resolve();if(e&&e.length>0){const a=document.getElementsByTagName("link"),l=document.querySelector("meta[property=csp-nonce]"),c=(l==null?void 0:l.nonce)||(l==null?void 0:l.getAttribute("nonce"));s=Promise.allSettled(e.map(r=>{if(r=Bt(r,o),r in K)return;K[r]=!0;const p=r.endsWith(".css"),x=p?'[rel="stylesheet"]':"";if(!!o)for(let h=a.length-1;h>=0;h--){const $=a[h];if($.href===r&&(!p||$.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${r}"]${x}`))return;const f=document.createElement("link");if(f.rel=p?"stylesheet":Mt,p||(f.as="script"),f.crossOrigin="",f.href=r,c&&f.setAttribute("nonce",c),document.head.appendChild(f),p)return new Promise((h,$)=>{f.addEventListener("load",h),f.addEventListener("error",()=>$(new Error(`Unable to preload CSS for ${r}`)))})}))}function i(a){const l=new Event("vite:preloadError",{cancelable:!0});if(l.payload=a,window.dispatchEvent(l),!l.defaultPrevented)throw a}return s.then(a=>{for(const l of a||[])l.status==="rejected"&&i(l.reason);return n().catch(i)})},st=260;function kt(t){const e=16+Math.ceil(t.text.length/28)*22,o=t.options.length===0?32:8+t.options.length*26;return 40+e+o}function Ct(t){return{x:t.position.x+st/2,y:t.position.y+kt(t)}}function Pt(t){return{x:t.position.x+st/2,y:t.position.y}}function St(t,n){const e=Math.abs(n.y-t.y),o=Math.max(e*.5,60),s=t.x,i=t.y+o,a=n.x,l=n.y-o;return`M ${t.x} ${t.y} C ${s} ${i}, ${a} ${l}, ${n.x} ${n.y}`}const J=document.getElementById("svg-layer");function at(){const{nodes:t,selectedNodeId:n}=d(),e=J.querySelectorAll(".connector");let o=0;t.forEach(s=>{s.options.forEach((i,a)=>{const l=t.get(i.nextId);if(!l)return;let c=Ct(s);const r=Pt(l);if(s.options.length>1){const h=s.options.length,$=200,W=$/(h+1),ht=a*W+W-$/2;c={x:c.x+ht,y:c.y}}const p=St(c,r),x=s.id===n||l.id===n;let v;o<e.length?v=e[o]:(v=document.createElementNS("http://www.w3.org/2000/svg","path"),v.setAttribute("fill","none"),v.setAttribute("stroke-linecap","round"),J.appendChild(v)),o++;const f="connector"+(x?" connector--active":"");v.getAttribute("class")!==f&&(v.setAttribute("class",f),v.setAttribute("stroke",x?"var(--clr-accent-primary)":"var(--clr-connector)"),v.setAttribute("stroke-width",x?"2.5":"1.8"),v.setAttribute("marker-end",x?"url(#arrowhead-active)":"url(#arrowhead)"),x?(v.setAttribute("stroke-dasharray","6 4"),v.style.animation="connectorFlow 0.8s linear infinite"):(v.removeAttribute("stroke-dasharray"),v.style.animation="")),v.getAttribute("d")!==p&&v.setAttribute("d",p)})});for(let s=o;s<e.length;s++)e[s].remove()}const zt=document.getElementById("nodes-layer"),k=new Map;function m(){const{nodes:t,selectedNodeId:n}=d();k.forEach((e,o)=>{t.has(o)||(e.remove(),k.delete(o))}),t.forEach(e=>{k.has(e.id)?Tt(e,n):At(e,n)}),at()}function At(t,n){const e=document.createElement("div");e.id=`node-${t.id}`,e.className=it(t,n),e.style.left=`${t.position.x}px`,e.style.top=`${t.position.y}px`,e.innerHTML=lt(t),e.addEventListener("click",o=>{if(o.target.closest(".node-drag-handle"))return;const s=o.target.closest(".branch-btn");if(s){o.stopPropagation();const i=parseInt(s.dataset.branch,10),a=t.options.length,l=Math.max(150,300/a),c=(i-(a-1)/2)*l;ut(t.position.x+c,t.position.y+180,t.id,i);return}u({selectedNodeId:t.id}),m()}),zt.appendChild(e),k.set(t.id,e)}function Tt(t,n){const e=k.get(t.id);e&&(e.className=it(t,n),e.style.left=`${t.position.x}px`,e.style.top=`${t.position.y}px`,e.innerHTML=lt(t))}function it(t,n){let e=`node-card node-card--${t.type}`;return t.id===n&&(e+=" selected"),e}function lt(t){const e={start:"Start",question:"Question",end:"End"}[t.type]||t.type,o=t.type!=="end"&&t.options.length>0?`
    <div class="binary-options">
      ${t.options.map((i,a)=>`
        <div class="binary-opt ${a<t.options.length-1?"left-opt":""}">${Q(i.label)}</div>
      `).join("")}
    </div>
  `:t.type==="end"?`<div class="node-end-badge">
        <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
          <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm2.3-6.7L7 9.6 5.7 8.3a.75.75 0 0 0-1.06 1.06l1.8 1.8a.75.75 0 0 0 1.06 0l3.8-3.8a.75.75 0 0 0-1.06-1.06z"/>
        </svg>
        End of conversation
      </div>`:"",s=t.type!=="end"?`
    <div class="node-branch-wrapper">
      ${t.options.map((i,a)=>i.nextId?'<div class="branch-spacer"></div>':`
        <div class="branch-btn" data-branch="${a}" title="Link Choice ${a+1}">
          <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 2v12m-6-6h12" stroke="currentColor" stroke-width="2"/></svg>
        </div>
      `).join("")}
    </div>
  `:"";return`
    <div class="node-header">
      <span class="node-badge">${e}</span>
      <span style="font-size: 11px; color: var(--clr-text-muted); font-family: monospace; font-weight: 500; margin-left: auto; margin-right: 8px;">ID: ${t.id}</span>
      <div class="node-drag-handle" title="Drag to move">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="8" cy="8" r="6.5"/>
          <circle cx="8" cy="8" r="2"/>
          <line x1="8" y1="1.5" x2="8" y2="6"/>
          <line x1="3.5" y1="11.5" x2="6.6" y2="9.2"/>
          <line x1="12.5" y1="11.5" x2="9.4" y2="9.2"/>
        </svg>
      </div>
    </div>
    <div class="node-body">
      <p class="node-text">${Q(t.text)}</p>
    </div>
    ${o}
    ${s}
  `}function Q(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}const P=document.getElementById("preview-overlay");let g=[],M=[];function Ht(){const{nodes:t}=d(),n=[...t.values()].find(e=>e.type==="start")||[...t.values()][0];n&&(g=[],M=[],u({previewCurrentNodeId:n.id}),P.classList.remove("hidden"),A())}function ct(){P.classList.add("hidden"),g=[],M=[]}function A(){const{nodes:t,previewCurrentNodeId:n}=d(),e=t.get(n);P.innerHTML=`
    <div class="chat-window">
      ${Ot()}
      <div class="chat-messages" id="chat-messages">
        ${g.map(_t).join("")}
      </div>
      ${e?Dt(e):""}
    </div>
  `;const o=document.getElementById("chat-messages");o&&(o.scrollTop=o.scrollHeight),Rt()}function Ot(){return`
    <div class="chat-header">
      <div class="chat-avatar">🤖</div>
      <div class="chat-bot-info">
        <div class="chat-bot-name">SupportFlow Bot</div>
        <div class="chat-bot-status">
          <span class="chat-status-dot"></span>
          Online · Preview Mode
        </div>
      </div>
      <button class="chat-close-btn" id="chat-close-btn" title="Exit preview">
        <svg viewBox="0 0 16 16" fill="currentColor">
          <path d="M4.22 4.22a.75.75 0 0 1 1.06 0L8 6.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L9.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L8 9.06l-2.72 2.72a.75.75 0 0 1-1.06-1.06L6.94 8 4.22 5.28a.75.75 0 0 1 0-1.06z"/>
        </svg>
      </button>
    </div>
  `}function _t({from:t,text:n}){return t==="bot"?`
      <div class="msg msg--bot">
        <div class="msg-avatar">🤖</div>
        <div class="msg-bubble">${T(n)}</div>
      </div>
    `:`
    <div class="msg msg--user">
      <div class="msg-bubble">${T(n)}</div>
    </div>
  `}function Dt(t){return t.options.length===0?`
      <div class="chat-end-section">
        <div class="chat-end-icon">✅</div>
        <div class="chat-end-label">End of conversation</div>
        <button class="chat-restart-btn" id="chat-restart-btn">↺ Restart</button>
        ${M.length>0?`
          <button class="chat-back-btn-end" style="margin-top: 8px; background: transparent; border: 1px solid var(--clr-border); padding: 8px 16px; border-radius: 6px; cursor: pointer; color: var(--clr-text-secondary); width: 100%;">↩ Go Back</button>
        `:""}
      </div>
    `:`
    <div class="chat-options">
      <div class="chat-options-label">Choose a response:</div>
      ${t.options.map((n,e)=>`
        <button class="chat-option-btn" data-next="${n.nextId}" data-label="${T(n.label)}">
          ${T(n.label)}
          <span class="chat-option-arrow">›</span>
        </button>
      `).join("")}
      ${M.length>0?`
        <button class="chat-option-btn chat-back-btn" style="background: rgba(255,255,255,0.05); border: 1px solid var(--clr-border); color: var(--clr-text-secondary);">
          Go Back
          <span class="chat-option-arrow">↩</span>
        </button>
      `:""}
    </div>
  `}function Rt(t){var n,e;(n=document.getElementById("chat-close-btn"))==null||n.addEventListener("click",()=>{ct(),u({mode:"editor"}),window.dispatchEvent(new CustomEvent("previewStopped"))}),(e=document.getElementById("chat-restart-btn"))==null||e.addEventListener("click",()=>{Ht()}),P.querySelectorAll(".chat-option-btn, .chat-back-btn-end").forEach(o=>{o.addEventListener("click",()=>{if(o.classList.contains("chat-back-btn")||o.classList.contains("chat-back-btn-end")){const p=M.pop();p&&(u({previewCurrentNodeId:p}),g.splice(-2),A());return}const s=o.dataset.next,i=o.dataset.label,{nodes:a,previewCurrentNodeId:l}=d(),c=a.get(l);(g.length===0||g[g.length-1].from!=="bot")&&g.push({from:"bot",text:(c==null?void 0:c.text)||""}),M.push(l),g.push({from:"user",text:i});const r=a.get(s);r&&(g.push({from:"bot",text:r.text}),u({previewCurrentNodeId:s})),A()})})}function qt(){const{nodes:t}=d(),n=[...t.values()].find(e=>e.type==="start")||[...t.values()][0];n&&(g=[{from:"bot",text:n.text}],M=[],u({previewCurrentNodeId:n.id}),P.classList.remove("hidden"),A())}function T(t){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}const I=document.getElementById("canvas-wrapper"),jt=document.getElementById("canvas"),rt=.25,dt=2.5;let H=!1,Y={x:0,y:0},X={x:0,y:0};function Yt(){I.addEventListener("pointerdown",Xt),window.addEventListener("pointermove",Ut),window.addEventListener("pointerup",Ft),I.addEventListener("wheel",Wt,{passive:!1}),B()}function Xt(t){if(t.target.closest(".node-card")||t.target.closest(".zoom-controls"))return;H=!0,Y={x:t.clientX,y:t.clientY};const{pan:n}=d();X={...n},I.classList.add("grabbing"),t.preventDefault()}function Ut(t){if(!H)return;const n=t.clientX-Y.x,e=t.clientY-Y.y,o={x:X.x+n,y:X.y+e};u({pan:o}),B()}function Ft(){H&&(H=!1,I.classList.remove("grabbing"))}function Wt(t){t.preventDefault();const{scale:n,pan:e}=d(),o=I.getBoundingClientRect(),s=t.clientX-o.left,i=t.clientY-o.top,a=(s-e.x)/n,l=(i-e.y)/n,c=t.deltaY<0?1.1:.9,r=Math.min(dt,Math.max(rt,n*c)),p={x:s-a*r,y:i-l*r};u({scale:r,pan:p}),B(),O()}function B(){const{scale:t,pan:n}=d();jt.style.transform=`translate(${n.x}px, ${n.y}px) scale(${t})`}function G(){u({scale:.7,pan:{x:255,y:65}}),B(),O()}function tt(){const{scale:t,pan:n}=d(),e=Math.min(dt,t*1.2),o=I.clientWidth/2,s=I.clientHeight/2,i=(o-n.x)/t,a=(s-n.y)/t;u({scale:e,pan:{x:o-i*e,y:s-a*e}}),B(),O()}function et(){const{scale:t,pan:n}=d(),e=Math.max(rt,t*.8),o=I.clientWidth/2,s=I.clientHeight/2,i=(o-n.x)/t,a=(s-n.y)/t;u({scale:e,pan:{x:o-i*e,y:s-a*e}}),B(),O()}function O(){const t=document.getElementById("zoom-level");t&&(t.textContent=`${Math.round(d().scale*100)}%`)}const Vt=document.getElementById("toolbar");function Zt(){Vt.innerHTML=Kt(),Jt(),It(({canUndo:t,canRedo:n})=>{document.getElementById("btn-undo").disabled=!t,document.getElementById("btn-redo").disabled=!n}),E()}function E(){const t=document.getElementById("toolbar-node-count");if(t){const{nodes:n}=d();t.innerHTML=`<strong>${n.size}</strong> nodes`}}function Kt(){return`
    <!-- Logo -->
    <div class="toolbar-logo">
      <span class="toolbar-logo-text">SupportFlow</span>
      <span class="toolbar-logo-badge">Visual Builder</span>
    </div>

    <!-- Stats -->
    <span class="toolbar-stats" id="toolbar-node-count">— nodes</span>

    <div class="toolbar-divider"></div>

    <!-- Undo / Redo group -->
    <div class="toolbar-history-group">
      <button class="toolbar-btn" id="btn-undo" title="Undo (Ctrl+Z)" disabled>
        <svg viewBox="0 0 16 16" fill="currentColor">
          <path d="M2.5 6.5A5.5 5.5 0 0 1 8 1a5.5 5.5 0 0 1 5.5 5.5H12a4 4 0 0 0-4-4 4 4 0 0 0-4 4v.086l1.646-1.647a.75.75 0 0 1 1.061 1.061l-3 3a.75.75 0 0 1-1.061 0l-3-3A.75.75 0 0 1 1.707 4.94L3.5 6.732V6.5z"/>
          <path d="M5.5 10a.75.75 0 0 1 .75-.75h5.5a.75.75 0 0 1 0 1.5h-5.5A.75.75 0 0 1 5.5 10z"/>
        </svg>
        Undo
      </button>
      <button class="toolbar-btn" id="btn-redo" title="Redo (Ctrl+Y)" disabled>
        <svg viewBox="0 0 16 16" fill="currentColor">
          <path d="M13.5 6.5A5.5 5.5 0 0 0 8 1a5.5 5.5 0 0 0-5.5 5.5H4a4 4 0 0 1 4-4 4 4 0 0 1 4 4v.086l-1.646-1.647a.75.75 0 1 0-1.061 1.061l3 3a.75.75 0 0 0 1.061 0l3-3a.75.75 0 1 0-1.061-1.061L13.5 6.586V6.5z"/>
          <path d="M10.5 10a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0 0 1.5h5.5a.75.75 0 0 0 .75-.75z"/>
        </svg>
        Redo
      </button>
    </div>

    <div class="toolbar-divider"></div>

    <!-- Add Node -->
    <button class="toolbar-btn toolbar-btn--add" id="btn-add-node" title="Add a new question node">
      <svg viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2z"/>
      </svg>
      Add Node
    </button>
    
    <!-- New Workflow -->
    <button class="toolbar-btn" id="btn-new-flow" title="Clear canvas and start fresh">
      <svg viewBox="0 0 16 16" fill="currentColor">
        <path d="M2.5 1h11a1.5 1.5 0 0 1 1.5 1.5v11a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 13.5v-11A1.5 1.5 0 0 1 2.5 1zm11 .5h-11a.5.5 0 0 0-.5.5v11c0 .28.22.5.5.5h11a.5.5 0 0 0 .5-.5v-11a.5.5 0 0 0-.5-.5zM8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
      </svg>
      New Workflow
    </button>

    <!-- Export -->
    <button class="toolbar-btn toolbar-btn--export" id="btn-export" title="Export flow as JSON">
      <svg viewBox="0 0 16 16" fill="currentColor">
        <path d="M7.47 10.78a.75.75 0 0 0 1.06 0l3.75-3.75a.75.75 0 0 0-1.06-1.06L8.75 8.44V1.75a.75.75 0 0 0-1.5 0v6.69L4.78 5.97a.75.75 0 0 0-1.06 1.06l3.75 3.75z"/>
        <path d="M3.75 13a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5z"/>
      </svg>
      Export JSON
    </button>

    <div class="toolbar-divider"></div>

    <!-- Play / Stop -->
    <button class="toolbar-btn toolbar-btn--play" id="btn-play">
      <svg viewBox="0 0 16 16" fill="currentColor" id="play-icon">
        <path d="M3.75 2a.75.75 0 0 0-.75.75v10.5a.75.75 0 0 0 1.14.642l9-5.25a.75.75 0 0 0 0-1.284l-9-5.25A.75.75 0 0 0 3.75 2z"/>
      </svg>
      <span id="play-label">Preview</span>
    </button>
  `}function Jt(){var n;document.getElementById("btn-undo").addEventListener("click",()=>{V(),m(),E()}),document.getElementById("btn-redo").addEventListener("click",()=>{Z(),m(),E()}),window.addEventListener("keydown",e=>{(e.ctrlKey||e.metaKey)&&(e.key==="z"&&!e.shiftKey&&(e.preventDefault(),V(),m(),E()),(e.key==="y"||e.key==="z"&&e.shiftKey)&&(e.preventDefault(),Z(),m(),E()))}),document.getElementById("btn-add-node").addEventListener("click",()=>ut()),(n=document.getElementById("btn-new-flow"))==null||n.addEventListener("click",()=>{if(confirm("Are you sure you want to clear the canvas and create a new workflow from scratch? All unsaved progress will be lost.")){const e={id:"1",type:"start",text:"Welcome to Support. How can we help you?",position:{x:500,y:50},options:[]},o=new Map;o.set("1",e),u({nodes:o,selectedNodeId:"1"}),L(),m(),E(),Nt(()=>Promise.resolve().then(()=>ae),void 0,import.meta.url).then(s=>{s.openPanel("1")})}}),document.getElementById("btn-export").addEventListener("click",()=>{wt(d().nodes)});const t=document.getElementById("btn-play");t.addEventListener("click",()=>{const{mode:e}=d();if(e==="editor"){u({mode:"preview"}),qt(),t.classList.add("active"),document.getElementById("play-label").textContent="Stop";const o=document.getElementById("play-icon");o.innerHTML='<path d="M3.25 2.75a.75.75 0 0 0-.75.75v9a.75.75 0 0 0 1.5 0v-9a.75.75 0 0 0-.75-.75zm9.5 0a.75.75 0 0 0-.75.75v9a.75.75 0 0 0 1.5 0v-9a.75.75 0 0 0-.75-.75z"/>'}else{u({mode:"editor"}),ct(),t.classList.remove("active"),document.getElementById("play-label").textContent="Preview";const o=document.getElementById("play-icon");o.innerHTML='<path d="M3.75 2a.75.75 0 0 0-.75.75v10.5a.75.75 0 0 0 1.14.642l9-5.25a.75.75 0 0 0 0-1.284l-9-5.25A.75.75 0 0 0 3.75 2z"/>'}}),window.addEventListener("previewStopped",()=>{t.classList.remove("active"),document.getElementById("play-label").textContent="Preview";const e=document.getElementById("play-icon");e.innerHTML='<path d="M3.75 2a.75.75 0 0 0-.75.75v10.5a.75.75 0 0 0 1.14.642l9-5.25a.75.75 0 0 0 0-1.284l-9-5.25A.75.75 0 0 0 3.75 2z"/>'})}function ut(t,n,e=null,o=null){const{nodes:s,pan:i,scale:a}=d();let l=t,c=n;if(l===void 0||c===void 0){const f=document.getElementById("canvas-wrapper");l=Math.max(0,(f.clientWidth/2-i.x)/a-130),c=Math.max(0,(f.clientHeight/2-i.y)/a-50)}const r=[...s.keys()].reduce((f,h)=>Math.max(f,parseInt(h,10)||0),0),p=String(r+1),x={id:p,type:"question",text:"New question",position:{x:l,y:c},options:[]},v=new Map(s);if(e&&o!==null){const f=v.get(e);if(f){const h=[...f.options];h[o]&&(h[o].nextId=p),v.set(e,{...f,options:h})}}v.set(p,x),u({nodes:v,selectedNodeId:p}),L(),m(),E()}const Qt=document.getElementById("nodes-layer");document.getElementById("canvas-wrapper");let b=null;function Gt(){Qt.addEventListener("pointerdown",te),window.addEventListener("pointermove",ee),window.addEventListener("pointerup",ne)}function te(t){const n=t.target.closest(".node-drag-handle");if(!n)return;const e=n.closest(".node-card");if(!e)return;const o=e.id.replace("node-",""),{nodes:s,scale:i}=d(),a=s.get(o);a&&(t.preventDefault(),e.classList.add("dragging"),e.setPointerCapture(t.pointerId),b={nodeId:o,pointerId:t.pointerId,startPointerX:t.clientX,startPointerY:t.clientY,startNodeX:a.position.x,startNodeY:a.position.y},u({selectedNodeId:o}))}function ee(t){if(!b)return;const{scale:n}=d(),e=(t.clientX-b.startPointerX)/n,o=(t.clientY-b.startPointerY)/n,s=Math.max(0,b.startNodeX+e),i=Math.max(0,b.startNodeY+o),{nodes:a}=d(),l=a.get(b.nodeId);if(!l)return;const c={...l,position:{x:s,y:i}},r=new Map(a);r.set(b.nodeId,c),u({nodes:r});const p=document.getElementById(`node-${b.nodeId}`);p&&(p.style.left=`${s}px`,p.style.top=`${i}px`),at()}function ne(t){if(!b)return;const n=document.getElementById(`node-${b.nodeId}`);n&&n.classList.remove("dragging"),L(),b=null}let N=null;function _(){return N||(N=document.getElementById("edit-panel")),N}let S=null;function pt(t){const n=_();n&&(window.addEventListener("keydown",e=>{e.key==="Escape"&&n.classList.contains("open")&&C()}),document.getElementById("canvas-wrapper").addEventListener("click",e=>{!e.target.closest(".node-card")&&!e.target.closest("#edit-panel")&&C()}),window._onNodeDelete=t)}function vt(t){const{nodes:n}=d(),e=n.get(t),o=_();!e||!o||(o.innerHTML=ft(e,n),o.classList.add("open"),mt(t))}function C(){const t=_();t&&t.classList.remove("open"),u({selectedNodeId:null}),m()}function D(){const{selectedNodeId:t,nodes:n}=d(),e=_();if(e&&t&&e.classList.contains("open")){const o=n.get(t);o&&(e.innerHTML=ft(o,n),mt(t))}}function ft(t,n){const o={start:"#7c6cfc",question:"#3b82f6",end:"#f59e0b"}[t.type]||"#64748b",s=[...n.values()].filter(a=>a.id!==t.id);let i="";return t.type!=="end"&&(i=t.options.map((a,l)=>`
      <div class="option-row" data-idx="${l}">
        <input
          class="field-input option-label-input"
          type="text"
          value="${R(a.label)}"
          placeholder="Path ${l+1} Label"
          data-idx="${l}"
        />
        <select class="option-nexid-select ${a.label.trim()?"show":""} ${a.nextId?"":"unassigned-blink"}" data-idx="${l}" title="Next node">
          <option value="">Connect ➔</option>
          ${s.map(c=>{const r=c.text.length>20?c.text.substring(0,20)+"...":c.text;return`<option value="${c.id}" ${c.id===a.nextId?"selected":""}>ID: ${c.id} - ${R(r)}</option>`}).join("")}
        </select>
        <button class="option-remove-btn" data-idx="${l}" title="Remove option">
          <svg viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.22 4.22a.75.75 0 0 1 1.06 0L8 6.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L9.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L8 9.06l-2.72 2.72a.75.75 0 0 1-1.06-1.06L6.94 8 4.22 5.28a.75.75 0 0 1 0-1.06z"/>
          </svg>
        </button>
      </div>
    `).join("")),`
    <div class="panel-header">
      <div class="panel-title">
        <span class="panel-title-badge" style="background:${o}22;color:${o}">
          ${t.type.toUpperCase()}
        </span>
        Edit Node
      </div>
      <button class="panel-close-btn" id="panel-close-btn" title="Close panel (Esc)">
        <svg viewBox="0 0 16 16" fill="currentColor">
          <path d="M4.22 4.22a.75.75 0 0 1 1.06 0L8 6.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L9.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L8 9.06l-2.72 2.72a.75.75 0 0 1-1.06-1.06L6.94 8 4.22 5.28a.75.75 0 0 1 0-1.06z"/>
        </svg>
      </button>
    </div>

    <div class="panel-body">

      <div class="field-group">
        <label class="field-label" for="node-text-input">Question / Message</label>
        <textarea class="field-textarea" id="node-text-input" rows="3"
          placeholder="Enter the bot's message...">${R(t.text)}</textarea>
      </div>

      <div class="field-group">
        <label class="field-label" for="node-type-select">Node Type</label>
        <select class="field-select" id="node-type-select">
          <option value="start"    ${t.type==="start"?"selected":""}>▶ Start</option>
          <option value="question" ${t.type==="question"?"selected":""}>❓ Question</option>
          <option value="end"      ${t.type==="end"?"selected":""}>✅ End</option>
        </select>
      </div>

      ${t.type!=="end"?`
        <div class="field-group">
          <label class="field-label">Routing Paths</label>
          <div class="options-list" id="options-list">
            ${i}
          </div>
          <button class="add-option-btn" id="add-option-btn">
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2z"/>
            </svg>
            Add Choice
          </button>
        </div>
      `:""}

      <div class="panel-node-id">Node ID: ${t.id}</div>
    </div>

    <div class="panel-footer">
      ${t.type!=="start"?`<button class="panel-btn panel-btn--delete" id="panel-delete-btn">
            🗑 Delete Node
          </button>`:""}
    </div>
  `}function mt(t){var e,o,s,i;(e=document.getElementById("panel-close-btn"))==null||e.addEventListener("click",C);const n=document.getElementById("node-text-input");n==null||n.addEventListener("input",()=>{clearTimeout(S),S=setTimeout(()=>{nt(t,"text",n.value)},150)}),(o=document.getElementById("node-type-select"))==null||o.addEventListener("change",a=>{nt(t,"type",a.target.value),L(),D()}),N.querySelectorAll(".option-label-input").forEach(a=>{a.addEventListener("input",()=>{const l=a.parentElement.querySelector(".option-nexid-select");a.value.trim()!==""?l==null||l.classList.add("show"):l==null||l.classList.remove("show"),clearTimeout(S),S=setTimeout(()=>ot(t,+a.dataset.idx,"label",a.value),150)})}),N.querySelectorAll(".option-nexid-select").forEach(a=>{a.addEventListener("change",()=>{ot(t,+a.dataset.idx,"nextId",a.value),L()})}),N.querySelectorAll(".option-remove-btn").forEach(a=>{a.addEventListener("click",()=>{oe(t,+a.dataset.idx)})}),(s=document.getElementById("add-option-btn"))==null||s.addEventListener("click",()=>{se(t)}),(i=document.getElementById("panel-delete-btn"))==null||i.addEventListener("click",()=>{window._onNodeDelete&&window._onNodeDelete(t)})}function nt(t,n,e){const{nodes:o}=d(),s=o.get(t);if(!s)return;const i=new Map(o);i.set(t,{...s,[n]:e}),u({nodes:i}),m()}function ot(t,n,e,o){const{nodes:s}=d(),i=s.get(t);if(!i)return;const a=i.options.map((c,r)=>r===n?{...c,[e]:o}:c),l=new Map(s);l.set(t,{...i,options:a}),u({nodes:l}),m()}function oe(t,n){const{nodes:e}=d(),o=e.get(t);if(!o)return;const s=o.options.filter((a,l)=>l!==n),i=new Map(e);i.set(t,{...o,options:s}),u({nodes:i}),L(),D(),m()}function se(t){const{nodes:n}=d(),e=n.get(t);if(!e)return;const o={label:"",nextId:null},s=new Map(n);s.set(t,{...e,options:[...e.options,o]}),u({nodes:s}),L(),D(),m()}function R(t){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}const ae=Object.freeze(Object.defineProperty({__proto__:null,closePanel:C,initEditPanel:pt,openPanel:vt,refreshPanel:D},Symbol.toStringTag,{value:"Module"}));function ie(){const t=document.getElementById("canvas-wrapper"),n=document.createElement("div");n.className="zoom-controls",n.innerHTML=`
    <button class="zoom-btn" id="zoom-in-btn"  title="Zoom in (+)">+</button>
    <div    class="zoom-level" id="zoom-level"  title="Reset zoom">100%</div>
    <button class="zoom-btn" id="zoom-out-btn" title="Zoom out (−)">−</button>
  `,t.appendChild(n),document.getElementById("zoom-in-btn").addEventListener("click",tt),document.getElementById("zoom-out-btn").addEventListener("click",et),document.getElementById("zoom-level").addEventListener("click",G),window.addEventListener("keydown",o=>{(o.key==="="||o.key==="+")&&tt(),(o.key==="-"||o.key==="_")&&et(),o.key==="0"&&G()});const e=document.createElement("div");e.className="canvas-hint",e.textContent="Scroll to zoom · Drag to pan · Click node to edit",t.appendChild(e),setTimeout(()=>{e.style.transition="opacity 0.5s ease",e.style.opacity="0",setTimeout(()=>e.remove(),500)},4e3)}async function le(){try{await yt(),$t(),Zt(),Yt(),B(),Gt(),m(),pt(ce),ie();let t=null;gt(n=>{n.selectedNodeId!==t&&(n.selectedNodeId&&vt(n.selectedNodeId),t=n.selectedNodeId),E()}),console.log("✅ SupportFlow Visual Builder ready")}catch(t){console.error("Boot failed:",t),re(t.message)}}function ce(t){if(!confirm("Delete this node? This cannot be undone until you undo."))return;const{nodes:n}=d(),e=new Map(n);e.delete(t),e.forEach(o=>{const s=o.options.filter(i=>i.nextId!==t);s.length!==o.options.length&&e.set(o.id,{...o,options:s})}),u({nodes:e,selectedNodeId:null}),L(),C(),m(),E()}function re(t){document.body.innerHTML=`
    <div style="display:flex;align-items:center;justify-content:center;height:100vh;
                font-family:Inter,sans-serif;background:#0b0d14;color:#ef4444;
                flex-direction:column;gap:16px;text-align:center;padding:24px;">
      <div style="font-size:48px;">⚠️</div>
      <div style="font-size:18px;font-weight:600;color:#f1f5f9">Failed to load SupportFlow</div>
      <div style="font-size:14px;color:#64748b;max-width:400px">${t}</div>
      <div style="font-size:12px;color:#475569">Make sure you're running via a dev server (npm run dev)</div>
    </div>
  `}le();
