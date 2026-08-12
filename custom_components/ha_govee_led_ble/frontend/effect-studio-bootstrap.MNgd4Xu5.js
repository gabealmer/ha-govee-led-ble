const Be=globalThis,pt=Be.ShadowRoot&&(Be.ShadyCSS===void 0||Be.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,ut=Symbol(),wt=new WeakMap;let Qt=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==ut)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(pt&&e===void 0){const i=t!==void 0&&t.length===1;i&&(e=wt.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&wt.set(t,e))}return e}toString(){return this.cssText}};const wi=s=>new Qt(typeof s=="string"?s:s+"",void 0,ut),le=(s,...e)=>{const t=s.length===1?s[0]:e.reduce((i,r,n)=>i+(a=>{if(a._$cssResult$===!0)return a.cssText;if(typeof a=="number")return a;throw Error("Value passed to 'css' function must be a 'css' function result: "+a+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+s[n+1],s[0]);return new Qt(t,s,ut)},xi=(s,e)=>{if(pt)s.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const i=document.createElement("style"),r=Be.litNonce;r!==void 0&&i.setAttribute("nonce",r),i.textContent=t.cssText,s.appendChild(i)}},xt=pt?s=>s:s=>s instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return wi(t)})(s):s;const{is:ki,defineProperty:Si,getOwnPropertyDescriptor:Ci,getOwnPropertyNames:Ii,getOwnPropertySymbols:Ei,getPrototypeOf:Ai}=Object,Ve=globalThis,kt=Ve.trustedTypes,Pi=kt?kt.emptyScript:"",Di=Ve.reactiveElementPolyfillSupport,ye=(s,e)=>s,Ue={toAttribute(s,e){switch(e){case Boolean:s=s?Pi:null;break;case Object:case Array:s=s==null?s:JSON.stringify(s)}return s},fromAttribute(s,e){let t=s;switch(e){case Boolean:t=s!==null;break;case Number:t=s===null?null:Number(s);break;case Object:case Array:try{t=JSON.parse(s)}catch{t=null}}return t}},ht=(s,e)=>!ki(s,e),St={attribute:!0,type:String,converter:Ue,reflect:!1,useDefault:!1,hasChanged:ht};Symbol.metadata??=Symbol("metadata"),Ve.litPropertyMetadata??=new WeakMap;let ie=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=St){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),r=this.getPropertyDescriptor(e,i,t);r!==void 0&&Si(this.prototype,e,r)}}static getPropertyDescriptor(e,t,i){const{get:r,set:n}=Ci(this.prototype,e)??{get(){return this[t]},set(a){this[t]=a}};return{get:r,set(a){const d=r?.call(this);n?.call(this,a),this.requestUpdate(e,d,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??St}static _$Ei(){if(this.hasOwnProperty(ye("elementProperties")))return;const e=Ai(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(ye("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(ye("properties"))){const t=this.properties,i=[...Ii(t),...Ei(t)];for(const r of i)this.createProperty(r,t[r])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[i,r]of t)this.elementProperties.set(i,r)}this._$Eh=new Map;for(const[t,i]of this.elementProperties){const r=this._$Eu(t,i);r!==void 0&&this._$Eh.set(r,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const r of i)t.unshift(xt(r))}else e!==void 0&&t.push(xt(e));return t}static _$Eu(e,t){const i=t.attribute;return i===!1?void 0:typeof i=="string"?i:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return xi(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,i);if(r!==void 0&&i.reflect===!0){const n=(i.converter?.toAttribute!==void 0?i.converter:Ue).toAttribute(t,i.type);this._$Em=e,n==null?this.removeAttribute(r):this.setAttribute(r,n),this._$Em=null}}_$AK(e,t){const i=this.constructor,r=i._$Eh.get(e);if(r!==void 0&&this._$Em!==r){const n=i.getPropertyOptions(r),a=typeof n.converter=="function"?{fromAttribute:n.converter}:n.converter?.fromAttribute!==void 0?n.converter:Ue;this._$Em=r;const d=a.fromAttribute(t,n.type);this[r]=d??this._$Ej?.get(r)??d,this._$Em=null}}requestUpdate(e,t,i,r=!1,n){if(e!==void 0){const a=this.constructor;if(r===!1&&(n=this[e]),i??=a.getPropertyOptions(e),!((i.hasChanged??ht)(n,t)||i.useDefault&&i.reflect&&n===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,i))))return;this.C(e,t,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:r,wrapped:n},a){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),n!==!0||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),r===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[r,n]of this._$Ep)this[r]=n;this._$Ep=void 0}const i=this.constructor.elementProperties;if(i.size>0)for(const[r,n]of i){const{wrapped:a}=n,d=this[r];a!==!0||this._$AL.has(r)||d===void 0||this.C(r,void 0,n,d)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(i=>i.hostUpdate?.()),this.update(t)):this._$EM()}catch(i){throw e=!1,this._$EM(),i}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};ie.elementStyles=[],ie.shadowRootOptions={mode:"open"},ie[ye("elementProperties")]=new Map,ie[ye("finalized")]=new Map,Di?.({ReactiveElement:ie}),(Ve.reactiveElementVersions??=[]).push("2.1.2");const ft=globalThis,Ct=s=>s,ze=ft.trustedTypes,It=ze?ze.createPolicy("lit-html",{createHTML:s=>s}):void 0,Zt="$lit$",q=`lit$${Math.random().toFixed(9).slice(2)}$`,ei="?"+q,Ti=`<${ei}>`,G=document,$e=()=>G.createComment(""),_e=s=>s===null||typeof s!="object"&&typeof s!="function",mt=Array.isArray,Li=s=>mt(s)||typeof s?.[Symbol.iterator]=="function",We=`[ 	
\f\r]`,he=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Et=/-->/g,At=/>/g,H=RegExp(`>|${We}(?:([^\\s"'>=/]+)(${We}*=${We}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Pt=/'/g,Dt=/"/g,ti=/^(?:script|style|textarea|title)$/i,Mi=s=>(e,...t)=>({_$litType$:s,strings:e,values:t}),o=Mi(1),oe=Symbol.for("lit-noChange"),l=Symbol.for("lit-nothing"),Tt=new WeakMap,K=G.createTreeWalker(G,129);function ii(s,e){if(!mt(s)||!s.hasOwnProperty("raw"))throw Error("invalid template strings array");return It!==void 0?It.createHTML(e):e}const Ni=(s,e)=>{const t=s.length-1,i=[];let r,n=e===2?"<svg>":e===3?"<math>":"",a=he;for(let d=0;d<t;d++){const c=s[d];let p,u,h=-1,y=0;for(;y<c.length&&(a.lastIndex=y,u=a.exec(c),u!==null);)y=a.lastIndex,a===he?u[1]==="!--"?a=Et:u[1]!==void 0?a=At:u[2]!==void 0?(ti.test(u[2])&&(r=RegExp("</"+u[2],"g")),a=H):u[3]!==void 0&&(a=H):a===H?u[0]===">"?(a=r??he,h=-1):u[1]===void 0?h=-2:(h=a.lastIndex-u[2].length,p=u[1],a=u[3]===void 0?H:u[3]==='"'?Dt:Pt):a===Dt||a===Pt?a=H:a===Et||a===At?a=he:(a=H,r=void 0);const D=a===H&&s[d+1].startsWith("/>")?" ":"";n+=a===he?c+Ti:h>=0?(i.push(p),c.slice(0,h)+Zt+c.slice(h)+q+D):c+q+(h===-2?d:D)}return[ii(s,n+(s[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),i]};class we{constructor({strings:e,_$litType$:t},i){let r;this.parts=[];let n=0,a=0;const d=e.length-1,c=this.parts,[p,u]=Ni(e,t);if(this.el=we.createElement(p,i),K.currentNode=this.el.content,t===2||t===3){const h=this.el.content.firstChild;h.replaceWith(...h.childNodes)}for(;(r=K.nextNode())!==null&&c.length<d;){if(r.nodeType===1){if(r.hasAttributes())for(const h of r.getAttributeNames())if(h.endsWith(Zt)){const y=u[a++],D=r.getAttribute(h).split(q),Q=/([.?@])?(.*)/.exec(y);c.push({type:1,index:n,name:Q[2],strings:D,ctor:Q[1]==="."?Ri:Q[1]==="?"?Bi:Q[1]==="@"?qi:Ke}),r.removeAttribute(h)}else h.startsWith(q)&&(c.push({type:6,index:n}),r.removeAttribute(h));if(ti.test(r.tagName)){const h=r.textContent.split(q),y=h.length-1;if(y>0){r.textContent=ze?ze.emptyScript:"";for(let D=0;D<y;D++)r.append(h[D],$e()),K.nextNode(),c.push({type:2,index:++n});r.append(h[y],$e())}}}else if(r.nodeType===8)if(r.data===ei)c.push({type:2,index:n});else{let h=-1;for(;(h=r.data.indexOf(q,h+1))!==-1;)c.push({type:7,index:n}),h+=q.length-1}n++}}static createElement(e,t){const i=G.createElement("template");return i.innerHTML=e,i}}function de(s,e,t=s,i){if(e===oe)return e;let r=i!==void 0?t._$Co?.[i]:t._$Cl;const n=_e(e)?void 0:e._$litDirective$;return r?.constructor!==n&&(r?._$AO?.(!1),n===void 0?r=void 0:(r=new n(s),r._$AT(s,t,i)),i!==void 0?(t._$Co??=[])[i]=r:t._$Cl=r),r!==void 0&&(e=de(s,r._$AS(s,e.values),r,i)),e}class Oi{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,r=(e?.creationScope??G).importNode(t,!0);K.currentNode=r;let n=K.nextNode(),a=0,d=0,c=i[0];for(;c!==void 0;){if(a===c.index){let p;c.type===2?p=new Ce(n,n.nextSibling,this,e):c.type===1?p=new c.ctor(n,c.name,c.strings,this,e):c.type===6&&(p=new Fi(n,this,e)),this._$AV.push(p),c=i[++d]}a!==c?.index&&(n=K.nextNode(),a++)}return K.currentNode=G,r}p(e){let t=0;for(const i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class Ce{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,r){this.type=2,this._$AH=l,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=de(this,e,t),_e(e)?e===l||e==null||e===""?(this._$AH!==l&&this._$AR(),this._$AH=l):e!==this._$AH&&e!==oe&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Li(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==l&&_e(this._$AH)?this._$AA.nextSibling.data=e:this.T(G.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,r=typeof i=="number"?this._$AC(e):(i.el===void 0&&(i.el=we.createElement(ii(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===r)this._$AH.p(t);else{const n=new Oi(r,this),a=n.u(this.options);n.p(t),this.T(a),this._$AH=n}}_$AC(e){let t=Tt.get(e.strings);return t===void 0&&Tt.set(e.strings,t=new we(e)),t}k(e){mt(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,r=0;for(const n of e)r===t.length?t.push(i=new Ce(this.O($e()),this.O($e()),this,this.options)):i=t[r],i._$AI(n),r++;r<t.length&&(this._$AR(i&&i._$AB.nextSibling,r),t.length=r)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const i=Ct(e).nextSibling;Ct(e).remove(),e=i}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}}class Ke{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,r,n){this.type=1,this._$AH=l,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=n,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=l}_$AI(e,t=this,i,r){const n=this.strings;let a=!1;if(n===void 0)e=de(this,e,t,0),a=!_e(e)||e!==this._$AH&&e!==oe,a&&(this._$AH=e);else{const d=e;let c,p;for(e=n[0],c=0;c<n.length-1;c++)p=de(this,d[i+c],t,c),p===oe&&(p=this._$AH[c]),a||=!_e(p)||p!==this._$AH[c],p===l?e=l:e!==l&&(e+=(p??"")+n[c+1]),this._$AH[c]=p}a&&!r&&this.j(e)}j(e){e===l?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class Ri extends Ke{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===l?void 0:e}}class Bi extends Ke{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==l)}}class qi extends Ke{constructor(e,t,i,r,n){super(e,t,i,r,n),this.type=5}_$AI(e,t=this){if((e=de(this,e,t,0)??l)===oe)return;const i=this._$AH,r=e===l&&i!==l||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,n=e!==l&&(i===l||r);r&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class Fi{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){de(this,e)}}const Ui=ft.litHtmlPolyfillSupport;Ui?.(we,Ce),(ft.litHtmlVersions??=[]).push("3.3.3");const zi=(s,e,t)=>{const i=t?.renderBefore??e;let r=i._$litPart$;if(r===void 0){const n=t?.renderBefore??null;i._$litPart$=r=new Ce(e.insertBefore($e(),n),n,void 0,t??{})}return r._$AI(s),r};const gt=globalThis;class L extends ie{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=zi(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return oe}}L._$litElement$=!0,L.finalized=!0,gt.litElementHydrateSupport?.({LitElement:L});const Hi=gt.litElementPolyfillSupport;Hi?.({LitElement:L});(gt.litElementVersions??=[]).push("4.2.2");const ji={attribute:!0,type:String,converter:Ue,reflect:!1,hasChanged:ht},Vi=(s=ji,e,t)=>{const{kind:i,metadata:r}=t;let n=globalThis.litPropertyMetadata.get(r);if(n===void 0&&globalThis.litPropertyMetadata.set(r,n=new Map),i==="setter"&&((s=Object.create(s)).wrapped=!0),n.set(t.name,s),i==="accessor"){const{name:a}=t;return{set(d){const c=e.get.call(this);e.set.call(this,d),this.requestUpdate(a,c,s,!0,d)},init(d){return d!==void 0&&this.C(a,void 0,s,d),d}}}if(i==="setter"){const{name:a}=t;return function(d){const c=this[a];e.call(this,d),this.requestUpdate(a,c,s,!0,d)}}throw Error("Unsupported decorator location: "+i)};function x(s){return(e,t)=>typeof t=="object"?Vi(s,e,t):((i,r,n)=>{const a=r.hasOwnProperty(n);return r.constructor.createProperty(n,i),a?Object.getOwnPropertyDescriptor(r,n):void 0})(s,e,t)}function b(s){return x({...s,state:!0,attribute:!1})}var Ki=Object.defineProperty,bt=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&Ki(e,t,r),r};const F=15;class Ge extends L{constructor(){super(...arguments),this.interactive=!1,this.disabled=!1,this.previewVisible=!0,this.sweepElapsedMilliseconds=0,this.sweepCompletedSteps=0,this.sweepLane=0,this.sweepTransitionSequence=0,this.motionChanged=()=>{this.configureDirectionalSweep(),this.requestUpdate()}}connectedCallback(){super.connectedCallback(),typeof window<"u"&&"matchMedia"in window&&(this.motionQuery=window.matchMedia("(prefers-reduced-motion: reduce)"),this.motionQuery.addEventListener("change",this.motionChanged)),!(typeof IntersectionObserver>"u")&&(this.visibilityObserver=new IntersectionObserver(([e])=>{this.previewVisible=e.isIntersecting,this.configureDirectionalSweep(),this.requestUpdate()},{threshold:.01}),this.visibilityObserver.observe(this))}disconnectedCallback(){this.visibilityObserver?.disconnect(),this.visibilityObserver=void 0,this.motionQuery?.removeEventListener("change",this.motionChanged),this.motionQuery=void 0,this.pauseDirectionalSweep(),super.disconnectedCallback()}updated(){this.configureDirectionalSweep()}render(){return this.model?o`
      <section class="preview ${this.model.kind}" aria-label=${this.model.title}>
        <header>
          <h3>${this.model.title}</h3>
          ${this.fidelityBadge(this.model.fidelity)}
        </header>
        ${this.renderBody(this.model)}
        <p class="fidelity-notice" role="note">${this.model.notice}</p>
      </section>
    `:l}renderBody(e){switch(e.kind){case"capture-static":return o`
          <div
            class="cell-strip capture-static"
            role="img"
            aria-label="Capture-backed abstract map of 15 sampled regions; ${e.illuminatedSegments.length} regions were observed illuminated"
          >
            ${e.cells.map(t=>o`
                <span
                  class="preview-cell"
                  style="--preview-colour: ${C(t)}"
                  aria-hidden="true"
                ></span>
              `)}
          </div>
          ${this.captureEvidence(e)}
        `;case"capture-directional-sweep":{const t=this.directionalSweepLane(e),i=Ye(e,t),r=new Map(i.map((c,p)=>[c,p])),n=Lt(e),a=si(e),d=e.motionUsesReviewedDefaultSpeed?`The reviewed visual repeat is ${e.periodSeconds.toFixed(3)} seconds at Default speed. One band completes the logical 15-lane circuit in ${(a/1e3).toFixed(3)} seconds.`:"Timing and motion were observed only at Default speed. This non-default Speed selection freezes a phase-separated capture snapshot.";return o`
          <div
            class="directional-sweep"
            role="img"
            aria-label="Capture-backed abstract directional sweep towards the ${e.direction==="towards_first_segment"?"first":"last"} sampled region, with ${e.travellingBands} phase-separated travelling bands. ${d}"
            data-preview-seed=${e.seed}
            data-logical-lane=${t}
            data-logical-lanes=${i.join(",")}
            data-phase-separation=${Xi(e)}
            data-step-interval-ms=${n.toFixed(3)}
            data-full-circuit-ms=${a.toFixed(3)}
            data-observed-repeat-ms=${(e.periodSeconds*1e3).toFixed(3)}
            data-motion-state=${e.motionUsesReviewedDefaultSpeed?"default":"snapshot"}
          >
            <div
              class="sweep-track"
              style="--sweep-base: ${C(e.baseColour)}; --sweep-band: ${C(e.bandColour)}"
              aria-hidden="true"
            >
              ${Array.from({length:F},(c,p)=>{const u=r.get(p),h=u!==void 0;return o`
                  <span
                    class="sweep-cell ${h?"current":""}"
                    data-logical-lane=${p}
                  >
                    ${h?o`
                          <span
                            class="sweep-band"
                            data-logical-band=${u}
                          ></span>
                        `:l}
                  </span>
                `})}
            </div>
          </div>
          <p class="motion-note" role="note">${d}</p>
          ${this.captureEvidence(e)}
        `}case"cells":return o`
          <div
            class="cell-strip"
            role=${this.interactive?"group":"img"}
            aria-label="Exact 15-segment colour map"
            @pointermove=${this.pointerMoved}
            @pointerup=${this.pointerFinished}
            @pointercancel=${this.pointerFinished}
          >
            ${e.cells.map((t,i)=>this.interactive?o`
                    <button
                      class="preview-cell"
                      type="button"
                      style="--preview-colour: ${C(t.colour)}"
                      aria-label="Segment ${i+1}, ${C(t.colour)}"
                      ?disabled=${this.disabled}
                      data-preview-cell=${i}
                      @pointerdown=${r=>this.pointerStarted(i,r)}
                      @click=${r=>this.cellClicked(i,r)}
                    ></button>
                  `:o`
                    <span
                      class="preview-cell"
                      style="--preview-colour: ${C(t.colour)}"
                      aria-hidden="true"
                    ></span>
                  `)}
          </div>
        `;case"palette":return o`
          ${this.renderPalette(e.palette)}
          <ol class="sequence" aria-label="Catalogue effect order">
            ${e.sequence.map((t,i)=>this.renderSequenceItem(t,i))}
          </ol>
        `;case"layers":return o`
          <div class="layers">
            ${e.layers.map(t=>this.renderLayer(t,t.index===e.activeLayer))}
          </div>
        `;case"scene-steps":return o`
          <dl class="scene-metadata">
            <div>
              <dt>Layout</dt>
              <dd>${e.layout}</dd>
            </div>
            <div>
              <dt>Brightness flag</dt>
              <dd>${e.brightnessFlag?"Set":"Clear"}</dd>
            </div>
            <div>
              <dt>Step count</dt>
              <dd>${e.steps.length}</dd>
            </div>
          </dl>
          ${e.layout===0?o`
                <h4 class="preview-subheading">Shared palette</h4>
                ${this.renderPalette(e.palette)}
              `:l}
          <ol class="scene-steps" aria-label="Ordered scene steps">
            ${e.steps.map(t=>o`
                <li>
                  <span class="order">${t.index+1}</span>
                  <span
                    class="swatch compact"
                    style="--preview-colour: ${C(t.colour)}"
                    aria-label="Step colour ${C(t.colour)}"
                    title=${C(t.colour)}
                  ></span>
                  <span>
                    <strong>Raw value ${t.value}</strong>
                    <small>Step colour ${C(t.colour)}</small>
                    ${t.inlineColour===null?l:o`
                          <small>
                            Inline colour ${C(t.inlineColour)}
                          </small>
                        `}
                  </span>
                  ${t.inlineColour===null?l:o`
                        <span
                          class="swatch compact"
                          style="--preview-colour: ${C(t.inlineColour)}"
                          aria-label="Inline colour ${C(t.inlineColour)}"
                          title=${C(t.inlineColour)}
                        ></span>
                      `}
                </li>
              `)}
          </ol>
        `;case"opaque":return o`
          ${e.palette===null?l:this.renderPalette(e.palette)}
          <ul class="opaque-details">
            ${e.details.map(t=>o`<li>${t}</li>`)}
          </ul>
        `}}captureEvidence(e){return e?o`
      <div class="capture-evidence" role="note">
        <p>
          This is a reviewed recorded capture with spatial lane calibration from
          corpus ${e.evidence.corpusId}.  Camera colour is uncalibrated.
          The abstract regions are not physical LED geometry.
        </p>
        <ul aria-label="Capture evidence limitations">
          ${e.limitations.map(t=>o`<li>${t}</li>`)}
        </ul>
      </div>
    `:l}configureDirectionalSweep(){const e=this.model;if(e?.kind!=="capture-directional-sweep"){this.pauseDirectionalSweep(),this.sweepKey=void 0;return}const t=`${e.identity.sku}:${e.identity.sceneId}:${e.identity.effectId}:${e.seed}`;if(this.sweepKey!==t&&(this.pauseDirectionalSweep(),this.sweepKey=t,this.sweepElapsedMilliseconds=0,this.sweepCompletedSteps=0,this.sweepLane=e.initialStep,this.sweepTransitionSequence=0),!this.previewVisible||this.motionQuery?.matches||!e.motionUsesReviewedDefaultSpeed){this.pauseDirectionalSweep();return}this.sweepRunningSince===void 0&&(this.sweepRunningSince=performance.now());const i=Lt(e),r=this.sweepElapsedMilliseconds+(performance.now()-this.sweepRunningSince),n=Math.floor(r/i);for(;this.sweepCompletedSteps<n;){const a=this.sweepLane,d=Ye(e,a);this.sweepCompletedSteps+=1,this.sweepLane=Gi(e,this.sweepCompletedSteps),this.dispatchEvent(new CustomEvent("preview-sweep-lane-change",{detail:{lane:this.sweepLane,previousLane:a,sequence:this.sweepTransitionSequence,lanes:Ye(e,this.sweepLane),previousLanes:d},bubbles:!0,composed:!0})),this.sweepTransitionSequence+=1}window.clearTimeout(this.sweepTimeout),this.sweepTimeout=window.setTimeout(()=>{this.configureDirectionalSweep(),this.requestUpdate()},Math.max(1,i-r%i))}pauseDirectionalSweep(){this.sweepRunningSince!==void 0&&(this.sweepElapsedMilliseconds+=performance.now()-this.sweepRunningSince,this.sweepRunningSince=void 0),window.clearTimeout(this.sweepTimeout),this.sweepTimeout=void 0}directionalSweepLane(e){const t=`${e.identity.sku}:${e.identity.sceneId}:${e.identity.effectId}:${e.seed}`;return this.sweepKey===t?this.sweepLane:e.initialStep}renderSequenceItem(e,t){return o`
      <li class=${e.fidelity==="opaque"?"unknown":""}>
        <span class="order">${t+1}</span>
        <span>
          <strong>${e.label}</strong>
          ${e.fidelity==="opaque"?o`<small>${e.raw}</small>`:l}
        </span>
        ${this.fidelityBadge(e.fidelity)}
      </li>
    `}renderLayer(e,t){const i=Math.max(0,e.area.end-e.area.start);return o`
      <article class="layer-summary ${t?"active":""}">
        <div class="layer-heading">
          <h4>${e.label}</h4>
          ${t?o`<span class="current">Selected</span>`:l}
        </div>
        <div
          class="area-track"
          role="img"
          aria-label="${e.label} applied area: start ${e.area.rawStartTenths} tenths, width ${e.area.rawWidthTenths} tenths"
        >
          <span
            class="area-band"
            style="inset-inline-start: ${e.area.start*100}%; width: ${i*100}%"
          ></span>
        </div>
        <p class="area-value">
          Applied area: ${e.area.rawStartTenths}/10 +
          ${e.area.rawWidthTenths}/10
          ${e.area.valid?l:o` <strong>out of range</strong>`}
        </p>
        ${this.renderPalette(e.palette)}
        <dl>
          ${e.fields.map(r=>o`
              <div class=${r.fidelity==="opaque"?"unknown":""}>
                <dt>${r.label}</dt>
                <dd>${r.value}</dd>
                ${r.fidelity==="opaque"?this.fidelityBadge("opaque"):l}
              </div>
            `)}
        </dl>
        ${e.notices.length?o`
              <ul class="layer-notices">
                ${e.notices.map(r=>o`<li>${r}</li>`)}
              </ul>
            `:l}
      </article>
    `}renderPalette(e){return o`
      <div class="palette" role="list" aria-label="Preview palette">
        ${e.length?e.map((t,i)=>o`
                <span
                  role="listitem"
                  class="swatch"
                  style="--preview-colour: ${C(t)}"
                  aria-label="Colour ${i+1}, ${C(t)}"
                  title=${C(t)}
                ></span>
              `):o`<span class="empty-palette">No palette colours</span>`}
      </div>
    `}fidelityBadge(e){return o`
      <span class="fidelity ${e}">
        ${e==="capture_backed"?"Capture-backed":e==="deterministic"?"Deterministic":e==="structural"?"Structural":"Opaque / unknown"}
      </span>
    `}pointerStarted(e,t){this.disabled||(t.preventDefault(),this.paintingPointerId=t.pointerId,this.lastPaintedCell=e,t.currentTarget.setPointerCapture(t.pointerId),this.selectCell(e))}pointerMoved(e){if(e.pointerId!==this.paintingPointerId||!this.shadowRoot)return;const i=this.shadowRoot.elementFromPoint(e.clientX,e.clientY)?.closest("[data-preview-cell]")?.dataset.previewCell;if(i===void 0)return;const r=Number(i);r!==this.lastPaintedCell&&(this.lastPaintedCell=r,this.selectCell(r))}pointerFinished(e){if(e.pointerId!==this.paintingPointerId)return;const t=this.shadowRoot?.querySelector(`[data-preview-cell="${this.lastPaintedCell}"]`);t?.hasPointerCapture(e.pointerId)&&t.releasePointerCapture(e.pointerId),this.paintingPointerId=void 0,this.lastPaintedCell=void 0}cellClicked(e,t){!this.disabled&&t.detail===0&&this.selectCell(e)}selectCell(e){this.dispatchEvent(new CustomEvent("preview-cell-selected",{detail:{index:e},bubbles:!0,composed:!0}))}static{this.styles=le`
    :host {
      display: block;
      --preview-border: var(--divider-color, #d8dce2);
      --preview-card: var(--card-background-color, #fff);
      --preview-muted: var(--secondary-text-color, #68707c);
      --preview-blue: var(--primary-color, #2f6fed);
    }

    * {
      box-sizing: border-box;
    }

    .preview {
      padding: 16px;
      border: 1px solid var(--preview-border);
      border-radius: 10px;
      background: var(--preview-card);
    }

    header,
    .layer-heading {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
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
      margin-bottom: 8px;
      font-size: 14px;
    }

    .fidelity,
    .current {
      display: inline-flex;
      flex: 0 0 auto;
      align-items: center;
      min-height: 24px;
      padding: 3px 8px;
      border: 1px solid var(--preview-border);
      border-radius: 999px;
      color: var(--preview-muted);
      background: var(--secondary-background-color, #f5f6f8);
      font-size: 11px;
      font-weight: 700;
    }

    .fidelity.opaque {
      color: var(--warning-color, #8a5b00);
      border-color: color-mix(
        in srgb,
        var(--warning-color, #d99000) 55%,
        var(--preview-border)
      );
    }

    .fidelity.capture_backed {
      color: var(--primary-color, #2f6fed);
      border-color: color-mix(
        in srgb,
        var(--primary-color, #2f6fed) 50%,
        var(--preview-border)
      );
    }

    .cell-strip {
      display: grid;
      grid-template-columns: repeat(15, minmax(0, 1fr));
      gap: 4px;
      touch-action: none;
    }

    .preview-cell {
      display: block;
      min-width: 0;
      min-height: 48px;
      padding: 0;
      border: 1px solid
        color-mix(in srgb, var(--preview-colour) 70%, #000);
      border-radius: 6px;
      background: var(--preview-colour);
    }

    .directional-sweep {
      min-width: 0;
    }

    .sweep-track {
      display: grid;
      grid-template-columns: repeat(15, minmax(0, 1fr));
      gap: 4px;
      min-height: 48px;
      direction: ltr;
      border-radius: 6px;
    }

    .sweep-cell {
      position: relative;
      display: grid;
      place-items: stretch;
      border: 1px solid color-mix(in srgb, var(--sweep-base) 70%, #000);
      border-radius: 5px;
      background: var(--sweep-base);
    }

    .sweep-cell.current {
      border-color: color-mix(in srgb, var(--sweep-band) 70%, #000);
    }

    .sweep-band {
      display: block;
      min-width: 100%;
      min-height: 100%;
      border-radius: 2px;
      background: var(--sweep-band);
    }

    .capture-evidence {
      margin-top: 12px;
      color: var(--preview-muted);
      font-size: 12px;
      line-height: 1.45;
    }

    .capture-evidence p {
      margin-bottom: 6px;
    }

    .capture-evidence ul {
      margin: 0;
      padding-inline-start: 20px;
    }

    button.preview-cell {
      cursor: crosshair;
    }

    button.preview-cell:focus-visible {
      outline: 3px solid var(--preview-blue);
      outline-offset: 2px;
    }

    .palette {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      min-height: 34px;
    }

    .swatch {
      width: 34px;
      height: 34px;
      border: 1px solid
        color-mix(in srgb, var(--preview-colour) 70%, #000);
      border-radius: 7px;
      background: var(--preview-colour);
    }

    .empty-palette {
      color: var(--preview-muted);
      font-size: 13px;
    }

    .sequence,
    .scene-steps,
    .opaque-details,
    .layer-notices {
      margin: 12px 0 0;
    }

    .sequence {
      display: grid;
      gap: 7px;
      padding: 0;
      list-style: none;
      counter-reset: none;
    }

    .sequence li,
    .scene-steps li {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      border: 1px solid var(--preview-border);
      border-radius: 8px;
    }

    .sequence li.unknown,
    dl div.unknown {
      border-color: color-mix(
        in srgb,
        var(--warning-color, #d99000) 45%,
        var(--preview-border)
      );
    }

    .sequence small {
      display: block;
      margin-top: 2px;
      color: var(--preview-muted);
    }

    .scene-metadata {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      margin: 0 0 14px;
    }

    .scene-metadata div {
      grid-template-columns: 1fr;
    }

    .preview-subheading {
      margin: 0 0 8px;
    }

    .scene-steps {
      display: grid;
      gap: 7px;
      padding: 0;
      list-style: none;
    }

    .scene-steps li {
      grid-template-columns: auto auto minmax(0, 1fr) auto;
      align-items: center;
      padding: 8px 10px;
      border: 1px solid var(--preview-border);
      border-radius: 8px;
    }

    .scene-steps small {
      display: block;
      margin-top: 2px;
      color: var(--preview-muted);
    }

    .swatch.compact {
      width: 26px;
      height: 26px;
      border-radius: 5px;
    }

    .order {
      display: grid;
      width: 26px;
      height: 26px;
      place-items: center;
      border-radius: 50%;
      color: var(--preview-muted);
      background: var(--secondary-background-color, #f5f6f8);
      font-size: 12px;
      font-weight: 700;
    }

    .layers {
      display: grid;
      gap: 10px;
    }

    .layer-summary {
      padding: 12px;
      border: 1px solid var(--preview-border);
      border-radius: 9px;
    }

    .layer-summary.active {
      border-color: var(--preview-blue);
    }

    .area-track {
      position: relative;
      height: 20px;
      overflow: hidden;
      border: 1px solid var(--preview-border);
      border-radius: 5px;
      background: var(--secondary-background-color, #f5f6f8);
    }

    .area-band {
      position: absolute;
      inset-block: 0;
      background: var(--preview-blue);
    }

    .area-value {
      margin: 6px 0 10px;
      color: var(--preview-muted);
      font-size: 12px;
    }

    dl {
      display: grid;
      gap: 6px;
      margin: 12px 0 0;
    }

    dl div {
      display: grid;
      grid-template-columns: minmax(110px, 0.35fr) minmax(0, 1fr) auto;
      gap: 8px;
      padding: 6px 8px;
      border-inline-start: 3px solid transparent;
      background: var(--secondary-background-color, #f5f6f8);
    }

    dt {
      font-weight: 650;
    }

    dd {
      margin: 0;
      overflow-wrap: anywhere;
    }

    .layer-notices,
    .opaque-details {
      padding-inline-start: 20px;
      color: var(--preview-muted);
      font-size: 12px;
      line-height: 1.45;
    }

    .fidelity-notice {
      margin: 12px 0 0;
      color: var(--preview-muted);
      font-size: 13px;
      line-height: 1.45;
    }

    @media (max-width: 480px) {
      .cell-strip {
        gap: 3px;
      }

      .preview-cell {
        min-height: 38px;
        border-radius: 4px;
      }

      .sweep-track {
        gap: 3px;
        min-height: 38px;
      }

      dl div {
        grid-template-columns: 1fr;
      }

      .scene-metadata {
        grid-template-columns: 1fr;
      }
    }

  `}}bt([x({attribute:!1})],Ge.prototype,"model");bt([x({type:Boolean})],Ge.prototype,"interactive");bt([x({type:Boolean})],Ge.prototype,"disabled");customElements.get("govee-effect-preview")||customElements.define("govee-effect-preview",Ge);function C(s){return`#${s.map(e=>e.toString(16).padStart(2,"0")).join("")}`}function Gi(s,e){const t=s.direction==="towards_first_segment"?-1:1,i=(s.initialStep+t*e)%F;return i<0?i+F:i}function Ye(s,e){return Array.from({length:s.travellingBands},(t,i)=>{const r=Math.round(i*F/s.travellingBands),n=(e+r)%F;return n<0?n+F:n})}function Xi(s){return Math.round(F/s.travellingBands)}function si(s){return s.periodSeconds*s.travellingBands*1e3}function Lt(s){return si(s)/F}var Wi=Object.defineProperty,Ie=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&Wi(e,t,r),r};const Je=[[255,69,58],[255,159,10],[255,214,10],[48,209,88],[10,132,255],[94,92,230],[191,90,242],[255,45,85]];class pe extends L{constructor(){super(...arguments),this.palette=[],this.minColours=1,this.maxColours=8,this.disabled=!1,this.pointerX=0,this.pointerY=0,this.pointerMoved=!1,this.suppressClick=!1}willUpdate(e){e.has("palette")&&this.editingIndex!==void 0&&this.editingIndex>=this.palette.length&&(this.editingIndex=void 0)}render(){return o`
      <ul class="palette-list" aria-label="Colours">
        ${this.palette.map((e,t)=>o`
            <li
              class="swatch-item"
              data-colour-index=${t}
              draggable=${this.disabled?"false":"true"}
              @dragstart=${i=>this.dragStarted(t,i)}
              @dragover=${i=>{this.disabled||i.preventDefault()}}
              @drop=${i=>this.dropped(t,i)}
              @pointerdown=${i=>this.pointerStarted(t,i)}
              @pointermove=${this.pointerMovedOver}
              @pointerup=${this.pointerFinished}
              @pointercancel=${this.pointerFinished}
            >
              <button
                class="swatch"
                type="button"
                data-colour-index=${t}
                style="--swatch-colour: ${fe(e)}"
                aria-label="Edit colour ${t+1}, ${fe(e)}. Drag to reorder or use arrow keys."
                ?disabled=${this.disabled}
                @click=${()=>this.toggleEditor(t)}
                @keydown=${i=>this.keyPressed(t,i)}
              ></button>
              ${this.editingIndex===t?this.renderPopover(t,e):l}
            </li>
          `)}
        <li>
          <button
            class="palette-add"
            type="button"
            title="Add colour"
            aria-label="Add colour"
            ?disabled=${this.disabled||this.palette.length>=this.maxColours}
            @click=${this.addColour}
          >
            +
          </button>
        </li>
      </ul>
    `}renderPopover(e,t){return o`
      <div class="colour-popover" role="dialog" aria-label="Edit colour">
        <div class="preset-grid">
          ${Je.map(i=>o`
              <button
                type="button"
                style="--preset-colour: ${fe(i)}"
                aria-label="Use ${fe(i)}"
                ?disabled=${this.disabled}
                @click=${()=>this.updateColour(e,i)}
              ></button>
            `)}
        </div>
        <label class="custom-colour">
          <span>Custom colour</span>
          <input
            type="color"
            .value=${fe(t)}
            ?disabled=${this.disabled}
            @input=${i=>this.updateColour(e,Ji(i.target.value))}
          />
        </label>
        <div class="colour-actions">
          <button
            type="button"
            ?disabled=${this.disabled||e===0}
            @click=${()=>this.moveColour(e,-1,!0)}
          >
            Move left
          </button>
          <button
            type="button"
            ?disabled=${this.disabled||e===this.palette.length-1}
            @click=${()=>this.moveColour(e,1,!0)}
          >
            Move right
          </button>
          <button
            class="danger"
            type="button"
            ?disabled=${this.disabled||this.palette.length<=this.minColours}
            @click=${()=>this.removeColour(e)}
          >
            Remove
          </button>
        </div>
      </div>
    `}updateColour(e,t){const i=Qe(this.palette);i[e]=[...t],this.emitPalette(i)}addColour(){if(this.disabled||this.palette.length>=this.maxColours)return;const e=this.palette[this.palette.length-1]??Je[this.palette.length%Je.length],t=[...Qe(this.palette),[...e]];this.editingIndex=t.length-1,this.emitPalette(t)}removeColour(e){if(this.disabled||this.palette.length<=this.minColours)return;const t=this.palette.filter((r,n)=>n!==e).map(r=>[...r]),i=Math.min(e,t.length-1);this.editingIndex=void 0,this.emitPalette(t),this.focusSwatchAfterUpdate(i)}moveColour(e,t,i=!1){const r=e+t;this.disabled||r<0||r>=this.palette.length||this.reorder(e,r,i)}reorder(e,t,i=!1){if(this.disabled||e===t)return;const r=Qe(this.palette),[n]=r.splice(e,1);r.splice(t,0,n),this.editingIndex=this.editingIndex===e?t:Yi(this.editingIndex,e,t),this.emitPalette(r),i&&this.focusSwatchAfterUpdate(t)}focusSwatchAfterUpdate(e){this.updateComplete.then(()=>{this.shadowRoot?.querySelector(`.swatch[data-colour-index="${e}"]`)?.focus()})}dragStarted(e,t){this.disabled||(this.draggedIndex=e,t.dataTransfer?.setData("text/plain",String(e)))}dropped(e,t){t.preventDefault(),this.draggedIndex!==void 0&&(this.reorder(this.draggedIndex,e),this.draggedIndex=void 0)}keyPressed(e,t){t.key!=="ArrowLeft"&&t.key!=="ArrowRight"||(t.preventDefault(),this.moveColour(e,t.key==="ArrowLeft"?-1:1,!0))}toggleEditor(e){if(this.suppressClick){this.suppressClick=!1;return}this.editingIndex=this.editingIndex===e?void 0:e}pointerStarted(e,t){this.disabled||t.pointerType==="mouse"||t.target.closest(".colour-popover")||(this.pointerId=t.pointerId,this.pointerIndex=e,this.pointerX=t.clientX,this.pointerY=t.clientY,this.pointerMoved=!1,t.currentTarget.setPointerCapture(t.pointerId))}pointerMovedOver(e){if(e.pointerId!==this.pointerId||this.pointerIndex===void 0)return;const t=e.clientX-this.pointerX,i=e.clientY-this.pointerY;if(!this.pointerMoved){if(Math.abs(i)>Math.abs(t)||Math.abs(t)<10)return;this.pointerMoved=!0}e.preventDefault();const r=this.shadowRoot?.elementFromPoint(e.clientX,e.clientY)?.closest("[data-colour-index]"),n=Number(r?.dataset.colourIndex);!Number.isInteger(n)||n===this.pointerIndex||(this.reorder(this.pointerIndex,n),this.pointerIndex=n)}pointerFinished(e){if(e.pointerId!==this.pointerId)return;const t=e.currentTarget;t.hasPointerCapture(e.pointerId)&&t.releasePointerCapture(e.pointerId),this.suppressClick=this.pointerMoved,this.pointerId=void 0,this.pointerIndex=void 0,this.pointerMoved=!1}emitPalette(e){this.palette=e,this.dispatchEvent(new CustomEvent("palette-changed",{detail:{palette:e},bubbles:!0,composed:!0}))}static{this.styles=le`
    :host {
      display: block;
      --studio-blue: var(--primary-color, #2f6fed);
      --studio-border: var(--divider-color, #d8dce2);
      --studio-card: var(--card-background-color, #fff);
      --studio-muted: var(--secondary-text-color, #68707c);
      --studio-danger: var(--error-color, #db4437);
    }

    * {
      box-sizing: border-box;
    }

    button,
    input {
      min-height: 44px;
      font: inherit;
    }

    .palette-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .swatch-item {
      position: relative;
      touch-action: pan-y;
    }

    .swatch-item[draggable="true"] {
      cursor: grab;
    }

    .swatch,
    .palette-add {
      width: 44px;
      height: 44px;
      padding: 0;
      border-radius: 8px;
      cursor: pointer;
    }

    .swatch {
      border: 1px solid rgb(0 0 0 / 14%);
      background: var(--swatch-colour);
    }

    .palette-add {
      display: grid;
      place-items: center;
      border: 1px dashed var(--studio-border);
      color: var(--studio-blue);
      background: transparent;
      font-size: 24px;
    }

    .swatch:focus-visible,
    .palette-add:focus-visible {
      outline: 3px solid var(--studio-blue);
      outline-offset: 2px;
    }

    .colour-popover {
      position: absolute;
      z-index: 25;
      top: 52px;
      left: 0;
      width: min(300px, calc(100vw - 48px));
      padding: 10px;
      border: 1px solid var(--studio-border);
      border-radius: 9px;
      background: var(--studio-card);
      box-shadow: 0 8px 24px rgb(0 0 0 / 18%);
    }

    .preset-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
    }

    .preset-grid button {
      min-height: 52px;
      border: 1px solid rgb(0 0 0 / 12%);
      border-radius: 6px;
      background: var(--preset-colour);
      cursor: pointer;
    }

    .custom-colour {
      display: grid;
      grid-template-columns: 1fr 64px;
      align-items: center;
      gap: 10px;
      margin-top: 10px;
      color: var(--studio-muted);
      font-size: 13px;
      font-weight: 600;
    }

    .custom-colour input {
      width: 64px;
      height: 44px;
      padding: 3px;
      border: 1px solid var(--studio-border);
      border-radius: 7px;
      background: var(--studio-card);
    }

    .colour-actions {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px;
      margin-top: 10px;
    }

    .colour-actions button {
      padding: 8px 10px;
      border: 1px solid var(--studio-border);
      border-radius: 7px;
      color: var(--primary-text-color);
      background: var(--studio-card);
      cursor: pointer;
    }

    .colour-actions .danger {
      grid-column: 1 / -1;
      color: var(--studio-danger);
    }

    button:disabled,
    input:disabled {
      cursor: not-allowed;
      opacity: 0.52;
    }

    @media (max-width: 600px) {
      .colour-popover {
        position: fixed;
        top: 50%;
        right: 24px;
        left: 24px;
        width: auto;
        max-height: calc(100vh - 48px);
        overflow: auto;
        transform: translateY(-50%);
      }
    }
  `}}Ie([x({attribute:!1})],pe.prototype,"palette");Ie([x({type:Number})],pe.prototype,"minColours");Ie([x({type:Number})],pe.prototype,"maxColours");Ie([x({type:Boolean})],pe.prototype,"disabled");Ie([b()],pe.prototype,"editingIndex");function Qe(s){return s.map(e=>[...e])}function Yi(s,e,t){return s===void 0||e===t?s:s===e?t:e<t&&s>e&&s<=t?s-1:t<e&&s>=t&&s<e?s+1:s}function fe(s){return`#${s.map(e=>e.toString(16).padStart(2,"0")).join("")}`}function Ji(s){return[Number.parseInt(s.slice(1,3),16),Number.parseInt(s.slice(3,5),16),Number.parseInt(s.slice(5,7),16)]}customElements.get("govee-palette-editor")||customElements.define("govee-palette-editor",pe);function Qi(s){const e=Array.from({length:15},()=>({colour:X(s.background),source:"background"}));for(const t of s.groups)for(const i of t.segments)i>=0&&i<e.length&&(e[i]={colour:X(t.fill),source:"group"});return{kind:"cells",fidelity:"deterministic",title:"Painted segments",cells:e,notice:"Deterministic preview: only the exact 15-segment background and group map is shown."}}function Zi(s,e){const i=(s.kind==="h617a_single"?[s]:s.effects).map(n=>rs(n,e)),r="Structural preview: the saved palette and catalogue-backed effect order are shown. Device animation and behaviour are not simulated.";return s.kind==="h617a_single"&&i[0]?.fidelity==="opaque"?{kind:"opaque",fidelity:"opaque",title:"Unknown custom effect",palette:xe(s.palette),details:[i[0].raw],notice:"Opaque preview: this family and variant pair is not present in the Custom Effect Catalogue. The raw identity and palette remain visible without inferred behaviour."}:{kind:"palette",fidelity:"structural",title:s.kind==="h617a_single"?"Single effect structure":"Multi effect sequence",palette:xe(s.palette),sequence:i,notice:r}}function ri(s,e){return{kind:"layers",fidelity:"structural",title:"Layer structure",activeLayer:e,layers:s.layers.map(ns),notice:"Structural preview: documented layer fields, palettes and applied-area fractions are shown. No composite animation or physical LED geometry is inferred."}}function es(s){return{kind:"opaque",fidelity:"opaque",title:"Built-in scene identity",palette:null,details:[`Scene ${s.template.scene_id}, effect ${s.template.effect_id}`,s.speed_index===null?"Raw speed index: none":`Raw speed index: ${s.speed_index}`],notice:"Opaque preview: Scene Type 0 has no documented visual parameters, so no colour, layout, timing or motion preview is shown."}}function ts(s,e){const t={fidelity:"capture_backed",title:s.primitive==="static"?"Observed static scene":"Observed directional sweep",identity:{sku:s.sku,sceneId:s.scene_id,effectId:s.effect_id},illuminatedSegments:[...s.illuminated_segments],limitations:[...s.limitations],evidence:{corpusId:s.evidence.corpus_id,contactSheetSha256:s.evidence.contact_sheet_sha256},notice:"Capture-backed preview: this is a reviewed recorded capture with spatial lane calibration. Camera colour is uncalibrated. It is not a protocol rendering and does not define device behaviour."};if(s.primitive==="static")return{...t,kind:"capture-static",cells:xe(s.palette.segment_rgb)};const i=cs(s.sku,s.scene_id,s.effect_id);return{...t,kind:"capture-directional-sweep",baseColour:X(s.palette.base_rgb),bandColour:X(s.palette.band_rgb),direction:s.direction,periodSeconds:s.period_seconds,travellingBands:s.travelling_bands,seed:i,initialStep:i%15,motionUsesReviewedDefaultSpeed:e===void 0||e.defaultIndex!==null&&e.selectedIndex===e.defaultIndex}}function is(s){return{kind:"scene-steps",fidelity:"structural",title:s.layout===0?"Captured palette scene structure":"Palette scene structure (schema-only layout 1)",layout:s.layout,brightnessFlag:s.brightness_flag,palette:xe(s.palette),steps:s.steps.map((e,t)=>({index:t,value:e.value,colour:X(e.colour),inlineColour:e.inline_colour===null?null:X(e.inline_colour)})),notice:s.layout===0?"Structural preview: captured layout 0 palette, ordered steps, colours and raw values are shown. Timing, motion and device animation are not inferred.":"Schema-only structural preview: synthetic layout 1 structure, ordered steps, colours and raw values are shown. No hardware behaviour, timing, motion or animation is inferred."}}function ss(s){return{...ri({layers:s.effect.layers},-1),title:"Captured layered scene structure"}}function rs(s,e){const t=e.effects.find(i=>i.family===s.family&&i.variant===s.variant);return t?{fidelity:"structural",id:t.id,label:t.label}:{fidelity:"opaque",label:"Unknown catalogue identity",raw:`Raw family ${s.family}, variant ${s.variant}`}}function ns(s,e){const t=[],i=[],r=as(s);t.push(r),r.fidelity==="opaque"&&i.push(`Selection type ${s.selection.type} has unknown structure. Its raw parameters remain visible and no selected cells are inferred.`);const n=os(s);t.push(n),n.fidelity==="opaque"&&i.push(`Distribution method ${s.distribution.method} is unknown. Its raw value remains visible.`),t.push({fidelity:"structural",label:"Colour timing",value:`speed ${s.colour_speed}; retention ${s.colour_retention}`}),s.brightness_patterns.length===0?t.push({fidelity:"structural",label:"Brightness",value:"No pattern records"}):s.brightness_patterns.forEach((d,c)=>{const p=d.order>=0&&d.order<=3;t.push({fidelity:p?"structural":"opaque",label:`Brightness pattern ${c+1}`,value:`order ${d.order}; scope ${d.scope_low}-${d.scope_high}; speed ${d.change_speed}; retention ${d.brightest_retention}/${d.darkest_retention}; ${s.brightness_gradient?"gradient":"unified"}`}),p||i.push(`Brightness order ${d.order} has unknown structure. Its raw pattern remains visible and no brightness gradient is inferred.`)}),Mt(s.selected_movement,"Selected movement",t,i),Mt(s.overall_movement,"Whole-layer movement",t,i),t.push({fidelity:"structural",label:"Priority",value:String(s.priority)}),s.unknown_flags!==0&&(t.push({fidelity:"opaque",label:"Layer flags",value:`0x${nt(s.unknown_flags)}`}),i.push("Unknown layer flags remain visible without interpretation.")),s.excess.length>0&&(t.push({fidelity:"opaque",label:"Excess bytes",value:s.excess}),i.push("Unparsed excess bytes remain visible without interpretation."));const a=ds(s);return a.valid||i.push(`Applied area ${a.rawStartTenths}/10 + ${a.rawWidthTenths}/10 is outside the documented range and is clamped only for the normalized band.`),{index:e,label:`Layer ${e+1}`,area:a,palette:xe(s.palette),fields:t,notices:i}}function as(s){const t=["Segment","Continuous","Random","Custom"][s.selection.type];return{fidelity:t===void 0?"opaque":"structural",label:"Selection",value:`${t??`Unknown type ${s.selection.type}`}; parameters ${s.selection.param_1}, ${s.selection.param_2}`}}function os(s){const t=["Unified","By IC","By segment"][s.distribution.method];return{fidelity:t===void 0?"opaque":"structural",label:"Distribution",value:`${t??`Unknown method ${s.distribution.method}`}; ${s.distribution.backwards?"backwards":"forwards"}`}}function Mt(s,e,t,i){if(!s.enabled){t.push({fidelity:"structural",label:e,value:"Disabled"}),s.unknown_flags!==0&&(t.push({fidelity:"opaque",label:`${e} flags`,value:`0x${nt(s.unknown_flags)}`}),i.push(`${e} flags remain visible without interpretation.`));return}const n=["Forward","Backward","Forward and back","Back and forward"][s.direction];t.push({fidelity:n===void 0?"opaque":"structural",label:e,value:`${n??`Unknown direction ${s.direction}`}; distance ${s.distance}; speed ${s.speed}; ${s.enter_exit?"enter/exit":"continuous"}`}),n===void 0&&i.push(`${e} direction ${s.direction} is unknown. Its raw value remains visible.`),s.unknown_flags!==0&&(t.push({fidelity:"opaque",label:`${e} flags`,value:`0x${nt(s.unknown_flags)}`}),i.push(`${e} flags remain visible without interpretation.`))}function ds(s){const e=s.area.start_tenths,t=s.area.width_tenths;return{start:Nt(e/10,0,1),end:Nt((e+t)/10,0,1),rawStartTenths:e,rawWidthTenths:t,valid:e>=0&&e<=9&&t>=1&&t<=10-e}}function xe(s){return s.map(X)}function X(s){return[...s]}function Nt(s,e,t){return Math.min(t,Math.max(e,s))}function nt(s){return s.toString(16).padStart(2,"0").toUpperCase()}function cs(s,e,t){let i=2166136261;for(const r of`${s}:${e}:${t}`)i^=r.charCodeAt(0),i=Math.imul(i,16777619);return i>>>0}var ls=Object.defineProperty,Ee=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&ls(e,t,r),r};const Z=5,Ot=8,ni=[1,2,0,3],ai=[0,1,2,3],ps={0:"Segment",1:"Continuous",2:"Random",3:"Custom"},us={0:"Brightest to darkest",1:"Brightest, darkest, brightest",2:"Darkest to brightest",3:"Darkest, brightest, darkest"},Rt={0:"Forward",1:"Backward",2:"Forward and back",3:"Back and forward"};class ue extends L{constructor(){super(...arguments),this.disabled=!1,this.activeLayerIndex=0,this.activePatternIndex=0,this.movementAnnouncement=""}willUpdate(e){if(!(!e.has("content")||!this.content)){if(this.content.layers.length===0){this.activeLayerIndex=0,this.activePatternIndex=0;return}if(this.activeLayerIndex=j(this.activeLayerIndex,0,this.content.layers.length-1),this.activeLayer.brightness_patterns.length===0){this.activePatternIndex=0;return}this.activePatternIndex=j(this.activePatternIndex,0,this.activeLayer.brightness_patterns.length-1)}}render(){if(!this.content)return l;if(this.content.layers.length===0)return this.renderEmptyLayers();const e=this.activeLayer;return o`
      <div class="movement-live" aria-live="polite">
        ${this.movementAnnouncement}
      </div>

      <section class="card layer-card">
        <div class="layer-toolbar">
          <div
            class="layer-tabs"
            role="tablist"
            aria-label="Effect layers"
          >
            ${this.content.layers.map((t,i)=>o`
                <button
                  id="advanced-layer-tab-${i}"
                  class=${i===this.activeLayerIndex?"selected":""}
                  type="button"
                  role="tab"
                  aria-selected=${i===this.activeLayerIndex}
                  aria-controls="advanced-layer-panel"
                  tabindex=${i===this.activeLayerIndex?"0":"-1"}
                  @click=${()=>this.selectLayer(i)}
                  @keydown=${r=>this.layerTabKeyPressed(i,r)}
                >
                  Layer ${i+1}
                </button>
              `)}
          </div>
          <button
            class="add-button"
            type="button"
            ?disabled=${this.disabled||this.content.layers.length>=Z}
            @click=${this.addLayer}
          >
            Add layer
          </button>
        </div>

        <div class="layer-actions" aria-label="Layer actions">
          <button
            class="secondary"
            type="button"
            ?disabled=${this.disabled||this.activeLayerIndex===0}
            @click=${()=>this.moveLayer(-1)}
          >
            Move left
          </button>
          <button
            class="secondary"
            type="button"
            ?disabled=${this.disabled||this.activeLayerIndex===this.content.layers.length-1}
            @click=${()=>this.moveLayer(1)}
          >
            Move right
          </button>
          <button
            class="secondary"
            type="button"
            ?disabled=${this.disabled||this.content.layers.length>=Z}
            @click=${this.copyLayer}
          >
            Copy
          </button>
          <button
            class="secondary danger"
            type="button"
            ?disabled=${this.disabled||this.content.layers.length===1}
            @click=${this.deleteLayer}
          >
            Delete
          </button>
        </div>

        ${this.content.layers.length>=Z?o`
              <p class="limit-note">
                ${this.content.layers.length>Z?`This loaded effect has ${this.content.layers.length} layers. All are preserved, but adding and copying are unavailable while five or more remain.`:"Advanced effects can author up to five layers."}
              </p>
            `:l}
      </section>

      <section
        id="advanced-layer-panel"
        role="tabpanel"
        aria-labelledby="advanced-layer-tab-${this.activeLayerIndex}"
      >
        ${this.renderPreview()}

        <div class="control-grid">
          ${this.renderAppliedArea(e)}
          ${this.renderSelection(e)}
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
    `}get activeLayer(){return this.content.layers[this.activeLayerIndex]}renderPreview(){return o`
      <govee-effect-preview
        class="effect-preview"
        .model=${ri(this.content,this.activeLayerIndex)}
      ></govee-effect-preview>
    `}renderAppliedArea(e){const t=e.area.start_tenths>=0&&e.area.start_tenths<=9&&e.area.width_tenths>=1&&e.area.width_tenths<=10-e.area.start_tenths,i=j(e.area.start_tenths,0,9),r=i+e.area.width_tenths;return o`
      <section class="card">
        <h3>Applied area</h3>
        <div class="coverage" aria-label="Applied strip tenths">
          ${Array.from({length:10},(n,a)=>o`
              <span
                class=${t&&a>=i&&a<r?"covered":""}
                aria-hidden="true"
              ></span>
            `)}
        </div>
        ${t?o`
              ${this.rangeField("Start",i,0,9,`${i*10}%`,n=>this.updateLayer({area:{start_tenths:n,width_tenths:Math.min(e.area.width_tenths,10-n)}}))}
              ${this.rangeField("Width",e.area.width_tenths,1,10-i,`${e.area.width_tenths*10}%`,n=>this.updateLayer({area:{...e.area,width_tenths:n}}))}
            `:o`
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
      </section>
    `}renderSelection(e){const t=e.selection,i=fs(t.type);return o`
      <section class="card">
        <h3>Selection</h3>
        <label class="field">
          <span>Type</span>
          <select
            aria-label="Selection type"
            .value=${String(t.type)}
            ?disabled=${this.disabled}
            @change=${r=>this.updateSelection({type:Number(r.target.value)})}
          >
            ${ni.map(r=>o`<option
                  value=${r}
                  .selected=${t.type===r}
                >
                  ${ps[r]}
                </option>`)}
            ${i?l:o`
                  <option value=${t.type} .selected=${!0}>
                    Raw type ${t.type} (0x${De(t.type)})
                  </option>
                `}
          </select>
        </label>
        ${i?l:o`
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
      </section>
    `}renderPalette(e){return o`
      <section class="card">
        <h3>Colours</h3>
        <govee-palette-editor
          .palette=${e.palette}
          .minColours=${1}
          .maxColours=${Ot}
          .disabled=${this.disabled}
          @palette-changed=${t=>this.updateLayer({palette:t.detail.palette.map(i=>[...i])})}
        ></govee-palette-editor>
        ${e.palette.length>Ot?o`
              <p class="muted">
                All ${e.palette.length} loaded colours are preserved.
                Adding remains unavailable until fewer than eight remain.
              </p>
            `:l}
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
      `;const t=j(this.activePatternIndex,0,e.brightness_patterns.length-1),i=e.brightness_patterns[t],r=ms(i.order);return o`
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
              ${ai.map(n=>o`<option value=${n}>
                    ${us[n]}
                  </option>`)}
              ${r?l:o`
                    <option value=${i.order} .selected=${!0}>
                      Raw order ${i.order} (0x${De(i.order)})
                    </option>
                  `}
            </select>
          </label>
          ${r?l:o`
                <p class="muted raw-value-note">
                  Brightness order ${i.order} is not defined by the
                  known schema. Its raw value remains preserved.
                </p>
                ${this.byteNumberField("Order (raw byte)",i.order,n=>this.updateBrightnessPattern({order:n}))}
              `}
          ${this.rangeField("Scope low",i.scope_low,0,255,me(i.scope_low),n=>this.updateBrightnessPattern({scope_low:n}))}
          ${this.rangeField("Scope high",i.scope_high,0,255,me(i.scope_high),n=>this.updateBrightnessPattern({scope_high:n}))}
          ${this.rangeField("Changing speed",i.change_speed,0,255,me(i.change_speed),n=>this.updateBrightnessPattern({change_speed:n}))}
          ${this.rangeField("Brightest retention",i.brightest_retention,0,255,String(i.brightest_retention),n=>this.updateBrightnessPattern({brightest_retention:n}))}
          ${this.rangeField("Darkest retention",i.darkest_retention,0,255,String(i.darkest_retention),n=>this.updateBrightnessPattern({darkest_retention:n}))}
        </div>
      </section>
    `}renderMovement(e,t,i){const r=e[t];return o`
      <section class="card">
        <div class="card-heading">
          <h3>${i}</h3>
          <button
            class="switch ${r.enabled?"on":""}"
            type="button"
            role="switch"
            aria-checked=${r.enabled}
            aria-label="${i} enabled"
            ?disabled=${this.disabled}
            @click=${()=>this.updateMovement(t,{enabled:!r.enabled},`${i} ${r.enabled?"disabled":"enabled"}.`)}
          >
            <span aria-hidden="true"></span>
          </button>
        </div>
        ${r.enabled?o`
              ${this.byteNumberField("Distance",r.distance,n=>this.updateMovement(t,{distance:n},`${i} distance ${n}.`))}
              <label class="field">
                <span>Direction</span>
                <select
                  .value=${String(r.direction)}
                  ?disabled=${this.disabled}
                  @change=${n=>{const a=Number(n.target.value);this.updateMovement(t,{direction:a},`${i} direction ${Rt[a]}.`)}}
                >
                  ${Object.entries(Rt).map(([n,a])=>o`<option value=${n}>${a}</option>`)}
                </select>
              </label>
              ${this.rangeField("Speed",r.speed,0,255,me(r.speed),n=>this.updateMovement(t,{speed:n},`${i} speed ${ci(n)} per cent.`))}
              <label class="check-field">
                <input
                  type="checkbox"
                  .checked=${r.enter_exit}
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
    `}rangeField(e,t,i,r,n,a){return o`
      <label class="range-field">
        <span>${e}</span>
        <input
          type="range"
          min=${i}
          max=${r}
          .value=${String(j(t,i,r))}
          aria-label=${e}
          ?disabled=${this.disabled}
          @input=${d=>a(Number(d.target.value))}
        />
        <output aria-label="${e} value">${n}</output>
      </label>
    `}byteNumberField(e,t,i){return this.numberField(e,t,0,255,i)}numberField(e,t,i,r,n){return o`
      <label class="field">
        <span>${e}</span>
        <input
          type="number"
          min=${i}
          max=${r}
          .value=${String(t)}
          ?disabled=${this.disabled}
          @change=${a=>n(j(Number(a.target.value),i,r))}
        />
      </label>
    `}hexByteField(e,t,i,r=255){return o`
      <label class="field">
        <span>${e}</span>
        <input
          type="text"
          inputmode="text"
          spellcheck="false"
          .value=${De(t)}
          ?disabled=${this.disabled}
          @change=${n=>{const a=n.target,d=gs(a.value);if(d===void 0){a.setCustomValidity("Enter one byte from 00 to FF."),a.reportValidity();return}if((d&~r)!==0){a.setCustomValidity(`Known flag bits are controlled elsewhere. Allowed mask: ${De(r)}.`),a.reportValidity();return}a.setCustomValidity(""),i(d)}}
        />
      </label>
    `}updateLayer(e){if(!this.content||this.disabled)return;const t=this.content.layers.map((i,r)=>r===this.activeLayerIndex?B({...i,...e}):B(i));this.emitContent({kind:"advanced",layers:t})}updateSelection(e){this.updateLayer({selection:{...this.activeLayer.selection,...e}})}updateBrightnessPattern(e){const t=this.activeLayer.brightness_patterns.map((i,r)=>r===this.activePatternIndex?{...i,...e}:{...i});this.updateLayer({brightness_patterns:t})}updateMovement(e,t,i){this.updateLayer({[e]:{...this.activeLayer[e],...t}}),i&&(this.movementAnnouncement=i)}addLayer(){if(!this.content||this.disabled||this.content.layers.length>=Z)return;const e=[...this.content.layers.map(B),oi()];this.installContent({kind:"advanced",layers:e}),this.activeLayerIndex=e.length-1,this.activePatternIndex=0,this.focusActiveTab()}copyLayer(){if(!this.content||this.disabled||this.content.layers.length>=Z)return;const e=this.content.layers.map(B);e.splice(this.activeLayerIndex+1,0,B(this.activeLayer)),this.installContent({kind:"advanced",layers:e}),this.activeLayerIndex+=1,this.activePatternIndex=0,this.focusActiveTab()}deleteLayer(){if(!this.content||this.disabled||this.content.layers.length===1)return;const e=this.content.layers.filter((t,i)=>i!==this.activeLayerIndex).map(B);this.activeLayerIndex=Math.min(this.activeLayerIndex,e.length-1),this.activePatternIndex=0,this.emitContent({kind:"advanced",layers:e}),this.focusActiveTab()}moveLayer(e){if(!this.content||this.disabled)return;const t=this.activeLayerIndex+e;if(t<0||t>=this.content.layers.length)return;const i=this.content.layers.map(B),[r]=i.splice(this.activeLayerIndex,1);i.splice(t,0,r),this.activeLayerIndex=t,this.emitContent({kind:"advanced",layers:i}),this.focusActiveTab()}addBrightnessPattern(){if(this.disabled||this.activeLayer.brightness_patterns.length>=3)return;const e=[...this.activeLayer.brightness_patterns.map(t=>({...t})),di()];this.activePatternIndex=e.length-1,this.updateLayer({brightness_patterns:e})}deleteBrightnessPattern(){if(this.disabled||this.activeLayer.brightness_patterns.length===1)return;const e=this.activeLayer.brightness_patterns.filter((t,i)=>i!==this.activePatternIndex).map(t=>({...t}));this.activePatternIndex=Math.min(this.activePatternIndex,e.length-1),this.updateLayer({brightness_patterns:e})}selectLayer(e){this.activeLayerIndex=e,this.activePatternIndex=0}layerTabKeyPressed(e,t){let i;t.key==="ArrowLeft"?i=e===0?this.content.layers.length-1:e-1:t.key==="ArrowRight"?i=e===this.content.layers.length-1?0:e+1:t.key==="Home"?i=0:t.key==="End"&&(i=this.content.layers.length-1),i!==void 0&&(t.preventDefault(),this.selectLayer(i),this.focusActiveTab())}patternTabKeyPressed(e,t){const i=this.activeLayer.brightness_patterns.length;let r;t.key==="ArrowLeft"?r=e===0?i-1:e-1:t.key==="ArrowRight"?r=e===i-1?0:e+1:t.key==="Home"?r=0:t.key==="End"&&(r=i-1),r!==void 0&&(t.preventDefault(),this.activePatternIndex=r,this.updateComplete.then(()=>{this.shadowRoot?.querySelectorAll(".pattern-tabs button")[r]?.focus()}))}focusActiveTab(){this.updateComplete.then(()=>{this.shadowRoot?.querySelector(`#advanced-layer-tab-${this.activeLayerIndex}`)?.focus()})}excessChanged(e){const t=e.value.replace(/\s+/g,"").toLowerCase();if(!/^(?:[0-9a-f]{2})*$/.test(t)){e.setCustomValidity("Enter an even number of hexadecimal digits."),e.reportValidity();return}e.setCustomValidity(""),this.updateLayer({excess:t})}emitContent(e){this.dispatchEvent(new CustomEvent("content-changed",{detail:{content:e},bubbles:!0,composed:!0}))}installContent(e){this.content=e,this.emitContent(e)}static{this.styles=le`
    :host {
      display: block;
      --studio-blue: var(--primary-color, #2f6fed);
      --studio-blue-soft: color-mix(
        in srgb,
        var(--studio-blue) 13%,
        transparent
      );
      --studio-border: var(--divider-color, #d8dce2);
      --studio-card: var(--card-background-color, #fff);
      --studio-muted: var(--secondary-text-color, #68707c);
      --studio-danger: var(--error-color, #db4437);
    }

    * {
      box-sizing: border-box;
    }

    button,
    input,
    select {
      min-height: 44px;
      font: inherit;
    }

    h3,
    p {
      margin-top: 0;
    }

    h3 {
      margin-bottom: 16px;
      font-size: 16px;
    }

    .movement-live {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }

    .card {
      min-width: 0;
      padding: 20px;
      border: 1px solid var(--studio-border);
      border-radius: 10px;
      background: var(--studio-card);
    }

    .layer-card {
      margin-bottom: 18px;
    }

    .layer-toolbar,
    .layer-actions,
    .card-heading,
    .pattern-toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .layer-toolbar {
      align-items: stretch;
    }

    .layer-tabs,
    .pattern-tabs {
      display: flex;
      flex: 1;
      gap: 6px;
      min-width: 0;
      overflow-x: auto;
      padding-bottom: 2px;
      scrollbar-width: thin;
    }

    .layer-tabs button,
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

    .layer-tabs button.selected,
    .pattern-tabs button.selected,
    .priority-row button.selected,
    .segmented button.selected {
      color: var(--studio-blue);
      border-color: var(--studio-blue);
      background: var(--studio-blue-soft);
      font-weight: 650;
    }

    .add-button,
    .secondary {
      flex: 0 0 auto;
      padding: 8px 14px;
      border: 1px solid var(--studio-border);
      border-radius: 8px;
      color: var(--primary-text-color);
      background: var(--studio-card);
      font-weight: 600;
      cursor: pointer;
    }

    .add-button {
      color: var(--studio-blue);
      border-style: dashed;
    }

    .layer-actions {
      flex-wrap: wrap;
      margin-top: 12px;
    }

    .danger {
      color: var(--studio-danger) !important;
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

    .effect-preview {
      display: block;
      margin-bottom: 18px;
    }

    .control-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
    }

    .wide-card {
      grid-column: 1 / -1;
    }

    .coverage {
      display: grid;
      grid-template-columns: repeat(10, 1fr);
      gap: 4px;
      margin-bottom: 16px;
    }

    .coverage span {
      min-height: 44px;
      border: 1px solid var(--studio-border);
      border-radius: 5px;
      background: var(--secondary-background-color, #f5f6f8);
    }

    .coverage span.covered {
      border-color: var(--studio-blue);
      background: var(--studio-blue);
    }

    .field,
    .range-field {
      display: grid;
      gap: 7px;
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
      color: var(--primary-text-color);
      border: 1px solid var(--studio-border);
      border-radius: 8px;
      background: var(--studio-card);
    }

    .range-field {
      grid-template-columns: minmax(112px, auto) minmax(100px, 1fr) 74px;
      align-items: center;
    }

    .range-field output {
      color: var(--primary-text-color);
      font-variant-numeric: tabular-nums;
      text-align: end;
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

    button:disabled,
    input:disabled,
    select:disabled {
      cursor: not-allowed;
      opacity: 0.52;
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

      .layer-toolbar {
        flex-direction: column;
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

      .layer-actions {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
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
  `}}Ee([x({attribute:!1})],ue.prototype,"content");Ee([x({type:Boolean})],ue.prototype,"disabled");Ee([b()],ue.prototype,"activeLayerIndex");Ee([b()],ue.prototype,"activePatternIndex");Ee([b()],ue.prototype,"movementAnnouncement");function hs(){return{kind:"advanced",layers:[oi()]}}function ke(s){return{kind:"advanced",layers:s.layers.map(B)}}function oi(){return{area:{start_tenths:0,width_tenths:10},selection:{type:0,param_1:0,param_2:1},brightness_gradient:!1,brightness_patterns:[di()],distribution:{method:1,backwards:!1},colour_speed:128,colour_retention:20,palette:[[255,0,0],[0,0,255]],selected_movement:Bt(),overall_movement:Bt(),priority:0,unknown_flags:0,excess:""}}function di(){return{scope_high:255,scope_low:0,order:0,change_speed:128,brightest_retention:20,darkest_retention:20}}function Bt(){return{enabled:!1,enter_exit:!1,direction:0,distance:1,speed:128,unknown_flags:0}}function B(s){return{...s,area:{...s.area},selection:{...s.selection},brightness_patterns:s.brightness_patterns.map(e=>({...e})),distribution:{...s.distribution},palette:s.palette.map(e=>[...e]),selected_movement:{...s.selected_movement},overall_movement:{...s.overall_movement}}}function fs(s){return ni.includes(s)}function ms(s){return ai.includes(s)}function ci(s){return Math.round(j(s,0,255)/255*100)}function me(s){return`${ci(s)}% · ${s}`}function De(s){return s.toString(16).padStart(2,"0").toUpperCase()}function gs(s){const e=s.trim().replace(/^0x/i,"");if(/^[0-9a-f]{1,2}$/i.test(e))return Number.parseInt(e,16)}function j(s,e,t){return Math.min(t,Math.max(e,Math.round(s)))}customElements.get("govee-advanced-effect-editor")||customElements.define("govee-advanced-effect-editor",ue);const bs=1,li=1,vs=1,R=128,W=65536,pi=512,ui=256,hi=32,fi=128,mi=512,$=255,ys=64,$s=262144,qt=16,_s=4096,ws=16384,se=1024,qe=16384,vt=Number.MAX_SAFE_INTEGER,xs=4335,ks=232,Ss=253;function Cs(s){const e=g(s,"editor info"),t=g(e.limits,"editor limits");return{api_version:f(e.api_version,"API version",1),effect_schema_version:f(e.effect_schema_version,"effect schema version",1),compiler_version:f(e.compiler_version,"compiler version",1),limits:{effect_name:O(t.effect_name,R,"effect-name limit"),effect_document_bytes:O(t.effect_document_bytes,W,"effect-document limit"),devices:O(t.devices,pi,"device limit"),library_items:O(t.library_items,ui,"library-item limit"),drafts_per_owner:O(t.drafts_per_owner,hi,"draft limit"),deployment_records:O(t.deployment_records,fi,"deployment limit"),scene_catalogue_entries:O(t.scene_catalogue_entries,mi,"scene catalogue limit")}}}function Is(s){const e=k(s,"devices",pi).map((t,i)=>{const r=g(t,`devices[${i}]`),n=g(r.custom_effects,`devices[${i}].custom_effects`);return{config_entry_id:v(r.config_entry_id,`devices[${i}].config_entry_id`,$),model:v(r.model,`devices[${i}].model`,$),display_name:v(r.display_name,`devices[${i}].display_name`,$),segment_count:f(r.segment_count,`devices[${i}].segment_count`,0,65535),custom_effects:{painted:re(n.painted,"painted capability"),single:re(n.single,"single capability"),multi:re(n.multi,"multi capability"),advanced:re(n.advanced,"advanced capability")},readback:v(r.readback,`devices[${i}].readback`,$)}});return Ae(e,t=>t.config_entry_id,"device IDs"),e}function Es(s){J(s,"custom-effect catalogue",W);const e=g(s,"custom-effect catalogue"),t=g(e.limits,"custom-effect limits"),i=g(e.apply,"custom-effect Apply capabilities");return{schema_version:f(e.schema_version,"catalogue schema",1),sku:Y(e.sku,"catalogue SKU"),effects:k(e.effects,"custom-effect templates",se).map((r,n)=>{const a=g(r,`custom-effect templates[${n}]`);return{id:v(a.id,"template ID",$),label:v(a.label,"template label",R),family:f(a.family,"template family",0,255),variant:f(a.variant,"template variant",0,255)}}),limits:{palette_min:f(t.palette_min,"minimum palette",1,255),palette_max:f(t.palette_max,"maximum palette",1,255),multi_max:f(t.multi_max,"maximum Multi effects",1,255)},apply:{single:re(i.single,"Single Apply capability"),multi:re(i.multi,"Multi Apply capability")}}}function Ft(s){const e=g(s,"library snapshot"),t={library_revision:z(e.library_revision,"library revision",0),items:k(e.items,"library items",ui).map((i,r)=>{const n=g(i,`library items[${r}]`),a=n.template===void 0?void 0:He(n.template,`library items[${r}].template`);return{id:v(n.id,"library item ID",$),revision:z(n.revision,"library item revision",1),name:v(n.name,"library item name",R),kind:v(n.kind,"library item kind",$),...a?{template:a}:{}}})};return Ae(t.items,i=>i.id,"library item IDs"),t}function Fe(s){J(s,"library item",W);const e=g(s,"library item"),t=e.target_hint===void 0?void 0:g(e.target_hint,"target hint");return{schema_version:O(e.schema_version,li,"effect schema version"),id:v(e.id,"effect ID",$),revision:z(e.revision,"effect revision",1),name:v(e.name,"effect name",R),content:gi(e.content),provenance:Ht(e.provenance,"effect provenance"),extensions:Ht(e.extensions,"effect extensions"),...t?{target_hint:{model:t.model===null?null:v(t.model,"target model",$),segment_count:t.segment_count===null?null:f(t.segment_count,"target segment count",1,65535)}}:{}}}function As(s){const e=k(s,"draft summaries",hi).map((t,i)=>{const r=g(t,`draft summaries[${i}]`);return{id:v(r.id,"draft ID",$),revision:z(r.revision,"draft revision",1),name:v(r.name,"draft name",R),updated_at:$t(r.updated_at,"draft timestamp"),selected_config_entry_id:Se(r.selected_config_entry_id,"draft config entry ID")}});return Ae(e,t=>t.id,"draft IDs"),e}function Ze(s){const e=g(s,"effect draft");return{id:v(e.id,"draft ID",$),owner_id:v(e.owner_id,"draft owner",$),revision:z(e.revision,"draft revision",1),item:Fe(e.item),updated_at:$t(e.updated_at,"draft timestamp"),selected_config_entry_id:Se(e.selected_config_entry_id,"draft config entry ID"),base_item_id:Se(e.base_item_id,"draft base item ID"),base_item_revision:e.base_item_revision===null?null:z(e.base_item_revision,"draft base item revision",1)}}function at(s){const e=g(s,"deployment"),t=Y(e.phase,"deployment phase");t!=="pending"&&t!=="uploading"&&t!=="verifying"&&t!=="confirmed"&&t!=="failed"&&t!=="interrupted"&&t!=="unknown"&&m("deployment phase is invalid");const i={operation_id:v(e.operation_id,"deployment operation ID",$),config_entry_id:v(e.config_entry_id,"deployment config entry ID",$),diy_code:f(e.diy_code,"deployment DIY code",0,65535),phase:t,updated_at:$t(e.updated_at,"deployment timestamp"),item_id:Se(e.item_id,"deployment item ID"),item_revision:e.item_revision===null?null:z(e.item_revision,"deployment item revision",1),error_code:Se(e.error_code,"deployment error code"),progress_current:f(e.progress_current,"deployment progress",0,1024),progress_total:f(e.progress_total,"deployment progress total",0,1024)};return i.progress_current>i.progress_total&&m("deployment progress exceeds its total"),i}function Ps(s){const e=g(s,"deployment snapshot"),t={revision:z(e.revision,"deployment revision",0),deployments:k(e.deployments,"deployments",fi).map(at)};return Ae(t.deployments,i=>i.operation_id,"deployment operation IDs"),t}function Ds(s){J(s,"scene catalogue",$s,ws);const e=g(s,"scene catalogue");return{schema_version:f(e.schema_version,"scene catalogue schema",1),sku:v(e.sku,"scene catalogue SKU",$),enabled:ce(e.enabled,"scene catalogue enabled"),categories:k(e.categories,"scene categories",se).map((t,i)=>{const r=g(t,`scene categories[${i}]`);return{id:f(r.id,"scene category ID",0,65535),name:v(r.name,"scene category name",R)}}),scenes:k(e.scenes,"scenes",mi).map(yt)}}function Ts(s){const e=g(s,"scene detail");J({scene:e.scene,content:e.content},"scene detail",W);const t=gi(e.content);t.kind!=="scene_builtin"&&t.kind!=="scene_palette"&&t.kind!=="scene_layered"&&m("scene detail content is unsupported");const i=yt(e.scene),r=Ls(e.preview_profile,t.template,i);return{scene:i,content:t,...r?{preview_profile:r}:{}}}function Ls(s,e,t){if(s!==void 0)try{const i=Ms(s);return i.sku!==e.sku||i.scene_id!==e.scene_id||i.effect_id!==e.effect_id||i.scene_id!==t.scene_id||i.effect_id!==t.effect_id?void 0:i}catch{return}}function Ms(s){const e=g(s,"capture-backed preview profile"),t=["schema_version","fidelity","sku","scene_id","effect_id","review_state","minimum_review_confidence","review_confidence","primitive","illuminated_segments","limitations","evidence","palette"],i=V(e.primitive,["static","directional_sweep"],"capture-backed preview primitive");Te(e,i==="static"?t:[...t,"direction","period_seconds","travelling_bands"],"capture-backed preview profile");const r=et(e.minimum_review_confidence,"capture-backed preview minimum review confidence",0,1,!1),n=et(e.review_confidence,"capture-backed preview review confidence",0,1,!1);n<r&&m("capture-backed preview review confidence is below its minimum");const a=k(e.illuminated_segments,"capture-backed preview illuminated segments",15).map(y=>f(y,"capture-backed preview illuminated segment",0,14));a.length===0&&m("capture-backed preview must name an illuminated segment"),Ae(a,y=>String(y),"capture-backed preview illuminated segments");const d=k(e.limitations,"capture-backed preview limitations",32).map(y=>v(y,"capture-backed preview limitation",qe));d.length===0&&m("capture-backed preview must include evidence limitations");const c=g(e.evidence,"capture-backed preview evidence");Te(c,["corpus_id","contact_sheet_sha256"],"capture-backed preview evidence");const p=v(c.contact_sheet_sha256,"capture-backed preview contact sheet SHA-256",64);/^[0-9a-f]{64}$/.test(p)||m("capture-backed preview contact sheet SHA-256 is invalid");const u={schema_version:O(e.schema_version,1,"capture-backed preview schema version"),fidelity:V(e.fidelity,["capture_backed"],"capture-backed preview fidelity"),sku:v(e.sku,"capture-backed preview SKU",$),scene_id:f(e.scene_id,"capture-backed preview scene ID",0,65535),effect_id:f(e.effect_id,"capture-backed preview effect ID",0,65535),review_state:V(e.review_state,["reviewed"],"capture-backed preview review state"),minimum_review_confidence:r,review_confidence:n,illuminated_segments:a,limitations:d,evidence:{corpus_id:v(c.corpus_id,"capture-backed preview corpus ID",$),contact_sheet_sha256:p}},h=g(e.palette,"capture-backed preview palette");if(i==="static"){Te(h,["colour_space","segment_rgb"],"capture-backed static preview palette");const y=k(h.segment_rgb,"capture-backed static preview palette",15);return y.length!==15&&m("capture-backed static preview palette must contain 15 colours"),{...u,primitive:i,palette:{colour_space:V(h.colour_space,["uncalibrated_camera_srgb"],"capture-backed preview colour space"),segment_rgb:y.map((D,Q)=>U(D,`capture-backed static preview colour ${Q+1}`))}}}return Te(h,["colour_space","base_rgb","band_rgb"],"capture-backed directional sweep palette"),{...u,primitive:i,palette:{colour_space:V(h.colour_space,["uncalibrated_camera_srgb"],"capture-backed preview colour space"),base_rgb:U(h.base_rgb,"capture-backed directional sweep base colour"),band_rgb:U(h.band_rgb,"capture-backed directional sweep band colour")},direction:V(e.direction,["towards_first_segment","towards_last_segment"],"capture-backed directional sweep direction"),period_seconds:et(e.period_seconds,"capture-backed directional sweep period",0,Number.MAX_VALUE,!1),travelling_bands:f(e.travelling_bands,"capture-backed directional sweep travelling bands",1,15)}}function gi(s){J(s,"effect content",W);const e=g(s,"effect content"),t=v(e.kind,"effect content kind",$);switch(t){case"h617a_painted":return{kind:t,effect:V(e.effect,["clockwise","counter_clockwise"],"painted effect"),speed:f(e.speed,"painted speed",0,100),brightness:f(e.brightness,"painted brightness",0,100),background:U(e.background,"painted background"),groups:k(e.groups,"paint groups",15).map((i,r)=>{const n=g(i,`paint groups[${r}]`);return{fill:U(n.fill,"paint-group fill"),segments:k(n.segments,"painted segments",15).map(a=>f(a,"painted segment",0,14))}})};case"h617a_single":return{kind:t,family:f(e.family,"Single family",0,254),variant:f(e.variant,"Single variant",0,255),speed:f(e.speed,"Single speed",0,100),palette:je(e.palette,"Single palette",8)};case"h617a_multi":return{kind:t,effects:k(e.effects,"Multi effects",4).map((i,r)=>{const n=g(i,`Multi effects[${r}]`);return{family:f(n.family,"Multi family",0,254),variant:f(n.variant,"Multi variant",0,255)}}),speed:f(e.speed,"Multi speed",0,100),palette:je(e.palette,"Multi palette",8)};case"advanced":return{kind:t,layers:Ut(e.layers,"Advanced layers")};case"scene_builtin":return{kind:t,template:He(e.template,"scene template"),speed_index:ot(e.speed_index,"scene speed index",0,255)};case"scene_palette":return Ns(e);case"scene_layered":{const i=g(e.effect,"layered scene effect"),r=bi(e.trailing_padding,"layered scene trailing padding");return{kind:t,template:He(e.template,"layered scene template"),effect:{layers:Ut(i.layers,"layered scene layers")},speed_index:ot(e.speed_index,"layered scene speed index",0,255),raw_param:vi(e.raw_param,"layered scene raw parameter"),...r===void 0?{}:{trailing_padding:r}}}default:{const{kind:i,...r}=e;return{kind:"opaque",source_kind:t,body:r}}}}function bi(s,e){if(s!==void 0)return f(s,e,0,xs)}function Ns(s){const t=f(s.layout,"palette scene layout",0,1)===0?0:1,i=k(s.steps,"palette scene steps",255).map((d,c)=>{const p=g(d,`palette scene steps[${c}]`),u=t===0?(p.inline_colour!==null&&m(`palette scene steps[${c}].inline_colour must be null for layout 0`),null):U(p.inline_colour,`palette scene steps[${c}].inline_colour`);return{value:f(p.value,`palette scene steps[${c}].value`,0,65535),colour:U(p.colour,`palette scene steps[${c}].colour`),inline_colour:u}}),r=je(s.palette,"palette scene shared palette",255,!0);t===1&&r.length!==0&&m("palette scene layout 1 must not have a shared palette");let n;s.config_flags!==void 0&&(n=f(s.config_flags,"palette scene config flags",0,255),n&-9&&m("palette scene config flags must only set reserved config bits"));const a=bi(s.trailing_padding,"palette scene trailing padding");return{kind:"scene_palette",template:He(s.template,"palette scene template"),layout:t,brightness_flag:ce(s.brightness_flag,"palette scene brightness flag"),steps:i,palette:r,speed_index:ot(s.speed_index,"palette scene speed index",0,255),...n===void 0?{}:{config_flags:n},...a===void 0?{}:{trailing_padding:a}}}function ge(s){return s.kind!=="opaque"?s:(J(s.body,"opaque content",W),{...s.body,kind:v(s.source_kind,"opaque source kind",$)})}function yt(s){const e=g(s,"scene"),t=Y(e.parameter_kind,"scene parameter kind");t!=="none"&&t!=="palette"&&t!=="layers"&&t!=="opaque"&&m("scene parameter kind is invalid");const i=e.speed===null?null:(()=>{const r=g(e.speed,"scene speed");return{option_count:f(r.option_count,"scene speed option count",1,256),default_index:f(r.default_index,"scene default speed",0,255)}})();return{scene_id:f(e.scene_id,"scene ID",0,65535),effect_id:f(e.effect_id,"scene effect ID",0,65535),category_id:f(e.category_id,"scene category ID",0,65535),category:v(e.category,"scene category",R),name:v(e.name,"scene name",R),variant:Rs(e.variant,"scene variant",$),display_name:v(e.display_name,"scene display name",R),scene_type:f(e.scene_type,"scene type",0,255),parameter_kind:t,speed:i}}function Ut(s,e){return k(s,e,255).map((t,i)=>Os(t,`${e}[${i}]`))}function Os(s,e){const t=g(s,e),i=g(t.area,`${e}.area`),r=g(t.selection,`${e}.selection`),n=g(t.distribution,`${e}.distribution`);return{area:{start_tenths:f(i.start_tenths,`${e}.area.start_tenths`,0,15),width_tenths:f(i.width_tenths,`${e}.area.width_tenths`,0,15)},selection:{type:P(r.type,`${e}.selection.type`),param_1:P(r.param_1,`${e}.selection.param_1`),param_2:P(r.param_2,`${e}.selection.param_2`)},brightness_gradient:ce(t.brightness_gradient,`${e}.brightness_gradient`),brightness_patterns:k(t.brightness_patterns,`${e}.brightness_patterns`,255).map((a,d)=>{const c=g(a,`${e}.brightness_patterns[${d}]`);return{scope_high:P(c.scope_high,"brightness scope high"),scope_low:P(c.scope_low,"brightness scope low"),order:P(c.order,"brightness order"),change_speed:P(c.change_speed,"brightness change speed"),brightest_retention:P(c.brightest_retention,"brightest retention"),darkest_retention:P(c.darkest_retention,"darkest retention")}}),distribution:{method:f(n.method,`${e}.distribution.method`,0,127),backwards:ce(n.backwards,`${e}.distribution.backwards`)},colour_speed:P(t.colour_speed,`${e}.colour_speed`),colour_retention:P(t.colour_retention,`${e}.colour_retention`),palette:je(t.palette,`${e}.palette`,255,!0),selected_movement:zt(t.selected_movement,`${e}.selected_movement`),overall_movement:zt(t.overall_movement,`${e}.overall_movement`),priority:P(t.priority,`${e}.priority`),unknown_flags:yi(t.unknown_flags,Ss,`${e}.unknown_flags`),excess:vi(t.excess,`${e}.excess`)}}function zt(s,e){const t=g(s,e);return{enabled:ce(t.enabled,`${e}.enabled`),enter_exit:ce(t.enter_exit,`${e}.enter_exit`),direction:f(t.direction,`${e}.direction`,0,3),distance:P(t.distance,`${e}.distance`),speed:P(t.speed,`${e}.speed`),unknown_flags:yi(t.unknown_flags,ks,`${e}.unknown_flags`)}}function He(s,e){const t=g(s,e);return{sku:v(t.sku,`${e}.sku`,$),scene_id:f(t.scene_id,`${e}.scene_id`,0,65535),effect_id:f(t.effect_id,`${e}.effect_id`,0,65535),catalogue_schema_version:f(t.catalogue_schema_version,`${e}.catalogue_schema_version`,1,vt)}}function je(s,e,t,i=!1){const r=k(s,e,t);return!i&&r.length===0&&m(`${e} must not be empty`),r.map((n,a)=>U(n,`${e}[${a}]`))}function U(s,e){const t=k(s,e,3);return t.length!==3&&m(`${e} must contain three channels`),t.map(i=>f(i,`${e} channel`,0,255))}function re(s,e){return s!=="supported"&&s!=="unsupported"&&s!=="evidence_gap"&&m(`${e} is invalid`),s}function Ht(s,e){return J(s,e,W),g(s,e)}function Se(s,e){return s===null?null:v(s,e,$)}function $t(s,e){const t=v(s,e,ys);return(!/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(t)||Number.isNaN(Date.parse(t)))&&m(`${e} must be an ISO 8601 timestamp with a UTC offset`),t}function v(s,e,t){const i=Y(s,e);return(i.length===0||i.length>t)&&m(`${e} must contain 1 to ${t} characters`),i}function Rs(s,e,t){const i=Y(s,e);return i.length>t&&m(`${e} must not exceed ${t} characters`),i}function vi(s,e){const t=Y(s,e);return(t.length%2!==0||!/^[0-9a-f]*$/i.test(t))&&m(`${e} must be hexadecimal`),t}function Y(s,e){return typeof s!="string"&&m(`${e} must be a string`),s}function ce(s,e){return typeof s!="boolean"&&m(`${e} must be a boolean`),s}function f(s,e,t,i=vt){return(typeof s!="number"||!Number.isSafeInteger(s)||s<t||s>i)&&m(`${e} must be an integer from ${t} to ${i}`),s}function et(s,e,t,i,r=!0){return(typeof s!="number"||!Number.isFinite(s)||s>i||(r?s<t:s<=t))&&m(`${e} must be a number from ${r?"inclusive ":"above "}${t} to ${i}`),s}function z(s,e,t){return f(s,e,t,vt)}function O(s,e,t){const i=f(s,t,1);return i!==e&&m(`${t} is incompatible with this editor`),i}function ot(s,e,t,i){return s===null?null:f(s,e,t,i)}function P(s,e){return f(s,e,0,255)}function yi(s,e,t){const i=P(s,t);return i&~e&&m(`${t} must only set reserved bits, not bits explicit fields carry`),i}function V(s,e,t){const i=Y(s,t);return e.includes(i)||m(`${t} is invalid`),i}function g(s,e){return(typeof s!="object"||s===null||Array.isArray(s))&&m(`${e} must be an object`),s}function Te(s,e,t){const i=Object.keys(s).sort(),r=[...e].sort();(i.length!==r.length||i.some((n,a)=>n!==r[a]))&&m(`${t} fields are invalid`)}function k(s,e,t){return Array.isArray(s)||m(`${e} must be an array`),s.length>t&&m(`${e} must not exceed ${t} items`),s}function Ae(s,e,t){const i=s.map(e);new Set(i).size!==i.length&&m(`${t} must be unique`)}function J(s,e,t,i=_s){let r=0;const n=(d,c,p)=>{if(r+=1,r>i&&m(`${e} must not exceed ${i} JSON values`),p>qt&&m(`${e} must not exceed ${qt} nested levels`),!(d===null||typeof d=="boolean")){if(typeof d=="number"){(!Number.isFinite(d)||Number.isInteger(d)&&!Number.isSafeInteger(d))&&m(`${c} must be a finite JSON number`);return}if(typeof d=="string"){d.length>qe&&m(`${c} must not exceed ${qe} characters`);return}if(Array.isArray(d)){d.length>se&&m(`${c} must not exceed ${se} items`),d.forEach((u,h)=>n(u,`${c}[${h}]`,p+1));return}if(typeof d=="object"&&d!==null){const u=Object.entries(d);u.length>se&&m(`${c} must not exceed ${se} fields`),u.forEach(([h,y])=>{h.length>qe&&m(`${c} contains an oversized key`),n(y,`${c}.${h}`,p+1)});return}m(`${c} contains a non-JSON value`)}};n(s,e,0);const a=JSON.stringify(s);a===void 0&&m(`${e} must contain JSON values`),new TextEncoder().encode(a).byteLength>t&&m(`${e} must not exceed ${t} bytes`)}function m(s){throw new Error(`Malformed Effect Studio server payload: ${s}.`)}function Bs(s){return s.api_version===bs&&s.effect_schema_version===li&&s.compiler_version===vs}const tt="ha_govee_led_ble/editor";class qs{constructor(e){this.hass=e}async info(){return Cs(await this.call("info"))}async devices(){const e=await this.call("devices");return Is(A(e,"devices"))}async customCatalogue(){const e=await this.call("custom/catalogue");return Es(A(e,"catalogue"))}async library(){return Ft(await this.call("library/list"))}async item(e){const t=await this.call("library/get",{item_id:e});return Fe(A(t,"item"))}async createItem(e,t,i){const r=await this.call("library/create",{name:e,content:ge(t),expected_library_revision:i});return{item:Fe(A(r,"item")),library_revision:jt(r)}}async updateItem(e,t,i,r){const n=await this.call("library/update",{item_id:e.id,name:t,content:ge(i),expected_revision:e.revision,expected_library_revision:r});return{item:Fe(A(n,"item")),library_revision:jt(n)}}async drafts(){const e=await this.call("draft/list");return As(A(e,"drafts"))}async draft(e){const t=await this.call("draft/get",{draft_id:e});return Ze(A(t,"draft"))}async createDraft(e,t,i,r){const n=await this.call("draft/create",{name:e,content:ge(t),updated_at:new Date().toISOString(),selected_config_entry_id:i,...r?{base_item_id:r.id,base_item_revision:r.revision}:{}});return Ze(A(n,"draft"))}async updateDraft(e,t,i,r){const n=await this.call("draft/update",{draft_id:e.id,expected_revision:e.revision,name:t,content:ge(i),updated_at:new Date().toISOString(),selected_config_entry_id:r});return Ze(A(n,"draft"))}async deleteDraft(e){await this.call("draft/delete",{draft_id:e.id,expected_revision:e.revision})}async applySaved(e,t){const i=await this.call("apply",{config_entry_id:e,item_id:t.id,revision:t.revision,updated_at:new Date().toISOString()});return at(A(i,"deployment"))}async applySnapshot(e,t,i){const r=await this.call("apply_snapshot",{config_entry_id:e,name:t,content:ge(i),updated_at:new Date().toISOString()});return at(A(r,"deployment"))}async sceneCatalogue(e){const t=await this.call("scene/catalogue/list",{config_entry_id:e});return Ds(A(t,"catalogue"))}sceneDetail(e,t,i){return this.call("scene/catalogue/get",{config_entry_id:e,scene_id:t,effect_id:i}).then(Ts)}async applyScene(e,t,i){const r=await this.call("scene/apply",{config_entry_id:e,scene_id:t.scene_id,effect_id:t.effect_id,...i===null?{}:{speed_index:i}}),n=yt(A(r,"scene")),a=A(r,"readback");if(a!=="scene_identity_only")throw new Error("Malformed Effect Studio server payload: scene Apply readback is invalid.");const d=A(r,"speed_index");if(d!==null&&(typeof d!="number"||!Number.isSafeInteger(d)||d<0||d>255))throw new Error("Malformed Effect Studio server payload: scene Apply speed is invalid.");return{scene:n,speed_index:d,readback:a}}subscribeLibrary(e,t){return this.hass.connection.subscribeMessage(i=>{try{e(Ft(i))}catch(r){t?.(Vt(r))}},{type:`${tt}/library/subscribe`})}subscribeDeployments(e,t){return this.hass.connection.subscribeMessage(i=>{try{e(Ps(i))}catch(r){t?.(Vt(r))}},{type:`${tt}/deployment/subscribe`})}call(e,t={}){return this.hass.callWS({type:`${tt}/${e}`,...t})}}function A(s,e){if(typeof s!="object"||s===null||Array.isArray(s))throw new Error("Malformed Effect Studio server payload: response must be an object.");if(!(e in s))throw new Error(`Malformed Effect Studio server payload: response is missing ${e}.`);return s[e]}function jt(s){const e=A(s,"library_revision");if(typeof e!="number"||!Number.isSafeInteger(e)||e<0)throw new Error("Malformed Effect Studio server payload: library revision is invalid.");return e}function Vt(s){return s instanceof Error?s:new Error("Malformed Effect Studio server payload.")}var Fs=Object.defineProperty,Xe=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&Fs(e,t,r),r};class Pe extends L{constructor(){super(...arguments),this.disabled=!1,this.windowKeyPressed=e=>{e.key==="Escape"&&this.pickerIndex!==void 0&&(e.preventDefault(),this.closePicker())}}connectedCallback(){super.connectedCallback(),window.addEventListener("keydown",this.windowKeyPressed)}disconnectedCallback(){window.removeEventListener("keydown",this.windowKeyPressed),super.disconnectedCallback()}updated(e){e.has("pickerIndex")&&this.pickerIndex!==void 0&&this.shadowRoot?.querySelector(".modal-close")?.focus()}render(){return!this.content||!this.catalogue?l:o`
      <section class="card effect-card">
        <h3>${this.content.kind==="h617a_multi"?"Effects":"Effect"}</h3>
        ${this.content.kind==="h617a_single"?this.effectRow(this.content,0):this.renderSequence(this.content)}
      </section>

      <govee-effect-preview
        class="effect-preview"
        .model=${Zi(this.content,this.catalogue)}
      ></govee-effect-preview>

      <section class="card parameters-card">
        <h3>Parameters</h3>
        <div class="parameter-group">
          <h4>Colours</h4>
          ${this.renderPalette()}
        </div>
        <div class="parameter-group speed-group">
          <h4>Speed</h4>
          <label class="range-field">
            <span>Speed</span>
            <input
              type="range"
              min="0"
              max="100"
              .value=${String(this.content.speed)}
              ?disabled=${this.disabled}
              @input=${e=>this.emitContent({...this.content,speed:Number(e.target.value)})}
            />
            <output>${this.content.speed}%</output>
          </label>
        </div>
      </section>

      ${this.pickerIndex===void 0?l:this.renderPicker()}
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
    `}effectRow(e,t){const i=this.content?.kind==="h617a_multi";return o`
      <li
        class="effect-row"
        draggable=${i&&!this.disabled?"true":"false"}
        @dragstart=${r=>this.effectDragStarted(t,r)}
        @dragover=${r=>{i&&!this.disabled&&r.preventDefault()}}
        @drop=${r=>this.effectDropped(t,r)}
      >
        <button
          class="effect-field"
          type="button"
          data-effect-index=${t}
          aria-label="Choose effect, current ${this.effectLabel(e)}"
          ?disabled=${this.disabled}
          @click=${()=>this.openPicker(t)}
        >
          <span class="effect-name">${this.effectLabel(e)}</span>
          <span class="chevron" aria-hidden="true">›</span>
        </button>
        ${i&&!this.disabled?o`
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
            `:l}
      </li>
    `}renderPalette(){return o`
      <govee-palette-editor
        .palette=${this.content.palette}
        .minColours=${this.catalogue.limits.palette_min}
        .maxColours=${this.catalogue.limits.palette_max}
        .disabled=${this.disabled}
        @palette-changed=${e=>{this.emitContent({...this.content,palette:Us(e.detail.palette)})}}
      ></govee-palette-editor>
    `}renderPicker(){const e=this.content?.kind==="h617a_single"?this.content:this.content?.effects[this.pickerIndex??0];return o`
      <div
        class="modal-overlay"
        @click=${t=>{t.target===t.currentTarget&&this.closePicker()}}
      >
        <section
          class="modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="effect-picker-title"
          @keydown=${this.modalKeyPressed}
        >
          <div class="modal-header">
            <div>
              <h3 id="effect-picker-title">Select an effect</h3>
              <p>Choose the visual style for this step.</p>
            </div>
            <button
              class="modal-close"
              type="button"
              aria-label="Close effect picker"
              @click=${()=>this.closePicker()}
            >
              ×
            </button>
          </div>
          <div class="modal-grid">
            ${this.catalogue.effects.map(t=>{const i=e!==void 0&&Le(t)===Le(e);return o`
                <button
                  class="effect-tile ${i?"selected":""}"
                  type="button"
                  aria-pressed=${i}
                  @click=${()=>this.selectEffect(t)}
                >
                  <span>${t.label}</span>
                </button>
              `})}
          </div>
        </section>
      </div>
    `}selectEffect(e){if(!this.content||this.pickerIndex===void 0)return;const t={family:e.family,variant:e.variant};if(this.content.kind==="h617a_single")this.emitContent({...this.content,...t});else{const i=this.content.effects.map((r,n)=>n===this.pickerIndex?t:r);this.emitContent({...this.content,effects:i})}this.closePicker()}addEffect(){if(!this.content||this.content.kind!=="h617a_multi")return;const e=this.catalogue?.effects[this.content.effects.length]??this.catalogue?.effects[0];if(!e)return;const t=[...this.content.effects,{family:e.family,variant:e.variant}];this.emitContent({...this.content,effects:t})}removeEffect(e){if(!this.content||this.content.kind!=="h617a_multi")return;const t=this.content.effects.filter((i,r)=>r!==e);this.emitContent({...this.content,effects:t})}moveEffect(e,t){if(!this.content||this.content.kind!=="h617a_multi")return;const i=e+t;i<0||i>=this.content.effects.length||this.reorderEffect(e,i)}reorderEffect(e,t){if(!this.content||this.content.kind!=="h617a_multi"||e===t)return;const i=[...this.content.effects],[r]=i.splice(e,1);i.splice(t,0,r),this.emitContent({...this.content,effects:i})}effectDragStarted(e,t){this.draggedEffectIndex=e,t.dataTransfer?.setData("text/plain",String(e))}effectDropped(e,t){t.preventDefault(),this.draggedEffectIndex!==void 0&&(this.reorderEffect(this.draggedEffectIndex,e),this.draggedEffectIndex=void 0)}closeDetails(e){e.currentTarget.closest("details")?.removeAttribute("open")}openPicker(e){this.pickerIndex=e}closePicker(){const e=this.pickerIndex;this.pickerIndex=void 0,this.updateComplete.then(()=>{e!==void 0&&this.shadowRoot?.querySelector(`[data-effect-index="${e}"]`)?.focus()})}modalKeyPressed(e){if(e.key!=="Tab")return;const i=[...e.currentTarget.querySelectorAll("button:not([disabled])")];if(!i.length)return;const r=i[0],n=i[i.length-1],a=this.shadowRoot?.activeElement;e.shiftKey&&a===r?(e.preventDefault(),n.focus()):!e.shiftKey&&a===n&&(e.preventDefault(),r.focus())}effectLabel(e){return this.catalogue?.effects.find(t=>Le(t)===Le(e))?.label??"Unknown catalogue effect"}emitContent(e){this.dispatchEvent(new CustomEvent("content-changed",{detail:{content:e},bubbles:!0,composed:!0}))}static{this.styles=le`
    :host {
      display: block;
      --studio-blue: var(--primary-color, #2f6fed);
      --studio-blue-soft: color-mix(
        in srgb,
        var(--studio-blue) 13%,
        transparent
      );
      --studio-border: var(--divider-color, #d8dce2);
      --studio-card: var(--card-background-color, #fff);
      --studio-muted: var(--secondary-text-color, #68707c);
      --studio-danger: var(--error-color, #db4437);
    }

    * {
      box-sizing: border-box;
    }

    button,
    input {
      font: inherit;
    }

    button {
      min-height: 44px;
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

    .card {
      border: 1px solid var(--studio-border);
      border-radius: 10px;
      background: var(--studio-card);
    }

    .card {
      padding: 18px;
    }

    .effect-preview,
    .parameters-card {
      margin-top: 16px;
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

    .effect-field {
      display: flex;
      flex: 1;
      align-items: center;
      gap: 12px;
      min-width: 0;
      padding: 8px 14px;
      border: 1px solid var(--studio-border);
      border-radius: 8px;
      color: var(--primary-text-color);
      background: var(--secondary-background-color, #f5f6f8);
      cursor: pointer;
    }

    .effect-name {
      flex: 1;
      overflow: hidden;
      text-align: start;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .chevron {
      color: var(--studio-muted);
      font-size: 20px;
    }

    .row-menu {
      position: relative;
      flex: 0 0 44px;
    }

    .row-menu summary {
      display: grid;
      width: 44px;
      height: 44px;
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
      border-radius: 9px;
      background: var(--studio-card);
      box-shadow: 0 8px 24px rgb(0 0 0 / 18%);
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

    .add-step,
    .palette-add {
      display: grid;
      width: 44px;
      height: 44px;
      place-items: center;
      padding: 0;
      border: 1px dashed var(--studio-border);
      border-radius: 8px;
      color: var(--studio-blue);
      background: transparent;
      cursor: pointer;
      font-size: 24px;
    }

    .parameter-group + .parameter-group {
      margin-top: 18px;
      padding-top: 18px;
      border-top: 1px solid var(--studio-border);
    }

    .palette-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .swatch-item {
      position: relative;
      touch-action: pan-y;
    }

    .swatch-item[draggable="true"] {
      cursor: grab;
    }

    .swatch {
      width: 44px;
      height: 44px;
      padding: 0;
      border: 1px solid rgb(0 0 0 / 14%);
      border-radius: 8px;
      background: var(--swatch-colour);
      cursor: pointer;
    }

    .swatch:focus-visible {
      outline: 3px solid var(--studio-blue);
      outline-offset: 2px;
    }

    .colour-popover {
      position: absolute;
      z-index: 25;
      top: 52px;
      left: 0;
      width: min(300px, calc(100vw - 48px));
      padding: 10px;
      border: 1px solid var(--studio-border);
      border-radius: 9px;
      background: var(--studio-card);
      box-shadow: 0 8px 24px rgb(0 0 0 / 18%);
    }

    .preset-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
    }

    .preset-grid button {
      min-height: 52px;
      border: 1px solid rgb(0 0 0 / 12%);
      border-radius: 6px;
      background: var(--preset-colour);
      cursor: pointer;
    }

    .custom-colour {
      display: grid;
      grid-template-columns: 1fr 64px;
      align-items: center;
      gap: 10px;
      margin-top: 10px;
      color: var(--studio-muted);
      font-size: 13px;
      font-weight: 600;
    }

    .custom-colour input {
      width: 64px;
      height: 44px;
      padding: 3px;
      border: 1px solid var(--studio-border);
      border-radius: 7px;
      background: var(--studio-card);
    }

    .colour-actions {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px;
      margin-top: 10px;
    }

    .colour-actions button {
      padding: 8px 10px;
      border: 1px solid var(--studio-border);
      border-radius: 7px;
      color: var(--primary-text-color);
      background: var(--studio-card);
      cursor: pointer;
    }

    .colour-actions .danger {
      grid-column: 1 / -1;
    }

    .range-field {
      display: grid;
      grid-template-columns: 70px minmax(100px, 1fr) 44px;
      align-items: center;
      gap: 10px;
      color: var(--studio-muted);
      font-size: 13px;
      font-weight: 600;
    }

    .range-field output {
      color: var(--primary-text-color);
      text-align: end;
    }

    .modal-overlay {
      position: fixed;
      z-index: 1000;
      inset: 0;
      display: grid;
      place-items: center;
      padding: 24px;
      background: rgb(0 0 0 / 48%);
    }

    .modal {
      width: min(680px, 100%);
      max-height: min(760px, calc(100vh - 48px));
      overflow: auto;
      padding: 18px;
      border: 1px solid var(--studio-border);
      border-radius: 12px;
      background: var(--studio-card);
      box-shadow: 0 16px 48px rgb(0 0 0 / 28%);
    }

    .modal-header {
      display: flex;
      align-items: start;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 14px;
    }

    .modal-header h3 {
      margin-bottom: 4px;
      font-size: 18px;
    }

    .modal-header p {
      margin-bottom: 0;
      color: var(--studio-muted);
      font-size: 13px;
    }

    .modal-close {
      flex: 0 0 44px;
      width: 44px;
      padding: 0;
      border: 1px solid var(--studio-border);
      border-radius: 50%;
      color: var(--primary-text-color);
      background: var(--studio-card);
      cursor: pointer;
      font-size: 22px;
    }

    .modal-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }

    .effect-tile {
      display: grid;
      gap: 8px;
      min-width: 0;
      padding: 9px;
      border: 2px solid transparent;
      border-radius: 9px;
      color: var(--primary-text-color);
      background: var(--secondary-background-color, #f5f6f8);
      text-align: start;
      cursor: pointer;
    }

    .effect-tile.selected {
      color: var(--studio-blue);
      border-color: var(--studio-blue);
      font-weight: 650;
    }

    button:disabled,
    input:disabled {
      cursor: not-allowed;
      opacity: 0.52;
    }

    .effect-field:disabled,
    .swatch:disabled {
      cursor: default;
      opacity: 1;
    }

    @media (max-width: 600px) {
      .colour-popover {
        position: fixed;
        top: 50%;
        right: 24px;
        left: 24px;
        width: auto;
        max-height: calc(100vh - 48px);
        overflow: auto;
        transform: translateY(-50%);
      }

      .modal-overlay {
        align-items: end;
        padding: 12px;
      }

      .modal {
        max-height: calc(100vh - 24px);
      }

      .modal-grid {
        grid-template-columns: 1fr;
      }
    }
  `}}Xe([x({attribute:!1})],Pe.prototype,"content");Xe([x({attribute:!1})],Pe.prototype,"catalogue");Xe([x({type:Boolean})],Pe.prototype,"disabled");Xe([b()],Pe.prototype,"pickerIndex");function Le(s){return`${s.family}:${s.variant}`}function Us(s){return s.map(e=>[...e])}customElements.get("govee-custom-effect-editor")||customElements.define("govee-custom-effect-editor",Pe);var zs=Object.defineProperty,I=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&zs(e,t,r),r};class S extends L{constructor(){super(...arguments),this.library={library_revision:0,items:[]},this.isAdmin=!1,this.category="all",this.name="",this.speedIndex=null,this.loading=!1,this.saving=!1,this.applying=!1,this.requestGeneration=0}willUpdate(e){(e.has("device")||e.has("api"))&&(this.invalidateRequests(),this.catalogue=void 0,this.category="all",this.selectedScene=void 0,this.selectedItem=void 0,this.content=void 0,this.previewProfile=void 0,this.notice=void 0,this.error=void 0,this.loading=!!(this.api&&this.device))}updated(e){(e.has("device")||e.has("api"))&&this.api&&this.device&&this.loadCatalogue()}render(){return this.device?this.loading?o`<div class="status" role="status">Loading scenes...</div>`:this.error||!this.catalogue?o`
        <section class="empty">
          <h2>Scenes are unavailable</h2>
          <p role="alert">${this.error??"The scene catalogue could not be loaded."}</p>
        </section>
      `:o`
      <aside class="categories" aria-label="Scene categories">
        <p class="eyebrow">Scenes</p>
        ${this.categoryButton("all","All scenes")}
        ${this.categoryButton("custom","Custom")}
        ${this.catalogue.categories.map(e=>this.categoryButton(e.id,e.name))}
      </aside>

      <aside class="scenes" aria-label="Scenes">
        <div class="scenes-heading">
          <p class="eyebrow">${this.categoryLabel}</p>
          <h2>Scenes</h2>
        </div>
        ${this.filteredCustomScenes.map(e=>this.sceneButton(`custom:${e.id}`,e.name,"Custom",()=>this.selectCustom(e)))}
        ${this.filteredBuiltinScenes.map(e=>this.sceneButton(ee(e),e.display_name,e.parameter_kind==="none"?"Built-in":e.parameter_kind==="palette"?"Colours":e.parameter_kind==="layers"?"Layers":"Built-in",()=>this.selectBuiltin(e)))}
        ${!this.filteredCustomScenes.length&&!this.filteredBuiltinScenes.length?o`<p class="empty-list">No scenes in this category.</p>`:l}
      </aside>

      <section class="detail">
        ${this.notice?o`<div class="notice" role="status">${this.notice}</div>`:l}
        ${this.selectedScene&&this.content?this.renderDetail():o`
              <div class="empty">
                <h2>Select a scene</h2>
                <p>
                  Choose a built-in or custom scene to inspect its documented
                  controls.
                </p>
              </div>
            `}
      </section>
    `:o`
        <section class="empty">
          <h2>No loaded device</h2>
          <p>Load a Govee light before browsing its native scenes.</p>
        </section>
      `}get categoryLabel(){return this.category==="all"?"All scenes":this.category==="custom"?"Custom":this.catalogue?.categories.find(e=>e.id===this.category)?.name??"Scenes"}get compatibleCustomScenes(){return this.library.items.filter(e=>(e.kind==="scene_builtin"||e.kind==="scene_palette")&&e.template?.sku===this.catalogue?.sku)}get filteredCustomScenes(){return this.category==="all"||this.category==="custom"?this.compatibleCustomScenes:[]}get filteredBuiltinScenes(){return!this.catalogue||this.category==="custom"?[]:this.category==="all"?this.catalogue.scenes:this.catalogue.scenes.filter(e=>e.category_id===this.category)}get selectionKey(){return this.selectedItem?`custom:${this.selectedItem.id}`:this.selectedScene?ee(this.selectedScene):void 0}categoryButton(e,t){const i=this.category===e;return o`
      <button
        class="selector ${i?"selected":""}"
        type="button"
        aria-current=${i?"page":l}
        @click=${()=>this.selectCategory(e)}
      >
        ${t}
      </button>
    `}sceneButton(e,t,i,r){const n=this.selectionKey===e;return o`
      <button
        class="selector scene ${n?"selected":""}"
        type="button"
        aria-pressed=${n}
        @click=${r}
      >
        <span>${t}</span>
        <small>${i}</small>
      </button>
    `}renderDetail(){const e=this.selectedScene,t=this.selectedItem!==void 0,i=this.capturePreviewProfile;return o`
      <header class="detail-heading">
        <div>
          <p class="eyebrow">
            ${t?"Custom scene":e.category}
          </p>
          ${t?o`
                <input
                  class="name"
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
            class="secondary"
            type="button"
            title=${this.content?.kind==="scene_layered"?"Use as template to save an editable layered copy":l}
            ?disabled=${!this.isAdmin||this.saving||!this.hasCurrentSceneContent()||this.content?.kind==="scene_layered"}
            @click=${this.save}
          >
            ${this.saving?"Saving...":t?"Save":"Save copy"}
          </button>
          <button
            class="primary"
            type="button"
            aria-describedby=${t&&this.content?.kind==="scene_palette"?"palette-apply-reason":l}
            ?disabled=${!this.isAdmin||!this.catalogue?.enabled||!this.hasCurrentSceneContent()||this.selectedItem!==void 0&&this.content?.kind!=="scene_builtin"||this.applying}
            @click=${this.apply}
          >
            ${this.applying?"Applying...":"Apply"}
          </button>
        </div>
      </header>

      ${this.catalogue?.enabled?l:o`
            <div class="callout" role="note">
              Native scenes are disabled for this device in the integration
              options. Browsing and saving copies remain available.
            </div>
          `}

      ${t&&this.content?.kind==="scene_palette"?o`
            <div class="callout" id="palette-apply-reason" role="note">
              Saved palette scene copies cannot be applied. Apply the native
              catalogue scene through its scene identity instead.
            </div>
          `:l}

      <section class="card">
        <h3>Common settings</h3>
        ${e.speed?o`
              <div class="setting">
                <span>Speed</span>
                <div class="segmented" role="group" aria-label="Scene speed">
                  ${Array.from({length:e.speed.option_count},(r,n)=>o`
                      <button
                        class=${this.speedIndex===n?"selected":""}
                        type="button"
                        aria-pressed=${this.speedIndex===n}
                        ?disabled=${!this.isAdmin}
                        @click=${()=>{this.speedIndex=n}}
                      >
                        ${Hs(n,e.speed.default_index)}
                      </button>
                    `)}
                </div>
              </div>
            `:o`
              <p class="muted">
                This scene has no documented adjustable speed.
              </p>
            `}
      </section>

      ${i?o`
            <govee-effect-preview
              class="scene-preview"
              .model=${ts(i,{selectedIndex:this.speedIndex,defaultIndex:e.speed?.default_index??null})}
            ></govee-effect-preview>
          `:l}

      ${this.content?.kind==="scene_builtin"?o`
            <govee-effect-preview
              class="scene-preview"
              .model=${es(this.content)}
            ></govee-effect-preview>
          `:this.content?.kind==="scene_palette"?o`
              <govee-effect-preview
                class="scene-preview"
                .model=${is(this.content)}
              ></govee-effect-preview>
            `:this.content?.kind==="scene_layered"?o`
                <govee-effect-preview
                  class="scene-preview"
                  .model=${ss(this.content)}
                ></govee-effect-preview>
              `:l}

      ${e.parameter_kind==="layers"?o`
            <section class="card">
              <h3>Layers</h3>
              <p class="muted">
                Open this decoded scene in Advanced to edit and save a layered
                copy. Native scene Apply remains separate.
              </p>
              <button
                class="secondary"
                type="button"
                ?disabled=${!this.isAdmin||e.scene_type!==2||!this.hasCurrentSceneContent()||this.content?.kind!=="scene_layered"}
                @click=${this.useAsTemplate}
              >
                Use as template
              </button>
            </section>
          `:l}
    `}async loadCatalogue(){if(!this.api||!this.device)return;const e=this.beginRequest();this.loading=!0,this.error=void 0,this.notice=void 0,this.selectedScene=void 0,this.selectedItem=void 0,this.content=void 0,this.previewProfile=void 0;try{const t=await e.api.sceneCatalogue(e.deviceId);if(!this.requestIsCurrent(e))return;this.catalogue=t,this.category="all"}catch(t){this.requestIsCurrent(e)&&(this.error=be(t))}finally{this.requestIsCurrent(e)&&(this.loading=!1)}}selectCategory(e){this.invalidateRequests(),this.category=e,this.selectedScene=void 0,this.selectedItem=void 0,this.content=void 0,this.previewProfile=void 0,this.notice=void 0}async selectBuiltin(e){if(!this.api||!this.device)return;const t=ee(e),i=this.beginRequest(t);this.notice=void 0,this.selectedScene=e,this.selectedItem=void 0,this.content=void 0,this.previewProfile=void 0,this.name=e.display_name,this.speedIndex=e.speed?.default_index??null;try{const r=await i.api.sceneDetail(i.deviceId,e.scene_id,e.effect_id);if(!this.requestIsCurrent(i)||ee(r.scene)!==t)return;this.selectedScene=r.scene,this.content=r.content,this.previewProfile=r.preview_profile,this.name=r.scene.display_name,this.speedIndex=r.content.speed_index}catch(r){this.requestIsCurrent(i)&&(this.notice=be(r))}}async selectCustom(e){if(!this.api||!this.device||!this.catalogue)return;const t=this.catalogue,i=this.beginRequest(`custom:${e.id}`);this.notice=void 0,this.selectedScene=void 0,this.selectedItem=void 0,this.content=void 0,this.previewProfile=void 0,this.name=e.name;try{const r=await i.api.item(e.id);if(!this.requestIsCurrent(i))return;if(r.content.kind!=="scene_builtin"&&r.content.kind!=="scene_palette")throw new Error("This custom scene uses an unsupported definition.");const n=r.content;if(n.template.sku!==t.sku)throw new Error(`This custom scene targets ${n.template.sku}, not ${t.sku}.`);const a=t.scenes.find(c=>c.scene_id===n.template.scene_id&&c.effect_id===n.template.effect_id);if(!a)throw new Error("The source scene is not in this device catalogue.");const d=await i.api.sceneDetail(i.deviceId,n.template.scene_id,n.template.effect_id);if(!this.requestIsCurrent(i)||ee(d.scene)!==ee(a))return;this.selectedScene=a,this.selectedItem=r,this.content=n,this.previewProfile=d.preview_profile,this.name=r.name,this.speedIndex=n.speed_index??a.speed?.default_index??null}catch(r){this.requestIsCurrent(i)&&(this.notice=be(r))}}async save(){if(!this.api||!this.device||!this.catalogue||!this.selectedScene||!this.content||!this.hasCurrentSceneContent()||this.content.kind!=="scene_builtin"&&this.content.kind!=="scene_palette"||!this.isAdmin||this.saving)return;const e=(this.selectedItem?this.name.trim():`${this.selectedScene.display_name} copy`).trim();if(!e){this.notice="Give this custom scene a name before saving.";return}const t=this.content.kind==="scene_palette"?Vs({...this.content,speed_index:this.speedIndex}):{...this.content,speed_index:this.speedIndex},i=this.captureRequest();this.saving=!0,this.notice=void 0;try{const r=this.selectedItem?await this.api.updateItem(this.selectedItem,e,t,this.library.library_revision):await this.api.createItem(e,t,this.library.library_revision);if(r.item.content.kind!=="scene_builtin"&&r.item.content.kind!=="scene_palette")throw new Error("The saved scene returned an unsupported definition.");if(this.dispatchEvent(new CustomEvent("library-item-saved",{detail:{item:r.item,library_revision:r.library_revision},bubbles:!0,composed:!0})),!this.requestIsCurrent(i))return;this.requestGeneration+=1,this.activeSelectionIdentity=`custom:${r.item.id}`,this.selectedItem=r.item,this.content=r.item.content,this.name=r.item.name,this.category="custom",this.notice="Custom scene saved."}catch(r){this.requestIsCurrent(i)&&(this.notice=Ks(r)==="conflict"?"The library changed elsewhere. Reload the scene before saving.":`Save failed: ${be(r)}`)}finally{this.saving=!1}}useAsTemplate(){!this.isAdmin||!this.selectedScene||this.selectedScene.scene_type!==2||this.content?.kind!=="scene_layered"||!this.hasCurrentSceneContent()||this.dispatchEvent(new CustomEvent("scene-template-selected",{detail:{content:js({...this.content,speed_index:this.speedIndex}),config_entry_id:this.device.config_entry_id,name:`${this.selectedScene.display_name} layered`},bubbles:!0,composed:!0}))}async apply(){if(!this.api||!this.device||!this.selectedScene||!this.hasCurrentSceneContent()||!this.isAdmin||!this.catalogue?.enabled||this.selectedItem!==void 0&&this.content?.kind!=="scene_builtin"||this.applying)return;const e=this.captureRequest(),t=this.device,i=this.selectedScene,r=this.speedIndex;this.applying=!0,this.notice=void 0;try{await e.api.applyScene(e.deviceId,i,r),this.requestIsCurrent(e)&&(this.notice=`Applied to ${t.display_name}. Scene identity can be read back; the selected speed remains optimistic.`)}catch(n){this.requestIsCurrent(e)&&(this.notice=`Apply failed: ${be(n)}`)}finally{this.applying=!1}}beginRequest(e){return this.requestGeneration+=1,this.activeSelectionIdentity=e,this.captureRequest()}captureRequest(){return{generation:this.requestGeneration,api:this.api,deviceId:this.device.config_entry_id,category:this.category,selectionIdentity:this.activeSelectionIdentity}}invalidateRequests(){this.requestGeneration+=1,this.activeSelectionIdentity=void 0}requestIsCurrent(e){return e.generation===this.requestGeneration&&e.api===this.api&&e.deviceId===this.device?.config_entry_id&&e.category===this.category&&e.selectionIdentity===this.activeSelectionIdentity}hasCurrentSceneContent(){return!this.catalogue||!this.selectedScene||!this.content||this.content.template.sku!==this.catalogue.sku||this.content.template.scene_id!==this.selectedScene.scene_id||this.content.template.effect_id!==this.selectedScene.effect_id?!1:this.activeSelectionIdentity===this.selectionKey}get capturePreviewProfile(){if(!this.previewProfile||!this.content||!this.selectedScene)return;const e=this.content.template;return this.previewProfile.sku===e.sku&&this.previewProfile.scene_id===e.scene_id&&this.previewProfile.effect_id===e.effect_id&&this.previewProfile.scene_id===this.selectedScene.scene_id&&this.previewProfile.effect_id===this.selectedScene.effect_id?this.previewProfile:void 0}static{this.styles=le`
    :host {
      display: contents;
    }

    :host([hidden]) {
      display: none !important;
    }

    * {
      box-sizing: border-box;
    }

    button,
    input {
      font: inherit;
    }

    button {
      min-height: 40px;
    }

    .categories,
    .scenes {
      overflow: auto;
      padding: 22px 16px;
      border-inline-end: 1px solid var(--studio-border);
      background: var(--primary-background-color);
    }

    .categories {
      background: var(--secondary-background-color, #f5f6f8);
    }

    .eyebrow {
      margin: 0 10px 8px;
      color: var(--studio-muted);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    h2,
    h3,
    p {
      margin-top: 0;
    }

    h2 {
      margin-bottom: 0;
      font-size: 20px;
    }

    h3 {
      margin-bottom: 16px;
      font-size: 16px;
    }

    .scenes-heading {
      margin: 0 10px 20px;
    }

    .scenes-heading .eyebrow {
      margin-inline: 0;
    }

    .selector {
      width: 100%;
      min-height: 40px;
      padding: 9px 11px;
      border: 0;
      border-radius: 8px;
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

    .scene {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .scene small {
      color: var(--studio-muted);
      font-size: 11px;
      font-weight: 500;
    }

    .detail {
      min-width: 0;
      padding: 28px;
      background: var(--secondary-background-color, #f5f6f8);
    }

    .detail-heading {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 22px;
    }

    .detail-heading .eyebrow {
      margin-inline: 0;
    }

    .name {
      width: min(460px, 100%);
      min-height: 42px;
      padding: 8px 0;
      border: 0;
      border-bottom: 1px solid var(--studio-border);
      color: var(--primary-text-color);
      background: transparent;
      font-size: 24px;
      font-weight: 600;
    }

    .actions {
      display: flex;
      gap: 9px;
    }

    .primary,
    .secondary {
      padding: 8px 17px;
      border-radius: 9px;
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

    button:disabled,
    input:disabled {
      cursor: not-allowed;
      opacity: 0.52;
    }

    .card,
    .callout,
    .notice,
    .empty {
      border: 1px solid var(--studio-border);
      border-radius: 10px;
      background: var(--studio-card);
    }

    .card {
      margin-top: 18px;
      padding: 20px;
    }

    .scene-preview {
      display: block;
      margin-top: 18px;
    }

    .callout,
    .notice {
      margin-bottom: 18px;
      padding: 12px 14px;
      line-height: 1.45;
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

    .empty p,
    .empty-list,
    .muted {
      margin-bottom: 0;
      color: var(--studio-muted);
      line-height: 1.5;
    }

    .empty-list {
      padding: 12px 10px;
    }

    .setting {
      display: grid;
      gap: 12px;
      color: var(--studio-muted);
      font-size: 13px;
      font-weight: 600;
    }

    .segmented {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
    }

    .segmented button {
      flex: 1 1 90px;
      padding: 8px 12px;
      border: 1px solid var(--studio-border);
      border-radius: 8px;
      color: var(--primary-text-color);
      background: var(--studio-card);
      cursor: pointer;
    }

    .segmented button.selected {
      color: var(--studio-blue);
      border-color: var(--studio-blue);
      background: var(--studio-blue-soft);
      font-weight: 650;
    }

    .status {
      grid-column: 2 / -1;
      padding: 48px 28px;
    }

    @media (max-width: 900px) {
      :host {
        display: block;
      }

      .categories {
        display: flex;
        gap: 6px;
        overflow-x: auto;
        padding: 12px 16px;
        border-inline-end: 0;
        border-bottom: 1px solid var(--studio-border);
      }

      .categories .eyebrow {
        display: none;
      }

      .categories .selector {
        flex: 0 0 auto;
        width: auto;
        white-space: nowrap;
      }

      .scenes {
        max-height: 340px;
        border-inline-end: 0;
        border-bottom: 1px solid var(--studio-border);
      }

      .detail {
        padding: 20px 16px 32px;
      }
    }

    @media (max-width: 600px) {
      .detail-heading {
        align-items: stretch;
        flex-direction: column;
      }

      .actions > button {
        flex: 1;
      }
    }
  `}}I([x({attribute:!1})],S.prototype,"api");I([x({attribute:!1})],S.prototype,"device");I([x({attribute:!1})],S.prototype,"library");I([x({type:Boolean})],S.prototype,"isAdmin");I([b()],S.prototype,"catalogue");I([b()],S.prototype,"category");I([b()],S.prototype,"selectedScene");I([b()],S.prototype,"selectedItem");I([b()],S.prototype,"content");I([b()],S.prototype,"previewProfile");I([b()],S.prototype,"name");I([b()],S.prototype,"speedIndex");I([b()],S.prototype,"loading");I([b()],S.prototype,"saving");I([b()],S.prototype,"applying");I([b()],S.prototype,"notice");I([b()],S.prototype,"error");function ee(s){return`builtin:${s.scene_id}:${s.effect_id}`}function Hs(s,e){const t=s-e;if(t===0)return"Default";const i=Math.abs(t);return`${t<0?"Slower":"Faster"}${i>1?` ${i}`:""}`}function js(s){return{...s,template:{...s.template},effect:{layers:ke({layers:s.effect.layers}).layers}}}function Vs(s){return{...s,template:{...s.template},steps:s.steps.map(e=>({...e,colour:[...e.colour],inline_colour:e.inline_colour===null?null:[...e.inline_colour]})),palette:s.palette.map(e=>[...e])}}function be(s){return s instanceof Error||typeof s=="object"&&s!==null&&"message"in s&&typeof s.message=="string"?s.message:"An unexpected error occurred."}function Ks(s){if(typeof s=="object"&&s!==null&&"code"in s&&typeof s.code=="string")return s.code}customElements.get("govee-scene-browser")||customElements.define("govee-scene-browser",S);var Gs=Object.defineProperty,w=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&Gs(e,t,r),r};const dt=15;class _ extends L{constructor(){super(...arguments),this.loading=!0,this.devices=[],this.section="custom",this.library={library_revision:0,items:[]},this.drafts=[],this.name="",this.content=ct(),this.foreground="#2f80ed",this.brushUsesBackground=!1,this.saving=!1,this.applying=!1,this.deployments=[],this.draftPersistPending=!1,this.editorTransitionEpoch=0,this.sceneTemplateHandoffInFlight=!1,this.loadEpoch=0,this.deploymentRevision=-1}get isAdmin(){return this.hass?.user?.is_admin===!0}get selectedDevice(){return this.devices.find(e=>e.config_entry_id===this.selectedDeviceId)}get dirty(){return E(this.content)?this.savedBaseline!==M(this.name,this.content):!1}get applyCapability(){if(!T(this.content))return;const e=this.selectedDevice?.custom_effects;if(e)switch(this.content.kind){case"h617a_painted":return e.painted;case"h617a_single":return e.single;case"h617a_multi":return e.multi}}get canApply(){return T(this.content)&&this.isAdmin&&!this.applying&&this.name.trim().length>0&&this.applyCapability==="supported"}get activeDeployment(){const e=this.deployments.find(t=>t.operation_id===this.activeOperationId);return e||!this.applying?e:this.latestDeployment(["pending","uploading","verifying"])}get customDrafts(){return this.drafts.filter(e=>ne(e.item.content.kind))}get advancedDrafts(){return this.drafts.filter(e=>ae(e.item.content.kind))}get editableDrafts(){return this.drafts.filter(e=>E(e.item.content))}connectedCallback(){super.connectedCallback(),this.hass&&!this.api&&this.load()}disconnectedCallback(){super.disconnectedCallback(),this.loadEpoch+=1,this.beginEditorTransition(),this.draftTimer!==void 0&&(window.clearTimeout(this.draftTimer),this.draftTimer=void 0,this.persistDraft()),this.stopSubscriptions(),this.api=void 0}updated(e){e.has("hass")&&this.hass&&!this.api&&this.load()}render(){return this.loading?o`<div class="centred" role="status">Loading effect studio...</div>`:this.error?this.renderFatalError():o`
      <header class="topbar">
        <div>
          <p class="eyebrow">Govee LED BLE</p>
          <h1>Effect Studio</h1>
        </div>
        <label class="device-picker">
          <span>Device</span>
          <select
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
        </label>
      </header>

      ${this.notice?o`<div class="notice" role="status">${this.notice}</div>`:l}

      <main class="studio ${this.section==="scenes"?"scenes-mode":""}">
        <nav class="primary-nav" aria-label="Create">
          <p class="nav-heading">Create</p>
          ${this.navButton("scenes","Scenes")}
          ${this.navButton("custom","Custom Effects")}
          ${this.navButton("advanced","Advanced")}
          <div class="device-summary">
            ${this.selectedDevice?o`
                  <strong>${this.selectedDevice.display_name}</strong>
                  <span>
                    ${this.selectedDevice.segment_count} segments /
                    ${this.selectedDevice.model}
                  </span>
                `:o`<span>No loaded devices</span>`}
          </div>
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
        ${this.section==="custom"?this.renderCustomEffects():this.section==="advanced"?this.renderAdvancedEffects():l}
      </main>
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
    `}renderCustomEffects(){return o`
      <aside class="library" aria-label="Custom effects">
        <div class="library-heading">
          <div>
            <p class="eyebrow">Library</p>
            <h2>Custom effects</h2>
          </div>
          ${this.isAdmin?o`
                <button
                  class="new-kind"
                  type="button"
                  @click=${()=>this.resumeOrCreateEffect("custom")}
                >
                  New effect
                </button>
              `:l}
        </div>

        ${this.renderLibraryGroup("h617a_painted","Painted")}
        ${this.renderLibraryGroup("h617a_single","Single")}
        ${this.renderLibraryGroup("h617a_multi","Multi")}

        ${!this.library.items.some(e=>ne(e.kind))&&!this.customDrafts.length?o`
              <p class="empty">
                ${this.isAdmin?"Create your first custom effect.":"No custom effects have been saved yet."}
              </p>
            `:l}
      </aside>

      <section class="editor">
        ${this.name||this.currentItem||this.currentDraft?T(this.content)?this.content.kind==="h617a_painted"?this.renderPaintedEditor():this.renderPaletteEffectEditor():this.renderEmptyEditor("Select a custom effect","Choose a saved effect to inspect it."):o`
              <div class="empty-editor">
                <h2>Select a custom effect</h2>
                <p>Choose a saved effect to inspect it.</p>
              </div>
            `}
      </section>
    `}renderAdvancedEffects(){const e=this.library.items.filter(i=>ae(i.kind)),t=this.library.items.filter(i=>!Qs(i.kind));return o`
      <aside class="library" aria-label="Advanced effects">
        <div class="library-heading">
          <div>
            <p class="eyebrow">Library</p>
            <h2>Advanced effects</h2>
          </div>
          ${this.isAdmin?o`
                <button
                  class="new-kind"
                  type="button"
                  @click=${()=>this.resumeOrCreateEffect("advanced")}
                >
                  New layered effect
                </button>
              `:l}
        </div>

        ${e.length?o`
              <p class="list-label">Layered</p>
              ${e.map(i=>o`
                  <button
                    class="selector item ${this.currentItem?.id===i.id&&!this.currentDraft?"selected":""}"
                    type="button"
                    @click=${()=>this.selectItem(i.id)}
                  >
                    <span>${i.name}</span>
                    <small>${Zs(i.kind)}</small>
                  </button>
                `)}
            `:l}

        ${t.length?o`
              <p class="list-label">Other</p>
              ${t.map(i=>o`
                  <button
                    class="selector item ${this.currentItem?.id===i.id&&!this.currentDraft?"selected":""}"
                    type="button"
                    @click=${()=>this.selectItem(i.id)}
                  >
                    <span>${i.name}</span>
                    <small>${i.kind}</small>
                  </button>
                `)}
            `:l}

        ${!e.length&&!this.advancedDrafts.length&&!t.length&&!this.currentDraft?o`
              <p class="empty">
                ${this.isAdmin?"Create your first layered effect.":"No layered effects have been saved yet."}
              </p>
            `:l}
      </aside>

      <section class="editor">
        ${this.name||this.currentItem||this.currentDraft?te(this.content)?this.renderAdvancedEditor():this.content.kind==="opaque"?this.renderOpaqueEditor(this.content):this.renderEmptyEditor("Select an advanced effect","Choose a saved layered effect to inspect it."):this.renderEmptyEditor("Select an advanced effect","Choose a saved layered effect to inspect it.")}
      </section>
    `}renderAdvancedEditor(){if(!te(this.content))return l;const e=this.content.kind==="scene_layered";return o`
      ${e?o`
            <button
              class="back-button"
              type="button"
              @click=${this.backToScenes}
            >
              ← Back to Scenes
            </button>
          `:l}
      <div class="editor-heading">
        <div>
          <p class="eyebrow">
            Advanced / ${e?"Scene template":"Layered"}
          </p>
          <input
            class="name-input"
            aria-label="Effect name"
            maxlength="128"
            .value=${this.name}
            ?disabled=${!this.isAdmin}
            @input=${this.nameChanged}
          />
        </div>
        <div class="actions">
          <button
            class="primary"
            type="button"
            ?disabled=${!this.isAdmin||!this.dirty||this.saving}
            @click=${this.save}
          >
            ${this.saving?"Saving...":"Save"}
          </button>
          <button
            class="secondary"
            type="button"
            disabled
            aria-describedby="advanced-apply-reason"
          >
            Apply
          </button>
        </div>
      </div>

      ${this.isAdmin?l:o`
            <div class="read-only" role="note">
              You can inspect shared effects. An administrator is required to
              edit or save them.
            </div>
          `}

      <div id="advanced-apply-reason" class="apply-reason" role="note">
        Layered effects can be saved, but Apply is unavailable because there
        is no confirmed compiler or deployment path.
      </div>

      ${e?o`
            <div class="source-note" role="note">
              Source parameter bytes remain immutable provenance. Layer edits
              are saved separately and may diverge from those bytes.
            </div>
          `:l}

      <govee-advanced-effect-editor
        .content=${Ws(this.content)}
        .disabled=${!this.isAdmin}
        @content-changed=${t=>{te(this.content)&&(this.content=Ys(this.content,t.detail.content),this.scheduleDraft())}}
      ></govee-advanced-effect-editor>
    `}renderOpaqueEditor(e){return o`
      <div class="editor-heading">
        <div>
          <p class="eyebrow">Other / Unsupported definition</p>
          <h2>${this.name}</h2>
        </div>
        <div class="actions">
          <button class="secondary" type="button" disabled>Apply</button>
        </div>
      </div>
      <div class="read-only" role="note">
        This effect definition can be inspected, but this editor cannot change,
        save or apply it.
      </div>
      <section class="card opaque-content">
        <h3>Source kind</h3>
        <p><code>${e.source_kind}</code></p>
        <h3>Preserved content</h3>
        <pre aria-label="Preserved opaque content">${JSON.stringify(e.body,null,2)}</pre>
      </section>
    `}renderEmptyEditor(e,t){return o`
      <div class="empty-editor">
        <h2>${e}</h2>
        <p>${t}</p>
      </div>
    `}renderLibraryGroup(e,t){const i=this.library.items.filter(r=>r.kind===e);return i.length?o`
      <p class="list-label">${t}</p>
      ${i.map(r=>o`
          <button
            class="selector item ${this.currentItem?.id===r.id&&!this.currentDraft?"selected":""}"
            type="button"
            @click=${()=>this.selectItem(r.id)}
          >
            <span>${r.name}</span>
            <small>${t}</small>
          </button>
        `)}
    `:l}renderPaintedEditor(){if(this.content.kind!=="h617a_painted")return l;const e=this.activeDeployment;return o`
      <div class="editor-heading">
        <div>
          <p class="eyebrow">Custom Effects / Painted</p>
          <input
            class="name-input"
            aria-label="Effect name"
            maxlength="128"
            .value=${this.name}
            ?disabled=${!this.isAdmin}
            @input=${this.nameChanged}
          />
        </div>
        <div class="actions">
          <button
            class="primary"
            type="button"
            ?disabled=${!this.isAdmin||!this.dirty||this.saving}
            @click=${this.save}
          >
            ${this.saving?"Saving...":"Save"}
          </button>
          <button
            class="secondary"
            type="button"
            ?disabled=${!this.canApply}
            @click=${this.apply}
          >
            ${this.applying?"Applying...":"Apply"}
          </button>
        </div>
      </div>

      ${this.renderCustomModeTabs()}

      ${this.isAdmin?l:o`
            <div class="read-only" role="note">
              You can inspect shared effects. An administrator is required to
              edit or apply them.
            </div>
          `}

      <govee-effect-preview
        class="painted-preview"
        .model=${Qi(this.content)}
        .interactive=${!0}
        .disabled=${!this.isAdmin}
        @preview-cell-selected=${t=>this.setSegmentColour(t.detail.index)}
      ></govee-effect-preview>

      <div class="controls">
        <section class="card">
          <h3>Colours</h3>
          <div class="colour-row">
            <label>
              <span>Brush</span>
              <input
                type="color"
                .value=${this.foreground}
                ?disabled=${!this.isAdmin}
                @input=${this.foregroundChanged}
              />
            </label>
            <label>
              <span>Background</span>
              <input
                type="color"
                .value=${Wt(this.content.background)}
                ?disabled=${!this.isAdmin}
                @input=${this.backgroundChanged}
              />
            </label>
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
          <h3>Movement</h3>
          <label class="field">
            <span>Direction</span>
            <select
              .value=${this.content.effect}
              ?disabled=${!this.isAdmin}
              @change=${this.effectChanged}
            >
              <option value="clockwise">Clockwise</option>
              <option value="counter_clockwise">Counterclockwise</option>
            </select>
          </label>
          ${this.rangeField("Speed","speed",this.content.speed)}
          ${this.rangeField("Brightness","brightness",this.content.brightness)}
        </section>
      </div>

      ${e?this.renderDeployment(e):l}
    `}renderPaletteEffectEditor(){if(this.content.kind!=="h617a_single"&&this.content.kind!=="h617a_multi")return l;const e=this.content,t=this.activeDeployment;return o`
      <div class="editor-heading">
        <div>
          <p class="eyebrow">
            Custom Effects / ${Oe(e.kind)}
          </p>
          <input
            class="name-input"
            aria-label="Effect name"
            maxlength="128"
            .value=${this.name}
            ?disabled=${!this.isAdmin}
            @input=${this.nameChanged}
          />
        </div>
        <div class="actions">
          <button
            class="primary"
            type="button"
            ?disabled=${!this.isAdmin||!this.dirty||this.saving}
            @click=${this.save}
          >
            ${this.saving?"Saving...":"Save"}
          </button>
          <button
            class="secondary"
            type="button"
            ?disabled=${!this.canApply}
            @click=${this.apply}
          >
            ${this.applying?"Applying...":"Apply"}
          </button>
        </div>
      </div>

      ${this.renderCustomModeTabs()}

      ${this.isAdmin?l:o`
            <div class="read-only" role="note">
              You can inspect shared effects. An administrator is required to
              edit them.
            </div>
          `}

      <govee-custom-effect-editor
        .content=${e}
        .catalogue=${this.customCatalogue}
        .disabled=${!this.isAdmin}
        @content-changed=${i=>{this.content=$i(i.detail.content),this.scheduleDraft()}}
      ></govee-custom-effect-editor>

      ${t?this.renderDeployment(t):l}
    `}rangeField(e,t,i){return o`
      <label class="range-field">
        <span>${e}</span>
        <input
          type="range"
          min="0"
          max="100"
          .value=${String(i)}
          ?disabled=${!this.isAdmin}
          @input=${r=>this.updateContent({[t]:Number(r.target.value)})}
        />
        <output>${i}%</output>
      </label>
    `}renderCustomModeTabs(){return T(this.content)?o`
      <div class="custom-mode-tabs" role="tablist" aria-label="Custom effect type">
        ${this.customModeButton("h617a_painted","Painted")}
        ${this.customModeButton("h617a_single","Single")}
        ${this.customModeButton("h617a_multi","Multi")}
      </div>
    `:l}customModeButton(e,t){const i=T(this.content)&&this.content.kind===e,r=e==="h617a_single"&&this.content.kind==="h617a_multi"&&this.content.effects.length>1;return o`
      <button
        type="button"
        role="tab"
        aria-selected=${i}
        class=${i?"selected":""}
        title=${r?"Remove all but one effect before switching to Single":l}
        ?disabled=${!this.isAdmin||r}
        @click=${()=>this.switchCustomMode(e)}
      >
        ${t}
      </button>
    `}renderDeployment(e){const t=this.devices.find(r=>r.config_entry_id===e.config_entry_id)?.display_name??"device";let i;switch(e.phase){case"pending":i=`Preparing to apply to ${t}.`;break;case"uploading":i=`Applying to ${t}: ${e.progress_current} of ${e.progress_total}.`;break;case"verifying":i=`Checking the selected effect on ${t}.`;break;case"confirmed":i=`Applied to ${t}. The selected custom-effect code was confirmed, but exact effect contents cannot be read back.`;break;case"unknown":i=`Applied to ${t}, but the selected effect could not be confirmed.`;break;case"interrupted":i=`Apply to ${t} was interrupted by a Home Assistant restart.`;break;case"failed":i=`Apply to ${t} failed.`;break}return o`
      <div
        class="deployment ${e.phase}"
        role=${e.phase==="failed"?"alert":"status"}
      >
        ${i}
      </div>
    `}async selectSection(e){const t=this.beginEditorTransition();if(e===this.section||!await this.flushDraft()||!this.editorTransitionIsCurrent(t)||(this.section=e,this.notice=void 0,e==="scenes")||e==="custom"&&T(this.content)||e==="advanced"&&(te(this.content)||this.content.kind==="opaque"))return;const r=e==="advanced"?this.advancedDrafts:this.customDrafts,n=this.newestRecoveryForDevice(r);if(n){await this.selectDraft(n,t)&&this.editorTransitionIsCurrent(t)&&(this.notice="Recovered an unfinished draft.");return}const a=this.library.items.find(d=>e==="advanced"?ae(d.kind):ne(d.kind));if(a){await this.selectItem(a.id,t);return}this.isAdmin?await this.newEffect(e==="advanced"?"advanced":"h617a_painted",t):(this.currentItem=void 0,this.currentDraft=void 0,this.name="")}async resumeOrCreateEffect(e){const t=e==="advanced"?this.advancedDrafts:this.customDrafts,i=this.newestRecoveryForDevice(t);if(i){await this.selectDraft(i)&&(this.section=e,this.notice="Recovered an unfinished draft.");return}await this.newEffect(e==="advanced"?"advanced":"h617a_painted")}async load(){const e=this.loadEpoch+1;this.loadEpoch=e,this.loading=!0,this.error=void 0,this.deploymentRevision=-1;const t=new qs(this.hass);this.api=t;try{const[i,r,n,a]=await Promise.all([t.info(),t.devices(),t.library(),t.customCatalogue()]);if(!this.loadIsCurrent(e,t))return;if(!Bs(i))throw new Error("This editor bundle is not compatible with the installed backend.");if(this.devices=r,this.library=n,this.customCatalogue=a,this.selectedDeviceId=this.deviceIdFromPath()??r.find(u=>u.custom_effects.painted==="supported")?.config_entry_id??r[0]?.config_entry_id,this.isAdmin){const u=await t.drafts();if(this.drafts=await Promise.all(u.map(h=>t.draft(h.id))),!this.loadIsCurrent(e,t))return}const d=await t.subscribeLibrary(u=>{this.libraryChanged(u)},u=>this.subscriptionFailed(u,e,t));if(!this.loadIsCurrent(e,t)||this.error){d();return}if(this.unsubscribeLibrary=d,this.isAdmin){const u=await t.subscribeDeployments(h=>{h.revision<this.deploymentRevision||(this.deploymentRevision=h.revision,this.deployments=h.deployments,this.activeOperationId||(this.activeOperationId=this.latestDeployment(["pending","uploading","verifying","interrupted"])?.operation_id))},h=>this.subscriptionFailed(h,e,t));if(!this.loadIsCurrent(e,t)||this.error){u();return}this.unsubscribeDeployments=u}const c=this.newestRecoveryForDevice(),p=n.items.find(u=>ne(u.kind));c?await this.selectDraft(c)&&(this.section=T(c.item.content)?"custom":"advanced",this.notice="Recovered an unfinished draft."):p?await this.selectItem(p.id):this.isAdmin&&await this.newEffect("h617a_painted")}catch(i){this.loadIsCurrent(e,t)&&(this.stopSubscriptions(),this.error=N(i))}finally{this.loadIsCurrent(e,t)&&(this.loading=!1)}}loadIsCurrent(e,t){return this.isConnected&&this.loadEpoch===e&&this.api===t}subscriptionFailed(e,t,i){this.loadIsCurrent(t,i)&&(this.error=e.message,this.loading=!1,queueMicrotask(()=>{this.loadIsCurrent(t,i)&&this.stopSubscriptions()}))}stopSubscriptions(){this.unsubscribeLibrary?.(),this.unsubscribeDeployments?.(),this.unsubscribeLibrary=void 0,this.unsubscribeDeployments=void 0}deviceIdFromPath(){const e=window.location.pathname.match(/\/ha-govee-led-ble\/editor\/([^/]+)/);return e?.[1]?decodeURIComponent(e[1]):void 0}newestRecoveryForDevice(e=this.editableDrafts){return[...e].filter(t=>!t.selected_config_entry_id||t.selected_config_entry_id===this.selectedDeviceId).sort((t,i)=>i.updated_at.localeCompare(t.updated_at))[0]}async libraryChanged(e){const t=this.library.library_revision;if(e.library_revision<t||(this.library=e,!this.currentItem||e.library_revision===t))return;const i=e.items.find(a=>a.id===this.currentItem?.id);if(!i){this.notice="This effect was removed from the shared library.";return}if(i.revision===this.currentItem.revision)return;if(this.dirty){this.notice="This effect changed elsewhere. Reload it before saving your draft.";return}const r=this.beginEditorTransition();await this.selectItem(i.id,r)&&this.editorTransitionIsCurrent(r)&&(this.notice="Loaded the latest shared revision.")}sceneLibraryItemSaved(e){this.library={library_revision:e.detail.library_revision,items:Yt(this.library.items,e.detail.item)}}async sceneTemplateSelected(e){if(!this.api||!this.isAdmin||e.detail.config_entry_id!==this.selectedDeviceId||this.sceneTemplateHandoffInFlight)return;const t=this.api,i=this.beginEditorTransition();this.sceneTemplateHandoffInFlight=!0;try{if(!await this.flushDraft()||!this.editorTransitionIsCurrent(i))return;const n=_t(e.detail.content),a=e.detail.name.trim()||"Layered scene template",d=await t.createDraft(a,n,this.selectedDeviceId??null);if(!this.editorTransitionIsCurrent(i)){await this.discardStaleDraft(t,d);return}if(this.currentItem=void 0,this.currentDraft=d,this.name=d.item.name,!te(d.item.content))throw new Error("The scene template draft returned an unsupported definition.");this.content=ve(d.item.content),this.savedBaseline=void 0,this.draftPersistPending=!1,this.drafts=Re(this.drafts,d),this.section="advanced",this.notice="Scene template opened as a recovery draft."}catch(r){this.editorTransitionIsCurrent(i)&&(this.notice=`The scene template draft could not be created: ${N(r)}`)}finally{this.sceneTemplateHandoffInFlight=!1}}async backToScenes(){const e=this.beginEditorTransition();!await this.flushDraft()||!this.editorTransitionIsCurrent(e)||(this.section="scenes",this.notice=void 0)}beginEditorTransition(){return this.editorTransitionEpoch+=1,this.editorTransitionEpoch}editorTransitionIsCurrent(e){return e===this.editorTransitionEpoch}async discardStaleDraft(e,t){try{await e.deleteDraft(t)}catch(i){console.warn("A stale recovery draft could not be removed.",i)}}deviceChanged(e){this.beginEditorTransition(),this.selectedDeviceId=e.target.value,this.activeOperationId=void 0,this.activeOperationId=this.latestDeployment(["pending","uploading","verifying","interrupted"])?.operation_id,this.scheduleDraft(),this.notice=this.applyAvailabilityNotice()}switchCustomMode(e){if(!this.isAdmin||!this.customCatalogue||!T(this.content)||this.content.kind===e)return;const t=this.content;if(e==="h617a_single"&&t.kind==="h617a_multi"&&t.effects.length>1)return;let i;if(e==="h617a_painted"){const r=t.kind==="h617a_painted"?Me(this.foreground):t.palette[0]?[...t.palette[0]]:[47,111,237];i={...ct(),speed:t.speed,groups:[{fill:[...r],segments:Array.from({length:dt},(n,a)=>a)}]},this.foreground=Wt(r)}else if(t.kind==="h617a_painted"){const r=Js(t);if(e==="h617a_single"){const n=it(e,this.customCatalogue);i={...n,speed:t.speed,palette:r.length?r:n.palette}}else{const n=it("h617a_multi",this.customCatalogue);i={...n,speed:t.speed,palette:r.length?r:n.palette}}}else if(e==="h617a_multi"&&t.kind==="h617a_single")i={kind:e,effects:[{family:t.family,variant:t.variant}],speed:t.speed,palette:t.palette.map(r=>[...r])};else if(e==="h617a_single"&&t.kind==="h617a_multi"){const r=t.effects[0];i={kind:e,family:r.family,variant:r.variant,speed:t.speed,palette:t.palette.map(n=>[...n])}}else return;this.content=i,/^New (Painted|Single|Multi) effect$/.test(this.name)&&(this.name=`New ${Oe(e)} effect`),this.scheduleDraft(),this.notice=this.applyAvailabilityNotice()}async newEffect(e,t){const i=t??this.beginEditorTransition();if(!this.api||!this.isAdmin||e!=="advanced"&&!this.customCatalogue)return;const r=this.api;if(!(!await this.flushDraft()||!this.editorTransitionIsCurrent(i))){this.currentItem=void 0,this.currentDraft=void 0,this.name=`New ${Oe(e)} effect`,this.content=e==="advanced"?hs():it(e,this.customCatalogue),this.savedBaseline=e==="advanced"?M(this.name,this.content):void 0,this.draftPersistPending=!1,this.notice=this.applyAvailabilityNotice();try{const a=await r.createDraft(this.name,this.content,this.selectedDeviceId??null);if(!this.editorTransitionIsCurrent(i)){await this.discardStaleDraft(r,a);return}this.currentDraft=a,this.drafts=Re(this.drafts,a)}catch(a){this.editorTransitionIsCurrent(i)&&(this.notice=`The recovery draft could not be created: ${N(a)}`)}}}async selectItem(e,t){const i=t??this.beginEditorTransition();if(!this.api)return!1;const r=this.api;if(!await this.flushDraft()||!this.editorTransitionIsCurrent(i))return!1;try{const a=await r.item(e);if(!this.editorTransitionIsCurrent(i))return!1;const d=this.drafts.find(u=>u.base_item_id===a.id);if(a.content.kind==="opaque"){const u=d?.item.content.kind==="opaque"?d:void 0,h=u?.item.content,y=h?.kind==="opaque"?h:a.content;return this.currentItem=a,this.currentDraft=u,this.name=u?.item.name??a.name,this.content=Kt(y),this.savedBaseline=void 0,this.draftPersistPending=!1,this.notice="This effect definition is preserved, but this editor cannot change or apply it.",!0}if(!E(a.content))return this.notice="This item cannot be edited here.",!1;const c=d&&E(d.item.content)?d:void 0,p=c?.item.content??a.content;return E(p)?(this.currentItem=a,this.currentDraft=c,this.name=c?.item.name??a.name,this.content=ve(p),this.savedBaseline=M(a.name,a.content),this.draftPersistPending=!1,this.notice=c?"Recovered an unfinished draft.":this.applyAvailabilityNotice(),!0):!1}catch(a){return this.editorTransitionIsCurrent(i)&&(this.notice=N(a)),!1}}async selectDraft(e,t){const i=t??this.beginEditorTransition();if(!this.api)return!1;const r=this.api;if(this.currentDraft?.id===e.id)return await this.flushDraft()&&this.editorTransitionIsCurrent(i);if(!await this.flushDraft()||!this.editorTransitionIsCurrent(i))return!1;if(e=this.drafts.find(d=>d.id===e.id)??e,e.item.content.kind==="opaque"){let d;if(e.base_item_id)try{const c=await r.item(e.base_item_id);if(!this.editorTransitionIsCurrent(i))return!1;c.content.kind==="opaque"&&(d=c)}catch{if(!this.editorTransitionIsCurrent(i))return!1;this.notice="The saved effect behind this draft is no longer available."}return this.currentItem=d,this.currentDraft=e,this.name=e.item.name,this.content=Kt(e.item.content),this.savedBaseline=void 0,this.draftPersistPending=!1,this.notice="This effect definition is preserved, but this editor cannot change or apply it.",!0}if(!E(e.item.content))return this.notice="This draft cannot be edited here.",!1;let a;if(e.base_item_id)try{if(a=await r.item(e.base_item_id),!this.editorTransitionIsCurrent(i))return!1}catch{if(!this.editorTransitionIsCurrent(i))return!1;this.notice="The saved effect behind this draft is no longer available."}return this.currentItem=a,this.currentDraft=e,this.name=e.item.name,this.content=ve(e.item.content),this.savedBaseline=a&&E(a.content)?M(a.name,a.content):void 0,this.draftPersistPending=!1,this.notice||(this.notice=this.applyAvailabilityNotice()),!0}nameChanged(e){this.name=e.target.value,this.scheduleDraft()}foregroundChanged(e){this.foreground=e.target.value,this.brushUsesBackground=!1}backgroundChanged(e){this.updateContent({background:Me(e.target.value)})}effectChanged(e){this.updateContent({effect:e.target.value})}setSegmentColour(e){if(this.content.kind!=="h617a_painted")return;const t=_i(this.content);t[e]=this.brushUsesBackground?[...this.content.background]:Me(this.foreground),this.content={...this.content,groups:Xt(t,this.content.background)},this.scheduleDraft()}paintAll(){if(this.content.kind!=="h617a_painted")return;const e=this.brushUsesBackground?this.content.background:Me(this.foreground);this.content={...this.content,groups:Xt(Array.from({length:dt},()=>[...e]),this.content.background)},this.scheduleDraft()}resetPaint(){this.content.kind==="h617a_painted"&&(this.content={...this.content,groups:[]},this.scheduleDraft())}updateContent(e){this.content.kind==="h617a_painted"&&(this.content={...this.content,...e},this.scheduleDraft())}scheduleDraft(){!this.isAdmin||!this.api||(this.draftPersistPending=!0,this.draftTimer!==void 0&&window.clearTimeout(this.draftTimer),this.draftTimer=window.setTimeout(()=>{this.draftTimer=void 0,this.persistDraft()},700))}async flushDraft(){return this.draftTimer!==void 0&&(window.clearTimeout(this.draftTimer),this.draftTimer=void 0),!this.draftPersistPending&&!this.draftSaveInFlight?!0:this.persistDraft()}async persistDraft(){let e=!0;if(this.draftSaveInFlight&&(e=await this.draftSaveInFlight),!this.draftPersistPending)return e;if(!this.api||!this.isAdmin)return!1;if(!this.dirty||!this.name.trim()||!E(this.content))return this.draftPersistPending=!1,!0;const t=this.content,i=Ne(this.name,t,this.selectedDeviceId);this.draftPersistPending=!1;const r=this.persistDraftNow();this.draftSaveInFlight=r;let n;try{n=await r}finally{this.draftSaveInFlight===r&&(this.draftSaveInFlight=void 0)}return n||(this.draftPersistPending=!0),E(this.content)&&i!==Ne(this.name,this.content,this.selectedDeviceId)&&this.scheduleDraft(),n}async persistDraftNow(){if(!this.api||!E(this.content))return!1;const e=this.api,t=this.currentDraft,i=this.currentItem,r=this.name.trim(),n=this.content,a=this.selectedDeviceId??null,d=Ne(r,n,a??void 0);try{const c=t?await e.updateDraft(t,r,n,a):await e.createDraft(r,n,a,i);return this.draftIdentityIsCurrent(e,t,i)&&(this.currentDraft=c,this.drafts=Re(this.drafts,c)),!0}catch(c){if(Jt(c)==="conflict"&&t&&this.draftContextIsCurrent(e,t,i,d))try{const p=await e.createDraft(r,n,a,i);return this.draftContextIsCurrent(e,t,i,d)&&(this.currentDraft=p,this.drafts=Re(this.drafts,p),this.notice="This draft changed elsewhere, so your work was saved as a separate recovery draft."),!0}catch(p){c=p}return this.notice=`The recovery draft could not be saved: ${N(c)}`,!1}}draftIdentityIsCurrent(e,t,i){return this.api===e&&rt(this.currentDraft,t)&&st(this.currentItem,i)&&E(this.content)}draftContextIsCurrent(e,t,i,r){return this.draftIdentityIsCurrent(e,t,i)&&E(this.content)&&Ne(this.name.trim(),this.content,this.selectedDeviceId)===r}async save(){if(!this.api||!this.isAdmin||!this.dirty||this.saving||!E(this.content))return;const e=this.api,t=this.name.trim();if(!t){this.notice="Give this effect a name before saving.";return}const i=this.beginEditorTransition(),r=this.currentItem,n=this.currentDraft,a=ve(this.content),d=this.library.library_revision;this.saving=!0,this.notice=void 0;try{const c=r?await e.updateItem(r,t,a,d):await e.createItem(t,a,d);if(!E(c.item.content))throw new Error("The saved effect returned an unsupported definition.");const p=c.item.content;c.library_revision>=this.library.library_revision&&(this.library={library_revision:c.library_revision,items:Yt(this.library.items,c.item)}),this.editorTransitionIsCurrent(i)&&st(this.currentItem,r)&&E(this.content)&&M(this.name,this.content)===M(t,a)&&(this.currentItem=c.item,this.name=c.item.name,this.content=ve(p),this.savedBaseline=M(this.name,this.content),this.draftPersistPending=!1);const h=()=>this.editorTransitionIsCurrent(i)&&st(this.currentItem,c.item)&&E(this.content)&&M(this.name,this.content)===M(c.item.name,p);if(n)try{await e.deleteDraft(n),this.drafts=this.drafts.filter(y=>!rt(y,n)),this.editorTransitionIsCurrent(i)&&rt(this.currentDraft,n)&&(this.currentDraft=void 0)}catch(y){h()&&(this.notice=`Saved ${t}, but its recovery draft could not be cleared: `+N(y));return}h()&&(this.notice="Saved.")}catch(c){if(Jt(c)==="conflict"){const p="This effect or library changed elsewhere. Reload before saving.";this.editorTransitionIsCurrent(i)&&(this.notice=p);try{const u=await e.library();u.library_revision>=this.library.library_revision&&(this.library=u)}catch(u){this.editorTransitionIsCurrent(i)&&(this.notice=`${p} Library refresh failed: `+N(u))}}else this.editorTransitionIsCurrent(i)&&(this.notice=`Save failed: ${N(c)}`)}finally{this.saving=!1}}async apply(){if(!this.api||!this.canApply||!T(this.content)||!this.selectedDeviceId)return;const e=this.name.trim(),t=this.selectedDeviceId,i=this.editorTransitionEpoch;this.activeOperationId=void 0,this.applying=!0,this.notice=void 0;try{const r=!this.dirty&&this.currentItem?await this.api.applySaved(t,this.currentItem):await this.api.applySnapshot(t,e,this.content);if(i!==this.editorTransitionEpoch||t!==this.selectedDeviceId)return;this.activeOperationId=r.operation_id,this.deployments=[r,...this.deployments.filter(n=>n.operation_id!==r.operation_id)]}catch(r){i===this.editorTransitionEpoch&&t===this.selectedDeviceId&&(this.notice=`Apply failed: ${N(r)}`)}finally{this.applying=!1}}applyAvailabilityNotice(){if(!te(this.content))return this.selectedDeviceId&&!this.selectedDevice?"This device is temporarily unavailable in Home Assistant. Apply is disabled until it is loaded.":this.applyCapability==="supported"?void 0:`${Oe(this.content.kind)} effects cannot be applied to this device.`}latestDeployment(e){return[...this.deployments].filter(t=>t.config_entry_id===this.selectedDeviceId&&e.includes(t.phase)).sort((t,i)=>i.updated_at.localeCompare(t.updated_at))[0]}static{this.styles=le`
    :host {
      display: block;
      min-height: 100%;
      color: var(--primary-text-color);
      background: var(--primary-background-color);
      --studio-blue: var(--primary-color, #03a9f4);
      --studio-blue-soft: color-mix(
        in srgb,
        var(--studio-blue) 13%,
        transparent
      );
      --studio-border: var(--divider-color, #d8dce2);
      --studio-card: var(--card-background-color, #fff);
      --studio-muted: var(--secondary-text-color, #68707c);
      font-family: var(--paper-font-body1_-_font-family, sans-serif);
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
      min-height: 44px;
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

    .topbar {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 24px;
      padding: 22px 28px;
      border-bottom: 1px solid var(--studio-border);
      background: var(--app-header-background-color, var(--studio-card));
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

    .eyebrow,
    .nav-heading,
    .list-label {
      margin-bottom: 6px;
      color: var(--studio-muted);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .device-picker {
      display: grid;
      gap: 6px;
      min-width: 240px;
      color: var(--studio-muted);
      font-size: 12px;
      font-weight: 600;
    }

    select,
    .name-input {
      min-height: 42px;
      padding: 8px 12px;
      color: var(--primary-text-color);
      border: 1px solid var(--studio-border);
      border-radius: 9px;
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
      min-height: calc(100vh - 90px);
    }

    .studio.scenes-mode {
      grid-template-columns: 190px 190px 230px minmax(0, 1fr);
    }

    .primary-nav,
    .library {
      padding: 22px 16px;
      border-inline-end: 1px solid var(--studio-border);
      background: var(--secondary-background-color, #f5f6f8);
    }

    .primary-nav {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .selector {
      width: 100%;
      min-height: 44px;
      padding: 9px 11px;
      border: 0;
      border-radius: 8px;
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

    .device-summary {
      display: grid;
      gap: 4px;
      margin-top: auto;
      padding: 14px 10px 2px;
      color: var(--studio-muted);
      font-size: 12px;
    }

    .device-summary strong {
      color: var(--primary-text-color);
      font-size: 13px;
    }

    .library {
      overflow: auto;
      background: var(--primary-background-color);
    }

    .library-heading {
      display: grid;
      gap: 12px;
      margin-bottom: 22px;
    }

    .new-kind {
      min-height: 44px;
      padding: 8px 4px;
      border: 1px solid var(--studio-border);
      border-radius: 7px;
      color: var(--studio-blue);
      background: var(--studio-card);
      font-size: 12px;
      font-weight: 650;
      cursor: pointer;
    }

    .library-heading > .new-kind {
      width: 100%;
    }

    .icon-button {
      width: 40px;
      padding: 0;
      border: 1px solid var(--studio-border);
      border-radius: 50%;
      color: var(--studio-blue);
      background: var(--studio-card);
      font-size: 24px;
      cursor: pointer;
    }

    .list-label {
      margin: 20px 10px 6px;
    }

    .item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .item small {
      color: var(--studio-muted);
      font-size: 11px;
      font-weight: 500;
    }

    .empty {
      padding: 12px 10px;
      color: var(--studio-muted);
      line-height: 1.5;
    }

    .editor {
      min-width: 0;
      padding: 28px;
      background: var(--secondary-background-color, #f5f6f8);
    }

    .editor-heading {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 22px;
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

    .name-input {
      width: min(460px, 100%);
      padding-inline: 0;
      border-width: 0 0 1px;
      border-radius: 0;
      background: transparent;
      font-size: 24px;
      font-weight: 600;
    }

    .actions,
    .button-row {
      display: flex;
      flex-wrap: wrap;
      gap: 9px;
    }

    .actions > button {
      min-height: 44px;
    }

    .primary,
    .secondary {
      padding: 8px 17px;
      border-radius: 9px;
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

    .secondary.active {
      color: var(--studio-blue);
      border-color: var(--studio-blue);
      background: var(--studio-blue-soft);
    }

    button:disabled,
    input:disabled,
    select:disabled {
      cursor: not-allowed;
      opacity: 0.52;
    }

    .read-only,
    .apply-reason,
    .source-note,
    .deployment {
      margin-bottom: 18px;
      padding: 12px 14px;
      border: 1px solid var(--studio-border);
      border-radius: 9px;
      background: var(--studio-card);
      line-height: 1.45;
    }

    .apply-reason {
      color: var(--primary-text-color);
      border-color: color-mix(
        in srgb,
        var(--studio-blue) 35%,
        var(--studio-border)
      );
      background: var(--studio-blue-soft);
    }

    .source-note {
      color: var(--studio-muted);
    }

    .card,
    .placeholder,
    .empty-editor {
      border: 1px solid var(--studio-border);
      border-radius: 10px;
      background: var(--studio-card);
    }

    .painted-preview {
      display: block;
    }

    .controls {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
      margin-top: 18px;
    }

    .card {
      padding: 20px;
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

    .colour-row {
      display: flex;
      gap: 20px;
      margin-bottom: 18px;
    }

    .colour-row label {
      display: grid;
      gap: 7px;
      color: var(--studio-muted);
      font-size: 13px;
      font-weight: 600;
    }

    input[type="color"] {
      width: 72px;
      height: 44px;
      padding: 3px;
      border: 1px solid var(--studio-border);
      border-radius: 8px;
      background: var(--studio-card);
    }

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

    .range-field {
      grid-template-columns: 80px minmax(100px, 1fr) 44px;
    }

    .range-field output {
      color: var(--primary-text-color);
      text-align: end;
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

    .placeholder,
    .empty-editor {
      grid-column: 2 / -1;
      align-self: start;
      max-width: 720px;
      margin: 28px;
      padding: 28px;
      line-height: 1.55;
    }

    .placeholder p:last-child,
    .empty-editor p {
      margin: 12px 0 0;
      color: var(--studio-muted);
    }

    @media (max-width: 900px) {
      .studio {
        grid-template-columns: 170px minmax(0, 1fr);
      }

      .studio.scenes-mode {
        grid-template-columns: 170px minmax(0, 1fr);
      }

      .library {
        border-inline-end: 0;
        border-bottom: 1px solid var(--studio-border);
      }

      .editor {
        grid-column: 2;
      }

      .controls {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 760px) {
      .topbar {
        align-items: stretch;
        flex-direction: column;
      }

      .device-picker {
        min-width: 0;
      }

      .studio {
        display: block;
      }

      .primary-nav {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        padding: 10px 16px;
        border-inline-end: 0;
        border-bottom: 1px solid var(--studio-border);
      }

      .nav-heading,
      .device-summary {
        display: none;
      }

      .selector {
        text-align: center;
      }

      .library {
        padding-block: 18px;
      }

      .library .selector {
        text-align: start;
      }

      .editor {
        padding: 20px 16px 32px;
      }

      .editor-heading {
        align-items: stretch;
        flex-direction: column;
      }

      .actions > button {
        flex: 1;
      }

      .placeholder,
      .empty-editor {
        margin: 18px 16px;
      }
    }

    @media (max-width: 480px) {
      .topbar {
        padding: 18px 16px;
      }

      .notice {
        padding-inline: 16px;
      }

      .colour-row {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
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
  `}}w([x({attribute:!1})],_.prototype,"hass");w([x({attribute:!1})],_.prototype,"panel");w([b()],_.prototype,"loading");w([b()],_.prototype,"error");w([b()],_.prototype,"notice");w([b()],_.prototype,"devices");w([b()],_.prototype,"selectedDeviceId");w([b()],_.prototype,"section");w([b()],_.prototype,"library");w([b()],_.prototype,"customCatalogue");w([b()],_.prototype,"drafts");w([b()],_.prototype,"currentItem");w([b()],_.prototype,"currentDraft");w([b()],_.prototype,"name");w([b()],_.prototype,"content");w([b()],_.prototype,"foreground");w([b()],_.prototype,"brushUsesBackground");w([b()],_.prototype,"saving");w([b()],_.prototype,"applying");w([b()],_.prototype,"deployments");w([b()],_.prototype,"activeOperationId");function ct(){return{kind:"h617a_painted",effect:"clockwise",speed:50,brightness:100,background:[0,0,0],groups:[]}}function it(s,e){if(s==="h617a_painted")return ct();const t=e.effects[0],i={family:t.family,variant:t.variant};return s==="h617a_single"?{kind:s,...i,speed:50,palette:Gt()}:{kind:s,effects:[i],speed:50,palette:Gt()}}function Xs(s){return{...s,background:[...s.background],groups:s.groups.map(e=>({fill:[...e.fill],segments:[...e.segments]}))}}function $i(s){return s.kind==="h617a_painted"?Xs(s):s.kind==="h617a_single"?{...s,palette:s.palette.map(e=>[...e])}:{...s,effects:s.effects.map(e=>({...e})),palette:s.palette.map(e=>[...e])}}function ve(s){return s.kind==="advanced"?ke(s):s.kind==="scene_layered"?_t(s):$i(s)}function Kt(s){return{...s,body:structuredClone(s.body)}}function _t(s){return{...s,template:{...s.template},effect:{layers:ke({layers:s.effect.layers}).layers}}}function Ws(s){return s.kind==="advanced"?s:{kind:"advanced",layers:s.effect.layers}}function Ys(s,e){return s.kind==="advanced"?ke(e):{..._t(s),effect:{layers:ke(e).layers}}}function Gt(){return[[255,0,0],[255,127,0],[255,255,0],[0,255,0],[0,0,255],[0,255,255],[139,0,255]]}function _i(s){const e=Array.from({length:dt},()=>[...s.background]);for(const t of s.groups)for(const i of t.segments)e[i]=[...t.fill];return e}function Xt(s,e){const t=new Map;return s.forEach((i,r)=>{if(lt(i,e))return;const n=i.join(","),a=t.get(n);a?a.segments.push(r):t.set(n,{fill:[...i],segments:[r]})}),[...t.values()]}function Js(s){const e=[];for(const t of _i(s))if(!lt(t,s.background)&&!e.some(i=>lt(i,t))&&e.push([...t]),e.length===8)break;return e}function lt(s,e){return s[0]===e[0]&&s[1]===e[1]&&s[2]===e[2]}function Wt(s){return`#${s.map(e=>e.toString(16).padStart(2,"0")).join("")}`}function Me(s){return[Number.parseInt(s.slice(1,3),16),Number.parseInt(s.slice(3,5),16),Number.parseInt(s.slice(5,7),16)]}function M(s,e){return JSON.stringify({name:s.trim(),content:e})}function Ne(s,e,t){return JSON.stringify({name:s.trim(),content:e,selectedDeviceId:t??null})}function ne(s){return s==="h617a_painted"||s==="h617a_single"||s==="h617a_multi"}function T(s){return typeof s=="object"&&s!==null&&"kind"in s&&ne(s.kind)}function E(s){return T(s)||typeof s=="object"&&s!==null&&"kind"in s&&ae(s.kind)}function ae(s){return s==="advanced"||s==="scene_layered"}function te(s){return ae(s.kind)}function Qs(s){return ne(s)||ae(s)||s==="scene_builtin"||s==="scene_palette"}function Zs(s){return s==="scene_layered"?"Scene template":"Layered"}function Oe(s){switch(s){case"h617a_painted":return"Painted";case"h617a_single":return"Single";case"h617a_multi":return"Multi";case"advanced":return"Layered";default:return"Custom"}}function Re(s,e){return[e,...s.filter(t=>t.id!==e.id)].sort((t,i)=>i.updated_at.localeCompare(t.updated_at))}function st(s,e){return s?.id===e?.id&&s?.revision===e?.revision}function rt(s,e){return s?.id===e?.id&&s?.revision===e?.revision}function Yt(s,e){return[...s.filter(t=>t.id!==e.id),{id:e.id,revision:e.revision,name:e.name,kind:e.content.kind==="opaque"?e.content.source_kind:e.content.kind,..."template"in e.content?{template:e.content.template}:{}}].sort((t,i)=>t.name.localeCompare(i.name))}function N(s){return s instanceof Error||typeof s=="object"&&s!==null&&"message"in s&&typeof s.message=="string"?s.message:"An unexpected error occurred."}function Jt(s){if(typeof s=="object"&&s!==null&&"code"in s&&typeof s.code=="string")return s.code}customElements.get("ha-govee-led-ble-editor")||customElements.define("ha-govee-led-ble-editor",_);
