const Ge=globalThis,Ot=Ge.ShadowRoot&&(Ge.ShadyCSS===void 0||Ge.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Bt=Symbol(),ti=new WeakMap;let Mi=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==Bt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(Ot&&e===void 0){const i=t!==void 0&&t.length===1;i&&(e=ti.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&ti.set(t,e))}return e}toString(){return this.cssText}};const bs=s=>new Mi(typeof s=="string"?s:s+"",void 0,Bt),k=(s,...e)=>{const t=s.length===1?s[0]:e.reduce((i,r,n)=>i+(a=>{if(a._$cssResult$===!0)return a.cssText;if(typeof a=="number")return a;throw Error("Value passed to 'css' function must be a 'css' function result: "+a+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+s[n+1],s[0]);return new Mi(t,s,Bt)},vs=(s,e)=>{if(Ot)s.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const i=document.createElement("style"),r=Ge.litNonce;r!==void 0&&i.setAttribute("nonce",r),i.textContent=t.cssText,s.appendChild(i)}},ii=Ot?s=>s:s=>s instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return bs(t)})(s):s;const{is:ys,defineProperty:_s,getOwnPropertyDescriptor:$s,getOwnPropertyNames:xs,getOwnPropertySymbols:ks,getPrototypeOf:ws}=Object,it=globalThis,si=it.trustedTypes,Es=si?si.emptyScript:"",Cs=it.reactiveElementPolyfillSupport,De=(s,e)=>s,Ze={toAttribute(s,e){switch(e){case Boolean:s=s?Es:null;break;case Object:case Array:s=s==null?s:JSON.stringify(s)}return s},fromAttribute(s,e){let t=s;switch(e){case Boolean:t=s!==null;break;case Number:t=s===null?null:Number(s);break;case Object:case Array:try{t=JSON.parse(s)}catch{t=null}}return t}},Ft=(s,e)=>!ys(s,e),ri={attribute:!0,type:String,converter:Ze,reflect:!1,useDefault:!1,hasChanged:Ft};Symbol.metadata??=Symbol("metadata"),it.litPropertyMetadata??=new WeakMap;let be=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=ri){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),r=this.getPropertyDescriptor(e,i,t);r!==void 0&&_s(this.prototype,e,r)}}static getPropertyDescriptor(e,t,i){const{get:r,set:n}=$s(this.prototype,e)??{get(){return this[t]},set(a){this[t]=a}};return{get:r,set(a){const l=r?.call(this);n?.call(this,a),this.requestUpdate(e,l,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??ri}static _$Ei(){if(this.hasOwnProperty(De("elementProperties")))return;const e=ws(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(De("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(De("properties"))){const t=this.properties,i=[...xs(t),...ks(t)];for(const r of i)this.createProperty(r,t[r])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[i,r]of t)this.elementProperties.set(i,r)}this._$Eh=new Map;for(const[t,i]of this.elementProperties){const r=this._$Eu(t,i);r!==void 0&&this._$Eh.set(r,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const r of i)t.unshift(ii(r))}else e!==void 0&&t.push(ii(e));return t}static _$Eu(e,t){const i=t.attribute;return i===!1?void 0:typeof i=="string"?i:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return vs(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,i);if(r!==void 0&&i.reflect===!0){const n=(i.converter?.toAttribute!==void 0?i.converter:Ze).toAttribute(t,i.type);this._$Em=e,n==null?this.removeAttribute(r):this.setAttribute(r,n),this._$Em=null}}_$AK(e,t){const i=this.constructor,r=i._$Eh.get(e);if(r!==void 0&&this._$Em!==r){const n=i.getPropertyOptions(r),a=typeof n.converter=="function"?{fromAttribute:n.converter}:n.converter?.fromAttribute!==void 0?n.converter:Ze;this._$Em=r;const l=a.fromAttribute(t,n.type);this[r]=l??this._$Ej?.get(r)??l,this._$Em=null}}requestUpdate(e,t,i,r=!1,n){if(e!==void 0){const a=this.constructor;if(r===!1&&(n=this[e]),i??=a.getPropertyOptions(e),!((i.hasChanged??Ft)(n,t)||i.useDefault&&i.reflect&&n===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,i))))return;this.C(e,t,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:r,wrapped:n},a){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),n!==!0||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),r===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[r,n]of this._$Ep)this[r]=n;this._$Ep=void 0}const i=this.constructor.elementProperties;if(i.size>0)for(const[r,n]of i){const{wrapped:a}=n,l=this[r];a!==!0||this._$AL.has(r)||l===void 0||this.C(r,void 0,n,l)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(i=>i.hostUpdate?.()),this.update(t)):this._$EM()}catch(i){throw e=!1,this._$EM(),i}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};be.elementStyles=[],be.shadowRootOptions={mode:"open"},be[De("elementProperties")]=new Map,be[De("finalized")]=new Map,Cs?.({ReactiveElement:be}),(it.reactiveElementVersions??=[]).push("2.1.2");const Ut=globalThis,ni=s=>s,Qe=Ut.trustedTypes,ai=Qe?Qe.createPolicy("lit-html",{createHTML:s=>s}):void 0,Ni="$lit$",X=`lit$${Math.random().toFixed(9).slice(2)}$`,Ri="?"+X,Ss=`<${Ri}>`,de=document,Te=()=>de.createComment(""),Me=s=>s===null||typeof s!="object"&&typeof s!="function",qt=Array.isArray,Is=s=>qt(s)||typeof s?.[Symbol.iterator]=="function",ut=`[ 	
\f\r]`,Ie=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,oi=/-->/g,li=/>/g,te=RegExp(`>|${ut}(?:([^\\s"'>=/]+)(${ut}*=${ut}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),di=/'/g,ci=/"/g,Oi=/^(?:script|style|textarea|title)$/i,As=s=>(e,...t)=>({_$litType$:s,strings:e,values:t}),o=As(1),U=Symbol.for("lit-noChange"),d=Symbol.for("lit-nothing"),ui=new WeakMap,ae=de.createTreeWalker(de,129);function Bi(s,e){if(!qt(s)||!s.hasOwnProperty("raw"))throw Error("invalid template strings array");return ai!==void 0?ai.createHTML(e):e}const Ps=(s,e)=>{const t=s.length-1,i=[];let r,n=e===2?"<svg>":e===3?"<math>":"",a=Ie;for(let l=0;l<t;l++){const c=s[l];let h,b,_=-1,R=0;for(;R<c.length&&(a.lastIndex=R,b=a.exec(c),b!==null);)R=a.lastIndex,a===Ie?b[1]==="!--"?a=oi:b[1]!==void 0?a=li:b[2]!==void 0?(Oi.test(b[2])&&(r=RegExp("</"+b[2],"g")),a=te):b[3]!==void 0&&(a=te):a===te?b[0]===">"?(a=r??Ie,_=-1):b[1]===void 0?_=-2:(_=a.lastIndex-b[2].length,h=b[1],a=b[3]===void 0?te:b[3]==='"'?ci:di):a===ci||a===di?a=te:a===oi||a===li?a=Ie:(a=te,r=void 0);const z=a===te&&s[l+1].startsWith("/>")?" ":"";n+=a===Ie?c+Ss:_>=0?(i.push(h),c.slice(0,_)+Ni+c.slice(_)+X+z):c+X+(_===-2?l:z)}return[Bi(s,n+(s[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),i]};class Ne{constructor({strings:e,_$litType$:t},i){let r;this.parts=[];let n=0,a=0;const l=e.length-1,c=this.parts,[h,b]=Ps(e,t);if(this.el=Ne.createElement(h,i),ae.currentNode=this.el.content,t===2||t===3){const _=this.el.content.firstChild;_.replaceWith(..._.childNodes)}for(;(r=ae.nextNode())!==null&&c.length<l;){if(r.nodeType===1){if(r.hasAttributes())for(const _ of r.getAttributeNames())if(_.endsWith(Ni)){const R=b[a++],z=r.getAttribute(_).split(X),He=/([.?@])?(.*)/.exec(R);c.push({type:1,index:n,name:He[2],strings:z,ctor:He[1]==="."?Ls:He[1]==="?"?Ts:He[1]==="@"?Ms:st}),r.removeAttribute(_)}else _.startsWith(X)&&(c.push({type:6,index:n}),r.removeAttribute(_));if(Oi.test(r.tagName)){const _=r.textContent.split(X),R=_.length-1;if(R>0){r.textContent=Qe?Qe.emptyScript:"";for(let z=0;z<R;z++)r.append(_[z],Te()),ae.nextNode(),c.push({type:2,index:++n});r.append(_[R],Te())}}}else if(r.nodeType===8)if(r.data===Ri)c.push({type:2,index:n});else{let _=-1;for(;(_=r.data.indexOf(X,_+1))!==-1;)c.push({type:7,index:n}),_+=X.length-1}n++}}static createElement(e,t){const i=de.createElement("template");return i.innerHTML=e,i}}function we(s,e,t=s,i){if(e===U)return e;let r=i!==void 0?t._$Co?.[i]:t._$Cl;const n=Me(e)?void 0:e._$litDirective$;return r?.constructor!==n&&(r?._$AO?.(!1),n===void 0?r=void 0:(r=new n(s),r._$AT(s,t,i)),i!==void 0?(t._$Co??=[])[i]=r:t._$Cl=r),r!==void 0&&(e=we(s,r._$AS(s,e.values),r,i)),e}class Ds{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,r=(e?.creationScope??de).importNode(t,!0);ae.currentNode=r;let n=ae.nextNode(),a=0,l=0,c=i[0];for(;c!==void 0;){if(a===c.index){let h;c.type===2?h=new Oe(n,n.nextSibling,this,e):c.type===1?h=new c.ctor(n,c.name,c.strings,this,e):c.type===6&&(h=new Ns(n,this,e)),this._$AV.push(h),c=i[++l]}a!==c?.index&&(n=ae.nextNode(),a++)}return ae.currentNode=de,r}p(e){let t=0;for(const i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class Oe{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,r){this.type=2,this._$AH=d,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=we(this,e,t),Me(e)?e===d||e==null||e===""?(this._$AH!==d&&this._$AR(),this._$AH=d):e!==this._$AH&&e!==U&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Is(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==d&&Me(this._$AH)?this._$AA.nextSibling.data=e:this.T(de.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,r=typeof i=="number"?this._$AC(e):(i.el===void 0&&(i.el=Ne.createElement(Bi(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===r)this._$AH.p(t);else{const n=new Ds(r,this),a=n.u(this.options);n.p(t),this.T(a),this._$AH=n}}_$AC(e){let t=ui.get(e.strings);return t===void 0&&ui.set(e.strings,t=new Ne(e)),t}k(e){qt(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,r=0;for(const n of e)r===t.length?t.push(i=new Oe(this.O(Te()),this.O(Te()),this,this.options)):i=t[r],i._$AI(n),r++;r<t.length&&(this._$AR(i&&i._$AB.nextSibling,r),t.length=r)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const i=ni(e).nextSibling;ni(e).remove(),e=i}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}}class st{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,r,n){this.type=1,this._$AH=d,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=n,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=d}_$AI(e,t=this,i,r){const n=this.strings;let a=!1;if(n===void 0)e=we(this,e,t,0),a=!Me(e)||e!==this._$AH&&e!==U,a&&(this._$AH=e);else{const l=e;let c,h;for(e=n[0],c=0;c<n.length-1;c++)h=we(this,l[i+c],t,c),h===U&&(h=this._$AH[c]),a||=!Me(h)||h!==this._$AH[c],h===d?e=d:e!==d&&(e+=(h??"")+n[c+1]),this._$AH[c]=h}a&&!r&&this.j(e)}j(e){e===d?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class Ls extends st{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===d?void 0:e}}class Ts extends st{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==d)}}class Ms extends st{constructor(e,t,i,r,n){super(e,t,i,r,n),this.type=5}_$AI(e,t=this){if((e=we(this,e,t,0)??d)===U)return;const i=this._$AH,r=e===d&&i!==d||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,n=e!==d&&(i===d||r);r&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class Ns{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){we(this,e)}}const Rs=Ut.litHtmlPolyfillSupport;Rs?.(Ne,Oe),(Ut.litHtmlVersions??=[]).push("3.3.3");const Os=(s,e,t)=>{const i=t?.renderBefore??e;let r=i._$litPart$;if(r===void 0){const n=t?.renderBefore??null;i._$litPart$=r=new Oe(e.insertBefore(Te(),n),n,void 0,t??{})}return r._$AI(s),r};const Ht=globalThis;let A=class extends be{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Os(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return U}};A._$litElement$=!0,A.finalized=!0,Ht.litElementHydrateSupport?.({LitElement:A});const Bs=Ht.litElementPolyfillSupport;Bs?.({LitElement:A});(Ht.litElementVersions??=[]).push("4.2.2");const Fs={attribute:!0,type:String,converter:Ze,reflect:!1,hasChanged:Ft},Us=(s=Fs,e,t)=>{const{kind:i,metadata:r}=t;let n=globalThis.litPropertyMetadata.get(r);if(n===void 0&&globalThis.litPropertyMetadata.set(r,n=new Map),i==="setter"&&((s=Object.create(s)).wrapped=!0),n.set(t.name,s),i==="accessor"){const{name:a}=t;return{set(l){const c=e.get.call(this);e.set.call(this,l),this.requestUpdate(a,c,s,!0,l)},init(l){return l!==void 0&&this.C(a,void 0,s,l),l}}}if(i==="setter"){const{name:a}=t;return function(l){const c=this[a];e.call(this,l),this.requestUpdate(a,c,s,!0,l)}}throw Error("Unsupported decorator location: "+i)};function p(s){return(e,t)=>typeof t=="object"?Us(s,e,t):((i,r,n)=>{const a=r.hasOwnProperty(n);return r.constructor.createProperty(n,i),a?Object.getOwnPropertyDescriptor(r,n):void 0})(s,e,t)}function m(s){return p({...s,state:!0,attribute:!1})}const M=k`
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
`,Vt=k`
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
`,K=k`
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
`,Kt=k`
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
`,qi=k`
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
`,Hi=k`
  .feedback {
    margin-bottom: var(--studio-section-gap);
    padding: 12px 14px;
    border: 1px solid var(--studio-border);
    border-radius: var(--studio-button-radius);
    background: var(--studio-card);
    line-height: 1.45;
  }
`;var qs=Object.defineProperty,jt=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&qs(e,t,r),r};class rt extends A{constructor(){super(...arguments),this.label="",this.checked=!1,this.disabled=!1}render(){return o`
      <label class="check-field">
        <input
          type="checkbox"
          .checked=${this.checked}
          ?disabled=${this.disabled}
          @change=${this.checkedChanged}
        />
        <span class="parameter-label">${this.label}</span>
      </label>
    `}checkedChanged(e){this.dispatchEvent(new CustomEvent("checked-changed",{detail:{checked:e.target.checked},bubbles:!0,composed:!0}))}static{this.styles=[M,K,k`
      :host {
        display: block;
      }
    `]}}jt([p()],rt.prototype,"label");jt([p({type:Boolean})],rt.prototype,"checked");jt([p({type:Boolean})],rt.prototype,"disabled");customElements.get("govee-checkbox-control")||customElements.define("govee-checkbox-control",rt);var Hs=Object.defineProperty,ue=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&Hs(e,t,r),r};class Q extends A{constructor(){super(...arguments),this.items=[],this.ariaLabel="Items",this.itemRole="button",this.addLabel="Add item",this.addDisabled=!1,this.reorderDisabled=!1,this.pointerX=0,this.pointerY=0,this.pointerMoved=!1,this.suppressClick=!1}render(){const e=this.itemRole==="tab";return o`
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
              @dragstart=${r=>this.dragStarted(i,r)}
              @dragover=${r=>{this.reorderDisabled||r.preventDefault()}}
              @drop=${r=>this.dropped(i,r)}
              @pointerdown=${r=>this.pointerStarted(i,r)}
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
                @keydown=${r=>this.keyPressed(i,r)}
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
    `}focusItem(e){this.updateComplete.then(()=>{this.shadowRoot?.querySelectorAll(".item")[e]?.focus()})}itemClicked(e){if(this.suppressClick){this.suppressClick=!1;return}this.dispatchEvent(new CustomEvent("item-selected",{detail:{index:e},bubbles:!0,composed:!0}))}addClicked(){this.dispatchEvent(new CustomEvent("item-added",{bubbles:!0,composed:!0}))}dragStarted(e,t){this.reorderDisabled||(this.draggedIndex=e,t.dataTransfer?.setData("text/plain",String(e)))}dropped(e,t){t.preventDefault(),this.draggedIndex!==void 0&&(this.reorder(this.draggedIndex,e),this.draggedIndex=void 0)}keyPressed(e,t){if(t.key!=="ArrowLeft"&&t.key!=="ArrowRight")return;t.preventDefault();const i=e+(t.key==="ArrowLeft"?-1:1);if(!(i<0||i>=this.items.length)){if(this.reorderDisabled){this.itemRole==="tab"&&(this.itemClicked(i),this.focusItem(i));return}this.reorder(e,i,!0)}}pointerStarted(e,t){this.reorderDisabled||t.pointerType==="mouse"||t.target.closest(".strip-popover")||(this.suppressClick=!1,this.pointerId=t.pointerId,this.pointerIndex=e,this.pointerTarget=t.currentTarget,this.pointerX=t.clientX,this.pointerY=t.clientY,this.pointerMoved=!1)}pointerMovedOver(e){if(e.pointerId!==this.pointerId||this.pointerIndex===void 0)return;const t=e.clientX-this.pointerX,i=e.clientY-this.pointerY;if(!this.pointerMoved){if(Math.abs(i)>Math.abs(t)||Math.abs(t)<10)return;this.pointerMoved=!0,this.pointerTarget?.setPointerCapture(e.pointerId)}e.preventDefault();const r=this.shadowRoot?.elementFromPoint(e.clientX,e.clientY)?.closest("[data-item-index]"),n=Number(r?.dataset.itemIndex);!Number.isInteger(n)||n===this.pointerIndex||(this.reorder(this.pointerIndex,n),this.pointerIndex=n)}pointerFinished(e){if(e.pointerId!==this.pointerId)return;const t=this.pointerTarget;t?.hasPointerCapture(e.pointerId)&&t.releasePointerCapture(e.pointerId),this.suppressClick=this.pointerMoved,this.pointerId=void 0,this.pointerIndex=void 0,this.pointerTarget=void 0,this.pointerMoved=!1}reorder(e,t,i=!1){this.reorderDisabled||e===t||(this.dispatchEvent(new CustomEvent("items-reordered",{detail:{from:e,to:t},bubbles:!0,composed:!0})),i&&this.focusItem(t))}static{this.styles=[M,k`
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
  `]}}ue([p({attribute:!1})],Q.prototype,"items");ue([p({attribute:!1})],Q.prototype,"activeIndex");ue([p()],Q.prototype,"ariaLabel");ue([p()],Q.prototype,"itemRole");ue([p()],Q.prototype,"addLabel");ue([p({type:Boolean})],Q.prototype,"addDisabled");ue([p({type:Boolean})],Q.prototype,"reorderDisabled");customElements.get("govee-reorderable-strip")||customElements.define("govee-reorderable-strip",Q);var Vs=Object.defineProperty,Be=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&Vs(e,t,r),r};class Ce extends A{constructor(){super(...arguments),this.label="",this.options=[],this.value="",this.disabled=!1,this.hideLabel=!1}render(){return o`
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
    `}select(e){this.disabled||e===this.value||this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}static{this.styles=[M,K,k`
      :host {
        display: block;
      }
    `]}}Be([p()],Ce.prototype,"label");Be([p({attribute:!1})],Ce.prototype,"options");Be([p({attribute:!1})],Ce.prototype,"value");Be([p({type:Boolean})],Ce.prototype,"disabled");Be([p({type:Boolean})],Ce.prototype,"hideLabel");customElements.get("govee-segmented-control")||customElements.define("govee-segmented-control",Ce);var Ks=Object.defineProperty,j=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&Ks(e,t,r),r};class q extends A{constructor(){super(...arguments),this.label="",this.value=0,this.minimum=0,this.maximum=100,this.step=1,this.disabled=!1,this.showValue=!1}render(){const e=js(this.value,this.minimum,this.maximum),t=this.valueText??String(e);return o`
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
    `}inputChanged(e){this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:Number(e.target.value)},bubbles:!0,composed:!0}))}static{this.styles=[M,K,k`
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
    `]}}j([p()],q.prototype,"label");j([p({type:Number})],q.prototype,"value");j([p({type:Number})],q.prototype,"minimum");j([p({type:Number})],q.prototype,"maximum");j([p({type:Number})],q.prototype,"step");j([p({type:Boolean})],q.prototype,"disabled");j([p({type:Boolean})],q.prototype,"showValue");j([p({attribute:!1})],q.prototype,"valueText");j([p({attribute:!1})],q.prototype,"describedBy");function js(s,e,t){return Math.min(t,Math.max(e,s))}customElements.get("govee-slider-control")||customElements.define("govee-slider-control",q);var Gs=Object.defineProperty,Gt=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&Gs(e,t,r),r};class nt extends A{constructor(){super(...arguments),this.label="",this.checked=!1,this.disabled=!1}render(){return o`
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
    `]}}Gt([p()],nt.prototype,"label");Gt([p({type:Boolean})],nt.prototype,"checked");Gt([p({type:Boolean})],nt.prototype,"disabled");customElements.get("govee-switch-control")||customElements.define("govee-switch-control",nt);function J(s){return s.map(e=>[...e])}function w(s){return`#${s.map(e=>e.toString(16).padStart(2,"0")).join("")}`}function pi(s){return[Number.parseInt(s.slice(1,3),16),Number.parseInt(s.slice(3,5),16),Number.parseInt(s.slice(5,7),16)]}function Le(s,e){return s.localeCompare(e,"en-AU",{sensitivity:"base"})}function Et(s,e,t){return s===void 0||e===t?s:s===e?t:e<t&&s>e&&s<=t?s-1:t<e&&s>=t&&s<e?s+1:s}function N(s){return s instanceof Error||typeof s=="object"&&s!==null&&"message"in s&&typeof s.message=="string"?s.message:"An unexpected error occurred."}function Ct(s){if(typeof s=="object"&&s!==null&&"code"in s&&typeof s.code=="string")return s.code}var zs=Object.defineProperty,pe=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&zs(e,t,r),r};const me=5,hi=8,mi=15,Vi=[1,2,0,3],Ki=[0,1,2,3],Ys=[1,2,3,4,5].map(s=>({value:s,label:String(s)})),Ws={0:"Segment",1:"Continuous",2:"Random",3:"Custom"},Xs={0:"Brightest to darkest",1:"Brightest, darkest, brightest",2:"Darkest to brightest",3:"Darkest, brightest, darkest"},fi={0:"Forward",1:"Backward",2:"Forward and back",3:"Back and forward"};class ee extends A{constructor(){super(...arguments),this.disabled=!1,this.segmentCount=mi,this.activeLayerIndex=0,this.activePatternIndex=0,this.movementAnnouncement="",this.layerActionsOpen=!1,this.windowPointerDown=e=>{if(!this.layerActionsOpen)return;const t=this.shadowRoot?.querySelector(".layer-actions-menu");t&&!e.composedPath().includes(t)&&(this.layerActionsOpen=!1)}}connectedCallback(){super.connectedCallback(),window.addEventListener("pointerdown",this.windowPointerDown)}disconnectedCallback(){window.removeEventListener("pointerdown",this.windowPointerDown),super.disconnectedCallback()}willUpdate(e){if(!(!e.has("content")||!this.content)){if(this.content.layers.length===0){this.activeLayerIndex=0,this.activePatternIndex=0;return}if(this.activeLayerIndex=ve(this.activeLayerIndex,0,this.content.layers.length-1),this.activeLayer.brightness_patterns.length===0){this.activePatternIndex=0;return}this.activePatternIndex=ve(this.activePatternIndex,0,this.activeLayer.brightness_patterns.length-1)}}render(){if(!this.content)return d;if(this.content.layers.length===0)return this.renderEmptyLayers();const e=this.activeLayer,t=this.content.layers.map((i,r)=>({key:`layer-${r}`,label:`Layer ${r+1}`,ariaLabel:`Layer ${r+1}. Drag to reorder or use arrow keys.`,id:`advanced-layer-tab-${r}`,ariaControls:"advanced-layer-panel"}));return o`
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
    `}get activeLayer(){return this.content.layers[this.activeLayerIndex]}renderAppliedArea(e){const t=e.area.start_tenths>=0&&e.area.start_tenths<=9&&e.area.width_tenths>=1&&e.area.width_tenths<=10-e.area.start_tenths,i=ve(e.area.start_tenths,0,9),r=i+e.area.width_tenths,n=Number.isInteger(this.segmentCount)&&this.segmentCount>0?this.segmentCount:mi,a=w(e.palette[0]??[47,111,237]);return o`
      <section class="card wide-card">
        <h3 class="section-title">Applied area</h3>
        <div class="area-control">
          <div
            class="area-segments"
            style="--area-segment-count: ${n}; --area-colour: ${a};"
            aria-label="Applied area, ${n} segments"
          >
            ${Array.from({length:n},(l,c)=>o`
                <span
                  class=${t&&tr(c,n,i,r)?"covered":""}
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
                      max=${r-1}
                      step="1"
                      .value=${String(i)}
                      aria-label="Applied area left edge"
                      aria-valuetext="${i*10}%"
                      ?disabled=${this.disabled}
                      @input=${l=>this.setAppliedArea(Number(l.target.value),r)}
                    />
                  </label>
                  <label class="area-boundary">
                    <span>
                      <span>Right edge</span>
                      <output aria-label="Applied area right edge value"
                        >${r*10}%</output
                      >
                    </span>
                    <input
                      type="range"
                      min=${i+1}
                      max="10"
                      step="1"
                      .value=${String(r)}
                      aria-label="Applied area right edge"
                      aria-valuetext="${r*10}%"
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
            @change=${r=>this.updateSelection({type:Number(r.target.value)})}
          >
            ${Vi.map(r=>o`<option
                  value=${r}
                  .selected=${t.type===r}
                >
                  ${Ws[r]}
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
              ${this.byteNumberField("Type (raw byte)",t.type,r=>this.updateSelection({type:r}))}
            `}
        ${t.type===0?o`
              ${this.byteNumberField("Segments",t.param_2,r=>this.updateSelection({param_2:r}))}
              ${this.byteNumberField("Parameter 1 (raw byte)",t.param_1,r=>this.updateSelection({param_1:r}))}
            `:t.type===1?o`
                ${this.byteNumberField("Count",t.param_2,r=>this.updateSelection({param_2:r}))}
                ${this.byteNumberField("Parameter 1 (raw byte)",t.param_1,r=>this.updateSelection({param_1:r}))}
              `:t.type===2?o`
                  ${this.byteNumberField("Minimum",t.param_2,r=>this.updateSelection({param_2:r}))}
                  ${this.byteNumberField("Maximum",t.param_1,r=>this.updateSelection({param_1:r}))}
                `:t.type===3?o`
                  ${this.byteNumberField("Lit length",t.param_1,r=>this.updateSelection({param_1:r}))}
                  ${this.byteNumberField("Gap",t.param_2,r=>this.updateSelection({param_2:r}))}
                `:o`
                    ${this.byteNumberField("Parameter 1 (raw byte)",t.param_1,r=>this.updateSelection({param_1:r}))}
                    ${this.byteNumberField("Parameter 2 (raw byte)",t.param_2,r=>this.updateSelection({param_2:r}))}
                  `}
      </div>
    `}renderPalette(e){return o`
      <section class="card">
        <h3 class="section-title">Colours</h3>
        <govee-palette-editor
          .palette=${e.palette}
          .minColours=${1}
          .maxColours=${hi}
          .disabled=${this.disabled}
          @palette-changed=${t=>this.updateLayer({palette:t.detail.palette.map(i=>[...i])})}
        ></govee-palette-editor>
        ${e.palette.length>hi?o`
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
      `;const t=ve(this.activePatternIndex,0,e.brightness_patterns.length-1),i=e.brightness_patterns[t],r=Zs(i.order);return o`
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
              ${Ki.map(n=>o`<option value=${n}>
                    ${Xs[n]}
                  </option>`)}
              ${r?d:o`
                    <option value=${i.order} .selected=${!0}>
                      Raw order ${i.order} (0x${Ve(i.order)})
                    </option>
                  `}
            </select>
          </label>
          ${r?d:o`
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
    `}renderMovement(e,t,i){const r=e[t];return o`
      <section class="card">
        <div class="card-heading">
          <h3 class="section-title">${i}</h3>
          <govee-switch-control
            .label=${`${i} enabled`}
            .checked=${r.enabled}
            .disabled=${this.disabled}
            @checked-changed=${n=>this.updateMovement(t,{enabled:n.detail.checked},`${i} ${n.detail.checked?"enabled":"disabled"}.`)}
          ></govee-switch-control>
        </div>
        ${r.enabled?o`
              ${this.byteNumberField("Distance",r.distance,n=>this.updateMovement(t,{distance:n},`${i} distance ${n}.`))}
              <label class="field">
                <span>Direction</span>
                <select
                  .value=${String(r.direction)}
                  ?disabled=${this.disabled}
                  @change=${n=>{const a=Number(n.target.value);this.updateMovement(t,{direction:a},`${i} direction ${fi[a]}.`)}}
                >
                  ${Object.entries(fi).map(([n,a])=>o`<option value=${n}>${a}</option>`)}
                </select>
              </label>
              ${this.rangeField("Speed",r.speed,0,255,n=>this.updateMovement(t,{speed:n},`${i} speed ${Qs(n)} per cent.`))}
              <govee-checkbox-control
                class="movement-enter-exit"
                label="Enter and exit"
                .checked=${r.enter_exit}
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
    `}rangeField(e,t,i,r,n){return o`
      <govee-slider-control
        .label=${e}
        .value=${t}
        .minimum=${i}
        .maximum=${r}
        .disabled=${this.disabled}
        @value-changed=${a=>n(a.detail.value)}
      ></govee-slider-control>
    `}byteNumberField(e,t,i){return this.numberField(e,t,0,255,i)}numberField(e,t,i,r,n){return o`
      <label class="field">
        <span>${e}</span>
        <input
          type="number"
          min=${i}
          max=${r}
          .value=${String(t)}
          ?disabled=${this.disabled}
          @change=${a=>n(ve(Number(a.target.value),i,r))}
        />
      </label>
    `}hexByteField(e,t,i,r=255){return o`
      <label class="field">
        <span>${e}</span>
        <input
          type="text"
          inputmode="text"
          spellcheck="false"
          .value=${Ve(t)}
          ?disabled=${this.disabled}
          @change=${n=>{const a=n.target,l=er(a.value);if(l===void 0){a.setCustomValidity("Enter one byte from 00 to FF."),a.reportValidity();return}if((l&~r)!==0){a.setCustomValidity(`Known flag bits are controlled elsewhere. Allowed mask: ${Ve(r)}.`),a.reportValidity();return}a.setCustomValidity(""),i(l)}}
        />
      </label>
    `}updateLayer(e){if(!this.content||this.disabled)return;const t=this.content.layers.map((i,r)=>r===this.activeLayerIndex?W({...i,...e}):W(i));this.emitContent({kind:"advanced",layers:t})}updateSelection(e){this.updateLayer({selection:{...this.activeLayer.selection,...e}})}updateBrightnessPattern(e){const t=this.activeLayer.brightness_patterns.map((i,r)=>r===this.activePatternIndex?{...i,...e}:{...i});this.updateLayer({brightness_patterns:t})}updateMovement(e,t,i){this.updateLayer({[e]:{...this.activeLayer[e],...t}}),i&&(this.movementAnnouncement=i)}addLayer(){if(!this.content||this.disabled||this.content.layers.length>=me)return;const e=[...this.content.layers.map(W),ji()];this.installContent({kind:"advanced",layers:e}),this.activeLayerIndex=e.length-1,this.activePatternIndex=0,this.layerActionsOpen=!1,this.focusActiveTab()}copyLayer(){if(!this.content||this.disabled||this.content.layers.length>=me)return;const e=this.content.layers.map(W);e.splice(this.activeLayerIndex+1,0,W(this.activeLayer)),this.installContent({kind:"advanced",layers:e}),this.activeLayerIndex+=1,this.activePatternIndex=0,this.layerActionsOpen=!1,this.focusActiveTab()}deleteLayer(){if(!this.content||this.disabled||this.content.layers.length===1)return;const e=this.content.layers.filter((t,i)=>i!==this.activeLayerIndex).map(W);this.activeLayerIndex=Math.min(this.activeLayerIndex,e.length-1),this.activePatternIndex=0,this.layerActionsOpen=!1,this.emitContent({kind:"advanced",layers:e}),this.focusActiveTab()}reorderLayer(e,t){if(!this.content||this.disabled||e<0||e>=this.content.layers.length||t<0||t>=this.content.layers.length||e===t)return;const i=this.content.layers.map(W),[r]=i.splice(e,1);i.splice(t,0,r),this.activeLayerIndex=Et(this.activeLayerIndex,e,t),this.layerActionsOpen=!1,this.emitContent({kind:"advanced",layers:i})}addBrightnessPattern(){if(this.disabled||this.activeLayer.brightness_patterns.length>=3)return;const e=[...this.activeLayer.brightness_patterns.map(t=>({...t})),Gi()];this.activePatternIndex=e.length-1,this.updateLayer({brightness_patterns:e})}deleteBrightnessPattern(){if(this.disabled||this.activeLayer.brightness_patterns.length===1)return;const e=this.activeLayer.brightness_patterns.filter((t,i)=>i!==this.activePatternIndex).map(t=>({...t}));this.activePatternIndex=Math.min(this.activePatternIndex,e.length-1),this.updateLayer({brightness_patterns:e})}selectLayer(e){this.layerActionsOpen=!1,e!==this.activeLayerIndex&&(this.activeLayerIndex=e,this.activePatternIndex=0)}toggleLayerActions(){this.layerActionsOpen=!this.layerActionsOpen,this.layerActionsOpen&&this.updateComplete.then(()=>{this.shadowRoot?.querySelector(".layer-actions-popover button:not(:disabled)")?.focus()})}layerActionsKeyPressed(e){e.key==="Escape"&&(e.preventDefault(),this.layerActionsOpen=!1,this.updateComplete.then(()=>{this.shadowRoot?.querySelector(".layer-actions-button")?.focus()}))}layerActionsFocusOut(e){const t=e.currentTarget;this.layerActionsOpen&&!(e.relatedTarget instanceof Node&&t.contains(e.relatedTarget))&&(this.layerActionsOpen=!1)}patternTabKeyPressed(e,t){const i=this.activeLayer.brightness_patterns.length;let r;t.key==="ArrowLeft"?r=e===0?i-1:e-1:t.key==="ArrowRight"?r=e===i-1?0:e+1:t.key==="Home"?r=0:t.key==="End"&&(r=i-1),r!==void 0&&(t.preventDefault(),this.activePatternIndex=r,this.updateComplete.then(()=>{this.shadowRoot?.querySelectorAll(".pattern-tabs button")[r]?.focus()}))}focusActiveTab(){this.updateComplete.then(()=>{this.shadowRoot?.querySelector("govee-reorderable-strip")?.focusItem(this.activeLayerIndex)})}excessChanged(e){const t=e.value.replace(/\s+/g,"").toLowerCase();if(!/^(?:[0-9a-f]{2})*$/.test(t)){e.setCustomValidity("Enter an even number of hexadecimal digits."),e.reportValidity();return}e.setCustomValidity(""),this.updateLayer({excess:t})}emitContent(e){this.dispatchEvent(new CustomEvent("content-changed",{detail:{content:e},bubbles:!0,composed:!0}))}installContent(e){this.content=e,this.emitContent(e)}static{this.styles=[M,ce,Vt,K,Kt,k`
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

  `]}}pe([p({attribute:!1})],ee.prototype,"content");pe([p({type:Boolean})],ee.prototype,"disabled");pe([p({type:Number})],ee.prototype,"segmentCount");pe([m()],ee.prototype,"activeLayerIndex");pe([m()],ee.prototype,"activePatternIndex");pe([m()],ee.prototype,"movementAnnouncement");pe([m()],ee.prototype,"layerActionsOpen");function pt(){return{kind:"advanced",layers:[ji()]}}function $e(s){return{kind:"advanced",layers:s.layers.map(W)}}function oe(s){return{...s,template:{...s.template},effect:{layers:$e({layers:s.effect.layers}).layers}}}function ji(){return{area:{start_tenths:0,width_tenths:10},selection:{type:0,param_1:0,param_2:1},brightness_gradient:!1,brightness_patterns:[Gi()],distribution:{method:1,backwards:!1},colour_speed:128,colour_retention:20,palette:[[255,0,0],[0,0,255]],selected_movement:gi(),overall_movement:gi(),priority:0,unknown_flags:0,excess:""}}function Gi(){return{scope_high:255,scope_low:0,order:0,change_speed:128,brightest_retention:20,darkest_retention:20}}function gi(){return{enabled:!1,enter_exit:!1,direction:0,distance:1,speed:128,unknown_flags:0}}function W(s){return{...s,area:{...s.area},selection:{...s.selection},brightness_patterns:s.brightness_patterns.map(e=>({...e})),distribution:{...s.distribution},palette:s.palette.map(e=>[...e]),selected_movement:{...s.selected_movement},overall_movement:{...s.overall_movement}}}function Js(s){return Vi.includes(s)}function Zs(s){return Ki.includes(s)}function Qs(s){return Math.round(ve(s,0,255)/255*100)}function Ve(s){return s.toString(16).padStart(2,"0").toUpperCase()}function er(s){const e=s.trim().replace(/^0x/i,"");if(/^[0-9a-f]{1,2}$/i.test(e))return Number.parseInt(e,16)}function tr(s,e,t,i){const r=s*10/e;return(s+1)*10/e>t&&r<i}function ve(s,e,t){return Math.min(t,Math.max(e,Math.round(s)))}customElements.get("govee-advanced-effect-editor")||customElements.define("govee-advanced-effect-editor",ee);const ir=2,zi=1,sr=3,rr=["compiling","pending","uploading","activating","verifying","confirmed","applied","uncertain","recovering","failed","interrupted","unknown"],ht=["compiling","pending","uploading","activating","verifying","recovering"],bi=5,T=128,Se=65536,Yi=512,Wi=256,Xi=32,Ji=128,Zi=512,$=255,nr=64,Qi=262144,vi=16,ar=4096,es=16384,O=1024,mt=16384,zt=Number.MAX_SAFE_INTEGER,St=4335,or=232,lr=253,le=["H617A","H6199"],ft="H617A",ts=["movie","game"],yi=["native_scenes","edited_palette_scenes","layered_scenes","painted","single","multi","native_music","video","palette_diy","advanced","workshop","special_diy"],dr=["studio","home_assistant","planned"],cr=["exact_session","activation_match","settings_match","mode_match","write_completed","unknown"],ur={H617A:["native_scenes","edited_palette_scenes","layered_scenes","painted","single","multi","native_music","advanced","workshop","special_diy"],H6199:["native_scenes","edited_palette_scenes","layered_scenes","palette_diy","native_music","video","advanced","workshop","special_diy"]};function pr(s){const e=f(s,"editor info"),t=f(e.limits,"editor limits");return{api_version:u(e.api_version,"API version",1),effect_schema_version:u(e.effect_schema_version,"effect schema version",1),compiler_version:u(e.compiler_version,"compiler version",1),limits:{effect_name:V(t.effect_name,T,"effect-name limit"),effect_document_bytes:V(t.effect_document_bytes,Se,"effect-document limit"),devices:V(t.devices,Yi,"device limit"),library_items:V(t.library_items,Wi,"library-item limit"),drafts_per_owner:V(t.drafts_per_owner,Xi,"draft limit"),deployment_records:V(t.deployment_records,Ji,"deployment limit"),scene_catalogue_entries:V(t.scene_catalogue_entries,Zi,"scene catalogue limit")}}}function hr(s){const e=E(s,"devices",Yi).map((t,i)=>{const r=f(t,`devices[${i}]`),n=f(r.custom_effects,`devices[${i}].custom_effects`),a=f(r.profiles,`devices[${i}].profiles`);return{config_entry_id:g(r.config_entry_id,`devices[${i}].config_entry_id`,$),model:g(r.model,`devices[${i}].model`,$),display_name:g(r.display_name,`devices[${i}].display_name`,$),segment_count:u(r.segment_count,`devices[${i}].segment_count`,0,65535),custom_effects:{painted:S(n.painted,"painted capability"),single:S(n.single,"single capability"),multi:S(n.multi,"multi capability"),palette_diy:S(n.palette_diy,"palette DIY capability"),advanced:S(n.advanced,"advanced capability"),workshop:S(n.workshop,"Workshop capability"),special_diy:S(n.special_diy,"Special DIY capability")},profiles:{music:S(a.music,"music profile capability"),video:S(a.video,"video profile capability")},readback:g(r.readback,`devices[${i}].readback`,$)}});return F(e,t=>t.config_entry_id,"device IDs"),e}function mr(s){he(s,"custom-effect catalogue",Qi,es);const e=f(s,"custom-effect catalogue"),t=fr(e.models),i=It(e,"custom-effect catalogue",ft);if(JSON.stringify(i)!==JSON.stringify(t[ft]))throw new Error("Malformed Effect Studio server payload: legacy custom-effect catalogue view does not match models.H617A.");return V(e.schema_version,bi,"catalogue schema"),{...i,schema_version:bi,sku:ft,models:t}}function fr(s){const e=f(s,"custom-effect catalogue models"),i=Object.keys(e).filter(r=>!le.includes(r));if(i.length>0)throw new Error(`Malformed Effect Studio server payload: unexpected catalogue models ${i.join(", ")}.`);for(const r of le)if(!(r in e))throw new Error(`Malformed Effect Studio server payload: missing catalogue model ${r}.`);return{H617A:It(e.H617A,"catalogue model H617A","H617A"),H6199:It(e.H6199,"catalogue model H6199","H6199")}}function It(s,e,t){const i=f(s,e),r=f(i.limits,`${e} limits`),n=f(i.supports,`${e} support capabilities`),a=f(i.apply,`${e} Apply capabilities`),l=P(i.sku,le,`${e} SKU`);if(l!==t)throw new Error(`Malformed Effect Studio server payload: ${e} is keyed as ${t} but declares ${l}.`);const c=u(r.music_sensitivity_min,`${e} minimum music sensitivity`,0,100),h=u(r.music_sensitivity_max,`${e} maximum music sensitivity`,0,100);return c>h&&v(`${e} music sensitivity limits are inverted`),{sku:l,painted_effects:br(i.painted_effects,`${e} painted-effect templates`),effects:vr(i.effects,`${e} custom-effect templates`),music_modes:_i(i.music_modes,`${e} music modes`),video_modes:_i(i.video_modes,`${e} video modes`,ts),workshop_templates:yr(i.workshop_templates,`${e} Workshop templates`,t),special_diy_templates:_r(i.special_diy_templates,`${e} Special DIY templates`,t),workflows:gr(i.workflows,`${e} release workflows`,t),supports:{multi:S(n.multi,`${e} Multi support`),advanced:S(n.advanced,`${e} advanced support`),workshop:S(n.workshop,`${e} Workshop support`),special_diy:S(n.special_diy,`${e} Special DIY support`)},limits:{palette_min:u(r.palette_min,`${e} minimum palette`,1,255),palette_max:u(r.palette_max,`${e} maximum palette`,1,255),multi_max:u(r.multi_max,`${e} maximum Multi effects`,1,255),music_sensitivity_min:c,music_sensitivity_max:h},apply:{painted:S(a.painted,`${e} Painted Apply capability`),single:S(a.single,`${e} Single Apply capability`),multi:S(a.multi,`${e} Multi Apply capability`),palette_diy:S(a.palette_diy,`${e} palette DIY Apply capability`),workshop:S(a.workshop,`${e} Workshop Apply capability`),special_diy:S(a.special_diy,`${e} Special DIY Apply capability`)}}}function gr(s,e,t){const i=E(s,e,yi.length).map((c,h)=>{const b=f(c,`${e}[${h}]`);return{id:P(b.id,yi,`${e}[${h}] ID`),label:g(b.label,`${e}[${h}] label`,T),content_kind:g(b.content_kind,`${e}[${h}] content kind`,$),application:P(b.application,dr,`${e}[${h}] application`)}});F(i,c=>c.id,`${e} IDs`);const r=ur[t],n=new Set(i.map(c=>c.id)),a=r.filter(c=>!n.has(c)),l=i.map(c=>c.id).filter(c=>!r.includes(c));if(a.length>0||l.length>0)throw new Error(`Malformed Effect Studio server payload: ${e} does not match ${t}.`);return i}function br(s,e){const t=E(s,e,O).map((i,r)=>{const n=f(i,`${e}[${r}]`);return{id:P(n.id,["cycle","clockwise","counter_clockwise","twinkle","gradient","breathe"],`${e} ID`),label:g(n.label,`${e} label`,T)}});return F(t,i=>i.id,`${e} IDs`),t}function vr(s,e){const t=E(s,e,O).map((i,r)=>{const n=f(i,`${e}[${r}]`),a=E(n.variations,`${e}[${r}].variations`,O);if(a.length===0)throw new Error("Malformed Effect Studio server payload: custom-effect template has no variations.");const l={id:g(n.id,`${e}[${r}] ID`,$),label:g(n.label,`${e}[${r}] label`,T),family:u(n.family,`${e}[${r}] family`,0,255),variations:a.map((c,h)=>{const b=f(c,`${e}[${r}].variations[${h}]`);return{id:g(b.id,`${e}[${r}].variations[${h}] ID`,$),label:g(b.label,`${e}[${r}].variations[${h}] label`,T),variant:u(b.variant,`${e}[${r}].variations[${h}] variant`,0,255)}}),supports_multi:B(n.supports_multi,`${e}[${r}] Multi support`),rate:P(n.rate,["speed","sensitivity"],`${e}[${r}] rate parameter`),category:P(n.category,["single_layer"],`${e}[${r}] category`)};return F(l.variations,c=>c.id,`${e}[${r}] variation IDs`),l});return F(t,i=>i.id,`${e} IDs`),t}function _i(s,e,t){const i=E(s,e,O).map((r,n)=>{const a=f(r,`${e}[${n}]`);return{id:t?P(a.id,t,`${e}[${n}] ID`):g(a.id,`${e}[${n}] ID`,$),label:g(a.label,`${e}[${n}] label`,T)}});return F(i,r=>r.id,`${e} IDs`),i}function yr(s,e,t){const i=E(s,e,O).map((r,n)=>{const a=f(r,`${e}[${n}]`),l=at(a.content);return(l.kind!=="workshop"||l.model!==t)&&v(`${e}[${n}] content does not target ${t}`),{id:g(a.id,`${e}[${n}] ID`,$),label:g(a.label,`${e}[${n}] label`,T),source_fixture:g(a.source_fixture,`${e}[${n}] source fixture`,$),content:l}});return F(i,r=>r.id,`${e} IDs`),i}function _r(s,e,t){const i=E(s,e,O).map((r,n)=>{const a=f(r,`${e}[${n}]`),l=at(a.content);return(l.kind!=="special_diy"||l.model!==t)&&v(`${e}[${n}] content does not target ${t}`),{id:g(a.id,`${e}[${n}] ID`,$),label:g(a.label,`${e}[${n}] label`,T),source_fixture:g(a.source_fixture,`${e}[${n}] source fixture`,$),content:l}});return F(i,r=>r.id,`${e} IDs`),i}function $i(s){const e=f(s,"library snapshot"),t={library_revision:Z(e.library_revision,"library revision",0),items:E(e.items,"library items",Wi).map((i,r)=>{const n=f(i,`library items[${r}]`),a=n.template===void 0?void 0:et(n.template,`library items[${r}].template`),l=n.model===void 0?void 0:Dr(n.model);return{id:g(n.id,"library item ID",$),revision:Z(n.revision,"library item revision",1),name:g(n.name,"library item name",T),kind:g(n.kind,"library item kind",$),...l?{model:l}:{},...a?{template:a}:{}}})};return F(t.items,i=>i.id,"library item IDs"),t}function ze(s){he(s,"library item",Se);const e=f(s,"library item"),t=e.target_hint===void 0?void 0:f(e.target_hint,"target hint");return{schema_version:V(e.schema_version,zi,"effect schema version"),id:g(e.id,"effect ID",$),revision:Z(e.revision,"effect revision",1),name:g(e.name,"effect name",T),content:at(e.content),provenance:Pt(e.provenance,"effect provenance"),extensions:Pt(e.extensions,"effect extensions"),...t?{target_hint:{model:t.model===null?null:g(t.model,"target model",$),segment_count:t.segment_count===null?null:u(t.segment_count,"target segment count",1,65535)}}:{}}}function $r(s){const e=E(s,"draft summaries",Xi).map((t,i)=>{const r=f(t,`draft summaries[${i}]`);return{id:g(r.id,"draft ID",$),revision:Z(r.revision,"draft revision",1),name:g(r.name,"draft name",T),updated_at:Wt(r.updated_at,"draft timestamp"),selected_config_entry_id:xe(r.selected_config_entry_id,"draft config entry ID")}});return F(e,t=>t.id,"draft IDs"),e}function gt(s){const e=f(s,"effect draft");return{id:g(e.id,"draft ID",$),owner_id:g(e.owner_id,"draft owner",$),revision:Z(e.revision,"draft revision",1),item:ze(e.item),updated_at:Wt(e.updated_at,"draft timestamp"),selected_config_entry_id:xe(e.selected_config_entry_id,"draft config entry ID"),base_item_id:xe(e.base_item_id,"draft base item ID"),base_item_revision:e.base_item_revision===null?null:Z(e.base_item_revision,"draft base item revision",1)}}function At(s){const e=f(s,"deployment"),t=P(e.phase,rr,"deployment phase"),i={operation_id:g(e.operation_id,"deployment operation ID",$),config_entry_id:g(e.config_entry_id,"deployment config entry ID",$),diy_code:e.diy_code===null?null:u(e.diy_code,"deployment DIY code",0,65535),content_kind:g(e.content_kind,"deployment content kind",$),target_mode:P(e.target_mode,["custom","scene","music","video"],"deployment target mode"),target_effect:xe(e.target_effect,"deployment target effect"),phase:t,updated_at:Wt(e.updated_at,"deployment timestamp"),item_id:xe(e.item_id,"deployment item ID"),item_revision:e.item_revision===null?null:Z(e.item_revision,"deployment item revision",1),error_code:xe(e.error_code,"deployment error code"),progress_current:u(e.progress_current,"deployment progress",0,1024),progress_total:u(e.progress_total,"deployment progress total",0,1024),verification_confidence:P(e.verification_confidence,cr,"deployment verification confidence")};return i.progress_current>i.progress_total&&v("deployment progress exceeds its total"),i}function xr(s){const e=f(s,"deployment snapshot"),t={revision:Z(e.revision,"deployment revision",0),deployments:E(e.deployments,"deployments",Ji).map(At)};return F(t.deployments,i=>i.operation_id,"deployment operation IDs"),t}function kr(s){he(s,"scene catalogue",Qi,es);const e=f(s,"scene catalogue");return{schema_version:u(e.schema_version,"scene catalogue schema",1),sku:g(e.sku,"scene catalogue SKU",$),enabled:B(e.enabled,"scene catalogue enabled"),categories:E(e.categories,"scene categories",O).map((t,i)=>{const r=f(t,`scene categories[${i}]`);return{id:u(r.id,"scene category ID",0,65535),name:g(r.name,"scene category name",T)}}),scenes:E(e.scenes,"scenes",Zi).map(Yt)}}function wr(s){const e=f(s,"scene detail");he({scene:e.scene,content:e.content},"scene detail",Se);const t=at(e.content);return t.kind!=="scene_builtin"&&t.kind!=="scene_palette"&&t.kind!=="scene_layered"&&v("scene detail content is unsupported"),{scene:Yt(e.scene),content:t}}function at(s){he(s,"effect content",Se);const e=f(s,"effect content"),t=g(e.kind,"effect content kind",$);switch(t){case"h617a_painted":return{kind:t,effect:P(e.effect,["cycle","clockwise","counter_clockwise","twinkle","gradient","breathe"],"painted effect"),speed:u(e.speed,"painted speed",0,100),brightness:u(e.brightness,"painted brightness",0,100),background:Ee(e.background,"painted background"),groups:E(e.groups,"paint groups",15).map((i,r)=>{const n=f(i,`paint groups[${r}]`);return{fill:Ee(n.fill,"paint-group fill"),segments:E(n.segments,"painted segments",15).map(a=>u(a,"painted segment",0,14))}})};case"h617a_single":return{kind:t,family:u(e.family,"Single family",0,254),variant:u(e.variant,"Single variant",0,255),speed:u(e.speed,"Single speed",0,100),palette:_e(e.palette,"Single palette",8)};case"h617a_multi":return{kind:t,effects:E(e.effects,"Multi effects",4).map((i,r)=>{const n=f(i,`Multi effects[${r}]`);return{family:u(n.family,"Multi family",0,254),variant:u(n.variant,"Multi variant",0,255)}}),speed:u(e.speed,"Multi speed",0,100),palette:_e(e.palette,"Multi palette",8)};case"palette_diy":return{kind:t,model:P(e.model,le,"palette DIY model"),family:u(e.family,"palette DIY family",0,255),variant:u(e.variant,"palette DIY variant",0,255),speed:u(e.speed,"palette DIY speed",0,100),palette:_e(e.palette,"palette DIY palette",8)};case"music_profile":return{kind:t,model:P(e.model,le,"music profile model"),mode:g(e.mode,"music profile mode",$),sensitivity:u(e.sensitivity,"music profile sensitivity",0,100),colour:Sr(e.colour,"music profile colour"),calm:Ir(e.calm,"music profile calm"),parameters:Pt(e.parameters,"music profile parameters")};case"video_profile":return{kind:t,model:P(e.model,["H6199"],"video profile model"),mode:P(e.mode,ts,"video profile mode"),full_screen:B(e.full_screen,"video profile full-screen flag"),saturation:u(e.saturation,"video profile saturation",0,100),sound_effects:B(e.sound_effects,"video profile sound-effects flag"),sound_effects_softness:u(e.sound_effects_softness,"video profile sound-effects softness",1,100),white_balance_position:u(e.white_balance_position,"video profile white-balance position",1,20),relative_brightness:Ar(e.relative_brightness,"video profile relative brightness"),blank_screen:B(e.blank_screen,"video profile blank-screen flag")};case"advanced":return{kind:t,layers:bt(e.layers,"Advanced layers")};case"workshop":{const i=f(e.effect,"Workshop effect");return{kind:t,model:P(e.model,le,"Workshop model"),template:g(e.template,"Workshop template",$),effect:{layers:bt(i.layers,"Workshop layers")},raw_param:Ye(e.raw_param,"Workshop source parameter"),trailing_padding:u(e.trailing_padding,"Workshop trailing padding",0,St)}}case"special_diy":return{kind:t,model:P(e.model,["H6199"],"Special DIY model"),template:g(e.template,"Special DIY template",$),family:u(e.family,"Special DIY family",0,255),variant:u(e.variant,"Special DIY variant",0,255),speed:u(e.speed,"Special DIY speed",0,100),palette:_e(e.palette,"Special DIY palette",8),raw_payload:Ye(e.raw_payload,"Special DIY source payload"),trailing_padding:u(e.trailing_padding,"Special DIY trailing padding",0,St)};case"scene_builtin":return{kind:t,template:et(e.template,"scene template"),speed_index:Dt(e.speed_index,"scene speed index",0,255)};case"scene_palette":return Er(e);case"scene_layered":{const i=f(e.effect,"layered scene effect"),r=is(e.trailing_padding,"layered scene trailing padding");return{kind:t,template:et(e.template,"layered scene template"),effect:{layers:bt(i.layers,"layered scene layers")},speed_index:Dt(e.speed_index,"layered scene speed index",0,255),raw_param:Ye(e.raw_param,"layered scene raw parameter"),...r===void 0?{}:{trailing_padding:r}}}default:{const{kind:i,...r}=e;return{kind:"opaque",source_kind:t,body:r}}}}function is(s,e){if(s!==void 0)return u(s,e,0,St)}function Er(s){const t=u(s.layout,"palette scene layout",0,1)===0?0:1,i=E(s.steps,"palette scene steps",255).map((l,c)=>{const h=f(l,`palette scene steps[${c}]`),b=t===0?(h.inline_colour!==null&&v(`palette scene steps[${c}].inline_colour must be null for layout 0`),null):Ee(h.inline_colour,`palette scene steps[${c}].inline_colour`);return{value:u(h.value,`palette scene steps[${c}].value`,0,65535),colour:Ee(h.colour,`palette scene steps[${c}].colour`),inline_colour:b}}),r=_e(s.palette,"palette scene shared palette",255,!0);t===1&&r.length!==0&&v("palette scene layout 1 must not have a shared palette");let n;s.config_flags!==void 0&&(n=u(s.config_flags,"palette scene config flags",0,255),n&-9&&v("palette scene config flags must only set reserved config bits"));const a=is(s.trailing_padding,"palette scene trailing padding");return{kind:"scene_palette",template:et(s.template,"palette scene template"),layout:t,brightness_flag:B(s.brightness_flag,"palette scene brightness flag"),steps:i,palette:r,speed_index:Dt(s.speed_index,"palette scene speed index",0,255),...n===void 0?{}:{config_flags:n},...a===void 0?{}:{trailing_padding:a}}}function Ae(s){return s.kind!=="opaque"?s:(he(s.body,"opaque content",Se),{...s.body,kind:g(s.source_kind,"opaque source kind",$)})}function Yt(s){const e=f(s,"scene"),t=Fe(e.parameter_kind,"scene parameter kind");t!=="none"&&t!=="palette"&&t!=="layers"&&t!=="opaque"&&v("scene parameter kind is invalid");const i=e.speed===null?null:(()=>{const r=f(e.speed,"scene speed");return{option_count:u(r.option_count,"scene speed option count",1,256),default_index:u(r.default_index,"scene default speed",0,255)}})();return{scene_id:u(e.scene_id,"scene ID",0,65535),effect_id:u(e.effect_id,"scene effect ID",0,65535),category_id:u(e.category_id,"scene category ID",0,65535),category:g(e.category,"scene category",T),name:g(e.name,"scene name",T),variant:Pr(e.variant,"scene variant",$),display_name:g(e.display_name,"scene display name",T),scene_type:u(e.scene_type,"scene type",0,255),parameter_kind:t,speed:i}}function bt(s,e){return E(s,e,255).map((t,i)=>Cr(t,`${e}[${i}]`))}function Cr(s,e){const t=f(s,e),i=f(t.area,`${e}.area`),r=f(t.selection,`${e}.selection`),n=f(t.distribution,`${e}.distribution`);return{area:{start_tenths:u(i.start_tenths,`${e}.area.start_tenths`,0,15),width_tenths:u(i.width_tenths,`${e}.area.width_tenths`,0,15)},selection:{type:L(r.type,`${e}.selection.type`),param_1:L(r.param_1,`${e}.selection.param_1`),param_2:L(r.param_2,`${e}.selection.param_2`)},brightness_gradient:B(t.brightness_gradient,`${e}.brightness_gradient`),brightness_patterns:E(t.brightness_patterns,`${e}.brightness_patterns`,255).map((a,l)=>{const c=f(a,`${e}.brightness_patterns[${l}]`);return{scope_high:L(c.scope_high,"brightness scope high"),scope_low:L(c.scope_low,"brightness scope low"),order:L(c.order,"brightness order"),change_speed:L(c.change_speed,"brightness change speed"),brightest_retention:L(c.brightest_retention,"brightest retention"),darkest_retention:L(c.darkest_retention,"darkest retention")}}),distribution:{method:u(n.method,`${e}.distribution.method`,0,127),backwards:B(n.backwards,`${e}.distribution.backwards`)},colour_speed:L(t.colour_speed,`${e}.colour_speed`),colour_retention:L(t.colour_retention,`${e}.colour_retention`),palette:_e(t.palette,`${e}.palette`,255,!0),selected_movement:xi(t.selected_movement,`${e}.selected_movement`),overall_movement:xi(t.overall_movement,`${e}.overall_movement`),priority:L(t.priority,`${e}.priority`),unknown_flags:ss(t.unknown_flags,lr,`${e}.unknown_flags`),excess:Ye(t.excess,`${e}.excess`)}}function xi(s,e){const t=f(s,e);return{enabled:B(t.enabled,`${e}.enabled`),enter_exit:B(t.enter_exit,`${e}.enter_exit`),direction:u(t.direction,`${e}.direction`,0,3),distance:L(t.distance,`${e}.distance`),speed:L(t.speed,`${e}.speed`),unknown_flags:ss(t.unknown_flags,or,`${e}.unknown_flags`)}}function et(s,e){const t=f(s,e);return{sku:g(t.sku,`${e}.sku`,$),scene_id:u(t.scene_id,`${e}.scene_id`,0,65535),effect_id:u(t.effect_id,`${e}.effect_id`,0,65535),catalogue_schema_version:u(t.catalogue_schema_version,`${e}.catalogue_schema_version`,1,zt)}}function _e(s,e,t,i=!1){const r=E(s,e,t);return!i&&r.length===0&&v(`${e} must not be empty`),r.map((n,a)=>Ee(n,`${e}[${a}]`))}function Ee(s,e){const t=E(s,e,3);return t.length!==3&&v(`${e} must contain three channels`),t.map(i=>u(i,`${e} channel`,0,255))}function Sr(s,e){return s===null?null:Ee(s,e)}function Ir(s,e){return s===null?null:B(s,e)}function Ar(s,e){const t=f(s,e);return{left:u(t.left,`${e}.left`,1,100),top:u(t.top,`${e}.top`,1,100),right:u(t.right,`${e}.right`,1,100),bottom:u(t.bottom,`${e}.bottom`,1,100)}}function S(s,e){return s!=="supported"&&s!=="unsupported"&&s!=="evidence_gap"&&v(`${e} is invalid`),s}function Pt(s,e){return he(s,e,Se),f(s,e)}function xe(s,e){return s===null?null:g(s,e,$)}function Wt(s,e){const t=g(s,e,nr);return(!/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(t)||Number.isNaN(Date.parse(t)))&&v(`${e} must be an ISO 8601 timestamp with a UTC offset`),t}function g(s,e,t){const i=Fe(s,e);return(i.length===0||i.length>t)&&v(`${e} must contain 1 to ${t} characters`),i}function Pr(s,e,t){const i=Fe(s,e);return i.length>t&&v(`${e} must not exceed ${t} characters`),i}function Ye(s,e){const t=Fe(s,e);return(t.length%2!==0||!/^[0-9a-f]*$/i.test(t))&&v(`${e} must be hexadecimal`),t}function Fe(s,e){return typeof s!="string"&&v(`${e} must be a string`),s}function Dr(s){return typeof s=="string"&&le.includes(s)?s:void 0}function B(s,e){return typeof s!="boolean"&&v(`${e} must be a boolean`),s}function u(s,e,t,i=zt){return(typeof s!="number"||!Number.isSafeInteger(s)||s<t||s>i)&&v(`${e} must be an integer from ${t} to ${i}`),s}function Z(s,e,t){return u(s,e,t,zt)}function V(s,e,t){const i=u(s,t,1);return i!==e&&v(`${t} is incompatible with this editor`),i}function Dt(s,e,t,i){return s===null?null:u(s,e,t,i)}function L(s,e){return u(s,e,0,255)}function ss(s,e,t){const i=L(s,t);return i&~e&&v(`${t} must only set reserved bits, not bits explicit fields carry`),i}function P(s,e,t){const i=Fe(s,t);return e.includes(i)||v(`${t} is invalid`),i}function f(s,e){return(typeof s!="object"||s===null||Array.isArray(s))&&v(`${e} must be an object`),s}function E(s,e,t){return Array.isArray(s)||v(`${e} must be an array`),s.length>t&&v(`${e} must not exceed ${t} items`),s}function F(s,e,t){const i=s.map(e);new Set(i).size!==i.length&&v(`${t} must be unique`)}function he(s,e,t,i=ar){let r=0;const n=(l,c,h)=>{if(r+=1,r>i&&v(`${e} must not exceed ${i} JSON values`),h>vi&&v(`${e} must not exceed ${vi} nested levels`),!(l===null||typeof l=="boolean")){if(typeof l=="number"){(!Number.isFinite(l)||Number.isInteger(l)&&!Number.isSafeInteger(l))&&v(`${c} must be a finite JSON number`);return}if(typeof l=="string"){l.length>mt&&v(`${c} must not exceed ${mt} characters`);return}if(Array.isArray(l)){l.length>O&&v(`${c} must not exceed ${O} items`),l.forEach((b,_)=>n(b,`${c}[${_}]`,h+1));return}if(typeof l=="object"&&l!==null){const b=Object.entries(l);b.length>O&&v(`${c} must not exceed ${O} fields`),b.forEach(([_,R])=>{_.length>mt&&v(`${c} contains an oversized key`),n(R,`${c}.${_}`,h+1)});return}v(`${c} contains a non-JSON value`)}};n(s,e,0);const a=JSON.stringify(s);a===void 0&&v(`${e} must contain JSON values`),new TextEncoder().encode(a).byteLength>t&&v(`${e} must not exceed ${t} bytes`)}function v(s){throw new Error(`Malformed Effect Studio server payload: ${s}.`)}function Lr(s){return s.api_version===ir&&s.effect_schema_version===zi&&s.compiler_version===sr}const vt="ha_govee_led_ble/editor";class Tr{constructor(e){this.hass=e}async info(){return pr(await this.call("info"))}async devices(){const e=await this.call("devices");return hr(D(e,"devices"))}async customCatalogue(){const e=await this.call("custom/catalogue");return mr(D(e,"catalogue"))}async library(){return $i(await this.call("library/list"))}async item(e){const t=await this.call("library/get",{item_id:e});return ze(D(t,"item"))}async createItem(e,t,i){const r=await this.call("library/create",{name:e,content:Ae(t),expected_library_revision:i});return{item:ze(D(r,"item")),library_revision:yt(r)}}async updateItem(e,t,i,r){const n=await this.call("library/update",{item_id:e.id,name:t,content:Ae(i),expected_revision:e.revision,expected_library_revision:r});return{item:ze(D(n,"item")),library_revision:yt(n)}}async deleteItem(e,t){const i=await this.call("library/delete",{item_id:e.id,expected_revision:e.revision,expected_library_revision:t});return yt(i)}async drafts(){const e=await this.call("draft/list");return $r(D(e,"drafts"))}async draft(e){const t=await this.call("draft/get",{draft_id:e});return gt(D(t,"draft"))}async createDraft(e,t,i,r){const n=await this.call("draft/create",{name:e,content:Ae(t),updated_at:new Date().toISOString(),selected_config_entry_id:i,...r?{base_item_id:r.id,base_item_revision:r.revision}:{}});return gt(D(n,"draft"))}async updateDraft(e,t,i,r){const n=await this.call("draft/update",{draft_id:e.id,expected_revision:e.revision,name:t,content:Ae(i),updated_at:new Date().toISOString(),selected_config_entry_id:r});return gt(D(n,"draft"))}async deleteDraft(e){await this.call("draft/delete",{draft_id:e.id,expected_revision:e.revision})}async applySaved(e,t){const i=await this.call("apply",{config_entry_id:e,item_id:t.id,revision:t.revision,updated_at:new Date().toISOString()});return At(D(i,"deployment"))}async applySnapshot(e,t,i){const r=await this.call("apply_snapshot",{config_entry_id:e,name:t,content:Ae(i),updated_at:new Date().toISOString()});return At(D(r,"deployment"))}async sceneCatalogue(e){const t=await this.call("scene/catalogue/list",{config_entry_id:e});return kr(D(t,"catalogue"))}sceneDetail(e,t,i){return this.call("scene/catalogue/get",{config_entry_id:e,scene_id:t,effect_id:i}).then(wr)}async applyScene(e,t,i){const r=await this.call("scene/apply",{config_entry_id:e,scene_id:t.scene_id,effect_id:t.effect_id,...i===null?{}:{speed_index:i}}),n=Yt(D(r,"scene")),a=D(r,"readback");if(a!=="scene_identity_only")throw new Error("Malformed Effect Studio server payload: scene Apply readback is invalid.");const l=D(r,"speed_index");if(l!==null&&(typeof l!="number"||!Number.isSafeInteger(l)||l<0||l>255))throw new Error("Malformed Effect Studio server payload: scene Apply speed is invalid.");return{scene:n,speed_index:l,readback:a}}subscribeLibrary(e,t){return this.hass.connection.subscribeMessage(i=>{try{e($i(i))}catch(r){t?.(ki(r))}},{type:`${vt}/library/subscribe`})}subscribeDeployments(e,t){return this.hass.connection.subscribeMessage(i=>{try{e(xr(i))}catch(r){t?.(ki(r))}},{type:`${vt}/deployment/subscribe`})}call(e,t={}){return this.hass.callWS({type:`${vt}/${e}`,...t})}}function D(s,e){if(typeof s!="object"||s===null||Array.isArray(s))throw new Error("Malformed Effect Studio server payload: response must be an object.");if(!(e in s))throw new Error(`Malformed Effect Studio server payload: response is missing ${e}.`);return s[e]}function yt(s){const e=D(s,"library_revision");if(typeof e!="number"||!Number.isSafeInteger(e)||e<0)throw new Error("Malformed Effect Studio server payload: library revision is invalid.");return e}function ki(s){return s instanceof Error?s:new Error("Malformed Effect Studio server payload.")}var Mr=Object.defineProperty,rs=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&Mr(e,t,r),r};const Lt=17,ns="ha_govee_led_ble/effect_studio/recent_colours",We=[[255,69,58],[255,159,10],[255,214,10],[48,209,88],[99,230,226],[100,210,255],[10,132,255],[94,92,230],[191,90,242],[255,45,85],[172,142,104],[255,255,255],[174,174,178],[99,99,102],[28,28,30],[255,127,0],[139,0,255]];let ke=Nr();const Tt=new Set;class Xt extends A{constructor(){super(...arguments),this.colour=[255,255,255],this.disabled=!1}connectedCallback(){super.connectedCallback(),Tt.add(this)}disconnectedCallback(){Tt.delete(this),super.disconnectedCallback()}render(){return o`
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
            @input=${e=>this.emit("colour-changing",pi(e.target.value))}
            @change=${e=>this.commit(pi(e.target.value))}
          />
        </label>
      </div>
    `}commit(e){Rr(e),this.emit("colour-changed",e)}emit(e,t){this.colour=[...t],this.dispatchEvent(new CustomEvent(e,{detail:{colour:[...t]},bubbles:!0,composed:!0}))}static{this.styles=[M,k`
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
  `]}}rs([p({attribute:!1})],Xt.prototype,"colour");rs([p({type:Boolean})],Xt.prototype,"disabled");function Mt(s){return[...ke[s%ke.length]]}function Nr(){const s=localStorage.getItem(ns);if(!s)return J(We);let e;try{e=JSON.parse(s)}catch(i){if(i instanceof SyntaxError)return J(We);throw i}if(!Array.isArray(e))return J(We);const t=e.filter(Or).map(i=>[...i]).slice(0,Lt);return as(t)}function Rr(s){const e=w(s);ke=as([[...s],...ke.filter(t=>w(t)!==e)]),localStorage.setItem(ns,JSON.stringify(ke));for(const t of Tt)t.requestUpdate()}function as(s){const e=J(s);for(const t of We)e.length>=Lt||e.some(i=>w(i)===w(t))||e.push([...t]);return e.slice(0,Lt)}function Or(s){return Array.isArray(s)&&s.length===3&&s.every(e=>Number.isInteger(e)&&e>=0&&e<=255)}customElements.get("govee-colour-picker")||customElements.define("govee-colour-picker",Xt);var Br=Object.defineProperty,G=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&Br(e,t,r),r};class H extends A{constructor(){super(...arguments),this.palette=[],this.minColours=1,this.maxColours=8,this.disabled=!1,this.persistentPicker=!1,this.ariaLabel="Colours",this.itemName="colour",this.windowPointerDown=e=>{this.editingIndex!==void 0&&!e.composedPath().includes(this)&&(this.editingIndex=void 0)}}connectedCallback(){super.connectedCallback(),window.addEventListener("pointerdown",this.windowPointerDown)}disconnectedCallback(){window.removeEventListener("pointerdown",this.windowPointerDown),super.disconnectedCallback()}willUpdate(e){e.has("palette")&&this.editingIndex!==void 0&&this.editingIndex>=this.palette.length&&(this.editingIndex=void 0)}render(){const e=this.persistentPicker?this.selectedIndex:this.editingIndex,t=this.palette.map((i,r)=>({key:`${r}-${w(i)}`,label:`${wi(this.itemName)} ${r+1}`,ariaLabel:this.itemAriaLabel(i,r),colour:w(i),removeReady:!this.persistentPicker&&this.editingIndex===r&&this.palette.length>this.minColours,disabled:this.disabled}));return o`
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
    `}itemAriaLabel(e,t){const i=`${wi(this.itemName)} ${t+1}`;return this.persistentPicker?`${i}, ${w(e)}${t===this.selectedIndex?", selected":""}`:this.editingIndex===t&&this.palette.length>this.minColours?`Remove colour ${t+1}`:`Edit colour ${t+1}, ${w(e)}. Drag to reorder or use arrow keys.`}renderPicker(e,t){return o`
      <govee-colour-picker
        .colour=${t}
        .disabled=${this.disabled}
        @colour-changing=${i=>this.updateColour(e,i.detail.colour)}
        @colour-changed=${i=>this.commitColour(e,i.detail.colour)}
      ></govee-colour-picker>
    `}commitColour(e,t){this.updateColour(e,t),!this.persistentPicker&&(this.editingIndex=void 0,this.focusSwatchAfterUpdate(e))}updateColour(e,t){const i=J(this.palette);i[e]=[...t],this.emitPalette(i)}addColour(){if(this.disabled||this.palette.length>=this.maxColours)return;const e=this.palette[this.palette.length-1]??Mt(this.palette.length),t=[...J(this.palette),[...e]],i=t.length-1;this.persistentPicker?this.selectColour(i,t[i]):(this.editingIndex=i,this.focusPickerAfterUpdate()),this.emitPalette(t)}removeColour(e){if(this.disabled||this.palette.length<=this.minColours)return;const t=this.palette.filter((r,n)=>n!==e).map(r=>[...r]),i=Math.min(e,t.length-1);this.editingIndex=void 0,this.emitPalette(t),this.focusSwatchAfterUpdate(i)}reorder(e,t){if(this.disabled||e===t)return;const i=J(this.palette),[r]=i.splice(e,1);if(i.splice(t,0,r),this.editingIndex=this.editingIndex===e?t:Et(this.editingIndex,e,t),this.persistentPicker){const n=Et(this.selectedIndex,e,t);n!==void 0&&this.selectColour(n,i[n])}this.emitPalette(i)}focusSwatchAfterUpdate(e){this.updateComplete.then(()=>{this.shadowRoot?.querySelector("govee-reorderable-strip")?.focusItem(e)})}paletteKeyPressed(e){const t=this.editingIndex;e.key!=="Escape"||t===void 0||(e.preventDefault(),e.stopPropagation(),this.editingIndex=void 0,this.focusSwatchAfterUpdate(t))}paletteFocusOut(e){const t=e.currentTarget;this.editingIndex!==void 0&&!(e.relatedTarget instanceof Node&&t.contains(e.relatedTarget))&&(this.editingIndex=void 0)}swatchClicked(e){if(this.persistentPicker){this.selectColour(e,this.palette[e]);return}if(this.editingIndex===e&&this.palette.length>this.minColours){this.removeColour(e);return}if(this.editingIndex===e){this.editingIndex=void 0;return}this.editingIndex=e,this.focusPickerAfterUpdate()}focusPickerAfterUpdate(){this.updateComplete.then(()=>{this.shadowRoot?.querySelector(".colour-popover govee-colour-picker")?.shadowRoot?.querySelector("button:not(:disabled), input:not(:disabled)")?.focus()})}selectColour(e,t){this.selectedIndex=e,this.dispatchEvent(new CustomEvent("colour-selected",{detail:{index:e,colour:[...t]},bubbles:!0,composed:!0}))}emitPalette(e){this.palette=e,this.dispatchEvent(new CustomEvent("palette-changed",{detail:{palette:e},bubbles:!0,composed:!0}))}static{this.styles=[M,k`
    :host {
      display: block;
    }

    .persistent-picker {
      margin-top: var(--studio-section-gap);
      padding-top: var(--studio-section-gap);
      border-top: 1px solid var(--studio-border);
    }
  `]}}G([p({attribute:!1})],H.prototype,"palette");G([p({type:Number})],H.prototype,"minColours");G([p({type:Number})],H.prototype,"maxColours");G([p({type:Boolean})],H.prototype,"disabled");G([p({type:Boolean})],H.prototype,"persistentPicker");G([p({type:Number})],H.prototype,"selectedIndex");G([p()],H.prototype,"ariaLabel");G([p()],H.prototype,"itemName");G([m()],H.prototype,"editingIndex");function wi(s){return s.charAt(0).toUpperCase()+s.slice(1)}customElements.get("govee-palette-editor")||customElements.define("govee-palette-editor",H);var Fr=Object.defineProperty,ot=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&Fr(e,t,r),r};class Ue extends A{constructor(){super(...arguments),this.disabled=!1,this.windowPointerDown=e=>{if(this.openRowMenuIndex===void 0)return;const t=this.shadowRoot?.querySelector(`details[data-row-menu-index="${this.openRowMenuIndex}"]`);t&&!e.composedPath().includes(t)&&(this.openRowMenuIndex=void 0)}}connectedCallback(){super.connectedCallback(),window.addEventListener("pointerdown",this.windowPointerDown)}disconnectedCallback(){window.removeEventListener("pointerdown",this.windowPointerDown),super.disconnectedCallback()}willUpdate(e){e.has("content")&&this.openRowMenuIndex!==void 0&&(this.content?.kind!=="h617a_multi"||this.openRowMenuIndex>=this.content.effects.length)&&(this.openRowMenuIndex=void 0)}updated(){if(this.content){if(this.content.kind==="h617a_single"||this.content.kind==="palette_diy"||this.content.kind==="special_diy"){const e=this.shadowRoot?.querySelector("select[data-single-variation]");e&&(e.value=String(this.content.variant));return}this.content.effects.forEach((e,t)=>{const i=this.effectFamily(e,!0),r=this.shadowRoot?.querySelector(`select[data-effect-index="${t}"]`),n=this.shadowRoot?.querySelector(`select[data-variation-index="${t}"]`);r&&(r.value=i?.id??`unknown:${e.family}`),n&&(n.value=String(e.variant))})}}render(){if(!this.content||!this.catalogue)return d;const e=(this.content.kind==="h617a_single"||this.content.kind==="palette_diy"||this.content.kind==="special_diy")&&this.effectFamily(this.content)?.rate==="sensitivity"?"Sensitivity":"Speed";return o`
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
    `}renderSingleVariation(){if(!this.content||this.content.kind!=="h617a_single"&&this.content.kind!=="palette_diy"&&this.content.kind!=="special_diy")return d;const e=this.content,i=this.effectFamily(e)?.variations??[],r=i.some(n=>n.variant===e.variant);return r&&i.length<=1?d:o`
      <label class="field parameter-group">
        <span class="parameter-label">Variation</span>
        <select
          aria-label="Variation"
          data-single-variation
          .value=${String(e.variant)}
          ?disabled=${this.disabled}
          @change=${n=>this.emitContent({...e,variant:Number(n.target.value)})}
        >
          ${r?d:o`
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
    `}effectRow(e,t){const i=this.effectFamily(e,!0),r=i?.variations??[];return o`
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
              ${r.some(n=>n.variant===e.variant)?d:o`
                    <option value=${String(e.variant)}>
                      Unknown variation ${e.variant}
                    </option>
                  `}
              ${r.map(n=>o`
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
        @palette-changed=${e=>{this.emitContent({...this.content,palette:J(e.detail.palette)})}}
      ></govee-palette-editor>
    `}effectFamilyChanged(e,t){const i=this.multiFamilies.find(n=>n.id===t),r=i?.variations[0];!i||!r||this.replaceEffect(e,{family:i.family,variant:r.variant})}effectVariationChanged(e,t){if(!this.content||this.content.kind!=="h617a_multi")return;const i=this.content.effects[e];i&&this.replaceEffect(e,{...i,variant:t})}replaceEffect(e,t){if(!this.content||this.content.kind!=="h617a_multi")return;const i=this.content.effects.map((r,n)=>n===e?t:r);this.emitContent({...this.content,effects:i})}addEffect(){if(!this.content||this.content.kind!=="h617a_multi")return;const e=this.multiFamilies[this.content.effects.length]??this.multiFamilies[0],t=e?.variations[0];if(!e||!t)return;const i=[...this.content.effects,{family:e.family,variant:t.variant}];this.emitContent({...this.content,effects:i})}removeEffect(e){if(!this.content||this.content.kind!=="h617a_multi")return;const t=this.content.effects.filter((i,r)=>r!==e);this.emitContent({...this.content,effects:t})}moveEffect(e,t){if(!this.content||this.content.kind!=="h617a_multi")return;const i=e+t;i<0||i>=this.content.effects.length||this.reorderEffect(e,i)}reorderEffect(e,t){if(!this.content||this.content.kind!=="h617a_multi"||e===t)return;const i=[...this.content.effects],[r]=i.splice(e,1);i.splice(t,0,r),this.emitContent({...this.content,effects:i})}effectDragStarted(e,t){this.draggedEffectIndex=e,t.dataTransfer?.setData("text/plain",String(e))}effectDropped(e,t){t.preventDefault(),this.draggedEffectIndex!==void 0&&(this.reorderEffect(this.draggedEffectIndex,e),this.draggedEffectIndex=void 0)}rowMenuToggled(e,t){t.currentTarget.open?this.openRowMenuIndex=e:this.openRowMenuIndex===e&&(this.openRowMenuIndex=void 0)}rowMenuKeyPressed(e,t){t.key==="Escape"&&(t.preventDefault(),this.openRowMenuIndex=void 0,this.updateComplete.then(()=>{this.shadowRoot?.querySelectorAll(".row-menu summary")[e]?.focus()}))}effectFamily(e,t=!1){return(t?this.multiFamilies:this.catalogue?.effects)?.find(i=>i.family===e.family)}emitContent(e){this.dispatchEvent(new CustomEvent("content-changed",{detail:{content:e},bubbles:!0,composed:!0}))}static{this.styles=[M,ce,K,k`
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

  `]}}ot([p({attribute:!1})],Ue.prototype,"content");ot([p({attribute:!1})],Ue.prototype,"catalogue");ot([p({type:Boolean})],Ue.prototype,"disabled");ot([m()],Ue.prototype,"openRowMenuIndex");customElements.get("govee-custom-effect-editor")||customElements.define("govee-custom-effect-editor",Ue);const fe={ATTRIBUTE:1,PROPERTY:3,BOOLEAN_ATTRIBUTE:4},Ur=s=>(...e)=>({_$litDirective$:s,values:e});class qr{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}}const Hr=s=>s.strings===void 0,Vr={},Kr=(s,e=Vr)=>s._$AH=e;const Ei=Ur(class extends qr{constructor(s){if(super(s),s.type!==fe.PROPERTY&&s.type!==fe.ATTRIBUTE&&s.type!==fe.BOOLEAN_ATTRIBUTE)throw Error("The `live` directive is not allowed on child or event bindings");if(!Hr(s))throw Error("`live` bindings can only contain a single expression")}render(s){return s}update(s,[e]){if(e===U||e===d)return e;const t=s.element,i=s.name;if(s.type===fe.PROPERTY){if(e===t[i])return U}else if(s.type===fe.BOOLEAN_ATTRIBUTE){if(!!e===t.hasAttribute(i))return U}else if(s.type===fe.ATTRIBUTE&&t.getAttribute(i)===e+"")return U;return Kr(s),e}});var jr=Object.defineProperty,lt=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&jr(e,t,r),r};const Gr=new Set(["rhythm","bloom","shiny"]),zr=new Set(["point","gradient","relative_brightness","key_count","direction","segment_count","speed"]),os=[{id:"clockwise",label:"Clockwise"},{id:"two_way",label:"Two-way"},{id:"counterclockwise",label:"Counterclockwise"}];class qe extends A{constructor(){super(...arguments),this.disabled=!1,this.showModeSelector=!0,this.modeChanged=e=>{const t=e.target.value;this.updateContent(i=>(i.mode=t,i.parameters=Wr(i.parameters),i.calm=_t(t)?i.calm??!1:null,i))}}willUpdate(e){e.has("content")&&this.content?.colour!=null&&(this.lastFixedColour=se(this.content.colour))}render(){if(!this.content)return d;const e=Yr(this.content.mode,this.catalogue),t=this.catalogue?.limits.music_sensitivity_min??0,i=this.catalogue?.limits.music_sensitivity_max??100,r=ls(this.content.sensitivity,t,i),n=this.content.colour===null?"automatic":"fixed",a=this.content.colour??this.lastFixedColour??Mt(0);return o`
      <section class="card">
        <div class="parameter-stack">
          ${this.showModeSelector?o`
                <label class="field">
                  <span class="parameter-label">Mode</span>
                  <select
                    aria-label="Mode"
                    .value=${Ei(this.content.mode)}
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

          ${this.renderRangeField("Sensitivity",r,t,i,l=>this.updateContent(c=>(c.sensitivity=l,c)))}

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

          ${_t(this.content.mode)?this.renderSegmentedField("Style",!!this.content.calm,[{value:!1,label:"Dynamic"},{value:!0,label:"Calm"}],l=>this.styleChanged(l)):d}

          ${this.renderModeParameters(this.content)}
        </div>
      </section>
    `}renderSegmentedField(e,t,i,r){return o`
      <govee-segmented-control
        .label=${e}
        .value=${t}
        .options=${i}
        .disabled=${this.disabled}
        @value-changed=${n=>r(n.detail.value)}
      ></govee-segmented-control>
    `}renderRangeField(e,t,i,r,n,a=!1){return o`
      <govee-slider-control
        .label=${e}
        .value=${t}
        .minimum=${i}
        .maximum=${r}
        .showValue=${a}
        .disabled=${this.disabled}
        @value-changed=${l=>n(l.detail.value)}
      ></govee-slider-control>
    `}renderModeParameters(e){switch(e.mode){case"separation":return this.renderSeparationParameters(e.parameters);case"hopping":return this.renderHoppingParameters(e.parameters);case"piano_keys":return this.renderPianoKeysParameters(e.parameters);case"fountain":return this.renderFountainParameters(e.parameters);case"day_and_night":return this.renderDayAndNightParameters(e.parameters);default:return d}}renderSeparationParameters(e){const t=Pe(e,"point",1,1,5),i=Ci(e,"gradient",!0);return o`
      ${this.renderRangeField("Point",t,1,5,r=>this.updateParameter("point",r))}
      ${this.renderCheckboxField("Gradient",i,r=>this.updateParameter("gradient",r))}
    `}renderHoppingParameters(e){const t=Pe(e,"relative_brightness",50,0,50);return o`
      ${this.renderRangeField("Relative brightness",t,0,50,i=>this.updateParameter("relative_brightness",i))}
    `}renderPianoKeysParameters(e){const t=Pe(e,"key_count",15,8,15);return o`
      ${this.renderRangeField("Key count",t,8,15,i=>this.updateParameter("key_count",i))}
    `}renderFountainParameters(e){const t=Xr(e,"direction","clockwise");return o`
      <label class="field">
        <span class="parameter-label">Direction</span>
        <select
          aria-label="Direction"
          .value=${Ei(t)}
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
    `}renderDayAndNightParameters(e){const t=Pe(e,"segment_count",1,1,7),i=Pe(e,"speed",10,1,50),r=Ci(e,"gradient",!1);return o`
      ${this.renderRangeField("Segment count",t,1,7,n=>this.updateParameter("segment_count",n),!0)}
      ${this.renderRangeField("Speed",i,1,50,n=>this.updateParameter("speed",n))}
      ${this.renderCheckboxField("Gradient",r,n=>this.updateParameter("gradient",n))}
    `}renderCheckboxField(e,t,i){return o`
      <govee-checkbox-control
        .label=${e}
        .checked=${t}
        .disabled=${this.disabled}
        @checked-changed=${r=>i(r.detail.checked)}
      ></govee-checkbox-control>
    `}colourModeChanged(e){this.updateContent(t=>{if(!e)return this.lastFixedColour=t.colour===null?this.lastFixedColour:se(t.colour),t.colour=null,t;const i=t.colour??this.lastFixedColour??Mt(0);return this.lastFixedColour=se(i),t.colour=se(i),t})}fixedColourChanged(e){this.lastFixedColour=se(e),this.updateContent(t=>(t.colour=se(e),t))}styleChanged(e){this.updateContent(t=>(_t(t.mode)&&(t.calm=e),t))}updateParameter(e,t){this.updateContent(i=>{const r=Jt(i.parameters);return r[e]=t,i.parameters=r,i})}updateContent(e){if(!this.content)return;const t=$t(e($t(this.content)));this.content=t,this.dispatchEvent(new CustomEvent("content-changed",{detail:{content:$t(t)},bubbles:!0,composed:!0}))}static{this.styles=[M,ce,K,k`
      :host {
        display: block;
      }

    `]}}lt([p({attribute:!1})],qe.prototype,"content");lt([p({attribute:!1})],qe.prototype,"catalogue");lt([p({type:Boolean})],qe.prototype,"disabled");lt([p({type:Boolean})],qe.prototype,"showModeSelector");function Yr(s,e){const t=e?.music_modes.map(i=>({...i}))??[];return t.some(i=>i.id===s)?t:[{id:s,label:`Unknown mode ${s}`},...t]}function Wr(s){const e=Jt(s);for(const t of zr)delete e[t];return e}function _t(s){return Gr.has(s)}function Pe(s,e,t,i,r){const n=s[e];return typeof n!="number"||!Number.isFinite(n)?t:ls(n,i,r)}function Ci(s,e,t){return typeof s[e]=="boolean"?s[e]:t}function Xr(s,e,t){const i=s[e];return os.some(r=>r.id===i)?i:t}function ls(s,e,t){return Math.min(t,Math.max(e,Math.round(s)))}function $t(s){return{...s,colour:Jr(s.colour),parameters:Jt(s.parameters)}}function Jt(s){return structuredClone(s)}function Jr(s){return s===null?null:se(s)}function se(s){return[...s]}customElements.get("govee-music-profile-editor")||customElements.define("govee-music-profile-editor",qe);var Zr=Object.defineProperty,ds=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&Zr(e,t,r),r};class Zt extends A{constructor(){super(...arguments),this.colours=[],this.disabled=!1}render(){return o`
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
  `]}}ds([p({attribute:!1})],Zt.prototype,"colours");ds([p({type:Boolean})],Zt.prototype,"disabled");customElements.get("govee-painted-segment-editor")||customElements.define("govee-painted-segment-editor",Zt);var Qr=Object.defineProperty,I=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&Qr(e,t,r),r};class C extends A{constructor(){super(...arguments),this.library={library_revision:0,items:[]},this.isAdmin=!1,this.category="all",this.search="",this.name="",this.speedIndex=null,this.loading=!1,this.saving=!1,this.applying=!1,this.editingCopy=!1,this.requestGeneration=0}willUpdate(e){(e.has("device")||e.has("api"))&&(this.invalidateRequests(),this.catalogue=void 0,this.category="all",this.search="",this.selectedScene=void 0,this.selectedItem=void 0,this.content=void 0,this.editingCopy=!1,this.notice=void 0,this.error=void 0,this.loading=!!(this.api&&this.device)),e.has("savedSceneSelection")&&this.savedSceneSelection&&this.synchroniseSavedSelection(this.savedSceneSelection),e.has("library")&&this.selectedItem&&(this.library.items.find(i=>i.id===this.selectedItem?.id)||(this.invalidateRequests(),this.selectedScene=void 0,this.selectedItem=void 0,this.content=void 0,this.editingCopy=!1,this.notice="The selected custom scene was deleted."))}updated(e){if((e.has("device")||e.has("api"))&&this.api&&this.device&&this.loadCatalogue(),e.has("library")&&this.selectedItem){const t=this.library.items.find(i=>i.id===this.selectedItem?.id);t&&t.revision!==this.selectedItem.revision&&(this.sceneDirty?this.notice="This custom scene changed elsewhere. Reload it before saving.":this.selectCustom(t))}}render(){return this.device?this.loading?o`<div class="status" role="status">Loading scenes...</div>`:this.error||!this.catalogue?o`
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
    `}sceneButton(e,t,i){const r=this.selectionKey===e;return o`
      <button
        class="selector scene ${r?"selected":""}"
        type="button"
        aria-pressed=${r}
        @click=${i}
      >
        <span>${t}</span>
      </button>
    `}renderDetail(){const e=this.selectedScene,t=e.speed,i=this.speedIndex??t?.default_index??0,r=this.selectedItem!==void 0||this.editingCopy,n=this.content?.kind==="scene_layered",a=this.selectedItem===void 0&&!this.editingCopy,l=this.selectedItem===void 0&&this.editingCopy,c=!this.name.trim()||this.selectedItem!==void 0&&!this.sceneDirty,h=!a&&this.content?.kind!=="scene_builtin"&&(this.selectedItem===void 0||this.sceneDirty),b=!!((!a||this.catalogue?.enabled)&&(!h||this.name.trim()));return o`
      <header class="editor-heading">
        <div>
          ${r?o`
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
            ?disabled=${!this.isAdmin||this.saving||this.applying||!this.hasCurrentSceneContent()||!n&&r&&c}
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
                  .options=${en(e.option_count,e.default_index)}
                  .disabled=${!this.isAdmin}
                  @value-changed=${r=>{this.speedIndex=r.detail.value}}
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
    `}async loadCatalogue(){if(!this.api||!this.device)return;const e=this.beginRequest();this.loading=!0,this.error=void 0,this.notice=void 0,this.selectedScene=void 0,this.selectedItem=void 0,this.content=void 0;try{const t=await e.api.sceneCatalogue(e.deviceId);if(!this.requestIsCurrent(e))return;this.catalogue=t,this.category="all"}catch(t){this.requestIsCurrent(e)&&(this.error=N(t))}finally{this.requestIsCurrent(e)&&(this.loading=!1)}}selectCategory(e){this.invalidateRequests(),this.category=e,this.selectedScene=void 0,this.selectedItem=void 0,this.content=void 0,this.editingCopy=!1,this.notice=void 0}async selectBuiltin(e){if(!this.api||!this.device)return;const t=ge(e),i=this.beginRequest(t);this.notice=void 0,this.selectedScene=e,this.selectedItem=void 0,this.editingCopy=!1,this.content=void 0,this.name=e.display_name,this.speedIndex=e.speed?.default_index??null;try{const r=await i.api.sceneDetail(i.deviceId,e.scene_id,e.effect_id);if(!this.requestIsCurrent(i)||ge(r.scene)!==t)return;this.selectedScene=r.scene,this.content=r.content,this.name=r.scene.display_name,this.speedIndex=r.content.speed_index}catch(r){this.requestIsCurrent(i)&&(this.notice=N(r))}}async selectCustom(e){if(!this.api||!this.device||!this.catalogue)return;const t=this.catalogue,i=this.beginRequest(`custom:${e.id}`);this.notice=void 0,this.selectedScene=void 0,this.selectedItem=void 0,this.editingCopy=!1,this.content=void 0,this.name=e.name;try{const r=await i.api.item(e.id);if(!this.requestIsCurrent(i))return;if(r.content.kind!=="scene_builtin"&&r.content.kind!=="scene_palette"&&r.content.kind!=="scene_layered")throw new Error("This custom scene uses an unsupported definition.");const n=r.content;if(n.template.sku!==t.sku)throw new Error(`This custom scene targets ${n.template.sku}, not ${t.sku}.`);const a=t.scenes.find(c=>c.scene_id===n.template.scene_id&&c.effect_id===n.template.effect_id);if(!a)throw new Error("The source scene is not in this device catalogue.");const l=await i.api.sceneDetail(i.deviceId,n.template.scene_id,n.template.effect_id);if(!this.requestIsCurrent(i)||ge(l.scene)!==ge(a))return;this.commitCustomSelection(r,a,n)}catch(r){this.requestIsCurrent(i)&&(this.notice=N(r))}}synchroniseSavedSelection(e){const t=e.content;if(this.selectedItem?.id!==e.id||!this.catalogue||t.kind!=="scene_builtin"&&t.kind!=="scene_palette"&&t.kind!=="scene_layered"||t.template.sku!==this.catalogue.sku)return;const i=this.catalogue.scenes.find(r=>r.scene_id===t.template.scene_id&&r.effect_id===t.template.effect_id);i&&(this.requestGeneration+=1,this.activeSelectionIdentity=`custom:${e.id}`,this.commitCustomSelection(e,i,t),this.notice=void 0)}commitCustomSelection(e,t,i){const r=sn(i);this.selectedScene=t,this.selectedItem=e,this.editingCopy=!1,this.content=r,this.name=e.name,this.speedIndex=r.speed_index??t.speed?.default_index??null}async save(){if(!this.api||!this.device||!this.catalogue||!this.selectedScene||!this.content||!this.hasCurrentSceneContent()||this.content.kind!=="scene_builtin"&&this.content.kind!=="scene_palette"||!this.isAdmin||this.saving||this.applying)return;const e=this.name.trim();if(!e){this.notice="Give this custom scene a name before saving.";return}const t=this.content.kind==="scene_palette"?Xe({...this.content,speed_index:this.speedIndex}):{...this.content,speed_index:this.speedIndex},i=this.captureRequest();this.saving=!0,this.notice=void 0;try{const r=this.selectedItem?await this.api.updateItem(this.selectedItem,e,t,this.library.library_revision):await this.api.createItem(e,t,this.library.library_revision);if(r.item.content.kind!=="scene_builtin"&&r.item.content.kind!=="scene_palette")throw new Error("The saved scene returned an unsupported definition.");if(this.dispatchEvent(new CustomEvent("library-item-saved",{detail:{item:r.item,library_revision:r.library_revision},bubbles:!0,composed:!0})),!this.requestIsCurrent(i))return;this.requestGeneration+=1,this.activeSelectionIdentity=`custom:${r.item.id}`,this.selectedItem=r.item,this.editingCopy=!1,this.content=r.item.content,this.name=r.item.name,this.category="custom",this.notice="Custom scene saved."}catch(r){this.requestIsCurrent(i)&&(this.notice=Ct(r)==="conflict"?"The library changed elsewhere. Reload the scene before saving.":`Save failed: ${N(r)}`)}finally{this.saving=!1}}edit(){if(!(!this.isAdmin||!this.selectedScene||!this.hasCurrentSceneContent())){if(this.selectedScene.scene_type===2&&this.content?.kind==="scene_layered"){this.dispatchSceneEdit();return}this.editingCopy=!0,this.name=`${this.selectedScene.display_name} copy`,this.notice=void 0}}dispatchSceneEdit(){!this.selectedScene||this.content?.kind!=="scene_layered"||this.dispatchEvent(new CustomEvent("scene-edit-selected",{detail:{content:oe({...this.content,speed_index:this.speedIndex}),config_entry_id:this.device.config_entry_id,...this.selectedItem?{item:this.selectedItem}:{},name:this.selectedItem?.name??`${this.selectedScene.display_name} copy`},bubbles:!0,composed:!0}))}async apply(){if(!this.api||!this.device||!this.selectedScene||!this.hasCurrentSceneContent()||!this.isAdmin||!this.catalogue?.enabled&&this.selectedItem===void 0&&!this.editingCopy||this.saving||this.applying)return;const e=this.captureRequest(),t=this.selectedScene,i=this.speedIndex,r=this.selectedItem===void 0&&!this.editingCopy,n=this.content.kind==="scene_palette"?Xe({...this.content,speed_index:i}):this.content.kind==="scene_layered"?oe({...this.content,speed_index:i}):{...this.content,speed_index:i},a=!r&&n.kind!=="scene_builtin"&&(this.selectedItem===void 0||this.sceneDirty),l=this.name.trim();if(a&&!l){this.notice="Give this custom scene a name before applying it.";return}this.applying=!0,this.notice=void 0;try{r||n.kind==="scene_builtin"?await e.api.applyScene(e.deviceId,t,i):a?await e.api.applySnapshot(e.deviceId,l,n):await e.api.applySaved(e.deviceId,this.selectedItem)}catch(c){this.requestIsCurrent(e)&&(this.notice=`Apply failed: ${N(c)}`)}finally{this.applying=!1}}beginRequest(e){return this.requestGeneration+=1,this.activeSelectionIdentity=e,this.captureRequest()}captureRequest(){return{generation:this.requestGeneration,api:this.api,deviceId:this.device.config_entry_id,category:this.category,selectionIdentity:this.activeSelectionIdentity}}invalidateRequests(){this.requestGeneration+=1,this.activeSelectionIdentity=void 0}requestIsCurrent(e){return e.generation===this.requestGeneration&&e.api===this.api&&e.deviceId===this.device?.config_entry_id&&e.category===this.category&&e.selectionIdentity===this.activeSelectionIdentity}hasCurrentSceneContent(){return!this.catalogue||!this.selectedScene||!this.content||this.content.template.sku!==this.catalogue.sku||this.content.template.scene_id!==this.selectedScene.scene_id||this.content.template.effect_id!==this.selectedScene.effect_id?!1:this.activeSelectionIdentity===this.selectionKey}get sceneDirty(){if(!this.selectedItem||!this.content)return!0;const e=this.content.kind==="scene_palette"?Xe({...this.content,speed_index:this.speedIndex}):this.content.kind==="scene_layered"?oe({...this.content,speed_index:this.speedIndex}):{...this.content,speed_index:this.speedIndex};return this.name.trim()!==this.selectedItem.name||JSON.stringify(e)!==JSON.stringify(this.selectedItem.content)}requestDelete(e){if(!this.selectedItem||!this.isAdmin)return;const t=e.currentTarget;this.dispatchEvent(new CustomEvent("library-item-delete-requested",{detail:{id:this.selectedItem.id,revision:this.selectedItem.revision,name:this.selectedItem.name,returnFocus:t},bubbles:!0,composed:!0})),t.blur()}static{this.styles=[M,ce,Vt,Fi,Ui,Hi,K,Kt,qi,k`
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
  `]}}I([p({attribute:!1})],C.prototype,"api");I([p({attribute:!1})],C.prototype,"device");I([p({attribute:!1})],C.prototype,"library");I([p({type:Boolean})],C.prototype,"isAdmin");I([p({attribute:!1})],C.prototype,"savedSceneSelection");I([m()],C.prototype,"catalogue");I([m()],C.prototype,"category");I([m()],C.prototype,"search");I([m()],C.prototype,"selectedScene");I([m()],C.prototype,"selectedItem");I([m()],C.prototype,"content");I([m()],C.prototype,"name");I([m()],C.prototype,"speedIndex");I([m()],C.prototype,"loading");I([m()],C.prototype,"saving");I([m()],C.prototype,"applying");I([m()],C.prototype,"editingCopy");I([m()],C.prototype,"notice");I([m()],C.prototype,"error");function ge(s){return`builtin:${s.scene_id}:${s.effect_id}`}function en(s,e){return Array.from({length:s},(t,i)=>({value:i,label:tn(i,e)}))}function tn(s,e){const t=s-e;if(t===0)return"Default";const i=Math.abs(t);return`${i} ${i===1?"step":"steps"} ${t<0?"lower":"higher"}`}function Xe(s){return{...s,template:{...s.template},steps:s.steps.map(e=>({...e,colour:[...e.colour],inline_colour:e.inline_colour===null?null:[...e.inline_colour]})),palette:s.palette.map(e=>[...e])}}function sn(s){return s.kind==="scene_palette"?Xe(s):s.kind==="scene_layered"?oe(s):{...s,template:{...s.template}}}customElements.get("govee-scene-browser")||customElements.define("govee-scene-browser",C);var rn=Object.defineProperty,Qt=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&rn(e,t,r),r};const nn=[{value:"movie",label:"Movie"},{value:"game",label:"Game"}],an=[{value:!0,label:"Full screen"},{value:!1,label:"Part screen"}],on=[{key:"left",label:"Left"},{key:"top",label:"Top"},{key:"right",label:"Right"},{key:"bottom",label:"Bottom"}];function ne(s,e,t){return Math.min(t,Math.max(e,Math.round(s)))}function ln(s){return{...s}}function Si(s){return{...s,relative_brightness:ln(s.relative_brightness)}}function cs(s){const e=[s.left,s.top,s.right,s.bottom];return e.every(t=>t===e[0])?e[0]:void 0}function dn(s){const e=cs(s);return e!==void 0?e:ne((s.left+s.top+s.right+s.bottom)/4,1,100)}function cn(s){const e=ne(s,1,100);return{left:e,top:e,right:e,bottom:e}}class dt extends A{constructor(){super(...arguments),this.disabled=!1,this.showModeSelector=!0}render(){if(!this.content)return o`
        <section class="card empty-state" role="status">
          <h3 class="section-title">Video profile unavailable</h3>
          <p class="muted">
            Load an H6199 video profile to edit video-sync settings.
          </p>
        </section>
      `;const e=this.content.relative_brightness,t=cs(e)===void 0,i=dn(e);return o`
      <div class="editor-grid">
        <section class="card">
          <div class="parameter-stack">
            ${this.showModeSelector?this.renderSegmentedField("Mode",this.content.mode,nn,r=>this.updateContent(n=>{n.mode=r})):d}
            ${this.renderSegmentedField("Capture area",this.content.full_screen,an,r=>this.updateContent(n=>{n.full_screen=r}))}
            ${this.renderCheckboxField("Sound effects",this.content.sound_effects,r=>this.updateContent(n=>{n.sound_effects=r}))}
            ${this.content.sound_effects?this.renderRangeField("Softness",this.content.sound_effects_softness,1,100,String(this.content.sound_effects_softness),r=>this.updateContent(n=>{n.sound_effects_softness=ne(r,1,100)})):d}
            ${this.renderCheckboxField("Blank screen",this.content.blank_screen,r=>this.updateContent(n=>{n.blank_screen=r}))}
          </div>
        </section>

        <section class="card">
          <h3 class="section-title">Image</h3>
          <div class="parameter-stack">
            ${this.renderRangeField("Saturation",this.content.saturation,0,100,`${this.content.saturation}%`,r=>this.updateContent(n=>{n.saturation=ne(r,0,100)}))}
            ${this.renderWhiteBalanceField(this.content.white_balance_position)}
          </div>
        </section>

        <section class="card brightness-card">
          <div class="card-heading">
            <h3 class="section-title">Relative brightness</h3>
            ${t?o`<span class="status-chip">Mixed edges</span>`:d}
          </div>
          <div class="parameter-stack">
            ${this.renderRangeField("Uniform brightness",i,1,100,`${i}%`,r=>this.updateContent(n=>{n.relative_brightness=cn(r)}),t?"relative-brightness-note":void 0)}
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
                ${on.map(({key:r})=>o`
                    <span
                      class="screen-edge screen-edge-${r}"
                      style=${`--edge-level: ${e[r]/100}`}
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
    `}renderSegmentedField(e,t,i,r){return o`
      <govee-segmented-control
        .label=${e}
        .value=${t}
        .options=${i}
        .disabled=${this.disabled}
        @value-changed=${n=>r(n.detail.value)}
      ></govee-segmented-control>
    `}renderCheckboxField(e,t,i){return o`
      <govee-checkbox-control
        .label=${e}
        .checked=${t}
        .disabled=${this.disabled}
        @checked-changed=${r=>i(r.detail.checked)}
      ></govee-checkbox-control>
    `}renderRangeField(e,t,i,r,n,a,l){return o`
      <govee-slider-control
        .label=${e}
        .value=${t}
        .minimum=${i}
        .maximum=${r}
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
            .value=${String(ne(e,1,20))}
            aria-label="White balance"
            ?disabled=${this.disabled}
            @input=${t=>this.updateContent(i=>{i.white_balance_position=ne(Number(t.target.value),1,20)})}
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
          @input=${r=>this.updateRelativeBrightnessEdge(e,Number(r.target.value))}
        />
        <output aria-label="${t} value">${i}%</output>
      </label>
    `}updateRelativeBrightnessEdge(e,t){this.updateContent(i=>{i.relative_brightness[e]=ne(t,1,100)})}updateContent(e){if(!this.content)return;const t=Si(this.content);e(t),this.emitContent(t)}emitContent(e){this.dispatchEvent(new CustomEvent("content-changed",{detail:{content:Si(e)},bubbles:!0,composed:!0}))}static{this.styles=[M,ce,K,k`
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
    `]}}Qt([p({attribute:!1})],dt.prototype,"content");Qt([p({type:Boolean})],dt.prototype,"disabled");Qt([p({type:Boolean})],dt.prototype,"showModeSelector");customElements.get("govee-video-profile-editor")||customElements.define("govee-video-profile-editor",dt);var un=Object.defineProperty,x=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&un(e,t,r),r};const Nt=15;class y extends A{constructor(){super(...arguments),this.showDevicePicker=!1,this.loading=!0,this.devices=[],this.section="custom",this.customEffectCategory="all",this.customCopyStarted=!1,this.library={library_revision:0,items:[]},this.name="",this.content=ye(),this.paintBrushes=Re(),this.selectedPaintBrush=0,this.brushUsesBackground=!1,this.saving=!1,this.saveNameDialogOpen=!1,this.saveNameValue="",this.applying=!1,this.deployments=[],this.editorTransitionEpoch=0,this.loadEpoch=0,this.deploymentRevision=-1}get isAdmin(){return this.hass?.user?.is_admin===!0}get modalOpen(){return this.saveNameDialogOpen||this.deleteCandidate!==void 0}get selectedDevice(){return this.devices.find(e=>e.config_entry_id===this.selectedDeviceId)}get selectedModel(){const e=this.selectedDevice?.model;return e==="H617A"||e==="H6199"?e:void 0}get editorReadOnly(){return!this.isAdmin||this.templateSourceLabel!==void 0}get modelCatalogue(){const e=this.selectedModel;return e?this.customCatalogue?.models[e]:void 0}get videoAvailable(){return!!this.modelCatalogue?.video_modes.length}get customEffectsAvailable(){const e=this.modelCatalogue;return!!(e&&(e.painted_effects.length||e.effects.length||e.music_modes.length||e.supports.advanced!=="unsupported"))}get dirty(){return re(this.content)?this.savedBaseline!==Y(this.name,this.content):!1}get applyCapability(){if(!kt(this.content))return;const e=this.selectedDevice;if(e)switch(this.content.kind){case"h617a_painted":return e.custom_effects.painted;case"h617a_single":return e.custom_effects.single;case"h617a_multi":return e.custom_effects.multi;case"palette_diy":return e.custom_effects.palette_diy;case"advanced":case"scene_layered":return e.custom_effects.advanced;case"music_profile":return e.profiles.music;case"video_profile":return e.profiles.video;case"workshop":return e.custom_effects.workshop;case"special_diy":return e.custom_effects.special_diy}}get canApply(){return kt(this.content)&&this.isAdmin&&!this.applying&&!this.saving&&!this.deletingCurrentItem&&this.name.trim().length>0&&this.applyCapability==="supported"}get deletingCurrentItem(){return this.deletingItemId!==void 0&&this.currentItem?.id===this.deletingItemId}get activeDeployment(){const e=this.deployments.find(t=>t.operation_id===this.activeOperationId);return e||!this.applying?e:this.latestDeployment(ht)}connectedCallback(){super.connectedCallback(),this.hass&&!this.api&&this.load()}disconnectedCallback(){this.releaseModalScrollLock(),super.disconnectedCallback(),this.loadEpoch+=1,this.beginEditorTransition(),this.stopSubscriptions(),this.api=void 0}updated(e){e.has("hass")&&this.hass&&!this.api&&this.load(),this.syncModalScrollLock(),this.syncSingleEffectSelects()}render(){return this.loading?o`<div class="centred" role="status">Loading effect studio...</div>`:this.error?this.renderFatalError():o`
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
    `}renderCurrentCustomEditor(){return Je(this.content)?this.content.kind==="h617a_painted"?this.renderPaintedEditor():this.renderPaletteEffectEditor():this.content.kind==="palette_diy"||this.content.kind==="special_diy"?this.renderPaletteEffectEditor():this.content.kind==="music_profile"?this.renderMusicProfileEditor():je(this.content)?this.renderAdvancedEditor():this.content.kind==="opaque"?this.renderOpaqueEditor(this.content):d}renderVideo(){const e=this.modelCatalogue;if(!e||!this.videoAvailable)return d;const t=this.library.items.filter(i=>i.kind==="video_profile"&&this.libraryItemAvailable(i)).sort((i,r)=>Le(i.name,r.name));return o`
      <aside class="sidebar item-sidebar library" aria-label="Video profiles">
        ${e.video_modes.map(i=>this.videoListButton(`template:video:${i.id}`,i.label,()=>this.openVideoTemplate(i.id,i.label)))}
        ${t.map(i=>this.videoListButton(`saved:${i.id}`,i.name,()=>{this.selectItem(i.id)},i))}
      </aside>
      <section class="editor-surface editor">
        ${this.content.kind==="video_profile"?this.renderVideoProfileEditor():d}
      </section>
    `}videoListButton(e,t,i,r){const n=r?this.currentItem?.id===r.id:!this.currentItem&&this.customTemplateSelection===e;return o`
      <button
        class="selector item ${n?"selected":""}"
        type="button"
        ?disabled=${!r&&!this.isAdmin}
        @click=${i}
      >
        <span>${t}</span>
      </button>
    `}openVideoTemplate(e,t){this.selectedModel==="H6199"&&this.openEditableTemplate(t,pn(e),`template:video:${e}`)}renderVideoProfileEditor(){return this.content.kind!=="video_profile"?d:o`
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
    `)}get customEffectEntries(){const e=this.modelCatalogue;return[...e?.painted_effects.length?[{kind:"paint",key:"template:paint",label:"Paint",category:"single-layer"}]:[],...e?.music_modes.map(i=>({kind:"music",key:`template:music:${i.id}`,label:i.label,category:"music",mode:i.id}))??[],...e?.effects.filter(i=>i.category==="single_layer").map(i=>({kind:"single",key:`template:single:${i.family}:${i.variations[0].variant}`,label:i.label,category:"single-layer",family:i.family,variant:i.variations[0].variant}))??[],...e?.supports.multi!=="unsupported"?[{kind:"multi",key:"template:mix",label:"Mix",category:"multi-layer"}]:[],...e?.workshop_templates.map(i=>({kind:"workshop",key:`template:workshop:${i.id}`,label:i.label,category:"advanced",content:i.content}))??[],...e?.special_diy_templates.map(i=>({kind:"special_diy",key:`template:special-diy:${i.id}`,label:i.label,category:"special-diy",content:i.content}))??[],{kind:"advanced",key:"template:advanced",label:"Layered",category:"advanced"},...this.library.items.filter(i=>wt(i.kind)&&i.kind!=="video_profile").map(i=>({kind:"saved",key:`saved:${i.id}`,label:i.name,category:_n(i.kind),item:i}))].filter(i=>this.customEffectEntryAvailable(i)).filter(i=>this.customEffectCategory==="all"||this.customEffectCategory==="my-effects"&&i.kind==="saved"||i.category===this.customEffectCategory).sort((i,r)=>Le(i.label,r.label))}customEffectEntryAvailable(e){switch(e.kind){case"paint":return this.customEffectKindAvailable("h617a_painted");case"single":return this.customEffectKindAvailable(this.selectedModel==="H617A"?"h617a_single":"palette_diy");case"music":return this.customEffectKindAvailable("music_profile");case"multi":return this.customEffectKindAvailable("h617a_multi");case"advanced":return this.customEffectKindAvailable("advanced");case"workshop":return this.customEffectKindAvailable("workshop");case"special_diy":return this.customEffectKindAvailable("special_diy");case"saved":return this.libraryItemAvailable(e.item)}}libraryItemAvailable(e){const t=this.selectedModel;return e.model!==void 0&&e.model!==t?!1:e.kind==="video_profile"?this.videoAvailable:e.model===void 0&&["h617a_painted","h617a_single","h617a_multi"].includes(e.kind)&&t!=="H617A"?!1:this.customEffectKindAvailable(e.kind)}effectContentAvailable(e){const t=this.selectedModel;return e.kind==="h617a_painted"||e.kind==="h617a_single"||e.kind==="h617a_multi"?t==="H617A":e.kind==="palette_diy"||e.kind==="special_diy"||e.kind==="music_profile"||e.kind==="video_profile"||e.kind==="workshop"?e.model===t:e.kind==="scene_layered"?e.template.sku===t:this.customEffectKindAvailable(e.kind)}customEffectCategoryAvailable(e){switch(e){case"all":return this.customEffectsAvailable;case"music":return!!this.modelCatalogue?.music_modes.length;case"single-layer":return this.customEffectKindAvailable("h617a_painted")||this.customEffectKindAvailable("h617a_single")||this.customEffectKindAvailable("palette_diy");case"multi-layer":return this.customEffectKindAvailable("h617a_multi");case"advanced":return this.customEffectKindAvailable("advanced")||this.customEffectKindAvailable("workshop");case"special-diy":return this.customEffectKindAvailable("special_diy");case"my-effects":return this.library.items.some(t=>t.kind!=="video_profile"&&wt(t.kind)&&this.libraryItemAvailable(t))}}customEffectKindAvailable(e){const t=this.modelCatalogue,i=this.selectedModel;return e==="h617a_painted"?i==="H617A"&&!!t?.painted_effects.length:e==="h617a_single"?i==="H617A"&&!!t?.effects.length:e==="palette_diy"?i==="H6199"&&!!t?.effects.length:e==="h617a_multi"?i==="H617A"&&t?.supports.multi!=="unsupported":e==="music_profile"?!!t?.music_modes.length:e==="workshop"?t!==void 0&&t.supports.workshop!=="unsupported"&&!!t.workshop_templates.length:e==="special_diy"?t!==void 0&&t.supports.special_diy!=="unsupported"&&!!t.special_diy_templates.length:t?.supports.advanced!=="unsupported"}customEffectCategoryButton(e,t){const i=this.customEffectCategory===e;return o`
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
        <span>New</span>
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
    `}selectCustomEffectEntry(e){if(e.kind==="saved"){this.selectItem(e.item.id);return}if(e.kind==="advanced"){this.newEffect("advanced",void 0,{name:e.label,content:pt(),selectionIdentity:e.key,templateLabel:e.label}),this.customTemplateSelection=e.key;return}if(e.kind==="workshop"||e.kind==="special_diy"){this.openEditableTemplate(e.label,e.content,e.key);return}const t=this.modelCatalogue;if(t){if(e.kind==="music"){this.openMusicTemplate(e.mode,e.label);return}if(e.kind==="paint"){this.newEffect("h617a_painted",void 0,{name:e.label,content:ye(),selectionIdentity:e.key,templateLabel:e.label});return}if(e.kind==="single"){if(this.selectedModel==="H617A"){const i=ie("h617a_single",t);this.newEffect("h617a_single",void 0,{name:e.label,content:{...i,family:e.family,variant:e.variant},selectionIdentity:e.key,templateLabel:e.label})}else this.openEditableTemplate(e.label,xt(t,this.selectedModel,e.family,e.variant),e.key);return}this.newEffect("h617a_multi",void 0,{name:e.label,content:ie("h617a_multi",t),selectionIdentity:e.key,templateLabel:e.label})}}openEditableTemplate(e,t,i){this.beginEditorTransition(),this.currentItem=void 0,this.templateSourceLabel=e,this.customCopyStarted=!1,this.customTemplateSelection=i,this.name=e,this.content=Ke(t),this.savedBaseline=void 0,this.notice=void 0}openMusicTemplate(e,t){const i=this.selectedModel;i!=="H617A"&&i!=="H6199"||this.openEditableTemplate(t,{kind:"music_profile",model:i,mode:e,sensitivity:i==="H6199"?100:99,colour:null,calm:["rhythm","bloom","shiny"].includes(e)?!1:null,parameters:{}},`template:music:${e}`)}renderAdvancedEditor(){if(!je(this.content))return d;const e=this.content.kind==="scene_layered",t=this.activeDeployment;return o`
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
        .content=${fn(this.content)}
        .disabled=${!this.isAdmin}
        .segmentCount=${this.selectedDevice?.segment_count??15}
        @content-changed=${i=>{!je(this.content)||!this.prepareTemplateEdit()||(this.content=gn(this.content,i.detail.content))}}
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
        .colours=${Rt(this.content)}
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
        @content-changed=${i=>{this.content=i.detail.content.kind==="palette_diy"?ps(i.detail.content):i.detail.content.kind==="special_diy"?hs(i.detail.content):us(i.detail.content)}}
      ></govee-custom-effect-editor>

      ${t?this.renderDeployment(t):d}
    `}renderSingleEffectSelector(){if(!this.customCatalogue||this.templateSourceLabel||this.content.kind!=="h617a_painted"&&this.content.kind!=="h617a_single"&&this.content.kind!=="palette_diy"||this.currentItem?.content.kind==="h617a_painted"&&this.content.kind==="h617a_painted")return d;const e=this.selectedSingleEffectFamily,t=this.currentItem?.content.kind==="h617a_painted"?[]:this.modelCatalogue?.effects.filter(a=>a.category==="single_layer")??[],i=t.some(a=>a.family===e?.family),r=this.content.kind==="h617a_painted"?"paint":e&&i?e.id:`unknown:${this.content.family}`,n=this.customEffectKindAvailable("h617a_painted")&&this.currentItem?.content.kind!=="h617a_single";return o`
      <section class="card single-effect-settings">
        <label class="field">
          <span>Effect</span>
          <select
            aria-label="Effect"
            .value=${r}
            ?disabled=${this.editorReadOnly}
            @change=${this.singleEffectChanged}
          >
            ${(this.content.kind==="h617a_single"||this.content.kind==="palette_diy")&&!i?o`
                  <option value=${r}>
                    Unknown effect ${this.content.family}
                  </option>
                `:d}
            ${n?o`
                  <option
                    value="paint"
                    ?selected=${r==="paint"}
                  >
                    Paint
                  </option>
                `:d}
            ${t.map(a=>o`
                <option
                  value=${a.id}
                  ?selected=${r===a.id}
                >
                  ${a.label}
                </option>
              `)}
          </select>
        </label>
      </section>
    `}renderPaintedVariationField(){if(!this.customCatalogue||this.content.kind!=="h617a_painted")return d;const e=this.content,t=this.customCatalogue.painted_effects,i=t.some(r=>r.id===e.effect);return i&&t.length<=1?d:o`
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
          ${t.map(r=>o`
              <option
                value=${r.id}
                ?selected=${r.id===e.effect}
              >
                ${r.label}
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
    `}get selectedSingleEffectFamily(){if(this.content.kind!=="h617a_single"&&this.content.kind!=="palette_diy")return;const e=this.content.family;return this.modelCatalogue?.effects.find(t=>t.family===e)}syncSingleEffectSelects(){if(this.content.kind!=="h617a_painted"&&this.content.kind!=="h617a_single"&&this.content.kind!=="palette_diy")return;const e=this.shadowRoot?.querySelector('select[aria-label="Effect"]');if(e&&(e.value=this.content.kind==="h617a_painted"?"paint":this.selectedSingleEffectFamily?.id??`unknown:${this.content.family}`),this.content.kind==="h617a_painted"){const t=this.shadowRoot?.querySelector('select[aria-label="Variation"]');t&&(t.value=this.content.effect)}}sliderField(e,t,i,r){return o`
      <govee-slider-control
        .label=${e}
        .value=${i}
        .minimum=${0}
        .maximum=${100}
        .valueText=${r}
        .disabled=${this.editorReadOnly}
        @value-changed=${n=>this.updateContent({[t]:n.detail.value})}
      ></govee-slider-control>
    `}renderDeployment(e){if(e.phase==="confirmed"||e.phase==="applied")return d;const t=this.devices.find(r=>r.config_entry_id===e.config_entry_id)?.display_name??"device";let i;switch(e.phase){case"compiling":case"pending":i=`Preparing to apply to ${t}.`;break;case"uploading":i=`Applying to ${t}: ${e.progress_current} of ${e.progress_total}.`;break;case"activating":i=`Activating the selected effect on ${t}.`;break;case"verifying":i=`Checking the selected effect on ${t}.`;break;case"uncertain":i=e.error_code==="effect_content_readback_unproven"?`${t} reported the selected H6199 user-effect slot, but the uploaded effect content cannot be read back. The result remains uncertain.`:e.error_code==="activation_readback_unproven"?`The H6199 effect upload was sent to ${t}, but activation and readback remain unproven. The result is uncertain.`:`The final state of ${t} is uncertain. The requested settings could not be confirmed.`;break;case"recovering":i=`Restoring the previous state on ${t} after the apply failed.`;break;case"unknown":i=`Applied to ${t}, but the requested settings could not be confirmed.`;break;case"interrupted":i=`Apply to ${t} was interrupted by a Home Assistant restart.`;break;case"failed":i=`Apply to ${t} failed.`;break}return o`
      <div
        class="feedback deployment ${e.phase}"
        role=${["failed","uncertain","interrupted","unknown"].includes(e.phase)?"alert":"status"}
      >
        ${i}
      </div>
    `}async selectSection(e){const t=this.beginEditorTransition();if(e===this.section||e==="custom"&&!this.customEffectsAvailable||e==="video"&&!this.videoAvailable||(this.section=e,this.notice=void 0,e==="scenes"))return;if(e==="video"){const r=this.library.items.find(a=>a.kind==="video_profile"&&this.libraryItemAvailable(a));if(r){await this.selectItem(r.id,t);return}const n=this.modelCatalogue?.video_modes[0];n&&this.openVideoTemplate(n.id,n.label);return}if((Je(this.content)||this.content.kind==="palette_diy"||this.content.kind==="music_profile"||je(this.content)||this.content.kind==="opaque")&&this.customEffectKindAvailable(this.content.kind))return;const i=this.preferredLibraryEffect();if(i){await this.selectItem(i.id,t);return}this.isAdmin?this.openDefaultAvailableTemplate(t):(this.currentItem=void 0,this.name="")}async load(){const e=this.loadEpoch+1;this.loadEpoch=e,this.loading=!0,this.error=void 0,this.deploymentRevision=-1;const t=new Tr(this.hass);this.api=t;try{const[i,r,n,a]=await Promise.all([t.info(),t.devices(),t.library(),t.customCatalogue()]);if(!this.loadIsCurrent(e,t))return;if(!Lr(i))throw new Error("This editor bundle is not compatible with the installed backend.");this.devices=r,this.library=n,this.customCatalogue=a,this.selectedDeviceId=this.deviceIdFromPath()??r.find(h=>h.custom_effects.painted==="supported")?.config_entry_id??r[0]?.config_entry_id,this.customEffectsAvailable||(this.section="scenes");const l=await t.subscribeLibrary(h=>{this.libraryChanged(h)},h=>this.subscriptionFailed(h,e,t));if(!this.loadIsCurrent(e,t)||this.error){l();return}if(this.unsubscribeLibrary=l,this.isAdmin){const h=await t.subscribeDeployments(b=>{b.revision<this.deploymentRevision||(this.deploymentRevision=b.revision,this.deployments=b.deployments,this.activeOperationId||(this.activeOperationId=this.latestDeployment(ht)?.operation_id))},b=>this.subscriptionFailed(b,e,t));if(!this.loadIsCurrent(e,t)||this.error){h();return}this.unsubscribeDeployments=h}const c=this.preferredLibraryEffect(n.items);c?await this.selectItem(c.id):this.isAdmin&&this.openDefaultAvailableTemplate()}catch(i){this.loadIsCurrent(e,t)&&(this.stopSubscriptions(),this.error=N(i))}finally{this.loadIsCurrent(e,t)&&(this.loading=!1)}}openDefaultTemplate(e){this.newEffect("h617a_painted",e,{name:"Paint",content:ye(),selectionIdentity:"template:paint",templateLabel:"Paint"})}preferredLibraryEffect(e=this.library.items){return e.filter(t=>t.kind!=="video_profile"&&wt(t.kind)&&this.libraryItemAvailable(t)).sort((t,i)=>Pi(t.kind,this.selectedModel)-Pi(i.kind,this.selectedModel)||Le(t.name,i.name))[0]}openDefaultAvailableTemplate(e){if(this.customEffectKindAvailable("h617a_painted")){this.openDefaultTemplate(e);return}if(this.customEffectKindAvailable("h617a_single")&&this.modelCatalogue?.effects[0]){const t=this.modelCatalogue.effects.find(n=>n.category==="single_layer")??this.modelCatalogue.effects[0],i=t.variations[0],r=ie("h617a_single",this.modelCatalogue);this.newEffect("h617a_single",e,{name:t.label,content:{...r,family:t.family,variant:i.variant},selectionIdentity:`template:single:${t.family}:${i.variant}`,templateLabel:t.label});return}if(this.customEffectKindAvailable("palette_diy")&&this.modelCatalogue?.effects[0]){const t=this.modelCatalogue.effects.find(i=>i.category==="single_layer")??this.modelCatalogue.effects[0];this.openEditableTemplate(t.label,xt(this.modelCatalogue,this.selectedModel,t.family,t.variations[0].variant),`template:single:${t.family}:${t.variations[0].variant}`);return}if(this.customEffectKindAvailable("h617a_multi")){this.newEffect("h617a_multi",e,{name:"Mix",content:ie("h617a_multi",this.modelCatalogue),selectionIdentity:"template:mix",templateLabel:"Mix"});return}if(this.customEffectKindAvailable("advanced")){this.newEffect("advanced",e,{name:"Layered",content:pt(),selectionIdentity:"template:advanced",templateLabel:"Layered"});return}this.currentItem=void 0,this.name=""}loadIsCurrent(e,t){return this.isConnected&&this.loadEpoch===e&&this.api===t}subscriptionFailed(e,t,i){this.loadIsCurrent(t,i)&&(this.error=e.message,this.loading=!1,queueMicrotask(()=>{this.loadIsCurrent(t,i)&&this.stopSubscriptions()}))}stopSubscriptions(){this.unsubscribeLibrary?.(),this.unsubscribeDeployments?.(),this.unsubscribeLibrary=void 0,this.unsubscribeDeployments=void 0}deviceIdFromPath(){const e=window.location.pathname.match(/\/ha-govee-led-ble\/editor\/([^/]+)/);return e?.[1]?decodeURIComponent(e[1]):void 0}async libraryChanged(e){const t=this.library.library_revision;if(e.library_revision<t||(this.library=e,!this.currentItem||e.library_revision===t))return;const i=e.items.find(a=>a.id===this.currentItem?.id);if(!i){if(this.deletingItemId===this.currentItem.id)return;this.notice="This effect was removed from the shared library.";return}if(i.revision===this.currentItem.revision)return;if(this.dirty){this.notice="This effect changed elsewhere. Reload it before saving.";return}const r=this.beginEditorTransition();await this.selectItem(i.id,r)&&this.editorTransitionIsCurrent(r)&&(this.notice="Loaded the latest shared revision.")}sceneLibraryItemSaved(e){this.library={library_revision:e.detail.library_revision,items:Li(this.library.items,e.detail.item)}}sceneTemplateSelected(e){!this.isAdmin||e.detail.config_entry_id!==this.selectedDeviceId||(this.beginEditorTransition(),this.currentItem=e.detail.item,this.templateSourceLabel=void 0,this.customCopyStarted=e.detail.item===void 0,this.name=e.detail.name.trim()||"Layered scene template",this.content=oe(e.detail.content),this.savedBaseline=e.detail.item?.content.kind==="scene_layered"?Y(e.detail.item.name,e.detail.item.content):void 0,this.section="custom",this.customEffectCategory="all",this.customTemplateSelection=void 0,this.notice=void 0)}sceneLibraryItemDeleteRequested(e){const{returnFocus:t,...i}=e.detail;this.requestDelete(i,t)}backToScenes(){this.beginEditorTransition(),this.section="scenes",this.notice=void 0}beginEditorTransition(){return this.editorTransitionEpoch+=1,this.saveNameDialogOpen=!1,this.saveNameError=void 0,this.saveNameReturnFocus=void 0,this.editorTransitionEpoch}editorTransitionIsCurrent(e){return e===this.editorTransitionEpoch}deviceChanged(e){const t=this.beginEditorTransition();if(this.selectedDeviceId=e.target.value,this.activeOperationId=void 0,this.activeOperationId=this.latestDeployment(ht)?.operation_id,this.notice=void 0,this.section==="video"&&!this.videoAvailable){this.section="scenes";return}if(!this.customEffectsAvailable){this.section="scenes";return}if(this.customEffectCategoryAvailable(this.customEffectCategory)||(this.customEffectCategory="all"),this.section==="custom"&&!this.effectContentAvailable(this.content)){const i=this.customEffectEntries.filter(n=>n.kind!=="saved"),r=this.customEffectCategory==="all"?void 0:this.customEffectCategory==="music"?i.find(n=>n.kind==="music"&&n.mode!==void 0):i[0];r?this.selectCustomEffectEntry(r):this.openDefaultAvailableTemplate(t)}if(this.section==="video"&&this.content.kind==="video_profile"&&this.content.model!==this.selectedModel){const i=this.modelCatalogue?.video_modes[0];i&&this.openVideoTemplate(i.id,i.label)}}switchCustomMode(e){if(!this.isAdmin||!this.customCatalogue||!Je(this.content)||this.content.kind===e)return;const t=this.content;if(e==="h617a_single"&&t.kind==="h617a_multi"&&t.effects.length>1)return;let i;if(e==="h617a_painted"){const r=t.kind==="h617a_painted"?this.activePaintBrush:t.palette[0]?[...t.palette[0]]:[47,111,237];i={...ye(),speed:t.speed,groups:[{fill:[...r],segments:Array.from({length:Nt},(n,a)=>a)}]},t.kind!=="h617a_painted"&&(this.paintBrushes=bn(t.palette),this.selectedPaintBrush=0),this.brushUsesBackground=!1}else if(t.kind==="h617a_painted"){const r=vn(t);if(e==="h617a_single"){const n=ie(e,this.customCatalogue);i={...n,speed:t.speed,palette:r.length?r:n.palette}}else{const n=ie("h617a_multi",this.customCatalogue);i={...n,speed:t.speed,palette:r.length?r:n.palette}}}else if(e==="h617a_multi"&&t.kind==="h617a_single")i={kind:e,effects:[{family:t.family,variant:t.variant}],speed:t.speed,palette:t.palette.map(r=>[...r])};else if(e==="h617a_single"&&t.kind==="h617a_multi"){const r=t.effects[0];i={kind:e,family:r.family,variant:r.variant,speed:t.speed,palette:t.palette.map(n=>[...n])}}else return;this.content=i,/^New (Paint|Painted|Single|Multi) effect$/.test(this.name)&&(this.name=`New ${Ai(e)} effect`),this.notice=this.applyAvailabilityNotice()}newEffect(e,t,i){t===void 0&&this.beginEditorTransition(),!(!this.api||!this.isAdmin||!this.customEffectKindAvailable(e)||e!=="advanced"&&!this.modelCatalogue)&&(this.currentItem=void 0,this.templateSourceLabel=i?.templateLabel,this.customCopyStarted=!1,this.customTemplateSelection=e==="advanced"?void 0:i?.selectionIdentity??(e==="h617a_painted"?"template:paint":void 0),this.name=i?.name??`New ${Ai(e)} effect`,this.content=i?.content??(e==="advanced"?pt():e==="palette_diy"?xt(this.modelCatalogue,this.selectedModel):ie(e,this.modelCatalogue)),e==="h617a_painted"&&(this.brushUsesBackground=!1),this.savedBaseline=void 0,this.notice=this.applyAvailabilityNotice())}renderEditorDeleteButton(){return!this.isAdmin||!this.currentItem?d:o`
      <button
        class="danger"
        type="button"
        ?disabled=${this.deletingItemId!==void 0||this.saving||this.applying}
        @click=${e=>this.requestDelete({id:this.currentItem.id,revision:this.currentItem.revision,name:this.currentItem.name},e.currentTarget)}
      >
        ${this.deletingCurrentItem?"Deleting...":"Delete"}
      </button>
    `}requestDelete(e,t){!this.api||!this.isAdmin||this.deletingItemId!==void 0||this.saving||this.applying||(this.deleteCandidate={...e},this.deleteReturnFocus=t,this.notice=void 0,this.updateComplete.then(()=>{this.shadowRoot?.querySelector(".delete-dialog .secondary")?.focus()}))}cancelDelete(){const e=this.deleteReturnFocus;this.deleteCandidate=void 0,this.deleteReturnFocus=void 0,this.updateComplete.then(()=>{e?.isConnected&&e.focus()})}deleteDialogKeyDown(e){if(e.key==="Tab"){this.trapDialogFocus(e);return}e.key==="Escape"&&(e.preventDefault(),this.cancelDelete())}async confirmDelete(){const e=this.deleteCandidate,t=this.api;if(!e||!t||!this.isAdmin||this.deletingItemId!==void 0)return;const i=this.library.library_revision;this.deleteCandidate=void 0,this.deleteReturnFocus=void 0,this.deletingItemId=e.id,this.notice=void 0;try{const r=await t.deleteItem(e,i);r>=this.library.library_revision&&(this.library={library_revision:r,items:this.library.items.filter(n=>n.id!==e.id)}),this.currentItem?.id===e.id&&this.currentItem.revision===e.revision&&(this.beginEditorTransition(),this.currentItem=void 0,this.templateSourceLabel=void 0,this.customCopyStarted=!1,this.customTemplateSelection=void 0,this.name="",this.content=ye(),this.savedBaseline=void 0),this.notice=`Deleted ${e.name}.`}catch(r){const n=Ct(r)==="conflict";if(this.notice=n?"This effect or library changed elsewhere. Reload before deleting.":`Delete failed: ${N(r)}`,n)try{const a=await t.library();a.library_revision>=this.library.library_revision&&(this.library=a)}catch(a){this.notice+=` Library refresh failed: ${N(a)}`}}finally{this.deletingItemId=void 0,this.focusActiveSectionIfNeeded()}}async selectItem(e,t){const i=t??this.beginEditorTransition();if(!this.api)return!1;try{const r=await this.api.item(e);return this.editorTransitionIsCurrent(i)?r.content.kind==="opaque"?(this.currentItem=r,this.templateSourceLabel=void 0,this.customCopyStarted=!1,this.customTemplateSelection=void 0,this.name=r.name,this.content=mn(r.content),this.savedBaseline=void 0,this.notice="This effect definition is preserved, but this editor cannot change or apply it.",!0):re(r.content)?(this.currentItem=r,this.templateSourceLabel=void 0,this.customCopyStarted=!1,this.customTemplateSelection=void 0,this.name=r.name,this.content=Ke(r.content),r.content.kind==="h617a_painted"&&(this.brushUsesBackground=!1),this.savedBaseline=Y(r.name,r.content),this.notice=this.applyAvailabilityNotice(),!0):(this.notice="This item cannot be edited here.",!1):!1}catch(r){return this.editorTransitionIsCurrent(i)&&(this.notice=N(r)),!1}}nameChanged(e){this.name=e.target.value}requestSave(e){if(this.currentItem){this.save();return}!this.isAdmin||!this.dirty||this.saving||this.applying||this.deletingCurrentItem||(this.saveNameValue=this.name,this.saveNameError=void 0,this.saveNameReturnFocus=e.currentTarget,this.saveNameDialogOpen=!0,this.updateComplete.then(()=>{const t=this.shadowRoot?.querySelector(".save-dialog input");t?.focus(),t?.select()}))}cancelSaveName(){const e=this.saveNameReturnFocus;this.saveNameDialogOpen=!1,this.saveNameError=void 0,this.saveNameReturnFocus=void 0,this.updateComplete.then(()=>{e?.isConnected&&e.focus()})}saveNameDialogKeyDown(e){if(e.key==="Tab"){this.trapDialogFocus(e);return}e.key==="Escape"&&(e.preventDefault(),this.cancelSaveName())}trapDialogFocus(e){const t=e.currentTarget,i=Array.from(t.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')).filter(h=>h.getClientRects().length>0),r=i[0],n=i[i.length-1];if(!r||!n)return;const a=t.getRootNode(),l=a instanceof ShadowRoot?a.activeElement:document.activeElement,c=l instanceof HTMLElement&&i.includes(l);if(e.shiftKey){(l===r||!c)&&(e.preventDefault(),n.focus());return}(l===n||!c)&&(e.preventDefault(),r.focus())}focusActiveSectionIfNeeded(){this.updateComplete.then(()=>{this.shadowRoot?.activeElement||this.shadowRoot?.querySelector('.primary-nav .selector[aria-current="page"]')?.focus()})}syncModalScrollLock(){if(!this.modalOpen){this.releaseModalScrollLock();return}this.modalScrollLock||(this.modalScrollLock={bodyOverflow:document.body.style.overflow,documentOverflow:document.documentElement.style.overflow},document.body.style.overflow="hidden",document.documentElement.style.overflow="hidden")}releaseModalScrollLock(){this.modalScrollLock&&(document.body.style.overflow=this.modalScrollLock.bodyOverflow,document.documentElement.style.overflow=this.modalScrollLock.documentOverflow,this.modalScrollLock=void 0)}confirmNamedSave(e){e.preventDefault();const t=this.saveNameValue.trim();if(!t){this.saveNameError="Enter an effect name.",this.updateComplete.then(()=>{this.shadowRoot?.querySelector(".save-dialog input")?.focus()});return}this.name=t,this.saveNameDialogOpen=!1,this.saveNameError=void 0,this.saveNameReturnFocus=void 0,this.save()}editTemplate(){this.prepareTemplateEdit()}prepareTemplateEdit(){const e=this.templateSourceLabel;return e?!this.isAdmin||this.saving||this.applying||this.deletingCurrentItem?!1:(this.beginEditorTransition(),this.templateSourceLabel=void 0,this.customTemplateSelection=void 0,this.customCopyStarted=!0,this.name=`Custom ${e}`,this.savedBaseline=void 0,!0):!0}paintBrushesChanged(e){this.paintBrushes=e.detail.palette.map(t=>[...t]),this.selectedPaintBrush=Math.max(0,Math.min(this.selectedPaintBrush,this.paintBrushes.length-1)),this.brushUsesBackground=!1}paintBrushSelected(e){this.selectedPaintBrush=e.detail.index,this.brushUsesBackground=!1}get activePaintBrush(){return[...this.paintBrushes[this.selectedPaintBrush]??this.paintBrushes[0]??[47,111,237]]}backgroundChanged(e){this.updateContent({background:[...e.detail.colour]})}singleEffectChanged(e){if(!this.customCatalogue||this.currentItem?.content.kind==="opaque")return;const t=e.target.value;if(this.currentItem&&(this.content.kind==="h617a_painted"&&t!=="paint"||this.content.kind==="h617a_single"&&t==="paint"))return;const i=this.templateSourceLabel!==void 0||this.customTemplateSelection!==void 0;if(t==="paint"){this.content.kind!=="h617a_painted"&&this.switchCustomMode("h617a_painted"),i&&(this.customTemplateSelection="template:paint"),this.updateGeneratedEffectName("Paint");return}const r=this.modelCatalogue?.effects.find(a=>a.id===t),n=r?.variations[0];!r||!n||(this.content.kind==="h617a_painted"&&this.switchCustomMode("h617a_single"),!(this.content.kind!=="h617a_single"&&this.content.kind!=="palette_diy")&&(this.content={...this.content,family:r.family,variant:n.variant},i&&(this.customTemplateSelection=`template:single:${r.family}:${n.variant}`),this.updateGeneratedEffectName(r.label)))}paintedEffectVariationChanged(e){this.content.kind==="h617a_painted"&&this.updateContent({effect:e.target.value})}updateGeneratedEffectName(e){if(this.templateSourceLabel){this.templateSourceLabel=e,this.name=e;return}!this.currentItem&&/^New .+ effect$/.test(this.name)&&(this.name=`New ${e} effect`)}setSegmentColour(e){if(this.content.kind!=="h617a_painted")return;const t=Rt(this.content);t[e]=this.brushUsesBackground?[...this.content.background]:this.activePaintBrush,this.content={...this.content,groups:Ii(t,this.content.background)}}paintAll(){if(this.content.kind!=="h617a_painted")return;const e=this.brushUsesBackground?this.content.background:this.activePaintBrush;this.content={...this.content,groups:Ii(Array.from({length:Nt},()=>[...e]),this.content.background)}}resetPaint(){this.content.kind==="h617a_painted"&&(this.content={...this.content,groups:[]})}updateContent(e){this.content.kind==="h617a_painted"&&(this.content={...this.content,...e})}async save(){if(!this.api||!this.isAdmin||!this.dirty||this.saving||this.applying||this.deletingCurrentItem||!re(this.content))return;const e=this.api,t=this.name.trim();if(!t){this.notice="Give this effect a name before saving.";return}const i=this.beginEditorTransition(),r=this.currentItem,n=Ke(this.content),a=this.library.library_revision;this.saving=!0,this.notice=void 0;try{const l=r?await e.updateItem(r,t,n,a):await e.createItem(t,n,a);if(!re(l.item.content))throw new Error("The saved effect returned an unsupported definition.");const c=l.item.content;l.library_revision>=this.library.library_revision&&(this.library={library_revision:l.library_revision,items:Li(this.library.items,l.item)}),this.editorTransitionIsCurrent(i)&&Di(this.currentItem,r)&&re(this.content)&&Y(this.name,this.content)===Y(t,n)&&(this.currentItem=l.item,this.customCopyStarted=!1,this.customTemplateSelection=void 0,this.name=l.item.name,this.content=Ke(c),this.savedBaseline=Y(this.name,this.content),r&&c.kind==="scene_layered"&&(this.savedSceneSelection=l.item)),this.editorTransitionIsCurrent(i)&&Di(this.currentItem,l.item)&&re(this.content)&&Y(this.name,this.content)===Y(l.item.name,c)&&(this.notice="Saved.")}catch(l){if(Ct(l)==="conflict"){const c="This effect or library changed elsewhere. Reload before saving.";this.editorTransitionIsCurrent(i)&&(this.notice=c);try{const h=await e.library();h.library_revision>=this.library.library_revision&&(this.library=h)}catch(h){this.editorTransitionIsCurrent(i)&&(this.notice=`${c} Library refresh failed: `+N(h))}}else this.editorTransitionIsCurrent(i)&&(this.notice=`Save failed: ${N(l)}`)}finally{this.saving=!1}}async apply(){if(!this.api||!this.canApply||!kt(this.content)||!this.selectedDeviceId)return;const e=this.name.trim(),t=this.selectedDeviceId,i=this.editorTransitionEpoch;this.activeOperationId=void 0,this.applying=!0,this.notice=void 0;try{const r=!this.dirty&&this.currentItem?await this.api.applySaved(t,this.currentItem):await this.api.applySnapshot(t,e,this.content);if(i!==this.editorTransitionEpoch||t!==this.selectedDeviceId)return;this.activeOperationId=r.operation_id,this.deployments=[r,...this.deployments.filter(n=>n.operation_id!==r.operation_id)]}catch(r){i===this.editorTransitionEpoch&&t===this.selectedDeviceId&&(this.notice=`Apply failed: ${N(r)}`)}finally{this.applying=!1}}applyAvailabilityNotice(){if(this.selectedDeviceId&&!this.selectedDevice)return"This device is temporarily unavailable in Home Assistant. Apply is disabled until it is loaded."}latestDeployment(e){return[...this.deployments].filter(t=>t.config_entry_id===this.selectedDeviceId&&e.includes(t.phase)).sort((t,i)=>i.updated_at.localeCompare(t.updated_at))[0]}static{this.styles=[M,ce,Vt,Fi,K,Ui,Hi,Kt,qi,k`
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
      color: var(--studio-blue);
      background: color-mix(
        in srgb,
        var(--studio-blue) 13%,
        var(--primary-background-color, #fff)
      );
      font-weight: 650;
    }

    .library .new-effect-action:hover {
      background: color-mix(
        in srgb,
        var(--studio-blue) 20%,
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
  `]}}x([p({attribute:!1})],y.prototype,"hass");x([p({attribute:!1})],y.prototype,"panel");x([p({type:Boolean})],y.prototype,"showDevicePicker");x([m()],y.prototype,"loading");x([m()],y.prototype,"error");x([m()],y.prototype,"notice");x([m()],y.prototype,"devices");x([m()],y.prototype,"selectedDeviceId");x([m()],y.prototype,"section");x([m()],y.prototype,"customEffectCategory");x([m()],y.prototype,"customTemplateSelection");x([m()],y.prototype,"templateSourceLabel");x([m()],y.prototype,"customCopyStarted");x([m()],y.prototype,"library");x([m()],y.prototype,"customCatalogue");x([m()],y.prototype,"currentItem");x([m()],y.prototype,"savedSceneSelection");x([m()],y.prototype,"name");x([m()],y.prototype,"content");x([m()],y.prototype,"paintBrushes");x([m()],y.prototype,"selectedPaintBrush");x([m()],y.prototype,"brushUsesBackground");x([m()],y.prototype,"saving");x([m()],y.prototype,"saveNameDialogOpen");x([m()],y.prototype,"saveNameValue");x([m()],y.prototype,"saveNameError");x([m()],y.prototype,"applying");x([m()],y.prototype,"deleteCandidate");x([m()],y.prototype,"deletingItemId");x([m()],y.prototype,"deployments");x([m()],y.prototype,"activeOperationId");function ye(){return{kind:"h617a_painted",effect:"clockwise",speed:50,brightness:100,background:[0,0,0],groups:[]}}function ie(s,e){if(s==="h617a_painted")return ye();const t=s==="h617a_multi"?e.effects.find(n=>n.supports_multi):e.effects[0];if(!t)throw new Error("The custom-effect catalogue has no compatible effects.");const i=t.variations[0],r={family:t.family,variant:i.variant};return s==="h617a_single"?{kind:s,...r,speed:50,palette:Re()}:{kind:s,effects:[r],speed:50,palette:Re()}}function xt(s,e,t,i){if(e!=="H617A"&&e!=="H6199")throw new Error(`Unsupported custom-effect model ${e}.`);const r=s.effects.find(n=>n.family===t)??s.effects[0];if(!r)throw new Error("The custom-effect catalogue has no compatible effects.");return{kind:"palette_diy",model:e,family:t??r.family,variant:i??r.variations[0].variant,speed:50,palette:Re()}}function pn(s){return{kind:"video_profile",model:"H6199",mode:s==="game"?"game":"movie",full_screen:!0,saturation:50,sound_effects:!1,sound_effects_softness:50,white_balance_position:17,relative_brightness:{left:100,top:100,right:100,bottom:100},blank_screen:!1}}function hn(s){return{...s,background:[...s.background],groups:s.groups.map(e=>({fill:[...e.fill],segments:[...e.segments]}))}}function us(s){return s.kind==="h617a_painted"?hn(s):s.kind==="h617a_single"?{...s,palette:s.palette.map(e=>[...e])}:{...s,effects:s.effects.map(e=>({...e})),palette:s.palette.map(e=>[...e])}}function ps(s){return{...s,palette:s.palette.map(e=>[...e])}}function hs(s){return{...s,palette:s.palette.map(e=>[...e])}}function ms(s){return{...s,effect:{layers:$e({layers:s.effect.layers}).layers}}}function fs(s){return{...s,colour:s.colour?[...s.colour]:null,parameters:structuredClone(s.parameters)}}function gs(s){return{...s,relative_brightness:{...s.relative_brightness}}}function Ke(s){return s.kind==="advanced"?$e(s):s.kind==="scene_layered"?oe(s):s.kind==="workshop"?ms(s):s.kind==="palette_diy"?ps(s):s.kind==="special_diy"?hs(s):s.kind==="music_profile"?fs(s):s.kind==="video_profile"?gs(s):us(s)}function mn(s){return{...s,body:structuredClone(s.body)}}function fn(s){return s.kind==="advanced"?s:{kind:"advanced",layers:s.effect.layers}}function gn(s,e){return s.kind==="advanced"?$e(e):s.kind==="workshop"?{...ms(s),effect:{layers:$e(e).layers}}:{...oe(s),effect:{layers:$e(e).layers}}}function Re(){return[[255,0,0],[255,127,0],[255,255,0],[0,255,0],[0,0,255],[0,255,255],[139,0,255]]}function bn(s){const e=[];for(const t of[...s,...Re()])if(e.some(i=>tt(i,t))||e.push([...t]),e.length===8)break;return e}function Rt(s){const e=Array.from({length:Nt},()=>[...s.background]);for(const t of s.groups)for(const i of t.segments)e[i]=[...t.fill];return e}function Ii(s,e){const t=new Map;return s.forEach((i,r)=>{if(tt(i,e))return;const n=i.join(","),a=t.get(n);a?a.segments.push(r):t.set(n,{fill:[...i],segments:[r]})}),[...t.values()]}function vn(s){const e=[];for(const t of Rt(s))if(!tt(t,s.background)&&!e.some(i=>tt(i,t))&&e.push([...t]),e.length===8)break;return e}function tt(s,e){return s[0]===e[0]&&s[1]===e[1]&&s[2]===e[2]}function Y(s,e){return JSON.stringify({name:s.trim(),content:e})}function ei(s){return s==="h617a_painted"||s==="h617a_single"||s==="h617a_multi"}function Je(s){return typeof s=="object"&&s!==null&&"kind"in s&&ei(s.kind)}function kt(s){return re(s)}function re(s){return Je(s)||typeof s=="object"&&s!==null&&"kind"in s&&(ct(s.kind)||s.kind==="palette_diy"||s.kind==="special_diy"||s.kind==="music_profile"||s.kind==="video_profile")}function ct(s){return s==="advanced"||s==="scene_layered"||s==="workshop"}function je(s){return ct(s.kind)}function yn(s){return ei(s)||ct(s)||s==="palette_diy"||s==="special_diy"||s==="music_profile"||s==="video_profile"||s==="scene_builtin"||s==="scene_palette"}function Ai(s){switch(s){case"h617a_painted":return"Paint";case"h617a_single":return"Single";case"h617a_multi":return"Multi";case"advanced":return"Layered";case"palette_diy":return"Single";case"special_diy":return"Special DIY";case"workshop":return"Workshop";default:return"Custom"}}function wt(s){return ei(s)||ct(s)||s==="palette_diy"||s==="special_diy"||s==="music_profile"||!yn(s)}function Pi(s,e){const t=e==="H6199"?["special_diy","palette_diy","workshop","music_profile","advanced","scene_layered"]:["h617a_painted","h617a_single","h617a_multi","music_profile","workshop","advanced","scene_layered"],i=t.indexOf(s);return i===-1?t.length:i}function _n(s){return s==="h617a_multi"?"multi-layer":s==="music_profile"?"music":s==="h617a_painted"||s==="h617a_single"||s==="palette_diy"||s==="special_diy"?s==="special_diy"?"special-diy":"single-layer":"advanced"}function Di(s,e){return s?.id===e?.id&&s?.revision===e?.revision}function Li(s,e){const t=$n(e);return[...s.filter(i=>i.id!==e.id),{id:e.id,revision:e.revision,name:e.name,kind:e.content.kind==="opaque"?e.content.source_kind:e.content.kind,...t?{model:t}:{},...e.content.kind==="scene_builtin"||e.content.kind==="scene_palette"||e.content.kind==="scene_layered"?{template:e.content.template}:{}}].sort((i,r)=>i.name.localeCompare(r.name))}function $n(s){const e=s.content;return e.kind==="palette_diy"||e.kind==="special_diy"||e.kind==="workshop"||e.kind==="music_profile"||e.kind==="video_profile"?e.model:e.kind==="h617a_painted"||e.kind==="h617a_single"||e.kind==="h617a_multi"?"H617A":e.kind==="scene_builtin"||e.kind==="scene_palette"||e.kind==="scene_layered"?Ti(e.template.sku):Ti(s.target_hint?.model)}function Ti(s){return s==="H617A"||s==="H6199"?s:void 0}customElements.get("ha-govee-led-ble-editor")||customElements.define("ha-govee-led-ble-editor",y);
