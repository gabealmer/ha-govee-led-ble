const je=globalThis,Ft=je.ShadowRoot&&(je.ShadyCSS===void 0||je.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Ut=Symbol(),si=new WeakMap;let Ni=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==Ut)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(Ft&&e===void 0){const i=t!==void 0&&t.length===1;i&&(e=si.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&si.set(t,e))}return e}toString(){return this.cssText}};const bs=r=>new Ni(typeof r=="string"?r:r+"",void 0,Ut),w=(r,...e)=>{const t=r.length===1?r[0]:e.reduce((i,s,n)=>i+(a=>{if(a._$cssResult$===!0)return a.cssText;if(typeof a=="number")return a;throw Error("Value passed to 'css' function must be a 'css' function result: "+a+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+r[n+1],r[0]);return new Ni(t,r,Ut)},vs=(r,e)=>{if(Ft)r.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const i=document.createElement("style"),s=je.litNonce;s!==void 0&&i.setAttribute("nonce",s),i.textContent=t.cssText,r.appendChild(i)}},ri=Ft?r=>r:r=>r instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return bs(t)})(r):r;const{is:ys,defineProperty:_s,getOwnPropertyDescriptor:$s,getOwnPropertyNames:xs,getOwnPropertySymbols:ks,getPrototypeOf:ws}=Object,rt=globalThis,ni=rt.trustedTypes,Ss=ni?ni.emptyScript:"",Es=rt.reactiveElementPolyfillSupport,Pe=(r,e)=>r,Ze={toAttribute(r,e){switch(e){case Boolean:r=r?Ss:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,e){let t=r;switch(e){case Boolean:t=r!==null;break;case Number:t=r===null?null:Number(r);break;case Object:case Array:try{t=JSON.parse(r)}catch{t=null}}return t}},qt=(r,e)=>!ys(r,e),ai={attribute:!0,type:String,converter:Ze,reflect:!1,useDefault:!1,hasChanged:qt};Symbol.metadata??=Symbol("metadata"),rt.litPropertyMetadata??=new WeakMap;let be=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=ai){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(e,i,t);s!==void 0&&_s(this.prototype,e,s)}}static getPropertyDescriptor(e,t,i){const{get:s,set:n}=$s(this.prototype,e)??{get(){return this[t]},set(a){this[t]=a}};return{get:s,set(a){const l=s?.call(this);n?.call(this,a),this.requestUpdate(e,l,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??ai}static _$Ei(){if(this.hasOwnProperty(Pe("elementProperties")))return;const e=ws(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(Pe("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(Pe("properties"))){const t=this.properties,i=[...xs(t),...ks(t)];for(const s of i)this.createProperty(s,t[s])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[i,s]of t)this.elementProperties.set(i,s)}this._$Eh=new Map;for(const[t,i]of this.elementProperties){const s=this._$Eu(t,i);s!==void 0&&this._$Eh.set(s,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const s of i)t.unshift(ri(s))}else e!==void 0&&t.push(ri(e));return t}static _$Eu(e,t){const i=t.attribute;return i===!1?void 0:typeof i=="string"?i:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return vs(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,i);if(s!==void 0&&i.reflect===!0){const n=(i.converter?.toAttribute!==void 0?i.converter:Ze).toAttribute(t,i.type);this._$Em=e,n==null?this.removeAttribute(s):this.setAttribute(s,n),this._$Em=null}}_$AK(e,t){const i=this.constructor,s=i._$Eh.get(e);if(s!==void 0&&this._$Em!==s){const n=i.getPropertyOptions(s),a=typeof n.converter=="function"?{fromAttribute:n.converter}:n.converter?.fromAttribute!==void 0?n.converter:Ze;this._$Em=s;const l=a.fromAttribute(t,n.type);this[s]=l??this._$Ej?.get(s)??l,this._$Em=null}}requestUpdate(e,t,i,s=!1,n){if(e!==void 0){const a=this.constructor;if(s===!1&&(n=this[e]),i??=a.getPropertyOptions(e),!((i.hasChanged??qt)(n,t)||i.useDefault&&i.reflect&&n===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,i))))return;this.C(e,t,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:s,wrapped:n},a){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),n!==!0||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),s===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[s,n]of this._$Ep)this[s]=n;this._$Ep=void 0}const i=this.constructor.elementProperties;if(i.size>0)for(const[s,n]of i){const{wrapped:a}=n,l=this[s];a!==!0||this._$AL.has(s)||l===void 0||this.C(s,void 0,n,l)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(i=>i.hostUpdate?.()),this.update(t)):this._$EM()}catch(i){throw e=!1,this._$EM(),i}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};be.elementStyles=[],be.shadowRootOptions={mode:"open"},be[Pe("elementProperties")]=new Map,be[Pe("finalized")]=new Map,Es?.({ReactiveElement:be}),(rt.reactiveElementVersions??=[]).push("2.1.2");const Ht=globalThis,oi=r=>r,Qe=Ht.trustedTypes,li=Qe?Qe.createPolicy("lit-html",{createHTML:r=>r}):void 0,Ri="$lit$",ee=`lit$${Math.random().toFixed(9).slice(2)}$`,Oi="?"+ee,Cs=`<${Oi}>`,ce=document,Le=()=>ce.createComment(""),Me=r=>r===null||typeof r!="object"&&typeof r!="function",Vt=Array.isArray,As=r=>Vt(r)||typeof r?.[Symbol.iterator]=="function",ht=`[ 	
\f\r]`,Ce=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,di=/-->/g,ci=/>/g,re=RegExp(`>|${ht}(?:([^\\s"'>=/]+)(${ht}*=${ht}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ui=/'/g,pi=/"/g,Bi=/^(?:script|style|textarea|title)$/i,Is=r=>(e,...t)=>({_$litType$:r,strings:e,values:t}),o=Is(1),K=Symbol.for("lit-noChange"),d=Symbol.for("lit-nothing"),hi=new WeakMap,oe=ce.createTreeWalker(ce,129);function Fi(r,e){if(!Vt(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return li!==void 0?li.createHTML(e):e}const Ps=(r,e)=>{const t=r.length-1,i=[];let s,n=e===2?"<svg>":e===3?"<math>":"",a=Ce;for(let l=0;l<t;l++){const c=r[l];let p,b,_=-1,F=0;for(;F<c.length&&(a.lastIndex=F,b=a.exec(c),b!==null);)F=a.lastIndex,a===Ce?b[1]==="!--"?a=di:b[1]!==void 0?a=ci:b[2]!==void 0?(Bi.test(b[2])&&(s=RegExp("</"+b[2],"g")),a=re):b[3]!==void 0&&(a=re):a===re?b[0]===">"?(a=s??Ce,_=-1):b[1]===void 0?_=-2:(_=a.lastIndex-b[2].length,p=b[1],a=b[3]===void 0?re:b[3]==='"'?pi:ui):a===pi||a===ui?a=re:a===di||a===ci?a=Ce:(a=re,s=void 0);const Z=a===re&&r[l+1].startsWith("/>")?" ":"";n+=a===Ce?c+Cs:_>=0?(i.push(p),c.slice(0,_)+Ri+c.slice(_)+ee+Z):c+ee+(_===-2?l:Z)}return[Fi(r,n+(r[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),i]};class Ne{constructor({strings:e,_$litType$:t},i){let s;this.parts=[];let n=0,a=0;const l=e.length-1,c=this.parts,[p,b]=Ps(e,t);if(this.el=Ne.createElement(p,i),oe.currentNode=this.el.content,t===2||t===3){const _=this.el.content.firstChild;_.replaceWith(..._.childNodes)}for(;(s=oe.nextNode())!==null&&c.length<l;){if(s.nodeType===1){if(s.hasAttributes())for(const _ of s.getAttributeNames())if(_.endsWith(Ri)){const F=b[a++],Z=s.getAttribute(_).split(ee),He=/([.?@])?(.*)/.exec(F);c.push({type:1,index:n,name:He[2],strings:Z,ctor:He[1]==="."?Ts:He[1]==="?"?Ls:He[1]==="@"?Ms:nt}),s.removeAttribute(_)}else _.startsWith(ee)&&(c.push({type:6,index:n}),s.removeAttribute(_));if(Bi.test(s.tagName)){const _=s.textContent.split(ee),F=_.length-1;if(F>0){s.textContent=Qe?Qe.emptyScript:"";for(let Z=0;Z<F;Z++)s.append(_[Z],Le()),oe.nextNode(),c.push({type:2,index:++n});s.append(_[F],Le())}}}else if(s.nodeType===8)if(s.data===Oi)c.push({type:2,index:n});else{let _=-1;for(;(_=s.data.indexOf(ee,_+1))!==-1;)c.push({type:7,index:n}),_+=ee.length-1}n++}}static createElement(e,t){const i=ce.createElement("template");return i.innerHTML=e,i}}function ke(r,e,t=r,i){if(e===K)return e;let s=i!==void 0?t._$Co?.[i]:t._$Cl;const n=Me(e)?void 0:e._$litDirective$;return s?.constructor!==n&&(s?._$AO?.(!1),n===void 0?s=void 0:(s=new n(r),s._$AT(r,t,i)),i!==void 0?(t._$Co??=[])[i]=s:t._$Cl=s),s!==void 0&&(e=ke(r,s._$AS(r,e.values),s,i)),e}class Ds{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,s=(e?.creationScope??ce).importNode(t,!0);oe.currentNode=s;let n=oe.nextNode(),a=0,l=0,c=i[0];for(;c!==void 0;){if(a===c.index){let p;c.type===2?p=new Oe(n,n.nextSibling,this,e):c.type===1?p=new c.ctor(n,c.name,c.strings,this,e):c.type===6&&(p=new Ns(n,this,e)),this._$AV.push(p),c=i[++l]}a!==c?.index&&(n=oe.nextNode(),a++)}return oe.currentNode=ce,s}p(e){let t=0;for(const i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class Oe{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,s){this.type=2,this._$AH=d,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=ke(this,e,t),Me(e)?e===d||e==null||e===""?(this._$AH!==d&&this._$AR(),this._$AH=d):e!==this._$AH&&e!==K&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):As(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==d&&Me(this._$AH)?this._$AA.nextSibling.data=e:this.T(ce.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,s=typeof i=="number"?this._$AC(e):(i.el===void 0&&(i.el=Ne.createElement(Fi(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(t);else{const n=new Ds(s,this),a=n.u(this.options);n.p(t),this.T(a),this._$AH=n}}_$AC(e){let t=hi.get(e.strings);return t===void 0&&hi.set(e.strings,t=new Ne(e)),t}k(e){Vt(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,s=0;for(const n of e)s===t.length?t.push(i=new Oe(this.O(Le()),this.O(Le()),this,this.options)):i=t[s],i._$AI(n),s++;s<t.length&&(this._$AR(i&&i._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const i=oi(e).nextSibling;oi(e).remove(),e=i}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}}class nt{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,s,n){this.type=1,this._$AH=d,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=n,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=d}_$AI(e,t=this,i,s){const n=this.strings;let a=!1;if(n===void 0)e=ke(this,e,t,0),a=!Me(e)||e!==this._$AH&&e!==K,a&&(this._$AH=e);else{const l=e;let c,p;for(e=n[0],c=0;c<n.length-1;c++)p=ke(this,l[i+c],t,c),p===K&&(p=this._$AH[c]),a||=!Me(p)||p!==this._$AH[c],p===d?e=d:e!==d&&(e+=(p??"")+n[c+1]),this._$AH[c]=p}a&&!s&&this.j(e)}j(e){e===d?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class Ts extends nt{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===d?void 0:e}}class Ls extends nt{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==d)}}class Ms extends nt{constructor(e,t,i,s,n){super(e,t,i,s,n),this.type=5}_$AI(e,t=this){if((e=ke(this,e,t,0)??d)===K)return;const i=this._$AH,s=e===d&&i!==d||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,n=e!==d&&(i===d||s);s&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class Ns{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){ke(this,e)}}const Rs=Ht.litHtmlPolyfillSupport;Rs?.(Ne,Oe),(Ht.litHtmlVersions??=[]).push("3.3.3");const Os=(r,e,t)=>{const i=t?.renderBefore??e;let s=i._$litPart$;if(s===void 0){const n=t?.renderBefore??null;i._$litPart$=s=new Oe(e.insertBefore(Le(),n),n,void 0,t??{})}return s._$AI(r),s};const Kt=globalThis;let P=class extends be{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Os(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return K}};P._$litElement$=!0,P.finalized=!0,Kt.litElementHydrateSupport?.({LitElement:P});const Bs=Kt.litElementPolyfillSupport;Bs?.({LitElement:P});(Kt.litElementVersions??=[]).push("4.2.2");const Fs={attribute:!0,type:String,converter:Ze,reflect:!1,hasChanged:qt},Us=(r=Fs,e,t)=>{const{kind:i,metadata:s}=t;let n=globalThis.litPropertyMetadata.get(s);if(n===void 0&&globalThis.litPropertyMetadata.set(s,n=new Map),i==="setter"&&((r=Object.create(r)).wrapped=!0),n.set(t.name,r),i==="accessor"){const{name:a}=t;return{set(l){const c=e.get.call(this);e.set.call(this,l),this.requestUpdate(a,c,r,!0,l)},init(l){return l!==void 0&&this.C(a,void 0,r,l),l}}}if(i==="setter"){const{name:a}=t;return function(l){const c=this[a];e.call(this,l),this.requestUpdate(a,c,r,!0,l)}}throw Error("Unsupported decorator location: "+i)};function h(r){return(e,t)=>typeof t=="object"?Us(r,e,t):((i,s,n)=>{const a=s.hasOwnProperty(n);return s.constructor.createProperty(n,i),a?Object.getOwnPropertyDescriptor(s,n):void 0})(r,e,t)}function m(r){return h({...r,state:!0,attribute:!1})}function Ui(r,e,t){return Math.min(t,Math.max(e,r))}function k(r,e,t){return Ui(Math.round(r),e,t)}function M(r){return[...r]}function O(r){return r.map(M)}function et(r,e){return r[0]===e[0]&&r[1]===e[1]&&r[2]===e[2]}function S(r){return`#${r.map(e=>e.toString(16).padStart(2,"0")).join("")}`}function mi(r){return[Number.parseInt(r.slice(1,3),16),Number.parseInt(r.slice(3,5),16),Number.parseInt(r.slice(5,7),16)]}function De(r,e){return r.localeCompare(e,"en-AU",{sensitivity:"base"})}function Ct(r,e,t){return r===void 0||e===t?r:r===e?t:e<t&&r>e&&r<=t?r-1:t<e&&r>=t&&r<e?r+1:r}function B(r){return r instanceof Error||typeof r=="object"&&r!==null&&"message"in r&&typeof r.message=="string"?r.message:"An unexpected error occurred."}function At(r){if(typeof r=="object"&&r!==null&&"code"in r&&typeof r.code=="string")return r.code}const qi=[1,2,0,3],Hi=[0,1,2,3],tt=Symbol("applied-area-segments");function mt(){return{kind:"advanced",layers:[Vi()]}}function _e(r){return{kind:"advanced",layers:r.layers.map(V)}}function le(r){return{...r,template:{...r.template},effect:{layers:_e({layers:r.effect.layers}).layers}}}function Vi(){return{area:{start_tenths:0,width_tenths:10},selection:{type:0,param_1:0,param_2:1},brightness_gradient:!1,brightness_patterns:[Ki()],distribution:{method:1,backwards:!1},colour_speed:128,colour_retention:20,palette:[[255,0,0],[0,0,255]],selected_movement:fi(),overall_movement:fi(),priority:0,unknown_flags:0,excess:""}}function Ki(){return{scope_high:255,scope_low:0,order:0,change_speed:128,brightest_retention:20,darkest_retention:20}}function fi(){return{enabled:!1,enter_exit:!1,direction:0,distance:1,speed:128,unknown_flags:0}}function V(r){const e={...r,area:{...r.area},selection:{...r.selection},brightness_patterns:r.brightness_patterns.map(i=>({...i})),distribution:{...r.distribution},palette:O(r.palette),selected_movement:{...r.selected_movement},overall_movement:{...r.overall_movement}},t=r[tt];return t&&Object.defineProperty(e,tt,{value:{...t},configurable:!0}),e}function qs(r){return qi.includes(r)}function Hs(r){return Hi.includes(r)}function Vs(r){return Math.round(k(r,0,255)/255*100)}function Ve(r){return r.toString(16).padStart(2,"0").toUpperCase()}function Ks(r){const e=r.trim().replace(/^0x/i,"");if(/^[0-9a-f]{1,2}$/i.test(e))return Number.parseInt(e,16)}function zs(r,e,t=10){const i=k(r,1,Math.max(1,Math.round(t)));return{start:k(e,0,i-1),end:i}}function js(r,e,t=10){const i=Math.max(1,Math.round(t)),s=k(r,0,i-1);return{start:s,end:k(e,s+1,i)}}function Gs(r,e,t,i=10){const s=Math.max(1,Math.round(i)),n=k(r,0,s-1),l=k(e,n+1,s)-n,c=k(t,0,s-l);return{start:c,end:c+l}}function Ys(r,e,t){const i=Math.max(1,Math.round(t)),s=Math.min(i-1,Math.floor(k(r,0,9)*i/10)),n=Math.max(1,Math.round(k(e,1,10-k(r,0,9))*i/10)),a=Math.min(i,s+n);return{start:s,end:a,length:a-s}}function zi(r,e,t){const i=Math.max(1,Math.round(t)),s=k(r,0,i-1),n=k(e,s+1,i),a=k(s*10/i,0,9);return{start:a,end:k(n*10/i,a+1,10)}}function gi(r,e){const t=r[tt];if(t?.segmentCount===e&&t.start>=0&&t.end<=e&&t.end>t.start){const i=zi(t.start,t.end,e);if(r.area.start_tenths===i.start&&r.area.width_tenths===i.end-i.start)return{start:t.start,end:t.end,length:t.end-t.start}}return Xs(r,e)}function Ws(r,e,t,i){const s=Math.max(1,Math.round(i)),n=k(e,0,s-1),a=k(t,n+1,s),l=zi(n,a,s),c=V({...r,area:{start_tenths:l.start,width_tenths:l.end-l.start}});return Object.defineProperty(c,tt,{value:{segmentCount:s,start:n,end:a},configurable:!0}),c}function Xs(r,e){return Ys(r.area.start_tenths,r.area.width_tenths,e)}const R=w`
  :host {
    --studio-blue: var(--primary-color, #03a9f4);
    --studio-blue-soft: color-mix(
      in srgb,
      var(--studio-blue) 13%,
      transparent
    );
    --studio-border: var(--divider-color, #d8dce2);
    --studio-card: var(--card-background-color, #fff);
    --studio-muted: var(--secondary-text-color, #68707c);
    --studio-danger: var(--error-color, #db4437);
    --studio-control-height: 44px;
    --studio-control-radius: 8px;
    --studio-button-radius: 9px;
    --studio-card-radius: 10px;
    --studio-card-padding: 20px;
    --studio-section-gap: 18px;
    --studio-parameter-gap: 18px;
    --studio-parameter-label-size: 13px;
    --studio-parameter-label-weight: 600;
    --studio-section-title-size: 16px;
    --studio-section-title-weight: 600;
    --studio-action-padding: 8px 17px;
    --studio-disabled-opacity: 0.52;
    --studio-focus-width: 3px;
    --studio-focus-offset: 2px;
    --studio-popover-padding: 10px;
    --studio-popover-radius: 9px;
    --studio-popover-shadow: 0 8px 24px rgb(0 0 0 / 18%);
    --studio-mobile-gutter: 24px;
  }

  * {
    box-sizing: border-box;
  }

  button,
  input,
  select {
    font: inherit;
  }

  button {
    min-height: var(--studio-control-height);
  }

  button:disabled,
  input:disabled,
  select:disabled {
    cursor: not-allowed;
    opacity: var(--studio-disabled-opacity);
  }
`,ue=w`
  .card {
    min-width: 0;
    padding: var(--studio-card-padding);
    border: 1px solid var(--studio-border);
    border-radius: var(--studio-card-radius);
    background: var(--studio-card);
  }

  .section-title {
    margin: 0 0 14px;
    font-size: var(--studio-section-title-size);
    font-weight: var(--studio-section-title-weight);
    line-height: 1.35;
  }
`,zt=w`
  .primary,
  .secondary,
  .danger {
    min-height: var(--studio-control-height);
    padding: var(--studio-action-padding);
    border-radius: var(--studio-button-radius);
    font-weight: 600;
    cursor: pointer;
  }

  .primary {
    border: 1px solid var(--studio-blue);
    color: var(--text-primary-color, #fff);
    background: var(--studio-blue);
  }

  .secondary {
    border: 1px solid var(--studio-border);
    color: var(--primary-text-color);
    background: var(--studio-card);
  }

  .danger {
    border: 1px solid var(--studio-danger);
    color: var(--studio-danger);
    background: var(--studio-card);
  }

  .danger:hover,
  .danger:focus-visible {
    color: var(--text-primary-color, #fff);
    background: var(--studio-danger);
  }

  .secondary.active {
    color: var(--studio-blue);
    border-color: var(--studio-blue);
    background: var(--studio-blue-soft);
  }
`,ji=w`
  .selector {
    width: 100%;
    min-height: var(--studio-control-height);
    padding: 9px 11px;
    border: 0;
    border-radius: var(--studio-control-radius);
    color: var(--primary-text-color);
    background: transparent;
    text-align: start;
    cursor: pointer;
  }

  .selector:hover {
    background: color-mix(
      in srgb,
      var(--primary-text-color) 6%,
      transparent
    );
  }

  .selector.selected {
    color: var(--studio-blue);
    background: var(--studio-blue-soft);
    font-weight: 650;
  }
`,Y=w`
  .parameter-stack {
    display: grid;
    gap: var(--studio-parameter-gap);
  }

  .parameter-stack > .field,
  .parameter-stack > .range-field,
  .parameter-stack > .parameter-group,
  .parameter-stack > .check-field {
    margin-top: 0;
  }

  .parameter-group {
    display: grid;
    gap: 10px;
  }

  .check-field {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: var(--studio-control-height);
  }

  .check-field input[type="checkbox"] {
    width: 20px;
    height: 20px;
    margin: 0;
    accent-color: var(--studio-blue);
  }

  .parameter-label,
  .field > span:first-child,
  .range-field > span:first-child,
  .check-field > span:last-child {
    color: var(--studio-muted);
    font-size: var(--studio-parameter-label-size);
    font-weight: var(--studio-parameter-label-weight);
    line-height: 1.35;
  }

  .parameter-options {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .parameter-options button {
    min-width: 0;
    flex: 1;
    padding: 8px 12px;
    border: 1px solid var(--studio-border);
    border-radius: var(--studio-control-radius);
    color: var(--primary-text-color);
    background: var(--studio-card);
    font-size: var(--studio-parameter-label-size);
    font-weight: var(--studio-parameter-label-weight);
    cursor: pointer;
  }

  .parameter-options button.selected,
  .parameter-options button[aria-pressed="true"] {
    color: var(--studio-blue);
    border-color: var(--studio-blue);
    background: var(--studio-blue-soft);
  }

  .field,
  .range-field {
    display: grid;
    align-items: center;
    gap: 10px;
    margin-top: 14px;
  }

  .field input,
  .field select {
    width: 100%;
    min-width: 0;
    min-height: var(--studio-control-height);
    padding: 8px 10px;
    border: 1px solid var(--studio-border);
    border-radius: var(--studio-control-radius);
    color: var(--primary-text-color);
    background: var(--studio-card);
  }

  .range-field input[type="range"] {
    width: 100%;
    min-width: 0;
    min-height: var(--studio-control-height);
    margin: 0;
  }

  .range-field output {
    color: var(--primary-text-color);
    text-align: end;
  }
`,Gi=w`
  .editor-heading {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 22px;
  }

  .editor-name {
    width: min(460px, 100%);
    min-height: 42px;
    padding: 8px 0;
    border: 0;
    border-bottom: 1px solid var(--studio-border);
    border-radius: 0;
    color: var(--primary-text-color);
    background: transparent;
    font-size: 24px;
    font-weight: 600;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 9px;
  }

  @media (max-width: 600px) {
    .editor-heading {
      align-items: stretch;
      flex-direction: column;
    }

    .actions > button {
      flex: 1;
    }
  }
`,jt=w`
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }
`,Yi=w`
  .sidebar {
    overflow: auto;
    padding: 22px 16px;
    border-inline-end: 1px solid var(--studio-border);
  }

  .category-sidebar {
    background: var(--secondary-background-color, #f5f6f8);
  }

  .item-sidebar {
    background: var(--primary-background-color);
  }

  .editor-surface {
    min-width: 0;
    padding: 28px;
    background: var(--secondary-background-color, #f5f6f8);
  }

  @media (max-width: 900px) {
    .category-sidebar {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      padding: 12px 16px;
      border-inline-end: 0;
      border-bottom: 1px solid var(--studio-border);
    }

    .category-sidebar .selector {
      flex: 0 0 auto;
      width: auto;
      white-space: nowrap;
    }

    .item-sidebar {
      max-height: 340px;
      border-inline-end: 0;
      border-bottom: 1px solid var(--studio-border);
    }
  }

  @media (max-width: 760px) {
    .editor-surface {
      padding: 20px 16px 32px;
    }
  }
`,Wi=w`
  .feedback {
    margin-bottom: var(--studio-section-gap);
    padding: 12px 14px;
    border: 1px solid var(--studio-border);
    border-radius: var(--studio-button-radius);
    background: var(--studio-card);
    line-height: 1.45;
  }
`;var Js=Object.defineProperty,Gt=(r,e,t,i)=>{for(var s=void 0,n=r.length-1,a;n>=0;n--)(a=r[n])&&(s=a(e,t,s)||s);return s&&Js(e,t,s),s};class at extends P{constructor(){super(...arguments),this.label="",this.checked=!1,this.disabled=!1}render(){return o`
      <label class="check-field">
        <input
          type="checkbox"
          .checked=${this.checked}
          ?disabled=${this.disabled}
          @change=${this.checkedChanged}
        />
        <span class="parameter-label">${this.label}</span>
      </label>
    `}checkedChanged(e){this.dispatchEvent(new CustomEvent("checked-changed",{detail:{checked:e.target.checked},bubbles:!0,composed:!0}))}static{this.styles=[R,Y,w`
      :host {
        display: block;
      }
    `]}}Gt([h()],at.prototype,"label");Gt([h({type:Boolean})],at.prototype,"checked");Gt([h({type:Boolean})],at.prototype,"disabled");customElements.get("govee-checkbox-control")||customElements.define("govee-checkbox-control",at);var Zs=Object.defineProperty,pe=(r,e,t,i)=>{for(var s=void 0,n=r.length-1,a;n>=0;n--)(a=r[n])&&(s=a(e,t,s)||s);return s&&Zs(e,t,s),s};class ie extends P{constructor(){super(...arguments),this.items=[],this.ariaLabel="Items",this.itemRole="button",this.addLabel="Add item",this.addDisabled=!1,this.reorderDisabled=!1,this.pointerX=0,this.pointerY=0,this.pointerMoved=!1,this.suppressClick=!1}render(){const e=this.itemRole==="tab";return o`
      <ul
        class="item-list"
        aria-label=${this.ariaLabel}
        role=${e?"tablist":d}
      >
        ${this.items.map((t,i)=>o`
            <li
              class="item-wrapper"
              role=${e?"presentation":d}
              data-item-index=${i}
              draggable=${this.reorderDisabled?"false":"true"}
              @dragstart=${s=>this.dragStarted(i,s)}
              @dragover=${s=>{this.reorderDisabled||s.preventDefault()}}
              @drop=${s=>this.dropped(i,s)}
              @pointerdown=${s=>this.pointerStarted(i,s)}
              @pointermove=${this.pointerMovedOver}
              @pointerup=${this.pointerFinished}
              @pointercancel=${this.pointerFinished}
            >
              <button
                id=${t.id??d}
                class="item ${t.colour?"colour":"label"} ${i===this.activeIndex?"selected":""} ${t.removeReady?"remove-ready":""}"
                type="button"
                role=${e?"tab":d}
                aria-label=${t.ariaLabel}
                aria-selected=${e?String(i===this.activeIndex):d}
                aria-controls=${t.ariaControls??d}
                tabindex=${e?i===this.activeIndex?"0":"-1":d}
                style=${t.colour?`--item-colour: ${t.colour}`:d}
                ?disabled=${t.disabled}
                @click=${()=>this.itemClicked(i)}
                @keydown=${s=>this.keyPressed(i,s)}
              >
                ${t.colour?d:t.label}
              </button>
              <slot name="item-${i}"></slot>
            </li>
          `)}
        <li>
          <button
            class="add"
            type="button"
            title=${this.addLabel}
            aria-label=${this.addLabel}
            ?disabled=${this.addDisabled}
            @click=${this.addClicked}
          >
            +
          </button>
        </li>
      </ul>
    `}focusItem(e){this.updateComplete.then(()=>{this.shadowRoot?.querySelectorAll(".item")[e]?.focus()})}itemClicked(e){if(this.suppressClick){this.suppressClick=!1;return}this.dispatchEvent(new CustomEvent("item-selected",{detail:{index:e},bubbles:!0,composed:!0}))}addClicked(){this.dispatchEvent(new CustomEvent("item-added",{bubbles:!0,composed:!0}))}dragStarted(e,t){this.reorderDisabled||(this.draggedIndex=e,t.dataTransfer?.setData("text/plain",String(e)))}dropped(e,t){t.preventDefault(),this.draggedIndex!==void 0&&(this.reorder(this.draggedIndex,e),this.draggedIndex=void 0)}keyPressed(e,t){if(t.key!=="ArrowLeft"&&t.key!=="ArrowRight")return;t.preventDefault();const i=e+(t.key==="ArrowLeft"?-1:1);if(!(i<0||i>=this.items.length)){if(this.reorderDisabled){this.itemRole==="tab"&&(this.itemClicked(i),this.focusItem(i));return}this.reorder(e,i,!0)}}pointerStarted(e,t){this.reorderDisabled||t.pointerType==="mouse"||t.target.closest(".strip-popover")||(this.suppressClick=!1,this.pointerId=t.pointerId,this.pointerIndex=e,this.pointerTarget=t.currentTarget,this.pointerX=t.clientX,this.pointerY=t.clientY,this.pointerMoved=!1)}pointerMovedOver(e){if(e.pointerId!==this.pointerId||this.pointerIndex===void 0)return;const t=e.clientX-this.pointerX,i=e.clientY-this.pointerY;if(!this.pointerMoved){if(Math.abs(i)>Math.abs(t)||Math.abs(t)<10)return;this.pointerMoved=!0,this.pointerTarget?.setPointerCapture(e.pointerId)}e.preventDefault();const s=this.shadowRoot?.elementFromPoint(e.clientX,e.clientY)?.closest("[data-item-index]"),n=Number(s?.dataset.itemIndex);!Number.isInteger(n)||n===this.pointerIndex||(this.reorder(this.pointerIndex,n),this.pointerIndex=n)}pointerFinished(e){if(e.pointerId!==this.pointerId)return;const t=this.pointerTarget;t?.hasPointerCapture(e.pointerId)&&t.releasePointerCapture(e.pointerId),this.suppressClick=this.pointerMoved,this.pointerId=void 0,this.pointerIndex=void 0,this.pointerTarget=void 0,this.pointerMoved=!1}reorder(e,t,i=!1){this.reorderDisabled||e===t||(this.dispatchEvent(new CustomEvent("items-reordered",{detail:{from:e,to:t},bubbles:!0,composed:!0})),i&&this.focusItem(t))}static{this.styles=[R,w`
    :host {
      display: block;
    }

    .item-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .item-wrapper {
      position: relative;
      touch-action: pan-y;
    }

    .item-wrapper[draggable="true"] {
      cursor: grab;
    }

    .item,
    .add {
      height: var(--studio-control-height);
      padding: 0;
      border-radius: var(--studio-control-radius);
      cursor: pointer;
    }

    .item {
      border: 1px solid rgb(0 0 0 / 14%);
    }

    .item.colour,
    .add {
      width: var(--studio-control-height);
    }

    .item.colour {
      background: var(--item-colour);
    }

    .item.label {
      min-width: 76px;
      padding: 0 14px;
      color: var(--primary-text-color);
      background: var(--studio-card);
      font-weight: 600;
    }

    .item.label.selected {
      color: var(--studio-blue);
      border-color: var(--studio-blue);
      background: var(--studio-blue-soft);
    }

    .item.remove-ready {
      position: relative;
      outline: 2px solid rgb(255 255 255 / 95%);
      outline-offset: -4px;
    }

    .item.remove-ready::after {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      color: #fff;
      font-size: 26px;
      font-weight: 500;
      text-shadow: 0 1px 4px rgb(0 0 0 / 80%);
      content: "×";
      pointer-events: none;
    }

    .add {
      display: grid;
      place-items: center;
      border: 1px dashed var(--studio-border);
      color: var(--studio-blue);
      background: transparent;
      font-size: 24px;
    }

    .item:focus-visible,
    .add:focus-visible {
      outline: var(--studio-focus-width) solid var(--studio-blue);
      outline-offset: var(--studio-focus-offset);
    }

    ::slotted(.strip-popover) {
      position: absolute;
      z-index: 25;
      top: 52px;
      left: 0;
      width: min(var(--strip-popover-width, 280px), calc(100vw - 48px));
      padding: var(--studio-popover-padding);
      border: 1px solid var(--studio-border);
      border-radius: var(--studio-popover-radius);
      background: var(--studio-card);
      box-shadow: var(--studio-popover-shadow);
    }

    @media (max-width: 600px) {
      ::slotted(.strip-popover) {
        position: fixed;
        top: 50%;
        right: var(--studio-mobile-gutter);
        left: var(--studio-mobile-gutter);
        width: auto;
        max-height: calc(100vh - 48px);
        overflow: auto;
        transform: translateY(-50%);
      }
    }
  `]}}pe([h({attribute:!1})],ie.prototype,"items");pe([h({attribute:!1})],ie.prototype,"activeIndex");pe([h()],ie.prototype,"ariaLabel");pe([h()],ie.prototype,"itemRole");pe([h()],ie.prototype,"addLabel");pe([h({type:Boolean})],ie.prototype,"addDisabled");pe([h({type:Boolean})],ie.prototype,"reorderDisabled");customElements.get("govee-reorderable-strip")||customElements.define("govee-reorderable-strip",ie);var Qs=Object.defineProperty,Be=(r,e,t,i)=>{for(var s=void 0,n=r.length-1,a;n>=0;n--)(a=r[n])&&(s=a(e,t,s)||s);return s&&Qs(e,t,s),s};class Se extends P{constructor(){super(...arguments),this.label="",this.options=[],this.value="",this.disabled=!1,this.hideLabel=!1}render(){return o`
      <div class="parameter-group">
        ${this.hideLabel?d:o`<span class="parameter-label">${this.label}</span>`}
        <div class="parameter-options" role="group" aria-label=${this.label}>
          ${this.options.map(e=>{const t=e.value===this.value;return o`
              <button
                class=${t?"selected":""}
                type="button"
                aria-pressed=${t}
                ?disabled=${this.disabled}
                @click=${()=>this.select(e.value)}
              >
                ${e.label}
              </button>
            `})}
        </div>
      </div>
    `}select(e){this.disabled||e===this.value||this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}static{this.styles=[R,Y,w`
      :host {
        display: block;
      }
    `]}}Be([h()],Se.prototype,"label");Be([h({attribute:!1})],Se.prototype,"options");Be([h({attribute:!1})],Se.prototype,"value");Be([h({type:Boolean})],Se.prototype,"disabled");Be([h({type:Boolean})],Se.prototype,"hideLabel");customElements.get("govee-segmented-control")||customElements.define("govee-segmented-control",Se);var er=Object.defineProperty,W=(r,e,t,i)=>{for(var s=void 0,n=r.length-1,a;n>=0;n--)(a=r[n])&&(s=a(e,t,s)||s);return s&&er(e,t,s),s};class z extends P{constructor(){super(...arguments),this.label="",this.value=0,this.minimum=0,this.maximum=100,this.step=1,this.disabled=!1,this.showValue=!1}render(){const e=Ui(this.value,this.minimum,this.maximum),t=this.valueText??String(e);return o`
      <label class="slider-field">
        <span class="slider-heading">
          <span class="parameter-label">${this.label}</span>
          ${this.showValue||this.valueText!==void 0?o`<output aria-label="${this.label} value">${t}</output>`:d}
        </span>
        <input
          type="range"
          min=${this.minimum}
          max=${this.maximum}
          step=${this.step}
          .value=${String(e)}
          aria-label=${this.label}
          aria-describedby=${this.describedBy??d}
          ?disabled=${this.disabled}
          @input=${this.inputChanged}
        />
      </label>
    `}inputChanged(e){this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:Number(e.target.value)},bubbles:!0,composed:!0}))}static{this.styles=[R,Y,w`
      :host {
        display: block;
      }

      .slider-field {
        display: grid;
        gap: 10px;
      }

      .slider-heading {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 12px;
      }

      output {
        color: var(--primary-text-color);
        font-variant-numeric: tabular-nums;
      }

      input {
        width: 100%;
        min-width: 0;
        min-height: var(--studio-control-height);
        margin: 0;
      }
    `]}}W([h()],z.prototype,"label");W([h({type:Number})],z.prototype,"value");W([h({type:Number})],z.prototype,"minimum");W([h({type:Number})],z.prototype,"maximum");W([h({type:Number})],z.prototype,"step");W([h({type:Boolean})],z.prototype,"disabled");W([h({type:Boolean})],z.prototype,"showValue");W([h({attribute:!1})],z.prototype,"valueText");W([h({attribute:!1})],z.prototype,"describedBy");customElements.get("govee-slider-control")||customElements.define("govee-slider-control",z);var tr=Object.defineProperty,Yt=(r,e,t,i)=>{for(var s=void 0,n=r.length-1,a;n>=0;n--)(a=r[n])&&(s=a(e,t,s)||s);return s&&tr(e,t,s),s};class ot extends P{constructor(){super(...arguments),this.label="",this.checked=!1,this.disabled=!1}render(){return o`
      <button
        class=${this.checked?"on":""}
        type="button"
        role="switch"
        aria-checked=${this.checked}
        aria-label=${this.label}
        ?disabled=${this.disabled}
        @click=${this.toggle}
      >
        <span aria-hidden="true"></span>
      </button>
    `}toggle(){this.dispatchEvent(new CustomEvent("checked-changed",{detail:{checked:!this.checked},bubbles:!0,composed:!0}))}static{this.styles=[R,w`
      :host {
        display: inline-block;
        flex: 0 0 auto;
      }

      button {
        position: relative;
        width: 60px;
        min-height: var(--studio-control-height);
        height: var(--studio-control-height);
        padding: 0;
        border: 1px solid var(--studio-border);
        border-radius: 999px;
        background: var(--secondary-background-color, #f5f6f8);
        cursor: pointer;
      }

      button span {
        position: absolute;
        top: 6px;
        left: 6px;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: var(--studio-muted);
        transition: transform 120ms ease;
      }

      button.on {
        border-color: var(--studio-blue);
        background: var(--studio-blue);
      }

      button.on span {
        background: var(--text-primary-color, #fff);
        transform: translateX(18px);
      }

      @media (prefers-reduced-motion: reduce) {
        button span {
          transition: none;
        }
      }
    `]}}Yt([h()],ot.prototype,"label");Yt([h({type:Boolean})],ot.prototype,"checked");Yt([h({type:Boolean})],ot.prototype,"disabled");customElements.get("govee-switch-control")||customElements.define("govee-switch-control",ot);var ir=Object.defineProperty,se=(r,e,t,i)=>{for(var s=void 0,n=r.length-1,a;n>=0;n--)(a=r[n])&&(s=a(e,t,s)||s);return s&&ir(e,t,s),s};const me=5,bi=8,ft=15,sr=[1,2,3,4,5].map(r=>({value:r,label:String(r)})),rr={0:"Segment",1:"Continuous",2:"Random",3:"Custom"},nr={0:"Brightest to darkest",1:"Brightest, darkest, brightest",2:"Darkest to brightest",3:"Darkest, brightest, darkest"},vi={0:"Forward",1:"Backward",2:"Forward and back",3:"Back and forward"};class X extends P{constructor(){super(...arguments),this.disabled=!1,this.segmentCount=ft,this.activeLayerIndex=0,this.activePatternIndex=0,this.movementAnnouncement="",this.layerActionsOpen=!1,this.windowPointerDown=e=>{if(!this.layerActionsOpen)return;const t=this.shadowRoot?.querySelector(".layer-actions-menu");t&&!e.composedPath().includes(t)&&(this.layerActionsOpen=!1)},this.appliedAreaPointerMoved=e=>{const t=this.appliedAreaDrag;if(!t||t.pointerId!==e.pointerId)return;e.preventDefault();const i=t.track.getBoundingClientRect(),s=t.control==="move"?t.start+Math.round((e.clientX-t.pointerStart)/i.width*this.appliedAreaSegmentCount):Math.round((e.clientX-i.left)/i.width*this.appliedAreaSegmentCount);this.applyAppliedAreaControl(t.control,t.start,t.end,s)},this.finishAppliedAreaDrag=e=>{if(this.appliedAreaDrag?.pointerId!==e.pointerId)return;const t=e.currentTarget;t.hasPointerCapture(e.pointerId)&&t.releasePointerCapture(e.pointerId),this.appliedAreaDrag=void 0,this.appliedAreaActiveControl=void 0}}connectedCallback(){super.connectedCallback(),window.addEventListener("pointerdown",this.windowPointerDown)}disconnectedCallback(){window.removeEventListener("pointerdown",this.windowPointerDown),this.appliedAreaDrag=void 0,this.appliedAreaActiveControl=void 0,super.disconnectedCallback()}willUpdate(e){if(!(!e.has("content")||!this.content)){if(this.content.layers.length===0){this.activeLayerIndex=0,this.activePatternIndex=0;return}if(this.activeLayerIndex=k(this.activeLayerIndex,0,this.content.layers.length-1),this.activeLayer.brightness_patterns.length===0){this.activePatternIndex=0;return}this.activePatternIndex=k(this.activePatternIndex,0,this.activeLayer.brightness_patterns.length-1)}}render(){if(!this.content)return d;if(this.content.layers.length===0)return this.renderEmptyLayers();const e=this.activeLayer,t=this.content.layers.map((i,s)=>({key:`layer-${s}`,label:`Layer ${s+1}`,ariaLabel:`Layer ${s+1}. Drag to reorder or use arrow keys.`,id:`advanced-layer-tab-${s}`,ariaControls:"advanced-layer-panel"}));return o`
      <div class="visually-hidden" aria-live="polite">
        ${this.movementAnnouncement}
      </div>

      <section class="card layer-card">
        <div class="layer-toolbar">
          <govee-reorderable-strip
            .items=${t}
            .activeIndex=${this.activeLayerIndex}
            ariaLabel="Effect layers"
            itemRole="tab"
            addLabel="Add layer"
            .addDisabled=${this.disabled||this.content.layers.length>=me}
            .reorderDisabled=${this.disabled}
            @item-selected=${i=>this.selectLayer(i.detail.index)}
            @items-reordered=${i=>this.reorderLayer(i.detail.from,i.detail.to)}
            @item-added=${this.addLayer}
          ></govee-reorderable-strip>
          ${this.disabled?d:o`
                <div
                  class="layer-actions-menu"
                  @keydown=${this.layerActionsKeyPressed}
                  @focusout=${this.layerActionsFocusOut}
                >
                  <button
                    class="layer-actions-button"
                    type="button"
                    aria-label="Layer actions for Layer ${this.activeLayerIndex+1}"
                    aria-expanded=${this.layerActionsOpen}
                    aria-haspopup="dialog"
                    aria-controls="advanced-layer-actions"
                    @click=${this.toggleLayerActions}
                  >
                    ⋮
                  </button>
                  ${this.layerActionsOpen?o`
                        <div
                          id="advanced-layer-actions"
                          class="layer-actions-popover"
                          role="dialog"
                          aria-label="Layer actions"
                        >
                          <button
                            class="secondary"
                            type="button"
                            ?disabled=${this.content.layers.length>=me}
                            @click=${this.copyLayer}
                          >
                            Copy layer
                          </button>
                          <button
                            class="secondary danger"
                            type="button"
                            ?disabled=${this.content.layers.length===1}
                            @click=${this.deleteLayer}
                          >
                            Delete layer
                          </button>
                        </div>
                      `:d}
                </div>
              `}
        </div>

        ${this.content.layers.length>=me?o`
              <p class="limit-note">
                ${this.content.layers.length>me?`This loaded effect has ${this.content.layers.length} layers. All are preserved, but adding and copying are unavailable while five or more remain.`:"Advanced effects can author up to five layers."}
              </p>
            `:d}
      </section>

      <section
        id="advanced-layer-panel"
        role="tabpanel"
        aria-labelledby="advanced-layer-tab-${this.activeLayerIndex}"
      >
        <div class="control-grid">
          ${this.renderAppliedArea(e)}
          ${this.renderPalette(e)}
          ${this.renderDistribution(e)}
          ${this.renderBrightness(e)}
          ${this.renderMovement(e,"selected_movement","Move selected pattern")}
          ${this.renderMovement(e,"overall_movement","Move whole layer")}
          ${this.renderPriority(e)}
          ${this.renderRawValues(e)}
        </div>
      </section>
    `}renderEmptyLayers(){return o`
      <section class="card empty-state" role="status">
        <h3 class="section-title">No layer records</h3>
        <p class="muted">
          This layered content contains no layer records. It remains preserved
          until you add one.
        </p>
        <button
          class="add-button"
          type="button"
          ?disabled=${this.disabled}
          @click=${this.addLayer}
        >
          Add layer
        </button>
      </section>
    `}get activeLayer(){return this.content.layers[this.activeLayerIndex]}renderAppliedArea(e){const t=e.area.start_tenths>=0&&e.area.start_tenths<=9&&e.area.width_tenths>=1&&e.area.width_tenths<=10-e.area.start_tenths,i=Number.isInteger(this.segmentCount)&&this.segmentCount>0?this.segmentCount:ft,s=S(e.palette[0]??[47,111,237]),n=gi(e,i),a=n.start/i*100,l=n.end/i*100;return o`
      <section class="card wide-card">
        <h3 class="section-title">Applied area</h3>
        <div class="area-control">
          <div
            class="area-range"
            style="--area-segment-count: ${i}; --area-colour: ${s};"
            aria-label="Applied area"
          >
            <div class="area-segments" aria-hidden="true">
              ${Array.from({length:i},(c,p)=>o`
                  <span
                    class=${t&&p>=n.start&&p<n.end?"covered":""}
                  ></span>
                `)}
            </div>
            ${t?o`
                  <div
                    class="area-window"
                    style="left: ${a}%; width: ${l-a}%;"
                  >
                    ${this.renderAppliedAreaSlider("move","Move applied area",n.start,0,i-n.length,`Segments ${n.start+1} to ${n.end}`,n.start+1)}
                    ${this.renderAppliedAreaSlider("left","Applied area left edge",n.start,0,n.end-1,`Segment ${n.start+1}`,n.start+1)}
                    ${this.renderAppliedAreaSlider("right","Applied area right edge",n.end,n.start+1,i,`Segment ${n.end}`,n.end)}
                  </div>
                `:d}
          </div>
          ${t?o`
                <p class="area-help">
                  Drag either edge to resize. Drag the highlighted middle to
                  move the area.
                </p>
              `:d}
        </div>
        ${t?d:o`
              <p class="muted">
                This loaded layer encodes raw area values: start
                ${e.area.start_tenths}, width ${e.area.width_tenths}.
                They remain preserved until replaced.
              </p>
              <button
                class="secondary"
                type="button"
                ?disabled=${this.disabled}
                @click=${()=>this.updateLayer({area:{start_tenths:0,width_tenths:10}})}
              >
                Set full strip
              </button>
            `}
        ${this.renderSelectionControls(e)}
      </section>
    `}renderAppliedAreaSlider(e,t,i,s,n,a,l){return o`
      <div
        class=${e==="move"?"area-move":`area-handle area-handle-${e}`}
        role="slider"
        tabindex=${this.disabled?-1:0}
        aria-label=${t}
        aria-orientation="horizontal"
        aria-valuemin=${s}
        aria-valuemax=${n}
        aria-valuenow=${i}
        aria-valuetext=${a}
        aria-disabled=${this.disabled?"true":"false"}
        @keydown=${c=>this.appliedAreaKeyPressed(c,e)}
        @pointerdown=${c=>this.startAppliedAreaDrag(c,e)}
        @pointermove=${this.appliedAreaPointerMoved}
        @pointerup=${this.finishAppliedAreaDrag}
        @pointercancel=${this.finishAppliedAreaDrag}
      >
        ${e!=="move"&&this.appliedAreaActiveControl===e?o`<span class="area-drag-value" aria-hidden="true"
              >${l}</span
            >`:d}
      </div>
    `}setAppliedArea(e,t,i){if(!this.content||this.disabled)return;const s=this.content.layers.map((n,a)=>a===this.activeLayerIndex?Ws(n,e,t,i):V(n));this.emitContent({kind:"advanced",layers:s})}appliedAreaKeyPressed(e,t){const{start:i,end:s}=this.renderedAppliedAreaSegments(e.currentTarget),n=e.key==="ArrowLeft"||e.key==="ArrowDown"?-1:e.key==="ArrowRight"||e.key==="ArrowUp"?1:void 0;let a;if(e.key==="Home")a=t==="right"?i+1:0;else if(e.key==="End")a=t==="left"?s-1:t==="right"?this.appliedAreaSegmentCount:this.appliedAreaSegmentCount-(s-i);else if(n!==void 0)a=(t==="right"?s:i)+n;else return;e.preventDefault(),this.applyAppliedAreaControl(t,i,s,a)}startAppliedAreaDrag(e,t){if(this.disabled||e.button!==0&&e.pointerType!=="touch")return;const i=e.currentTarget,s=i.closest(".area-range");if(!s)return;const{start:n,end:a}=this.renderedAppliedAreaSegments(i);i.focus(),e.preventDefault(),e.stopPropagation(),i.setPointerCapture(e.pointerId),this.appliedAreaActiveControl=t,this.appliedAreaDrag={control:t,pointerId:e.pointerId,pointerStart:e.clientX,start:n,end:a,track:s}}applyAppliedAreaControl(e,t,i,s){const n=e==="left"?zs(i,s,this.appliedAreaSegmentCount):e==="right"?js(t,s,this.appliedAreaSegmentCount):Gs(t,i,s,this.appliedAreaSegmentCount);this.setAppliedArea(n.start,n.end,this.appliedAreaSegmentCount)}get appliedAreaSegmentCount(){return Number.isInteger(this.segmentCount)&&this.segmentCount>0?this.segmentCount:ft}renderedAppliedAreaSegments(e){const t=e.closest(".area-window"),i=Number(t?.querySelector(".area-handle-left")?.getAttribute("aria-valuenow")),s=Number(t?.querySelector(".area-handle-right")?.getAttribute("aria-valuenow"));if(Number.isInteger(i)&&Number.isInteger(s)&&i>=0&&s>i&&s<=this.appliedAreaSegmentCount)return{start:i,end:s};const n=gi(this.activeLayer,this.appliedAreaSegmentCount);return{start:n.start,end:n.end}}renderSelectionControls(e){const t=e.selection,i=qs(t.type);return o`
      <div class="selection-controls">
        <span class="parameter-label">Selection</span>
        <label class="field">
          <span>Type</span>
          <select
            aria-label="Selection type"
            .value=${String(t.type)}
            ?disabled=${this.disabled}
            @change=${s=>this.updateSelection({type:Number(s.target.value)})}
          >
            ${qi.map(s=>o`<option
                  value=${s}
                  .selected=${t.type===s}
                >
                  ${rr[s]}
                </option>`)}
            ${i?d:o`
                  <option value=${t.type} .selected=${!0}>
                    Raw type ${t.type} (0x${Ve(t.type)})
                  </option>
                `}
          </select>
        </label>
        ${i?d:o`
              <p class="muted">
                Selection type ${t.type} is not defined by the known
                schema. Its raw value and parameters remain preserved.
              </p>
              ${this.byteNumberField("Type (raw byte)",t.type,s=>this.updateSelection({type:s}))}
            `}
        ${t.type===0?o`
              ${this.byteNumberField("Segments",t.param_2,s=>this.updateSelection({param_2:s}))}
              ${this.byteNumberField("Parameter 1 (raw byte)",t.param_1,s=>this.updateSelection({param_1:s}))}
            `:t.type===1?o`
                ${this.byteNumberField("Count",t.param_2,s=>this.updateSelection({param_2:s}))}
                ${this.byteNumberField("Parameter 1 (raw byte)",t.param_1,s=>this.updateSelection({param_1:s}))}
              `:t.type===2?o`
                  ${this.byteNumberField("Minimum",t.param_2,s=>this.updateSelection({param_2:s}))}
                  ${this.byteNumberField("Maximum",t.param_1,s=>this.updateSelection({param_1:s}))}
                `:t.type===3?o`
                  ${this.byteNumberField("Lit length",t.param_1,s=>this.updateSelection({param_1:s}))}
                  ${this.byteNumberField("Gap",t.param_2,s=>this.updateSelection({param_2:s}))}
                `:o`
                    ${this.byteNumberField("Parameter 1 (raw byte)",t.param_1,s=>this.updateSelection({param_1:s}))}
                    ${this.byteNumberField("Parameter 2 (raw byte)",t.param_2,s=>this.updateSelection({param_2:s}))}
                  `}
      </div>
    `}renderPalette(e){return o`
      <section class="card">
        <h3 class="section-title">Colours</h3>
        <govee-palette-editor
          .palette=${e.palette}
          .minColours=${1}
          .maxColours=${bi}
          .disabled=${this.disabled}
          @palette-changed=${t=>this.updateLayer({palette:t.detail.palette.map(i=>[...i])})}
        ></govee-palette-editor>
        ${e.palette.length>bi?o`
              <p class="muted">
                All ${e.palette.length} loaded colours are preserved.
                Adding remains unavailable until fewer than eight remain.
              </p>
            `:d}
      </section>
    `}renderDistribution(e){const t=e.distribution.method;return o`
      <section class="card">
        <h3 class="section-title">Distribution</h3>
        <label class="field">
          <span>Method</span>
          <select
            .value=${String(t)}
            ?disabled=${this.disabled}
            @change=${i=>this.updateLayer({distribution:{...e.distribution,method:Number(i.target.value)}})}
          >
            <option value="0">Unified</option>
            <option value="1">By IC</option>
            <option value="2">By segment</option>
            ${t>2?o`<option value=${t}>Raw method ${t}</option>`:d}
          </select>
        </label>
        ${t>2?this.numberField("Method (raw 7-bit value)",t,0,127,i=>this.updateLayer({distribution:{...e.distribution,method:i}})):d}
        ${t!==0?o`
              <label class="field">
                <span>Direction</span>
                <select
                  .value=${e.distribution.backwards?"backwards":"forwards"}
                  ?disabled=${this.disabled}
                  @change=${i=>this.updateLayer({distribution:{...e.distribution,backwards:i.target.value==="backwards"}})}
                >
                  <option value="forwards">Forward</option>
                  <option value="backwards">Backward</option>
                </select>
              </label>
            `:d}
        ${this.rangeField("Colour speed",e.colour_speed,0,255,i=>this.updateLayer({colour_speed:i}))}
        ${this.rangeField("Colour retention",e.colour_retention,0,255,i=>this.updateLayer({colour_retention:i}))}
      </section>
    `}renderBrightness(e){if(e.brightness_patterns.length===0)return o`
        <section class="card wide-card empty-state" role="status">
          <h3 class="section-title">No brightness pattern records</h3>
          <p class="muted">
            This layer contains no brightness pattern records. It remains
            preserved until you add one.
          </p>
          <button
            class="add-button"
            type="button"
            ?disabled=${this.disabled}
            @click=${this.addBrightnessPattern}
          >
            Add brightness pattern
          </button>
        </section>
      `;const t=k(this.activePatternIndex,0,e.brightness_patterns.length-1),i=e.brightness_patterns[t],s=Hs(i.order);return o`
      <section class="card wide-card">
        <h3 class="section-title">Brightness</h3>
        <govee-segmented-control
          .label=${"Distribution"}
          .value=${e.brightness_gradient}
          .options=${[{value:!1,label:"Unified"},{value:!0,label:"Gradient"}]}
          .disabled=${this.disabled}
          @value-changed=${n=>this.updateLayer({brightness_gradient:n.detail.value})}
        ></govee-segmented-control>

        <div class="pattern-toolbar">
          <div
            class="pattern-tabs"
            role="tablist"
            aria-label="Brightness patterns"
          >
            ${e.brightness_patterns.map((n,a)=>o`
                <button
                  class=${a===t?"selected":""}
                  type="button"
                  role="tab"
                  aria-selected=${a===t}
                  tabindex=${a===t?"0":"-1"}
                  @click=${()=>{this.activePatternIndex=a}}
                  @keydown=${l=>this.patternTabKeyPressed(a,l)}
                >
                  Pattern ${a+1}
                </button>
              `)}
          </div>
          <button
            class="icon-action"
            type="button"
            aria-label="Add brightness pattern"
            ?disabled=${this.disabled||e.brightness_patterns.length>=3}
            @click=${this.addBrightnessPattern}
          >
            +
          </button>
          <button
            class="icon-action danger"
            type="button"
            aria-label="Delete brightness pattern"
            ?disabled=${this.disabled||e.brightness_patterns.length===1}
            @click=${this.deleteBrightnessPattern}
          >
            −
          </button>
        </div>

        <div class="brightness-fields">
          <label class="field">
            <span>Order</span>
            <select
              aria-label="Brightness order"
              .value=${String(i.order)}
              ?disabled=${this.disabled}
              @change=${n=>this.updateBrightnessPattern({order:Number(n.target.value)})}
            >
              ${Hi.map(n=>o`<option value=${n}>
                    ${nr[n]}
                  </option>`)}
              ${s?d:o`
                    <option value=${i.order} .selected=${!0}>
                      Raw order ${i.order} (0x${Ve(i.order)})
                    </option>
                  `}
            </select>
          </label>
          ${s?d:o`
                <p class="muted raw-value-note">
                  Brightness order ${i.order} is not defined by the
                  known schema. Its raw value remains preserved.
                </p>
                ${this.byteNumberField("Order (raw byte)",i.order,n=>this.updateBrightnessPattern({order:n}))}
              `}
          ${this.rangeField("Scope low",i.scope_low,0,255,n=>this.updateBrightnessPattern({scope_low:n}))}
          ${this.rangeField("Scope high",i.scope_high,0,255,n=>this.updateBrightnessPattern({scope_high:n}))}
          ${this.rangeField("Changing speed",i.change_speed,0,255,n=>this.updateBrightnessPattern({change_speed:n}))}
          ${this.rangeField("Brightest retention",i.brightest_retention,0,255,n=>this.updateBrightnessPattern({brightest_retention:n}))}
          ${this.rangeField("Darkest retention",i.darkest_retention,0,255,n=>this.updateBrightnessPattern({darkest_retention:n}))}
        </div>
      </section>
    `}renderMovement(e,t,i){const s=e[t];return o`
      <section class="card">
        <div class="card-heading">
          <h3 class="section-title">${i}</h3>
          <govee-switch-control
            .label=${`${i} enabled`}
            .checked=${s.enabled}
            .disabled=${this.disabled}
            @checked-changed=${n=>this.updateMovement(t,{enabled:n.detail.checked},`${i} ${n.detail.checked?"enabled":"disabled"}.`)}
          ></govee-switch-control>
        </div>
        ${s.enabled?o`
              ${this.byteNumberField("Distance",s.distance,n=>this.updateMovement(t,{distance:n},`${i} distance ${n}.`))}
              <label class="field">
                <span>Direction</span>
                <select
                  .value=${String(s.direction)}
                  ?disabled=${this.disabled}
                  @change=${n=>{const a=Number(n.target.value);this.updateMovement(t,{direction:a},`${i} direction ${vi[a]}.`)}}
                >
                  ${Object.entries(vi).map(([n,a])=>o`<option value=${n}>${a}</option>`)}
                </select>
              </label>
              ${this.rangeField("Speed",s.speed,0,255,n=>this.updateMovement(t,{speed:n},`${i} speed ${Vs(n)} per cent.`))}
              <govee-checkbox-control
                class="movement-enter-exit"
                label="Enter and exit"
                .checked=${s.enter_exit}
                .disabled=${this.disabled}
                @checked-changed=${n=>{const a=n.detail.checked;this.updateMovement(t,{enter_exit:a},`${i} enter and exit ${a?"enabled":"disabled"}.`)}}
              ></govee-checkbox-control>
            `:d}
      </section>
    `}renderPriority(e){const t=e.priority!==0;return o`
      <section class="card">
        <div class="card-heading">
          <h3 class="section-title">Priority</h3>
          <govee-switch-control
            label="Layer priority enabled"
            .checked=${t}
            .disabled=${this.disabled}
            @checked-changed=${i=>this.updateLayer({priority:i.detail.checked?1:0})}
          ></govee-switch-control>
        </div>
        ${t?o`
              <govee-segmented-control
                class="priority-control"
                label="Priority"
                .value=${e.priority}
                .options=${sr}
                .disabled=${this.disabled}
                .hideLabel=${!0}
                @value-changed=${i=>this.updateLayer({priority:i.detail.value})}
              ></govee-segmented-control>
              ${e.priority>5?this.byteNumberField("Priority (raw byte)",e.priority,i=>this.updateLayer({priority:i})):d}
            `:d}
      </section>
    `}renderRawValues(e){return o`
      <section class="card wide-card">
        <details>
          <summary>Preserved wire values</summary>
          <p class="muted">
            These fields are retained losslessly. Change them only when you
            know the source byte values.
          </p>
          <div class="raw-grid">
            ${this.hexByteField("Layer flags",e.unknown_flags,t=>this.updateLayer({unknown_flags:t}),253)}
            ${this.hexByteField("Selected movement flags",e.selected_movement.unknown_flags,t=>this.updateMovement("selected_movement",{unknown_flags:t}),232)}
            ${this.hexByteField("Whole-layer movement flags",e.overall_movement.unknown_flags,t=>this.updateMovement("overall_movement",{unknown_flags:t}),232)}
            ${this.numberField("Applied-area start (raw nibble)",e.area.start_tenths,0,15,t=>this.updateLayer({area:{...e.area,start_tenths:t}}))}
            ${this.numberField("Applied-area width (raw nibble)",e.area.width_tenths,0,15,t=>this.updateLayer({area:{...e.area,width_tenths:t}}))}
            <label class="field">
              <span>Excess bytes (hex)</span>
              <input
                type="text"
                inputmode="text"
                spellcheck="false"
                .value=${e.excess}
                ?disabled=${this.disabled}
                @change=${t=>this.excessChanged(t.target)}
              />
            </label>
          </div>
        </details>
      </section>
    `}rangeField(e,t,i,s,n){return o`
      <govee-slider-control
        .label=${e}
        .value=${t}
        .minimum=${i}
        .maximum=${s}
        .disabled=${this.disabled}
        @value-changed=${a=>n(a.detail.value)}
      ></govee-slider-control>
    `}byteNumberField(e,t,i){return this.numberField(e,t,0,255,i)}numberField(e,t,i,s,n){return o`
      <label class="field">
        <span>${e}</span>
        <input
          type="number"
          min=${i}
          max=${s}
          .value=${String(t)}
          ?disabled=${this.disabled}
          @change=${a=>n(k(Number(a.target.value),i,s))}
        />
      </label>
    `}hexByteField(e,t,i,s=255){return o`
      <label class="field">
        <span>${e}</span>
        <input
          type="text"
          inputmode="text"
          spellcheck="false"
          .value=${Ve(t)}
          ?disabled=${this.disabled}
          @change=${n=>{const a=n.target,l=Ks(a.value);if(l===void 0){a.setCustomValidity("Enter one byte from 00 to FF."),a.reportValidity();return}if((l&~s)!==0){a.setCustomValidity(`Known flag bits are controlled elsewhere. Allowed mask: ${Ve(s)}.`),a.reportValidity();return}a.setCustomValidity(""),i(l)}}
        />
      </label>
    `}updateLayer(e){if(!this.content||this.disabled)return;const t=this.content.layers.map((i,s)=>s===this.activeLayerIndex?V({...i,...e}):V(i));this.emitContent({kind:"advanced",layers:t})}updateSelection(e){this.updateLayer({selection:{...this.activeLayer.selection,...e}})}updateBrightnessPattern(e){const t=this.activeLayer.brightness_patterns.map((i,s)=>s===this.activePatternIndex?{...i,...e}:{...i});this.updateLayer({brightness_patterns:t})}updateMovement(e,t,i){this.updateLayer({[e]:{...this.activeLayer[e],...t}}),i&&(this.movementAnnouncement=i)}addLayer(){if(!this.content||this.disabled||this.content.layers.length>=me)return;const e=[...this.content.layers.map(V),Vi()];this.installContent({kind:"advanced",layers:e}),this.activeLayerIndex=e.length-1,this.activePatternIndex=0,this.layerActionsOpen=!1,this.focusActiveTab()}copyLayer(){if(!this.content||this.disabled||this.content.layers.length>=me)return;const e=this.content.layers.map(V);e.splice(this.activeLayerIndex+1,0,V(this.activeLayer)),this.installContent({kind:"advanced",layers:e}),this.activeLayerIndex+=1,this.activePatternIndex=0,this.layerActionsOpen=!1,this.focusActiveTab()}deleteLayer(){if(!this.content||this.disabled||this.content.layers.length===1)return;const e=this.content.layers.filter((t,i)=>i!==this.activeLayerIndex).map(V);this.activeLayerIndex=Math.min(this.activeLayerIndex,e.length-1),this.activePatternIndex=0,this.layerActionsOpen=!1,this.emitContent({kind:"advanced",layers:e}),this.focusActiveTab()}reorderLayer(e,t){if(!this.content||this.disabled||e<0||e>=this.content.layers.length||t<0||t>=this.content.layers.length||e===t)return;const i=this.content.layers.map(V),[s]=i.splice(e,1);i.splice(t,0,s),this.activeLayerIndex=Ct(this.activeLayerIndex,e,t),this.layerActionsOpen=!1,this.emitContent({kind:"advanced",layers:i})}addBrightnessPattern(){if(this.disabled||this.activeLayer.brightness_patterns.length>=3)return;const e=[...this.activeLayer.brightness_patterns.map(t=>({...t})),Ki()];this.activePatternIndex=e.length-1,this.updateLayer({brightness_patterns:e})}deleteBrightnessPattern(){if(this.disabled||this.activeLayer.brightness_patterns.length===1)return;const e=this.activeLayer.brightness_patterns.filter((t,i)=>i!==this.activePatternIndex).map(t=>({...t}));this.activePatternIndex=Math.min(this.activePatternIndex,e.length-1),this.updateLayer({brightness_patterns:e})}selectLayer(e){this.layerActionsOpen=!1,e!==this.activeLayerIndex&&(this.activeLayerIndex=e,this.activePatternIndex=0)}toggleLayerActions(){this.layerActionsOpen=!this.layerActionsOpen,this.layerActionsOpen&&this.updateComplete.then(()=>{this.shadowRoot?.querySelector(".layer-actions-popover button:not(:disabled)")?.focus()})}layerActionsKeyPressed(e){e.key==="Escape"&&(e.preventDefault(),this.layerActionsOpen=!1,this.updateComplete.then(()=>{this.shadowRoot?.querySelector(".layer-actions-button")?.focus()}))}layerActionsFocusOut(e){const t=e.currentTarget;this.layerActionsOpen&&!(e.relatedTarget instanceof Node&&t.contains(e.relatedTarget))&&(this.layerActionsOpen=!1)}patternTabKeyPressed(e,t){const i=this.activeLayer.brightness_patterns.length;let s;t.key==="ArrowLeft"?s=e===0?i-1:e-1:t.key==="ArrowRight"?s=e===i-1?0:e+1:t.key==="Home"?s=0:t.key==="End"&&(s=i-1),s!==void 0&&(t.preventDefault(),this.activePatternIndex=s,this.updateComplete.then(()=>{this.shadowRoot?.querySelectorAll(".pattern-tabs button")[s]?.focus()}))}focusActiveTab(){this.updateComplete.then(()=>{this.shadowRoot?.querySelector("govee-reorderable-strip")?.focusItem(this.activeLayerIndex)})}excessChanged(e){const t=e.value.replace(/\s+/g,"").toLowerCase();if(!/^(?:[0-9a-f]{2})*$/.test(t)){e.setCustomValidity("Enter an even number of hexadecimal digits."),e.reportValidity();return}e.setCustomValidity(""),this.updateLayer({excess:t})}emitContent(e){this.dispatchEvent(new CustomEvent("content-changed",{detail:{content:e},bubbles:!0,composed:!0}))}installContent(e){this.content=e,this.emitContent(e)}static{this.styles=[R,ue,zt,Y,jt,w`
    :host {
      display: block;
    }

    p {
      margin-top: 0;
    }

    .layer-card {
      margin-bottom: var(--studio-section-gap);
    }

    .layer-toolbar {
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }

    .layer-toolbar govee-reorderable-strip {
      min-width: 0;
      flex: 1;
    }

    .layer-actions-menu {
      position: relative;
      flex: 0 0 var(--studio-control-height);
    }

    .layer-actions-button {
      display: grid;
      width: var(--studio-control-height);
      height: var(--studio-control-height);
      padding: 0;
      place-items: center;
      border: 1px solid var(--studio-border);
      border-radius: 50%;
      color: var(--studio-muted);
      background: var(--studio-card);
      cursor: pointer;
      font-size: 22px;
    }

    .card-heading,
    .pattern-toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .pattern-tabs {
      display: flex;
      flex: 1;
      gap: 6px;
      min-width: 0;
      overflow-x: auto;
      padding-bottom: 2px;
      scrollbar-width: thin;
    }

    .pattern-tabs button {
      flex: 0 0 auto;
      padding: 8px 14px;
      border: 1px solid var(--studio-border);
      border-radius: 8px;
      color: var(--primary-text-color);
      background: var(--studio-card);
      cursor: pointer;
    }

    .pattern-tabs button.selected {
      color: var(--studio-blue);
      border-color: var(--studio-blue);
      background: var(--studio-blue-soft);
      font-weight: 650;
    }

    .add-button {
      flex: 0 0 auto;
      padding: 8px 14px;
      border: 1px solid var(--studio-border);
      border-radius: var(--studio-control-radius);
      color: var(--studio-blue);
      background: var(--studio-card);
      font-weight: 600;
      border-style: dashed;
      cursor: pointer;
    }

    .layer-actions-popover {
      position: absolute;
      z-index: 25;
      top: 52px;
      right: 0;
      display: grid;
      width: 220px;
      gap: 8px;
      padding: var(--studio-popover-padding);
      border: 1px solid var(--studio-border);
      border-radius: var(--studio-popover-radius);
      background: var(--studio-card);
      box-shadow: var(--studio-popover-shadow);
    }

    .layer-actions-popover .secondary {
      width: 100%;
    }

    @media (max-width: 600px) {
      .layer-actions-popover {
        position: fixed;
        top: 50%;
        right: var(--studio-mobile-gutter);
        left: var(--studio-mobile-gutter);
        width: auto;
        transform: translateY(-50%);
      }
    }

    .limit-note,
    .muted {
      color: var(--studio-muted);
      font-size: 13px;
      line-height: 1.45;
    }

    .limit-note {
      margin: 12px 0 0;
    }

    .empty-state .add-button {
      margin-top: 12px;
    }

    .control-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
    }

    .wide-card {
      grid-column: 1 / -1;
    }

    .area-control {
      margin-bottom: 16px;
      padding: 4px 22px 0;
    }

    .area-range {
      position: relative;
      min-height: 64px;
      touch-action: pan-y;
    }

    .area-segments {
      display: grid;
      grid-template-columns: repeat(
        var(--area-segment-count),
        minmax(0, 1fr)
      );
      gap: 4px;
      min-height: 64px;
      pointer-events: none;
    }

    .area-segments span {
      min-width: 0;
      min-height: 64px;
      border: 1px solid
        color-mix(in srgb, var(--area-colour) 35%, var(--studio-border));
      border-radius: 6px;
      background: color-mix(
        in srgb,
        var(--area-colour) 14%,
        var(--studio-card)
      );
    }

    .area-segments span.covered {
      border-color: color-mix(
        in srgb,
        var(--area-colour) 70%,
        #000
      );
      background: var(--area-colour);
    }

    .area-window {
      position: absolute;
      z-index: 2;
      top: 0;
      bottom: 0;
      min-width: 1px;
      border-block: 3px solid
        color-mix(in srgb, var(--area-colour) 78%, #000);
      background: color-mix(in srgb, var(--area-colour) 12%, transparent);
    }

    .area-move {
      position: absolute;
      inset: 0;
      z-index: 1;
      min-width: 44px;
      cursor: grab;
    }

    .area-move::after {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 16px;
      height: 10px;
      border-radius: 5px;
      background-image: radial-gradient(
        circle,
        color-mix(in srgb, var(--area-colour) 52%, #000) 1.5px,
        transparent 1.8px
      );
      background-position: 0 0;
      background-size: 6px 6px;
      content: "";
      opacity: 0.72;
      transform: translate(-50%, -50%);
    }

    .area-move:active {
      cursor: grabbing;
    }

    .area-handle {
      position: absolute;
      z-index: 3;
      top: 50%;
      width: 44px;
      min-height: 56px;
      border: 0;
      background: transparent;
      cursor: ew-resize;
      transform: translateY(-50%);
    }

    .area-handle::before {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 8px;
      height: 24px;
      border-inline: 2px solid
        color-mix(in srgb, var(--area-colour) 72%, #000);
      content: "";
      transform: translate(-50%, -50%);
    }

    .area-handle::after {
      position: absolute;
      z-index: -1;
      top: 50%;
      left: 50%;
      width: 22px;
      height: 44px;
      border: 2px solid
        color-mix(in srgb, var(--area-colour) 78%, #000);
      border-radius: 10px;
      background: var(--studio-card);
      box-shadow: 0 2px 8px rgb(0 0 0 / 18%);
      content: "";
      transform: translate(-50%, -50%);
    }

    .area-handle-left {
      left: 0;
      transform: translate(-50%, -50%);
    }

    .area-handle-right {
      right: 0;
      transform: translate(50%, -50%);
    }

    .area-move:focus-visible,
    .area-handle:focus-visible {
      outline: var(--studio-focus-width) solid var(--studio-blue);
      outline-offset: var(--studio-focus-offset);
    }

    .area-move[aria-disabled="true"],
    .area-handle[aria-disabled="true"] {
      cursor: default;
      opacity: var(--studio-disabled-opacity);
    }

    .area-drag-value {
      position: absolute;
      z-index: 5;
      bottom: calc(100% + 7px);
      left: 50%;
      min-width: 28px;
      padding: 4px 7px;
      border: 1px solid var(--studio-border);
      border-radius: 8px;
      color: var(--primary-text-color);
      background: var(--studio-card);
      box-shadow: var(--studio-popover-shadow);
      font-size: 12px;
      font-weight: 650;
      font-variant-numeric: tabular-nums;
      line-height: 1;
      text-align: center;
      transform: translateX(-50%);
    }

    .area-help {
      margin: 12px 0 0;
      color: var(--studio-muted);
      font-size: 13px;
      text-align: center;
    }

    .selection-controls {
      margin-top: 8px;
      padding-top: 18px;
      border-top: 1px solid var(--studio-border);
    }

    .selection-controls > .parameter-label {
      display: block;
      margin-bottom: 4px;
    }

    .pattern-toolbar {
      align-items: stretch;
      margin-top: 16px;
    }

    .icon-action {
      flex: 0 0 44px;
      width: 44px;
      padding: 0;
      border: 1px solid var(--studio-border);
      border-radius: 8px;
      color: var(--studio-blue);
      background: var(--studio-card);
      cursor: pointer;
      font-size: 22px;
    }

    .brightness-fields {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0 18px;
    }

    .brightness-fields .field:first-child {
      grid-column: 1 / -1;
    }

    .brightness-fields .raw-value-note {
      grid-column: 1 / -1;
      margin: 14px 0 0;
    }

    .card-heading {
      justify-content: space-between;
    }

    .card-heading h3 {
      margin-bottom: 0;
    }

    .movement-enter-exit {
      margin-top: 12px;
    }

    .priority-control {
      margin-top: 16px;
    }

    details summary {
      min-height: 44px;
      color: var(--primary-text-color);
      cursor: pointer;
      font-weight: 650;
    }

    .raw-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0 18px;
    }

    @media (max-width: 760px) {
      .control-grid,
      .brightness-fields,
      .raw-grid {
        grid-template-columns: 1fr;
      }

      .wide-card,
      .brightness-fields .field:first-child {
        grid-column: auto;
      }

      .add-button {
        width: 100%;
      }

      .area-control {
        padding-inline: 18px;
      }

    }

    @media (max-width: 480px) {
      .card {
        padding: 16px;
      }

      .secondary {
        min-width: 0;
      }
    }

  `]}}se([h({attribute:!1})],X.prototype,"content");se([h({type:Boolean})],X.prototype,"disabled");se([h({type:Number})],X.prototype,"segmentCount");se([m()],X.prototype,"activeLayerIndex");se([m()],X.prototype,"activePatternIndex");se([m()],X.prototype,"movementAnnouncement");se([m()],X.prototype,"layerActionsOpen");se([m()],X.prototype,"appliedAreaActiveControl");customElements.get("govee-advanced-effect-editor")||customElements.define("govee-advanced-effect-editor",X);const ar=2,Xi=1,or=3,yi=16,lr=4096,U=1024,gt=16384,Wt=Number.MAX_SAFE_INTEGER;function g(r,e,t){const i=Fe(r,e);return(i.length===0||i.length>t)&&v(`${e} must contain 1 to ${t} characters`),i}function dr(r,e,t){const i=Fe(r,e);return i.length>t&&v(`${e} must not exceed ${t} characters`),i}function Ge(r,e){const t=Fe(r,e);return(t.length%2!==0||!/^[0-9a-f]*$/i.test(t))&&v(`${e} must be hexadecimal`),t}function Fe(r,e){return typeof r!="string"&&v(`${e} must be a string`),r}function q(r,e){return typeof r!="boolean"&&v(`${e} must be a boolean`),r}function u(r,e,t,i=Wt){return(typeof r!="number"||!Number.isSafeInteger(r)||r<t||r>i)&&v(`${e} must be an integer from ${t} to ${i}`),r}function G(r,e,t){const i=u(r,t,1);return i!==e&&v(`${t} is incompatible with this editor`),i}function It(r,e,t,i){return r===null?null:u(r,e,t,i)}function L(r,e){return u(r,e,0,255)}function D(r,e,t){const i=Fe(r,t);return e.includes(i)||v(`${t} is invalid`),i}function f(r,e){return(typeof r!="object"||r===null||Array.isArray(r))&&v(`${e} must be an object`),r}function E(r,e,t){return Array.isArray(r)||v(`${e} must be an array`),r.length>t&&v(`${e} must not exceed ${t} items`),r}function H(r,e,t){const i=r.map(e);new Set(i).size!==i.length&&v(`${t} must be unique`)}function he(r,e,t,i=lr){let s=0;const n=(l,c,p)=>{if(s+=1,s>i&&v(`${e} must not exceed ${i} JSON values`),p>yi&&v(`${e} must not exceed ${yi} nested levels`),!(l===null||typeof l=="boolean")){if(typeof l=="number"){(!Number.isFinite(l)||Number.isInteger(l)&&!Number.isSafeInteger(l))&&v(`${c} must be a finite JSON number`);return}if(typeof l=="string"){l.length>gt&&v(`${c} must not exceed ${gt} characters`);return}if(Array.isArray(l)){l.length>U&&v(`${c} must not exceed ${U} items`),l.forEach((b,_)=>n(b,`${c}[${_}]`,p+1));return}if(typeof l=="object"&&l!==null){const b=Object.entries(l);b.length>U&&v(`${c} must not exceed ${U} fields`),b.forEach(([_,F])=>{_.length>gt&&v(`${c} contains an oversized key`),n(F,`${c}.${_}`,p+1)});return}v(`${c} contains a non-JSON value`)}};n(r,e,0);const a=JSON.stringify(r);a===void 0&&v(`${e} must contain JSON values`),new TextEncoder().encode(a).byteLength>t&&v(`${e} must not exceed ${t} bytes`)}function v(r){throw new Error(`Malformed Effect Studio server payload: ${r}.`)}const cr=["compiling","pending","uploading","activating","verifying","confirmed","applied","uncertain","recovering","failed","interrupted","unknown"],bt=["compiling","pending","uploading","activating","verifying","recovering"],_i=5,N=128,Ee=65536,Ji=512,Zi=256,Qi=32,es=128,ts=512,$=255,ur=64,is=262144,ss=16384,Pt=4335,pr=232,hr=253,de=["H617A","H6199"],vt="H617A",rs=["movie","game"],$i=["native_scenes","edited_palette_scenes","layered_scenes","painted","single","multi","native_music","video","palette_diy","advanced","workshop","special_diy"],mr=["studio","home_assistant","planned"],fr=["exact_session","activation_match","settings_match","mode_match","write_completed","unknown"],gr={H617A:["native_scenes","edited_palette_scenes","layered_scenes","painted","single","multi","native_music","advanced","workshop","special_diy"],H6199:["native_scenes","edited_palette_scenes","layered_scenes","palette_diy","native_music","video","advanced","workshop","special_diy"]};function br(r){const e=f(r,"editor info"),t=f(e.limits,"editor limits");return{api_version:u(e.api_version,"API version",1),effect_schema_version:u(e.effect_schema_version,"effect schema version",1),compiler_version:u(e.compiler_version,"compiler version",1),limits:{effect_name:G(t.effect_name,N,"effect-name limit"),effect_document_bytes:G(t.effect_document_bytes,Ee,"effect-document limit"),devices:G(t.devices,Ji,"device limit"),library_items:G(t.library_items,Zi,"library-item limit"),drafts_per_owner:G(t.drafts_per_owner,Qi,"draft limit"),deployment_records:G(t.deployment_records,es,"deployment limit"),scene_catalogue_entries:G(t.scene_catalogue_entries,ts,"scene catalogue limit")}}}function vr(r){const e=E(r,"devices",Ji).map((t,i)=>{const s=f(t,`devices[${i}]`),n=f(s.custom_effects,`devices[${i}].custom_effects`),a=f(s.profiles,`devices[${i}].profiles`);return{config_entry_id:g(s.config_entry_id,`devices[${i}].config_entry_id`,$),model:g(s.model,`devices[${i}].model`,$),display_name:g(s.display_name,`devices[${i}].display_name`,$),segment_count:u(s.segment_count,`devices[${i}].segment_count`,0,65535),custom_effects:{painted:A(n.painted,"painted capability"),single:A(n.single,"single capability"),multi:A(n.multi,"multi capability"),palette_diy:A(n.palette_diy,"palette DIY capability"),advanced:A(n.advanced,"advanced capability"),workshop:A(n.workshop,"Workshop capability"),special_diy:A(n.special_diy,"Special DIY capability")},profiles:{music:A(a.music,"music profile capability"),video:A(a.video,"video profile capability")},readback:g(s.readback,`devices[${i}].readback`,$)}});return H(e,t=>t.config_entry_id,"device IDs"),e}function yr(r){he(r,"custom-effect catalogue",is,ss);const e=f(r,"custom-effect catalogue"),t=_r(e.models),i=Dt(e,"custom-effect catalogue",vt);if(JSON.stringify(i)!==JSON.stringify(t[vt]))throw new Error("Malformed Effect Studio server payload: legacy custom-effect catalogue view does not match models.H617A.");return G(e.schema_version,_i,"catalogue schema"),{...i,schema_version:_i,sku:vt,models:t}}function _r(r){const e=f(r,"custom-effect catalogue models"),i=Object.keys(e).filter(s=>!de.includes(s));if(i.length>0)throw new Error(`Malformed Effect Studio server payload: unexpected catalogue models ${i.join(", ")}.`);for(const s of de)if(!(s in e))throw new Error(`Malformed Effect Studio server payload: missing catalogue model ${s}.`);return{H617A:Dt(e.H617A,"catalogue model H617A","H617A"),H6199:Dt(e.H6199,"catalogue model H6199","H6199")}}function Dt(r,e,t){const i=f(r,e),s=f(i.limits,`${e} limits`),n=f(i.supports,`${e} support capabilities`),a=f(i.apply,`${e} Apply capabilities`),l=D(i.sku,de,`${e} SKU`);if(l!==t)throw new Error(`Malformed Effect Studio server payload: ${e} is keyed as ${t} but declares ${l}.`);const c=u(s.music_sensitivity_min,`${e} minimum music sensitivity`,0,100),p=u(s.music_sensitivity_max,`${e} maximum music sensitivity`,0,100);return c>p&&v(`${e} music sensitivity limits are inverted`),{sku:l,painted_effects:xr(i.painted_effects,`${e} painted-effect templates`),effects:kr(i.effects,`${e} custom-effect templates`),music_modes:xi(i.music_modes,`${e} music modes`),video_modes:xi(i.video_modes,`${e} video modes`,rs),workshop_templates:wr(i.workshop_templates,`${e} Workshop templates`,t),special_diy_templates:Sr(i.special_diy_templates,`${e} Special DIY templates`,t),workflows:$r(i.workflows,`${e} release workflows`,t),supports:{multi:A(n.multi,`${e} Multi support`),advanced:A(n.advanced,`${e} advanced support`),workshop:A(n.workshop,`${e} Workshop support`),special_diy:A(n.special_diy,`${e} Special DIY support`)},limits:{palette_min:u(s.palette_min,`${e} minimum palette`,1,255),palette_max:u(s.palette_max,`${e} maximum palette`,1,255),multi_max:u(s.multi_max,`${e} maximum Multi effects`,1,255),music_sensitivity_min:c,music_sensitivity_max:p},apply:{painted:A(a.painted,`${e} Painted Apply capability`),single:A(a.single,`${e} Single Apply capability`),multi:A(a.multi,`${e} Multi Apply capability`),palette_diy:A(a.palette_diy,`${e} palette DIY Apply capability`),workshop:A(a.workshop,`${e} Workshop Apply capability`),special_diy:A(a.special_diy,`${e} Special DIY Apply capability`)}}}function $r(r,e,t){const i=E(r,e,$i.length).map((c,p)=>{const b=f(c,`${e}[${p}]`);return{id:D(b.id,$i,`${e}[${p}] ID`),label:g(b.label,`${e}[${p}] label`,N),content_kind:g(b.content_kind,`${e}[${p}] content kind`,$),application:D(b.application,mr,`${e}[${p}] application`)}});H(i,c=>c.id,`${e} IDs`);const s=gr[t],n=new Set(i.map(c=>c.id)),a=s.filter(c=>!n.has(c)),l=i.map(c=>c.id).filter(c=>!s.includes(c));if(a.length>0||l.length>0)throw new Error(`Malformed Effect Studio server payload: ${e} does not match ${t}.`);return i}function xr(r,e){const t=E(r,e,U).map((i,s)=>{const n=f(i,`${e}[${s}]`);return{id:D(n.id,["cycle","clockwise","counter_clockwise","twinkle","gradient","breathe"],`${e} ID`),label:g(n.label,`${e} label`,N)}});return H(t,i=>i.id,`${e} IDs`),t}function kr(r,e){const t=E(r,e,U).map((i,s)=>{const n=f(i,`${e}[${s}]`),a=E(n.variations,`${e}[${s}].variations`,U);if(a.length===0)throw new Error("Malformed Effect Studio server payload: custom-effect template has no variations.");const l={id:g(n.id,`${e}[${s}] ID`,$),label:g(n.label,`${e}[${s}] label`,N),family:u(n.family,`${e}[${s}] family`,0,255),variations:a.map((c,p)=>{const b=f(c,`${e}[${s}].variations[${p}]`);return{id:g(b.id,`${e}[${s}].variations[${p}] ID`,$),label:g(b.label,`${e}[${s}].variations[${p}] label`,N),variant:u(b.variant,`${e}[${s}].variations[${p}] variant`,0,255)}}),supports_multi:q(n.supports_multi,`${e}[${s}] Multi support`),rate:D(n.rate,["speed","sensitivity"],`${e}[${s}] rate parameter`),category:D(n.category,["single_layer"],`${e}[${s}] category`)};return H(l.variations,c=>c.id,`${e}[${s}] variation IDs`),l});return H(t,i=>i.id,`${e} IDs`),t}function xi(r,e,t){const i=E(r,e,U).map((s,n)=>{const a=f(s,`${e}[${n}]`);return{id:t?D(a.id,t,`${e}[${n}] ID`):g(a.id,`${e}[${n}] ID`,$),label:g(a.label,`${e}[${n}] label`,N)}});return H(i,s=>s.id,`${e} IDs`),i}function wr(r,e,t){const i=E(r,e,U).map((s,n)=>{const a=f(s,`${e}[${n}]`),l=lt(a.content);return(l.kind!=="workshop"||l.model!==t)&&v(`${e}[${n}] content does not target ${t}`),{id:g(a.id,`${e}[${n}] ID`,$),label:g(a.label,`${e}[${n}] label`,N),source_fixture:g(a.source_fixture,`${e}[${n}] source fixture`,$),content:l}});return H(i,s=>s.id,`${e} IDs`),i}function Sr(r,e,t){const i=E(r,e,U).map((s,n)=>{const a=f(s,`${e}[${n}]`),l=lt(a.content);return(l.kind!=="special_diy"||l.model!==t)&&v(`${e}[${n}] content does not target ${t}`),{id:g(a.id,`${e}[${n}] ID`,$),label:g(a.label,`${e}[${n}] label`,N),source_fixture:g(a.source_fixture,`${e}[${n}] source fixture`,$),content:l}});return H(i,s=>s.id,`${e} IDs`),i}function ki(r){const e=f(r,"library snapshot"),t={library_revision:te(e.library_revision,"library revision",0),items:E(e.items,"library items",Zi).map((i,s)=>{const n=f(i,`library items[${s}]`),a=n.template===void 0?void 0:it(n.template,`library items[${s}].template`),l=n.model===void 0?void 0:Nr(n.model);return{id:g(n.id,"library item ID",$),revision:te(n.revision,"library item revision",1),name:g(n.name,"library item name",N),kind:g(n.kind,"library item kind",$),...l?{model:l}:{},...a?{template:a}:{}}})};return H(t.items,i=>i.id,"library item IDs"),t}function Ye(r){he(r,"library item",Ee);const e=f(r,"library item"),t=e.target_hint===void 0?void 0:f(e.target_hint,"target hint");return{schema_version:G(e.schema_version,Xi,"effect schema version"),id:g(e.id,"effect ID",$),revision:te(e.revision,"effect revision",1),name:g(e.name,"effect name",N),content:lt(e.content),provenance:Lt(e.provenance,"effect provenance"),extensions:Lt(e.extensions,"effect extensions"),...t?{target_hint:{model:t.model===null?null:g(t.model,"target model",$),segment_count:t.segment_count===null?null:u(t.segment_count,"target segment count",1,65535)}}:{}}}function Er(r){const e=E(r,"draft summaries",Qi).map((t,i)=>{const s=f(t,`draft summaries[${i}]`);return{id:g(s.id,"draft ID",$),revision:te(s.revision,"draft revision",1),name:g(s.name,"draft name",N),updated_at:Jt(s.updated_at,"draft timestamp"),selected_config_entry_id:$e(s.selected_config_entry_id,"draft config entry ID")}});return H(e,t=>t.id,"draft IDs"),e}function yt(r){const e=f(r,"effect draft");return{id:g(e.id,"draft ID",$),owner_id:g(e.owner_id,"draft owner",$),revision:te(e.revision,"draft revision",1),item:Ye(e.item),updated_at:Jt(e.updated_at,"draft timestamp"),selected_config_entry_id:$e(e.selected_config_entry_id,"draft config entry ID"),base_item_id:$e(e.base_item_id,"draft base item ID"),base_item_revision:e.base_item_revision===null?null:te(e.base_item_revision,"draft base item revision",1)}}function Tt(r){const e=f(r,"deployment"),t=D(e.phase,cr,"deployment phase"),i={operation_id:g(e.operation_id,"deployment operation ID",$),config_entry_id:g(e.config_entry_id,"deployment config entry ID",$),diy_code:e.diy_code===null?null:u(e.diy_code,"deployment DIY code",0,65535),content_kind:g(e.content_kind,"deployment content kind",$),target_mode:D(e.target_mode,["custom","scene","music","video"],"deployment target mode"),target_effect:$e(e.target_effect,"deployment target effect"),phase:t,updated_at:Jt(e.updated_at,"deployment timestamp"),item_id:$e(e.item_id,"deployment item ID"),item_revision:e.item_revision===null?null:te(e.item_revision,"deployment item revision",1),error_code:$e(e.error_code,"deployment error code"),progress_current:u(e.progress_current,"deployment progress",0,1024),progress_total:u(e.progress_total,"deployment progress total",0,1024),verification_confidence:D(e.verification_confidence,fr,"deployment verification confidence")};return i.progress_current>i.progress_total&&v("deployment progress exceeds its total"),i}function Cr(r){const e=f(r,"deployment snapshot"),t={revision:te(e.revision,"deployment revision",0),deployments:E(e.deployments,"deployments",es).map(Tt)};return H(t.deployments,i=>i.operation_id,"deployment operation IDs"),t}function Ar(r){he(r,"scene catalogue",is,ss);const e=f(r,"scene catalogue");return{schema_version:u(e.schema_version,"scene catalogue schema",1),sku:g(e.sku,"scene catalogue SKU",$),enabled:q(e.enabled,"scene catalogue enabled"),categories:E(e.categories,"scene categories",U).map((t,i)=>{const s=f(t,`scene categories[${i}]`);return{id:u(s.id,"scene category ID",0,65535),name:g(s.name,"scene category name",N)}}),scenes:E(e.scenes,"scenes",ts).map(Xt)}}function Ir(r){const e=f(r,"scene detail");he({scene:e.scene,content:e.content},"scene detail",Ee);const t=lt(e.content);return t.kind!=="scene_builtin"&&t.kind!=="scene_palette"&&t.kind!=="scene_layered"&&v("scene detail content is unsupported"),{scene:Xt(e.scene),content:t}}function lt(r){he(r,"effect content",Ee);const e=f(r,"effect content"),t=g(e.kind,"effect content kind",$);switch(t){case"h617a_painted":return{kind:t,effect:D(e.effect,["cycle","clockwise","counter_clockwise","twinkle","gradient","breathe"],"painted effect"),speed:u(e.speed,"painted speed",0,100),brightness:u(e.brightness,"painted brightness",0,100),background:we(e.background,"painted background"),groups:E(e.groups,"paint groups",15).map((i,s)=>{const n=f(i,`paint groups[${s}]`);return{fill:we(n.fill,"paint-group fill"),segments:E(n.segments,"painted segments",15).map(a=>u(a,"painted segment",0,14))}})};case"h617a_single":return{kind:t,family:u(e.family,"Single family",0,254),variant:u(e.variant,"Single variant",0,255),speed:u(e.speed,"Single speed",0,100),palette:ye(e.palette,"Single palette",8)};case"h617a_multi":return{kind:t,effects:E(e.effects,"Multi effects",4).map((i,s)=>{const n=f(i,`Multi effects[${s}]`);return{family:u(n.family,"Multi family",0,254),variant:u(n.variant,"Multi variant",0,255)}}),speed:u(e.speed,"Multi speed",0,100),palette:ye(e.palette,"Multi palette",8)};case"palette_diy":return{kind:t,model:D(e.model,de,"palette DIY model"),family:u(e.family,"palette DIY family",0,255),variant:u(e.variant,"palette DIY variant",0,255),speed:u(e.speed,"palette DIY speed",0,100),palette:ye(e.palette,"palette DIY palette",8)};case"music_profile":return{kind:t,model:D(e.model,de,"music profile model"),mode:g(e.mode,"music profile mode",$),sensitivity:u(e.sensitivity,"music profile sensitivity",0,100),colour:Tr(e.colour,"music profile colour"),calm:Lr(e.calm,"music profile calm"),parameters:Lt(e.parameters,"music profile parameters")};case"video_profile":return{kind:t,model:D(e.model,["H6199"],"video profile model"),mode:D(e.mode,rs,"video profile mode"),full_screen:q(e.full_screen,"video profile full-screen flag"),saturation:u(e.saturation,"video profile saturation",0,100),sound_effects:q(e.sound_effects,"video profile sound-effects flag"),sound_effects_softness:u(e.sound_effects_softness,"video profile sound-effects softness",1,100),white_balance_position:u(e.white_balance_position,"video profile white-balance position",1,20),relative_brightness:Mr(e.relative_brightness,"video profile relative brightness"),blank_screen:q(e.blank_screen,"video profile blank-screen flag")};case"advanced":return{kind:t,layers:_t(e.layers,"Advanced layers")};case"workshop":{const i=f(e.effect,"Workshop effect");return{kind:t,model:D(e.model,de,"Workshop model"),template:g(e.template,"Workshop template",$),effect:{layers:_t(i.layers,"Workshop layers")},raw_param:Ge(e.raw_param,"Workshop source parameter"),trailing_padding:u(e.trailing_padding,"Workshop trailing padding",0,Pt)}}case"special_diy":return{kind:t,model:D(e.model,["H6199"],"Special DIY model"),template:g(e.template,"Special DIY template",$),family:u(e.family,"Special DIY family",0,255),variant:u(e.variant,"Special DIY variant",0,255),speed:u(e.speed,"Special DIY speed",0,100),palette:ye(e.palette,"Special DIY palette",8),raw_payload:Ge(e.raw_payload,"Special DIY source payload"),trailing_padding:u(e.trailing_padding,"Special DIY trailing padding",0,Pt)};case"scene_builtin":return{kind:t,template:it(e.template,"scene template"),speed_index:It(e.speed_index,"scene speed index",0,255)};case"scene_palette":return Pr(e);case"scene_layered":{const i=f(e.effect,"layered scene effect"),s=ns(e.trailing_padding,"layered scene trailing padding");return{kind:t,template:it(e.template,"layered scene template"),effect:{layers:_t(i.layers,"layered scene layers")},speed_index:It(e.speed_index,"layered scene speed index",0,255),raw_param:Ge(e.raw_param,"layered scene raw parameter"),...s===void 0?{}:{trailing_padding:s}}}default:{const{kind:i,...s}=e;return{kind:"opaque",source_kind:t,body:s}}}}function ns(r,e){if(r!==void 0)return u(r,e,0,Pt)}function Pr(r){const t=u(r.layout,"palette scene layout",0,1)===0?0:1,i=E(r.steps,"palette scene steps",255).map((l,c)=>{const p=f(l,`palette scene steps[${c}]`),b=t===0?(p.inline_colour!==null&&v(`palette scene steps[${c}].inline_colour must be null for layout 0`),null):we(p.inline_colour,`palette scene steps[${c}].inline_colour`);return{value:u(p.value,`palette scene steps[${c}].value`,0,65535),colour:we(p.colour,`palette scene steps[${c}].colour`),inline_colour:b}}),s=ye(r.palette,"palette scene shared palette",255,!0);t===1&&s.length!==0&&v("palette scene layout 1 must not have a shared palette");let n;r.config_flags!==void 0&&(n=u(r.config_flags,"palette scene config flags",0,255),n&-9&&v("palette scene config flags must only set reserved config bits"));const a=ns(r.trailing_padding,"palette scene trailing padding");return{kind:"scene_palette",template:it(r.template,"palette scene template"),layout:t,brightness_flag:q(r.brightness_flag,"palette scene brightness flag"),steps:i,palette:s,speed_index:It(r.speed_index,"palette scene speed index",0,255),...n===void 0?{}:{config_flags:n},...a===void 0?{}:{trailing_padding:a}}}function Ae(r){return r.kind!=="opaque"?r:(he(r.body,"opaque content",Ee),{...r.body,kind:g(r.source_kind,"opaque source kind",$)})}function Xt(r){const e=f(r,"scene"),t=Fe(e.parameter_kind,"scene parameter kind");t!=="none"&&t!=="palette"&&t!=="layers"&&t!=="opaque"&&v("scene parameter kind is invalid");const i=e.speed===null?null:(()=>{const s=f(e.speed,"scene speed");return{option_count:u(s.option_count,"scene speed option count",1,256),default_index:u(s.default_index,"scene default speed",0,255)}})();return{scene_id:u(e.scene_id,"scene ID",0,65535),effect_id:u(e.effect_id,"scene effect ID",0,65535),category_id:u(e.category_id,"scene category ID",0,65535),category:g(e.category,"scene category",N),name:g(e.name,"scene name",N),variant:dr(e.variant,"scene variant",$),display_name:g(e.display_name,"scene display name",N),scene_type:u(e.scene_type,"scene type",0,255),parameter_kind:t,speed:i}}function _t(r,e){return E(r,e,255).map((t,i)=>Dr(t,`${e}[${i}]`))}function Dr(r,e){const t=f(r,e),i=f(t.area,`${e}.area`),s=f(t.selection,`${e}.selection`),n=f(t.distribution,`${e}.distribution`);return{area:{start_tenths:u(i.start_tenths,`${e}.area.start_tenths`,0,15),width_tenths:u(i.width_tenths,`${e}.area.width_tenths`,0,15)},selection:{type:L(s.type,`${e}.selection.type`),param_1:L(s.param_1,`${e}.selection.param_1`),param_2:L(s.param_2,`${e}.selection.param_2`)},brightness_gradient:q(t.brightness_gradient,`${e}.brightness_gradient`),brightness_patterns:E(t.brightness_patterns,`${e}.brightness_patterns`,255).map((a,l)=>{const c=f(a,`${e}.brightness_patterns[${l}]`);return{scope_high:L(c.scope_high,"brightness scope high"),scope_low:L(c.scope_low,"brightness scope low"),order:L(c.order,"brightness order"),change_speed:L(c.change_speed,"brightness change speed"),brightest_retention:L(c.brightest_retention,"brightest retention"),darkest_retention:L(c.darkest_retention,"darkest retention")}}),distribution:{method:u(n.method,`${e}.distribution.method`,0,127),backwards:q(n.backwards,`${e}.distribution.backwards`)},colour_speed:L(t.colour_speed,`${e}.colour_speed`),colour_retention:L(t.colour_retention,`${e}.colour_retention`),palette:ye(t.palette,`${e}.palette`,255,!0),selected_movement:wi(t.selected_movement,`${e}.selected_movement`),overall_movement:wi(t.overall_movement,`${e}.overall_movement`),priority:L(t.priority,`${e}.priority`),unknown_flags:as(t.unknown_flags,hr,`${e}.unknown_flags`),excess:Ge(t.excess,`${e}.excess`)}}function wi(r,e){const t=f(r,e);return{enabled:q(t.enabled,`${e}.enabled`),enter_exit:q(t.enter_exit,`${e}.enter_exit`),direction:u(t.direction,`${e}.direction`,0,3),distance:L(t.distance,`${e}.distance`),speed:L(t.speed,`${e}.speed`),unknown_flags:as(t.unknown_flags,pr,`${e}.unknown_flags`)}}function it(r,e){const t=f(r,e);return{sku:g(t.sku,`${e}.sku`,$),scene_id:u(t.scene_id,`${e}.scene_id`,0,65535),effect_id:u(t.effect_id,`${e}.effect_id`,0,65535),catalogue_schema_version:u(t.catalogue_schema_version,`${e}.catalogue_schema_version`,1,Wt)}}function ye(r,e,t,i=!1){const s=E(r,e,t);return!i&&s.length===0&&v(`${e} must not be empty`),s.map((n,a)=>we(n,`${e}[${a}]`))}function we(r,e){const t=E(r,e,3);return t.length!==3&&v(`${e} must contain three channels`),t.map(i=>u(i,`${e} channel`,0,255))}function Tr(r,e){return r===null?null:we(r,e)}function Lr(r,e){return r===null?null:q(r,e)}function Mr(r,e){const t=f(r,e);return{left:u(t.left,`${e}.left`,1,100),top:u(t.top,`${e}.top`,1,100),right:u(t.right,`${e}.right`,1,100),bottom:u(t.bottom,`${e}.bottom`,1,100)}}function A(r,e){return r!=="supported"&&r!=="unsupported"&&r!=="evidence_gap"&&v(`${e} is invalid`),r}function Lt(r,e){return he(r,e,Ee),f(r,e)}function $e(r,e){return r===null?null:g(r,e,$)}function Jt(r,e){const t=g(r,e,ur);return(!/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(t)||Number.isNaN(Date.parse(t)))&&v(`${e} must be an ISO 8601 timestamp with a UTC offset`),t}function Nr(r){return typeof r=="string"&&de.includes(r)?r:void 0}function te(r,e,t){return u(r,e,t,Wt)}function as(r,e,t){const i=L(r,t);return i&~e&&v(`${t} must only set reserved bits, not bits explicit fields carry`),i}function Rr(r){return r.api_version===ar&&r.effect_schema_version===Xi&&r.compiler_version===or}const $t="ha_govee_led_ble/editor";class Or{constructor(e){this.hass=e}async info(){return br(await this.call("info"))}async devices(){const e=await this.call("devices");return vr(T(e,"devices"))}async customCatalogue(){const e=await this.call("custom/catalogue");return yr(T(e,"catalogue"))}async library(){return ki(await this.call("library/list"))}async item(e){const t=await this.call("library/get",{item_id:e});return Ye(T(t,"item"))}async createItem(e,t,i){const s=await this.call("library/create",{name:e,content:Ae(t),expected_library_revision:i});return{item:Ye(T(s,"item")),library_revision:xt(s)}}async updateItem(e,t,i,s){const n=await this.call("library/update",{item_id:e.id,name:t,content:Ae(i),expected_revision:e.revision,expected_library_revision:s});return{item:Ye(T(n,"item")),library_revision:xt(n)}}async deleteItem(e,t){const i=await this.call("library/delete",{item_id:e.id,expected_revision:e.revision,expected_library_revision:t});return xt(i)}async drafts(){const e=await this.call("draft/list");return Er(T(e,"drafts"))}async draft(e){const t=await this.call("draft/get",{draft_id:e});return yt(T(t,"draft"))}async createDraft(e,t,i,s){const n=await this.call("draft/create",{name:e,content:Ae(t),updated_at:new Date().toISOString(),selected_config_entry_id:i,...s?{base_item_id:s.id,base_item_revision:s.revision}:{}});return yt(T(n,"draft"))}async updateDraft(e,t,i,s){const n=await this.call("draft/update",{draft_id:e.id,expected_revision:e.revision,name:t,content:Ae(i),updated_at:new Date().toISOString(),selected_config_entry_id:s});return yt(T(n,"draft"))}async deleteDraft(e){await this.call("draft/delete",{draft_id:e.id,expected_revision:e.revision})}async applySaved(e,t){const i=await this.call("apply",{config_entry_id:e,item_id:t.id,revision:t.revision,updated_at:new Date().toISOString()});return Tt(T(i,"deployment"))}async applySnapshot(e,t,i){const s=await this.call("apply_snapshot",{config_entry_id:e,name:t,content:Ae(i),updated_at:new Date().toISOString()});return Tt(T(s,"deployment"))}async sceneCatalogue(e){const t=await this.call("scene/catalogue/list",{config_entry_id:e});return Ar(T(t,"catalogue"))}sceneDetail(e,t,i){return this.call("scene/catalogue/get",{config_entry_id:e,scene_id:t,effect_id:i}).then(Ir)}async applyScene(e,t,i){const s=await this.call("scene/apply",{config_entry_id:e,scene_id:t.scene_id,effect_id:t.effect_id,...i===null?{}:{speed_index:i}}),n=Xt(T(s,"scene")),a=T(s,"readback");if(a!=="scene_identity_only")throw new Error("Malformed Effect Studio server payload: scene Apply readback is invalid.");const l=T(s,"speed_index");if(l!==null&&(typeof l!="number"||!Number.isSafeInteger(l)||l<0||l>255))throw new Error("Malformed Effect Studio server payload: scene Apply speed is invalid.");return{scene:n,speed_index:l,readback:a}}subscribeLibrary(e,t){return this.hass.connection.subscribeMessage(i=>{try{e(ki(i))}catch(s){t?.(Si(s))}},{type:`${$t}/library/subscribe`})}subscribeDeployments(e,t){return this.hass.connection.subscribeMessage(i=>{try{e(Cr(i))}catch(s){t?.(Si(s))}},{type:`${$t}/deployment/subscribe`})}call(e,t={}){return this.hass.callWS({type:`${$t}/${e}`,...t})}}function T(r,e){if(typeof r!="object"||r===null||Array.isArray(r))throw new Error("Malformed Effect Studio server payload: response must be an object.");if(!(e in r))throw new Error(`Malformed Effect Studio server payload: response is missing ${e}.`);return r[e]}function xt(r){const e=T(r,"library_revision");if(typeof e!="number"||!Number.isSafeInteger(e)||e<0)throw new Error("Malformed Effect Studio server payload: library revision is invalid.");return e}function Si(r){return r instanceof Error?r:new Error("Malformed Effect Studio server payload.")}var Br=Object.defineProperty,os=(r,e,t,i)=>{for(var s=void 0,n=r.length-1,a;n>=0;n--)(a=r[n])&&(s=a(e,t,s)||s);return s&&Br(e,t,s),s};const Mt=17,ls="ha_govee_led_ble/effect_studio/recent_colours",We=[[255,69,58],[255,159,10],[255,214,10],[48,209,88],[99,230,226],[100,210,255],[10,132,255],[94,92,230],[191,90,242],[255,45,85],[172,142,104],[255,255,255],[174,174,178],[99,99,102],[28,28,30],[255,127,0],[139,0,255]];let xe=Fr();const Nt=new Set;class Zt extends P{constructor(){super(...arguments),this.colour=[255,255,255],this.disabled=!1}connectedCallback(){super.connectedCallback(),Nt.add(this)}disconnectedCallback(){Nt.delete(this),super.disconnectedCallback()}render(){return o`
      <div class="preset-grid">
        ${xe.map(e=>o`
            <button
              type="button"
              style="--preset-colour: ${S(e)}"
              aria-label="Use ${S(e)}"
              ?disabled=${this.disabled}
              @click=${()=>this.commit(e)}
            ></button>
          `)}
        <label
          class="custom-colour"
          style="--custom-colour: ${S(this.colour)}"
        >
          <input
            type="color"
            aria-label="Custom colour"
            .value=${S(this.colour)}
            ?disabled=${this.disabled}
            @input=${e=>this.emit("colour-changing",mi(e.target.value))}
            @change=${e=>this.commit(mi(e.target.value))}
          />
        </label>
      </div>
    `}commit(e){Ur(e),this.emit("colour-changed",e)}emit(e,t){this.colour=[...t],this.dispatchEvent(new CustomEvent(e,{detail:{colour:[...t]},bubbles:!0,composed:!0}))}static{this.styles=[R,w`
    :host {
      display: block;
    }

    .preset-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 4px;
    }

    .preset-grid button,
    .custom-colour {
      position: relative;
      min-height: var(--studio-control-height);
      border: 1px solid rgb(0 0 0 / 12%);
      border-radius: 6px;
      cursor: pointer;
    }

    .preset-grid button {
      background: var(--preset-colour);
    }

    .custom-colour {
      overflow: hidden;
      background: var(--custom-colour);
      box-shadow:
        inset 0 0 0 3px var(--studio-card),
        inset 0 0 0 5px rgb(0 0 0 / 32%);
    }

    .custom-colour input {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      min-height: 0;
      padding: 0;
      border: 0;
      opacity: 0;
      cursor: pointer;
    }

    .custom-colour:focus-within {
      outline: var(--studio-focus-width) solid var(--studio-blue);
      outline-offset: var(--studio-focus-offset);
    }
  `]}}os([h({attribute:!1})],Zt.prototype,"colour");os([h({type:Boolean})],Zt.prototype,"disabled");function Rt(r){return[...xe[r%xe.length]]}function Fr(){const r=localStorage.getItem(ls);if(!r)return O(We);let e;try{e=JSON.parse(r)}catch(i){if(i instanceof SyntaxError)return O(We);throw i}if(!Array.isArray(e))return O(We);const t=e.filter(qr).map(i=>[...i]).slice(0,Mt);return ds(t)}function Ur(r){const e=S(r);xe=ds([[...r],...xe.filter(t=>S(t)!==e)]),localStorage.setItem(ls,JSON.stringify(xe));for(const t of Nt)t.requestUpdate()}function ds(r){const e=O(r);for(const t of We)e.length>=Mt||e.some(i=>S(i)===S(t))||e.push([...t]);return e.slice(0,Mt)}function qr(r){return Array.isArray(r)&&r.length===3&&r.every(e=>Number.isInteger(e)&&e>=0&&e<=255)}customElements.get("govee-colour-picker")||customElements.define("govee-colour-picker",Zt);var Hr=Object.defineProperty,J=(r,e,t,i)=>{for(var s=void 0,n=r.length-1,a;n>=0;n--)(a=r[n])&&(s=a(e,t,s)||s);return s&&Hr(e,t,s),s};class j extends P{constructor(){super(...arguments),this.palette=[],this.minColours=1,this.maxColours=8,this.disabled=!1,this.persistentPicker=!1,this.ariaLabel="Colours",this.itemName="colour",this.windowPointerDown=e=>{this.editingIndex!==void 0&&!e.composedPath().includes(this)&&(this.editingIndex=void 0)}}connectedCallback(){super.connectedCallback(),window.addEventListener("pointerdown",this.windowPointerDown)}disconnectedCallback(){window.removeEventListener("pointerdown",this.windowPointerDown),super.disconnectedCallback()}willUpdate(e){e.has("palette")&&this.editingIndex!==void 0&&this.editingIndex>=this.palette.length&&(this.editingIndex=void 0)}render(){const e=this.persistentPicker?this.selectedIndex:this.editingIndex,t=this.palette.map((i,s)=>({key:`${s}-${S(i)}`,label:`${Ei(this.itemName)} ${s+1}`,ariaLabel:this.itemAriaLabel(i,s),colour:S(i),removeReady:!this.persistentPicker&&this.editingIndex===s&&this.palette.length>this.minColours,disabled:this.disabled}));return o`
      <govee-reorderable-strip
        .items=${t}
        .activeIndex=${e}
        .itemRole=${this.persistentPicker?"tab":"button"}
        .ariaLabel=${this.ariaLabel}
        .addLabel=${`Add ${this.itemName}`}
        .addDisabled=${this.disabled||this.palette.length>=this.maxColours}
        .reorderDisabled=${this.disabled||this.persistentPicker}
        @item-selected=${i=>this.swatchClicked(i.detail.index)}
        @items-reordered=${i=>this.reorder(i.detail.from,i.detail.to)}
        @item-added=${this.addColour}
        @keydown=${this.paletteKeyPressed}
        @focusout=${this.paletteFocusOut}
      >
        ${this.persistentPicker||this.editingIndex===void 0?d:o`
              <div
                slot="item-${this.editingIndex}"
                class="strip-popover colour-popover"
                role="dialog"
                aria-label="Edit colour"
              >
                ${this.renderPicker(this.editingIndex,this.palette[this.editingIndex])}
              </div>
            `}
      </govee-reorderable-strip>
      ${this.persistentPicker&&e!==void 0?o`
            <div
              class="persistent-picker"
              role="group"
              aria-label="Edit ${this.itemName} ${e+1}"
            >
              ${this.renderPicker(e,this.palette[e])}
            </div>
          `:d}
    `}itemAriaLabel(e,t){const i=`${Ei(this.itemName)} ${t+1}`;return this.persistentPicker?`${i}, ${S(e)}${t===this.selectedIndex?", selected":""}`:this.editingIndex===t&&this.palette.length>this.minColours?`Remove colour ${t+1}`:`Edit colour ${t+1}, ${S(e)}. Drag to reorder or use arrow keys.`}renderPicker(e,t){return o`
      <govee-colour-picker
        .colour=${t}
        .disabled=${this.disabled}
        @colour-changing=${i=>this.updateColour(e,i.detail.colour)}
        @colour-changed=${i=>this.commitColour(e,i.detail.colour)}
      ></govee-colour-picker>
    `}commitColour(e,t){this.updateColour(e,t),!this.persistentPicker&&(this.editingIndex=void 0,this.focusSwatchAfterUpdate(e))}updateColour(e,t){const i=O(this.palette);i[e]=[...t],this.emitPalette(i)}addColour(){if(this.disabled||this.palette.length>=this.maxColours)return;const e=this.palette[this.palette.length-1]??Rt(this.palette.length),t=[...O(this.palette),[...e]],i=t.length-1;this.persistentPicker?this.selectColour(i,t[i]):(this.editingIndex=i,this.focusPickerAfterUpdate()),this.emitPalette(t)}removeColour(e){if(this.disabled||this.palette.length<=this.minColours)return;const t=this.palette.filter((s,n)=>n!==e).map(s=>[...s]),i=Math.min(e,t.length-1);this.editingIndex=void 0,this.emitPalette(t),this.focusSwatchAfterUpdate(i)}reorder(e,t){if(this.disabled||e===t)return;const i=O(this.palette),[s]=i.splice(e,1);if(i.splice(t,0,s),this.editingIndex=this.editingIndex===e?t:Ct(this.editingIndex,e,t),this.persistentPicker){const n=Ct(this.selectedIndex,e,t);n!==void 0&&this.selectColour(n,i[n])}this.emitPalette(i)}focusSwatchAfterUpdate(e){this.updateComplete.then(()=>{this.shadowRoot?.querySelector("govee-reorderable-strip")?.focusItem(e)})}paletteKeyPressed(e){const t=this.editingIndex;e.key!=="Escape"||t===void 0||(e.preventDefault(),e.stopPropagation(),this.editingIndex=void 0,this.focusSwatchAfterUpdate(t))}paletteFocusOut(e){const t=e.currentTarget;this.editingIndex!==void 0&&!(e.relatedTarget instanceof Node&&t.contains(e.relatedTarget))&&(this.editingIndex=void 0)}swatchClicked(e){if(this.persistentPicker){this.selectColour(e,this.palette[e]);return}if(this.editingIndex===e&&this.palette.length>this.minColours){this.removeColour(e);return}if(this.editingIndex===e){this.editingIndex=void 0;return}this.editingIndex=e,this.focusPickerAfterUpdate()}focusPickerAfterUpdate(){this.updateComplete.then(()=>{this.shadowRoot?.querySelector(".colour-popover govee-colour-picker")?.shadowRoot?.querySelector("button:not(:disabled), input:not(:disabled)")?.focus()})}selectColour(e,t){this.selectedIndex=e,this.dispatchEvent(new CustomEvent("colour-selected",{detail:{index:e,colour:[...t]},bubbles:!0,composed:!0}))}emitPalette(e){this.palette=e,this.dispatchEvent(new CustomEvent("palette-changed",{detail:{palette:e},bubbles:!0,composed:!0}))}static{this.styles=[R,w`
    :host {
      display: block;
    }

    .persistent-picker {
      margin-top: var(--studio-section-gap);
      padding-top: var(--studio-section-gap);
      border-top: 1px solid var(--studio-border);
    }
  `]}}J([h({attribute:!1})],j.prototype,"palette");J([h({type:Number})],j.prototype,"minColours");J([h({type:Number})],j.prototype,"maxColours");J([h({type:Boolean})],j.prototype,"disabled");J([h({type:Boolean})],j.prototype,"persistentPicker");J([h({type:Number})],j.prototype,"selectedIndex");J([h()],j.prototype,"ariaLabel");J([h()],j.prototype,"itemName");J([m()],j.prototype,"editingIndex");function Ei(r){return r.charAt(0).toUpperCase()+r.slice(1)}customElements.get("govee-palette-editor")||customElements.define("govee-palette-editor",j);var Vr=Object.defineProperty,dt=(r,e,t,i)=>{for(var s=void 0,n=r.length-1,a;n>=0;n--)(a=r[n])&&(s=a(e,t,s)||s);return s&&Vr(e,t,s),s};class Ue extends P{constructor(){super(...arguments),this.disabled=!1,this.windowPointerDown=e=>{if(this.openRowMenuIndex===void 0)return;const t=this.shadowRoot?.querySelector(`details[data-row-menu-index="${this.openRowMenuIndex}"]`);t&&!e.composedPath().includes(t)&&(this.openRowMenuIndex=void 0)}}connectedCallback(){super.connectedCallback(),window.addEventListener("pointerdown",this.windowPointerDown)}disconnectedCallback(){window.removeEventListener("pointerdown",this.windowPointerDown),super.disconnectedCallback()}willUpdate(e){e.has("content")&&this.openRowMenuIndex!==void 0&&(this.content?.kind!=="h617a_multi"||this.openRowMenuIndex>=this.content.effects.length)&&(this.openRowMenuIndex=void 0)}updated(){if(this.content){if(this.content.kind==="h617a_single"||this.content.kind==="palette_diy"||this.content.kind==="special_diy"){const e=this.shadowRoot?.querySelector("select[data-single-variation]");e&&(e.value=String(this.content.variant));return}this.content.effects.forEach((e,t)=>{const i=this.effectFamily(e,!0),s=this.shadowRoot?.querySelector(`select[data-effect-index="${t}"]`),n=this.shadowRoot?.querySelector(`select[data-variation-index="${t}"]`);s&&(s.value=i?.id??`unknown:${e.family}`),n&&(n.value=String(e.variant))})}}render(){if(!this.content||!this.catalogue)return d;const e=(this.content.kind==="h617a_single"||this.content.kind==="palette_diy"||this.content.kind==="special_diy")&&this.effectFamily(this.content)?.rate==="sensitivity"?"Sensitivity":"Speed";return o`
      ${this.content.kind==="h617a_multi"?o`
            <section class="card effect-card">
              <h3 class="section-title">Layers</h3>
              ${this.renderSequence(this.content)}
            </section>
          `:d}

      <section class="card parameters-card">
        <div class="parameter-stack">
          ${this.renderSingleVariation()}
          <div class="parameter-group">
            <span class="parameter-label">Colours</span>
            ${this.renderPalette()}
          </div>
          <govee-slider-control
            .label=${e}
            .value=${this.content.speed}
            .minimum=${0}
            .maximum=${100}
            .disabled=${this.disabled}
            @value-changed=${t=>this.emitContent({...this.content,speed:t.detail.value})}
          ></govee-slider-control>
        </div>
      </section>
    `}renderSingleVariation(){if(!this.content||this.content.kind!=="h617a_single"&&this.content.kind!=="palette_diy"&&this.content.kind!=="special_diy")return d;const e=this.content,i=this.effectFamily(e)?.variations??[],s=i.some(n=>n.variant===e.variant);return s&&i.length<=1?d:o`
      <label class="field parameter-group">
        <span class="parameter-label">Variation</span>
        <select
          aria-label="Variation"
          data-single-variation
          .value=${String(e.variant)}
          ?disabled=${this.disabled}
          @change=${n=>this.emitContent({...e,variant:Number(n.target.value)})}
        >
          ${s?d:o`
                <option value=${String(e.variant)}>
                  Unknown variation ${e.variant}
                </option>
              `}
          ${i.map(n=>o`
              <option value=${String(n.variant)}>
                ${n.label}
              </option>
            `)}
        </select>
      </label>
    `}renderSequence(e){return o`
      <ol class="sequence">
        ${e.effects.map((t,i)=>this.effectRow(t,i))}
      </ol>
      <button
        class="add-step"
        type="button"
        title="Add layer"
        aria-label="Add layer"
        ?disabled=${this.disabled||e.effects.length>=this.catalogue.limits.multi_max}
        @click=${this.addEffect}
      >
        +
      </button>
    `}effectRow(e,t){const i=this.effectFamily(e,!0),s=i?.variations??[];return o`
      <li
        class="effect-row"
        @dragover=${n=>{this.disabled||n.preventDefault()}}
        @drop=${n=>this.effectDropped(t,n)}
      >
        ${this.disabled?d:o`
              <span
                class="drag-handle"
                draggable="true"
                title="Drag Layer ${t+1} to reorder"
                aria-hidden="true"
                @dragstart=${n=>this.effectDragStarted(t,n)}
              >⋮⋮</span>
            `}
        <span class="layer-heading">Layer ${t+1}</span>
        <div class="effect-fields">
          <label class="field">
            <span class="effect-label">Effect</span>
            <select
              aria-label="Layer ${t+1} effect"
              data-effect-index=${t}
              .value=${i?.id??`unknown:${e.family}`}
              ?disabled=${this.disabled}
              @change=${n=>this.effectFamilyChanged(t,n.target.value)}
            >
              ${i?d:o`
                    <option value=${`unknown:${e.family}`}>
                      Unknown effect ${e.family}
                    </option>
                  `}
              ${this.multiFamilies.map(n=>o`
                  <option value=${n.id}>${n.label}</option>
                `)}
            </select>
          </label>
          <label class="field">
            <span>Variation</span>
            <select
              aria-label="Layer ${t+1} variation"
              data-variation-index=${t}
              .value=${String(e.variant)}
              ?disabled=${this.disabled}
              @change=${n=>this.effectVariationChanged(t,Number(n.target.value))}
            >
              ${s.some(n=>n.variant===e.variant)?d:o`
                    <option value=${String(e.variant)}>
                      Unknown variation ${e.variant}
                    </option>
                  `}
              ${s.map(n=>o`
                  <option value=${String(n.variant)}>
                    ${n.label}
                  </option>
                `)}
            </select>
          </label>
        </div>
        ${this.disabled?d:o`
              <details
                class="row-menu"
                data-row-menu-index=${t}
                ?open=${this.openRowMenuIndex===t}
                @toggle=${n=>this.rowMenuToggled(t,n)}
                @keydown=${n=>this.rowMenuKeyPressed(t,n)}
              >
                <summary aria-label="Layer actions for Layer ${t+1}">
                  ⋮
                </summary>
                <div class="row-menu-popover">
                  <button
                    type="button"
                    ?disabled=${this.disabled||t===0}
                    @click=${()=>{this.openRowMenuIndex=void 0,this.moveEffect(t,-1)}}
                  >
                    Move up
                  </button>
                  <button
                    type="button"
                    ?disabled=${this.disabled||t===this.content.effects.length-1}
                    @click=${()=>{this.openRowMenuIndex=void 0,this.moveEffect(t,1)}}
                  >
                    Move down
                  </button>
                  <button
                    class="danger"
                    type="button"
                    ?disabled=${this.disabled||this.content.effects.length===1}
                    @click=${()=>{this.openRowMenuIndex=void 0,this.removeEffect(t)}}
                  >
                    Remove
                  </button>
                </div>
              </details>
            `}
      </li>
    `}get multiFamilies(){return this.catalogue?.effects.filter(e=>e.supports_multi)??[]}renderPalette(){return o`
      <govee-palette-editor
        .palette=${this.content.palette}
        .minColours=${this.catalogue.limits.palette_min}
        .maxColours=${this.catalogue.limits.palette_max}
        .disabled=${this.disabled}
        @palette-changed=${e=>{this.emitContent({...this.content,palette:O(e.detail.palette)})}}
      ></govee-palette-editor>
    `}effectFamilyChanged(e,t){const i=this.multiFamilies.find(n=>n.id===t),s=i?.variations[0];!i||!s||this.replaceEffect(e,{family:i.family,variant:s.variant})}effectVariationChanged(e,t){if(!this.content||this.content.kind!=="h617a_multi")return;const i=this.content.effects[e];i&&this.replaceEffect(e,{...i,variant:t})}replaceEffect(e,t){if(!this.content||this.content.kind!=="h617a_multi")return;const i=this.content.effects.map((s,n)=>n===e?t:s);this.emitContent({...this.content,effects:i})}addEffect(){if(!this.content||this.content.kind!=="h617a_multi")return;const e=this.multiFamilies[this.content.effects.length]??this.multiFamilies[0],t=e?.variations[0];if(!e||!t)return;const i=[...this.content.effects,{family:e.family,variant:t.variant}];this.emitContent({...this.content,effects:i})}removeEffect(e){if(!this.content||this.content.kind!=="h617a_multi")return;const t=this.content.effects.filter((i,s)=>s!==e);this.emitContent({...this.content,effects:t})}moveEffect(e,t){if(!this.content||this.content.kind!=="h617a_multi")return;const i=e+t;i<0||i>=this.content.effects.length||this.reorderEffect(e,i)}reorderEffect(e,t){if(!this.content||this.content.kind!=="h617a_multi"||e===t)return;const i=[...this.content.effects],[s]=i.splice(e,1);i.splice(t,0,s),this.emitContent({...this.content,effects:i})}effectDragStarted(e,t){this.draggedEffectIndex=e,t.dataTransfer?.setData("text/plain",String(e))}effectDropped(e,t){t.preventDefault(),this.draggedEffectIndex!==void 0&&(this.reorderEffect(this.draggedEffectIndex,e),this.draggedEffectIndex=void 0)}rowMenuToggled(e,t){t.currentTarget.open?this.openRowMenuIndex=e:this.openRowMenuIndex===e&&(this.openRowMenuIndex=void 0)}rowMenuKeyPressed(e,t){t.key==="Escape"&&(t.preventDefault(),this.openRowMenuIndex=void 0,this.updateComplete.then(()=>{this.shadowRoot?.querySelectorAll(".row-menu summary")[e]?.focus()}))}effectFamily(e,t=!1){return(t?this.multiFamilies:this.catalogue?.effects)?.find(i=>i.family===e.family)}emitContent(e){this.dispatchEvent(new CustomEvent("content-changed",{detail:{content:e},bubbles:!0,composed:!0}))}static{this.styles=[R,ue,Y,w`
    :host {
      display: block;
    }

    p {
      margin-top: 0;
    }

    .parameters-card {
      margin-top: var(--studio-section-gap);
    }

    .sequence {
      display: grid;
      gap: 8px;
      margin: 0 0 8px;
      padding: 0;
      list-style: none;
    }

    .effect-row {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .drag-handle {
      display: grid;
      width: 24px;
      min-height: var(--studio-control-height);
      flex: 0 0 24px;
      place-items: center;
      color: var(--studio-muted);
      cursor: grab;
      font-size: 18px;
      letter-spacing: -5px;
      user-select: none;
    }

    .layer-heading {
      display: none;
    }

    .effect-fields {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      flex: 1;
      gap: 10px;
      min-width: 0;
    }

    .effect-fields .field {
      margin-top: 0;
      font-size: 12px;
      font-weight: 650;
    }

    .effect-fields select {
      width: 100%;
      min-height: var(--studio-control-height);
      padding: 8px 10px;
      border: 1px solid var(--studio-border);
      border-radius: var(--studio-control-radius);
      color: var(--primary-text-color);
      background: var(--secondary-background-color, #f5f6f8);
    }

    .row-menu {
      position: relative;
      flex: 0 0 var(--studio-control-height);
    }

    .row-menu summary {
      display: grid;
      width: var(--studio-control-height);
      height: var(--studio-control-height);
      place-items: center;
      border: 1px solid var(--studio-border);
      border-radius: 50%;
      color: var(--studio-muted);
      background: var(--studio-card);
      cursor: pointer;
      list-style: none;
      font-size: 22px;
    }

    .row-menu summary::-webkit-details-marker {
      display: none;
    }

    .row-menu-popover {
      position: absolute;
      z-index: 20;
      top: 50px;
      right: 0;
      display: grid;
      width: 150px;
      padding: 6px;
      border: 1px solid var(--studio-border);
      border-radius: var(--studio-popover-radius);
      background: var(--studio-card);
      box-shadow: var(--studio-popover-shadow);
    }

    .row-menu-popover button {
      padding: 8px 10px;
      border: 0;
      border-radius: 6px;
      color: var(--primary-text-color);
      background: transparent;
      text-align: start;
      cursor: pointer;
    }

    .danger {
      color: var(--studio-danger) !important;
    }

    .add-step {
      display: grid;
      width: var(--studio-control-height);
      height: var(--studio-control-height);
      place-items: center;
      padding: 0;
      border: 1px dashed var(--studio-border);
      border-radius: var(--studio-control-radius);
      color: var(--studio-blue);
      background: transparent;
      cursor: pointer;
      font-size: 24px;
    }

    @media (max-width: 560px) {
      .sequence {
        gap: 12px;
      }

      .effect-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: start;
        gap: 10px;
        padding: 12px;
        border: 1px solid var(--studio-border);
        border-radius: var(--studio-control-radius);
        background: var(--secondary-background-color, #f5f6f8);
      }

      .drag-handle {
        display: none;
      }

      .layer-heading {
        display: block;
        align-self: center;
        color: var(--primary-text-color);
        font-size: 14px;
        font-weight: 700;
      }

      .effect-fields {
        grid-column: 1 / -1;
        grid-template-columns: 1fr;
      }

      .effect-label {
        display: none;
      }

      .row-menu {
        grid-column: 2;
        grid-row: 1;
      }
    }

  `]}}dt([h({attribute:!1})],Ue.prototype,"content");dt([h({attribute:!1})],Ue.prototype,"catalogue");dt([h({type:Boolean})],Ue.prototype,"disabled");dt([m()],Ue.prototype,"openRowMenuIndex");customElements.get("govee-custom-effect-editor")||customElements.define("govee-custom-effect-editor",Ue);function Kr(r){return{...r}}function st(r){return{...r,relative_brightness:Kr(r.relative_brightness)}}function Te(r){return{...r,colour:r.colour===null?null:M(r.colour),parameters:Qt(r.parameters)}}function Qt(r){return structuredClone(r)}const Ot=15;function ve(){return{kind:"h617a_painted",effect:"clockwise",speed:50,brightness:100,background:[0,0,0],groups:[]}}function ne(r,e){if(r==="h617a_painted")return ve();const t=r==="h617a_multi"?e.effects.find(n=>n.supports_multi):e.effects[0];if(!t)throw new Error("The custom-effect catalogue has no compatible effects.");const i=t.variations[0],s={family:t.family,variant:i.variant};return r==="h617a_single"?{kind:r,...s,speed:50,palette:Re()}:{kind:r,effects:[s],speed:50,palette:Re()}}function kt(r,e,t,i){if(e!=="H617A"&&e!=="H6199")throw new Error(`Unsupported custom-effect model ${e}.`);const s=r.effects.find(n=>n.family===t)??r.effects[0];if(!s)throw new Error("The custom-effect catalogue has no compatible effects.");return{kind:"palette_diy",model:e,family:t??s.family,variant:i??s.variations[0].variant,speed:50,palette:Re()}}function zr(r){return{kind:"video_profile",model:"H6199",mode:r==="game"?"game":"movie",full_screen:!0,saturation:50,sound_effects:!1,sound_effects_softness:50,white_balance_position:17,relative_brightness:{left:100,top:100,right:100,bottom:100},blank_screen:!1}}function jr(r){return{...r,background:M(r.background),groups:r.groups.map(e=>({fill:M(e.fill),segments:[...e.segments]}))}}function cs(r){return r.kind==="h617a_painted"?jr(r):r.kind==="h617a_single"?{...r,palette:O(r.palette)}:{...r,effects:r.effects.map(e=>({...e})),palette:O(r.palette)}}function us(r){return{...r,palette:O(r.palette)}}function ps(r){return{...r,palette:O(r.palette)}}function hs(r){return{...r,effect:{layers:_e({layers:r.effect.layers}).layers}}}function Ke(r){return r.kind==="advanced"?_e(r):r.kind==="scene_layered"?le(r):r.kind==="workshop"?hs(r):r.kind==="palette_diy"?us(r):r.kind==="special_diy"?ps(r):r.kind==="music_profile"?Te(r):r.kind==="video_profile"?st(r):cs(r)}function Gr(r){return{...r,body:structuredClone(r.body)}}function Yr(r){return r.kind==="advanced"?r:{kind:"advanced",layers:r.effect.layers}}function Wr(r,e){return r.kind==="advanced"?_e(e):r.kind==="workshop"?{...hs(r),effect:{layers:_e(e).layers}}:{...le(r),effect:{layers:_e(e).layers}}}function Re(){return[[255,0,0],[255,127,0],[255,255,0],[0,255,0],[0,0,255],[0,255,255],[139,0,255]]}function Xr(r){const e=[];for(const t of[...r,...Re()])if(e.some(i=>et(i,t))||e.push(M(t)),e.length===8)break;return e}function Bt(r){const e=Array.from({length:Ot},()=>M(r.background));for(const t of r.groups)for(const i of t.segments)e[i]=M(t.fill);return e}function Ci(r,e){const t=new Map;return r.forEach((i,s)=>{if(et(i,e))return;const n=i.join(","),a=t.get(n);a?a.segments.push(s):t.set(n,{fill:M(i),segments:[s]})}),[...t.values()]}function Jr(r){const e=[];for(const t of Bt(r))if(!et(t,r.background)&&!e.some(i=>et(i,t))&&e.push(M(t)),e.length===8)break;return e}function Q(r,e){return JSON.stringify({name:r.trim(),content:e})}function ei(r){return r==="h617a_painted"||r==="h617a_single"||r==="h617a_multi"}function Xe(r){return typeof r=="object"&&r!==null&&"kind"in r&&ei(r.kind)}function wt(r){return ae(r)}function ae(r){return Xe(r)||typeof r=="object"&&r!==null&&"kind"in r&&(ct(r.kind)||r.kind==="palette_diy"||r.kind==="special_diy"||r.kind==="music_profile"||r.kind==="video_profile")}function ct(r){return r==="advanced"||r==="scene_layered"||r==="workshop"}function ze(r){return ct(r.kind)}function Zr(r){return ei(r)||ct(r)||r==="palette_diy"||r==="special_diy"||r==="music_profile"||r==="video_profile"||r==="scene_builtin"||r==="scene_palette"}function Ai(r){switch(r){case"h617a_painted":return"Paint";case"h617a_single":return"Single";case"h617a_multi":return"Multi";case"advanced":return"Layered";case"palette_diy":return"Single";case"special_diy":return"Special DIY";case"workshop":return"Workshop";default:return"Custom"}}function St(r){return ei(r)||ct(r)||r==="palette_diy"||r==="special_diy"||r==="music_profile"||!Zr(r)}function Ii(r,e){const t=e==="H6199"?["special_diy","palette_diy","workshop","music_profile","advanced","scene_layered"]:["h617a_painted","h617a_single","h617a_multi","music_profile","workshop","advanced","scene_layered"],i=t.indexOf(r);return i===-1?t.length:i}function Qr(r){return r==="h617a_multi"?"multi-layer":r==="music_profile"?"music":r==="h617a_painted"||r==="h617a_single"||r==="palette_diy"||r==="special_diy"?r==="special_diy"?"special-diy":"single-layer":"advanced"}function Pi(r,e){return r?.id===e?.id&&r?.revision===e?.revision}function Di(r,e){const t=en(e);return[...r.filter(i=>i.id!==e.id),{id:e.id,revision:e.revision,name:e.name,kind:e.content.kind==="opaque"?e.content.source_kind:e.content.kind,...t?{model:t}:{},...e.content.kind==="scene_builtin"||e.content.kind==="scene_palette"||e.content.kind==="scene_layered"?{template:e.content.template}:{}}].sort((i,s)=>i.name.localeCompare(s.name))}function en(r){const e=r.content;return e.kind==="palette_diy"||e.kind==="special_diy"||e.kind==="workshop"||e.kind==="music_profile"||e.kind==="video_profile"?e.model:e.kind==="h617a_painted"||e.kind==="h617a_single"||e.kind==="h617a_multi"?"H617A":e.kind==="scene_builtin"||e.kind==="scene_palette"||e.kind==="scene_layered"?Ti(e.template.sku):Ti(r.target_hint?.model)}function Ti(r){return r==="H617A"||r==="H6199"?r:void 0}const fe={ATTRIBUTE:1,PROPERTY:3,BOOLEAN_ATTRIBUTE:4},tn=r=>(...e)=>({_$litDirective$:r,values:e});class sn{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}}const rn=r=>r.strings===void 0,nn={},an=(r,e=nn)=>r._$AH=e;const Li=tn(class extends sn{constructor(r){if(super(r),r.type!==fe.PROPERTY&&r.type!==fe.ATTRIBUTE&&r.type!==fe.BOOLEAN_ATTRIBUTE)throw Error("The `live` directive is not allowed on child or event bindings");if(!rn(r))throw Error("`live` bindings can only contain a single expression")}render(r){return r}update(r,[e]){if(e===K||e===d)return e;const t=r.element,i=r.name;if(r.type===fe.PROPERTY){if(e===t[i])return K}else if(r.type===fe.BOOLEAN_ATTRIBUTE){if(!!e===t.hasAttribute(i))return K}else if(r.type===fe.ATTRIBUTE&&t.getAttribute(i)===e+"")return K;return an(r),e}});var on=Object.defineProperty,ut=(r,e,t,i)=>{for(var s=void 0,n=r.length-1,a;n>=0;n--)(a=r[n])&&(s=a(e,t,s)||s);return s&&on(e,t,s),s};const ln=new Set(["rhythm","bloom","shiny"]),dn=new Set(["point","gradient","relative_brightness","key_count","direction","segment_count","speed"]),ms=[{id:"clockwise",label:"Clockwise"},{id:"two_way",label:"Two-way"},{id:"counterclockwise",label:"Counterclockwise"}];class qe extends P{constructor(){super(...arguments),this.disabled=!1,this.showModeSelector=!0,this.modeChanged=e=>{const t=e.target.value;this.updateContent(i=>(i.mode=t,i.parameters=un(i.parameters),i.calm=Et(t)?i.calm??!1:null,i))}}willUpdate(e){e.has("content")&&this.content?.colour!=null&&(this.lastFixedColour=M(this.content.colour))}render(){if(!this.content)return d;const e=cn(this.content.mode,this.catalogue),t=this.catalogue?.limits.music_sensitivity_min??0,i=this.catalogue?.limits.music_sensitivity_max??100,s=k(this.content.sensitivity,t,i),n=this.content.colour===null?"automatic":"fixed",a=this.content.colour??this.lastFixedColour??Rt(0);return o`
      <section class="card">
        <div class="parameter-stack">
          ${this.showModeSelector?o`
                <label class="field">
                  <span class="parameter-label">Mode</span>
                  <select
                    aria-label="Mode"
                    .value=${Li(this.content.mode)}
                    ?disabled=${this.disabled}
                    @change=${this.modeChanged}
                  >
                    ${e.map(l=>o`
                        <option
                          value=${l.id}
                          .selected=${l.id===this.content?.mode}
                        >
                          ${l.label}
                        </option>
                      `)}
                  </select>
                </label>
              `:d}

          ${this.renderRangeField("Sensitivity",s,t,i,l=>this.updateContent(c=>(c.sensitivity=l,c)))}

          ${this.renderSegmentedField("Colour mode",n,[{value:"automatic",label:"Automatic"},{value:"fixed",label:"Fixed"}],l=>this.colourModeChanged(l==="fixed"))}

          ${n==="fixed"?o`
                <div class="parameter-group fixed-colour">
                  <span class="parameter-label">Fixed colour</span>
                  <govee-colour-picker
                    .colour=${a}
                    .disabled=${this.disabled}
                    @colour-changing=${l=>this.fixedColourChanged(l.detail.colour)}
                    @colour-changed=${l=>this.fixedColourChanged(l.detail.colour)}
                  ></govee-colour-picker>
                </div>
              `:d}

          ${Et(this.content.mode)?this.renderSegmentedField("Style",!!this.content.calm,[{value:!1,label:"Dynamic"},{value:!0,label:"Calm"}],l=>this.styleChanged(l)):d}

          ${this.renderModeParameters(this.content)}
        </div>
      </section>
    `}renderSegmentedField(e,t,i,s){return o`
      <govee-segmented-control
        .label=${e}
        .value=${t}
        .options=${i}
        .disabled=${this.disabled}
        @value-changed=${n=>s(n.detail.value)}
      ></govee-segmented-control>
    `}renderRangeField(e,t,i,s,n,a=!1){return o`
      <govee-slider-control
        .label=${e}
        .value=${t}
        .minimum=${i}
        .maximum=${s}
        .showValue=${a}
        .disabled=${this.disabled}
        @value-changed=${l=>n(l.detail.value)}
      ></govee-slider-control>
    `}renderModeParameters(e){switch(e.mode){case"separation":return this.renderSeparationParameters(e.parameters);case"hopping":return this.renderHoppingParameters(e.parameters);case"piano_keys":return this.renderPianoKeysParameters(e.parameters);case"fountain":return this.renderFountainParameters(e.parameters);case"day_and_night":return this.renderDayAndNightParameters(e.parameters);default:return d}}renderSeparationParameters(e){const t=Ie(e,"point",1,1,5),i=Mi(e,"gradient",!0);return o`
      ${this.renderRangeField("Point",t,1,5,s=>this.updateParameter("point",s))}
      ${this.renderCheckboxField("Gradient",i,s=>this.updateParameter("gradient",s))}
    `}renderHoppingParameters(e){const t=Ie(e,"relative_brightness",50,0,50);return o`
      ${this.renderRangeField("Relative brightness",t,0,50,i=>this.updateParameter("relative_brightness",i))}
    `}renderPianoKeysParameters(e){const t=Ie(e,"key_count",15,8,15);return o`
      ${this.renderRangeField("Key count",t,8,15,i=>this.updateParameter("key_count",i))}
    `}renderFountainParameters(e){const t=pn(e,"direction","clockwise");return o`
      <label class="field">
        <span class="parameter-label">Direction</span>
        <select
          aria-label="Direction"
          .value=${Li(t)}
          ?disabled=${this.disabled}
          @change=${i=>this.updateParameter("direction",i.target.value)}
        >
          ${ms.map(i=>o`
              <option
                value=${i.id}
                .selected=${i.id===t}
              >
                ${i.label}
              </option>
            `)}
        </select>
      </label>
    `}renderDayAndNightParameters(e){const t=Ie(e,"segment_count",1,1,7),i=Ie(e,"speed",10,1,50),s=Mi(e,"gradient",!1);return o`
      ${this.renderRangeField("Segment count",t,1,7,n=>this.updateParameter("segment_count",n),!0)}
      ${this.renderRangeField("Speed",i,1,50,n=>this.updateParameter("speed",n))}
      ${this.renderCheckboxField("Gradient",s,n=>this.updateParameter("gradient",n))}
    `}renderCheckboxField(e,t,i){return o`
      <govee-checkbox-control
        .label=${e}
        .checked=${t}
        .disabled=${this.disabled}
        @checked-changed=${s=>i(s.detail.checked)}
      ></govee-checkbox-control>
    `}colourModeChanged(e){this.updateContent(t=>{if(!e)return this.lastFixedColour=t.colour===null?this.lastFixedColour:M(t.colour),t.colour=null,t;const i=t.colour??this.lastFixedColour??Rt(0);return this.lastFixedColour=M(i),t.colour=M(i),t})}fixedColourChanged(e){this.lastFixedColour=M(e),this.updateContent(t=>(t.colour=M(e),t))}styleChanged(e){this.updateContent(t=>(Et(t.mode)&&(t.calm=e),t))}updateParameter(e,t){this.updateContent(i=>{const s=Qt(i.parameters);return s[e]=t,i.parameters=s,i})}updateContent(e){if(!this.content)return;const t=Te(e(Te(this.content)));this.content=t,this.dispatchEvent(new CustomEvent("content-changed",{detail:{content:Te(t)},bubbles:!0,composed:!0}))}static{this.styles=[R,ue,Y,w`
      :host {
        display: block;
      }

    `]}}ut([h({attribute:!1})],qe.prototype,"content");ut([h({attribute:!1})],qe.prototype,"catalogue");ut([h({type:Boolean})],qe.prototype,"disabled");ut([h({type:Boolean})],qe.prototype,"showModeSelector");function cn(r,e){const t=e?.music_modes.map(i=>({...i}))??[];return t.some(i=>i.id===r)?t:[{id:r,label:`Unknown mode ${r}`},...t]}function un(r){const e=Qt(r);for(const t of dn)delete e[t];return e}function Et(r){return ln.has(r)}function Ie(r,e,t,i,s){const n=r[e];return typeof n!="number"||!Number.isFinite(n)?t:k(n,i,s)}function Mi(r,e,t){return typeof r[e]=="boolean"?r[e]:t}function pn(r,e,t){const i=r[e];return ms.some(s=>s.id===i)?i:t}customElements.get("govee-music-profile-editor")||customElements.define("govee-music-profile-editor",qe);var hn=Object.defineProperty,fs=(r,e,t,i)=>{for(var s=void 0,n=r.length-1,a;n>=0;n--)(a=r[n])&&(s=a(e,t,s)||s);return s&&hn(e,t,s),s};class ti extends P{constructor(){super(...arguments),this.colours=[],this.disabled=!1}render(){return o`
      <section class="card" aria-labelledby="painted-segments-heading">
        <h3 class="section-title" id="painted-segments-heading">
          Painted segments
        </h3>
        <div class="segments">
          ${this.colours.map((e,t)=>o`
              <button
                type="button"
                data-segment=${t}
                style="--segment-colour: ${S(e)}"
                aria-label="Segment ${t+1}, ${S(e)}"
                ?disabled=${this.disabled}
                @pointerdown=${i=>this.pointerStarted(t,i)}
                @pointermove=${this.pointerMoved}
                @pointerup=${this.pointerFinished}
                @pointercancel=${this.pointerFinished}
                @click=${i=>this.segmentClicked(t,i)}
              ></button>
            `)}
        </div>
      </section>
    `}pointerStarted(e,t){this.disabled||(t.preventDefault(),this.paintingPointerId=t.pointerId,this.lastPaintedSegment=e,t.currentTarget.setPointerCapture(t.pointerId),this.selectSegment(e))}pointerMoved(e){if(e.pointerId!==this.paintingPointerId||!this.shadowRoot)return;const t=this.shadowRoot.elementFromPoint(e.clientX,e.clientY)?.closest("[data-segment]"),i=Number(t?.dataset.segment);Number.isInteger(i)&&i!==this.lastPaintedSegment&&(this.lastPaintedSegment=i,this.selectSegment(i))}pointerFinished(e){if(e.pointerId!==this.paintingPointerId)return;const t=this.shadowRoot?.querySelector(`[data-segment="${this.lastPaintedSegment}"]`);t?.hasPointerCapture(e.pointerId)&&t.releasePointerCapture(e.pointerId),this.paintingPointerId=void 0,this.lastPaintedSegment=void 0}segmentClicked(e,t){!this.disabled&&t.detail===0&&this.selectSegment(e)}selectSegment(e){this.dispatchEvent(new CustomEvent("segment-selected",{detail:{index:e},bubbles:!0,composed:!0}))}static{this.styles=[R,ue,w`
    :host {
      display: block;
    }

    .segments {
      display: grid;
      grid-template-columns: repeat(15, minmax(0, 1fr));
      gap: 4px;
      touch-action: none;
    }

    button {
      min-width: 0;
      min-height: 48px;
      padding: 0;
      border: 1px solid
        color-mix(in srgb, var(--segment-colour) 70%, #000);
      border-radius: 6px;
      background: var(--segment-colour);
      cursor: crosshair;
    }

    button:focus-visible {
      outline: var(--studio-focus-width) solid var(--studio-blue);
      outline-offset: var(--studio-focus-offset);
    }

    @media (max-width: 600px) {
      .segments {
        grid-template-columns: repeat(5, minmax(0, 1fr));
      }
    }
  `]}}fs([h({attribute:!1})],ti.prototype,"colours");fs([h({type:Boolean})],ti.prototype,"disabled");customElements.get("govee-painted-segment-editor")||customElements.define("govee-painted-segment-editor",ti);const mn=[R,ue,zt,ji,Y,Gi,Wi,jt,Yi,w`
    :host {
      display: block;
      min-height: 100%;
      color: var(--primary-text-color);
      background: var(--primary-background-color);
      font-family: var(--paper-font-body1_-_font-family, sans-serif);
    }

    .centred,
    .fatal {
      max-width: 680px;
      margin: 0 auto;
      padding: 48px 24px;
    }

    .fatal h1 {
      margin-top: 0;
    }

    .fatal a {
      color: var(--studio-blue);
      font-weight: 600;
    }

    h1,
    h2,
    h3,
    p {
      margin-top: 0;
    }

    h1 {
      margin-bottom: 0;
      font-size: 25px;
      font-weight: 600;
    }

    h2 {
      margin-bottom: 0;
      font-size: 20px;
      font-weight: 600;
    }

    h3 {
      margin-bottom: 18px;
      font-size: 16px;
    }

    .device-picker {
      margin-top: auto;
    }

    .device-picker select {
      width: 100%;
    }

    select {
      min-height: 42px;
      padding: 8px 12px;
      border: 1px solid var(--studio-border);
      border-radius: var(--studio-button-radius);
      color: var(--primary-text-color);
      background: var(--studio-card);
    }

    .notice {
      padding: 11px 28px;
      border-bottom: 1px solid
        color-mix(in srgb, var(--studio-blue) 35%, var(--studio-border));
      color: var(--primary-text-color);
      background: var(--studio-blue-soft);
    }

    .studio {
      display: grid;
      grid-template-columns: 190px 230px minmax(0, 1fr);
      min-height: 100vh;
    }

    .studio.scenes-mode,
    .studio.custom-mode {
      grid-template-columns: 190px 190px 230px minmax(0, 1fr);
    }

    .primary-nav {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 22px 16px;
      border-inline-end: 1px solid var(--studio-border);
      background: var(--secondary-background-color, #f5f6f8);
    }

    .library .new-effect-action {
      position: sticky;
      z-index: 1;
      top: 0;
      margin-bottom: 6px;
      border: 1px solid
        color-mix(in srgb, var(--studio-blue) 24%, var(--studio-border));
      color: var(--primary-text-color);
      background: color-mix(
        in srgb,
        var(--studio-blue) 5%,
        var(--primary-background-color, #fff)
      );
      box-shadow: 0 5px 0 var(--primary-background-color, #fff);
      font-weight: 600;
    }

    .library .new-effect-icon {
      display: inline-block;
      width: 12px;
      height: 12px;
      margin-inline-end: 8px;
      background:
        linear-gradient(var(--studio-blue), var(--studio-blue)) center / 12px
          1.5px no-repeat,
        linear-gradient(var(--studio-blue), var(--studio-blue)) center / 1.5px
          12px no-repeat;
    }

    .library .new-effect-action:hover {
      border-color: color-mix(
        in srgb,
        var(--studio-blue) 34%,
        var(--studio-border)
      );
      background: color-mix(
        in srgb,
        var(--studio-blue) 9%,
        var(--primary-background-color, #fff)
      );
    }

    .item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .back-button {
      min-height: 44px;
      margin-bottom: 14px;
      padding: 8px 0;
      border: 0;
      color: var(--studio-blue);
      background: transparent;
      font-weight: 650;
      cursor: pointer;
    }

    .button-row {
      display: flex;
      flex-wrap: wrap;
      gap: 9px;
    }

    .actions > button {
      min-height: 44px;
    }

    .dialog-backdrop {
      position: fixed;
      z-index: 1000;
      inset: 0;
      display: grid;
      place-items: center;
      overflow: auto;
      overscroll-behavior: contain;
      padding: 24px;
      background: rgb(0 0 0 / 45%);
    }

    .dialog-card {
      width: min(440px, 100%);
      max-height: calc(100vh - 48px);
      overflow: auto;
      padding: 24px;
      border: 1px solid var(--studio-border);
      border-radius: 12px;
      color: var(--primary-text-color);
      background: var(--studio-card);
      box-shadow: 0 18px 52px rgb(0 0 0 / 28%);
    }

    .dialog-card p {
      margin-top: 16px;
      margin-bottom: 0;
      line-height: 1.5;
    }

    .save-dialog .field {
      margin-top: 20px;
    }

    .dialog-error {
      color: var(--error-color, #db4437);
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 9px;
      margin-top: 24px;
    }

    .controls {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
      margin-top: 18px;
    }

    .single-effect-settings {
      margin-bottom: 18px;
    }

    .single-effect-settings .field {
      margin-top: 0;
    }

    .opaque-content h3 {
      margin: 0 0 8px;
    }

    .opaque-content h3:not(:first-child) {
      margin-top: 20px;
    }

    .opaque-content p {
      margin: 0;
    }

    .opaque-content pre {
      max-width: 100%;
      margin: 0;
      padding: 16px;
      overflow: auto;
      border-radius: 8px;
      background: var(--secondary-background-color, #f1f1f1);
      color: var(--primary-text-color);
      font: 12px/1.5 ui-monospace, SFMono-Regular, Consolas, monospace;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }

    .background-colour {
      display: grid;
      gap: 10px;
      margin-top: 18px;
    }

    .deployment {
      margin-top: 18px;
      margin-bottom: 0;
      border-color: color-mix(
        in srgb,
        var(--studio-blue) 35%,
        var(--studio-border)
      );
      background: var(--studio-blue-soft);
    }

    .deployment.failed,
    .deployment.uncertain,
    .deployment.interrupted,
    .deployment.unknown {
      border-color: var(--error-color, #db4437);
      color: var(--error-color, #db4437);
      background: color-mix(
        in srgb,
        var(--error-color, #db4437) 8%,
        var(--studio-card)
      );
    }

    @media (max-width: 900px) {
      .studio {
        grid-template-columns: 170px minmax(0, 1fr);
      }

      .studio.scenes-mode,
      .studio.custom-mode {
        grid-template-columns: 170px minmax(0, 1fr);
      }

      .custom-mode .effect-categories,
      .custom-mode .library {
        grid-column: 2;
      }

      .video-mode .library {
        grid-column: 2;
      }

      .editor {
        grid-column: 2;
      }

      .controls {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 760px) {
      .studio {
        display: block;
      }

      .primary-nav {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
        padding: 10px 16px;
        border-inline-end: 0;
        border-bottom: 1px solid var(--studio-border);
      }

      .device-picker {
        grid-column: 1 / -1;
        margin-top: 4px;
        padding-top: 10px;
        text-align: start;
      }

      .selector {
        text-align: center;
      }

      .library {
        padding-block: 18px;
      }

      .effect-categories .selector {
        text-align: start;
      }

      .library .selector {
        text-align: start;
      }
    }

    @media (max-width: 480px) {
      .notice {
        padding-inline: 16px;
      }

      .button-row {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
      }

      .button-row button:first-child {
        grid-column: 1 / -1;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      * {
        scroll-behavior: auto !important;
      }
    }
  `];var fn=Object.defineProperty,I=(r,e,t,i)=>{for(var s=void 0,n=r.length-1,a;n>=0;n--)(a=r[n])&&(s=a(e,t,s)||s);return s&&fn(e,t,s),s};class C extends P{constructor(){super(...arguments),this.library={library_revision:0,items:[]},this.isAdmin=!1,this.category="all",this.search="",this.name="",this.speedIndex=null,this.loading=!1,this.saving=!1,this.applying=!1,this.editingCopy=!1,this.requestGeneration=0}willUpdate(e){(e.has("device")||e.has("api"))&&(this.invalidateRequests(),this.catalogue=void 0,this.category="all",this.search="",this.selectedScene=void 0,this.selectedItem=void 0,this.content=void 0,this.editingCopy=!1,this.notice=void 0,this.error=void 0,this.loading=!!(this.api&&this.device)),e.has("savedSceneSelection")&&this.savedSceneSelection&&this.synchroniseSavedSelection(this.savedSceneSelection),e.has("library")&&this.selectedItem&&(this.library.items.find(i=>i.id===this.selectedItem?.id)||(this.invalidateRequests(),this.selectedScene=void 0,this.selectedItem=void 0,this.content=void 0,this.editingCopy=!1,this.notice="The selected custom scene was deleted."))}updated(e){if((e.has("device")||e.has("api"))&&this.api&&this.device&&this.loadCatalogue(),e.has("library")&&this.selectedItem){const t=this.library.items.find(i=>i.id===this.selectedItem?.id);t&&t.revision!==this.selectedItem.revision&&(this.sceneDirty?this.notice="This custom scene changed elsewhere. Reload it before saving.":this.selectCustom(t))}}render(){return this.device?this.loading?o`<div class="status" role="status">Loading scenes...</div>`:this.error||!this.catalogue?o`
        <section class="empty">
          <h2>Scenes are unavailable</h2>
          <p role="alert">${this.error??"The scene catalogue could not be loaded."}</p>
        </section>
      `:o`
      <aside
        class="sidebar category-sidebar categories"
        aria-label="Scene categories"
      >
        ${this.sortedCategories.map(e=>this.categoryButton(e.id,e.label))}
      </aside>

      <aside class="sidebar item-sidebar scenes" aria-label="Scenes">
        <label class="scene-search">
          <span class="visually-hidden">Search scenes</span>
          <input
            type="search"
            aria-label="Search scenes"
            placeholder="Search scenes"
            .value=${this.search}
            @input=${e=>{this.search=e.target.value}}
          />
        </label>
        ${this.filteredSceneEntries.map(e=>e.kind==="custom"?this.sceneButton(`custom:${e.item.id}`,e.label,()=>this.selectCustom(e.item)):this.sceneButton(ge(e.scene),e.label,()=>this.selectBuiltin(e.scene)))}
      </aside>

      <section class="editor-surface detail">
        ${this.notice?o`<div class="feedback notice" role="status">${this.notice}</div>`:d}
        ${this.selectedScene&&this.content?this.renderDetail():d}
      </section>
    `:o`
        <section class="empty">
          <h2>No loaded device</h2>
          <p>Load a Govee light before browsing its native scenes.</p>
        </section>
      `}get sortedCategories(){const e=[];return this.catalogue?.scenes.length&&e.push({id:"all",label:"All"}),this.compatibleCustomScenes.length&&e.push({id:"custom",label:"Custom"}),e.push(...this.catalogue?.categories.filter(t=>this.catalogue?.scenes.some(i=>i.category_id===t.id)).map(t=>({id:t.id,label:t.name}))??[]),e.sort((t,i)=>De(t.label,i.label))}get compatibleCustomScenes(){return this.library.items.filter(e=>(e.kind==="scene_builtin"||e.kind==="scene_palette"||e.kind==="scene_layered")&&e.template?.sku===this.catalogue?.sku)}get filteredCustomScenes(){return this.category==="all"||this.category==="custom"?this.compatibleCustomScenes:[]}get filteredBuiltinScenes(){return!this.catalogue||this.category==="custom"?[]:this.category==="all"?this.catalogue.scenes:this.catalogue.scenes.filter(e=>e.category_id===this.category)}get filteredSceneEntries(){const e=this.search.trim().toLocaleLowerCase();return[...this.filteredCustomScenes.map(t=>({kind:"custom",item:t,label:t.name})),...this.filteredBuiltinScenes.map(t=>({kind:"builtin",scene:t,label:t.display_name}))].filter(t=>!e||t.label.toLocaleLowerCase().includes(e)).sort((t,i)=>De(t.label,i.label))}get selectionKey(){return this.selectedItem?`custom:${this.selectedItem.id}`:this.selectedScene?ge(this.selectedScene):void 0}categoryButton(e,t){const i=this.category===e;return o`
      <button
        class="selector ${i?"selected":""}"
        type="button"
        aria-current=${i?"page":d}
        @click=${()=>this.selectCategory(e)}
      >
        ${t}
      </button>
    `}sceneButton(e,t,i){const s=this.selectionKey===e;return o`
      <button
        class="selector scene ${s?"selected":""}"
        type="button"
        aria-pressed=${s}
        @click=${i}
      >
        <span>${t}</span>
      </button>
    `}renderDetail(){const e=this.selectedScene,t=e.speed,i=this.speedIndex??t?.default_index??0,s=this.selectedItem!==void 0||this.editingCopy,n=this.content?.kind==="scene_layered",a=this.selectedItem===void 0&&!this.editingCopy,l=this.selectedItem===void 0&&this.editingCopy,c=!this.name.trim()||this.selectedItem!==void 0&&!this.sceneDirty,p=!a&&this.content?.kind!=="scene_builtin"&&(this.selectedItem===void 0||this.sceneDirty),b=!!((!a||this.catalogue?.enabled)&&(!p||this.name.trim()));return o`
      <header class="editor-heading">
        <div>
          ${s?o`
                <input
                  class="editor-name"
                  aria-label="Scene name"
                  maxlength="128"
                  .value=${this.name}
                  ?disabled=${!this.isAdmin}
                  @input=${_=>{this.name=_.target.value}}
                />
              `:o`<h2>${e.display_name}</h2>`}
        </div>
        <div class="actions">
          <button
            class=${n||a?"secondary":"primary"}
            type="button"
            ?disabled=${!this.isAdmin||this.saving||this.applying||!this.hasCurrentSceneContent()||!n&&s&&c}
            @click=${n||a?this.edit:this.save}
          >
            ${this.saving?"Saving...":n||a?"Edit":l?"Save as Custom":"Save"}
          </button>
          <button
            class="primary"
            type="button"
            ?disabled=${!this.isAdmin||!b||!this.hasCurrentSceneContent()||this.saving||this.applying}
            @click=${this.apply}
          >
            ${this.applying?"Applying...":"Apply"}
          </button>
          ${this.selectedItem?o`
                <button
                  class="danger"
                  type="button"
                  ?disabled=${!this.isAdmin||this.saving||this.applying}
                  @click=${this.requestDelete}
                >
                  Delete
                </button>
              `:d}
        </div>
      </header>

      ${this.catalogue?.enabled?d:o`
            <div class="feedback callout" role="note">
              Native scenes are disabled for this device in the integration
              options. Browsing and saving copies remain available.
            </div>
          `}

      ${t||this.content?.kind==="scene_palette"?this.renderParameters(t,i):d}
    `}renderParameters(e,t){const i=this.content?.kind==="scene_palette"?this.content:void 0;return o`
      <div class="card scene-parameters">
        <div class="parameter-list">
          ${e?o`
                <govee-segmented-control
                  .label=${"Speed"}
                  .value=${t}
                  .options=${gn(e.option_count,e.default_index)}
                  .disabled=${!this.isAdmin}
                  @value-changed=${s=>{this.speedIndex=s.detail.value}}
                ></govee-segmented-control>
              `:d}
          ${i?this.renderPaletteParameters(i):d}
        </div>
      </div>
    `}renderPaletteParameters(e){return o`
      <dl class="parameter-summary">
        <div>
          <dt>Layout</dt>
          <dd>${e.layout}</dd>
        </div>
        <div>
          <dt>Brightness flag</dt>
          <dd>${e.brightness_flag?"Set":"Clear"}</dd>
        </div>
        <div>
          <dt>Steps</dt>
          <dd>${e.steps.length}</dd>
        </div>
      </dl>
      ${e.palette.length>0?o`
            <section class="parameter-entry visual-parameter">
              <span class="parameter-label">Palette</span>
              <div class="scene-palette" role="list" aria-label="Scene palette">
                ${e.palette.map((t,i)=>o`
                  <span
                    role="listitem"
                    style="--scene-colour: ${S(t)}"
                    aria-label="Colour ${i+1}, ${S(t)}"
                  ></span>
                `)}
              </div>
            </section>
          `:d}
      <section class="parameter-entry visual-parameter">
        <span class="parameter-label">Sequence</span>
        <ol class="scene-steps" aria-label="Ordered scene steps">
          ${e.steps.map((t,i)=>o`
            <li>
              <span class="step-order">${i+1}</span>
              <span
                class="step-colour"
                style="--scene-colour: ${S(t.colour)}"
                aria-label="Step colour ${S(t.colour)}"
              ></span>
              <span>
                <strong>Raw value ${t.value}</strong>
                <small>Step colour ${S(t.colour)}</small>
                ${t.inline_colour?o`
                      <small>
                        Inline colour ${S(t.inline_colour)}
                      </small>
                    `:d}
              </span>
            </li>
          `)}
        </ol>
      </section>
    `}async loadCatalogue(){if(!this.api||!this.device)return;const e=this.beginRequest();this.loading=!0,this.error=void 0,this.notice=void 0,this.selectedScene=void 0,this.selectedItem=void 0,this.content=void 0;try{const t=await e.api.sceneCatalogue(e.deviceId);if(!this.requestIsCurrent(e))return;this.catalogue=t,this.category="all"}catch(t){this.requestIsCurrent(e)&&(this.error=B(t))}finally{this.requestIsCurrent(e)&&(this.loading=!1)}}selectCategory(e){this.invalidateRequests(),this.category=e,this.selectedScene=void 0,this.selectedItem=void 0,this.content=void 0,this.editingCopy=!1,this.notice=void 0}async selectBuiltin(e){if(!this.api||!this.device)return;const t=ge(e),i=this.beginRequest(t);this.notice=void 0,this.selectedScene=e,this.selectedItem=void 0,this.editingCopy=!1,this.content=void 0,this.name=e.display_name,this.speedIndex=e.speed?.default_index??null;try{const s=await i.api.sceneDetail(i.deviceId,e.scene_id,e.effect_id);if(!this.requestIsCurrent(i)||ge(s.scene)!==t)return;this.selectedScene=s.scene,this.content=s.content,this.name=s.scene.display_name,this.speedIndex=s.content.speed_index}catch(s){this.requestIsCurrent(i)&&(this.notice=B(s))}}async selectCustom(e){if(!this.api||!this.device||!this.catalogue)return;const t=this.catalogue,i=this.beginRequest(`custom:${e.id}`);this.notice=void 0,this.selectedScene=void 0,this.selectedItem=void 0,this.editingCopy=!1,this.content=void 0,this.name=e.name;try{const s=await i.api.item(e.id);if(!this.requestIsCurrent(i))return;if(s.content.kind!=="scene_builtin"&&s.content.kind!=="scene_palette"&&s.content.kind!=="scene_layered")throw new Error("This custom scene uses an unsupported definition.");const n=s.content;if(n.template.sku!==t.sku)throw new Error(`This custom scene targets ${n.template.sku}, not ${t.sku}.`);const a=t.scenes.find(c=>c.scene_id===n.template.scene_id&&c.effect_id===n.template.effect_id);if(!a)throw new Error("The source scene is not in this device catalogue.");const l=await i.api.sceneDetail(i.deviceId,n.template.scene_id,n.template.effect_id);if(!this.requestIsCurrent(i)||ge(l.scene)!==ge(a))return;this.commitCustomSelection(s,a,n)}catch(s){this.requestIsCurrent(i)&&(this.notice=B(s))}}synchroniseSavedSelection(e){const t=e.content;if(this.selectedItem?.id!==e.id||!this.catalogue||t.kind!=="scene_builtin"&&t.kind!=="scene_palette"&&t.kind!=="scene_layered"||t.template.sku!==this.catalogue.sku)return;const i=this.catalogue.scenes.find(s=>s.scene_id===t.template.scene_id&&s.effect_id===t.template.effect_id);i&&(this.requestGeneration+=1,this.activeSelectionIdentity=`custom:${e.id}`,this.commitCustomSelection(e,i,t),this.notice=void 0)}commitCustomSelection(e,t,i){const s=vn(i);this.selectedScene=t,this.selectedItem=e,this.editingCopy=!1,this.content=s,this.name=e.name,this.speedIndex=s.speed_index??t.speed?.default_index??null}async save(){if(!this.api||!this.device||!this.catalogue||!this.selectedScene||!this.content||!this.hasCurrentSceneContent()||this.content.kind!=="scene_builtin"&&this.content.kind!=="scene_palette"||!this.isAdmin||this.saving||this.applying)return;const e=this.name.trim();if(!e){this.notice="Give this custom scene a name before saving.";return}const t=this.content.kind==="scene_palette"?Je({...this.content,speed_index:this.speedIndex}):{...this.content,speed_index:this.speedIndex},i=this.captureRequest();this.saving=!0,this.notice=void 0;try{const s=this.selectedItem?await this.api.updateItem(this.selectedItem,e,t,this.library.library_revision):await this.api.createItem(e,t,this.library.library_revision);if(s.item.content.kind!=="scene_builtin"&&s.item.content.kind!=="scene_palette")throw new Error("The saved scene returned an unsupported definition.");if(this.dispatchEvent(new CustomEvent("library-item-saved",{detail:{item:s.item,library_revision:s.library_revision},bubbles:!0,composed:!0})),!this.requestIsCurrent(i))return;this.requestGeneration+=1,this.activeSelectionIdentity=`custom:${s.item.id}`,this.selectedItem=s.item,this.editingCopy=!1,this.content=s.item.content,this.name=s.item.name,this.category="custom",this.notice="Custom scene saved."}catch(s){this.requestIsCurrent(i)&&(this.notice=At(s)==="conflict"?"The library changed elsewhere. Reload the scene before saving.":`Save failed: ${B(s)}`)}finally{this.saving=!1}}edit(){if(!(!this.isAdmin||!this.selectedScene||!this.hasCurrentSceneContent())){if(this.selectedScene.scene_type===2&&this.content?.kind==="scene_layered"){this.dispatchSceneEdit();return}this.editingCopy=!0,this.name=`${this.selectedScene.display_name} copy`,this.notice=void 0}}dispatchSceneEdit(){!this.selectedScene||this.content?.kind!=="scene_layered"||this.dispatchEvent(new CustomEvent("scene-edit-selected",{detail:{content:le({...this.content,speed_index:this.speedIndex}),config_entry_id:this.device.config_entry_id,...this.selectedItem?{item:this.selectedItem}:{},name:this.selectedItem?.name??`${this.selectedScene.display_name} copy`},bubbles:!0,composed:!0}))}async apply(){if(!this.api||!this.device||!this.selectedScene||!this.hasCurrentSceneContent()||!this.isAdmin||!this.catalogue?.enabled&&this.selectedItem===void 0&&!this.editingCopy||this.saving||this.applying)return;const e=this.captureRequest(),t=this.selectedScene,i=this.speedIndex,s=this.selectedItem===void 0&&!this.editingCopy,n=this.content.kind==="scene_palette"?Je({...this.content,speed_index:i}):this.content.kind==="scene_layered"?le({...this.content,speed_index:i}):{...this.content,speed_index:i},a=!s&&n.kind!=="scene_builtin"&&(this.selectedItem===void 0||this.sceneDirty),l=this.name.trim();if(a&&!l){this.notice="Give this custom scene a name before applying it.";return}this.applying=!0,this.notice=void 0;try{s||n.kind==="scene_builtin"?await e.api.applyScene(e.deviceId,t,i):a?await e.api.applySnapshot(e.deviceId,l,n):await e.api.applySaved(e.deviceId,this.selectedItem)}catch(c){this.requestIsCurrent(e)&&(this.notice=`Apply failed: ${B(c)}`)}finally{this.applying=!1}}beginRequest(e){return this.requestGeneration+=1,this.activeSelectionIdentity=e,this.captureRequest()}captureRequest(){return{generation:this.requestGeneration,api:this.api,deviceId:this.device.config_entry_id,category:this.category,selectionIdentity:this.activeSelectionIdentity}}invalidateRequests(){this.requestGeneration+=1,this.activeSelectionIdentity=void 0}requestIsCurrent(e){return e.generation===this.requestGeneration&&e.api===this.api&&e.deviceId===this.device?.config_entry_id&&e.category===this.category&&e.selectionIdentity===this.activeSelectionIdentity}hasCurrentSceneContent(){return!this.catalogue||!this.selectedScene||!this.content||this.content.template.sku!==this.catalogue.sku||this.content.template.scene_id!==this.selectedScene.scene_id||this.content.template.effect_id!==this.selectedScene.effect_id?!1:this.activeSelectionIdentity===this.selectionKey}get sceneDirty(){if(!this.selectedItem||!this.content)return!0;const e=this.content.kind==="scene_palette"?Je({...this.content,speed_index:this.speedIndex}):this.content.kind==="scene_layered"?le({...this.content,speed_index:this.speedIndex}):{...this.content,speed_index:this.speedIndex};return this.name.trim()!==this.selectedItem.name||JSON.stringify(e)!==JSON.stringify(this.selectedItem.content)}requestDelete(e){if(!this.selectedItem||!this.isAdmin)return;const t=e.currentTarget;this.dispatchEvent(new CustomEvent("library-item-delete-requested",{detail:{id:this.selectedItem.id,revision:this.selectedItem.revision,name:this.selectedItem.name,returnFocus:t},bubbles:!0,composed:!0})),t.blur()}static{this.styles=[R,ue,zt,ji,Gi,Wi,Y,jt,Yi,w`
    :host {
      display: contents;
    }

    :host([hidden]) {
      display: none !important;
    }

    h2,
    p {
      margin-top: 0;
    }

    h2 {
      margin-bottom: 0;
      font-size: 20px;
    }

    .scene-search {
      display: block;
      margin-bottom: 12px;
    }

    .scene-search input {
      width: 100%;
      min-height: var(--studio-control-height);
      padding: 8px 11px;
      border: 1px solid var(--studio-border);
      border-radius: var(--studio-control-radius);
      color: var(--primary-text-color);
      background: var(--studio-card);
    }

    .empty {
      max-width: 680px;
      padding: 28px;
      border: 1px solid var(--studio-border);
      border-radius: 10px;
      background: var(--studio-card);
      line-height: 1.55;
    }

    .scene-parameters {
      margin-top: 18px;
    }

    .parameter-summary {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
      margin: 0;
    }

    .parameter-summary div {
      padding: 10px;
      border: 1px solid var(--studio-border);
      border-radius: 8px;
    }

    .parameter-summary dt,
    .parameter-summary dd {
      margin: 0;
    }

    .parameter-summary dt {
      color: var(--studio-muted);
      font-size: 12px;
    }

    .parameter-summary dd {
      margin-top: 4px;
      font-weight: 700;
    }

    .parameter-list {
      display: grid;
      gap: 12px;
    }

    .parameter-entry {
      padding: 14px;
      border: 1px solid var(--studio-border);
      border-radius: 8px;
      background: color-mix(
        in srgb,
        var(--primary-background-color) 58%,
        var(--studio-card)
      );
    }

    .visual-parameter {
      display: grid;
      gap: 12px;
    }

    .scene-palette {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .scene-palette span,
    .step-colour {
      display: block;
      width: 32px;
      height: 32px;
      border: 1px solid
        color-mix(in srgb, var(--scene-colour) 70%, #000);
      border-radius: 6px;
      background: var(--scene-colour);
    }

    .scene-steps {
      display: grid;
      gap: 8px;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .scene-steps li {
      display: grid;
      grid-template-columns: auto auto minmax(0, 1fr);
      align-items: center;
      gap: 10px;
    }

    .step-order {
      width: 24px;
      color: var(--studio-muted);
      text-align: end;
    }

    .scene-steps small {
      display: block;
      color: var(--studio-muted);
    }

    .notice {
      border-color: color-mix(
        in srgb,
        var(--studio-blue) 35%,
        var(--studio-border)
      );
      background: var(--studio-blue-soft);
    }

    .empty p {
      margin-bottom: 0;
      color: var(--studio-muted);
      line-height: 1.5;
    }

    .status {
      grid-column: 2 / -1;
      padding: 48px 28px;
    }

    @media (max-width: 900px) {
      :host {
        display: block;
      }

    }

    @media (max-width: 600px) {
      .parameter-summary {
        grid-template-columns: 1fr;
      }
    }
  `]}}I([h({attribute:!1})],C.prototype,"api");I([h({attribute:!1})],C.prototype,"device");I([h({attribute:!1})],C.prototype,"library");I([h({type:Boolean})],C.prototype,"isAdmin");I([h({attribute:!1})],C.prototype,"savedSceneSelection");I([m()],C.prototype,"catalogue");I([m()],C.prototype,"category");I([m()],C.prototype,"search");I([m()],C.prototype,"selectedScene");I([m()],C.prototype,"selectedItem");I([m()],C.prototype,"content");I([m()],C.prototype,"name");I([m()],C.prototype,"speedIndex");I([m()],C.prototype,"loading");I([m()],C.prototype,"saving");I([m()],C.prototype,"applying");I([m()],C.prototype,"editingCopy");I([m()],C.prototype,"notice");I([m()],C.prototype,"error");function ge(r){return`builtin:${r.scene_id}:${r.effect_id}`}function gn(r,e){return Array.from({length:r},(t,i)=>({value:i,label:bn(i,e)}))}function bn(r,e){const t=r-e;if(t===0)return"Default";const i=Math.abs(t);return`${i} ${i===1?"step":"steps"} ${t<0?"lower":"higher"}`}function Je(r){return{...r,template:{...r.template},steps:r.steps.map(e=>({...e,colour:[...e.colour],inline_colour:e.inline_colour===null?null:[...e.inline_colour]})),palette:r.palette.map(e=>[...e])}}function vn(r){return r.kind==="scene_palette"?Je(r):r.kind==="scene_layered"?le(r):{...r,template:{...r.template}}}customElements.get("govee-scene-browser")||customElements.define("govee-scene-browser",C);var yn=Object.defineProperty,ii=(r,e,t,i)=>{for(var s=void 0,n=r.length-1,a;n>=0;n--)(a=r[n])&&(s=a(e,t,s)||s);return s&&yn(e,t,s),s};const _n=[{value:"movie",label:"Movie"},{value:"game",label:"Game"}],$n=[{value:!0,label:"Full screen"},{value:!1,label:"Part screen"}],xn=[{key:"left",label:"Left"},{key:"top",label:"Top"},{key:"right",label:"Right"},{key:"bottom",label:"Bottom"}];function gs(r){const e=[r.left,r.top,r.right,r.bottom];return e.every(t=>t===e[0])?e[0]:void 0}function kn(r){const e=gs(r);return e!==void 0?e:k((r.left+r.top+r.right+r.bottom)/4,1,100)}function wn(r){const e=k(r,1,100);return{left:e,top:e,right:e,bottom:e}}class pt extends P{constructor(){super(...arguments),this.disabled=!1,this.showModeSelector=!0}render(){if(!this.content)return o`
        <section class="card empty-state" role="status">
          <h3 class="section-title">Video profile unavailable</h3>
          <p class="muted">
            Load an H6199 video profile to edit video-sync settings.
          </p>
        </section>
      `;const e=this.content.relative_brightness,t=gs(e)===void 0,i=kn(e);return o`
      <div class="editor-grid">
        <section class="card">
          <div class="parameter-stack">
            ${this.showModeSelector?this.renderSegmentedField("Mode",this.content.mode,_n,s=>this.updateContent(n=>{n.mode=s})):d}
            ${this.renderSegmentedField("Capture area",this.content.full_screen,$n,s=>this.updateContent(n=>{n.full_screen=s}))}
            ${this.renderCheckboxField("Sound effects",this.content.sound_effects,s=>this.updateContent(n=>{n.sound_effects=s}))}
            ${this.content.sound_effects?this.renderRangeField("Softness",this.content.sound_effects_softness,1,100,String(this.content.sound_effects_softness),s=>this.updateContent(n=>{n.sound_effects_softness=k(s,1,100)})):d}
            ${this.renderCheckboxField("Blank screen",this.content.blank_screen,s=>this.updateContent(n=>{n.blank_screen=s}))}
          </div>
        </section>

        <section class="card">
          <h3 class="section-title">Image</h3>
          <div class="parameter-stack">
            ${this.renderRangeField("Saturation",this.content.saturation,0,100,`${this.content.saturation}%`,s=>this.updateContent(n=>{n.saturation=k(s,0,100)}))}
            ${this.renderWhiteBalanceField(this.content.white_balance_position)}
          </div>
        </section>

        <section class="card brightness-card">
          <div class="card-heading">
            <h3 class="section-title">Relative brightness</h3>
            ${t?o`<span class="status-chip">Mixed edges</span>`:d}
          </div>
          <div class="parameter-stack">
            ${this.renderRangeField("Uniform brightness",i,1,100,`${i}%`,s=>this.updateContent(n=>{n.relative_brightness=wn(s)}),t?"relative-brightness-note":void 0)}
            ${t?o`
                  <p class="section-note muted" id="relative-brightness-note">
                    Edges differ.  Adjust Uniform brightness to align all four
                    sides, or adjust them around the screen.
                  </p>
                `:d}
            <div
              class="screen-brightness"
              role="group"
              aria-label="Screen edge brightness"
            >
              ${this.renderScreenEdgeControl("top","Top",e.top)}
              ${this.renderScreenEdgeControl("left","Left",e.left)}
              <div class="virtual-screen" aria-hidden="true">
                ${xn.map(({key:s})=>o`
                    <span
                      class="screen-edge screen-edge-${s}"
                      style=${`--edge-level: ${e[s]/100}`}
                    ></span>
                  `)}
                <div class="screen-image">
                  <span>Screen</span>
                </div>
                <div class="screen-stand"></div>
              </div>
              ${this.renderScreenEdgeControl("right","Right",e.right)}
              ${this.renderScreenEdgeControl("bottom","Bottom",e.bottom)}
            </div>
          </div>
        </section>
      </div>
    `}renderSegmentedField(e,t,i,s){return o`
      <govee-segmented-control
        .label=${e}
        .value=${t}
        .options=${i}
        .disabled=${this.disabled}
        @value-changed=${n=>s(n.detail.value)}
      ></govee-segmented-control>
    `}renderCheckboxField(e,t,i){return o`
      <govee-checkbox-control
        .label=${e}
        .checked=${t}
        .disabled=${this.disabled}
        @checked-changed=${s=>i(s.detail.checked)}
      ></govee-checkbox-control>
    `}renderRangeField(e,t,i,s,n,a,l){return o`
      <govee-slider-control
        .label=${e}
        .value=${t}
        .minimum=${i}
        .maximum=${s}
        .valueText=${n}
        .describedBy=${l}
        .disabled=${this.disabled}
        @value-changed=${c=>a(c.detail.value)}
      ></govee-slider-control>
    `}renderWhiteBalanceField(e){return o`
      <label class="range-field white-balance-field">
        <span class="parameter-label">White balance</span>
        <div class="slider-with-endpoints">
          <input
            type="range"
            min="1"
            max="20"
            .value=${String(k(e,1,20))}
            aria-label="White balance"
            ?disabled=${this.disabled}
            @input=${t=>this.updateContent(i=>{i.white_balance_position=k(Number(t.target.value),1,20)})}
          />
          <div class="endpoint-labels" aria-hidden="true">
            <span>Cool</span>
            <span>Warm</span>
          </div>
        </div>
        <output aria-label="White balance value">${e}</output>
      </label>
    `}renderScreenEdgeControl(e,t,i){return o`
      <label class="screen-edge-control edge-control-${e}">
        <span class="parameter-label">${t}</span>
        <input
          type="range"
          min="1"
          max="100"
          .value=${String(i)}
          aria-label=${t}
          ?disabled=${this.disabled}
          @input=${s=>this.updateRelativeBrightnessEdge(e,Number(s.target.value))}
        />
        <output aria-label="${t} value">${i}%</output>
      </label>
    `}updateRelativeBrightnessEdge(e,t){this.updateContent(i=>{i.relative_brightness[e]=k(t,1,100)})}updateContent(e){if(!this.content)return;const t=st(this.content);e(t),this.emitContent(t)}emitContent(e){this.dispatchEvent(new CustomEvent("content-changed",{detail:{content:st(e)},bubbles:!0,composed:!0}))}static{this.styles=[R,ue,Y,w`
      :host {
        display: block;
        color: var(--primary-text-color);
      }

      p {
        margin-top: 0;
      }

      .editor-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: var(--studio-section-gap);
      }

      .brightness-card {
        grid-column: 1 / -1;
      }

      .muted,
      .endpoint-labels {
        color: var(--studio-muted);
        font-size: 13px;
        line-height: 1.45;
      }

      .section-note {
        margin: -6px 0 0;
      }

      .screen-brightness {
        display: grid;
        grid-template:
          ". top ." auto
          "left screen right" minmax(220px, 1fr)
          ". bottom ." auto
          / 72px minmax(260px, 560px) 72px;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 12px 0 20px;
      }

      .virtual-screen {
        position: relative;
        grid-area: screen;
        width: 100%;
        aspect-ratio: 16 / 10;
        padding: 10px;
        border: 1px solid color-mix(in srgb, var(--studio-muted) 55%, transparent);
        border-radius: 14px;
        background: #181b22;
        box-shadow:
          0 18px 34px rgb(15 23 42 / 18%),
          inset 0 0 0 1px rgb(255 255 255 / 6%);
      }

      .screen-image {
        display: grid;
        width: 100%;
        height: 100%;
        place-items: center;
        overflow: hidden;
        border-radius: 7px;
        color: rgb(255 255 255 / 62%);
        background:
          radial-gradient(circle at 72% 24%, rgb(64 186 255 / 42%), transparent 31%),
          radial-gradient(circle at 25% 72%, rgb(126 87 255 / 38%), transparent 36%),
          linear-gradient(145deg, #24334b, #101724 62%, #1e1633);
        font-size: 13px;
        font-weight: 650;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .screen-stand {
        position: absolute;
        bottom: -18px;
        left: 50%;
        width: 28%;
        height: 14px;
        border-bottom: 4px solid #353b47;
        transform: translateX(-50%);
      }

      .screen-stand::before {
        position: absolute;
        top: 0;
        left: 50%;
        width: 4px;
        height: 12px;
        background: #353b47;
        content: "";
        transform: translateX(-50%);
      }

      .screen-edge {
        position: absolute;
        z-index: 1;
        border-radius: 999px;
        background: rgb(67 168 255);
        box-shadow:
          0 0 8px 2px rgb(67 168 255 / 72%),
          0 0 20px 5px rgb(67 168 255 / 34%);
        opacity: calc(0.12 + var(--edge-level) * 0.88);
        pointer-events: none;
      }

      .screen-edge-top,
      .screen-edge-bottom {
        right: 16px;
        left: 16px;
        height: 5px;
      }

      .screen-edge-top {
        top: 3px;
      }

      .screen-edge-bottom {
        bottom: 3px;
      }

      .screen-edge-left,
      .screen-edge-right {
        top: 16px;
        bottom: 16px;
        width: 5px;
      }

      .screen-edge-left {
        left: 3px;
      }

      .screen-edge-right {
        right: 3px;
      }

      .screen-edge-control {
        display: grid;
        align-items: center;
        gap: 8px;
        min-width: 0;
        font-variant-numeric: tabular-nums;
      }

      .screen-edge-control input {
        min-width: 0;
      }

      .screen-edge-control output {
        color: var(--studio-muted);
        font-size: 13px;
        font-weight: 600;
        text-align: end;
      }

      .edge-control-top,
      .edge-control-bottom {
        grid-template-columns: 48px minmax(120px, 1fr) 44px;
      }

      .edge-control-top input,
      .edge-control-bottom input {
        min-height: var(--studio-control-height);
      }

      .edge-control-top {
        grid-area: top;
      }

      .edge-control-bottom {
        grid-area: bottom;
      }

      .edge-control-left,
      .edge-control-right {
        grid-template-rows: auto minmax(130px, 1fr) auto;
        justify-items: center;
        height: 100%;
      }

      .edge-control-left {
        grid-area: left;
      }

      .edge-control-right {
        grid-area: right;
      }

      .edge-control-left input,
      .edge-control-right input {
        width: var(--studio-control-height);
        height: 100%;
        writing-mode: vertical-lr;
        direction: rtl;
      }

      .edge-control-left output,
      .edge-control-right output {
        text-align: center;
      }

      .card-heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 14px;
      }

      .card-heading h3 {
        margin-bottom: 0;
      }

      .range-field {
        grid-template-columns: minmax(118px, auto) minmax(0, 1fr) 64px;
        align-items: center;
        gap: 10px;
        margin-top: 0;
        font-variant-numeric: tabular-nums;
      }

      .range-field input[type="range"] {
        width: 100%;
        min-width: 0;
      }

      .white-balance-field {
        align-items: start;
      }

      .slider-with-endpoints {
        display: grid;
        gap: 6px;
        min-width: 0;
      }

      .endpoint-labels {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        font-weight: 600;
      }

      .status-chip {
        padding: 4px 9px;
        border-radius: 999px;
        color: var(--studio-blue);
        background: var(--studio-blue-soft);
        font-size: 12px;
        font-weight: 650;
        white-space: nowrap;
      }

      .empty-state h3,
      .empty-state p {
        margin-bottom: 0;
      }

      .empty-state h3 {
        margin-bottom: 8px;
      }

      @media (max-width: 760px) {
        .editor-grid {
          grid-template-columns: 1fr;
        }

        .brightness-card {
          grid-column: auto;
        }
      }

      @media (max-width: 560px) {
        .range-field {
          grid-template-columns: 1fr;
        }

        .range-field output {
          text-align: start;
        }

        .screen-brightness {
          grid-template:
            ". top ." auto
            "left screen right" minmax(160px, 1fr)
            ". bottom ." auto
            / 52px minmax(160px, 1fr) 52px;
          gap: 8px;
        }

        .edge-control-top,
        .edge-control-bottom {
          grid-template-columns: minmax(0, 1fr) 42px;
        }

        .edge-control-top .parameter-label,
        .edge-control-bottom .parameter-label {
          grid-column: 1 / -1;
        }

        .edge-control-left,
        .edge-control-right {
          grid-template-rows: auto minmax(90px, 1fr) auto;
        }
      }
    `]}}ii([h({attribute:!1})],pt.prototype,"content");ii([h({type:Boolean})],pt.prototype,"disabled");ii([h({type:Boolean})],pt.prototype,"showModeSelector");customElements.get("govee-video-profile-editor")||customElements.define("govee-video-profile-editor",pt);var Sn=Object.defineProperty,x=(r,e,t,i)=>{for(var s=void 0,n=r.length-1,a;n>=0;n--)(a=r[n])&&(s=a(e,t,s)||s);return s&&Sn(e,t,s),s};class y extends P{constructor(){super(...arguments),this.showDevicePicker=!1,this.loading=!0,this.devices=[],this.section="custom",this.customEffectCategory="all",this.customCopyStarted=!1,this.library={library_revision:0,items:[]},this.name="",this.content=ve(),this.paintBrushes=Re(),this.selectedPaintBrush=0,this.brushUsesBackground=!1,this.saving=!1,this.saveNameDialogOpen=!1,this.saveNameValue="",this.applying=!1,this.deployments=[],this.editorTransitionEpoch=0,this.loadEpoch=0,this.deploymentRevision=-1}get isAdmin(){return this.hass?.user?.is_admin===!0}get modalOpen(){return this.saveNameDialogOpen||this.deleteCandidate!==void 0}get selectedDevice(){return this.devices.find(e=>e.config_entry_id===this.selectedDeviceId)}get selectedModel(){const e=this.selectedDevice?.model;return e==="H617A"||e==="H6199"?e:void 0}get editorReadOnly(){return!this.isAdmin||this.templateSourceLabel!==void 0}get modelCatalogue(){const e=this.selectedModel;return e?this.customCatalogue?.models[e]:void 0}get videoAvailable(){return!!this.modelCatalogue?.video_modes.length}get customEffectsAvailable(){const e=this.modelCatalogue;return!!(e&&(e.painted_effects.length||e.effects.length||e.music_modes.length||e.supports.advanced!=="unsupported"))}get dirty(){return ae(this.content)?this.savedBaseline!==Q(this.name,this.content):!1}get applyCapability(){if(!wt(this.content))return;const e=this.selectedDevice;if(e)switch(this.content.kind){case"h617a_painted":return e.custom_effects.painted;case"h617a_single":return e.custom_effects.single;case"h617a_multi":return e.custom_effects.multi;case"palette_diy":return e.custom_effects.palette_diy;case"advanced":case"scene_layered":return e.custom_effects.advanced;case"music_profile":return e.profiles.music;case"video_profile":return e.profiles.video;case"workshop":return e.custom_effects.workshop;case"special_diy":return e.custom_effects.special_diy}}get canApply(){return wt(this.content)&&this.isAdmin&&!this.applying&&!this.saving&&!this.deletingCurrentItem&&this.name.trim().length>0&&this.applyCapability==="supported"}get deletingCurrentItem(){return this.deletingItemId!==void 0&&this.currentItem?.id===this.deletingItemId}get activeDeployment(){const e=this.deployments.find(t=>t.operation_id===this.activeOperationId);return e||!this.applying?e:this.latestDeployment(bt)}connectedCallback(){super.connectedCallback(),this.hass&&!this.api&&this.load()}disconnectedCallback(){this.releaseModalScrollLock(),super.disconnectedCallback(),this.loadEpoch+=1,this.beginEditorTransition(),this.stopSubscriptions(),this.api=void 0}updated(e){e.has("hass")&&this.hass&&!this.api&&this.load(),this.syncModalScrollLock(),this.syncSingleEffectSelects()}render(){return this.loading?o`<div class="centred" role="status">Loading effect studio...</div>`:this.error?this.renderFatalError():o`
      <h1 class="visually-hidden">Effect Studio</h1>

      ${this.notice?o`<div class="notice" role="status">${this.notice}</div>`:d}

      <main
        class="studio ${this.section}-mode"
        ?inert=${this.modalOpen}
      >
        <nav class="primary-nav" aria-label="Create">
          ${this.videoAvailable?this.navButton("video","Video"):d}
          ${this.navButton("scenes","Scenes")}
          ${this.customEffectsAvailable?this.navButton("custom","Effects"):d}
          ${this.showDevicePicker?this.renderDevicePicker():d}
        </nav>

        <govee-scene-browser
          ?hidden=${this.section!=="scenes"}
          .api=${this.api}
          .device=${this.selectedDevice}
          .library=${this.library}
          .isAdmin=${this.isAdmin}
          .savedSceneSelection=${this.savedSceneSelection}
          @library-item-saved=${this.sceneLibraryItemSaved}
          @library-item-delete-requested=${this.sceneLibraryItemDeleteRequested}
          @scene-edit-selected=${this.sceneTemplateSelected}
        ></govee-scene-browser>
        ${this.section==="video"?this.renderVideo():d}
        ${this.section==="custom"?this.renderCustomEffects():d}
      </main>
      ${this.saveNameDialogOpen?this.renderSaveNameDialog():d}
      ${this.deleteCandidate?this.renderDeleteConfirmation():d}
    `}renderDevicePicker(){return o`
      <div class="device-picker">
        <select
          aria-label="Development device"
          .value=${this.selectedDeviceId??""}
          @change=${this.deviceChanged}
        >
          ${this.devices.map(e=>o`
              <option value=${e.config_entry_id}>
                ${e.display_name} / ${e.model}
              </option>
            `)}
          ${this.selectedDeviceId&&!this.selectedDevice?o`
                <option value=${this.selectedDeviceId} disabled>
                  Device temporarily unavailable
                </option>
              `:d}
        </select>
      </div>
    `}renderFatalError(){return o`
      <main class="fatal">
        <h1>Effect Studio is unavailable</h1>
        <p role="alert">${this.error}</p>
        <p>Existing light controls are unaffected.</p>
        <a href=${this.panel?.config?.configuration_path??"/config/integrations"}>
          Open integration configuration
        </a>
      </main>
    `}navButton(e,t){return o`
      <button
        class="selector ${this.section===e?"selected":""}"
        type="button"
        aria-current=${this.section===e?"page":d}
        @click=${()=>{this.selectSection(e)}}
      >
        ${t}
      </button>
    `}renderCustomEffects(){return o`
      <aside
        class="sidebar category-sidebar effect-categories"
        aria-label="Effect categories"
      >
        ${this.customEffectCategoryButton("all","All")}
        ${this.customEffectCategoryAvailable("music")?this.customEffectCategoryButton("music","Music"):d}
        ${this.customEffectCategoryAvailable("single-layer")?this.customEffectCategoryButton("single-layer","Single Layer"):d}
        ${this.customEffectCategoryAvailable("multi-layer")?this.customEffectCategoryButton("multi-layer","Multi Layer"):d}
        ${this.customEffectCategoryAvailable("advanced")?this.customEffectCategoryButton("advanced","Advanced"):d}
        ${this.customEffectCategoryAvailable("special-diy")?this.customEffectCategoryButton("special-diy","Special DIY"):d}
        ${this.customEffectCategoryAvailable("my-effects")?this.customEffectCategoryButton("my-effects","My effects"):d}
      </aside>

      <aside class="sidebar item-sidebar library" aria-label="Effects">
        ${this.renderNewEffectAction()}
        ${this.customEffectEntries.map(e=>this.customEffectListButton(e))}
      </aside>

      <section class="editor-surface editor">
        ${this.name||this.currentItem?this.renderCurrentCustomEditor():d}
      </section>
    `}renderCurrentCustomEditor(){return Xe(this.content)?this.content.kind==="h617a_painted"?this.renderPaintedEditor():this.renderPaletteEffectEditor():this.content.kind==="palette_diy"||this.content.kind==="special_diy"?this.renderPaletteEffectEditor():this.content.kind==="music_profile"?this.renderMusicProfileEditor():ze(this.content)?this.renderAdvancedEditor():this.content.kind==="opaque"?this.renderOpaqueEditor(this.content):d}renderVideo(){const e=this.modelCatalogue;if(!e||!this.videoAvailable)return d;const t=this.library.items.filter(i=>i.kind==="video_profile"&&this.libraryItemAvailable(i)).sort((i,s)=>De(i.name,s.name));return o`
      <aside class="sidebar item-sidebar library" aria-label="Video profiles">
        ${e.video_modes.map(i=>this.videoListButton(`template:video:${i.id}`,i.label,()=>this.openVideoTemplate(i.id,i.label)))}
        ${t.map(i=>this.videoListButton(`saved:${i.id}`,i.name,()=>{this.selectItem(i.id)},i))}
      </aside>
      <section class="editor-surface editor">
        ${this.content.kind==="video_profile"?this.renderVideoProfileEditor():d}
      </section>
    `}videoListButton(e,t,i,s){const n=s?this.currentItem?.id===s.id:!this.currentItem&&this.customTemplateSelection===e;return o`
      <button
        class="selector item ${n?"selected":""}"
        type="button"
        ?disabled=${!s&&!this.isAdmin}
        @click=${i}
      >
        <span>${t}</span>
      </button>
    `}openVideoTemplate(e,t){this.selectedModel==="H6199"&&this.openEditableTemplate(t,zr(e),`template:video:${e}`)}renderVideoProfileEditor(){return this.content.kind!=="video_profile"?d:o`
      ${this.renderProfileHeading()}
      <govee-video-profile-editor
        .content=${this.content}
        .disabled=${this.editorReadOnly}
        .showModeSelector=${!this.templateSourceLabel}
        @content-changed=${e=>{this.content=st(e.detail.content)}}
      ></govee-video-profile-editor>
      ${this.activeDeployment?this.renderDeployment(this.activeDeployment):d}
    `}renderMusicProfileEditor(){return this.content.kind!=="music_profile"?d:o`
      ${this.renderProfileHeading()}
      <govee-music-profile-editor
        .content=${this.content}
        .catalogue=${this.modelCatalogue}
        .disabled=${this.editorReadOnly}
        .showModeSelector=${!this.templateSourceLabel}
        @content-changed=${e=>{this.content=Te(e.detail.content)}}
      ></govee-music-profile-editor>
      ${this.activeDeployment?this.renderDeployment(this.activeDeployment):d}
    `}renderProfileHeading(){return this.renderEditorHeading(o`
      <button
        class="primary"
        type="button"
        ?disabled=${!this.canApply}
        @click=${this.apply}
      >
        ${this.applying?"Applying...":"Apply"}
      </button>
    `)}get customEffectEntries(){const e=this.modelCatalogue;return[...e?.painted_effects.length?[{kind:"paint",key:"template:paint",label:"Paint",category:"single-layer"}]:[],...e?.music_modes.map(i=>({kind:"music",key:`template:music:${i.id}`,label:i.label,category:"music",mode:i.id}))??[],...e?.effects.filter(i=>i.category==="single_layer").map(i=>({kind:"single",key:`template:single:${i.family}:${i.variations[0].variant}`,label:i.label,category:"single-layer",family:i.family,variant:i.variations[0].variant}))??[],...e?.supports.multi!=="unsupported"?[{kind:"multi",key:"template:mix",label:"Mix",category:"multi-layer"}]:[],...e?.workshop_templates.map(i=>({kind:"workshop",key:`template:workshop:${i.id}`,label:i.label,category:"advanced",content:i.content}))??[],...e?.special_diy_templates.map(i=>({kind:"special_diy",key:`template:special-diy:${i.id}`,label:i.label,category:"special-diy",content:i.content}))??[],{kind:"advanced",key:"template:advanced",label:"Layered",category:"advanced"},...this.library.items.filter(i=>St(i.kind)&&i.kind!=="video_profile").map(i=>({kind:"saved",key:`saved:${i.id}`,label:i.name,category:Qr(i.kind),item:i}))].filter(i=>this.customEffectEntryAvailable(i)).filter(i=>this.customEffectCategory==="all"||this.customEffectCategory==="my-effects"&&i.kind==="saved"||i.category===this.customEffectCategory).sort((i,s)=>De(i.label,s.label))}customEffectEntryAvailable(e){switch(e.kind){case"paint":return this.customEffectKindAvailable("h617a_painted");case"single":return this.customEffectKindAvailable(this.selectedModel==="H617A"?"h617a_single":"palette_diy");case"music":return this.customEffectKindAvailable("music_profile");case"multi":return this.customEffectKindAvailable("h617a_multi");case"advanced":return this.customEffectKindAvailable("advanced");case"workshop":return this.customEffectKindAvailable("workshop");case"special_diy":return this.customEffectKindAvailable("special_diy");case"saved":return this.libraryItemAvailable(e.item)}}libraryItemAvailable(e){const t=this.selectedModel;return e.model!==void 0&&e.model!==t?!1:e.kind==="video_profile"?this.videoAvailable:e.model===void 0&&["h617a_painted","h617a_single","h617a_multi"].includes(e.kind)&&t!=="H617A"?!1:this.customEffectKindAvailable(e.kind)}effectContentAvailable(e){const t=this.selectedModel;return e.kind==="h617a_painted"||e.kind==="h617a_single"||e.kind==="h617a_multi"?t==="H617A":e.kind==="palette_diy"||e.kind==="special_diy"||e.kind==="music_profile"||e.kind==="video_profile"||e.kind==="workshop"?e.model===t:e.kind==="scene_layered"?e.template.sku===t:this.customEffectKindAvailable(e.kind)}customEffectCategoryAvailable(e){switch(e){case"all":return this.customEffectsAvailable;case"music":return!!this.modelCatalogue?.music_modes.length;case"single-layer":return this.customEffectKindAvailable("h617a_painted")||this.customEffectKindAvailable("h617a_single")||this.customEffectKindAvailable("palette_diy");case"multi-layer":return this.customEffectKindAvailable("h617a_multi");case"advanced":return this.customEffectKindAvailable("advanced")||this.customEffectKindAvailable("workshop");case"special-diy":return this.customEffectKindAvailable("special_diy");case"my-effects":return this.library.items.some(t=>t.kind!=="video_profile"&&St(t.kind)&&this.libraryItemAvailable(t))}}customEffectKindAvailable(e){const t=this.modelCatalogue,i=this.selectedModel;return e==="h617a_painted"?i==="H617A"&&!!t?.painted_effects.length:e==="h617a_single"?i==="H617A"&&!!t?.effects.length:e==="palette_diy"?i==="H6199"&&!!t?.effects.length:e==="h617a_multi"?i==="H617A"&&t?.supports.multi!=="unsupported":e==="music_profile"?!!t?.music_modes.length:e==="workshop"?t!==void 0&&t.supports.workshop!=="unsupported"&&!!t.workshop_templates.length:e==="special_diy"?t!==void 0&&t.supports.special_diy!=="unsupported"&&!!t.special_diy_templates.length:t?.supports.advanced!=="unsupported"}customEffectCategoryButton(e,t){const i=this.customEffectCategory===e;return o`
      <button
        class="selector ${i?"selected":""}"
        type="button"
        aria-current=${i?"page":d}
        @click=${()=>{this.customEffectCategory=e}}
      >
        ${t}
      </button>
    `}renderNewEffectAction(){const e=this.newEffectKindForCategory(this.customEffectCategory);return e?o`
      <button
        class="selector item new-effect-action"
        type="button"
        ?disabled=${!this.isAdmin}
        @click=${()=>this.newEffect(e)}
      >
        <span><span class="new-effect-icon" aria-hidden="true"></span>New</span>
      </button>
    `:d}newEffectKindForCategory(e){if(e==="single-layer")return this.customEffectKindAvailable("h617a_single")?"h617a_single":this.customEffectKindAvailable("palette_diy")?"palette_diy":this.customEffectKindAvailable("h617a_painted")?"h617a_painted":void 0;if(e==="multi-layer")return this.customEffectKindAvailable("h617a_multi")?"h617a_multi":void 0;if(e==="advanced")return this.customEffectKindAvailable("advanced")?"advanced":void 0}customEffectListButton(e){const t=e.kind==="saved"?this.currentItem?.id===e.item.id:!this.currentItem&&this.customTemplateSelection===e.key;return o`
      <button
        class="selector item ${t?"selected":""}"
        type="button"
        ?disabled=${e.kind!=="saved"&&!this.isAdmin}
        @click=${()=>this.selectCustomEffectEntry(e)}
      >
        <span>${e.label}</span>
      </button>
    `}renderDeleteConfirmation(){const e=this.deleteCandidate,t=this.currentItem?.id===e.id&&this.dirty;return o`
      <div class="dialog-backdrop" @click=${this.cancelDelete}>
        <section
          class="dialog-card delete-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-effect-title"
          tabindex="-1"
          @click=${i=>i.stopPropagation()}
          @keydown=${this.deleteDialogKeyDown}
        >
          <h2 id="delete-effect-title">Delete effect?</h2>
          <p>
            <strong>${e.name}</strong> will be removed from the shared
            Effect Studio library.
          </p>
          ${t?o`<p>Unsaved changes in the open effect will be discarded.</p>`:d}
          <div class="dialog-actions">
            <button
              class="secondary"
              type="button"
              @click=${this.cancelDelete}
            >
              Cancel
            </button>
            <button
              class="danger"
              type="button"
              @click=${this.confirmDelete}
            >
              Delete effect
            </button>
          </div>
        </section>
      </div>
    `}renderSaveNameDialog(){return o`
      <div class="dialog-backdrop" @click=${this.cancelSaveName}>
        <form
          class="dialog-card save-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="save-effect-title"
          tabindex="-1"
          @click=${e=>e.stopPropagation()}
          @keydown=${this.saveNameDialogKeyDown}
          @submit=${this.confirmNamedSave}
        >
          <h2 id="save-effect-title">Save effect</h2>
          <label class="field">
            <span>Effect name</span>
            <input
              aria-label="Effect name"
              aria-describedby=${this.saveNameError?"save-effect-name-error":d}
              maxlength="128"
              autocomplete="off"
              .value=${this.saveNameValue}
              @input=${e=>{this.saveNameValue=e.target.value,this.saveNameError=void 0}}
            />
          </label>
          ${this.saveNameError?o`
                <p id="save-effect-name-error" class="dialog-error" role="alert">
                  ${this.saveNameError}
                </p>
              `:d}
          <div class="dialog-actions">
            <button
              class="secondary"
              type="button"
              @click=${this.cancelSaveName}
            >
              Cancel
            </button>
            <button class="primary" type="submit">Save effect</button>
          </div>
        </form>
      </div>
    `}selectCustomEffectEntry(e){if(e.kind==="saved"){this.selectItem(e.item.id);return}if(e.kind==="advanced"){this.newEffect("advanced",void 0,{name:e.label,content:mt(),selectionIdentity:e.key,templateLabel:e.label}),this.customTemplateSelection=e.key;return}if(e.kind==="workshop"||e.kind==="special_diy"){this.openEditableTemplate(e.label,e.content,e.key);return}const t=this.modelCatalogue;if(t){if(e.kind==="music"){this.openMusicTemplate(e.mode,e.label);return}if(e.kind==="paint"){this.newEffect("h617a_painted",void 0,{name:e.label,content:ve(),selectionIdentity:e.key,templateLabel:e.label});return}if(e.kind==="single"){if(this.selectedModel==="H617A"){const i=ne("h617a_single",t);this.newEffect("h617a_single",void 0,{name:e.label,content:{...i,family:e.family,variant:e.variant},selectionIdentity:e.key,templateLabel:e.label})}else this.openEditableTemplate(e.label,kt(t,this.selectedModel,e.family,e.variant),e.key);return}this.newEffect("h617a_multi",void 0,{name:e.label,content:ne("h617a_multi",t),selectionIdentity:e.key,templateLabel:e.label})}}openEditableTemplate(e,t,i){this.beginEditorTransition(),this.currentItem=void 0,this.templateSourceLabel=e,this.customCopyStarted=!1,this.customTemplateSelection=i,this.name=e,this.content=Ke(t),this.savedBaseline=void 0,this.notice=void 0}openMusicTemplate(e,t){const i=this.selectedModel;i!=="H617A"&&i!=="H6199"||this.openEditableTemplate(t,{kind:"music_profile",model:i,mode:e,sensitivity:i==="H6199"?100:99,colour:null,calm:["rhythm","bloom","shiny"].includes(e)?!1:null,parameters:{}},`template:music:${e}`)}renderAdvancedEditor(){if(!ze(this.content))return d;const e=this.content.kind==="scene_layered",t=this.activeDeployment;return o`
      ${e?o`
            <button
              class="back-button"
              type="button"
              @click=${this.backToScenes}
            >
              ← Back to Scenes
            </button>
          `:d}
      ${this.renderEditorHeading(o`
          <button
            class="primary"
            type="button"
            ?disabled=${!this.canApply}
            @click=${this.apply}
          >
            ${this.applying?"Applying...":"Apply"}
          </button>
        `)}

      ${this.isAdmin?d:o`
            <div class="feedback read-only" role="note">
              You can inspect shared effects. An administrator is required to
              edit or save them.
            </div>
          `}

      <govee-advanced-effect-editor
        .content=${Yr(this.content)}
        .disabled=${!this.isAdmin}
        .segmentCount=${this.selectedDevice?.segment_count??15}
        @content-changed=${i=>{!ze(this.content)||!this.prepareTemplateEdit()||(this.content=Wr(this.content,i.detail.content))}}
      ></govee-advanced-effect-editor>
      ${t?this.renderDeployment(t):d}
    `}renderOpaqueEditor(e){return o`
      ${this.renderEditorHeading(o`<button class="primary" type="button" disabled>Apply</button>`,{save:!1,title:o`<h2>${this.name}</h2>`})}
      <div class="feedback read-only" role="note">
        This effect definition can be inspected, but this editor cannot change,
        save or apply it.
      </div>
      <section class="card opaque-content">
        <h3 class="section-title">Source kind</h3>
        <p><code>${e.source_kind}</code></p>
        <h3 class="section-title">Preserved content</h3>
        <pre aria-label="Preserved opaque content">${JSON.stringify(e.body,null,2)}</pre>
      </section>
    `}renderPaintedEditor(){if(this.content.kind!=="h617a_painted")return d;const e=this.activeDeployment;return o`
      ${this.renderEditorHeading(o`
        <button
          class="primary"
          type="button"
          ?disabled=${!this.canApply}
          @click=${this.apply}
        >
          ${this.applying?"Applying...":"Apply"}
        </button>
      `)}

      ${this.isAdmin?d:o`
            <div class="feedback read-only" role="note">
              You can inspect shared effects. An administrator is required to
              edit or apply them.
            </div>
          `}

      ${this.renderSingleEffectSelector()}

      <govee-painted-segment-editor
        .colours=${Bt(this.content)}
        .disabled=${this.editorReadOnly}
        @segment-selected=${t=>this.setSegmentColour(t.detail.index)}
      ></govee-painted-segment-editor>

      <div class="controls">
        <section class="card">
          <h3 class="section-title">Brushes</h3>
          <govee-palette-editor
            class="paint-brushes"
            .palette=${this.paintBrushes}
            .minColours=${2}
            .maxColours=${8}
            .disabled=${this.editorReadOnly}
            .persistentPicker=${!0}
            .selectedIndex=${this.selectedPaintBrush}
            ariaLabel="Brushes"
            itemName="brush"
            @palette-changed=${this.paintBrushesChanged}
            @colour-selected=${this.paintBrushSelected}
          ></govee-palette-editor>
          <div class="background-colour">
            <span class="parameter-label">Background</span>
            <govee-colour-picker
              .colour=${this.content.background}
              .disabled=${this.editorReadOnly}
              @colour-changing=${this.backgroundChanged}
              @colour-changed=${this.backgroundChanged}
            ></govee-colour-picker>
          </div>
          <div class="button-row">
            <button
              class="secondary ${this.brushUsesBackground?"active":""}"
              type="button"
              ?disabled=${this.editorReadOnly}
              aria-pressed=${this.brushUsesBackground}
              @click=${()=>{this.brushUsesBackground=!this.brushUsesBackground}}
            >
              Use background
            </button>
            <button
              class="secondary"
              type="button"
              ?disabled=${this.editorReadOnly}
              @click=${this.paintAll}
            >
              Paint all
            </button>
            <button
              class="secondary"
              type="button"
              ?disabled=${this.editorReadOnly}
              @click=${this.resetPaint}
            >
              Reset
            </button>
          </div>
        </section>

        <section class="card">
          <div class="parameter-stack">
            ${this.renderPaintedVariationField()}
            ${this.sliderField("Speed","speed",this.content.speed)}
            ${this.sliderField("Brightness","brightness",this.content.brightness,`${this.content.brightness}%`)}
          </div>
        </section>
      </div>

      ${e?this.renderDeployment(e):d}
    `}renderPaletteEffectEditor(){if(this.content.kind!=="h617a_single"&&this.content.kind!=="h617a_multi"&&this.content.kind!=="palette_diy"&&this.content.kind!=="special_diy")return d;const e=this.content,t=this.activeDeployment;return o`
      ${this.renderEditorHeading(o`
        <button
          class="primary"
          type="button"
          ?disabled=${!this.canApply}
          @click=${this.apply}
        >
          ${this.applying?"Applying...":"Apply"}
        </button>
      `)}

      ${this.isAdmin?d:o`
            <div class="feedback read-only" role="note">
              You can inspect shared effects. An administrator is required to
              edit them.
            </div>
          `}

      ${this.renderSingleEffectSelector()}

      <govee-custom-effect-editor
        .content=${e}
        .catalogue=${this.modelCatalogue}
        .disabled=${this.editorReadOnly}
        @content-changed=${i=>{this.content=i.detail.content.kind==="palette_diy"?us(i.detail.content):i.detail.content.kind==="special_diy"?ps(i.detail.content):cs(i.detail.content)}}
      ></govee-custom-effect-editor>

      ${t?this.renderDeployment(t):d}
    `}renderSingleEffectSelector(){if(!this.customCatalogue||this.templateSourceLabel||this.content.kind!=="h617a_painted"&&this.content.kind!=="h617a_single"&&this.content.kind!=="palette_diy"||this.currentItem?.content.kind==="h617a_painted"&&this.content.kind==="h617a_painted")return d;const e=this.selectedSingleEffectFamily,t=this.currentItem?.content.kind==="h617a_painted"?[]:this.modelCatalogue?.effects.filter(a=>a.category==="single_layer")??[],i=t.some(a=>a.family===e?.family),s=this.content.kind==="h617a_painted"?"paint":e&&i?e.id:`unknown:${this.content.family}`,n=this.customEffectKindAvailable("h617a_painted")&&this.currentItem?.content.kind!=="h617a_single";return o`
      <section class="card single-effect-settings">
        <label class="field">
          <span>Effect</span>
          <select
            aria-label="Effect"
            .value=${s}
            ?disabled=${this.editorReadOnly}
            @change=${this.singleEffectChanged}
          >
            ${(this.content.kind==="h617a_single"||this.content.kind==="palette_diy")&&!i?o`
                  <option value=${s}>
                    Unknown effect ${this.content.family}
                  </option>
                `:d}
            ${n?o`
                  <option
                    value="paint"
                    ?selected=${s==="paint"}
                  >
                    Paint
                  </option>
                `:d}
            ${t.map(a=>o`
                <option
                  value=${a.id}
                  ?selected=${s===a.id}
                >
                  ${a.label}
                </option>
              `)}
          </select>
        </label>
      </section>
    `}renderPaintedVariationField(){if(!this.customCatalogue||this.content.kind!=="h617a_painted")return d;const e=this.content,t=this.customCatalogue.painted_effects,i=t.some(s=>s.id===e.effect);return i&&t.length<=1?d:o`
      <label class="field">
        <span class="parameter-label">Variation</span>
        <select
          aria-label="Variation"
          .value=${e.effect}
          ?disabled=${this.editorReadOnly}
          @change=${this.paintedEffectVariationChanged}
        >
          ${i?d:o`
                <option value=${e.effect}>
                  Unknown variation ${e.effect}
                </option>
              `}
          ${t.map(s=>o`
              <option
                value=${s.id}
                ?selected=${s.id===e.effect}
              >
                ${s.label}
              </option>
            `)}
        </select>
      </label>
    `}renderEffectName(){return this.templateSourceLabel?o`<h2>${this.templateSourceLabel}</h2>`:this.currentItem?o`
      <input
        class="editor-name"
        aria-label="Effect name"
        maxlength="128"
        .value=${this.name}
        ?disabled=${!this.isAdmin}
        @input=${this.nameChanged}
      />
    `:o`<h2>New effect</h2>`}renderEditorHeading(e,t={}){return o`
      <div class="editor-heading">
        <div>${t.title??this.renderEffectName()}</div>
        <div class="actions">
          ${t.save===!1?d:this.renderSaveAction()}
          ${e}
          ${this.renderEditorDeleteButton()}
        </div>
      </div>
    `}renderSaveAction(){if(this.templateSourceLabel)return o`
        <button
          class="secondary"
          type="button"
          ?disabled=${!this.isAdmin||this.saving||this.applying||this.deletingCurrentItem}
          @click=${this.editTemplate}
        >
          Edit
        </button>
      `;const e=!this.currentItem&&this.customCopyStarted?"Save as Custom":"Save";return o`
      <button
        class="primary"
        type="button"
        ?disabled=${!this.isAdmin||!this.dirty||this.saving||this.applying||this.deletingCurrentItem}
        @click=${this.requestSave}
      >
        ${this.saving?"Saving...":e}
      </button>
    `}get selectedSingleEffectFamily(){if(this.content.kind!=="h617a_single"&&this.content.kind!=="palette_diy")return;const e=this.content.family;return this.modelCatalogue?.effects.find(t=>t.family===e)}syncSingleEffectSelects(){if(this.content.kind!=="h617a_painted"&&this.content.kind!=="h617a_single"&&this.content.kind!=="palette_diy")return;const e=this.shadowRoot?.querySelector('select[aria-label="Effect"]');if(e&&(e.value=this.content.kind==="h617a_painted"?"paint":this.selectedSingleEffectFamily?.id??`unknown:${this.content.family}`),this.content.kind==="h617a_painted"){const t=this.shadowRoot?.querySelector('select[aria-label="Variation"]');t&&(t.value=this.content.effect)}}sliderField(e,t,i,s){return o`
      <govee-slider-control
        .label=${e}
        .value=${i}
        .minimum=${0}
        .maximum=${100}
        .valueText=${s}
        .disabled=${this.editorReadOnly}
        @value-changed=${n=>this.updateContent({[t]:n.detail.value})}
      ></govee-slider-control>
    `}renderDeployment(e){if(e.phase==="confirmed"||e.phase==="applied")return d;const t=this.devices.find(s=>s.config_entry_id===e.config_entry_id)?.display_name??"device";let i;switch(e.phase){case"compiling":case"pending":i=`Preparing to apply to ${t}.`;break;case"uploading":i=`Applying to ${t}: ${e.progress_current} of ${e.progress_total}.`;break;case"activating":i=`Activating the selected effect on ${t}.`;break;case"verifying":i=`Checking the selected effect on ${t}.`;break;case"uncertain":i=e.error_code==="effect_content_readback_unproven"?`${t} reported the selected H6199 user-effect slot, but the uploaded effect content cannot be read back. The result remains uncertain.`:e.error_code==="activation_readback_unproven"?`The H6199 effect upload was sent to ${t}, but activation and readback remain unproven. The result is uncertain.`:`The final state of ${t} is uncertain. The requested settings could not be confirmed.`;break;case"recovering":i=`Restoring the previous state on ${t} after the apply failed.`;break;case"unknown":i=`Applied to ${t}, but the requested settings could not be confirmed.`;break;case"interrupted":i=`Apply to ${t} was interrupted by a Home Assistant restart.`;break;case"failed":i=`Apply to ${t} failed.`;break}return o`
      <div
        class="feedback deployment ${e.phase}"
        role=${["failed","uncertain","interrupted","unknown"].includes(e.phase)?"alert":"status"}
      >
        ${i}
      </div>
    `}async selectSection(e){const t=this.beginEditorTransition();if(e===this.section||e==="custom"&&!this.customEffectsAvailable||e==="video"&&!this.videoAvailable||(this.section=e,this.notice=void 0,e==="scenes"))return;if(e==="video"){const s=this.library.items.find(a=>a.kind==="video_profile"&&this.libraryItemAvailable(a));if(s){await this.selectItem(s.id,t);return}const n=this.modelCatalogue?.video_modes[0];n&&this.openVideoTemplate(n.id,n.label);return}if((Xe(this.content)||this.content.kind==="palette_diy"||this.content.kind==="music_profile"||ze(this.content)||this.content.kind==="opaque")&&this.customEffectKindAvailable(this.content.kind))return;const i=this.preferredLibraryEffect();if(i){await this.selectItem(i.id,t);return}this.isAdmin?this.openDefaultAvailableTemplate(t):(this.currentItem=void 0,this.name="")}async load(){const e=this.loadEpoch+1;this.loadEpoch=e,this.loading=!0,this.error=void 0,this.deploymentRevision=-1;const t=new Or(this.hass);this.api=t;try{const[i,s,n,a]=await Promise.all([t.info(),t.devices(),t.library(),t.customCatalogue()]);if(!this.loadIsCurrent(e,t))return;if(!Rr(i))throw new Error("This editor bundle is not compatible with the installed backend.");this.devices=s,this.library=n,this.customCatalogue=a,this.selectedDeviceId=this.deviceIdFromPath()??s.find(p=>p.custom_effects.painted==="supported")?.config_entry_id??s[0]?.config_entry_id,this.customEffectsAvailable||(this.section="scenes");const l=await t.subscribeLibrary(p=>{this.libraryChanged(p)},p=>this.subscriptionFailed(p,e,t));if(!this.loadIsCurrent(e,t)||this.error){l();return}if(this.unsubscribeLibrary=l,this.isAdmin){const p=await t.subscribeDeployments(b=>{b.revision<this.deploymentRevision||(this.deploymentRevision=b.revision,this.deployments=b.deployments,this.activeOperationId||(this.activeOperationId=this.latestDeployment(bt)?.operation_id))},b=>this.subscriptionFailed(b,e,t));if(!this.loadIsCurrent(e,t)||this.error){p();return}this.unsubscribeDeployments=p}const c=this.preferredLibraryEffect(n.items);c?await this.selectItem(c.id):this.isAdmin&&this.openDefaultAvailableTemplate()}catch(i){this.loadIsCurrent(e,t)&&(this.stopSubscriptions(),this.error=B(i))}finally{this.loadIsCurrent(e,t)&&(this.loading=!1)}}openDefaultTemplate(e){this.newEffect("h617a_painted",e,{name:"Paint",content:ve(),selectionIdentity:"template:paint",templateLabel:"Paint"})}preferredLibraryEffect(e=this.library.items){return e.filter(t=>t.kind!=="video_profile"&&St(t.kind)&&this.libraryItemAvailable(t)).sort((t,i)=>Ii(t.kind,this.selectedModel)-Ii(i.kind,this.selectedModel)||De(t.name,i.name))[0]}openDefaultAvailableTemplate(e){if(this.customEffectKindAvailable("h617a_painted")){this.openDefaultTemplate(e);return}if(this.customEffectKindAvailable("h617a_single")&&this.modelCatalogue?.effects[0]){const t=this.modelCatalogue.effects.find(n=>n.category==="single_layer")??this.modelCatalogue.effects[0],i=t.variations[0],s=ne("h617a_single",this.modelCatalogue);this.newEffect("h617a_single",e,{name:t.label,content:{...s,family:t.family,variant:i.variant},selectionIdentity:`template:single:${t.family}:${i.variant}`,templateLabel:t.label});return}if(this.customEffectKindAvailable("palette_diy")&&this.modelCatalogue?.effects[0]){const t=this.modelCatalogue.effects.find(i=>i.category==="single_layer")??this.modelCatalogue.effects[0];this.openEditableTemplate(t.label,kt(this.modelCatalogue,this.selectedModel,t.family,t.variations[0].variant),`template:single:${t.family}:${t.variations[0].variant}`);return}if(this.customEffectKindAvailable("h617a_multi")){this.newEffect("h617a_multi",e,{name:"Mix",content:ne("h617a_multi",this.modelCatalogue),selectionIdentity:"template:mix",templateLabel:"Mix"});return}if(this.customEffectKindAvailable("advanced")){this.newEffect("advanced",e,{name:"Layered",content:mt(),selectionIdentity:"template:advanced",templateLabel:"Layered"});return}this.currentItem=void 0,this.name=""}loadIsCurrent(e,t){return this.isConnected&&this.loadEpoch===e&&this.api===t}subscriptionFailed(e,t,i){this.loadIsCurrent(t,i)&&(this.error=e.message,this.loading=!1,queueMicrotask(()=>{this.loadIsCurrent(t,i)&&this.stopSubscriptions()}))}stopSubscriptions(){this.unsubscribeLibrary?.(),this.unsubscribeDeployments?.(),this.unsubscribeLibrary=void 0,this.unsubscribeDeployments=void 0}deviceIdFromPath(){const e=window.location.pathname.match(/\/ha-govee-led-ble\/editor\/([^/]+)/);return e?.[1]?decodeURIComponent(e[1]):void 0}async libraryChanged(e){const t=this.library.library_revision;if(e.library_revision<t||(this.library=e,!this.currentItem||e.library_revision===t))return;const i=e.items.find(a=>a.id===this.currentItem?.id);if(!i){if(this.deletingItemId===this.currentItem.id)return;this.notice="This effect was removed from the shared library.";return}if(i.revision===this.currentItem.revision)return;if(this.dirty){this.notice="This effect changed elsewhere. Reload it before saving.";return}const s=this.beginEditorTransition();await this.selectItem(i.id,s)&&this.editorTransitionIsCurrent(s)&&(this.notice="Loaded the latest shared revision.")}sceneLibraryItemSaved(e){this.library={library_revision:e.detail.library_revision,items:Di(this.library.items,e.detail.item)}}sceneTemplateSelected(e){!this.isAdmin||e.detail.config_entry_id!==this.selectedDeviceId||(this.beginEditorTransition(),this.currentItem=e.detail.item,this.templateSourceLabel=void 0,this.customCopyStarted=e.detail.item===void 0,this.name=e.detail.name.trim()||"Layered scene template",this.content=le(e.detail.content),this.savedBaseline=e.detail.item?.content.kind==="scene_layered"?Q(e.detail.item.name,e.detail.item.content):void 0,this.section="custom",this.customEffectCategory="all",this.customTemplateSelection=void 0,this.notice=void 0)}sceneLibraryItemDeleteRequested(e){const{returnFocus:t,...i}=e.detail;this.requestDelete(i,t)}backToScenes(){this.beginEditorTransition(),this.section="scenes",this.notice=void 0}beginEditorTransition(){return this.editorTransitionEpoch+=1,this.saveNameDialogOpen=!1,this.saveNameError=void 0,this.saveNameReturnFocus=void 0,this.editorTransitionEpoch}editorTransitionIsCurrent(e){return e===this.editorTransitionEpoch}deviceChanged(e){const t=this.beginEditorTransition();if(this.selectedDeviceId=e.target.value,this.activeOperationId=void 0,this.activeOperationId=this.latestDeployment(bt)?.operation_id,this.notice=void 0,this.section==="video"&&!this.videoAvailable){this.section="scenes";return}if(!this.customEffectsAvailable){this.section="scenes";return}if(this.customEffectCategoryAvailable(this.customEffectCategory)||(this.customEffectCategory="all"),this.section==="custom"&&!this.effectContentAvailable(this.content)){const i=this.customEffectEntries.filter(n=>n.kind!=="saved"),s=this.customEffectCategory==="all"?void 0:this.customEffectCategory==="music"?i.find(n=>n.kind==="music"&&n.mode!==void 0):i[0];s?this.selectCustomEffectEntry(s):this.openDefaultAvailableTemplate(t)}if(this.section==="video"&&this.content.kind==="video_profile"&&this.content.model!==this.selectedModel){const i=this.modelCatalogue?.video_modes[0];i&&this.openVideoTemplate(i.id,i.label)}}switchCustomMode(e){if(!this.isAdmin||!this.customCatalogue||!Xe(this.content)||this.content.kind===e)return;const t=this.content;if(e==="h617a_single"&&t.kind==="h617a_multi"&&t.effects.length>1)return;let i;if(e==="h617a_painted"){const s=t.kind==="h617a_painted"?this.activePaintBrush:t.palette[0]?[...t.palette[0]]:[47,111,237];i={...ve(),speed:t.speed,groups:[{fill:[...s],segments:Array.from({length:Ot},(n,a)=>a)}]},t.kind!=="h617a_painted"&&(this.paintBrushes=Xr(t.palette),this.selectedPaintBrush=0),this.brushUsesBackground=!1}else if(t.kind==="h617a_painted"){const s=Jr(t);if(e==="h617a_single"){const n=ne(e,this.customCatalogue);i={...n,speed:t.speed,palette:s.length?s:n.palette}}else{const n=ne("h617a_multi",this.customCatalogue);i={...n,speed:t.speed,palette:s.length?s:n.palette}}}else if(e==="h617a_multi"&&t.kind==="h617a_single")i={kind:e,effects:[{family:t.family,variant:t.variant}],speed:t.speed,palette:t.palette.map(s=>[...s])};else if(e==="h617a_single"&&t.kind==="h617a_multi"){const s=t.effects[0];i={kind:e,family:s.family,variant:s.variant,speed:t.speed,palette:t.palette.map(n=>[...n])}}else return;this.content=i,/^New (Paint|Painted|Single|Multi) effect$/.test(this.name)&&(this.name=`New ${Ai(e)} effect`),this.notice=this.applyAvailabilityNotice()}newEffect(e,t,i){t===void 0&&this.beginEditorTransition(),!(!this.api||!this.isAdmin||!this.customEffectKindAvailable(e)||e!=="advanced"&&!this.modelCatalogue)&&(this.currentItem=void 0,this.templateSourceLabel=i?.templateLabel,this.customCopyStarted=!1,this.customTemplateSelection=e==="advanced"?void 0:i?.selectionIdentity??(e==="h617a_painted"?"template:paint":void 0),this.name=i?.name??`New ${Ai(e)} effect`,this.content=i?.content??(e==="advanced"?mt():e==="palette_diy"?kt(this.modelCatalogue,this.selectedModel):ne(e,this.modelCatalogue)),e==="h617a_painted"&&(this.brushUsesBackground=!1),this.savedBaseline=void 0,this.notice=this.applyAvailabilityNotice())}renderEditorDeleteButton(){return!this.isAdmin||!this.currentItem?d:o`
      <button
        class="danger"
        type="button"
        ?disabled=${this.deletingItemId!==void 0||this.saving||this.applying}
        @click=${e=>this.requestDelete({id:this.currentItem.id,revision:this.currentItem.revision,name:this.currentItem.name},e.currentTarget)}
      >
        ${this.deletingCurrentItem?"Deleting...":"Delete"}
      </button>
    `}requestDelete(e,t){!this.api||!this.isAdmin||this.deletingItemId!==void 0||this.saving||this.applying||(this.deleteCandidate={...e},this.deleteReturnFocus=t,this.notice=void 0,this.updateComplete.then(()=>{this.shadowRoot?.querySelector(".delete-dialog .secondary")?.focus()}))}cancelDelete(){const e=this.deleteReturnFocus;this.deleteCandidate=void 0,this.deleteReturnFocus=void 0,this.updateComplete.then(()=>{e?.isConnected&&e.focus()})}deleteDialogKeyDown(e){if(e.key==="Tab"){this.trapDialogFocus(e);return}e.key==="Escape"&&(e.preventDefault(),this.cancelDelete())}async confirmDelete(){const e=this.deleteCandidate,t=this.api;if(!e||!t||!this.isAdmin||this.deletingItemId!==void 0)return;const i=this.library.library_revision;this.deleteCandidate=void 0,this.deleteReturnFocus=void 0,this.deletingItemId=e.id,this.notice=void 0;try{const s=await t.deleteItem(e,i);s>=this.library.library_revision&&(this.library={library_revision:s,items:this.library.items.filter(n=>n.id!==e.id)}),this.currentItem?.id===e.id&&this.currentItem.revision===e.revision&&(this.beginEditorTransition(),this.currentItem=void 0,this.templateSourceLabel=void 0,this.customCopyStarted=!1,this.customTemplateSelection=void 0,this.name="",this.content=ve(),this.savedBaseline=void 0),this.notice=`Deleted ${e.name}.`}catch(s){const n=At(s)==="conflict";if(this.notice=n?"This effect or library changed elsewhere. Reload before deleting.":`Delete failed: ${B(s)}`,n)try{const a=await t.library();a.library_revision>=this.library.library_revision&&(this.library=a)}catch(a){this.notice+=` Library refresh failed: ${B(a)}`}}finally{this.deletingItemId=void 0,this.focusActiveSectionIfNeeded()}}async selectItem(e,t){const i=t??this.beginEditorTransition();if(!this.api)return!1;try{const s=await this.api.item(e);return this.editorTransitionIsCurrent(i)?s.content.kind==="opaque"?(this.currentItem=s,this.templateSourceLabel=void 0,this.customCopyStarted=!1,this.customTemplateSelection=void 0,this.name=s.name,this.content=Gr(s.content),this.savedBaseline=void 0,this.notice="This effect definition is preserved, but this editor cannot change or apply it.",!0):ae(s.content)?(this.currentItem=s,this.templateSourceLabel=void 0,this.customCopyStarted=!1,this.customTemplateSelection=void 0,this.name=s.name,this.content=Ke(s.content),s.content.kind==="h617a_painted"&&(this.brushUsesBackground=!1),this.savedBaseline=Q(s.name,s.content),this.notice=this.applyAvailabilityNotice(),!0):(this.notice="This item cannot be edited here.",!1):!1}catch(s){return this.editorTransitionIsCurrent(i)&&(this.notice=B(s)),!1}}nameChanged(e){this.name=e.target.value}requestSave(e){if(this.currentItem){this.save();return}!this.isAdmin||!this.dirty||this.saving||this.applying||this.deletingCurrentItem||(this.saveNameValue=this.name,this.saveNameError=void 0,this.saveNameReturnFocus=e.currentTarget,this.saveNameDialogOpen=!0,this.updateComplete.then(()=>{const t=this.shadowRoot?.querySelector(".save-dialog input");t?.focus(),t?.select()}))}cancelSaveName(){const e=this.saveNameReturnFocus;this.saveNameDialogOpen=!1,this.saveNameError=void 0,this.saveNameReturnFocus=void 0,this.updateComplete.then(()=>{e?.isConnected&&e.focus()})}saveNameDialogKeyDown(e){if(e.key==="Tab"){this.trapDialogFocus(e);return}e.key==="Escape"&&(e.preventDefault(),this.cancelSaveName())}trapDialogFocus(e){const t=e.currentTarget,i=Array.from(t.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')).filter(p=>p.getClientRects().length>0),s=i[0],n=i[i.length-1];if(!s||!n)return;const a=t.getRootNode(),l=a instanceof ShadowRoot?a.activeElement:document.activeElement,c=l instanceof HTMLElement&&i.includes(l);if(e.shiftKey){(l===s||!c)&&(e.preventDefault(),n.focus());return}(l===n||!c)&&(e.preventDefault(),s.focus())}focusActiveSectionIfNeeded(){this.updateComplete.then(()=>{this.shadowRoot?.activeElement||this.shadowRoot?.querySelector('.primary-nav .selector[aria-current="page"]')?.focus()})}syncModalScrollLock(){if(!this.modalOpen){this.releaseModalScrollLock();return}this.modalScrollLock||(this.modalScrollLock={bodyOverflow:document.body.style.overflow,documentOverflow:document.documentElement.style.overflow},document.body.style.overflow="hidden",document.documentElement.style.overflow="hidden")}releaseModalScrollLock(){this.modalScrollLock&&(document.body.style.overflow=this.modalScrollLock.bodyOverflow,document.documentElement.style.overflow=this.modalScrollLock.documentOverflow,this.modalScrollLock=void 0)}confirmNamedSave(e){e.preventDefault();const t=this.saveNameValue.trim();if(!t){this.saveNameError="Enter an effect name.",this.updateComplete.then(()=>{this.shadowRoot?.querySelector(".save-dialog input")?.focus()});return}this.name=t,this.saveNameDialogOpen=!1,this.saveNameError=void 0,this.saveNameReturnFocus=void 0,this.save()}editTemplate(){this.prepareTemplateEdit()}prepareTemplateEdit(){const e=this.templateSourceLabel;return e?!this.isAdmin||this.saving||this.applying||this.deletingCurrentItem?!1:(this.beginEditorTransition(),this.templateSourceLabel=void 0,this.customTemplateSelection=void 0,this.customCopyStarted=!0,this.name=`Custom ${e}`,this.savedBaseline=void 0,!0):!0}paintBrushesChanged(e){this.paintBrushes=e.detail.palette.map(t=>[...t]),this.selectedPaintBrush=Math.max(0,Math.min(this.selectedPaintBrush,this.paintBrushes.length-1)),this.brushUsesBackground=!1}paintBrushSelected(e){this.selectedPaintBrush=e.detail.index,this.brushUsesBackground=!1}get activePaintBrush(){return[...this.paintBrushes[this.selectedPaintBrush]??this.paintBrushes[0]??[47,111,237]]}backgroundChanged(e){this.updateContent({background:[...e.detail.colour]})}singleEffectChanged(e){if(!this.customCatalogue||this.currentItem?.content.kind==="opaque")return;const t=e.target.value;if(this.currentItem&&(this.content.kind==="h617a_painted"&&t!=="paint"||this.content.kind==="h617a_single"&&t==="paint"))return;const i=this.templateSourceLabel!==void 0||this.customTemplateSelection!==void 0;if(t==="paint"){this.content.kind!=="h617a_painted"&&this.switchCustomMode("h617a_painted"),i&&(this.customTemplateSelection="template:paint"),this.updateGeneratedEffectName("Paint");return}const s=this.modelCatalogue?.effects.find(a=>a.id===t),n=s?.variations[0];!s||!n||(this.content.kind==="h617a_painted"&&this.switchCustomMode("h617a_single"),!(this.content.kind!=="h617a_single"&&this.content.kind!=="palette_diy")&&(this.content={...this.content,family:s.family,variant:n.variant},i&&(this.customTemplateSelection=`template:single:${s.family}:${n.variant}`),this.updateGeneratedEffectName(s.label)))}paintedEffectVariationChanged(e){this.content.kind==="h617a_painted"&&this.updateContent({effect:e.target.value})}updateGeneratedEffectName(e){if(this.templateSourceLabel){this.templateSourceLabel=e,this.name=e;return}!this.currentItem&&/^New .+ effect$/.test(this.name)&&(this.name=`New ${e} effect`)}setSegmentColour(e){if(this.content.kind!=="h617a_painted")return;const t=Bt(this.content);t[e]=this.brushUsesBackground?[...this.content.background]:this.activePaintBrush,this.content={...this.content,groups:Ci(t,this.content.background)}}paintAll(){if(this.content.kind!=="h617a_painted")return;const e=this.brushUsesBackground?this.content.background:this.activePaintBrush;this.content={...this.content,groups:Ci(Array.from({length:Ot},()=>[...e]),this.content.background)}}resetPaint(){this.content.kind==="h617a_painted"&&(this.content={...this.content,groups:[]})}updateContent(e){this.content.kind==="h617a_painted"&&(this.content={...this.content,...e})}async save(){if(!this.api||!this.isAdmin||!this.dirty||this.saving||this.applying||this.deletingCurrentItem||!ae(this.content))return;const e=this.api,t=this.name.trim();if(!t){this.notice="Give this effect a name before saving.";return}const i=this.beginEditorTransition(),s=this.currentItem,n=Ke(this.content),a=this.library.library_revision;this.saving=!0,this.notice=void 0;try{const l=s?await e.updateItem(s,t,n,a):await e.createItem(t,n,a);if(!ae(l.item.content))throw new Error("The saved effect returned an unsupported definition.");const c=l.item.content;l.library_revision>=this.library.library_revision&&(this.library={library_revision:l.library_revision,items:Di(this.library.items,l.item)}),this.editorTransitionIsCurrent(i)&&Pi(this.currentItem,s)&&ae(this.content)&&Q(this.name,this.content)===Q(t,n)&&(this.currentItem=l.item,this.customCopyStarted=!1,this.customTemplateSelection=void 0,this.name=l.item.name,this.content=Ke(c),this.savedBaseline=Q(this.name,this.content),s&&c.kind==="scene_layered"&&(this.savedSceneSelection=l.item)),this.editorTransitionIsCurrent(i)&&Pi(this.currentItem,l.item)&&ae(this.content)&&Q(this.name,this.content)===Q(l.item.name,c)&&(this.notice="Saved.")}catch(l){if(At(l)==="conflict"){const c="This effect or library changed elsewhere. Reload before saving.";this.editorTransitionIsCurrent(i)&&(this.notice=c);try{const p=await e.library();p.library_revision>=this.library.library_revision&&(this.library=p)}catch(p){this.editorTransitionIsCurrent(i)&&(this.notice=`${c} Library refresh failed: `+B(p))}}else this.editorTransitionIsCurrent(i)&&(this.notice=`Save failed: ${B(l)}`)}finally{this.saving=!1}}async apply(){if(!this.api||!this.canApply||!wt(this.content)||!this.selectedDeviceId)return;const e=this.name.trim(),t=this.selectedDeviceId,i=this.editorTransitionEpoch;this.activeOperationId=void 0,this.applying=!0,this.notice=void 0;try{const s=!this.dirty&&this.currentItem?await this.api.applySaved(t,this.currentItem):await this.api.applySnapshot(t,e,this.content);if(i!==this.editorTransitionEpoch||t!==this.selectedDeviceId)return;this.activeOperationId=s.operation_id,this.deployments=[s,...this.deployments.filter(n=>n.operation_id!==s.operation_id)]}catch(s){i===this.editorTransitionEpoch&&t===this.selectedDeviceId&&(this.notice=`Apply failed: ${B(s)}`)}finally{this.applying=!1}}applyAvailabilityNotice(){if(this.selectedDeviceId&&!this.selectedDevice)return"This device is temporarily unavailable in Home Assistant. Apply is disabled until it is loaded."}latestDeployment(e){return[...this.deployments].filter(t=>t.config_entry_id===this.selectedDeviceId&&e.includes(t.phase)).sort((t,i)=>i.updated_at.localeCompare(t.updated_at))[0]}static{this.styles=mn}}x([h({attribute:!1})],y.prototype,"hass");x([h({attribute:!1})],y.prototype,"panel");x([h({type:Boolean})],y.prototype,"showDevicePicker");x([m()],y.prototype,"loading");x([m()],y.prototype,"error");x([m()],y.prototype,"notice");x([m()],y.prototype,"devices");x([m()],y.prototype,"selectedDeviceId");x([m()],y.prototype,"section");x([m()],y.prototype,"customEffectCategory");x([m()],y.prototype,"customTemplateSelection");x([m()],y.prototype,"templateSourceLabel");x([m()],y.prototype,"customCopyStarted");x([m()],y.prototype,"library");x([m()],y.prototype,"customCatalogue");x([m()],y.prototype,"currentItem");x([m()],y.prototype,"savedSceneSelection");x([m()],y.prototype,"name");x([m()],y.prototype,"content");x([m()],y.prototype,"paintBrushes");x([m()],y.prototype,"selectedPaintBrush");x([m()],y.prototype,"brushUsesBackground");x([m()],y.prototype,"saving");x([m()],y.prototype,"saveNameDialogOpen");x([m()],y.prototype,"saveNameValue");x([m()],y.prototype,"saveNameError");x([m()],y.prototype,"applying");x([m()],y.prototype,"deleteCandidate");x([m()],y.prototype,"deletingItemId");x([m()],y.prototype,"deployments");x([m()],y.prototype,"activeOperationId");customElements.get("ha-govee-led-ble-editor")||customElements.define("ha-govee-led-ble-editor",y);
