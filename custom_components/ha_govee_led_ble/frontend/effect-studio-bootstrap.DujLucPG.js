const Ke=globalThis,Et=Ke.ShadowRoot&&(Ke.ShadyCSS===void 0||Ke.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Ct=Symbol(),qt=new WeakMap;let wi=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==Ct)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(Et&&e===void 0){const i=t!==void 0&&t.length===1;i&&(e=qt.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&qt.set(t,e))}return e}toString(){return this.cssText}};const os=r=>new wi(typeof r=="string"?r:r+"",void 0,Ct),k=(r,...e)=>{const t=r.length===1?r[0]:e.reduce((i,s,n)=>i+(a=>{if(a._$cssResult$===!0)return a.cssText;if(typeof a=="number")return a;throw Error("Value passed to 'css' function must be a 'css' function result: "+a+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+r[n+1],r[0]);return new wi(t,r,Ct)},ds=(r,e)=>{if(Et)r.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const i=document.createElement("style"),s=Ke.litNonce;s!==void 0&&i.setAttribute("nonce",s),i.textContent=t.cssText,r.appendChild(i)}},Vt=Et?r=>r:r=>r instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return os(t)})(r):r;const{is:ls,defineProperty:cs,getOwnPropertyDescriptor:us,getOwnPropertyNames:ps,getOwnPropertySymbols:hs,getPrototypeOf:fs}=Object,Qe=globalThis,Kt=Qe.trustedTypes,ms=Kt?Kt.emptyScript:"",gs=Qe.reactiveElementPolyfillSupport,Ae=(r,e)=>r,Ge={toAttribute(r,e){switch(e){case Boolean:r=r?ms:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,e){let t=r;switch(e){case Boolean:t=r!==null;break;case Number:t=r===null?null:Number(r);break;case Object:case Array:try{t=JSON.parse(r)}catch{t=null}}return t}},St=(r,e)=>!ls(r,e),jt={attribute:!0,type:String,converter:Ge,reflect:!1,useDefault:!1,hasChanged:St};Symbol.metadata??=Symbol("metadata"),Qe.litPropertyMetadata??=new WeakMap;let me=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=jt){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(e,i,t);s!==void 0&&cs(this.prototype,e,s)}}static getPropertyDescriptor(e,t,i){const{get:s,set:n}=us(this.prototype,e)??{get(){return this[t]},set(a){this[t]=a}};return{get:s,set(a){const d=s?.call(this);n?.call(this,a),this.requestUpdate(e,d,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??jt}static _$Ei(){if(this.hasOwnProperty(Ae("elementProperties")))return;const e=fs(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(Ae("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(Ae("properties"))){const t=this.properties,i=[...ps(t),...hs(t)];for(const s of i)this.createProperty(s,t[s])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[i,s]of t)this.elementProperties.set(i,s)}this._$Eh=new Map;for(const[t,i]of this.elementProperties){const s=this._$Eu(t,i);s!==void 0&&this._$Eh.set(s,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const s of i)t.unshift(Vt(s))}else e!==void 0&&t.push(Vt(e));return t}static _$Eu(e,t){const i=t.attribute;return i===!1?void 0:typeof i=="string"?i:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ds(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,i);if(s!==void 0&&i.reflect===!0){const n=(i.converter?.toAttribute!==void 0?i.converter:Ge).toAttribute(t,i.type);this._$Em=e,n==null?this.removeAttribute(s):this.setAttribute(s,n),this._$Em=null}}_$AK(e,t){const i=this.constructor,s=i._$Eh.get(e);if(s!==void 0&&this._$Em!==s){const n=i.getPropertyOptions(s),a=typeof n.converter=="function"?{fromAttribute:n.converter}:n.converter?.fromAttribute!==void 0?n.converter:Ge;this._$Em=s;const d=a.fromAttribute(t,n.type);this[s]=d??this._$Ej?.get(s)??d,this._$Em=null}}requestUpdate(e,t,i,s=!1,n){if(e!==void 0){const a=this.constructor;if(s===!1&&(n=this[e]),i??=a.getPropertyOptions(e),!((i.hasChanged??St)(n,t)||i.useDefault&&i.reflect&&n===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,i))))return;this.C(e,t,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:s,wrapped:n},a){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),n!==!0||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),s===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[s,n]of this._$Ep)this[s]=n;this._$Ep=void 0}const i=this.constructor.elementProperties;if(i.size>0)for(const[s,n]of i){const{wrapped:a}=n,d=this[s];a!==!0||this._$AL.has(s)||d===void 0||this.C(s,void 0,n,d)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(i=>i.hostUpdate?.()),this.update(t)):this._$EM()}catch(i){throw e=!1,this._$EM(),i}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};me.elementStyles=[],me.shadowRootOptions={mode:"open"},me[Ae("elementProperties")]=new Map,me[Ae("finalized")]=new Map,gs?.({ReactiveElement:me}),(Qe.reactiveElementVersions??=[]).push("2.1.2");const At=globalThis,zt=r=>r,Xe=At.trustedTypes,Gt=Xe?Xe.createPolicy("lit-html",{createHTML:r=>r}):void 0,ki="$lit$",Y=`lit$${Math.random().toFixed(9).slice(2)}$`,Ei="?"+Y,bs=`<${Ei}>`,ae=document,Te=()=>ae.createComment(""),De=r=>r===null||typeof r!="object"&&typeof r!="function",It=Array.isArray,vs=r=>It(r)||typeof r?.[Symbol.iterator]=="function",at=`[ 	
\f\r]`,we=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Xt=/-->/g,Yt=/>/g,ie=RegExp(`>|${at}(?:([^\\s"'>=/]+)(${at}*=${at}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Wt=/'/g,Jt=/"/g,Ci=/^(?:script|style|textarea|title)$/i,ys=r=>(e,...t)=>({_$litType$:r,strings:e,values:t}),o=ys(1),R=Symbol.for("lit-noChange"),l=Symbol.for("lit-nothing"),Zt=new WeakMap,ne=ae.createTreeWalker(ae,129);function Si(r,e){if(!It(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return Gt!==void 0?Gt.createHTML(e):e}const $s=(r,e)=>{const t=r.length-1,i=[];let s,n=e===2?"<svg>":e===3?"<math>":"",a=we;for(let d=0;d<t;d++){const c=r[d];let p,b,y=-1,M=0;for(;M<c.length&&(a.lastIndex=M,b=a.exec(c),b!==null);)M=a.lastIndex,a===we?b[1]==="!--"?a=Xt:b[1]!==void 0?a=Yt:b[2]!==void 0?(Ci.test(b[2])&&(s=RegExp("</"+b[2],"g")),a=ie):b[3]!==void 0&&(a=ie):a===ie?b[0]===">"?(a=s??we,y=-1):b[1]===void 0?y=-2:(y=a.lastIndex-b[2].length,p=b[1],a=b[3]===void 0?ie:b[3]==='"'?Jt:Wt):a===Jt||a===Wt?a=ie:a===Xt||a===Yt?a=we:(a=ie,s=void 0);const V=a===ie&&r[d+1].startsWith("/>")?" ":"";n+=a===we?c+bs:y>=0?(i.push(p),c.slice(0,y)+ki+c.slice(y)+Y+V):c+Y+(y===-2?d:V)}return[Si(r,n+(r[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),i]};class Le{constructor({strings:e,_$litType$:t},i){let s;this.parts=[];let n=0,a=0;const d=e.length-1,c=this.parts,[p,b]=$s(e,t);if(this.el=Le.createElement(p,i),ne.currentNode=this.el.content,t===2||t===3){const y=this.el.content.firstChild;y.replaceWith(...y.childNodes)}for(;(s=ne.nextNode())!==null&&c.length<d;){if(s.nodeType===1){if(s.hasAttributes())for(const y of s.getAttributeNames())if(y.endsWith(ki)){const M=b[a++],V=s.getAttribute(y).split(Y),Ue=/([.?@])?(.*)/.exec(M);c.push({type:1,index:n,name:Ue[2],strings:V,ctor:Ue[1]==="."?xs:Ue[1]==="?"?ws:Ue[1]==="@"?ks:et}),s.removeAttribute(y)}else y.startsWith(Y)&&(c.push({type:6,index:n}),s.removeAttribute(y));if(Ci.test(s.tagName)){const y=s.textContent.split(Y),M=y.length-1;if(M>0){s.textContent=Xe?Xe.emptyScript:"";for(let V=0;V<M;V++)s.append(y[V],Te()),ne.nextNode(),c.push({type:2,index:++n});s.append(y[M],Te())}}}else if(s.nodeType===8)if(s.data===Ei)c.push({type:2,index:n});else{let y=-1;for(;(y=s.data.indexOf(Y,y+1))!==-1;)c.push({type:7,index:n}),y+=Y.length-1}n++}}static createElement(e,t){const i=ae.createElement("template");return i.innerHTML=e,i}}function ve(r,e,t=r,i){if(e===R)return e;let s=i!==void 0?t._$Co?.[i]:t._$Cl;const n=De(e)?void 0:e._$litDirective$;return s?.constructor!==n&&(s?._$AO?.(!1),n===void 0?s=void 0:(s=new n(r),s._$AT(r,t,i)),i!==void 0?(t._$Co??=[])[i]=s:t._$Cl=s),s!==void 0&&(e=ve(r,s._$AS(r,e.values),s,i)),e}class _s{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,s=(e?.creationScope??ae).importNode(t,!0);ne.currentNode=s;let n=ne.nextNode(),a=0,d=0,c=i[0];for(;c!==void 0;){if(a===c.index){let p;c.type===2?p=new Be(n,n.nextSibling,this,e):c.type===1?p=new c.ctor(n,c.name,c.strings,this,e):c.type===6&&(p=new Es(n,this,e)),this._$AV.push(p),c=i[++d]}a!==c?.index&&(n=ne.nextNode(),a++)}return ne.currentNode=ae,s}p(e){let t=0;for(const i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class Be{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,s){this.type=2,this._$AH=l,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=ve(this,e,t),De(e)?e===l||e==null||e===""?(this._$AH!==l&&this._$AR(),this._$AH=l):e!==this._$AH&&e!==R&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):vs(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==l&&De(this._$AH)?this._$AA.nextSibling.data=e:this.T(ae.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,s=typeof i=="number"?this._$AC(e):(i.el===void 0&&(i.el=Le.createElement(Si(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(t);else{const n=new _s(s,this),a=n.u(this.options);n.p(t),this.T(a),this._$AH=n}}_$AC(e){let t=Zt.get(e.strings);return t===void 0&&Zt.set(e.strings,t=new Le(e)),t}k(e){It(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,s=0;for(const n of e)s===t.length?t.push(i=new Be(this.O(Te()),this.O(Te()),this,this.options)):i=t[s],i._$AI(n),s++;s<t.length&&(this._$AR(i&&i._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const i=zt(e).nextSibling;zt(e).remove(),e=i}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}}class et{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,s,n){this.type=1,this._$AH=l,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=n,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=l}_$AI(e,t=this,i,s){const n=this.strings;let a=!1;if(n===void 0)e=ve(this,e,t,0),a=!De(e)||e!==this._$AH&&e!==R,a&&(this._$AH=e);else{const d=e;let c,p;for(e=n[0],c=0;c<n.length-1;c++)p=ve(this,d[i+c],t,c),p===R&&(p=this._$AH[c]),a||=!De(p)||p!==this._$AH[c],p===l?e=l:e!==l&&(e+=(p??"")+n[c+1]),this._$AH[c]=p}a&&!s&&this.j(e)}j(e){e===l?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class xs extends et{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===l?void 0:e}}class ws extends et{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==l)}}class ks extends et{constructor(e,t,i,s,n){super(e,t,i,s,n),this.type=5}_$AI(e,t=this){if((e=ve(this,e,t,0)??l)===R)return;const i=this._$AH,s=e===l&&i!==l||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,n=e!==l&&(i===l||s);s&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class Es{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){ve(this,e)}}const Cs=At.litHtmlPolyfillSupport;Cs?.(Le,Be),(At.litHtmlVersions??=[]).push("3.3.3");const Ss=(r,e,t)=>{const i=t?.renderBefore??e;let s=i._$litPart$;if(s===void 0){const n=t?.renderBefore??null;i._$litPart$=s=new Be(e.insertBefore(Te(),n),n,void 0,t??{})}return s._$AI(r),s};const Pt=globalThis;let P=class extends me{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Ss(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return R}};P._$litElement$=!0,P.finalized=!0,Pt.litElementHydrateSupport?.({LitElement:P});const As=Pt.litElementPolyfillSupport;As?.({LitElement:P});(Pt.litElementVersions??=[]).push("4.2.2");const Is={attribute:!0,type:String,converter:Ge,reflect:!1,hasChanged:St},Ps=(r=Is,e,t)=>{const{kind:i,metadata:s}=t;let n=globalThis.litPropertyMetadata.get(s);if(n===void 0&&globalThis.litPropertyMetadata.set(s,n=new Map),i==="setter"&&((r=Object.create(r)).wrapped=!0),n.set(t.name,r),i==="accessor"){const{name:a}=t;return{set(d){const c=e.get.call(this);e.set.call(this,d),this.requestUpdate(a,c,r,!0,d)},init(d){return d!==void 0&&this.C(a,void 0,r,d),d}}}if(i==="setter"){const{name:a}=t;return function(d){const c=this[a];e.call(this,d),this.requestUpdate(a,c,r,!0,d)}}throw Error("Unsupported decorator location: "+i)};function h(r){return(e,t)=>typeof t=="object"?Ps(r,e,t):((i,s,n)=>{const a=s.hasOwnProperty(n);return s.constructor.createProperty(n,i),a?Object.getOwnPropertyDescriptor(s,n):void 0})(r,e,t)}function f(r){return h({...r,state:!0,attribute:!1})}const B=k`
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
`,oe=k`
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
`,Tt=k`
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
`,Ai=k`
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
`,de=k`
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
    padding: 8px 10px;
    border: 1px solid var(--studio-border);
    border-radius: var(--studio-control-radius);
    color: var(--primary-text-color);
    background: var(--studio-card);
  }

  .range-field output {
    color: var(--primary-text-color);
    text-align: end;
  }
`,Ii=k`
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
`,Dt=k`
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
`,Pi=k`
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
`,Ti=k`
  .feedback {
    margin-bottom: var(--studio-section-gap);
    padding: 12px 14px;
    border: 1px solid var(--studio-border);
    border-radius: var(--studio-button-radius);
    background: var(--studio-card);
    line-height: 1.45;
  }
`;var Ts=Object.defineProperty,le=(r,e,t,i)=>{for(var s=void 0,n=r.length-1,a;n>=0;n--)(a=r[n])&&(s=a(e,t,s)||s);return s&&Ts(e,t,s),s};class ee extends P{constructor(){super(...arguments),this.items=[],this.ariaLabel="Items",this.itemRole="button",this.addLabel="Add item",this.addDisabled=!1,this.reorderDisabled=!1,this.pointerX=0,this.pointerY=0,this.pointerMoved=!1,this.suppressClick=!1}render(){const e=this.itemRole==="tab";return o`
      <ul
        class="item-list"
        aria-label=${this.ariaLabel}
        role=${e?"tablist":l}
      >
        ${this.items.map((t,i)=>o`
            <li
              class="item-wrapper"
              role=${e?"presentation":l}
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
                id=${t.id??l}
                class="item ${t.colour?"colour":"label"} ${i===this.activeIndex?"selected":""} ${t.removeReady?"remove-ready":""}"
                type="button"
                role=${e?"tab":l}
                aria-label=${t.ariaLabel}
                aria-selected=${e?String(i===this.activeIndex):l}
                aria-controls=${t.ariaControls??l}
                tabindex=${e?i===this.activeIndex?"0":"-1":l}
                style=${t.colour?`--item-colour: ${t.colour}`:l}
                ?disabled=${t.disabled}
                @click=${()=>this.itemClicked(i)}
                @keydown=${s=>this.keyPressed(i,s)}
              >
                ${t.colour?l:t.label}
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
    `}focusItem(e){this.updateComplete.then(()=>{this.shadowRoot?.querySelectorAll(".item")[e]?.focus()})}itemClicked(e){if(this.suppressClick){this.suppressClick=!1;return}this.dispatchEvent(new CustomEvent("item-selected",{detail:{index:e},bubbles:!0,composed:!0}))}addClicked(){this.dispatchEvent(new CustomEvent("item-added",{bubbles:!0,composed:!0}))}dragStarted(e,t){this.reorderDisabled||(this.draggedIndex=e,t.dataTransfer?.setData("text/plain",String(e)))}dropped(e,t){t.preventDefault(),this.draggedIndex!==void 0&&(this.reorder(this.draggedIndex,e),this.draggedIndex=void 0)}keyPressed(e,t){if(t.key!=="ArrowLeft"&&t.key!=="ArrowRight")return;t.preventDefault();const i=e+(t.key==="ArrowLeft"?-1:1);if(!(i<0||i>=this.items.length)){if(this.reorderDisabled){this.itemRole==="tab"&&(this.itemClicked(i),this.focusItem(i));return}this.reorder(e,i,!0)}}pointerStarted(e,t){this.reorderDisabled||t.pointerType==="mouse"||t.target.closest(".strip-popover")||(this.pointerId=t.pointerId,this.pointerIndex=e,this.pointerX=t.clientX,this.pointerY=t.clientY,this.pointerMoved=!1,t.currentTarget.setPointerCapture(t.pointerId))}pointerMovedOver(e){if(e.pointerId!==this.pointerId||this.pointerIndex===void 0)return;const t=e.clientX-this.pointerX,i=e.clientY-this.pointerY;if(!this.pointerMoved){if(Math.abs(i)>Math.abs(t)||Math.abs(t)<10)return;this.pointerMoved=!0}e.preventDefault();const s=this.shadowRoot?.elementFromPoint(e.clientX,e.clientY)?.closest("[data-item-index]"),n=Number(s?.dataset.itemIndex);!Number.isInteger(n)||n===this.pointerIndex||(this.reorder(this.pointerIndex,n),this.pointerIndex=n)}pointerFinished(e){if(e.pointerId!==this.pointerId)return;const t=e.currentTarget;t.hasPointerCapture(e.pointerId)&&t.releasePointerCapture(e.pointerId),this.suppressClick=this.pointerMoved,this.pointerId=void 0,this.pointerIndex=void 0,this.pointerMoved=!1}reorder(e,t,i=!1){this.reorderDisabled||e===t||(this.dispatchEvent(new CustomEvent("items-reordered",{detail:{from:e,to:t},bubbles:!0,composed:!0})),i&&this.focusItem(t))}static{this.styles=[B,k`
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
  `]}}le([h({attribute:!1})],ee.prototype,"items");le([h({attribute:!1})],ee.prototype,"activeIndex");le([h()],ee.prototype,"ariaLabel");le([h()],ee.prototype,"itemRole");le([h()],ee.prototype,"addLabel");le([h({type:Boolean})],ee.prototype,"addDisabled");le([h({type:Boolean})],ee.prototype,"reorderDisabled");customElements.get("govee-reorderable-strip")||customElements.define("govee-reorderable-strip",ee);var Ds=Object.defineProperty,tt=(r,e,t,i)=>{for(var s=void 0,n=r.length-1,a;n>=0;n--)(a=r[n])&&(s=a(e,t,s)||s);return s&&Ds(e,t,s),s};class Re extends P{constructor(){super(...arguments),this.label="",this.options=[],this.value="",this.disabled=!1}render(){return o`
      <div class="parameter-group">
        <span class="parameter-label">${this.label}</span>
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
    `}select(e){this.disabled||e===this.value||this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}static{this.styles=[B,de,k`
      :host {
        display: block;
      }
    `]}}tt([h()],Re.prototype,"label");tt([h({attribute:!1})],Re.prototype,"options");tt([h({attribute:!1})],Re.prototype,"value");tt([h({type:Boolean})],Re.prototype,"disabled");customElements.get("govee-segmented-control")||customElements.define("govee-segmented-control",Re);function J(r){return r.map(e=>[...e])}function w(r){return`#${r.map(e=>e.toString(16).padStart(2,"0")).join("")}`}function Qt(r){return[Number.parseInt(r.slice(1,3),16),Number.parseInt(r.slice(3,5),16),Number.parseInt(r.slice(5,7),16)]}function Ie(r,e){return r.localeCompare(e,"en-AU",{sensitivity:"base"})}function Ye(r,e,t){return r===void 0||e===t?r:r===e?t:e<t&&r>e&&r<=t?r-1:t<e&&r>=t&&r<e?r+1:r}function D(r){return r instanceof Error||typeof r=="object"&&r!==null&&"message"in r&&typeof r.message=="string"?r.message:"An unexpected error occurred."}function gt(r){if(typeof r=="object"&&r!==null&&"code"in r&&typeof r.code=="string")return r.code}var Ls=Object.defineProperty,ce=(r,e,t,i)=>{for(var s=void 0,n=r.length-1,a;n>=0;n--)(a=r[n])&&(s=a(e,t,s)||s);return s&&Ls(e,t,s),s};const pe=5,ei=8,ti=15,Di=[1,2,0,3],Li=[0,1,2,3],Ms={0:"Segment",1:"Continuous",2:"Random",3:"Custom"},Ns={0:"Brightest to darkest",1:"Brightest, darkest, brightest",2:"Darkest to brightest",3:"Darkest, brightest, darkest"},ii={0:"Forward",1:"Backward",2:"Forward and back",3:"Back and forward"};class te extends P{constructor(){super(...arguments),this.disabled=!1,this.segmentCount=ti,this.activeLayerIndex=0,this.activePatternIndex=0,this.movementAnnouncement=""}willUpdate(e){if(!(!e.has("content")||!this.content)){if(this.content.layers.length===0){this.activeLayerIndex=0,this.activePatternIndex=0;return}if(this.activeLayerIndex=T(this.activeLayerIndex,0,this.content.layers.length-1),this.activeLayer.brightness_patterns.length===0){this.activePatternIndex=0;return}this.activePatternIndex=T(this.activePatternIndex,0,this.activeLayer.brightness_patterns.length-1)}}render(){if(!this.content)return l;if(this.content.layers.length===0)return this.renderEmptyLayers();const e=this.activeLayer,t=this.content.layers.map((i,s)=>({key:`layer-${s}`,label:`Layer ${s+1}`,ariaLabel:`Layer ${s+1}. Drag to reorder or use arrow keys.`,id:`advanced-layer-tab-${s}`,ariaControls:"advanced-layer-panel"}));return o`
      <div class="visually-hidden" aria-live="polite">
        ${this.movementAnnouncement}
      </div>

      <section class="card layer-card">
        <govee-reorderable-strip
          .items=${t}
          .activeIndex=${this.activeLayerIndex}
          ariaLabel="Effect layers"
          itemRole="tab"
          addLabel="Add layer"
          .addDisabled=${this.disabled||this.content.layers.length>=pe}
          .reorderDisabled=${this.disabled}
          @item-selected=${i=>this.selectLayer(i.detail.index)}
          @items-reordered=${i=>this.reorderLayer(i.detail.from,i.detail.to)}
          @item-added=${this.addLayer}
        >
          ${this.layerActionsIndex===void 0?l:o`
                <div
                  slot="item-${this.layerActionsIndex}"
                  class="strip-popover layer-actions-popover"
                  role="dialog"
                  aria-label="Layer actions"
                >
                  <button
                    class="secondary"
                    type="button"
                    ?disabled=${this.disabled||this.content.layers.length>=pe}
                    @click=${this.copyLayer}
                  >
                    Copy layer
                  </button>
                  <button
                    class="secondary danger"
                    type="button"
                    ?disabled=${this.disabled||this.content.layers.length===1}
                    @click=${this.deleteLayer}
                  >
                    Delete layer
                  </button>
                </div>
              `}
        </govee-reorderable-strip>

        ${this.content.layers.length>=pe?o`
              <p class="limit-note">
                ${this.content.layers.length>pe?`This loaded effect has ${this.content.layers.length} layers. All are preserved, but adding and copying are unavailable while five or more remain.`:"Advanced effects can author up to five layers."}
              </p>
            `:l}
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
    `}get activeLayer(){return this.content.layers[this.activeLayerIndex]}renderAppliedArea(e){const t=e.area.start_tenths>=0&&e.area.start_tenths<=9&&e.area.width_tenths>=1&&e.area.width_tenths<=10-e.area.start_tenths,i=T(e.area.start_tenths,0,9),s=i+e.area.width_tenths,n=Number.isInteger(this.segmentCount)&&this.segmentCount>0?this.segmentCount:ti,a=w(e.palette[0]??[47,111,237]);return o`
      <section class="card wide-card">
        <h3 class="section-title">Applied area</h3>
        <div class="area-control">
          <div
            class="area-track"
            style="--area-segment-count: ${n}; --area-colour: ${a};"
          >
            <div
              class="area-segments"
              aria-label="Applied area, ${n} segments"
            >
              ${Array.from({length:n},(d,c)=>o`
                  <span
                    class=${t&&Fs(c,n,i,s)?"covered":""}
                    aria-hidden="true"
                  ></span>
                `)}
            </div>
            ${t?o`
                  <div
                    class="area-selection"
                    style="--area-start: ${i*10}%; --area-width: ${(s-i)*10}%"
                  >
                    <button
                      class="area-handle area-handle-start"
                      type="button"
                      role="slider"
                      aria-label="Applied area start"
                      aria-orientation="horizontal"
                      aria-valuemin="0"
                      aria-valuemax=${s-1}
                      aria-valuenow=${i}
                      aria-valuetext="${i*10}%"
                      ?disabled=${this.disabled}
                      @pointerdown=${d=>this.areaPointerStarted("start",i,s,d)}
                      @pointermove=${this.areaPointerMoved}
                      @pointerup=${this.areaPointerFinished}
                      @pointercancel=${this.areaPointerFinished}
                      @lostpointercapture=${this.areaPointerFinished}
                      @keydown=${d=>this.areaBoundaryKeyDown("start",i,s,d)}
                    >
                      <span aria-hidden="true"></span>
                    </button>
                    <button
                      class="area-selection-body"
                      type="button"
                      aria-label="Move applied area, ${i*10}% to ${s*10}%"
                      ?disabled=${this.disabled}
                      @pointerdown=${d=>this.areaPointerStarted("move",i,s,d)}
                      @pointermove=${this.areaPointerMoved}
                      @pointerup=${this.areaPointerFinished}
                      @pointercancel=${this.areaPointerFinished}
                      @lostpointercapture=${this.areaPointerFinished}
                      @keydown=${d=>this.areaPositionKeyDown(i,s,d)}
                    ></button>
                    <button
                      class="area-handle area-handle-end"
                      type="button"
                      role="slider"
                      aria-label="Applied area end"
                      aria-orientation="horizontal"
                      aria-valuemin=${i+1}
                      aria-valuemax="10"
                      aria-valuenow=${s}
                      aria-valuetext="${s*10}%"
                      ?disabled=${this.disabled}
                      @pointerdown=${d=>this.areaPointerStarted("end",i,s,d)}
                      @pointermove=${this.areaPointerMoved}
                      @pointerup=${this.areaPointerFinished}
                      @pointercancel=${this.areaPointerFinished}
                      @lostpointercapture=${this.areaPointerFinished}
                      @keydown=${d=>this.areaBoundaryKeyDown("end",i,s,d)}
                    >
                      <span aria-hidden="true"></span>
                    </button>
                  </div>
                `:l}
          </div>
        </div>
        ${t?l:o`
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
    `}areaPointerStarted(e,t,i,s){if(this.disabled)return;const n=this.shadowRoot?.querySelector(".area-track");if(!n)return;const a=n.getBoundingClientRect();if(a.width<=0)return;const d=s.currentTarget,c=e==="start"?t:e==="end"?i:t;s.preventDefault(),s.stopPropagation(),d.focus(),d.setPointerCapture(s.pointerId),this.areaDrag={pointerId:s.pointerId,mode:e,initialStart:t,initialEnd:i,currentStart:t,currentEnd:i,originX:s.clientX,pointerOffsetX:e==="move"?0:s.clientX-(a.left+c/10*a.width),trackLeft:a.left,trackWidth:a.width,captureTarget:d}}areaPointerMoved(e){const t=this.areaDrag;if(!t||t.pointerId!==e.pointerId)return;e.preventDefault();let i=t.initialStart,s=t.initialEnd;if(t.mode==="move"){const n=t.initialEnd-t.initialStart,a=Math.round((e.clientX-t.originX)/t.trackWidth*10);i=T(t.initialStart+a,0,10-n),s=i+n}else{const n=Math.round((e.clientX-t.pointerOffsetX-t.trackLeft)/t.trackWidth*10);t.mode==="start"?i=T(n,0,t.initialEnd-1):s=T(n,t.initialStart+1,10)}i===t.currentStart&&s===t.currentEnd||(t.currentStart=i,t.currentEnd=s,this.setAppliedArea(i,s))}areaPointerFinished(e){const t=this.areaDrag;!t||t.pointerId!==e.pointerId||(t.captureTarget.hasPointerCapture(e.pointerId)&&t.captureTarget.releasePointerCapture(e.pointerId),this.areaDrag=void 0)}areaBoundaryKeyDown(e,t,i,s){const n=e==="start"?0:t+1,a=e==="start"?i-1:10,d=e==="start"?t:i,c=ri(s.key,d,n,a);c!==void 0&&(s.preventDefault(),this.setAppliedArea(e==="start"?c:t,e==="end"?c:i))}areaPositionKeyDown(e,t,i){const s=t-e,n=ri(i.key,e,0,10-s);n!==void 0&&(i.preventDefault(),this.setAppliedArea(n,n+s))}setAppliedArea(e,t){this.updateLayer({area:{start_tenths:e,width_tenths:t-e}})}renderSelectionControls(e){const t=e.selection,i=Bs(t.type);return o`
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
            ${Di.map(s=>o`<option
                  value=${s}
                  .selected=${t.type===s}
                >
                  ${Ms[s]}
                </option>`)}
            ${i?l:o`
                  <option value=${t.type} .selected=${!0}>
                    Raw type ${t.type} (0x${He(t.type)})
                  </option>
                `}
          </select>
        </label>
        ${i?l:o`
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
          .maxColours=${ei}
          .disabled=${this.disabled}
          @palette-changed=${t=>this.updateLayer({palette:t.detail.palette.map(i=>[...i])})}
        ></govee-palette-editor>
        ${e.palette.length>ei?o`
              <p class="muted">
                All ${e.palette.length} loaded colours are preserved.
                Adding remains unavailable until fewer than eight remain.
              </p>
            `:l}
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
            ${t>2?o`<option value=${t}>Raw method ${t}</option>`:l}
          </select>
        </label>
        ${t>2?this.numberField("Method (raw 7-bit value)",t,0,127,i=>this.updateLayer({distribution:{...e.distribution,method:i}})):l}
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
            `:l}
        ${this.rangeField("Colour speed",e.colour_speed,0,255,ke(e.colour_speed),i=>this.updateLayer({colour_speed:i}))}
        ${this.rangeField("Colour retention",e.colour_retention,0,255,String(e.colour_retention),i=>this.updateLayer({colour_retention:i}))}
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
      `;const t=T(this.activePatternIndex,0,e.brightness_patterns.length-1),i=e.brightness_patterns[t],s=Rs(i.order);return o`
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
                  @keydown=${d=>this.patternTabKeyPressed(a,d)}
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
              ${Li.map(n=>o`<option value=${n}>
                    ${Ns[n]}
                  </option>`)}
              ${s?l:o`
                    <option value=${i.order} .selected=${!0}>
                      Raw order ${i.order} (0x${He(i.order)})
                    </option>
                  `}
            </select>
          </label>
          ${s?l:o`
                <p class="muted raw-value-note">
                  Brightness order ${i.order} is not defined by the
                  known schema. Its raw value remains preserved.
                </p>
                ${this.byteNumberField("Order (raw byte)",i.order,n=>this.updateBrightnessPattern({order:n}))}
              `}
          ${this.rangeField("Scope low",i.scope_low,0,255,ke(i.scope_low),n=>this.updateBrightnessPattern({scope_low:n}))}
          ${this.rangeField("Scope high",i.scope_high,0,255,ke(i.scope_high),n=>this.updateBrightnessPattern({scope_high:n}))}
          ${this.rangeField("Changing speed",i.change_speed,0,255,ke(i.change_speed),n=>this.updateBrightnessPattern({change_speed:n}))}
          ${this.rangeField("Brightest retention",i.brightest_retention,0,255,String(i.brightest_retention),n=>this.updateBrightnessPattern({brightest_retention:n}))}
          ${this.rangeField("Darkest retention",i.darkest_retention,0,255,String(i.darkest_retention),n=>this.updateBrightnessPattern({darkest_retention:n}))}
        </div>
      </section>
    `}renderMovement(e,t,i){const s=e[t];return o`
      <section class="card">
        <div class="card-heading">
          <h3 class="section-title">${i}</h3>
          <button
            class="switch ${s.enabled?"on":""}"
            type="button"
            role="switch"
            aria-checked=${s.enabled}
            aria-label="${i} enabled"
            ?disabled=${this.disabled}
            @click=${()=>this.updateMovement(t,{enabled:!s.enabled},`${i} ${s.enabled?"disabled":"enabled"}.`)}
          >
            <span aria-hidden="true"></span>
          </button>
        </div>
        ${s.enabled?o`
              ${this.byteNumberField("Distance",s.distance,n=>this.updateMovement(t,{distance:n},`${i} distance ${n}.`))}
              <label class="field">
                <span>Direction</span>
                <select
                  .value=${String(s.direction)}
                  ?disabled=${this.disabled}
                  @change=${n=>{const a=Number(n.target.value);this.updateMovement(t,{direction:a},`${i} direction ${ii[a]}.`)}}
                >
                  ${Object.entries(ii).map(([n,a])=>o`<option value=${n}>${a}</option>`)}
                </select>
              </label>
              ${this.rangeField("Speed",s.speed,0,255,ke(s.speed),n=>this.updateMovement(t,{speed:n},`${i} speed ${Bi(n)} per cent.`))}
              <label class="check-field">
                <input
                  type="checkbox"
                  .checked=${s.enter_exit}
                  ?disabled=${this.disabled}
                  @change=${n=>{const a=n.target.checked;this.updateMovement(t,{enter_exit:a},`${i} enter and exit ${a?"enabled":"disabled"}.`)}}
                />
                <span>Enter and exit</span>
              </label>
            `:l}
      </section>
    `}renderPriority(e){const t=e.priority!==0;return o`
      <section class="card">
        <div class="card-heading">
          <h3 class="section-title">Priority</h3>
          <button
            class="switch ${t?"on":""}"
            type="button"
            role="switch"
            aria-checked=${t}
            aria-label="Layer priority enabled"
            ?disabled=${this.disabled}
            @click=${()=>this.updateLayer({priority:t?0:1})}
          >
            <span aria-hidden="true"></span>
          </button>
        </div>
        ${t?o`
              <div class="priority-row" role="group" aria-label="Priority">
                ${[1,2,3,4,5].map(i=>o`
                    <button
                      class=${e.priority===i?"selected":""}
                      type="button"
                      aria-pressed=${e.priority===i}
                      ?disabled=${this.disabled}
                      @click=${()=>this.updateLayer({priority:i})}
                    >
                      ${i}
                    </button>
                  `)}
              </div>
              ${e.priority>5?this.byteNumberField("Priority (raw byte)",e.priority,i=>this.updateLayer({priority:i})):l}
            `:l}
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
    `}rangeField(e,t,i,s,n,a){return o`
      <label class="range-field">
        <span>${e}</span>
        <input
          type="range"
          min=${i}
          max=${s}
          .value=${String(T(t,i,s))}
          aria-label=${e}
          ?disabled=${this.disabled}
          @input=${d=>a(Number(d.target.value))}
        />
        <output aria-label="${e} value">${n}</output>
      </label>
    `}byteNumberField(e,t,i){return this.numberField(e,t,0,255,i)}numberField(e,t,i,s,n){return o`
      <label class="field">
        <span>${e}</span>
        <input
          type="number"
          min=${i}
          max=${s}
          .value=${String(t)}
          ?disabled=${this.disabled}
          @change=${a=>n(T(Number(a.target.value),i,s))}
        />
      </label>
    `}hexByteField(e,t,i,s=255){return o`
      <label class="field">
        <span>${e}</span>
        <input
          type="text"
          inputmode="text"
          spellcheck="false"
          .value=${He(t)}
          ?disabled=${this.disabled}
          @change=${n=>{const a=n.target,d=Os(a.value);if(d===void 0){a.setCustomValidity("Enter one byte from 00 to FF."),a.reportValidity();return}if((d&~s)!==0){a.setCustomValidity(`Known flag bits are controlled elsewhere. Allowed mask: ${He(s)}.`),a.reportValidity();return}a.setCustomValidity(""),i(d)}}
        />
      </label>
    `}updateLayer(e){if(!this.content||this.disabled)return;const t=this.content.layers.map((i,s)=>s===this.activeLayerIndex?z({...i,...e}):z(i));this.emitContent({kind:"advanced",layers:t})}updateSelection(e){this.updateLayer({selection:{...this.activeLayer.selection,...e}})}updateBrightnessPattern(e){const t=this.activeLayer.brightness_patterns.map((i,s)=>s===this.activePatternIndex?{...i,...e}:{...i});this.updateLayer({brightness_patterns:t})}updateMovement(e,t,i){this.updateLayer({[e]:{...this.activeLayer[e],...t}}),i&&(this.movementAnnouncement=i)}addLayer(){if(!this.content||this.disabled||this.content.layers.length>=pe)return;const e=[...this.content.layers.map(z),Mi()];this.installContent({kind:"advanced",layers:e}),this.activeLayerIndex=e.length-1,this.activePatternIndex=0,this.layerActionsIndex=void 0,this.focusActiveTab()}copyLayer(){if(!this.content||this.disabled||this.content.layers.length>=pe)return;const e=this.content.layers.map(z);e.splice(this.activeLayerIndex+1,0,z(this.activeLayer)),this.installContent({kind:"advanced",layers:e}),this.activeLayerIndex+=1,this.activePatternIndex=0,this.layerActionsIndex=this.activeLayerIndex,this.focusActiveTab()}deleteLayer(){if(!this.content||this.disabled||this.content.layers.length===1)return;const e=this.content.layers.filter((t,i)=>i!==this.activeLayerIndex).map(z);this.activeLayerIndex=Math.min(this.activeLayerIndex,e.length-1),this.activePatternIndex=0,this.layerActionsIndex=void 0,this.emitContent({kind:"advanced",layers:e}),this.focusActiveTab()}reorderLayer(e,t){if(!this.content||this.disabled||e<0||e>=this.content.layers.length||t<0||t>=this.content.layers.length||e===t)return;const i=this.content.layers.map(z),[s]=i.splice(e,1);i.splice(t,0,s),this.activeLayerIndex=Ye(this.activeLayerIndex,e,t),this.layerActionsIndex!==void 0&&(this.layerActionsIndex=Ye(this.layerActionsIndex,e,t)),this.emitContent({kind:"advanced",layers:i})}addBrightnessPattern(){if(this.disabled||this.activeLayer.brightness_patterns.length>=3)return;const e=[...this.activeLayer.brightness_patterns.map(t=>({...t})),Ni()];this.activePatternIndex=e.length-1,this.updateLayer({brightness_patterns:e})}deleteBrightnessPattern(){if(this.disabled||this.activeLayer.brightness_patterns.length===1)return;const e=this.activeLayer.brightness_patterns.filter((t,i)=>i!==this.activePatternIndex).map(t=>({...t}));this.activePatternIndex=Math.min(this.activePatternIndex,e.length-1),this.updateLayer({brightness_patterns:e})}selectLayer(e){if(e===this.activeLayerIndex){this.layerActionsIndex=this.layerActionsIndex===e?void 0:e;return}this.activeLayerIndex=e,this.activePatternIndex=0,this.layerActionsIndex=e}patternTabKeyPressed(e,t){const i=this.activeLayer.brightness_patterns.length;let s;t.key==="ArrowLeft"?s=e===0?i-1:e-1:t.key==="ArrowRight"?s=e===i-1?0:e+1:t.key==="Home"?s=0:t.key==="End"&&(s=i-1),s!==void 0&&(t.preventDefault(),this.activePatternIndex=s,this.updateComplete.then(()=>{this.shadowRoot?.querySelectorAll(".pattern-tabs button")[s]?.focus()}))}focusActiveTab(){this.updateComplete.then(()=>{this.shadowRoot?.querySelector("govee-reorderable-strip")?.focusItem(this.activeLayerIndex)})}excessChanged(e){const t=e.value.replace(/\s+/g,"").toLowerCase();if(!/^(?:[0-9a-f]{2})*$/.test(t)){e.setCustomValidity("Enter an even number of hexadecimal digits."),e.reportValidity();return}e.setCustomValidity(""),this.updateLayer({excess:t})}emitContent(e){this.dispatchEvent(new CustomEvent("content-changed",{detail:{content:e},bubbles:!0,composed:!0}))}installContent(e){this.content=e,this.emitContent(e)}static{this.styles=[B,oe,Tt,de,Dt,k`
    :host {
      display: block;
      --area-trim: var(--warning-color, #f4c542);
    }

    p {
      margin-top: 0;
    }

    .layer-card {
      margin-bottom: var(--studio-section-gap);
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

    .pattern-tabs button,
    .priority-row button {
      flex: 0 0 auto;
      padding: 8px 14px;
      border: 1px solid var(--studio-border);
      border-radius: 8px;
      color: var(--primary-text-color);
      background: var(--studio-card);
      cursor: pointer;
    }

    .pattern-tabs button.selected,
    .priority-row button.selected {
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
      color: var(--primary-text-color);
      background: var(--studio-card);
      font-weight: 600;
      cursor: pointer;
    }

    .add-button {
      color: var(--studio-blue);
      border-style: dashed;
    }

    .layer-actions-popover {
      --strip-popover-width: 220px;
      display: grid;
      gap: 8px;
    }

    .layer-actions-popover .secondary {
      width: 100%;
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
      position: relative;
      margin-bottom: 16px;
      padding: 10px 12px;
    }

    .area-track {
      position: relative;
      direction: ltr;
      touch-action: none;
    }

    .area-segments {
      display: grid;
      grid-template-columns: repeat(
        var(--area-segment-count),
        minmax(0, 1fr)
      );
      gap: 4px;
    }

    .area-segments span {
      min-width: 0;
      min-height: 48px;
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

    .area-selection {
      position: absolute;
      z-index: 2;
      top: -7px;
      bottom: -7px;
      left: var(--area-start);
      width: var(--area-width);
      border-block: 4px solid var(--area-trim);
      pointer-events: none;
    }

    .area-handle,
    .area-selection-body {
      position: absolute;
      min-height: 0;
      margin: 0;
      padding: 0;
      pointer-events: auto;
    }

    .area-handle {
      z-index: 2;
      top: -4px;
      bottom: -4px;
      width: 22px;
      border: 0;
      border-radius: 6px;
      background: var(--area-trim);
      box-shadow: 0 2px 7px rgb(0 0 0 / 28%);
      cursor: ew-resize;
    }

    .area-handle-start {
      left: 0;
      transform: translateX(-50%);
    }

    .area-handle-end {
      right: 0;
      transform: translateX(50%);
    }

    .area-handle span {
      display: block;
      width: 3px;
      height: 18px;
      margin: auto;
      border-radius: 999px;
      background: color-mix(in srgb, var(--area-trim) 40%, #000);
    }

    .area-selection-body {
      z-index: 1;
      inset: 4px 11px;
      border: 0;
      background: transparent;
      cursor: grab;
    }

    .area-selection-body:active {
      cursor: grabbing;
    }

    .area-handle:focus-visible,
    .area-selection-body:focus-visible {
      outline: 3px solid var(--studio-blue);
      outline-offset: 3px;
    }

    .area-handle:disabled,
    .area-selection-body:disabled {
      cursor: not-allowed;
      opacity: 0.58;
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

    .range-field {
      grid-template-columns: minmax(112px, auto) minmax(100px, 1fr) 74px;
      font-variant-numeric: tabular-nums;
    }

    .priority-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
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

    .switch {
      position: relative;
      width: 60px;
      min-height: 44px;
      height: 44px;
      padding: 0;
      border: 1px solid var(--studio-border);
      border-radius: 999px;
      background: var(--secondary-background-color, #f5f6f8);
      cursor: pointer;
    }

    .switch span {
      position: absolute;
      top: 6px;
      left: 6px;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: var(--studio-muted);
      transition: transform 120ms ease;
    }

    .switch.on {
      border-color: var(--studio-blue);
      background: var(--studio-blue);
    }

    .switch.on span {
      background: var(--text-primary-color, #fff);
      transform: translateX(18px);
    }

    .check-field {
      margin-top: 12px;
    }

    .priority-row {
      margin-top: 16px;
    }

    .priority-row button {
      flex: 1;
      min-width: 44px;
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

      .range-field {
        grid-template-columns: 1fr 64px;
      }

      .range-field span {
        grid-column: 1 / -1;
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

    @media (prefers-reduced-motion: reduce) {
      .switch span {
        transition: none;
      }
    }
  `]}}ce([h({attribute:!1})],te.prototype,"content");ce([h({type:Boolean})],te.prototype,"disabled");ce([h({type:Number})],te.prototype,"segmentCount");ce([f()],te.prototype,"activeLayerIndex");ce([f()],te.prototype,"activePatternIndex");ce([f()],te.prototype,"movementAnnouncement");ce([f()],te.prototype,"layerActionsIndex");function ot(){return{kind:"advanced",layers:[Mi()]}}function We(r){return{kind:"advanced",layers:r.layers.map(z)}}function it(r){return{...r,template:{...r.template},effect:{layers:We({layers:r.effect.layers}).layers}}}function Mi(){return{area:{start_tenths:0,width_tenths:10},selection:{type:0,param_1:0,param_2:1},brightness_gradient:!1,brightness_patterns:[Ni()],distribution:{method:1,backwards:!1},colour_speed:128,colour_retention:20,palette:[[255,0,0],[0,0,255]],selected_movement:si(),overall_movement:si(),priority:0,unknown_flags:0,excess:""}}function Ni(){return{scope_high:255,scope_low:0,order:0,change_speed:128,brightest_retention:20,darkest_retention:20}}function si(){return{enabled:!1,enter_exit:!1,direction:0,distance:1,speed:128,unknown_flags:0}}function z(r){return{...r,area:{...r.area},selection:{...r.selection},brightness_patterns:r.brightness_patterns.map(e=>({...e})),distribution:{...r.distribution},palette:r.palette.map(e=>[...e]),selected_movement:{...r.selected_movement},overall_movement:{...r.overall_movement}}}function Bs(r){return Di.includes(r)}function Rs(r){return Li.includes(r)}function Bi(r){return Math.round(T(r,0,255)/255*100)}function ke(r){return`${Bi(r)}% · ${r}`}function He(r){return r.toString(16).padStart(2,"0").toUpperCase()}function Os(r){const e=r.trim().replace(/^0x/i,"");if(/^[0-9a-f]{1,2}$/i.test(e))return Number.parseInt(e,16)}function Fs(r,e,t,i){const s=r*10/e;return(r+1)*10/e>t&&s<i}function ri(r,e,t,i){if(r==="Home")return t;if(r==="End")return i;if(r==="ArrowLeft"||r==="ArrowDown")return T(e-1,t,i);if(r==="ArrowRight"||r==="ArrowUp")return T(e+1,t,i)}function T(r,e,t){return Math.min(t,Math.max(e,Math.round(r)))}customElements.get("govee-advanced-effect-editor")||customElements.define("govee-advanced-effect-editor",te);const Us=1,Ri=1,Hs=1,ni=2,L=128,_e=65536,Oi=512,Fi=256,Ui=32,Hi=128,qi=512,x=255,qs=64,Vi=262144,ai=16,Vs=4096,Ki=16384,H=1024,dt=16384,Lt=Number.MAX_SAFE_INTEGER,Ks=4335,js=232,zs=253,ye=["H617A","H6199"],lt="H617A",ji=["movie","game"];function Gs(r){const e=m(r,"editor info"),t=m(e.limits,"editor limits");return{api_version:u(e.api_version,"API version",1),effect_schema_version:u(e.effect_schema_version,"effect schema version",1),compiler_version:u(e.compiler_version,"compiler version",1),limits:{effect_name:F(t.effect_name,L,"effect-name limit"),effect_document_bytes:F(t.effect_document_bytes,_e,"effect-document limit"),devices:F(t.devices,Oi,"device limit"),library_items:F(t.library_items,Fi,"library-item limit"),drafts_per_owner:F(t.drafts_per_owner,Ui,"draft limit"),deployment_records:F(t.deployment_records,Hi,"deployment limit"),scene_catalogue_entries:F(t.scene_catalogue_entries,qi,"scene catalogue limit")}}}function Xs(r){const e=C(r,"devices",Oi).map((t,i)=>{const s=m(t,`devices[${i}]`),n=m(s.custom_effects,`devices[${i}].custom_effects`);return{config_entry_id:v(s.config_entry_id,`devices[${i}].config_entry_id`,x),model:v(s.model,`devices[${i}].model`,x),display_name:v(s.display_name,`devices[${i}].display_name`,x),segment_count:u(s.segment_count,`devices[${i}].segment_count`,0,65535),custom_effects:{painted:W(n.painted,"painted capability"),single:W(n.single,"single capability"),multi:W(n.multi,"multi capability"),advanced:W(n.advanced,"advanced capability")},readback:v(s.readback,`devices[${i}].readback`,x)}});return Q(e,t=>t.config_entry_id,"device IDs"),e}function Ys(r){ue(r,"custom-effect catalogue",Vi,Ki);const e=m(r,"custom-effect catalogue"),t=Ws(e.models),i=bt(e,"custom-effect catalogue",lt);if(JSON.stringify(i)!==JSON.stringify(t[lt]))throw new Error("Malformed Effect Studio server payload: legacy custom-effect catalogue view does not match models.H617A.");return F(e.schema_version,ni,"catalogue schema"),{...i,schema_version:ni,sku:lt,models:t}}function Ws(r){const e=m(r,"custom-effect catalogue models"),i=Object.keys(e).filter(s=>!ye.includes(s));if(i.length>0)throw new Error(`Malformed Effect Studio server payload: unexpected catalogue models ${i.join(", ")}.`);for(const s of ye)if(!(s in e))throw new Error(`Malformed Effect Studio server payload: missing catalogue model ${s}.`);return{H617A:bt(e.H617A,"catalogue model H617A","H617A"),H6199:bt(e.H6199,"catalogue model H6199","H6199")}}function bt(r,e,t){const i=m(r,e),s=m(i.limits,`${e} limits`),n=m(i.supports,`${e} support capabilities`),a=m(i.apply,`${e} Apply capabilities`),d=U(i.sku,ye,`${e} SKU`);if(d!==t)throw new Error(`Malformed Effect Studio server payload: ${e} is keyed as ${t} but declares ${d}.`);const c=u(s.music_sensitivity_min,`${e} minimum music sensitivity`,0,100),p=u(s.music_sensitivity_max,`${e} maximum music sensitivity`,0,100);return c>p&&g(`${e} music sensitivity limits are inverted`),{sku:d,painted_effects:Js(i.painted_effects,`${e} painted-effect templates`),effects:Zs(i.effects,`${e} custom-effect templates`),music_modes:oi(i.music_modes,`${e} music modes`),video_modes:oi(i.video_modes,`${e} video modes`,ji),supports:{multi:W(n.multi,`${e} Multi support`),advanced:W(n.advanced,`${e} advanced support`)},limits:{palette_min:u(s.palette_min,`${e} minimum palette`,1,255),palette_max:u(s.palette_max,`${e} maximum palette`,1,255),multi_max:u(s.multi_max,`${e} maximum Multi effects`,1,255),music_sensitivity_min:c,music_sensitivity_max:p},apply:{single:W(a.single,`${e} Single Apply capability`),multi:W(a.multi,`${e} Multi Apply capability`)}}}function Js(r,e){const t=C(r,e,H).map((i,s)=>{const n=m(i,`${e}[${s}]`);return{id:U(n.id,["cycle","clockwise","counter_clockwise","twinkle","gradient","breathe"],`${e} ID`),label:v(n.label,`${e} label`,L)}});return Q(t,i=>i.id,`${e} IDs`),t}function Zs(r,e){const t=C(r,e,H).map((i,s)=>{const n=m(i,`${e}[${s}]`),a=C(n.variations,`${e}[${s}].variations`,H);if(a.length===0)throw new Error("Malformed Effect Studio server payload: custom-effect template has no variations.");const d={id:v(n.id,`${e}[${s}] ID`,x),label:v(n.label,`${e}[${s}] label`,L),family:u(n.family,`${e}[${s}] family`,0,255),variations:a.map((c,p)=>{const b=m(c,`${e}[${s}].variations[${p}]`);return{id:v(b.id,`${e}[${s}].variations[${p}] ID`,x),label:v(b.label,`${e}[${s}].variations[${p}] label`,L),variant:u(b.variant,`${e}[${s}].variations[${p}] variant`,0,255)}}),supports_multi:N(n.supports_multi,`${e}[${s}] Multi support`),rate:U(n.rate,["speed","sensitivity"],`${e}[${s}] rate parameter`)};return Q(d.variations,c=>c.id,`${e}[${s}] variation IDs`),d});return Q(t,i=>i.id,`${e} IDs`),t}function oi(r,e,t){const i=C(r,e,H).map((s,n)=>{const a=m(s,`${e}[${n}]`);return{id:t?U(a.id,t,`${e}[${n}] ID`):v(a.id,`${e}[${n}] ID`,x),label:v(a.label,`${e}[${n}] label`,L)}});return Q(i,s=>s.id,`${e} IDs`),i}function di(r){const e=m(r,"library snapshot"),t={library_revision:Z(e.library_revision,"library revision",0),items:C(e.items,"library items",Fi).map((i,s)=>{const n=m(i,`library items[${s}]`),a=n.template===void 0?void 0:Je(n.template,`library items[${s}].template`),d=n.model===void 0?void 0:lr(n.model);return{id:v(n.id,"library item ID",x),revision:Z(n.revision,"library item revision",1),name:v(n.name,"library item name",L),kind:v(n.kind,"library item kind",x),...d?{model:d}:{},...a?{template:a}:{}}})};return Q(t.items,i=>i.id,"library item IDs"),t}function je(r){ue(r,"library item",_e);const e=m(r,"library item"),t=e.target_hint===void 0?void 0:m(e.target_hint,"target hint");return{schema_version:F(e.schema_version,Ri,"effect schema version"),id:v(e.id,"effect ID",x),revision:Z(e.revision,"effect revision",1),name:v(e.name,"effect name",L),content:zi(e.content),provenance:yt(e.provenance,"effect provenance"),extensions:yt(e.extensions,"effect extensions"),...t?{target_hint:{model:t.model===null?null:v(t.model,"target model",x),segment_count:t.segment_count===null?null:u(t.segment_count,"target segment count",1,65535)}}:{}}}function Qs(r){const e=C(r,"draft summaries",Ui).map((t,i)=>{const s=m(t,`draft summaries[${i}]`);return{id:v(s.id,"draft ID",x),revision:Z(s.revision,"draft revision",1),name:v(s.name,"draft name",L),updated_at:Nt(s.updated_at,"draft timestamp"),selected_config_entry_id:Me(s.selected_config_entry_id,"draft config entry ID")}});return Q(e,t=>t.id,"draft IDs"),e}function ct(r){const e=m(r,"effect draft");return{id:v(e.id,"draft ID",x),owner_id:v(e.owner_id,"draft owner",x),revision:Z(e.revision,"draft revision",1),item:je(e.item),updated_at:Nt(e.updated_at,"draft timestamp"),selected_config_entry_id:Me(e.selected_config_entry_id,"draft config entry ID"),base_item_id:Me(e.base_item_id,"draft base item ID"),base_item_revision:e.base_item_revision===null?null:Z(e.base_item_revision,"draft base item revision",1)}}function vt(r){const e=m(r,"deployment"),t=xe(e.phase,"deployment phase");t!=="pending"&&t!=="uploading"&&t!=="verifying"&&t!=="confirmed"&&t!=="failed"&&t!=="interrupted"&&t!=="unknown"&&g("deployment phase is invalid");const i={operation_id:v(e.operation_id,"deployment operation ID",x),config_entry_id:v(e.config_entry_id,"deployment config entry ID",x),diy_code:u(e.diy_code,"deployment DIY code",0,65535),phase:t,updated_at:Nt(e.updated_at,"deployment timestamp"),item_id:Me(e.item_id,"deployment item ID"),item_revision:e.item_revision===null?null:Z(e.item_revision,"deployment item revision",1),error_code:Me(e.error_code,"deployment error code"),progress_current:u(e.progress_current,"deployment progress",0,1024),progress_total:u(e.progress_total,"deployment progress total",0,1024)};return i.progress_current>i.progress_total&&g("deployment progress exceeds its total"),i}function er(r){const e=m(r,"deployment snapshot"),t={revision:Z(e.revision,"deployment revision",0),deployments:C(e.deployments,"deployments",Hi).map(vt)};return Q(t.deployments,i=>i.operation_id,"deployment operation IDs"),t}function tr(r){ue(r,"scene catalogue",Vi,Ki);const e=m(r,"scene catalogue");return{schema_version:u(e.schema_version,"scene catalogue schema",1),sku:v(e.sku,"scene catalogue SKU",x),enabled:N(e.enabled,"scene catalogue enabled"),categories:C(e.categories,"scene categories",H).map((t,i)=>{const s=m(t,`scene categories[${i}]`);return{id:u(s.id,"scene category ID",0,65535),name:v(s.name,"scene category name",L)}}),scenes:C(e.scenes,"scenes",qi).map(Mt)}}function ir(r){const e=m(r,"scene detail");ue({scene:e.scene,content:e.content},"scene detail",_e);const t=zi(e.content);return t.kind!=="scene_builtin"&&t.kind!=="scene_palette"&&t.kind!=="scene_layered"&&g("scene detail content is unsupported"),{scene:Mt(e.scene),content:t}}function zi(r){ue(r,"effect content",_e);const e=m(r,"effect content"),t=v(e.kind,"effect content kind",x);switch(t){case"h617a_painted":return{kind:t,effect:U(e.effect,["cycle","clockwise","counter_clockwise","twinkle","gradient","breathe"],"painted effect"),speed:u(e.speed,"painted speed",0,100),brightness:u(e.brightness,"painted brightness",0,100),background:$e(e.background,"painted background"),groups:C(e.groups,"paint groups",15).map((i,s)=>{const n=m(i,`paint groups[${s}]`);return{fill:$e(n.fill,"paint-group fill"),segments:C(n.segments,"painted segments",15).map(a=>u(a,"painted segment",0,14))}})};case"h617a_single":return{kind:t,family:u(e.family,"Single family",0,254),variant:u(e.variant,"Single variant",0,255),speed:u(e.speed,"Single speed",0,100),palette:Pe(e.palette,"Single palette",8)};case"h617a_multi":return{kind:t,effects:C(e.effects,"Multi effects",4).map((i,s)=>{const n=m(i,`Multi effects[${s}]`);return{family:u(n.family,"Multi family",0,254),variant:u(n.variant,"Multi variant",0,255)}}),speed:u(e.speed,"Multi speed",0,100),palette:Pe(e.palette,"Multi palette",8)};case"palette_diy":return{kind:t,model:U(e.model,ye,"palette DIY model"),family:u(e.family,"palette DIY family",0,255),variant:u(e.variant,"palette DIY variant",0,255),speed:u(e.speed,"palette DIY speed",0,100),palette:Pe(e.palette,"palette DIY palette",8)};case"music_profile":return{kind:t,model:U(e.model,ye,"music profile model"),mode:v(e.mode,"music profile mode",x),sensitivity:u(e.sensitivity,"music profile sensitivity",0,100),colour:nr(e.colour,"music profile colour"),calm:ar(e.calm,"music profile calm"),parameters:yt(e.parameters,"music profile parameters")};case"video_profile":return{kind:t,model:U(e.model,["H6199"],"video profile model"),mode:U(e.mode,ji,"video profile mode"),full_screen:N(e.full_screen,"video profile full-screen flag"),saturation:u(e.saturation,"video profile saturation",0,100),sound_effects:N(e.sound_effects,"video profile sound-effects flag"),sound_effects_softness:u(e.sound_effects_softness,"video profile sound-effects softness",1,100),white_balance_position:u(e.white_balance_position,"video profile white-balance position",1,20),relative_brightness:or(e.relative_brightness,"video profile relative brightness"),blank_screen:N(e.blank_screen,"video profile blank-screen flag")};case"advanced":return{kind:t,layers:li(e.layers,"Advanced layers")};case"scene_builtin":return{kind:t,template:Je(e.template,"scene template"),speed_index:$t(e.speed_index,"scene speed index",0,255)};case"scene_palette":return sr(e);case"scene_layered":{const i=m(e.effect,"layered scene effect"),s=Gi(e.trailing_padding,"layered scene trailing padding");return{kind:t,template:Je(e.template,"layered scene template"),effect:{layers:li(i.layers,"layered scene layers")},speed_index:$t(e.speed_index,"layered scene speed index",0,255),raw_param:Xi(e.raw_param,"layered scene raw parameter"),...s===void 0?{}:{trailing_padding:s}}}default:{const{kind:i,...s}=e;return{kind:"opaque",source_kind:t,body:s}}}}function Gi(r,e){if(r!==void 0)return u(r,e,0,Ks)}function sr(r){const t=u(r.layout,"palette scene layout",0,1)===0?0:1,i=C(r.steps,"palette scene steps",255).map((d,c)=>{const p=m(d,`palette scene steps[${c}]`),b=t===0?(p.inline_colour!==null&&g(`palette scene steps[${c}].inline_colour must be null for layout 0`),null):$e(p.inline_colour,`palette scene steps[${c}].inline_colour`);return{value:u(p.value,`palette scene steps[${c}].value`,0,65535),colour:$e(p.colour,`palette scene steps[${c}].colour`),inline_colour:b}}),s=Pe(r.palette,"palette scene shared palette",255,!0);t===1&&s.length!==0&&g("palette scene layout 1 must not have a shared palette");let n;r.config_flags!==void 0&&(n=u(r.config_flags,"palette scene config flags",0,255),n&-9&&g("palette scene config flags must only set reserved config bits"));const a=Gi(r.trailing_padding,"palette scene trailing padding");return{kind:"scene_palette",template:Je(r.template,"palette scene template"),layout:t,brightness_flag:N(r.brightness_flag,"palette scene brightness flag"),steps:i,palette:s,speed_index:$t(r.speed_index,"palette scene speed index",0,255),...n===void 0?{}:{config_flags:n},...a===void 0?{}:{trailing_padding:a}}}function Ee(r){return r.kind!=="opaque"?r:(ue(r.body,"opaque content",_e),{...r.body,kind:v(r.source_kind,"opaque source kind",x)})}function Mt(r){const e=m(r,"scene"),t=xe(e.parameter_kind,"scene parameter kind");t!=="none"&&t!=="palette"&&t!=="layers"&&t!=="opaque"&&g("scene parameter kind is invalid");const i=e.speed===null?null:(()=>{const s=m(e.speed,"scene speed");return{option_count:u(s.option_count,"scene speed option count",1,256),default_index:u(s.default_index,"scene default speed",0,255)}})();return{scene_id:u(e.scene_id,"scene ID",0,65535),effect_id:u(e.effect_id,"scene effect ID",0,65535),category_id:u(e.category_id,"scene category ID",0,65535),category:v(e.category,"scene category",L),name:v(e.name,"scene name",L),variant:dr(e.variant,"scene variant",x),display_name:v(e.display_name,"scene display name",L),scene_type:u(e.scene_type,"scene type",0,255),parameter_kind:t,speed:i}}function li(r,e){return C(r,e,255).map((t,i)=>rr(t,`${e}[${i}]`))}function rr(r,e){const t=m(r,e),i=m(t.area,`${e}.area`),s=m(t.selection,`${e}.selection`),n=m(t.distribution,`${e}.distribution`);return{area:{start_tenths:u(i.start_tenths,`${e}.area.start_tenths`,0,15),width_tenths:u(i.width_tenths,`${e}.area.width_tenths`,0,15)},selection:{type:I(s.type,`${e}.selection.type`),param_1:I(s.param_1,`${e}.selection.param_1`),param_2:I(s.param_2,`${e}.selection.param_2`)},brightness_gradient:N(t.brightness_gradient,`${e}.brightness_gradient`),brightness_patterns:C(t.brightness_patterns,`${e}.brightness_patterns`,255).map((a,d)=>{const c=m(a,`${e}.brightness_patterns[${d}]`);return{scope_high:I(c.scope_high,"brightness scope high"),scope_low:I(c.scope_low,"brightness scope low"),order:I(c.order,"brightness order"),change_speed:I(c.change_speed,"brightness change speed"),brightest_retention:I(c.brightest_retention,"brightest retention"),darkest_retention:I(c.darkest_retention,"darkest retention")}}),distribution:{method:u(n.method,`${e}.distribution.method`,0,127),backwards:N(n.backwards,`${e}.distribution.backwards`)},colour_speed:I(t.colour_speed,`${e}.colour_speed`),colour_retention:I(t.colour_retention,`${e}.colour_retention`),palette:Pe(t.palette,`${e}.palette`,255,!0),selected_movement:ci(t.selected_movement,`${e}.selected_movement`),overall_movement:ci(t.overall_movement,`${e}.overall_movement`),priority:I(t.priority,`${e}.priority`),unknown_flags:Yi(t.unknown_flags,zs,`${e}.unknown_flags`),excess:Xi(t.excess,`${e}.excess`)}}function ci(r,e){const t=m(r,e);return{enabled:N(t.enabled,`${e}.enabled`),enter_exit:N(t.enter_exit,`${e}.enter_exit`),direction:u(t.direction,`${e}.direction`,0,3),distance:I(t.distance,`${e}.distance`),speed:I(t.speed,`${e}.speed`),unknown_flags:Yi(t.unknown_flags,js,`${e}.unknown_flags`)}}function Je(r,e){const t=m(r,e);return{sku:v(t.sku,`${e}.sku`,x),scene_id:u(t.scene_id,`${e}.scene_id`,0,65535),effect_id:u(t.effect_id,`${e}.effect_id`,0,65535),catalogue_schema_version:u(t.catalogue_schema_version,`${e}.catalogue_schema_version`,1,Lt)}}function Pe(r,e,t,i=!1){const s=C(r,e,t);return!i&&s.length===0&&g(`${e} must not be empty`),s.map((n,a)=>$e(n,`${e}[${a}]`))}function $e(r,e){const t=C(r,e,3);return t.length!==3&&g(`${e} must contain three channels`),t.map(i=>u(i,`${e} channel`,0,255))}function nr(r,e){return r===null?null:$e(r,e)}function ar(r,e){return r===null?null:N(r,e)}function or(r,e){const t=m(r,e);return{left:u(t.left,`${e}.left`,1,100),top:u(t.top,`${e}.top`,1,100),right:u(t.right,`${e}.right`,1,100),bottom:u(t.bottom,`${e}.bottom`,1,100)}}function W(r,e){return r!=="supported"&&r!=="unsupported"&&r!=="evidence_gap"&&g(`${e} is invalid`),r}function yt(r,e){return ue(r,e,_e),m(r,e)}function Me(r,e){return r===null?null:v(r,e,x)}function Nt(r,e){const t=v(r,e,qs);return(!/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(t)||Number.isNaN(Date.parse(t)))&&g(`${e} must be an ISO 8601 timestamp with a UTC offset`),t}function v(r,e,t){const i=xe(r,e);return(i.length===0||i.length>t)&&g(`${e} must contain 1 to ${t} characters`),i}function dr(r,e,t){const i=xe(r,e);return i.length>t&&g(`${e} must not exceed ${t} characters`),i}function Xi(r,e){const t=xe(r,e);return(t.length%2!==0||!/^[0-9a-f]*$/i.test(t))&&g(`${e} must be hexadecimal`),t}function xe(r,e){return typeof r!="string"&&g(`${e} must be a string`),r}function lr(r){return typeof r=="string"&&ye.includes(r)?r:void 0}function N(r,e){return typeof r!="boolean"&&g(`${e} must be a boolean`),r}function u(r,e,t,i=Lt){return(typeof r!="number"||!Number.isSafeInteger(r)||r<t||r>i)&&g(`${e} must be an integer from ${t} to ${i}`),r}function Z(r,e,t){return u(r,e,t,Lt)}function F(r,e,t){const i=u(r,t,1);return i!==e&&g(`${t} is incompatible with this editor`),i}function $t(r,e,t,i){return r===null?null:u(r,e,t,i)}function I(r,e){return u(r,e,0,255)}function Yi(r,e,t){const i=I(r,t);return i&~e&&g(`${t} must only set reserved bits, not bits explicit fields carry`),i}function U(r,e,t){const i=xe(r,t);return e.includes(i)||g(`${t} is invalid`),i}function m(r,e){return(typeof r!="object"||r===null||Array.isArray(r))&&g(`${e} must be an object`),r}function C(r,e,t){return Array.isArray(r)||g(`${e} must be an array`),r.length>t&&g(`${e} must not exceed ${t} items`),r}function Q(r,e,t){const i=r.map(e);new Set(i).size!==i.length&&g(`${t} must be unique`)}function ue(r,e,t,i=Vs){let s=0;const n=(d,c,p)=>{if(s+=1,s>i&&g(`${e} must not exceed ${i} JSON values`),p>ai&&g(`${e} must not exceed ${ai} nested levels`),!(d===null||typeof d=="boolean")){if(typeof d=="number"){(!Number.isFinite(d)||Number.isInteger(d)&&!Number.isSafeInteger(d))&&g(`${c} must be a finite JSON number`);return}if(typeof d=="string"){d.length>dt&&g(`${c} must not exceed ${dt} characters`);return}if(Array.isArray(d)){d.length>H&&g(`${c} must not exceed ${H} items`),d.forEach((b,y)=>n(b,`${c}[${y}]`,p+1));return}if(typeof d=="object"&&d!==null){const b=Object.entries(d);b.length>H&&g(`${c} must not exceed ${H} fields`),b.forEach(([y,M])=>{y.length>dt&&g(`${c} contains an oversized key`),n(M,`${c}.${y}`,p+1)});return}g(`${c} contains a non-JSON value`)}};n(r,e,0);const a=JSON.stringify(r);a===void 0&&g(`${e} must contain JSON values`),new TextEncoder().encode(a).byteLength>t&&g(`${e} must not exceed ${t} bytes`)}function g(r){throw new Error(`Malformed Effect Studio server payload: ${r}.`)}function cr(r){return r.api_version===Us&&r.effect_schema_version===Ri&&r.compiler_version===Hs}const ut="ha_govee_led_ble/editor";class ur{constructor(e){this.hass=e}async info(){return Gs(await this.call("info"))}async devices(){const e=await this.call("devices");return Xs(A(e,"devices"))}async customCatalogue(){const e=await this.call("custom/catalogue");return Ys(A(e,"catalogue"))}async library(){return di(await this.call("library/list"))}async item(e){const t=await this.call("library/get",{item_id:e});return je(A(t,"item"))}async createItem(e,t,i){const s=await this.call("library/create",{name:e,content:Ee(t),expected_library_revision:i});return{item:je(A(s,"item")),library_revision:pt(s)}}async updateItem(e,t,i,s){const n=await this.call("library/update",{item_id:e.id,name:t,content:Ee(i),expected_revision:e.revision,expected_library_revision:s});return{item:je(A(n,"item")),library_revision:pt(n)}}async deleteItem(e,t){const i=await this.call("library/delete",{item_id:e.id,expected_revision:e.revision,expected_library_revision:t});return pt(i)}async drafts(){const e=await this.call("draft/list");return Qs(A(e,"drafts"))}async draft(e){const t=await this.call("draft/get",{draft_id:e});return ct(A(t,"draft"))}async createDraft(e,t,i,s){const n=await this.call("draft/create",{name:e,content:Ee(t),updated_at:new Date().toISOString(),selected_config_entry_id:i,...s?{base_item_id:s.id,base_item_revision:s.revision}:{}});return ct(A(n,"draft"))}async updateDraft(e,t,i,s){const n=await this.call("draft/update",{draft_id:e.id,expected_revision:e.revision,name:t,content:Ee(i),updated_at:new Date().toISOString(),selected_config_entry_id:s});return ct(A(n,"draft"))}async deleteDraft(e){await this.call("draft/delete",{draft_id:e.id,expected_revision:e.revision})}async applySaved(e,t){const i=await this.call("apply",{config_entry_id:e,item_id:t.id,revision:t.revision,updated_at:new Date().toISOString()});return vt(A(i,"deployment"))}async applySnapshot(e,t,i){const s=await this.call("apply_snapshot",{config_entry_id:e,name:t,content:Ee(i),updated_at:new Date().toISOString()});return vt(A(s,"deployment"))}async sceneCatalogue(e){const t=await this.call("scene/catalogue/list",{config_entry_id:e});return tr(A(t,"catalogue"))}sceneDetail(e,t,i){return this.call("scene/catalogue/get",{config_entry_id:e,scene_id:t,effect_id:i}).then(ir)}async applyScene(e,t,i){const s=await this.call("scene/apply",{config_entry_id:e,scene_id:t.scene_id,effect_id:t.effect_id,...i===null?{}:{speed_index:i}}),n=Mt(A(s,"scene")),a=A(s,"readback");if(a!=="scene_identity_only")throw new Error("Malformed Effect Studio server payload: scene Apply readback is invalid.");const d=A(s,"speed_index");if(d!==null&&(typeof d!="number"||!Number.isSafeInteger(d)||d<0||d>255))throw new Error("Malformed Effect Studio server payload: scene Apply speed is invalid.");return{scene:n,speed_index:d,readback:a}}subscribeLibrary(e,t){return this.hass.connection.subscribeMessage(i=>{try{e(di(i))}catch(s){t?.(ui(s))}},{type:`${ut}/library/subscribe`})}subscribeDeployments(e,t){return this.hass.connection.subscribeMessage(i=>{try{e(er(i))}catch(s){t?.(ui(s))}},{type:`${ut}/deployment/subscribe`})}call(e,t={}){return this.hass.callWS({type:`${ut}/${e}`,...t})}}function A(r,e){if(typeof r!="object"||r===null||Array.isArray(r))throw new Error("Malformed Effect Studio server payload: response must be an object.");if(!(e in r))throw new Error(`Malformed Effect Studio server payload: response is missing ${e}.`);return r[e]}function pt(r){const e=A(r,"library_revision");if(typeof e!="number"||!Number.isSafeInteger(e)||e<0)throw new Error("Malformed Effect Studio server payload: library revision is invalid.");return e}function ui(r){return r instanceof Error?r:new Error("Malformed Effect Studio server payload.")}var pr=Object.defineProperty,Wi=(r,e,t,i)=>{for(var s=void 0,n=r.length-1,a;n>=0;n--)(a=r[n])&&(s=a(e,t,s)||s);return s&&pr(e,t,s),s};const _t=17,Ji="ha_govee_led_ble/effect_studio/recent_colours",ze=[[255,69,58],[255,159,10],[255,214,10],[48,209,88],[99,230,226],[100,210,255],[10,132,255],[94,92,230],[191,90,242],[255,45,85],[172,142,104],[255,255,255],[174,174,178],[99,99,102],[28,28,30],[255,127,0],[139,0,255]];let be=hr();class Bt extends P{constructor(){super(...arguments),this.colour=[255,255,255],this.disabled=!1}render(){return o`
      <div class="preset-grid">
        ${be.map(e=>o`
            <button
              type="button"
              style="--preset-colour: ${w(e)}"
              aria-label="Use ${w(e)}"
              ?disabled=${this.disabled}
              @click=${()=>this.commit(e)}
            ></button>
          `)}
        <label
          class="custom-colour"
          style="--custom-colour: ${w(this.colour)}"
        >
          <input
            type="color"
            aria-label="Custom colour"
            .value=${w(this.colour)}
            ?disabled=${this.disabled}
            @input=${e=>this.emit("colour-changing",Qt(e.target.value))}
            @change=${e=>this.commit(Qt(e.target.value))}
          />
        </label>
      </div>
    `}commit(e){fr(e),this.emit("colour-changed",e)}emit(e,t){this.colour=[...t],this.dispatchEvent(new CustomEvent(e,{detail:{colour:[...t]},bubbles:!0,composed:!0}))}static{this.styles=[B,k`
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
      min-height: 40px;
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
  `]}}Wi([h({attribute:!1})],Bt.prototype,"colour");Wi([h({type:Boolean})],Bt.prototype,"disabled");function xt(r){return[...be[r%be.length]]}function hr(){const r=localStorage.getItem(Ji);if(!r)return J(ze);let e;try{e=JSON.parse(r)}catch(i){if(i instanceof SyntaxError)return J(ze);throw i}if(!Array.isArray(e))return J(ze);const t=e.filter(mr).map(i=>[...i]).slice(0,_t);return Zi(t)}function fr(r){const e=w(r);be=Zi([[...r],...be.filter(t=>w(t)!==e)]),localStorage.setItem(Ji,JSON.stringify(be))}function Zi(r){const e=J(r);for(const t of ze)e.length>=_t||e.some(i=>w(i)===w(t))||e.push([...t]);return e.slice(0,_t)}function mr(r){return Array.isArray(r)&&r.length===3&&r.every(e=>Number.isInteger(e)&&e>=0&&e<=255)}customElements.get("govee-colour-picker")||customElements.define("govee-colour-picker",Bt);var gr=Object.defineProperty,q=(r,e,t,i)=>{for(var s=void 0,n=r.length-1,a;n>=0;n--)(a=r[n])&&(s=a(e,t,s)||s);return s&&gr(e,t,s),s};class O extends P{constructor(){super(...arguments),this.palette=[],this.minColours=1,this.maxColours=8,this.disabled=!1,this.persistentPicker=!1,this.ariaLabel="Colours",this.itemName="colour",this.windowPointerDown=e=>{this.editingIndex!==void 0&&!e.composedPath().includes(this)&&(this.editingIndex=void 0)}}connectedCallback(){super.connectedCallback(),window.addEventListener("pointerdown",this.windowPointerDown)}disconnectedCallback(){window.removeEventListener("pointerdown",this.windowPointerDown),super.disconnectedCallback()}willUpdate(e){e.has("palette")&&this.editingIndex!==void 0&&this.editingIndex>=this.palette.length&&(this.editingIndex=void 0)}render(){const e=this.persistentPicker?this.selectedIndex:this.editingIndex,t=this.palette.map((i,s)=>({key:`${s}-${w(i)}`,label:`${pi(this.itemName)} ${s+1}`,ariaLabel:this.itemAriaLabel(i,s),colour:w(i),removeReady:!this.persistentPicker&&this.editingIndex===s&&this.palette.length>this.minColours,disabled:this.disabled}));return o`
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
      >
        ${this.persistentPicker||this.editingIndex===void 0?l:o`
              <div
                slot="item-${this.editingIndex}"
                class="strip-popover colour-popover"
                role="dialog"
                aria-label="Edit colour"
                @keydown=${i=>this.popoverKeyPressed(this.editingIndex,i)}
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
          `:l}
    `}itemAriaLabel(e,t){const i=`${pi(this.itemName)} ${t+1}`;return this.persistentPicker?`${i}, ${w(e)}${t===this.selectedIndex?", selected":""}`:this.editingIndex===t&&this.palette.length>this.minColours?`Remove colour ${t+1}`:`Edit colour ${t+1}, ${w(e)}. Drag to reorder or use arrow keys.`}renderPicker(e,t){return o`
      <govee-colour-picker
        .colour=${t}
        .disabled=${this.disabled}
        @colour-changing=${i=>this.updateColour(e,i.detail.colour)}
        @colour-changed=${i=>this.commitColour(e,i.detail.colour)}
      ></govee-colour-picker>
    `}commitColour(e,t){this.updateColour(e,t),!this.persistentPicker&&(this.editingIndex=void 0,this.focusSwatchAfterUpdate(e))}updateColour(e,t){const i=J(this.palette);i[e]=[...t],this.emitPalette(i)}addColour(){if(this.disabled||this.palette.length>=this.maxColours)return;const e=this.palette[this.palette.length-1]??xt(this.palette.length),t=[...J(this.palette),[...e]],i=t.length-1;this.persistentPicker?this.selectColour(i,t[i]):this.editingIndex=i,this.emitPalette(t)}removeColour(e){if(this.disabled||this.palette.length<=this.minColours)return;const t=this.palette.filter((s,n)=>n!==e).map(s=>[...s]),i=Math.min(e,t.length-1);this.editingIndex=void 0,this.emitPalette(t),this.focusSwatchAfterUpdate(i)}reorder(e,t){if(this.disabled||e===t)return;const i=J(this.palette),[s]=i.splice(e,1);if(i.splice(t,0,s),this.editingIndex=this.editingIndex===e?t:Ye(this.editingIndex,e,t),this.persistentPicker){const n=Ye(this.selectedIndex,e,t);n!==void 0&&this.selectColour(n,i[n])}this.emitPalette(i)}focusSwatchAfterUpdate(e){this.updateComplete.then(()=>{this.shadowRoot?.querySelector("govee-reorderable-strip")?.focusItem(e)})}popoverKeyPressed(e,t){t.key==="Escape"&&(t.preventDefault(),t.stopPropagation(),this.editingIndex=void 0,this.focusSwatchAfterUpdate(e))}swatchClicked(e){if(this.persistentPicker){this.selectColour(e,this.palette[e]);return}if(this.editingIndex===e&&this.palette.length>this.minColours){this.removeColour(e);return}this.editingIndex=this.editingIndex===e?void 0:e}selectColour(e,t){this.selectedIndex=e,this.dispatchEvent(new CustomEvent("colour-selected",{detail:{index:e,colour:[...t]},bubbles:!0,composed:!0}))}emitPalette(e){this.palette=e,this.dispatchEvent(new CustomEvent("palette-changed",{detail:{palette:e},bubbles:!0,composed:!0}))}static{this.styles=[B,k`
    :host {
      display: block;
    }

    .persistent-picker {
      margin-top: var(--studio-section-gap);
      padding-top: var(--studio-section-gap);
      border-top: 1px solid var(--studio-border);
    }
  `]}}q([h({attribute:!1})],O.prototype,"palette");q([h({type:Number})],O.prototype,"minColours");q([h({type:Number})],O.prototype,"maxColours");q([h({type:Boolean})],O.prototype,"disabled");q([h({type:Boolean})],O.prototype,"persistentPicker");q([h({type:Number})],O.prototype,"selectedIndex");q([h()],O.prototype,"ariaLabel");q([h()],O.prototype,"itemName");q([f()],O.prototype,"editingIndex");function pi(r){return r.charAt(0).toUpperCase()+r.slice(1)}customElements.get("govee-palette-editor")||customElements.define("govee-palette-editor",O);var br=Object.defineProperty,Rt=(r,e,t,i)=>{for(var s=void 0,n=r.length-1,a;n>=0;n--)(a=r[n])&&(s=a(e,t,s)||s);return s&&br(e,t,s),s};class st extends P{constructor(){super(...arguments),this.disabled=!1}updated(){if(this.content){if(this.content.kind==="h617a_single"||this.content.kind==="palette_diy"){const e=this.shadowRoot?.querySelector("select[data-single-variation]");e&&(e.value=String(this.content.variant));return}this.content.effects.forEach((e,t)=>{const i=this.effectFamily(e,!0),s=this.shadowRoot?.querySelector(`select[data-effect-index="${t}"]`),n=this.shadowRoot?.querySelector(`select[data-variation-index="${t}"]`);s&&(s.value=i?.id??`unknown:${e.family}`),n&&(n.value=String(e.variant))})}}render(){if(!this.content||!this.catalogue)return l;const e=(this.content.kind==="h617a_single"||this.content.kind==="palette_diy")&&this.effectFamily(this.content)?.rate==="sensitivity"?"Sensitivity":"Speed";return o`
      ${this.content.kind==="h617a_multi"?o`
            <section class="card effect-card">
              <h3 class="section-title">Effects</h3>
              ${this.renderSequence(this.content)}
            </section>
          `:l}

      <section class="card parameters-card">
        <div class="parameter-stack">
          ${this.renderSingleVariation()}
          <div class="parameter-group">
            <span class="parameter-label">Colours</span>
            ${this.renderPalette()}
          </div>
          <div class="parameter-group speed-group">
            <span class="parameter-label">${e}</span>
            <div class="range-field">
              <input
                aria-label=${e}
                type="range"
                min="0"
                max="100"
                .value=${String(this.content.speed)}
                ?disabled=${this.disabled}
                @input=${t=>this.emitContent({...this.content,speed:Number(t.target.value)})}
              />
              <output>${this.content.speed}</output>
            </div>
          </div>
        </div>
      </section>
    `}renderSingleVariation(){if(!this.content||this.content.kind!=="h617a_single"&&this.content.kind!=="palette_diy")return l;const e=this.content,i=this.effectFamily(e)?.variations??[],s=i.some(n=>n.variant===e.variant);return s&&i.length<=1?l:o`
      <label class="field parameter-group">
        <span class="parameter-label">Variation</span>
        <select
          aria-label="Variation"
          data-single-variation
          .value=${String(e.variant)}
          ?disabled=${this.disabled}
          @change=${n=>this.emitContent({...e,variant:Number(n.target.value)})}
        >
          ${s?l:o`
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
        title="Add another effect"
        aria-label="Add another effect"
        ?disabled=${this.disabled||e.effects.length>=this.catalogue.limits.multi_max}
        @click=${this.addEffect}
      >
        +
      </button>
    `}effectRow(e,t){const i=this.effectFamily(e,!0),s=i?.variations??[];return o`
      <li
        class="effect-row"
        draggable=${this.disabled?"false":"true"}
        @dragstart=${n=>this.effectDragStarted(t,n)}
        @dragover=${n=>{this.disabled||n.preventDefault()}}
        @drop=${n=>this.effectDropped(t,n)}
      >
        <div class="effect-fields">
          <label class="field">
            <span>Effect</span>
            <select
              aria-label="Effect ${t+1}"
              data-effect-index=${t}
              .value=${i?.id??`unknown:${e.family}`}
              ?disabled=${this.disabled}
              @change=${n=>this.effectFamilyChanged(t,n.target.value)}
            >
              ${i?l:o`
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
              aria-label="Variation ${t+1}"
              data-variation-index=${t}
              .value=${String(e.variant)}
              ?disabled=${this.disabled}
              @change=${n=>this.effectVariationChanged(t,Number(n.target.value))}
            >
              ${s.some(n=>n.variant===e.variant)?l:o`
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
        ${this.disabled?l:o`
              <details class="row-menu">
                <summary aria-label="Reorder or remove effect ${t+1}">
                  ⋮
                </summary>
                <div class="row-menu-popover">
                  <button
                    type="button"
                    ?disabled=${this.disabled||t===0}
                    @click=${n=>{this.closeDetails(n),this.moveEffect(t,-1)}}
                  >
                    Move up
                  </button>
                  <button
                    type="button"
                    ?disabled=${this.disabled||t===this.content.effects.length-1}
                    @click=${n=>{this.closeDetails(n),this.moveEffect(t,1)}}
                  >
                    Move down
                  </button>
                  <button
                    class="danger"
                    type="button"
                    ?disabled=${this.disabled||this.content.effects.length===1}
                    @click=${n=>{this.closeDetails(n),this.removeEffect(t)}}
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
        @palette-changed=${e=>{this.emitContent({...this.content,palette:J(e.detail.palette)})}}
      ></govee-palette-editor>
    `}effectFamilyChanged(e,t){const i=this.multiFamilies.find(n=>n.id===t),s=i?.variations[0];!i||!s||this.replaceEffect(e,{family:i.family,variant:s.variant})}effectVariationChanged(e,t){if(!this.content||this.content.kind!=="h617a_multi")return;const i=this.content.effects[e];i&&this.replaceEffect(e,{...i,variant:t})}replaceEffect(e,t){if(!this.content||this.content.kind!=="h617a_multi")return;const i=this.content.effects.map((s,n)=>n===e?t:s);this.emitContent({...this.content,effects:i})}addEffect(){if(!this.content||this.content.kind!=="h617a_multi")return;const e=this.multiFamilies[this.content.effects.length]??this.multiFamilies[0],t=e?.variations[0];if(!e||!t)return;const i=[...this.content.effects,{family:e.family,variant:t.variant}];this.emitContent({...this.content,effects:i})}removeEffect(e){if(!this.content||this.content.kind!=="h617a_multi")return;const t=this.content.effects.filter((i,s)=>s!==e);this.emitContent({...this.content,effects:t})}moveEffect(e,t){if(!this.content||this.content.kind!=="h617a_multi")return;const i=e+t;i<0||i>=this.content.effects.length||this.reorderEffect(e,i)}reorderEffect(e,t){if(!this.content||this.content.kind!=="h617a_multi"||e===t)return;const i=[...this.content.effects],[s]=i.splice(e,1);i.splice(t,0,s),this.emitContent({...this.content,effects:i})}effectDragStarted(e,t){this.draggedEffectIndex=e,t.dataTransfer?.setData("text/plain",String(e))}effectDropped(e,t){t.preventDefault(),this.draggedEffectIndex!==void 0&&(this.reorderEffect(this.draggedEffectIndex,e),this.draggedEffectIndex=void 0)}closeDetails(e){e.currentTarget.closest("details")?.removeAttribute("open")}effectFamily(e,t=!1){return(t?this.multiFamilies:this.catalogue?.effects)?.find(i=>i.family===e.family)}emitContent(e){this.dispatchEvent(new CustomEvent("content-changed",{detail:{content:e},bubbles:!0,composed:!0}))}static{this.styles=[B,oe,de,k`
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

    .effect-row[draggable="true"] {
      cursor: grab;
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

    .range-field {
      grid-template-columns: minmax(100px, 1fr) 44px;
      margin-top: 0;
    }

    @media (max-width: 560px) {
      .effect-fields {
        grid-template-columns: 1fr;
      }
    }

  `]}}Rt([h({attribute:!1})],st.prototype,"content");Rt([h({attribute:!1})],st.prototype,"catalogue");Rt([h({type:Boolean})],st.prototype,"disabled");customElements.get("govee-custom-effect-editor")||customElements.define("govee-custom-effect-editor",st);const he={ATTRIBUTE:1,PROPERTY:3,BOOLEAN_ATTRIBUTE:4},vr=r=>(...e)=>({_$litDirective$:r,values:e});class yr{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}}const $r=r=>r.strings===void 0,_r={},xr=(r,e=_r)=>r._$AH=e;const hi=vr(class extends yr{constructor(r){if(super(r),r.type!==he.PROPERTY&&r.type!==he.ATTRIBUTE&&r.type!==he.BOOLEAN_ATTRIBUTE)throw Error("The `live` directive is not allowed on child or event bindings");if(!$r(r))throw Error("`live` bindings can only contain a single expression")}render(r){return r}update(r,[e]){if(e===R||e===l)return e;const t=r.element,i=r.name;if(r.type===he.PROPERTY){if(e===t[i])return R}else if(r.type===he.BOOLEAN_ATTRIBUTE){if(!!e===t.hasAttribute(i))return R}else if(r.type===he.ATTRIBUTE&&t.getAttribute(i)===e+"")return R;return xr(r),e}});var wr=Object.defineProperty,rt=(r,e,t,i)=>{for(var s=void 0,n=r.length-1,a;n>=0;n--)(a=r[n])&&(s=a(e,t,s)||s);return s&&wr(e,t,s),s};const kr=new Set(["rhythm","bloom","shiny"]),Er=new Set(["point","gradient","relative_brightness","key_count","direction","segment_count","speed"]),Qi=[{id:"clockwise",label:"Clockwise"},{id:"two_way",label:"Two-way"},{id:"counterclockwise",label:"Counterclockwise"}];class Oe extends P{constructor(){super(...arguments),this.disabled=!1,this.showModeSelector=!0,this.modeChanged=e=>{const t=e.target.value;this.updateContent(i=>(i.mode=t,i.parameters=Sr(i.parameters),i.calm=ht(t)?i.calm??!1:null,i))}}willUpdate(e){e.has("content")&&this.content?.colour!=null&&(this.lastFixedColour=re(this.content.colour))}render(){if(!this.content)return l;const e=Cr(this.content.mode,this.catalogue),t=this.catalogue?.limits.music_sensitivity_min??0,i=this.catalogue?.limits.music_sensitivity_max??100,s=es(this.content.sensitivity,t,i),n=this.content.colour===null?"automatic":"fixed",a=this.content.colour??this.lastFixedColour??xt(0);return o`
      <section class="card">
        <div class="parameter-stack">
          ${this.showModeSelector?o`
                <label class="field">
                  <span class="parameter-label">Mode</span>
                  <select
                    aria-label="Mode"
                    .value=${hi(this.content.mode)}
                    ?disabled=${this.disabled}
                    @change=${this.modeChanged}
                  >
                    ${e.map(d=>o`
                        <option
                          value=${d.id}
                          .selected=${d.id===this.content?.mode}
                        >
                          ${d.label}
                        </option>
                      `)}
                  </select>
                </label>
              `:l}

          ${this.renderRangeField("Sensitivity","Sensitivity",s,t,i,d=>this.updateContent(c=>(c.sensitivity=d,c)))}

          ${this.renderSegmentedField("Colour mode",n,[{value:"automatic",label:"Automatic"},{value:"fixed",label:"Fixed"}],d=>this.colourModeChanged(d==="fixed"))}

          ${n==="fixed"?o`
                <div class="parameter-group fixed-colour">
                  <span class="parameter-label">Fixed colour</span>
                  <govee-colour-picker
                    .colour=${a}
                    .disabled=${this.disabled}
                    @colour-changing=${d=>this.fixedColourChanged(d.detail.colour)}
                    @colour-changed=${d=>this.fixedColourChanged(d.detail.colour)}
                  ></govee-colour-picker>
                </div>
              `:l}

          ${ht(this.content.mode)?this.renderSegmentedField("Style",!!this.content.calm,[{value:!1,label:"Dynamic"},{value:!0,label:"Calm"}],d=>this.styleChanged(d)):l}

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
    `}renderRangeField(e,t,i,s,n,a){return o`
      <label class="range-field">
        <span class="parameter-label">${e}</span>
        <input
          type="range"
          aria-label=${t}
          min=${String(s)}
          max=${String(n)}
          .value=${String(i)}
          ?disabled=${this.disabled}
          @input=${d=>a(Number(d.target.value))}
        />
        <output>${i}</output>
      </label>
    `}renderModeParameters(e){switch(e.mode){case"separation":return this.renderSeparationParameters(e.parameters);case"hopping":return this.renderHoppingParameters(e.parameters);case"piano_keys":return this.renderPianoKeysParameters(e.parameters);case"fountain":return this.renderFountainParameters(e.parameters);case"day_and_night":return this.renderDayAndNightParameters(e.parameters);default:return l}}renderSeparationParameters(e){const t=Ce(e,"point",1,0,100),i=fi(e,"gradient",!0);return o`
      ${this.renderRangeField("Point","Point",t,0,100,s=>this.updateParameter("point",s))}
      ${this.renderCheckboxField("Gradient",i,s=>this.updateParameter("gradient",s))}
    `}renderHoppingParameters(e){const t=Ce(e,"relative_brightness",50,0,100);return o`
      ${this.renderRangeField("Relative brightness","Relative brightness",t,0,100,i=>this.updateParameter("relative_brightness",i))}
    `}renderPianoKeysParameters(e){const t=Ce(e,"key_count",15,1,15);return o`
      ${this.renderRangeField("Key count","Key count",t,1,15,i=>this.updateParameter("key_count",i))}
    `}renderFountainParameters(e){const t=Ar(e,"direction","clockwise");return o`
      <label class="field">
        <span class="parameter-label">Direction</span>
        <select
          aria-label="Direction"
          .value=${hi(t)}
          ?disabled=${this.disabled}
          @change=${i=>this.updateParameter("direction",i.target.value)}
        >
          ${Qi.map(i=>o`
              <option
                value=${i.id}
                .selected=${i.id===t}
              >
                ${i.label}
              </option>
            `)}
        </select>
      </label>
    `}renderDayAndNightParameters(e){const t=Ce(e,"segment_count",1,1,15),i=Ce(e,"speed",10,0,100),s=fi(e,"gradient",!1);return o`
      ${this.renderRangeField("Segment count","Segment count",t,1,15,n=>this.updateParameter("segment_count",n))}
      ${this.renderRangeField("Speed","Speed",i,0,100,n=>this.updateParameter("speed",n))}
      ${this.renderCheckboxField("Gradient",s,n=>this.updateParameter("gradient",n))}
    `}renderCheckboxField(e,t,i){return o`
      <label class="check-field">
        <input
          type="checkbox"
          .checked=${t}
          ?disabled=${this.disabled}
          @change=${s=>i(s.target.checked)}
        />
        <span class="parameter-label">${e}</span>
      </label>
    `}colourModeChanged(e){this.updateContent(t=>{if(!e)return this.lastFixedColour=t.colour===null?this.lastFixedColour:re(t.colour),t.colour=null,t;const i=t.colour??this.lastFixedColour??xt(0);return this.lastFixedColour=re(i),t.colour=re(i),t})}fixedColourChanged(e){this.lastFixedColour=re(e),this.updateContent(t=>(t.colour=re(e),t))}styleChanged(e){this.updateContent(t=>(ht(t.mode)&&(t.calm=e),t))}updateParameter(e,t){this.updateContent(i=>{const s=Ot(i.parameters);return s[e]=t,i.parameters=s,i})}updateContent(e){if(!this.content)return;const t=ft(e(ft(this.content)));this.content=t,this.dispatchEvent(new CustomEvent("content-changed",{detail:{content:ft(t)},bubbles:!0,composed:!0}))}static{this.styles=[B,oe,de,k`
      :host {
        display: block;
      }

      input[type="range"] {
        width: 100%;
      }

      .range-field {
        grid-template-columns: minmax(112px, auto) minmax(100px, 1fr) 56px;
        font-variant-numeric: tabular-nums;
      }

      @media (max-width: 560px) {
        .range-field {
          grid-template-columns: 1fr 56px;
        }

        .range-field > span:first-child {
          grid-column: 1 / -1;
        }
      }
    `]}}rt([h({attribute:!1})],Oe.prototype,"content");rt([h({attribute:!1})],Oe.prototype,"catalogue");rt([h({type:Boolean})],Oe.prototype,"disabled");rt([h({type:Boolean})],Oe.prototype,"showModeSelector");function Cr(r,e){const t=e?.music_modes.map(i=>({...i}))??[];return t.some(i=>i.id===r)?t:[{id:r,label:`Unknown mode ${r}`},...t]}function Sr(r){const e=Ot(r);for(const t of Er)delete e[t];return e}function ht(r){return kr.has(r)}function Ce(r,e,t,i,s){const n=r[e];return typeof n!="number"||!Number.isFinite(n)?t:es(n,i,s)}function fi(r,e,t){return typeof r[e]=="boolean"?r[e]:t}function Ar(r,e,t){const i=r[e];return Qi.some(s=>s.id===i)?i:t}function es(r,e,t){return Math.min(t,Math.max(e,Math.round(r)))}function ft(r){return{...r,colour:Ir(r.colour),parameters:Ot(r.parameters)}}function Ot(r){return structuredClone(r)}function Ir(r){return r===null?null:re(r)}function re(r){return[...r]}customElements.get("govee-music-profile-editor")||customElements.define("govee-music-profile-editor",Oe);var Pr=Object.defineProperty,ts=(r,e,t,i)=>{for(var s=void 0,n=r.length-1,a;n>=0;n--)(a=r[n])&&(s=a(e,t,s)||s);return s&&Pr(e,t,s),s};class Ft extends P{constructor(){super(...arguments),this.colours=[],this.disabled=!1}render(){return o`
      <section class="card" aria-labelledby="painted-segments-heading">
        <h3 class="section-title" id="painted-segments-heading">
          Painted segments
        </h3>
        <div class="segments">
          ${this.colours.map((e,t)=>o`
              <button
                type="button"
                data-segment=${t}
                style="--segment-colour: ${w(e)}"
                aria-label="Segment ${t+1}, ${w(e)}"
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
    `}pointerStarted(e,t){this.disabled||(t.preventDefault(),this.paintingPointerId=t.pointerId,this.lastPaintedSegment=e,t.currentTarget.setPointerCapture(t.pointerId),this.selectSegment(e))}pointerMoved(e){if(e.pointerId!==this.paintingPointerId||!this.shadowRoot)return;const t=this.shadowRoot.elementFromPoint(e.clientX,e.clientY)?.closest("[data-segment]"),i=Number(t?.dataset.segment);Number.isInteger(i)&&i!==this.lastPaintedSegment&&(this.lastPaintedSegment=i,this.selectSegment(i))}pointerFinished(e){if(e.pointerId!==this.paintingPointerId)return;const t=this.shadowRoot?.querySelector(`[data-segment="${this.lastPaintedSegment}"]`);t?.hasPointerCapture(e.pointerId)&&t.releasePointerCapture(e.pointerId),this.paintingPointerId=void 0,this.lastPaintedSegment=void 0}segmentClicked(e,t){!this.disabled&&t.detail===0&&this.selectSegment(e)}selectSegment(e){this.dispatchEvent(new CustomEvent("segment-selected",{detail:{index:e},bubbles:!0,composed:!0}))}static{this.styles=[B,oe,k`
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
  `]}}ts([h({attribute:!1})],Ft.prototype,"colours");ts([h({type:Boolean})],Ft.prototype,"disabled");customElements.get("govee-painted-segment-editor")||customElements.define("govee-painted-segment-editor",Ft);var Tr=Object.defineProperty,S=(r,e,t,i)=>{for(var s=void 0,n=r.length-1,a;n>=0;n--)(a=r[n])&&(s=a(e,t,s)||s);return s&&Tr(e,t,s),s};class E extends P{constructor(){super(...arguments),this.library={library_revision:0,items:[]},this.isAdmin=!1,this.category="all",this.search="",this.name="",this.speedIndex=null,this.loading=!1,this.saving=!1,this.applying=!1,this.editingCopy=!1,this.requestGeneration=0}willUpdate(e){(e.has("device")||e.has("api"))&&(this.invalidateRequests(),this.catalogue=void 0,this.category="all",this.search="",this.selectedScene=void 0,this.selectedItem=void 0,this.content=void 0,this.editingCopy=!1,this.notice=void 0,this.error=void 0,this.loading=!!(this.api&&this.device))}updated(e){(e.has("device")||e.has("api"))&&this.api&&this.device&&this.loadCatalogue()}render(){return this.device?this.loading?o`<div class="status" role="status">Loading scenes...</div>`:this.error||!this.catalogue?o`
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
        ${this.filteredSceneEntries.map(e=>e.kind==="custom"?this.sceneButton(`custom:${e.item.id}`,e.label,()=>this.selectCustom(e.item)):this.sceneButton(fe(e.scene),e.label,()=>this.selectBuiltin(e.scene)))}
      </aside>

      <section class="editor-surface detail">
        ${this.notice?o`<div class="feedback notice" role="status">${this.notice}</div>`:l}
        ${this.selectedScene&&this.content?this.renderDetail():l}
      </section>
    `:o`
        <section class="empty">
          <h2>No loaded device</h2>
          <p>Load a Govee light before browsing its native scenes.</p>
        </section>
      `}get sortedCategories(){const e=[];return this.catalogue?.scenes.length&&e.push({id:"all",label:"All scenes"}),this.compatibleCustomScenes.length&&e.push({id:"custom",label:"Custom"}),e.push(...this.catalogue?.categories.filter(t=>this.catalogue?.scenes.some(i=>i.category_id===t.id)).map(t=>({id:t.id,label:t.name}))??[]),e.sort((t,i)=>Ie(t.label,i.label))}get compatibleCustomScenes(){return this.library.items.filter(e=>(e.kind==="scene_builtin"||e.kind==="scene_palette")&&e.template?.sku===this.catalogue?.sku)}get filteredCustomScenes(){return this.category==="all"||this.category==="custom"?this.compatibleCustomScenes:[]}get filteredBuiltinScenes(){return!this.catalogue||this.category==="custom"?[]:this.category==="all"?this.catalogue.scenes:this.catalogue.scenes.filter(e=>e.category_id===this.category)}get filteredSceneEntries(){const e=this.search.trim().toLocaleLowerCase();return[...this.filteredCustomScenes.map(t=>({kind:"custom",item:t,label:t.name})),...this.filteredBuiltinScenes.map(t=>({kind:"builtin",scene:t,label:t.display_name}))].filter(t=>!e||t.label.toLocaleLowerCase().includes(e)).sort((t,i)=>Ie(t.label,i.label))}get selectionKey(){return this.selectedItem?`custom:${this.selectedItem.id}`:this.selectedScene?fe(this.selectedScene):void 0}categoryButton(e,t){const i=this.category===e;return o`
      <button
        class="selector ${i?"selected":""}"
        type="button"
        aria-current=${i?"page":l}
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
    `}renderDetail(){const e=this.selectedScene,t=e.speed,i=this.speedIndex??t?.default_index??0,s=this.selectedItem!==void 0||this.editingCopy;return o`
      <header class="editor-heading">
        <div>
          ${s?o`
                <input
                  class="editor-name"
                  aria-label="Scene name"
                  maxlength="128"
                  .value=${this.name}
                  ?disabled=${!this.isAdmin}
                  @input=${n=>{this.name=n.target.value}}
                />
              `:o`<h2>${e.display_name}</h2>`}
        </div>
        <div class="actions">
          <button
            class="primary"
            type="button"
            ?disabled=${!this.isAdmin||this.saving||!this.hasCurrentSceneContent()}
            @click=${s?this.save:this.edit}
          >
            ${this.saving?"Saving...":s?"Save":"Edit"}
          </button>
          <button
            class="secondary"
            type="button"
            aria-describedby=${s&&this.content?.kind==="scene_palette"?"palette-apply-reason":l}
            ?disabled=${!this.isAdmin||!this.catalogue?.enabled||!this.hasCurrentSceneContent()||this.selectedItem!==void 0&&this.content?.kind!=="scene_builtin"||this.applying}
            @click=${this.apply}
          >
            ${this.applying?"Applying...":"Apply"}
          </button>
        </div>
      </header>

      ${this.catalogue?.enabled?l:o`
            <div class="feedback callout" role="note">
              Native scenes are disabled for this device in the integration
              options. Browsing and saving copies remain available.
            </div>
          `}

      ${s&&this.content?.kind==="scene_palette"?o`
            <div
              class="feedback callout"
              id="palette-apply-reason"
              role="note"
            >
              Saved palette scene copies cannot be applied. Apply the native
              catalogue scene through its scene identity instead.
            </div>
          `:l}

      ${t||this.content?.kind==="scene_palette"?this.renderParameters(t,i):l}
    `}renderParameters(e,t){const i=this.content?.kind==="scene_palette"?this.content:void 0;return o`
      <div class="card scene-parameters">
        <div class="parameter-list">
          ${e?o`
                <govee-segmented-control
                  .label=${"Speed"}
                  .value=${t}
                  .options=${Dr(e.option_count,e.default_index)}
                  .disabled=${!this.isAdmin}
                  @value-changed=${s=>{this.speedIndex=s.detail.value}}
                ></govee-segmented-control>
              `:l}
          ${i?this.renderPaletteParameters(i):l}
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
                    style="--scene-colour: ${w(t)}"
                    aria-label="Colour ${i+1}, ${w(t)}"
                  ></span>
                `)}
              </div>
            </section>
          `:l}
      <section class="parameter-entry visual-parameter">
        <span class="parameter-label">Sequence</span>
        <ol class="scene-steps" aria-label="Ordered scene steps">
          ${e.steps.map((t,i)=>o`
            <li>
              <span class="step-order">${i+1}</span>
              <span
                class="step-colour"
                style="--scene-colour: ${w(t.colour)}"
                aria-label="Step colour ${w(t.colour)}"
              ></span>
              <span>
                <strong>Raw value ${t.value}</strong>
                <small>Step colour ${w(t.colour)}</small>
                ${t.inline_colour?o`
                      <small>
                        Inline colour ${w(t.inline_colour)}
                      </small>
                    `:l}
              </span>
            </li>
          `)}
        </ol>
      </section>
    `}async loadCatalogue(){if(!this.api||!this.device)return;const e=this.beginRequest();this.loading=!0,this.error=void 0,this.notice=void 0,this.selectedScene=void 0,this.selectedItem=void 0,this.content=void 0;try{const t=await e.api.sceneCatalogue(e.deviceId);if(!this.requestIsCurrent(e))return;this.catalogue=t,this.category="all"}catch(t){this.requestIsCurrent(e)&&(this.error=D(t))}finally{this.requestIsCurrent(e)&&(this.loading=!1)}}selectCategory(e){this.invalidateRequests(),this.category=e,this.selectedScene=void 0,this.selectedItem=void 0,this.content=void 0,this.editingCopy=!1,this.notice=void 0}async selectBuiltin(e){if(!this.api||!this.device)return;const t=fe(e),i=this.beginRequest(t);this.notice=void 0,this.selectedScene=e,this.selectedItem=void 0,this.editingCopy=!1,this.content=void 0,this.name=e.display_name,this.speedIndex=e.speed?.default_index??null;try{const s=await i.api.sceneDetail(i.deviceId,e.scene_id,e.effect_id);if(!this.requestIsCurrent(i)||fe(s.scene)!==t)return;this.selectedScene=s.scene,this.content=s.content,this.name=s.scene.display_name,this.speedIndex=s.content.speed_index}catch(s){this.requestIsCurrent(i)&&(this.notice=D(s))}}async selectCustom(e){if(!this.api||!this.device||!this.catalogue)return;const t=this.catalogue,i=this.beginRequest(`custom:${e.id}`);this.notice=void 0,this.selectedScene=void 0,this.selectedItem=void 0,this.editingCopy=!1,this.content=void 0,this.name=e.name;try{const s=await i.api.item(e.id);if(!this.requestIsCurrent(i))return;if(s.content.kind!=="scene_builtin"&&s.content.kind!=="scene_palette")throw new Error("This custom scene uses an unsupported definition.");const n=s.content;if(n.template.sku!==t.sku)throw new Error(`This custom scene targets ${n.template.sku}, not ${t.sku}.`);const a=t.scenes.find(c=>c.scene_id===n.template.scene_id&&c.effect_id===n.template.effect_id);if(!a)throw new Error("The source scene is not in this device catalogue.");const d=await i.api.sceneDetail(i.deviceId,n.template.scene_id,n.template.effect_id);if(!this.requestIsCurrent(i)||fe(d.scene)!==fe(a))return;this.selectedScene=a,this.selectedItem=s,this.editingCopy=!1,this.content=n,this.name=s.name,this.speedIndex=n.speed_index??a.speed?.default_index??null}catch(s){this.requestIsCurrent(i)&&(this.notice=D(s))}}async save(){if(!this.api||!this.device||!this.catalogue||!this.selectedScene||!this.content||!this.hasCurrentSceneContent()||this.content.kind!=="scene_builtin"&&this.content.kind!=="scene_palette"||!this.isAdmin||this.saving)return;const e=(this.selectedItem?this.name.trim():this.name.trim()).trim();if(!e){this.notice="Give this custom scene a name before saving.";return}const t=this.content.kind==="scene_palette"?Mr({...this.content,speed_index:this.speedIndex}):{...this.content,speed_index:this.speedIndex},i=this.captureRequest();this.saving=!0,this.notice=void 0;try{const s=this.selectedItem?await this.api.updateItem(this.selectedItem,e,t,this.library.library_revision):await this.api.createItem(e,t,this.library.library_revision);if(s.item.content.kind!=="scene_builtin"&&s.item.content.kind!=="scene_palette")throw new Error("The saved scene returned an unsupported definition.");if(this.dispatchEvent(new CustomEvent("library-item-saved",{detail:{item:s.item,library_revision:s.library_revision},bubbles:!0,composed:!0})),!this.requestIsCurrent(i))return;this.requestGeneration+=1,this.activeSelectionIdentity=`custom:${s.item.id}`,this.selectedItem=s.item,this.editingCopy=!1,this.content=s.item.content,this.name=s.item.name,this.category="custom",this.notice="Custom scene saved."}catch(s){this.requestIsCurrent(i)&&(this.notice=gt(s)==="conflict"?"The library changed elsewhere. Reload the scene before saving.":`Save failed: ${D(s)}`)}finally{this.saving=!1}}edit(){if(!(!this.isAdmin||!this.selectedScene||!this.hasCurrentSceneContent())){if(this.selectedScene.scene_type===2&&this.content?.kind==="scene_layered"){this.dispatchSceneEdit();return}this.editingCopy=!0,this.name=`${this.selectedScene.display_name} copy`,this.notice=void 0}}dispatchSceneEdit(){!this.selectedScene||this.content?.kind!=="scene_layered"||this.dispatchEvent(new CustomEvent("scene-edit-selected",{detail:{content:it({...this.content,speed_index:this.speedIndex}),config_entry_id:this.device.config_entry_id,name:`${this.selectedScene.display_name} copy`},bubbles:!0,composed:!0}))}async apply(){if(!this.api||!this.device||!this.selectedScene||!this.hasCurrentSceneContent()||!this.isAdmin||!this.catalogue?.enabled||this.selectedItem!==void 0&&this.content?.kind!=="scene_builtin"||this.applying)return;const e=this.captureRequest(),t=this.device,i=this.selectedScene,s=this.speedIndex;this.applying=!0,this.notice=void 0;try{await e.api.applyScene(e.deviceId,i,s),this.requestIsCurrent(e)&&(this.notice=`Applied to ${t.display_name}. Scene identity can be read back; the selected speed remains optimistic.`)}catch(n){this.requestIsCurrent(e)&&(this.notice=`Apply failed: ${D(n)}`)}finally{this.applying=!1}}beginRequest(e){return this.requestGeneration+=1,this.activeSelectionIdentity=e,this.captureRequest()}captureRequest(){return{generation:this.requestGeneration,api:this.api,deviceId:this.device.config_entry_id,category:this.category,selectionIdentity:this.activeSelectionIdentity}}invalidateRequests(){this.requestGeneration+=1,this.activeSelectionIdentity=void 0}requestIsCurrent(e){return e.generation===this.requestGeneration&&e.api===this.api&&e.deviceId===this.device?.config_entry_id&&e.category===this.category&&e.selectionIdentity===this.activeSelectionIdentity}hasCurrentSceneContent(){return!this.catalogue||!this.selectedScene||!this.content||this.content.template.sku!==this.catalogue.sku||this.content.template.scene_id!==this.selectedScene.scene_id||this.content.template.effect_id!==this.selectedScene.effect_id?!1:this.activeSelectionIdentity===this.selectionKey}static{this.styles=[B,oe,Tt,Ai,Ii,Ti,de,Dt,Pi,k`
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
      border: 1px solid var(--studio-border);
      border-radius: 10px;
      background: var(--studio-card);
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

    .empty {
      max-width: 680px;
      padding: 28px;
      line-height: 1.55;
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
  `]}}S([h({attribute:!1})],E.prototype,"api");S([h({attribute:!1})],E.prototype,"device");S([h({attribute:!1})],E.prototype,"library");S([h({type:Boolean})],E.prototype,"isAdmin");S([f()],E.prototype,"catalogue");S([f()],E.prototype,"category");S([f()],E.prototype,"search");S([f()],E.prototype,"selectedScene");S([f()],E.prototype,"selectedItem");S([f()],E.prototype,"content");S([f()],E.prototype,"name");S([f()],E.prototype,"speedIndex");S([f()],E.prototype,"loading");S([f()],E.prototype,"saving");S([f()],E.prototype,"applying");S([f()],E.prototype,"editingCopy");S([f()],E.prototype,"notice");S([f()],E.prototype,"error");function fe(r){return`builtin:${r.scene_id}:${r.effect_id}`}function Dr(r,e){return Array.from({length:r},(t,i)=>({value:i,label:Lr(i,e)}))}function Lr(r,e){const t=r-e;if(t===0)return"Default";const i=Math.abs(t);return`${i} ${i===1?"step":"steps"} ${t<0?"lower":"higher"}`}function Mr(r){return{...r,template:{...r.template},steps:r.steps.map(e=>({...e,colour:[...e.colour],inline_colour:e.inline_colour===null?null:[...e.inline_colour]})),palette:r.palette.map(e=>[...e])}}customElements.get("govee-scene-browser")||customElements.define("govee-scene-browser",E);var Nr=Object.defineProperty,Ut=(r,e,t,i)=>{for(var s=void 0,n=r.length-1,a;n>=0;n--)(a=r[n])&&(s=a(e,t,s)||s);return s&&Nr(e,t,s),s};const Br=[{value:"movie",label:"Movie"},{value:"game",label:"Game"}],Rr=[{value:!0,label:"Full screen"},{value:!1,label:"Part screen"}],Or=[{key:"left",label:"Left"},{key:"top",label:"Top"},{key:"right",label:"Right"},{key:"bottom",label:"Bottom"}];function X(r,e,t){return Math.min(t,Math.max(e,Math.round(r)))}function Fr(r){return{...r}}function mi(r){return{...r,relative_brightness:Fr(r.relative_brightness)}}function is(r){const e=[r.left,r.top,r.right,r.bottom];return e.every(t=>t===e[0])?e[0]:void 0}function Ur(r){const e=is(r);return e!==void 0?e:X((r.left+r.top+r.right+r.bottom)/4,1,100)}function Hr(r){const e=X(r,1,100);return{left:e,top:e,right:e,bottom:e}}class nt extends P{constructor(){super(...arguments),this.disabled=!1,this.showModeSelector=!0}render(){if(!this.content)return o`
        <section class="card empty-state" role="status">
          <h3 class="section-title">Video profile unavailable</h3>
          <p class="muted">
            Load an H6199 video profile to edit video-sync settings.
          </p>
        </section>
      `;const e=this.content.relative_brightness,t=is(e)===void 0,i=Ur(e);return o`
      <div class="editor-grid">
        <section class="card">
          <div class="parameter-stack">
            ${this.showModeSelector?this.renderSegmentedField("Mode",this.content.mode,Br,s=>this.updateContent(n=>{n.mode=s})):l}
            ${this.renderSegmentedField("Capture area",this.content.full_screen,Rr,s=>this.updateContent(n=>{n.full_screen=s}))}
            ${this.renderCheckboxField("Sound effects",this.content.sound_effects,s=>this.updateContent(n=>{n.sound_effects=s}))}
            ${this.content.sound_effects?this.renderRangeField("Softness",this.content.sound_effects_softness,1,100,String(this.content.sound_effects_softness),s=>this.updateContent(n=>{n.sound_effects_softness=X(s,1,100)})):l}
            ${this.renderCheckboxField("Blank screen",this.content.blank_screen,s=>this.updateContent(n=>{n.blank_screen=s}))}
          </div>
        </section>

        <section class="card">
          <h3 class="section-title">Image</h3>
          <div class="parameter-stack">
            ${this.renderRangeField("Saturation",this.content.saturation,0,100,`${this.content.saturation}%`,s=>this.updateContent(n=>{n.saturation=X(s,0,100)}))}
            ${this.renderWhiteBalanceField(this.content.white_balance_position)}
          </div>
        </section>

        <section class="card brightness-card">
          <div class="card-heading">
            <h3 class="section-title">Relative brightness</h3>
            ${t?o`<span class="status-chip">Mixed edges</span>`:l}
          </div>
          <div class="parameter-stack">
            ${this.renderRangeField("Uniform brightness",i,1,100,`${i}%`,s=>this.updateContent(n=>{n.relative_brightness=Hr(s)}),t?"relative-brightness-note":void 0)}
            ${t?o`
                  <p class="section-note muted" id="relative-brightness-note">
                    Edges differ.  Adjust Uniform brightness to align all four
                    sides, or adjust them around the screen.
                  </p>
                `:l}
            <div
              class="screen-brightness"
              role="group"
              aria-label="Screen edge brightness"
            >
              ${this.renderScreenEdgeControl("top","Top",e.top)}
              ${this.renderScreenEdgeControl("left","Left",e.left)}
              <div class="virtual-screen" aria-hidden="true">
                ${Or.map(({key:s})=>o`
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
      <label class="check-field">
        <input
          type="checkbox"
          .checked=${t}
          ?disabled=${this.disabled}
          @change=${s=>i(s.target.checked)}
        />
        <span class="parameter-label">${e}</span>
      </label>
    `}renderRangeField(e,t,i,s,n,a,d){return o`
      <label class="range-field">
        <span class="parameter-label">${e}</span>
        <input
          type="range"
          min=${i}
          max=${s}
          .value=${String(X(t,i,s))}
          aria-label=${e}
          aria-describedby=${d??l}
          ?disabled=${this.disabled}
          @input=${c=>a(Number(c.target.value))}
        />
        <output aria-label="${e} value">${n}</output>
      </label>
    `}renderWhiteBalanceField(e){return o`
      <label class="range-field white-balance-field">
        <span class="parameter-label">White balance</span>
        <div class="slider-with-endpoints">
          <input
            type="range"
            min="1"
            max="20"
            .value=${String(X(e,1,20))}
            aria-label="White balance"
            ?disabled=${this.disabled}
            @input=${t=>this.updateContent(i=>{i.white_balance_position=X(Number(t.target.value),1,20)})}
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
    `}updateRelativeBrightnessEdge(e,t){this.updateContent(i=>{i.relative_brightness[e]=X(t,1,100)})}updateContent(e){if(!this.content)return;const t=mi(this.content);e(t),this.emitContent(t)}emitContent(e){this.dispatchEvent(new CustomEvent("content-changed",{detail:{content:mi(e)},bubbles:!0,composed:!0}))}static{this.styles=[B,oe,de,k`
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

      .field,
      .range-field {
        margin-top: 0;
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
        width: 24px;
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
      }

      .card-heading {
        margin-bottom: 14px;
      }

      .card-heading h3 {
        margin-bottom: 0;
      }

      .range-field {
        grid-template-columns: minmax(118px, auto) minmax(0, 1fr) 64px;
        align-items: center;
        gap: 10px;
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
    `]}}Ut([h({attribute:!1})],nt.prototype,"content");Ut([h({type:Boolean})],nt.prototype,"disabled");Ut([h({type:Boolean})],nt.prototype,"showModeSelector");customElements.get("govee-video-profile-editor")||customElements.define("govee-video-profile-editor",nt);var qr=Object.defineProperty,_=(r,e,t,i)=>{for(var s=void 0,n=r.length-1,a;n>=0;n--)(a=r[n])&&(s=a(e,t,s)||s);return s&&qr(e,t,s),s};const wt=15;class $ extends P{constructor(){super(...arguments),this.showDevicePicker=!1,this.loading=!0,this.devices=[],this.section="custom",this.customEffectCategory="all",this.customCopyStarted=!1,this.library={library_revision:0,items:[]},this.name="",this.content=ge(),this.paintBrushes=Ne(),this.selectedPaintBrush=0,this.brushUsesBackground=!1,this.saving=!1,this.applying=!1,this.deployments=[],this.editorTransitionEpoch=0,this.loadEpoch=0,this.deploymentRevision=-1}get isAdmin(){return this.hass?.user?.is_admin===!0}get selectedDevice(){return this.devices.find(e=>e.config_entry_id===this.selectedDeviceId)}get selectedModel(){const e=this.selectedDevice?.model??this.devices[0]?.model;return e==="H617A"||e==="H6199"?e:void 0}get modelCatalogue(){const e=this.selectedModel;return e?this.customCatalogue?.models[e]:void 0}get videoAvailable(){return!!this.modelCatalogue?.video_modes.length}get customEffectsAvailable(){const e=this.modelCatalogue;return!!(e&&(e.painted_effects.length||e.effects.length||e.music_modes.length||e.supports.advanced!=="unsupported"))}get dirty(){return j(this.content)?this.savedBaseline!==se(this.name,this.content):!1}get applyCapability(){if(!G(this.content))return;const e=this.selectedDevice?.custom_effects;if(e)switch(this.content.kind){case"h617a_painted":return e.painted;case"h617a_single":return e.single;case"h617a_multi":return e.multi}}get canApply(){return G(this.content)&&this.isAdmin&&!this.applying&&!this.deletingCurrentItem&&this.name.trim().length>0&&this.applyCapability==="supported"}get deletingCurrentItem(){return this.deletingItemId!==void 0&&this.currentItem?.id===this.deletingItemId}get activeDeployment(){const e=this.deployments.find(t=>t.operation_id===this.activeOperationId);return e||!this.applying?e:this.latestDeployment(["pending","uploading","verifying"])}connectedCallback(){super.connectedCallback(),this.hass&&!this.api&&this.load()}disconnectedCallback(){super.disconnectedCallback(),this.loadEpoch+=1,this.beginEditorTransition(),this.stopSubscriptions(),this.api=void 0}updated(e){e.has("hass")&&this.hass&&!this.api&&this.load(),this.syncSingleEffectSelects()}render(){return this.loading?o`<div class="centred" role="status">Loading effect studio...</div>`:this.error?this.renderFatalError():o`
      <h1 class="visually-hidden">Effect Studio</h1>

      ${this.notice?o`<div class="notice" role="status">${this.notice}</div>`:l}

      <main
        class="studio ${this.section}-mode"
      >
        <nav class="primary-nav" aria-label="Create">
          ${this.videoAvailable?this.navButton("video","Video"):l}
          ${this.navButton("scenes","Scenes")}
          ${this.customEffectsAvailable?this.navButton("custom","Effects"):l}
          ${this.showDevicePicker?this.renderDevicePicker():l}
        </nav>

        <govee-scene-browser
          ?hidden=${this.section!=="scenes"}
          .api=${this.api}
          .device=${this.selectedDevice}
          .library=${this.library}
          .isAdmin=${this.isAdmin}
          @library-item-saved=${this.sceneLibraryItemSaved}
          @scene-edit-selected=${this.sceneTemplateSelected}
        ></govee-scene-browser>
        ${this.section==="video"?this.renderVideo():l}
        ${this.section==="custom"?this.renderCustomEffects():l}
      </main>
      ${this.deleteCandidate?this.renderDeleteConfirmation():l}
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
              `:l}
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
        aria-current=${this.section===e?"page":l}
        @click=${()=>{this.selectSection(e)}}
      >
        ${t}
      </button>
    `}renderCustomEffects(){const e=this.defaultNewEffectKind;return o`
      <aside
        class="sidebar category-sidebar effect-categories"
        aria-label="Effect categories"
      >
        ${e?o`
              <button
                class="selector"
                type="button"
                ?disabled=${!this.isAdmin}
                @click=${()=>this.newEffect(e)}
              >
                New
              </button>
            `:l}
        ${this.customEffectCategoryButton("all","All")}
        ${this.customEffectCategoryAvailable("music")?this.customEffectCategoryButton("music","Music"):l}
        ${this.customEffectCategoryAvailable("single-layer")?this.customEffectCategoryButton("single-layer","Single Layer"):l}
        ${this.customEffectCategoryAvailable("multi-layer")?this.customEffectCategoryButton("multi-layer","Multi Layer"):l}
        ${this.customEffectCategoryAvailable("advanced")?this.customEffectCategoryButton("advanced","Advanced"):l}
        ${this.customEffectCategoryAvailable("my-effects")?this.customEffectCategoryButton("my-effects","My effects"):l}
      </aside>

      <aside class="sidebar item-sidebar library" aria-label="Effects">
        ${this.customEffectEntries.map(t=>this.customEffectListButton(t))}
      </aside>

      <section class="editor-surface editor">
        ${this.name||this.currentItem?this.renderCurrentCustomEditor():l}
      </section>
    `}renderCurrentCustomEditor(){return G(this.content)?this.content.kind==="h617a_painted"?this.renderPaintedEditor():this.renderPaletteEffectEditor():this.content.kind==="palette_diy"?this.renderPaletteEffectEditor():this.content.kind==="music_profile"?this.renderMusicProfileEditor():Se(this.content)?this.renderAdvancedEditor():this.content.kind==="opaque"?this.renderOpaqueEditor(this.content):l}renderVideo(){const e=this.modelCatalogue;if(!e||!this.videoAvailable)return l;const t=this.library.items.filter(i=>i.kind==="video_profile"&&this.libraryItemAvailable(i)).sort((i,s)=>Ie(i.name,s.name));return o`
      <aside class="sidebar item-sidebar library" aria-label="Video profiles">
        ${e.video_modes.map(i=>this.videoListButton(`template:video:${i.id}`,i.label,()=>this.openVideoTemplate(i.id,i.label)))}
        ${t.map(i=>this.videoListButton(`saved:${i.id}`,i.name,()=>{this.selectItem(i.id)},i))}
      </aside>
      <section class="editor-surface editor">
        ${this.content.kind==="video_profile"?this.renderVideoProfileEditor():l}
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
    `}openVideoTemplate(e,t){this.selectedModel==="H6199"&&this.openEditableTemplate(t,Vr(e),`template:video:${e}`)}renderVideoProfileEditor(){return this.content.kind!=="video_profile"?l:o`
      ${this.renderProfileHeading()}
      <govee-video-profile-editor
        .content=${this.content}
        .disabled=${!this.isAdmin}
        .showModeSelector=${!this.templateSourceLabel}
        @content-changed=${e=>{this.content=as(e.detail.content)}}
      ></govee-video-profile-editor>
    `}renderMusicProfileEditor(){return this.content.kind!=="music_profile"?l:o`
      ${this.renderProfileHeading()}
      <govee-music-profile-editor
        .content=${this.content}
        .catalogue=${this.modelCatalogue}
        .disabled=${!this.isAdmin}
        .showModeSelector=${!this.templateSourceLabel}
        @content-changed=${e=>{this.content=ns(e.detail.content)}}
      ></govee-music-profile-editor>
    `}renderProfileHeading(){return this.renderEditorHeading(o`<button class="secondary" type="button" disabled>Apply</button>`)}get customEffectEntries(){const e=this.modelCatalogue,t=e?.effects.find(s=>s.id==="music");return[...e?.painted_effects.length?[{kind:"paint",key:"template:paint",label:"Paint",category:"single-layer"}]:[],...e?.music_modes.map(s=>({kind:"music",key:`template:music:${s.id}`,label:s.label,category:"music",mode:s.id}))??[],...t?[{kind:"music",key:`template:music:custom:${t.family}`,label:"Custom",category:"music",family:t.family,variant:t.variations[0].variant}]:[],...e?.effects.filter(s=>s.id!=="music").map(s=>({kind:"single",key:`template:single:${s.family}:${s.variations[0].variant}`,label:s.label,category:"single-layer",family:s.family,variant:s.variations[0].variant}))??[],...e?.supports.multi!=="unsupported"?[{kind:"multi",key:"template:mix",label:"Mix",category:"multi-layer"}]:[],{kind:"advanced",key:"template:advanced",label:"Layered",category:"advanced"},...this.library.items.filter(s=>mt(s.kind)&&s.kind!=="video_profile").map(s=>({kind:"saved",key:`saved:${s.id}`,label:s.name,category:Jr(s.kind),item:s}))].filter(s=>this.customEffectEntryAvailable(s)).filter(s=>this.customEffectCategory==="all"||this.customEffectCategory==="my-effects"&&s.kind==="saved"||s.category===this.customEffectCategory).sort((s,n)=>Ie(s.label,n.label))}customEffectEntryAvailable(e){switch(e.kind){case"paint":return this.customEffectKindAvailable("h617a_painted");case"single":return this.customEffectKindAvailable(this.selectedModel==="H617A"?"h617a_single":"palette_diy");case"music":return e.mode?this.customEffectKindAvailable("music_profile"):this.customEffectKindAvailable("palette_diy")||this.customEffectKindAvailable("h617a_single");case"multi":return this.customEffectKindAvailable("h617a_multi");case"advanced":return this.customEffectKindAvailable("advanced");case"saved":return this.libraryItemAvailable(e.item)}}libraryItemAvailable(e){const t=this.selectedModel;return e.model!==void 0&&e.model!==t?!1:e.kind==="video_profile"?this.videoAvailable:e.model===void 0&&["h617a_painted","h617a_single","h617a_multi"].includes(e.kind)&&t!=="H617A"?!1:this.customEffectKindAvailable(e.kind)}effectContentAvailable(e){const t=this.selectedModel;return e.kind==="h617a_painted"||e.kind==="h617a_single"||e.kind==="h617a_multi"?t==="H617A":e.kind==="palette_diy"||e.kind==="music_profile"||e.kind==="video_profile"?e.model===t:e.kind==="scene_layered"?e.template.sku===t:this.customEffectKindAvailable(e.kind)}customEffectCategoryAvailable(e){switch(e){case"all":return this.customEffectsAvailable;case"music":return!!this.modelCatalogue?.music_modes.length;case"single-layer":return this.customEffectKindAvailable("h617a_painted")||this.customEffectKindAvailable("h617a_single")||this.customEffectKindAvailable("palette_diy");case"multi-layer":return this.customEffectKindAvailable("h617a_multi");case"advanced":return this.customEffectKindAvailable("advanced");case"my-effects":return this.library.items.some(t=>t.kind!=="video_profile"&&mt(t.kind)&&this.libraryItemAvailable(t))}}customEffectKindAvailable(e){const t=this.modelCatalogue,i=this.selectedModel;return e==="h617a_painted"?i==="H617A"&&!!t?.painted_effects.length:e==="h617a_single"?i==="H617A"&&!!t?.effects.length:e==="palette_diy"?i==="H6199"&&!!t?.effects.length:e==="h617a_multi"?i==="H617A"&&t?.supports.multi!=="unsupported":e==="music_profile"?!!t?.music_modes.length:t?.supports.advanced!=="unsupported"}get defaultNewEffectKind(){return this.customEffectKindAvailable("h617a_single")?"h617a_single":this.customEffectKindAvailable("palette_diy")?"palette_diy":this.customEffectKindAvailable("h617a_painted")?"h617a_painted":this.customEffectKindAvailable("h617a_multi")?"h617a_multi":this.customEffectKindAvailable("advanced")?"advanced":void 0}customEffectCategoryButton(e,t){const i=this.customEffectCategory===e;return o`
      <button
        class="selector ${i?"selected":""}"
        type="button"
        aria-current=${i?"page":l}
        @click=${()=>{this.customEffectCategory=e}}
      >
        ${t}
      </button>
    `}customEffectListButton(e){const t=e.kind==="saved"?this.currentItem?.id===e.item.id:!this.currentItem&&this.customTemplateSelection===e.key;return o`
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
          class="delete-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-effect-title"
          @click=${i=>i.stopPropagation()}
          @keydown=${this.deleteDialogKeyDown}
        >
          <h2 id="delete-effect-title">Delete effect?</h2>
          <p>
            <strong>${e.name}</strong> will be removed from the shared
            Effect Studio library.
          </p>
          ${t?o`<p>Unsaved changes in the open effect will be discarded.</p>`:l}
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
    `}selectCustomEffectEntry(e){if(e.kind==="saved"){this.selectItem(e.item.id);return}if(e.kind==="advanced"){this.newEffect("advanced",void 0,{name:e.label,content:ot(),selectionIdentity:e.key,templateLabel:e.label}),this.customTemplateSelection=e.key;return}const t=this.modelCatalogue;if(t){if(e.kind==="music"){if(e.mode){this.openMusicTemplate(e.mode,e.label);return}if(e.family===void 0||e.variant===void 0)return;const i=this.selectedModel==="H617A"?{...K("h617a_single",t),family:e.family,variant:e.variant}:qe(t,this.selectedModel,e.family,e.variant);this.openEditableTemplate(e.label,i,e.key);return}if(e.kind==="paint"){this.newEffect("h617a_painted",void 0,{name:e.label,content:ge(),selectionIdentity:e.key,templateLabel:e.label});return}if(e.kind==="single"){if(this.selectedModel==="H617A"){const i=K("h617a_single",t);this.newEffect("h617a_single",void 0,{name:e.label,content:{...i,family:e.family,variant:e.variant},selectionIdentity:e.key,templateLabel:e.label})}else this.openEditableTemplate(e.label,qe(t,this.selectedModel,e.family,e.variant),e.key);return}this.newEffect("h617a_multi",void 0,{name:e.label,content:K("h617a_multi",t),selectionIdentity:e.key,templateLabel:e.label})}}openEditableTemplate(e,t,i){this.beginEditorTransition(),this.currentItem=void 0,this.templateSourceLabel=e,this.customCopyStarted=!0,this.customTemplateSelection=i,this.name=e,this.content=Ve(t),this.savedBaseline=void 0,this.notice=void 0}openMusicTemplate(e,t){const i=this.selectedModel;i!=="H617A"&&i!=="H6199"||this.openEditableTemplate(t,{kind:"music_profile",model:i,mode:e,sensitivity:i==="H6199"?100:99,colour:null,calm:["rhythm","bloom","shiny"].includes(e)?!1:null,parameters:{}},`template:music:${e}`)}renderAdvancedEditor(){if(!Se(this.content))return l;const e=this.content.kind==="scene_layered";return o`
      ${e?o`
            <button
              class="back-button"
              type="button"
              @click=${this.backToScenes}
            >
              ← Back to Scenes
            </button>
          `:l}
      ${this.renderEditorHeading(o`
          <button class="secondary" type="button" disabled>
            Apply
          </button>
        `)}

      ${this.renderNewEffectTypeTabs()}

      ${this.isAdmin?l:o`
            <div class="feedback read-only" role="note">
              You can inspect shared effects. An administrator is required to
              edit or save them.
            </div>
          `}

      ${e?o`
            <div class="feedback source-note" role="note">
              Source parameter bytes remain immutable provenance. Layer edits
              are saved separately and may diverge from those bytes.
            </div>
          `:l}

      <govee-advanced-effect-editor
        .content=${zr(this.content)}
        .disabled=${!this.isAdmin}
        .segmentCount=${this.selectedDevice?.segment_count??15}
        @content-changed=${t=>{Se(this.content)&&(this.content=Gr(this.content,t.detail.content))}}
      ></govee-advanced-effect-editor>
    `}renderOpaqueEditor(e){return o`
      ${this.renderEditorHeading(o`<button class="secondary" type="button" disabled>Apply</button>`,{save:!1,title:o`<h2>${this.name}</h2>`})}
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
    `}renderPaintedEditor(){if(this.content.kind!=="h617a_painted")return l;const e=this.activeDeployment;return o`
      ${this.renderEditorHeading(o`
        <button
          class="secondary"
          type="button"
          ?disabled=${!this.canApply}
          @click=${this.apply}
        >
          ${this.applying?"Applying...":"Apply"}
        </button>
      `)}

      ${this.renderNewEffectTypeTabs()}

      ${this.isAdmin?l:o`
            <div class="feedback read-only" role="note">
              You can inspect shared effects. An administrator is required to
              edit or apply them.
            </div>
          `}

      ${this.renderSingleEffectSelector()}

      <govee-painted-segment-editor
        .colours=${kt(this.content)}
        .disabled=${!this.isAdmin}
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
            .disabled=${!this.isAdmin}
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
              .disabled=${!this.isAdmin}
              @colour-changing=${this.backgroundChanged}
              @colour-changed=${this.backgroundChanged}
            ></govee-colour-picker>
          </div>
          <div class="button-row">
            <button
              class="secondary ${this.brushUsesBackground?"active":""}"
              type="button"
              ?disabled=${!this.isAdmin}
              aria-pressed=${this.brushUsesBackground}
              @click=${()=>{this.brushUsesBackground=!this.brushUsesBackground}}
            >
              Use background
            </button>
            <button
              class="secondary"
              type="button"
              ?disabled=${!this.isAdmin}
              @click=${this.paintAll}
            >
              Paint all
            </button>
            <button
              class="secondary"
              type="button"
              ?disabled=${!this.isAdmin}
              @click=${this.resetPaint}
            >
              Reset
            </button>
          </div>
        </section>

        <section class="card">
          <div class="parameter-stack">
            ${this.renderPaintedVariationField()}
            ${this.rangeField("Speed","speed",this.content.speed)}
            ${this.rangeField("Brightness","brightness",this.content.brightness)}
          </div>
        </section>
      </div>

      ${e?this.renderDeployment(e):l}
    `}renderPaletteEffectEditor(){if(this.content.kind!=="h617a_single"&&this.content.kind!=="h617a_multi"&&this.content.kind!=="palette_diy")return l;const e=this.content,t=this.activeDeployment;return o`
      ${this.renderEditorHeading(o`
        <button
          class="secondary"
          type="button"
          ?disabled=${!this.canApply}
          @click=${this.apply}
        >
          ${this.applying?"Applying...":"Apply"}
        </button>
      `)}

      ${this.renderNewEffectTypeTabs()}

      ${this.isAdmin?l:o`
            <div class="feedback read-only" role="note">
              You can inspect shared effects. An administrator is required to
              edit them.
            </div>
          `}

      ${this.renderSingleEffectSelector()}

      <govee-custom-effect-editor
        .content=${e}
        .catalogue=${this.modelCatalogue}
        .disabled=${!this.isAdmin}
        @content-changed=${i=>{this.content=i.detail.content.kind==="palette_diy"?rs(i.detail.content):ss(i.detail.content)}}
      ></govee-custom-effect-editor>

      ${t?this.renderDeployment(t):l}
    `}renderSingleEffectSelector(){if(!this.customCatalogue||this.templateSourceLabel||this.content.kind!=="h617a_painted"&&this.content.kind!=="h617a_single"&&this.content.kind!=="palette_diy"||this.currentItem?.content.kind==="h617a_painted"&&this.content.kind==="h617a_painted")return l;const e=this.selectedSingleEffectFamily,t=this.content.kind==="h617a_painted"?void 0:this.content.family,i=this.currentItem?.content.kind==="h617a_painted"?[]:this.modelCatalogue?.effects.filter(d=>d.id!=="music"||d.family===t)??[],s=i.some(d=>d.family===e?.family),n=this.content.kind==="h617a_painted"?"paint":e&&s?e.id:`unknown:${this.content.family}`,a=this.customEffectKindAvailable("h617a_painted")&&this.currentItem?.content.kind!=="h617a_single";return o`
      <section class="card single-effect-settings">
        <label class="field">
          <span>Effect</span>
          <select
            aria-label="Effect"
            .value=${n}
            ?disabled=${!this.isAdmin}
            @change=${this.singleEffectChanged}
          >
            ${(this.content.kind==="h617a_single"||this.content.kind==="palette_diy")&&!s?o`
                  <option value=${n}>
                    Unknown effect ${this.content.family}
                  </option>
                `:l}
            ${a?o`
                  <option
                    value="paint"
                    ?selected=${n==="paint"}
                  >
                    Paint
                  </option>
                `:l}
            ${i.map(d=>o`
                <option
                  value=${d.id}
                  ?selected=${n===d.id}
                >
                  ${d.label}
                </option>
              `)}
          </select>
        </label>
      </section>
    `}renderPaintedVariationField(){if(!this.customCatalogue||this.content.kind!=="h617a_painted")return l;const e=this.content,t=this.customCatalogue.painted_effects,i=t.some(s=>s.id===e.effect);return i&&t.length<=1?l:o`
      <label class="field">
        <span class="parameter-label">Variation</span>
        <select
          aria-label="Variation"
          .value=${e.effect}
          ?disabled=${!this.isAdmin}
          @change=${this.paintedEffectVariationChanged}
        >
          ${i?l:o`
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
    `}renderEffectName(){return this.templateSourceLabel?o`<h2>${this.templateSourceLabel}</h2>`:o`
          <input
            class="editor-name"
            aria-label="Effect name"
            maxlength="128"
            .value=${this.name}
            ?disabled=${!this.isAdmin}
            @input=${this.nameChanged}
          />
        `}renderEditorHeading(e,t={}){return o`
      <div class="editor-heading">
        <div>${t.title??this.renderEffectName()}</div>
        <div class="actions">
          ${t.save===!1?l:this.renderSaveAction()}
          ${e}
          ${this.renderEditorDeleteButton()}
        </div>
      </div>
    `}renderSaveAction(){return this.templateSourceLabel?o`
          <button
            class="primary"
            type="button"
            ?disabled=${!this.isAdmin||this.saving||this.deletingCurrentItem}
            @click=${this.saveAsCustom}
          >
            Save as Custom
          </button>
        `:o`
          <button
            class="primary"
            type="button"
            ?disabled=${!this.isAdmin||!this.dirty||this.saving||this.deletingCurrentItem}
            @click=${this.save}
          >
            ${this.saving?"Saving...":"Save"}
          </button>
        `}get selectedSingleEffectFamily(){if(this.content.kind!=="h617a_single"&&this.content.kind!=="palette_diy")return;const e=this.content.family;return this.modelCatalogue?.effects.find(t=>t.family===e)}syncSingleEffectSelects(){if(this.content.kind!=="h617a_painted"&&this.content.kind!=="h617a_single"&&this.content.kind!=="palette_diy")return;const e=this.shadowRoot?.querySelector('select[aria-label="Effect"]');if(e&&(e.value=this.content.kind==="h617a_painted"?"paint":this.selectedSingleEffectFamily?.id??`unknown:${this.content.family}`),this.content.kind==="h617a_painted"){const t=this.shadowRoot?.querySelector('select[aria-label="Variation"]');t&&(t.value=this.content.effect)}}rangeField(e,t,i){return o`
      <label class="range-field">
        <span class="parameter-label">${e}</span>
        <input
          type="range"
          min="0"
          max="100"
          .value=${String(i)}
          ?disabled=${!this.isAdmin}
          @input=${s=>this.updateContent({[t]:Number(s.target.value)})}
        />
        <output>${i}%</output>
      </label>
    `}renderNewEffectTypeTabs(){return this.currentItem||this.templateSourceLabel||this.customCopyStarted||!j(this.content)?l:o`
      <div class="custom-mode-tabs" role="tablist" aria-label="Custom effect type">
        ${this.newEffectTypeAvailable("single")?this.newEffectTypeButton("single","Single"):l}
        ${this.newEffectTypeAvailable("multi")?this.newEffectTypeButton("multi","Multi"):l}
        ${this.newEffectTypeAvailable("advanced")?this.newEffectTypeButton("advanced","Advanced"):l}
      </div>
    `}newEffectTypeAvailable(e){return e==="single"?this.customEffectKindAvailable("h617a_painted")||this.customEffectKindAvailable("h617a_single")||this.customEffectKindAvailable("palette_diy"):this.customEffectKindAvailable(e==="multi"?"h617a_multi":"advanced")}newEffectTypeButton(e,t){const i=bi(this.content)===e,s=e==="single"&&this.content.kind==="h617a_multi"&&this.content.effects.length>1;return o`
      <button
        type="button"
        role="tab"
        aria-selected=${i}
        class=${i?"selected":""}
        title=${s?"Remove all but one effect before switching to Single":l}
        ?disabled=${!this.isAdmin||s}
        @click=${()=>this.switchNewEffectType(e)}
      >
        ${t}
      </button>
    `}renderDeployment(e){const t=this.devices.find(s=>s.config_entry_id===e.config_entry_id)?.display_name??"device";let i;switch(e.phase){case"pending":i=`Preparing to apply to ${t}.`;break;case"uploading":i=`Applying to ${t}: ${e.progress_current} of ${e.progress_total}.`;break;case"verifying":i=`Checking the selected effect on ${t}.`;break;case"confirmed":i=`Applied to ${t}. The selected custom-effect code was confirmed, but exact effect contents cannot be read back.`;break;case"unknown":i=`Applied to ${t}, but the selected effect could not be confirmed.`;break;case"interrupted":i=`Apply to ${t} was interrupted by a Home Assistant restart.`;break;case"failed":i=`Apply to ${t} failed.`;break}return o`
      <div
        class="feedback deployment ${e.phase}"
        role=${e.phase==="failed"?"alert":"status"}
      >
        ${i}
      </div>
    `}async selectSection(e){const t=this.beginEditorTransition();if(e===this.section||e==="custom"&&!this.customEffectsAvailable||e==="video"&&!this.videoAvailable||(this.section=e,this.notice=void 0,e==="scenes"))return;if(e==="video"){const s=this.library.items.find(a=>a.kind==="video_profile"&&this.libraryItemAvailable(a));if(s){await this.selectItem(s.id,t);return}const n=this.modelCatalogue?.video_modes[0];n&&this.openVideoTemplate(n.id,n.label);return}if((G(this.content)||this.content.kind==="palette_diy"||this.content.kind==="music_profile"||Se(this.content)||this.content.kind==="opaque")&&this.customEffectKindAvailable(this.content.kind))return;const i=this.preferredLibraryEffect();if(i){await this.selectItem(i.id,t);return}this.isAdmin?this.openDefaultAvailableTemplate(t):(this.currentItem=void 0,this.name="")}async load(){const e=this.loadEpoch+1;this.loadEpoch=e,this.loading=!0,this.error=void 0,this.deploymentRevision=-1;const t=new ur(this.hass);this.api=t;try{const[i,s,n,a]=await Promise.all([t.info(),t.devices(),t.library(),t.customCatalogue()]);if(!this.loadIsCurrent(e,t))return;if(!cr(i))throw new Error("This editor bundle is not compatible with the installed backend.");this.devices=s,this.library=n,this.customCatalogue=a,this.selectedDeviceId=this.deviceIdFromPath()??s.find(p=>p.custom_effects.painted==="supported")?.config_entry_id??s[0]?.config_entry_id,this.customEffectsAvailable||(this.section="scenes");const d=await t.subscribeLibrary(p=>{this.libraryChanged(p)},p=>this.subscriptionFailed(p,e,t));if(!this.loadIsCurrent(e,t)||this.error){d();return}if(this.unsubscribeLibrary=d,this.isAdmin){const p=await t.subscribeDeployments(b=>{b.revision<this.deploymentRevision||(this.deploymentRevision=b.revision,this.deployments=b.deployments,this.activeOperationId||(this.activeOperationId=this.latestDeployment(["pending","uploading","verifying","interrupted"])?.operation_id))},b=>this.subscriptionFailed(b,e,t));if(!this.loadIsCurrent(e,t)||this.error){p();return}this.unsubscribeDeployments=p}const c=this.preferredLibraryEffect(n.items);c?await this.selectItem(c.id):this.isAdmin&&this.openDefaultAvailableTemplate()}catch(i){this.loadIsCurrent(e,t)&&(this.stopSubscriptions(),this.error=D(i))}finally{this.loadIsCurrent(e,t)&&(this.loading=!1)}}openDefaultTemplate(e){this.newEffect("h617a_painted",e,{name:"Paint",content:ge(),selectionIdentity:"template:paint",templateLabel:"Paint"})}preferredLibraryEffect(e=this.library.items){return e.filter(t=>t.kind!=="video_profile"&&mt(t.kind)&&this.libraryItemAvailable(t)).sort((t,i)=>yi(t.kind,this.selectedModel)-yi(i.kind,this.selectedModel)||Ie(t.name,i.name))[0]}openDefaultAvailableTemplate(e){if(this.customEffectKindAvailable("h617a_painted")){this.openDefaultTemplate(e);return}if(this.customEffectKindAvailable("h617a_single")&&this.modelCatalogue?.effects[0]){const t=this.modelCatalogue.effects.find(n=>n.id!=="music")??this.modelCatalogue.effects[0],i=t.variations[0],s=K("h617a_single",this.modelCatalogue);this.newEffect("h617a_single",e,{name:t.label,content:{...s,family:t.family,variant:i.variant},selectionIdentity:`template:single:${t.family}:${i.variant}`,templateLabel:t.label});return}if(this.customEffectKindAvailable("palette_diy")&&this.modelCatalogue?.effects[0]){const t=this.modelCatalogue.effects.find(i=>i.id!=="music")??this.modelCatalogue.effects[0];this.openEditableTemplate(t.label,qe(this.modelCatalogue,this.selectedModel,t.family,t.variations[0].variant),`template:single:${t.family}:${t.variations[0].variant}`);return}if(this.customEffectKindAvailable("h617a_multi")){this.newEffect("h617a_multi",e,{name:"Mix",content:K("h617a_multi",this.modelCatalogue),selectionIdentity:"template:mix",templateLabel:"Mix"});return}if(this.customEffectKindAvailable("advanced")){this.newEffect("advanced",e,{name:"Layered",content:ot(),selectionIdentity:"template:advanced",templateLabel:"Layered"});return}this.currentItem=void 0,this.name=""}loadIsCurrent(e,t){return this.isConnected&&this.loadEpoch===e&&this.api===t}subscriptionFailed(e,t,i){this.loadIsCurrent(t,i)&&(this.error=e.message,this.loading=!1,queueMicrotask(()=>{this.loadIsCurrent(t,i)&&this.stopSubscriptions()}))}stopSubscriptions(){this.unsubscribeLibrary?.(),this.unsubscribeDeployments?.(),this.unsubscribeLibrary=void 0,this.unsubscribeDeployments=void 0}deviceIdFromPath(){const e=window.location.pathname.match(/\/ha-govee-led-ble\/editor\/([^/]+)/);return e?.[1]?decodeURIComponent(e[1]):void 0}async libraryChanged(e){const t=this.library.library_revision;if(e.library_revision<t||(this.library=e,!this.currentItem||e.library_revision===t))return;const i=e.items.find(a=>a.id===this.currentItem?.id);if(!i){if(this.deletingItemId===this.currentItem.id)return;this.notice="This effect was removed from the shared library.";return}if(i.revision===this.currentItem.revision)return;if(this.dirty){this.notice="This effect changed elsewhere. Reload it before saving.";return}const s=this.beginEditorTransition();await this.selectItem(i.id,s)&&this.editorTransitionIsCurrent(s)&&(this.notice="Loaded the latest shared revision.")}sceneLibraryItemSaved(e){this.library={library_revision:e.detail.library_revision,items:_i(this.library.items,e.detail.item)}}sceneTemplateSelected(e){if(!this.isAdmin||e.detail.config_entry_id!==this.selectedDeviceId)return;const t=this.beginEditorTransition();this.currentItem=void 0,this.templateSourceLabel=void 0,this.customCopyStarted=!0,this.name=e.detail.name.trim()||"Layered scene template",this.content=it(e.detail.content),this.savedBaseline=void 0,this.section="custom",this.customEffectCategory="all",this.customTemplateSelection=void 0,this.notice=void 0,this.selectNewEffectName(t)}backToScenes(){this.beginEditorTransition(),this.section="scenes",this.notice=void 0}beginEditorTransition(){return this.editorTransitionEpoch+=1,this.editorTransitionEpoch}editorTransitionIsCurrent(e){return e===this.editorTransitionEpoch}deviceChanged(e){const t=this.beginEditorTransition();if(this.selectedDeviceId=e.target.value,this.activeOperationId=void 0,this.activeOperationId=this.latestDeployment(["pending","uploading","verifying","interrupted"])?.operation_id,this.notice=void 0,this.section==="video"&&!this.videoAvailable){this.section="scenes";return}if(!this.customEffectsAvailable){this.section="scenes";return}if(this.customEffectCategoryAvailable(this.customEffectCategory)||(this.customEffectCategory="all"),this.section==="custom"&&!this.effectContentAvailable(this.content)){const i=this.customEffectEntries.filter(n=>n.kind!=="saved"),s=this.customEffectCategory==="all"?void 0:this.customEffectCategory==="music"?i.find(n=>n.kind==="music"&&n.mode!==void 0):i[0];s?this.selectCustomEffectEntry(s):this.openDefaultAvailableTemplate(t)}if(this.section==="video"&&this.content.kind==="video_profile"&&this.content.model!==this.selectedModel){const i=this.modelCatalogue?.video_modes[0];i&&this.openVideoTemplate(i.id,i.label)}}switchNewEffectType(e){if(!this.isAdmin||!this.newEffectTypeAvailable(e)||this.currentItem||this.templateSourceLabel||!j(this.content)||bi(this.content)===e)return;if(e==="advanced"){this.newEffect("advanced");return}const t=e==="single"?this.selectedModel==="H6199"?"palette_diy":"h617a_single":"h617a_multi";if(G(this.content)&&t!=="palette_diy"){this.switchCustomMode(t);return}this.content.kind==="palette_diy"&&t==="palette_diy"||this.newEffect(t)}switchCustomMode(e){if(!this.isAdmin||!this.customCatalogue||!G(this.content)||this.content.kind===e)return;const t=this.content;if(e==="h617a_single"&&t.kind==="h617a_multi"&&t.effects.length>1)return;let i;if(e==="h617a_painted"){const s=t.kind==="h617a_painted"?this.activePaintBrush:t.palette[0]?[...t.palette[0]]:[47,111,237];i={...ge(),speed:t.speed,groups:[{fill:[...s],segments:Array.from({length:wt},(n,a)=>a)}]},t.kind!=="h617a_painted"&&(this.paintBrushes=Xr(t.palette),this.selectedPaintBrush=0),this.brushUsesBackground=!1}else if(t.kind==="h617a_painted"){const s=Yr(t);if(e==="h617a_single"){const n=K(e,this.customCatalogue);i={...n,speed:t.speed,palette:s.length?s:n.palette}}else{const n=K("h617a_multi",this.customCatalogue);i={...n,speed:t.speed,palette:s.length?s:n.palette}}}else if(e==="h617a_multi"&&t.kind==="h617a_single")i={kind:e,effects:[{family:t.family,variant:t.variant}],speed:t.speed,palette:t.palette.map(s=>[...s])};else if(e==="h617a_single"&&t.kind==="h617a_multi"){const s=t.effects[0];i={kind:e,family:s.family,variant:s.variant,speed:t.speed,palette:t.palette.map(n=>[...n])}}else return;this.content=i,/^New (Paint|Painted|Single|Multi) effect$/.test(this.name)&&(this.name=`New ${vi(e)} effect`),this.notice=this.applyAvailabilityNotice()}newEffect(e,t,i){const s=t??this.beginEditorTransition();!this.api||!this.isAdmin||!this.customEffectKindAvailable(e)||e!=="advanced"&&!this.modelCatalogue||(this.currentItem=void 0,this.templateSourceLabel=i?.templateLabel,this.customCopyStarted=i?.templateLabel!==void 0,this.customTemplateSelection=e==="advanced"?void 0:i?.selectionIdentity??(e==="h617a_painted"?"template:paint":void 0),this.name=i?.name??`New ${vi(e)} effect`,this.content=i?.content??(e==="advanced"?ot():e==="palette_diy"?qe(this.modelCatalogue,this.selectedModel):K(e,this.modelCatalogue)),e==="h617a_painted"&&(this.brushUsesBackground=!1),this.savedBaseline=void 0,this.notice=this.applyAvailabilityNotice(),this.selectNewEffectName(s))}selectNewEffectName(e){this.updateComplete.then(()=>{if(!this.editorTransitionIsCurrent(e)||this.currentItem||this.templateSourceLabel)return;const t=this.shadowRoot?.querySelector(".editor .editor-name");t?.focus(),t?.select()})}renderEditorDeleteButton(){return!this.isAdmin||!this.currentItem?l:o`
      <button
        class="danger"
        type="button"
        ?disabled=${this.deletingItemId!==void 0||this.saving||this.applying}
        @click=${e=>this.requestDelete({id:this.currentItem.id,revision:this.currentItem.revision,name:this.currentItem.name},e.currentTarget)}
      >
        ${this.deletingCurrentItem?"Deleting...":"Delete"}
      </button>
    `}requestDelete(e,t){!this.api||!this.isAdmin||this.deletingItemId!==void 0||this.saving||this.applying||(this.deleteCandidate={...e},this.deleteReturnFocus=t,this.notice=void 0,this.updateComplete.then(()=>{this.shadowRoot?.querySelector(".delete-dialog .danger")?.focus()}))}cancelDelete(){const e=this.deleteReturnFocus;this.deleteCandidate=void 0,this.deleteReturnFocus=void 0,this.updateComplete.then(()=>{e?.isConnected&&e.focus()})}deleteDialogKeyDown(e){e.key==="Escape"&&(e.preventDefault(),this.cancelDelete())}async confirmDelete(){const e=this.deleteCandidate,t=this.api;if(!e||!t||!this.isAdmin||this.deletingItemId!==void 0)return;const i=this.library.library_revision;this.deleteCandidate=void 0,this.deleteReturnFocus=void 0,this.deletingItemId=e.id,this.notice=void 0;try{const s=await t.deleteItem(e,i);s>=this.library.library_revision&&(this.library={library_revision:s,items:this.library.items.filter(n=>n.id!==e.id)}),this.currentItem?.id===e.id&&this.currentItem.revision===e.revision&&(this.beginEditorTransition(),this.currentItem=void 0,this.templateSourceLabel=void 0,this.customCopyStarted=!1,this.customTemplateSelection=void 0,this.name="",this.content=ge(),this.savedBaseline=void 0),this.notice=`Deleted ${e.name}.`}catch(s){const n=gt(s)==="conflict";if(this.notice=n?"This effect or library changed elsewhere. Reload before deleting.":`Delete failed: ${D(s)}`,n)try{const a=await t.library();a.library_revision>=this.library.library_revision&&(this.library=a)}catch(a){this.notice+=` Library refresh failed: ${D(a)}`}}finally{this.deletingItemId=void 0}}async selectItem(e,t){const i=t??this.beginEditorTransition();if(!this.api)return!1;try{const s=await this.api.item(e);return this.editorTransitionIsCurrent(i)?s.content.kind==="opaque"?(this.currentItem=s,this.templateSourceLabel=void 0,this.customCopyStarted=!1,this.customTemplateSelection=void 0,this.name=s.name,this.content=jr(s.content),this.savedBaseline=void 0,this.notice="This effect definition is preserved, but this editor cannot change or apply it.",!0):j(s.content)?(this.currentItem=s,this.templateSourceLabel=void 0,this.customCopyStarted=!1,this.customTemplateSelection=void 0,this.name=s.name,this.content=Ve(s.content),s.content.kind==="h617a_painted"&&(this.brushUsesBackground=!1),this.savedBaseline=se(s.name,s.content),this.notice=this.applyAvailabilityNotice(),!0):(this.notice="This item cannot be edited here.",!1):!1}catch(s){return this.editorTransitionIsCurrent(i)&&(this.notice=D(s)),!1}}nameChanged(e){this.name=e.target.value}saveAsCustom(){const e=this.templateSourceLabel;if(!e||!this.isAdmin)return;const t=this.beginEditorTransition();this.templateSourceLabel=void 0,this.customTemplateSelection=void 0,this.customCopyStarted=!0,this.name=`Custom ${e}`,this.savedBaseline=void 0,this.selectNewEffectName(t)}paintBrushesChanged(e){this.paintBrushes=e.detail.palette.map(t=>[...t]),this.selectedPaintBrush=Math.max(0,Math.min(this.selectedPaintBrush,this.paintBrushes.length-1)),this.brushUsesBackground=!1}paintBrushSelected(e){this.selectedPaintBrush=e.detail.index,this.brushUsesBackground=!1}get activePaintBrush(){return[...this.paintBrushes[this.selectedPaintBrush]??this.paintBrushes[0]??[47,111,237]]}backgroundChanged(e){this.updateContent({background:[...e.detail.colour]})}singleEffectChanged(e){if(!this.customCatalogue||this.currentItem?.content.kind==="opaque")return;const t=e.target.value;if(this.currentItem&&(this.content.kind==="h617a_painted"&&t!=="paint"||this.content.kind==="h617a_single"&&t==="paint"))return;const i=this.templateSourceLabel!==void 0||this.customTemplateSelection!==void 0;if(t==="paint"){this.content.kind!=="h617a_painted"&&this.switchCustomMode("h617a_painted"),i&&(this.customTemplateSelection="template:paint"),this.updateGeneratedEffectName("Paint");return}const s=this.modelCatalogue?.effects.find(a=>a.id===t),n=s?.variations[0];!s||!n||(this.content.kind==="h617a_painted"&&this.switchCustomMode("h617a_single"),!(this.content.kind!=="h617a_single"&&this.content.kind!=="palette_diy")&&(this.content={...this.content,family:s.family,variant:n.variant},i&&(this.customTemplateSelection=`template:single:${s.family}:${n.variant}`),this.updateGeneratedEffectName(s.label)))}paintedEffectVariationChanged(e){this.content.kind==="h617a_painted"&&this.updateContent({effect:e.target.value})}updateGeneratedEffectName(e){if(this.templateSourceLabel){this.templateSourceLabel=e,this.name=e;return}!this.currentItem&&/^New .+ effect$/.test(this.name)&&(this.name=`New ${e} effect`)}setSegmentColour(e){if(this.content.kind!=="h617a_painted")return;const t=kt(this.content);t[e]=this.brushUsesBackground?[...this.content.background]:this.activePaintBrush,this.content={...this.content,groups:gi(t,this.content.background)}}paintAll(){if(this.content.kind!=="h617a_painted")return;const e=this.brushUsesBackground?this.content.background:this.activePaintBrush;this.content={...this.content,groups:gi(Array.from({length:wt},()=>[...e]),this.content.background)}}resetPaint(){this.content.kind==="h617a_painted"&&(this.content={...this.content,groups:[]})}updateContent(e){this.content.kind==="h617a_painted"&&(this.content={...this.content,...e})}async save(){if(!this.api||!this.isAdmin||!this.dirty||this.saving||this.deletingCurrentItem||!j(this.content))return;const e=this.api,t=this.name.trim();if(!t){this.notice="Give this effect a name before saving.";return}const i=this.beginEditorTransition(),s=this.currentItem,n=Ve(this.content),a=this.library.library_revision;this.saving=!0,this.notice=void 0;try{const d=s?await e.updateItem(s,t,n,a):await e.createItem(t,n,a);if(!j(d.item.content))throw new Error("The saved effect returned an unsupported definition.");const c=d.item.content;d.library_revision>=this.library.library_revision&&(this.library={library_revision:d.library_revision,items:_i(this.library.items,d.item)}),this.editorTransitionIsCurrent(i)&&$i(this.currentItem,s)&&j(this.content)&&se(this.name,this.content)===se(t,n)&&(this.currentItem=d.item,this.customTemplateSelection=void 0,this.name=d.item.name,this.content=Ve(c),this.savedBaseline=se(this.name,this.content)),this.editorTransitionIsCurrent(i)&&$i(this.currentItem,d.item)&&j(this.content)&&se(this.name,this.content)===se(d.item.name,c)&&(this.notice="Saved.")}catch(d){if(gt(d)==="conflict"){const c="This effect or library changed elsewhere. Reload before saving.";this.editorTransitionIsCurrent(i)&&(this.notice=c);try{const p=await e.library();p.library_revision>=this.library.library_revision&&(this.library=p)}catch(p){this.editorTransitionIsCurrent(i)&&(this.notice=`${c} Library refresh failed: `+D(p))}}else this.editorTransitionIsCurrent(i)&&(this.notice=`Save failed: ${D(d)}`)}finally{this.saving=!1}}async apply(){if(!this.api||!this.canApply||!G(this.content)||!this.selectedDeviceId)return;const e=this.name.trim(),t=this.selectedDeviceId,i=this.editorTransitionEpoch;this.activeOperationId=void 0,this.applying=!0,this.notice=void 0;try{const s=!this.dirty&&this.currentItem?await this.api.applySaved(t,this.currentItem):await this.api.applySnapshot(t,e,this.content);if(i!==this.editorTransitionEpoch||t!==this.selectedDeviceId)return;this.activeOperationId=s.operation_id,this.deployments=[s,...this.deployments.filter(n=>n.operation_id!==s.operation_id)]}catch(s){i===this.editorTransitionEpoch&&t===this.selectedDeviceId&&(this.notice=`Apply failed: ${D(s)}`)}finally{this.applying=!1}}applyAvailabilityNotice(){if(!Se(this.content)&&this.selectedDeviceId&&!this.selectedDevice)return"This device is temporarily unavailable in Home Assistant. Apply is disabled until it is loaded."}latestDeployment(e){return[...this.deployments].filter(t=>t.config_entry_id===this.selectedDeviceId&&e.includes(t.phase)).sort((t,i)=>i.updated_at.localeCompare(t.updated_at))[0]}static{this.styles=[B,oe,Tt,Ai,de,Ii,Ti,Dt,Pi,k`
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

    .studio.video-mode {
      grid-template-columns: 190px 230px minmax(0, 1fr);
    }

    .primary-nav {
      padding: 22px 16px;
      border-inline-end: 1px solid var(--studio-border);
      background: var(--secondary-background-color, #f5f6f8);
    }

    .primary-nav {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .custom-mode-tabs {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
      margin-bottom: 22px;
      padding: 6px;
      border: 1px solid var(--studio-border);
      border-radius: 12px;
      background: var(--studio-card);
    }

    .custom-mode-tabs button {
      min-height: 52px;
      padding: 12px;
      border: 0;
      border-radius: 9px;
      color: var(--primary-text-color);
      background: transparent;
      font-size: 15px;
      font-weight: 650;
      cursor: pointer;
    }

    .custom-mode-tabs button.selected {
      color: var(--text-primary-color, #fff);
      background: var(--studio-blue);
    }

    .custom-mode-tabs button:disabled {
      cursor: default;
      opacity: 0.52;
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
      padding: 24px;
      background: rgb(0 0 0 / 45%);
    }

    .delete-dialog {
      width: min(440px, 100%);
      padding: 24px;
      border: 1px solid var(--studio-border);
      border-radius: 12px;
      color: var(--primary-text-color);
      background: var(--studio-card);
      box-shadow: 0 18px 52px rgb(0 0 0 / 28%);
    }

    .delete-dialog p {
      margin-top: 16px;
      margin-bottom: 0;
      line-height: 1.5;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 9px;
      margin-top: 24px;
    }

    .source-note {
      color: var(--studio-muted);
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

    .range-field {
      grid-template-columns: 80px minmax(100px, 1fr) 44px;
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

    .deployment.failed {
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
      .studio.custom-mode,
      .studio.video-mode {
        grid-template-columns: 170px minmax(0, 1fr);
      }

      .custom-mode .effect-categories,
      .custom-mode .library,
      .custom-mode .editor {
        grid-column: 2;
      }

      .video-mode .library,
      .video-mode .editor {
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
  `]}}_([h({attribute:!1})],$.prototype,"hass");_([h({attribute:!1})],$.prototype,"panel");_([h({type:Boolean})],$.prototype,"showDevicePicker");_([f()],$.prototype,"loading");_([f()],$.prototype,"error");_([f()],$.prototype,"notice");_([f()],$.prototype,"devices");_([f()],$.prototype,"selectedDeviceId");_([f()],$.prototype,"section");_([f()],$.prototype,"customEffectCategory");_([f()],$.prototype,"customTemplateSelection");_([f()],$.prototype,"templateSourceLabel");_([f()],$.prototype,"customCopyStarted");_([f()],$.prototype,"library");_([f()],$.prototype,"customCatalogue");_([f()],$.prototype,"currentItem");_([f()],$.prototype,"name");_([f()],$.prototype,"content");_([f()],$.prototype,"paintBrushes");_([f()],$.prototype,"selectedPaintBrush");_([f()],$.prototype,"brushUsesBackground");_([f()],$.prototype,"saving");_([f()],$.prototype,"applying");_([f()],$.prototype,"deleteCandidate");_([f()],$.prototype,"deletingItemId");_([f()],$.prototype,"deployments");_([f()],$.prototype,"activeOperationId");function ge(){return{kind:"h617a_painted",effect:"clockwise",speed:50,brightness:100,background:[0,0,0],groups:[]}}function K(r,e){if(r==="h617a_painted")return ge();const t=r==="h617a_multi"?e.effects.find(n=>n.supports_multi):e.effects[0];if(!t)throw new Error("The custom-effect catalogue has no compatible effects.");const i=t.variations[0],s={family:t.family,variant:i.variant};return r==="h617a_single"?{kind:r,...s,speed:50,palette:Ne()}:{kind:r,effects:[s],speed:50,palette:Ne()}}function qe(r,e,t,i){if(e!=="H617A"&&e!=="H6199")throw new Error(`Unsupported custom-effect model ${e}.`);const s=r.effects.find(n=>n.family===t)??r.effects[0];if(!s)throw new Error("The custom-effect catalogue has no compatible effects.");return{kind:"palette_diy",model:e,family:t??s.family,variant:i??s.variations[0].variant,speed:50,palette:Ne()}}function Vr(r){return{kind:"video_profile",model:"H6199",mode:r==="game"?"game":"movie",full_screen:!0,saturation:50,sound_effects:!1,sound_effects_softness:50,white_balance_position:17,relative_brightness:{left:100,top:100,right:100,bottom:100},blank_screen:!1}}function Kr(r){return{...r,background:[...r.background],groups:r.groups.map(e=>({fill:[...e.fill],segments:[...e.segments]}))}}function ss(r){return r.kind==="h617a_painted"?Kr(r):r.kind==="h617a_single"?{...r,palette:r.palette.map(e=>[...e])}:{...r,effects:r.effects.map(e=>({...e})),palette:r.palette.map(e=>[...e])}}function rs(r){return{...r,palette:r.palette.map(e=>[...e])}}function ns(r){return{...r,colour:r.colour?[...r.colour]:null,parameters:structuredClone(r.parameters)}}function as(r){return{...r,relative_brightness:{...r.relative_brightness}}}function Ve(r){return r.kind==="advanced"?We(r):r.kind==="scene_layered"?it(r):r.kind==="palette_diy"?rs(r):r.kind==="music_profile"?ns(r):r.kind==="video_profile"?as(r):ss(r)}function jr(r){return{...r,body:structuredClone(r.body)}}function zr(r){return r.kind==="advanced"?r:{kind:"advanced",layers:r.effect.layers}}function Gr(r,e){return r.kind==="advanced"?We(e):{...it(r),effect:{layers:We(e).layers}}}function Ne(){return[[255,0,0],[255,127,0],[255,255,0],[0,255,0],[0,0,255],[0,255,255],[139,0,255]]}function Xr(r){const e=[];for(const t of[...r,...Ne()])if(e.some(i=>Ze(i,t))||e.push([...t]),e.length===8)break;return e}function kt(r){const e=Array.from({length:wt},()=>[...r.background]);for(const t of r.groups)for(const i of t.segments)e[i]=[...t.fill];return e}function gi(r,e){const t=new Map;return r.forEach((i,s)=>{if(Ze(i,e))return;const n=i.join(","),a=t.get(n);a?a.segments.push(s):t.set(n,{fill:[...i],segments:[s]})}),[...t.values()]}function Yr(r){const e=[];for(const t of kt(r))if(!Ze(t,r.background)&&!e.some(i=>Ze(i,t))&&e.push([...t]),e.length===8)break;return e}function Ze(r,e){return r[0]===e[0]&&r[1]===e[1]&&r[2]===e[2]}function se(r,e){return JSON.stringify({name:r.trim(),content:e})}function Ht(r){return r==="h617a_painted"||r==="h617a_single"||r==="h617a_multi"}function G(r){return typeof r=="object"&&r!==null&&"kind"in r&&Ht(r.kind)}function j(r){return G(r)||typeof r=="object"&&r!==null&&"kind"in r&&(Fe(r.kind)||r.kind==="palette_diy"||r.kind==="music_profile"||r.kind==="video_profile")}function bi(r){return r.kind==="h617a_multi"?"multi":Fe(r.kind)?"advanced":r.kind==="h617a_painted"||r.kind==="h617a_single"||r.kind==="palette_diy"?"single":void 0}function Fe(r){return r==="advanced"||r==="scene_layered"}function Se(r){return Fe(r.kind)}function Wr(r){return Ht(r)||Fe(r)||r==="palette_diy"||r==="music_profile"||r==="video_profile"||r==="scene_builtin"||r==="scene_palette"}function vi(r){switch(r){case"h617a_painted":return"Paint";case"h617a_single":return"Single";case"h617a_multi":return"Multi";case"advanced":return"Layered";case"palette_diy":return"Single";default:return"Custom"}}function mt(r){return Ht(r)||Fe(r)||r==="palette_diy"||r==="music_profile"||!Wr(r)}function yi(r,e){const t=e==="H6199"?["palette_diy","music_profile","advanced","scene_layered"]:["h617a_painted","h617a_single","h617a_multi","music_profile","advanced","scene_layered"],i=t.indexOf(r);return i===-1?t.length:i}function Jr(r){return r==="h617a_multi"?"multi-layer":r==="music_profile"?"music":r==="h617a_painted"||r==="h617a_single"||r==="palette_diy"?"single-layer":"advanced"}function $i(r,e){return r?.id===e?.id&&r?.revision===e?.revision}function _i(r,e){const t=Zr(e);return[...r.filter(i=>i.id!==e.id),{id:e.id,revision:e.revision,name:e.name,kind:e.content.kind==="opaque"?e.content.source_kind:e.content.kind,...t?{model:t}:{},..."template"in e.content?{template:e.content.template}:{}}].sort((i,s)=>i.name.localeCompare(s.name))}function Zr(r){const e=r.content;return e.kind==="palette_diy"||e.kind==="music_profile"||e.kind==="video_profile"?e.model:e.kind==="h617a_painted"||e.kind==="h617a_single"||e.kind==="h617a_multi"?"H617A":e.kind==="scene_builtin"||e.kind==="scene_palette"||e.kind==="scene_layered"?xi(e.template.sku):xi(r.target_hint?.model)}function xi(r){return r==="H617A"||r==="H6199"?r:void 0}customElements.get("ha-govee-led-ble-editor")||customElements.define("ha-govee-led-ble-editor",$);
