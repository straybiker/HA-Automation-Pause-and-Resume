/*! automation-pause-card | MIT | https://github.com/straybiker/HA-Automation-Pause-and-Resume | bundles Lit (BSD-3-Clause) and @mdi/js icons (Apache-2.0) */
var r5=Object.defineProperty;var e5=Object.getOwnPropertyDescriptor;var o=(L,H,C,V)=>{for(var M=V>1?void 0:V?e5(H,C):H,r=L.length-1,e;r>=0;r--)(e=L[r])&&(M=(V?e(H,C,M):e(M))||M);return V&&M&&r5(H,C,M),M};var t1=globalThis,i1=t1.ShadowRoot&&(t1.ShadyCSS===void 0||t1.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,k1=Symbol(),G1=new WeakMap,J=class{constructor(H,C,V){if(this._$cssResult$=!0,V!==k1)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=H,this.t=C}get styleSheet(){let H=this.o,C=this.t;if(i1&&H===void 0){let V=C!==void 0&&C.length===1;V&&(H=G1.get(C)),H===void 0&&((this.o=H=new CSSStyleSheet).replaceSync(this.cssText),V&&G1.set(C,H))}return H}toString(){return this.cssText}},Q1=L=>new J(typeof L=="string"?L:L+"",void 0,k1),S=(L,...H)=>{let C=L.length===1?L[0]:H.reduce((V,M,r)=>V+(e=>{if(e._$cssResult$===!0)return e.cssText;if(typeof e=="number")return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(M)+L[r+1],L[0]);return new J(C,L,k1)},K1=(L,H)=>{if(i1)L.adoptedStyleSheets=H.map(C=>C instanceof CSSStyleSheet?C:C.styleSheet);else for(let C of H){let V=document.createElement("style"),M=t1.litNonce;M!==void 0&&V.setAttribute("nonce",M),V.textContent=C.cssText,L.appendChild(V)}},b1=i1?L=>L:L=>L instanceof CSSStyleSheet?(H=>{let C="";for(let V of H.cssRules)C+=V.cssText;return Q1(C)})(L):L;var{is:t5,defineProperty:i5,getOwnPropertyDescriptor:o5,getOwnPropertyNames:a5,getOwnPropertySymbols:A5,getPrototypeOf:d5}=Object,o1=globalThis,q1=o1.trustedTypes,p5=q1?q1.emptyScript:"",m5=o1.reactiveElementPolyfillSupport,C1=(L,H)=>L,H1={toAttribute(L,H){switch(H){case Boolean:L=L?p5:null;break;case Object:case Array:L=L==null?L:JSON.stringify(L)}return L},fromAttribute(L,H){let C=L;switch(H){case Boolean:C=L!==null;break;case Number:C=L===null?null:Number(L);break;case Object:case Array:try{C=JSON.parse(L)}catch{C=null}}return C}},a1=(L,H)=>!t5(L,H),j1={attribute:!0,type:String,converter:H1,reflect:!1,useDefault:!1,hasChanged:a1};Symbol.metadata??=Symbol("metadata"),o1.litPropertyMetadata??=new WeakMap;var R=class extends HTMLElement{static addInitializer(H){this._$Ei(),(this.l??=[]).push(H)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(H,C=j1){if(C.state&&(C.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(H)&&((C=Object.create(C)).wrapped=!0),this.elementProperties.set(H,C),!C.noAccessor){let V=Symbol(),M=this.getPropertyDescriptor(H,V,C);M!==void 0&&i5(this.prototype,H,M)}}static getPropertyDescriptor(H,C,V){let{get:M,set:r}=o5(this.prototype,H)??{get(){return this[C]},set(e){this[C]=e}};return{get:M,set(e){let i=M?.call(this);r?.call(this,e),this.requestUpdate(H,i,V)},configurable:!0,enumerable:!0}}static getPropertyOptions(H){return this.elementProperties.get(H)??j1}static _$Ei(){if(this.hasOwnProperty(C1("elementProperties")))return;let H=d5(this);H.finalize(),H.l!==void 0&&(this.l=[...H.l]),this.elementProperties=new Map(H.elementProperties)}static finalize(){if(this.hasOwnProperty(C1("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(C1("properties"))){let C=this.properties,V=[...a5(C),...A5(C)];for(let M of V)this.createProperty(M,C[M])}let H=this[Symbol.metadata];if(H!==null){let C=litPropertyMetadata.get(H);if(C!==void 0)for(let[V,M]of C)this.elementProperties.set(V,M)}this._$Eh=new Map;for(let[C,V]of this.elementProperties){let M=this._$Eu(C,V);M!==void 0&&this._$Eh.set(M,C)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(H){let C=[];if(Array.isArray(H)){let V=new Set(H.flat(1/0).reverse());for(let M of V)C.unshift(b1(M))}else H!==void 0&&C.push(b1(H));return C}static _$Eu(H,C){let V=C.attribute;return V===!1?void 0:typeof V=="string"?V:typeof H=="string"?H.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(H=>this.enableUpdating=H),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(H=>H(this))}addController(H){(this._$EO??=new Set).add(H),this.renderRoot!==void 0&&this.isConnected&&H.hostConnected?.()}removeController(H){this._$EO?.delete(H)}_$E_(){let H=new Map,C=this.constructor.elementProperties;for(let V of C.keys())this.hasOwnProperty(V)&&(H.set(V,this[V]),delete this[V]);H.size>0&&(this._$Ep=H)}createRenderRoot(){let H=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return K1(H,this.constructor.elementStyles),H}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(H=>H.hostConnected?.())}enableUpdating(H){}disconnectedCallback(){this._$EO?.forEach(H=>H.hostDisconnected?.())}attributeChangedCallback(H,C,V){this._$AK(H,V)}_$ET(H,C){let V=this.constructor.elementProperties.get(H),M=this.constructor._$Eu(H,V);if(M!==void 0&&V.reflect===!0){let r=(V.converter?.toAttribute!==void 0?V.converter:H1).toAttribute(C,V.type);this._$Em=H,r==null?this.removeAttribute(M):this.setAttribute(M,r),this._$Em=null}}_$AK(H,C){let V=this.constructor,M=V._$Eh.get(H);if(M!==void 0&&this._$Em!==M){let r=V.getPropertyOptions(M),e=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:H1;this._$Em=M;let i=e.fromAttribute(C,r.type);this[M]=i??this._$Ej?.get(M)??i,this._$Em=null}}requestUpdate(H,C,V,M=!1,r){if(H!==void 0){let e=this.constructor;if(M===!1&&(r=this[H]),V??=e.getPropertyOptions(H),!((V.hasChanged??a1)(r,C)||V.useDefault&&V.reflect&&r===this._$Ej?.get(H)&&!this.hasAttribute(e._$Eu(H,V))))return;this.C(H,C,V)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(H,C,{useDefault:V,reflect:M,wrapped:r},e){V&&!(this._$Ej??=new Map).has(H)&&(this._$Ej.set(H,e??C??this[H]),r!==!0||e!==void 0)||(this._$AL.has(H)||(this.hasUpdated||V||(C=void 0),this._$AL.set(H,C)),M===!0&&this._$Em!==H&&(this._$Eq??=new Set).add(H))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(C){Promise.reject(C)}let H=this.scheduleUpdate();return H!=null&&await H,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[M,r]of this._$Ep)this[M]=r;this._$Ep=void 0}let V=this.constructor.elementProperties;if(V.size>0)for(let[M,r]of V){let{wrapped:e}=r,i=this[M];e!==!0||this._$AL.has(M)||i===void 0||this.C(M,void 0,r,i)}}let H=!1,C=this._$AL;try{H=this.shouldUpdate(C),H?(this.willUpdate(C),this._$EO?.forEach(V=>V.hostUpdate?.()),this.update(C)):this._$EM()}catch(V){throw H=!1,this._$EM(),V}H&&this._$AE(C)}willUpdate(H){}_$AE(H){this._$EO?.forEach(C=>C.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(H)),this.updated(H)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(H){return!0}update(H){this._$Eq&&=this._$Eq.forEach(C=>this._$ET(C,this[C])),this._$EM()}updated(H){}firstUpdated(H){}};R.elementStyles=[],R.shadowRootOptions={mode:"open"},R[C1("elementProperties")]=new Map,R[C1("finalized")]=new Map,m5?.({ReactiveElement:R}),(o1.reactiveElementVersions??=[]).push("2.1.2");var w1=globalThis,Y1=L=>L,A1=w1.trustedTypes,X1=A1?A1.createPolicy("lit-html",{createHTML:L=>L}):void 0,B1="$lit$",F=`lit$${Math.random().toFixed(9).slice(2)}$`,P1="?"+F,n5=`<${P1}>`,$=document,L1=()=>$.createComment(""),M1=L=>L===null||typeof L!="object"&&typeof L!="function",T1=Array.isArray,M2=L=>T1(L)||typeof L?.[Symbol.iterator]=="function",y1=`[ 	
\f\r]`,V1=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,J1=/-->/g,C2=/>/g,E=RegExp(`>|${y1}(?:([^\\s"'>=/]+)(${y1}*=${y1}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),H2=/'/g,V2=/"/g,r2=/^(?:script|style|textarea|title)$/i,R1=L=>(H,...C)=>({_$litType$:L,strings:H,values:C}),a=R1(1),q5=R1(2),j5=R1(3),O=Symbol.for("lit-noChange"),d=Symbol.for("lit-nothing"),L2=new WeakMap,I=$.createTreeWalker($,129);function e2(L,H){if(!T1(L)||!L.hasOwnProperty("raw"))throw Error("invalid template strings array");return X1!==void 0?X1.createHTML(H):H}var t2=(L,H)=>{let C=L.length-1,V=[],M,r=H===2?"<svg>":H===3?"<math>":"",e=V1;for(let i=0;i<C;i++){let t=L[i],p,l,A=-1,v=0;for(;v<t.length&&(e.lastIndex=v,l=e.exec(t),l!==null);)v=e.lastIndex,e===V1?l[1]==="!--"?e=J1:l[1]!==void 0?e=C2:l[2]!==void 0?(r2.test(l[2])&&(M=RegExp("</"+l[2],"g")),e=E):l[3]!==void 0&&(e=E):e===E?l[0]===">"?(e=M??V1,A=-1):l[1]===void 0?A=-2:(A=e.lastIndex-l[2].length,p=l[1],e=l[3]===void 0?E:l[3]==='"'?V2:H2):e===V2||e===H2?e=E:e===J1||e===C2?e=V1:(e=E,M=void 0);let n=e===E&&L[i+1].startsWith("/>")?" ":"";r+=e===V1?t+n5:A>=0?(V.push(p),t.slice(0,A)+B1+t.slice(A)+F+n):t+F+(A===-2?i:n)}return[e2(L,r+(L[C]||"<?>")+(H===2?"</svg>":H===3?"</math>":"")),V]},r1=class L{constructor({strings:H,_$litType$:C},V){let M;this.parts=[];let r=0,e=0,i=H.length-1,t=this.parts,[p,l]=t2(H,C);if(this.el=L.createElement(p,V),I.currentNode=this.el.content,C===2||C===3){let A=this.el.content.firstChild;A.replaceWith(...A.childNodes)}for(;(M=I.nextNode())!==null&&t.length<i;){if(M.nodeType===1){if(M.hasAttributes())for(let A of M.getAttributeNames())if(A.endsWith(B1)){let v=l[e++],n=M.getAttribute(A).split(F),s=/([.?@])?(.*)/.exec(v);t.push({type:1,index:r,name:s[2],strings:n,ctor:s[1]==="."?p1:s[1]==="?"?m1:s[1]==="@"?n1:W}),M.removeAttribute(A)}else A.startsWith(F)&&(t.push({type:6,index:r}),M.removeAttribute(A));if(r2.test(M.tagName)){let A=M.textContent.split(F),v=A.length-1;if(v>0){M.textContent=A1?A1.emptyScript:"";for(let n=0;n<v;n++)M.append(A[n],L1()),I.nextNode(),t.push({type:2,index:++r});M.append(A[v],L1())}}}else if(M.nodeType===8)if(M.data===P1)t.push({type:2,index:r});else{let A=-1;for(;(A=M.data.indexOf(F,A+1))!==-1;)t.push({type:7,index:r}),A+=F.length-1}r++}}static createElement(H,C){let V=$.createElement("template");return V.innerHTML=H,V}};function N(L,H,C=L,V){if(H===O)return H;let M=V!==void 0?C._$Co?.[V]:C._$Cl,r=M1(H)?void 0:H._$litDirective$;return M?.constructor!==r&&(M?._$AO?.(!1),r===void 0?M=void 0:(M=new r(L),M._$AT(L,C,V)),V!==void 0?(C._$Co??=[])[V]=M:C._$Cl=M),M!==void 0&&(H=N(L,M._$AS(L,H.values),M,V)),H}var d1=class{constructor(H,C){this._$AV=[],this._$AN=void 0,this._$AD=H,this._$AM=C}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(H){let{el:{content:C},parts:V}=this._$AD,M=(H?.creationScope??$).importNode(C,!0);I.currentNode=M;let r=I.nextNode(),e=0,i=0,t=V[0];for(;t!==void 0;){if(e===t.index){let p;t.type===2?p=new G(r,r.nextSibling,this,H):t.type===1?p=new t.ctor(r,t.name,t.strings,this,H):t.type===6&&(p=new l1(r,this,H)),this._$AV.push(p),t=V[++i]}e!==t?.index&&(r=I.nextNode(),e++)}return I.currentNode=$,M}p(H){let C=0;for(let V of this._$AV)V!==void 0&&(V.strings!==void 0?(V._$AI(H,V,C),C+=V.strings.length-2):V._$AI(H[C])),C++}},G=class L{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(H,C,V,M){this.type=2,this._$AH=d,this._$AN=void 0,this._$AA=H,this._$AB=C,this._$AM=V,this.options=M,this._$Cv=M?.isConnected??!0}get parentNode(){let H=this._$AA.parentNode,C=this._$AM;return C!==void 0&&H?.nodeType===11&&(H=C.parentNode),H}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(H,C=this){H=N(this,H,C),M1(H)?H===d||H==null||H===""?(this._$AH!==d&&this._$AR(),this._$AH=d):H!==this._$AH&&H!==O&&this._(H):H._$litType$!==void 0?this.$(H):H.nodeType!==void 0?this.T(H):M2(H)?this.k(H):this._(H)}O(H){return this._$AA.parentNode.insertBefore(H,this._$AB)}T(H){this._$AH!==H&&(this._$AR(),this._$AH=this.O(H))}_(H){this._$AH!==d&&M1(this._$AH)?this._$AA.nextSibling.data=H:this.T($.createTextNode(H)),this._$AH=H}$(H){let{values:C,_$litType$:V}=H,M=typeof V=="number"?this._$AC(H):(V.el===void 0&&(V.el=r1.createElement(e2(V.h,V.h[0]),this.options)),V);if(this._$AH?._$AD===M)this._$AH.p(C);else{let r=new d1(M,this),e=r.u(this.options);r.p(C),this.T(e),this._$AH=r}}_$AC(H){let C=L2.get(H.strings);return C===void 0&&L2.set(H.strings,C=new r1(H)),C}k(H){T1(this._$AH)||(this._$AH=[],this._$AR());let C=this._$AH,V,M=0;for(let r of H)M===C.length?C.push(V=new L(this.O(L1()),this.O(L1()),this,this.options)):V=C[M],V._$AI(r),M++;M<C.length&&(this._$AR(V&&V._$AB.nextSibling,M),C.length=M)}_$AR(H=this._$AA.nextSibling,C){for(this._$AP?.(!1,!0,C);H!==this._$AB;){let V=Y1(H).nextSibling;Y1(H).remove(),H=V}}setConnected(H){this._$AM===void 0&&(this._$Cv=H,this._$AP?.(H))}},W=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(H,C,V,M,r){this.type=1,this._$AH=d,this._$AN=void 0,this.element=H,this.name=C,this._$AM=M,this.options=r,V.length>2||V[0]!==""||V[1]!==""?(this._$AH=Array(V.length-1).fill(new String),this.strings=V):this._$AH=d}_$AI(H,C=this,V,M){let r=this.strings,e=!1;if(r===void 0)H=N(this,H,C,0),e=!M1(H)||H!==this._$AH&&H!==O,e&&(this._$AH=H);else{let i=H,t,p;for(H=r[0],t=0;t<r.length-1;t++)p=N(this,i[V+t],C,t),p===O&&(p=this._$AH[t]),e||=!M1(p)||p!==this._$AH[t],p===d?H=d:H!==d&&(H+=(p??"")+r[t+1]),this._$AH[t]=p}e&&!M&&this.j(H)}j(H){H===d?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,H??"")}},p1=class extends W{constructor(){super(...arguments),this.type=3}j(H){this.element[this.name]=H===d?void 0:H}},m1=class extends W{constructor(){super(...arguments),this.type=4}j(H){this.element.toggleAttribute(this.name,!!H&&H!==d)}},n1=class extends W{constructor(H,C,V,M,r){super(H,C,V,M,r),this.type=5}_$AI(H,C=this){if((H=N(this,H,C,0)??d)===O)return;let V=this._$AH,M=H===d&&V!==d||H.capture!==V.capture||H.once!==V.once||H.passive!==V.passive,r=H!==d&&(V===d||M);M&&this.element.removeEventListener(this.name,this,V),r&&this.element.addEventListener(this.name,this,H),this._$AH=H}handleEvent(H){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,H):this._$AH.handleEvent(H)}},l1=class{constructor(H,C,V){this.element=H,this.type=6,this._$AN=void 0,this._$AM=C,this.options=V}get _$AU(){return this._$AM._$AU}_$AI(H){N(this,H)}},i2={M:B1,P:F,A:P1,C:1,L:t2,R:d1,D:M2,V:N,I:G,H:W,N:m1,U:n1,B:p1,F:l1},l5=w1.litHtmlPolyfillSupport;l5?.(r1,G),(w1.litHtmlVersions??=[]).push("3.3.3");var o2=(L,H,C)=>{let V=C?.renderBefore??H,M=V._$litPart$;if(M===void 0){let r=C?.renderBefore??null;V._$litPart$=M=new G(H.insertBefore(L1(),r),r,void 0,C??{})}return M._$AI(L),M};var F1=globalThis,c=class extends R{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let H=super.createRenderRoot();return this.renderOptions.renderBefore??=H.firstChild,H}update(H){let C=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(H),this._$Do=o2(C,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return O}};c._$litElement$=!0,c.finalized=!0,F1.litElementHydrateSupport?.({LitElement:c});var v5=F1.litElementPolyfillSupport;v5?.({LitElement:c});(F1.litElementVersions??=[]).push("4.2.2");var x5={attribute:!0,type:String,converter:H1,reflect:!1,hasChanged:a1},Z5=(L=x5,H,C)=>{let{kind:V,metadata:M}=C,r=globalThis.litPropertyMetadata.get(M);if(r===void 0&&globalThis.litPropertyMetadata.set(M,r=new Map),V==="setter"&&((L=Object.create(L)).wrapped=!0),r.set(C.name,L),V==="accessor"){let{name:e}=C;return{set(i){let t=H.get.call(this);H.set.call(this,i),this.requestUpdate(e,t,L,!0,i)},init(i){return i!==void 0&&this.C(e,void 0,L,i),i}}}if(V==="setter"){let{name:e}=C;return function(i){let t=this[e];H.call(this,i),this.requestUpdate(e,t,L,!0,i)}}throw Error("Unsupported decorator location: "+V)};function m(L){return(H,C)=>typeof C=="object"?Z5(L,H,C):((V,M,r)=>{let e=M.hasOwnProperty(r);return M.constructor.createProperty(r,V),e?Object.getOwnPropertyDescriptor(M,r):void 0})(L,H,C)}function Z(L){return m({...L,state:!0,attribute:!1})}var U=(L,H,C)=>(C.configurable=!0,C.enumerable=!0,Reflect.decorate&&typeof H!="object"&&Object.defineProperty(L,H,C),C);function f(L,H){return(C,V,M)=>{let r=e=>e.renderRoot?.querySelector(L)??null;if(H){let{get:e,set:i}=typeof V=="object"?C:M??(()=>{let t=Symbol();return{get(){return this[t]},set(p){this[t]=p}}})();return U(C,V,{get(){let t=e.call(this);return t===void 0&&(t=r(this),(t!==null||this.hasUpdated)&&i.call(this,t)),t}})}return U(C,V,{get(){return r(this)}})}}var a2="M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z";var v1="M12,2L1,21H23M12,6L19.53,19H4.47M11,10V14H13V10M11,16V18H13V16";var A2="M11,4H13V16L18.5,10.5L19.92,11.92L12,19.84L4.08,11.92L5.5,10.5L11,16V4Z";var d2="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z";var x1="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z";var p2="M20 6.91L17.09 4L12 9.09L6.91 4L4 6.91L9.09 12L4 17.09L6.91 20L12 14.91L17.09 20L20 17.09L14.91 12L20 6.91Z";var m2="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z";var n2="M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z";var l2="M10 3H14V14H10V3M10 21V17H14V21H10Z";var v2="M6,13H18V11H6M3,6V8H21V6M10,18H14V16H10V18Z";var x2="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z";var Z2="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z";var u2="M7,10L12,15L17,10H7Z";var s2="M14,19H18V5H14M6,19H10V5H6V19Z";var S2="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z";var c2="M8,5.14V19.14L19,12.14L8,5.14Z";var h2="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M7.5,13A2.5,2.5 0 0,0 5,15.5A2.5,2.5 0 0,0 7.5,18A2.5,2.5 0 0,0 10,15.5A2.5,2.5 0 0,0 7.5,13M16.5,13A2.5,2.5 0 0,0 14,15.5A2.5,2.5 0 0,0 16.5,18A2.5,2.5 0 0,0 19,15.5A2.5,2.5 0 0,0 16.5,13Z";var _1="M21 13.35C20.36 13.13 19.7 13 19 13C19 9.13 15.87 6 12 6S5 9.13 5 13 8.13 20 12 20C12.37 20 12.72 19.96 13.08 19.91C13.18 20.6 13.4 21.25 13.71 21.83C13.16 21.94 12.59 22 12 22C7.03 22 3 17.97 3 13S7.03 4 12 4C14.12 4 16.07 4.74 17.62 6L19.04 4.56C19.55 5 20 5.46 20.45 5.97L19.03 7.39C20.26 8.93 21 10.88 21 13C21 13.12 21 13.23 21 13.35M11 14H13V8H11V14M15 1H9V3H15V1M19.63 16.5V21.5H21.5V16.5H19.63M16.5 21.5H18.38V16.5H16.5V21.5Z";var O2="M15 3H9V1H15V3M11 14H13V8H11V14M19 13C19.7 13 20.36 13.13 21 13.35C21 13.23 21 13.12 21 13C21 10.88 20.26 8.93 19.03 7.39L20.45 5.97C20 5.46 19.55 5 19.04 4.56L17.62 6C16.07 4.74 14.12 4 12 4C7.03 4 3 8.03 3 13S7.03 22 12 22C12.59 22 13.16 21.94 13.71 21.83C13.4 21.25 13.18 20.6 13.08 19.91C12.72 19.96 12.37 20 12 20C8.13 20 5 16.87 5 13S8.13 6 12 6 19 9.13 19 13M17 16V22L22 19L17 16Z";var g2="M11 8H13V14H11V8M15 1H9V3H15V1M12 20C8.13 20 5 16.87 5 13S8.13 6 12 6 19 9.13 19 13C19.7 13 20.36 13.13 21 13.35C21 13.23 21 13.12 21 13C21 10.88 20.26 8.93 19.03 7.39L20.45 5.97C20 5.46 19.55 5 19.04 4.56L17.62 6C16.07 4.74 14.12 4 12 4C7.03 4 3 8.03 3 13S7.03 22 12 22C12.59 22 13.16 21.94 13.71 21.83C13.4 21.25 13.18 20.6 13.08 19.91C12.72 19.96 12.37 20 12 20M20 18V15H18V18H15V20H18V23H20V20H23V18H20Z";var f2="M17,7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7M17,15A3,3 0 0,1 14,12A3,3 0 0,1 17,9A3,3 0 0,1 20,12A3,3 0 0,1 17,15Z";var k2="M17 6H7c-3.31 0-6 2.69-6 6s2.69 6 6 6h10c3.31 0 6-2.69 6-6s-2.69-6-6-6zm0 10H7c-2.21 0-4-1.79-4-4s1.79-4 4-4h10c2.21 0 4 1.79 4 4s-1.79 4-4 4zM7 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z";var b2="M15,12C15,10.7 14.16,9.6 13,9.18V6.82C14.16,6.4 15,5.3 15,4A3,3 0 0,0 12,1A3,3 0 0,0 9,4C9,5.3 9.84,6.4 11,6.82V9.19C9.84,9.6 9,10.7 9,12C9,13.3 9.84,14.4 11,14.82V17.18C9.84,17.6 9,18.7 9,20A3,3 0 0,0 12,23A3,3 0 0,0 15,20C15,18.7 14.16,17.6 13,17.18V14.82C14.16,14.4 15,13.3 15,12M12,3A1,1 0 0,1 13,4A1,1 0 0,1 12,5A1,1 0 0,1 11,4A1,1 0 0,1 12,3M12,21A1,1 0 0,1 11,20A1,1 0 0,1 12,19A1,1 0 0,1 13,20A1,1 0 0,1 12,21Z";var _={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},Z1=L=>(...H)=>({_$litDirective$:L,values:H}),Q=class{constructor(H){}get _$AU(){return this._$AM._$AU}_$AT(H,C,V){this._$Ct=H,this._$AM=C,this._$Ci=V}_$AS(H,C){return this.update(H,C)}update(H,C){return this.render(...C)}};var{I:u5}=i2,y2=L=>L;var B2=L=>L.strings===void 0,w2=()=>document.createComment(""),K=(L,H,C)=>{let V=L._$AA.parentNode,M=H===void 0?L._$AB:H._$AA;if(C===void 0){let r=V.insertBefore(w2(),M),e=V.insertBefore(w2(),M);C=new u5(r,e,L,L.options)}else{let r=C._$AB.nextSibling,e=C._$AM,i=e!==L;if(i){let t;C._$AQ?.(L),C._$AM=L,C._$AP!==void 0&&(t=L._$AU)!==e._$AU&&C._$AP(t)}if(r!==M||i){let t=C._$AA;for(;t!==r;){let p=y2(t).nextSibling;y2(V).insertBefore(t,M),t=p}}}return C},D=(L,H,C=L)=>(L._$AI(H,C),L),s5={},u1=(L,H=s5)=>L._$AH=H,P2=L=>L._$AH,s1=L=>{L._$AR(),L._$AA.remove()};var D1=Z1(class extends Q{constructor(L){if(super(L),L.type!==_.PROPERTY&&L.type!==_.ATTRIBUTE&&L.type!==_.BOOLEAN_ATTRIBUTE)throw Error("The `live` directive is not allowed on child or event bindings");if(!B2(L))throw Error("`live` bindings can only contain a single expression")}render(L){return L}update(L,[H]){if(H===O||H===d)return H;let C=L.element,V=L.name;if(L.type===_.PROPERTY){if(H===C[V])return O}else if(L.type===_.BOOLEAN_ATTRIBUTE){if(!!H===C.hasAttribute(V))return O}else if(L.type===_.ATTRIBUTE&&C.getAttribute(V)===H+"")return O;return u1(L),H}});var b=(L,H)=>{customElements.get(L)||customElements.define(L,H)},k=(L,H,C)=>{L.dispatchEvent(new CustomEvent(H,{detail:C,bubbles:!0,composed:!0}))};var T2={card_name:"Automation Pause and Resume",card_description:"Lists all automations. Pause one for a set time; it turns on again by itself.",search_one:"Search {number} automation",search_other:"Search {number} automations",clear_search:"Clear",filters:"Filters",filter_all:"All",filter_enabled:"Enabled",filter_disabled:"Disabled",filter_paused:"Paused",sort_by:"Sort by {column}",column_icon:"Icon",column_name:"Name",column_area:"Area",column_last_triggered:"Last triggered",column_state:"State",column_actions:"Actions",never:"Never",disabled:"Disabled",unavailable:"Unavailable",enable_disable:"Enable/disable",resumes:"Resumes {time}",resuming:"Resuming…",paused_until:"Paused until {time}.",overflow_menu:"Overflow menu",menu_info:"More info",menu_settings:"Settings",menu_run:"Run actions",menu_trace:"Traces",menu_edit:"Edit automation",menu_enable:"Enable",menu_disable:"Disable",menu_pause:"Pause…",menu_extend:"Extend…",menu_resume:"Resume now",block_short_no_id:"No id",block_short_already_off:"Already off",block_short_unavailable:"Unavailable",block_no_id:"This automation has no id. Add an id: to it in YAML. Without an id, a restart or reload turns the automation on again, so a pause cannot hold.",block_already_off:"This automation is already off. Only an automation that is on can be paused.",block_unavailable:"This automation is unavailable.",dialog_pause_title:"Pause automation",dialog_extend_title:"Extend pause",dialog_durations:"Duration",extend_hint:"The new duration starts now and replaces the current end time.",custom:"Custom",custom_value:"Value",custom_unit:"Unit",unit_minutes:"Minutes",unit_hours:"Hours",unit_days:"Days",duration_invalid:"Enter a number.",duration_too_short:"A pause must be at least 1 minute.",duration_too_long:"A pause can be at most 365 days.",cancel:"Cancel",close:"Close",pause:"Pause",extend:"Extend",resume_now:"Resume now",no_automations:"We couldn't find any automations",no_match:"No rows matching current filters",entity_not_found:"Entity not available: {entity}",sensor_not_found:"The sensor of Automation Pause and Resume is not available. Check that the integration is set up.",error_unknown:"Unknown error",error_not_loaded:"Automation Pause and Resume is not loaded.",error_no_entities:"Select at least one automation.",error_not_automation:"{entity_id} is not an automation.",error_not_found:"{entity_id} does not exist.",error_unavailable:"{entity_id} is unavailable.",error_no_id:"{entity_id} has no id. Add an id: to this automation in YAML. Without it, a restart or reload turns the automation on again.",error_already_off:"{entity_id} is already off. There is nothing to pause.",error_not_paused:"{entity_id} is not paused.",error_duration_too_short:"A pause must be at least 1 minute.",error_duration_too_long:"A pause can be at most 365 days.",error_turn_on_failed:"{entity_id} could not be turned on. The pause stays."},S5={card_name:"Automation Pause and Resume",card_description:"Toont alle automatiseringen. Pauzeer er een voor een bepaalde tijd; daarna gaat ze vanzelf weer aan.",search_one:"Zoek {number} automatisering",search_other:"Zoek {number} automatiseringen",clear_search:"Wissen",filters:"Filters",filter_all:"Alle",filter_enabled:"Ingeschakeld",filter_disabled:"Uitgeschakeld",filter_paused:"Gepauzeerd",sort_by:"Sorteer op {column}",column_icon:"Pictogram",column_name:"Naam",column_area:"Ruimte",column_last_triggered:"Laatst geactiveerd",column_state:"Status",column_actions:"Acties",never:"Nooit",disabled:"Uitgeschakeld",unavailable:"Niet beschikbaar",enable_disable:"In-/uitschakelen",resumes:"Hervat {time}",resuming:"Wordt hervat…",paused_until:"Gepauzeerd tot {time}.",overflow_menu:"Overloopmenu",menu_info:"Meer info",menu_settings:"Instellingen",menu_run:"Acties uitvoeren",menu_trace:"Traces",menu_edit:"Automatisering bewerken",menu_enable:"Inschakelen",menu_disable:"Uitschakelen",menu_pause:"Pauzeren…",menu_extend:"Verlengen…",menu_resume:"Nu hervatten",block_short_no_id:"Geen id",block_short_already_off:"Staat al uit",block_short_unavailable:"Niet beschikbaar",block_no_id:"Deze automatisering heeft geen id. Voeg er een id: aan toe in YAML. Zonder id schakelt een herstart of herlading de automatisering weer in, dus een pauze houdt geen stand.",block_already_off:"Deze automatisering staat al uit. Alleen een automatisering die aan staat, kan gepauzeerd worden.",block_unavailable:"Deze automatisering is niet beschikbaar.",dialog_pause_title:"Automatisering pauzeren",dialog_extend_title:"Pauze verlengen",dialog_durations:"Duur",extend_hint:"De nieuwe duur start nu en vervangt de huidige eindtijd.",custom:"Aangepast",custom_value:"Waarde",custom_unit:"Eenheid",unit_minutes:"Minuten",unit_hours:"Uren",unit_days:"Dagen",duration_invalid:"Geef een getal in.",duration_too_short:"Een pauze duurt minstens 1 minuut.",duration_too_long:"Een pauze duurt hoogstens 365 dagen.",cancel:"Annuleren",close:"Sluiten",pause:"Pauzeren",extend:"Verlengen",resume_now:"Nu hervatten",no_automations:"We konden geen automatiseringen vinden",no_match:"Geen rijen die overeenkomen met de huidige filters",entity_not_found:"Entiteit niet beschikbaar: {entity}",sensor_not_found:"De sensor van Automation Pause and Resume is niet beschikbaar. Controleer of de integratie is ingesteld.",error_unknown:"Onbekende fout",error_not_loaded:"Automation Pause and Resume is niet geladen.",error_no_entities:"Kies minstens één automatisering.",error_not_automation:"{entity_id} is geen automatisering.",error_not_found:"{entity_id} bestaat niet.",error_unavailable:"{entity_id} is niet beschikbaar.",error_no_id:"{entity_id} heeft geen id. Voeg een id: toe aan deze automatisering in YAML. Zonder id schakelt een herstart of herlading de automatisering weer in.",error_already_off:"{entity_id} staat al uit. Er is niets te pauzeren.",error_not_paused:"{entity_id} is niet gepauzeerd.",error_duration_too_short:"Een pauze duurt minstens 1 minuut.",error_duration_too_long:"Een pauze duurt hoogstens 365 dagen.",error_turn_on_failed:"{entity_id} kon niet worden ingeschakeld. De pauze blijft."},c5={en:T2,nl:S5},S1=L=>{let H=(L??"en").toLowerCase().split(/[-_]/)[0];return c5[H]??T2},y=(L,H={})=>L.replace(/\{(\w+)\}/g,(C,V)=>V in H?String(H[V]):C);var e1="automation_pause",D2=60,E2=365*24*3600,h5={minutes:60,hours:3600,days:86400},I2=L=>{let H=new Map;if(!Array.isArray(L))return H;for(let C of L)C&&typeof C=="object"&&typeof C.entity_id=="string"&&typeof C.resume_at=="string"&&H.set(C.entity_id,{paused_at:typeof C.paused_at=="string"?C.paused_at:"",resume_at:C.resume_at});return H},$2=(L,H)=>H||Object.values(L.entities??{}).flatMap(C=>C?.platform===e1&&C.entity_id.startsWith("sensor.")?[C.entity_id]:[]).sort()[0],O5=(L,H)=>{let C=L.entities?.[H],V=C?.area_id||(C?.device_id?L.devices?.[C.device_id]?.area_id:void 0);return V?L.areas?.[V]?.name:void 0},g5=(L,H,C)=>{let V=L.entities?.[H]?.icon||C;return typeof V=="string"&&V?V:void 0},N2=(L,H)=>{let C=[];for(let[V,M]of Object.entries(L.states)){if(!M||!V.startsWith("automation."))continue;let r=M.attributes,e=r.friendly_name,i=r.last_triggered,t=r.id;C.push({entity_id:V,name:typeof e=="string"&&e?e:V,area:O5(L,V),icon:g5(L,V,r.icon),last_triggered:typeof i=="string"&&i?i:void 0,state:M.state,config_id:typeof t=="string"||typeof t=="number"?String(t):void 0,pause:H.get(V)})}return C},z=L=>{if(!L.pause){if(L.state!=="on"&&L.state!=="off")return"unavailable";if(!L.config_id)return"no_id";if(L.state==="off")return"already_off"}},E1=L=>L.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase(),f5=(L,H)=>{let C=E1(H).split(/\s+/).filter(Boolean);if(!C.length)return!0;let V=`${E1(L.name)} ${E1(L.entity_id)}`;return C.every(M=>V.includes(M))},k5=(L,H)=>{switch(H){case"enabled":return L.state==="on";case"disabled":return L.state==="off"&&!L.pause;case"paused":return L.pause!==void 0;default:return!0}},W2=(L,H,C)=>L.filter(V=>k5(V,C)&&f5(V,H)),R2=L=>L.pause?0:L.state==="on"?1:L.state==="off"?2:3,q=L=>L?Date.parse(L):Number.NaN,U2=(L,H,C="en")=>{let V=new Intl.Collator(C,{sensitivity:"accent"}),M=(e,i)=>V.compare(e.name,i.name)||V.compare(e.entity_id,i.entity_id),r=(e,i)=>{if(H==="last_triggered"){let t=q(e.last_triggered),p=q(i.last_triggered),l=Number.isNaN(t),A=Number.isNaN(p);if(l!==A)return l?1:-1;if(!l&&t!==p)return p-t}else if(H==="state"){let t=R2(e)-R2(i);if(t)return t;if(e.pause&&i.pause){let p=q(e.pause.resume_at)-q(i.pause.resume_at)||0;if(p)return p}}return M(e,i)};return[...L].sort(r)},z2=L=>{let H=L.locale;return{timeZone:H?.time_zone==="server"?L.config?.time_zone:void 0,hour12:H?.time_format==="12"?!0:H?.time_format==="24"?!1:void 0}},b5=(L,H)=>{if(H!==void 0)return H;let C=new Intl.DateTimeFormat(L,{hour:"numeric"}).resolvedOptions().hourCycle;return C==="h11"||C==="h12"},j=(L,H,C={},V=new Date)=>{let M=b5(H,C.hour12);return new Intl.DateTimeFormat(H,{year:L.getFullYear()===V.getFullYear()?void 0:"numeric",month:"short",day:"numeric",hour:M?"numeric":"2-digit",minute:"2-digit",hour12:M,timeZone:C.timeZone}).format(L)},G2=864e5,F2=L=>{let H=new Date(L);return H.setHours(0,0,0,0),H.getTime()},y5=(L,H,C)=>{let V=new Intl.RelativeTimeFormat(C,{numeric:"auto"}),M=(L.getTime()-H.getTime())/1e3;if(Math.abs(M)<59)return V.format(Math.round(M),"second");let r=M/60;if(Math.abs(r)<59)return V.format(Math.round(r),"minute");let e=M/3600;if(Math.abs(e)<22)return V.format(Math.round(e),"hour");let i=Math.round((F2(L)-F2(H))/G2);return i===0?V.format(Math.round(e),"hour"):V.format(i,"day")},Q2=(L,H,C,V,M={})=>{let r=q(L);if(Number.isNaN(r))return V.never;let e=new Date(r);return Math.trunc((H.getTime()-r)/G2)>3?j(e,C,M,H):y5(e,H,C)},$1=(L,H,C)=>{let V=q(L);if(Number.isNaN(V))return;let M=(V-H.getTime())/1e3;if(M<=0)return;let r=new Intl.RelativeTimeFormat(C,{numeric:"always",style:"short"}),e=Math.ceil(M/60);if(e<90)return r.format(e,"minute");let i=Math.round(e/60);return i<36?r.format(i,"hour"):r.format(Math.round(i/24),"day")},c1=(L,H,C,V)=>{let M=$1(L,H,C);return M?y(V.resumes,{time:M}):V.resuming},w5=L=>{let H=Math.round(L),C=Math.floor(H/86400);H-=C*86400;let V=Math.floor(H/3600);H-=V*3600;let M=Math.floor(H/60);return{days:C,hours:V,minutes:M,seconds:H-M*60}},N1=[15,60,1440,10080],B5=D2/60,P5=E2/60,K2=L=>{if(!Array.isArray(L))return[...N1];let H=L.filter(C=>Number.isInteger(C)&&C>=B5&&C<=P5);return[...new Set(H)].sort((C,V)=>C-V)},_2=[["week",7*1440],["day",1440],["hour",60],["minute",1]],q2=(L,H)=>{let[C,V]=_2.find(([,M])=>L%M===0)??_2[3];return new Intl.NumberFormat(H,{style:"unit",unit:C,unitDisplay:"long"}).format(L/V)},W1=L=>{if(!Number.isFinite(L))return{error:"invalid"};let H=Math.round(L);return H<D2?{error:"too_short"}:H>E2?{error:"too_long"}:{duration:w5(H),seconds:H}},j2=(L,H)=>{let C=L.trim().replace(",",".");return/^\d+(\.\d+)?$/.test(C)?W1(Number(C)*h5[H]):{error:"invalid"}},Y2=L=>L==="invalid"?"duration_invalid":L==="too_short"?"duration_too_short":"duration_too_long",T5=["not_loaded","no_entities","not_automation","not_found","unavailable","no_id","already_off","not_paused","duration_too_short","duration_too_long","turn_on_failed"],R5=L=>typeof L=="string"&&T5.includes(L),X2=(L,H)=>{if(L&&typeof L=="object"){let C=L;if((C.translation_domain===void 0||C.translation_domain===e1)&&R5(C.translation_key)){let M=C.translation_placeholders&&typeof C.translation_placeholders=="object"?C.translation_placeholders:{};return y(H[`error_${C.translation_key}`],M)}if(typeof C.message=="string"&&C.message)return C.message}return typeof L=="string"&&L?L:H.error_unknown},I1={sort:"last_triggered",status:"all"},F5=["last_triggered","name","state"],_5=["all","enabled","disabled","paused"],U1=L=>{let H;try{H=JSON.parse(L??"null")}catch{return I1}let C=H??{};return{sort:F5.includes(C.sort)?C.sort:I1.sort,status:_5.includes(C.status)?C.status:I1.status}};var x=(L,H="icon")=>a`<svg class=${H} viewBox="0 0 24 24" aria-hidden="true">
    <path d=${L}></path>
  </svg>`,w=S`
  .icon {
    width: var(--mdc-icon-size, 24px);
    height: var(--mdc-icon-size, 24px);
    fill: currentColor;
    flex: none;
    display: block;
  }
`,Y=S`
  .icon-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: 48px;
    height: 48px;
    padding: 12px;
    margin: 0;
    border: none;
    border-radius: var(--ha-border-radius-circle, 50%);
    background: none;
    color: inherit;
    cursor: pointer;
    position: relative;
    -webkit-tap-highlight-color: transparent;
  }
  .icon-button::before {
    content: "";
    position: absolute;
    inset: 4px;
    border-radius: inherit;
    background-color: currentColor;
    opacity: 0;
    transition: opacity 15ms linear;
  }
  .icon-button:hover::before {
    opacity: 0.08;
  }
  .icon-button:focus-visible {
    outline: none;
  }
  .icon-button:focus-visible::before,
  .icon-button:active::before {
    opacity: 0.12;
  }
`,h1=S`
  .chip {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: var(--ha-space-2, 8px);
    box-sizing: border-box;
    height: 32px;
    padding-inline: var(--ha-space-2, 8px) var(--ha-space-4, 16px);
    margin: 0;
    border: 1px solid var(--outline-color, var(--divider-color));
    border-radius: 10px;
    background-color: var(--card-background-color);
    color: var(--primary-text-color);
    font-family: var(--ha-font-family-body, Roboto, Noto, sans-serif);
    font-size: var(--ha-font-size-m, 14px);
    font-weight: var(--ha-font-weight-medium, 500);
    line-height: 20px;
    letter-spacing: 0.1px;
    white-space: nowrap;
    cursor: pointer;
    flex: none;
    -webkit-tap-highlight-color: transparent;
    --mdc-icon-size: 18px;
  }
  .chip.no-icon {
    padding-inline-start: var(--ha-space-4, 16px);
  }
  .chip.trailing {
    padding-inline-end: var(--ha-space-2, 8px);
  }
  .chip::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background-color: var(--primary-text-color);
    opacity: 0;
    pointer-events: none;
  }
  .chip::after {
    content: "";
    position: absolute;
    inset: -6px 0;
  }
  .chip:hover::before {
    opacity: 0.08;
  }
  .chip:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }
  .chip.active {
    background-color: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12);
    border-color: transparent;
  }
  .chip .icon {
    color: var(--primary-color);
  }
`,J2=S`
  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--ha-space-2, 8px);
    box-sizing: border-box;
    min-height: 44px;
    min-width: 64px;
    padding: 0 var(--ha-space-4, 16px);
    margin: 0;
    border: none;
    border-radius: var(--ha-border-radius-pill, 9999px);
    font-family: var(--ha-font-family-body, Roboto, Noto, sans-serif);
    font-size: var(--ha-font-size-m, 14px);
    font-weight: var(--ha-font-weight-medium, 500);
    line-height: 20px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    background: none;
    color: var(--primary-color);
    -webkit-tap-highlight-color: transparent;
  }
  .button::before {
    content: "";
    position: absolute;
    inset: 0;
    background-color: currentColor;
    opacity: 0;
  }
  .button:hover::before {
    opacity: 0.08;
  }
  .button:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }
  .button.filled {
    background-color: var(--primary-color);
    color: var(--text-primary-color, #fff);
  }
  .button:disabled {
    cursor: default;
    color: var(--disabled-text-color, var(--secondary-text-color));
    background-color: transparent;
  }
  .button.filled:disabled {
    background-color: var(
      --ha-color-fill-disabled-quiet-resting,
      rgba(0, 0, 0, 0.12)
    );
  }
  .button:disabled::before {
    opacity: 0;
  }
`,O1=S`
  .alert {
    display: flex;
    gap: var(--ha-space-3, 12px);
    align-items: flex-start;
    padding: var(--ha-space-2, 8px) var(--ha-space-3, 12px);
    border-radius: var(--ha-border-radius-sm, 4px);
    color: var(--primary-text-color);
    font-size: var(--ha-font-size-m, 14px);
    line-height: var(--ha-line-height-normal, 1.6);
    position: relative;
    overflow: hidden;
  }
  .alert::before {
    content: "";
    position: absolute;
    inset: 0;
    background-color: var(--alert-color);
    opacity: 0.12;
    pointer-events: none;
  }
  .alert .icon {
    color: var(--alert-color);
    margin-top: 2px;
  }
  .alert.warning {
    --alert-color: var(--warning-color, #ffa600);
  }
  .alert.error {
    --alert-color: var(--error-color, #db4437);
  }
`;var D5=["minutes","hours","days"],u=class extends c{constructor(){super(...arguments);this.open=!1;this.language="en";this.now=Date.now();this.dateOptions={};this.durations=N1;this.busy=!1;this.error="";this._customValue="";this._customUnit="hours"}willUpdate(C){C.has("open")&&this.open&&(this._choice=void 0,this._customValue="",this._customUnit="hours")}updated(C){C.has("open")&&(this.open&&!this._dialog.open?(this._dialog.showModal(),this._firstControl?.focus()):!this.open&&this._dialog.open&&this._dialog.close())}_result(){if(!this._choice)return;if(this._choice==="custom")return this._customValue.trim()?j2(this._customValue,this._customUnit):void 0;let C=Number(this._choice);return this.durations.includes(C)?W1(C*60):void 0}render(){let C=this.item,V=this.strings;if(!V)return a`<dialog></dialog>`;let M=C?.pause!==void 0,r=C?z(C):void 0,e=this._result();return a`<dialog
      aria-labelledby="title"
      @close=${this._handleClose}
      @click=${this._handleDialogClick}
    >
      <div class="header">
        <button
          class="icon-button"
          aria-label=${V.close}
          @click=${this._close}
        >
          ${x(x1)}
        </button>
        <div class="titles">
          <h2 id="title">
            ${M?V.dialog_extend_title:V.dialog_pause_title}
          </h2>
          ${C?a`<div class="subtitle">${C.name}</div>`:d}
        </div>
      </div>
      <div class="body">
        ${C&&M?this._renderPauseState(C):d}
        ${r?a`<div class="alert warning">
                ${x(v1)}
                <span>${V[`block_${r}`]}</span>
              </div>`:this._renderDurations(e)}
        ${this.error?a`<div class="alert error" role="alert">
                ${x(a2)}
                <span>${this.error}</span>
              </div>`:d}
      </div>
      <div class="footer">
        ${M?a`<button
                class="button resume"
                ?disabled=${this.busy}
                @click=${this._resume}
              >
                ${V.resume_now}
              </button>`:d}
        ${r?a`<button class="button" @click=${this._close}>
                ${V.close}
              </button>`:a`<button class="button" @click=${this._close}>
                  ${V.cancel}
                </button>
                <button
                  class="button filled"
                  ?disabled=${this.busy||!e?.duration}
                  @click=${this._submit}
                >
                  ${M?V.extend:V.pause}
                </button>`}
      </div>
    </dialog>`}_renderPauseState(C){let V=new Date(this.now),M=C.pause.resume_at,r=y(this.strings.paused_until,{time:j(new Date(M),this.language,this.dateOptions,V)});return a`<p class="state">
        ${r} ${c1(M,V,this.language,this.strings)}
      </p>
      <p class="hint">${this.strings.extend_hint}</p>`}_renderDurations(C){let V=this.strings,M=this._choice==="custom"&&C?.error?V[Y2(C.error)]:"";return a`<div
        class="list"
        role="radiogroup"
        aria-label=${V.dialog_durations}
      >
        ${this.durations.map(r=>this._renderChoice(String(r),q2(r,this.language)))}
        ${this._renderChoice("custom",V.custom)}
      </div>
      ${this._choice==="custom"?a`<div class="custom">
                <label class="field">
                  <span>${V.custom_value}</span>
                  <input
                    type="text"
                    inputmode="decimal"
                    autocomplete="off"
                    .value=${D1(this._customValue)}
                    aria-invalid=${M?"true":"false"}
                    aria-describedby="custom-error"
                    @input=${this._handleCustomValue}
                    @keydown=${this._handleCustomKey}
                  />
                </label>
                <label class="field">
                  <span>${V.custom_unit}</span>
                  <select @change=${this._handleCustomUnit}>
                    ${D5.map(r=>a`<option
                          value=${r}
                          ?selected=${r===this._customUnit}
                        >
                          ${V[`unit_${r}`]}
                        </option>`)}
                  </select>
                </label>
              </div>
              <div id="custom-error" class="field-error">${M}</div>`:d}`}_renderChoice(C,V){return a`<label class="choice">
      <input
        type="radio"
        name="duration"
        .value=${C}
        .checked=${D1(this._choice===C)}
        @change=${this._handleChoice}
      />
      <span>${V}</span>
    </label>`}_handleChoice(C){this._choice=C.target.value,this._choice==="custom"&&this.updateComplete.then(()=>this._customInput?.focus())}_handleCustomValue(C){this._customValue=C.target.value}_handleCustomUnit(C){this._customUnit=C.target.value}_handleCustomKey(C){C.key==="Enter"&&this._submit()}_submit(){let C=this._result()?.duration;!this.item||!C||this.busy||k(this,"automation-pause-pause-submit",{entityId:this.item.entity_id,duration:C})}_resume(){!this.item||this.busy||k(this,"automation-pause-resume-submit",{entityId:this.item.entity_id})}_close(){this._dialog.close()}_handleDialogClick(C){C.target===this._dialog&&this._dialog.close()}_handleClose(){this.open&&k(this,"automation-pause-dialog-closed",void 0)}};u.styles=[w,Y,J2,O1,S`
      dialog {
        box-sizing: border-box;
        width: min(var(--ha-dialog-width-md, 580px), 95vw);
        max-width: 95vw;
        max-height: calc(100vh - 80px);
        padding: 0;
        border: none;
        border-radius: var(
          --ha-dialog-border-radius,
          var(--ha-border-radius-3xl, 24px)
        );
        background-color: var(
          --ha-dialog-surface-background,
          var(--card-background-color, #fff)
        );
        color: var(--primary-text-color);
        box-shadow: var(
          --dialog-box-shadow,
          0 8px 12px 6px rgba(0, 0, 0, 0.15),
          0 4px 4px rgba(0, 0, 0, 0.3)
        );
        font-family: var(--ha-font-family-body, Roboto, Noto, sans-serif);
        -webkit-font-smoothing: var(--ha-font-smoothing, antialiased);
        overflow: hidden;
      }
      dialog[open] {
        display: flex;
        flex-direction: column;
      }
      dialog::backdrop {
        background-color: var(--mdc-dialog-scrim-color, rgba(0, 0, 0, 0.32));
      }
      @media all and (max-width: 450px), all and (max-height: 500px) {
        dialog {
          width: 100vw;
          max-width: 100vw;
          height: 100%;
          max-height: 100%;
          margin: 0;
          border-radius: 0;
        }
      }
      .header {
        display: flex;
        align-items: flex-start;
        gap: var(--ha-space-1, 4px);
        padding: var(--ha-space-3, 12px) var(--ha-space-6, 24px)
          var(--ha-space-4, 16px) var(--ha-space-3, 12px);
        flex: none;
      }
      .titles {
        min-width: 0;
        padding-top: 10px;
      }
      h2 {
        margin: 0;
        font-size: var(--ha-font-size-2xl, 24px);
        line-height: var(--ha-line-height-condensed, 1.2);
        font-weight: var(--ha-font-weight-normal, 400);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .subtitle {
        margin-top: var(--ha-space-1, 4px);
        color: var(--secondary-text-color);
        font-size: var(--ha-font-size-m, 14px);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .body {
        flex: 1;
        overflow: auto;
        padding: 0 var(--ha-space-6, 24px) var(--ha-space-4, 16px);
        display: flex;
        flex-direction: column;
        gap: var(--ha-space-3, 12px);
        font-size: var(--ha-font-size-m, 14px);
        line-height: var(--ha-line-height-normal, 1.6);
      }
      p {
        margin: 0;
      }
      .hint {
        color: var(--secondary-text-color);
      }
      .list {
        display: flex;
        flex-direction: column;
        margin: 0 calc(-1 * var(--ha-space-6, 24px));
      }
      .choice {
        display: flex;
        align-items: center;
        gap: var(--ha-space-4, 16px);
        min-height: 48px;
        padding: 0 var(--ha-space-6, 24px);
        cursor: pointer;
        font-size: var(--ha-font-size-l, 16px);
        position: relative;
      }
      .choice::before {
        content: "";
        position: absolute;
        inset: 0;
        background-color: var(--primary-text-color);
        opacity: 0;
        pointer-events: none;
      }
      .choice:hover::before {
        opacity: 0.04;
      }
      .choice input {
        width: 20px;
        height: 20px;
        margin: 0;
        accent-color: var(--primary-color);
        flex: none;
      }
      .custom {
        display: flex;
        gap: var(--ha-space-3, 12px);
        flex-wrap: wrap;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: var(--ha-space-1, 4px);
        flex: 1 1 120px;
        color: var(--secondary-text-color);
        font-size: var(--ha-font-size-s, 12px);
      }
      .field input,
      .field select {
        box-sizing: border-box;
        height: 48px;
        padding: 0 var(--ha-space-3, 12px);
        border: 1px solid var(--outline-color, var(--divider-color));
        border-radius: var(--ha-border-radius-md, 8px);
        background-color: var(--card-background-color);
        color: var(--primary-text-color);
        font-family: inherit;
        font-size: var(--ha-font-size-l, 16px);
      }
      .field input:focus,
      .field select:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: inset 0 0 0 1px var(--primary-color);
      }
      .field input[aria-invalid="true"] {
        border-color: var(--error-color, #db4437);
      }
      .field-error {
        min-height: 1.6em;
        color: var(--error-color, #db4437);
        font-size: var(--ha-font-size-s, 12px);
      }
      .footer {
        display: flex;
        flex-wrap: wrap;
        gap: var(--ha-space-3, 12px);
        justify-content: flex-end;
        align-items: center;
        padding: var(--ha-space-3, 12px) var(--ha-space-4, 16px)
          var(--ha-space-4, 16px);
        flex: none;
      }
      .resume {
        margin-inline-end: auto;
      }
    `],o([m({type:Boolean})],u.prototype,"open",2),o([m({attribute:!1})],u.prototype,"item",2),o([m({attribute:!1})],u.prototype,"strings",2),o([m()],u.prototype,"language",2),o([m({attribute:!1})],u.prototype,"now",2),o([m({attribute:!1})],u.prototype,"dateOptions",2),o([m({attribute:!1})],u.prototype,"durations",2),o([m({type:Boolean})],u.prototype,"busy",2),o([m()],u.prototype,"error",2),o([Z()],u.prototype,"_choice",2),o([Z()],u.prototype,"_customValue",2),o([Z()],u.prototype,"_customUnit",2),o([f("dialog")],u.prototype,"_dialog",2),o([f("input[type=radio], .footer .button")],u.prototype,"_firstControl",2),o([f(".custom input")],u.prototype,"_customInput",2);b("automation-pause-dialog",u);var C5=(L,H,C)=>{let V=new Map;for(let M=H;M<=C;M++)V.set(L[M],M);return V},H5=Z1(class extends Q{constructor(L){if(super(L),L.type!==_.CHILD)throw Error("repeat() can only be used in text expressions")}dt(L,H,C){let V;C===void 0?C=H:H!==void 0&&(V=H);let M=[],r=[],e=0;for(let i of L)M[e]=V?V(i,e):e,r[e]=C(i,e),e++;return{values:r,keys:M}}render(L,H,C){return this.dt(L,H,C).values}update(L,[H,C,V]){let M=P2(L),{values:r,keys:e}=this.dt(H,C,V);if(!Array.isArray(M))return this.ut=e,r;let i=this.ut??=[],t=[],p,l,A=0,v=M.length-1,n=0,s=r.length-1;for(;A<=v&&n<=s;)if(M[A]===null)A++;else if(M[v]===null)v--;else if(i[A]===e[n])t[n]=D(M[A],r[n]),A++,n++;else if(i[v]===e[s])t[s]=D(M[v],r[s]),v--,s--;else if(i[A]===e[s])t[s]=D(M[A],r[s]),K(L,t[s+1],M[A]),A++,s--;else if(i[v]===e[n])t[n]=D(M[v],r[n]),K(L,M[A],M[v]),v--,n++;else if(p===void 0&&(p=C5(e,n,s),l=C5(i,A,v)),p.has(i[A]))if(p.has(i[v])){let T=l.get(e[n]),f1=T!==void 0?M[T]:null;if(f1===null){let z1=K(L,M[A]);D(z1,r[n]),t[n]=z1}else t[n]=D(f1,r[n]),K(L,M[A],f1),M[T]=null;n++}else s1(M[v]),v--;else s1(M[A]),A++;for(;n<=s;){let T=K(L,t[s+1]);D(T,r[n]),t[n++]=T}for(;A<=v;){let T=M[A++];T!==null&&s1(T)}return this.ut=e,u1(L,t),O}});var X=8,B=class extends c{constructor(){super(...arguments);this.items=[];this.open=!1;this.align="end";this.label="";this._closedAt=0}justClosed(){return Date.now()-this._closedAt<300}render(){return a`
      <div
        class="menu"
        popover="auto"
        role="menu"
        aria-label=${this.label}
        @toggle=${this._handleToggle}
        @keydown=${this._handleKeyDown}
      >
        ${this.items.map(C=>a`
            ${C.divider?a`<div class="divider" role="separator"></div>`:d}
            <button
              class="item ${C.dimmed?"dimmed":""}"
              role=${C.checked===void 0?"menuitem":"menuitemradio"}
              aria-checked=${C.checked===void 0?d:C.checked?"true":"false"}
              ?disabled=${C.disabled}
              .value=${C.value}
              @click=${this._handleClick}
            >
              ${C.icon?x(C.icon):C.checked!==void 0?a`<span class="icon-space"></span>`:d}
              <span class="text">
                <span class="label">${C.label}</span>
                ${C.secondary?a`<span class="secondary">${C.secondary}</span>`:d}
              </span>
              ${C.checked?x(d2,"icon check"):d}
            </button>
          `)}
      </div>
    `}updated(C){if(!C.has("open"))return;let V=this._menu;this.open&&!V.matches(":popover-open")?(V.showPopover(),this._position(),V.querySelector("button:not([disabled])")?.focus()):!this.open&&V.matches(":popover-open")&&V.hidePopover()}_position(){let C=this.anchor,V=this._menu;if(!C)return;let M=C.getBoundingClientRect(),r=V.offsetWidth,e=V.offsetHeight,i=window.innerWidth,t=window.innerHeight,p=getComputedStyle(this).direction==="rtl",A=this.align==="end"!==p?M.right-r:M.left;A=Math.max(X,Math.min(A,i-r-X));let v=M.bottom;if(v+e>t-X){let n=M.top-e;v=n>=X?n:Math.max(X,t-e-X)}V.style.left=`${A}px`,V.style.top=`${v}px`}_handleToggle(C){C.newState==="closed"&&(this._closedAt=Date.now(),this.open=!1,k(this,"automation-pause-menu-closed",void 0))}_handleClick(C){let V=C.currentTarget.value;this._menu.hidePopover(),this.anchor?.focus(),k(this,"automation-pause-menu-select",{value:V})}_handleKeyDown(C){if(C.key!=="ArrowDown"&&C.key!=="ArrowUp"){C.key==="Escape"&&this.anchor?.focus();return}C.preventDefault();let V=Array.from(this._menu.querySelectorAll("button:not([disabled])")),M=V.indexOf(this.shadowRoot.activeElement),r=C.key==="ArrowDown"?1:-1;V[(M+r+V.length)%V.length]?.focus()}};B.styles=[w,S`
      .menu {
        position: fixed;
        inset: auto;
        margin: 0;
        padding: var(--ha-space-1, 4px) 0;
        min-width: 200px;
        max-width: min(320px, calc(100vw - 16px));
        max-height: calc(100vh - 16px);
        overflow-y: auto;
        box-sizing: border-box;
        border: 1px solid var(--ha-color-border-neutral-quiet, transparent);
        border-radius: var(--ha-border-radius-lg, 12px);
        background-color: var(--card-background-color, #fff);
        color: var(--primary-text-color);
        box-shadow: var(
          --ha-box-shadow-l,
          0 8px 12px 6px rgba(0, 0, 0, 0.15),
          0 4px 4px rgba(0, 0, 0, 0.3)
        );
        font-family: var(--ha-font-family-body, Roboto, Noto, sans-serif);
      }
      .item {
        display: flex;
        align-items: center;
        gap: var(--ha-space-4, 16px);
        width: 100%;
        min-height: 48px;
        box-sizing: border-box;
        padding: var(--ha-space-2, 8px) var(--ha-space-4, 16px);
        margin: 0;
        border: none;
        background: none;
        color: var(--primary-text-color);
        font: inherit;
        font-size: var(--ha-font-size-m, 14px);
        line-height: var(--ha-line-height-condensed, 1.2);
        text-align: start;
        cursor: pointer;
        position: relative;
      }
      .item::before {
        content: "";
        position: absolute;
        inset: 0;
        background-color: var(--primary-text-color);
        opacity: 0;
        pointer-events: none;
      }
      .item:hover::before {
        opacity: 0.08;
      }
      .item:focus-visible {
        outline: none;
      }
      .item:focus-visible::before {
        opacity: 0.12;
      }
      .item .icon {
        color: var(--secondary-text-color);
      }
      .item .check {
        color: var(--primary-color);
        margin-inline-start: auto;
      }
      .icon-space {
        width: 24px;
        flex: none;
      }
      .item.dimmed .label,
      .item.dimmed .icon,
      .item:disabled .label,
      .item:disabled .icon {
        opacity: 0.5;
      }
      .item:disabled {
        cursor: default;
      }
      .item:disabled::before {
        opacity: 0;
      }
      .text {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .secondary {
        color: var(--secondary-text-color);
        font-size: var(--ha-font-size-s, 12px);
        margin-top: 2px;
      }
      .divider {
        height: 1px;
        margin: var(--ha-space-1, 4px) 0;
        background-color: var(--divider-color);
      }
    `],o([m({attribute:!1})],B.prototype,"items",2),o([m({attribute:!1})],B.prototype,"anchor",2),o([m({type:Boolean})],B.prototype,"open",2),o([m()],B.prototype,"align",2),o([m()],B.prototype,"label",2),o([f(".menu")],B.prototype,"_menu",2);b("automation-pause-menu",B);var g=class extends c{constructor(){super(...arguments);this.language="en";this.now=Date.now();this.dateOptions={};this.layout="wide";this._menuOpen=!1;this._menuUsed=!1;this._handleRowClick=C=>{C.composedPath().some(V=>V instanceof HTMLButtonElement||V.localName==="automation-pause-menu")||this._fire("open")};this._handleRowKey=C=>{C.composedPath()[0]===this&&(C.key==="Enter"||C.key===" ")&&(C.preventDefault(),this._fire("open"))}}connectedCallback(){super.connectedCallback(),this.setAttribute("role","row"),this.tabIndex=0,this.addEventListener("click",this._handleRowClick),this.addEventListener("keydown",this._handleRowKey)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("click",this._handleRowClick),this.removeEventListener("keydown",this._handleRowKey)}willUpdate(){this.toggleAttribute("no-id",z(this.item)==="no_id")}render(){let C=this.item,V=this.strings,M=new Date(this.now),r=this.layout==="narrow",e=C.pause!==void 0,i=C.state==="off"&&!e,t=Q2(C.last_triggered,M,this.language,V,this.dateOptions),p=C.last_triggered?j(new Date(C.last_triggered),this.language,this.dateOptions,M):"",l=[];return r?l=[C.area??"",i?"":t,i?V.disabled:"",C.state!=="on"&&C.state!=="off"?V.unavailable:""].filter(Boolean):this.layout==="medium"&&C.area&&(l=[C.area]),a`
      <div class="cell icon-cell" role="cell">${this._renderIcon()}</div>
      <div class="cell name-cell" role="rowheader">
        <div class="primary">${C.name}</div>
        ${l.length?a`<div class="secondary">${l.join(" · ")}</div>`:d}
      </div>
      ${this.layout==="wide"?a`<div class="cell" role="cell">${C.area??""}</div>`:d}
      ${r?d:a`<div class="cell" role="cell" title=${p}>
              ${t}
            </div>`}
      <div class="cell state-cell" role="cell">${this._renderState()}</div>
      <div class="cell actions-cell" role="cell">
        <button
          class="icon-button"
          aria-label=${V.overflow_menu}
          aria-haspopup="menu"
          aria-expanded=${this._menuOpen?"true":"false"}
          @click=${this._toggleMenu}
        >
          ${x(n2)}
        </button>
        ${this._menuUsed?a`<automation-pause-menu
                .items=${this._menuItems()}
                .anchor=${this._menuButton}
                .open=${this._menuOpen}
                .label=${V.overflow_menu}
                @automation-pause-menu-select=${this._handleMenuSelect}
                @automation-pause-menu-closed=${this._handleMenuClosed}
              ></automation-pause-menu>`:d}
      </div>
    `}_renderIcon(){let C=this.item,V=d,M="";return C.pause?(M="disabled",V=this._badge(s2,"badge-paused")):C.state==="off"?(M="disabled",V=this._badge(p2,"badge-off")):C.state!=="on"&&(M="error",V=this._badge(l2,"badge-error")),a`<div class="state-icon ${M}">
      ${this._renderOwnIcon()}${V}
    </div>`}_renderOwnIcon(){let C=this.item.icon;return C&&customElements.get("ha-icon")?a`<ha-icon class="own-icon" .icon=${C}></ha-icon>`:x(h2)}_badge(C,V){return a`<div class="badge ${V}">
      ${x(C,"icon badge-icon")}
    </div>`}_renderState(){let C=this.item,V=this.strings;if(C.pause){let r=new Date(this.now),e=c1(C.pause.resume_at,r,this.language,V),i=$1(C.pause.resume_at,r,this.language)??V.resuming,t=j(new Date(C.pause.resume_at),this.language,this.dateOptions,r);return a`<button
        class="chip paused-chip"
        title=${t}
        aria-label=${e}
        @click=${this._handleChipClick}
      >
        ${x(_1)}
        <span>${this.layout==="narrow"?i:e}</span>
      </button>`}if(this.layout==="narrow")return d;if(C.state!=="on"&&C.state!=="off")return a`<span class="unavailable">${V.unavailable}</span>`;let M=C.state==="on";return a`<button
      class="switch ${M?"checked":""}"
      role="switch"
      aria-checked=${M?"true":"false"}
      aria-label=${V.enable_disable}
      @click=${this._handleSwitchClick}
    >
      <span class="track"><span class="thumb"></span></span>
    </button>`}_menuItems(){let C=this.item,V=this.strings,M=z(C),r=[{value:"info",label:V.menu_info,icon:x2},{value:"settings",label:V.menu_settings,icon:m2},{value:"run",label:V.menu_run,icon:c2},{value:"trace",label:V.menu_trace,icon:b2,disabled:!C.config_id,secondary:C.config_id?void 0:V.block_short_no_id},{value:"edit",label:V.menu_edit,icon:S2,divider:!0}];return!C.pause&&(C.state==="on"||C.state==="off")&&r.push({value:"toggle",label:C.state==="off"?V.menu_enable:V.menu_disable,icon:C.state==="off"?f2:k2}),C.pause?r.push({value:"extend",label:V.menu_extend,icon:g2,divider:!0},{value:"resume",label:V.menu_resume,icon:O2}):r.push({value:"pause",label:V.menu_pause,icon:_1,divider:!0,dimmed:M!==void 0,secondary:M?V[`block_short_${M}`]:void 0}),r}_fire(C){k(this,"automation-pause-row-action",{action:C,entityId:this.item.entity_id})}_handleSwitchClick(){this._fire("toggle")}_handleChipClick(){this._fire("open")}_toggleMenu(){this._menu?.justClosed()||(this._menuUsed=!0,this._menuOpen=!this._menuOpen)}_handleMenuSelect(C){C.stopPropagation(),this._fire(C.detail.value)}_handleMenuClosed(C){C.stopPropagation(),this._menuOpen=!1}};g.styles=[w,Y,h1,S`
      :host {
        display: grid;
        grid-template-columns: var(--automation-pause-columns);
        align-items: center;
        box-sizing: border-box;
        height: var(--data-table-row-height, 60px);
        border-top: 1px solid var(--divider-color);
        color: var(--primary-text-color);
        background-color: var(
          --data-table-background-color,
          var(--card-background-color)
        );
        font-family: var(--ha-font-family-body, Roboto, Noto, sans-serif);
        -webkit-font-smoothing: var(--ha-font-smoothing, antialiased);
        -moz-osx-font-smoothing: var(--ha-moz-osx-font-smoothing, grayscale);
        font-size: 0.875rem;
        line-height: var(--ha-line-height-condensed, 1.2);
        font-weight: var(--ha-font-weight-normal, 400);
        letter-spacing: 0.0178571429em;
        cursor: pointer;
        outline: none;
        position: relative;
      }
      :host([layout="narrow"]) {
        --data-table-row-height: 72px;
      }
      :host(:hover) {
        background-image: linear-gradient(
          rgba(var(--rgb-primary-text-color, 33, 33, 33), 0.04),
          rgba(var(--rgb-primary-text-color, 33, 33, 33), 0.04)
        );
      }
      :host(:focus-visible) {
        box-shadow: inset 0 0 0 2px var(--primary-color);
      }
      .cell {
        padding-inline: 16px;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        box-sizing: border-box;
      }
      :host([layout="narrow"]) .cell {
        padding-inline: 8px;
      }
      .icon-cell {
        color: var(--secondary-text-color);
        overflow: visible;
        display: flex;
        justify-content: center;
      }
      .name-cell {
        overflow: hidden;
      }
      .primary {
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .secondary {
        color: var(--secondary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        margin-top: 2px;
      }
      .state-cell,
      .actions-cell {
        overflow: visible;
        display: flex;
        align-items: center;
      }
      .actions-cell {
        justify-content: center;
        padding: 8px;
        color: var(--secondary-text-color);
      }
      .state-icon {
        position: relative;
        display: inline-flex;
        width: 24px;
        height: 24px;
      }
      .own-icon {
        --mdc-icon-size: 24px;
        display: flex;
      }
      .state-icon.disabled {
        color: var(--disabled-color, #bdbdbd);
      }
      .state-icon.error {
        color: var(--error-color, #db4437);
      }
      .badge {
        position: absolute;
        top: -5px;
        inset-inline-end: -7px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        box-shadow: 0 0 0 2px
          var(--data-table-background-color, var(--card-background-color));
        color: var(--data-table-background-color, var(--card-background-color));
        --mdc-icon-size: 12px;
      }
      .badge-off {
        background-color: var(--disabled-color, #bdbdbd);
      }
      .badge-error {
        background-color: var(--error-color, #db4437);
      }
      .badge-paused {
        background-color: var(--warning-color, #ffa600);
      }
      .paused-chip {
        max-width: 100%;
      }
      .paused-chip span {
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .paused-chip .icon {
        color: var(--warning-color, #ffa600);
      }
      .unavailable {
        color: var(--secondary-text-color);
      }

      /* ha-switch: 48 x 24 px track, 18 px thumb, 44 px tap target. */
      .switch {
        position: relative;
        display: inline-flex;
        align-items: center;
        box-sizing: border-box;
        height: 44px;
        padding: 0;
        margin: 0;
        border: none;
        background: none;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }
      .switch:focus-visible {
        outline: none;
      }
      .switch:focus-visible .track {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }
      .track {
        position: relative;
        display: block;
        box-sizing: border-box;
        width: 48px;
        height: 24px;
        border-radius: 12px;
        border: 1px solid var(--ha-color-border-neutral-normal, #949494);
        background-color: var(--ha-color-fill-disabled-quiet-resting, #f2f2f2);
        transition: background-color 150ms;
      }
      .thumb {
        position: absolute;
        top: 50%;
        inset-inline-start: 2px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        transform: translateY(-50%);
        background-color: var(--ha-color-on-neutral-normal, #636363);
        box-shadow: var(--ha-box-shadow-s, 0 1px 2px rgba(0, 0, 0, 0.3));
        transition: inset-inline-start 150ms;
      }
      .switch:hover .track {
        background-color: var(--ha-color-fill-disabled-quiet-hover, #e6e6e6);
      }
      .switch.checked .track {
        border-color: var(--ha-color-border-primary-loud, var(--primary-color));
        background-color: var(
          --ha-color-fill-primary-normal-resting,
          rgba(var(--rgb-primary-color, 3, 169, 244), 0.2)
        );
      }
      .switch.checked:hover .track {
        background-color: var(
          --ha-color-fill-primary-normal-hover,
          rgba(var(--rgb-primary-color, 3, 169, 244), 0.3)
        );
      }
      .switch.checked .thumb {
        inset-inline-start: 26px;
        background-color: var(
          --ha-color-on-primary-normal,
          var(--primary-color)
        );
      }
      :host([no-id]) .icon-cell,
      :host([no-id]) .name-cell {
        opacity: 0.6;
      }
    `],o([m({attribute:!1})],g.prototype,"item",2),o([m({attribute:!1})],g.prototype,"strings",2),o([m()],g.prototype,"language",2),o([m({attribute:!1})],g.prototype,"now",2),o([m({attribute:!1})],g.prototype,"dateOptions",2),o([m({reflect:!0})],g.prototype,"layout",2),o([Z()],g.prototype,"_menuOpen",2),o([Z()],g.prototype,"_menuUsed",2),o([f(".actions-cell button")],g.prototype,"_menuButton",2),o([f("automation-pause-menu")],g.prototype,"_menu",2);b("automation-pause-row",g);var L5="automation-pause-card.view",V5=()=>{try{return U1(localStorage.getItem(L5))}catch{return U1(null)}},E5=600,I5=760,$5=["all","enabled","disabled","paused"],N5=["name","last_triggered","state"],h=class extends c{constructor(){super(...arguments);this.items=[];this.language="en";this.now=Date.now();this.dateOptions={};this._search="";this._status=V5().status;this._sort=V5().sort;this._layout="wide"}connectedCallback(){super.connectedCallback(),this._resizeObserver=new ResizeObserver(C=>{let V=C[0]?.contentRect.width??0;V&&(this._layout=V<E5?"narrow":V<I5?"medium":"wide")}),this._resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this._resizeObserver?.disconnect(),this._resizeObserver=void 0}willUpdate(C){(C.has("_layout")||C.has("items"))&&this.style.setProperty("--automation-pause-columns",this._columns())}_columns(){let C=this.items.some(V=>V.pause)?"220px":"82px";switch(this._layout){case"narrow":return"56px minmax(0, 1fr) auto 56px";case"medium":return`64px minmax(0, 2fr) minmax(150px, 1fr) ${C} 64px`;default:return`64px minmax(0, 2fr) minmax(120px, 1fr) minmax(150px, 1fr) ${C} 64px`}}render(){let C=this.strings,V=this._layout==="narrow",M=U2(W2(this.items,this._search,this._status),this._sort,this.language);return a`
      ${V?a`<div class="search-toolbar">${this._renderSearch()}</div>
              <div class="chip-row">
                ${this._renderFilterChip()}
                <div class="flex"></div>
                ${this._renderSortChip()}
              </div>`:a`<div class="table-header">
              ${this._renderFilterChip()}${this._renderSearch()}${this._renderSortChip()}
            </div>`}
      <div class="table" role="table" aria-rowcount=${M.length+1}>
        ${V?d:this._renderColumnTitles()}
        ${M.length?H5(M,r=>r.entity_id,r=>a`<automation-pause-row
                    .item=${r}
                    .strings=${C}
                    .language=${this.language}
                    .now=${this.now}
                    .dateOptions=${this.dateOptions}
                    .layout=${this._layout}
                  ></automation-pause-row>`):a`<div class="empty" role="row">
                <div role="cell">
                  ${this.items.length?C.no_match:C.no_automations}
                </div>
              </div>`}
      </div>
      <automation-pause-menu
        .items=${this._menuItems()}
        .anchor=${this._menuAnchor}
        .open=${this._openMenu!==void 0}
        .align=${this._openMenu==="filter"?"start":"end"}
        .label=${this._openMenu==="filter"?C.filters:this._sortLabel()}
        @automation-pause-menu-select=${this._handleMenuSelect}
        @automation-pause-menu-closed=${this._handleMenuClosed}
      ></automation-pause-menu>
    `}_renderSearch(){let C=y(this.items.length===1?this.strings.search_one:this.strings.search_other,{number:this.items.length});return a`<div class="search">
      ${x(Z2)}
      <input
        type="search"
        autocomplete="off"
        spellcheck="false"
        .value=${this._search}
        placeholder=${C}
        aria-label=${C}
        @input=${this._handleSearch}
      />
      ${this._search?a`<button
              class="icon-button clear"
              aria-label=${this.strings.clear_search}
              @click=${this._clearSearch}
            >
              ${x(x1)}
            </button>`:d}
    </div>`}_renderFilterChip(){let C=this._status!=="all";return a`<div class="filter-chip">
      <button
        class="chip ${C?"active":""}"
        aria-haspopup="menu"
        aria-expanded=${this._openMenu==="filter"?"true":"false"}
        data-menu="filter"
        @click=${this._toggleMenu}
      >
        ${x(v2)}
        <span>${this.strings.filters}</span>
      </button>
      ${C?a`<div class="badge" aria-hidden="true">1</div>`:d}
    </div>`}_sortTitle(C){return C==="name"?this.strings.column_name:C==="last_triggered"?this.strings.column_last_triggered:this.strings.column_state}_sortLabel(){return y(this.strings.sort_by,{column:this._sortTitle(this._sort)})}_renderSortChip(){return a`<button
      class="chip no-icon trailing"
      aria-haspopup="menu"
      aria-expanded=${this._openMenu==="sort"?"true":"false"}
      data-menu="sort"
      @click=${this._toggleMenu}
    >
      <span>${this._sortLabel()}</span>
      ${x(u2)}
    </button>`}_renderColumnTitles(){let C=this.strings,V=(M,r)=>{if(!r)return a`<div class="column-title" role="columnheader">
          ${M}
        </div>`;let e=this._sort===r;return a`<div
        class="column-title sortable ${e?"sorted":""}"
        role="columnheader"
        aria-sort=${e?r==="name"?"ascending":"descending":"none"}
      >
        <button .value=${r} @click=${this._handleTitleClick}>
          ${x(A2,"icon sort-icon")}<span>${M}</span>
        </button>
      </div>`};return a`<div class="column-titles" role="row">
      <div class="column-title" role="columnheader">
        <span class="visually-hidden">${C.column_icon}</span>
      </div>
      ${V(C.column_name,"name")}
      ${this._layout==="wide"?V(C.column_area):d}
      ${V(C.column_last_triggered,"last_triggered")}
      ${V(C.column_state,"state")}
      <div class="column-title" role="columnheader">
        <span class="visually-hidden">${C.column_actions}</span>
      </div>
    </div>`}_menuItems(){return this._openMenu==="filter"?$5.map(C=>({value:C,label:this.strings[`filter_${C}`],checked:this._status===C})):this._openMenu==="sort"?N5.map(C=>({value:C,label:this._sortTitle(C),checked:this._sort===C})):[]}_toggleMenu(C){let V=C.currentTarget,M=V.dataset.menu;this._menu?.justClosed()&&this._menuAnchor===V||(this._menuAnchor=V,this._openMenu=this._openMenu===M?void 0:M)}_handleMenuSelect(C){C.stopPropagation(),this._openMenu==="filter"?this._status=C.detail.value:this._openMenu==="sort"&&(this._sort=C.detail.value),this._saveView()}_saveView(){try{localStorage.setItem(L5,JSON.stringify({sort:this._sort,status:this._status}))}catch{}}_handleMenuClosed(C){C.stopPropagation(),this._openMenu=void 0}_handleTitleClick(C){this._sort=C.currentTarget.value,this._saveView()}_handleSearch(C){this._search=C.target.value}_clearSearch(){this._search="",this._searchInput?.focus()}};h.styles=[w,Y,h1,S`
      :host {
        display: block;
        color: var(--primary-text-color);
        font-family: var(--ha-font-family-body, Roboto, Noto, sans-serif);
        -webkit-font-smoothing: var(--ha-font-smoothing, antialiased);
        -moz-osx-font-smoothing: var(--ha-moz-osx-font-smoothing, grayscale);
      }

      /* hass-tabs-subpage-data-table .table-header */
      .table-header {
        display: flex;
        align-items: center;
        height: 56px;
        width: 100%;
        justify-content: space-between;
        padding: 0 16px;
        gap: var(--ha-space-4, 16px);
        box-sizing: border-box;
        background: var(--primary-background-color);
        border-bottom: 1px solid var(--divider-color);
      }
      .search-toolbar {
        display: flex;
        align-items: center;
        padding: 8px 16px;
        background: var(--primary-background-color);
      }
      .chip-row {
        display: flex;
        align-items: center;
        gap: var(--ha-space-4, 16px);
        min-height: 56px;
        padding: 0 16px;
        box-sizing: border-box;
        background: var(--primary-background-color);
        border-bottom: 1px solid var(--divider-color);
      }
      .flex {
        flex: 1;
      }

      /* ha-input-search, outlined */
      .search {
        flex: 1;
        min-width: 0;
        display: flex;
        align-items: center;
        gap: var(--ha-space-2, 8px);
        box-sizing: border-box;
        height: 32px;
        padding-inline: 12px 4px;
        border: 1px solid var(--outline-color, var(--divider-color));
        border-radius: 10px;
        background-color: var(--card-background-color);
        color: var(--secondary-text-color);
        --mdc-icon-size: 20px;
      }
      .search-toolbar .search {
        height: 44px;
        border-radius: var(--ha-border-radius-md, 8px);
      }
      .search:hover {
        border-color: var(--outline-hover-color, var(--secondary-text-color));
      }
      .search:focus-within {
        border-color: var(--primary-color);
        box-shadow: inset 0 0 0 1px var(--primary-color);
      }
      .search input {
        flex: 1;
        min-width: 0;
        height: 100%;
        padding: 0;
        border: none;
        outline: none;
        background: none;
        color: var(--primary-text-color);
        font-family: inherit;
        font-size: var(--ha-font-size-m, 14px);
      }
      .search input::placeholder {
        color: var(--secondary-text-color);
      }
      .search input::-webkit-search-cancel-button {
        display: none;
      }
      .search .clear {
        width: 32px;
        height: 32px;
        padding: 6px;
        flex: none;
      }

      /* ha-filter-pane-chip badge */
      .filter-chip {
        position: relative;
        display: inline-flex;
        flex: none;
      }
      .badge {
        position: absolute;
        top: -4px;
        inset-inline-end: -4px;
        min-width: 16px;
        box-sizing: border-box;
        border-radius: 50%;
        font-size: var(--ha-font-size-xs, 10px);
        font-weight: var(--ha-font-weight-normal, 400);
        background-color: var(--primary-color);
        line-height: var(--ha-line-height-normal, 1.6);
        text-align: center;
        padding: 0 2px;
        color: var(--text-primary-color, #fff);
        pointer-events: none;
      }

      /* ha-data-table */
      .table {
        background-color: var(
          --data-table-background-color,
          var(--card-background-color)
        );
      }
      /* ha-data-table draws a line between rows, not above the first one. */
      .table > automation-pause-row:first-of-type {
        border-top-color: transparent;
      }
      .column-titles {
        display: grid;
        grid-template-columns: var(--automation-pause-columns);
        align-items: center;
        height: 56px;
        border-bottom: 1px solid var(--divider-color);
      }
      .column-title {
        padding-inline: 16px;
        min-width: 0;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        box-sizing: border-box;
        color: var(--primary-text-color);
        font-size: var(--ha-font-size-s, 12px);
        line-height: var(--ha-line-height-normal, 1.6);
        font-weight: var(--ha-font-weight-medium, 500);
        letter-spacing: 0.0071428571em;
        text-align: start;
      }
      .column-title button {
        display: inline-flex;
        align-items: center;
        gap: 0;
        max-width: 100%;
        min-height: 44px;
        padding: 0;
        margin: 0;
        border: none;
        background: none;
        color: inherit;
        font: inherit;
        letter-spacing: inherit;
        cursor: pointer;
      }
      .column-title button:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: -2px;
      }
      .column-title span {
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .sort-icon {
        width: 0;
        margin-inline-end: 0;
        opacity: 0;
        transition:
          width 0.2s ease,
          margin 0.2s ease;
        --mdc-icon-size: 18px;
      }
      .sortable.sorted .sort-icon,
      .sortable button:hover .sort-icon {
        width: 18px;
        margin-inline-end: 6px;
        opacity: 1;
      }
      .sortable:not(.sorted) button:hover .sort-icon {
        opacity: 0.5;
      }
      .empty {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 60px;
        padding: 16px;
        box-sizing: border-box;
        text-align: center;
        font-size: 0.875rem;
        color: var(--primary-text-color);
      }
      .visually-hidden {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
        white-space: nowrap;
      }
    `],o([m({attribute:!1})],h.prototype,"items",2),o([m({attribute:!1})],h.prototype,"strings",2),o([m()],h.prototype,"language",2),o([m({attribute:!1})],h.prototype,"now",2),o([m({attribute:!1})],h.prototype,"dateOptions",2),o([Z()],h.prototype,"_search",2),o([Z()],h.prototype,"_status",2),o([Z()],h.prototype,"_sort",2),o([Z()],h.prototype,"_layout",2),o([Z()],h.prototype,"_openMenu",2),o([f("automation-pause-menu")],h.prototype,"_menu",2),o([f(".search input")],h.prototype,"_searchInput",2);b("automation-pause-list",h);var g1="automation-pause-card",W5=3e4,M5=L=>{history.pushState(null,"",L),window.dispatchEvent(new CustomEvent("location-changed",{detail:{replace:!1}}))},P=class extends c{constructor(){super(...arguments);this._now=Date.now();this._dialogBusy=!1;this._dialogError="";this._items=[]}static getStubConfig(){return{type:`custom:${g1}`}}setConfig(C){if(!C||typeof C!="object")throw new Error("Invalid configuration");if(C.entity!==void 0&&(typeof C.entity!="string"||!C.entity.startsWith("sensor.")))throw new Error("entity must be a sensor entity ID");this._config=C}getCardSize(){return 10}getGridOptions(){return{columns:"full"}}connectedCallback(){super.connectedCallback(),this._now=Date.now(),this._timer=window.setInterval(()=>{this._now=Date.now()},W5)}disconnectedCallback(){super.disconnectedCallback(),window.clearInterval(this._timer),this._timer=void 0}_sensorId(C){return $2(C,this._config?.entity)}shouldUpdate(C){if(!C.has("hass")||C.size>1)return!0;let V=C.get("hass"),M=this.hass;if(!V||!M)return!0;let r=this._sensorId(M);if(V.language!==M.language||V.locale!==M.locale||V.entities!==M.entities||V.devices!==M.devices||V.areas!==M.areas||r!==void 0&&V.states[r]!==M.states[r])return!0;for(let e of Object.keys(M.states))if(e.startsWith("automation.")&&V.states[e]!==M.states[e])return!0;for(let e of Object.keys(V.states))if(e.startsWith("automation.")&&!(e in M.states))return!0;return!1}willUpdate(){let C=this.hass;if(C){let V=this._sensorId(C),M=V?C.states[V]:void 0;this._items=N2(C,I2(M?.attributes.paused))}}render(){let C=this.hass;if(!C||!this._config)return d;let V=C.locale?.language??C.language??"en",M=S1(C.language??V),r=this._sensorId(C),e=r?C.states[r]:void 0,i=z2(C),t=this._dialogEntityId?this._items.find(p=>p.entity_id===this._dialogEntityId):void 0;return a`
      ${e?d:a`<div class="alert warning">
              ${x(v1)}
              <span
                >${r?y(M.entity_not_found,{entity:r}):M.sensor_not_found}</span
              >
            </div>`}
      <automation-pause-list
        .items=${this._items}
        .strings=${M}
        .language=${V}
        .now=${this._now}
        .dateOptions=${i}
        @automation-pause-row-action=${this._handleRowAction}
      ></automation-pause-list>
      <automation-pause-dialog
        .open=${t!==void 0}
        .item=${t}
        .strings=${M}
        .language=${V}
        .now=${this._now}
        .dateOptions=${i}
        .durations=${K2(e?.attributes.durations)}
        .busy=${this._dialogBusy}
        .error=${this._dialogError}
        @automation-pause-pause-submit=${this._handlePause}
        @automation-pause-resume-submit=${this._handleResume}
        @automation-pause-dialog-closed=${this._closeDialog}
      ></automation-pause-dialog>
    `}_openDialog(C){this._dialogError="",this._dialogBusy=!1,this._dialogEntityId=C}_closeDialog(){this._dialogEntityId=void 0,this._dialogError="",this._dialogBusy=!1}_handleRowAction(C){let V=this.hass,M=this._items.find(e=>e.entity_id===C.detail.entityId);if(!V||!M)return;let r=M.entity_id;switch(C.detail.action){case"open":case"pause":case"extend":this._openDialog(r);break;case"resume":V.callService(e1,"resume",{},{entity_id:r}).catch(()=>{});break;case"toggle":V.callService("automation",M.state==="off"?"turn_on":"turn_off",{},{entity_id:r}).catch(()=>{});break;case"run":V.callService("automation","trigger",{skip_condition:!0},{entity_id:r}).catch(()=>{});break;case"info":k(this,"hass-more-info",{entityId:r});break;case"settings":k(this,"hass-more-info",{entityId:r,view:"settings"});break;case"trace":M.config_id&&M5(`/config/automation/trace/${encodeURIComponent(M.config_id)}`);break;case"edit":M5(M.config_id?`/config/automation/edit/${encodeURIComponent(M.config_id)}`:`/config/automation/show/${encodeURIComponent(r)}`);break}}async _handlePause(C){let V=this._items.find(M=>M.entity_id===C.detail.entityId);!this.hass||!V||z(V)||await this._callFromDialog("pause",{duration:C.detail.duration,stop_actions:!0})}async _handleResume(C){C.detail.entityId===this._dialogEntityId&&await this._callFromDialog("resume",{})}async _callFromDialog(C,V){let M=this.hass,r=this._dialogEntityId;if(!(!M||!r)){this._dialogBusy=!0,this._dialogError="";try{await M.callService(e1,C,V,{entity_id:r},!1),this._dialogEntityId===r&&this._closeDialog()}catch(e){this._dialogEntityId===r&&(this._dialogBusy=!1,this._dialogError=X2(e,S1(M.language??M.locale?.language)))}}}};P.styles=[w,O1,S`
      :host {
        display: block;
        background-color: var(--primary-background-color);
      }
      .alert {
        margin: 8px 16px;
      }
    `],o([m({attribute:!1})],P.prototype,"hass",2),o([Z()],P.prototype,"_config",2),o([Z()],P.prototype,"_now",2),o([Z()],P.prototype,"_dialogEntityId",2),o([Z()],P.prototype,"_dialogBusy",2),o([Z()],P.prototype,"_dialogError",2);b(g1,P);window.customCards=window.customCards||[];if(!window.customCards.some(L=>L.type===g1)){let L=S1(navigator.language);window.customCards.push({type:g1,name:L.card_name,description:L.card_description,preview:!0,documentationURL:"https://github.com/straybiker/HA-Automation-Pause-and-Resume"})}export{P as AutomationPauseCard};
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
lit-html/lit-html.js:
lit-element/lit-element.js:
@lit/reactive-element/decorators/custom-element.js:
@lit/reactive-element/decorators/property.js:
@lit/reactive-element/decorators/state.js:
@lit/reactive-element/decorators/event-options.js:
@lit/reactive-element/decorators/base.js:
@lit/reactive-element/decorators/query.js:
@lit/reactive-element/decorators/query-all.js:
@lit/reactive-element/decorators/query-async.js:
@lit/reactive-element/decorators/query-assigned-nodes.js:
lit-html/directive.js:
lit-html/directives/repeat.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-assigned-elements.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directive-helpers.js:
lit-html/directives/live.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
