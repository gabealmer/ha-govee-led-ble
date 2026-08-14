const Ae=globalThis,ot=Ae.ShadowRoot&&(Ae.ShadyCSS===void 0||Ae.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,dt=Symbol(),_t=new WeakMap;let Jt=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==dt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(ot&&e===void 0){const i=t!==void 0&&t.length===1;i&&(e=_t.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&_t.set(t,e))}return e}toString(){return this.cssText}};const Ci=n=>new Jt(typeof n=="string"?n:n+"",void 0,dt),E=(n,...e)=>{const t=n.length===1?n[0]:e.reduce((i,s,r)=>i+(a=>{if(a._$cssResult$===!0)return a.cssText;if(typeof a=="number")return a;throw Error("Value passed to 'css' function must be a 'css' function result: "+a+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+n[r+1],n[0]);return new Jt(t,n,dt)},Ii=(n,e)=>{if(ot)n.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const i=document.createElement("style"),s=Ae.litNonce;s!==void 0&&i.setAttribute("nonce",s),i.textContent=t.cssText,n.appendChild(i)}},xt=ot?n=>n:n=>n instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return Ci(t)})(n):n;const{is:Ai,defineProperty:Pi,getOwnPropertyDescriptor:Li,getOwnPropertyNames:Di,getOwnPropertySymbols:Ti,getPrototypeOf:Ni}=Object,Ue=globalThis,wt=Ue.trustedTypes,Mi=wt?wt.emptyScript:"",Bi=Ue.reactiveElementPolyfillSupport,ve=(n,e)=>n,De={toAttribute(n,e){switch(e){case Boolean:n=n?Mi:null;break;case Object:case Array:n=n==null?n:JSON.stringify(n)}return n},fromAttribute(n,e){let t=n;switch(e){case Boolean:t=n!==null;break;case Number:t=n===null?null:Number(n);break;case Object:case Array:try{t=JSON.parse(n)}catch{t=null}}return t}},lt=(n,e)=>!Ai(n,e),kt={attribute:!0,type:String,converter:De,reflect:!1,useDefault:!1,hasChanged:lt};Symbol.metadata??=Symbol("metadata"),Ue.litPropertyMetadata??=new WeakMap;let de=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=kt){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(e,i,t);s!==void 0&&Pi(this.prototype,e,s)}}static getPropertyDescriptor(e,t,i){const{get:s,set:r}=Li(this.prototype,e)??{get(){return this[t]},set(a){this[t]=a}};return{get:s,set(a){const l=s?.call(this);r?.call(this,a),this.requestUpdate(e,l,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??kt}static _$Ei(){if(this.hasOwnProperty(ve("elementProperties")))return;const e=Ni(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(ve("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(ve("properties"))){const t=this.properties,i=[...Di(t),...Ti(t)];for(const s of i)this.createProperty(s,t[s])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[i,s]of t)this.elementProperties.set(i,s)}this._$Eh=new Map;for(const[t,i]of this.elementProperties){const s=this._$Eu(t,i);s!==void 0&&this._$Eh.set(s,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const s of i)t.unshift(xt(s))}else e!==void 0&&t.push(xt(e));return t}static _$Eu(e,t){const i=t.attribute;return i===!1?void 0:typeof i=="string"?i:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Ii(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,i);if(s!==void 0&&i.reflect===!0){const r=(i.converter?.toAttribute!==void 0?i.converter:De).toAttribute(t,i.type);this._$Em=e,r==null?this.removeAttribute(s):this.setAttribute(s,r),this._$Em=null}}_$AK(e,t){const i=this.constructor,s=i._$Eh.get(e);if(s!==void 0&&this._$Em!==s){const r=i.getPropertyOptions(s),a=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:De;this._$Em=s;const l=a.fromAttribute(t,r.type);this[s]=l??this._$Ej?.get(s)??l,this._$Em=null}}requestUpdate(e,t,i,s=!1,r){if(e!==void 0){const a=this.constructor;if(s===!1&&(r=this[e]),i??=a.getPropertyOptions(e),!((i.hasChanged??lt)(r,t)||i.useDefault&&i.reflect&&r===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,i))))return;this.C(e,t,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:s,wrapped:r},a){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),r!==!0||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),s===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[s,r]of this._$Ep)this[s]=r;this._$Ep=void 0}const i=this.constructor.elementProperties;if(i.size>0)for(const[s,r]of i){const{wrapped:a}=r,l=this[s];a!==!0||this._$AL.has(s)||l===void 0||this.C(s,void 0,r,l)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(i=>i.hostUpdate?.()),this.update(t)):this._$EM()}catch(i){throw e=!1,this._$EM(),i}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};de.elementStyles=[],de.shadowRootOptions={mode:"open"},de[ve("elementProperties")]=new Map,de[ve("finalized")]=new Map,Bi?.({ReactiveElement:de}),(Ue.reactiveElementVersions??=[]).push("2.1.2");const ct=globalThis,Et=n=>n,Te=ct.trustedTypes,St=Te?Te.createPolicy("lit-html",{createHTML:n=>n}):void 0,Zt="$lit$",K=`lit$${Math.random().toFixed(9).slice(2)}$`,Qt="?"+K,Ri=`<${Qt}>`,Q=document,ye=()=>Q.createComment(""),$e=n=>n===null||typeof n!="object"&&typeof n!="function",ut=Array.isArray,Oi=n=>ut(n)||typeof n?.[Symbol.iterator]=="function",je=`[ 	
\f\r]`,fe=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Ct=/-->/g,It=/>/g,Y=RegExp(`>|${je}(?:([^\\s"'>=/]+)(${je}*=${je}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),At=/'/g,Pt=/"/g,ei=/^(?:script|style|textarea|title)$/i,Fi=n=>(e,...t)=>({_$litType$:n,strings:e,values:t}),o=Fi(1),he=Symbol.for("lit-noChange"),d=Symbol.for("lit-nothing"),Lt=new WeakMap,Z=Q.createTreeWalker(Q,129);function ti(n,e){if(!ut(n)||!n.hasOwnProperty("raw"))throw Error("invalid template strings array");return St!==void 0?St.createHTML(e):e}const Ui=(n,e)=>{const t=n.length-1,i=[];let s,r=e===2?"<svg>":e===3?"<math>":"",a=fe;for(let l=0;l<t;l++){const c=n[l];let u,m,y=-1,T=0;for(;T<c.length&&(a.lastIndex=T,m=a.exec(c),m!==null);)T=a.lastIndex,a===fe?m[1]==="!--"?a=Ct:m[1]!==void 0?a=It:m[2]!==void 0?(ei.test(m[2])&&(s=RegExp("</"+m[2],"g")),a=Y):m[3]!==void 0&&(a=Y):a===Y?m[0]===">"?(a=s??fe,y=-1):m[1]===void 0?y=-2:(y=a.lastIndex-m[2].length,u=m[1],a=m[3]===void 0?Y:m[3]==='"'?Pt:At):a===Pt||a===At?a=Y:a===Ct||a===It?a=fe:(a=Y,s=void 0);const R=a===Y&&n[l+1].startsWith("/>")?" ":"";r+=a===fe?c+Ri:y>=0?(i.push(u),c.slice(0,y)+Zt+c.slice(y)+K+R):c+K+(y===-2?l:R)}return[ti(n,r+(n[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),i]};class _e{constructor({strings:e,_$litType$:t},i){let s;this.parts=[];let r=0,a=0;const l=e.length-1,c=this.parts,[u,m]=Ui(e,t);if(this.el=_e.createElement(u,i),Z.currentNode=this.el.content,t===2||t===3){const y=this.el.content.firstChild;y.replaceWith(...y.childNodes)}for(;(s=Z.nextNode())!==null&&c.length<l;){if(s.nodeType===1){if(s.hasAttributes())for(const y of s.getAttributeNames())if(y.endsWith(Zt)){const T=m[a++],R=s.getAttribute(y).split(K),Ce=/([.?@])?(.*)/.exec(T);c.push({type:1,index:r,name:Ce[2],strings:R,ctor:Ce[1]==="."?Ki:Ce[1]==="?"?Vi:Ce[1]==="@"?zi:qe}),s.removeAttribute(y)}else y.startsWith(K)&&(c.push({type:6,index:r}),s.removeAttribute(y));if(ei.test(s.tagName)){const y=s.textContent.split(K),T=y.length-1;if(T>0){s.textContent=Te?Te.emptyScript:"";for(let R=0;R<T;R++)s.append(y[R],ye()),Z.nextNode(),c.push({type:2,index:++r});s.append(y[T],ye())}}}else if(s.nodeType===8)if(s.data===Qt)c.push({type:2,index:r});else{let y=-1;for(;(y=s.data.indexOf(K,y+1))!==-1;)c.push({type:7,index:r}),y+=K.length-1}r++}}static createElement(e,t){const i=Q.createElement("template");return i.innerHTML=e,i}}function pe(n,e,t=n,i){if(e===he)return e;let s=i!==void 0?t._$Co?.[i]:t._$Cl;const r=$e(e)?void 0:e._$litDirective$;return s?.constructor!==r&&(s?._$AO?.(!1),r===void 0?s=void 0:(s=new r(n),s._$AT(n,t,i)),i!==void 0?(t._$Co??=[])[i]=s:t._$Cl=s),s!==void 0&&(e=pe(n,s._$AS(n,e.values),s,i)),e}class qi{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,s=(e?.creationScope??Q).importNode(t,!0);Z.currentNode=s;let r=Z.nextNode(),a=0,l=0,c=i[0];for(;c!==void 0;){if(a===c.index){let u;c.type===2?u=new ke(r,r.nextSibling,this,e):c.type===1?u=new c.ctor(r,c.name,c.strings,this,e):c.type===6&&(u=new Hi(r,this,e)),this._$AV.push(u),c=i[++l]}a!==c?.index&&(r=Z.nextNode(),a++)}return Z.currentNode=Q,s}p(e){let t=0;for(const i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class ke{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,s){this.type=2,this._$AH=d,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=pe(this,e,t),$e(e)?e===d||e==null||e===""?(this._$AH!==d&&this._$AR(),this._$AH=d):e!==this._$AH&&e!==he&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Oi(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==d&&$e(this._$AH)?this._$AA.nextSibling.data=e:this.T(Q.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,s=typeof i=="number"?this._$AC(e):(i.el===void 0&&(i.el=_e.createElement(ti(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(t);else{const r=new qi(s,this),a=r.u(this.options);r.p(t),this.T(a),this._$AH=r}}_$AC(e){let t=Lt.get(e.strings);return t===void 0&&Lt.set(e.strings,t=new _e(e)),t}k(e){ut(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,s=0;for(const r of e)s===t.length?t.push(i=new ke(this.O(ye()),this.O(ye()),this,this.options)):i=t[s],i._$AI(r),s++;s<t.length&&(this._$AR(i&&i._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const i=Et(e).nextSibling;Et(e).remove(),e=i}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}}class qe{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,s,r){this.type=1,this._$AH=d,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=r,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=d}_$AI(e,t=this,i,s){const r=this.strings;let a=!1;if(r===void 0)e=pe(this,e,t,0),a=!$e(e)||e!==this._$AH&&e!==he,a&&(this._$AH=e);else{const l=e;let c,u;for(e=r[0],c=0;c<r.length-1;c++)u=pe(this,l[i+c],t,c),u===he&&(u=this._$AH[c]),a||=!$e(u)||u!==this._$AH[c],u===d?e=d:e!==d&&(e+=(u??"")+r[c+1]),this._$AH[c]=u}a&&!s&&this.j(e)}j(e){e===d?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class Ki extends qe{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===d?void 0:e}}class Vi extends qe{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==d)}}class zi extends qe{constructor(e,t,i,s,r){super(e,t,i,s,r),this.type=5}_$AI(e,t=this){if((e=pe(this,e,t,0)??d)===he)return;const i=this._$AH,s=e===d&&i!==d||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,r=e!==d&&(i===d||s);s&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class Hi{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){pe(this,e)}}const ji=ct.litHtmlPolyfillSupport;ji?.(_e,ke),(ct.litHtmlVersions??=[]).push("3.3.3");const Gi=(n,e,t)=>{const i=t?.renderBefore??e;let s=i._$litPart$;if(s===void 0){const r=t?.renderBefore??null;i._$litPart$=s=new ke(e.insertBefore(ye(),r),r,void 0,t??{})}return s._$AI(n),s};const ht=globalThis;class D extends de{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Gi(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return he}}D._$litElement$=!0,D.finalized=!0,ht.litElementHydrateSupport?.({LitElement:D});const Xi=ht.litElementPolyfillSupport;Xi?.({LitElement:D});(ht.litElementVersions??=[]).push("4.2.2");const Yi={attribute:!0,type:String,converter:De,reflect:!1,hasChanged:lt},Wi=(n=Yi,e,t)=>{const{kind:i,metadata:s}=t;let r=globalThis.litPropertyMetadata.get(s);if(r===void 0&&globalThis.litPropertyMetadata.set(s,r=new Map),i==="setter"&&((n=Object.create(n)).wrapped=!0),r.set(t.name,n),i==="accessor"){const{name:a}=t;return{set(l){const c=e.get.call(this);e.set.call(this,l),this.requestUpdate(a,c,n,!0,l)},init(l){return l!==void 0&&this.C(a,void 0,n,l),l}}}if(i==="setter"){const{name:a}=t;return function(l){const c=this[a];e.call(this,l),this.requestUpdate(a,c,n,!0,l)}}throw Error("Unsupported decorator location: "+i)};function b(n){return(e,t)=>typeof t=="object"?Wi(n,e,t):((i,s,r)=>{const a=s.hasOwnProperty(r);return s.constructor.createProperty(r,i),a?Object.getOwnPropertyDescriptor(s,r):void 0})(n,e,t)}function p(n){return b({...n,state:!0,attribute:!1})}const j=E`
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
`,Ee=E`
  .card {
    min-width: 0;
    padding: var(--studio-card-padding);
    border: 1px solid var(--studio-border);
    border-radius: var(--studio-card-radius);
    background: var(--studio-card);
  }
`,pt=E`
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
`,ii=E`
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
`,ft=E`
  .field,
  .range-field {
    display: grid;
    align-items: center;
    gap: 10px;
    margin-top: 14px;
    color: var(--studio-muted);
    font-size: 13px;
    font-weight: 600;
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
`,si=E`
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
`,ni=E`
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
`,ri=E`
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
`,ai=E`
  .feedback {
    margin-bottom: var(--studio-section-gap);
    padding: 12px 14px;
    border: 1px solid var(--studio-border);
    border-radius: var(--studio-button-radius);
    background: var(--studio-card);
    line-height: 1.45;
  }
`;var Ji=Object.defineProperty,te=(n,e,t,i)=>{for(var s=void 0,r=n.length-1,a;r>=0;r--)(a=n[r])&&(s=a(e,t,s)||s);return s&&Ji(e,t,s),s};class G extends D{constructor(){super(...arguments),this.items=[],this.ariaLabel="Items",this.itemRole="button",this.addLabel="Add item",this.addDisabled=!1,this.reorderDisabled=!1,this.pointerX=0,this.pointerY=0,this.pointerMoved=!1,this.suppressClick=!1}render(){const e=this.itemRole==="tab";return o`
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
    `}focusItem(e){this.updateComplete.then(()=>{this.shadowRoot?.querySelectorAll(".item")[e]?.focus()})}itemClicked(e){if(this.suppressClick){this.suppressClick=!1;return}this.dispatchEvent(new CustomEvent("item-selected",{detail:{index:e},bubbles:!0,composed:!0}))}addClicked(){this.dispatchEvent(new CustomEvent("item-added",{bubbles:!0,composed:!0}))}dragStarted(e,t){this.reorderDisabled||(this.draggedIndex=e,t.dataTransfer?.setData("text/plain",String(e)))}dropped(e,t){t.preventDefault(),this.draggedIndex!==void 0&&(this.reorder(this.draggedIndex,e),this.draggedIndex=void 0)}keyPressed(e,t){if(t.key!=="ArrowLeft"&&t.key!=="ArrowRight")return;t.preventDefault();const i=e+(t.key==="ArrowLeft"?-1:1);if(!(i<0||i>=this.items.length)){if(this.reorderDisabled){this.itemRole==="tab"&&(this.itemClicked(i),this.focusItem(i));return}this.reorder(e,i,!0)}}pointerStarted(e,t){this.reorderDisabled||t.pointerType==="mouse"||t.target.closest(".strip-popover")||(this.pointerId=t.pointerId,this.pointerIndex=e,this.pointerX=t.clientX,this.pointerY=t.clientY,this.pointerMoved=!1,t.currentTarget.setPointerCapture(t.pointerId))}pointerMovedOver(e){if(e.pointerId!==this.pointerId||this.pointerIndex===void 0)return;const t=e.clientX-this.pointerX,i=e.clientY-this.pointerY;if(!this.pointerMoved){if(Math.abs(i)>Math.abs(t)||Math.abs(t)<10)return;this.pointerMoved=!0}e.preventDefault();const s=this.shadowRoot?.elementFromPoint(e.clientX,e.clientY)?.closest("[data-item-index]"),r=Number(s?.dataset.itemIndex);!Number.isInteger(r)||r===this.pointerIndex||(this.reorder(this.pointerIndex,r),this.pointerIndex=r)}pointerFinished(e){if(e.pointerId!==this.pointerId)return;const t=e.currentTarget;t.hasPointerCapture(e.pointerId)&&t.releasePointerCapture(e.pointerId),this.suppressClick=this.pointerMoved,this.pointerId=void 0,this.pointerIndex=void 0,this.pointerMoved=!1}reorder(e,t,i=!1){this.reorderDisabled||e===t||(this.dispatchEvent(new CustomEvent("items-reordered",{detail:{from:e,to:t},bubbles:!0,composed:!0})),i&&this.focusItem(t))}static{this.styles=[j,E`
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
  `]}}te([b({attribute:!1})],G.prototype,"items");te([b({attribute:!1})],G.prototype,"activeIndex");te([b()],G.prototype,"ariaLabel");te([b()],G.prototype,"itemRole");te([b()],G.prototype,"addLabel");te([b({type:Boolean})],G.prototype,"addDisabled");te([b({type:Boolean})],G.prototype,"reorderDisabled");customElements.get("govee-reorderable-strip")||customElements.define("govee-reorderable-strip",G);function z(n){return n.map(e=>[...e])}function x(n){return`#${n.map(e=>e.toString(16).padStart(2,"0")).join("")}`}function Dt(n){return[Number.parseInt(n.slice(1,3),16),Number.parseInt(n.slice(3,5),16),Number.parseInt(n.slice(5,7),16)]}function Qe(n,e){return n.localeCompare(e,"en-AU",{sensitivity:"base"})}function Ne(n,e,t){return n===void 0||e===t?n:n===e?t:e<t&&n>e&&n<=t?n-1:t<e&&n>=t&&n<e?n+1:n}function L(n){return n instanceof Error||typeof n=="object"&&n!==null&&"message"in n&&typeof n.message=="string"?n.message:"An unexpected error occurred."}function et(n){if(typeof n=="object"&&n!==null&&"code"in n&&typeof n.code=="string")return n.code}var Zi=Object.defineProperty,ie=(n,e,t,i)=>{for(var s=void 0,r=n.length-1,a;r>=0;r--)(a=n[r])&&(s=a(e,t,s)||s);return s&&Zi(e,t,s),s};const ae=5,Tt=8,Nt=15,oi=[1,2,0,3],di=[0,1,2,3],Qi={0:"Segment",1:"Continuous",2:"Random",3:"Custom"},es={0:"Brightest to darkest",1:"Brightest, darkest, brightest",2:"Darkest to brightest",3:"Darkest, brightest, darkest"},Mt={0:"Forward",1:"Backward",2:"Forward and back",3:"Back and forward"};class X extends D{constructor(){super(...arguments),this.disabled=!1,this.segmentCount=Nt,this.activeLayerIndex=0,this.activePatternIndex=0,this.movementAnnouncement=""}willUpdate(e){if(!(!e.has("content")||!this.content)){if(this.content.layers.length===0){this.activeLayerIndex=0,this.activePatternIndex=0;return}if(this.activeLayerIndex=P(this.activeLayerIndex,0,this.content.layers.length-1),this.activeLayer.brightness_patterns.length===0){this.activePatternIndex=0;return}this.activePatternIndex=P(this.activePatternIndex,0,this.activeLayer.brightness_patterns.length-1)}}render(){if(!this.content)return d;if(this.content.layers.length===0)return this.renderEmptyLayers();const e=this.activeLayer,t=this.content.layers.map((i,s)=>({key:`layer-${s}`,label:`Layer ${s+1}`,ariaLabel:`Layer ${s+1}. Drag to reorder or use arrow keys.`,id:`advanced-layer-tab-${s}`,ariaControls:"advanced-layer-panel"}));return o`
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
          .addDisabled=${this.disabled||this.content.layers.length>=ae}
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
                    ?disabled=${this.disabled||this.content.layers.length>=ae}
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

        ${this.content.layers.length>=ae?o`
              <p class="limit-note">
                ${this.content.layers.length>ae?`This loaded effect has ${this.content.layers.length} layers. All are preserved, but adding and copying are unavailable while five or more remain.`:"Advanced effects can author up to five layers."}
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
        <h3>No layer records</h3>
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
    `}get activeLayer(){return this.content.layers[this.activeLayerIndex]}renderAppliedArea(e){const t=e.area.start_tenths>=0&&e.area.start_tenths<=9&&e.area.width_tenths>=1&&e.area.width_tenths<=10-e.area.start_tenths,i=P(e.area.start_tenths,0,9),s=i+e.area.width_tenths,r=Number.isInteger(this.segmentCount)&&this.segmentCount>0?this.segmentCount:Nt,a=x(e.palette[0]??[47,111,237]);return o`
      <section class="card wide-card">
        <h3>Applied area</h3>
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
                    class=${t&&ns(c,r,i,s)?"covered":""}
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
    `}areaPointerStarted(e,t,i,s){if(this.disabled)return;const r=this.shadowRoot?.querySelector(".area-track");if(!r)return;const a=r.getBoundingClientRect();if(a.width<=0)return;const l=s.currentTarget,c=e==="start"?t:e==="end"?i:t;s.preventDefault(),s.stopPropagation(),l.focus(),l.setPointerCapture(s.pointerId),this.areaDrag={pointerId:s.pointerId,mode:e,initialStart:t,initialEnd:i,currentStart:t,currentEnd:i,originX:s.clientX,pointerOffsetX:e==="move"?0:s.clientX-(a.left+c/10*a.width),trackLeft:a.left,trackWidth:a.width,captureTarget:l}}areaPointerMoved(e){const t=this.areaDrag;if(!t||t.pointerId!==e.pointerId)return;e.preventDefault();let i=t.initialStart,s=t.initialEnd;if(t.mode==="move"){const r=t.initialEnd-t.initialStart,a=Math.round((e.clientX-t.originX)/t.trackWidth*10);i=P(t.initialStart+a,0,10-r),s=i+r}else{const r=Math.round((e.clientX-t.pointerOffsetX-t.trackLeft)/t.trackWidth*10);t.mode==="start"?i=P(r,0,t.initialEnd-1):s=P(r,t.initialStart+1,10)}i===t.currentStart&&s===t.currentEnd||(t.currentStart=i,t.currentEnd=s,this.setAppliedArea(i,s))}areaPointerFinished(e){const t=this.areaDrag;!t||t.pointerId!==e.pointerId||(t.captureTarget.hasPointerCapture(e.pointerId)&&t.captureTarget.releasePointerCapture(e.pointerId),this.areaDrag=void 0)}areaBoundaryKeyDown(e,t,i,s){const r=e==="start"?0:t+1,a=e==="start"?i-1:10,l=e==="start"?t:i,c=Rt(s.key,l,r,a);c!==void 0&&(s.preventDefault(),this.setAppliedArea(e==="start"?c:t,e==="end"?c:i))}areaPositionKeyDown(e,t,i){const s=t-e,r=Rt(i.key,e,0,10-s);r!==void 0&&(i.preventDefault(),this.setAppliedArea(r,r+s))}setAppliedArea(e,t){this.updateLayer({area:{start_tenths:e,width_tenths:t-e}})}renderSelectionControls(e){const t=e.selection,i=ts(t.type);return o`
      <div class="selection-controls">
        <h4>Selection</h4>
        <label class="field">
          <span>Type</span>
          <select
            aria-label="Selection type"
            .value=${String(t.type)}
            ?disabled=${this.disabled}
            @change=${s=>this.updateSelection({type:Number(s.target.value)})}
          >
            ${oi.map(s=>o`<option
                  value=${s}
                  .selected=${t.type===s}
                >
                  ${Qi[s]}
                </option>`)}
            ${i?d:o`
                  <option value=${t.type} .selected=${!0}>
                    Raw type ${t.type} (0x${Ie(t.type)})
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
        <h3>Colours</h3>
        <govee-palette-editor
          .palette=${e.palette}
          .minColours=${1}
          .maxColours=${Tt}
          .disabled=${this.disabled}
          @palette-changed=${t=>this.updateLayer({palette:t.detail.palette.map(i=>[...i])})}
        ></govee-palette-editor>
        ${e.palette.length>Tt?o`
              <p class="muted">
                All ${e.palette.length} loaded colours are preserved.
                Adding remains unavailable until fewer than eight remain.
              </p>
            `:d}
      </section>
    `}renderDistribution(e){const t=e.distribution.method;return o`
      <section class="card">
        <h3>Distribution</h3>
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
        ${this.rangeField("Colour speed",e.colour_speed,0,255,me(e.colour_speed),i=>this.updateLayer({colour_speed:i}))}
        ${this.rangeField("Colour retention",e.colour_retention,0,255,String(e.colour_retention),i=>this.updateLayer({colour_retention:i}))}
      </section>
    `}renderBrightness(e){if(e.brightness_patterns.length===0)return o`
        <section class="card wide-card empty-state" role="status">
          <h3>No brightness pattern records</h3>
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
      `;const t=P(this.activePatternIndex,0,e.brightness_patterns.length-1),i=e.brightness_patterns[t],s=is(i.order);return o`
      <section class="card wide-card">
        <h3>Brightness</h3>
        <div
          class="segmented"
          role="group"
          aria-label="Brightness distribution"
        >
          <button
            class=${e.brightness_gradient?"":"selected"}
            type="button"
            aria-pressed=${!e.brightness_gradient}
            ?disabled=${this.disabled}
            @click=${()=>this.updateLayer({brightness_gradient:!1})}
          >
            Unified
          </button>
          <button
            class=${e.brightness_gradient?"selected":""}
            type="button"
            aria-pressed=${e.brightness_gradient}
            ?disabled=${this.disabled}
            @click=${()=>this.updateLayer({brightness_gradient:!0})}
          >
            Gradient
          </button>
        </div>

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
              ${di.map(r=>o`<option value=${r}>
                    ${es[r]}
                  </option>`)}
              ${s?d:o`
                    <option value=${i.order} .selected=${!0}>
                      Raw order ${i.order} (0x${Ie(i.order)})
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
          ${this.rangeField("Scope low",i.scope_low,0,255,me(i.scope_low),r=>this.updateBrightnessPattern({scope_low:r}))}
          ${this.rangeField("Scope high",i.scope_high,0,255,me(i.scope_high),r=>this.updateBrightnessPattern({scope_high:r}))}
          ${this.rangeField("Changing speed",i.change_speed,0,255,me(i.change_speed),r=>this.updateBrightnessPattern({change_speed:r}))}
          ${this.rangeField("Brightest retention",i.brightest_retention,0,255,String(i.brightest_retention),r=>this.updateBrightnessPattern({brightest_retention:r}))}
          ${this.rangeField("Darkest retention",i.darkest_retention,0,255,String(i.darkest_retention),r=>this.updateBrightnessPattern({darkest_retention:r}))}
        </div>
      </section>
    `}renderMovement(e,t,i){const s=e[t];return o`
      <section class="card">
        <div class="card-heading">
          <h3>${i}</h3>
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
                  @change=${r=>{const a=Number(r.target.value);this.updateMovement(t,{direction:a},`${i} direction ${Mt[a]}.`)}}
                >
                  ${Object.entries(Mt).map(([r,a])=>o`<option value=${r}>${a}</option>`)}
                </select>
              </label>
              ${this.rangeField("Speed",s.speed,0,255,me(s.speed),r=>this.updateMovement(t,{speed:r},`${i} speed ${ui(r)} per cent.`))}
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
          <h3>Priority</h3>
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
    `}rangeField(e,t,i,s,r,a){return o`
      <label class="range-field">
        <span>${e}</span>
        <input
          type="range"
          min=${i}
          max=${s}
          .value=${String(P(t,i,s))}
          aria-label=${e}
          ?disabled=${this.disabled}
          @input=${l=>a(Number(l.target.value))}
        />
        <output aria-label="${e} value">${r}</output>
      </label>
    `}byteNumberField(e,t,i){return this.numberField(e,t,0,255,i)}numberField(e,t,i,s,r){return o`
      <label class="field">
        <span>${e}</span>
        <input
          type="number"
          min=${i}
          max=${s}
          .value=${String(t)}
          ?disabled=${this.disabled}
          @change=${a=>r(P(Number(a.target.value),i,s))}
        />
      </label>
    `}hexByteField(e,t,i,s=255){return o`
      <label class="field">
        <span>${e}</span>
        <input
          type="text"
          inputmode="text"
          spellcheck="false"
          .value=${Ie(t)}
          ?disabled=${this.disabled}
          @change=${r=>{const a=r.target,l=ss(a.value);if(l===void 0){a.setCustomValidity("Enter one byte from 00 to FF."),a.reportValidity();return}if((l&~s)!==0){a.setCustomValidity(`Known flag bits are controlled elsewhere. Allowed mask: ${Ie(s)}.`),a.reportValidity();return}a.setCustomValidity(""),i(l)}}
        />
      </label>
    `}updateLayer(e){if(!this.content||this.disabled)return;const t=this.content.layers.map((i,s)=>s===this.activeLayerIndex?F({...i,...e}):F(i));this.emitContent({kind:"advanced",layers:t})}updateSelection(e){this.updateLayer({selection:{...this.activeLayer.selection,...e}})}updateBrightnessPattern(e){const t=this.activeLayer.brightness_patterns.map((i,s)=>s===this.activePatternIndex?{...i,...e}:{...i});this.updateLayer({brightness_patterns:t})}updateMovement(e,t,i){this.updateLayer({[e]:{...this.activeLayer[e],...t}}),i&&(this.movementAnnouncement=i)}addLayer(){if(!this.content||this.disabled||this.content.layers.length>=ae)return;const e=[...this.content.layers.map(F),li()];this.installContent({kind:"advanced",layers:e}),this.activeLayerIndex=e.length-1,this.activePatternIndex=0,this.layerActionsIndex=void 0,this.focusActiveTab()}copyLayer(){if(!this.content||this.disabled||this.content.layers.length>=ae)return;const e=this.content.layers.map(F);e.splice(this.activeLayerIndex+1,0,F(this.activeLayer)),this.installContent({kind:"advanced",layers:e}),this.activeLayerIndex+=1,this.activePatternIndex=0,this.layerActionsIndex=this.activeLayerIndex,this.focusActiveTab()}deleteLayer(){if(!this.content||this.disabled||this.content.layers.length===1)return;const e=this.content.layers.filter((t,i)=>i!==this.activeLayerIndex).map(F);this.activeLayerIndex=Math.min(this.activeLayerIndex,e.length-1),this.activePatternIndex=0,this.layerActionsIndex=void 0,this.emitContent({kind:"advanced",layers:e}),this.focusActiveTab()}reorderLayer(e,t){if(!this.content||this.disabled||e<0||e>=this.content.layers.length||t<0||t>=this.content.layers.length||e===t)return;const i=this.content.layers.map(F),[s]=i.splice(e,1);i.splice(t,0,s),this.activeLayerIndex=Ne(this.activeLayerIndex,e,t),this.layerActionsIndex!==void 0&&(this.layerActionsIndex=Ne(this.layerActionsIndex,e,t)),this.emitContent({kind:"advanced",layers:i})}addBrightnessPattern(){if(this.disabled||this.activeLayer.brightness_patterns.length>=3)return;const e=[...this.activeLayer.brightness_patterns.map(t=>({...t})),ci()];this.activePatternIndex=e.length-1,this.updateLayer({brightness_patterns:e})}deleteBrightnessPattern(){if(this.disabled||this.activeLayer.brightness_patterns.length===1)return;const e=this.activeLayer.brightness_patterns.filter((t,i)=>i!==this.activePatternIndex).map(t=>({...t}));this.activePatternIndex=Math.min(this.activePatternIndex,e.length-1),this.updateLayer({brightness_patterns:e})}selectLayer(e){if(e===this.activeLayerIndex){this.layerActionsIndex=this.layerActionsIndex===e?void 0:e;return}this.activeLayerIndex=e,this.activePatternIndex=0,this.layerActionsIndex=e}patternTabKeyPressed(e,t){const i=this.activeLayer.brightness_patterns.length;let s;t.key==="ArrowLeft"?s=e===0?i-1:e-1:t.key==="ArrowRight"?s=e===i-1?0:e+1:t.key==="Home"?s=0:t.key==="End"&&(s=i-1),s!==void 0&&(t.preventDefault(),this.activePatternIndex=s,this.updateComplete.then(()=>{this.shadowRoot?.querySelectorAll(".pattern-tabs button")[s]?.focus()}))}focusActiveTab(){this.updateComplete.then(()=>{this.shadowRoot?.querySelector("govee-reorderable-strip")?.focusItem(this.activeLayerIndex)})}excessChanged(e){const t=e.value.replace(/\s+/g,"").toLowerCase();if(!/^(?:[0-9a-f]{2})*$/.test(t)){e.setCustomValidity("Enter an even number of hexadecimal digits."),e.reportValidity();return}e.setCustomValidity(""),this.updateLayer({excess:t})}emitContent(e){this.dispatchEvent(new CustomEvent("content-changed",{detail:{content:e},bubbles:!0,composed:!0}))}installContent(e){this.content=e,this.emitContent(e)}static{this.styles=[j,Ee,pt,ft,ni,E`
    :host {
      display: block;
      --area-trim: var(--warning-color, #f4c542);
    }

    h3,
    p {
      margin-top: 0;
    }

    h3 {
      margin-bottom: 16px;
      font-size: 16px;
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
    .priority-row button,
    .segmented button {
      flex: 0 0 auto;
      padding: 8px 14px;
      border: 1px solid var(--studio-border);
      border-radius: 8px;
      color: var(--primary-text-color);
      background: var(--studio-card);
      cursor: pointer;
    }

    .pattern-tabs button.selected,
    .priority-row button.selected,
    .segmented button.selected {
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

    .selection-controls h4 {
      margin: 0 0 4px;
      color: var(--primary-text-color);
      font-size: 15px;
    }

    .range-field {
      grid-template-columns: minmax(112px, auto) minmax(100px, 1fr) 74px;
      font-variant-numeric: tabular-nums;
    }

    .segmented,
    .priority-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .segmented button {
      flex: 1;
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
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 44px;
      margin-top: 12px;
      color: var(--primary-text-color);
      font-size: 13px;
      font-weight: 600;
    }

    .check-field input {
      width: 20px;
      height: 20px;
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
  `]}}ie([b({attribute:!1})],X.prototype,"content");ie([b({type:Boolean})],X.prototype,"disabled");ie([b({type:Number})],X.prototype,"segmentCount");ie([p()],X.prototype,"activeLayerIndex");ie([p()],X.prototype,"activePatternIndex");ie([p()],X.prototype,"movementAnnouncement");ie([p()],X.prototype,"layerActionsIndex");function Ge(){return{kind:"advanced",layers:[li()]}}function Me(n){return{kind:"advanced",layers:n.layers.map(F)}}function Ke(n){return{...n,template:{...n.template},effect:{layers:Me({layers:n.effect.layers}).layers}}}function li(){return{area:{start_tenths:0,width_tenths:10},selection:{type:0,param_1:0,param_2:1},brightness_gradient:!1,brightness_patterns:[ci()],distribution:{method:1,backwards:!1},colour_speed:128,colour_retention:20,palette:[[255,0,0],[0,0,255]],selected_movement:Bt(),overall_movement:Bt(),priority:0,unknown_flags:0,excess:""}}function ci(){return{scope_high:255,scope_low:0,order:0,change_speed:128,brightest_retention:20,darkest_retention:20}}function Bt(){return{enabled:!1,enter_exit:!1,direction:0,distance:1,speed:128,unknown_flags:0}}function F(n){return{...n,area:{...n.area},selection:{...n.selection},brightness_patterns:n.brightness_patterns.map(e=>({...e})),distribution:{...n.distribution},palette:n.palette.map(e=>[...e]),selected_movement:{...n.selected_movement},overall_movement:{...n.overall_movement}}}function ts(n){return oi.includes(n)}function is(n){return di.includes(n)}function ui(n){return Math.round(P(n,0,255)/255*100)}function me(n){return`${ui(n)}% · ${n}`}function Ie(n){return n.toString(16).padStart(2,"0").toUpperCase()}function ss(n){const e=n.trim().replace(/^0x/i,"");if(/^[0-9a-f]{1,2}$/i.test(e))return Number.parseInt(e,16)}function ns(n,e,t,i){const s=n*10/e;return(n+1)*10/e>t&&s<i}function Rt(n,e,t,i){if(n==="Home")return t;if(n==="End")return i;if(n==="ArrowLeft"||n==="ArrowDown")return P(e-1,t,i);if(n==="ArrowRight"||n==="ArrowUp")return P(e+1,t,i)}function P(n,e,t){return Math.min(t,Math.max(e,Math.round(n)))}customElements.get("govee-advanced-effect-editor")||customElements.define("govee-advanced-effect-editor",X);const rs=1,hi=1,as=1,N=128,se=65536,pi=512,fi=256,mi=32,gi=128,bi=512,w=255,os=64,ds=262144,Ot=16,ls=4096,cs=16384,V=1024,Xe=16384,mt=Number.MAX_SAFE_INTEGER,us=4335,hs=232,ps=253;function fs(n){const e=f(n,"editor info"),t=f(e.limits,"editor limits");return{api_version:h(e.api_version,"API version",1),effect_schema_version:h(e.effect_schema_version,"effect schema version",1),compiler_version:h(e.compiler_version,"compiler version",1),limits:{effect_name:U(t.effect_name,N,"effect-name limit"),effect_document_bytes:U(t.effect_document_bytes,se,"effect-document limit"),devices:U(t.devices,pi,"device limit"),library_items:U(t.library_items,fi,"library-item limit"),drafts_per_owner:U(t.drafts_per_owner,mi,"draft limit"),deployment_records:U(t.deployment_records,gi,"deployment limit"),scene_catalogue_entries:U(t.scene_catalogue_entries,bi,"scene catalogue limit")}}}function ms(n){const e=k(n,"devices",pi).map((t,i)=>{const s=f(t,`devices[${i}]`),r=f(s.custom_effects,`devices[${i}].custom_effects`);return{config_entry_id:v(s.config_entry_id,`devices[${i}].config_entry_id`,w),model:v(s.model,`devices[${i}].model`,w),display_name:v(s.display_name,`devices[${i}].display_name`,w),segment_count:h(s.segment_count,`devices[${i}].segment_count`,0,65535),custom_effects:{painted:ce(r.painted,"painted capability"),single:ce(r.single,"single capability"),multi:ce(r.multi,"multi capability"),advanced:ce(r.advanced,"advanced capability")},readback:v(s.readback,`devices[${i}].readback`,w)}});return Ve(e,t=>t.config_entry_id,"device IDs"),e}function gs(n){re(n,"custom-effect catalogue",se);const e=f(n,"custom-effect catalogue"),t=f(e.limits,"custom-effect limits"),i=f(e.apply,"custom-effect Apply capabilities");return{schema_version:h(e.schema_version,"catalogue schema",1),sku:ne(e.sku,"catalogue SKU"),painted_effects:k(e.painted_effects,"painted-effect templates",V).map((s,r)=>{const a=f(s,`painted-effect templates[${r}]`);return{id:st(a.id,["cycle","clockwise","counter_clockwise","twinkle","gradient","breathe"],"painted-effect ID"),label:v(a.label,"painted-effect label",N)}}),effects:k(e.effects,"custom-effect templates",V).map((s,r)=>{const a=f(s,`custom-effect templates[${r}]`),l=k(a.variations,"template variations",V);if(l.length===0)throw new Error("Malformed Effect Studio server payload: custom-effect template has no variations.");return{id:v(a.id,"template ID",w),label:v(a.label,"template label",N),family:h(a.family,"template family",0,255),variations:l.map((c,u)=>{const m=f(c,`custom-effect templates[${r}].variations[${u}]`);return{id:v(m.id,"variation ID",w),label:v(m.label,"variation label",N),variant:h(m.variant,"template variant",0,255)}}),supports_multi:ee(a.supports_multi,"Multi support"),rate:st(a.rate,["speed","sensitivity"],"rate parameter")}}),limits:{palette_min:h(t.palette_min,"minimum palette",1,255),palette_max:h(t.palette_max,"maximum palette",1,255),multi_max:h(t.multi_max,"maximum Multi effects",1,255)},apply:{single:ce(i.single,"Single Apply capability"),multi:ce(i.multi,"Multi Apply capability")}}}function Ft(n){const e=f(n,"library snapshot"),t={library_revision:H(e.library_revision,"library revision",0),items:k(e.items,"library items",fi).map((i,s)=>{const r=f(i,`library items[${s}]`),a=r.template===void 0?void 0:Be(r.template,`library items[${s}].template`);return{id:v(r.id,"library item ID",w),revision:H(r.revision,"library item revision",1),name:v(r.name,"library item name",N),kind:v(r.kind,"library item kind",w),...a?{template:a}:{}}})};return Ve(t.items,i=>i.id,"library item IDs"),t}function Pe(n){re(n,"library item",se);const e=f(n,"library item"),t=e.target_hint===void 0?void 0:f(e.target_hint,"target hint");return{schema_version:U(e.schema_version,hi,"effect schema version"),id:v(e.id,"effect ID",w),revision:H(e.revision,"effect revision",1),name:v(e.name,"effect name",N),content:vi(e.content),provenance:Kt(e.provenance,"effect provenance"),extensions:Kt(e.extensions,"effect extensions"),...t?{target_hint:{model:t.model===null?null:v(t.model,"target model",w),segment_count:t.segment_count===null?null:h(t.segment_count,"target segment count",1,65535)}}:{}}}function bs(n){const e=k(n,"draft summaries",mi).map((t,i)=>{const s=f(t,`draft summaries[${i}]`);return{id:v(s.id,"draft ID",w),revision:H(s.revision,"draft revision",1),name:v(s.name,"draft name",N),updated_at:bt(s.updated_at,"draft timestamp"),selected_config_entry_id:we(s.selected_config_entry_id,"draft config entry ID")}});return Ve(e,t=>t.id,"draft IDs"),e}function Ye(n){const e=f(n,"effect draft");return{id:v(e.id,"draft ID",w),owner_id:v(e.owner_id,"draft owner",w),revision:H(e.revision,"draft revision",1),item:Pe(e.item),updated_at:bt(e.updated_at,"draft timestamp"),selected_config_entry_id:we(e.selected_config_entry_id,"draft config entry ID"),base_item_id:we(e.base_item_id,"draft base item ID"),base_item_revision:e.base_item_revision===null?null:H(e.base_item_revision,"draft base item revision",1)}}function tt(n){const e=f(n,"deployment"),t=ne(e.phase,"deployment phase");t!=="pending"&&t!=="uploading"&&t!=="verifying"&&t!=="confirmed"&&t!=="failed"&&t!=="interrupted"&&t!=="unknown"&&g("deployment phase is invalid");const i={operation_id:v(e.operation_id,"deployment operation ID",w),config_entry_id:v(e.config_entry_id,"deployment config entry ID",w),diy_code:h(e.diy_code,"deployment DIY code",0,65535),phase:t,updated_at:bt(e.updated_at,"deployment timestamp"),item_id:we(e.item_id,"deployment item ID"),item_revision:e.item_revision===null?null:H(e.item_revision,"deployment item revision",1),error_code:we(e.error_code,"deployment error code"),progress_current:h(e.progress_current,"deployment progress",0,1024),progress_total:h(e.progress_total,"deployment progress total",0,1024)};return i.progress_current>i.progress_total&&g("deployment progress exceeds its total"),i}function vs(n){const e=f(n,"deployment snapshot"),t={revision:H(e.revision,"deployment revision",0),deployments:k(e.deployments,"deployments",gi).map(tt)};return Ve(t.deployments,i=>i.operation_id,"deployment operation IDs"),t}function ys(n){re(n,"scene catalogue",ds,cs);const e=f(n,"scene catalogue");return{schema_version:h(e.schema_version,"scene catalogue schema",1),sku:v(e.sku,"scene catalogue SKU",w),enabled:ee(e.enabled,"scene catalogue enabled"),categories:k(e.categories,"scene categories",V).map((t,i)=>{const s=f(t,`scene categories[${i}]`);return{id:h(s.id,"scene category ID",0,65535),name:v(s.name,"scene category name",N)}}),scenes:k(e.scenes,"scenes",bi).map(gt)}}function $s(n){const e=f(n,"scene detail");re({scene:e.scene,content:e.content},"scene detail",se);const t=vi(e.content);return t.kind!=="scene_builtin"&&t.kind!=="scene_palette"&&t.kind!=="scene_layered"&&g("scene detail content is unsupported"),{scene:gt(e.scene),content:t}}function vi(n){re(n,"effect content",se);const e=f(n,"effect content"),t=v(e.kind,"effect content kind",w);switch(t){case"h617a_painted":return{kind:t,effect:st(e.effect,["cycle","clockwise","counter_clockwise","twinkle","gradient","breathe"],"painted effect"),speed:h(e.speed,"painted speed",0,100),brightness:h(e.brightness,"painted brightness",0,100),background:xe(e.background,"painted background"),groups:k(e.groups,"paint groups",15).map((i,s)=>{const r=f(i,`paint groups[${s}]`);return{fill:xe(r.fill,"paint-group fill"),segments:k(r.segments,"painted segments",15).map(a=>h(a,"painted segment",0,14))}})};case"h617a_single":return{kind:t,family:h(e.family,"Single family",0,254),variant:h(e.variant,"Single variant",0,255),speed:h(e.speed,"Single speed",0,100),palette:Re(e.palette,"Single palette",8)};case"h617a_multi":return{kind:t,effects:k(e.effects,"Multi effects",4).map((i,s)=>{const r=f(i,`Multi effects[${s}]`);return{family:h(r.family,"Multi family",0,254),variant:h(r.variant,"Multi variant",0,255)}}),speed:h(e.speed,"Multi speed",0,100),palette:Re(e.palette,"Multi palette",8)};case"advanced":return{kind:t,layers:Ut(e.layers,"Advanced layers")};case"scene_builtin":return{kind:t,template:Be(e.template,"scene template"),speed_index:it(e.speed_index,"scene speed index",0,255)};case"scene_palette":return _s(e);case"scene_layered":{const i=f(e.effect,"layered scene effect"),s=yi(e.trailing_padding,"layered scene trailing padding");return{kind:t,template:Be(e.template,"layered scene template"),effect:{layers:Ut(i.layers,"layered scene layers")},speed_index:it(e.speed_index,"layered scene speed index",0,255),raw_param:$i(e.raw_param,"layered scene raw parameter"),...s===void 0?{}:{trailing_padding:s}}}default:{const{kind:i,...s}=e;return{kind:"opaque",source_kind:t,body:s}}}}function yi(n,e){if(n!==void 0)return h(n,e,0,us)}function _s(n){const t=h(n.layout,"palette scene layout",0,1)===0?0:1,i=k(n.steps,"palette scene steps",255).map((l,c)=>{const u=f(l,`palette scene steps[${c}]`),m=t===0?(u.inline_colour!==null&&g(`palette scene steps[${c}].inline_colour must be null for layout 0`),null):xe(u.inline_colour,`palette scene steps[${c}].inline_colour`);return{value:h(u.value,`palette scene steps[${c}].value`,0,65535),colour:xe(u.colour,`palette scene steps[${c}].colour`),inline_colour:m}}),s=Re(n.palette,"palette scene shared palette",255,!0);t===1&&s.length!==0&&g("palette scene layout 1 must not have a shared palette");let r;n.config_flags!==void 0&&(r=h(n.config_flags,"palette scene config flags",0,255),r&-9&&g("palette scene config flags must only set reserved config bits"));const a=yi(n.trailing_padding,"palette scene trailing padding");return{kind:"scene_palette",template:Be(n.template,"palette scene template"),layout:t,brightness_flag:ee(n.brightness_flag,"palette scene brightness flag"),steps:i,palette:s,speed_index:it(n.speed_index,"palette scene speed index",0,255),...r===void 0?{}:{config_flags:r},...a===void 0?{}:{trailing_padding:a}}}function ge(n){return n.kind!=="opaque"?n:(re(n.body,"opaque content",se),{...n.body,kind:v(n.source_kind,"opaque source kind",w)})}function gt(n){const e=f(n,"scene"),t=ne(e.parameter_kind,"scene parameter kind");t!=="none"&&t!=="palette"&&t!=="layers"&&t!=="opaque"&&g("scene parameter kind is invalid");const i=e.speed===null?null:(()=>{const s=f(e.speed,"scene speed");return{option_count:h(s.option_count,"scene speed option count",1,256),default_index:h(s.default_index,"scene default speed",0,255)}})();return{scene_id:h(e.scene_id,"scene ID",0,65535),effect_id:h(e.effect_id,"scene effect ID",0,65535),category_id:h(e.category_id,"scene category ID",0,65535),category:v(e.category,"scene category",N),name:v(e.name,"scene name",N),variant:ws(e.variant,"scene variant",w),display_name:v(e.display_name,"scene display name",N),scene_type:h(e.scene_type,"scene type",0,255),parameter_kind:t,speed:i}}function Ut(n,e){return k(n,e,255).map((t,i)=>xs(t,`${e}[${i}]`))}function xs(n,e){const t=f(n,e),i=f(t.area,`${e}.area`),s=f(t.selection,`${e}.selection`),r=f(t.distribution,`${e}.distribution`);return{area:{start_tenths:h(i.start_tenths,`${e}.area.start_tenths`,0,15),width_tenths:h(i.width_tenths,`${e}.area.width_tenths`,0,15)},selection:{type:A(s.type,`${e}.selection.type`),param_1:A(s.param_1,`${e}.selection.param_1`),param_2:A(s.param_2,`${e}.selection.param_2`)},brightness_gradient:ee(t.brightness_gradient,`${e}.brightness_gradient`),brightness_patterns:k(t.brightness_patterns,`${e}.brightness_patterns`,255).map((a,l)=>{const c=f(a,`${e}.brightness_patterns[${l}]`);return{scope_high:A(c.scope_high,"brightness scope high"),scope_low:A(c.scope_low,"brightness scope low"),order:A(c.order,"brightness order"),change_speed:A(c.change_speed,"brightness change speed"),brightest_retention:A(c.brightest_retention,"brightest retention"),darkest_retention:A(c.darkest_retention,"darkest retention")}}),distribution:{method:h(r.method,`${e}.distribution.method`,0,127),backwards:ee(r.backwards,`${e}.distribution.backwards`)},colour_speed:A(t.colour_speed,`${e}.colour_speed`),colour_retention:A(t.colour_retention,`${e}.colour_retention`),palette:Re(t.palette,`${e}.palette`,255,!0),selected_movement:qt(t.selected_movement,`${e}.selected_movement`),overall_movement:qt(t.overall_movement,`${e}.overall_movement`),priority:A(t.priority,`${e}.priority`),unknown_flags:_i(t.unknown_flags,ps,`${e}.unknown_flags`),excess:$i(t.excess,`${e}.excess`)}}function qt(n,e){const t=f(n,e);return{enabled:ee(t.enabled,`${e}.enabled`),enter_exit:ee(t.enter_exit,`${e}.enter_exit`),direction:h(t.direction,`${e}.direction`,0,3),distance:A(t.distance,`${e}.distance`),speed:A(t.speed,`${e}.speed`),unknown_flags:_i(t.unknown_flags,hs,`${e}.unknown_flags`)}}function Be(n,e){const t=f(n,e);return{sku:v(t.sku,`${e}.sku`,w),scene_id:h(t.scene_id,`${e}.scene_id`,0,65535),effect_id:h(t.effect_id,`${e}.effect_id`,0,65535),catalogue_schema_version:h(t.catalogue_schema_version,`${e}.catalogue_schema_version`,1,mt)}}function Re(n,e,t,i=!1){const s=k(n,e,t);return!i&&s.length===0&&g(`${e} must not be empty`),s.map((r,a)=>xe(r,`${e}[${a}]`))}function xe(n,e){const t=k(n,e,3);return t.length!==3&&g(`${e} must contain three channels`),t.map(i=>h(i,`${e} channel`,0,255))}function ce(n,e){return n!=="supported"&&n!=="unsupported"&&n!=="evidence_gap"&&g(`${e} is invalid`),n}function Kt(n,e){return re(n,e,se),f(n,e)}function we(n,e){return n===null?null:v(n,e,w)}function bt(n,e){const t=v(n,e,os);return(!/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(t)||Number.isNaN(Date.parse(t)))&&g(`${e} must be an ISO 8601 timestamp with a UTC offset`),t}function v(n,e,t){const i=ne(n,e);return(i.length===0||i.length>t)&&g(`${e} must contain 1 to ${t} characters`),i}function ws(n,e,t){const i=ne(n,e);return i.length>t&&g(`${e} must not exceed ${t} characters`),i}function $i(n,e){const t=ne(n,e);return(t.length%2!==0||!/^[0-9a-f]*$/i.test(t))&&g(`${e} must be hexadecimal`),t}function ne(n,e){return typeof n!="string"&&g(`${e} must be a string`),n}function ee(n,e){return typeof n!="boolean"&&g(`${e} must be a boolean`),n}function h(n,e,t,i=mt){return(typeof n!="number"||!Number.isSafeInteger(n)||n<t||n>i)&&g(`${e} must be an integer from ${t} to ${i}`),n}function H(n,e,t){return h(n,e,t,mt)}function U(n,e,t){const i=h(n,t,1);return i!==e&&g(`${t} is incompatible with this editor`),i}function it(n,e,t,i){return n===null?null:h(n,e,t,i)}function A(n,e){return h(n,e,0,255)}function _i(n,e,t){const i=A(n,t);return i&~e&&g(`${t} must only set reserved bits, not bits explicit fields carry`),i}function st(n,e,t){const i=ne(n,t);return e.includes(i)||g(`${t} is invalid`),i}function f(n,e){return(typeof n!="object"||n===null||Array.isArray(n))&&g(`${e} must be an object`),n}function k(n,e,t){return Array.isArray(n)||g(`${e} must be an array`),n.length>t&&g(`${e} must not exceed ${t} items`),n}function Ve(n,e,t){const i=n.map(e);new Set(i).size!==i.length&&g(`${t} must be unique`)}function re(n,e,t,i=ls){let s=0;const r=(l,c,u)=>{if(s+=1,s>i&&g(`${e} must not exceed ${i} JSON values`),u>Ot&&g(`${e} must not exceed ${Ot} nested levels`),!(l===null||typeof l=="boolean")){if(typeof l=="number"){(!Number.isFinite(l)||Number.isInteger(l)&&!Number.isSafeInteger(l))&&g(`${c} must be a finite JSON number`);return}if(typeof l=="string"){l.length>Xe&&g(`${c} must not exceed ${Xe} characters`);return}if(Array.isArray(l)){l.length>V&&g(`${c} must not exceed ${V} items`),l.forEach((m,y)=>r(m,`${c}[${y}]`,u+1));return}if(typeof l=="object"&&l!==null){const m=Object.entries(l);m.length>V&&g(`${c} must not exceed ${V} fields`),m.forEach(([y,T])=>{y.length>Xe&&g(`${c} contains an oversized key`),r(T,`${c}.${y}`,u+1)});return}g(`${c} contains a non-JSON value`)}};r(n,e,0);const a=JSON.stringify(n);a===void 0&&g(`${e} must contain JSON values`),new TextEncoder().encode(a).byteLength>t&&g(`${e} must not exceed ${t} bytes`)}function g(n){throw new Error(`Malformed Effect Studio server payload: ${n}.`)}function ks(n){return n.api_version===rs&&n.effect_schema_version===hi&&n.compiler_version===as}const We="ha_govee_led_ble/editor";class Es{constructor(e){this.hass=e}async info(){return fs(await this.call("info"))}async devices(){const e=await this.call("devices");return ms(C(e,"devices"))}async customCatalogue(){const e=await this.call("custom/catalogue");return gs(C(e,"catalogue"))}async library(){return Ft(await this.call("library/list"))}async item(e){const t=await this.call("library/get",{item_id:e});return Pe(C(t,"item"))}async createItem(e,t,i){const s=await this.call("library/create",{name:e,content:ge(t),expected_library_revision:i});return{item:Pe(C(s,"item")),library_revision:Je(s)}}async updateItem(e,t,i,s){const r=await this.call("library/update",{item_id:e.id,name:t,content:ge(i),expected_revision:e.revision,expected_library_revision:s});return{item:Pe(C(r,"item")),library_revision:Je(r)}}async deleteItem(e,t){const i=await this.call("library/delete",{item_id:e.id,expected_revision:e.revision,expected_library_revision:t});return Je(i)}async drafts(){const e=await this.call("draft/list");return bs(C(e,"drafts"))}async draft(e){const t=await this.call("draft/get",{draft_id:e});return Ye(C(t,"draft"))}async createDraft(e,t,i,s){const r=await this.call("draft/create",{name:e,content:ge(t),updated_at:new Date().toISOString(),selected_config_entry_id:i,...s?{base_item_id:s.id,base_item_revision:s.revision}:{}});return Ye(C(r,"draft"))}async updateDraft(e,t,i,s){const r=await this.call("draft/update",{draft_id:e.id,expected_revision:e.revision,name:t,content:ge(i),updated_at:new Date().toISOString(),selected_config_entry_id:s});return Ye(C(r,"draft"))}async deleteDraft(e){await this.call("draft/delete",{draft_id:e.id,expected_revision:e.revision})}async applySaved(e,t){const i=await this.call("apply",{config_entry_id:e,item_id:t.id,revision:t.revision,updated_at:new Date().toISOString()});return tt(C(i,"deployment"))}async applySnapshot(e,t,i){const s=await this.call("apply_snapshot",{config_entry_id:e,name:t,content:ge(i),updated_at:new Date().toISOString()});return tt(C(s,"deployment"))}async sceneCatalogue(e){const t=await this.call("scene/catalogue/list",{config_entry_id:e});return ys(C(t,"catalogue"))}sceneDetail(e,t,i){return this.call("scene/catalogue/get",{config_entry_id:e,scene_id:t,effect_id:i}).then($s)}async applyScene(e,t,i){const s=await this.call("scene/apply",{config_entry_id:e,scene_id:t.scene_id,effect_id:t.effect_id,...i===null?{}:{speed_index:i}}),r=gt(C(s,"scene")),a=C(s,"readback");if(a!=="scene_identity_only")throw new Error("Malformed Effect Studio server payload: scene Apply readback is invalid.");const l=C(s,"speed_index");if(l!==null&&(typeof l!="number"||!Number.isSafeInteger(l)||l<0||l>255))throw new Error("Malformed Effect Studio server payload: scene Apply speed is invalid.");return{scene:r,speed_index:l,readback:a}}subscribeLibrary(e,t){return this.hass.connection.subscribeMessage(i=>{try{e(Ft(i))}catch(s){t?.(Vt(s))}},{type:`${We}/library/subscribe`})}subscribeDeployments(e,t){return this.hass.connection.subscribeMessage(i=>{try{e(vs(i))}catch(s){t?.(Vt(s))}},{type:`${We}/deployment/subscribe`})}call(e,t={}){return this.hass.callWS({type:`${We}/${e}`,...t})}}function C(n,e){if(typeof n!="object"||n===null||Array.isArray(n))throw new Error("Malformed Effect Studio server payload: response must be an object.");if(!(e in n))throw new Error(`Malformed Effect Studio server payload: response is missing ${e}.`);return n[e]}function Je(n){const e=C(n,"library_revision");if(typeof e!="number"||!Number.isSafeInteger(e)||e<0)throw new Error("Malformed Effect Studio server payload: library revision is invalid.");return e}function Vt(n){return n instanceof Error?n:new Error("Malformed Effect Studio server payload.")}var Ss=Object.defineProperty,xi=(n,e,t,i)=>{for(var s=void 0,r=n.length-1,a;r>=0;r--)(a=n[r])&&(s=a(e,t,s)||s);return s&&Ss(e,t,s),s};const nt=17,wi="ha_govee_led_ble/effect_studio/recent_colours",Le=[[255,69,58],[255,159,10],[255,214,10],[48,209,88],[99,230,226],[100,210,255],[10,132,255],[94,92,230],[191,90,242],[255,45,85],[172,142,104],[255,255,255],[174,174,178],[99,99,102],[28,28,30],[255,127,0],[139,0,255]];let ue=Is();class vt extends D{constructor(){super(...arguments),this.colour=[255,255,255],this.disabled=!1}render(){return o`
      <div class="preset-grid">
        ${ue.map(e=>o`
            <button
              type="button"
              style="--preset-colour: ${x(e)}"
              aria-label="Use ${x(e)}"
              ?disabled=${this.disabled}
              @click=${()=>this.commit(e)}
            ></button>
          `)}
        <label
          class="custom-colour"
          style="--custom-colour: ${x(this.colour)}"
        >
          <input
            type="color"
            aria-label="Custom colour"
            .value=${x(this.colour)}
            ?disabled=${this.disabled}
            @input=${e=>this.emit("colour-changing",Dt(e.target.value))}
            @change=${e=>this.commit(Dt(e.target.value))}
          />
        </label>
      </div>
    `}commit(e){As(e),this.emit("colour-changed",e)}emit(e,t){this.colour=[...t],this.dispatchEvent(new CustomEvent(e,{detail:{colour:[...t]},bubbles:!0,composed:!0}))}static{this.styles=[j,E`
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
  `]}}xi([b({attribute:!1})],vt.prototype,"colour");xi([b({type:Boolean})],vt.prototype,"disabled");function Cs(n){return[...ue[n%ue.length]]}function Is(){const n=localStorage.getItem(wi);if(!n)return z(Le);let e;try{e=JSON.parse(n)}catch(i){if(i instanceof SyntaxError)return z(Le);throw i}if(!Array.isArray(e))return z(Le);const t=e.filter(Ps).map(i=>[...i]).slice(0,nt);return ki(t)}function As(n){const e=x(n);ue=ki([[...n],...ue.filter(t=>x(t)!==e)]),localStorage.setItem(wi,JSON.stringify(ue))}function ki(n){const e=z(n);for(const t of Le)e.length>=nt||e.some(i=>x(i)===x(t))||e.push([...t]);return e.slice(0,nt)}function Ps(n){return Array.isArray(n)&&n.length===3&&n.every(e=>Number.isInteger(e)&&e>=0&&e<=255)}customElements.get("govee-colour-picker")||customElements.define("govee-colour-picker",vt);var Ls=Object.defineProperty,B=(n,e,t,i)=>{for(var s=void 0,r=n.length-1,a;r>=0;r--)(a=n[r])&&(s=a(e,t,s)||s);return s&&Ls(e,t,s),s};class M extends D{constructor(){super(...arguments),this.palette=[],this.minColours=1,this.maxColours=8,this.disabled=!1,this.persistentPicker=!1,this.ariaLabel="Colours",this.itemName="colour",this.windowPointerDown=e=>{this.editingIndex!==void 0&&!e.composedPath().includes(this)&&(this.editingIndex=void 0)}}connectedCallback(){super.connectedCallback(),window.addEventListener("pointerdown",this.windowPointerDown)}disconnectedCallback(){window.removeEventListener("pointerdown",this.windowPointerDown),super.disconnectedCallback()}willUpdate(e){e.has("palette")&&this.editingIndex!==void 0&&this.editingIndex>=this.palette.length&&(this.editingIndex=void 0)}render(){const e=this.persistentPicker?this.selectedIndex:this.editingIndex,t=this.palette.map((i,s)=>({key:`${s}-${x(i)}`,label:`${zt(this.itemName)} ${s+1}`,ariaLabel:this.itemAriaLabel(i,s),colour:x(i),removeReady:!this.persistentPicker&&this.editingIndex===s&&this.palette.length>this.minColours,disabled:this.disabled}));return o`
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
    `}itemAriaLabel(e,t){const i=`${zt(this.itemName)} ${t+1}`;return this.persistentPicker?`${i}, ${x(e)}${t===this.selectedIndex?", selected":""}`:this.editingIndex===t&&this.palette.length>this.minColours?`Remove colour ${t+1}`:`Edit colour ${t+1}, ${x(e)}. Drag to reorder or use arrow keys.`}renderPicker(e,t){return o`
      <govee-colour-picker
        .colour=${t}
        .disabled=${this.disabled}
        @colour-changing=${i=>this.updateColour(e,i.detail.colour)}
        @colour-changed=${i=>this.commitColour(e,i.detail.colour)}
      ></govee-colour-picker>
    `}commitColour(e,t){this.updateColour(e,t),!this.persistentPicker&&(this.editingIndex=void 0,this.focusSwatchAfterUpdate(e))}updateColour(e,t){const i=z(this.palette);i[e]=[...t],this.emitPalette(i)}addColour(){if(this.disabled||this.palette.length>=this.maxColours)return;const e=this.palette[this.palette.length-1]??Cs(this.palette.length),t=[...z(this.palette),[...e]],i=t.length-1;this.persistentPicker?this.selectColour(i,t[i]):this.editingIndex=i,this.emitPalette(t)}removeColour(e){if(this.disabled||this.palette.length<=this.minColours)return;const t=this.palette.filter((s,r)=>r!==e).map(s=>[...s]),i=Math.min(e,t.length-1);this.editingIndex=void 0,this.emitPalette(t),this.focusSwatchAfterUpdate(i)}reorder(e,t){if(this.disabled||e===t)return;const i=z(this.palette),[s]=i.splice(e,1);if(i.splice(t,0,s),this.editingIndex=this.editingIndex===e?t:Ne(this.editingIndex,e,t),this.persistentPicker){const r=Ne(this.selectedIndex,e,t);r!==void 0&&this.selectColour(r,i[r])}this.emitPalette(i)}focusSwatchAfterUpdate(e){this.updateComplete.then(()=>{this.shadowRoot?.querySelector("govee-reorderable-strip")?.focusItem(e)})}popoverKeyPressed(e,t){t.key==="Escape"&&(t.preventDefault(),t.stopPropagation(),this.editingIndex=void 0,this.focusSwatchAfterUpdate(e))}swatchClicked(e){if(this.persistentPicker){this.selectColour(e,this.palette[e]);return}if(this.editingIndex===e&&this.palette.length>this.minColours){this.removeColour(e);return}this.editingIndex=this.editingIndex===e?void 0:e}selectColour(e,t){this.selectedIndex=e,this.dispatchEvent(new CustomEvent("colour-selected",{detail:{index:e,colour:[...t]},bubbles:!0,composed:!0}))}emitPalette(e){this.palette=e,this.dispatchEvent(new CustomEvent("palette-changed",{detail:{palette:e},bubbles:!0,composed:!0}))}static{this.styles=[j,E`
    :host {
      display: block;
    }

    .persistent-picker {
      margin-top: var(--studio-section-gap);
      padding-top: var(--studio-section-gap);
      border-top: 1px solid var(--studio-border);
    }
  `]}}B([b({attribute:!1})],M.prototype,"palette");B([b({type:Number})],M.prototype,"minColours");B([b({type:Number})],M.prototype,"maxColours");B([b({type:Boolean})],M.prototype,"disabled");B([b({type:Boolean})],M.prototype,"persistentPicker");B([b({type:Number})],M.prototype,"selectedIndex");B([b()],M.prototype,"ariaLabel");B([b()],M.prototype,"itemName");B([p()],M.prototype,"editingIndex");function zt(n){return n.charAt(0).toUpperCase()+n.slice(1)}customElements.get("govee-palette-editor")||customElements.define("govee-palette-editor",M);var Ds=Object.defineProperty,yt=(n,e,t,i)=>{for(var s=void 0,r=n.length-1,a;r>=0;r--)(a=n[r])&&(s=a(e,t,s)||s);return s&&Ds(e,t,s),s};class ze extends D{constructor(){super(...arguments),this.disabled=!1}updated(){if(this.content){if(this.content.kind==="h617a_single"){const e=this.shadowRoot?.querySelector("select[data-single-variation]");e&&(e.value=String(this.content.variant));return}this.content.effects.forEach((e,t)=>{const i=this.effectFamily(e,!0),s=this.shadowRoot?.querySelector(`select[data-effect-index="${t}"]`),r=this.shadowRoot?.querySelector(`select[data-variation-index="${t}"]`);s&&(s.value=i?.id??`unknown:${e.family}`),r&&(r.value=String(e.variant))})}}render(){if(!this.content||!this.catalogue)return d;const e=this.content.kind==="h617a_single"&&this.effectFamily(this.content)?.rate==="sensitivity"?"Sensitivity":"Speed";return o`
      ${this.content.kind==="h617a_multi"?o`
            <section class="card effect-card">
              <h3>Effects</h3>
              ${this.renderSequence(this.content)}
            </section>
          `:d}

      <section class="card parameters-card">
        <h3>Parameters</h3>
        ${this.renderSingleVariation()}
        <div class="parameter-group">
          <h4>Colours</h4>
          ${this.renderPalette()}
        </div>
        <div class="parameter-group speed-group">
          <h4>${e}</h4>
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
      </section>
    `}renderSingleVariation(){if(!this.content||this.content.kind!=="h617a_single")return d;const e=this.content,i=this.effectFamily(e)?.variations??[],s=i.some(r=>r.variant===e.variant);return s&&i.length<=1?d:o`
      <div class="parameter-group">
        <label class="field">
          <span>Variation</span>
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
      </div>
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
        @palette-changed=${e=>{this.emitContent({...this.content,palette:z(e.detail.palette)})}}
      ></govee-palette-editor>
    `}effectFamilyChanged(e,t){const i=this.multiFamilies.find(r=>r.id===t),s=i?.variations[0];!i||!s||this.replaceEffect(e,{family:i.family,variant:s.variant})}effectVariationChanged(e,t){if(!this.content||this.content.kind!=="h617a_multi")return;const i=this.content.effects[e];i&&this.replaceEffect(e,{...i,variant:t})}replaceEffect(e,t){if(!this.content||this.content.kind!=="h617a_multi")return;const i=this.content.effects.map((s,r)=>r===e?t:s);this.emitContent({...this.content,effects:i})}addEffect(){if(!this.content||this.content.kind!=="h617a_multi")return;const e=this.multiFamilies[this.content.effects.length]??this.multiFamilies[0],t=e?.variations[0];if(!e||!t)return;const i=[...this.content.effects,{family:e.family,variant:t.variant}];this.emitContent({...this.content,effects:i})}removeEffect(e){if(!this.content||this.content.kind!=="h617a_multi")return;const t=this.content.effects.filter((i,s)=>s!==e);this.emitContent({...this.content,effects:t})}moveEffect(e,t){if(!this.content||this.content.kind!=="h617a_multi")return;const i=e+t;i<0||i>=this.content.effects.length||this.reorderEffect(e,i)}reorderEffect(e,t){if(!this.content||this.content.kind!=="h617a_multi"||e===t)return;const i=[...this.content.effects],[s]=i.splice(e,1);i.splice(t,0,s),this.emitContent({...this.content,effects:i})}effectDragStarted(e,t){this.draggedEffectIndex=e,t.dataTransfer?.setData("text/plain",String(e))}effectDropped(e,t){t.preventDefault(),this.draggedEffectIndex!==void 0&&(this.reorderEffect(this.draggedEffectIndex,e),this.draggedEffectIndex=void 0)}closeDetails(e){e.currentTarget.closest("details")?.removeAttribute("open")}effectFamily(e,t=!1){return(t?this.multiFamilies:this.catalogue?.effects)?.find(i=>i.family===e.family)}emitContent(e){this.dispatchEvent(new CustomEvent("content-changed",{detail:{content:e},bubbles:!0,composed:!0}))}static{this.styles=[j,Ee,ft,E`
    :host {
      display: block;
    }

    h3,
    h4,
    p {
      margin-top: 0;
    }

    h3 {
      margin-bottom: 14px;
      font-size: 16px;
    }

    h4 {
      margin-bottom: 12px;
      font-size: 14px;
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

    .parameter-group + .parameter-group {
      margin-top: 18px;
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

  `]}}yt([b({attribute:!1})],ze.prototype,"content");yt([b({attribute:!1})],ze.prototype,"catalogue");yt([b({type:Boolean})],ze.prototype,"disabled");customElements.get("govee-custom-effect-editor")||customElements.define("govee-custom-effect-editor",ze);var Ts=Object.defineProperty,Ei=(n,e,t,i)=>{for(var s=void 0,r=n.length-1,a;r>=0;r--)(a=n[r])&&(s=a(e,t,s)||s);return s&&Ts(e,t,s),s};class $t extends D{constructor(){super(...arguments),this.colours=[],this.disabled=!1}render(){return o`
      <section class="card" aria-labelledby="painted-segments-heading">
        <h3 id="painted-segments-heading">Painted segments</h3>
        <div class="segments">
          ${this.colours.map((e,t)=>o`
              <button
                type="button"
                data-segment=${t}
                style="--segment-colour: ${x(e)}"
                aria-label="Segment ${t+1}, ${x(e)}"
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
    `}pointerStarted(e,t){this.disabled||(t.preventDefault(),this.paintingPointerId=t.pointerId,this.lastPaintedSegment=e,t.currentTarget.setPointerCapture(t.pointerId),this.selectSegment(e))}pointerMoved(e){if(e.pointerId!==this.paintingPointerId||!this.shadowRoot)return;const t=this.shadowRoot.elementFromPoint(e.clientX,e.clientY)?.closest("[data-segment]"),i=Number(t?.dataset.segment);Number.isInteger(i)&&i!==this.lastPaintedSegment&&(this.lastPaintedSegment=i,this.selectSegment(i))}pointerFinished(e){if(e.pointerId!==this.paintingPointerId)return;const t=this.shadowRoot?.querySelector(`[data-segment="${this.lastPaintedSegment}"]`);t?.hasPointerCapture(e.pointerId)&&t.releasePointerCapture(e.pointerId),this.paintingPointerId=void 0,this.lastPaintedSegment=void 0}segmentClicked(e,t){!this.disabled&&t.detail===0&&this.selectSegment(e)}selectSegment(e){this.dispatchEvent(new CustomEvent("segment-selected",{detail:{index:e},bubbles:!0,composed:!0}))}static{this.styles=[j,Ee,E`
    :host {
      display: block;
    }

    h3 {
      margin: 0 0 14px;
      font-size: 16px;
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
  `]}}Ei([b({attribute:!1})],$t.prototype,"colours");Ei([b({type:Boolean})],$t.prototype,"disabled");customElements.get("govee-painted-segment-editor")||customElements.define("govee-painted-segment-editor",$t);var Ns=Object.defineProperty,I=(n,e,t,i)=>{for(var s=void 0,r=n.length-1,a;r>=0;r--)(a=n[r])&&(s=a(e,t,s)||s);return s&&Ns(e,t,s),s};class S extends D{constructor(){super(...arguments),this.library={library_revision:0,items:[]},this.isAdmin=!1,this.category="all",this.name="",this.speedIndex=null,this.loading=!1,this.saving=!1,this.applying=!1,this.requestGeneration=0}willUpdate(e){(e.has("device")||e.has("api"))&&(this.invalidateRequests(),this.catalogue=void 0,this.category="all",this.selectedScene=void 0,this.selectedItem=void 0,this.content=void 0,this.notice=void 0,this.error=void 0,this.loading=!!(this.api&&this.device))}updated(e){(e.has("device")||e.has("api"))&&this.api&&this.device&&this.loadCatalogue()}render(){return this.device?this.loading?o`<div class="status" role="status">Loading scenes...</div>`:this.error||!this.catalogue?o`
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
        ${this.filteredSceneEntries.map(e=>e.kind==="custom"?this.sceneButton(`custom:${e.item.id}`,e.label,()=>this.selectCustom(e.item)):this.sceneButton(oe(e.scene),e.label,()=>this.selectBuiltin(e.scene)))}
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
      `}get sortedCategories(){const e=[];return this.catalogue?.scenes.length&&e.push({id:"all",label:"All scenes"}),this.compatibleCustomScenes.length&&e.push({id:"custom",label:"Custom"}),e.push(...this.catalogue?.categories.filter(t=>this.catalogue?.scenes.some(i=>i.category_id===t.id)).map(t=>({id:t.id,label:t.name}))??[]),e.sort((t,i)=>Qe(t.label,i.label))}get compatibleCustomScenes(){return this.library.items.filter(e=>(e.kind==="scene_builtin"||e.kind==="scene_palette")&&e.template?.sku===this.catalogue?.sku)}get filteredCustomScenes(){return this.category==="all"||this.category==="custom"?this.compatibleCustomScenes:[]}get filteredBuiltinScenes(){return!this.catalogue||this.category==="custom"?[]:this.category==="all"?this.catalogue.scenes:this.catalogue.scenes.filter(e=>e.category_id===this.category)}get filteredSceneEntries(){return[...this.filteredCustomScenes.map(e=>({kind:"custom",item:e,label:e.name})),...this.filteredBuiltinScenes.map(e=>({kind:"builtin",scene:e,label:e.display_name}))].sort((e,t)=>Qe(e.label,t.label))}get selectionKey(){return this.selectedItem?`custom:${this.selectedItem.id}`:this.selectedScene?oe(this.selectedScene):void 0}categoryButton(e,t){const i=this.category===e;return o`
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
    `}renderDetail(){const e=this.selectedScene,t=e.speed,i=this.speedIndex??t?.default_index??0,s=this.selectedItem!==void 0;return o`
      <header class="detail-heading">
        <div>
          ${s?o`
                <input
                  class="editor-name"
                  aria-label="Scene name"
                  maxlength="128"
                  .value=${this.name}
                  ?disabled=${!this.isAdmin}
                  @input=${r=>{this.name=r.target.value}}
                />
              `:o`<h2>${e.display_name}</h2>`}
        </div>
        <div class="actions">
          <button
            class="primary"
            type="button"
            ?disabled=${!this.isAdmin||this.saving||!this.hasCurrentSceneContent()||this.content?.kind==="scene_layered"}
            @click=${this.save}
          >
            ${this.saving?"Saving...":s?"Save":"Save copy"}
          </button>
          ${e.parameter_kind==="layers"?o`
                <button
                  class="secondary"
                  type="button"
                  ?disabled=${!this.isAdmin||e.scene_type!==2||!this.hasCurrentSceneContent()||this.content?.kind!=="scene_layered"}
                  @click=${this.useAsTemplate}
                >
                  Use as Template
                </button>
              `:d}
          <button
            class="secondary"
            type="button"
            aria-describedby=${s&&this.content?.kind==="scene_palette"?"palette-apply-reason":d}
            ?disabled=${!this.isAdmin||!this.catalogue?.enabled||!this.hasCurrentSceneContent()||this.selectedItem!==void 0&&this.content?.kind!=="scene_builtin"||this.applying}
            @click=${this.apply}
          >
            ${this.applying?"Applying...":"Apply"}
          </button>
        </div>
      </header>

      ${this.catalogue?.enabled?d:o`
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
          `:d}

      ${t||this.content?.kind==="scene_palette"?this.renderParameters(t,i):d}
    `}renderParameters(e,t){const i=this.content?.kind==="scene_palette"?this.content:void 0;return o`
      <div class="card scene-parameters">
        <div class="parameter-list">
          ${e?o`
                <label class="speed-parameter">
                  <span class="parameter-heading">
                    <span>Speed</span>
                    <output>
                      ${Ms(t,e.default_index)}
                    </output>
                  </span>
                  <input
                    type="range"
                    aria-label="Scene speed"
                    min="0"
                    max=${e.option_count-1}
                    step="1"
                    .value=${String(t)}
                    ?disabled=${!this.isAdmin}
                    @input=${s=>{this.speedIndex=Number(s.target.value)}}
                  />
                </label>
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
              <h4>Palette</h4>
              <div class="scene-palette" role="list" aria-label="Scene palette">
                ${e.palette.map((t,i)=>o`
                  <span
                    role="listitem"
                    style="--scene-colour: ${x(t)}"
                    aria-label="Colour ${i+1}, ${x(t)}"
                  ></span>
                `)}
              </div>
            </section>
          `:d}
      <section class="parameter-entry visual-parameter">
        <h4>Sequence</h4>
        <ol class="scene-steps" aria-label="Ordered scene steps">
          ${e.steps.map((t,i)=>o`
            <li>
              <span class="step-order">${i+1}</span>
              <span
                class="step-colour"
                style="--scene-colour: ${x(t.colour)}"
                aria-label="Step colour ${x(t.colour)}"
              ></span>
              <span>
                <strong>Raw value ${t.value}</strong>
                <small>Step colour ${x(t.colour)}</small>
                ${t.inline_colour?o`
                      <small>
                        Inline colour ${x(t.inline_colour)}
                      </small>
                    `:d}
              </span>
            </li>
          `)}
        </ol>
      </section>
    `}async loadCatalogue(){if(!this.api||!this.device)return;const e=this.beginRequest();this.loading=!0,this.error=void 0,this.notice=void 0,this.selectedScene=void 0,this.selectedItem=void 0,this.content=void 0;try{const t=await e.api.sceneCatalogue(e.deviceId);if(!this.requestIsCurrent(e))return;this.catalogue=t,this.category="all"}catch(t){this.requestIsCurrent(e)&&(this.error=L(t))}finally{this.requestIsCurrent(e)&&(this.loading=!1)}}selectCategory(e){this.invalidateRequests(),this.category=e,this.selectedScene=void 0,this.selectedItem=void 0,this.content=void 0,this.notice=void 0}async selectBuiltin(e){if(!this.api||!this.device)return;const t=oe(e),i=this.beginRequest(t);this.notice=void 0,this.selectedScene=e,this.selectedItem=void 0,this.content=void 0,this.name=e.display_name,this.speedIndex=e.speed?.default_index??null;try{const s=await i.api.sceneDetail(i.deviceId,e.scene_id,e.effect_id);if(!this.requestIsCurrent(i)||oe(s.scene)!==t)return;this.selectedScene=s.scene,this.content=s.content,this.name=s.scene.display_name,this.speedIndex=s.content.speed_index}catch(s){this.requestIsCurrent(i)&&(this.notice=L(s))}}async selectCustom(e){if(!this.api||!this.device||!this.catalogue)return;const t=this.catalogue,i=this.beginRequest(`custom:${e.id}`);this.notice=void 0,this.selectedScene=void 0,this.selectedItem=void 0,this.content=void 0,this.name=e.name;try{const s=await i.api.item(e.id);if(!this.requestIsCurrent(i))return;if(s.content.kind!=="scene_builtin"&&s.content.kind!=="scene_palette")throw new Error("This custom scene uses an unsupported definition.");const r=s.content;if(r.template.sku!==t.sku)throw new Error(`This custom scene targets ${r.template.sku}, not ${t.sku}.`);const a=t.scenes.find(c=>c.scene_id===r.template.scene_id&&c.effect_id===r.template.effect_id);if(!a)throw new Error("The source scene is not in this device catalogue.");const l=await i.api.sceneDetail(i.deviceId,r.template.scene_id,r.template.effect_id);if(!this.requestIsCurrent(i)||oe(l.scene)!==oe(a))return;this.selectedScene=a,this.selectedItem=s,this.content=r,this.name=s.name,this.speedIndex=r.speed_index??a.speed?.default_index??null}catch(s){this.requestIsCurrent(i)&&(this.notice=L(s))}}async save(){if(!this.api||!this.device||!this.catalogue||!this.selectedScene||!this.content||!this.hasCurrentSceneContent()||this.content.kind!=="scene_builtin"&&this.content.kind!=="scene_palette"||!this.isAdmin||this.saving)return;const e=(this.selectedItem?this.name.trim():`${this.selectedScene.display_name} copy`).trim();if(!e){this.notice="Give this custom scene a name before saving.";return}const t=this.content.kind==="scene_palette"?Bs({...this.content,speed_index:this.speedIndex}):{...this.content,speed_index:this.speedIndex},i=this.captureRequest();this.saving=!0,this.notice=void 0;try{const s=this.selectedItem?await this.api.updateItem(this.selectedItem,e,t,this.library.library_revision):await this.api.createItem(e,t,this.library.library_revision);if(s.item.content.kind!=="scene_builtin"&&s.item.content.kind!=="scene_palette")throw new Error("The saved scene returned an unsupported definition.");if(this.dispatchEvent(new CustomEvent("library-item-saved",{detail:{item:s.item,library_revision:s.library_revision},bubbles:!0,composed:!0})),!this.requestIsCurrent(i))return;this.requestGeneration+=1,this.activeSelectionIdentity=`custom:${s.item.id}`,this.selectedItem=s.item,this.content=s.item.content,this.name=s.item.name,this.category="custom",this.notice="Custom scene saved."}catch(s){this.requestIsCurrent(i)&&(this.notice=et(s)==="conflict"?"The library changed elsewhere. Reload the scene before saving.":`Save failed: ${L(s)}`)}finally{this.saving=!1}}useAsTemplate(){!this.isAdmin||!this.selectedScene||this.selectedScene.scene_type!==2||this.content?.kind!=="scene_layered"||!this.hasCurrentSceneContent()||this.dispatchEvent(new CustomEvent("scene-template-selected",{detail:{content:Ke({...this.content,speed_index:this.speedIndex}),config_entry_id:this.device.config_entry_id,name:`${this.selectedScene.display_name} layered`},bubbles:!0,composed:!0}))}async apply(){if(!this.api||!this.device||!this.selectedScene||!this.hasCurrentSceneContent()||!this.isAdmin||!this.catalogue?.enabled||this.selectedItem!==void 0&&this.content?.kind!=="scene_builtin"||this.applying)return;const e=this.captureRequest(),t=this.device,i=this.selectedScene,s=this.speedIndex;this.applying=!0,this.notice=void 0;try{await e.api.applyScene(e.deviceId,i,s),this.requestIsCurrent(e)&&(this.notice=`Applied to ${t.display_name}. Scene identity can be read back; the selected speed remains optimistic.`)}catch(r){this.requestIsCurrent(e)&&(this.notice=`Apply failed: ${L(r)}`)}finally{this.applying=!1}}beginRequest(e){return this.requestGeneration+=1,this.activeSelectionIdentity=e,this.captureRequest()}captureRequest(){return{generation:this.requestGeneration,api:this.api,deviceId:this.device.config_entry_id,category:this.category,selectionIdentity:this.activeSelectionIdentity}}invalidateRequests(){this.requestGeneration+=1,this.activeSelectionIdentity=void 0}requestIsCurrent(e){return e.generation===this.requestGeneration&&e.api===this.api&&e.deviceId===this.device?.config_entry_id&&e.category===this.category&&e.selectionIdentity===this.activeSelectionIdentity}hasCurrentSceneContent(){return!this.catalogue||!this.selectedScene||!this.content||this.content.template.sku!==this.catalogue.sku||this.content.template.scene_id!==this.selectedScene.scene_id||this.content.template.effect_id!==this.selectedScene.effect_id?!1:this.activeSelectionIdentity===this.selectionKey}static{this.styles=[j,Ee,pt,ii,si,ai,ri,E`
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

    h4 {
      margin: 0;
      font-size: 13px;
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

    .parameter-heading {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 16px;
      color: var(--primary-text-color);
      font-size: 13px;
      font-weight: 700;
    }

    .parameter-heading output {
      color: var(--studio-muted);
      font-weight: 600;
    }

    .speed-parameter {
      display: grid;
      gap: 10px;
    }

    .speed-parameter input {
      width: 100%;
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
  `]}}I([b({attribute:!1})],S.prototype,"api");I([b({attribute:!1})],S.prototype,"device");I([b({attribute:!1})],S.prototype,"library");I([b({type:Boolean})],S.prototype,"isAdmin");I([p()],S.prototype,"catalogue");I([p()],S.prototype,"category");I([p()],S.prototype,"selectedScene");I([p()],S.prototype,"selectedItem");I([p()],S.prototype,"content");I([p()],S.prototype,"name");I([p()],S.prototype,"speedIndex");I([p()],S.prototype,"loading");I([p()],S.prototype,"saving");I([p()],S.prototype,"applying");I([p()],S.prototype,"notice");I([p()],S.prototype,"error");function oe(n){return`builtin:${n.scene_id}:${n.effect_id}`}function Ms(n,e){const t=n-e;if(t===0)return"Default";const i=Math.abs(t);return`${t<0?"Slower":"Faster"}${i>1?` ${i}`:""}`}function Bs(n){return{...n,template:{...n.template},steps:n.steps.map(e=>({...e,colour:[...e.colour],inline_colour:e.inline_colour===null?null:[...e.inline_colour]})),palette:n.palette.map(e=>[...e])}}customElements.get("govee-scene-browser")||customElements.define("govee-scene-browser",S);var Rs=Object.defineProperty,_=(n,e,t,i)=>{for(var s=void 0,r=n.length-1,a;r>=0;r--)(a=n[r])&&(s=a(e,t,s)||s);return s&&Rs(e,t,s),s};const rt=15;class $ extends D{constructor(){super(...arguments),this.showDevicePicker=!1,this.loading=!0,this.devices=[],this.section="custom",this.customEffectCategory="all",this.customCopyStarted=!1,this.library={library_revision:0,items:[]},this.name="",this.content=le(),this.paintBrushes=Oe(),this.selectedPaintBrush=0,this.brushUsesBackground=!1,this.saving=!1,this.applying=!1,this.deployments=[],this.editorTransitionEpoch=0,this.loadEpoch=0,this.deploymentRevision=-1}get isAdmin(){return this.hass?.user?.is_admin===!0}get selectedDevice(){return this.devices.find(e=>e.config_entry_id===this.selectedDeviceId)}get customEffectsAvailable(){const e=this.selectedDevice?.custom_effects;return!e||Object.values(e).some(t=>t!=="unsupported")}get dirty(){return O(this.content)?this.savedBaseline!==J(this.name,this.content):!1}get applyCapability(){if(!q(this.content))return;const e=this.selectedDevice?.custom_effects;if(e)switch(this.content.kind){case"h617a_painted":return e.painted;case"h617a_single":return e.single;case"h617a_multi":return e.multi}}get canApply(){return q(this.content)&&this.isAdmin&&!this.applying&&!this.deletingCurrentItem&&this.name.trim().length>0&&this.applyCapability==="supported"}get deletingCurrentItem(){return this.deletingItemId!==void 0&&this.currentItem?.id===this.deletingItemId}get activeDeployment(){const e=this.deployments.find(t=>t.operation_id===this.activeOperationId);return e||!this.applying?e:this.latestDeployment(["pending","uploading","verifying"])}connectedCallback(){super.connectedCallback(),this.hass&&!this.api&&this.load()}disconnectedCallback(){super.disconnectedCallback(),this.loadEpoch+=1,this.beginEditorTransition(),this.stopSubscriptions(),this.api=void 0}updated(e){e.has("hass")&&this.hass&&!this.api&&this.load(),this.syncSingleEffectSelects()}render(){return this.loading?o`<div class="centred" role="status">Loading effect studio...</div>`:this.error?this.renderFatalError():o`
      <h1 class="visually-hidden">Effect Studio</h1>

      ${this.notice?o`<div class="notice" role="status">${this.notice}</div>`:d}

      <main
        class="studio ${this.section==="scenes"?"scenes-mode":"custom-mode"}"
      >
        <nav class="primary-nav" aria-label="Create">
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
          @library-item-saved=${this.sceneLibraryItemSaved}
          @scene-template-selected=${this.sceneTemplateSelected}
        ></govee-scene-browser>
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
        ${this.customEffectCategoryAvailable("single-layer")?this.customEffectCategoryButton("single-layer","Single Layer"):d}
        ${this.customEffectCategoryAvailable("multi-layer")?this.customEffectCategoryButton("multi-layer","Multi Layer"):d}
        ${this.customEffectCategoryAvailable("advanced")?this.customEffectCategoryButton("advanced","Advanced"):d}
      </aside>

      <aside class="sidebar item-sidebar library" aria-label="Effects">
        ${this.customEffectEntries.map(t=>this.customEffectListButton(t))}
      </aside>

      <section class="editor-surface editor">
        ${this.name||this.currentItem?q(this.content)?this.content.kind==="h617a_painted"?this.renderPaintedEditor():this.renderPaletteEffectEditor():be(this.content)?this.renderAdvancedEditor():this.content.kind==="opaque"?this.renderOpaqueEditor(this.content):d:d}
      </section>
    `}get customEffectEntries(){return[{kind:"paint",key:"template:paint",label:"Paint",category:"single-layer"},...this.customCatalogue?.effects.map(t=>({kind:"single",key:`template:single:${t.family}:${t.variations[0].variant}`,label:t.label,category:"single-layer",family:t.family,variant:t.variations[0].variant}))??[],{kind:"multi",key:"template:mix",label:"Mix",category:"multi-layer"},{kind:"advanced",key:"template:advanced",label:"Layered",category:"advanced"},...this.library.items.filter(t=>Xt(t.kind)).map(t=>({kind:"saved",key:`saved:${t.id}`,label:t.name,category:Hs(t.kind),item:t}))].filter(t=>this.customEffectEntryAvailable(t)).filter(t=>this.customEffectCategory==="all"||t.category===this.customEffectCategory).sort((t,i)=>Qe(t.label,i.label))}customEffectEntryAvailable(e){switch(e.kind){case"paint":return this.customEffectKindAvailable("h617a_painted");case"single":return this.customEffectKindAvailable("h617a_single");case"multi":return this.customEffectKindAvailable("h617a_multi");case"advanced":return this.customEffectKindAvailable("advanced");case"saved":return this.customEffectKindAvailable(e.item.kind)}}customEffectCategoryAvailable(e){switch(e){case"all":return this.customEffectsAvailable;case"single-layer":return this.customEffectKindAvailable("h617a_painted")||this.customEffectKindAvailable("h617a_single");case"multi-layer":return this.customEffectKindAvailable("h617a_multi");case"advanced":return this.customEffectKindAvailable("advanced")}}customEffectKindAvailable(e){const t=this.selectedDevice?.custom_effects;return t?e==="h617a_painted"?t.painted!=="unsupported":e==="h617a_single"?t.single!=="unsupported":e==="h617a_multi"?t.multi!=="unsupported":t.advanced!=="unsupported":!0}get defaultNewEffectKind(){return this.customEffectKindAvailable("h617a_single")?"h617a_single":this.customEffectKindAvailable("h617a_painted")?"h617a_painted":this.customEffectKindAvailable("h617a_multi")?"h617a_multi":this.customEffectKindAvailable("advanced")?"advanced":void 0}customEffectCategoryButton(e,t){const i=this.customEffectCategory===e;return o`
      <button
        class="selector ${i?"selected":""}"
        type="button"
        aria-current=${i?"page":d}
        @click=${()=>{this.customEffectCategory=e}}
      >
        ${t}
      </button>
    `}customEffectListButton(e){const t=e.kind==="saved"?this.currentItem?.id===e.item.id:!this.currentItem&&this.customTemplateSelection===e.key;return o`
      <div class="library-row">
        <button
          class="selector item ${t?"selected":""}"
          type="button"
          ?disabled=${e.kind!=="saved"&&!this.isAdmin}
          @click=${()=>this.selectCustomEffectEntry(e)}
        >
          <span>${e.label}</span>
        </button>
        ${e.kind==="saved"&&this.isAdmin?o`
              <button
                class="library-delete"
                type="button"
                aria-label="Delete ${e.label}"
                title="Delete ${e.label}"
                ?disabled=${this.deletingItemId!==void 0||this.saving||this.applying}
                @click=${i=>this.requestDelete(e.item,i.currentTarget)}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            `:d}
      </div>
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
    `}selectCustomEffectEntry(e){if(e.kind==="saved"){this.selectItem(e.item.id);return}if(e.kind==="advanced"){this.newEffect("advanced",void 0,{name:e.label,content:Ge(),selectionIdentity:e.key,templateLabel:e.label}),this.customTemplateSelection=e.key;return}if(this.customCatalogue){if(e.kind==="paint"){this.newEffect("h617a_painted",void 0,{name:e.label,content:le(),selectionIdentity:e.key,templateLabel:e.label});return}if(e.kind==="single"){const t=W("h617a_single",this.customCatalogue);this.newEffect("h617a_single",void 0,{name:e.label,content:{...t,family:e.family,variant:e.variant},selectionIdentity:e.key,templateLabel:e.label});return}this.newEffect("h617a_multi",void 0,{name:e.label,content:W("h617a_multi",this.customCatalogue),selectionIdentity:e.key,templateLabel:e.label})}}renderAdvancedEditor(){if(!be(this.content))return d;const e=this.content.kind==="scene_layered";return o`
      ${e?o`
            <button
              class="back-button"
              type="button"
              @click=${this.backToScenes}
            >
              ← Back to Scenes
            </button>
          `:d}
      <div class="editor-heading">
        <div>
          <p class="eyebrow">
            Advanced / ${e?"Scene template":"Layered"}
          </p>
          ${this.renderEffectName()}
        </div>
        <div class="actions">
          ${this.renderSaveAction()}
          <button
            class="secondary"
            type="button"
            disabled
          >
            Apply
          </button>
          ${this.renderEditorDeleteButton()}
        </div>
      </div>

      ${this.renderNewEffectTypeTabs()}

      ${this.isAdmin?d:o`
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
          `:d}

      <govee-advanced-effect-editor
        .content=${Us(this.content)}
        .disabled=${!this.isAdmin}
        .segmentCount=${this.selectedDevice?.segment_count??15}
        @content-changed=${t=>{be(this.content)&&(this.content=qs(this.content,t.detail.content))}}
      ></govee-advanced-effect-editor>
    `}renderOpaqueEditor(e){return o`
      <div class="editor-heading">
        <div>
          <p class="eyebrow">Other / Unsupported definition</p>
          <h2>${this.name}</h2>
        </div>
        <div class="actions">
          <button class="secondary" type="button" disabled>Apply</button>
          ${this.renderEditorDeleteButton()}
        </div>
      </div>
      <div class="feedback read-only" role="note">
        This effect definition can be inspected, but this editor cannot change,
        save or apply it.
      </div>
      <section class="card opaque-content">
        <h3>Source kind</h3>
        <p><code>${e.source_kind}</code></p>
        <h3>Preserved content</h3>
        <pre aria-label="Preserved opaque content">${JSON.stringify(e.body,null,2)}</pre>
      </section>
    `}renderPaintedEditor(){if(this.content.kind!=="h617a_painted")return d;const e=this.activeDeployment;return o`
      <div class="editor-heading">
        <div>
          ${this.renderEffectName()}
        </div>
        <div class="actions">
          ${this.renderSaveAction()}
          <button
            class="secondary"
            type="button"
            ?disabled=${!this.canApply}
            @click=${this.apply}
          >
            ${this.applying?"Applying...":"Apply"}
          </button>
          ${this.renderEditorDeleteButton()}
        </div>
      </div>

      ${this.renderNewEffectTypeTabs()}

      ${this.isAdmin?d:o`
            <div class="feedback read-only" role="note">
              You can inspect shared effects. An administrator is required to
              edit or apply them.
            </div>
          `}

      ${this.renderSingleEffectSelector()}

      <govee-painted-segment-editor
        .colours=${at(this.content)}
        .disabled=${!this.isAdmin}
        @segment-selected=${t=>this.setSegmentColour(t.detail.index)}
      ></govee-painted-segment-editor>

      <div class="controls">
        <section class="card">
          <h3>Brushes</h3>
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
            <h4>Background</h4>
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
          <h3>Parameters</h3>
          ${this.renderPaintedVariationField()}
          ${this.rangeField("Speed","speed",this.content.speed)}
          ${this.rangeField("Brightness","brightness",this.content.brightness)}
        </section>
      </div>

      ${e?this.renderDeployment(e):d}
    `}renderPaletteEffectEditor(){if(this.content.kind!=="h617a_single"&&this.content.kind!=="h617a_multi")return d;const e=this.content,t=this.activeDeployment;return o`
      <div class="editor-heading">
        <div>
          ${this.renderEffectName()}
        </div>
        <div class="actions">
          ${this.renderSaveAction()}
          <button
            class="secondary"
            type="button"
            ?disabled=${!this.canApply}
            @click=${this.apply}
          >
            ${this.applying?"Applying...":"Apply"}
          </button>
          ${this.renderEditorDeleteButton()}
        </div>
      </div>

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
        .catalogue=${this.customCatalogue}
        .disabled=${!this.isAdmin}
        @content-changed=${i=>{this.content=Si(i.detail.content)}}
      ></govee-custom-effect-editor>

      ${t?this.renderDeployment(t):d}
    `}renderSingleEffectSelector(){if(!this.customCatalogue||this.templateSourceLabel||this.content.kind!=="h617a_painted"&&this.content.kind!=="h617a_single"||this.currentItem?.content.kind==="h617a_painted"&&this.content.kind==="h617a_painted")return d;const e=this.selectedSingleEffectFamily,t=this.content.kind==="h617a_painted"?"paint":e?.id??`unknown:${this.content.family}`,i=this.currentItem?.content.kind!=="h617a_single",s=this.currentItem?.content.kind==="h617a_painted"?[]:this.customCatalogue.effects;return o`
      <section class="card single-effect-settings">
        <h3>Effect</h3>
        <label class="field">
          <span>Effect</span>
          <select
            aria-label="Effect"
            .value=${t}
            ?disabled=${!this.isAdmin}
            @change=${this.singleEffectChanged}
          >
            ${this.content.kind==="h617a_single"&&!e?o`
                  <option value=${t}>
                    Unknown effect ${this.content.family}
                  </option>
                `:d}
            ${i?o`
                  <option
                    value="paint"
                    ?selected=${t==="paint"}
                  >
                    Paint
                  </option>
                `:d}
            ${s.map(r=>o`
                <option
                  value=${r.id}
                  ?selected=${t===r.id}
                >
                  ${r.label}
                </option>
              `)}
          </select>
        </label>
      </section>
    `}renderPaintedVariationField(){if(!this.customCatalogue||this.content.kind!=="h617a_painted")return d;const e=this.content,t=this.customCatalogue.painted_effects,i=t.some(s=>s.id===e.effect);return i&&t.length<=1?d:o`
      <label class="field">
        <span>Variation</span>
        <select
          aria-label="Variation"
          .value=${e.effect}
          ?disabled=${!this.isAdmin}
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
        `}get selectedSingleEffectFamily(){if(this.content.kind!=="h617a_single")return;const e=this.content.family;return this.customCatalogue?.effects.find(t=>t.family===e)}syncSingleEffectSelects(){if(this.content.kind!=="h617a_painted"&&this.content.kind!=="h617a_single")return;const e=this.shadowRoot?.querySelector('select[aria-label="Effect"]');if(e&&(e.value=this.content.kind==="h617a_painted"?"paint":this.selectedSingleEffectFamily?.id??`unknown:${this.content.family}`),this.content.kind==="h617a_painted"){const t=this.shadowRoot?.querySelector('select[aria-label="Variation"]');t&&(t.value=this.content.effect)}}rangeField(e,t,i){return o`
      <label class="range-field">
        <span>${e}</span>
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
    `}renderNewEffectTypeTabs(){return this.currentItem||this.templateSourceLabel||this.customCopyStarted||!O(this.content)?d:o`
      <div class="custom-mode-tabs" role="tablist" aria-label="Custom effect type">
        ${this.newEffectTypeAvailable("single")?this.newEffectTypeButton("single","Single"):d}
        ${this.newEffectTypeAvailable("multi")?this.newEffectTypeButton("multi","Multi"):d}
        ${this.newEffectTypeAvailable("advanced")?this.newEffectTypeButton("advanced","Advanced"):d}
      </div>
    `}newEffectTypeAvailable(e){return e==="single"?this.customEffectKindAvailable("h617a_painted")||this.customEffectKindAvailable("h617a_single"):this.customEffectKindAvailable(e==="multi"?"h617a_multi":"advanced")}newEffectTypeButton(e,t){const i=jt(this.content)===e,s=e==="single"&&this.content.kind==="h617a_multi"&&this.content.effects.length>1;return o`
      <button
        type="button"
        role="tab"
        aria-selected=${i}
        class=${i?"selected":""}
        title=${s?"Remove all but one effect before switching to Single":d}
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
    `}async selectSection(e){const t=this.beginEditorTransition();if(e===this.section||e==="custom"&&!this.customEffectsAvailable||(this.section=e,this.notice=void 0,e==="scenes")||(q(this.content)||be(this.content)||this.content.kind==="opaque")&&this.customEffectKindAvailable(this.content.kind))return;const i=this.library.items.find(s=>Xt(s.kind)&&this.customEffectKindAvailable(s.kind));if(i){await this.selectItem(i.id,t);return}this.isAdmin?this.openDefaultAvailableTemplate(t):(this.currentItem=void 0,this.name="")}async load(){const e=this.loadEpoch+1;this.loadEpoch=e,this.loading=!0,this.error=void 0,this.deploymentRevision=-1;const t=new Es(this.hass);this.api=t;try{const[i,s,r,a]=await Promise.all([t.info(),t.devices(),t.library(),t.customCatalogue()]);if(!this.loadIsCurrent(e,t))return;if(!ks(i))throw new Error("This editor bundle is not compatible with the installed backend.");this.devices=s,this.library=r,this.customCatalogue=a,this.selectedDeviceId=this.deviceIdFromPath()??s.find(u=>u.custom_effects.painted==="supported")?.config_entry_id??s[0]?.config_entry_id,this.customEffectsAvailable||(this.section="scenes");const l=await t.subscribeLibrary(u=>{this.libraryChanged(u)},u=>this.subscriptionFailed(u,e,t));if(!this.loadIsCurrent(e,t)||this.error){l();return}if(this.unsubscribeLibrary=l,this.isAdmin){const u=await t.subscribeDeployments(m=>{m.revision<this.deploymentRevision||(this.deploymentRevision=m.revision,this.deployments=m.deployments,this.activeOperationId||(this.activeOperationId=this.latestDeployment(["pending","uploading","verifying","interrupted"])?.operation_id))},m=>this.subscriptionFailed(m,e,t));if(!this.loadIsCurrent(e,t)||this.error){u();return}this.unsubscribeDeployments=u}const c=r.items.find(u=>He(u.kind)&&this.customEffectKindAvailable(u.kind));c?await this.selectItem(c.id):this.isAdmin&&this.openDefaultAvailableTemplate()}catch(i){this.loadIsCurrent(e,t)&&(this.stopSubscriptions(),this.error=L(i))}finally{this.loadIsCurrent(e,t)&&(this.loading=!1)}}openDefaultTemplate(e){this.newEffect("h617a_painted",e,{name:"Paint",content:le(),selectionIdentity:"template:paint",templateLabel:"Paint"})}openDefaultAvailableTemplate(e){if(this.customEffectKindAvailable("h617a_painted")){this.openDefaultTemplate(e);return}if(this.customEffectKindAvailable("h617a_single")&&this.customCatalogue?.effects[0]){const t=this.customCatalogue.effects[0],i=t.variations[0],s=W("h617a_single",this.customCatalogue);this.newEffect("h617a_single",e,{name:t.label,content:{...s,family:t.family,variant:i.variant},selectionIdentity:`template:single:${t.family}:${i.variant}`,templateLabel:t.label});return}if(this.customEffectKindAvailable("h617a_multi")){this.newEffect("h617a_multi",e,{name:"Mix",content:W("h617a_multi",this.customCatalogue),selectionIdentity:"template:mix",templateLabel:"Mix"});return}if(this.customEffectKindAvailable("advanced")){this.newEffect("advanced",e,{name:"Layered",content:Ge(),selectionIdentity:"template:advanced",templateLabel:"Layered"});return}this.currentItem=void 0,this.name=""}loadIsCurrent(e,t){return this.isConnected&&this.loadEpoch===e&&this.api===t}subscriptionFailed(e,t,i){this.loadIsCurrent(t,i)&&(this.error=e.message,this.loading=!1,queueMicrotask(()=>{this.loadIsCurrent(t,i)&&this.stopSubscriptions()}))}stopSubscriptions(){this.unsubscribeLibrary?.(),this.unsubscribeDeployments?.(),this.unsubscribeLibrary=void 0,this.unsubscribeDeployments=void 0}deviceIdFromPath(){const e=window.location.pathname.match(/\/ha-govee-led-ble\/editor\/([^/]+)/);return e?.[1]?decodeURIComponent(e[1]):void 0}async libraryChanged(e){const t=this.library.library_revision;if(e.library_revision<t||(this.library=e,!this.currentItem||e.library_revision===t))return;const i=e.items.find(a=>a.id===this.currentItem?.id);if(!i){if(this.deletingItemId===this.currentItem.id)return;this.notice="This effect was removed from the shared library.";return}if(i.revision===this.currentItem.revision)return;if(this.dirty){this.notice="This effect changed elsewhere. Reload it before saving.";return}const s=this.beginEditorTransition();await this.selectItem(i.id,s)&&this.editorTransitionIsCurrent(s)&&(this.notice="Loaded the latest shared revision.")}sceneLibraryItemSaved(e){this.library={library_revision:e.detail.library_revision,items:Wt(this.library.items,e.detail.item)}}sceneTemplateSelected(e){if(!this.isAdmin||e.detail.config_entry_id!==this.selectedDeviceId)return;const t=this.beginEditorTransition();this.currentItem=void 0,this.templateSourceLabel=void 0,this.customCopyStarted=!0,this.name=e.detail.name.trim()||"Layered scene template",this.content=Ke(e.detail.content),this.savedBaseline=void 0,this.section="custom",this.customEffectCategory="all",this.customTemplateSelection=void 0,this.notice=void 0,this.selectNewEffectName(t)}backToScenes(){this.beginEditorTransition(),this.section="scenes",this.notice=void 0}beginEditorTransition(){return this.editorTransitionEpoch+=1,this.editorTransitionEpoch}editorTransitionIsCurrent(e){return e===this.editorTransitionEpoch}deviceChanged(e){const t=this.beginEditorTransition();if(this.selectedDeviceId=e.target.value,this.activeOperationId=void 0,this.activeOperationId=this.latestDeployment(["pending","uploading","verifying","interrupted"])?.operation_id,this.notice=void 0,!this.customEffectsAvailable){this.section="scenes";return}this.customEffectCategoryAvailable(this.customEffectCategory)||(this.customEffectCategory="all"),this.section==="custom"&&!this.customEffectKindAvailable(this.content.kind)&&this.openDefaultAvailableTemplate(t)}switchNewEffectType(e){if(!this.isAdmin||!this.newEffectTypeAvailable(e)||this.currentItem||this.templateSourceLabel||!O(this.content)||jt(this.content)===e)return;if(e==="advanced"){this.newEffect("advanced");return}const t=e==="single"?"h617a_single":"h617a_multi";if(q(this.content)){this.switchCustomMode(t);return}this.newEffect(t)}switchCustomMode(e){if(!this.isAdmin||!this.customCatalogue||!q(this.content)||this.content.kind===e)return;const t=this.content;if(e==="h617a_single"&&t.kind==="h617a_multi"&&t.effects.length>1)return;let i;if(e==="h617a_painted"){const s=t.kind==="h617a_painted"?this.activePaintBrush:t.palette[0]?[...t.palette[0]]:[47,111,237];i={...le(),speed:t.speed,groups:[{fill:[...s],segments:Array.from({length:rt},(r,a)=>a)}]},t.kind!=="h617a_painted"&&(this.paintBrushes=Ks(t.palette),this.selectedPaintBrush=0),this.brushUsesBackground=!1}else if(t.kind==="h617a_painted"){const s=Vs(t);if(e==="h617a_single"){const r=W(e,this.customCatalogue);i={...r,speed:t.speed,palette:s.length?s:r.palette}}else{const r=W("h617a_multi",this.customCatalogue);i={...r,speed:t.speed,palette:s.length?s:r.palette}}}else if(e==="h617a_multi"&&t.kind==="h617a_single")i={kind:e,effects:[{family:t.family,variant:t.variant}],speed:t.speed,palette:t.palette.map(s=>[...s])};else if(e==="h617a_single"&&t.kind==="h617a_multi"){const s=t.effects[0];i={kind:e,family:s.family,variant:s.variant,speed:t.speed,palette:t.palette.map(r=>[...r])}}else return;this.content=i,/^New (Paint|Painted|Single|Multi) effect$/.test(this.name)&&(this.name=`New ${Gt(e)} effect`),this.notice=this.applyAvailabilityNotice()}newEffect(e,t,i){const s=t??this.beginEditorTransition();!this.api||!this.isAdmin||!this.customEffectKindAvailable(e)||e!=="advanced"&&!this.customCatalogue||(this.currentItem=void 0,this.templateSourceLabel=i?.templateLabel,this.customCopyStarted=i?.templateLabel!==void 0,this.customTemplateSelection=e==="advanced"?void 0:i?.selectionIdentity??(e==="h617a_painted"?"template:paint":void 0),this.name=i?.name??`New ${Gt(e)} effect`,this.content=i?.content??(e==="advanced"?Ge():W(e,this.customCatalogue)),e==="h617a_painted"&&(this.brushUsesBackground=!1),this.savedBaseline=void 0,this.notice=this.applyAvailabilityNotice(),this.selectNewEffectName(s))}selectNewEffectName(e){this.updateComplete.then(()=>{if(!this.editorTransitionIsCurrent(e)||this.currentItem||this.templateSourceLabel)return;const t=this.shadowRoot?.querySelector(".editor .editor-name");t?.focus(),t?.select()})}renderEditorDeleteButton(){return!this.isAdmin||!this.currentItem?d:o`
      <button
        class="danger"
        type="button"
        ?disabled=${this.deletingItemId!==void 0||this.saving||this.applying}
        @click=${e=>this.requestDelete({id:this.currentItem.id,revision:this.currentItem.revision,name:this.currentItem.name},e.currentTarget)}
      >
        ${this.deletingCurrentItem?"Deleting...":"Delete"}
      </button>
    `}requestDelete(e,t){!this.api||!this.isAdmin||this.deletingItemId!==void 0||this.saving||this.applying||(this.deleteCandidate={...e},this.deleteReturnFocus=t,this.notice=void 0,this.updateComplete.then(()=>{this.shadowRoot?.querySelector(".delete-dialog .danger")?.focus()}))}cancelDelete(){const e=this.deleteReturnFocus;this.deleteCandidate=void 0,this.deleteReturnFocus=void 0,this.updateComplete.then(()=>{e?.isConnected&&e.focus()})}deleteDialogKeyDown(e){e.key==="Escape"&&(e.preventDefault(),this.cancelDelete())}async confirmDelete(){const e=this.deleteCandidate,t=this.api;if(!e||!t||!this.isAdmin||this.deletingItemId!==void 0)return;const i=this.library.library_revision;this.deleteCandidate=void 0,this.deleteReturnFocus=void 0,this.deletingItemId=e.id,this.notice=void 0;try{const s=await t.deleteItem(e,i);s>=this.library.library_revision&&(this.library={library_revision:s,items:this.library.items.filter(r=>r.id!==e.id)}),this.currentItem?.id===e.id&&this.currentItem.revision===e.revision&&(this.beginEditorTransition(),this.currentItem=void 0,this.templateSourceLabel=void 0,this.customCopyStarted=!1,this.customTemplateSelection=void 0,this.name="",this.content=le(),this.savedBaseline=void 0),this.notice=`Deleted ${e.name}.`}catch(s){const r=et(s)==="conflict";if(this.notice=r?"This effect or library changed elsewhere. Reload before deleting.":`Delete failed: ${L(s)}`,r)try{const a=await t.library();a.library_revision>=this.library.library_revision&&(this.library=a)}catch(a){this.notice+=` Library refresh failed: ${L(a)}`}}finally{this.deletingItemId=void 0}}async selectItem(e,t){const i=t??this.beginEditorTransition();if(!this.api)return!1;try{const s=await this.api.item(e);return this.editorTransitionIsCurrent(i)?s.content.kind==="opaque"?(this.currentItem=s,this.templateSourceLabel=void 0,this.customCopyStarted=!1,this.customTemplateSelection=void 0,this.name=s.name,this.content=Fs(s.content),this.savedBaseline=void 0,this.notice="This effect definition is preserved, but this editor cannot change or apply it.",!0):O(s.content)?(this.currentItem=s,this.templateSourceLabel=void 0,this.customCopyStarted=!1,this.customTemplateSelection=void 0,this.name=s.name,this.content=Ze(s.content),s.content.kind==="h617a_painted"&&(this.brushUsesBackground=!1),this.savedBaseline=J(s.name,s.content),this.notice=this.applyAvailabilityNotice(),!0):(this.notice="This item cannot be edited here.",!1):!1}catch(s){return this.editorTransitionIsCurrent(i)&&(this.notice=L(s)),!1}}nameChanged(e){this.name=e.target.value}saveAsCustom(){const e=this.templateSourceLabel;if(!e||!this.isAdmin)return;const t=this.beginEditorTransition();this.templateSourceLabel=void 0,this.customTemplateSelection=void 0,this.customCopyStarted=!0,this.name=`Custom ${e}`,this.savedBaseline=void 0,this.selectNewEffectName(t)}paintBrushesChanged(e){this.paintBrushes=e.detail.palette.map(t=>[...t]),this.selectedPaintBrush=Math.max(0,Math.min(this.selectedPaintBrush,this.paintBrushes.length-1)),this.brushUsesBackground=!1}paintBrushSelected(e){this.selectedPaintBrush=e.detail.index,this.brushUsesBackground=!1}get activePaintBrush(){return[...this.paintBrushes[this.selectedPaintBrush]??this.paintBrushes[0]??[47,111,237]]}backgroundChanged(e){this.updateContent({background:[...e.detail.colour]})}singleEffectChanged(e){if(!this.customCatalogue||this.currentItem?.content.kind==="opaque")return;const t=e.target.value;if(this.currentItem&&(this.content.kind==="h617a_painted"&&t!=="paint"||this.content.kind==="h617a_single"&&t==="paint"))return;const i=this.templateSourceLabel!==void 0||this.customTemplateSelection!==void 0;if(t==="paint"){this.content.kind!=="h617a_painted"&&this.switchCustomMode("h617a_painted"),i&&(this.customTemplateSelection="template:paint"),this.updateGeneratedEffectName("Paint");return}const s=this.customCatalogue.effects.find(a=>a.id===t),r=s?.variations[0];!s||!r||(this.content.kind==="h617a_painted"&&this.switchCustomMode("h617a_single"),this.content.kind==="h617a_single"&&(this.content={...this.content,family:s.family,variant:r.variant},i&&(this.customTemplateSelection=`template:single:${s.family}:${r.variant}`),this.updateGeneratedEffectName(s.label)))}paintedEffectVariationChanged(e){this.content.kind==="h617a_painted"&&this.updateContent({effect:e.target.value})}updateGeneratedEffectName(e){if(this.templateSourceLabel){this.templateSourceLabel=e,this.name=e;return}!this.currentItem&&/^New .+ effect$/.test(this.name)&&(this.name=`New ${e} effect`)}setSegmentColour(e){if(this.content.kind!=="h617a_painted")return;const t=at(this.content);t[e]=this.brushUsesBackground?[...this.content.background]:this.activePaintBrush,this.content={...this.content,groups:Ht(t,this.content.background)}}paintAll(){if(this.content.kind!=="h617a_painted")return;const e=this.brushUsesBackground?this.content.background:this.activePaintBrush;this.content={...this.content,groups:Ht(Array.from({length:rt},()=>[...e]),this.content.background)}}resetPaint(){this.content.kind==="h617a_painted"&&(this.content={...this.content,groups:[]})}updateContent(e){this.content.kind==="h617a_painted"&&(this.content={...this.content,...e})}async save(){if(!this.api||!this.isAdmin||!this.dirty||this.saving||this.deletingCurrentItem||!O(this.content))return;const e=this.api,t=this.name.trim();if(!t){this.notice="Give this effect a name before saving.";return}const i=this.beginEditorTransition(),s=this.currentItem,r=Ze(this.content),a=this.library.library_revision;this.saving=!0,this.notice=void 0;try{const l=s?await e.updateItem(s,t,r,a):await e.createItem(t,r,a);if(!O(l.item.content))throw new Error("The saved effect returned an unsupported definition.");const c=l.item.content;l.library_revision>=this.library.library_revision&&(this.library={library_revision:l.library_revision,items:Wt(this.library.items,l.item)}),this.editorTransitionIsCurrent(i)&&Yt(this.currentItem,s)&&O(this.content)&&J(this.name,this.content)===J(t,r)&&(this.currentItem=l.item,this.customTemplateSelection=void 0,this.name=l.item.name,this.content=Ze(c),this.savedBaseline=J(this.name,this.content)),this.editorTransitionIsCurrent(i)&&Yt(this.currentItem,l.item)&&O(this.content)&&J(this.name,this.content)===J(l.item.name,c)&&(this.notice="Saved.")}catch(l){if(et(l)==="conflict"){const c="This effect or library changed elsewhere. Reload before saving.";this.editorTransitionIsCurrent(i)&&(this.notice=c);try{const u=await e.library();u.library_revision>=this.library.library_revision&&(this.library=u)}catch(u){this.editorTransitionIsCurrent(i)&&(this.notice=`${c} Library refresh failed: `+L(u))}}else this.editorTransitionIsCurrent(i)&&(this.notice=`Save failed: ${L(l)}`)}finally{this.saving=!1}}async apply(){if(!this.api||!this.canApply||!q(this.content)||!this.selectedDeviceId)return;const e=this.name.trim(),t=this.selectedDeviceId,i=this.editorTransitionEpoch;this.activeOperationId=void 0,this.applying=!0,this.notice=void 0;try{const s=!this.dirty&&this.currentItem?await this.api.applySaved(t,this.currentItem):await this.api.applySnapshot(t,e,this.content);if(i!==this.editorTransitionEpoch||t!==this.selectedDeviceId)return;this.activeOperationId=s.operation_id,this.deployments=[s,...this.deployments.filter(r=>r.operation_id!==s.operation_id)]}catch(s){i===this.editorTransitionEpoch&&t===this.selectedDeviceId&&(this.notice=`Apply failed: ${L(s)}`)}finally{this.applying=!1}}applyAvailabilityNotice(){if(!be(this.content)&&this.selectedDeviceId&&!this.selectedDevice)return"This device is temporarily unavailable in Home Assistant. Apply is disabled until it is loaded."}latestDeployment(e){return[...this.deployments].filter(t=>t.config_entry_id===this.selectedDeviceId&&e.includes(t.phase)).sort((t,i)=>i.updated_at.localeCompare(t.updated_at))[0]}static{this.styles=[j,Ee,pt,ii,ft,si,ai,ni,ri,E`
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

    .eyebrow {
      margin-bottom: 6px;
      color: var(--studio-muted);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
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
      padding: 22px 16px;
      border-inline-end: 1px solid var(--studio-border);
      background: var(--secondary-background-color, #f5f6f8);
    }

    .primary-nav {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .library-row {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .library-row > .selector {
      min-width: 0;
      flex: 1;
    }

    .library-delete {
      width: 44px;
      flex: 0 0 44px;
      padding: 0;
      border: 0;
      border-radius: 50%;
      color: var(--studio-muted);
      background: transparent;
      font-size: 24px;
      line-height: 1;
      cursor: pointer;
    }

    .library-delete:hover,
    .library-delete:focus-visible {
      color: var(--error-color, #db4437);
      background: color-mix(
        in srgb,
        var(--error-color, #db4437) 10%,
        transparent
      );
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
      margin-top: 18px;
    }

    .background-colour h4 {
      margin: 0 0 10px;
      color: var(--studio-muted);
      font-size: 13px;
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
      .studio.custom-mode {
        grid-template-columns: 170px minmax(0, 1fr);
      }

      .custom-mode .effect-categories,
      .custom-mode .library,
      .custom-mode .editor {
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
        grid-template-columns: repeat(2, 1fr);
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
  `]}}_([b({attribute:!1})],$.prototype,"hass");_([b({attribute:!1})],$.prototype,"panel");_([b({type:Boolean})],$.prototype,"showDevicePicker");_([p()],$.prototype,"loading");_([p()],$.prototype,"error");_([p()],$.prototype,"notice");_([p()],$.prototype,"devices");_([p()],$.prototype,"selectedDeviceId");_([p()],$.prototype,"section");_([p()],$.prototype,"customEffectCategory");_([p()],$.prototype,"customTemplateSelection");_([p()],$.prototype,"templateSourceLabel");_([p()],$.prototype,"customCopyStarted");_([p()],$.prototype,"library");_([p()],$.prototype,"customCatalogue");_([p()],$.prototype,"currentItem");_([p()],$.prototype,"name");_([p()],$.prototype,"content");_([p()],$.prototype,"paintBrushes");_([p()],$.prototype,"selectedPaintBrush");_([p()],$.prototype,"brushUsesBackground");_([p()],$.prototype,"saving");_([p()],$.prototype,"applying");_([p()],$.prototype,"deleteCandidate");_([p()],$.prototype,"deletingItemId");_([p()],$.prototype,"deployments");_([p()],$.prototype,"activeOperationId");function le(){return{kind:"h617a_painted",effect:"clockwise",speed:50,brightness:100,background:[0,0,0],groups:[]}}function W(n,e){if(n==="h617a_painted")return le();const t=n==="h617a_multi"?e.effects.find(r=>r.supports_multi):e.effects[0];if(!t)throw new Error("The custom-effect catalogue has no compatible effects.");const i=t.variations[0],s={family:t.family,variant:i.variant};return n==="h617a_single"?{kind:n,...s,speed:50,palette:Oe()}:{kind:n,effects:[s],speed:50,palette:Oe()}}function Os(n){return{...n,background:[...n.background],groups:n.groups.map(e=>({fill:[...e.fill],segments:[...e.segments]}))}}function Si(n){return n.kind==="h617a_painted"?Os(n):n.kind==="h617a_single"?{...n,palette:n.palette.map(e=>[...e])}:{...n,effects:n.effects.map(e=>({...e})),palette:n.palette.map(e=>[...e])}}function Ze(n){return n.kind==="advanced"?Me(n):n.kind==="scene_layered"?Ke(n):Si(n)}function Fs(n){return{...n,body:structuredClone(n.body)}}function Us(n){return n.kind==="advanced"?n:{kind:"advanced",layers:n.effect.layers}}function qs(n,e){return n.kind==="advanced"?Me(e):{...Ke(n),effect:{layers:Me(e).layers}}}function Oe(){return[[255,0,0],[255,127,0],[255,255,0],[0,255,0],[0,0,255],[0,255,255],[139,0,255]]}function Ks(n){const e=[];for(const t of[...n,...Oe()])if(e.some(i=>Fe(i,t))||e.push([...t]),e.length===8)break;return e}function at(n){const e=Array.from({length:rt},()=>[...n.background]);for(const t of n.groups)for(const i of t.segments)e[i]=[...t.fill];return e}function Ht(n,e){const t=new Map;return n.forEach((i,s)=>{if(Fe(i,e))return;const r=i.join(","),a=t.get(r);a?a.segments.push(s):t.set(r,{fill:[...i],segments:[s]})}),[...t.values()]}function Vs(n){const e=[];for(const t of at(n))if(!Fe(t,n.background)&&!e.some(i=>Fe(i,t))&&e.push([...t]),e.length===8)break;return e}function Fe(n,e){return n[0]===e[0]&&n[1]===e[1]&&n[2]===e[2]}function J(n,e){return JSON.stringify({name:n.trim(),content:e})}function He(n){return n==="h617a_painted"||n==="h617a_single"||n==="h617a_multi"}function q(n){return typeof n=="object"&&n!==null&&"kind"in n&&He(n.kind)}function O(n){return q(n)||typeof n=="object"&&n!==null&&"kind"in n&&Se(n.kind)}function jt(n){return n.kind==="h617a_multi"?"multi":Se(n.kind)?"advanced":n.kind==="h617a_painted"||n.kind==="h617a_single"?"single":void 0}function Se(n){return n==="advanced"||n==="scene_layered"}function be(n){return Se(n.kind)}function zs(n){return He(n)||Se(n)||n==="scene_builtin"||n==="scene_palette"}function Gt(n){switch(n){case"h617a_painted":return"Paint";case"h617a_single":return"Single";case"h617a_multi":return"Multi";case"advanced":return"Layered";default:return"Custom"}}function Xt(n){return He(n)||Se(n)||!zs(n)}function Hs(n){return n==="h617a_multi"?"multi-layer":n==="h617a_painted"||n==="h617a_single"?"single-layer":"advanced"}function Yt(n,e){return n?.id===e?.id&&n?.revision===e?.revision}function Wt(n,e){return[...n.filter(t=>t.id!==e.id),{id:e.id,revision:e.revision,name:e.name,kind:e.content.kind==="opaque"?e.content.source_kind:e.content.kind,..."template"in e.content?{template:e.content.template}:{}}].sort((t,i)=>t.name.localeCompare(i.name))}customElements.get("ha-govee-led-ble-editor")||customElements.define("ha-govee-led-ble-editor",$);
