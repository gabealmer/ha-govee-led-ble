const Ge=globalThis,Lt=Ge.ShadowRoot&&(Ge.ShadyCSS===void 0||Ge.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Mt=Symbol(),Xt=new WeakMap;let Di=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==Mt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(Lt&&e===void 0){const i=t!==void 0&&t.length===1;i&&(e=Xt.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&Xt.set(t,e))}return e}toString(){return this.cssText}};const ms=n=>new Di(typeof n=="string"?n:n+"",void 0,Mt),E=(n,...e)=>{const t=n.length===1?n[0]:e.reduce((i,s,r)=>i+(a=>{if(a._$cssResult$===!0)return a.cssText;if(typeof a=="number")return a;throw Error("Value passed to 'css' function must be a 'css' function result: "+a+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+n[r+1],n[0]);return new Di(t,n,Mt)},fs=(n,e)=>{if(Lt)n.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const i=document.createElement("style"),s=Ge.litNonce;s!==void 0&&i.setAttribute("nonce",s),i.textContent=t.cssText,n.appendChild(i)}},Jt=Lt?n=>n:n=>n instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return ms(t)})(n):n;const{is:gs,defineProperty:bs,getOwnPropertyDescriptor:vs,getOwnPropertyNames:ys,getOwnPropertySymbols:_s,getPrototypeOf:$s}=Object,it=globalThis,Zt=it.trustedTypes,xs=Zt?Zt.emptyScript:"",ks=it.reactiveElementPolyfillSupport,De=(n,e)=>n,Je={toAttribute(n,e){switch(e){case Boolean:n=n?xs:null;break;case Object:case Array:n=n==null?n:JSON.stringify(n)}return n},fromAttribute(n,e){let t=n;switch(e){case Boolean:t=n!==null;break;case Number:t=n===null?null:Number(n);break;case Object:case Array:try{t=JSON.parse(n)}catch{t=null}}return t}},Nt=(n,e)=>!gs(n,e),Qt={attribute:!0,type:String,converter:Je,reflect:!1,useDefault:!1,hasChanged:Nt};Symbol.metadata??=Symbol("metadata"),it.litPropertyMetadata??=new WeakMap;let ve=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=Qt){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(e,i,t);s!==void 0&&bs(this.prototype,e,s)}}static getPropertyDescriptor(e,t,i){const{get:s,set:r}=vs(this.prototype,e)??{get(){return this[t]},set(a){this[t]=a}};return{get:s,set(a){const l=s?.call(this);r?.call(this,a),this.requestUpdate(e,l,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??Qt}static _$Ei(){if(this.hasOwnProperty(De("elementProperties")))return;const e=$s(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(De("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(De("properties"))){const t=this.properties,i=[...ys(t),..._s(t)];for(const s of i)this.createProperty(s,t[s])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[i,s]of t)this.elementProperties.set(i,s)}this._$Eh=new Map;for(const[t,i]of this.elementProperties){const s=this._$Eu(t,i);s!==void 0&&this._$Eh.set(s,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const s of i)t.unshift(Jt(s))}else e!==void 0&&t.push(Jt(e));return t}static _$Eu(e,t){const i=t.attribute;return i===!1?void 0:typeof i=="string"?i:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return fs(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,i);if(s!==void 0&&i.reflect===!0){const r=(i.converter?.toAttribute!==void 0?i.converter:Je).toAttribute(t,i.type);this._$Em=e,r==null?this.removeAttribute(s):this.setAttribute(s,r),this._$Em=null}}_$AK(e,t){const i=this.constructor,s=i._$Eh.get(e);if(s!==void 0&&this._$Em!==s){const r=i.getPropertyOptions(s),a=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:Je;this._$Em=s;const l=a.fromAttribute(t,r.type);this[s]=l??this._$Ej?.get(s)??l,this._$Em=null}}requestUpdate(e,t,i,s=!1,r){if(e!==void 0){const a=this.constructor;if(s===!1&&(r=this[e]),i??=a.getPropertyOptions(e),!((i.hasChanged??Nt)(r,t)||i.useDefault&&i.reflect&&r===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,i))))return;this.C(e,t,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:s,wrapped:r},a){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),r!==!0||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),s===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[s,r]of this._$Ep)this[s]=r;this._$Ep=void 0}const i=this.constructor.elementProperties;if(i.size>0)for(const[s,r]of i){const{wrapped:a}=r,l=this[s];a!==!0||this._$AL.has(s)||l===void 0||this.C(s,void 0,r,l)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(i=>i.hostUpdate?.()),this.update(t)):this._$EM()}catch(i){throw e=!1,this._$EM(),i}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};ve.elementStyles=[],ve.shadowRootOptions={mode:"open"},ve[De("elementProperties")]=new Map,ve[De("finalized")]=new Map,ks?.({ReactiveElement:ve}),(it.reactiveElementVersions??=[]).push("2.1.2");const Rt=globalThis,ei=n=>n,Ze=Rt.trustedTypes,ti=Ze?Ze.createPolicy("lit-html",{createHTML:n=>n}):void 0,Ti="$lit$",X=`lit$${Math.random().toFixed(9).slice(2)}$`,Li="?"+X,ws=`<${Li}>`,de=document,Le=()=>de.createComment(""),Me=n=>n===null||typeof n!="object"&&typeof n!="function",Ot=Array.isArray,Es=n=>Ot(n)||typeof n?.[Symbol.iterator]=="function",dt=`[ 	
\f\r]`,Ce=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ii=/-->/g,si=/>/g,se=RegExp(`>|${dt}(?:([^\\s"'>=/]+)(${dt}*=${dt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ni=/'/g,ri=/"/g,Mi=/^(?:script|style|textarea|title)$/i,Ss=n=>(e,...t)=>({_$litType$:n,strings:e,values:t}),o=Ss(1),H=Symbol.for("lit-noChange"),d=Symbol.for("lit-nothing"),ai=new WeakMap,ae=de.createTreeWalker(de,129);function Ni(n,e){if(!Ot(n)||!n.hasOwnProperty("raw"))throw Error("invalid template strings array");return ti!==void 0?ti.createHTML(e):e}const Cs=(n,e)=>{const t=n.length-1,i=[];let s,r=e===2?"<svg>":e===3?"<math>":"",a=Ce;for(let l=0;l<t;l++){const c=n[l];let p,b,y=-1,R=0;for(;R<c.length&&(a.lastIndex=R,b=a.exec(c),b!==null);)R=a.lastIndex,a===Ce?b[1]==="!--"?a=ii:b[1]!==void 0?a=si:b[2]!==void 0?(Mi.test(b[2])&&(s=RegExp("</"+b[2],"g")),a=se):b[3]!==void 0&&(a=se):a===se?b[0]===">"?(a=s??Ce,y=-1):b[1]===void 0?y=-2:(y=a.lastIndex-b[2].length,p=b[1],a=b[3]===void 0?se:b[3]==='"'?ri:ni):a===ri||a===ni?a=se:a===ii||a===si?a=Ce:(a=se,s=void 0);const G=a===se&&n[l+1].startsWith("/>")?" ":"";r+=a===Ce?c+ws:y>=0?(i.push(p),c.slice(0,y)+Ti+c.slice(y)+X+G):c+X+(y===-2?l:G)}return[Ni(n,r+(n[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),i]};class Ne{constructor({strings:e,_$litType$:t},i){let s;this.parts=[];let r=0,a=0;const l=e.length-1,c=this.parts,[p,b]=Cs(e,t);if(this.el=Ne.createElement(p,i),ae.currentNode=this.el.content,t===2||t===3){const y=this.el.content.firstChild;y.replaceWith(...y.childNodes)}for(;(s=ae.nextNode())!==null&&c.length<l;){if(s.nodeType===1){if(s.hasAttributes())for(const y of s.getAttributeNames())if(y.endsWith(Ti)){const R=b[a++],G=s.getAttribute(y).split(X),qe=/([.?@])?(.*)/.exec(R);c.push({type:1,index:r,name:qe[2],strings:G,ctor:qe[1]==="."?As:qe[1]==="?"?Ps:qe[1]==="@"?Ds:st}),s.removeAttribute(y)}else y.startsWith(X)&&(c.push({type:6,index:r}),s.removeAttribute(y));if(Mi.test(s.tagName)){const y=s.textContent.split(X),R=y.length-1;if(R>0){s.textContent=Ze?Ze.emptyScript:"";for(let G=0;G<R;G++)s.append(y[G],Le()),ae.nextNode(),c.push({type:2,index:++r});s.append(y[R],Le())}}}else if(s.nodeType===8)if(s.data===Li)c.push({type:2,index:r});else{let y=-1;for(;(y=s.data.indexOf(X,y+1))!==-1;)c.push({type:7,index:r}),y+=X.length-1}r++}}static createElement(e,t){const i=de.createElement("template");return i.innerHTML=e,i}}function we(n,e,t=n,i){if(e===H)return e;let s=i!==void 0?t._$Co?.[i]:t._$Cl;const r=Me(e)?void 0:e._$litDirective$;return s?.constructor!==r&&(s?._$AO?.(!1),r===void 0?s=void 0:(s=new r(n),s._$AT(n,t,i)),i!==void 0?(t._$Co??=[])[i]=s:t._$Cl=s),s!==void 0&&(e=we(n,s._$AS(n,e.values),s,i)),e}class Is{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,s=(e?.creationScope??de).importNode(t,!0);ae.currentNode=s;let r=ae.nextNode(),a=0,l=0,c=i[0];for(;c!==void 0;){if(a===c.index){let p;c.type===2?p=new Oe(r,r.nextSibling,this,e):c.type===1?p=new c.ctor(r,c.name,c.strings,this,e):c.type===6&&(p=new Ts(r,this,e)),this._$AV.push(p),c=i[++l]}a!==c?.index&&(r=ae.nextNode(),a++)}return ae.currentNode=de,s}p(e){let t=0;for(const i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class Oe{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,s){this.type=2,this._$AH=d,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=we(this,e,t),Me(e)?e===d||e==null||e===""?(this._$AH!==d&&this._$AR(),this._$AH=d):e!==this._$AH&&e!==H&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Es(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==d&&Me(this._$AH)?this._$AA.nextSibling.data=e:this.T(de.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,s=typeof i=="number"?this._$AC(e):(i.el===void 0&&(i.el=Ne.createElement(Ni(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(t);else{const r=new Is(s,this),a=r.u(this.options);r.p(t),this.T(a),this._$AH=r}}_$AC(e){let t=ai.get(e.strings);return t===void 0&&ai.set(e.strings,t=new Ne(e)),t}k(e){Ot(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,s=0;for(const r of e)s===t.length?t.push(i=new Oe(this.O(Le()),this.O(Le()),this,this.options)):i=t[s],i._$AI(r),s++;s<t.length&&(this._$AR(i&&i._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const i=ei(e).nextSibling;ei(e).remove(),e=i}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}}class st{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,s,r){this.type=1,this._$AH=d,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=r,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=d}_$AI(e,t=this,i,s){const r=this.strings;let a=!1;if(r===void 0)e=we(this,e,t,0),a=!Me(e)||e!==this._$AH&&e!==H,a&&(this._$AH=e);else{const l=e;let c,p;for(e=r[0],c=0;c<r.length-1;c++)p=we(this,l[i+c],t,c),p===H&&(p=this._$AH[c]),a||=!Me(p)||p!==this._$AH[c],p===d?e=d:e!==d&&(e+=(p??"")+r[c+1]),this._$AH[c]=p}a&&!s&&this.j(e)}j(e){e===d?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class As extends st{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===d?void 0:e}}class Ps extends st{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==d)}}class Ds extends st{constructor(e,t,i,s,r){super(e,t,i,s,r),this.type=5}_$AI(e,t=this){if((e=we(this,e,t,0)??d)===H)return;const i=this._$AH,s=e===d&&i!==d||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,r=e!==d&&(i===d||s);s&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class Ts{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){we(this,e)}}const Ls=Rt.litHtmlPolyfillSupport;Ls?.(Ne,Oe),(Rt.litHtmlVersions??=[]).push("3.3.3");const Ms=(n,e,t)=>{const i=t?.renderBefore??e;let s=i._$litPart$;if(s===void 0){const r=t?.renderBefore??null;i._$litPart$=s=new Oe(e.insertBefore(Le(),r),r,void 0,t??{})}return s._$AI(n),s};const Bt=globalThis;let D=class extends ve{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Ms(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return H}};D._$litElement$=!0,D.finalized=!0,Bt.litElementHydrateSupport?.({LitElement:D});const Ns=Bt.litElementPolyfillSupport;Ns?.({LitElement:D});(Bt.litElementVersions??=[]).push("4.2.2");const Rs={attribute:!0,type:String,converter:Je,reflect:!1,hasChanged:Nt},Os=(n=Rs,e,t)=>{const{kind:i,metadata:s}=t;let r=globalThis.litPropertyMetadata.get(s);if(r===void 0&&globalThis.litPropertyMetadata.set(s,r=new Map),i==="setter"&&((n=Object.create(n)).wrapped=!0),r.set(t.name,n),i==="accessor"){const{name:a}=t;return{set(l){const c=e.get.call(this);e.set.call(this,l),this.requestUpdate(a,c,n,!0,l)},init(l){return l!==void 0&&this.C(a,void 0,n,l),l}}}if(i==="setter"){const{name:a}=t;return function(l){const c=this[a];e.call(this,l),this.requestUpdate(a,c,n,!0,l)}}throw Error("Unsupported decorator location: "+i)};function h(n){return(e,t)=>typeof t=="object"?Os(n,e,t):((i,s,r)=>{const a=s.hasOwnProperty(r);return s.constructor.createProperty(r,i),a?Object.getOwnPropertyDescriptor(s,r):void 0})(n,e,t)}function g(n){return h({...n,state:!0,attribute:!1})}const N=E`
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
`,ce=E`
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
`,Ft=E`
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
`,Ri=E`
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
`,Q=E`
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
`,Oi=E`
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
`,Ut=E`
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
`,Bi=E`
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
`,Fi=E`
  .feedback {
    margin-bottom: var(--studio-section-gap);
    padding: 12px 14px;
    border: 1px solid var(--studio-border);
    border-radius: var(--studio-button-radius);
    background: var(--studio-card);
    line-height: 1.45;
  }
`;var Bs=Object.defineProperty,ue=(n,e,t,i)=>{for(var s=void 0,r=n.length-1,a;r>=0;r--)(a=n[r])&&(s=a(e,t,s)||s);return s&&Bs(e,t,s),s};class ee extends D{constructor(){super(...arguments),this.items=[],this.ariaLabel="Items",this.itemRole="button",this.addLabel="Add item",this.addDisabled=!1,this.reorderDisabled=!1,this.pointerX=0,this.pointerY=0,this.pointerMoved=!1,this.suppressClick=!1}render(){const e=this.itemRole==="tab";return o`
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
    `}focusItem(e){this.updateComplete.then(()=>{this.shadowRoot?.querySelectorAll(".item")[e]?.focus()})}itemClicked(e){if(this.suppressClick){this.suppressClick=!1;return}this.dispatchEvent(new CustomEvent("item-selected",{detail:{index:e},bubbles:!0,composed:!0}))}addClicked(){this.dispatchEvent(new CustomEvent("item-added",{bubbles:!0,composed:!0}))}dragStarted(e,t){this.reorderDisabled||(this.draggedIndex=e,t.dataTransfer?.setData("text/plain",String(e)))}dropped(e,t){t.preventDefault(),this.draggedIndex!==void 0&&(this.reorder(this.draggedIndex,e),this.draggedIndex=void 0)}keyPressed(e,t){if(t.key!=="ArrowLeft"&&t.key!=="ArrowRight")return;t.preventDefault();const i=e+(t.key==="ArrowLeft"?-1:1);if(!(i<0||i>=this.items.length)){if(this.reorderDisabled){this.itemRole==="tab"&&(this.itemClicked(i),this.focusItem(i));return}this.reorder(e,i,!0)}}pointerStarted(e,t){this.reorderDisabled||t.pointerType==="mouse"||t.target.closest(".strip-popover")||(this.pointerId=t.pointerId,this.pointerIndex=e,this.pointerX=t.clientX,this.pointerY=t.clientY,this.pointerMoved=!1,t.currentTarget.setPointerCapture(t.pointerId))}pointerMovedOver(e){if(e.pointerId!==this.pointerId||this.pointerIndex===void 0)return;const t=e.clientX-this.pointerX,i=e.clientY-this.pointerY;if(!this.pointerMoved){if(Math.abs(i)>Math.abs(t)||Math.abs(t)<10)return;this.pointerMoved=!0}e.preventDefault();const s=this.shadowRoot?.elementFromPoint(e.clientX,e.clientY)?.closest("[data-item-index]"),r=Number(s?.dataset.itemIndex);!Number.isInteger(r)||r===this.pointerIndex||(this.reorder(this.pointerIndex,r),this.pointerIndex=r)}pointerFinished(e){if(e.pointerId!==this.pointerId)return;const t=e.currentTarget;t.hasPointerCapture(e.pointerId)&&t.releasePointerCapture(e.pointerId),this.suppressClick=this.pointerMoved,this.pointerId=void 0,this.pointerIndex=void 0,this.pointerMoved=!1}reorder(e,t,i=!1){this.reorderDisabled||e===t||(this.dispatchEvent(new CustomEvent("items-reordered",{detail:{from:e,to:t},bubbles:!0,composed:!0})),i&&this.focusItem(t))}static{this.styles=[N,E`
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
  `]}}ue([h({attribute:!1})],ee.prototype,"items");ue([h({attribute:!1})],ee.prototype,"activeIndex");ue([h()],ee.prototype,"ariaLabel");ue([h()],ee.prototype,"itemRole");ue([h()],ee.prototype,"addLabel");ue([h({type:Boolean})],ee.prototype,"addDisabled");ue([h({type:Boolean})],ee.prototype,"reorderDisabled");customElements.get("govee-reorderable-strip")||customElements.define("govee-reorderable-strip",ee);var Fs=Object.defineProperty,nt=(n,e,t,i)=>{for(var s=void 0,r=n.length-1,a;r>=0;r--)(a=n[r])&&(s=a(e,t,s)||s);return s&&Fs(e,t,s),s};class Be extends D{constructor(){super(...arguments),this.label="",this.options=[],this.value="",this.disabled=!1}render(){return o`
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
    `}select(e){this.disabled||e===this.value||this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}static{this.styles=[N,Q,E`
      :host {
        display: block;
      }
    `]}}nt([h()],Be.prototype,"label");nt([h({attribute:!1})],Be.prototype,"options");nt([h({attribute:!1})],Be.prototype,"value");nt([h({type:Boolean})],Be.prototype,"disabled");customElements.get("govee-segmented-control")||customElements.define("govee-segmented-control",Be);var Us=Object.defineProperty,pe=(n,e,t,i)=>{for(var s=void 0,r=n.length-1,a;r>=0;r--)(a=n[r])&&(s=a(e,t,s)||s);return s&&Us(e,t,s),s};class te extends D{constructor(){super(...arguments),this.label="",this.value=0,this.minimum=0,this.maximum=100,this.step=1,this.disabled=!1,this.showValue=!1}render(){const e=Hs(this.value,this.minimum,this.maximum);return o`
      <label class="slider-field">
        <span class="slider-heading">
          <span class="parameter-label">${this.label}</span>
          ${this.showValue?o`<output aria-label="${this.label} value">${e}</output>`:d}
        </span>
        <input
          type="range"
          min=${this.minimum}
          max=${this.maximum}
          step=${this.step}
          .value=${String(e)}
          aria-label=${this.label}
          ?disabled=${this.disabled}
          @input=${this.inputChanged}
        />
      </label>
    `}inputChanged(e){this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:Number(e.target.value)},bubbles:!0,composed:!0}))}static{this.styles=[N,Q,E`
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
        margin: 0;
      }
    `]}}pe([h()],te.prototype,"label");pe([h({type:Number})],te.prototype,"value");pe([h({type:Number})],te.prototype,"minimum");pe([h({type:Number})],te.prototype,"maximum");pe([h({type:Number})],te.prototype,"step");pe([h({type:Boolean})],te.prototype,"disabled");pe([h({type:Boolean})],te.prototype,"showValue");function Hs(n,e,t){return Math.min(t,Math.max(e,n))}customElements.get("govee-slider-control")||customElements.define("govee-slider-control",te);function J(n){return n.map(e=>[...e])}function k(n){return`#${n.map(e=>e.toString(16).padStart(2,"0")).join("")}`}function oi(n){return[Number.parseInt(n.slice(1,3),16),Number.parseInt(n.slice(3,5),16),Number.parseInt(n.slice(5,7),16)]}function Te(n,e){return n.localeCompare(e,"en-AU",{sensitivity:"base"})}function Qe(n,e,t){return n===void 0||e===t?n:n===e?t:e<t&&n>e&&n<=t?n-1:t<e&&n>=t&&n<e?n+1:n}function M(n){return n instanceof Error||typeof n=="object"&&n!==null&&"message"in n&&typeof n.message=="string"?n.message:"An unexpected error occurred."}function kt(n){if(typeof n=="object"&&n!==null&&"code"in n&&typeof n.code=="string")return n.code}var qs=Object.defineProperty,he=(n,e,t,i)=>{for(var s=void 0,r=n.length-1,a;r>=0;r--)(a=n[r])&&(s=a(e,t,s)||s);return s&&qs(e,t,s),s};const fe=5,li=8,di=15,Ui=[1,2,0,3],Hi=[0,1,2,3],Vs={0:"Segment",1:"Continuous",2:"Random",3:"Custom"},Ks={0:"Brightest to darkest",1:"Brightest, darkest, brightest",2:"Darkest to brightest",3:"Darkest, brightest, darkest"},ci={0:"Forward",1:"Backward",2:"Forward and back",3:"Back and forward"};class ie extends D{constructor(){super(...arguments),this.disabled=!1,this.segmentCount=di,this.activeLayerIndex=0,this.activePatternIndex=0,this.movementAnnouncement=""}willUpdate(e){if(!(!e.has("content")||!this.content)){if(this.content.layers.length===0){this.activeLayerIndex=0,this.activePatternIndex=0;return}if(this.activeLayerIndex=O(this.activeLayerIndex,0,this.content.layers.length-1),this.activeLayer.brightness_patterns.length===0){this.activePatternIndex=0;return}this.activePatternIndex=O(this.activePatternIndex,0,this.activeLayer.brightness_patterns.length-1)}}render(){if(!this.content)return d;if(this.content.layers.length===0)return this.renderEmptyLayers();const e=this.activeLayer,t=this.content.layers.map((i,s)=>({key:`layer-${s}`,label:`Layer ${s+1}`,ariaLabel:`Layer ${s+1}. Drag to reorder or use arrow keys.`,id:`advanced-layer-tab-${s}`,ariaControls:"advanced-layer-panel"}));return o`
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
          .addDisabled=${this.disabled||this.content.layers.length>=fe}
          .reorderDisabled=${this.disabled}
          @item-selected=${i=>this.selectLayer(i.detail.index)}
          @items-reordered=${i=>this.reorderLayer(i.detail.from,i.detail.to)}
          @item-added=${this.addLayer}
        >
          ${this.layerActionsIndex===void 0?d:o`
                <div
                  slot="item-${this.layerActionsIndex}"
                  class="strip-popover layer-actions-popover"
                  role="dialog"
                  aria-label="Layer actions"
                >
                  <button
                    class="secondary"
                    type="button"
                    ?disabled=${this.disabled||this.content.layers.length>=fe}
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

        ${this.content.layers.length>=fe?o`
              <p class="limit-note">
                ${this.content.layers.length>fe?`This loaded effect has ${this.content.layers.length} layers. All are preserved, but adding and copying are unavailable while five or more remain.`:"Advanced effects can author up to five layers."}
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
    `}get activeLayer(){return this.content.layers[this.activeLayerIndex]}renderAppliedArea(e){const t=e.area.start_tenths>=0&&e.area.start_tenths<=9&&e.area.width_tenths>=1&&e.area.width_tenths<=10-e.area.start_tenths,i=O(e.area.start_tenths,0,9),s=i+e.area.width_tenths,r=Number.isInteger(this.segmentCount)&&this.segmentCount>0?this.segmentCount:di,a=k(e.palette[0]??[47,111,237]);return o`
      <section class="card wide-card">
        <h3 class="section-title">Applied area</h3>
        <div class="area-control">
          <div
            class="area-track"
            style="--area-segment-count: ${r}; --area-colour: ${a};"
          >
            <div
              class="area-segments"
              aria-label="Applied area, ${r} segments"
            >
              ${Array.from({length:r},(l,c)=>o`
                  <span
                    class=${t&&Ws(c,r,i,s)?"covered":""}
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
                      @pointerdown=${l=>this.areaPointerStarted("start",i,s,l)}
                      @pointermove=${this.areaPointerMoved}
                      @pointerup=${this.areaPointerFinished}
                      @pointercancel=${this.areaPointerFinished}
                      @lostpointercapture=${this.areaPointerFinished}
                      @keydown=${l=>this.areaBoundaryKeyDown("start",i,s,l)}
                    >
                      <span aria-hidden="true"></span>
                    </button>
                    <button
                      class="area-selection-body"
                      type="button"
                      aria-label="Move applied area, ${i*10}% to ${s*10}%"
                      ?disabled=${this.disabled}
                      @pointerdown=${l=>this.areaPointerStarted("move",i,s,l)}
                      @pointermove=${this.areaPointerMoved}
                      @pointerup=${this.areaPointerFinished}
                      @pointercancel=${this.areaPointerFinished}
                      @lostpointercapture=${this.areaPointerFinished}
                      @keydown=${l=>this.areaPositionKeyDown(i,s,l)}
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
                      @pointerdown=${l=>this.areaPointerStarted("end",i,s,l)}
                      @pointermove=${this.areaPointerMoved}
                      @pointerup=${this.areaPointerFinished}
                      @pointercancel=${this.areaPointerFinished}
                      @lostpointercapture=${this.areaPointerFinished}
                      @keydown=${l=>this.areaBoundaryKeyDown("end",i,s,l)}
                    >
                      <span aria-hidden="true"></span>
                    </button>
                  </div>
                `:d}
          </div>
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
    `}areaPointerStarted(e,t,i,s){if(this.disabled)return;const r=this.shadowRoot?.querySelector(".area-track");if(!r)return;const a=r.getBoundingClientRect();if(a.width<=0)return;const l=s.currentTarget,c=e==="start"?t:e==="end"?i:t;s.preventDefault(),s.stopPropagation(),l.focus(),l.setPointerCapture(s.pointerId),this.areaDrag={pointerId:s.pointerId,mode:e,initialStart:t,initialEnd:i,currentStart:t,currentEnd:i,originX:s.clientX,pointerOffsetX:e==="move"?0:s.clientX-(a.left+c/10*a.width),trackLeft:a.left,trackWidth:a.width,captureTarget:l}}areaPointerMoved(e){const t=this.areaDrag;if(!t||t.pointerId!==e.pointerId)return;e.preventDefault();let i=t.initialStart,s=t.initialEnd;if(t.mode==="move"){const r=t.initialEnd-t.initialStart,a=Math.round((e.clientX-t.originX)/t.trackWidth*10);i=O(t.initialStart+a,0,10-r),s=i+r}else{const r=Math.round((e.clientX-t.pointerOffsetX-t.trackLeft)/t.trackWidth*10);t.mode==="start"?i=O(r,0,t.initialEnd-1):s=O(r,t.initialStart+1,10)}i===t.currentStart&&s===t.currentEnd||(t.currentStart=i,t.currentEnd=s,this.setAppliedArea(i,s))}areaPointerFinished(e){const t=this.areaDrag;!t||t.pointerId!==e.pointerId||(t.captureTarget.hasPointerCapture(e.pointerId)&&t.captureTarget.releasePointerCapture(e.pointerId),this.areaDrag=void 0)}areaBoundaryKeyDown(e,t,i,s){const r=e==="start"?0:t+1,a=e==="start"?i-1:10,l=e==="start"?t:i,c=pi(s.key,l,r,a);c!==void 0&&(s.preventDefault(),this.setAppliedArea(e==="start"?c:t,e==="end"?c:i))}areaPositionKeyDown(e,t,i){const s=t-e,r=pi(i.key,e,0,10-s);r!==void 0&&(i.preventDefault(),this.setAppliedArea(r,r+s))}setAppliedArea(e,t){this.updateLayer({area:{start_tenths:e,width_tenths:t-e}})}renderSelectionControls(e){const t=e.selection,i=js(t.type);return o`
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
            ${Ui.map(s=>o`<option
                  value=${s}
                  .selected=${t.type===s}
                >
                  ${Vs[s]}
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
          .maxColours=${li}
          .disabled=${this.disabled}
          @palette-changed=${t=>this.updateLayer({palette:t.detail.palette.map(i=>[...i])})}
        ></govee-palette-editor>
        ${e.palette.length>li?o`
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
      `;const t=O(this.activePatternIndex,0,e.brightness_patterns.length-1),i=e.brightness_patterns[t],s=Gs(i.order);return o`
      <section class="card wide-card">
        <h3 class="section-title">Brightness</h3>
        <govee-segmented-control
          .label=${"Distribution"}
          .value=${e.brightness_gradient}
          .options=${[{value:!1,label:"Unified"},{value:!0,label:"Gradient"}]}
          .disabled=${this.disabled}
          @value-changed=${r=>this.updateLayer({brightness_gradient:r.detail.value})}
        ></govee-segmented-control>

        <div class="pattern-toolbar">
          <div
            class="pattern-tabs"
            role="tablist"
            aria-label="Brightness patterns"
          >
            ${e.brightness_patterns.map((r,a)=>o`
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
              @change=${r=>this.updateBrightnessPattern({order:Number(r.target.value)})}
            >
              ${Hi.map(r=>o`<option value=${r}>
                    ${Ks[r]}
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
                ${this.byteNumberField("Order (raw byte)",i.order,r=>this.updateBrightnessPattern({order:r}))}
              `}
          ${this.rangeField("Scope low",i.scope_low,0,255,r=>this.updateBrightnessPattern({scope_low:r}))}
          ${this.rangeField("Scope high",i.scope_high,0,255,r=>this.updateBrightnessPattern({scope_high:r}))}
          ${this.rangeField("Changing speed",i.change_speed,0,255,r=>this.updateBrightnessPattern({change_speed:r}))}
          ${this.rangeField("Brightest retention",i.brightest_retention,0,255,r=>this.updateBrightnessPattern({brightest_retention:r}))}
          ${this.rangeField("Darkest retention",i.darkest_retention,0,255,r=>this.updateBrightnessPattern({darkest_retention:r}))}
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
              ${this.byteNumberField("Distance",s.distance,r=>this.updateMovement(t,{distance:r},`${i} distance ${r}.`))}
              <label class="field">
                <span>Direction</span>
                <select
                  .value=${String(s.direction)}
                  ?disabled=${this.disabled}
                  @change=${r=>{const a=Number(r.target.value);this.updateMovement(t,{direction:a},`${i} direction ${ci[a]}.`)}}
                >
                  ${Object.entries(ci).map(([r,a])=>o`<option value=${r}>${a}</option>`)}
                </select>
              </label>
              ${this.rangeField("Speed",s.speed,0,255,r=>this.updateMovement(t,{speed:r},`${i} speed ${zs(r)} per cent.`))}
              <label class="check-field">
                <input
                  type="checkbox"
                  .checked=${s.enter_exit}
                  ?disabled=${this.disabled}
                  @change=${r=>{const a=r.target.checked;this.updateMovement(t,{enter_exit:a},`${i} enter and exit ${a?"enabled":"disabled"}.`)}}
                />
                <span>Enter and exit</span>
              </label>
            `:d}
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
    `}rangeField(e,t,i,s,r){return o`
      <govee-slider-control
        .label=${e}
        .value=${t}
        .minimum=${i}
        .maximum=${s}
        .disabled=${this.disabled}
        @value-changed=${a=>r(a.detail.value)}
      ></govee-slider-control>
    `}byteNumberField(e,t,i){return this.numberField(e,t,0,255,i)}numberField(e,t,i,s,r){return o`
      <label class="field">
        <span>${e}</span>
        <input
          type="number"
          min=${i}
          max=${s}
          .value=${String(t)}
          ?disabled=${this.disabled}
          @change=${a=>r(O(Number(a.target.value),i,s))}
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
          @change=${r=>{const a=r.target,l=Ys(a.value);if(l===void 0){a.setCustomValidity("Enter one byte from 00 to FF."),a.reportValidity();return}if((l&~s)!==0){a.setCustomValidity(`Known flag bits are controlled elsewhere. Allowed mask: ${Ve(s)}.`),a.reportValidity();return}a.setCustomValidity(""),i(l)}}
        />
      </label>
    `}updateLayer(e){if(!this.content||this.disabled)return;const t=this.content.layers.map((i,s)=>s===this.activeLayerIndex?Y({...i,...e}):Y(i));this.emitContent({kind:"advanced",layers:t})}updateSelection(e){this.updateLayer({selection:{...this.activeLayer.selection,...e}})}updateBrightnessPattern(e){const t=this.activeLayer.brightness_patterns.map((i,s)=>s===this.activePatternIndex?{...i,...e}:{...i});this.updateLayer({brightness_patterns:t})}updateMovement(e,t,i){this.updateLayer({[e]:{...this.activeLayer[e],...t}}),i&&(this.movementAnnouncement=i)}addLayer(){if(!this.content||this.disabled||this.content.layers.length>=fe)return;const e=[...this.content.layers.map(Y),qi()];this.installContent({kind:"advanced",layers:e}),this.activeLayerIndex=e.length-1,this.activePatternIndex=0,this.layerActionsIndex=void 0,this.focusActiveTab()}copyLayer(){if(!this.content||this.disabled||this.content.layers.length>=fe)return;const e=this.content.layers.map(Y);e.splice(this.activeLayerIndex+1,0,Y(this.activeLayer)),this.installContent({kind:"advanced",layers:e}),this.activeLayerIndex+=1,this.activePatternIndex=0,this.layerActionsIndex=this.activeLayerIndex,this.focusActiveTab()}deleteLayer(){if(!this.content||this.disabled||this.content.layers.length===1)return;const e=this.content.layers.filter((t,i)=>i!==this.activeLayerIndex).map(Y);this.activeLayerIndex=Math.min(this.activeLayerIndex,e.length-1),this.activePatternIndex=0,this.layerActionsIndex=void 0,this.emitContent({kind:"advanced",layers:e}),this.focusActiveTab()}reorderLayer(e,t){if(!this.content||this.disabled||e<0||e>=this.content.layers.length||t<0||t>=this.content.layers.length||e===t)return;const i=this.content.layers.map(Y),[s]=i.splice(e,1);i.splice(t,0,s),this.activeLayerIndex=Qe(this.activeLayerIndex,e,t),this.layerActionsIndex!==void 0&&(this.layerActionsIndex=Qe(this.layerActionsIndex,e,t)),this.emitContent({kind:"advanced",layers:i})}addBrightnessPattern(){if(this.disabled||this.activeLayer.brightness_patterns.length>=3)return;const e=[...this.activeLayer.brightness_patterns.map(t=>({...t})),Vi()];this.activePatternIndex=e.length-1,this.updateLayer({brightness_patterns:e})}deleteBrightnessPattern(){if(this.disabled||this.activeLayer.brightness_patterns.length===1)return;const e=this.activeLayer.brightness_patterns.filter((t,i)=>i!==this.activePatternIndex).map(t=>({...t}));this.activePatternIndex=Math.min(this.activePatternIndex,e.length-1),this.updateLayer({brightness_patterns:e})}selectLayer(e){if(e===this.activeLayerIndex){this.layerActionsIndex=this.layerActionsIndex===e?void 0:e;return}this.activeLayerIndex=e,this.activePatternIndex=0,this.layerActionsIndex=e}patternTabKeyPressed(e,t){const i=this.activeLayer.brightness_patterns.length;let s;t.key==="ArrowLeft"?s=e===0?i-1:e-1:t.key==="ArrowRight"?s=e===i-1?0:e+1:t.key==="Home"?s=0:t.key==="End"&&(s=i-1),s!==void 0&&(t.preventDefault(),this.activePatternIndex=s,this.updateComplete.then(()=>{this.shadowRoot?.querySelectorAll(".pattern-tabs button")[s]?.focus()}))}focusActiveTab(){this.updateComplete.then(()=>{this.shadowRoot?.querySelector("govee-reorderable-strip")?.focusItem(this.activeLayerIndex)})}excessChanged(e){const t=e.value.replace(/\s+/g,"").toLowerCase();if(!/^(?:[0-9a-f]{2})*$/.test(t)){e.setCustomValidity("Enter an even number of hexadecimal digits."),e.reportValidity();return}e.setCustomValidity(""),this.updateLayer({excess:t})}emitContent(e){this.dispatchEvent(new CustomEvent("content-changed",{detail:{content:e},bubbles:!0,composed:!0}))}installContent(e){this.content=e,this.emitContent(e)}static{this.styles=[N,ce,Ft,Q,Ut,E`
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
  `]}}he([h({attribute:!1})],ie.prototype,"content");he([h({type:Boolean})],ie.prototype,"disabled");he([h({type:Number})],ie.prototype,"segmentCount");he([g()],ie.prototype,"activeLayerIndex");he([g()],ie.prototype,"activePatternIndex");he([g()],ie.prototype,"movementAnnouncement");he([g()],ie.prototype,"layerActionsIndex");function ct(){return{kind:"advanced",layers:[qi()]}}function $e(n){return{kind:"advanced",layers:n.layers.map(Y)}}function oe(n){return{...n,template:{...n.template},effect:{layers:$e({layers:n.effect.layers}).layers}}}function qi(){return{area:{start_tenths:0,width_tenths:10},selection:{type:0,param_1:0,param_2:1},brightness_gradient:!1,brightness_patterns:[Vi()],distribution:{method:1,backwards:!1},colour_speed:128,colour_retention:20,palette:[[255,0,0],[0,0,255]],selected_movement:ui(),overall_movement:ui(),priority:0,unknown_flags:0,excess:""}}function Vi(){return{scope_high:255,scope_low:0,order:0,change_speed:128,brightest_retention:20,darkest_retention:20}}function ui(){return{enabled:!1,enter_exit:!1,direction:0,distance:1,speed:128,unknown_flags:0}}function Y(n){return{...n,area:{...n.area},selection:{...n.selection},brightness_patterns:n.brightness_patterns.map(e=>({...e})),distribution:{...n.distribution},palette:n.palette.map(e=>[...e]),selected_movement:{...n.selected_movement},overall_movement:{...n.overall_movement}}}function js(n){return Ui.includes(n)}function Gs(n){return Hi.includes(n)}function zs(n){return Math.round(O(n,0,255)/255*100)}function Ve(n){return n.toString(16).padStart(2,"0").toUpperCase()}function Ys(n){const e=n.trim().replace(/^0x/i,"");if(/^[0-9a-f]{1,2}$/i.test(e))return Number.parseInt(e,16)}function Ws(n,e,t,i){const s=n*10/e;return(n+1)*10/e>t&&s<i}function pi(n,e,t,i){if(n==="Home")return t;if(n==="End")return i;if(n==="ArrowLeft"||n==="ArrowDown")return O(e-1,t,i);if(n==="ArrowRight"||n==="ArrowUp")return O(e+1,t,i)}function O(n,e,t){return Math.min(t,Math.max(e,Math.round(n)))}customElements.get("govee-advanced-effect-editor")||customElements.define("govee-advanced-effect-editor",ie);const Xs=2,Ki=1,Js=3,Zs=["compiling","pending","uploading","activating","verifying","confirmed","applied","uncertain","recovering","failed","interrupted","unknown"],ut=["compiling","pending","uploading","activating","verifying","recovering"],hi=5,L=128,Se=65536,ji=512,Gi=256,zi=32,Yi=128,Wi=512,_=255,Qs=64,Xi=262144,mi=16,en=4096,Ji=16384,B=1024,pt=16384,Ht=Number.MAX_SAFE_INTEGER,wt=4335,tn=232,sn=253,le=["H617A","H6199"],ht="H617A",Zi=["movie","game"],fi=["native_scenes","edited_palette_scenes","layered_scenes","painted","single","multi","native_music","video","palette_diy","advanced","workshop","special_diy"],nn=["studio","home_assistant","planned"],rn=["exact_session","activation_match","settings_match","mode_match","write_completed","unknown"],an={H617A:["native_scenes","edited_palette_scenes","layered_scenes","painted","single","multi","native_music","advanced","workshop","special_diy"],H6199:["native_scenes","edited_palette_scenes","layered_scenes","palette_diy","native_music","video","advanced","workshop","special_diy"]};function on(n){const e=m(n,"editor info"),t=m(e.limits,"editor limits");return{api_version:u(e.api_version,"API version",1),effect_schema_version:u(e.effect_schema_version,"effect schema version",1),compiler_version:u(e.compiler_version,"compiler version",1),limits:{effect_name:K(t.effect_name,L,"effect-name limit"),effect_document_bytes:K(t.effect_document_bytes,Se,"effect-document limit"),devices:K(t.devices,ji,"device limit"),library_items:K(t.library_items,Gi,"library-item limit"),drafts_per_owner:K(t.drafts_per_owner,zi,"draft limit"),deployment_records:K(t.deployment_records,Yi,"deployment limit"),scene_catalogue_entries:K(t.scene_catalogue_entries,Wi,"scene catalogue limit")}}}function ln(n){const e=w(n,"devices",ji).map((t,i)=>{const s=m(t,`devices[${i}]`),r=m(s.custom_effects,`devices[${i}].custom_effects`),a=m(s.profiles,`devices[${i}].profiles`);return{config_entry_id:f(s.config_entry_id,`devices[${i}].config_entry_id`,_),model:f(s.model,`devices[${i}].model`,_),display_name:f(s.display_name,`devices[${i}].display_name`,_),segment_count:u(s.segment_count,`devices[${i}].segment_count`,0,65535),custom_effects:{painted:C(r.painted,"painted capability"),single:C(r.single,"single capability"),multi:C(r.multi,"multi capability"),palette_diy:C(r.palette_diy,"palette DIY capability"),advanced:C(r.advanced,"advanced capability"),workshop:C(r.workshop,"Workshop capability"),special_diy:C(r.special_diy,"Special DIY capability")},profiles:{music:C(a.music,"music profile capability"),video:C(a.video,"video profile capability")},readback:f(s.readback,`devices[${i}].readback`,_)}});return U(e,t=>t.config_entry_id,"device IDs"),e}function dn(n){me(n,"custom-effect catalogue",Xi,Ji);const e=m(n,"custom-effect catalogue"),t=cn(e.models),i=Et(e,"custom-effect catalogue",ht);if(JSON.stringify(i)!==JSON.stringify(t[ht]))throw new Error("Malformed Effect Studio server payload: legacy custom-effect catalogue view does not match models.H617A.");return K(e.schema_version,hi,"catalogue schema"),{...i,schema_version:hi,sku:ht,models:t}}function cn(n){const e=m(n,"custom-effect catalogue models"),i=Object.keys(e).filter(s=>!le.includes(s));if(i.length>0)throw new Error(`Malformed Effect Studio server payload: unexpected catalogue models ${i.join(", ")}.`);for(const s of le)if(!(s in e))throw new Error(`Malformed Effect Studio server payload: missing catalogue model ${s}.`);return{H617A:Et(e.H617A,"catalogue model H617A","H617A"),H6199:Et(e.H6199,"catalogue model H6199","H6199")}}function Et(n,e,t){const i=m(n,e),s=m(i.limits,`${e} limits`),r=m(i.supports,`${e} support capabilities`),a=m(i.apply,`${e} Apply capabilities`),l=A(i.sku,le,`${e} SKU`);if(l!==t)throw new Error(`Malformed Effect Studio server payload: ${e} is keyed as ${t} but declares ${l}.`);const c=u(s.music_sensitivity_min,`${e} minimum music sensitivity`,0,100),p=u(s.music_sensitivity_max,`${e} maximum music sensitivity`,0,100);return c>p&&v(`${e} music sensitivity limits are inverted`),{sku:l,painted_effects:pn(i.painted_effects,`${e} painted-effect templates`),effects:hn(i.effects,`${e} custom-effect templates`),music_modes:gi(i.music_modes,`${e} music modes`),video_modes:gi(i.video_modes,`${e} video modes`,Zi),workshop_templates:mn(i.workshop_templates,`${e} Workshop templates`,t),special_diy_templates:fn(i.special_diy_templates,`${e} Special DIY templates`,t),workflows:un(i.workflows,`${e} release workflows`,t),supports:{multi:C(r.multi,`${e} Multi support`),advanced:C(r.advanced,`${e} advanced support`),workshop:C(r.workshop,`${e} Workshop support`),special_diy:C(r.special_diy,`${e} Special DIY support`)},limits:{palette_min:u(s.palette_min,`${e} minimum palette`,1,255),palette_max:u(s.palette_max,`${e} maximum palette`,1,255),multi_max:u(s.multi_max,`${e} maximum Multi effects`,1,255),music_sensitivity_min:c,music_sensitivity_max:p},apply:{painted:C(a.painted,`${e} Painted Apply capability`),single:C(a.single,`${e} Single Apply capability`),multi:C(a.multi,`${e} Multi Apply capability`),palette_diy:C(a.palette_diy,`${e} palette DIY Apply capability`),workshop:C(a.workshop,`${e} Workshop Apply capability`),special_diy:C(a.special_diy,`${e} Special DIY Apply capability`)}}}function un(n,e,t){const i=w(n,e,fi.length).map((c,p)=>{const b=m(c,`${e}[${p}]`);return{id:A(b.id,fi,`${e}[${p}] ID`),label:f(b.label,`${e}[${p}] label`,L),content_kind:f(b.content_kind,`${e}[${p}] content kind`,_),application:A(b.application,nn,`${e}[${p}] application`)}});U(i,c=>c.id,`${e} IDs`);const s=an[t],r=new Set(i.map(c=>c.id)),a=s.filter(c=>!r.has(c)),l=i.map(c=>c.id).filter(c=>!s.includes(c));if(a.length>0||l.length>0)throw new Error(`Malformed Effect Studio server payload: ${e} does not match ${t}.`);return i}function pn(n,e){const t=w(n,e,B).map((i,s)=>{const r=m(i,`${e}[${s}]`);return{id:A(r.id,["cycle","clockwise","counter_clockwise","twinkle","gradient","breathe"],`${e} ID`),label:f(r.label,`${e} label`,L)}});return U(t,i=>i.id,`${e} IDs`),t}function hn(n,e){const t=w(n,e,B).map((i,s)=>{const r=m(i,`${e}[${s}]`),a=w(r.variations,`${e}[${s}].variations`,B);if(a.length===0)throw new Error("Malformed Effect Studio server payload: custom-effect template has no variations.");const l={id:f(r.id,`${e}[${s}] ID`,_),label:f(r.label,`${e}[${s}] label`,L),family:u(r.family,`${e}[${s}] family`,0,255),variations:a.map((c,p)=>{const b=m(c,`${e}[${s}].variations[${p}]`);return{id:f(b.id,`${e}[${s}].variations[${p}] ID`,_),label:f(b.label,`${e}[${s}].variations[${p}] label`,L),variant:u(b.variant,`${e}[${s}].variations[${p}] variant`,0,255)}}),supports_multi:F(r.supports_multi,`${e}[${s}] Multi support`),rate:A(r.rate,["speed","sensitivity"],`${e}[${s}] rate parameter`),category:A(r.category,["single_layer"],`${e}[${s}] category`)};return U(l.variations,c=>c.id,`${e}[${s}] variation IDs`),l});return U(t,i=>i.id,`${e} IDs`),t}function gi(n,e,t){const i=w(n,e,B).map((s,r)=>{const a=m(s,`${e}[${r}]`);return{id:t?A(a.id,t,`${e}[${r}] ID`):f(a.id,`${e}[${r}] ID`,_),label:f(a.label,`${e}[${r}] label`,L)}});return U(i,s=>s.id,`${e} IDs`),i}function mn(n,e,t){const i=w(n,e,B).map((s,r)=>{const a=m(s,`${e}[${r}]`),l=rt(a.content);return(l.kind!=="workshop"||l.model!==t)&&v(`${e}[${r}] content does not target ${t}`),{id:f(a.id,`${e}[${r}] ID`,_),label:f(a.label,`${e}[${r}] label`,L),source_fixture:f(a.source_fixture,`${e}[${r}] source fixture`,_),content:l}});return U(i,s=>s.id,`${e} IDs`),i}function fn(n,e,t){const i=w(n,e,B).map((s,r)=>{const a=m(s,`${e}[${r}]`),l=rt(a.content);return(l.kind!=="special_diy"||l.model!==t)&&v(`${e}[${r}] content does not target ${t}`),{id:f(a.id,`${e}[${r}] ID`,_),label:f(a.label,`${e}[${r}] label`,L),source_fixture:f(a.source_fixture,`${e}[${r}] source fixture`,_),content:l}});return U(i,s=>s.id,`${e} IDs`),i}function bi(n){const e=m(n,"library snapshot"),t={library_revision:Z(e.library_revision,"library revision",0),items:w(e.items,"library items",Gi).map((i,s)=>{const r=m(i,`library items[${s}]`),a=r.template===void 0?void 0:et(r.template,`library items[${s}].template`),l=r.model===void 0?void 0:Sn(r.model);return{id:f(r.id,"library item ID",_),revision:Z(r.revision,"library item revision",1),name:f(r.name,"library item name",L),kind:f(r.kind,"library item kind",_),...l?{model:l}:{},...a?{template:a}:{}}})};return U(t.items,i=>i.id,"library item IDs"),t}function ze(n){me(n,"library item",Se);const e=m(n,"library item"),t=e.target_hint===void 0?void 0:m(e.target_hint,"target hint");return{schema_version:K(e.schema_version,Ki,"effect schema version"),id:f(e.id,"effect ID",_),revision:Z(e.revision,"effect revision",1),name:f(e.name,"effect name",L),content:rt(e.content),provenance:Ct(e.provenance,"effect provenance"),extensions:Ct(e.extensions,"effect extensions"),...t?{target_hint:{model:t.model===null?null:f(t.model,"target model",_),segment_count:t.segment_count===null?null:u(t.segment_count,"target segment count",1,65535)}}:{}}}function gn(n){const e=w(n,"draft summaries",zi).map((t,i)=>{const s=m(t,`draft summaries[${i}]`);return{id:f(s.id,"draft ID",_),revision:Z(s.revision,"draft revision",1),name:f(s.name,"draft name",L),updated_at:Vt(s.updated_at,"draft timestamp"),selected_config_entry_id:xe(s.selected_config_entry_id,"draft config entry ID")}});return U(e,t=>t.id,"draft IDs"),e}function mt(n){const e=m(n,"effect draft");return{id:f(e.id,"draft ID",_),owner_id:f(e.owner_id,"draft owner",_),revision:Z(e.revision,"draft revision",1),item:ze(e.item),updated_at:Vt(e.updated_at,"draft timestamp"),selected_config_entry_id:xe(e.selected_config_entry_id,"draft config entry ID"),base_item_id:xe(e.base_item_id,"draft base item ID"),base_item_revision:e.base_item_revision===null?null:Z(e.base_item_revision,"draft base item revision",1)}}function St(n){const e=m(n,"deployment"),t=A(e.phase,Zs,"deployment phase"),i={operation_id:f(e.operation_id,"deployment operation ID",_),config_entry_id:f(e.config_entry_id,"deployment config entry ID",_),diy_code:e.diy_code===null?null:u(e.diy_code,"deployment DIY code",0,65535),content_kind:f(e.content_kind,"deployment content kind",_),target_mode:A(e.target_mode,["custom","scene","music","video"],"deployment target mode"),target_effect:xe(e.target_effect,"deployment target effect"),phase:t,updated_at:Vt(e.updated_at,"deployment timestamp"),item_id:xe(e.item_id,"deployment item ID"),item_revision:e.item_revision===null?null:Z(e.item_revision,"deployment item revision",1),error_code:xe(e.error_code,"deployment error code"),progress_current:u(e.progress_current,"deployment progress",0,1024),progress_total:u(e.progress_total,"deployment progress total",0,1024),verification_confidence:A(e.verification_confidence,rn,"deployment verification confidence")};return i.progress_current>i.progress_total&&v("deployment progress exceeds its total"),i}function bn(n){const e=m(n,"deployment snapshot"),t={revision:Z(e.revision,"deployment revision",0),deployments:w(e.deployments,"deployments",Yi).map(St)};return U(t.deployments,i=>i.operation_id,"deployment operation IDs"),t}function vn(n){me(n,"scene catalogue",Xi,Ji);const e=m(n,"scene catalogue");return{schema_version:u(e.schema_version,"scene catalogue schema",1),sku:f(e.sku,"scene catalogue SKU",_),enabled:F(e.enabled,"scene catalogue enabled"),categories:w(e.categories,"scene categories",B).map((t,i)=>{const s=m(t,`scene categories[${i}]`);return{id:u(s.id,"scene category ID",0,65535),name:f(s.name,"scene category name",L)}}),scenes:w(e.scenes,"scenes",Wi).map(qt)}}function yn(n){const e=m(n,"scene detail");me({scene:e.scene,content:e.content},"scene detail",Se);const t=rt(e.content);return t.kind!=="scene_builtin"&&t.kind!=="scene_palette"&&t.kind!=="scene_layered"&&v("scene detail content is unsupported"),{scene:qt(e.scene),content:t}}function rt(n){me(n,"effect content",Se);const e=m(n,"effect content"),t=f(e.kind,"effect content kind",_);switch(t){case"h617a_painted":return{kind:t,effect:A(e.effect,["cycle","clockwise","counter_clockwise","twinkle","gradient","breathe"],"painted effect"),speed:u(e.speed,"painted speed",0,100),brightness:u(e.brightness,"painted brightness",0,100),background:Ee(e.background,"painted background"),groups:w(e.groups,"paint groups",15).map((i,s)=>{const r=m(i,`paint groups[${s}]`);return{fill:Ee(r.fill,"paint-group fill"),segments:w(r.segments,"painted segments",15).map(a=>u(a,"painted segment",0,14))}})};case"h617a_single":return{kind:t,family:u(e.family,"Single family",0,254),variant:u(e.variant,"Single variant",0,255),speed:u(e.speed,"Single speed",0,100),palette:_e(e.palette,"Single palette",8)};case"h617a_multi":return{kind:t,effects:w(e.effects,"Multi effects",4).map((i,s)=>{const r=m(i,`Multi effects[${s}]`);return{family:u(r.family,"Multi family",0,254),variant:u(r.variant,"Multi variant",0,255)}}),speed:u(e.speed,"Multi speed",0,100),palette:_e(e.palette,"Multi palette",8)};case"palette_diy":return{kind:t,model:A(e.model,le,"palette DIY model"),family:u(e.family,"palette DIY family",0,255),variant:u(e.variant,"palette DIY variant",0,255),speed:u(e.speed,"palette DIY speed",0,100),palette:_e(e.palette,"palette DIY palette",8)};case"music_profile":return{kind:t,model:A(e.model,le,"music profile model"),mode:f(e.mode,"music profile mode",_),sensitivity:u(e.sensitivity,"music profile sensitivity",0,100),colour:xn(e.colour,"music profile colour"),calm:kn(e.calm,"music profile calm"),parameters:Ct(e.parameters,"music profile parameters")};case"video_profile":return{kind:t,model:A(e.model,["H6199"],"video profile model"),mode:A(e.mode,Zi,"video profile mode"),full_screen:F(e.full_screen,"video profile full-screen flag"),saturation:u(e.saturation,"video profile saturation",0,100),sound_effects:F(e.sound_effects,"video profile sound-effects flag"),sound_effects_softness:u(e.sound_effects_softness,"video profile sound-effects softness",1,100),white_balance_position:u(e.white_balance_position,"video profile white-balance position",1,20),relative_brightness:wn(e.relative_brightness,"video profile relative brightness"),blank_screen:F(e.blank_screen,"video profile blank-screen flag")};case"advanced":return{kind:t,layers:ft(e.layers,"Advanced layers")};case"workshop":{const i=m(e.effect,"Workshop effect");return{kind:t,model:A(e.model,le,"Workshop model"),template:f(e.template,"Workshop template",_),effect:{layers:ft(i.layers,"Workshop layers")},raw_param:Ye(e.raw_param,"Workshop source parameter"),trailing_padding:u(e.trailing_padding,"Workshop trailing padding",0,wt)}}case"special_diy":return{kind:t,model:A(e.model,["H6199"],"Special DIY model"),template:f(e.template,"Special DIY template",_),family:u(e.family,"Special DIY family",0,255),variant:u(e.variant,"Special DIY variant",0,255),speed:u(e.speed,"Special DIY speed",0,100),palette:_e(e.palette,"Special DIY palette",8),raw_payload:Ye(e.raw_payload,"Special DIY source payload"),trailing_padding:u(e.trailing_padding,"Special DIY trailing padding",0,wt)};case"scene_builtin":return{kind:t,template:et(e.template,"scene template"),speed_index:It(e.speed_index,"scene speed index",0,255)};case"scene_palette":return _n(e);case"scene_layered":{const i=m(e.effect,"layered scene effect"),s=Qi(e.trailing_padding,"layered scene trailing padding");return{kind:t,template:et(e.template,"layered scene template"),effect:{layers:ft(i.layers,"layered scene layers")},speed_index:It(e.speed_index,"layered scene speed index",0,255),raw_param:Ye(e.raw_param,"layered scene raw parameter"),...s===void 0?{}:{trailing_padding:s}}}default:{const{kind:i,...s}=e;return{kind:"opaque",source_kind:t,body:s}}}}function Qi(n,e){if(n!==void 0)return u(n,e,0,wt)}function _n(n){const t=u(n.layout,"palette scene layout",0,1)===0?0:1,i=w(n.steps,"palette scene steps",255).map((l,c)=>{const p=m(l,`palette scene steps[${c}]`),b=t===0?(p.inline_colour!==null&&v(`palette scene steps[${c}].inline_colour must be null for layout 0`),null):Ee(p.inline_colour,`palette scene steps[${c}].inline_colour`);return{value:u(p.value,`palette scene steps[${c}].value`,0,65535),colour:Ee(p.colour,`palette scene steps[${c}].colour`),inline_colour:b}}),s=_e(n.palette,"palette scene shared palette",255,!0);t===1&&s.length!==0&&v("palette scene layout 1 must not have a shared palette");let r;n.config_flags!==void 0&&(r=u(n.config_flags,"palette scene config flags",0,255),r&-9&&v("palette scene config flags must only set reserved config bits"));const a=Qi(n.trailing_padding,"palette scene trailing padding");return{kind:"scene_palette",template:et(n.template,"palette scene template"),layout:t,brightness_flag:F(n.brightness_flag,"palette scene brightness flag"),steps:i,palette:s,speed_index:It(n.speed_index,"palette scene speed index",0,255),...r===void 0?{}:{config_flags:r},...a===void 0?{}:{trailing_padding:a}}}function Ie(n){return n.kind!=="opaque"?n:(me(n.body,"opaque content",Se),{...n.body,kind:f(n.source_kind,"opaque source kind",_)})}function qt(n){const e=m(n,"scene"),t=Fe(e.parameter_kind,"scene parameter kind");t!=="none"&&t!=="palette"&&t!=="layers"&&t!=="opaque"&&v("scene parameter kind is invalid");const i=e.speed===null?null:(()=>{const s=m(e.speed,"scene speed");return{option_count:u(s.option_count,"scene speed option count",1,256),default_index:u(s.default_index,"scene default speed",0,255)}})();return{scene_id:u(e.scene_id,"scene ID",0,65535),effect_id:u(e.effect_id,"scene effect ID",0,65535),category_id:u(e.category_id,"scene category ID",0,65535),category:f(e.category,"scene category",L),name:f(e.name,"scene name",L),variant:En(e.variant,"scene variant",_),display_name:f(e.display_name,"scene display name",L),scene_type:u(e.scene_type,"scene type",0,255),parameter_kind:t,speed:i}}function ft(n,e){return w(n,e,255).map((t,i)=>$n(t,`${e}[${i}]`))}function $n(n,e){const t=m(n,e),i=m(t.area,`${e}.area`),s=m(t.selection,`${e}.selection`),r=m(t.distribution,`${e}.distribution`);return{area:{start_tenths:u(i.start_tenths,`${e}.area.start_tenths`,0,15),width_tenths:u(i.width_tenths,`${e}.area.width_tenths`,0,15)},selection:{type:T(s.type,`${e}.selection.type`),param_1:T(s.param_1,`${e}.selection.param_1`),param_2:T(s.param_2,`${e}.selection.param_2`)},brightness_gradient:F(t.brightness_gradient,`${e}.brightness_gradient`),brightness_patterns:w(t.brightness_patterns,`${e}.brightness_patterns`,255).map((a,l)=>{const c=m(a,`${e}.brightness_patterns[${l}]`);return{scope_high:T(c.scope_high,"brightness scope high"),scope_low:T(c.scope_low,"brightness scope low"),order:T(c.order,"brightness order"),change_speed:T(c.change_speed,"brightness change speed"),brightest_retention:T(c.brightest_retention,"brightest retention"),darkest_retention:T(c.darkest_retention,"darkest retention")}}),distribution:{method:u(r.method,`${e}.distribution.method`,0,127),backwards:F(r.backwards,`${e}.distribution.backwards`)},colour_speed:T(t.colour_speed,`${e}.colour_speed`),colour_retention:T(t.colour_retention,`${e}.colour_retention`),palette:_e(t.palette,`${e}.palette`,255,!0),selected_movement:vi(t.selected_movement,`${e}.selected_movement`),overall_movement:vi(t.overall_movement,`${e}.overall_movement`),priority:T(t.priority,`${e}.priority`),unknown_flags:es(t.unknown_flags,sn,`${e}.unknown_flags`),excess:Ye(t.excess,`${e}.excess`)}}function vi(n,e){const t=m(n,e);return{enabled:F(t.enabled,`${e}.enabled`),enter_exit:F(t.enter_exit,`${e}.enter_exit`),direction:u(t.direction,`${e}.direction`,0,3),distance:T(t.distance,`${e}.distance`),speed:T(t.speed,`${e}.speed`),unknown_flags:es(t.unknown_flags,tn,`${e}.unknown_flags`)}}function et(n,e){const t=m(n,e);return{sku:f(t.sku,`${e}.sku`,_),scene_id:u(t.scene_id,`${e}.scene_id`,0,65535),effect_id:u(t.effect_id,`${e}.effect_id`,0,65535),catalogue_schema_version:u(t.catalogue_schema_version,`${e}.catalogue_schema_version`,1,Ht)}}function _e(n,e,t,i=!1){const s=w(n,e,t);return!i&&s.length===0&&v(`${e} must not be empty`),s.map((r,a)=>Ee(r,`${e}[${a}]`))}function Ee(n,e){const t=w(n,e,3);return t.length!==3&&v(`${e} must contain three channels`),t.map(i=>u(i,`${e} channel`,0,255))}function xn(n,e){return n===null?null:Ee(n,e)}function kn(n,e){return n===null?null:F(n,e)}function wn(n,e){const t=m(n,e);return{left:u(t.left,`${e}.left`,1,100),top:u(t.top,`${e}.top`,1,100),right:u(t.right,`${e}.right`,1,100),bottom:u(t.bottom,`${e}.bottom`,1,100)}}function C(n,e){return n!=="supported"&&n!=="unsupported"&&n!=="evidence_gap"&&v(`${e} is invalid`),n}function Ct(n,e){return me(n,e,Se),m(n,e)}function xe(n,e){return n===null?null:f(n,e,_)}function Vt(n,e){const t=f(n,e,Qs);return(!/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(t)||Number.isNaN(Date.parse(t)))&&v(`${e} must be an ISO 8601 timestamp with a UTC offset`),t}function f(n,e,t){const i=Fe(n,e);return(i.length===0||i.length>t)&&v(`${e} must contain 1 to ${t} characters`),i}function En(n,e,t){const i=Fe(n,e);return i.length>t&&v(`${e} must not exceed ${t} characters`),i}function Ye(n,e){const t=Fe(n,e);return(t.length%2!==0||!/^[0-9a-f]*$/i.test(t))&&v(`${e} must be hexadecimal`),t}function Fe(n,e){return typeof n!="string"&&v(`${e} must be a string`),n}function Sn(n){return typeof n=="string"&&le.includes(n)?n:void 0}function F(n,e){return typeof n!="boolean"&&v(`${e} must be a boolean`),n}function u(n,e,t,i=Ht){return(typeof n!="number"||!Number.isSafeInteger(n)||n<t||n>i)&&v(`${e} must be an integer from ${t} to ${i}`),n}function Z(n,e,t){return u(n,e,t,Ht)}function K(n,e,t){const i=u(n,t,1);return i!==e&&v(`${t} is incompatible with this editor`),i}function It(n,e,t,i){return n===null?null:u(n,e,t,i)}function T(n,e){return u(n,e,0,255)}function es(n,e,t){const i=T(n,t);return i&~e&&v(`${t} must only set reserved bits, not bits explicit fields carry`),i}function A(n,e,t){const i=Fe(n,t);return e.includes(i)||v(`${t} is invalid`),i}function m(n,e){return(typeof n!="object"||n===null||Array.isArray(n))&&v(`${e} must be an object`),n}function w(n,e,t){return Array.isArray(n)||v(`${e} must be an array`),n.length>t&&v(`${e} must not exceed ${t} items`),n}function U(n,e,t){const i=n.map(e);new Set(i).size!==i.length&&v(`${t} must be unique`)}function me(n,e,t,i=en){let s=0;const r=(l,c,p)=>{if(s+=1,s>i&&v(`${e} must not exceed ${i} JSON values`),p>mi&&v(`${e} must not exceed ${mi} nested levels`),!(l===null||typeof l=="boolean")){if(typeof l=="number"){(!Number.isFinite(l)||Number.isInteger(l)&&!Number.isSafeInteger(l))&&v(`${c} must be a finite JSON number`);return}if(typeof l=="string"){l.length>pt&&v(`${c} must not exceed ${pt} characters`);return}if(Array.isArray(l)){l.length>B&&v(`${c} must not exceed ${B} items`),l.forEach((b,y)=>r(b,`${c}[${y}]`,p+1));return}if(typeof l=="object"&&l!==null){const b=Object.entries(l);b.length>B&&v(`${c} must not exceed ${B} fields`),b.forEach(([y,R])=>{y.length>pt&&v(`${c} contains an oversized key`),r(R,`${c}.${y}`,p+1)});return}v(`${c} contains a non-JSON value`)}};r(n,e,0);const a=JSON.stringify(n);a===void 0&&v(`${e} must contain JSON values`),new TextEncoder().encode(a).byteLength>t&&v(`${e} must not exceed ${t} bytes`)}function v(n){throw new Error(`Malformed Effect Studio server payload: ${n}.`)}function Cn(n){return n.api_version===Xs&&n.effect_schema_version===Ki&&n.compiler_version===Js}const gt="ha_govee_led_ble/editor";class In{constructor(e){this.hass=e}async info(){return on(await this.call("info"))}async devices(){const e=await this.call("devices");return ln(P(e,"devices"))}async customCatalogue(){const e=await this.call("custom/catalogue");return dn(P(e,"catalogue"))}async library(){return bi(await this.call("library/list"))}async item(e){const t=await this.call("library/get",{item_id:e});return ze(P(t,"item"))}async createItem(e,t,i){const s=await this.call("library/create",{name:e,content:Ie(t),expected_library_revision:i});return{item:ze(P(s,"item")),library_revision:bt(s)}}async updateItem(e,t,i,s){const r=await this.call("library/update",{item_id:e.id,name:t,content:Ie(i),expected_revision:e.revision,expected_library_revision:s});return{item:ze(P(r,"item")),library_revision:bt(r)}}async deleteItem(e,t){const i=await this.call("library/delete",{item_id:e.id,expected_revision:e.revision,expected_library_revision:t});return bt(i)}async drafts(){const e=await this.call("draft/list");return gn(P(e,"drafts"))}async draft(e){const t=await this.call("draft/get",{draft_id:e});return mt(P(t,"draft"))}async createDraft(e,t,i,s){const r=await this.call("draft/create",{name:e,content:Ie(t),updated_at:new Date().toISOString(),selected_config_entry_id:i,...s?{base_item_id:s.id,base_item_revision:s.revision}:{}});return mt(P(r,"draft"))}async updateDraft(e,t,i,s){const r=await this.call("draft/update",{draft_id:e.id,expected_revision:e.revision,name:t,content:Ie(i),updated_at:new Date().toISOString(),selected_config_entry_id:s});return mt(P(r,"draft"))}async deleteDraft(e){await this.call("draft/delete",{draft_id:e.id,expected_revision:e.revision})}async applySaved(e,t){const i=await this.call("apply",{config_entry_id:e,item_id:t.id,revision:t.revision,updated_at:new Date().toISOString()});return St(P(i,"deployment"))}async applySnapshot(e,t,i){const s=await this.call("apply_snapshot",{config_entry_id:e,name:t,content:Ie(i),updated_at:new Date().toISOString()});return St(P(s,"deployment"))}async sceneCatalogue(e){const t=await this.call("scene/catalogue/list",{config_entry_id:e});return vn(P(t,"catalogue"))}sceneDetail(e,t,i){return this.call("scene/catalogue/get",{config_entry_id:e,scene_id:t,effect_id:i}).then(yn)}async applyScene(e,t,i){const s=await this.call("scene/apply",{config_entry_id:e,scene_id:t.scene_id,effect_id:t.effect_id,...i===null?{}:{speed_index:i}}),r=qt(P(s,"scene")),a=P(s,"readback");if(a!=="scene_identity_only")throw new Error("Malformed Effect Studio server payload: scene Apply readback is invalid.");const l=P(s,"speed_index");if(l!==null&&(typeof l!="number"||!Number.isSafeInteger(l)||l<0||l>255))throw new Error("Malformed Effect Studio server payload: scene Apply speed is invalid.");return{scene:r,speed_index:l,readback:a}}subscribeLibrary(e,t){return this.hass.connection.subscribeMessage(i=>{try{e(bi(i))}catch(s){t?.(yi(s))}},{type:`${gt}/library/subscribe`})}subscribeDeployments(e,t){return this.hass.connection.subscribeMessage(i=>{try{e(bn(i))}catch(s){t?.(yi(s))}},{type:`${gt}/deployment/subscribe`})}call(e,t={}){return this.hass.callWS({type:`${gt}/${e}`,...t})}}function P(n,e){if(typeof n!="object"||n===null||Array.isArray(n))throw new Error("Malformed Effect Studio server payload: response must be an object.");if(!(e in n))throw new Error(`Malformed Effect Studio server payload: response is missing ${e}.`);return n[e]}function bt(n){const e=P(n,"library_revision");if(typeof e!="number"||!Number.isSafeInteger(e)||e<0)throw new Error("Malformed Effect Studio server payload: library revision is invalid.");return e}function yi(n){return n instanceof Error?n:new Error("Malformed Effect Studio server payload.")}var An=Object.defineProperty,ts=(n,e,t,i)=>{for(var s=void 0,r=n.length-1,a;r>=0;r--)(a=n[r])&&(s=a(e,t,s)||s);return s&&An(e,t,s),s};const At=17,is="ha_govee_led_ble/effect_studio/recent_colours",We=[[255,69,58],[255,159,10],[255,214,10],[48,209,88],[99,230,226],[100,210,255],[10,132,255],[94,92,230],[191,90,242],[255,45,85],[172,142,104],[255,255,255],[174,174,178],[99,99,102],[28,28,30],[255,127,0],[139,0,255]];let ke=Pn();class Kt extends D{constructor(){super(...arguments),this.colour=[255,255,255],this.disabled=!1}render(){return o`
      <div class="preset-grid">
        ${ke.map(e=>o`
            <button
              type="button"
              style="--preset-colour: ${k(e)}"
              aria-label="Use ${k(e)}"
              ?disabled=${this.disabled}
              @click=${()=>this.commit(e)}
            ></button>
          `)}
        <label
          class="custom-colour"
          style="--custom-colour: ${k(this.colour)}"
        >
          <input
            type="color"
            aria-label="Custom colour"
            .value=${k(this.colour)}
            ?disabled=${this.disabled}
            @input=${e=>this.emit("colour-changing",oi(e.target.value))}
            @change=${e=>this.commit(oi(e.target.value))}
          />
        </label>
      </div>
    `}commit(e){Dn(e),this.emit("colour-changed",e)}emit(e,t){this.colour=[...t],this.dispatchEvent(new CustomEvent(e,{detail:{colour:[...t]},bubbles:!0,composed:!0}))}static{this.styles=[N,E`
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
  `]}}ts([h({attribute:!1})],Kt.prototype,"colour");ts([h({type:Boolean})],Kt.prototype,"disabled");function Pt(n){return[...ke[n%ke.length]]}function Pn(){const n=localStorage.getItem(is);if(!n)return J(We);let e;try{e=JSON.parse(n)}catch(i){if(i instanceof SyntaxError)return J(We);throw i}if(!Array.isArray(e))return J(We);const t=e.filter(Tn).map(i=>[...i]).slice(0,At);return ss(t)}function Dn(n){const e=k(n);ke=ss([[...n],...ke.filter(t=>k(t)!==e)]),localStorage.setItem(is,JSON.stringify(ke))}function ss(n){const e=J(n);for(const t of We)e.length>=At||e.some(i=>k(i)===k(t))||e.push([...t]);return e.slice(0,At)}function Tn(n){return Array.isArray(n)&&n.length===3&&n.every(e=>Number.isInteger(e)&&e>=0&&e<=255)}customElements.get("govee-colour-picker")||customElements.define("govee-colour-picker",Kt);var Ln=Object.defineProperty,j=(n,e,t,i)=>{for(var s=void 0,r=n.length-1,a;r>=0;r--)(a=n[r])&&(s=a(e,t,s)||s);return s&&Ln(e,t,s),s};class q extends D{constructor(){super(...arguments),this.palette=[],this.minColours=1,this.maxColours=8,this.disabled=!1,this.persistentPicker=!1,this.ariaLabel="Colours",this.itemName="colour",this.windowPointerDown=e=>{this.editingIndex!==void 0&&!e.composedPath().includes(this)&&(this.editingIndex=void 0)}}connectedCallback(){super.connectedCallback(),window.addEventListener("pointerdown",this.windowPointerDown)}disconnectedCallback(){window.removeEventListener("pointerdown",this.windowPointerDown),super.disconnectedCallback()}willUpdate(e){e.has("palette")&&this.editingIndex!==void 0&&this.editingIndex>=this.palette.length&&(this.editingIndex=void 0)}render(){const e=this.persistentPicker?this.selectedIndex:this.editingIndex,t=this.palette.map((i,s)=>({key:`${s}-${k(i)}`,label:`${_i(this.itemName)} ${s+1}`,ariaLabel:this.itemAriaLabel(i,s),colour:k(i),removeReady:!this.persistentPicker&&this.editingIndex===s&&this.palette.length>this.minColours,disabled:this.disabled}));return o`
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
        ${this.persistentPicker||this.editingIndex===void 0?d:o`
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
          `:d}
    `}itemAriaLabel(e,t){const i=`${_i(this.itemName)} ${t+1}`;return this.persistentPicker?`${i}, ${k(e)}${t===this.selectedIndex?", selected":""}`:this.editingIndex===t&&this.palette.length>this.minColours?`Remove colour ${t+1}`:`Edit colour ${t+1}, ${k(e)}. Drag to reorder or use arrow keys.`}renderPicker(e,t){return o`
      <govee-colour-picker
        .colour=${t}
        .disabled=${this.disabled}
        @colour-changing=${i=>this.updateColour(e,i.detail.colour)}
        @colour-changed=${i=>this.commitColour(e,i.detail.colour)}
      ></govee-colour-picker>
    `}commitColour(e,t){this.updateColour(e,t),!this.persistentPicker&&(this.editingIndex=void 0,this.focusSwatchAfterUpdate(e))}updateColour(e,t){const i=J(this.palette);i[e]=[...t],this.emitPalette(i)}addColour(){if(this.disabled||this.palette.length>=this.maxColours)return;const e=this.palette[this.palette.length-1]??Pt(this.palette.length),t=[...J(this.palette),[...e]],i=t.length-1;this.persistentPicker?this.selectColour(i,t[i]):this.editingIndex=i,this.emitPalette(t)}removeColour(e){if(this.disabled||this.palette.length<=this.minColours)return;const t=this.palette.filter((s,r)=>r!==e).map(s=>[...s]),i=Math.min(e,t.length-1);this.editingIndex=void 0,this.emitPalette(t),this.focusSwatchAfterUpdate(i)}reorder(e,t){if(this.disabled||e===t)return;const i=J(this.palette),[s]=i.splice(e,1);if(i.splice(t,0,s),this.editingIndex=this.editingIndex===e?t:Qe(this.editingIndex,e,t),this.persistentPicker){const r=Qe(this.selectedIndex,e,t);r!==void 0&&this.selectColour(r,i[r])}this.emitPalette(i)}focusSwatchAfterUpdate(e){this.updateComplete.then(()=>{this.shadowRoot?.querySelector("govee-reorderable-strip")?.focusItem(e)})}popoverKeyPressed(e,t){t.key==="Escape"&&(t.preventDefault(),t.stopPropagation(),this.editingIndex=void 0,this.focusSwatchAfterUpdate(e))}swatchClicked(e){if(this.persistentPicker){this.selectColour(e,this.palette[e]);return}if(this.editingIndex===e&&this.palette.length>this.minColours){this.removeColour(e);return}this.editingIndex=this.editingIndex===e?void 0:e}selectColour(e,t){this.selectedIndex=e,this.dispatchEvent(new CustomEvent("colour-selected",{detail:{index:e,colour:[...t]},bubbles:!0,composed:!0}))}emitPalette(e){this.palette=e,this.dispatchEvent(new CustomEvent("palette-changed",{detail:{palette:e},bubbles:!0,composed:!0}))}static{this.styles=[N,E`
    :host {
      display: block;
    }

    .persistent-picker {
      margin-top: var(--studio-section-gap);
      padding-top: var(--studio-section-gap);
      border-top: 1px solid var(--studio-border);
    }
  `]}}j([h({attribute:!1})],q.prototype,"palette");j([h({type:Number})],q.prototype,"minColours");j([h({type:Number})],q.prototype,"maxColours");j([h({type:Boolean})],q.prototype,"disabled");j([h({type:Boolean})],q.prototype,"persistentPicker");j([h({type:Number})],q.prototype,"selectedIndex");j([h()],q.prototype,"ariaLabel");j([h()],q.prototype,"itemName");j([g()],q.prototype,"editingIndex");function _i(n){return n.charAt(0).toUpperCase()+n.slice(1)}customElements.get("govee-palette-editor")||customElements.define("govee-palette-editor",q);var Mn=Object.defineProperty,jt=(n,e,t,i)=>{for(var s=void 0,r=n.length-1,a;r>=0;r--)(a=n[r])&&(s=a(e,t,s)||s);return s&&Mn(e,t,s),s};class at extends D{constructor(){super(...arguments),this.disabled=!1}updated(){if(this.content){if(this.content.kind==="h617a_single"||this.content.kind==="palette_diy"||this.content.kind==="special_diy"){const e=this.shadowRoot?.querySelector("select[data-single-variation]");e&&(e.value=String(this.content.variant));return}this.content.effects.forEach((e,t)=>{const i=this.effectFamily(e,!0),s=this.shadowRoot?.querySelector(`select[data-effect-index="${t}"]`),r=this.shadowRoot?.querySelector(`select[data-variation-index="${t}"]`);s&&(s.value=i?.id??`unknown:${e.family}`),r&&(r.value=String(e.variant))})}}render(){if(!this.content||!this.catalogue)return d;const e=(this.content.kind==="h617a_single"||this.content.kind==="palette_diy"||this.content.kind==="special_diy")&&this.effectFamily(this.content)?.rate==="sensitivity"?"Sensitivity":"Speed";return o`
      ${this.content.kind==="h617a_multi"?o`
            <section class="card effect-card">
              <h3 class="section-title">Effects</h3>
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
    `}renderSingleVariation(){if(!this.content||this.content.kind!=="h617a_single"&&this.content.kind!=="palette_diy"&&this.content.kind!=="special_diy")return d;const e=this.content,i=this.effectFamily(e)?.variations??[],s=i.some(r=>r.variant===e.variant);return s&&i.length<=1?d:o`
      <label class="field parameter-group">
        <span class="parameter-label">Variation</span>
        <select
          aria-label="Variation"
          data-single-variation
          .value=${String(e.variant)}
          ?disabled=${this.disabled}
          @change=${r=>this.emitContent({...e,variant:Number(r.target.value)})}
        >
          ${s?d:o`
                <option value=${String(e.variant)}>
                  Unknown variation ${e.variant}
                </option>
              `}
          ${i.map(r=>o`
              <option value=${String(r.variant)}>
                ${r.label}
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
        @dragstart=${r=>this.effectDragStarted(t,r)}
        @dragover=${r=>{this.disabled||r.preventDefault()}}
        @drop=${r=>this.effectDropped(t,r)}
      >
        <div class="effect-fields">
          <label class="field">
            <span>Effect</span>
            <select
              aria-label="Effect ${t+1}"
              data-effect-index=${t}
              .value=${i?.id??`unknown:${e.family}`}
              ?disabled=${this.disabled}
              @change=${r=>this.effectFamilyChanged(t,r.target.value)}
            >
              ${i?d:o`
                    <option value=${`unknown:${e.family}`}>
                      Unknown effect ${e.family}
                    </option>
                  `}
              ${this.multiFamilies.map(r=>o`
                  <option value=${r.id}>${r.label}</option>
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
              @change=${r=>this.effectVariationChanged(t,Number(r.target.value))}
            >
              ${s.some(r=>r.variant===e.variant)?d:o`
                    <option value=${String(e.variant)}>
                      Unknown variation ${e.variant}
                    </option>
                  `}
              ${s.map(r=>o`
                  <option value=${String(r.variant)}>
                    ${r.label}
                  </option>
                `)}
            </select>
          </label>
        </div>
        ${this.disabled?d:o`
              <details class="row-menu">
                <summary aria-label="Reorder or remove effect ${t+1}">
                  ⋮
                </summary>
                <div class="row-menu-popover">
                  <button
                    type="button"
                    ?disabled=${this.disabled||t===0}
                    @click=${r=>{this.closeDetails(r),this.moveEffect(t,-1)}}
                  >
                    Move up
                  </button>
                  <button
                    type="button"
                    ?disabled=${this.disabled||t===this.content.effects.length-1}
                    @click=${r=>{this.closeDetails(r),this.moveEffect(t,1)}}
                  >
                    Move down
                  </button>
                  <button
                    class="danger"
                    type="button"
                    ?disabled=${this.disabled||this.content.effects.length===1}
                    @click=${r=>{this.closeDetails(r),this.removeEffect(t)}}
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
    `}effectFamilyChanged(e,t){const i=this.multiFamilies.find(r=>r.id===t),s=i?.variations[0];!i||!s||this.replaceEffect(e,{family:i.family,variant:s.variant})}effectVariationChanged(e,t){if(!this.content||this.content.kind!=="h617a_multi")return;const i=this.content.effects[e];i&&this.replaceEffect(e,{...i,variant:t})}replaceEffect(e,t){if(!this.content||this.content.kind!=="h617a_multi")return;const i=this.content.effects.map((s,r)=>r===e?t:s);this.emitContent({...this.content,effects:i})}addEffect(){if(!this.content||this.content.kind!=="h617a_multi")return;const e=this.multiFamilies[this.content.effects.length]??this.multiFamilies[0],t=e?.variations[0];if(!e||!t)return;const i=[...this.content.effects,{family:e.family,variant:t.variant}];this.emitContent({...this.content,effects:i})}removeEffect(e){if(!this.content||this.content.kind!=="h617a_multi")return;const t=this.content.effects.filter((i,s)=>s!==e);this.emitContent({...this.content,effects:t})}moveEffect(e,t){if(!this.content||this.content.kind!=="h617a_multi")return;const i=e+t;i<0||i>=this.content.effects.length||this.reorderEffect(e,i)}reorderEffect(e,t){if(!this.content||this.content.kind!=="h617a_multi"||e===t)return;const i=[...this.content.effects],[s]=i.splice(e,1);i.splice(t,0,s),this.emitContent({...this.content,effects:i})}effectDragStarted(e,t){this.draggedEffectIndex=e,t.dataTransfer?.setData("text/plain",String(e))}effectDropped(e,t){t.preventDefault(),this.draggedEffectIndex!==void 0&&(this.reorderEffect(this.draggedEffectIndex,e),this.draggedEffectIndex=void 0)}closeDetails(e){e.currentTarget.closest("details")?.removeAttribute("open")}effectFamily(e,t=!1){return(t?this.multiFamilies:this.catalogue?.effects)?.find(i=>i.family===e.family)}emitContent(e){this.dispatchEvent(new CustomEvent("content-changed",{detail:{content:e},bubbles:!0,composed:!0}))}static{this.styles=[N,ce,Q,E`
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

    @media (max-width: 560px) {
      .effect-fields {
        grid-template-columns: 1fr;
      }
    }

  `]}}jt([h({attribute:!1})],at.prototype,"content");jt([h({attribute:!1})],at.prototype,"catalogue");jt([h({type:Boolean})],at.prototype,"disabled");customElements.get("govee-custom-effect-editor")||customElements.define("govee-custom-effect-editor",at);const ge={ATTRIBUTE:1,PROPERTY:3,BOOLEAN_ATTRIBUTE:4},Nn=n=>(...e)=>({_$litDirective$:n,values:e});class Rn{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}}const On=n=>n.strings===void 0,Bn={},Fn=(n,e=Bn)=>n._$AH=e;const $i=Nn(class extends Rn{constructor(n){if(super(n),n.type!==ge.PROPERTY&&n.type!==ge.ATTRIBUTE&&n.type!==ge.BOOLEAN_ATTRIBUTE)throw Error("The `live` directive is not allowed on child or event bindings");if(!On(n))throw Error("`live` bindings can only contain a single expression")}render(n){return n}update(n,[e]){if(e===H||e===d)return e;const t=n.element,i=n.name;if(n.type===ge.PROPERTY){if(e===t[i])return H}else if(n.type===ge.BOOLEAN_ATTRIBUTE){if(!!e===t.hasAttribute(i))return H}else if(n.type===ge.ATTRIBUTE&&t.getAttribute(i)===e+"")return H;return Fn(n),e}});var Un=Object.defineProperty,ot=(n,e,t,i)=>{for(var s=void 0,r=n.length-1,a;r>=0;r--)(a=n[r])&&(s=a(e,t,s)||s);return s&&Un(e,t,s),s};const Hn=new Set(["rhythm","bloom","shiny"]),qn=new Set(["point","gradient","relative_brightness","key_count","direction","segment_count","speed"]),ns=[{id:"clockwise",label:"Clockwise"},{id:"two_way",label:"Two-way"},{id:"counterclockwise",label:"Counterclockwise"}];class Ue extends D{constructor(){super(...arguments),this.disabled=!1,this.showModeSelector=!0,this.modeChanged=e=>{const t=e.target.value;this.updateContent(i=>(i.mode=t,i.parameters=Kn(i.parameters),i.calm=vt(t)?i.calm??!1:null,i))}}willUpdate(e){e.has("content")&&this.content?.colour!=null&&(this.lastFixedColour=re(this.content.colour))}render(){if(!this.content)return d;const e=Vn(this.content.mode,this.catalogue),t=this.catalogue?.limits.music_sensitivity_min??0,i=this.catalogue?.limits.music_sensitivity_max??100,s=rs(this.content.sensitivity,t,i),r=this.content.colour===null?"automatic":"fixed",a=this.content.colour??this.lastFixedColour??Pt(0);return o`
      <section class="card">
        <div class="parameter-stack">
          ${this.showModeSelector?o`
                <label class="field">
                  <span class="parameter-label">Mode</span>
                  <select
                    aria-label="Mode"
                    .value=${$i(this.content.mode)}
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

          ${this.renderSegmentedField("Colour mode",r,[{value:"automatic",label:"Automatic"},{value:"fixed",label:"Fixed"}],l=>this.colourModeChanged(l==="fixed"))}

          ${r==="fixed"?o`
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

          ${vt(this.content.mode)?this.renderSegmentedField("Style",!!this.content.calm,[{value:!1,label:"Dynamic"},{value:!0,label:"Calm"}],l=>this.styleChanged(l)):d}

          ${this.renderModeParameters(this.content)}
        </div>
      </section>
    `}renderSegmentedField(e,t,i,s){return o`
      <govee-segmented-control
        .label=${e}
        .value=${t}
        .options=${i}
        .disabled=${this.disabled}
        @value-changed=${r=>s(r.detail.value)}
      ></govee-segmented-control>
    `}renderRangeField(e,t,i,s,r,a=!1){return o`
      <govee-slider-control
        .label=${e}
        .value=${t}
        .minimum=${i}
        .maximum=${s}
        .showValue=${a}
        .disabled=${this.disabled}
        @value-changed=${l=>r(l.detail.value)}
      ></govee-slider-control>
    `}renderModeParameters(e){switch(e.mode){case"separation":return this.renderSeparationParameters(e.parameters);case"hopping":return this.renderHoppingParameters(e.parameters);case"piano_keys":return this.renderPianoKeysParameters(e.parameters);case"fountain":return this.renderFountainParameters(e.parameters);case"day_and_night":return this.renderDayAndNightParameters(e.parameters);default:return d}}renderSeparationParameters(e){const t=Ae(e,"point",1,1,5),i=xi(e,"gradient",!0);return o`
      ${this.renderRangeField("Point",t,1,5,s=>this.updateParameter("point",s))}
      ${this.renderCheckboxField("Gradient",i,s=>this.updateParameter("gradient",s))}
    `}renderHoppingParameters(e){const t=Ae(e,"relative_brightness",50,0,50);return o`
      ${this.renderRangeField("Relative brightness",t,0,50,i=>this.updateParameter("relative_brightness",i))}
    `}renderPianoKeysParameters(e){const t=Ae(e,"key_count",15,8,15);return o`
      ${this.renderRangeField("Key count",t,8,15,i=>this.updateParameter("key_count",i))}
    `}renderFountainParameters(e){const t=jn(e,"direction","clockwise");return o`
      <label class="field">
        <span class="parameter-label">Direction</span>
        <select
          aria-label="Direction"
          .value=${$i(t)}
          ?disabled=${this.disabled}
          @change=${i=>this.updateParameter("direction",i.target.value)}
        >
          ${ns.map(i=>o`
              <option
                value=${i.id}
                .selected=${i.id===t}
              >
                ${i.label}
              </option>
            `)}
        </select>
      </label>
    `}renderDayAndNightParameters(e){const t=Ae(e,"segment_count",1,1,7),i=Ae(e,"speed",10,1,50),s=xi(e,"gradient",!1);return o`
      ${this.renderRangeField("Segment count",t,1,7,r=>this.updateParameter("segment_count",r),!0)}
      ${this.renderRangeField("Speed",i,1,50,r=>this.updateParameter("speed",r))}
      ${this.renderCheckboxField("Gradient",s,r=>this.updateParameter("gradient",r))}
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
    `}colourModeChanged(e){this.updateContent(t=>{if(!e)return this.lastFixedColour=t.colour===null?this.lastFixedColour:re(t.colour),t.colour=null,t;const i=t.colour??this.lastFixedColour??Pt(0);return this.lastFixedColour=re(i),t.colour=re(i),t})}fixedColourChanged(e){this.lastFixedColour=re(e),this.updateContent(t=>(t.colour=re(e),t))}styleChanged(e){this.updateContent(t=>(vt(t.mode)&&(t.calm=e),t))}updateParameter(e,t){this.updateContent(i=>{const s=Gt(i.parameters);return s[e]=t,i.parameters=s,i})}updateContent(e){if(!this.content)return;const t=yt(e(yt(this.content)));this.content=t,this.dispatchEvent(new CustomEvent("content-changed",{detail:{content:yt(t)},bubbles:!0,composed:!0}))}static{this.styles=[N,ce,Q,E`
      :host {
        display: block;
      }

    `]}}ot([h({attribute:!1})],Ue.prototype,"content");ot([h({attribute:!1})],Ue.prototype,"catalogue");ot([h({type:Boolean})],Ue.prototype,"disabled");ot([h({type:Boolean})],Ue.prototype,"showModeSelector");function Vn(n,e){const t=e?.music_modes.map(i=>({...i}))??[];return t.some(i=>i.id===n)?t:[{id:n,label:`Unknown mode ${n}`},...t]}function Kn(n){const e=Gt(n);for(const t of qn)delete e[t];return e}function vt(n){return Hn.has(n)}function Ae(n,e,t,i,s){const r=n[e];return typeof r!="number"||!Number.isFinite(r)?t:rs(r,i,s)}function xi(n,e,t){return typeof n[e]=="boolean"?n[e]:t}function jn(n,e,t){const i=n[e];return ns.some(s=>s.id===i)?i:t}function rs(n,e,t){return Math.min(t,Math.max(e,Math.round(n)))}function yt(n){return{...n,colour:Gn(n.colour),parameters:Gt(n.parameters)}}function Gt(n){return structuredClone(n)}function Gn(n){return n===null?null:re(n)}function re(n){return[...n]}customElements.get("govee-music-profile-editor")||customElements.define("govee-music-profile-editor",Ue);var zn=Object.defineProperty,as=(n,e,t,i)=>{for(var s=void 0,r=n.length-1,a;r>=0;r--)(a=n[r])&&(s=a(e,t,s)||s);return s&&zn(e,t,s),s};class zt extends D{constructor(){super(...arguments),this.colours=[],this.disabled=!1}render(){return o`
      <section class="card" aria-labelledby="painted-segments-heading">
        <h3 class="section-title" id="painted-segments-heading">
          Painted segments
        </h3>
        <div class="segments">
          ${this.colours.map((e,t)=>o`
              <button
                type="button"
                data-segment=${t}
                style="--segment-colour: ${k(e)}"
                aria-label="Segment ${t+1}, ${k(e)}"
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
    `}pointerStarted(e,t){this.disabled||(t.preventDefault(),this.paintingPointerId=t.pointerId,this.lastPaintedSegment=e,t.currentTarget.setPointerCapture(t.pointerId),this.selectSegment(e))}pointerMoved(e){if(e.pointerId!==this.paintingPointerId||!this.shadowRoot)return;const t=this.shadowRoot.elementFromPoint(e.clientX,e.clientY)?.closest("[data-segment]"),i=Number(t?.dataset.segment);Number.isInteger(i)&&i!==this.lastPaintedSegment&&(this.lastPaintedSegment=i,this.selectSegment(i))}pointerFinished(e){if(e.pointerId!==this.paintingPointerId)return;const t=this.shadowRoot?.querySelector(`[data-segment="${this.lastPaintedSegment}"]`);t?.hasPointerCapture(e.pointerId)&&t.releasePointerCapture(e.pointerId),this.paintingPointerId=void 0,this.lastPaintedSegment=void 0}segmentClicked(e,t){!this.disabled&&t.detail===0&&this.selectSegment(e)}selectSegment(e){this.dispatchEvent(new CustomEvent("segment-selected",{detail:{index:e},bubbles:!0,composed:!0}))}static{this.styles=[N,ce,E`
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
  `]}}as([h({attribute:!1})],zt.prototype,"colours");as([h({type:Boolean})],zt.prototype,"disabled");customElements.get("govee-painted-segment-editor")||customElements.define("govee-painted-segment-editor",zt);var Yn=Object.defineProperty,I=(n,e,t,i)=>{for(var s=void 0,r=n.length-1,a;r>=0;r--)(a=n[r])&&(s=a(e,t,s)||s);return s&&Yn(e,t,s),s};class S extends D{constructor(){super(...arguments),this.library={library_revision:0,items:[]},this.isAdmin=!1,this.category="all",this.search="",this.name="",this.speedIndex=null,this.loading=!1,this.saving=!1,this.applying=!1,this.editingCopy=!1,this.requestGeneration=0}willUpdate(e){(e.has("device")||e.has("api"))&&(this.invalidateRequests(),this.catalogue=void 0,this.category="all",this.search="",this.selectedScene=void 0,this.selectedItem=void 0,this.content=void 0,this.editingCopy=!1,this.notice=void 0,this.error=void 0,this.loading=!!(this.api&&this.device)),e.has("savedSceneSelection")&&this.savedSceneSelection&&this.synchroniseSavedSelection(this.savedSceneSelection),e.has("library")&&this.selectedItem&&(this.library.items.find(i=>i.id===this.selectedItem?.id)||(this.invalidateRequests(),this.selectedScene=void 0,this.selectedItem=void 0,this.content=void 0,this.editingCopy=!1,this.notice="The selected custom scene was deleted."))}updated(e){if((e.has("device")||e.has("api"))&&this.api&&this.device&&this.loadCatalogue(),e.has("library")&&this.selectedItem){const t=this.library.items.find(i=>i.id===this.selectedItem?.id);t&&t.revision!==this.selectedItem.revision&&(this.sceneDirty?this.notice="This custom scene changed elsewhere. Reload it before saving.":this.selectCustom(t))}}render(){return this.device?this.loading?o`<div class="status" role="status">Loading scenes...</div>`:this.error||!this.catalogue?o`
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
        ${this.filteredSceneEntries.map(e=>e.kind==="custom"?this.sceneButton(`custom:${e.item.id}`,e.label,()=>this.selectCustom(e.item)):this.sceneButton(be(e.scene),e.label,()=>this.selectBuiltin(e.scene)))}
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
      `}get sortedCategories(){const e=[];return this.catalogue?.scenes.length&&e.push({id:"all",label:"All scenes"}),this.compatibleCustomScenes.length&&e.push({id:"custom",label:"Custom"}),e.push(...this.catalogue?.categories.filter(t=>this.catalogue?.scenes.some(i=>i.category_id===t.id)).map(t=>({id:t.id,label:t.name}))??[]),e.sort((t,i)=>Te(t.label,i.label))}get compatibleCustomScenes(){return this.library.items.filter(e=>(e.kind==="scene_builtin"||e.kind==="scene_palette"||e.kind==="scene_layered")&&e.template?.sku===this.catalogue?.sku)}get filteredCustomScenes(){return this.category==="all"||this.category==="custom"?this.compatibleCustomScenes:[]}get filteredBuiltinScenes(){return!this.catalogue||this.category==="custom"?[]:this.category==="all"?this.catalogue.scenes:this.catalogue.scenes.filter(e=>e.category_id===this.category)}get filteredSceneEntries(){const e=this.search.trim().toLocaleLowerCase();return[...this.filteredCustomScenes.map(t=>({kind:"custom",item:t,label:t.name})),...this.filteredBuiltinScenes.map(t=>({kind:"builtin",scene:t,label:t.display_name}))].filter(t=>!e||t.label.toLocaleLowerCase().includes(e)).sort((t,i)=>Te(t.label,i.label))}get selectionKey(){return this.selectedItem?`custom:${this.selectedItem.id}`:this.selectedScene?be(this.selectedScene):void 0}categoryButton(e,t){const i=this.category===e;return o`
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
    `}renderDetail(){const e=this.selectedScene,t=e.speed,i=this.speedIndex??t?.default_index??0,s=this.selectedItem!==void 0||this.editingCopy,r=this.content?.kind==="scene_layered",a=this.selectedItem===void 0&&!this.editingCopy,l=this.selectedItem===void 0&&this.editingCopy,c=!this.name.trim()||this.selectedItem!==void 0&&!this.sceneDirty,p=!a&&this.content?.kind!=="scene_builtin"&&(this.selectedItem===void 0||this.sceneDirty),b=!!((!a||this.catalogue?.enabled)&&(!p||this.name.trim()));return o`
      <header class="editor-heading">
        <div>
          ${s?o`
                <input
                  class="editor-name"
                  aria-label="Scene name"
                  maxlength="128"
                  .value=${this.name}
                  ?disabled=${!this.isAdmin}
                  @input=${y=>{this.name=y.target.value}}
                />
              `:o`<h2>${e.display_name}</h2>`}
        </div>
        <div class="actions">
          <button
            class="primary"
            type="button"
            ?disabled=${!this.isAdmin||this.saving||this.applying||!this.hasCurrentSceneContent()||!r&&s&&c}
            @click=${r||a?this.edit:this.save}
          >
            ${this.saving?"Saving...":r||a?"Edit":l?"Save as Custom":"Save"}
          </button>
          <button
            class="secondary"
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

      ${s&&(this.content?.kind==="scene_palette"||this.content?.kind==="scene_layered")?o`
            <div
              class="feedback callout"
              role="note"
            >
              Authored scene parameters are uploaded before the source scene is
              selected. The device confirms scene identity, but cannot read the
              authored parameters back.
            </div>
          `:d}

      ${t||this.content?.kind==="scene_palette"?this.renderParameters(t,i):d}
    `}renderParameters(e,t){const i=this.content?.kind==="scene_palette"?this.content:void 0;return o`
      <div class="card scene-parameters">
        <div class="parameter-list">
          ${e?o`
                <govee-segmented-control
                  .label=${"Speed"}
                  .value=${t}
                  .options=${Wn(e.option_count,e.default_index)}
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
                    style="--scene-colour: ${k(t)}"
                    aria-label="Colour ${i+1}, ${k(t)}"
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
                style="--scene-colour: ${k(t.colour)}"
                aria-label="Step colour ${k(t.colour)}"
              ></span>
              <span>
                <strong>Raw value ${t.value}</strong>
                <small>Step colour ${k(t.colour)}</small>
                ${t.inline_colour?o`
                      <small>
                        Inline colour ${k(t.inline_colour)}
                      </small>
                    `:d}
              </span>
            </li>
          `)}
        </ol>
      </section>
    `}async loadCatalogue(){if(!this.api||!this.device)return;const e=this.beginRequest();this.loading=!0,this.error=void 0,this.notice=void 0,this.selectedScene=void 0,this.selectedItem=void 0,this.content=void 0;try{const t=await e.api.sceneCatalogue(e.deviceId);if(!this.requestIsCurrent(e))return;this.catalogue=t,this.category="all"}catch(t){this.requestIsCurrent(e)&&(this.error=M(t))}finally{this.requestIsCurrent(e)&&(this.loading=!1)}}selectCategory(e){this.invalidateRequests(),this.category=e,this.selectedScene=void 0,this.selectedItem=void 0,this.content=void 0,this.editingCopy=!1,this.notice=void 0}async selectBuiltin(e){if(!this.api||!this.device)return;const t=be(e),i=this.beginRequest(t);this.notice=void 0,this.selectedScene=e,this.selectedItem=void 0,this.editingCopy=!1,this.content=void 0,this.name=e.display_name,this.speedIndex=e.speed?.default_index??null;try{const s=await i.api.sceneDetail(i.deviceId,e.scene_id,e.effect_id);if(!this.requestIsCurrent(i)||be(s.scene)!==t)return;this.selectedScene=s.scene,this.content=s.content,this.name=s.scene.display_name,this.speedIndex=s.content.speed_index}catch(s){this.requestIsCurrent(i)&&(this.notice=M(s))}}async selectCustom(e){if(!this.api||!this.device||!this.catalogue)return;const t=this.catalogue,i=this.beginRequest(`custom:${e.id}`);this.notice=void 0,this.selectedScene=void 0,this.selectedItem=void 0,this.editingCopy=!1,this.content=void 0,this.name=e.name;try{const s=await i.api.item(e.id);if(!this.requestIsCurrent(i))return;if(s.content.kind!=="scene_builtin"&&s.content.kind!=="scene_palette"&&s.content.kind!=="scene_layered")throw new Error("This custom scene uses an unsupported definition.");const r=s.content;if(r.template.sku!==t.sku)throw new Error(`This custom scene targets ${r.template.sku}, not ${t.sku}.`);const a=t.scenes.find(c=>c.scene_id===r.template.scene_id&&c.effect_id===r.template.effect_id);if(!a)throw new Error("The source scene is not in this device catalogue.");const l=await i.api.sceneDetail(i.deviceId,r.template.scene_id,r.template.effect_id);if(!this.requestIsCurrent(i)||be(l.scene)!==be(a))return;this.commitCustomSelection(s,a,r)}catch(s){this.requestIsCurrent(i)&&(this.notice=M(s))}}synchroniseSavedSelection(e){const t=e.content;if(this.selectedItem?.id!==e.id||!this.catalogue||t.kind!=="scene_builtin"&&t.kind!=="scene_palette"&&t.kind!=="scene_layered"||t.template.sku!==this.catalogue.sku)return;const i=this.catalogue.scenes.find(s=>s.scene_id===t.template.scene_id&&s.effect_id===t.template.effect_id);i&&(this.requestGeneration+=1,this.activeSelectionIdentity=`custom:${e.id}`,this.commitCustomSelection(e,i,t),this.notice=void 0)}commitCustomSelection(e,t,i){const s=Jn(i);this.selectedScene=t,this.selectedItem=e,this.editingCopy=!1,this.content=s,this.name=e.name,this.speedIndex=s.speed_index??t.speed?.default_index??null}async save(){if(!this.api||!this.device||!this.catalogue||!this.selectedScene||!this.content||!this.hasCurrentSceneContent()||this.content.kind!=="scene_builtin"&&this.content.kind!=="scene_palette"||!this.isAdmin||this.saving||this.applying)return;const e=this.name.trim();if(!e){this.notice="Give this custom scene a name before saving.";return}const t=this.content.kind==="scene_palette"?Xe({...this.content,speed_index:this.speedIndex}):{...this.content,speed_index:this.speedIndex},i=this.captureRequest();this.saving=!0,this.notice=void 0;try{const s=this.selectedItem?await this.api.updateItem(this.selectedItem,e,t,this.library.library_revision):await this.api.createItem(e,t,this.library.library_revision);if(s.item.content.kind!=="scene_builtin"&&s.item.content.kind!=="scene_palette")throw new Error("The saved scene returned an unsupported definition.");if(this.dispatchEvent(new CustomEvent("library-item-saved",{detail:{item:s.item,library_revision:s.library_revision},bubbles:!0,composed:!0})),!this.requestIsCurrent(i))return;this.requestGeneration+=1,this.activeSelectionIdentity=`custom:${s.item.id}`,this.selectedItem=s.item,this.editingCopy=!1,this.content=s.item.content,this.name=s.item.name,this.category="custom",this.notice="Custom scene saved."}catch(s){this.requestIsCurrent(i)&&(this.notice=kt(s)==="conflict"?"The library changed elsewhere. Reload the scene before saving.":`Save failed: ${M(s)}`)}finally{this.saving=!1}}edit(){if(!(!this.isAdmin||!this.selectedScene||!this.hasCurrentSceneContent())){if(this.selectedScene.scene_type===2&&this.content?.kind==="scene_layered"){this.dispatchSceneEdit();return}this.editingCopy=!0,this.name=`${this.selectedScene.display_name} copy`,this.notice=void 0}}dispatchSceneEdit(){!this.selectedScene||this.content?.kind!=="scene_layered"||this.dispatchEvent(new CustomEvent("scene-edit-selected",{detail:{content:oe({...this.content,speed_index:this.speedIndex}),config_entry_id:this.device.config_entry_id,...this.selectedItem?{item:this.selectedItem}:{},name:this.selectedItem?.name??`${this.selectedScene.display_name} copy`},bubbles:!0,composed:!0}))}async apply(){if(!this.api||!this.device||!this.selectedScene||!this.hasCurrentSceneContent()||!this.isAdmin||!this.catalogue?.enabled&&this.selectedItem===void 0&&!this.editingCopy||this.saving||this.applying)return;const e=this.captureRequest(),t=this.device,i=this.selectedScene,s=this.speedIndex,r=this.selectedItem===void 0&&!this.editingCopy,a=this.content.kind==="scene_palette"?Xe({...this.content,speed_index:s}):this.content.kind==="scene_layered"?oe({...this.content,speed_index:s}):{...this.content,speed_index:s},l=!r&&a.kind!=="scene_builtin"&&(this.selectedItem===void 0||this.sceneDirty),c=this.name.trim();if(l&&!c){this.notice="Give this custom scene a name before applying it.";return}this.applying=!0,this.notice=void 0;try{r||a.kind==="scene_builtin"?await e.api.applyScene(e.deviceId,i,s):l?await e.api.applySnapshot(e.deviceId,c,a):await e.api.applySaved(e.deviceId,this.selectedItem),this.requestIsCurrent(e)&&(this.notice=r||a.kind==="scene_builtin"?`Applied to ${t.display_name}. Scene identity can be read back; the selected speed remains optimistic.`:`Applied to ${t.display_name}. Scene identity was confirmed; authored parameters remain write-only.`)}catch(p){this.requestIsCurrent(e)&&(this.notice=`Apply failed: ${M(p)}`)}finally{this.applying=!1}}beginRequest(e){return this.requestGeneration+=1,this.activeSelectionIdentity=e,this.captureRequest()}captureRequest(){return{generation:this.requestGeneration,api:this.api,deviceId:this.device.config_entry_id,category:this.category,selectionIdentity:this.activeSelectionIdentity}}invalidateRequests(){this.requestGeneration+=1,this.activeSelectionIdentity=void 0}requestIsCurrent(e){return e.generation===this.requestGeneration&&e.api===this.api&&e.deviceId===this.device?.config_entry_id&&e.category===this.category&&e.selectionIdentity===this.activeSelectionIdentity}hasCurrentSceneContent(){return!this.catalogue||!this.selectedScene||!this.content||this.content.template.sku!==this.catalogue.sku||this.content.template.scene_id!==this.selectedScene.scene_id||this.content.template.effect_id!==this.selectedScene.effect_id?!1:this.activeSelectionIdentity===this.selectionKey}get sceneDirty(){if(!this.selectedItem||!this.content)return!0;const e=this.content.kind==="scene_palette"?Xe({...this.content,speed_index:this.speedIndex}):this.content.kind==="scene_layered"?oe({...this.content,speed_index:this.speedIndex}):{...this.content,speed_index:this.speedIndex};return this.name.trim()!==this.selectedItem.name||JSON.stringify(e)!==JSON.stringify(this.selectedItem.content)}requestDelete(e){!this.selectedItem||!this.isAdmin||(this.dispatchEvent(new CustomEvent("library-item-delete-requested",{detail:{id:this.selectedItem.id,revision:this.selectedItem.revision,name:this.selectedItem.name},bubbles:!0,composed:!0})),e.currentTarget.blur())}static{this.styles=[N,ce,Ft,Ri,Oi,Fi,Q,Ut,Bi,E`
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
  `]}}I([h({attribute:!1})],S.prototype,"api");I([h({attribute:!1})],S.prototype,"device");I([h({attribute:!1})],S.prototype,"library");I([h({type:Boolean})],S.prototype,"isAdmin");I([h({attribute:!1})],S.prototype,"savedSceneSelection");I([g()],S.prototype,"catalogue");I([g()],S.prototype,"category");I([g()],S.prototype,"search");I([g()],S.prototype,"selectedScene");I([g()],S.prototype,"selectedItem");I([g()],S.prototype,"content");I([g()],S.prototype,"name");I([g()],S.prototype,"speedIndex");I([g()],S.prototype,"loading");I([g()],S.prototype,"saving");I([g()],S.prototype,"applying");I([g()],S.prototype,"editingCopy");I([g()],S.prototype,"notice");I([g()],S.prototype,"error");function be(n){return`builtin:${n.scene_id}:${n.effect_id}`}function Wn(n,e){return Array.from({length:n},(t,i)=>({value:i,label:Xn(i,e)}))}function Xn(n,e){const t=n-e;if(t===0)return"Default";const i=Math.abs(t);return`${i} ${i===1?"step":"steps"} ${t<0?"lower":"higher"}`}function Xe(n){return{...n,template:{...n.template},steps:n.steps.map(e=>({...e,colour:[...e.colour],inline_colour:e.inline_colour===null?null:[...e.inline_colour]})),palette:n.palette.map(e=>[...e])}}function Jn(n){return n.kind==="scene_palette"?Xe(n):n.kind==="scene_layered"?oe(n):{...n,template:{...n.template}}}customElements.get("govee-scene-browser")||customElements.define("govee-scene-browser",S);var Zn=Object.defineProperty,Yt=(n,e,t,i)=>{for(var s=void 0,r=n.length-1,a;r>=0;r--)(a=n[r])&&(s=a(e,t,s)||s);return s&&Zn(e,t,s),s};const Qn=[{value:"movie",label:"Movie"},{value:"game",label:"Game"}],er=[{value:!0,label:"Full screen"},{value:!1,label:"Part screen"}],tr=[{key:"left",label:"Left"},{key:"top",label:"Top"},{key:"right",label:"Right"},{key:"bottom",label:"Bottom"}];function W(n,e,t){return Math.min(t,Math.max(e,Math.round(n)))}function ir(n){return{...n}}function ki(n){return{...n,relative_brightness:ir(n.relative_brightness)}}function os(n){const e=[n.left,n.top,n.right,n.bottom];return e.every(t=>t===e[0])?e[0]:void 0}function sr(n){const e=os(n);return e!==void 0?e:W((n.left+n.top+n.right+n.bottom)/4,1,100)}function nr(n){const e=W(n,1,100);return{left:e,top:e,right:e,bottom:e}}class lt extends D{constructor(){super(...arguments),this.disabled=!1,this.showModeSelector=!0}render(){if(!this.content)return o`
        <section class="card empty-state" role="status">
          <h3 class="section-title">Video profile unavailable</h3>
          <p class="muted">
            Load an H6199 video profile to edit video-sync settings.
          </p>
        </section>
      `;const e=this.content.relative_brightness,t=os(e)===void 0,i=sr(e);return o`
      <div class="editor-grid">
        <section class="card">
          <div class="parameter-stack">
            ${this.showModeSelector?this.renderSegmentedField("Mode",this.content.mode,Qn,s=>this.updateContent(r=>{r.mode=s})):d}
            ${this.renderSegmentedField("Capture area",this.content.full_screen,er,s=>this.updateContent(r=>{r.full_screen=s}))}
            ${this.renderCheckboxField("Sound effects",this.content.sound_effects,s=>this.updateContent(r=>{r.sound_effects=s}))}
            ${this.content.sound_effects?this.renderRangeField("Softness",this.content.sound_effects_softness,1,100,String(this.content.sound_effects_softness),s=>this.updateContent(r=>{r.sound_effects_softness=W(s,1,100)})):d}
            ${this.renderCheckboxField("Blank screen",this.content.blank_screen,s=>this.updateContent(r=>{r.blank_screen=s}))}
          </div>
        </section>

        <section class="card">
          <h3 class="section-title">Image</h3>
          <div class="parameter-stack">
            ${this.renderRangeField("Saturation",this.content.saturation,0,100,`${this.content.saturation}%`,s=>this.updateContent(r=>{r.saturation=W(s,0,100)}))}
            ${this.renderWhiteBalanceField(this.content.white_balance_position)}
          </div>
        </section>

        <section class="card brightness-card">
          <div class="card-heading">
            <h3 class="section-title">Relative brightness</h3>
            ${t?o`<span class="status-chip">Mixed edges</span>`:d}
          </div>
          <div class="parameter-stack">
            ${this.renderRangeField("Uniform brightness",i,1,100,`${i}%`,s=>this.updateContent(r=>{r.relative_brightness=nr(s)}),t?"relative-brightness-note":void 0)}
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
                ${tr.map(({key:s})=>o`
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
        @value-changed=${r=>s(r.detail.value)}
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
    `}renderRangeField(e,t,i,s,r,a,l){return o`
      <label class="range-field">
        <span class="parameter-label">${e}</span>
        <input
          type="range"
          min=${i}
          max=${s}
          .value=${String(W(t,i,s))}
          aria-label=${e}
          aria-describedby=${l??d}
          ?disabled=${this.disabled}
          @input=${c=>a(Number(c.target.value))}
        />
        <output aria-label="${e} value">${r}</output>
      </label>
    `}renderWhiteBalanceField(e){return o`
      <label class="range-field white-balance-field">
        <span class="parameter-label">White balance</span>
        <div class="slider-with-endpoints">
          <input
            type="range"
            min="1"
            max="20"
            .value=${String(W(e,1,20))}
            aria-label="White balance"
            ?disabled=${this.disabled}
            @input=${t=>this.updateContent(i=>{i.white_balance_position=W(Number(t.target.value),1,20)})}
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
    `}updateRelativeBrightnessEdge(e,t){this.updateContent(i=>{i.relative_brightness[e]=W(t,1,100)})}updateContent(e){if(!this.content)return;const t=ki(this.content);e(t),this.emitContent(t)}emitContent(e){this.dispatchEvent(new CustomEvent("content-changed",{detail:{content:ki(e)},bubbles:!0,composed:!0}))}static{this.styles=[N,ce,Q,E`
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
    `]}}Yt([h({attribute:!1})],lt.prototype,"content");Yt([h({type:Boolean})],lt.prototype,"disabled");Yt([h({type:Boolean})],lt.prototype,"showModeSelector");customElements.get("govee-video-profile-editor")||customElements.define("govee-video-profile-editor",lt);var rr=Object.defineProperty,x=(n,e,t,i)=>{for(var s=void 0,r=n.length-1,a;r>=0;r--)(a=n[r])&&(s=a(e,t,s)||s);return s&&rr(e,t,s),s};const Dt=15;class $ extends D{constructor(){super(...arguments),this.showDevicePicker=!1,this.loading=!0,this.devices=[],this.section="custom",this.customEffectCategory="all",this.customCopyStarted=!1,this.library={library_revision:0,items:[]},this.name="",this.content=ye(),this.paintBrushes=Re(),this.selectedPaintBrush=0,this.brushUsesBackground=!1,this.saving=!1,this.applying=!1,this.deployments=[],this.editorTransitionEpoch=0,this.loadEpoch=0,this.deploymentRevision=-1}get isAdmin(){return this.hass?.user?.is_admin===!0}get selectedDevice(){return this.devices.find(e=>e.config_entry_id===this.selectedDeviceId)}get selectedModel(){const e=this.selectedDevice?.model;return e==="H617A"||e==="H6199"?e:void 0}get editorReadOnly(){return!this.isAdmin||this.templateSourceLabel!==void 0}get modelCatalogue(){const e=this.selectedModel;return e?this.customCatalogue?.models[e]:void 0}get videoAvailable(){return!!this.modelCatalogue?.video_modes.length}get customEffectsAvailable(){const e=this.modelCatalogue;return!!(e&&(e.painted_effects.length||e.effects.length||e.music_modes.length||e.supports.advanced!=="unsupported"))}get dirty(){return V(this.content)?this.savedBaseline!==z(this.name,this.content):!1}get applyCapability(){if(!$t(this.content))return;const e=this.selectedDevice;if(e)switch(this.content.kind){case"h617a_painted":return e.custom_effects.painted;case"h617a_single":return e.custom_effects.single;case"h617a_multi":return e.custom_effects.multi;case"palette_diy":return e.custom_effects.palette_diy;case"advanced":case"scene_layered":return e.custom_effects.advanced;case"music_profile":return e.profiles.music;case"video_profile":return e.profiles.video;case"workshop":return e.custom_effects.workshop;case"special_diy":return e.custom_effects.special_diy}}get canApply(){return $t(this.content)&&this.isAdmin&&!this.applying&&!this.saving&&!this.deletingCurrentItem&&this.name.trim().length>0&&this.applyCapability==="supported"}get deletingCurrentItem(){return this.deletingItemId!==void 0&&this.currentItem?.id===this.deletingItemId}get activeDeployment(){const e=this.deployments.find(t=>t.operation_id===this.activeOperationId);return e||!this.applying?e:this.latestDeployment(ut)}connectedCallback(){super.connectedCallback(),this.hass&&!this.api&&this.load()}disconnectedCallback(){super.disconnectedCallback(),this.loadEpoch+=1,this.beginEditorTransition(),this.stopSubscriptions(),this.api=void 0}updated(e){e.has("hass")&&this.hass&&!this.api&&this.load(),this.syncSingleEffectSelects()}render(){return this.loading?o`<div class="centred" role="status">Loading effect studio...</div>`:this.error?this.renderFatalError():o`
      <h1 class="visually-hidden">Effect Studio</h1>

      ${this.notice?o`<div class="notice" role="status">${this.notice}</div>`:d}

      <main
        class="studio ${this.section}-mode"
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
            `:d}
        ${this.customEffectCategoryButton("all","All")}
        ${this.customEffectCategoryAvailable("music")?this.customEffectCategoryButton("music","Music"):d}
        ${this.customEffectCategoryAvailable("single-layer")?this.customEffectCategoryButton("single-layer","Single Layer"):d}
        ${this.customEffectCategoryAvailable("multi-layer")?this.customEffectCategoryButton("multi-layer","Multi Layer"):d}
        ${this.customEffectCategoryAvailable("advanced")?this.customEffectCategoryButton("advanced","Advanced"):d}
        ${this.customEffectCategoryAvailable("special-diy")?this.customEffectCategoryButton("special-diy","Special DIY"):d}
        ${this.customEffectCategoryAvailable("my-effects")?this.customEffectCategoryButton("my-effects","My effects"):d}
      </aside>

      <aside class="sidebar item-sidebar library" aria-label="Effects">
        ${this.customEffectEntries.map(t=>this.customEffectListButton(t))}
      </aside>

      <section class="editor-surface editor">
        ${this.name||this.currentItem?this.renderCurrentCustomEditor():d}
      </section>
    `}renderCurrentCustomEditor(){return Pe(this.content)?this.content.kind==="h617a_painted"?this.renderPaintedEditor():this.renderPaletteEffectEditor():this.content.kind==="palette_diy"||this.content.kind==="special_diy"?this.renderPaletteEffectEditor():this.content.kind==="music_profile"?this.renderMusicProfileEditor():je(this.content)?this.renderAdvancedEditor():this.content.kind==="opaque"?this.renderOpaqueEditor(this.content):d}renderVideo(){const e=this.modelCatalogue;if(!e||!this.videoAvailable)return d;const t=this.library.items.filter(i=>i.kind==="video_profile"&&this.libraryItemAvailable(i)).sort((i,s)=>Te(i.name,s.name));return o`
      <aside class="sidebar item-sidebar library" aria-label="Video profiles">
        ${e.video_modes.map(i=>this.videoListButton(`template:video:${i.id}`,i.label,()=>this.openVideoTemplate(i.id,i.label)))}
        ${t.map(i=>this.videoListButton(`saved:${i.id}`,i.name,()=>{this.selectItem(i.id)},i))}
      </aside>
      <section class="editor-surface editor">
        ${this.content.kind==="video_profile"?this.renderVideoProfileEditor():d}
      </section>
    `}videoListButton(e,t,i,s){const r=s?this.currentItem?.id===s.id:!this.currentItem&&this.customTemplateSelection===e;return o`
      <button
        class="selector item ${r?"selected":""}"
        type="button"
        ?disabled=${!s&&!this.isAdmin}
        @click=${i}
      >
        <span>${t}</span>
      </button>
    `}openVideoTemplate(e,t){this.selectedModel==="H6199"&&this.openEditableTemplate(t,ar(e),`template:video:${e}`)}renderVideoProfileEditor(){return this.content.kind!=="video_profile"?d:o`
      ${this.renderProfileHeading()}
      <govee-video-profile-editor
        .content=${this.content}
        .disabled=${this.editorReadOnly}
        .showModeSelector=${!this.templateSourceLabel}
        @content-changed=${e=>{this.content=hs(e.detail.content)}}
      ></govee-video-profile-editor>
      ${this.activeDeployment?this.renderDeployment(this.activeDeployment):d}
    `}renderMusicProfileEditor(){return this.content.kind!=="music_profile"?d:o`
      ${this.renderProfileHeading()}
      <govee-music-profile-editor
        .content=${this.content}
        .catalogue=${this.modelCatalogue}
        .disabled=${this.editorReadOnly}
        .showModeSelector=${!this.templateSourceLabel}
        @content-changed=${e=>{this.content=ps(e.detail.content)}}
      ></govee-music-profile-editor>
      ${this.activeDeployment?this.renderDeployment(this.activeDeployment):d}
    `}renderProfileHeading(){return this.renderEditorHeading(o`
      <button
        class="secondary"
        type="button"
        ?disabled=${!this.canApply}
        @click=${this.apply}
      >
        ${this.applying?"Applying...":"Apply"}
      </button>
    `)}get customEffectEntries(){const e=this.modelCatalogue;return[...e?.painted_effects.length?[{kind:"paint",key:"template:paint",label:"Paint",category:"single-layer"}]:[],...e?.music_modes.map(i=>({kind:"music",key:`template:music:${i.id}`,label:i.label,category:"music",mode:i.id}))??[],...e?.effects.filter(i=>i.category==="single_layer").map(i=>({kind:"single",key:`template:single:${i.family}:${i.variations[0].variant}`,label:i.label,category:"single-layer",family:i.family,variant:i.variations[0].variant}))??[],...e?.supports.multi!=="unsupported"?[{kind:"multi",key:"template:mix",label:"Mix",category:"multi-layer"}]:[],...e?.workshop_templates.map(i=>({kind:"workshop",key:`template:workshop:${i.id}`,label:i.label,category:"advanced",content:i.content}))??[],...e?.special_diy_templates.map(i=>({kind:"special_diy",key:`template:special-diy:${i.id}`,label:i.label,category:"special-diy",content:i.content}))??[],{kind:"advanced",key:"template:advanced",label:"Layered",category:"advanced"},...this.library.items.filter(i=>xt(i.kind)&&i.kind!=="video_profile").map(i=>({kind:"saved",key:`saved:${i.id}`,label:i.name,category:mr(i.kind),item:i}))].filter(i=>this.customEffectEntryAvailable(i)).filter(i=>this.customEffectCategory==="all"||this.customEffectCategory==="my-effects"&&i.kind==="saved"||i.category===this.customEffectCategory).sort((i,s)=>Te(i.label,s.label))}customEffectEntryAvailable(e){switch(e.kind){case"paint":return this.customEffectKindAvailable("h617a_painted");case"single":return this.customEffectKindAvailable(this.selectedModel==="H617A"?"h617a_single":"palette_diy");case"music":return this.customEffectKindAvailable("music_profile");case"multi":return this.customEffectKindAvailable("h617a_multi");case"advanced":return this.customEffectKindAvailable("advanced");case"workshop":return this.customEffectKindAvailable("workshop");case"special_diy":return this.customEffectKindAvailable("special_diy");case"saved":return this.libraryItemAvailable(e.item)}}libraryItemAvailable(e){const t=this.selectedModel;return e.model!==void 0&&e.model!==t?!1:e.kind==="video_profile"?this.videoAvailable:e.model===void 0&&["h617a_painted","h617a_single","h617a_multi"].includes(e.kind)&&t!=="H617A"?!1:this.customEffectKindAvailable(e.kind)}effectContentAvailable(e){const t=this.selectedModel;return e.kind==="h617a_painted"||e.kind==="h617a_single"||e.kind==="h617a_multi"?t==="H617A":e.kind==="palette_diy"||e.kind==="special_diy"||e.kind==="music_profile"||e.kind==="video_profile"||e.kind==="workshop"?e.model===t:e.kind==="scene_layered"?e.template.sku===t:this.customEffectKindAvailable(e.kind)}customEffectCategoryAvailable(e){switch(e){case"all":return this.customEffectsAvailable;case"music":return!!this.modelCatalogue?.music_modes.length;case"single-layer":return this.customEffectKindAvailable("h617a_painted")||this.customEffectKindAvailable("h617a_single")||this.customEffectKindAvailable("palette_diy");case"multi-layer":return this.customEffectKindAvailable("h617a_multi");case"advanced":return this.customEffectKindAvailable("advanced")||this.customEffectKindAvailable("workshop");case"special-diy":return this.customEffectKindAvailable("special_diy");case"my-effects":return this.library.items.some(t=>t.kind!=="video_profile"&&xt(t.kind)&&this.libraryItemAvailable(t))}}customEffectKindAvailable(e){const t=this.modelCatalogue,i=this.selectedModel;return e==="h617a_painted"?i==="H617A"&&!!t?.painted_effects.length:e==="h617a_single"?i==="H617A"&&!!t?.effects.length:e==="palette_diy"?i==="H6199"&&!!t?.effects.length:e==="h617a_multi"?i==="H617A"&&t?.supports.multi!=="unsupported":e==="music_profile"?!!t?.music_modes.length:e==="workshop"?t!==void 0&&t.supports.workshop!=="unsupported"&&!!t.workshop_templates.length:e==="special_diy"?t!==void 0&&t.supports.special_diy!=="unsupported"&&!!t.special_diy_templates.length:t?.supports.advanced!=="unsupported"}get defaultNewEffectKind(){return this.customEffectKindAvailable("h617a_single")?"h617a_single":this.customEffectKindAvailable("palette_diy")?"palette_diy":this.customEffectKindAvailable("h617a_painted")?"h617a_painted":this.customEffectKindAvailable("h617a_multi")?"h617a_multi":this.customEffectKindAvailable("advanced")?"advanced":void 0}customEffectCategoryButton(e,t){const i=this.customEffectCategory===e;return o`
      <button
        class="selector ${i?"selected":""}"
        type="button"
        aria-current=${i?"page":d}
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
    `}selectCustomEffectEntry(e){if(e.kind==="saved"){this.selectItem(e.item.id);return}if(e.kind==="advanced"){this.newEffect("advanced",void 0,{name:e.label,content:ct(),selectionIdentity:e.key,templateLabel:e.label}),this.customTemplateSelection=e.key;return}if(e.kind==="workshop"||e.kind==="special_diy"){this.openEditableTemplate(e.label,e.content,e.key);return}const t=this.modelCatalogue;if(t){if(e.kind==="music"){this.openMusicTemplate(e.mode,e.label);return}if(e.kind==="paint"){this.newEffect("h617a_painted",void 0,{name:e.label,content:ye(),selectionIdentity:e.key,templateLabel:e.label});return}if(e.kind==="single"){if(this.selectedModel==="H617A"){const i=ne("h617a_single",t);this.newEffect("h617a_single",void 0,{name:e.label,content:{...i,family:e.family,variant:e.variant},selectionIdentity:e.key,templateLabel:e.label})}else this.openEditableTemplate(e.label,_t(t,this.selectedModel,e.family,e.variant),e.key);return}this.newEffect("h617a_multi",void 0,{name:e.label,content:ne("h617a_multi",t),selectionIdentity:e.key,templateLabel:e.label})}}openEditableTemplate(e,t,i){this.beginEditorTransition(),this.currentItem=void 0,this.templateSourceLabel=e,this.customCopyStarted=!1,this.customTemplateSelection=i,this.name=e,this.content=Ke(t),this.savedBaseline=void 0,this.notice=void 0}openMusicTemplate(e,t){const i=this.selectedModel;i!=="H617A"&&i!=="H6199"||this.openEditableTemplate(t,{kind:"music_profile",model:i,mode:e,sensitivity:i==="H6199"?100:99,colour:null,calm:["rhythm","bloom","shiny"].includes(e)?!1:null,parameters:{}},`template:music:${e}`)}renderAdvancedEditor(){if(!je(this.content))return d;const e=this.content.kind==="scene_layered",t=this.content.kind==="workshop",i=this.activeDeployment;return o`
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
            class="secondary"
            type="button"
            ?disabled=${!this.canApply}
            @click=${this.apply}
          >
            ${this.applying?"Applying...":"Apply"}
          </button>
        `)}

      ${this.renderNewEffectTypeTabs()}

      ${this.isAdmin?d:o`
            <div class="feedback read-only" role="note">
              You can inspect shared effects. An administrator is required to
              edit or save them.
            </div>
          `}

      ${e||t?o`
            <div class="feedback source-note" role="note">
              Source parameter bytes remain immutable provenance. Layer edits
              are saved separately and may diverge from those bytes.
            </div>
          `:d}

      <govee-advanced-effect-editor
        .content=${dr(this.content)}
        .disabled=${this.editorReadOnly}
        .segmentCount=${this.selectedDevice?.segment_count??15}
        @content-changed=${s=>{je(this.content)&&(this.content=cr(this.content,s.detail.content))}}
      ></govee-advanced-effect-editor>
      ${i?this.renderDeployment(i):d}
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
    `}renderPaintedEditor(){if(this.content.kind!=="h617a_painted")return d;const e=this.activeDeployment;return o`
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

      ${this.isAdmin?d:o`
            <div class="feedback read-only" role="note">
              You can inspect shared effects. An administrator is required to
              edit or apply them.
            </div>
          `}

      ${this.renderSingleEffectSelector()}

      <govee-painted-segment-editor
        .colours=${Tt(this.content)}
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
            ${this.rangeField("Brightness","brightness",this.content.brightness)}
          </div>
        </section>
      </div>

      ${e?this.renderDeployment(e):d}
    `}renderPaletteEffectEditor(){if(this.content.kind!=="h617a_single"&&this.content.kind!=="h617a_multi"&&this.content.kind!=="palette_diy"&&this.content.kind!=="special_diy")return d;const e=this.content,t=this.activeDeployment;return o`
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
        @content-changed=${i=>{this.content=i.detail.content.kind==="palette_diy"?ds(i.detail.content):i.detail.content.kind==="special_diy"?cs(i.detail.content):ls(i.detail.content)}}
      ></govee-custom-effect-editor>

      ${t?this.renderDeployment(t):d}
    `}renderSingleEffectSelector(){if(!this.customCatalogue||this.templateSourceLabel||this.content.kind!=="h617a_painted"&&this.content.kind!=="h617a_single"&&this.content.kind!=="palette_diy"||this.currentItem?.content.kind==="h617a_painted"&&this.content.kind==="h617a_painted")return d;const e=this.selectedSingleEffectFamily,t=this.currentItem?.content.kind==="h617a_painted"?[]:this.modelCatalogue?.effects.filter(a=>a.category==="single_layer")??[],i=t.some(a=>a.family===e?.family),s=this.content.kind==="h617a_painted"?"paint":e&&i?e.id:`unknown:${this.content.family}`,r=this.customEffectKindAvailable("h617a_painted")&&this.currentItem?.content.kind!=="h617a_single";return o`
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
            ${r?o`
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
          ${t.save===!1?d:this.renderSaveAction()}
          ${e}
          ${this.renderEditorDeleteButton()}
        </div>
      </div>
    `}renderSaveAction(){if(this.templateSourceLabel)return o`
        <button
          class="primary"
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
        @click=${this.save}
      >
        ${this.saving?"Saving...":e}
      </button>
    `}get selectedSingleEffectFamily(){if(this.content.kind!=="h617a_single"&&this.content.kind!=="palette_diy")return;const e=this.content.family;return this.modelCatalogue?.effects.find(t=>t.family===e)}syncSingleEffectSelects(){if(this.content.kind!=="h617a_painted"&&this.content.kind!=="h617a_single"&&this.content.kind!=="palette_diy")return;const e=this.shadowRoot?.querySelector('select[aria-label="Effect"]');if(e&&(e.value=this.content.kind==="h617a_painted"?"paint":this.selectedSingleEffectFamily?.id??`unknown:${this.content.family}`),this.content.kind==="h617a_painted"){const t=this.shadowRoot?.querySelector('select[aria-label="Variation"]');t&&(t.value=this.content.effect)}}rangeField(e,t,i){return o`
      <label class="range-field">
        <span class="parameter-label">${e}</span>
        <input
          type="range"
          min="0"
          max="100"
          .value=${String(i)}
          ?disabled=${this.editorReadOnly}
          @input=${s=>this.updateContent({[t]:Number(s.target.value)})}
        />
        <output>${i}%</output>
      </label>
    `}sliderField(e,t,i){return o`
      <govee-slider-control
        .label=${e}
        .value=${i}
        .minimum=${0}
        .maximum=${100}
        .disabled=${this.editorReadOnly}
        @value-changed=${s=>this.updateContent({[t]:s.detail.value})}
      ></govee-slider-control>
    `}renderNewEffectTypeTabs(){return this.currentItem||this.templateSourceLabel||this.customCopyStarted||!V(this.content)?d:o`
      <div class="custom-mode-tabs" role="tablist" aria-label="Custom effect type">
        ${this.newEffectTypeAvailable("single")?this.newEffectTypeButton("single","Single Layer"):d}
        ${this.newEffectTypeAvailable("multi")?this.newEffectTypeButton("multi","Multi Layer"):d}
        ${this.newEffectTypeAvailable("advanced")?this.newEffectTypeButton("advanced","Advanced"):d}
      </div>
    `}newEffectTypeAvailable(e){return e==="single"?this.customEffectKindAvailable("h617a_painted")||this.customEffectKindAvailable("h617a_single")||this.customEffectKindAvailable("palette_diy"):this.customEffectKindAvailable(e==="multi"?"h617a_multi":"advanced")}newEffectTypeButton(e,t){const i=Ei(this.content)===e,s=e==="single"&&this.content.kind==="h617a_multi"&&this.content.effects.length>1,r=e==="multi"&&this.content.kind==="h617a_single"&&this.selectedSingleEffectFamily?.supports_multi===!1;return o`
      <button
        type="button"
        role="tab"
        aria-selected=${i}
        class=${i?"selected":""}
        title=${s?"Remove all but one effect before switching to Single Layer":r?"Choose a Single Layer effect that supports Multi Layer":d}
        ?disabled=${!this.isAdmin||s||r}
        @click=${()=>this.switchNewEffectType(e)}
      >
        ${t}
      </button>
    `}renderDeployment(e){const t=this.devices.find(s=>s.config_entry_id===e.config_entry_id)?.display_name??"device";let i;switch(e.phase){case"compiling":case"pending":i=`Preparing to apply to ${t}.`;break;case"uploading":i=`Applying to ${t}: ${e.progress_current} of ${e.progress_total}.`;break;case"activating":i=`Activating the selected effect on ${t}.`;break;case"verifying":i=`Checking the selected effect on ${t}.`;break;case"confirmed":i=e.content_kind==="music_profile"?`Applied to ${t}. The result responds to live audio.`:e.content_kind==="video_profile"?`Applied to ${t}. The result follows the live screen input.`:e.target_mode==="scene"?`Applied to ${t}. The selected scene identity was confirmed, but authored scene contents cannot be read back.`:`Applied to ${t}. The selected custom-effect code was confirmed, but exact effect contents cannot be read back.`;break;case"applied":i=`Applied to ${t}. This upload has no device readback, so packet completion is the available confirmation.`;break;case"uncertain":i=e.error_code==="effect_content_readback_unproven"?`${t} reported the selected H6199 user-effect slot, but the uploaded effect content cannot be read back. The result remains uncertain.`:e.error_code==="activation_readback_unproven"?`The H6199 effect upload was sent to ${t}, but activation and readback remain unproven. The result is uncertain.`:`The final state of ${t} is uncertain. The requested settings could not be confirmed.`;break;case"recovering":i=`Restoring the previous state on ${t} after the apply failed.`;break;case"unknown":i=`Applied to ${t}, but the requested settings could not be confirmed.`;break;case"interrupted":i=`Apply to ${t} was interrupted by a Home Assistant restart.`;break;case"failed":i=`Apply to ${t} failed.`;break}return o`
      <div
        class="feedback deployment ${e.phase}"
        role=${["failed","uncertain","interrupted","unknown"].includes(e.phase)?"alert":"status"}
      >
        ${i}
      </div>
    `}async selectSection(e){const t=this.beginEditorTransition();if(e===this.section||e==="custom"&&!this.customEffectsAvailable||e==="video"&&!this.videoAvailable||(this.section=e,this.notice=void 0,e==="scenes"))return;if(e==="video"){const s=this.library.items.find(a=>a.kind==="video_profile"&&this.libraryItemAvailable(a));if(s){await this.selectItem(s.id,t);return}const r=this.modelCatalogue?.video_modes[0];r&&this.openVideoTemplate(r.id,r.label);return}if((Pe(this.content)||this.content.kind==="palette_diy"||this.content.kind==="music_profile"||je(this.content)||this.content.kind==="opaque")&&this.customEffectKindAvailable(this.content.kind))return;const i=this.preferredLibraryEffect();if(i){await this.selectItem(i.id,t);return}this.isAdmin?this.openDefaultAvailableTemplate(t):(this.currentItem=void 0,this.name="")}async load(){const e=this.loadEpoch+1;this.loadEpoch=e,this.loading=!0,this.error=void 0,this.deploymentRevision=-1;const t=new In(this.hass);this.api=t;try{const[i,s,r,a]=await Promise.all([t.info(),t.devices(),t.library(),t.customCatalogue()]);if(!this.loadIsCurrent(e,t))return;if(!Cn(i))throw new Error("This editor bundle is not compatible with the installed backend.");this.devices=s,this.library=r,this.customCatalogue=a,this.selectedDeviceId=this.deviceIdFromPath()??s.find(p=>p.custom_effects.painted==="supported")?.config_entry_id??s[0]?.config_entry_id,this.customEffectsAvailable||(this.section="scenes");const l=await t.subscribeLibrary(p=>{this.libraryChanged(p)},p=>this.subscriptionFailed(p,e,t));if(!this.loadIsCurrent(e,t)||this.error){l();return}if(this.unsubscribeLibrary=l,this.isAdmin){const p=await t.subscribeDeployments(b=>{b.revision<this.deploymentRevision||(this.deploymentRevision=b.revision,this.deployments=b.deployments,this.activeOperationId||(this.activeOperationId=this.latestDeployment(ut)?.operation_id))},b=>this.subscriptionFailed(b,e,t));if(!this.loadIsCurrent(e,t)||this.error){p();return}this.unsubscribeDeployments=p}const c=this.preferredLibraryEffect(r.items);c?await this.selectItem(c.id):this.isAdmin&&this.openDefaultAvailableTemplate()}catch(i){this.loadIsCurrent(e,t)&&(this.stopSubscriptions(),this.error=M(i))}finally{this.loadIsCurrent(e,t)&&(this.loading=!1)}}openDefaultTemplate(e){this.newEffect("h617a_painted",e,{name:"Paint",content:ye(),selectionIdentity:"template:paint",templateLabel:"Paint"})}preferredLibraryEffect(e=this.library.items){return e.filter(t=>t.kind!=="video_profile"&&xt(t.kind)&&this.libraryItemAvailable(t)).sort((t,i)=>Ci(t.kind,this.selectedModel)-Ci(i.kind,this.selectedModel)||Te(t.name,i.name))[0]}openDefaultAvailableTemplate(e){if(this.customEffectKindAvailable("h617a_painted")){this.openDefaultTemplate(e);return}if(this.customEffectKindAvailable("h617a_single")&&this.modelCatalogue?.effects[0]){const t=this.modelCatalogue.effects.find(r=>r.category==="single_layer")??this.modelCatalogue.effects[0],i=t.variations[0],s=ne("h617a_single",this.modelCatalogue);this.newEffect("h617a_single",e,{name:t.label,content:{...s,family:t.family,variant:i.variant},selectionIdentity:`template:single:${t.family}:${i.variant}`,templateLabel:t.label});return}if(this.customEffectKindAvailable("palette_diy")&&this.modelCatalogue?.effects[0]){const t=this.modelCatalogue.effects.find(i=>i.category==="single_layer")??this.modelCatalogue.effects[0];this.openEditableTemplate(t.label,_t(this.modelCatalogue,this.selectedModel,t.family,t.variations[0].variant),`template:single:${t.family}:${t.variations[0].variant}`);return}if(this.customEffectKindAvailable("h617a_multi")){this.newEffect("h617a_multi",e,{name:"Mix",content:ne("h617a_multi",this.modelCatalogue),selectionIdentity:"template:mix",templateLabel:"Mix"});return}if(this.customEffectKindAvailable("advanced")){this.newEffect("advanced",e,{name:"Layered",content:ct(),selectionIdentity:"template:advanced",templateLabel:"Layered"});return}this.currentItem=void 0,this.name=""}loadIsCurrent(e,t){return this.isConnected&&this.loadEpoch===e&&this.api===t}subscriptionFailed(e,t,i){this.loadIsCurrent(t,i)&&(this.error=e.message,this.loading=!1,queueMicrotask(()=>{this.loadIsCurrent(t,i)&&this.stopSubscriptions()}))}stopSubscriptions(){this.unsubscribeLibrary?.(),this.unsubscribeDeployments?.(),this.unsubscribeLibrary=void 0,this.unsubscribeDeployments=void 0}deviceIdFromPath(){const e=window.location.pathname.match(/\/ha-govee-led-ble\/editor\/([^/]+)/);return e?.[1]?decodeURIComponent(e[1]):void 0}async libraryChanged(e){const t=this.library.library_revision;if(e.library_revision<t||(this.library=e,!this.currentItem||e.library_revision===t))return;const i=e.items.find(a=>a.id===this.currentItem?.id);if(!i){if(this.deletingItemId===this.currentItem.id)return;this.notice="This effect was removed from the shared library.";return}if(i.revision===this.currentItem.revision)return;if(this.dirty){this.notice="This effect changed elsewhere. Reload it before saving.";return}const s=this.beginEditorTransition();await this.selectItem(i.id,s)&&this.editorTransitionIsCurrent(s)&&(this.notice="Loaded the latest shared revision.")}sceneLibraryItemSaved(e){this.library={library_revision:e.detail.library_revision,items:Ai(this.library.items,e.detail.item)}}sceneTemplateSelected(e){if(!this.isAdmin||e.detail.config_entry_id!==this.selectedDeviceId)return;const t=this.beginEditorTransition();this.currentItem=e.detail.item,this.templateSourceLabel=void 0,this.customCopyStarted=e.detail.item===void 0,this.name=e.detail.name.trim()||"Layered scene template",this.content=oe(e.detail.content),this.savedBaseline=e.detail.item?.content.kind==="scene_layered"?z(e.detail.item.name,e.detail.item.content):void 0,this.section="custom",this.customEffectCategory="all",this.customTemplateSelection=void 0,this.notice=void 0,e.detail.item||this.selectNewEffectName(t)}sceneLibraryItemDeleteRequested(e){this.requestDelete(e.detail,e.target)}backToScenes(){this.beginEditorTransition(),this.section="scenes",this.notice=void 0}beginEditorTransition(){return this.editorTransitionEpoch+=1,this.editorTransitionEpoch}editorTransitionIsCurrent(e){return e===this.editorTransitionEpoch}deviceChanged(e){const t=this.beginEditorTransition();if(this.selectedDeviceId=e.target.value,this.activeOperationId=void 0,this.activeOperationId=this.latestDeployment(ut)?.operation_id,this.notice=void 0,this.section==="video"&&!this.videoAvailable){this.section="scenes";return}if(!this.customEffectsAvailable){this.section="scenes";return}if(this.customEffectCategoryAvailable(this.customEffectCategory)||(this.customEffectCategory="all"),this.section==="custom"&&!this.effectContentAvailable(this.content)){const i=this.customEffectEntries.filter(r=>r.kind!=="saved"),s=this.customEffectCategory==="all"?void 0:this.customEffectCategory==="music"?i.find(r=>r.kind==="music"&&r.mode!==void 0):i[0];s?this.selectCustomEffectEntry(s):this.openDefaultAvailableTemplate(t)}if(this.section==="video"&&this.content.kind==="video_profile"&&this.content.model!==this.selectedModel){const i=this.modelCatalogue?.video_modes[0];i&&this.openVideoTemplate(i.id,i.label)}}switchNewEffectType(e){if(!this.isAdmin||!this.newEffectTypeAvailable(e)||this.currentItem||this.templateSourceLabel||!V(this.content)||Ei(this.content)===e||e==="multi"&&this.content.kind==="h617a_single"&&this.selectedSingleEffectFamily?.supports_multi===!1)return;if(e==="advanced"){this.newEffect("advanced");return}const t=e==="single"?this.selectedModel==="H6199"?"palette_diy":"h617a_single":"h617a_multi";if(Pe(this.content)&&t!=="palette_diy"){this.switchCustomMode(t);return}this.content.kind==="palette_diy"&&t==="palette_diy"||this.newEffect(t)}switchCustomMode(e){if(!this.isAdmin||!this.customCatalogue||!Pe(this.content)||this.content.kind===e)return;const t=this.content;if(e==="h617a_single"&&t.kind==="h617a_multi"&&t.effects.length>1)return;let i;if(e==="h617a_painted"){const s=t.kind==="h617a_painted"?this.activePaintBrush:t.palette[0]?[...t.palette[0]]:[47,111,237];i={...ye(),speed:t.speed,groups:[{fill:[...s],segments:Array.from({length:Dt},(r,a)=>a)}]},t.kind!=="h617a_painted"&&(this.paintBrushes=ur(t.palette),this.selectedPaintBrush=0),this.brushUsesBackground=!1}else if(t.kind==="h617a_painted"){const s=pr(t);if(e==="h617a_single"){const r=ne(e,this.customCatalogue);i={...r,speed:t.speed,palette:s.length?s:r.palette}}else{const r=ne("h617a_multi",this.customCatalogue);i={...r,speed:t.speed,palette:s.length?s:r.palette}}}else if(e==="h617a_multi"&&t.kind==="h617a_single")i={kind:e,effects:[{family:t.family,variant:t.variant}],speed:t.speed,palette:t.palette.map(s=>[...s])};else if(e==="h617a_single"&&t.kind==="h617a_multi"){const s=t.effects[0];i={kind:e,family:s.family,variant:s.variant,speed:t.speed,palette:t.palette.map(r=>[...r])}}else return;this.content=i,/^New (Paint|Painted|Single|Multi) effect$/.test(this.name)&&(this.name=`New ${Si(e)} effect`),this.notice=this.applyAvailabilityNotice()}newEffect(e,t,i){const s=t??this.beginEditorTransition();!this.api||!this.isAdmin||!this.customEffectKindAvailable(e)||e!=="advanced"&&!this.modelCatalogue||(this.currentItem=void 0,this.templateSourceLabel=i?.templateLabel,this.customCopyStarted=!1,this.customTemplateSelection=e==="advanced"?void 0:i?.selectionIdentity??(e==="h617a_painted"?"template:paint":void 0),this.name=i?.name??`New ${Si(e)} effect`,this.content=i?.content??(e==="advanced"?ct():e==="palette_diy"?_t(this.modelCatalogue,this.selectedModel):ne(e,this.modelCatalogue)),e==="h617a_painted"&&(this.brushUsesBackground=!1),this.savedBaseline=void 0,this.notice=this.applyAvailabilityNotice(),this.selectNewEffectName(s))}selectNewEffectName(e){this.updateComplete.then(()=>{if(!this.editorTransitionIsCurrent(e)||this.currentItem||this.templateSourceLabel)return;const t=this.shadowRoot?.querySelector(".editor .editor-name");t?.focus(),t?.select()})}renderEditorDeleteButton(){return!this.isAdmin||!this.currentItem?d:o`
      <button
        class="danger"
        type="button"
        ?disabled=${this.deletingItemId!==void 0||this.saving||this.applying}
        @click=${e=>this.requestDelete({id:this.currentItem.id,revision:this.currentItem.revision,name:this.currentItem.name},e.currentTarget)}
      >
        ${this.deletingCurrentItem?"Deleting...":"Delete"}
      </button>
    `}requestDelete(e,t){!this.api||!this.isAdmin||this.deletingItemId!==void 0||this.saving||this.applying||(this.deleteCandidate={...e},this.deleteReturnFocus=t,this.notice=void 0,this.updateComplete.then(()=>{this.shadowRoot?.querySelector(".delete-dialog .danger")?.focus()}))}cancelDelete(){const e=this.deleteReturnFocus;this.deleteCandidate=void 0,this.deleteReturnFocus=void 0,this.updateComplete.then(()=>{e?.isConnected&&e.focus()})}deleteDialogKeyDown(e){e.key==="Escape"&&(e.preventDefault(),this.cancelDelete())}async confirmDelete(){const e=this.deleteCandidate,t=this.api;if(!e||!t||!this.isAdmin||this.deletingItemId!==void 0)return;const i=this.library.library_revision;this.deleteCandidate=void 0,this.deleteReturnFocus=void 0,this.deletingItemId=e.id,this.notice=void 0;try{const s=await t.deleteItem(e,i);s>=this.library.library_revision&&(this.library={library_revision:s,items:this.library.items.filter(r=>r.id!==e.id)}),this.currentItem?.id===e.id&&this.currentItem.revision===e.revision&&(this.beginEditorTransition(),this.currentItem=void 0,this.templateSourceLabel=void 0,this.customCopyStarted=!1,this.customTemplateSelection=void 0,this.name="",this.content=ye(),this.savedBaseline=void 0),this.notice=`Deleted ${e.name}.`}catch(s){const r=kt(s)==="conflict";if(this.notice=r?"This effect or library changed elsewhere. Reload before deleting.":`Delete failed: ${M(s)}`,r)try{const a=await t.library();a.library_revision>=this.library.library_revision&&(this.library=a)}catch(a){this.notice+=` Library refresh failed: ${M(a)}`}}finally{this.deletingItemId=void 0}}async selectItem(e,t){const i=t??this.beginEditorTransition();if(!this.api)return!1;try{const s=await this.api.item(e);return this.editorTransitionIsCurrent(i)?s.content.kind==="opaque"?(this.currentItem=s,this.templateSourceLabel=void 0,this.customCopyStarted=!1,this.customTemplateSelection=void 0,this.name=s.name,this.content=lr(s.content),this.savedBaseline=void 0,this.notice="This effect definition is preserved, but this editor cannot change or apply it.",!0):V(s.content)?(this.currentItem=s,this.templateSourceLabel=void 0,this.customCopyStarted=!1,this.customTemplateSelection=void 0,this.name=s.name,this.content=Ke(s.content),s.content.kind==="h617a_painted"&&(this.brushUsesBackground=!1),this.savedBaseline=z(s.name,s.content),this.notice=this.applyAvailabilityNotice(),!0):(this.notice="This item cannot be edited here.",!1):!1}catch(s){return this.editorTransitionIsCurrent(i)&&(this.notice=M(s)),!1}}nameChanged(e){this.name=e.target.value}editTemplate(){const e=this.templateSourceLabel;if(!e||!this.isAdmin||this.saving||this.applying||this.deletingCurrentItem)return;const t=this.beginEditorTransition();this.templateSourceLabel=void 0,this.customTemplateSelection=void 0,this.customCopyStarted=!0,this.name=`Custom ${e}`,this.savedBaseline=void 0,this.selectNewEffectName(t)}paintBrushesChanged(e){this.paintBrushes=e.detail.palette.map(t=>[...t]),this.selectedPaintBrush=Math.max(0,Math.min(this.selectedPaintBrush,this.paintBrushes.length-1)),this.brushUsesBackground=!1}paintBrushSelected(e){this.selectedPaintBrush=e.detail.index,this.brushUsesBackground=!1}get activePaintBrush(){return[...this.paintBrushes[this.selectedPaintBrush]??this.paintBrushes[0]??[47,111,237]]}backgroundChanged(e){this.updateContent({background:[...e.detail.colour]})}singleEffectChanged(e){if(!this.customCatalogue||this.currentItem?.content.kind==="opaque")return;const t=e.target.value;if(this.currentItem&&(this.content.kind==="h617a_painted"&&t!=="paint"||this.content.kind==="h617a_single"&&t==="paint"))return;const i=this.templateSourceLabel!==void 0||this.customTemplateSelection!==void 0;if(t==="paint"){this.content.kind!=="h617a_painted"&&this.switchCustomMode("h617a_painted"),i&&(this.customTemplateSelection="template:paint"),this.updateGeneratedEffectName("Paint");return}const s=this.modelCatalogue?.effects.find(a=>a.id===t),r=s?.variations[0];!s||!r||(this.content.kind==="h617a_painted"&&this.switchCustomMode("h617a_single"),!(this.content.kind!=="h617a_single"&&this.content.kind!=="palette_diy")&&(this.content={...this.content,family:s.family,variant:r.variant},i&&(this.customTemplateSelection=`template:single:${s.family}:${r.variant}`),this.updateGeneratedEffectName(s.label)))}paintedEffectVariationChanged(e){this.content.kind==="h617a_painted"&&this.updateContent({effect:e.target.value})}updateGeneratedEffectName(e){if(this.templateSourceLabel){this.templateSourceLabel=e,this.name=e;return}!this.currentItem&&/^New .+ effect$/.test(this.name)&&(this.name=`New ${e} effect`)}setSegmentColour(e){if(this.content.kind!=="h617a_painted")return;const t=Tt(this.content);t[e]=this.brushUsesBackground?[...this.content.background]:this.activePaintBrush,this.content={...this.content,groups:wi(t,this.content.background)}}paintAll(){if(this.content.kind!=="h617a_painted")return;const e=this.brushUsesBackground?this.content.background:this.activePaintBrush;this.content={...this.content,groups:wi(Array.from({length:Dt},()=>[...e]),this.content.background)}}resetPaint(){this.content.kind==="h617a_painted"&&(this.content={...this.content,groups:[]})}updateContent(e){this.content.kind==="h617a_painted"&&(this.content={...this.content,...e})}async save(){if(!this.api||!this.isAdmin||!this.dirty||this.saving||this.applying||this.deletingCurrentItem||!V(this.content))return;const e=this.api,t=this.name.trim();if(!t){this.notice="Give this effect a name before saving.";return}const i=this.beginEditorTransition(),s=this.currentItem,r=Ke(this.content),a=this.library.library_revision;this.saving=!0,this.notice=void 0;try{const l=s?await e.updateItem(s,t,r,a):await e.createItem(t,r,a);if(!V(l.item.content))throw new Error("The saved effect returned an unsupported definition.");const c=l.item.content;l.library_revision>=this.library.library_revision&&(this.library={library_revision:l.library_revision,items:Ai(this.library.items,l.item)}),this.editorTransitionIsCurrent(i)&&Ii(this.currentItem,s)&&V(this.content)&&z(this.name,this.content)===z(t,r)&&(this.currentItem=l.item,this.customCopyStarted=!1,this.customTemplateSelection=void 0,this.name=l.item.name,this.content=Ke(c),this.savedBaseline=z(this.name,this.content),s&&c.kind==="scene_layered"&&(this.savedSceneSelection=l.item)),this.editorTransitionIsCurrent(i)&&Ii(this.currentItem,l.item)&&V(this.content)&&z(this.name,this.content)===z(l.item.name,c)&&(this.notice="Saved.")}catch(l){if(kt(l)==="conflict"){const c="This effect or library changed elsewhere. Reload before saving.";this.editorTransitionIsCurrent(i)&&(this.notice=c);try{const p=await e.library();p.library_revision>=this.library.library_revision&&(this.library=p)}catch(p){this.editorTransitionIsCurrent(i)&&(this.notice=`${c} Library refresh failed: `+M(p))}}else this.editorTransitionIsCurrent(i)&&(this.notice=`Save failed: ${M(l)}`)}finally{this.saving=!1}}async apply(){if(!this.api||!this.canApply||!$t(this.content)||!this.selectedDeviceId)return;const e=this.name.trim(),t=this.selectedDeviceId,i=this.editorTransitionEpoch;this.activeOperationId=void 0,this.applying=!0,this.notice=void 0;try{const s=!this.dirty&&this.currentItem?await this.api.applySaved(t,this.currentItem):await this.api.applySnapshot(t,e,this.content);if(i!==this.editorTransitionEpoch||t!==this.selectedDeviceId)return;this.activeOperationId=s.operation_id,this.deployments=[s,...this.deployments.filter(r=>r.operation_id!==s.operation_id)]}catch(s){i===this.editorTransitionEpoch&&t===this.selectedDeviceId&&(this.notice=`Apply failed: ${M(s)}`)}finally{this.applying=!1}}applyAvailabilityNotice(){if(this.selectedDeviceId&&!this.selectedDevice)return"This device is temporarily unavailable in Home Assistant. Apply is disabled until it is loaded."}latestDeployment(e){return[...this.deployments].filter(t=>t.config_entry_id===this.selectedDeviceId&&e.includes(t.phase)).sort((t,i)=>i.updated_at.localeCompare(t.updated_at))[0]}static{this.styles=[N,ce,Ft,Ri,Q,Oi,Fi,Ut,Bi,E`
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
  `]}}x([h({attribute:!1})],$.prototype,"hass");x([h({attribute:!1})],$.prototype,"panel");x([h({type:Boolean})],$.prototype,"showDevicePicker");x([g()],$.prototype,"loading");x([g()],$.prototype,"error");x([g()],$.prototype,"notice");x([g()],$.prototype,"devices");x([g()],$.prototype,"selectedDeviceId");x([g()],$.prototype,"section");x([g()],$.prototype,"customEffectCategory");x([g()],$.prototype,"customTemplateSelection");x([g()],$.prototype,"templateSourceLabel");x([g()],$.prototype,"customCopyStarted");x([g()],$.prototype,"library");x([g()],$.prototype,"customCatalogue");x([g()],$.prototype,"currentItem");x([g()],$.prototype,"savedSceneSelection");x([g()],$.prototype,"name");x([g()],$.prototype,"content");x([g()],$.prototype,"paintBrushes");x([g()],$.prototype,"selectedPaintBrush");x([g()],$.prototype,"brushUsesBackground");x([g()],$.prototype,"saving");x([g()],$.prototype,"applying");x([g()],$.prototype,"deleteCandidate");x([g()],$.prototype,"deletingItemId");x([g()],$.prototype,"deployments");x([g()],$.prototype,"activeOperationId");function ye(){return{kind:"h617a_painted",effect:"clockwise",speed:50,brightness:100,background:[0,0,0],groups:[]}}function ne(n,e){if(n==="h617a_painted")return ye();const t=n==="h617a_multi"?e.effects.find(r=>r.supports_multi):e.effects[0];if(!t)throw new Error("The custom-effect catalogue has no compatible effects.");const i=t.variations[0],s={family:t.family,variant:i.variant};return n==="h617a_single"?{kind:n,...s,speed:50,palette:Re()}:{kind:n,effects:[s],speed:50,palette:Re()}}function _t(n,e,t,i){if(e!=="H617A"&&e!=="H6199")throw new Error(`Unsupported custom-effect model ${e}.`);const s=n.effects.find(r=>r.family===t)??n.effects[0];if(!s)throw new Error("The custom-effect catalogue has no compatible effects.");return{kind:"palette_diy",model:e,family:t??s.family,variant:i??s.variations[0].variant,speed:50,palette:Re()}}function ar(n){return{kind:"video_profile",model:"H6199",mode:n==="game"?"game":"movie",full_screen:!0,saturation:50,sound_effects:!1,sound_effects_softness:50,white_balance_position:17,relative_brightness:{left:100,top:100,right:100,bottom:100},blank_screen:!1}}function or(n){return{...n,background:[...n.background],groups:n.groups.map(e=>({fill:[...e.fill],segments:[...e.segments]}))}}function ls(n){return n.kind==="h617a_painted"?or(n):n.kind==="h617a_single"?{...n,palette:n.palette.map(e=>[...e])}:{...n,effects:n.effects.map(e=>({...e})),palette:n.palette.map(e=>[...e])}}function ds(n){return{...n,palette:n.palette.map(e=>[...e])}}function cs(n){return{...n,palette:n.palette.map(e=>[...e])}}function us(n){return{...n,effect:{layers:$e({layers:n.effect.layers}).layers}}}function ps(n){return{...n,colour:n.colour?[...n.colour]:null,parameters:structuredClone(n.parameters)}}function hs(n){return{...n,relative_brightness:{...n.relative_brightness}}}function Ke(n){return n.kind==="advanced"?$e(n):n.kind==="scene_layered"?oe(n):n.kind==="workshop"?us(n):n.kind==="palette_diy"?ds(n):n.kind==="special_diy"?cs(n):n.kind==="music_profile"?ps(n):n.kind==="video_profile"?hs(n):ls(n)}function lr(n){return{...n,body:structuredClone(n.body)}}function dr(n){return n.kind==="advanced"?n:{kind:"advanced",layers:n.effect.layers}}function cr(n,e){return n.kind==="advanced"?$e(e):n.kind==="workshop"?{...us(n),effect:{layers:$e(e).layers}}:{...oe(n),effect:{layers:$e(e).layers}}}function Re(){return[[255,0,0],[255,127,0],[255,255,0],[0,255,0],[0,0,255],[0,255,255],[139,0,255]]}function ur(n){const e=[];for(const t of[...n,...Re()])if(e.some(i=>tt(i,t))||e.push([...t]),e.length===8)break;return e}function Tt(n){const e=Array.from({length:Dt},()=>[...n.background]);for(const t of n.groups)for(const i of t.segments)e[i]=[...t.fill];return e}function wi(n,e){const t=new Map;return n.forEach((i,s)=>{if(tt(i,e))return;const r=i.join(","),a=t.get(r);a?a.segments.push(s):t.set(r,{fill:[...i],segments:[s]})}),[...t.values()]}function pr(n){const e=[];for(const t of Tt(n))if(!tt(t,n.background)&&!e.some(i=>tt(i,t))&&e.push([...t]),e.length===8)break;return e}function tt(n,e){return n[0]===e[0]&&n[1]===e[1]&&n[2]===e[2]}function z(n,e){return JSON.stringify({name:n.trim(),content:e})}function Wt(n){return n==="h617a_painted"||n==="h617a_single"||n==="h617a_multi"}function Pe(n){return typeof n=="object"&&n!==null&&"kind"in n&&Wt(n.kind)}function $t(n){return V(n)}function V(n){return Pe(n)||typeof n=="object"&&n!==null&&"kind"in n&&(He(n.kind)||n.kind==="palette_diy"||n.kind==="special_diy"||n.kind==="music_profile"||n.kind==="video_profile")}function Ei(n){return n.kind==="h617a_multi"?"multi":He(n.kind)?"advanced":n.kind==="h617a_painted"||n.kind==="h617a_single"||n.kind==="palette_diy"||n.kind==="special_diy"?"single":void 0}function He(n){return n==="advanced"||n==="scene_layered"||n==="workshop"}function je(n){return He(n.kind)}function hr(n){return Wt(n)||He(n)||n==="palette_diy"||n==="special_diy"||n==="music_profile"||n==="video_profile"||n==="scene_builtin"||n==="scene_palette"}function Si(n){switch(n){case"h617a_painted":return"Paint";case"h617a_single":return"Single";case"h617a_multi":return"Multi";case"advanced":return"Layered";case"palette_diy":return"Single";case"special_diy":return"Special DIY";case"workshop":return"Workshop";default:return"Custom"}}function xt(n){return Wt(n)||He(n)||n==="palette_diy"||n==="special_diy"||n==="music_profile"||!hr(n)}function Ci(n,e){const t=e==="H6199"?["special_diy","palette_diy","workshop","music_profile","advanced","scene_layered"]:["h617a_painted","h617a_single","h617a_multi","music_profile","workshop","advanced","scene_layered"],i=t.indexOf(n);return i===-1?t.length:i}function mr(n){return n==="h617a_multi"?"multi-layer":n==="music_profile"?"music":n==="h617a_painted"||n==="h617a_single"||n==="palette_diy"||n==="special_diy"?n==="special_diy"?"special-diy":"single-layer":"advanced"}function Ii(n,e){return n?.id===e?.id&&n?.revision===e?.revision}function Ai(n,e){const t=fr(e);return[...n.filter(i=>i.id!==e.id),{id:e.id,revision:e.revision,name:e.name,kind:e.content.kind==="opaque"?e.content.source_kind:e.content.kind,...t?{model:t}:{},...e.content.kind==="scene_builtin"||e.content.kind==="scene_palette"||e.content.kind==="scene_layered"?{template:e.content.template}:{}}].sort((i,s)=>i.name.localeCompare(s.name))}function fr(n){const e=n.content;return e.kind==="palette_diy"||e.kind==="special_diy"||e.kind==="workshop"||e.kind==="music_profile"||e.kind==="video_profile"?e.model:e.kind==="h617a_painted"||e.kind==="h617a_single"||e.kind==="h617a_multi"?"H617A":e.kind==="scene_builtin"||e.kind==="scene_palette"||e.kind==="scene_layered"?Pi(e.template.sku):Pi(n.target_hint?.model)}function Pi(n){return n==="H617A"||n==="H6199"?n:void 0}customElements.get("ha-govee-led-ble-editor")||customElements.define("ha-govee-led-ble-editor",$);
