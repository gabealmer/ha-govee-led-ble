const Le=globalThis,rt=Le.ShadowRoot&&(Le.ShadyCSS===void 0||Le.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,nt=Symbol(),mt=new WeakMap;let Ht=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==nt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(rt&&e===void 0){const i=t!==void 0&&t.length===1;i&&(e=mt.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&mt.set(t,e))}return e}toString(){return this.cssText}};const hi=s=>new Ht(typeof s=="string"?s:s+"",void 0,nt),oe=(s,...e)=>{const t=s.length===1?s[0]:e.reduce((i,r,n)=>i+(a=>{if(a._$cssResult$===!0)return a.cssText;if(typeof a=="number")return a;throw Error("Value passed to 'css' function must be a 'css' function result: "+a+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+s[n+1],s[0]);return new Ht(t,s,nt)},fi=(s,e)=>{if(rt)s.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const i=document.createElement("style"),r=Le.litNonce;r!==void 0&&i.setAttribute("nonce",r),i.textContent=t.cssText,s.appendChild(i)}},gt=rt?s=>s:s=>s instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return hi(t)})(s):s;const{is:mi,defineProperty:gi,getOwnPropertyDescriptor:bi,getOwnPropertyNames:vi,getOwnPropertySymbols:yi,getPrototypeOf:_i}=Object,Ue=globalThis,bt=Ue.trustedTypes,$i=bt?bt.emptyScript:"",xi=Ue.reactiveElementPolyfillSupport,me=(s,e)=>s,Re={toAttribute(s,e){switch(e){case Boolean:s=s?$i:null;break;case Object:case Array:s=s==null?s:JSON.stringify(s)}return s},fromAttribute(s,e){let t=s;switch(e){case Boolean:t=s!==null;break;case Number:t=s===null?null:Number(s);break;case Object:case Array:try{t=JSON.parse(s)}catch{t=null}}return t}},at=(s,e)=>!mi(s,e),vt={attribute:!0,type:String,converter:Re,reflect:!1,useDefault:!1,hasChanged:at};Symbol.metadata??=Symbol("metadata"),Ue.litPropertyMetadata??=new WeakMap;let W=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=vt){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),r=this.getPropertyDescriptor(e,i,t);r!==void 0&&gi(this.prototype,e,r)}}static getPropertyDescriptor(e,t,i){const{get:r,set:n}=bi(this.prototype,e)??{get(){return this[t]},set(a){this[t]=a}};return{get:r,set(a){const d=r?.call(this);n?.call(this,a),this.requestUpdate(e,d,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??vt}static _$Ei(){if(this.hasOwnProperty(me("elementProperties")))return;const e=_i(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(me("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(me("properties"))){const t=this.properties,i=[...vi(t),...yi(t)];for(const r of i)this.createProperty(r,t[r])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[i,r]of t)this.elementProperties.set(i,r)}this._$Eh=new Map;for(const[t,i]of this.elementProperties){const r=this._$Eu(t,i);r!==void 0&&this._$Eh.set(r,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const r of i)t.unshift(gt(r))}else e!==void 0&&t.push(gt(e));return t}static _$Eu(e,t){const i=t.attribute;return i===!1?void 0:typeof i=="string"?i:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return fi(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,i);if(r!==void 0&&i.reflect===!0){const n=(i.converter?.toAttribute!==void 0?i.converter:Re).toAttribute(t,i.type);this._$Em=e,n==null?this.removeAttribute(r):this.setAttribute(r,n),this._$Em=null}}_$AK(e,t){const i=this.constructor,r=i._$Eh.get(e);if(r!==void 0&&this._$Em!==r){const n=i.getPropertyOptions(r),a=typeof n.converter=="function"?{fromAttribute:n.converter}:n.converter?.fromAttribute!==void 0?n.converter:Re;this._$Em=r;const d=a.fromAttribute(t,n.type);this[r]=d??this._$Ej?.get(r)??d,this._$Em=null}}requestUpdate(e,t,i,r=!1,n){if(e!==void 0){const a=this.constructor;if(r===!1&&(n=this[e]),i??=a.getPropertyOptions(e),!((i.hasChanged??at)(n,t)||i.useDefault&&i.reflect&&n===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,i))))return;this.C(e,t,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:r,wrapped:n},a){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),n!==!0||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),r===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[r,n]of this._$Ep)this[r]=n;this._$Ep=void 0}const i=this.constructor.elementProperties;if(i.size>0)for(const[r,n]of i){const{wrapped:a}=n,d=this[r];a!==!0||this._$AL.has(r)||d===void 0||this.C(r,void 0,n,d)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(i=>i.hostUpdate?.()),this.update(t)):this._$EM()}catch(i){throw e=!1,this._$EM(),i}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};W.elementStyles=[],W.shadowRootOptions={mode:"open"},W[me("elementProperties")]=new Map,W[me("finalized")]=new Map,xi?.({ReactiveElement:W}),(Ue.reactiveElementVersions??=[]).push("2.1.2");const ot=globalThis,yt=s=>s,Oe=ot.trustedTypes,_t=Oe?Oe.createPolicy("lit-html",{createHTML:s=>s}):void 0,jt="$lit$",F=`lit$${Math.random().toFixed(9).slice(2)}$`,Gt="?"+F,wi=`<${Gt}>`,j=document,ge=()=>j.createComment(""),be=s=>s===null||typeof s!="object"&&typeof s!="function",dt=Array.isArray,ki=s=>dt(s)||typeof s?.[Symbol.iterator]=="function",je=`[ 	
\f\r]`,le=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,$t=/-->/g,xt=/>/g,q=RegExp(`>|${je}(?:([^\\s"'>=/]+)(${je}*=${je}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),wt=/'/g,kt=/"/g,Vt=/^(?:script|style|textarea|title)$/i,Ii=s=>(e,...t)=>({_$litType$:s,strings:e,values:t}),o=Ii(1),re=Symbol.for("lit-noChange"),l=Symbol.for("lit-nothing"),It=new WeakMap,H=j.createTreeWalker(j,129);function Kt(s,e){if(!dt(s)||!s.hasOwnProperty("raw"))throw Error("invalid template strings array");return _t!==void 0?_t.createHTML(e):e}const Si=(s,e)=>{const t=s.length-1,i=[];let r,n=e===2?"<svg>":e===3?"<math>":"",a=le;for(let d=0;d<t;d++){const c=s[d];let h,p,f=-1,k=0;for(;k<c.length&&(a.lastIndex=k,p=a.exec(c),p!==null);)k=a.lastIndex,a===le?p[1]==="!--"?a=$t:p[1]!==void 0?a=xt:p[2]!==void 0?(Vt.test(p[2])&&(r=RegExp("</"+p[2],"g")),a=q):p[3]!==void 0&&(a=q):a===q?p[0]===">"?(a=r??le,f=-1):p[1]===void 0?f=-2:(f=a.lastIndex-p[2].length,h=p[1],a=p[3]===void 0?q:p[3]==='"'?kt:wt):a===kt||a===wt?a=q:a===$t||a===xt?a=le:(a=q,r=void 0);const R=a===q&&s[d+1].startsWith("/>")?" ":"";n+=a===le?c+wi:f>=0?(i.push(h),c.slice(0,f)+jt+c.slice(f)+F+R):c+F+(f===-2?d:R)}return[Kt(s,n+(s[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),i]};class ve{constructor({strings:e,_$litType$:t},i){let r;this.parts=[];let n=0,a=0;const d=e.length-1,c=this.parts,[h,p]=Si(e,t);if(this.el=ve.createElement(h,i),H.currentNode=this.el.content,t===2||t===3){const f=this.el.content.firstChild;f.replaceWith(...f.childNodes)}for(;(r=H.nextNode())!==null&&c.length<d;){if(r.nodeType===1){if(r.hasAttributes())for(const f of r.getAttributeNames())if(f.endsWith(jt)){const k=p[a++],R=r.getAttribute(f).split(F),Se=/([.?@])?(.*)/.exec(k);c.push({type:1,index:n,name:Se[2],strings:R,ctor:Se[1]==="."?Ei:Se[1]==="?"?Ai:Se[1]==="@"?Di:qe}),r.removeAttribute(f)}else f.startsWith(F)&&(c.push({type:6,index:n}),r.removeAttribute(f));if(Vt.test(r.tagName)){const f=r.textContent.split(F),k=f.length-1;if(k>0){r.textContent=Oe?Oe.emptyScript:"";for(let R=0;R<k;R++)r.append(f[R],ge()),H.nextNode(),c.push({type:2,index:++n});r.append(f[k],ge())}}}else if(r.nodeType===8)if(r.data===Gt)c.push({type:2,index:n});else{let f=-1;for(;(f=r.data.indexOf(F,f+1))!==-1;)c.push({type:7,index:n}),f+=F.length-1}n++}}static createElement(e,t){const i=j.createElement("template");return i.innerHTML=e,i}}function ne(s,e,t=s,i){if(e===re)return e;let r=i!==void 0?t._$Co?.[i]:t._$Cl;const n=be(e)?void 0:e._$litDirective$;return r?.constructor!==n&&(r?._$AO?.(!1),n===void 0?r=void 0:(r=new n(s),r._$AT(s,t,i)),i!==void 0?(t._$Co??=[])[i]=r:t._$Cl=r),r!==void 0&&(e=ne(s,r._$AS(s,e.values),r,i)),e}class Ci{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,r=(e?.creationScope??j).importNode(t,!0);H.currentNode=r;let n=H.nextNode(),a=0,d=0,c=i[0];for(;c!==void 0;){if(a===c.index){let h;c.type===2?h=new xe(n,n.nextSibling,this,e):c.type===1?h=new c.ctor(n,c.name,c.strings,this,e):c.type===6&&(h=new Pi(n,this,e)),this._$AV.push(h),c=i[++d]}a!==c?.index&&(n=H.nextNode(),a++)}return H.currentNode=j,r}p(e){let t=0;for(const i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class xe{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,r){this.type=2,this._$AH=l,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=ne(this,e,t),be(e)?e===l||e==null||e===""?(this._$AH!==l&&this._$AR(),this._$AH=l):e!==this._$AH&&e!==re&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):ki(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==l&&be(this._$AH)?this._$AA.nextSibling.data=e:this.T(j.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,r=typeof i=="number"?this._$AC(e):(i.el===void 0&&(i.el=ve.createElement(Kt(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===r)this._$AH.p(t);else{const n=new Ci(r,this),a=n.u(this.options);n.p(t),this.T(a),this._$AH=n}}_$AC(e){let t=It.get(e.strings);return t===void 0&&It.set(e.strings,t=new ve(e)),t}k(e){dt(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,r=0;for(const n of e)r===t.length?t.push(i=new xe(this.O(ge()),this.O(ge()),this,this.options)):i=t[r],i._$AI(n),r++;r<t.length&&(this._$AR(i&&i._$AB.nextSibling,r),t.length=r)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const i=yt(e).nextSibling;yt(e).remove(),e=i}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}}class qe{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,r,n){this.type=1,this._$AH=l,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=n,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=l}_$AI(e,t=this,i,r){const n=this.strings;let a=!1;if(n===void 0)e=ne(this,e,t,0),a=!be(e)||e!==this._$AH&&e!==re,a&&(this._$AH=e);else{const d=e;let c,h;for(e=n[0],c=0;c<n.length-1;c++)h=ne(this,d[i+c],t,c),h===re&&(h=this._$AH[c]),a||=!be(h)||h!==this._$AH[c],h===l?e=l:e!==l&&(e+=(h??"")+n[c+1]),this._$AH[c]=h}a&&!r&&this.j(e)}j(e){e===l?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class Ei extends qe{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===l?void 0:e}}class Ai extends qe{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==l)}}class Di extends qe{constructor(e,t,i,r,n){super(e,t,i,r,n),this.type=5}_$AI(e,t=this){if((e=ne(this,e,t,0)??l)===re)return;const i=this._$AH,r=e===l&&i!==l||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,n=e!==l&&(i===l||r);r&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class Pi{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){ne(this,e)}}const Ti=ot.litHtmlPolyfillSupport;Ti?.(ve,xe),(ot.litHtmlVersions??=[]).push("3.3.3");const Li=(s,e,t)=>{const i=t?.renderBefore??e;let r=i._$litPart$;if(r===void 0){const n=t?.renderBefore??null;i._$litPart$=r=new xe(e.insertBefore(ge(),n),n,void 0,t??{})}return r._$AI(s),r};const ct=globalThis;class T extends W{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Li(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return re}}T._$litElement$=!0,T.finalized=!0,ct.litElementHydrateSupport?.({LitElement:T});const Ni=ct.litElementPolyfillSupport;Ni?.({LitElement:T});(ct.litElementVersions??=[]).push("4.2.2");const Mi={attribute:!0,type:String,converter:Re,reflect:!1,hasChanged:at},Ri=(s=Mi,e,t)=>{const{kind:i,metadata:r}=t;let n=globalThis.litPropertyMetadata.get(r);if(n===void 0&&globalThis.litPropertyMetadata.set(r,n=new Map),i==="setter"&&((s=Object.create(s)).wrapped=!0),n.set(t.name,s),i==="accessor"){const{name:a}=t;return{set(d){const c=e.get.call(this);e.set.call(this,d),this.requestUpdate(a,c,s,!0,d)},init(d){return d!==void 0&&this.C(a,void 0,s,d),d}}}if(i==="setter"){const{name:a}=t;return function(d){const c=this[a];e.call(this,d),this.requestUpdate(a,c,s,!0,d)}}throw Error("Unsupported decorator location: "+i)};function w(s){return(e,t)=>typeof t=="object"?Ri(s,e,t):((i,r,n)=>{const a=r.hasOwnProperty(n);return r.constructor.createProperty(n,i),a?Object.getOwnPropertyDescriptor(r,n):void 0})(s,e,t)}function m(s){return w({...s,state:!0,attribute:!1})}var Oi=Object.defineProperty,we=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&Oi(e,t,r),r};const We=17,Xt="ha_govee_led_ble/effect_studio/recent_colours",Ne=[[255,69,58],[255,159,10],[255,214,10],[48,209,88],[99,230,226],[100,210,255],[10,132,255],[94,92,230],[191,90,242],[255,45,85],[172,142,104],[255,255,255],[174,174,178],[99,99,102],[28,28,30],[255,127,0],[139,0,255]];let te=Bi();class de extends T{constructor(){super(...arguments),this.palette=[],this.minColours=1,this.maxColours=8,this.disabled=!1,this.pointerX=0,this.pointerY=0,this.pointerMoved=!1,this.suppressClick=!1,this.windowPointerDown=e=>{this.editingIndex!==void 0&&!e.composedPath().includes(this)&&(this.editingIndex=void 0)}}connectedCallback(){super.connectedCallback(),window.addEventListener("pointerdown",this.windowPointerDown)}disconnectedCallback(){window.removeEventListener("pointerdown",this.windowPointerDown),super.disconnectedCallback()}willUpdate(e){e.has("palette")&&this.editingIndex!==void 0&&this.editingIndex>=this.palette.length&&(this.editingIndex=void 0)}render(){return o`
      <ul class="palette-list" aria-label="Colours">
        ${this.palette.map((e,t)=>o`
            <li
              class="swatch-item ${this.editingIndex===t&&this.palette.length>this.minColours?"remove-ready":""}"
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
                style="--swatch-colour: ${x(e)}"
                aria-label=${this.editingIndex===t&&this.palette.length>this.minColours?`Remove colour ${t+1}`:`Edit colour ${t+1}, ${x(e)}. Drag to reorder or use arrow keys.`}
                ?disabled=${this.disabled}
                @click=${()=>this.swatchClicked(t)}
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
      <div
        class="colour-popover"
        role="dialog"
        aria-label="Edit colour"
        @keydown=${i=>this.popoverKeyPressed(e,i)}
      >
        <div class="preset-grid">
          ${te.map(i=>o`
              <button
                type="button"
                style="--preset-colour: ${x(i)}"
                aria-label="Use ${x(i)}"
                ?disabled=${this.disabled}
                @click=${()=>this.commitColour(e,i)}
              ></button>
            `)}
          <label
            class="custom-colour"
            style="--custom-colour: ${x(t)}"
          >
            <input
              type="color"
              aria-label="Custom colour"
              .value=${x(t)}
              ?disabled=${this.disabled}
              @input=${i=>this.updateColour(e,St(i.target.value))}
              @change=${i=>this.commitColour(e,St(i.target.value))}
            />
          </label>
        </div>
      </div>
    `}commitColour(e,t){Fi(t),this.updateColour(e,t),this.editingIndex=void 0,this.focusSwatchAfterUpdate(e)}updateColour(e,t){const i=ie(this.palette);i[e]=[...t],this.emitPalette(i)}addColour(){if(this.disabled||this.palette.length>=this.maxColours)return;const e=this.palette[this.palette.length-1]??te[this.palette.length%te.length],t=[...ie(this.palette),[...e]];this.editingIndex=t.length-1,this.emitPalette(t)}removeColour(e){if(this.disabled||this.palette.length<=this.minColours)return;const t=this.palette.filter((r,n)=>n!==e).map(r=>[...r]),i=Math.min(e,t.length-1);this.editingIndex=void 0,this.emitPalette(t),this.focusSwatchAfterUpdate(i)}moveColour(e,t,i=!1){const r=e+t;this.disabled||r<0||r>=this.palette.length||this.reorder(e,r,i)}reorder(e,t,i=!1){if(this.disabled||e===t)return;const r=ie(this.palette),[n]=r.splice(e,1);r.splice(t,0,n),this.editingIndex=this.editingIndex===e?t:qi(this.editingIndex,e,t),this.emitPalette(r),i&&this.focusSwatchAfterUpdate(t)}focusSwatchAfterUpdate(e){this.updateComplete.then(()=>{this.shadowRoot?.querySelector(`.swatch[data-colour-index="${e}"]`)?.focus()})}dragStarted(e,t){this.disabled||(this.draggedIndex=e,t.dataTransfer?.setData("text/plain",String(e)))}dropped(e,t){t.preventDefault(),this.draggedIndex!==void 0&&(this.reorder(this.draggedIndex,e),this.draggedIndex=void 0)}keyPressed(e,t){t.key!=="ArrowLeft"&&t.key!=="ArrowRight"||(t.preventDefault(),this.moveColour(e,t.key==="ArrowLeft"?-1:1,!0))}popoverKeyPressed(e,t){t.key==="Escape"&&(t.preventDefault(),t.stopPropagation(),this.editingIndex=void 0,this.focusSwatchAfterUpdate(e))}swatchClicked(e){if(this.suppressClick){this.suppressClick=!1;return}if(this.editingIndex===e&&this.palette.length>this.minColours){this.removeColour(e);return}this.editingIndex=this.editingIndex===e?void 0:e}pointerStarted(e,t){this.disabled||t.pointerType==="mouse"||t.target.closest(".colour-popover")||(this.pointerId=t.pointerId,this.pointerIndex=e,this.pointerX=t.clientX,this.pointerY=t.clientY,this.pointerMoved=!1,t.currentTarget.setPointerCapture(t.pointerId))}pointerMovedOver(e){if(e.pointerId!==this.pointerId||this.pointerIndex===void 0)return;const t=e.clientX-this.pointerX,i=e.clientY-this.pointerY;if(!this.pointerMoved){if(Math.abs(i)>Math.abs(t)||Math.abs(t)<10)return;this.pointerMoved=!0}e.preventDefault();const r=this.shadowRoot?.elementFromPoint(e.clientX,e.clientY)?.closest("[data-colour-index]"),n=Number(r?.dataset.colourIndex);!Number.isInteger(n)||n===this.pointerIndex||(this.reorder(this.pointerIndex,n),this.pointerIndex=n)}pointerFinished(e){if(e.pointerId!==this.pointerId)return;const t=e.currentTarget;t.hasPointerCapture(e.pointerId)&&t.releasePointerCapture(e.pointerId),this.suppressClick=this.pointerMoved,this.pointerId=void 0,this.pointerIndex=void 0,this.pointerMoved=!1}emitPalette(e){this.palette=e,this.dispatchEvent(new CustomEvent("palette-changed",{detail:{palette:e},bubbles:!0,composed:!0}))}static{this.styles=oe`
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

    .remove-ready .swatch {
      position: relative;
      outline: 2px solid rgb(255 255 255 / 95%);
      outline-offset: -4px;
    }

    .remove-ready .swatch::after {
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
      width: min(280px, calc(100vw - 48px));
      padding: 10px;
      border: 1px solid var(--studio-border);
      border-radius: 9px;
      background: var(--studio-card);
      box-shadow: 0 8px 24px rgb(0 0 0 / 18%);
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
      outline: 3px solid var(--studio-blue);
      outline-offset: 2px;
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
  `}}we([w({attribute:!1})],de.prototype,"palette");we([w({type:Number})],de.prototype,"minColours");we([w({type:Number})],de.prototype,"maxColours");we([w({type:Boolean})],de.prototype,"disabled");we([m()],de.prototype,"editingIndex");function ie(s){return s.map(e=>[...e])}function Bi(){const s=localStorage.getItem(Xt);if(!s)return ie(Ne);let e;try{e=JSON.parse(s)}catch(i){if(i instanceof SyntaxError)return ie(Ne);throw i}if(!Array.isArray(e))return ie(Ne);const t=e.filter(Ui).map(i=>[...i]).slice(0,We);return Yt(t)}function Fi(s){const e=x(s);te=Yt([[...s],...te.filter(t=>x(t)!==e)]),localStorage.setItem(Xt,JSON.stringify(te))}function Yt(s){const e=s.map(t=>[...t]);for(const t of Ne)e.length>=We||e.some(i=>x(i)===x(t))||e.push([...t]);return e.slice(0,We)}function Ui(s){return Array.isArray(s)&&s.length===3&&s.every(e=>Number.isInteger(e)&&e>=0&&e<=255)}function qi(s,e,t){return s===void 0||e===t?s:s===e?t:e<t&&s>e&&s<=t?s-1:t<e&&s>=t&&s<e?s+1:s}function x(s){return`#${s.map(e=>e.toString(16).padStart(2,"0")).join("")}`}function St(s){return[Number.parseInt(s.slice(1,3),16),Number.parseInt(s.slice(3,5),16),Number.parseInt(s.slice(5,7),16)]}customElements.get("govee-palette-editor")||customElements.define("govee-palette-editor",de);var zi=Object.defineProperty,ke=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&zi(e,t,r),r};const X=5,Ct=8,Jt=[1,2,0,3],Wt=[0,1,2,3],Hi={0:"Segment",1:"Continuous",2:"Random",3:"Custom"},ji={0:"Brightest to darkest",1:"Brightest, darkest, brightest",2:"Darkest to brightest",3:"Darkest, brightest, darkest"},Et={0:"Forward",1:"Backward",2:"Forward and back",3:"Back and forward"};class ce extends T{constructor(){super(...arguments),this.disabled=!1,this.activeLayerIndex=0,this.activePatternIndex=0,this.movementAnnouncement=""}willUpdate(e){if(!(!e.has("content")||!this.content)){if(this.content.layers.length===0){this.activeLayerIndex=0,this.activePatternIndex=0;return}if(this.activeLayerIndex=z(this.activeLayerIndex,0,this.content.layers.length-1),this.activeLayer.brightness_patterns.length===0){this.activePatternIndex=0;return}this.activePatternIndex=z(this.activePatternIndex,0,this.activeLayer.brightness_patterns.length-1)}}render(){if(!this.content)return l;if(this.content.layers.length===0)return this.renderEmptyLayers();const e=this.activeLayer;return o`
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
            ?disabled=${this.disabled||this.content.layers.length>=X}
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
            ?disabled=${this.disabled||this.content.layers.length>=X}
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

        ${this.content.layers.length>=X?o`
              <p class="limit-note">
                ${this.content.layers.length>X?`This loaded effect has ${this.content.layers.length} layers. All are preserved, but adding and copying are unavailable while five or more remain.`:"Advanced effects can author up to five layers."}
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
    `}get activeLayer(){return this.content.layers[this.activeLayerIndex]}renderAppliedArea(e){const t=e.area.start_tenths>=0&&e.area.start_tenths<=9&&e.area.width_tenths>=1&&e.area.width_tenths<=10-e.area.start_tenths,i=z(e.area.start_tenths,0,9),r=i+e.area.width_tenths;return o`
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
    `}renderSelection(e){const t=e.selection,i=Vi(t.type);return o`
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
            ${Jt.map(r=>o`<option
                  value=${r}
                  .selected=${t.type===r}
                >
                  ${Hi[r]}
                </option>`)}
            ${i?l:o`
                  <option value=${t.type} .selected=${!0}>
                    Raw type ${t.type} (0x${Ce(t.type)})
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
          .maxColours=${Ct}
          .disabled=${this.disabled}
          @palette-changed=${t=>this.updateLayer({palette:t.detail.palette.map(i=>[...i])})}
        ></govee-palette-editor>
        ${e.palette.length>Ct?o`
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
        ${this.rangeField("Colour speed",e.colour_speed,0,255,pe(e.colour_speed),i=>this.updateLayer({colour_speed:i}))}
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
      `;const t=z(this.activePatternIndex,0,e.brightness_patterns.length-1),i=e.brightness_patterns[t],r=Ki(i.order);return o`
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
              ${Wt.map(n=>o`<option value=${n}>
                    ${ji[n]}
                  </option>`)}
              ${r?l:o`
                    <option value=${i.order} .selected=${!0}>
                      Raw order ${i.order} (0x${Ce(i.order)})
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
          ${this.rangeField("Scope low",i.scope_low,0,255,pe(i.scope_low),n=>this.updateBrightnessPattern({scope_low:n}))}
          ${this.rangeField("Scope high",i.scope_high,0,255,pe(i.scope_high),n=>this.updateBrightnessPattern({scope_high:n}))}
          ${this.rangeField("Changing speed",i.change_speed,0,255,pe(i.change_speed),n=>this.updateBrightnessPattern({change_speed:n}))}
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
                  @change=${n=>{const a=Number(n.target.value);this.updateMovement(t,{direction:a},`${i} direction ${Et[a]}.`)}}
                >
                  ${Object.entries(Et).map(([n,a])=>o`<option value=${n}>${a}</option>`)}
                </select>
              </label>
              ${this.rangeField("Speed",r.speed,0,255,pe(r.speed),n=>this.updateMovement(t,{speed:n},`${i} speed ${ei(n)} per cent.`))}
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
          .value=${String(z(t,i,r))}
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
          @change=${a=>n(z(Number(a.target.value),i,r))}
        />
      </label>
    `}hexByteField(e,t,i,r=255){return o`
      <label class="field">
        <span>${e}</span>
        <input
          type="text"
          inputmode="text"
          spellcheck="false"
          .value=${Ce(t)}
          ?disabled=${this.disabled}
          @change=${n=>{const a=n.target,d=Xi(a.value);if(d===void 0){a.setCustomValidity("Enter one byte from 00 to FF."),a.reportValidity();return}if((d&~r)!==0){a.setCustomValidity(`Known flag bits are controlled elsewhere. Allowed mask: ${Ce(r)}.`),a.reportValidity();return}a.setCustomValidity(""),i(d)}}
        />
      </label>
    `}updateLayer(e){if(!this.content||this.disabled)return;const t=this.content.layers.map((i,r)=>r===this.activeLayerIndex?O({...i,...e}):O(i));this.emitContent({kind:"advanced",layers:t})}updateSelection(e){this.updateLayer({selection:{...this.activeLayer.selection,...e}})}updateBrightnessPattern(e){const t=this.activeLayer.brightness_patterns.map((i,r)=>r===this.activePatternIndex?{...i,...e}:{...i});this.updateLayer({brightness_patterns:t})}updateMovement(e,t,i){this.updateLayer({[e]:{...this.activeLayer[e],...t}}),i&&(this.movementAnnouncement=i)}addLayer(){if(!this.content||this.disabled||this.content.layers.length>=X)return;const e=[...this.content.layers.map(O),Zt()];this.installContent({kind:"advanced",layers:e}),this.activeLayerIndex=e.length-1,this.activePatternIndex=0,this.focusActiveTab()}copyLayer(){if(!this.content||this.disabled||this.content.layers.length>=X)return;const e=this.content.layers.map(O);e.splice(this.activeLayerIndex+1,0,O(this.activeLayer)),this.installContent({kind:"advanced",layers:e}),this.activeLayerIndex+=1,this.activePatternIndex=0,this.focusActiveTab()}deleteLayer(){if(!this.content||this.disabled||this.content.layers.length===1)return;const e=this.content.layers.filter((t,i)=>i!==this.activeLayerIndex).map(O);this.activeLayerIndex=Math.min(this.activeLayerIndex,e.length-1),this.activePatternIndex=0,this.emitContent({kind:"advanced",layers:e}),this.focusActiveTab()}moveLayer(e){if(!this.content||this.disabled)return;const t=this.activeLayerIndex+e;if(t<0||t>=this.content.layers.length)return;const i=this.content.layers.map(O),[r]=i.splice(this.activeLayerIndex,1);i.splice(t,0,r),this.activeLayerIndex=t,this.emitContent({kind:"advanced",layers:i}),this.focusActiveTab()}addBrightnessPattern(){if(this.disabled||this.activeLayer.brightness_patterns.length>=3)return;const e=[...this.activeLayer.brightness_patterns.map(t=>({...t})),Qt()];this.activePatternIndex=e.length-1,this.updateLayer({brightness_patterns:e})}deleteBrightnessPattern(){if(this.disabled||this.activeLayer.brightness_patterns.length===1)return;const e=this.activeLayer.brightness_patterns.filter((t,i)=>i!==this.activePatternIndex).map(t=>({...t}));this.activePatternIndex=Math.min(this.activePatternIndex,e.length-1),this.updateLayer({brightness_patterns:e})}selectLayer(e){this.activeLayerIndex=e,this.activePatternIndex=0}layerTabKeyPressed(e,t){let i;t.key==="ArrowLeft"?i=e===0?this.content.layers.length-1:e-1:t.key==="ArrowRight"?i=e===this.content.layers.length-1?0:e+1:t.key==="Home"?i=0:t.key==="End"&&(i=this.content.layers.length-1),i!==void 0&&(t.preventDefault(),this.selectLayer(i),this.focusActiveTab())}patternTabKeyPressed(e,t){const i=this.activeLayer.brightness_patterns.length;let r;t.key==="ArrowLeft"?r=e===0?i-1:e-1:t.key==="ArrowRight"?r=e===i-1?0:e+1:t.key==="Home"?r=0:t.key==="End"&&(r=i-1),r!==void 0&&(t.preventDefault(),this.activePatternIndex=r,this.updateComplete.then(()=>{this.shadowRoot?.querySelectorAll(".pattern-tabs button")[r]?.focus()}))}focusActiveTab(){this.updateComplete.then(()=>{this.shadowRoot?.querySelector(`#advanced-layer-tab-${this.activeLayerIndex}`)?.focus()})}excessChanged(e){const t=e.value.replace(/\s+/g,"").toLowerCase();if(!/^(?:[0-9a-f]{2})*$/.test(t)){e.setCustomValidity("Enter an even number of hexadecimal digits."),e.reportValidity();return}e.setCustomValidity(""),this.updateLayer({excess:t})}emitContent(e){this.dispatchEvent(new CustomEvent("content-changed",{detail:{content:e},bubbles:!0,composed:!0}))}installContent(e){this.content=e,this.emitContent(e)}static{this.styles=oe`
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
  `}}ke([w({attribute:!1})],ce.prototype,"content");ke([w({type:Boolean})],ce.prototype,"disabled");ke([m()],ce.prototype,"activeLayerIndex");ke([m()],ce.prototype,"activePatternIndex");ke([m()],ce.prototype,"movementAnnouncement");function Gi(){return{kind:"advanced",layers:[Zt()]}}function ye(s){return{kind:"advanced",layers:s.layers.map(O)}}function Zt(){return{area:{start_tenths:0,width_tenths:10},selection:{type:0,param_1:0,param_2:1},brightness_gradient:!1,brightness_patterns:[Qt()],distribution:{method:1,backwards:!1},colour_speed:128,colour_retention:20,palette:[[255,0,0],[0,0,255]],selected_movement:At(),overall_movement:At(),priority:0,unknown_flags:0,excess:""}}function Qt(){return{scope_high:255,scope_low:0,order:0,change_speed:128,brightest_retention:20,darkest_retention:20}}function At(){return{enabled:!1,enter_exit:!1,direction:0,distance:1,speed:128,unknown_flags:0}}function O(s){return{...s,area:{...s.area},selection:{...s.selection},brightness_patterns:s.brightness_patterns.map(e=>({...e})),distribution:{...s.distribution},palette:s.palette.map(e=>[...e]),selected_movement:{...s.selected_movement},overall_movement:{...s.overall_movement}}}function Vi(s){return Jt.includes(s)}function Ki(s){return Wt.includes(s)}function ei(s){return Math.round(z(s,0,255)/255*100)}function pe(s){return`${ei(s)}% · ${s}`}function Ce(s){return s.toString(16).padStart(2,"0").toUpperCase()}function Xi(s){const e=s.trim().replace(/^0x/i,"");if(/^[0-9a-f]{1,2}$/i.test(e))return Number.parseInt(e,16)}function z(s,e,t){return Math.min(t,Math.max(e,Math.round(s)))}customElements.get("govee-advanced-effect-editor")||customElements.define("govee-advanced-effect-editor",ce);const Yi=1,ti=1,Ji=1,M=128,G=65536,ii=512,si=256,ri=32,ni=128,ai=512,$=255,Wi=64,Zi=262144,Dt=16,Qi=4096,es=16384,Z=1024,Ge=16384,lt=Number.MAX_SAFE_INTEGER,ts=4335,is=232,ss=253;function rs(s){const e=b(s,"editor info"),t=b(e.limits,"editor limits");return{api_version:u(e.api_version,"API version",1),effect_schema_version:u(e.effect_schema_version,"effect schema version",1),compiler_version:u(e.compiler_version,"compiler version",1),limits:{effect_name:B(t.effect_name,M,"effect-name limit"),effect_document_bytes:B(t.effect_document_bytes,G,"effect-document limit"),devices:B(t.devices,ii,"device limit"),library_items:B(t.library_items,si,"library-item limit"),drafts_per_owner:B(t.drafts_per_owner,ri,"draft limit"),deployment_records:B(t.deployment_records,ni,"deployment limit"),scene_catalogue_entries:B(t.scene_catalogue_entries,ai,"scene catalogue limit")}}}function ns(s){const e=D(s,"devices",ii).map((t,i)=>{const r=b(t,`devices[${i}]`),n=b(r.custom_effects,`devices[${i}].custom_effects`);return{config_entry_id:v(r.config_entry_id,`devices[${i}].config_entry_id`,$),model:v(r.model,`devices[${i}].model`,$),display_name:v(r.display_name,`devices[${i}].display_name`,$),segment_count:u(r.segment_count,`devices[${i}].segment_count`,0,65535),custom_effects:{painted:Q(n.painted,"painted capability"),single:Q(n.single,"single capability"),multi:Q(n.multi,"multi capability"),advanced:Q(n.advanced,"advanced capability")},readback:v(r.readback,`devices[${i}].readback`,$)}});return ze(e,t=>t.config_entry_id,"device IDs"),e}function as(s){K(s,"custom-effect catalogue",G);const e=b(s,"custom-effect catalogue"),t=b(e.limits,"custom-effect limits"),i=b(e.apply,"custom-effect Apply capabilities");return{schema_version:u(e.schema_version,"catalogue schema",1),sku:V(e.sku,"catalogue SKU"),effects:D(e.effects,"custom-effect templates",Z).map((r,n)=>{const a=b(r,`custom-effect templates[${n}]`);return{id:v(a.id,"template ID",$),label:v(a.label,"template label",M),family:u(a.family,"template family",0,255),variant:u(a.variant,"template variant",0,255)}}),limits:{palette_min:u(t.palette_min,"minimum palette",1,255),palette_max:u(t.palette_max,"maximum palette",1,255),multi_max:u(t.multi_max,"maximum Multi effects",1,255)},apply:{single:Q(i.single,"Single Apply capability"),multi:Q(i.multi,"Multi Apply capability")}}}function Pt(s){const e=b(s,"library snapshot"),t={library_revision:U(e.library_revision,"library revision",0),items:D(e.items,"library items",si).map((i,r)=>{const n=b(i,`library items[${r}]`),a=n.template===void 0?void 0:Be(n.template,`library items[${r}].template`);return{id:v(n.id,"library item ID",$),revision:U(n.revision,"library item revision",1),name:v(n.name,"library item name",M),kind:v(n.kind,"library item kind",$),...a?{template:a}:{}}})};return ze(t.items,i=>i.id,"library item IDs"),t}function Me(s){K(s,"library item",G);const e=b(s,"library item"),t=e.target_hint===void 0?void 0:b(e.target_hint,"target hint");return{schema_version:B(e.schema_version,ti,"effect schema version"),id:v(e.id,"effect ID",$),revision:U(e.revision,"effect revision",1),name:v(e.name,"effect name",M),content:oi(e.content),provenance:Nt(e.provenance,"effect provenance"),extensions:Nt(e.extensions,"effect extensions"),...t?{target_hint:{model:t.model===null?null:v(t.model,"target model",$),segment_count:t.segment_count===null?null:u(t.segment_count,"target segment count",1,65535)}}:{}}}function os(s){const e=D(s,"draft summaries",ri).map((t,i)=>{const r=b(t,`draft summaries[${i}]`);return{id:v(r.id,"draft ID",$),revision:U(r.revision,"draft revision",1),name:v(r.name,"draft name",M),updated_at:ut(r.updated_at,"draft timestamp"),selected_config_entry_id:$e(r.selected_config_entry_id,"draft config entry ID")}});return ze(e,t=>t.id,"draft IDs"),e}function Ve(s){const e=b(s,"effect draft");return{id:v(e.id,"draft ID",$),owner_id:v(e.owner_id,"draft owner",$),revision:U(e.revision,"draft revision",1),item:Me(e.item),updated_at:ut(e.updated_at,"draft timestamp"),selected_config_entry_id:$e(e.selected_config_entry_id,"draft config entry ID"),base_item_id:$e(e.base_item_id,"draft base item ID"),base_item_revision:e.base_item_revision===null?null:U(e.base_item_revision,"draft base item revision",1)}}function Ze(s){const e=b(s,"deployment"),t=V(e.phase,"deployment phase");t!=="pending"&&t!=="uploading"&&t!=="verifying"&&t!=="confirmed"&&t!=="failed"&&t!=="interrupted"&&t!=="unknown"&&g("deployment phase is invalid");const i={operation_id:v(e.operation_id,"deployment operation ID",$),config_entry_id:v(e.config_entry_id,"deployment config entry ID",$),diy_code:u(e.diy_code,"deployment DIY code",0,65535),phase:t,updated_at:ut(e.updated_at,"deployment timestamp"),item_id:$e(e.item_id,"deployment item ID"),item_revision:e.item_revision===null?null:U(e.item_revision,"deployment item revision",1),error_code:$e(e.error_code,"deployment error code"),progress_current:u(e.progress_current,"deployment progress",0,1024),progress_total:u(e.progress_total,"deployment progress total",0,1024)};return i.progress_current>i.progress_total&&g("deployment progress exceeds its total"),i}function ds(s){const e=b(s,"deployment snapshot"),t={revision:U(e.revision,"deployment revision",0),deployments:D(e.deployments,"deployments",ni).map(Ze)};return ze(t.deployments,i=>i.operation_id,"deployment operation IDs"),t}function cs(s){K(s,"scene catalogue",Zi,es);const e=b(s,"scene catalogue");return{schema_version:u(e.schema_version,"scene catalogue schema",1),sku:v(e.sku,"scene catalogue SKU",$),enabled:ae(e.enabled,"scene catalogue enabled"),categories:D(e.categories,"scene categories",Z).map((t,i)=>{const r=b(t,`scene categories[${i}]`);return{id:u(r.id,"scene category ID",0,65535),name:v(r.name,"scene category name",M)}}),scenes:D(e.scenes,"scenes",ai).map(pt)}}function ls(s){const e=b(s,"scene detail");K({scene:e.scene,content:e.content},"scene detail",G);const t=oi(e.content);return t.kind!=="scene_builtin"&&t.kind!=="scene_palette"&&t.kind!=="scene_layered"&&g("scene detail content is unsupported"),{scene:pt(e.scene),content:t}}function oi(s){K(s,"effect content",G);const e=b(s,"effect content"),t=v(e.kind,"effect content kind",$);switch(t){case"h617a_painted":return{kind:t,effect:fs(e.effect,["clockwise","counter_clockwise"],"painted effect"),speed:u(e.speed,"painted speed",0,100),brightness:u(e.brightness,"painted brightness",0,100),background:_e(e.background,"painted background"),groups:D(e.groups,"paint groups",15).map((i,r)=>{const n=b(i,`paint groups[${r}]`);return{fill:_e(n.fill,"paint-group fill"),segments:D(n.segments,"painted segments",15).map(a=>u(a,"painted segment",0,14))}})};case"h617a_single":return{kind:t,family:u(e.family,"Single family",0,254),variant:u(e.variant,"Single variant",0,255),speed:u(e.speed,"Single speed",0,100),palette:Fe(e.palette,"Single palette",8)};case"h617a_multi":return{kind:t,effects:D(e.effects,"Multi effects",4).map((i,r)=>{const n=b(i,`Multi effects[${r}]`);return{family:u(n.family,"Multi family",0,254),variant:u(n.variant,"Multi variant",0,255)}}),speed:u(e.speed,"Multi speed",0,100),palette:Fe(e.palette,"Multi palette",8)};case"advanced":return{kind:t,layers:Tt(e.layers,"Advanced layers")};case"scene_builtin":return{kind:t,template:Be(e.template,"scene template"),speed_index:Qe(e.speed_index,"scene speed index",0,255)};case"scene_palette":return ps(e);case"scene_layered":{const i=b(e.effect,"layered scene effect"),r=di(e.trailing_padding,"layered scene trailing padding");return{kind:t,template:Be(e.template,"layered scene template"),effect:{layers:Tt(i.layers,"layered scene layers")},speed_index:Qe(e.speed_index,"layered scene speed index",0,255),raw_param:ci(e.raw_param,"layered scene raw parameter"),...r===void 0?{}:{trailing_padding:r}}}default:{const{kind:i,...r}=e;return{kind:"opaque",source_kind:t,body:r}}}}function di(s,e){if(s!==void 0)return u(s,e,0,ts)}function ps(s){const t=u(s.layout,"palette scene layout",0,1)===0?0:1,i=D(s.steps,"palette scene steps",255).map((d,c)=>{const h=b(d,`palette scene steps[${c}]`),p=t===0?(h.inline_colour!==null&&g(`palette scene steps[${c}].inline_colour must be null for layout 0`),null):_e(h.inline_colour,`palette scene steps[${c}].inline_colour`);return{value:u(h.value,`palette scene steps[${c}].value`,0,65535),colour:_e(h.colour,`palette scene steps[${c}].colour`),inline_colour:p}}),r=Fe(s.palette,"palette scene shared palette",255,!0);t===1&&r.length!==0&&g("palette scene layout 1 must not have a shared palette");let n;s.config_flags!==void 0&&(n=u(s.config_flags,"palette scene config flags",0,255),n&-9&&g("palette scene config flags must only set reserved config bits"));const a=di(s.trailing_padding,"palette scene trailing padding");return{kind:"scene_palette",template:Be(s.template,"palette scene template"),layout:t,brightness_flag:ae(s.brightness_flag,"palette scene brightness flag"),steps:i,palette:r,speed_index:Qe(s.speed_index,"palette scene speed index",0,255),...n===void 0?{}:{config_flags:n},...a===void 0?{}:{trailing_padding:a}}}function ue(s){return s.kind!=="opaque"?s:(K(s.body,"opaque content",G),{...s.body,kind:v(s.source_kind,"opaque source kind",$)})}function pt(s){const e=b(s,"scene"),t=V(e.parameter_kind,"scene parameter kind");t!=="none"&&t!=="palette"&&t!=="layers"&&t!=="opaque"&&g("scene parameter kind is invalid");const i=e.speed===null?null:(()=>{const r=b(e.speed,"scene speed");return{option_count:u(r.option_count,"scene speed option count",1,256),default_index:u(r.default_index,"scene default speed",0,255)}})();return{scene_id:u(e.scene_id,"scene ID",0,65535),effect_id:u(e.effect_id,"scene effect ID",0,65535),category_id:u(e.category_id,"scene category ID",0,65535),category:v(e.category,"scene category",M),name:v(e.name,"scene name",M),variant:hs(e.variant,"scene variant",$),display_name:v(e.display_name,"scene display name",M),scene_type:u(e.scene_type,"scene type",0,255),parameter_kind:t,speed:i}}function Tt(s,e){return D(s,e,255).map((t,i)=>us(t,`${e}[${i}]`))}function us(s,e){const t=b(s,e),i=b(t.area,`${e}.area`),r=b(t.selection,`${e}.selection`),n=b(t.distribution,`${e}.distribution`);return{area:{start_tenths:u(i.start_tenths,`${e}.area.start_tenths`,0,15),width_tenths:u(i.width_tenths,`${e}.area.width_tenths`,0,15)},selection:{type:A(r.type,`${e}.selection.type`),param_1:A(r.param_1,`${e}.selection.param_1`),param_2:A(r.param_2,`${e}.selection.param_2`)},brightness_gradient:ae(t.brightness_gradient,`${e}.brightness_gradient`),brightness_patterns:D(t.brightness_patterns,`${e}.brightness_patterns`,255).map((a,d)=>{const c=b(a,`${e}.brightness_patterns[${d}]`);return{scope_high:A(c.scope_high,"brightness scope high"),scope_low:A(c.scope_low,"brightness scope low"),order:A(c.order,"brightness order"),change_speed:A(c.change_speed,"brightness change speed"),brightest_retention:A(c.brightest_retention,"brightest retention"),darkest_retention:A(c.darkest_retention,"darkest retention")}}),distribution:{method:u(n.method,`${e}.distribution.method`,0,127),backwards:ae(n.backwards,`${e}.distribution.backwards`)},colour_speed:A(t.colour_speed,`${e}.colour_speed`),colour_retention:A(t.colour_retention,`${e}.colour_retention`),palette:Fe(t.palette,`${e}.palette`,255,!0),selected_movement:Lt(t.selected_movement,`${e}.selected_movement`),overall_movement:Lt(t.overall_movement,`${e}.overall_movement`),priority:A(t.priority,`${e}.priority`),unknown_flags:li(t.unknown_flags,ss,`${e}.unknown_flags`),excess:ci(t.excess,`${e}.excess`)}}function Lt(s,e){const t=b(s,e);return{enabled:ae(t.enabled,`${e}.enabled`),enter_exit:ae(t.enter_exit,`${e}.enter_exit`),direction:u(t.direction,`${e}.direction`,0,3),distance:A(t.distance,`${e}.distance`),speed:A(t.speed,`${e}.speed`),unknown_flags:li(t.unknown_flags,is,`${e}.unknown_flags`)}}function Be(s,e){const t=b(s,e);return{sku:v(t.sku,`${e}.sku`,$),scene_id:u(t.scene_id,`${e}.scene_id`,0,65535),effect_id:u(t.effect_id,`${e}.effect_id`,0,65535),catalogue_schema_version:u(t.catalogue_schema_version,`${e}.catalogue_schema_version`,1,lt)}}function Fe(s,e,t,i=!1){const r=D(s,e,t);return!i&&r.length===0&&g(`${e} must not be empty`),r.map((n,a)=>_e(n,`${e}[${a}]`))}function _e(s,e){const t=D(s,e,3);return t.length!==3&&g(`${e} must contain three channels`),t.map(i=>u(i,`${e} channel`,0,255))}function Q(s,e){return s!=="supported"&&s!=="unsupported"&&s!=="evidence_gap"&&g(`${e} is invalid`),s}function Nt(s,e){return K(s,e,G),b(s,e)}function $e(s,e){return s===null?null:v(s,e,$)}function ut(s,e){const t=v(s,e,Wi);return(!/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(t)||Number.isNaN(Date.parse(t)))&&g(`${e} must be an ISO 8601 timestamp with a UTC offset`),t}function v(s,e,t){const i=V(s,e);return(i.length===0||i.length>t)&&g(`${e} must contain 1 to ${t} characters`),i}function hs(s,e,t){const i=V(s,e);return i.length>t&&g(`${e} must not exceed ${t} characters`),i}function ci(s,e){const t=V(s,e);return(t.length%2!==0||!/^[0-9a-f]*$/i.test(t))&&g(`${e} must be hexadecimal`),t}function V(s,e){return typeof s!="string"&&g(`${e} must be a string`),s}function ae(s,e){return typeof s!="boolean"&&g(`${e} must be a boolean`),s}function u(s,e,t,i=lt){return(typeof s!="number"||!Number.isSafeInteger(s)||s<t||s>i)&&g(`${e} must be an integer from ${t} to ${i}`),s}function U(s,e,t){return u(s,e,t,lt)}function B(s,e,t){const i=u(s,t,1);return i!==e&&g(`${t} is incompatible with this editor`),i}function Qe(s,e,t,i){return s===null?null:u(s,e,t,i)}function A(s,e){return u(s,e,0,255)}function li(s,e,t){const i=A(s,t);return i&~e&&g(`${t} must only set reserved bits, not bits explicit fields carry`),i}function fs(s,e,t){const i=V(s,t);return e.includes(i)||g(`${t} is invalid`),i}function b(s,e){return(typeof s!="object"||s===null||Array.isArray(s))&&g(`${e} must be an object`),s}function D(s,e,t){return Array.isArray(s)||g(`${e} must be an array`),s.length>t&&g(`${e} must not exceed ${t} items`),s}function ze(s,e,t){const i=s.map(e);new Set(i).size!==i.length&&g(`${t} must be unique`)}function K(s,e,t,i=Qi){let r=0;const n=(d,c,h)=>{if(r+=1,r>i&&g(`${e} must not exceed ${i} JSON values`),h>Dt&&g(`${e} must not exceed ${Dt} nested levels`),!(d===null||typeof d=="boolean")){if(typeof d=="number"){(!Number.isFinite(d)||Number.isInteger(d)&&!Number.isSafeInteger(d))&&g(`${c} must be a finite JSON number`);return}if(typeof d=="string"){d.length>Ge&&g(`${c} must not exceed ${Ge} characters`);return}if(Array.isArray(d)){d.length>Z&&g(`${c} must not exceed ${Z} items`),d.forEach((p,f)=>n(p,`${c}[${f}]`,h+1));return}if(typeof d=="object"&&d!==null){const p=Object.entries(d);p.length>Z&&g(`${c} must not exceed ${Z} fields`),p.forEach(([f,k])=>{f.length>Ge&&g(`${c} contains an oversized key`),n(k,`${c}.${f}`,h+1)});return}g(`${c} contains a non-JSON value`)}};n(s,e,0);const a=JSON.stringify(s);a===void 0&&g(`${e} must contain JSON values`),new TextEncoder().encode(a).byteLength>t&&g(`${e} must not exceed ${t} bytes`)}function g(s){throw new Error(`Malformed Effect Studio server payload: ${s}.`)}function ms(s){return s.api_version===Yi&&s.effect_schema_version===ti&&s.compiler_version===Ji}const Ke="ha_govee_led_ble/editor";class gs{constructor(e){this.hass=e}async info(){return rs(await this.call("info"))}async devices(){const e=await this.call("devices");return ns(C(e,"devices"))}async customCatalogue(){const e=await this.call("custom/catalogue");return as(C(e,"catalogue"))}async library(){return Pt(await this.call("library/list"))}async item(e){const t=await this.call("library/get",{item_id:e});return Me(C(t,"item"))}async createItem(e,t,i){const r=await this.call("library/create",{name:e,content:ue(t),expected_library_revision:i});return{item:Me(C(r,"item")),library_revision:Mt(r)}}async updateItem(e,t,i,r){const n=await this.call("library/update",{item_id:e.id,name:t,content:ue(i),expected_revision:e.revision,expected_library_revision:r});return{item:Me(C(n,"item")),library_revision:Mt(n)}}async drafts(){const e=await this.call("draft/list");return os(C(e,"drafts"))}async draft(e){const t=await this.call("draft/get",{draft_id:e});return Ve(C(t,"draft"))}async createDraft(e,t,i,r){const n=await this.call("draft/create",{name:e,content:ue(t),updated_at:new Date().toISOString(),selected_config_entry_id:i,...r?{base_item_id:r.id,base_item_revision:r.revision}:{}});return Ve(C(n,"draft"))}async updateDraft(e,t,i,r){const n=await this.call("draft/update",{draft_id:e.id,expected_revision:e.revision,name:t,content:ue(i),updated_at:new Date().toISOString(),selected_config_entry_id:r});return Ve(C(n,"draft"))}async deleteDraft(e){await this.call("draft/delete",{draft_id:e.id,expected_revision:e.revision})}async applySaved(e,t){const i=await this.call("apply",{config_entry_id:e,item_id:t.id,revision:t.revision,updated_at:new Date().toISOString()});return Ze(C(i,"deployment"))}async applySnapshot(e,t,i){const r=await this.call("apply_snapshot",{config_entry_id:e,name:t,content:ue(i),updated_at:new Date().toISOString()});return Ze(C(r,"deployment"))}async sceneCatalogue(e){const t=await this.call("scene/catalogue/list",{config_entry_id:e});return cs(C(t,"catalogue"))}sceneDetail(e,t,i){return this.call("scene/catalogue/get",{config_entry_id:e,scene_id:t,effect_id:i}).then(ls)}async applyScene(e,t,i){const r=await this.call("scene/apply",{config_entry_id:e,scene_id:t.scene_id,effect_id:t.effect_id,...i===null?{}:{speed_index:i}}),n=pt(C(r,"scene")),a=C(r,"readback");if(a!=="scene_identity_only")throw new Error("Malformed Effect Studio server payload: scene Apply readback is invalid.");const d=C(r,"speed_index");if(d!==null&&(typeof d!="number"||!Number.isSafeInteger(d)||d<0||d>255))throw new Error("Malformed Effect Studio server payload: scene Apply speed is invalid.");return{scene:n,speed_index:d,readback:a}}subscribeLibrary(e,t){return this.hass.connection.subscribeMessage(i=>{try{e(Pt(i))}catch(r){t?.(Rt(r))}},{type:`${Ke}/library/subscribe`})}subscribeDeployments(e,t){return this.hass.connection.subscribeMessage(i=>{try{e(ds(i))}catch(r){t?.(Rt(r))}},{type:`${Ke}/deployment/subscribe`})}call(e,t={}){return this.hass.callWS({type:`${Ke}/${e}`,...t})}}function C(s,e){if(typeof s!="object"||s===null||Array.isArray(s))throw new Error("Malformed Effect Studio server payload: response must be an object.");if(!(e in s))throw new Error(`Malformed Effect Studio server payload: response is missing ${e}.`);return s[e]}function Mt(s){const e=C(s,"library_revision");if(typeof e!="number"||!Number.isSafeInteger(e)||e<0)throw new Error("Malformed Effect Studio server payload: library revision is invalid.");return e}function Rt(s){return s instanceof Error?s:new Error("Malformed Effect Studio server payload.")}var bs=Object.defineProperty,He=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&bs(e,t,r),r};class Ie extends T{constructor(){super(...arguments),this.disabled=!1,this.windowKeyPressed=e=>{e.key==="Escape"&&this.pickerIndex!==void 0&&(e.preventDefault(),this.closePicker())}}connectedCallback(){super.connectedCallback(),window.addEventListener("keydown",this.windowKeyPressed)}disconnectedCallback(){window.removeEventListener("keydown",this.windowKeyPressed),super.disconnectedCallback()}updated(e){e.has("pickerIndex")&&this.pickerIndex!==void 0&&this.shadowRoot?.querySelector(".modal-close")?.focus()}render(){return!this.content||!this.catalogue?l:o`
      <section class="card effect-card">
        <h3>${this.content.kind==="h617a_multi"?"Effects":"Effect"}</h3>
        ${this.content.kind==="h617a_single"?this.effectRow(this.content,0):this.renderSequence(this.content)}
      </section>

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
        @palette-changed=${e=>{this.emitContent({...this.content,palette:vs(e.detail.palette)})}}
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
            ${this.catalogue.effects.map(t=>{const i=e!==void 0&&Ee(t)===Ee(e);return o`
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
    `}selectEffect(e){if(!this.content||this.pickerIndex===void 0)return;const t={family:e.family,variant:e.variant};if(this.content.kind==="h617a_single")this.emitContent({...this.content,...t});else{const i=this.content.effects.map((r,n)=>n===this.pickerIndex?t:r);this.emitContent({...this.content,effects:i})}this.closePicker()}addEffect(){if(!this.content||this.content.kind!=="h617a_multi")return;const e=this.catalogue?.effects[this.content.effects.length]??this.catalogue?.effects[0];if(!e)return;const t=[...this.content.effects,{family:e.family,variant:e.variant}];this.emitContent({...this.content,effects:t})}removeEffect(e){if(!this.content||this.content.kind!=="h617a_multi")return;const t=this.content.effects.filter((i,r)=>r!==e);this.emitContent({...this.content,effects:t})}moveEffect(e,t){if(!this.content||this.content.kind!=="h617a_multi")return;const i=e+t;i<0||i>=this.content.effects.length||this.reorderEffect(e,i)}reorderEffect(e,t){if(!this.content||this.content.kind!=="h617a_multi"||e===t)return;const i=[...this.content.effects],[r]=i.splice(e,1);i.splice(t,0,r),this.emitContent({...this.content,effects:i})}effectDragStarted(e,t){this.draggedEffectIndex=e,t.dataTransfer?.setData("text/plain",String(e))}effectDropped(e,t){t.preventDefault(),this.draggedEffectIndex!==void 0&&(this.reorderEffect(this.draggedEffectIndex,e),this.draggedEffectIndex=void 0)}closeDetails(e){e.currentTarget.closest("details")?.removeAttribute("open")}openPicker(e){this.pickerIndex=e}closePicker(){const e=this.pickerIndex;this.pickerIndex=void 0,this.updateComplete.then(()=>{e!==void 0&&this.shadowRoot?.querySelector(`[data-effect-index="${e}"]`)?.focus()})}modalKeyPressed(e){if(e.key!=="Tab")return;const i=[...e.currentTarget.querySelectorAll("button:not([disabled])")];if(!i.length)return;const r=i[0],n=i[i.length-1],a=this.shadowRoot?.activeElement;e.shiftKey&&a===r?(e.preventDefault(),n.focus()):!e.shiftKey&&a===n&&(e.preventDefault(),r.focus())}effectLabel(e){return this.catalogue?.effects.find(t=>Ee(t)===Ee(e))?.label??"Unknown catalogue effect"}emitContent(e){this.dispatchEvent(new CustomEvent("content-changed",{detail:{content:e},bubbles:!0,composed:!0}))}static{this.styles=oe`
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
  `}}He([w({attribute:!1})],Ie.prototype,"content");He([w({attribute:!1})],Ie.prototype,"catalogue");He([w({type:Boolean})],Ie.prototype,"disabled");He([m()],Ie.prototype,"pickerIndex");function Ee(s){return`${s.family}:${s.variant}`}function vs(s){return s.map(e=>[...e])}customElements.get("govee-custom-effect-editor")||customElements.define("govee-custom-effect-editor",Ie);var ys=Object.defineProperty,pi=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&ys(e,t,r),r};class ht extends T{constructor(){super(...arguments),this.colours=[],this.disabled=!1}render(){return o`
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
    `}pointerStarted(e,t){this.disabled||(t.preventDefault(),this.paintingPointerId=t.pointerId,this.lastPaintedSegment=e,t.currentTarget.setPointerCapture(t.pointerId),this.selectSegment(e))}pointerMoved(e){if(e.pointerId!==this.paintingPointerId||!this.shadowRoot)return;const t=this.shadowRoot.elementFromPoint(e.clientX,e.clientY)?.closest("[data-segment]"),i=Number(t?.dataset.segment);Number.isInteger(i)&&i!==this.lastPaintedSegment&&(this.lastPaintedSegment=i,this.selectSegment(i))}pointerFinished(e){if(e.pointerId!==this.paintingPointerId)return;const t=this.shadowRoot?.querySelector(`[data-segment="${this.lastPaintedSegment}"]`);t?.hasPointerCapture(e.pointerId)&&t.releasePointerCapture(e.pointerId),this.paintingPointerId=void 0,this.lastPaintedSegment=void 0}segmentClicked(e,t){!this.disabled&&t.detail===0&&this.selectSegment(e)}selectSegment(e){this.dispatchEvent(new CustomEvent("segment-selected",{detail:{index:e},bubbles:!0,composed:!0}))}static{this.styles=oe`
    :host {
      display: block;
      --studio-blue: var(--primary-color, #2f6fed);
      --studio-border: var(--divider-color, #d8dce2);
      --studio-card: var(--card-background-color, #fff);
    }

    * {
      box-sizing: border-box;
    }

    .card {
      padding: 20px;
      border: 1px solid var(--studio-border);
      border-radius: 10px;
      background: var(--studio-card);
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
      outline: 3px solid var(--studio-blue);
      outline-offset: 2px;
    }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.52;
    }

    @media (max-width: 600px) {
      .segments {
        grid-template-columns: repeat(5, minmax(0, 1fr));
      }
    }
  `}}pi([w({attribute:!1})],ht.prototype,"colours");pi([w({type:Boolean})],ht.prototype,"disabled");customElements.get("govee-painted-segment-editor")||customElements.define("govee-painted-segment-editor",ht);var _s=Object.defineProperty,E=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&_s(e,t,r),r};class I extends T{constructor(){super(...arguments),this.library={library_revision:0,items:[]},this.isAdmin=!1,this.category="all",this.name="",this.speedIndex=null,this.loading=!1,this.saving=!1,this.applying=!1,this.requestGeneration=0}willUpdate(e){(e.has("device")||e.has("api"))&&(this.invalidateRequests(),this.catalogue=void 0,this.category="all",this.selectedScene=void 0,this.selectedItem=void 0,this.content=void 0,this.notice=void 0,this.error=void 0,this.loading=!!(this.api&&this.device))}updated(e){(e.has("device")||e.has("api"))&&this.api&&this.device&&this.loadCatalogue()}render(){return this.device?this.loading?o`<div class="status" role="status">Loading scenes...</div>`:this.error||!this.catalogue?o`
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
        ${this.filteredBuiltinScenes.map(e=>this.sceneButton(Y(e),e.display_name,e.parameter_kind==="none"?"Built-in":e.parameter_kind==="palette"?"Colours":e.parameter_kind==="layers"?"Layers":"Built-in",()=>this.selectBuiltin(e)))}
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
      `}get categoryLabel(){return this.category==="all"?"All scenes":this.category==="custom"?"Custom":this.catalogue?.categories.find(e=>e.id===this.category)?.name??"Scenes"}get compatibleCustomScenes(){return this.library.items.filter(e=>(e.kind==="scene_builtin"||e.kind==="scene_palette")&&e.template?.sku===this.catalogue?.sku)}get filteredCustomScenes(){return this.category==="all"||this.category==="custom"?this.compatibleCustomScenes:[]}get filteredBuiltinScenes(){return!this.catalogue||this.category==="custom"?[]:this.category==="all"?this.catalogue.scenes:this.catalogue.scenes.filter(e=>e.category_id===this.category)}get selectionKey(){return this.selectedItem?`custom:${this.selectedItem.id}`:this.selectedScene?Y(this.selectedScene):void 0}categoryButton(e,t){const i=this.category===e;return o`
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
    `}renderDetail(){const e=this.selectedScene,t=this.selectedItem!==void 0;return o`
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
                  @input=${i=>{this.name=i.target.value}}
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
                  ${Array.from({length:e.speed.option_count},(i,r)=>o`
                      <button
                        class=${this.speedIndex===r?"selected":""}
                        type="button"
                        aria-pressed=${this.speedIndex===r}
                        ?disabled=${!this.isAdmin}
                        @click=${()=>{this.speedIndex=r}}
                      >
                        ${$s(r,e.speed.default_index)}
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

      ${this.content?.kind==="scene_palette"?this.renderPaletteParameters(this.content):l}

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
    `}renderPaletteParameters(e){return o`
      <section class="card scene-parameters">
        <h3>Scene parameters</h3>
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
            <dt>Step count</dt>
            <dd>${e.steps.length}</dd>
          </div>
        </dl>
        ${e.palette.length>0?o`
              <div class="scene-palette" role="list" aria-label="Scene palette">
                ${e.palette.map((t,i)=>o`
                    <span
                      role="listitem"
                      style="--scene-colour: ${x(t)}"
                      aria-label="Colour ${i+1}, ${x(t)}"
                    ></span>
                  `)}
              </div>
            `:l}
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
                      `:l}
                </span>
              </li>
            `)}
        </ol>
      </section>
    `}async loadCatalogue(){if(!this.api||!this.device)return;const e=this.beginRequest();this.loading=!0,this.error=void 0,this.notice=void 0,this.selectedScene=void 0,this.selectedItem=void 0,this.content=void 0;try{const t=await e.api.sceneCatalogue(e.deviceId);if(!this.requestIsCurrent(e))return;this.catalogue=t,this.category="all"}catch(t){this.requestIsCurrent(e)&&(this.error=he(t))}finally{this.requestIsCurrent(e)&&(this.loading=!1)}}selectCategory(e){this.invalidateRequests(),this.category=e,this.selectedScene=void 0,this.selectedItem=void 0,this.content=void 0,this.notice=void 0}async selectBuiltin(e){if(!this.api||!this.device)return;const t=Y(e),i=this.beginRequest(t);this.notice=void 0,this.selectedScene=e,this.selectedItem=void 0,this.content=void 0,this.name=e.display_name,this.speedIndex=e.speed?.default_index??null;try{const r=await i.api.sceneDetail(i.deviceId,e.scene_id,e.effect_id);if(!this.requestIsCurrent(i)||Y(r.scene)!==t)return;this.selectedScene=r.scene,this.content=r.content,this.name=r.scene.display_name,this.speedIndex=r.content.speed_index}catch(r){this.requestIsCurrent(i)&&(this.notice=he(r))}}async selectCustom(e){if(!this.api||!this.device||!this.catalogue)return;const t=this.catalogue,i=this.beginRequest(`custom:${e.id}`);this.notice=void 0,this.selectedScene=void 0,this.selectedItem=void 0,this.content=void 0,this.name=e.name;try{const r=await i.api.item(e.id);if(!this.requestIsCurrent(i))return;if(r.content.kind!=="scene_builtin"&&r.content.kind!=="scene_palette")throw new Error("This custom scene uses an unsupported definition.");const n=r.content;if(n.template.sku!==t.sku)throw new Error(`This custom scene targets ${n.template.sku}, not ${t.sku}.`);const a=t.scenes.find(c=>c.scene_id===n.template.scene_id&&c.effect_id===n.template.effect_id);if(!a)throw new Error("The source scene is not in this device catalogue.");const d=await i.api.sceneDetail(i.deviceId,n.template.scene_id,n.template.effect_id);if(!this.requestIsCurrent(i)||Y(d.scene)!==Y(a))return;this.selectedScene=a,this.selectedItem=r,this.content=n,this.name=r.name,this.speedIndex=n.speed_index??a.speed?.default_index??null}catch(r){this.requestIsCurrent(i)&&(this.notice=he(r))}}async save(){if(!this.api||!this.device||!this.catalogue||!this.selectedScene||!this.content||!this.hasCurrentSceneContent()||this.content.kind!=="scene_builtin"&&this.content.kind!=="scene_palette"||!this.isAdmin||this.saving)return;const e=(this.selectedItem?this.name.trim():`${this.selectedScene.display_name} copy`).trim();if(!e){this.notice="Give this custom scene a name before saving.";return}const t=this.content.kind==="scene_palette"?ws({...this.content,speed_index:this.speedIndex}):{...this.content,speed_index:this.speedIndex},i=this.captureRequest();this.saving=!0,this.notice=void 0;try{const r=this.selectedItem?await this.api.updateItem(this.selectedItem,e,t,this.library.library_revision):await this.api.createItem(e,t,this.library.library_revision);if(r.item.content.kind!=="scene_builtin"&&r.item.content.kind!=="scene_palette")throw new Error("The saved scene returned an unsupported definition.");if(this.dispatchEvent(new CustomEvent("library-item-saved",{detail:{item:r.item,library_revision:r.library_revision},bubbles:!0,composed:!0})),!this.requestIsCurrent(i))return;this.requestGeneration+=1,this.activeSelectionIdentity=`custom:${r.item.id}`,this.selectedItem=r.item,this.content=r.item.content,this.name=r.item.name,this.category="custom",this.notice="Custom scene saved."}catch(r){this.requestIsCurrent(i)&&(this.notice=ks(r)==="conflict"?"The library changed elsewhere. Reload the scene before saving.":`Save failed: ${he(r)}`)}finally{this.saving=!1}}useAsTemplate(){!this.isAdmin||!this.selectedScene||this.selectedScene.scene_type!==2||this.content?.kind!=="scene_layered"||!this.hasCurrentSceneContent()||this.dispatchEvent(new CustomEvent("scene-template-selected",{detail:{content:xs({...this.content,speed_index:this.speedIndex}),config_entry_id:this.device.config_entry_id,name:`${this.selectedScene.display_name} layered`},bubbles:!0,composed:!0}))}async apply(){if(!this.api||!this.device||!this.selectedScene||!this.hasCurrentSceneContent()||!this.isAdmin||!this.catalogue?.enabled||this.selectedItem!==void 0&&this.content?.kind!=="scene_builtin"||this.applying)return;const e=this.captureRequest(),t=this.device,i=this.selectedScene,r=this.speedIndex;this.applying=!0,this.notice=void 0;try{await e.api.applyScene(e.deviceId,i,r),this.requestIsCurrent(e)&&(this.notice=`Applied to ${t.display_name}. Scene identity can be read back; the selected speed remains optimistic.`)}catch(n){this.requestIsCurrent(e)&&(this.notice=`Apply failed: ${he(n)}`)}finally{this.applying=!1}}beginRequest(e){return this.requestGeneration+=1,this.activeSelectionIdentity=e,this.captureRequest()}captureRequest(){return{generation:this.requestGeneration,api:this.api,deviceId:this.device.config_entry_id,category:this.category,selectionIdentity:this.activeSelectionIdentity}}invalidateRequests(){this.requestGeneration+=1,this.activeSelectionIdentity=void 0}requestIsCurrent(e){return e.generation===this.requestGeneration&&e.api===this.api&&e.deviceId===this.device?.config_entry_id&&e.category===this.category&&e.selectionIdentity===this.activeSelectionIdentity}hasCurrentSceneContent(){return!this.catalogue||!this.selectedScene||!this.content||this.content.template.sku!==this.catalogue.sku||this.content.template.scene_id!==this.selectedScene.scene_id||this.content.template.effect_id!==this.selectedScene.effect_id?!1:this.activeSelectionIdentity===this.selectionKey}static{this.styles=oe`
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

    .scene-palette {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 14px;
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
      margin: 14px 0 0;
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
  `}}E([w({attribute:!1})],I.prototype,"api");E([w({attribute:!1})],I.prototype,"device");E([w({attribute:!1})],I.prototype,"library");E([w({type:Boolean})],I.prototype,"isAdmin");E([m()],I.prototype,"catalogue");E([m()],I.prototype,"category");E([m()],I.prototype,"selectedScene");E([m()],I.prototype,"selectedItem");E([m()],I.prototype,"content");E([m()],I.prototype,"name");E([m()],I.prototype,"speedIndex");E([m()],I.prototype,"loading");E([m()],I.prototype,"saving");E([m()],I.prototype,"applying");E([m()],I.prototype,"notice");E([m()],I.prototype,"error");function Y(s){return`builtin:${s.scene_id}:${s.effect_id}`}function $s(s,e){const t=s-e;if(t===0)return"Default";const i=Math.abs(t);return`${t<0?"Slower":"Faster"}${i>1?` ${i}`:""}`}function xs(s){return{...s,template:{...s.template},effect:{layers:ye({layers:s.effect.layers}).layers}}}function ws(s){return{...s,template:{...s.template},steps:s.steps.map(e=>({...e,colour:[...e.colour],inline_colour:e.inline_colour===null?null:[...e.inline_colour]})),palette:s.palette.map(e=>[...e])}}function he(s){return s instanceof Error||typeof s=="object"&&s!==null&&"message"in s&&typeof s.message=="string"?s.message:"An unexpected error occurred."}function ks(s){if(typeof s=="object"&&s!==null&&"code"in s&&typeof s.code=="string")return s.code}customElements.get("govee-scene-browser")||customElements.define("govee-scene-browser",I);var Is=Object.defineProperty,_=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&Is(e,t,r),r};const et=15;class y extends T{constructor(){super(...arguments),this.loading=!0,this.devices=[],this.section="custom",this.library={library_revision:0,items:[]},this.drafts=[],this.name="",this.content=tt(),this.foreground="#2f80ed",this.brushUsesBackground=!1,this.saving=!1,this.applying=!1,this.deployments=[],this.draftPersistPending=!1,this.editorTransitionEpoch=0,this.sceneTemplateHandoffInFlight=!1,this.loadEpoch=0,this.deploymentRevision=-1}get isAdmin(){return this.hass?.user?.is_admin===!0}get selectedDevice(){return this.devices.find(e=>e.config_entry_id===this.selectedDeviceId)}get dirty(){return S(this.content)?this.savedBaseline!==L(this.name,this.content):!1}get applyCapability(){if(!P(this.content))return;const e=this.selectedDevice?.custom_effects;if(e)switch(this.content.kind){case"h617a_painted":return e.painted;case"h617a_single":return e.single;case"h617a_multi":return e.multi}}get canApply(){return P(this.content)&&this.isAdmin&&!this.applying&&this.name.trim().length>0&&this.applyCapability==="supported"}get activeDeployment(){const e=this.deployments.find(t=>t.operation_id===this.activeOperationId);return e||!this.applying?e:this.latestDeployment(["pending","uploading","verifying"])}get customDrafts(){return this.drafts.filter(e=>ee(e.item.content.kind))}get advancedDrafts(){return this.drafts.filter(e=>se(e.item.content.kind))}get editableDrafts(){return this.drafts.filter(e=>S(e.item.content))}connectedCallback(){super.connectedCallback(),this.hass&&!this.api&&this.load()}disconnectedCallback(){super.disconnectedCallback(),this.loadEpoch+=1,this.beginEditorTransition(),this.draftTimer!==void 0&&(window.clearTimeout(this.draftTimer),this.draftTimer=void 0,this.persistDraft()),this.stopSubscriptions(),this.api=void 0}updated(e){e.has("hass")&&this.hass&&!this.api&&this.load()}render(){return this.loading?o`<div class="centred" role="status">Loading effect studio...</div>`:this.error?this.renderFatalError():o`
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

        ${!this.library.items.some(e=>ee(e.kind))&&!this.customDrafts.length?o`
              <p class="empty">
                ${this.isAdmin?"Create your first custom effect.":"No custom effects have been saved yet."}
              </p>
            `:l}
      </aside>

      <section class="editor">
        ${this.name||this.currentItem||this.currentDraft?P(this.content)?this.content.kind==="h617a_painted"?this.renderPaintedEditor():this.renderPaletteEffectEditor():this.renderEmptyEditor("Select a custom effect","Choose a saved effect to inspect it."):o`
              <div class="empty-editor">
                <h2>Select a custom effect</h2>
                <p>Choose a saved effect to inspect it.</p>
              </div>
            `}
      </section>
    `}renderAdvancedEffects(){const e=this.library.items.filter(i=>se(i.kind)),t=this.library.items.filter(i=>!Ds(i.kind));return o`
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
                    <small>${Ps(i.kind)}</small>
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
        ${this.name||this.currentItem||this.currentDraft?J(this.content)?this.renderAdvancedEditor():this.content.kind==="opaque"?this.renderOpaqueEditor(this.content):this.renderEmptyEditor("Select an advanced effect","Choose a saved layered effect to inspect it."):this.renderEmptyEditor("Select an advanced effect","Choose a saved layered effect to inspect it.")}
      </section>
    `}renderAdvancedEditor(){if(!J(this.content))return l;const e=this.content.kind==="scene_layered";return o`
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
        .content=${Cs(this.content)}
        .disabled=${!this.isAdmin}
        @content-changed=${t=>{J(this.content)&&(this.content=Es(this.content,t.detail.content),this.scheduleDraft())}}
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

      <govee-painted-segment-editor
        .colours=${it(this.content)}
        .disabled=${!this.isAdmin}
        @segment-selected=${t=>this.setSegmentColour(t.detail.index)}
      ></govee-painted-segment-editor>

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
                .value=${Ut(this.content.background)}
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
            Custom Effects / ${Pe(e.kind)}
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
        @content-changed=${i=>{this.content=ui(i.detail.content),this.scheduleDraft()}}
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
    `}renderCustomModeTabs(){return P(this.content)?o`
      <div class="custom-mode-tabs" role="tablist" aria-label="Custom effect type">
        ${this.customModeButton("h617a_painted","Painted")}
        ${this.customModeButton("h617a_single","Single")}
        ${this.customModeButton("h617a_multi","Multi")}
      </div>
    `:l}customModeButton(e,t){const i=P(this.content)&&this.content.kind===e,r=e==="h617a_single"&&this.content.kind==="h617a_multi"&&this.content.effects.length>1;return o`
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
    `}async selectSection(e){const t=this.beginEditorTransition();if(e===this.section||!await this.flushDraft()||!this.editorTransitionIsCurrent(t)||(this.section=e,this.notice=void 0,e==="scenes")||e==="custom"&&P(this.content)||e==="advanced"&&(J(this.content)||this.content.kind==="opaque"))return;const r=e==="advanced"?this.advancedDrafts:this.customDrafts,n=this.newestRecoveryForDevice(r);if(n){await this.selectDraft(n,t)&&this.editorTransitionIsCurrent(t)&&(this.notice="Recovered an unfinished draft.");return}const a=this.library.items.find(d=>e==="advanced"?se(d.kind):ee(d.kind));if(a){await this.selectItem(a.id,t);return}this.isAdmin?await this.newEffect(e==="advanced"?"advanced":"h617a_painted",t):(this.currentItem=void 0,this.currentDraft=void 0,this.name="")}async resumeOrCreateEffect(e){const t=e==="advanced"?this.advancedDrafts:this.customDrafts,i=this.newestRecoveryForDevice(t);if(i){await this.selectDraft(i)&&(this.section=e,this.notice="Recovered an unfinished draft.");return}await this.newEffect(e==="advanced"?"advanced":"h617a_painted")}async load(){const e=this.loadEpoch+1;this.loadEpoch=e,this.loading=!0,this.error=void 0,this.deploymentRevision=-1;const t=new gs(this.hass);this.api=t;try{const[i,r,n,a]=await Promise.all([t.info(),t.devices(),t.library(),t.customCatalogue()]);if(!this.loadIsCurrent(e,t))return;if(!ms(i))throw new Error("This editor bundle is not compatible with the installed backend.");if(this.devices=r,this.library=n,this.customCatalogue=a,this.selectedDeviceId=this.deviceIdFromPath()??r.find(p=>p.custom_effects.painted==="supported")?.config_entry_id??r[0]?.config_entry_id,this.isAdmin){const p=await t.drafts();if(this.drafts=await Promise.all(p.map(f=>t.draft(f.id))),!this.loadIsCurrent(e,t))return}const d=await t.subscribeLibrary(p=>{this.libraryChanged(p)},p=>this.subscriptionFailed(p,e,t));if(!this.loadIsCurrent(e,t)||this.error){d();return}if(this.unsubscribeLibrary=d,this.isAdmin){const p=await t.subscribeDeployments(f=>{f.revision<this.deploymentRevision||(this.deploymentRevision=f.revision,this.deployments=f.deployments,this.activeOperationId||(this.activeOperationId=this.latestDeployment(["pending","uploading","verifying","interrupted"])?.operation_id))},f=>this.subscriptionFailed(f,e,t));if(!this.loadIsCurrent(e,t)||this.error){p();return}this.unsubscribeDeployments=p}const c=this.newestRecoveryForDevice(),h=n.items.find(p=>ee(p.kind));c?await this.selectDraft(c)&&(this.section=P(c.item.content)?"custom":"advanced",this.notice="Recovered an unfinished draft."):h?await this.selectItem(h.id):this.isAdmin&&await this.newEffect("h617a_painted")}catch(i){this.loadIsCurrent(e,t)&&(this.stopSubscriptions(),this.error=N(i))}finally{this.loadIsCurrent(e,t)&&(this.loading=!1)}}loadIsCurrent(e,t){return this.isConnected&&this.loadEpoch===e&&this.api===t}subscriptionFailed(e,t,i){this.loadIsCurrent(t,i)&&(this.error=e.message,this.loading=!1,queueMicrotask(()=>{this.loadIsCurrent(t,i)&&this.stopSubscriptions()}))}stopSubscriptions(){this.unsubscribeLibrary?.(),this.unsubscribeDeployments?.(),this.unsubscribeLibrary=void 0,this.unsubscribeDeployments=void 0}deviceIdFromPath(){const e=window.location.pathname.match(/\/ha-govee-led-ble\/editor\/([^/]+)/);return e?.[1]?decodeURIComponent(e[1]):void 0}newestRecoveryForDevice(e=this.editableDrafts){return[...e].filter(t=>!t.selected_config_entry_id||t.selected_config_entry_id===this.selectedDeviceId).sort((t,i)=>i.updated_at.localeCompare(t.updated_at))[0]}async libraryChanged(e){const t=this.library.library_revision;if(e.library_revision<t||(this.library=e,!this.currentItem||e.library_revision===t))return;const i=e.items.find(a=>a.id===this.currentItem?.id);if(!i){this.notice="This effect was removed from the shared library.";return}if(i.revision===this.currentItem.revision)return;if(this.dirty){this.notice="This effect changed elsewhere. Reload it before saving your draft.";return}const r=this.beginEditorTransition();await this.selectItem(i.id,r)&&this.editorTransitionIsCurrent(r)&&(this.notice="Loaded the latest shared revision.")}sceneLibraryItemSaved(e){this.library={library_revision:e.detail.library_revision,items:qt(this.library.items,e.detail.item)}}async sceneTemplateSelected(e){if(!this.api||!this.isAdmin||e.detail.config_entry_id!==this.selectedDeviceId||this.sceneTemplateHandoffInFlight)return;const t=this.api,i=this.beginEditorTransition();this.sceneTemplateHandoffInFlight=!0;try{if(!await this.flushDraft()||!this.editorTransitionIsCurrent(i))return;const n=ft(e.detail.content),a=e.detail.name.trim()||"Layered scene template",d=await t.createDraft(a,n,this.selectedDeviceId??null);if(!this.editorTransitionIsCurrent(i)){await this.discardStaleDraft(t,d);return}if(this.currentItem=void 0,this.currentDraft=d,this.name=d.item.name,!J(d.item.content))throw new Error("The scene template draft returned an unsupported definition.");this.content=fe(d.item.content),this.savedBaseline=void 0,this.draftPersistPending=!1,this.drafts=Te(this.drafts,d),this.section="advanced",this.notice="Scene template opened as a recovery draft."}catch(r){this.editorTransitionIsCurrent(i)&&(this.notice=`The scene template draft could not be created: ${N(r)}`)}finally{this.sceneTemplateHandoffInFlight=!1}}async backToScenes(){const e=this.beginEditorTransition();!await this.flushDraft()||!this.editorTransitionIsCurrent(e)||(this.section="scenes",this.notice=void 0)}beginEditorTransition(){return this.editorTransitionEpoch+=1,this.editorTransitionEpoch}editorTransitionIsCurrent(e){return e===this.editorTransitionEpoch}async discardStaleDraft(e,t){try{await e.deleteDraft(t)}catch(i){console.warn("A stale recovery draft could not be removed.",i)}}deviceChanged(e){this.beginEditorTransition(),this.selectedDeviceId=e.target.value,this.activeOperationId=void 0,this.activeOperationId=this.latestDeployment(["pending","uploading","verifying","interrupted"])?.operation_id,this.scheduleDraft(),this.notice=this.applyAvailabilityNotice()}switchCustomMode(e){if(!this.isAdmin||!this.customCatalogue||!P(this.content)||this.content.kind===e)return;const t=this.content;if(e==="h617a_single"&&t.kind==="h617a_multi"&&t.effects.length>1)return;let i;if(e==="h617a_painted"){const r=t.kind==="h617a_painted"?Ae(this.foreground):t.palette[0]?[...t.palette[0]]:[47,111,237];i={...tt(),speed:t.speed,groups:[{fill:[...r],segments:Array.from({length:et},(n,a)=>a)}]},this.foreground=Ut(r)}else if(t.kind==="h617a_painted"){const r=As(t);if(e==="h617a_single"){const n=Xe(e,this.customCatalogue);i={...n,speed:t.speed,palette:r.length?r:n.palette}}else{const n=Xe("h617a_multi",this.customCatalogue);i={...n,speed:t.speed,palette:r.length?r:n.palette}}}else if(e==="h617a_multi"&&t.kind==="h617a_single")i={kind:e,effects:[{family:t.family,variant:t.variant}],speed:t.speed,palette:t.palette.map(r=>[...r])};else if(e==="h617a_single"&&t.kind==="h617a_multi"){const r=t.effects[0];i={kind:e,family:r.family,variant:r.variant,speed:t.speed,palette:t.palette.map(n=>[...n])}}else return;this.content=i,/^New (Painted|Single|Multi) effect$/.test(this.name)&&(this.name=`New ${Pe(e)} effect`),this.scheduleDraft(),this.notice=this.applyAvailabilityNotice()}async newEffect(e,t){const i=t??this.beginEditorTransition();if(!this.api||!this.isAdmin||e!=="advanced"&&!this.customCatalogue)return;const r=this.api;if(!(!await this.flushDraft()||!this.editorTransitionIsCurrent(i))){this.currentItem=void 0,this.currentDraft=void 0,this.name=`New ${Pe(e)} effect`,this.content=e==="advanced"?Gi():Xe(e,this.customCatalogue),this.savedBaseline=e==="advanced"?L(this.name,this.content):void 0,this.draftPersistPending=!1,this.notice=this.applyAvailabilityNotice();try{const a=await r.createDraft(this.name,this.content,this.selectedDeviceId??null);if(!this.editorTransitionIsCurrent(i)){await this.discardStaleDraft(r,a);return}this.currentDraft=a,this.drafts=Te(this.drafts,a)}catch(a){this.editorTransitionIsCurrent(i)&&(this.notice=`The recovery draft could not be created: ${N(a)}`)}}}async selectItem(e,t){const i=t??this.beginEditorTransition();if(!this.api)return!1;const r=this.api;if(!await this.flushDraft()||!this.editorTransitionIsCurrent(i))return!1;try{const a=await r.item(e);if(!this.editorTransitionIsCurrent(i))return!1;const d=this.drafts.find(p=>p.base_item_id===a.id);if(a.content.kind==="opaque"){const p=d?.item.content.kind==="opaque"?d:void 0,f=p?.item.content,k=f?.kind==="opaque"?f:a.content;return this.currentItem=a,this.currentDraft=p,this.name=p?.item.name??a.name,this.content=Ot(k),this.savedBaseline=void 0,this.draftPersistPending=!1,this.notice="This effect definition is preserved, but this editor cannot change or apply it.",!0}if(!S(a.content))return this.notice="This item cannot be edited here.",!1;const c=d&&S(d.item.content)?d:void 0,h=c?.item.content??a.content;return S(h)?(this.currentItem=a,this.currentDraft=c,this.name=c?.item.name??a.name,this.content=fe(h),this.savedBaseline=L(a.name,a.content),this.draftPersistPending=!1,this.notice=c?"Recovered an unfinished draft.":this.applyAvailabilityNotice(),!0):!1}catch(a){return this.editorTransitionIsCurrent(i)&&(this.notice=N(a)),!1}}async selectDraft(e,t){const i=t??this.beginEditorTransition();if(!this.api)return!1;const r=this.api;if(this.currentDraft?.id===e.id)return await this.flushDraft()&&this.editorTransitionIsCurrent(i);if(!await this.flushDraft()||!this.editorTransitionIsCurrent(i))return!1;if(e=this.drafts.find(d=>d.id===e.id)??e,e.item.content.kind==="opaque"){let d;if(e.base_item_id)try{const c=await r.item(e.base_item_id);if(!this.editorTransitionIsCurrent(i))return!1;c.content.kind==="opaque"&&(d=c)}catch{if(!this.editorTransitionIsCurrent(i))return!1;this.notice="The saved effect behind this draft is no longer available."}return this.currentItem=d,this.currentDraft=e,this.name=e.item.name,this.content=Ot(e.item.content),this.savedBaseline=void 0,this.draftPersistPending=!1,this.notice="This effect definition is preserved, but this editor cannot change or apply it.",!0}if(!S(e.item.content))return this.notice="This draft cannot be edited here.",!1;let a;if(e.base_item_id)try{if(a=await r.item(e.base_item_id),!this.editorTransitionIsCurrent(i))return!1}catch{if(!this.editorTransitionIsCurrent(i))return!1;this.notice="The saved effect behind this draft is no longer available."}return this.currentItem=a,this.currentDraft=e,this.name=e.item.name,this.content=fe(e.item.content),this.savedBaseline=a&&S(a.content)?L(a.name,a.content):void 0,this.draftPersistPending=!1,this.notice||(this.notice=this.applyAvailabilityNotice()),!0}nameChanged(e){this.name=e.target.value,this.scheduleDraft()}foregroundChanged(e){this.foreground=e.target.value,this.brushUsesBackground=!1}backgroundChanged(e){this.updateContent({background:Ae(e.target.value)})}effectChanged(e){this.updateContent({effect:e.target.value})}setSegmentColour(e){if(this.content.kind!=="h617a_painted")return;const t=it(this.content);t[e]=this.brushUsesBackground?[...this.content.background]:Ae(this.foreground),this.content={...this.content,groups:Ft(t,this.content.background)},this.scheduleDraft()}paintAll(){if(this.content.kind!=="h617a_painted")return;const e=this.brushUsesBackground?this.content.background:Ae(this.foreground);this.content={...this.content,groups:Ft(Array.from({length:et},()=>[...e]),this.content.background)},this.scheduleDraft()}resetPaint(){this.content.kind==="h617a_painted"&&(this.content={...this.content,groups:[]},this.scheduleDraft())}updateContent(e){this.content.kind==="h617a_painted"&&(this.content={...this.content,...e},this.scheduleDraft())}scheduleDraft(){!this.isAdmin||!this.api||(this.draftPersistPending=!0,this.draftTimer!==void 0&&window.clearTimeout(this.draftTimer),this.draftTimer=window.setTimeout(()=>{this.draftTimer=void 0,this.persistDraft()},700))}async flushDraft(){return this.draftTimer!==void 0&&(window.clearTimeout(this.draftTimer),this.draftTimer=void 0),!this.draftPersistPending&&!this.draftSaveInFlight?!0:this.persistDraft()}async persistDraft(){let e=!0;if(this.draftSaveInFlight&&(e=await this.draftSaveInFlight),!this.draftPersistPending)return e;if(!this.api||!this.isAdmin)return!1;if(!this.dirty||!this.name.trim()||!S(this.content))return this.draftPersistPending=!1,!0;const t=this.content,i=De(this.name,t,this.selectedDeviceId);this.draftPersistPending=!1;const r=this.persistDraftNow();this.draftSaveInFlight=r;let n;try{n=await r}finally{this.draftSaveInFlight===r&&(this.draftSaveInFlight=void 0)}return n||(this.draftPersistPending=!0),S(this.content)&&i!==De(this.name,this.content,this.selectedDeviceId)&&this.scheduleDraft(),n}async persistDraftNow(){if(!this.api||!S(this.content))return!1;const e=this.api,t=this.currentDraft,i=this.currentItem,r=this.name.trim(),n=this.content,a=this.selectedDeviceId??null,d=De(r,n,a??void 0);try{const c=t?await e.updateDraft(t,r,n,a):await e.createDraft(r,n,a,i);return this.draftIdentityIsCurrent(e,t,i)&&(this.currentDraft=c,this.drafts=Te(this.drafts,c)),!0}catch(c){if(zt(c)==="conflict"&&t&&this.draftContextIsCurrent(e,t,i,d))try{const h=await e.createDraft(r,n,a,i);return this.draftContextIsCurrent(e,t,i,d)&&(this.currentDraft=h,this.drafts=Te(this.drafts,h),this.notice="This draft changed elsewhere, so your work was saved as a separate recovery draft."),!0}catch(h){c=h}return this.notice=`The recovery draft could not be saved: ${N(c)}`,!1}}draftIdentityIsCurrent(e,t,i){return this.api===e&&Je(this.currentDraft,t)&&Ye(this.currentItem,i)&&S(this.content)}draftContextIsCurrent(e,t,i,r){return this.draftIdentityIsCurrent(e,t,i)&&S(this.content)&&De(this.name.trim(),this.content,this.selectedDeviceId)===r}async save(){if(!this.api||!this.isAdmin||!this.dirty||this.saving||!S(this.content))return;const e=this.api,t=this.name.trim();if(!t){this.notice="Give this effect a name before saving.";return}const i=this.beginEditorTransition(),r=this.currentItem,n=this.currentDraft,a=fe(this.content),d=this.library.library_revision;this.saving=!0,this.notice=void 0;try{const c=r?await e.updateItem(r,t,a,d):await e.createItem(t,a,d);if(!S(c.item.content))throw new Error("The saved effect returned an unsupported definition.");const h=c.item.content;c.library_revision>=this.library.library_revision&&(this.library={library_revision:c.library_revision,items:qt(this.library.items,c.item)}),this.editorTransitionIsCurrent(i)&&Ye(this.currentItem,r)&&S(this.content)&&L(this.name,this.content)===L(t,a)&&(this.currentItem=c.item,this.name=c.item.name,this.content=fe(h),this.savedBaseline=L(this.name,this.content),this.draftPersistPending=!1);const f=()=>this.editorTransitionIsCurrent(i)&&Ye(this.currentItem,c.item)&&S(this.content)&&L(this.name,this.content)===L(c.item.name,h);if(n)try{await e.deleteDraft(n),this.drafts=this.drafts.filter(k=>!Je(k,n)),this.editorTransitionIsCurrent(i)&&Je(this.currentDraft,n)&&(this.currentDraft=void 0)}catch(k){f()&&(this.notice=`Saved ${t}, but its recovery draft could not be cleared: `+N(k));return}f()&&(this.notice="Saved.")}catch(c){if(zt(c)==="conflict"){const h="This effect or library changed elsewhere. Reload before saving.";this.editorTransitionIsCurrent(i)&&(this.notice=h);try{const p=await e.library();p.library_revision>=this.library.library_revision&&(this.library=p)}catch(p){this.editorTransitionIsCurrent(i)&&(this.notice=`${h} Library refresh failed: `+N(p))}}else this.editorTransitionIsCurrent(i)&&(this.notice=`Save failed: ${N(c)}`)}finally{this.saving=!1}}async apply(){if(!this.api||!this.canApply||!P(this.content)||!this.selectedDeviceId)return;const e=this.name.trim(),t=this.selectedDeviceId,i=this.editorTransitionEpoch;this.activeOperationId=void 0,this.applying=!0,this.notice=void 0;try{const r=!this.dirty&&this.currentItem?await this.api.applySaved(t,this.currentItem):await this.api.applySnapshot(t,e,this.content);if(i!==this.editorTransitionEpoch||t!==this.selectedDeviceId)return;this.activeOperationId=r.operation_id,this.deployments=[r,...this.deployments.filter(n=>n.operation_id!==r.operation_id)]}catch(r){i===this.editorTransitionEpoch&&t===this.selectedDeviceId&&(this.notice=`Apply failed: ${N(r)}`)}finally{this.applying=!1}}applyAvailabilityNotice(){if(!J(this.content))return this.selectedDeviceId&&!this.selectedDevice?"This device is temporarily unavailable in Home Assistant. Apply is disabled until it is loaded.":this.applyCapability==="supported"?void 0:`${Pe(this.content.kind)} effects cannot be applied to this device.`}latestDeployment(e){return[...this.deployments].filter(t=>t.config_entry_id===this.selectedDeviceId&&e.includes(t.phase)).sort((t,i)=>i.updated_at.localeCompare(t.updated_at))[0]}static{this.styles=oe`
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
  `}}_([w({attribute:!1})],y.prototype,"hass");_([w({attribute:!1})],y.prototype,"panel");_([m()],y.prototype,"loading");_([m()],y.prototype,"error");_([m()],y.prototype,"notice");_([m()],y.prototype,"devices");_([m()],y.prototype,"selectedDeviceId");_([m()],y.prototype,"section");_([m()],y.prototype,"library");_([m()],y.prototype,"customCatalogue");_([m()],y.prototype,"drafts");_([m()],y.prototype,"currentItem");_([m()],y.prototype,"currentDraft");_([m()],y.prototype,"name");_([m()],y.prototype,"content");_([m()],y.prototype,"foreground");_([m()],y.prototype,"brushUsesBackground");_([m()],y.prototype,"saving");_([m()],y.prototype,"applying");_([m()],y.prototype,"deployments");_([m()],y.prototype,"activeOperationId");function tt(){return{kind:"h617a_painted",effect:"clockwise",speed:50,brightness:100,background:[0,0,0],groups:[]}}function Xe(s,e){if(s==="h617a_painted")return tt();const t=e.effects[0],i={family:t.family,variant:t.variant};return s==="h617a_single"?{kind:s,...i,speed:50,palette:Bt()}:{kind:s,effects:[i],speed:50,palette:Bt()}}function Ss(s){return{...s,background:[...s.background],groups:s.groups.map(e=>({fill:[...e.fill],segments:[...e.segments]}))}}function ui(s){return s.kind==="h617a_painted"?Ss(s):s.kind==="h617a_single"?{...s,palette:s.palette.map(e=>[...e])}:{...s,effects:s.effects.map(e=>({...e})),palette:s.palette.map(e=>[...e])}}function fe(s){return s.kind==="advanced"?ye(s):s.kind==="scene_layered"?ft(s):ui(s)}function Ot(s){return{...s,body:structuredClone(s.body)}}function ft(s){return{...s,template:{...s.template},effect:{layers:ye({layers:s.effect.layers}).layers}}}function Cs(s){return s.kind==="advanced"?s:{kind:"advanced",layers:s.effect.layers}}function Es(s,e){return s.kind==="advanced"?ye(e):{...ft(s),effect:{layers:ye(e).layers}}}function Bt(){return[[255,0,0],[255,127,0],[255,255,0],[0,255,0],[0,0,255],[0,255,255],[139,0,255]]}function it(s){const e=Array.from({length:et},()=>[...s.background]);for(const t of s.groups)for(const i of t.segments)e[i]=[...t.fill];return e}function Ft(s,e){const t=new Map;return s.forEach((i,r)=>{if(st(i,e))return;const n=i.join(","),a=t.get(n);a?a.segments.push(r):t.set(n,{fill:[...i],segments:[r]})}),[...t.values()]}function As(s){const e=[];for(const t of it(s))if(!st(t,s.background)&&!e.some(i=>st(i,t))&&e.push([...t]),e.length===8)break;return e}function st(s,e){return s[0]===e[0]&&s[1]===e[1]&&s[2]===e[2]}function Ut(s){return`#${s.map(e=>e.toString(16).padStart(2,"0")).join("")}`}function Ae(s){return[Number.parseInt(s.slice(1,3),16),Number.parseInt(s.slice(3,5),16),Number.parseInt(s.slice(5,7),16)]}function L(s,e){return JSON.stringify({name:s.trim(),content:e})}function De(s,e,t){return JSON.stringify({name:s.trim(),content:e,selectedDeviceId:t??null})}function ee(s){return s==="h617a_painted"||s==="h617a_single"||s==="h617a_multi"}function P(s){return typeof s=="object"&&s!==null&&"kind"in s&&ee(s.kind)}function S(s){return P(s)||typeof s=="object"&&s!==null&&"kind"in s&&se(s.kind)}function se(s){return s==="advanced"||s==="scene_layered"}function J(s){return se(s.kind)}function Ds(s){return ee(s)||se(s)||s==="scene_builtin"||s==="scene_palette"}function Ps(s){return s==="scene_layered"?"Scene template":"Layered"}function Pe(s){switch(s){case"h617a_painted":return"Painted";case"h617a_single":return"Single";case"h617a_multi":return"Multi";case"advanced":return"Layered";default:return"Custom"}}function Te(s,e){return[e,...s.filter(t=>t.id!==e.id)].sort((t,i)=>i.updated_at.localeCompare(t.updated_at))}function Ye(s,e){return s?.id===e?.id&&s?.revision===e?.revision}function Je(s,e){return s?.id===e?.id&&s?.revision===e?.revision}function qt(s,e){return[...s.filter(t=>t.id!==e.id),{id:e.id,revision:e.revision,name:e.name,kind:e.content.kind==="opaque"?e.content.source_kind:e.content.kind,..."template"in e.content?{template:e.content.template}:{}}].sort((t,i)=>t.name.localeCompare(i.name))}function N(s){return s instanceof Error||typeof s=="object"&&s!==null&&"message"in s&&typeof s.message=="string"?s.message:"An unexpected error occurred."}function zt(s){if(typeof s=="object"&&s!==null&&"code"in s&&typeof s.code=="string")return s.code}customElements.get("ha-govee-led-ble-editor")||customElements.define("ha-govee-led-ble-editor",y);
