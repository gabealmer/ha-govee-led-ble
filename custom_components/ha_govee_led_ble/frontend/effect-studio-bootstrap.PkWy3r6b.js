const ze=globalThis,Nt=ze.ShadowRoot&&(ze.ShadyCSS===void 0||ze.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Rt=Symbol(),ei=new WeakMap;let Mi=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==Rt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(Nt&&e===void 0){const i=t!==void 0&&t.length===1;i&&(e=ei.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&ei.set(t,e))}return e}toString(){return this.cssText}};const bs=s=>new Mi(typeof s=="string"?s:s+"",void 0,Rt),k=(s,...e)=>{const t=s.length===1?s[0]:e.reduce((i,n,r)=>i+(a=>{if(a._$cssResult$===!0)return a.cssText;if(typeof a=="number")return a;throw Error("Value passed to 'css' function must be a 'css' function result: "+a+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(n)+s[r+1],s[0]);return new Mi(t,s,Rt)},vs=(s,e)=>{if(Nt)s.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const i=document.createElement("style"),n=ze.litNonce;n!==void 0&&i.setAttribute("nonce",n),i.textContent=t.cssText,s.appendChild(i)}},ti=Nt?s=>s:s=>s instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return bs(t)})(s):s;const{is:ys,defineProperty:_s,getOwnPropertyDescriptor:$s,getOwnPropertyNames:xs,getOwnPropertySymbols:ks,getPrototypeOf:ws}=Object,st=globalThis,ii=st.trustedTypes,Es=ii?ii.emptyScript:"",Cs=st.reactiveElementPolyfillSupport,De=(s,e)=>s,Ze={toAttribute(s,e){switch(e){case Boolean:s=s?Es:null;break;case Object:case Array:s=s==null?s:JSON.stringify(s)}return s},fromAttribute(s,e){let t=s;switch(e){case Boolean:t=s!==null;break;case Number:t=s===null?null:Number(s);break;case Object:case Array:try{t=JSON.parse(s)}catch{t=null}}return t}},Ot=(s,e)=>!ys(s,e),si={attribute:!0,type:String,converter:Ze,reflect:!1,useDefault:!1,hasChanged:Ot};Symbol.metadata??=Symbol("metadata"),st.litPropertyMetadata??=new WeakMap;let be=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=si){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),n=this.getPropertyDescriptor(e,i,t);n!==void 0&&_s(this.prototype,e,n)}}static getPropertyDescriptor(e,t,i){const{get:n,set:r}=$s(this.prototype,e)??{get(){return this[t]},set(a){this[t]=a}};return{get:n,set(a){const l=n?.call(this);r?.call(this,a),this.requestUpdate(e,l,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??si}static _$Ei(){if(this.hasOwnProperty(De("elementProperties")))return;const e=ws(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(De("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(De("properties"))){const t=this.properties,i=[...xs(t),...ks(t)];for(const n of i)this.createProperty(n,t[n])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[i,n]of t)this.elementProperties.set(i,n)}this._$Eh=new Map;for(const[t,i]of this.elementProperties){const n=this._$Eu(t,i);n!==void 0&&this._$Eh.set(n,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const n of i)t.unshift(ti(n))}else e!==void 0&&t.push(ti(e));return t}static _$Eu(e,t){const i=t.attribute;return i===!1?void 0:typeof i=="string"?i:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return vs(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),n=this.constructor._$Eu(e,i);if(n!==void 0&&i.reflect===!0){const r=(i.converter?.toAttribute!==void 0?i.converter:Ze).toAttribute(t,i.type);this._$Em=e,r==null?this.removeAttribute(n):this.setAttribute(n,r),this._$Em=null}}_$AK(e,t){const i=this.constructor,n=i._$Eh.get(e);if(n!==void 0&&this._$Em!==n){const r=i.getPropertyOptions(n),a=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:Ze;this._$Em=n;const l=a.fromAttribute(t,r.type);this[n]=l??this._$Ej?.get(n)??l,this._$Em=null}}requestUpdate(e,t,i,n=!1,r){if(e!==void 0){const a=this.constructor;if(n===!1&&(r=this[e]),i??=a.getPropertyOptions(e),!((i.hasChanged??Ot)(r,t)||i.useDefault&&i.reflect&&r===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,i))))return;this.C(e,t,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:n,wrapped:r},a){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),r!==!0||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),n===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[n,r]of this._$Ep)this[n]=r;this._$Ep=void 0}const i=this.constructor.elementProperties;if(i.size>0)for(const[n,r]of i){const{wrapped:a}=r,l=this[n];a!==!0||this._$AL.has(n)||l===void 0||this.C(n,void 0,r,l)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(i=>i.hostUpdate?.()),this.update(t)):this._$EM()}catch(i){throw e=!1,this._$EM(),i}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};be.elementStyles=[],be.shadowRootOptions={mode:"open"},be[De("elementProperties")]=new Map,be[De("finalized")]=new Map,Cs?.({ReactiveElement:be}),(st.reactiveElementVersions??=[]).push("2.1.2");const Bt=globalThis,ni=s=>s,Qe=Bt.trustedTypes,ri=Qe?Qe.createPolicy("lit-html",{createHTML:s=>s}):void 0,Ni="$lit$",J=`lit$${Math.random().toFixed(9).slice(2)}$`,Ri="?"+J,Ss=`<${Ri}>`,de=document,Me=()=>de.createComment(""),Ne=s=>s===null||typeof s!="object"&&typeof s!="function",Ft=Array.isArray,Is=s=>Ft(s)||typeof s?.[Symbol.iterator]=="function",ut=`[ 	
\f\r]`,Ie=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ai=/-->/g,oi=/>/g,ie=RegExp(`>|${ut}(?:([^\\s"'>=/]+)(${ut}*=${ut}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),li=/'/g,di=/"/g,Oi=/^(?:script|style|textarea|title)$/i,As=s=>(e,...t)=>({_$litType$:s,strings:e,values:t}),o=As(1),U=Symbol.for("lit-noChange"),d=Symbol.for("lit-nothing"),ci=new WeakMap,ae=de.createTreeWalker(de,129);function Bi(s,e){if(!Ft(s)||!s.hasOwnProperty("raw"))throw Error("invalid template strings array");return ri!==void 0?ri.createHTML(e):e}const Ps=(s,e)=>{const t=s.length-1,i=[];let n,r=e===2?"<svg>":e===3?"<math>":"",a=Ie;for(let l=0;l<t;l++){const c=s[l];let h,b,y=-1,R=0;for(;R<c.length&&(a.lastIndex=R,b=a.exec(c),b!==null);)R=a.lastIndex,a===Ie?b[1]==="!--"?a=ai:b[1]!==void 0?a=oi:b[2]!==void 0?(Oi.test(b[2])&&(n=RegExp("</"+b[2],"g")),a=ie):b[3]!==void 0&&(a=ie):a===ie?b[0]===">"?(a=n??Ie,y=-1):b[1]===void 0?y=-2:(y=a.lastIndex-b[2].length,h=b[1],a=b[3]===void 0?ie:b[3]==='"'?di:li):a===di||a===li?a=ie:a===ai||a===oi?a=Ie:(a=ie,n=void 0);const Y=a===ie&&s[l+1].startsWith("/>")?" ":"";r+=a===Ie?c+Ss:y>=0?(i.push(h),c.slice(0,y)+Ni+c.slice(y)+J+Y):c+J+(y===-2?l:Y)}return[Bi(s,r+(s[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),i]};class Re{constructor({strings:e,_$litType$:t},i){let n;this.parts=[];let r=0,a=0;const l=e.length-1,c=this.parts,[h,b]=Ps(e,t);if(this.el=Re.createElement(h,i),ae.currentNode=this.el.content,t===2||t===3){const y=this.el.content.firstChild;y.replaceWith(...y.childNodes)}for(;(n=ae.nextNode())!==null&&c.length<l;){if(n.nodeType===1){if(n.hasAttributes())for(const y of n.getAttributeNames())if(y.endsWith(Ni)){const R=b[a++],Y=n.getAttribute(y).split(J),Ve=/([.?@])?(.*)/.exec(R);c.push({type:1,index:r,name:Ve[2],strings:Y,ctor:Ve[1]==="."?Ds:Ve[1]==="?"?Ls:Ve[1]==="@"?Ms:nt}),n.removeAttribute(y)}else y.startsWith(J)&&(c.push({type:6,index:r}),n.removeAttribute(y));if(Oi.test(n.tagName)){const y=n.textContent.split(J),R=y.length-1;if(R>0){n.textContent=Qe?Qe.emptyScript:"";for(let Y=0;Y<R;Y++)n.append(y[Y],Me()),ae.nextNode(),c.push({type:2,index:++r});n.append(y[R],Me())}}}else if(n.nodeType===8)if(n.data===Ri)c.push({type:2,index:r});else{let y=-1;for(;(y=n.data.indexOf(J,y+1))!==-1;)c.push({type:7,index:r}),y+=J.length-1}r++}}static createElement(e,t){const i=de.createElement("template");return i.innerHTML=e,i}}function we(s,e,t=s,i){if(e===U)return e;let n=i!==void 0?t._$Co?.[i]:t._$Cl;const r=Ne(e)?void 0:e._$litDirective$;return n?.constructor!==r&&(n?._$AO?.(!1),r===void 0?n=void 0:(n=new r(s),n._$AT(s,t,i)),i!==void 0?(t._$Co??=[])[i]=n:t._$Cl=n),n!==void 0&&(e=we(s,n._$AS(s,e.values),n,i)),e}class Ts{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,n=(e?.creationScope??de).importNode(t,!0);ae.currentNode=n;let r=ae.nextNode(),a=0,l=0,c=i[0];for(;c!==void 0;){if(a===c.index){let h;c.type===2?h=new Be(r,r.nextSibling,this,e):c.type===1?h=new c.ctor(r,c.name,c.strings,this,e):c.type===6&&(h=new Ns(r,this,e)),this._$AV.push(h),c=i[++l]}a!==c?.index&&(r=ae.nextNode(),a++)}return ae.currentNode=de,n}p(e){let t=0;for(const i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class Be{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,n){this.type=2,this._$AH=d,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=n,this._$Cv=n?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=we(this,e,t),Ne(e)?e===d||e==null||e===""?(this._$AH!==d&&this._$AR(),this._$AH=d):e!==this._$AH&&e!==U&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Is(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==d&&Ne(this._$AH)?this._$AA.nextSibling.data=e:this.T(de.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,n=typeof i=="number"?this._$AC(e):(i.el===void 0&&(i.el=Re.createElement(Bi(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===n)this._$AH.p(t);else{const r=new Ts(n,this),a=r.u(this.options);r.p(t),this.T(a),this._$AH=r}}_$AC(e){let t=ci.get(e.strings);return t===void 0&&ci.set(e.strings,t=new Re(e)),t}k(e){Ft(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,n=0;for(const r of e)n===t.length?t.push(i=new Be(this.O(Me()),this.O(Me()),this,this.options)):i=t[n],i._$AI(r),n++;n<t.length&&(this._$AR(i&&i._$AB.nextSibling,n),t.length=n)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const i=ni(e).nextSibling;ni(e).remove(),e=i}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}}class nt{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,n,r){this.type=1,this._$AH=d,this._$AN=void 0,this.element=e,this.name=t,this._$AM=n,this.options=r,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=d}_$AI(e,t=this,i,n){const r=this.strings;let a=!1;if(r===void 0)e=we(this,e,t,0),a=!Ne(e)||e!==this._$AH&&e!==U,a&&(this._$AH=e);else{const l=e;let c,h;for(e=r[0],c=0;c<r.length-1;c++)h=we(this,l[i+c],t,c),h===U&&(h=this._$AH[c]),a||=!Ne(h)||h!==this._$AH[c],h===d?e=d:e!==d&&(e+=(h??"")+r[c+1]),this._$AH[c]=h}a&&!n&&this.j(e)}j(e){e===d?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class Ds extends nt{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===d?void 0:e}}class Ls extends nt{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==d)}}class Ms extends nt{constructor(e,t,i,n,r){super(e,t,i,n,r),this.type=5}_$AI(e,t=this){if((e=we(this,e,t,0)??d)===U)return;const i=this._$AH,n=e===d&&i!==d||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,r=e!==d&&(i===d||n);n&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class Ns{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){we(this,e)}}const Rs=Bt.litHtmlPolyfillSupport;Rs?.(Re,Be),(Bt.litHtmlVersions??=[]).push("3.3.3");const Os=(s,e,t)=>{const i=t?.renderBefore??e;let n=i._$litPart$;if(n===void 0){const r=t?.renderBefore??null;i._$litPart$=n=new Be(e.insertBefore(Me(),r),r,void 0,t??{})}return n._$AI(s),n};const Ut=globalThis;let A=class extends be{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Os(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return U}};A._$litElement$=!0,A.finalized=!0,Ut.litElementHydrateSupport?.({LitElement:A});const Bs=Ut.litElementPolyfillSupport;Bs?.({LitElement:A});(Ut.litElementVersions??=[]).push("4.2.2");const Fs={attribute:!0,type:String,converter:Ze,reflect:!1,hasChanged:Ot},Us=(s=Fs,e,t)=>{const{kind:i,metadata:n}=t;let r=globalThis.litPropertyMetadata.get(n);if(r===void 0&&globalThis.litPropertyMetadata.set(n,r=new Map),i==="setter"&&((s=Object.create(s)).wrapped=!0),r.set(t.name,s),i==="accessor"){const{name:a}=t;return{set(l){const c=e.get.call(this);e.set.call(this,l),this.requestUpdate(a,c,s,!0,l)},init(l){return l!==void 0&&this.C(a,void 0,s,l),l}}}if(i==="setter"){const{name:a}=t;return function(l){const c=this[a];e.call(this,l),this.requestUpdate(a,c,s,!0,l)}}throw Error("Unsupported decorator location: "+i)};function p(s){return(e,t)=>typeof t=="object"?Us(s,e,t):((i,n,r)=>{const a=n.hasOwnProperty(r);return n.constructor.createProperty(r,i),a?Object.getOwnPropertyDescriptor(n,r):void 0})(s,e,t)}function g(s){return p({...s,state:!0,attribute:!1})}const M=k`
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
`,ce=k`
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
`,Ht=k`
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
`,Fi=k`
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
`,j=k`
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
`,Ui=k`
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
`,qt=k`
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
`,Hi=k`
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
`,qi=k`
  .feedback {
    margin-bottom: var(--studio-section-gap);
    padding: 12px 14px;
    border: 1px solid var(--studio-border);
    border-radius: var(--studio-button-radius);
    background: var(--studio-card);
    line-height: 1.45;
  }
`;var Hs=Object.defineProperty,Vt=(s,e,t,i)=>{for(var n=void 0,r=s.length-1,a;r>=0;r--)(a=s[r])&&(n=a(e,t,n)||n);return n&&Hs(e,t,n),n};class rt extends A{constructor(){super(...arguments),this.label="",this.checked=!1,this.disabled=!1}render(){return o`
      <label class="check-field">
        <input
          type="checkbox"
          .checked=${this.checked}
          ?disabled=${this.disabled}
          @change=${this.checkedChanged}
        />
        <span class="parameter-label">${this.label}</span>
      </label>
    `}checkedChanged(e){this.dispatchEvent(new CustomEvent("checked-changed",{detail:{checked:e.target.checked},bubbles:!0,composed:!0}))}static{this.styles=[M,j,k`
      :host {
        display: block;
      }
    `]}}Vt([p()],rt.prototype,"label");Vt([p({type:Boolean})],rt.prototype,"checked");Vt([p({type:Boolean})],rt.prototype,"disabled");customElements.get("govee-checkbox-control")||customElements.define("govee-checkbox-control",rt);var qs=Object.defineProperty,ue=(s,e,t,i)=>{for(var n=void 0,r=s.length-1,a;r>=0;r--)(a=s[r])&&(n=a(e,t,n)||n);return n&&qs(e,t,n),n};class ee extends A{constructor(){super(...arguments),this.items=[],this.ariaLabel="Items",this.itemRole="button",this.addLabel="Add item",this.addDisabled=!1,this.reorderDisabled=!1,this.pointerX=0,this.pointerY=0,this.pointerMoved=!1,this.suppressClick=!1}render(){const e=this.itemRole==="tab";return o`
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
              @dragstart=${n=>this.dragStarted(i,n)}
              @dragover=${n=>{this.reorderDisabled||n.preventDefault()}}
              @drop=${n=>this.dropped(i,n)}
              @pointerdown=${n=>this.pointerStarted(i,n)}
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
                @keydown=${n=>this.keyPressed(i,n)}
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
    `}focusItem(e){this.updateComplete.then(()=>{this.shadowRoot?.querySelectorAll(".item")[e]?.focus()})}itemClicked(e){if(this.suppressClick){this.suppressClick=!1;return}this.dispatchEvent(new CustomEvent("item-selected",{detail:{index:e},bubbles:!0,composed:!0}))}addClicked(){this.dispatchEvent(new CustomEvent("item-added",{bubbles:!0,composed:!0}))}dragStarted(e,t){this.reorderDisabled||(this.draggedIndex=e,t.dataTransfer?.setData("text/plain",String(e)))}dropped(e,t){t.preventDefault(),this.draggedIndex!==void 0&&(this.reorder(this.draggedIndex,e),this.draggedIndex=void 0)}keyPressed(e,t){if(t.key!=="ArrowLeft"&&t.key!=="ArrowRight")return;t.preventDefault();const i=e+(t.key==="ArrowLeft"?-1:1);if(!(i<0||i>=this.items.length)){if(this.reorderDisabled){this.itemRole==="tab"&&(this.itemClicked(i),this.focusItem(i));return}this.reorder(e,i,!0)}}pointerStarted(e,t){this.reorderDisabled||t.pointerType==="mouse"||t.target.closest(".strip-popover")||(this.pointerId=t.pointerId,this.pointerIndex=e,this.pointerX=t.clientX,this.pointerY=t.clientY,this.pointerMoved=!1,t.currentTarget.setPointerCapture(t.pointerId))}pointerMovedOver(e){if(e.pointerId!==this.pointerId||this.pointerIndex===void 0)return;const t=e.clientX-this.pointerX,i=e.clientY-this.pointerY;if(!this.pointerMoved){if(Math.abs(i)>Math.abs(t)||Math.abs(t)<10)return;this.pointerMoved=!0}e.preventDefault();const n=this.shadowRoot?.elementFromPoint(e.clientX,e.clientY)?.closest("[data-item-index]"),r=Number(n?.dataset.itemIndex);!Number.isInteger(r)||r===this.pointerIndex||(this.reorder(this.pointerIndex,r),this.pointerIndex=r)}pointerFinished(e){if(e.pointerId!==this.pointerId)return;const t=e.currentTarget;t.hasPointerCapture(e.pointerId)&&t.releasePointerCapture(e.pointerId),this.suppressClick=this.pointerMoved,this.pointerId=void 0,this.pointerIndex=void 0,this.pointerMoved=!1}reorder(e,t,i=!1){this.reorderDisabled||e===t||(this.dispatchEvent(new CustomEvent("items-reordered",{detail:{from:e,to:t},bubbles:!0,composed:!0})),i&&this.focusItem(t))}static{this.styles=[M,k`
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
  `]}}ue([p({attribute:!1})],ee.prototype,"items");ue([p({attribute:!1})],ee.prototype,"activeIndex");ue([p()],ee.prototype,"ariaLabel");ue([p()],ee.prototype,"itemRole");ue([p()],ee.prototype,"addLabel");ue([p({type:Boolean})],ee.prototype,"addDisabled");ue([p({type:Boolean})],ee.prototype,"reorderDisabled");customElements.get("govee-reorderable-strip")||customElements.define("govee-reorderable-strip",ee);var Vs=Object.defineProperty,Fe=(s,e,t,i)=>{for(var n=void 0,r=s.length-1,a;r>=0;r--)(a=s[r])&&(n=a(e,t,n)||n);return n&&Vs(e,t,n),n};class Ce extends A{constructor(){super(...arguments),this.label="",this.options=[],this.value="",this.disabled=!1,this.hideLabel=!1}render(){return o`
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
    `}select(e){this.disabled||e===this.value||this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}static{this.styles=[M,j,k`
      :host {
        display: block;
      }
    `]}}Fe([p()],Ce.prototype,"label");Fe([p({attribute:!1})],Ce.prototype,"options");Fe([p({attribute:!1})],Ce.prototype,"value");Fe([p({type:Boolean})],Ce.prototype,"disabled");Fe([p({type:Boolean})],Ce.prototype,"hideLabel");customElements.get("govee-segmented-control")||customElements.define("govee-segmented-control",Ce);var Ks=Object.defineProperty,G=(s,e,t,i)=>{for(var n=void 0,r=s.length-1,a;r>=0;r--)(a=s[r])&&(n=a(e,t,n)||n);return n&&Ks(e,t,n),n};class H extends A{constructor(){super(...arguments),this.label="",this.value=0,this.minimum=0,this.maximum=100,this.step=1,this.disabled=!1,this.showValue=!1}render(){const e=js(this.value,this.minimum,this.maximum),t=this.valueText??String(e);return o`
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
    `}inputChanged(e){this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:Number(e.target.value)},bubbles:!0,composed:!0}))}static{this.styles=[M,j,k`
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
    `]}}G([p()],H.prototype,"label");G([p({type:Number})],H.prototype,"value");G([p({type:Number})],H.prototype,"minimum");G([p({type:Number})],H.prototype,"maximum");G([p({type:Number})],H.prototype,"step");G([p({type:Boolean})],H.prototype,"disabled");G([p({type:Boolean})],H.prototype,"showValue");G([p({attribute:!1})],H.prototype,"valueText");G([p({attribute:!1})],H.prototype,"describedBy");function js(s,e,t){return Math.min(t,Math.max(e,s))}customElements.get("govee-slider-control")||customElements.define("govee-slider-control",H);var Gs=Object.defineProperty,Kt=(s,e,t,i)=>{for(var n=void 0,r=s.length-1,a;r>=0;r--)(a=s[r])&&(n=a(e,t,n)||n);return n&&Gs(e,t,n),n};class at extends A{constructor(){super(...arguments),this.label="",this.checked=!1,this.disabled=!1}render(){return o`
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
    `}toggle(){this.dispatchEvent(new CustomEvent("checked-changed",{detail:{checked:!this.checked},bubbles:!0,composed:!0}))}static{this.styles=[M,k`
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
    `]}}Kt([p()],at.prototype,"label");Kt([p({type:Boolean})],at.prototype,"checked");Kt([p({type:Boolean})],at.prototype,"disabled");customElements.get("govee-switch-control")||customElements.define("govee-switch-control",at);function Z(s){return s.map(e=>[...e])}function w(s){return`#${s.map(e=>e.toString(16).padStart(2,"0")).join("")}`}function ui(s){return[Number.parseInt(s.slice(1,3),16),Number.parseInt(s.slice(3,5),16),Number.parseInt(s.slice(5,7),16)]}function Le(s,e){return s.localeCompare(e,"en-AU",{sensitivity:"base"})}function et(s,e,t){return s===void 0||e===t?s:s===e?t:e<t&&s>e&&s<=t?s-1:t<e&&s>=t&&s<e?s+1:s}function N(s){return s instanceof Error||typeof s=="object"&&s!==null&&"message"in s&&typeof s.message=="string"?s.message:"An unexpected error occurred."}function Et(s){if(typeof s=="object"&&s!==null&&"code"in s&&typeof s.code=="string")return s.code}var zs=Object.defineProperty,pe=(s,e,t,i)=>{for(var n=void 0,r=s.length-1,a;r>=0;r--)(a=s[r])&&(n=a(e,t,n)||n);return n&&zs(e,t,n),n};const me=5,pi=8,hi=15,Vi=[1,2,0,3],Ki=[0,1,2,3],Ys=[1,2,3,4,5].map(s=>({value:s,label:String(s)})),Ws={0:"Segment",1:"Continuous",2:"Random",3:"Custom"},Xs={0:"Brightest to darkest",1:"Brightest, darkest, brightest",2:"Darkest to brightest",3:"Darkest, brightest, darkest"},mi={0:"Forward",1:"Backward",2:"Forward and back",3:"Back and forward"};class te extends A{constructor(){super(...arguments),this.disabled=!1,this.segmentCount=hi,this.activeLayerIndex=0,this.activePatternIndex=0,this.movementAnnouncement=""}willUpdate(e){if(!(!e.has("content")||!this.content)){if(this.content.layers.length===0){this.activeLayerIndex=0,this.activePatternIndex=0;return}if(this.activeLayerIndex=ve(this.activeLayerIndex,0,this.content.layers.length-1),this.activeLayer.brightness_patterns.length===0){this.activePatternIndex=0;return}this.activePatternIndex=ve(this.activePatternIndex,0,this.activeLayer.brightness_patterns.length-1)}}render(){if(!this.content)return d;if(this.content.layers.length===0)return this.renderEmptyLayers();const e=this.activeLayer,t=this.content.layers.map((i,n)=>({key:`layer-${n}`,label:`Layer ${n+1}`,ariaLabel:`Layer ${n+1}. Drag to reorder or use arrow keys.`,id:`advanced-layer-tab-${n}`,ariaControls:"advanced-layer-panel"}));return o`
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
          .addDisabled=${this.disabled||this.content.layers.length>=me}
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
                    ?disabled=${this.disabled||this.content.layers.length>=me}
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
    `}get activeLayer(){return this.content.layers[this.activeLayerIndex]}renderAppliedArea(e){const t=e.area.start_tenths>=0&&e.area.start_tenths<=9&&e.area.width_tenths>=1&&e.area.width_tenths<=10-e.area.start_tenths,i=ve(e.area.start_tenths,0,9),n=i+e.area.width_tenths,r=Number.isInteger(this.segmentCount)&&this.segmentCount>0?this.segmentCount:hi,a=w(e.palette[0]??[47,111,237]);return o`
      <section class="card wide-card">
        <h3 class="section-title">Applied area</h3>
        <div class="area-control">
          <div
            class="area-segments"
            style="--area-segment-count: ${r}; --area-colour: ${a};"
            aria-label="Applied area, ${r} segments"
          >
            ${Array.from({length:r},(l,c)=>o`
                <span
                  class=${t&&tn(c,r,i,n)?"covered":""}
                  aria-hidden="true"
                ></span>
              `)}
          </div>
          ${t?o`
                <div class="area-boundaries">
                  <label class="area-boundary">
                    <span>
                      <span>Left edge</span>
                      <output aria-label="Applied area left edge value"
                        >${i*10}%</output
                      >
                    </span>
                    <input
                      type="range"
                      min="0"
                      max=${n-1}
                      step="1"
                      .value=${String(i)}
                      aria-label="Applied area left edge"
                      aria-valuetext="${i*10}%"
                      ?disabled=${this.disabled}
                      @input=${l=>this.setAppliedArea(Number(l.target.value),n)}
                    />
                  </label>
                  <label class="area-boundary">
                    <span>
                      <span>Right edge</span>
                      <output aria-label="Applied area right edge value"
                        >${n*10}%</output
                      >
                    </span>
                    <input
                      type="range"
                      min=${i+1}
                      max="10"
                      step="1"
                      .value=${String(n)}
                      aria-label="Applied area right edge"
                      aria-valuetext="${n*10}%"
                      ?disabled=${this.disabled}
                      @input=${l=>this.setAppliedArea(i,Number(l.target.value))}
                    />
                  </label>
                </div>
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
    `}setAppliedArea(e,t){this.updateLayer({area:{start_tenths:e,width_tenths:t-e}})}renderSelectionControls(e){const t=e.selection,i=Js(t.type);return o`
      <div class="selection-controls">
        <span class="parameter-label">Selection</span>
        <label class="field">
          <span>Type</span>
          <select
            aria-label="Selection type"
            .value=${String(t.type)}
            ?disabled=${this.disabled}
            @change=${n=>this.updateSelection({type:Number(n.target.value)})}
          >
            ${Vi.map(n=>o`<option
                  value=${n}
                  .selected=${t.type===n}
                >
                  ${Ws[n]}
                </option>`)}
            ${i?d:o`
                  <option value=${t.type} .selected=${!0}>
                    Raw type ${t.type} (0x${Ke(t.type)})
                  </option>
                `}
          </select>
        </label>
        ${i?d:o`
              <p class="muted">
                Selection type ${t.type} is not defined by the known
                schema. Its raw value and parameters remain preserved.
              </p>
              ${this.byteNumberField("Type (raw byte)",t.type,n=>this.updateSelection({type:n}))}
            `}
        ${t.type===0?o`
              ${this.byteNumberField("Segments",t.param_2,n=>this.updateSelection({param_2:n}))}
              ${this.byteNumberField("Parameter 1 (raw byte)",t.param_1,n=>this.updateSelection({param_1:n}))}
            `:t.type===1?o`
                ${this.byteNumberField("Count",t.param_2,n=>this.updateSelection({param_2:n}))}
                ${this.byteNumberField("Parameter 1 (raw byte)",t.param_1,n=>this.updateSelection({param_1:n}))}
              `:t.type===2?o`
                  ${this.byteNumberField("Minimum",t.param_2,n=>this.updateSelection({param_2:n}))}
                  ${this.byteNumberField("Maximum",t.param_1,n=>this.updateSelection({param_1:n}))}
                `:t.type===3?o`
                  ${this.byteNumberField("Lit length",t.param_1,n=>this.updateSelection({param_1:n}))}
                  ${this.byteNumberField("Gap",t.param_2,n=>this.updateSelection({param_2:n}))}
                `:o`
                    ${this.byteNumberField("Parameter 1 (raw byte)",t.param_1,n=>this.updateSelection({param_1:n}))}
                    ${this.byteNumberField("Parameter 2 (raw byte)",t.param_2,n=>this.updateSelection({param_2:n}))}
                  `}
      </div>
    `}renderPalette(e){return o`
      <section class="card">
        <h3 class="section-title">Colours</h3>
        <govee-palette-editor
          .palette=${e.palette}
          .minColours=${1}
          .maxColours=${pi}
          .disabled=${this.disabled}
          @palette-changed=${t=>this.updateLayer({palette:t.detail.palette.map(i=>[...i])})}
        ></govee-palette-editor>
        ${e.palette.length>pi?o`
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
      `;const t=ve(this.activePatternIndex,0,e.brightness_patterns.length-1),i=e.brightness_patterns[t],n=Zs(i.order);return o`
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
              ${Ki.map(r=>o`<option value=${r}>
                    ${Xs[r]}
                  </option>`)}
              ${n?d:o`
                    <option value=${i.order} .selected=${!0}>
                      Raw order ${i.order} (0x${Ke(i.order)})
                    </option>
                  `}
            </select>
          </label>
          ${n?d:o`
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
    `}renderMovement(e,t,i){const n=e[t];return o`
      <section class="card">
        <div class="card-heading">
          <h3 class="section-title">${i}</h3>
          <govee-switch-control
            .label=${`${i} enabled`}
            .checked=${n.enabled}
            .disabled=${this.disabled}
            @checked-changed=${r=>this.updateMovement(t,{enabled:r.detail.checked},`${i} ${r.detail.checked?"enabled":"disabled"}.`)}
          ></govee-switch-control>
        </div>
        ${n.enabled?o`
              ${this.byteNumberField("Distance",n.distance,r=>this.updateMovement(t,{distance:r},`${i} distance ${r}.`))}
              <label class="field">
                <span>Direction</span>
                <select
                  .value=${String(n.direction)}
                  ?disabled=${this.disabled}
                  @change=${r=>{const a=Number(r.target.value);this.updateMovement(t,{direction:a},`${i} direction ${mi[a]}.`)}}
                >
                  ${Object.entries(mi).map(([r,a])=>o`<option value=${r}>${a}</option>`)}
                </select>
              </label>
              ${this.rangeField("Speed",n.speed,0,255,r=>this.updateMovement(t,{speed:r},`${i} speed ${Qs(r)} per cent.`))}
              <govee-checkbox-control
                class="movement-enter-exit"
                label="Enter and exit"
                .checked=${n.enter_exit}
                .disabled=${this.disabled}
                @checked-changed=${r=>{const a=r.detail.checked;this.updateMovement(t,{enter_exit:a},`${i} enter and exit ${a?"enabled":"disabled"}.`)}}
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
                .options=${Ys}
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
    `}rangeField(e,t,i,n,r){return o`
      <govee-slider-control
        .label=${e}
        .value=${t}
        .minimum=${i}
        .maximum=${n}
        .disabled=${this.disabled}
        @value-changed=${a=>r(a.detail.value)}
      ></govee-slider-control>
    `}byteNumberField(e,t,i){return this.numberField(e,t,0,255,i)}numberField(e,t,i,n,r){return o`
      <label class="field">
        <span>${e}</span>
        <input
          type="number"
          min=${i}
          max=${n}
          .value=${String(t)}
          ?disabled=${this.disabled}
          @change=${a=>r(ve(Number(a.target.value),i,n))}
        />
      </label>
    `}hexByteField(e,t,i,n=255){return o`
      <label class="field">
        <span>${e}</span>
        <input
          type="text"
          inputmode="text"
          spellcheck="false"
          .value=${Ke(t)}
          ?disabled=${this.disabled}
          @change=${r=>{const a=r.target,l=en(a.value);if(l===void 0){a.setCustomValidity("Enter one byte from 00 to FF."),a.reportValidity();return}if((l&~n)!==0){a.setCustomValidity(`Known flag bits are controlled elsewhere. Allowed mask: ${Ke(n)}.`),a.reportValidity();return}a.setCustomValidity(""),i(l)}}
        />
      </label>
    `}updateLayer(e){if(!this.content||this.disabled)return;const t=this.content.layers.map((i,n)=>n===this.activeLayerIndex?X({...i,...e}):X(i));this.emitContent({kind:"advanced",layers:t})}updateSelection(e){this.updateLayer({selection:{...this.activeLayer.selection,...e}})}updateBrightnessPattern(e){const t=this.activeLayer.brightness_patterns.map((i,n)=>n===this.activePatternIndex?{...i,...e}:{...i});this.updateLayer({brightness_patterns:t})}updateMovement(e,t,i){this.updateLayer({[e]:{...this.activeLayer[e],...t}}),i&&(this.movementAnnouncement=i)}addLayer(){if(!this.content||this.disabled||this.content.layers.length>=me)return;const e=[...this.content.layers.map(X),ji()];this.installContent({kind:"advanced",layers:e}),this.activeLayerIndex=e.length-1,this.activePatternIndex=0,this.layerActionsIndex=void 0,this.focusActiveTab()}copyLayer(){if(!this.content||this.disabled||this.content.layers.length>=me)return;const e=this.content.layers.map(X);e.splice(this.activeLayerIndex+1,0,X(this.activeLayer)),this.installContent({kind:"advanced",layers:e}),this.activeLayerIndex+=1,this.activePatternIndex=0,this.layerActionsIndex=this.activeLayerIndex,this.focusActiveTab()}deleteLayer(){if(!this.content||this.disabled||this.content.layers.length===1)return;const e=this.content.layers.filter((t,i)=>i!==this.activeLayerIndex).map(X);this.activeLayerIndex=Math.min(this.activeLayerIndex,e.length-1),this.activePatternIndex=0,this.layerActionsIndex=void 0,this.emitContent({kind:"advanced",layers:e}),this.focusActiveTab()}reorderLayer(e,t){if(!this.content||this.disabled||e<0||e>=this.content.layers.length||t<0||t>=this.content.layers.length||e===t)return;const i=this.content.layers.map(X),[n]=i.splice(e,1);i.splice(t,0,n),this.activeLayerIndex=et(this.activeLayerIndex,e,t),this.layerActionsIndex!==void 0&&(this.layerActionsIndex=et(this.layerActionsIndex,e,t)),this.emitContent({kind:"advanced",layers:i})}addBrightnessPattern(){if(this.disabled||this.activeLayer.brightness_patterns.length>=3)return;const e=[...this.activeLayer.brightness_patterns.map(t=>({...t})),Gi()];this.activePatternIndex=e.length-1,this.updateLayer({brightness_patterns:e})}deleteBrightnessPattern(){if(this.disabled||this.activeLayer.brightness_patterns.length===1)return;const e=this.activeLayer.brightness_patterns.filter((t,i)=>i!==this.activePatternIndex).map(t=>({...t}));this.activePatternIndex=Math.min(this.activePatternIndex,e.length-1),this.updateLayer({brightness_patterns:e})}selectLayer(e){if(e===this.activeLayerIndex){this.layerActionsIndex=this.layerActionsIndex===e?void 0:e;return}this.activeLayerIndex=e,this.activePatternIndex=0,this.layerActionsIndex=e}patternTabKeyPressed(e,t){const i=this.activeLayer.brightness_patterns.length;let n;t.key==="ArrowLeft"?n=e===0?i-1:e-1:t.key==="ArrowRight"?n=e===i-1?0:e+1:t.key==="Home"?n=0:t.key==="End"&&(n=i-1),n!==void 0&&(t.preventDefault(),this.activePatternIndex=n,this.updateComplete.then(()=>{this.shadowRoot?.querySelectorAll(".pattern-tabs button")[n]?.focus()}))}focusActiveTab(){this.updateComplete.then(()=>{this.shadowRoot?.querySelector("govee-reorderable-strip")?.focusItem(this.activeLayerIndex)})}excessChanged(e){const t=e.value.replace(/\s+/g,"").toLowerCase();if(!/^(?:[0-9a-f]{2})*$/.test(t)){e.setCustomValidity("Enter an even number of hexadecimal digits."),e.reportValidity();return}e.setCustomValidity(""),this.updateLayer({excess:t})}emitContent(e){this.dispatchEvent(new CustomEvent("content-changed",{detail:{content:e},bubbles:!0,composed:!0}))}installContent(e){this.content=e,this.emitContent(e)}static{this.styles=[M,ce,Ht,j,qt,k`
    :host {
      display: block;
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
      margin-bottom: 16px;
      padding: 4px 0;
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

    .area-boundaries {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
      margin-top: 18px;
    }

    .area-boundary {
      display: grid;
      gap: 8px;
    }

    .area-boundary > span {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 12px;
      color: var(--studio-muted);
      font-size: var(--studio-parameter-label-size);
      font-weight: var(--studio-parameter-label-weight);
    }

    .area-boundary output {
      color: var(--primary-text-color);
      font-variant-numeric: tabular-nums;
    }

    .area-boundary input {
      width: 100%;
      min-width: 0;
      min-height: 44px;
      margin: 0;
      accent-color: var(--studio-blue);
    }

    .area-boundary input:focus-visible {
      outline: 3px solid var(--studio-blue);
      outline-offset: 2px;
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
      .area-boundaries,
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

  `]}}pe([p({attribute:!1})],te.prototype,"content");pe([p({type:Boolean})],te.prototype,"disabled");pe([p({type:Number})],te.prototype,"segmentCount");pe([g()],te.prototype,"activeLayerIndex");pe([g()],te.prototype,"activePatternIndex");pe([g()],te.prototype,"movementAnnouncement");pe([g()],te.prototype,"layerActionsIndex");function pt(){return{kind:"advanced",layers:[ji()]}}function $e(s){return{kind:"advanced",layers:s.layers.map(X)}}function oe(s){return{...s,template:{...s.template},effect:{layers:$e({layers:s.effect.layers}).layers}}}function ji(){return{area:{start_tenths:0,width_tenths:10},selection:{type:0,param_1:0,param_2:1},brightness_gradient:!1,brightness_patterns:[Gi()],distribution:{method:1,backwards:!1},colour_speed:128,colour_retention:20,palette:[[255,0,0],[0,0,255]],selected_movement:fi(),overall_movement:fi(),priority:0,unknown_flags:0,excess:""}}function Gi(){return{scope_high:255,scope_low:0,order:0,change_speed:128,brightest_retention:20,darkest_retention:20}}function fi(){return{enabled:!1,enter_exit:!1,direction:0,distance:1,speed:128,unknown_flags:0}}function X(s){return{...s,area:{...s.area},selection:{...s.selection},brightness_patterns:s.brightness_patterns.map(e=>({...e})),distribution:{...s.distribution},palette:s.palette.map(e=>[...e]),selected_movement:{...s.selected_movement},overall_movement:{...s.overall_movement}}}function Js(s){return Vi.includes(s)}function Zs(s){return Ki.includes(s)}function Qs(s){return Math.round(ve(s,0,255)/255*100)}function Ke(s){return s.toString(16).padStart(2,"0").toUpperCase()}function en(s){const e=s.trim().replace(/^0x/i,"");if(/^[0-9a-f]{1,2}$/i.test(e))return Number.parseInt(e,16)}function tn(s,e,t,i){const n=s*10/e;return(s+1)*10/e>t&&n<i}function ve(s,e,t){return Math.min(t,Math.max(e,Math.round(s)))}customElements.get("govee-advanced-effect-editor")||customElements.define("govee-advanced-effect-editor",te);const sn=2,zi=1,nn=3,rn=["compiling","pending","uploading","activating","verifying","confirmed","applied","uncertain","recovering","failed","interrupted","unknown"],ht=["compiling","pending","uploading","activating","verifying","recovering"],gi=5,L=128,Se=65536,Yi=512,Wi=256,Xi=32,Ji=128,Zi=512,_=255,an=64,Qi=262144,bi=16,on=4096,es=16384,O=1024,mt=16384,jt=Number.MAX_SAFE_INTEGER,Ct=4335,ln=232,dn=253,le=["H617A","H6199"],ft="H617A",ts=["movie","game"],vi=["native_scenes","edited_palette_scenes","layered_scenes","painted","single","multi","native_music","video","palette_diy","advanced","workshop","special_diy"],cn=["studio","home_assistant","planned"],un=["exact_session","activation_match","settings_match","mode_match","write_completed","unknown"],pn={H617A:["native_scenes","edited_palette_scenes","layered_scenes","painted","single","multi","native_music","advanced","workshop","special_diy"],H6199:["native_scenes","edited_palette_scenes","layered_scenes","palette_diy","native_music","video","advanced","workshop","special_diy"]};function hn(s){const e=m(s,"editor info"),t=m(e.limits,"editor limits");return{api_version:u(e.api_version,"API version",1),effect_schema_version:u(e.effect_schema_version,"effect schema version",1),compiler_version:u(e.compiler_version,"compiler version",1),limits:{effect_name:K(t.effect_name,L,"effect-name limit"),effect_document_bytes:K(t.effect_document_bytes,Se,"effect-document limit"),devices:K(t.devices,Yi,"device limit"),library_items:K(t.library_items,Wi,"library-item limit"),drafts_per_owner:K(t.drafts_per_owner,Xi,"draft limit"),deployment_records:K(t.deployment_records,Ji,"deployment limit"),scene_catalogue_entries:K(t.scene_catalogue_entries,Zi,"scene catalogue limit")}}}function mn(s){const e=E(s,"devices",Yi).map((t,i)=>{const n=m(t,`devices[${i}]`),r=m(n.custom_effects,`devices[${i}].custom_effects`),a=m(n.profiles,`devices[${i}].profiles`);return{config_entry_id:f(n.config_entry_id,`devices[${i}].config_entry_id`,_),model:f(n.model,`devices[${i}].model`,_),display_name:f(n.display_name,`devices[${i}].display_name`,_),segment_count:u(n.segment_count,`devices[${i}].segment_count`,0,65535),custom_effects:{painted:S(r.painted,"painted capability"),single:S(r.single,"single capability"),multi:S(r.multi,"multi capability"),palette_diy:S(r.palette_diy,"palette DIY capability"),advanced:S(r.advanced,"advanced capability"),workshop:S(r.workshop,"Workshop capability"),special_diy:S(r.special_diy,"Special DIY capability")},profiles:{music:S(a.music,"music profile capability"),video:S(a.video,"video profile capability")},readback:f(n.readback,`devices[${i}].readback`,_)}});return F(e,t=>t.config_entry_id,"device IDs"),e}function fn(s){he(s,"custom-effect catalogue",Qi,es);const e=m(s,"custom-effect catalogue"),t=gn(e.models),i=St(e,"custom-effect catalogue",ft);if(JSON.stringify(i)!==JSON.stringify(t[ft]))throw new Error("Malformed Effect Studio server payload: legacy custom-effect catalogue view does not match models.H617A.");return K(e.schema_version,gi,"catalogue schema"),{...i,schema_version:gi,sku:ft,models:t}}function gn(s){const e=m(s,"custom-effect catalogue models"),i=Object.keys(e).filter(n=>!le.includes(n));if(i.length>0)throw new Error(`Malformed Effect Studio server payload: unexpected catalogue models ${i.join(", ")}.`);for(const n of le)if(!(n in e))throw new Error(`Malformed Effect Studio server payload: missing catalogue model ${n}.`);return{H617A:St(e.H617A,"catalogue model H617A","H617A"),H6199:St(e.H6199,"catalogue model H6199","H6199")}}function St(s,e,t){const i=m(s,e),n=m(i.limits,`${e} limits`),r=m(i.supports,`${e} support capabilities`),a=m(i.apply,`${e} Apply capabilities`),l=P(i.sku,le,`${e} SKU`);if(l!==t)throw new Error(`Malformed Effect Studio server payload: ${e} is keyed as ${t} but declares ${l}.`);const c=u(n.music_sensitivity_min,`${e} minimum music sensitivity`,0,100),h=u(n.music_sensitivity_max,`${e} maximum music sensitivity`,0,100);return c>h&&v(`${e} music sensitivity limits are inverted`),{sku:l,painted_effects:vn(i.painted_effects,`${e} painted-effect templates`),effects:yn(i.effects,`${e} custom-effect templates`),music_modes:yi(i.music_modes,`${e} music modes`),video_modes:yi(i.video_modes,`${e} video modes`,ts),workshop_templates:_n(i.workshop_templates,`${e} Workshop templates`,t),special_diy_templates:$n(i.special_diy_templates,`${e} Special DIY templates`,t),workflows:bn(i.workflows,`${e} release workflows`,t),supports:{multi:S(r.multi,`${e} Multi support`),advanced:S(r.advanced,`${e} advanced support`),workshop:S(r.workshop,`${e} Workshop support`),special_diy:S(r.special_diy,`${e} Special DIY support`)},limits:{palette_min:u(n.palette_min,`${e} minimum palette`,1,255),palette_max:u(n.palette_max,`${e} maximum palette`,1,255),multi_max:u(n.multi_max,`${e} maximum Multi effects`,1,255),music_sensitivity_min:c,music_sensitivity_max:h},apply:{painted:S(a.painted,`${e} Painted Apply capability`),single:S(a.single,`${e} Single Apply capability`),multi:S(a.multi,`${e} Multi Apply capability`),palette_diy:S(a.palette_diy,`${e} palette DIY Apply capability`),workshop:S(a.workshop,`${e} Workshop Apply capability`),special_diy:S(a.special_diy,`${e} Special DIY Apply capability`)}}}function bn(s,e,t){const i=E(s,e,vi.length).map((c,h)=>{const b=m(c,`${e}[${h}]`);return{id:P(b.id,vi,`${e}[${h}] ID`),label:f(b.label,`${e}[${h}] label`,L),content_kind:f(b.content_kind,`${e}[${h}] content kind`,_),application:P(b.application,cn,`${e}[${h}] application`)}});F(i,c=>c.id,`${e} IDs`);const n=pn[t],r=new Set(i.map(c=>c.id)),a=n.filter(c=>!r.has(c)),l=i.map(c=>c.id).filter(c=>!n.includes(c));if(a.length>0||l.length>0)throw new Error(`Malformed Effect Studio server payload: ${e} does not match ${t}.`);return i}function vn(s,e){const t=E(s,e,O).map((i,n)=>{const r=m(i,`${e}[${n}]`);return{id:P(r.id,["cycle","clockwise","counter_clockwise","twinkle","gradient","breathe"],`${e} ID`),label:f(r.label,`${e} label`,L)}});return F(t,i=>i.id,`${e} IDs`),t}function yn(s,e){const t=E(s,e,O).map((i,n)=>{const r=m(i,`${e}[${n}]`),a=E(r.variations,`${e}[${n}].variations`,O);if(a.length===0)throw new Error("Malformed Effect Studio server payload: custom-effect template has no variations.");const l={id:f(r.id,`${e}[${n}] ID`,_),label:f(r.label,`${e}[${n}] label`,L),family:u(r.family,`${e}[${n}] family`,0,255),variations:a.map((c,h)=>{const b=m(c,`${e}[${n}].variations[${h}]`);return{id:f(b.id,`${e}[${n}].variations[${h}] ID`,_),label:f(b.label,`${e}[${n}].variations[${h}] label`,L),variant:u(b.variant,`${e}[${n}].variations[${h}] variant`,0,255)}}),supports_multi:B(r.supports_multi,`${e}[${n}] Multi support`),rate:P(r.rate,["speed","sensitivity"],`${e}[${n}] rate parameter`),category:P(r.category,["single_layer"],`${e}[${n}] category`)};return F(l.variations,c=>c.id,`${e}[${n}] variation IDs`),l});return F(t,i=>i.id,`${e} IDs`),t}function yi(s,e,t){const i=E(s,e,O).map((n,r)=>{const a=m(n,`${e}[${r}]`);return{id:t?P(a.id,t,`${e}[${r}] ID`):f(a.id,`${e}[${r}] ID`,_),label:f(a.label,`${e}[${r}] label`,L)}});return F(i,n=>n.id,`${e} IDs`),i}function _n(s,e,t){const i=E(s,e,O).map((n,r)=>{const a=m(n,`${e}[${r}]`),l=ot(a.content);return(l.kind!=="workshop"||l.model!==t)&&v(`${e}[${r}] content does not target ${t}`),{id:f(a.id,`${e}[${r}] ID`,_),label:f(a.label,`${e}[${r}] label`,L),source_fixture:f(a.source_fixture,`${e}[${r}] source fixture`,_),content:l}});return F(i,n=>n.id,`${e} IDs`),i}function $n(s,e,t){const i=E(s,e,O).map((n,r)=>{const a=m(n,`${e}[${r}]`),l=ot(a.content);return(l.kind!=="special_diy"||l.model!==t)&&v(`${e}[${r}] content does not target ${t}`),{id:f(a.id,`${e}[${r}] ID`,_),label:f(a.label,`${e}[${r}] label`,L),source_fixture:f(a.source_fixture,`${e}[${r}] source fixture`,_),content:l}});return F(i,n=>n.id,`${e} IDs`),i}function _i(s){const e=m(s,"library snapshot"),t={library_revision:Q(e.library_revision,"library revision",0),items:E(e.items,"library items",Wi).map((i,n)=>{const r=m(i,`library items[${n}]`),a=r.template===void 0?void 0:tt(r.template,`library items[${n}].template`),l=r.model===void 0?void 0:Dn(r.model);return{id:f(r.id,"library item ID",_),revision:Q(r.revision,"library item revision",1),name:f(r.name,"library item name",L),kind:f(r.kind,"library item kind",_),...l?{model:l}:{},...a?{template:a}:{}}})};return F(t.items,i=>i.id,"library item IDs"),t}function Ye(s){he(s,"library item",Se);const e=m(s,"library item"),t=e.target_hint===void 0?void 0:m(e.target_hint,"target hint");return{schema_version:K(e.schema_version,zi,"effect schema version"),id:f(e.id,"effect ID",_),revision:Q(e.revision,"effect revision",1),name:f(e.name,"effect name",L),content:ot(e.content),provenance:At(e.provenance,"effect provenance"),extensions:At(e.extensions,"effect extensions"),...t?{target_hint:{model:t.model===null?null:f(t.model,"target model",_),segment_count:t.segment_count===null?null:u(t.segment_count,"target segment count",1,65535)}}:{}}}function xn(s){const e=E(s,"draft summaries",Xi).map((t,i)=>{const n=m(t,`draft summaries[${i}]`);return{id:f(n.id,"draft ID",_),revision:Q(n.revision,"draft revision",1),name:f(n.name,"draft name",L),updated_at:zt(n.updated_at,"draft timestamp"),selected_config_entry_id:xe(n.selected_config_entry_id,"draft config entry ID")}});return F(e,t=>t.id,"draft IDs"),e}function gt(s){const e=m(s,"effect draft");return{id:f(e.id,"draft ID",_),owner_id:f(e.owner_id,"draft owner",_),revision:Q(e.revision,"draft revision",1),item:Ye(e.item),updated_at:zt(e.updated_at,"draft timestamp"),selected_config_entry_id:xe(e.selected_config_entry_id,"draft config entry ID"),base_item_id:xe(e.base_item_id,"draft base item ID"),base_item_revision:e.base_item_revision===null?null:Q(e.base_item_revision,"draft base item revision",1)}}function It(s){const e=m(s,"deployment"),t=P(e.phase,rn,"deployment phase"),i={operation_id:f(e.operation_id,"deployment operation ID",_),config_entry_id:f(e.config_entry_id,"deployment config entry ID",_),diy_code:e.diy_code===null?null:u(e.diy_code,"deployment DIY code",0,65535),content_kind:f(e.content_kind,"deployment content kind",_),target_mode:P(e.target_mode,["custom","scene","music","video"],"deployment target mode"),target_effect:xe(e.target_effect,"deployment target effect"),phase:t,updated_at:zt(e.updated_at,"deployment timestamp"),item_id:xe(e.item_id,"deployment item ID"),item_revision:e.item_revision===null?null:Q(e.item_revision,"deployment item revision",1),error_code:xe(e.error_code,"deployment error code"),progress_current:u(e.progress_current,"deployment progress",0,1024),progress_total:u(e.progress_total,"deployment progress total",0,1024),verification_confidence:P(e.verification_confidence,un,"deployment verification confidence")};return i.progress_current>i.progress_total&&v("deployment progress exceeds its total"),i}function kn(s){const e=m(s,"deployment snapshot"),t={revision:Q(e.revision,"deployment revision",0),deployments:E(e.deployments,"deployments",Ji).map(It)};return F(t.deployments,i=>i.operation_id,"deployment operation IDs"),t}function wn(s){he(s,"scene catalogue",Qi,es);const e=m(s,"scene catalogue");return{schema_version:u(e.schema_version,"scene catalogue schema",1),sku:f(e.sku,"scene catalogue SKU",_),enabled:B(e.enabled,"scene catalogue enabled"),categories:E(e.categories,"scene categories",O).map((t,i)=>{const n=m(t,`scene categories[${i}]`);return{id:u(n.id,"scene category ID",0,65535),name:f(n.name,"scene category name",L)}}),scenes:E(e.scenes,"scenes",Zi).map(Gt)}}function En(s){const e=m(s,"scene detail");he({scene:e.scene,content:e.content},"scene detail",Se);const t=ot(e.content);return t.kind!=="scene_builtin"&&t.kind!=="scene_palette"&&t.kind!=="scene_layered"&&v("scene detail content is unsupported"),{scene:Gt(e.scene),content:t}}function ot(s){he(s,"effect content",Se);const e=m(s,"effect content"),t=f(e.kind,"effect content kind",_);switch(t){case"h617a_painted":return{kind:t,effect:P(e.effect,["cycle","clockwise","counter_clockwise","twinkle","gradient","breathe"],"painted effect"),speed:u(e.speed,"painted speed",0,100),brightness:u(e.brightness,"painted brightness",0,100),background:Ee(e.background,"painted background"),groups:E(e.groups,"paint groups",15).map((i,n)=>{const r=m(i,`paint groups[${n}]`);return{fill:Ee(r.fill,"paint-group fill"),segments:E(r.segments,"painted segments",15).map(a=>u(a,"painted segment",0,14))}})};case"h617a_single":return{kind:t,family:u(e.family,"Single family",0,254),variant:u(e.variant,"Single variant",0,255),speed:u(e.speed,"Single speed",0,100),palette:_e(e.palette,"Single palette",8)};case"h617a_multi":return{kind:t,effects:E(e.effects,"Multi effects",4).map((i,n)=>{const r=m(i,`Multi effects[${n}]`);return{family:u(r.family,"Multi family",0,254),variant:u(r.variant,"Multi variant",0,255)}}),speed:u(e.speed,"Multi speed",0,100),palette:_e(e.palette,"Multi palette",8)};case"palette_diy":return{kind:t,model:P(e.model,le,"palette DIY model"),family:u(e.family,"palette DIY family",0,255),variant:u(e.variant,"palette DIY variant",0,255),speed:u(e.speed,"palette DIY speed",0,100),palette:_e(e.palette,"palette DIY palette",8)};case"music_profile":return{kind:t,model:P(e.model,le,"music profile model"),mode:f(e.mode,"music profile mode",_),sensitivity:u(e.sensitivity,"music profile sensitivity",0,100),colour:In(e.colour,"music profile colour"),calm:An(e.calm,"music profile calm"),parameters:At(e.parameters,"music profile parameters")};case"video_profile":return{kind:t,model:P(e.model,["H6199"],"video profile model"),mode:P(e.mode,ts,"video profile mode"),full_screen:B(e.full_screen,"video profile full-screen flag"),saturation:u(e.saturation,"video profile saturation",0,100),sound_effects:B(e.sound_effects,"video profile sound-effects flag"),sound_effects_softness:u(e.sound_effects_softness,"video profile sound-effects softness",1,100),white_balance_position:u(e.white_balance_position,"video profile white-balance position",1,20),relative_brightness:Pn(e.relative_brightness,"video profile relative brightness"),blank_screen:B(e.blank_screen,"video profile blank-screen flag")};case"advanced":return{kind:t,layers:bt(e.layers,"Advanced layers")};case"workshop":{const i=m(e.effect,"Workshop effect");return{kind:t,model:P(e.model,le,"Workshop model"),template:f(e.template,"Workshop template",_),effect:{layers:bt(i.layers,"Workshop layers")},raw_param:We(e.raw_param,"Workshop source parameter"),trailing_padding:u(e.trailing_padding,"Workshop trailing padding",0,Ct)}}case"special_diy":return{kind:t,model:P(e.model,["H6199"],"Special DIY model"),template:f(e.template,"Special DIY template",_),family:u(e.family,"Special DIY family",0,255),variant:u(e.variant,"Special DIY variant",0,255),speed:u(e.speed,"Special DIY speed",0,100),palette:_e(e.palette,"Special DIY palette",8),raw_payload:We(e.raw_payload,"Special DIY source payload"),trailing_padding:u(e.trailing_padding,"Special DIY trailing padding",0,Ct)};case"scene_builtin":return{kind:t,template:tt(e.template,"scene template"),speed_index:Pt(e.speed_index,"scene speed index",0,255)};case"scene_palette":return Cn(e);case"scene_layered":{const i=m(e.effect,"layered scene effect"),n=is(e.trailing_padding,"layered scene trailing padding");return{kind:t,template:tt(e.template,"layered scene template"),effect:{layers:bt(i.layers,"layered scene layers")},speed_index:Pt(e.speed_index,"layered scene speed index",0,255),raw_param:We(e.raw_param,"layered scene raw parameter"),...n===void 0?{}:{trailing_padding:n}}}default:{const{kind:i,...n}=e;return{kind:"opaque",source_kind:t,body:n}}}}function is(s,e){if(s!==void 0)return u(s,e,0,Ct)}function Cn(s){const t=u(s.layout,"palette scene layout",0,1)===0?0:1,i=E(s.steps,"palette scene steps",255).map((l,c)=>{const h=m(l,`palette scene steps[${c}]`),b=t===0?(h.inline_colour!==null&&v(`palette scene steps[${c}].inline_colour must be null for layout 0`),null):Ee(h.inline_colour,`palette scene steps[${c}].inline_colour`);return{value:u(h.value,`palette scene steps[${c}].value`,0,65535),colour:Ee(h.colour,`palette scene steps[${c}].colour`),inline_colour:b}}),n=_e(s.palette,"palette scene shared palette",255,!0);t===1&&n.length!==0&&v("palette scene layout 1 must not have a shared palette");let r;s.config_flags!==void 0&&(r=u(s.config_flags,"palette scene config flags",0,255),r&-9&&v("palette scene config flags must only set reserved config bits"));const a=is(s.trailing_padding,"palette scene trailing padding");return{kind:"scene_palette",template:tt(s.template,"palette scene template"),layout:t,brightness_flag:B(s.brightness_flag,"palette scene brightness flag"),steps:i,palette:n,speed_index:Pt(s.speed_index,"palette scene speed index",0,255),...r===void 0?{}:{config_flags:r},...a===void 0?{}:{trailing_padding:a}}}function Ae(s){return s.kind!=="opaque"?s:(he(s.body,"opaque content",Se),{...s.body,kind:f(s.source_kind,"opaque source kind",_)})}function Gt(s){const e=m(s,"scene"),t=Ue(e.parameter_kind,"scene parameter kind");t!=="none"&&t!=="palette"&&t!=="layers"&&t!=="opaque"&&v("scene parameter kind is invalid");const i=e.speed===null?null:(()=>{const n=m(e.speed,"scene speed");return{option_count:u(n.option_count,"scene speed option count",1,256),default_index:u(n.default_index,"scene default speed",0,255)}})();return{scene_id:u(e.scene_id,"scene ID",0,65535),effect_id:u(e.effect_id,"scene effect ID",0,65535),category_id:u(e.category_id,"scene category ID",0,65535),category:f(e.category,"scene category",L),name:f(e.name,"scene name",L),variant:Tn(e.variant,"scene variant",_),display_name:f(e.display_name,"scene display name",L),scene_type:u(e.scene_type,"scene type",0,255),parameter_kind:t,speed:i}}function bt(s,e){return E(s,e,255).map((t,i)=>Sn(t,`${e}[${i}]`))}function Sn(s,e){const t=m(s,e),i=m(t.area,`${e}.area`),n=m(t.selection,`${e}.selection`),r=m(t.distribution,`${e}.distribution`);return{area:{start_tenths:u(i.start_tenths,`${e}.area.start_tenths`,0,15),width_tenths:u(i.width_tenths,`${e}.area.width_tenths`,0,15)},selection:{type:D(n.type,`${e}.selection.type`),param_1:D(n.param_1,`${e}.selection.param_1`),param_2:D(n.param_2,`${e}.selection.param_2`)},brightness_gradient:B(t.brightness_gradient,`${e}.brightness_gradient`),brightness_patterns:E(t.brightness_patterns,`${e}.brightness_patterns`,255).map((a,l)=>{const c=m(a,`${e}.brightness_patterns[${l}]`);return{scope_high:D(c.scope_high,"brightness scope high"),scope_low:D(c.scope_low,"brightness scope low"),order:D(c.order,"brightness order"),change_speed:D(c.change_speed,"brightness change speed"),brightest_retention:D(c.brightest_retention,"brightest retention"),darkest_retention:D(c.darkest_retention,"darkest retention")}}),distribution:{method:u(r.method,`${e}.distribution.method`,0,127),backwards:B(r.backwards,`${e}.distribution.backwards`)},colour_speed:D(t.colour_speed,`${e}.colour_speed`),colour_retention:D(t.colour_retention,`${e}.colour_retention`),palette:_e(t.palette,`${e}.palette`,255,!0),selected_movement:$i(t.selected_movement,`${e}.selected_movement`),overall_movement:$i(t.overall_movement,`${e}.overall_movement`),priority:D(t.priority,`${e}.priority`),unknown_flags:ss(t.unknown_flags,dn,`${e}.unknown_flags`),excess:We(t.excess,`${e}.excess`)}}function $i(s,e){const t=m(s,e);return{enabled:B(t.enabled,`${e}.enabled`),enter_exit:B(t.enter_exit,`${e}.enter_exit`),direction:u(t.direction,`${e}.direction`,0,3),distance:D(t.distance,`${e}.distance`),speed:D(t.speed,`${e}.speed`),unknown_flags:ss(t.unknown_flags,ln,`${e}.unknown_flags`)}}function tt(s,e){const t=m(s,e);return{sku:f(t.sku,`${e}.sku`,_),scene_id:u(t.scene_id,`${e}.scene_id`,0,65535),effect_id:u(t.effect_id,`${e}.effect_id`,0,65535),catalogue_schema_version:u(t.catalogue_schema_version,`${e}.catalogue_schema_version`,1,jt)}}function _e(s,e,t,i=!1){const n=E(s,e,t);return!i&&n.length===0&&v(`${e} must not be empty`),n.map((r,a)=>Ee(r,`${e}[${a}]`))}function Ee(s,e){const t=E(s,e,3);return t.length!==3&&v(`${e} must contain three channels`),t.map(i=>u(i,`${e} channel`,0,255))}function In(s,e){return s===null?null:Ee(s,e)}function An(s,e){return s===null?null:B(s,e)}function Pn(s,e){const t=m(s,e);return{left:u(t.left,`${e}.left`,1,100),top:u(t.top,`${e}.top`,1,100),right:u(t.right,`${e}.right`,1,100),bottom:u(t.bottom,`${e}.bottom`,1,100)}}function S(s,e){return s!=="supported"&&s!=="unsupported"&&s!=="evidence_gap"&&v(`${e} is invalid`),s}function At(s,e){return he(s,e,Se),m(s,e)}function xe(s,e){return s===null?null:f(s,e,_)}function zt(s,e){const t=f(s,e,an);return(!/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(t)||Number.isNaN(Date.parse(t)))&&v(`${e} must be an ISO 8601 timestamp with a UTC offset`),t}function f(s,e,t){const i=Ue(s,e);return(i.length===0||i.length>t)&&v(`${e} must contain 1 to ${t} characters`),i}function Tn(s,e,t){const i=Ue(s,e);return i.length>t&&v(`${e} must not exceed ${t} characters`),i}function We(s,e){const t=Ue(s,e);return(t.length%2!==0||!/^[0-9a-f]*$/i.test(t))&&v(`${e} must be hexadecimal`),t}function Ue(s,e){return typeof s!="string"&&v(`${e} must be a string`),s}function Dn(s){return typeof s=="string"&&le.includes(s)?s:void 0}function B(s,e){return typeof s!="boolean"&&v(`${e} must be a boolean`),s}function u(s,e,t,i=jt){return(typeof s!="number"||!Number.isSafeInteger(s)||s<t||s>i)&&v(`${e} must be an integer from ${t} to ${i}`),s}function Q(s,e,t){return u(s,e,t,jt)}function K(s,e,t){const i=u(s,t,1);return i!==e&&v(`${t} is incompatible with this editor`),i}function Pt(s,e,t,i){return s===null?null:u(s,e,t,i)}function D(s,e){return u(s,e,0,255)}function ss(s,e,t){const i=D(s,t);return i&~e&&v(`${t} must only set reserved bits, not bits explicit fields carry`),i}function P(s,e,t){const i=Ue(s,t);return e.includes(i)||v(`${t} is invalid`),i}function m(s,e){return(typeof s!="object"||s===null||Array.isArray(s))&&v(`${e} must be an object`),s}function E(s,e,t){return Array.isArray(s)||v(`${e} must be an array`),s.length>t&&v(`${e} must not exceed ${t} items`),s}function F(s,e,t){const i=s.map(e);new Set(i).size!==i.length&&v(`${t} must be unique`)}function he(s,e,t,i=on){let n=0;const r=(l,c,h)=>{if(n+=1,n>i&&v(`${e} must not exceed ${i} JSON values`),h>bi&&v(`${e} must not exceed ${bi} nested levels`),!(l===null||typeof l=="boolean")){if(typeof l=="number"){(!Number.isFinite(l)||Number.isInteger(l)&&!Number.isSafeInteger(l))&&v(`${c} must be a finite JSON number`);return}if(typeof l=="string"){l.length>mt&&v(`${c} must not exceed ${mt} characters`);return}if(Array.isArray(l)){l.length>O&&v(`${c} must not exceed ${O} items`),l.forEach((b,y)=>r(b,`${c}[${y}]`,h+1));return}if(typeof l=="object"&&l!==null){const b=Object.entries(l);b.length>O&&v(`${c} must not exceed ${O} fields`),b.forEach(([y,R])=>{y.length>mt&&v(`${c} contains an oversized key`),r(R,`${c}.${y}`,h+1)});return}v(`${c} contains a non-JSON value`)}};r(s,e,0);const a=JSON.stringify(s);a===void 0&&v(`${e} must contain JSON values`),new TextEncoder().encode(a).byteLength>t&&v(`${e} must not exceed ${t} bytes`)}function v(s){throw new Error(`Malformed Effect Studio server payload: ${s}.`)}function Ln(s){return s.api_version===sn&&s.effect_schema_version===zi&&s.compiler_version===nn}const vt="ha_govee_led_ble/editor";class Mn{constructor(e){this.hass=e}async info(){return hn(await this.call("info"))}async devices(){const e=await this.call("devices");return mn(T(e,"devices"))}async customCatalogue(){const e=await this.call("custom/catalogue");return fn(T(e,"catalogue"))}async library(){return _i(await this.call("library/list"))}async item(e){const t=await this.call("library/get",{item_id:e});return Ye(T(t,"item"))}async createItem(e,t,i){const n=await this.call("library/create",{name:e,content:Ae(t),expected_library_revision:i});return{item:Ye(T(n,"item")),library_revision:yt(n)}}async updateItem(e,t,i,n){const r=await this.call("library/update",{item_id:e.id,name:t,content:Ae(i),expected_revision:e.revision,expected_library_revision:n});return{item:Ye(T(r,"item")),library_revision:yt(r)}}async deleteItem(e,t){const i=await this.call("library/delete",{item_id:e.id,expected_revision:e.revision,expected_library_revision:t});return yt(i)}async drafts(){const e=await this.call("draft/list");return xn(T(e,"drafts"))}async draft(e){const t=await this.call("draft/get",{draft_id:e});return gt(T(t,"draft"))}async createDraft(e,t,i,n){const r=await this.call("draft/create",{name:e,content:Ae(t),updated_at:new Date().toISOString(),selected_config_entry_id:i,...n?{base_item_id:n.id,base_item_revision:n.revision}:{}});return gt(T(r,"draft"))}async updateDraft(e,t,i,n){const r=await this.call("draft/update",{draft_id:e.id,expected_revision:e.revision,name:t,content:Ae(i),updated_at:new Date().toISOString(),selected_config_entry_id:n});return gt(T(r,"draft"))}async deleteDraft(e){await this.call("draft/delete",{draft_id:e.id,expected_revision:e.revision})}async applySaved(e,t){const i=await this.call("apply",{config_entry_id:e,item_id:t.id,revision:t.revision,updated_at:new Date().toISOString()});return It(T(i,"deployment"))}async applySnapshot(e,t,i){const n=await this.call("apply_snapshot",{config_entry_id:e,name:t,content:Ae(i),updated_at:new Date().toISOString()});return It(T(n,"deployment"))}async sceneCatalogue(e){const t=await this.call("scene/catalogue/list",{config_entry_id:e});return wn(T(t,"catalogue"))}sceneDetail(e,t,i){return this.call("scene/catalogue/get",{config_entry_id:e,scene_id:t,effect_id:i}).then(En)}async applyScene(e,t,i){const n=await this.call("scene/apply",{config_entry_id:e,scene_id:t.scene_id,effect_id:t.effect_id,...i===null?{}:{speed_index:i}}),r=Gt(T(n,"scene")),a=T(n,"readback");if(a!=="scene_identity_only")throw new Error("Malformed Effect Studio server payload: scene Apply readback is invalid.");const l=T(n,"speed_index");if(l!==null&&(typeof l!="number"||!Number.isSafeInteger(l)||l<0||l>255))throw new Error("Malformed Effect Studio server payload: scene Apply speed is invalid.");return{scene:r,speed_index:l,readback:a}}subscribeLibrary(e,t){return this.hass.connection.subscribeMessage(i=>{try{e(_i(i))}catch(n){t?.(xi(n))}},{type:`${vt}/library/subscribe`})}subscribeDeployments(e,t){return this.hass.connection.subscribeMessage(i=>{try{e(kn(i))}catch(n){t?.(xi(n))}},{type:`${vt}/deployment/subscribe`})}call(e,t={}){return this.hass.callWS({type:`${vt}/${e}`,...t})}}function T(s,e){if(typeof s!="object"||s===null||Array.isArray(s))throw new Error("Malformed Effect Studio server payload: response must be an object.");if(!(e in s))throw new Error(`Malformed Effect Studio server payload: response is missing ${e}.`);return s[e]}function yt(s){const e=T(s,"library_revision");if(typeof e!="number"||!Number.isSafeInteger(e)||e<0)throw new Error("Malformed Effect Studio server payload: library revision is invalid.");return e}function xi(s){return s instanceof Error?s:new Error("Malformed Effect Studio server payload.")}var Nn=Object.defineProperty,ns=(s,e,t,i)=>{for(var n=void 0,r=s.length-1,a;r>=0;r--)(a=s[r])&&(n=a(e,t,n)||n);return n&&Nn(e,t,n),n};const Tt=17,rs="ha_govee_led_ble/effect_studio/recent_colours",Xe=[[255,69,58],[255,159,10],[255,214,10],[48,209,88],[99,230,226],[100,210,255],[10,132,255],[94,92,230],[191,90,242],[255,45,85],[172,142,104],[255,255,255],[174,174,178],[99,99,102],[28,28,30],[255,127,0],[139,0,255]];let ke=Rn();class Yt extends A{constructor(){super(...arguments),this.colour=[255,255,255],this.disabled=!1}render(){return o`
      <div class="preset-grid">
        ${ke.map(e=>o`
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
            @input=${e=>this.emit("colour-changing",ui(e.target.value))}
            @change=${e=>this.commit(ui(e.target.value))}
          />
        </label>
      </div>
    `}commit(e){On(e),this.emit("colour-changed",e)}emit(e,t){this.colour=[...t],this.dispatchEvent(new CustomEvent(e,{detail:{colour:[...t]},bubbles:!0,composed:!0}))}static{this.styles=[M,k`
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
  `]}}ns([p({attribute:!1})],Yt.prototype,"colour");ns([p({type:Boolean})],Yt.prototype,"disabled");function Dt(s){return[...ke[s%ke.length]]}function Rn(){const s=localStorage.getItem(rs);if(!s)return Z(Xe);let e;try{e=JSON.parse(s)}catch(i){if(i instanceof SyntaxError)return Z(Xe);throw i}if(!Array.isArray(e))return Z(Xe);const t=e.filter(Bn).map(i=>[...i]).slice(0,Tt);return as(t)}function On(s){const e=w(s);ke=as([[...s],...ke.filter(t=>w(t)!==e)]),localStorage.setItem(rs,JSON.stringify(ke))}function as(s){const e=Z(s);for(const t of Xe)e.length>=Tt||e.some(i=>w(i)===w(t))||e.push([...t]);return e.slice(0,Tt)}function Bn(s){return Array.isArray(s)&&s.length===3&&s.every(e=>Number.isInteger(e)&&e>=0&&e<=255)}customElements.get("govee-colour-picker")||customElements.define("govee-colour-picker",Yt);var Fn=Object.defineProperty,z=(s,e,t,i)=>{for(var n=void 0,r=s.length-1,a;r>=0;r--)(a=s[r])&&(n=a(e,t,n)||n);return n&&Fn(e,t,n),n};class q extends A{constructor(){super(...arguments),this.palette=[],this.minColours=1,this.maxColours=8,this.disabled=!1,this.persistentPicker=!1,this.ariaLabel="Colours",this.itemName="colour",this.windowPointerDown=e=>{this.editingIndex!==void 0&&!e.composedPath().includes(this)&&(this.editingIndex=void 0)}}connectedCallback(){super.connectedCallback(),window.addEventListener("pointerdown",this.windowPointerDown)}disconnectedCallback(){window.removeEventListener("pointerdown",this.windowPointerDown),super.disconnectedCallback()}willUpdate(e){e.has("palette")&&this.editingIndex!==void 0&&this.editingIndex>=this.palette.length&&(this.editingIndex=void 0)}render(){const e=this.persistentPicker?this.selectedIndex:this.editingIndex,t=this.palette.map((i,n)=>({key:`${n}-${w(i)}`,label:`${ki(this.itemName)} ${n+1}`,ariaLabel:this.itemAriaLabel(i,n),colour:w(i),removeReady:!this.persistentPicker&&this.editingIndex===n&&this.palette.length>this.minColours,disabled:this.disabled}));return o`
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
    `}itemAriaLabel(e,t){const i=`${ki(this.itemName)} ${t+1}`;return this.persistentPicker?`${i}, ${w(e)}${t===this.selectedIndex?", selected":""}`:this.editingIndex===t&&this.palette.length>this.minColours?`Remove colour ${t+1}`:`Edit colour ${t+1}, ${w(e)}. Drag to reorder or use arrow keys.`}renderPicker(e,t){return o`
      <govee-colour-picker
        .colour=${t}
        .disabled=${this.disabled}
        @colour-changing=${i=>this.updateColour(e,i.detail.colour)}
        @colour-changed=${i=>this.commitColour(e,i.detail.colour)}
      ></govee-colour-picker>
    `}commitColour(e,t){this.updateColour(e,t),!this.persistentPicker&&(this.editingIndex=void 0,this.focusSwatchAfterUpdate(e))}updateColour(e,t){const i=Z(this.palette);i[e]=[...t],this.emitPalette(i)}addColour(){if(this.disabled||this.palette.length>=this.maxColours)return;const e=this.palette[this.palette.length-1]??Dt(this.palette.length),t=[...Z(this.palette),[...e]],i=t.length-1;this.persistentPicker?this.selectColour(i,t[i]):this.editingIndex=i,this.emitPalette(t)}removeColour(e){if(this.disabled||this.palette.length<=this.minColours)return;const t=this.palette.filter((n,r)=>r!==e).map(n=>[...n]),i=Math.min(e,t.length-1);this.editingIndex=void 0,this.emitPalette(t),this.focusSwatchAfterUpdate(i)}reorder(e,t){if(this.disabled||e===t)return;const i=Z(this.palette),[n]=i.splice(e,1);if(i.splice(t,0,n),this.editingIndex=this.editingIndex===e?t:et(this.editingIndex,e,t),this.persistentPicker){const r=et(this.selectedIndex,e,t);r!==void 0&&this.selectColour(r,i[r])}this.emitPalette(i)}focusSwatchAfterUpdate(e){this.updateComplete.then(()=>{this.shadowRoot?.querySelector("govee-reorderable-strip")?.focusItem(e)})}popoverKeyPressed(e,t){t.key==="Escape"&&(t.preventDefault(),t.stopPropagation(),this.editingIndex=void 0,this.focusSwatchAfterUpdate(e))}swatchClicked(e){if(this.persistentPicker){this.selectColour(e,this.palette[e]);return}if(this.editingIndex===e&&this.palette.length>this.minColours){this.removeColour(e);return}this.editingIndex=this.editingIndex===e?void 0:e}selectColour(e,t){this.selectedIndex=e,this.dispatchEvent(new CustomEvent("colour-selected",{detail:{index:e,colour:[...t]},bubbles:!0,composed:!0}))}emitPalette(e){this.palette=e,this.dispatchEvent(new CustomEvent("palette-changed",{detail:{palette:e},bubbles:!0,composed:!0}))}static{this.styles=[M,k`
    :host {
      display: block;
    }

    .persistent-picker {
      margin-top: var(--studio-section-gap);
      padding-top: var(--studio-section-gap);
      border-top: 1px solid var(--studio-border);
    }
  `]}}z([p({attribute:!1})],q.prototype,"palette");z([p({type:Number})],q.prototype,"minColours");z([p({type:Number})],q.prototype,"maxColours");z([p({type:Boolean})],q.prototype,"disabled");z([p({type:Boolean})],q.prototype,"persistentPicker");z([p({type:Number})],q.prototype,"selectedIndex");z([p()],q.prototype,"ariaLabel");z([p()],q.prototype,"itemName");z([g()],q.prototype,"editingIndex");function ki(s){return s.charAt(0).toUpperCase()+s.slice(1)}customElements.get("govee-palette-editor")||customElements.define("govee-palette-editor",q);var Un=Object.defineProperty,Wt=(s,e,t,i)=>{for(var n=void 0,r=s.length-1,a;r>=0;r--)(a=s[r])&&(n=a(e,t,n)||n);return n&&Un(e,t,n),n};class lt extends A{constructor(){super(...arguments),this.disabled=!1}updated(){if(this.content){if(this.content.kind==="h617a_single"||this.content.kind==="palette_diy"||this.content.kind==="special_diy"){const e=this.shadowRoot?.querySelector("select[data-single-variation]");e&&(e.value=String(this.content.variant));return}this.content.effects.forEach((e,t)=>{const i=this.effectFamily(e,!0),n=this.shadowRoot?.querySelector(`select[data-effect-index="${t}"]`),r=this.shadowRoot?.querySelector(`select[data-variation-index="${t}"]`);n&&(n.value=i?.id??`unknown:${e.family}`),r&&(r.value=String(e.variant))})}}render(){if(!this.content||!this.catalogue)return d;const e=(this.content.kind==="h617a_single"||this.content.kind==="palette_diy"||this.content.kind==="special_diy")&&this.effectFamily(this.content)?.rate==="sensitivity"?"Sensitivity":"Speed";return o`
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
    `}renderSingleVariation(){if(!this.content||this.content.kind!=="h617a_single"&&this.content.kind!=="palette_diy"&&this.content.kind!=="special_diy")return d;const e=this.content,i=this.effectFamily(e)?.variations??[],n=i.some(r=>r.variant===e.variant);return n&&i.length<=1?d:o`
      <label class="field parameter-group">
        <span class="parameter-label">Variation</span>
        <select
          aria-label="Variation"
          data-single-variation
          .value=${String(e.variant)}
          ?disabled=${this.disabled}
          @change=${r=>this.emitContent({...e,variant:Number(r.target.value)})}
        >
          ${n?d:o`
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
    `}effectRow(e,t){const i=this.effectFamily(e,!0),n=i?.variations??[];return o`
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
              ${n.some(r=>r.variant===e.variant)?d:o`
                    <option value=${String(e.variant)}>
                      Unknown variation ${e.variant}
                    </option>
                  `}
              ${n.map(r=>o`
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
        @palette-changed=${e=>{this.emitContent({...this.content,palette:Z(e.detail.palette)})}}
      ></govee-palette-editor>
    `}effectFamilyChanged(e,t){const i=this.multiFamilies.find(r=>r.id===t),n=i?.variations[0];!i||!n||this.replaceEffect(e,{family:i.family,variant:n.variant})}effectVariationChanged(e,t){if(!this.content||this.content.kind!=="h617a_multi")return;const i=this.content.effects[e];i&&this.replaceEffect(e,{...i,variant:t})}replaceEffect(e,t){if(!this.content||this.content.kind!=="h617a_multi")return;const i=this.content.effects.map((n,r)=>r===e?t:n);this.emitContent({...this.content,effects:i})}addEffect(){if(!this.content||this.content.kind!=="h617a_multi")return;const e=this.multiFamilies[this.content.effects.length]??this.multiFamilies[0],t=e?.variations[0];if(!e||!t)return;const i=[...this.content.effects,{family:e.family,variant:t.variant}];this.emitContent({...this.content,effects:i})}removeEffect(e){if(!this.content||this.content.kind!=="h617a_multi")return;const t=this.content.effects.filter((i,n)=>n!==e);this.emitContent({...this.content,effects:t})}moveEffect(e,t){if(!this.content||this.content.kind!=="h617a_multi")return;const i=e+t;i<0||i>=this.content.effects.length||this.reorderEffect(e,i)}reorderEffect(e,t){if(!this.content||this.content.kind!=="h617a_multi"||e===t)return;const i=[...this.content.effects],[n]=i.splice(e,1);i.splice(t,0,n),this.emitContent({...this.content,effects:i})}effectDragStarted(e,t){this.draggedEffectIndex=e,t.dataTransfer?.setData("text/plain",String(e))}effectDropped(e,t){t.preventDefault(),this.draggedEffectIndex!==void 0&&(this.reorderEffect(this.draggedEffectIndex,e),this.draggedEffectIndex=void 0)}closeDetails(e){e.currentTarget.closest("details")?.removeAttribute("open")}effectFamily(e,t=!1){return(t?this.multiFamilies:this.catalogue?.effects)?.find(i=>i.family===e.family)}emitContent(e){this.dispatchEvent(new CustomEvent("content-changed",{detail:{content:e},bubbles:!0,composed:!0}))}static{this.styles=[M,ce,j,k`
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

  `]}}Wt([p({attribute:!1})],lt.prototype,"content");Wt([p({attribute:!1})],lt.prototype,"catalogue");Wt([p({type:Boolean})],lt.prototype,"disabled");customElements.get("govee-custom-effect-editor")||customElements.define("govee-custom-effect-editor",lt);const fe={ATTRIBUTE:1,PROPERTY:3,BOOLEAN_ATTRIBUTE:4},Hn=s=>(...e)=>({_$litDirective$:s,values:e});class qn{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}}const Vn=s=>s.strings===void 0,Kn={},jn=(s,e=Kn)=>s._$AH=e;const wi=Hn(class extends qn{constructor(s){if(super(s),s.type!==fe.PROPERTY&&s.type!==fe.ATTRIBUTE&&s.type!==fe.BOOLEAN_ATTRIBUTE)throw Error("The `live` directive is not allowed on child or event bindings");if(!Vn(s))throw Error("`live` bindings can only contain a single expression")}render(s){return s}update(s,[e]){if(e===U||e===d)return e;const t=s.element,i=s.name;if(s.type===fe.PROPERTY){if(e===t[i])return U}else if(s.type===fe.BOOLEAN_ATTRIBUTE){if(!!e===t.hasAttribute(i))return U}else if(s.type===fe.ATTRIBUTE&&t.getAttribute(i)===e+"")return U;return jn(s),e}});var Gn=Object.defineProperty,dt=(s,e,t,i)=>{for(var n=void 0,r=s.length-1,a;r>=0;r--)(a=s[r])&&(n=a(e,t,n)||n);return n&&Gn(e,t,n),n};const zn=new Set(["rhythm","bloom","shiny"]),Yn=new Set(["point","gradient","relative_brightness","key_count","direction","segment_count","speed"]),os=[{id:"clockwise",label:"Clockwise"},{id:"two_way",label:"Two-way"},{id:"counterclockwise",label:"Counterclockwise"}];class He extends A{constructor(){super(...arguments),this.disabled=!1,this.showModeSelector=!0,this.modeChanged=e=>{const t=e.target.value;this.updateContent(i=>(i.mode=t,i.parameters=Xn(i.parameters),i.calm=_t(t)?i.calm??!1:null,i))}}willUpdate(e){e.has("content")&&this.content?.colour!=null&&(this.lastFixedColour=ne(this.content.colour))}render(){if(!this.content)return d;const e=Wn(this.content.mode,this.catalogue),t=this.catalogue?.limits.music_sensitivity_min??0,i=this.catalogue?.limits.music_sensitivity_max??100,n=ls(this.content.sensitivity,t,i),r=this.content.colour===null?"automatic":"fixed",a=this.content.colour??this.lastFixedColour??Dt(0);return o`
      <section class="card">
        <div class="parameter-stack">
          ${this.showModeSelector?o`
                <label class="field">
                  <span class="parameter-label">Mode</span>
                  <select
                    aria-label="Mode"
                    .value=${wi(this.content.mode)}
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

          ${this.renderRangeField("Sensitivity",n,t,i,l=>this.updateContent(c=>(c.sensitivity=l,c)))}

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

          ${_t(this.content.mode)?this.renderSegmentedField("Style",!!this.content.calm,[{value:!1,label:"Dynamic"},{value:!0,label:"Calm"}],l=>this.styleChanged(l)):d}

          ${this.renderModeParameters(this.content)}
        </div>
      </section>
    `}renderSegmentedField(e,t,i,n){return o`
      <govee-segmented-control
        .label=${e}
        .value=${t}
        .options=${i}
        .disabled=${this.disabled}
        @value-changed=${r=>n(r.detail.value)}
      ></govee-segmented-control>
    `}renderRangeField(e,t,i,n,r,a=!1){return o`
      <govee-slider-control
        .label=${e}
        .value=${t}
        .minimum=${i}
        .maximum=${n}
        .showValue=${a}
        .disabled=${this.disabled}
        @value-changed=${l=>r(l.detail.value)}
      ></govee-slider-control>
    `}renderModeParameters(e){switch(e.mode){case"separation":return this.renderSeparationParameters(e.parameters);case"hopping":return this.renderHoppingParameters(e.parameters);case"piano_keys":return this.renderPianoKeysParameters(e.parameters);case"fountain":return this.renderFountainParameters(e.parameters);case"day_and_night":return this.renderDayAndNightParameters(e.parameters);default:return d}}renderSeparationParameters(e){const t=Pe(e,"point",1,1,5),i=Ei(e,"gradient",!0);return o`
      ${this.renderRangeField("Point",t,1,5,n=>this.updateParameter("point",n))}
      ${this.renderCheckboxField("Gradient",i,n=>this.updateParameter("gradient",n))}
    `}renderHoppingParameters(e){const t=Pe(e,"relative_brightness",50,0,50);return o`
      ${this.renderRangeField("Relative brightness",t,0,50,i=>this.updateParameter("relative_brightness",i))}
    `}renderPianoKeysParameters(e){const t=Pe(e,"key_count",15,8,15);return o`
      ${this.renderRangeField("Key count",t,8,15,i=>this.updateParameter("key_count",i))}
    `}renderFountainParameters(e){const t=Jn(e,"direction","clockwise");return o`
      <label class="field">
        <span class="parameter-label">Direction</span>
        <select
          aria-label="Direction"
          .value=${wi(t)}
          ?disabled=${this.disabled}
          @change=${i=>this.updateParameter("direction",i.target.value)}
        >
          ${os.map(i=>o`
              <option
                value=${i.id}
                .selected=${i.id===t}
              >
                ${i.label}
              </option>
            `)}
        </select>
      </label>
    `}renderDayAndNightParameters(e){const t=Pe(e,"segment_count",1,1,7),i=Pe(e,"speed",10,1,50),n=Ei(e,"gradient",!1);return o`
      ${this.renderRangeField("Segment count",t,1,7,r=>this.updateParameter("segment_count",r),!0)}
      ${this.renderRangeField("Speed",i,1,50,r=>this.updateParameter("speed",r))}
      ${this.renderCheckboxField("Gradient",n,r=>this.updateParameter("gradient",r))}
    `}renderCheckboxField(e,t,i){return o`
      <govee-checkbox-control
        .label=${e}
        .checked=${t}
        .disabled=${this.disabled}
        @checked-changed=${n=>i(n.detail.checked)}
      ></govee-checkbox-control>
    `}colourModeChanged(e){this.updateContent(t=>{if(!e)return this.lastFixedColour=t.colour===null?this.lastFixedColour:ne(t.colour),t.colour=null,t;const i=t.colour??this.lastFixedColour??Dt(0);return this.lastFixedColour=ne(i),t.colour=ne(i),t})}fixedColourChanged(e){this.lastFixedColour=ne(e),this.updateContent(t=>(t.colour=ne(e),t))}styleChanged(e){this.updateContent(t=>(_t(t.mode)&&(t.calm=e),t))}updateParameter(e,t){this.updateContent(i=>{const n=Xt(i.parameters);return n[e]=t,i.parameters=n,i})}updateContent(e){if(!this.content)return;const t=$t(e($t(this.content)));this.content=t,this.dispatchEvent(new CustomEvent("content-changed",{detail:{content:$t(t)},bubbles:!0,composed:!0}))}static{this.styles=[M,ce,j,k`
      :host {
        display: block;
      }

    `]}}dt([p({attribute:!1})],He.prototype,"content");dt([p({attribute:!1})],He.prototype,"catalogue");dt([p({type:Boolean})],He.prototype,"disabled");dt([p({type:Boolean})],He.prototype,"showModeSelector");function Wn(s,e){const t=e?.music_modes.map(i=>({...i}))??[];return t.some(i=>i.id===s)?t:[{id:s,label:`Unknown mode ${s}`},...t]}function Xn(s){const e=Xt(s);for(const t of Yn)delete e[t];return e}function _t(s){return zn.has(s)}function Pe(s,e,t,i,n){const r=s[e];return typeof r!="number"||!Number.isFinite(r)?t:ls(r,i,n)}function Ei(s,e,t){return typeof s[e]=="boolean"?s[e]:t}function Jn(s,e,t){const i=s[e];return os.some(n=>n.id===i)?i:t}function ls(s,e,t){return Math.min(t,Math.max(e,Math.round(s)))}function $t(s){return{...s,colour:Zn(s.colour),parameters:Xt(s.parameters)}}function Xt(s){return structuredClone(s)}function Zn(s){return s===null?null:ne(s)}function ne(s){return[...s]}customElements.get("govee-music-profile-editor")||customElements.define("govee-music-profile-editor",He);var Qn=Object.defineProperty,ds=(s,e,t,i)=>{for(var n=void 0,r=s.length-1,a;r>=0;r--)(a=s[r])&&(n=a(e,t,n)||n);return n&&Qn(e,t,n),n};class Jt extends A{constructor(){super(...arguments),this.colours=[],this.disabled=!1}render(){return o`
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
    `}pointerStarted(e,t){this.disabled||(t.preventDefault(),this.paintingPointerId=t.pointerId,this.lastPaintedSegment=e,t.currentTarget.setPointerCapture(t.pointerId),this.selectSegment(e))}pointerMoved(e){if(e.pointerId!==this.paintingPointerId||!this.shadowRoot)return;const t=this.shadowRoot.elementFromPoint(e.clientX,e.clientY)?.closest("[data-segment]"),i=Number(t?.dataset.segment);Number.isInteger(i)&&i!==this.lastPaintedSegment&&(this.lastPaintedSegment=i,this.selectSegment(i))}pointerFinished(e){if(e.pointerId!==this.paintingPointerId)return;const t=this.shadowRoot?.querySelector(`[data-segment="${this.lastPaintedSegment}"]`);t?.hasPointerCapture(e.pointerId)&&t.releasePointerCapture(e.pointerId),this.paintingPointerId=void 0,this.lastPaintedSegment=void 0}segmentClicked(e,t){!this.disabled&&t.detail===0&&this.selectSegment(e)}selectSegment(e){this.dispatchEvent(new CustomEvent("segment-selected",{detail:{index:e},bubbles:!0,composed:!0}))}static{this.styles=[M,ce,k`
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
  `]}}ds([p({attribute:!1})],Jt.prototype,"colours");ds([p({type:Boolean})],Jt.prototype,"disabled");customElements.get("govee-painted-segment-editor")||customElements.define("govee-painted-segment-editor",Jt);var er=Object.defineProperty,I=(s,e,t,i)=>{for(var n=void 0,r=s.length-1,a;r>=0;r--)(a=s[r])&&(n=a(e,t,n)||n);return n&&er(e,t,n),n};class C extends A{constructor(){super(...arguments),this.library={library_revision:0,items:[]},this.isAdmin=!1,this.category="all",this.search="",this.name="",this.speedIndex=null,this.loading=!1,this.saving=!1,this.applying=!1,this.editingCopy=!1,this.requestGeneration=0}willUpdate(e){(e.has("device")||e.has("api"))&&(this.invalidateRequests(),this.catalogue=void 0,this.category="all",this.search="",this.selectedScene=void 0,this.selectedItem=void 0,this.content=void 0,this.editingCopy=!1,this.notice=void 0,this.error=void 0,this.loading=!!(this.api&&this.device)),e.has("savedSceneSelection")&&this.savedSceneSelection&&this.synchroniseSavedSelection(this.savedSceneSelection),e.has("library")&&this.selectedItem&&(this.library.items.find(i=>i.id===this.selectedItem?.id)||(this.invalidateRequests(),this.selectedScene=void 0,this.selectedItem=void 0,this.content=void 0,this.editingCopy=!1,this.notice="The selected custom scene was deleted."))}updated(e){if((e.has("device")||e.has("api"))&&this.api&&this.device&&this.loadCatalogue(),e.has("library")&&this.selectedItem){const t=this.library.items.find(i=>i.id===this.selectedItem?.id);t&&t.revision!==this.selectedItem.revision&&(this.sceneDirty?this.notice="This custom scene changed elsewhere. Reload it before saving.":this.selectCustom(t))}}render(){return this.device?this.loading?o`<div class="status" role="status">Loading scenes...</div>`:this.error||!this.catalogue?o`
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
      `}get sortedCategories(){const e=[];return this.catalogue?.scenes.length&&e.push({id:"all",label:"All"}),this.compatibleCustomScenes.length&&e.push({id:"custom",label:"Custom"}),e.push(...this.catalogue?.categories.filter(t=>this.catalogue?.scenes.some(i=>i.category_id===t.id)).map(t=>({id:t.id,label:t.name}))??[]),e.sort((t,i)=>Le(t.label,i.label))}get compatibleCustomScenes(){return this.library.items.filter(e=>(e.kind==="scene_builtin"||e.kind==="scene_palette"||e.kind==="scene_layered")&&e.template?.sku===this.catalogue?.sku)}get filteredCustomScenes(){return this.category==="all"||this.category==="custom"?this.compatibleCustomScenes:[]}get filteredBuiltinScenes(){return!this.catalogue||this.category==="custom"?[]:this.category==="all"?this.catalogue.scenes:this.catalogue.scenes.filter(e=>e.category_id===this.category)}get filteredSceneEntries(){const e=this.search.trim().toLocaleLowerCase();return[...this.filteredCustomScenes.map(t=>({kind:"custom",item:t,label:t.name})),...this.filteredBuiltinScenes.map(t=>({kind:"builtin",scene:t,label:t.display_name}))].filter(t=>!e||t.label.toLocaleLowerCase().includes(e)).sort((t,i)=>Le(t.label,i.label))}get selectionKey(){return this.selectedItem?`custom:${this.selectedItem.id}`:this.selectedScene?ge(this.selectedScene):void 0}categoryButton(e,t){const i=this.category===e;return o`
      <button
        class="selector ${i?"selected":""}"
        type="button"
        aria-current=${i?"page":d}
        @click=${()=>this.selectCategory(e)}
      >
        ${t}
      </button>
    `}sceneButton(e,t,i){const n=this.selectionKey===e;return o`
      <button
        class="selector scene ${n?"selected":""}"
        type="button"
        aria-pressed=${n}
        @click=${i}
      >
        <span>${t}</span>
      </button>
    `}renderDetail(){const e=this.selectedScene,t=e.speed,i=this.speedIndex??t?.default_index??0,n=this.selectedItem!==void 0||this.editingCopy,r=this.content?.kind==="scene_layered",a=this.selectedItem===void 0&&!this.editingCopy,l=this.selectedItem===void 0&&this.editingCopy,c=!this.name.trim()||this.selectedItem!==void 0&&!this.sceneDirty,h=!a&&this.content?.kind!=="scene_builtin"&&(this.selectedItem===void 0||this.sceneDirty),b=!!((!a||this.catalogue?.enabled)&&(!h||this.name.trim()));return o`
      <header class="editor-heading">
        <div>
          ${n?o`
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
            class=${r||a?"secondary":"primary"}
            type="button"
            ?disabled=${!this.isAdmin||this.saving||this.applying||!this.hasCurrentSceneContent()||!r&&n&&c}
            @click=${r||a?this.edit:this.save}
          >
            ${this.saving?"Saving...":r||a?"Edit":l?"Save as Custom":"Save"}
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
                  .options=${tr(e.option_count,e.default_index)}
                  .disabled=${!this.isAdmin}
                  @value-changed=${n=>{this.speedIndex=n.detail.value}}
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
                    style="--scene-colour: ${w(t)}"
                    aria-label="Colour ${i+1}, ${w(t)}"
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
                    `:d}
              </span>
            </li>
          `)}
        </ol>
      </section>
    `}async loadCatalogue(){if(!this.api||!this.device)return;const e=this.beginRequest();this.loading=!0,this.error=void 0,this.notice=void 0,this.selectedScene=void 0,this.selectedItem=void 0,this.content=void 0;try{const t=await e.api.sceneCatalogue(e.deviceId);if(!this.requestIsCurrent(e))return;this.catalogue=t,this.category="all"}catch(t){this.requestIsCurrent(e)&&(this.error=N(t))}finally{this.requestIsCurrent(e)&&(this.loading=!1)}}selectCategory(e){this.invalidateRequests(),this.category=e,this.selectedScene=void 0,this.selectedItem=void 0,this.content=void 0,this.editingCopy=!1,this.notice=void 0}async selectBuiltin(e){if(!this.api||!this.device)return;const t=ge(e),i=this.beginRequest(t);this.notice=void 0,this.selectedScene=e,this.selectedItem=void 0,this.editingCopy=!1,this.content=void 0,this.name=e.display_name,this.speedIndex=e.speed?.default_index??null;try{const n=await i.api.sceneDetail(i.deviceId,e.scene_id,e.effect_id);if(!this.requestIsCurrent(i)||ge(n.scene)!==t)return;this.selectedScene=n.scene,this.content=n.content,this.name=n.scene.display_name,this.speedIndex=n.content.speed_index}catch(n){this.requestIsCurrent(i)&&(this.notice=N(n))}}async selectCustom(e){if(!this.api||!this.device||!this.catalogue)return;const t=this.catalogue,i=this.beginRequest(`custom:${e.id}`);this.notice=void 0,this.selectedScene=void 0,this.selectedItem=void 0,this.editingCopy=!1,this.content=void 0,this.name=e.name;try{const n=await i.api.item(e.id);if(!this.requestIsCurrent(i))return;if(n.content.kind!=="scene_builtin"&&n.content.kind!=="scene_palette"&&n.content.kind!=="scene_layered")throw new Error("This custom scene uses an unsupported definition.");const r=n.content;if(r.template.sku!==t.sku)throw new Error(`This custom scene targets ${r.template.sku}, not ${t.sku}.`);const a=t.scenes.find(c=>c.scene_id===r.template.scene_id&&c.effect_id===r.template.effect_id);if(!a)throw new Error("The source scene is not in this device catalogue.");const l=await i.api.sceneDetail(i.deviceId,r.template.scene_id,r.template.effect_id);if(!this.requestIsCurrent(i)||ge(l.scene)!==ge(a))return;this.commitCustomSelection(n,a,r)}catch(n){this.requestIsCurrent(i)&&(this.notice=N(n))}}synchroniseSavedSelection(e){const t=e.content;if(this.selectedItem?.id!==e.id||!this.catalogue||t.kind!=="scene_builtin"&&t.kind!=="scene_palette"&&t.kind!=="scene_layered"||t.template.sku!==this.catalogue.sku)return;const i=this.catalogue.scenes.find(n=>n.scene_id===t.template.scene_id&&n.effect_id===t.template.effect_id);i&&(this.requestGeneration+=1,this.activeSelectionIdentity=`custom:${e.id}`,this.commitCustomSelection(e,i,t),this.notice=void 0)}commitCustomSelection(e,t,i){const n=sr(i);this.selectedScene=t,this.selectedItem=e,this.editingCopy=!1,this.content=n,this.name=e.name,this.speedIndex=n.speed_index??t.speed?.default_index??null}async save(){if(!this.api||!this.device||!this.catalogue||!this.selectedScene||!this.content||!this.hasCurrentSceneContent()||this.content.kind!=="scene_builtin"&&this.content.kind!=="scene_palette"||!this.isAdmin||this.saving||this.applying)return;const e=this.name.trim();if(!e){this.notice="Give this custom scene a name before saving.";return}const t=this.content.kind==="scene_palette"?Je({...this.content,speed_index:this.speedIndex}):{...this.content,speed_index:this.speedIndex},i=this.captureRequest();this.saving=!0,this.notice=void 0;try{const n=this.selectedItem?await this.api.updateItem(this.selectedItem,e,t,this.library.library_revision):await this.api.createItem(e,t,this.library.library_revision);if(n.item.content.kind!=="scene_builtin"&&n.item.content.kind!=="scene_palette")throw new Error("The saved scene returned an unsupported definition.");if(this.dispatchEvent(new CustomEvent("library-item-saved",{detail:{item:n.item,library_revision:n.library_revision},bubbles:!0,composed:!0})),!this.requestIsCurrent(i))return;this.requestGeneration+=1,this.activeSelectionIdentity=`custom:${n.item.id}`,this.selectedItem=n.item,this.editingCopy=!1,this.content=n.item.content,this.name=n.item.name,this.category="custom",this.notice="Custom scene saved."}catch(n){this.requestIsCurrent(i)&&(this.notice=Et(n)==="conflict"?"The library changed elsewhere. Reload the scene before saving.":`Save failed: ${N(n)}`)}finally{this.saving=!1}}edit(){if(!(!this.isAdmin||!this.selectedScene||!this.hasCurrentSceneContent())){if(this.selectedScene.scene_type===2&&this.content?.kind==="scene_layered"){this.dispatchSceneEdit();return}this.editingCopy=!0,this.name=`${this.selectedScene.display_name} copy`,this.notice=void 0}}dispatchSceneEdit(){!this.selectedScene||this.content?.kind!=="scene_layered"||this.dispatchEvent(new CustomEvent("scene-edit-selected",{detail:{content:oe({...this.content,speed_index:this.speedIndex}),config_entry_id:this.device.config_entry_id,...this.selectedItem?{item:this.selectedItem}:{},name:this.selectedItem?.name??`${this.selectedScene.display_name} copy`},bubbles:!0,composed:!0}))}async apply(){if(!this.api||!this.device||!this.selectedScene||!this.hasCurrentSceneContent()||!this.isAdmin||!this.catalogue?.enabled&&this.selectedItem===void 0&&!this.editingCopy||this.saving||this.applying)return;const e=this.captureRequest(),t=this.device,i=this.selectedScene,n=this.speedIndex,r=this.selectedItem===void 0&&!this.editingCopy,a=this.content.kind==="scene_palette"?Je({...this.content,speed_index:n}):this.content.kind==="scene_layered"?oe({...this.content,speed_index:n}):{...this.content,speed_index:n},l=!r&&a.kind!=="scene_builtin"&&(this.selectedItem===void 0||this.sceneDirty),c=this.name.trim();if(l&&!c){this.notice="Give this custom scene a name before applying it.";return}this.applying=!0,this.notice=void 0;try{r||a.kind==="scene_builtin"?await e.api.applyScene(e.deviceId,i,n):l?await e.api.applySnapshot(e.deviceId,c,a):await e.api.applySaved(e.deviceId,this.selectedItem),this.requestIsCurrent(e)&&(this.notice=`Applied to ${t.display_name}.`)}catch(h){this.requestIsCurrent(e)&&(this.notice=`Apply failed: ${N(h)}`)}finally{this.applying=!1}}beginRequest(e){return this.requestGeneration+=1,this.activeSelectionIdentity=e,this.captureRequest()}captureRequest(){return{generation:this.requestGeneration,api:this.api,deviceId:this.device.config_entry_id,category:this.category,selectionIdentity:this.activeSelectionIdentity}}invalidateRequests(){this.requestGeneration+=1,this.activeSelectionIdentity=void 0}requestIsCurrent(e){return e.generation===this.requestGeneration&&e.api===this.api&&e.deviceId===this.device?.config_entry_id&&e.category===this.category&&e.selectionIdentity===this.activeSelectionIdentity}hasCurrentSceneContent(){return!this.catalogue||!this.selectedScene||!this.content||this.content.template.sku!==this.catalogue.sku||this.content.template.scene_id!==this.selectedScene.scene_id||this.content.template.effect_id!==this.selectedScene.effect_id?!1:this.activeSelectionIdentity===this.selectionKey}get sceneDirty(){if(!this.selectedItem||!this.content)return!0;const e=this.content.kind==="scene_palette"?Je({...this.content,speed_index:this.speedIndex}):this.content.kind==="scene_layered"?oe({...this.content,speed_index:this.speedIndex}):{...this.content,speed_index:this.speedIndex};return this.name.trim()!==this.selectedItem.name||JSON.stringify(e)!==JSON.stringify(this.selectedItem.content)}requestDelete(e){!this.selectedItem||!this.isAdmin||(this.dispatchEvent(new CustomEvent("library-item-delete-requested",{detail:{id:this.selectedItem.id,revision:this.selectedItem.revision,name:this.selectedItem.name},bubbles:!0,composed:!0})),e.currentTarget.blur())}static{this.styles=[M,ce,Ht,Fi,Ui,qi,j,qt,Hi,k`
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
  `]}}I([p({attribute:!1})],C.prototype,"api");I([p({attribute:!1})],C.prototype,"device");I([p({attribute:!1})],C.prototype,"library");I([p({type:Boolean})],C.prototype,"isAdmin");I([p({attribute:!1})],C.prototype,"savedSceneSelection");I([g()],C.prototype,"catalogue");I([g()],C.prototype,"category");I([g()],C.prototype,"search");I([g()],C.prototype,"selectedScene");I([g()],C.prototype,"selectedItem");I([g()],C.prototype,"content");I([g()],C.prototype,"name");I([g()],C.prototype,"speedIndex");I([g()],C.prototype,"loading");I([g()],C.prototype,"saving");I([g()],C.prototype,"applying");I([g()],C.prototype,"editingCopy");I([g()],C.prototype,"notice");I([g()],C.prototype,"error");function ge(s){return`builtin:${s.scene_id}:${s.effect_id}`}function tr(s,e){return Array.from({length:s},(t,i)=>({value:i,label:ir(i,e)}))}function ir(s,e){const t=s-e;if(t===0)return"Default";const i=Math.abs(t);return`${i} ${i===1?"step":"steps"} ${t<0?"lower":"higher"}`}function Je(s){return{...s,template:{...s.template},steps:s.steps.map(e=>({...e,colour:[...e.colour],inline_colour:e.inline_colour===null?null:[...e.inline_colour]})),palette:s.palette.map(e=>[...e])}}function sr(s){return s.kind==="scene_palette"?Je(s):s.kind==="scene_layered"?oe(s):{...s,template:{...s.template}}}customElements.get("govee-scene-browser")||customElements.define("govee-scene-browser",C);var nr=Object.defineProperty,Zt=(s,e,t,i)=>{for(var n=void 0,r=s.length-1,a;r>=0;r--)(a=s[r])&&(n=a(e,t,n)||n);return n&&nr(e,t,n),n};const rr=[{value:"movie",label:"Movie"},{value:"game",label:"Game"}],ar=[{value:!0,label:"Full screen"},{value:!1,label:"Part screen"}],or=[{key:"left",label:"Left"},{key:"top",label:"Top"},{key:"right",label:"Right"},{key:"bottom",label:"Bottom"}];function re(s,e,t){return Math.min(t,Math.max(e,Math.round(s)))}function lr(s){return{...s}}function Ci(s){return{...s,relative_brightness:lr(s.relative_brightness)}}function cs(s){const e=[s.left,s.top,s.right,s.bottom];return e.every(t=>t===e[0])?e[0]:void 0}function dr(s){const e=cs(s);return e!==void 0?e:re((s.left+s.top+s.right+s.bottom)/4,1,100)}function cr(s){const e=re(s,1,100);return{left:e,top:e,right:e,bottom:e}}class ct extends A{constructor(){super(...arguments),this.disabled=!1,this.showModeSelector=!0}render(){if(!this.content)return o`
        <section class="card empty-state" role="status">
          <h3 class="section-title">Video profile unavailable</h3>
          <p class="muted">
            Load an H6199 video profile to edit video-sync settings.
          </p>
        </section>
      `;const e=this.content.relative_brightness,t=cs(e)===void 0,i=dr(e);return o`
      <div class="editor-grid">
        <section class="card">
          <div class="parameter-stack">
            ${this.showModeSelector?this.renderSegmentedField("Mode",this.content.mode,rr,n=>this.updateContent(r=>{r.mode=n})):d}
            ${this.renderSegmentedField("Capture area",this.content.full_screen,ar,n=>this.updateContent(r=>{r.full_screen=n}))}
            ${this.renderCheckboxField("Sound effects",this.content.sound_effects,n=>this.updateContent(r=>{r.sound_effects=n}))}
            ${this.content.sound_effects?this.renderRangeField("Softness",this.content.sound_effects_softness,1,100,String(this.content.sound_effects_softness),n=>this.updateContent(r=>{r.sound_effects_softness=re(n,1,100)})):d}
            ${this.renderCheckboxField("Blank screen",this.content.blank_screen,n=>this.updateContent(r=>{r.blank_screen=n}))}
          </div>
        </section>

        <section class="card">
          <h3 class="section-title">Image</h3>
          <div class="parameter-stack">
            ${this.renderRangeField("Saturation",this.content.saturation,0,100,`${this.content.saturation}%`,n=>this.updateContent(r=>{r.saturation=re(n,0,100)}))}
            ${this.renderWhiteBalanceField(this.content.white_balance_position)}
          </div>
        </section>

        <section class="card brightness-card">
          <div class="card-heading">
            <h3 class="section-title">Relative brightness</h3>
            ${t?o`<span class="status-chip">Mixed edges</span>`:d}
          </div>
          <div class="parameter-stack">
            ${this.renderRangeField("Uniform brightness",i,1,100,`${i}%`,n=>this.updateContent(r=>{r.relative_brightness=cr(n)}),t?"relative-brightness-note":void 0)}
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
                ${or.map(({key:n})=>o`
                    <span
                      class="screen-edge screen-edge-${n}"
                      style=${`--edge-level: ${e[n]/100}`}
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
    `}renderSegmentedField(e,t,i,n){return o`
      <govee-segmented-control
        .label=${e}
        .value=${t}
        .options=${i}
        .disabled=${this.disabled}
        @value-changed=${r=>n(r.detail.value)}
      ></govee-segmented-control>
    `}renderCheckboxField(e,t,i){return o`
      <govee-checkbox-control
        .label=${e}
        .checked=${t}
        .disabled=${this.disabled}
        @checked-changed=${n=>i(n.detail.checked)}
      ></govee-checkbox-control>
    `}renderRangeField(e,t,i,n,r,a,l){return o`
      <govee-slider-control
        .label=${e}
        .value=${t}
        .minimum=${i}
        .maximum=${n}
        .valueText=${r}
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
            .value=${String(re(e,1,20))}
            aria-label="White balance"
            ?disabled=${this.disabled}
            @input=${t=>this.updateContent(i=>{i.white_balance_position=re(Number(t.target.value),1,20)})}
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
          @input=${n=>this.updateRelativeBrightnessEdge(e,Number(n.target.value))}
        />
        <output aria-label="${t} value">${i}%</output>
      </label>
    `}updateRelativeBrightnessEdge(e,t){this.updateContent(i=>{i.relative_brightness[e]=re(t,1,100)})}updateContent(e){if(!this.content)return;const t=Ci(this.content);e(t),this.emitContent(t)}emitContent(e){this.dispatchEvent(new CustomEvent("content-changed",{detail:{content:Ci(e)},bubbles:!0,composed:!0}))}static{this.styles=[M,ce,j,k`
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
    `]}}Zt([p({attribute:!1})],ct.prototype,"content");Zt([p({type:Boolean})],ct.prototype,"disabled");Zt([p({type:Boolean})],ct.prototype,"showModeSelector");customElements.get("govee-video-profile-editor")||customElements.define("govee-video-profile-editor",ct);var ur=Object.defineProperty,x=(s,e,t,i)=>{for(var n=void 0,r=s.length-1,a;r>=0;r--)(a=s[r])&&(n=a(e,t,n)||n);return n&&ur(e,t,n),n};const Lt=15;class $ extends A{constructor(){super(...arguments),this.showDevicePicker=!1,this.loading=!0,this.devices=[],this.section="custom",this.customEffectCategory="all",this.customCopyStarted=!1,this.library={library_revision:0,items:[]},this.name="",this.content=ye(),this.paintBrushes=Oe(),this.selectedPaintBrush=0,this.brushUsesBackground=!1,this.saving=!1,this.applying=!1,this.deployments=[],this.editorTransitionEpoch=0,this.loadEpoch=0,this.deploymentRevision=-1}get isAdmin(){return this.hass?.user?.is_admin===!0}get selectedDevice(){return this.devices.find(e=>e.config_entry_id===this.selectedDeviceId)}get selectedModel(){const e=this.selectedDevice?.model;return e==="H617A"||e==="H6199"?e:void 0}get editorReadOnly(){return!this.isAdmin||this.templateSourceLabel!==void 0}get modelCatalogue(){const e=this.selectedModel;return e?this.customCatalogue?.models[e]:void 0}get videoAvailable(){return!!this.modelCatalogue?.video_modes.length}get customEffectsAvailable(){const e=this.modelCatalogue;return!!(e&&(e.painted_effects.length||e.effects.length||e.music_modes.length||e.supports.advanced!=="unsupported"))}get dirty(){return V(this.content)?this.savedBaseline!==W(this.name,this.content):!1}get applyCapability(){if(!kt(this.content))return;const e=this.selectedDevice;if(e)switch(this.content.kind){case"h617a_painted":return e.custom_effects.painted;case"h617a_single":return e.custom_effects.single;case"h617a_multi":return e.custom_effects.multi;case"palette_diy":return e.custom_effects.palette_diy;case"advanced":case"scene_layered":return e.custom_effects.advanced;case"music_profile":return e.profiles.music;case"video_profile":return e.profiles.video;case"workshop":return e.custom_effects.workshop;case"special_diy":return e.custom_effects.special_diy}}get canApply(){return kt(this.content)&&this.isAdmin&&!this.applying&&!this.saving&&!this.deletingCurrentItem&&this.name.trim().length>0&&this.applyCapability==="supported"}get deletingCurrentItem(){return this.deletingItemId!==void 0&&this.currentItem?.id===this.deletingItemId}get activeDeployment(){const e=this.deployments.find(t=>t.operation_id===this.activeOperationId);return e||!this.applying?e:this.latestDeployment(ht)}connectedCallback(){super.connectedCallback(),this.hass&&!this.api&&this.load()}disconnectedCallback(){super.disconnectedCallback(),this.loadEpoch+=1,this.beginEditorTransition(),this.stopSubscriptions(),this.api=void 0}updated(e){e.has("hass")&&this.hass&&!this.api&&this.load(),this.syncSingleEffectSelects()}render(){return this.loading?o`<div class="centred" role="status">Loading effect studio...</div>`:this.error?this.renderFatalError():o`
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
                class="selector new-effect-action"
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
    `}renderCurrentCustomEditor(){return Te(this.content)?this.content.kind==="h617a_painted"?this.renderPaintedEditor():this.renderPaletteEffectEditor():this.content.kind==="palette_diy"||this.content.kind==="special_diy"?this.renderPaletteEffectEditor():this.content.kind==="music_profile"?this.renderMusicProfileEditor():Ge(this.content)?this.renderAdvancedEditor():this.content.kind==="opaque"?this.renderOpaqueEditor(this.content):d}renderVideo(){const e=this.modelCatalogue;if(!e||!this.videoAvailable)return d;const t=this.library.items.filter(i=>i.kind==="video_profile"&&this.libraryItemAvailable(i)).sort((i,n)=>Le(i.name,n.name));return o`
      <aside class="sidebar item-sidebar library" aria-label="Video profiles">
        ${e.video_modes.map(i=>this.videoListButton(`template:video:${i.id}`,i.label,()=>this.openVideoTemplate(i.id,i.label)))}
        ${t.map(i=>this.videoListButton(`saved:${i.id}`,i.name,()=>{this.selectItem(i.id)},i))}
      </aside>
      <section class="editor-surface editor">
        ${this.content.kind==="video_profile"?this.renderVideoProfileEditor():d}
      </section>
    `}videoListButton(e,t,i,n){const r=n?this.currentItem?.id===n.id:!this.currentItem&&this.customTemplateSelection===e;return o`
      <button
        class="selector item ${r?"selected":""}"
        type="button"
        ?disabled=${!n&&!this.isAdmin}
        @click=${i}
      >
        <span>${t}</span>
      </button>
    `}openVideoTemplate(e,t){this.selectedModel==="H6199"&&this.openEditableTemplate(t,pr(e),`template:video:${e}`)}renderVideoProfileEditor(){return this.content.kind!=="video_profile"?d:o`
      ${this.renderProfileHeading()}
      <govee-video-profile-editor
        .content=${this.content}
        .disabled=${this.editorReadOnly}
        .showModeSelector=${!this.templateSourceLabel}
        @content-changed=${e=>{this.content=gs(e.detail.content)}}
      ></govee-video-profile-editor>
      ${this.activeDeployment?this.renderDeployment(this.activeDeployment):d}
    `}renderMusicProfileEditor(){return this.content.kind!=="music_profile"?d:o`
      ${this.renderProfileHeading()}
      <govee-music-profile-editor
        .content=${this.content}
        .catalogue=${this.modelCatalogue}
        .disabled=${this.editorReadOnly}
        .showModeSelector=${!this.templateSourceLabel}
        @content-changed=${e=>{this.content=fs(e.detail.content)}}
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
    `)}get customEffectEntries(){const e=this.modelCatalogue;return[...e?.painted_effects.length?[{kind:"paint",key:"template:paint",label:"Paint",category:"single-layer"}]:[],...e?.music_modes.map(i=>({kind:"music",key:`template:music:${i.id}`,label:i.label,category:"music",mode:i.id}))??[],...e?.effects.filter(i=>i.category==="single_layer").map(i=>({kind:"single",key:`template:single:${i.family}:${i.variations[0].variant}`,label:i.label,category:"single-layer",family:i.family,variant:i.variations[0].variant}))??[],...e?.supports.multi!=="unsupported"?[{kind:"multi",key:"template:mix",label:"Mix",category:"multi-layer"}]:[],...e?.workshop_templates.map(i=>({kind:"workshop",key:`template:workshop:${i.id}`,label:i.label,category:"advanced",content:i.content}))??[],...e?.special_diy_templates.map(i=>({kind:"special_diy",key:`template:special-diy:${i.id}`,label:i.label,category:"special-diy",content:i.content}))??[],{kind:"advanced",key:"template:advanced",label:"Layered",category:"advanced"},...this.library.items.filter(i=>wt(i.kind)&&i.kind!=="video_profile").map(i=>({kind:"saved",key:`saved:${i.id}`,label:i.name,category:_r(i.kind),item:i}))].filter(i=>this.customEffectEntryAvailable(i)).filter(i=>this.customEffectCategory==="all"||this.customEffectCategory==="my-effects"&&i.kind==="saved"||i.category===this.customEffectCategory).sort((i,n)=>Le(i.label,n.label))}customEffectEntryAvailable(e){switch(e.kind){case"paint":return this.customEffectKindAvailable("h617a_painted");case"single":return this.customEffectKindAvailable(this.selectedModel==="H617A"?"h617a_single":"palette_diy");case"music":return this.customEffectKindAvailable("music_profile");case"multi":return this.customEffectKindAvailable("h617a_multi");case"advanced":return this.customEffectKindAvailable("advanced");case"workshop":return this.customEffectKindAvailable("workshop");case"special_diy":return this.customEffectKindAvailable("special_diy");case"saved":return this.libraryItemAvailable(e.item)}}libraryItemAvailable(e){const t=this.selectedModel;return e.model!==void 0&&e.model!==t?!1:e.kind==="video_profile"?this.videoAvailable:e.model===void 0&&["h617a_painted","h617a_single","h617a_multi"].includes(e.kind)&&t!=="H617A"?!1:this.customEffectKindAvailable(e.kind)}effectContentAvailable(e){const t=this.selectedModel;return e.kind==="h617a_painted"||e.kind==="h617a_single"||e.kind==="h617a_multi"?t==="H617A":e.kind==="palette_diy"||e.kind==="special_diy"||e.kind==="music_profile"||e.kind==="video_profile"||e.kind==="workshop"?e.model===t:e.kind==="scene_layered"?e.template.sku===t:this.customEffectKindAvailable(e.kind)}customEffectCategoryAvailable(e){switch(e){case"all":return this.customEffectsAvailable;case"music":return!!this.modelCatalogue?.music_modes.length;case"single-layer":return this.customEffectKindAvailable("h617a_painted")||this.customEffectKindAvailable("h617a_single")||this.customEffectKindAvailable("palette_diy");case"multi-layer":return this.customEffectKindAvailable("h617a_multi");case"advanced":return this.customEffectKindAvailable("advanced")||this.customEffectKindAvailable("workshop");case"special-diy":return this.customEffectKindAvailable("special_diy");case"my-effects":return this.library.items.some(t=>t.kind!=="video_profile"&&wt(t.kind)&&this.libraryItemAvailable(t))}}customEffectKindAvailable(e){const t=this.modelCatalogue,i=this.selectedModel;return e==="h617a_painted"?i==="H617A"&&!!t?.painted_effects.length:e==="h617a_single"?i==="H617A"&&!!t?.effects.length:e==="palette_diy"?i==="H6199"&&!!t?.effects.length:e==="h617a_multi"?i==="H617A"&&t?.supports.multi!=="unsupported":e==="music_profile"?!!t?.music_modes.length:e==="workshop"?t!==void 0&&t.supports.workshop!=="unsupported"&&!!t.workshop_templates.length:e==="special_diy"?t!==void 0&&t.supports.special_diy!=="unsupported"&&!!t.special_diy_templates.length:t?.supports.advanced!=="unsupported"}get defaultNewEffectKind(){return this.customEffectKindAvailable("h617a_single")?"h617a_single":this.customEffectKindAvailable("palette_diy")?"palette_diy":this.customEffectKindAvailable("h617a_painted")?"h617a_painted":this.customEffectKindAvailable("h617a_multi")?"h617a_multi":this.customEffectKindAvailable("advanced")?"advanced":void 0}customEffectCategoryButton(e,t){const i=this.customEffectCategory===e;return o`
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
    `}selectCustomEffectEntry(e){if(e.kind==="saved"){this.selectItem(e.item.id);return}if(e.kind==="advanced"){this.newEffect("advanced",void 0,{name:e.label,content:pt(),selectionIdentity:e.key,templateLabel:e.label}),this.customTemplateSelection=e.key;return}if(e.kind==="workshop"||e.kind==="special_diy"){this.openEditableTemplate(e.label,e.content,e.key);return}const t=this.modelCatalogue;if(t){if(e.kind==="music"){this.openMusicTemplate(e.mode,e.label);return}if(e.kind==="paint"){this.newEffect("h617a_painted",void 0,{name:e.label,content:ye(),selectionIdentity:e.key,templateLabel:e.label});return}if(e.kind==="single"){if(this.selectedModel==="H617A"){const i=se("h617a_single",t);this.newEffect("h617a_single",void 0,{name:e.label,content:{...i,family:e.family,variant:e.variant},selectionIdentity:e.key,templateLabel:e.label})}else this.openEditableTemplate(e.label,xt(t,this.selectedModel,e.family,e.variant),e.key);return}this.newEffect("h617a_multi",void 0,{name:e.label,content:se("h617a_multi",t),selectionIdentity:e.key,templateLabel:e.label})}}openEditableTemplate(e,t,i){this.beginEditorTransition(),this.currentItem=void 0,this.templateSourceLabel=e,this.customCopyStarted=!1,this.customTemplateSelection=i,this.name=e,this.content=je(t),this.savedBaseline=void 0,this.notice=void 0}openMusicTemplate(e,t){const i=this.selectedModel;i!=="H617A"&&i!=="H6199"||this.openEditableTemplate(t,{kind:"music_profile",model:i,mode:e,sensitivity:i==="H6199"?100:99,colour:null,calm:["rhythm","bloom","shiny"].includes(e)?!1:null,parameters:{}},`template:music:${e}`)}renderAdvancedEditor(){if(!Ge(this.content))return d;const e=this.content.kind==="scene_layered",t=this.activeDeployment;return o`
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

      ${this.renderNewEffectTypeTabs()}

      ${this.isAdmin?d:o`
            <div class="feedback read-only" role="note">
              You can inspect shared effects. An administrator is required to
              edit or save them.
            </div>
          `}

      <govee-advanced-effect-editor
        .content=${fr(this.content)}
        .disabled=${!this.isAdmin}
        .segmentCount=${this.selectedDevice?.segment_count??15}
        @content-changed=${i=>{!Ge(this.content)||!this.prepareTemplateEdit()||(this.content=gr(this.content,i.detail.content))}}
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

      ${this.renderNewEffectTypeTabs()}

      ${this.isAdmin?d:o`
            <div class="feedback read-only" role="note">
              You can inspect shared effects. An administrator is required to
              edit or apply them.
            </div>
          `}

      ${this.renderSingleEffectSelector()}

      <govee-painted-segment-editor
        .colours=${Mt(this.content)}
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
        @content-changed=${i=>{this.content=i.detail.content.kind==="palette_diy"?ps(i.detail.content):i.detail.content.kind==="special_diy"?hs(i.detail.content):us(i.detail.content)}}
      ></govee-custom-effect-editor>

      ${t?this.renderDeployment(t):d}
    `}renderSingleEffectSelector(){if(!this.customCatalogue||this.templateSourceLabel||this.content.kind!=="h617a_painted"&&this.content.kind!=="h617a_single"&&this.content.kind!=="palette_diy"||this.currentItem?.content.kind==="h617a_painted"&&this.content.kind==="h617a_painted")return d;const e=this.selectedSingleEffectFamily,t=this.currentItem?.content.kind==="h617a_painted"?[]:this.modelCatalogue?.effects.filter(a=>a.category==="single_layer")??[],i=t.some(a=>a.family===e?.family),n=this.content.kind==="h617a_painted"?"paint":e&&i?e.id:`unknown:${this.content.family}`,r=this.customEffectKindAvailable("h617a_painted")&&this.currentItem?.content.kind!=="h617a_single";return o`
      <section class="card single-effect-settings">
        <label class="field">
          <span>Effect</span>
          <select
            aria-label="Effect"
            .value=${n}
            ?disabled=${this.editorReadOnly}
            @change=${this.singleEffectChanged}
          >
            ${(this.content.kind==="h617a_single"||this.content.kind==="palette_diy")&&!i?o`
                  <option value=${n}>
                    Unknown effect ${this.content.family}
                  </option>
                `:d}
            ${r?o`
                  <option
                    value="paint"
                    ?selected=${n==="paint"}
                  >
                    Paint
                  </option>
                `:d}
            ${t.map(a=>o`
                <option
                  value=${a.id}
                  ?selected=${n===a.id}
                >
                  ${a.label}
                </option>
              `)}
          </select>
        </label>
      </section>
    `}renderPaintedVariationField(){if(!this.customCatalogue||this.content.kind!=="h617a_painted")return d;const e=this.content,t=this.customCatalogue.painted_effects,i=t.some(n=>n.id===e.effect);return i&&t.length<=1?d:o`
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
          ${t.map(n=>o`
              <option
                value=${n.id}
                ?selected=${n.id===e.effect}
              >
                ${n.label}
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
        @click=${this.save}
      >
        ${this.saving?"Saving...":e}
      </button>
    `}get selectedSingleEffectFamily(){if(this.content.kind!=="h617a_single"&&this.content.kind!=="palette_diy")return;const e=this.content.family;return this.modelCatalogue?.effects.find(t=>t.family===e)}syncSingleEffectSelects(){if(this.content.kind!=="h617a_painted"&&this.content.kind!=="h617a_single"&&this.content.kind!=="palette_diy")return;const e=this.shadowRoot?.querySelector('select[aria-label="Effect"]');if(e&&(e.value=this.content.kind==="h617a_painted"?"paint":this.selectedSingleEffectFamily?.id??`unknown:${this.content.family}`),this.content.kind==="h617a_painted"){const t=this.shadowRoot?.querySelector('select[aria-label="Variation"]');t&&(t.value=this.content.effect)}}sliderField(e,t,i,n){return o`
      <govee-slider-control
        .label=${e}
        .value=${i}
        .minimum=${0}
        .maximum=${100}
        .valueText=${n}
        .disabled=${this.editorReadOnly}
        @value-changed=${r=>this.updateContent({[t]:r.detail.value})}
      ></govee-slider-control>
    `}renderNewEffectTypeTabs(){return this.currentItem||this.templateSourceLabel||this.customCopyStarted||!V(this.content)?d:o`
      <div class="custom-mode-tabs" role="tablist" aria-label="Custom effect type">
        ${this.newEffectTypeAvailable("single")?this.newEffectTypeButton("single","Single Layer"):d}
        ${this.newEffectTypeAvailable("multi")?this.newEffectTypeButton("multi","Multi Layer"):d}
        ${this.newEffectTypeAvailable("advanced")?this.newEffectTypeButton("advanced","Advanced"):d}
      </div>
    `}newEffectTypeAvailable(e){return e==="single"?this.customEffectKindAvailable("h617a_painted")||this.customEffectKindAvailable("h617a_single")||this.customEffectKindAvailable("palette_diy"):this.customEffectKindAvailable(e==="multi"?"h617a_multi":"advanced")}newEffectTypeButton(e,t){const i=Ii(this.content)===e,n=e==="single"&&this.content.kind==="h617a_multi"&&this.content.effects.length>1,r=e==="multi"&&this.content.kind==="h617a_single"&&this.selectedSingleEffectFamily?.supports_multi===!1;return o`
      <button
        type="button"
        role="tab"
        aria-selected=${i}
        class=${i?"selected":""}
        title=${n?"Remove all but one effect before switching to Single Layer":r?"Choose a Single Layer effect that supports Multi Layer":d}
        ?disabled=${!this.isAdmin||n||r}
        @click=${()=>this.switchNewEffectType(e)}
      >
        ${t}
      </button>
    `}renderDeployment(e){const t=this.devices.find(n=>n.config_entry_id===e.config_entry_id)?.display_name??"device";let i;switch(e.phase){case"compiling":case"pending":i=`Preparing to apply to ${t}.`;break;case"uploading":i=`Applying to ${t}: ${e.progress_current} of ${e.progress_total}.`;break;case"activating":i=`Activating the selected effect on ${t}.`;break;case"verifying":i=`Checking the selected effect on ${t}.`;break;case"confirmed":case"applied":i=`Applied to ${t}.`;break;case"uncertain":i=e.error_code==="effect_content_readback_unproven"?`${t} reported the selected H6199 user-effect slot, but the uploaded effect content cannot be read back. The result remains uncertain.`:e.error_code==="activation_readback_unproven"?`The H6199 effect upload was sent to ${t}, but activation and readback remain unproven. The result is uncertain.`:`The final state of ${t} is uncertain. The requested settings could not be confirmed.`;break;case"recovering":i=`Restoring the previous state on ${t} after the apply failed.`;break;case"unknown":i=`Applied to ${t}, but the requested settings could not be confirmed.`;break;case"interrupted":i=`Apply to ${t} was interrupted by a Home Assistant restart.`;break;case"failed":i=`Apply to ${t} failed.`;break}return o`
      <div
        class="feedback deployment ${e.phase}"
        role=${["failed","uncertain","interrupted","unknown"].includes(e.phase)?"alert":"status"}
      >
        ${i}
      </div>
    `}async selectSection(e){const t=this.beginEditorTransition();if(e===this.section||e==="custom"&&!this.customEffectsAvailable||e==="video"&&!this.videoAvailable||(this.section=e,this.notice=void 0,e==="scenes"))return;if(e==="video"){const n=this.library.items.find(a=>a.kind==="video_profile"&&this.libraryItemAvailable(a));if(n){await this.selectItem(n.id,t);return}const r=this.modelCatalogue?.video_modes[0];r&&this.openVideoTemplate(r.id,r.label);return}if((Te(this.content)||this.content.kind==="palette_diy"||this.content.kind==="music_profile"||Ge(this.content)||this.content.kind==="opaque")&&this.customEffectKindAvailable(this.content.kind))return;const i=this.preferredLibraryEffect();if(i){await this.selectItem(i.id,t);return}this.isAdmin?this.openDefaultAvailableTemplate(t):(this.currentItem=void 0,this.name="")}async load(){const e=this.loadEpoch+1;this.loadEpoch=e,this.loading=!0,this.error=void 0,this.deploymentRevision=-1;const t=new Mn(this.hass);this.api=t;try{const[i,n,r,a]=await Promise.all([t.info(),t.devices(),t.library(),t.customCatalogue()]);if(!this.loadIsCurrent(e,t))return;if(!Ln(i))throw new Error("This editor bundle is not compatible with the installed backend.");this.devices=n,this.library=r,this.customCatalogue=a,this.selectedDeviceId=this.deviceIdFromPath()??n.find(h=>h.custom_effects.painted==="supported")?.config_entry_id??n[0]?.config_entry_id,this.customEffectsAvailable||(this.section="scenes");const l=await t.subscribeLibrary(h=>{this.libraryChanged(h)},h=>this.subscriptionFailed(h,e,t));if(!this.loadIsCurrent(e,t)||this.error){l();return}if(this.unsubscribeLibrary=l,this.isAdmin){const h=await t.subscribeDeployments(b=>{b.revision<this.deploymentRevision||(this.deploymentRevision=b.revision,this.deployments=b.deployments,this.activeOperationId||(this.activeOperationId=this.latestDeployment(ht)?.operation_id))},b=>this.subscriptionFailed(b,e,t));if(!this.loadIsCurrent(e,t)||this.error){h();return}this.unsubscribeDeployments=h}const c=this.preferredLibraryEffect(r.items);c?await this.selectItem(c.id):this.isAdmin&&this.openDefaultAvailableTemplate()}catch(i){this.loadIsCurrent(e,t)&&(this.stopSubscriptions(),this.error=N(i))}finally{this.loadIsCurrent(e,t)&&(this.loading=!1)}}openDefaultTemplate(e){this.newEffect("h617a_painted",e,{name:"Paint",content:ye(),selectionIdentity:"template:paint",templateLabel:"Paint"})}preferredLibraryEffect(e=this.library.items){return e.filter(t=>t.kind!=="video_profile"&&wt(t.kind)&&this.libraryItemAvailable(t)).sort((t,i)=>Pi(t.kind,this.selectedModel)-Pi(i.kind,this.selectedModel)||Le(t.name,i.name))[0]}openDefaultAvailableTemplate(e){if(this.customEffectKindAvailable("h617a_painted")){this.openDefaultTemplate(e);return}if(this.customEffectKindAvailable("h617a_single")&&this.modelCatalogue?.effects[0]){const t=this.modelCatalogue.effects.find(r=>r.category==="single_layer")??this.modelCatalogue.effects[0],i=t.variations[0],n=se("h617a_single",this.modelCatalogue);this.newEffect("h617a_single",e,{name:t.label,content:{...n,family:t.family,variant:i.variant},selectionIdentity:`template:single:${t.family}:${i.variant}`,templateLabel:t.label});return}if(this.customEffectKindAvailable("palette_diy")&&this.modelCatalogue?.effects[0]){const t=this.modelCatalogue.effects.find(i=>i.category==="single_layer")??this.modelCatalogue.effects[0];this.openEditableTemplate(t.label,xt(this.modelCatalogue,this.selectedModel,t.family,t.variations[0].variant),`template:single:${t.family}:${t.variations[0].variant}`);return}if(this.customEffectKindAvailable("h617a_multi")){this.newEffect("h617a_multi",e,{name:"Mix",content:se("h617a_multi",this.modelCatalogue),selectionIdentity:"template:mix",templateLabel:"Mix"});return}if(this.customEffectKindAvailable("advanced")){this.newEffect("advanced",e,{name:"Layered",content:pt(),selectionIdentity:"template:advanced",templateLabel:"Layered"});return}this.currentItem=void 0,this.name=""}loadIsCurrent(e,t){return this.isConnected&&this.loadEpoch===e&&this.api===t}subscriptionFailed(e,t,i){this.loadIsCurrent(t,i)&&(this.error=e.message,this.loading=!1,queueMicrotask(()=>{this.loadIsCurrent(t,i)&&this.stopSubscriptions()}))}stopSubscriptions(){this.unsubscribeLibrary?.(),this.unsubscribeDeployments?.(),this.unsubscribeLibrary=void 0,this.unsubscribeDeployments=void 0}deviceIdFromPath(){const e=window.location.pathname.match(/\/ha-govee-led-ble\/editor\/([^/]+)/);return e?.[1]?decodeURIComponent(e[1]):void 0}async libraryChanged(e){const t=this.library.library_revision;if(e.library_revision<t||(this.library=e,!this.currentItem||e.library_revision===t))return;const i=e.items.find(a=>a.id===this.currentItem?.id);if(!i){if(this.deletingItemId===this.currentItem.id)return;this.notice="This effect was removed from the shared library.";return}if(i.revision===this.currentItem.revision)return;if(this.dirty){this.notice="This effect changed elsewhere. Reload it before saving.";return}const n=this.beginEditorTransition();await this.selectItem(i.id,n)&&this.editorTransitionIsCurrent(n)&&(this.notice="Loaded the latest shared revision.")}sceneLibraryItemSaved(e){this.library={library_revision:e.detail.library_revision,items:Di(this.library.items,e.detail.item)}}sceneTemplateSelected(e){if(!this.isAdmin||e.detail.config_entry_id!==this.selectedDeviceId)return;const t=this.beginEditorTransition();this.currentItem=e.detail.item,this.templateSourceLabel=void 0,this.customCopyStarted=e.detail.item===void 0,this.name=e.detail.name.trim()||"Layered scene template",this.content=oe(e.detail.content),this.savedBaseline=e.detail.item?.content.kind==="scene_layered"?W(e.detail.item.name,e.detail.item.content):void 0,this.section="custom",this.customEffectCategory="all",this.customTemplateSelection=void 0,this.notice=void 0,e.detail.item||this.selectNewEffectName(t)}sceneLibraryItemDeleteRequested(e){this.requestDelete(e.detail,e.target)}backToScenes(){this.beginEditorTransition(),this.section="scenes",this.notice=void 0}beginEditorTransition(){return this.editorTransitionEpoch+=1,this.editorTransitionEpoch}editorTransitionIsCurrent(e){return e===this.editorTransitionEpoch}deviceChanged(e){const t=this.beginEditorTransition();if(this.selectedDeviceId=e.target.value,this.activeOperationId=void 0,this.activeOperationId=this.latestDeployment(ht)?.operation_id,this.notice=void 0,this.section==="video"&&!this.videoAvailable){this.section="scenes";return}if(!this.customEffectsAvailable){this.section="scenes";return}if(this.customEffectCategoryAvailable(this.customEffectCategory)||(this.customEffectCategory="all"),this.section==="custom"&&!this.effectContentAvailable(this.content)){const i=this.customEffectEntries.filter(r=>r.kind!=="saved"),n=this.customEffectCategory==="all"?void 0:this.customEffectCategory==="music"?i.find(r=>r.kind==="music"&&r.mode!==void 0):i[0];n?this.selectCustomEffectEntry(n):this.openDefaultAvailableTemplate(t)}if(this.section==="video"&&this.content.kind==="video_profile"&&this.content.model!==this.selectedModel){const i=this.modelCatalogue?.video_modes[0];i&&this.openVideoTemplate(i.id,i.label)}}switchNewEffectType(e){if(!this.isAdmin||!this.newEffectTypeAvailable(e)||this.currentItem||this.templateSourceLabel||!V(this.content)||Ii(this.content)===e||e==="multi"&&this.content.kind==="h617a_single"&&this.selectedSingleEffectFamily?.supports_multi===!1)return;if(e==="advanced"){this.newEffect("advanced");return}const t=e==="single"?this.selectedModel==="H6199"?"palette_diy":"h617a_single":"h617a_multi";if(Te(this.content)&&t!=="palette_diy"){this.switchCustomMode(t);return}this.content.kind==="palette_diy"&&t==="palette_diy"||this.newEffect(t)}switchCustomMode(e){if(!this.isAdmin||!this.customCatalogue||!Te(this.content)||this.content.kind===e)return;const t=this.content;if(e==="h617a_single"&&t.kind==="h617a_multi"&&t.effects.length>1)return;let i;if(e==="h617a_painted"){const n=t.kind==="h617a_painted"?this.activePaintBrush:t.palette[0]?[...t.palette[0]]:[47,111,237];i={...ye(),speed:t.speed,groups:[{fill:[...n],segments:Array.from({length:Lt},(r,a)=>a)}]},t.kind!=="h617a_painted"&&(this.paintBrushes=br(t.palette),this.selectedPaintBrush=0),this.brushUsesBackground=!1}else if(t.kind==="h617a_painted"){const n=vr(t);if(e==="h617a_single"){const r=se(e,this.customCatalogue);i={...r,speed:t.speed,palette:n.length?n:r.palette}}else{const r=se("h617a_multi",this.customCatalogue);i={...r,speed:t.speed,palette:n.length?n:r.palette}}}else if(e==="h617a_multi"&&t.kind==="h617a_single")i={kind:e,effects:[{family:t.family,variant:t.variant}],speed:t.speed,palette:t.palette.map(n=>[...n])};else if(e==="h617a_single"&&t.kind==="h617a_multi"){const n=t.effects[0];i={kind:e,family:n.family,variant:n.variant,speed:t.speed,palette:t.palette.map(r=>[...r])}}else return;this.content=i,/^New (Paint|Painted|Single|Multi) effect$/.test(this.name)&&(this.name=`New ${Ai(e)} effect`),this.notice=this.applyAvailabilityNotice()}newEffect(e,t,i){const n=t??this.beginEditorTransition();!this.api||!this.isAdmin||!this.customEffectKindAvailable(e)||e!=="advanced"&&!this.modelCatalogue||(this.currentItem=void 0,this.templateSourceLabel=i?.templateLabel,this.customCopyStarted=!1,this.customTemplateSelection=e==="advanced"?void 0:i?.selectionIdentity??(e==="h617a_painted"?"template:paint":void 0),this.name=i?.name??`New ${Ai(e)} effect`,this.content=i?.content??(e==="advanced"?pt():e==="palette_diy"?xt(this.modelCatalogue,this.selectedModel):se(e,this.modelCatalogue)),e==="h617a_painted"&&(this.brushUsesBackground=!1),this.savedBaseline=void 0,this.notice=this.applyAvailabilityNotice(),this.selectNewEffectName(n))}selectNewEffectName(e){this.updateComplete.then(()=>{if(!this.editorTransitionIsCurrent(e)||this.currentItem||this.templateSourceLabel)return;const t=this.shadowRoot?.querySelector(".editor .editor-name");t?.focus(),t?.select()})}renderEditorDeleteButton(){return!this.isAdmin||!this.currentItem?d:o`
      <button
        class="danger"
        type="button"
        ?disabled=${this.deletingItemId!==void 0||this.saving||this.applying}
        @click=${e=>this.requestDelete({id:this.currentItem.id,revision:this.currentItem.revision,name:this.currentItem.name},e.currentTarget)}
      >
        ${this.deletingCurrentItem?"Deleting...":"Delete"}
      </button>
    `}requestDelete(e,t){!this.api||!this.isAdmin||this.deletingItemId!==void 0||this.saving||this.applying||(this.deleteCandidate={...e},this.deleteReturnFocus=t,this.notice=void 0,this.updateComplete.then(()=>{this.shadowRoot?.querySelector(".delete-dialog .danger")?.focus()}))}cancelDelete(){const e=this.deleteReturnFocus;this.deleteCandidate=void 0,this.deleteReturnFocus=void 0,this.updateComplete.then(()=>{e?.isConnected&&e.focus()})}deleteDialogKeyDown(e){e.key==="Escape"&&(e.preventDefault(),this.cancelDelete())}async confirmDelete(){const e=this.deleteCandidate,t=this.api;if(!e||!t||!this.isAdmin||this.deletingItemId!==void 0)return;const i=this.library.library_revision;this.deleteCandidate=void 0,this.deleteReturnFocus=void 0,this.deletingItemId=e.id,this.notice=void 0;try{const n=await t.deleteItem(e,i);n>=this.library.library_revision&&(this.library={library_revision:n,items:this.library.items.filter(r=>r.id!==e.id)}),this.currentItem?.id===e.id&&this.currentItem.revision===e.revision&&(this.beginEditorTransition(),this.currentItem=void 0,this.templateSourceLabel=void 0,this.customCopyStarted=!1,this.customTemplateSelection=void 0,this.name="",this.content=ye(),this.savedBaseline=void 0),this.notice=`Deleted ${e.name}.`}catch(n){const r=Et(n)==="conflict";if(this.notice=r?"This effect or library changed elsewhere. Reload before deleting.":`Delete failed: ${N(n)}`,r)try{const a=await t.library();a.library_revision>=this.library.library_revision&&(this.library=a)}catch(a){this.notice+=` Library refresh failed: ${N(a)}`}}finally{this.deletingItemId=void 0}}async selectItem(e,t){const i=t??this.beginEditorTransition();if(!this.api)return!1;try{const n=await this.api.item(e);return this.editorTransitionIsCurrent(i)?n.content.kind==="opaque"?(this.currentItem=n,this.templateSourceLabel=void 0,this.customCopyStarted=!1,this.customTemplateSelection=void 0,this.name=n.name,this.content=mr(n.content),this.savedBaseline=void 0,this.notice="This effect definition is preserved, but this editor cannot change or apply it.",!0):V(n.content)?(this.currentItem=n,this.templateSourceLabel=void 0,this.customCopyStarted=!1,this.customTemplateSelection=void 0,this.name=n.name,this.content=je(n.content),n.content.kind==="h617a_painted"&&(this.brushUsesBackground=!1),this.savedBaseline=W(n.name,n.content),this.notice=this.applyAvailabilityNotice(),!0):(this.notice="This item cannot be edited here.",!1):!1}catch(n){return this.editorTransitionIsCurrent(i)&&(this.notice=N(n)),!1}}nameChanged(e){this.name=e.target.value}editTemplate(){this.prepareTemplateEdit(!0)}prepareTemplateEdit(e=!1){const t=this.templateSourceLabel;if(!t)return!0;if(!this.isAdmin||this.saving||this.applying||this.deletingCurrentItem)return!1;const i=this.beginEditorTransition();return this.templateSourceLabel=void 0,this.customTemplateSelection=void 0,this.customCopyStarted=!0,this.name=`Custom ${t}`,this.savedBaseline=void 0,e&&this.selectNewEffectName(i),!0}paintBrushesChanged(e){this.paintBrushes=e.detail.palette.map(t=>[...t]),this.selectedPaintBrush=Math.max(0,Math.min(this.selectedPaintBrush,this.paintBrushes.length-1)),this.brushUsesBackground=!1}paintBrushSelected(e){this.selectedPaintBrush=e.detail.index,this.brushUsesBackground=!1}get activePaintBrush(){return[...this.paintBrushes[this.selectedPaintBrush]??this.paintBrushes[0]??[47,111,237]]}backgroundChanged(e){this.updateContent({background:[...e.detail.colour]})}singleEffectChanged(e){if(!this.customCatalogue||this.currentItem?.content.kind==="opaque")return;const t=e.target.value;if(this.currentItem&&(this.content.kind==="h617a_painted"&&t!=="paint"||this.content.kind==="h617a_single"&&t==="paint"))return;const i=this.templateSourceLabel!==void 0||this.customTemplateSelection!==void 0;if(t==="paint"){this.content.kind!=="h617a_painted"&&this.switchCustomMode("h617a_painted"),i&&(this.customTemplateSelection="template:paint"),this.updateGeneratedEffectName("Paint");return}const n=this.modelCatalogue?.effects.find(a=>a.id===t),r=n?.variations[0];!n||!r||(this.content.kind==="h617a_painted"&&this.switchCustomMode("h617a_single"),!(this.content.kind!=="h617a_single"&&this.content.kind!=="palette_diy")&&(this.content={...this.content,family:n.family,variant:r.variant},i&&(this.customTemplateSelection=`template:single:${n.family}:${r.variant}`),this.updateGeneratedEffectName(n.label)))}paintedEffectVariationChanged(e){this.content.kind==="h617a_painted"&&this.updateContent({effect:e.target.value})}updateGeneratedEffectName(e){if(this.templateSourceLabel){this.templateSourceLabel=e,this.name=e;return}!this.currentItem&&/^New .+ effect$/.test(this.name)&&(this.name=`New ${e} effect`)}setSegmentColour(e){if(this.content.kind!=="h617a_painted")return;const t=Mt(this.content);t[e]=this.brushUsesBackground?[...this.content.background]:this.activePaintBrush,this.content={...this.content,groups:Si(t,this.content.background)}}paintAll(){if(this.content.kind!=="h617a_painted")return;const e=this.brushUsesBackground?this.content.background:this.activePaintBrush;this.content={...this.content,groups:Si(Array.from({length:Lt},()=>[...e]),this.content.background)}}resetPaint(){this.content.kind==="h617a_painted"&&(this.content={...this.content,groups:[]})}updateContent(e){this.content.kind==="h617a_painted"&&(this.content={...this.content,...e})}async save(){if(!this.api||!this.isAdmin||!this.dirty||this.saving||this.applying||this.deletingCurrentItem||!V(this.content))return;const e=this.api,t=this.name.trim();if(!t){this.notice="Give this effect a name before saving.";return}const i=this.beginEditorTransition(),n=this.currentItem,r=je(this.content),a=this.library.library_revision;this.saving=!0,this.notice=void 0;try{const l=n?await e.updateItem(n,t,r,a):await e.createItem(t,r,a);if(!V(l.item.content))throw new Error("The saved effect returned an unsupported definition.");const c=l.item.content;l.library_revision>=this.library.library_revision&&(this.library={library_revision:l.library_revision,items:Di(this.library.items,l.item)}),this.editorTransitionIsCurrent(i)&&Ti(this.currentItem,n)&&V(this.content)&&W(this.name,this.content)===W(t,r)&&(this.currentItem=l.item,this.customCopyStarted=!1,this.customTemplateSelection=void 0,this.name=l.item.name,this.content=je(c),this.savedBaseline=W(this.name,this.content),n&&c.kind==="scene_layered"&&(this.savedSceneSelection=l.item)),this.editorTransitionIsCurrent(i)&&Ti(this.currentItem,l.item)&&V(this.content)&&W(this.name,this.content)===W(l.item.name,c)&&(this.notice="Saved.")}catch(l){if(Et(l)==="conflict"){const c="This effect or library changed elsewhere. Reload before saving.";this.editorTransitionIsCurrent(i)&&(this.notice=c);try{const h=await e.library();h.library_revision>=this.library.library_revision&&(this.library=h)}catch(h){this.editorTransitionIsCurrent(i)&&(this.notice=`${c} Library refresh failed: `+N(h))}}else this.editorTransitionIsCurrent(i)&&(this.notice=`Save failed: ${N(l)}`)}finally{this.saving=!1}}async apply(){if(!this.api||!this.canApply||!kt(this.content)||!this.selectedDeviceId)return;const e=this.name.trim(),t=this.selectedDeviceId,i=this.editorTransitionEpoch;this.activeOperationId=void 0,this.applying=!0,this.notice=void 0;try{const n=!this.dirty&&this.currentItem?await this.api.applySaved(t,this.currentItem):await this.api.applySnapshot(t,e,this.content);if(i!==this.editorTransitionEpoch||t!==this.selectedDeviceId)return;this.activeOperationId=n.operation_id,this.deployments=[n,...this.deployments.filter(r=>r.operation_id!==n.operation_id)]}catch(n){i===this.editorTransitionEpoch&&t===this.selectedDeviceId&&(this.notice=`Apply failed: ${N(n)}`)}finally{this.applying=!1}}applyAvailabilityNotice(){if(this.selectedDeviceId&&!this.selectedDevice)return"This device is temporarily unavailable in Home Assistant. Apply is disabled until it is loaded."}latestDeployment(e){return[...this.deployments].filter(t=>t.config_entry_id===this.selectedDeviceId&&e.includes(t.phase)).sort((t,i)=>i.updated_at.localeCompare(t.updated_at))[0]}static{this.styles=[M,ce,Ht,Fi,j,Ui,qi,qt,Hi,k`
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

    .effect-categories .new-effect-action {
      color: var(--studio-blue);
      background: var(--studio-blue-soft);
      font-weight: 650;
    }

    .effect-categories .new-effect-action:hover {
      background: color-mix(in srgb, var(--studio-blue) 20%, transparent);
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
  `]}}x([p({attribute:!1})],$.prototype,"hass");x([p({attribute:!1})],$.prototype,"panel");x([p({type:Boolean})],$.prototype,"showDevicePicker");x([g()],$.prototype,"loading");x([g()],$.prototype,"error");x([g()],$.prototype,"notice");x([g()],$.prototype,"devices");x([g()],$.prototype,"selectedDeviceId");x([g()],$.prototype,"section");x([g()],$.prototype,"customEffectCategory");x([g()],$.prototype,"customTemplateSelection");x([g()],$.prototype,"templateSourceLabel");x([g()],$.prototype,"customCopyStarted");x([g()],$.prototype,"library");x([g()],$.prototype,"customCatalogue");x([g()],$.prototype,"currentItem");x([g()],$.prototype,"savedSceneSelection");x([g()],$.prototype,"name");x([g()],$.prototype,"content");x([g()],$.prototype,"paintBrushes");x([g()],$.prototype,"selectedPaintBrush");x([g()],$.prototype,"brushUsesBackground");x([g()],$.prototype,"saving");x([g()],$.prototype,"applying");x([g()],$.prototype,"deleteCandidate");x([g()],$.prototype,"deletingItemId");x([g()],$.prototype,"deployments");x([g()],$.prototype,"activeOperationId");function ye(){return{kind:"h617a_painted",effect:"clockwise",speed:50,brightness:100,background:[0,0,0],groups:[]}}function se(s,e){if(s==="h617a_painted")return ye();const t=s==="h617a_multi"?e.effects.find(r=>r.supports_multi):e.effects[0];if(!t)throw new Error("The custom-effect catalogue has no compatible effects.");const i=t.variations[0],n={family:t.family,variant:i.variant};return s==="h617a_single"?{kind:s,...n,speed:50,palette:Oe()}:{kind:s,effects:[n],speed:50,palette:Oe()}}function xt(s,e,t,i){if(e!=="H617A"&&e!=="H6199")throw new Error(`Unsupported custom-effect model ${e}.`);const n=s.effects.find(r=>r.family===t)??s.effects[0];if(!n)throw new Error("The custom-effect catalogue has no compatible effects.");return{kind:"palette_diy",model:e,family:t??n.family,variant:i??n.variations[0].variant,speed:50,palette:Oe()}}function pr(s){return{kind:"video_profile",model:"H6199",mode:s==="game"?"game":"movie",full_screen:!0,saturation:50,sound_effects:!1,sound_effects_softness:50,white_balance_position:17,relative_brightness:{left:100,top:100,right:100,bottom:100},blank_screen:!1}}function hr(s){return{...s,background:[...s.background],groups:s.groups.map(e=>({fill:[...e.fill],segments:[...e.segments]}))}}function us(s){return s.kind==="h617a_painted"?hr(s):s.kind==="h617a_single"?{...s,palette:s.palette.map(e=>[...e])}:{...s,effects:s.effects.map(e=>({...e})),palette:s.palette.map(e=>[...e])}}function ps(s){return{...s,palette:s.palette.map(e=>[...e])}}function hs(s){return{...s,palette:s.palette.map(e=>[...e])}}function ms(s){return{...s,effect:{layers:$e({layers:s.effect.layers}).layers}}}function fs(s){return{...s,colour:s.colour?[...s.colour]:null,parameters:structuredClone(s.parameters)}}function gs(s){return{...s,relative_brightness:{...s.relative_brightness}}}function je(s){return s.kind==="advanced"?$e(s):s.kind==="scene_layered"?oe(s):s.kind==="workshop"?ms(s):s.kind==="palette_diy"?ps(s):s.kind==="special_diy"?hs(s):s.kind==="music_profile"?fs(s):s.kind==="video_profile"?gs(s):us(s)}function mr(s){return{...s,body:structuredClone(s.body)}}function fr(s){return s.kind==="advanced"?s:{kind:"advanced",layers:s.effect.layers}}function gr(s,e){return s.kind==="advanced"?$e(e):s.kind==="workshop"?{...ms(s),effect:{layers:$e(e).layers}}:{...oe(s),effect:{layers:$e(e).layers}}}function Oe(){return[[255,0,0],[255,127,0],[255,255,0],[0,255,0],[0,0,255],[0,255,255],[139,0,255]]}function br(s){const e=[];for(const t of[...s,...Oe()])if(e.some(i=>it(i,t))||e.push([...t]),e.length===8)break;return e}function Mt(s){const e=Array.from({length:Lt},()=>[...s.background]);for(const t of s.groups)for(const i of t.segments)e[i]=[...t.fill];return e}function Si(s,e){const t=new Map;return s.forEach((i,n)=>{if(it(i,e))return;const r=i.join(","),a=t.get(r);a?a.segments.push(n):t.set(r,{fill:[...i],segments:[n]})}),[...t.values()]}function vr(s){const e=[];for(const t of Mt(s))if(!it(t,s.background)&&!e.some(i=>it(i,t))&&e.push([...t]),e.length===8)break;return e}function it(s,e){return s[0]===e[0]&&s[1]===e[1]&&s[2]===e[2]}function W(s,e){return JSON.stringify({name:s.trim(),content:e})}function Qt(s){return s==="h617a_painted"||s==="h617a_single"||s==="h617a_multi"}function Te(s){return typeof s=="object"&&s!==null&&"kind"in s&&Qt(s.kind)}function kt(s){return V(s)}function V(s){return Te(s)||typeof s=="object"&&s!==null&&"kind"in s&&(qe(s.kind)||s.kind==="palette_diy"||s.kind==="special_diy"||s.kind==="music_profile"||s.kind==="video_profile")}function Ii(s){return s.kind==="h617a_multi"?"multi":qe(s.kind)?"advanced":s.kind==="h617a_painted"||s.kind==="h617a_single"||s.kind==="palette_diy"||s.kind==="special_diy"?"single":void 0}function qe(s){return s==="advanced"||s==="scene_layered"||s==="workshop"}function Ge(s){return qe(s.kind)}function yr(s){return Qt(s)||qe(s)||s==="palette_diy"||s==="special_diy"||s==="music_profile"||s==="video_profile"||s==="scene_builtin"||s==="scene_palette"}function Ai(s){switch(s){case"h617a_painted":return"Paint";case"h617a_single":return"Single";case"h617a_multi":return"Multi";case"advanced":return"Layered";case"palette_diy":return"Single";case"special_diy":return"Special DIY";case"workshop":return"Workshop";default:return"Custom"}}function wt(s){return Qt(s)||qe(s)||s==="palette_diy"||s==="special_diy"||s==="music_profile"||!yr(s)}function Pi(s,e){const t=e==="H6199"?["special_diy","palette_diy","workshop","music_profile","advanced","scene_layered"]:["h617a_painted","h617a_single","h617a_multi","music_profile","workshop","advanced","scene_layered"],i=t.indexOf(s);return i===-1?t.length:i}function _r(s){return s==="h617a_multi"?"multi-layer":s==="music_profile"?"music":s==="h617a_painted"||s==="h617a_single"||s==="palette_diy"||s==="special_diy"?s==="special_diy"?"special-diy":"single-layer":"advanced"}function Ti(s,e){return s?.id===e?.id&&s?.revision===e?.revision}function Di(s,e){const t=$r(e);return[...s.filter(i=>i.id!==e.id),{id:e.id,revision:e.revision,name:e.name,kind:e.content.kind==="opaque"?e.content.source_kind:e.content.kind,...t?{model:t}:{},...e.content.kind==="scene_builtin"||e.content.kind==="scene_palette"||e.content.kind==="scene_layered"?{template:e.content.template}:{}}].sort((i,n)=>i.name.localeCompare(n.name))}function $r(s){const e=s.content;return e.kind==="palette_diy"||e.kind==="special_diy"||e.kind==="workshop"||e.kind==="music_profile"||e.kind==="video_profile"?e.model:e.kind==="h617a_painted"||e.kind==="h617a_single"||e.kind==="h617a_multi"?"H617A":e.kind==="scene_builtin"||e.kind==="scene_palette"||e.kind==="scene_layered"?Li(e.template.sku):Li(s.target_hint?.model)}function Li(s){return s==="H617A"||s==="H6199"?s:void 0}customElements.get("ha-govee-led-ble-editor")||customElements.define("ha-govee-led-ble-editor",$);
