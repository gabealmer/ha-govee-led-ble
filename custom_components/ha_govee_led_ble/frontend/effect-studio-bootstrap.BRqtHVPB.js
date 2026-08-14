const Pe=globalThis,it=Pe.ShadowRoot&&(Pe.ShadyCSS===void 0||Pe.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,st=Symbol(),ht=new WeakMap;let Ht=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==st)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(it&&e===void 0){const i=t!==void 0&&t.length===1;i&&(e=ht.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&ht.set(t,e))}return e}toString(){return this.cssText}};const mi=s=>new Ht(typeof s=="string"?s:s+"",void 0,st),V=(s,...e)=>{const t=s.length===1?s[0]:e.reduce((i,r,n)=>i+(a=>{if(a._$cssResult$===!0)return a.cssText;if(typeof a=="number")return a;throw Error("Value passed to 'css' function must be a 'css' function result: "+a+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+s[n+1],s[0]);return new Ht(t,s,st)},fi=(s,e)=>{if(it)s.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const i=document.createElement("style"),r=Pe.litNonce;r!==void 0&&i.setAttribute("nonce",r),i.textContent=t.cssText,s.appendChild(i)}},mt=it?s=>s:s=>s instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return mi(t)})(s):s;const{is:gi,defineProperty:bi,getOwnPropertyDescriptor:vi,getOwnPropertyNames:yi,getOwnPropertySymbols:$i,getPrototypeOf:_i}=Object,Be=globalThis,ft=Be.trustedTypes,xi=ft?ft.emptyScript:"",wi=Be.reactiveElementPolyfillSupport,ge=(s,e)=>s,Ne={toAttribute(s,e){switch(e){case Boolean:s=s?xi:null;break;case Object:case Array:s=s==null?s:JSON.stringify(s)}return s},fromAttribute(s,e){let t=s;switch(e){case Boolean:t=s!==null;break;case Number:t=s===null?null:Number(s);break;case Object:case Array:try{t=JSON.parse(s)}catch{t=null}}return t}},rt=(s,e)=>!gi(s,e),gt={attribute:!0,type:String,converter:Ne,reflect:!1,useDefault:!1,hasChanged:rt};Symbol.metadata??=Symbol("metadata"),Be.litPropertyMetadata??=new WeakMap;let ee=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=gt){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),r=this.getPropertyDescriptor(e,i,t);r!==void 0&&bi(this.prototype,e,r)}}static getPropertyDescriptor(e,t,i){const{get:r,set:n}=vi(this.prototype,e)??{get(){return this[t]},set(a){this[t]=a}};return{get:r,set(a){const d=r?.call(this);n?.call(this,a),this.requestUpdate(e,d,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??gt}static _$Ei(){if(this.hasOwnProperty(ge("elementProperties")))return;const e=_i(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(ge("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(ge("properties"))){const t=this.properties,i=[...yi(t),...$i(t)];for(const r of i)this.createProperty(r,t[r])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[i,r]of t)this.elementProperties.set(i,r)}this._$Eh=new Map;for(const[t,i]of this.elementProperties){const r=this._$Eu(t,i);r!==void 0&&this._$Eh.set(r,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const r of i)t.unshift(mt(r))}else e!==void 0&&t.push(mt(e));return t}static _$Eu(e,t){const i=t.attribute;return i===!1?void 0:typeof i=="string"?i:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return fi(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,i);if(r!==void 0&&i.reflect===!0){const n=(i.converter?.toAttribute!==void 0?i.converter:Ne).toAttribute(t,i.type);this._$Em=e,n==null?this.removeAttribute(r):this.setAttribute(r,n),this._$Em=null}}_$AK(e,t){const i=this.constructor,r=i._$Eh.get(e);if(r!==void 0&&this._$Em!==r){const n=i.getPropertyOptions(r),a=typeof n.converter=="function"?{fromAttribute:n.converter}:n.converter?.fromAttribute!==void 0?n.converter:Ne;this._$Em=r;const d=a.fromAttribute(t,n.type);this[r]=d??this._$Ej?.get(r)??d,this._$Em=null}}requestUpdate(e,t,i,r=!1,n){if(e!==void 0){const a=this.constructor;if(r===!1&&(n=this[e]),i??=a.getPropertyOptions(e),!((i.hasChanged??rt)(n,t)||i.useDefault&&i.reflect&&n===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,i))))return;this.C(e,t,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:r,wrapped:n},a){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),n!==!0||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),r===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[r,n]of this._$Ep)this[r]=n;this._$Ep=void 0}const i=this.constructor.elementProperties;if(i.size>0)for(const[r,n]of i){const{wrapped:a}=n,d=this[r];a!==!0||this._$AL.has(r)||d===void 0||this.C(r,void 0,n,d)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(i=>i.hostUpdate?.()),this.update(t)):this._$EM()}catch(i){throw e=!1,this._$EM(),i}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};ee.elementStyles=[],ee.shadowRootOptions={mode:"open"},ee[ge("elementProperties")]=new Map,ee[ge("finalized")]=new Map,wi?.({ReactiveElement:ee}),(Be.reactiveElementVersions??=[]).push("2.1.2");const nt=globalThis,bt=s=>s,Me=nt.trustedTypes,vt=Me?Me.createPolicy("lit-html",{createHTML:s=>s}):void 0,jt="$lit$",R=`lit$${Math.random().toFixed(9).slice(2)}$`,Vt="?"+R,ki=`<${Vt}>`,j=document,be=()=>j.createComment(""),ve=s=>s===null||typeof s!="object"&&typeof s!="function",at=Array.isArray,Si=s=>at(s)||typeof s?.[Symbol.iterator]=="function",je=`[ 	
\f\r]`,le=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,yt=/-->/g,$t=/>/g,U=RegExp(`>|${je}(?:([^\\s"'>=/]+)(${je}*=${je}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),_t=/'/g,xt=/"/g,Gt=/^(?:script|style|textarea|title)$/i,Ei=s=>(e,...t)=>({_$litType$:s,strings:e,values:t}),o=Ei(1),re=Symbol.for("lit-noChange"),l=Symbol.for("lit-nothing"),wt=new WeakMap,z=j.createTreeWalker(j,129);function Kt(s,e){if(!at(s)||!s.hasOwnProperty("raw"))throw Error("invalid template strings array");return vt!==void 0?vt.createHTML(e):e}const Ii=(s,e)=>{const t=s.length-1,i=[];let r,n=e===2?"<svg>":e===3?"<math>":"",a=le;for(let d=0;d<t;d++){const c=s[d];let u,g,b=-1,A=0;for(;A<c.length&&(a.lastIndex=A,g=a.exec(c),g!==null);)A=a.lastIndex,a===le?g[1]==="!--"?a=yt:g[1]!==void 0?a=$t:g[2]!==void 0?(Gt.test(g[2])&&(r=RegExp("</"+g[2],"g")),a=U):g[3]!==void 0&&(a=U):a===U?g[0]===">"?(a=r??le,b=-1):g[1]===void 0?b=-2:(b=a.lastIndex-g[2].length,u=g[1],a=g[3]===void 0?U:g[3]==='"'?xt:_t):a===xt||a===_t?a=U:a===yt||a===$t?a=le:(a=U,r=void 0);const D=a===U&&s[d+1].startsWith("/>")?" ":"";n+=a===le?c+ki:b>=0?(i.push(u),c.slice(0,b)+jt+c.slice(b)+R+D):c+R+(b===-2?d:D)}return[Kt(s,n+(s[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),i]};class ye{constructor({strings:e,_$litType$:t},i){let r;this.parts=[];let n=0,a=0;const d=e.length-1,c=this.parts,[u,g]=Ii(e,t);if(this.el=ye.createElement(u,i),z.currentNode=this.el.content,t===2||t===3){const b=this.el.content.firstChild;b.replaceWith(...b.childNodes)}for(;(r=z.nextNode())!==null&&c.length<d;){if(r.nodeType===1){if(r.hasAttributes())for(const b of r.getAttributeNames())if(b.endsWith(jt)){const A=g[a++],D=r.getAttribute(b).split(R),Ee=/([.?@])?(.*)/.exec(A);c.push({type:1,index:n,name:Ee[2],strings:D,ctor:Ee[1]==="."?Ai:Ee[1]==="?"?Pi:Ee[1]==="@"?Li:Ue}),r.removeAttribute(b)}else b.startsWith(R)&&(c.push({type:6,index:n}),r.removeAttribute(b));if(Gt.test(r.tagName)){const b=r.textContent.split(R),A=b.length-1;if(A>0){r.textContent=Me?Me.emptyScript:"";for(let D=0;D<A;D++)r.append(b[D],be()),z.nextNode(),c.push({type:2,index:++n});r.append(b[A],be())}}}else if(r.nodeType===8)if(r.data===Vt)c.push({type:2,index:n});else{let b=-1;for(;(b=r.data.indexOf(R,b+1))!==-1;)c.push({type:7,index:n}),b+=R.length-1}n++}}static createElement(e,t){const i=j.createElement("template");return i.innerHTML=e,i}}function ne(s,e,t=s,i){if(e===re)return e;let r=i!==void 0?t._$Co?.[i]:t._$Cl;const n=ve(e)?void 0:e._$litDirective$;return r?.constructor!==n&&(r?._$AO?.(!1),n===void 0?r=void 0:(r=new n(s),r._$AT(s,t,i)),i!==void 0?(t._$Co??=[])[i]=r:t._$Cl=r),r!==void 0&&(e=ne(s,r._$AS(s,e.values),r,i)),e}class Ci{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,r=(e?.creationScope??j).importNode(t,!0);z.currentNode=r;let n=z.nextNode(),a=0,d=0,c=i[0];for(;c!==void 0;){if(a===c.index){let u;c.type===2?u=new we(n,n.nextSibling,this,e):c.type===1?u=new c.ctor(n,c.name,c.strings,this,e):c.type===6&&(u=new Ti(n,this,e)),this._$AV.push(u),c=i[++d]}a!==c?.index&&(n=z.nextNode(),a++)}return z.currentNode=j,r}p(e){let t=0;for(const i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class we{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,r){this.type=2,this._$AH=l,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=ne(this,e,t),ve(e)?e===l||e==null||e===""?(this._$AH!==l&&this._$AR(),this._$AH=l):e!==this._$AH&&e!==re&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Si(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==l&&ve(this._$AH)?this._$AA.nextSibling.data=e:this.T(j.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,r=typeof i=="number"?this._$AC(e):(i.el===void 0&&(i.el=ye.createElement(Kt(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===r)this._$AH.p(t);else{const n=new Ci(r,this),a=n.u(this.options);n.p(t),this.T(a),this._$AH=n}}_$AC(e){let t=wt.get(e.strings);return t===void 0&&wt.set(e.strings,t=new ye(e)),t}k(e){at(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,r=0;for(const n of e)r===t.length?t.push(i=new we(this.O(be()),this.O(be()),this,this.options)):i=t[r],i._$AI(n),r++;r<t.length&&(this._$AR(i&&i._$AB.nextSibling,r),t.length=r)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const i=bt(e).nextSibling;bt(e).remove(),e=i}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}}class Ue{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,r,n){this.type=1,this._$AH=l,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=n,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=l}_$AI(e,t=this,i,r){const n=this.strings;let a=!1;if(n===void 0)e=ne(this,e,t,0),a=!ve(e)||e!==this._$AH&&e!==re,a&&(this._$AH=e);else{const d=e;let c,u;for(e=n[0],c=0;c<n.length-1;c++)u=ne(this,d[i+c],t,c),u===re&&(u=this._$AH[c]),a||=!ve(u)||u!==this._$AH[c],u===l?e=l:e!==l&&(e+=(u??"")+n[c+1]),this._$AH[c]=u}a&&!r&&this.j(e)}j(e){e===l?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class Ai extends Ue{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===l?void 0:e}}class Pi extends Ue{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==l)}}class Li extends Ue{constructor(e,t,i,r,n){super(e,t,i,r,n),this.type=5}_$AI(e,t=this){if((e=ne(this,e,t,0)??l)===re)return;const i=this._$AH,r=e===l&&i!==l||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,n=e!==l&&(i===l||r);r&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class Ti{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){ne(this,e)}}const Di=nt.litHtmlPolyfillSupport;Di?.(ye,we),(nt.litHtmlVersions??=[]).push("3.3.3");const Ni=(s,e,t)=>{const i=t?.renderBefore??e;let r=i._$litPart$;if(r===void 0){const n=t?.renderBefore??null;i._$litPart$=r=new we(e.insertBefore(be(),n),n,void 0,t??{})}return r._$AI(s),r};const ot=globalThis;class P extends ee{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Ni(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return re}}P._$litElement$=!0,P.finalized=!0,ot.litElementHydrateSupport?.({LitElement:P});const Mi=ot.litElementPolyfillSupport;Mi?.({LitElement:P});(ot.litElementVersions??=[]).push("4.2.2");const Ri={attribute:!0,type:String,converter:Ne,reflect:!1,hasChanged:rt},Oi=(s=Ri,e,t)=>{const{kind:i,metadata:r}=t;let n=globalThis.litPropertyMetadata.get(r);if(n===void 0&&globalThis.litPropertyMetadata.set(r,n=new Map),i==="setter"&&((s=Object.create(s)).wrapped=!0),n.set(t.name,s),i==="accessor"){const{name:a}=t;return{set(d){const c=e.get.call(this);e.set.call(this,d),this.requestUpdate(a,c,s,!0,d)},init(d){return d!==void 0&&this.C(a,void 0,s,d),d}}}if(i==="setter"){const{name:a}=t;return function(d){const c=this[a];e.call(this,d),this.requestUpdate(a,c,s,!0,d)}}throw Error("Unsupported decorator location: "+i)};function y(s){return(e,t)=>typeof t=="object"?Oi(s,e,t):((i,r,n)=>{const a=r.hasOwnProperty(n);return r.constructor.createProperty(n,i),a?Object.getOwnPropertyDescriptor(r,n):void 0})(s,e,t)}function h(s){return y({...s,state:!0,attribute:!1})}var Bi=Object.defineProperty,G=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&Bi(e,t,r),r};class B extends P{constructor(){super(...arguments),this.items=[],this.ariaLabel="Items",this.itemRole="button",this.addLabel="Add item",this.addDisabled=!1,this.reorderDisabled=!1,this.pointerX=0,this.pointerY=0,this.pointerMoved=!1,this.suppressClick=!1}render(){const e=this.itemRole==="tab";return o`
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
              @dragstart=${r=>this.dragStarted(i,r)}
              @dragover=${r=>{this.reorderDisabled||r.preventDefault()}}
              @drop=${r=>this.dropped(i,r)}
              @pointerdown=${r=>this.pointerStarted(i,r)}
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
                @keydown=${r=>this.keyPressed(i,r)}
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
    `}focusItem(e){this.updateComplete.then(()=>{this.shadowRoot?.querySelectorAll(".item")[e]?.focus()})}itemClicked(e){if(this.suppressClick){this.suppressClick=!1;return}this.dispatchEvent(new CustomEvent("item-selected",{detail:{index:e},bubbles:!0,composed:!0}))}addClicked(){this.dispatchEvent(new CustomEvent("item-added",{bubbles:!0,composed:!0}))}dragStarted(e,t){this.reorderDisabled||(this.draggedIndex=e,t.dataTransfer?.setData("text/plain",String(e)))}dropped(e,t){t.preventDefault(),this.draggedIndex!==void 0&&(this.reorder(this.draggedIndex,e),this.draggedIndex=void 0)}keyPressed(e,t){if(t.key!=="ArrowLeft"&&t.key!=="ArrowRight"||(t.preventDefault(),this.reorderDisabled))return;const i=e+(t.key==="ArrowLeft"?-1:1);i<0||i>=this.items.length||this.reorder(e,i,!0)}pointerStarted(e,t){this.reorderDisabled||t.pointerType==="mouse"||t.target.closest(".strip-popover")||(this.pointerId=t.pointerId,this.pointerIndex=e,this.pointerX=t.clientX,this.pointerY=t.clientY,this.pointerMoved=!1,t.currentTarget.setPointerCapture(t.pointerId))}pointerMovedOver(e){if(e.pointerId!==this.pointerId||this.pointerIndex===void 0)return;const t=e.clientX-this.pointerX,i=e.clientY-this.pointerY;if(!this.pointerMoved){if(Math.abs(i)>Math.abs(t)||Math.abs(t)<10)return;this.pointerMoved=!0}e.preventDefault();const r=this.shadowRoot?.elementFromPoint(e.clientX,e.clientY)?.closest("[data-item-index]"),n=Number(r?.dataset.itemIndex);!Number.isInteger(n)||n===this.pointerIndex||(this.reorder(this.pointerIndex,n),this.pointerIndex=n)}pointerFinished(e){if(e.pointerId!==this.pointerId)return;const t=e.currentTarget;t.hasPointerCapture(e.pointerId)&&t.releasePointerCapture(e.pointerId),this.suppressClick=this.pointerMoved,this.pointerId=void 0,this.pointerIndex=void 0,this.pointerMoved=!1}reorder(e,t,i=!1){this.reorderDisabled||e===t||(this.dispatchEvent(new CustomEvent("items-reordered",{detail:{from:e,to:t},bubbles:!0,composed:!0})),i&&this.focusItem(t))}static{this.styles=V`
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
    }

    * {
      box-sizing: border-box;
    }

    button {
      min-height: 44px;
      font: inherit;
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
      height: 44px;
      padding: 0;
      border-radius: 8px;
      cursor: pointer;
    }

    .item {
      border: 1px solid rgb(0 0 0 / 14%);
    }

    .item.colour,
    .add {
      width: 44px;
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
      outline: 3px solid var(--studio-blue);
      outline-offset: 2px;
    }

    ::slotted(.strip-popover) {
      position: absolute;
      z-index: 25;
      top: 52px;
      left: 0;
      width: min(var(--strip-popover-width, 280px), calc(100vw - 48px));
      padding: 10px;
      border: 1px solid var(--studio-border);
      border-radius: 9px;
      background: var(--studio-card);
      box-shadow: 0 8px 24px rgb(0 0 0 / 18%);
    }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.52;
    }

    @media (max-width: 600px) {
      ::slotted(.strip-popover) {
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
  `}}G([y({attribute:!1})],B.prototype,"items");G([y({attribute:!1})],B.prototype,"activeIndex");G([y()],B.prototype,"ariaLabel");G([y()],B.prototype,"itemRole");G([y()],B.prototype,"addLabel");G([y({type:Boolean})],B.prototype,"addDisabled");G([y({type:Boolean})],B.prototype,"reorderDisabled");customElements.get("govee-reorderable-strip")||customElements.define("govee-reorderable-strip",B);var Ui=Object.defineProperty,ke=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&Ui(e,t,r),r};const Je=17,Xt="ha_govee_led_ble/effect_studio/recent_colours",Le=[[255,69,58],[255,159,10],[255,214,10],[48,209,88],[99,230,226],[100,210,255],[10,132,255],[94,92,230],[191,90,242],[255,45,85],[172,142,104],[255,255,255],[174,174,178],[99,99,102],[28,28,30],[255,127,0],[139,0,255]];let ie=Fi();class oe extends P{constructor(){super(...arguments),this.palette=[],this.minColours=1,this.maxColours=8,this.disabled=!1,this.windowPointerDown=e=>{this.editingIndex!==void 0&&!e.composedPath().includes(this)&&(this.editingIndex=void 0)}}connectedCallback(){super.connectedCallback(),window.addEventListener("pointerdown",this.windowPointerDown)}disconnectedCallback(){window.removeEventListener("pointerdown",this.windowPointerDown),super.disconnectedCallback()}willUpdate(e){e.has("palette")&&this.editingIndex!==void 0&&this.editingIndex>=this.palette.length&&(this.editingIndex=void 0)}render(){const e=this.palette.map((t,i)=>({key:`${i}-${w(t)}`,label:`Colour ${i+1}`,ariaLabel:this.editingIndex===i&&this.palette.length>this.minColours?`Remove colour ${i+1}`:`Edit colour ${i+1}, ${w(t)}. Drag to reorder or use arrow keys.`,colour:w(t),removeReady:this.editingIndex===i&&this.palette.length>this.minColours,disabled:this.disabled}));return o`
      <govee-reorderable-strip
        .items=${e}
        .activeIndex=${this.editingIndex}
        ariaLabel="Colours"
        addLabel="Add colour"
        .addDisabled=${this.disabled||this.palette.length>=this.maxColours}
        .reorderDisabled=${this.disabled}
        @item-selected=${t=>this.swatchClicked(t.detail.index)}
        @items-reordered=${t=>this.reorder(t.detail.from,t.detail.to)}
        @item-added=${this.addColour}
      >
        ${this.editingIndex===void 0?l:o`
              <div
                slot="item-${this.editingIndex}"
                class="strip-popover colour-popover"
                role="dialog"
                aria-label="Edit colour"
                @keydown=${t=>this.popoverKeyPressed(this.editingIndex,t)}
              >
                ${this.renderPopover(this.editingIndex,this.palette[this.editingIndex])}
              </div>
            `}
      </govee-reorderable-strip>
    `}renderPopover(e,t){return o`
      <div class="preset-grid">
        ${ie.map(i=>o`
            <button
              type="button"
              style="--preset-colour: ${w(i)}"
              aria-label="Use ${w(i)}"
              ?disabled=${this.disabled}
              @click=${()=>this.commitColour(e,i)}
            ></button>
          `)}
        <label
          class="custom-colour"
          style="--custom-colour: ${w(t)}"
        >
          <input
            type="color"
            aria-label="Custom colour"
            .value=${w(t)}
            ?disabled=${this.disabled}
            @input=${i=>this.updateColour(e,kt(i.target.value))}
            @change=${i=>this.commitColour(e,kt(i.target.value))}
          />
        </label>
      </div>
    `}commitColour(e,t){qi(t),this.updateColour(e,t),this.editingIndex=void 0,this.focusSwatchAfterUpdate(e)}updateColour(e,t){const i=se(this.palette);i[e]=[...t],this.emitPalette(i)}addColour(){if(this.disabled||this.palette.length>=this.maxColours)return;const e=this.palette[this.palette.length-1]??ie[this.palette.length%ie.length],t=[...se(this.palette),[...e]];this.editingIndex=t.length-1,this.emitPalette(t)}removeColour(e){if(this.disabled||this.palette.length<=this.minColours)return;const t=this.palette.filter((r,n)=>n!==e).map(r=>[...r]),i=Math.min(e,t.length-1);this.editingIndex=void 0,this.emitPalette(t),this.focusSwatchAfterUpdate(i)}reorder(e,t){if(this.disabled||e===t)return;const i=se(this.palette),[r]=i.splice(e,1);i.splice(t,0,r),this.editingIndex=this.editingIndex===e?t:Hi(this.editingIndex,e,t),this.emitPalette(i)}focusSwatchAfterUpdate(e){this.updateComplete.then(()=>{this.shadowRoot?.querySelector("govee-reorderable-strip")?.focusItem(e)})}popoverKeyPressed(e,t){t.key==="Escape"&&(t.preventDefault(),t.stopPropagation(),this.editingIndex=void 0,this.focusSwatchAfterUpdate(e))}swatchClicked(e){if(this.editingIndex===e&&this.palette.length>this.minColours){this.removeColour(e);return}this.editingIndex=this.editingIndex===e?void 0:e}emitPalette(e){this.palette=e,this.dispatchEvent(new CustomEvent("palette-changed",{detail:{palette:e},bubbles:!0,composed:!0}))}static{this.styles=V`
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

  `}}ke([y({attribute:!1})],oe.prototype,"palette");ke([y({type:Number})],oe.prototype,"minColours");ke([y({type:Number})],oe.prototype,"maxColours");ke([y({type:Boolean})],oe.prototype,"disabled");ke([h()],oe.prototype,"editingIndex");function se(s){return s.map(e=>[...e])}function Fi(){const s=localStorage.getItem(Xt);if(!s)return se(Le);let e;try{e=JSON.parse(s)}catch(i){if(i instanceof SyntaxError)return se(Le);throw i}if(!Array.isArray(e))return se(Le);const t=e.filter(zi).map(i=>[...i]).slice(0,Je);return Yt(t)}function qi(s){const e=w(s);ie=Yt([[...s],...ie.filter(t=>w(t)!==e)]),localStorage.setItem(Xt,JSON.stringify(ie))}function Yt(s){const e=s.map(t=>[...t]);for(const t of Le)e.length>=Je||e.some(i=>w(i)===w(t))||e.push([...t]);return e.slice(0,Je)}function zi(s){return Array.isArray(s)&&s.length===3&&s.every(e=>Number.isInteger(e)&&e>=0&&e<=255)}function Hi(s,e,t){return s===void 0||e===t?s:s===e?t:e<t&&s>e&&s<=t?s-1:t<e&&s>=t&&s<e?s+1:s}function w(s){return`#${s.map(e=>e.toString(16).padStart(2,"0")).join("")}`}function kt(s){return[Number.parseInt(s.slice(1,3),16),Number.parseInt(s.slice(3,5),16),Number.parseInt(s.slice(5,7),16)]}customElements.get("govee-palette-editor")||customElements.define("govee-palette-editor",oe);var ji=Object.defineProperty,de=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&ji(e,t,r),r};const W=5,St=8,Jt=[1,2,0,3],Wt=[0,1,2,3],Vi={0:"Segment",1:"Continuous",2:"Random",3:"Custom"},Gi={0:"Brightest to darkest",1:"Brightest, darkest, brightest",2:"Darkest to brightest",3:"Darkest, brightest, darkest"},Et={0:"Forward",1:"Backward",2:"Forward and back",3:"Back and forward"};class K extends P{constructor(){super(...arguments),this.disabled=!1,this.activeLayerIndex=0,this.activePatternIndex=0,this.movementAnnouncement=""}willUpdate(e){if(!(!e.has("content")||!this.content)){if(this.content.layers.length===0){this.activeLayerIndex=0,this.activePatternIndex=0;return}if(this.activeLayerIndex=q(this.activeLayerIndex,0,this.content.layers.length-1),this.activeLayer.brightness_patterns.length===0){this.activePatternIndex=0;return}this.activePatternIndex=q(this.activePatternIndex,0,this.activeLayer.brightness_patterns.length-1)}}render(){if(!this.content)return l;if(this.content.layers.length===0)return this.renderEmptyLayers();const e=this.activeLayer,t=this.content.layers.map((i,r)=>({key:`layer-${r}`,label:`Layer ${r+1}`,ariaLabel:`Layer ${r+1}. Drag to reorder or use arrow keys.`,id:`advanced-layer-tab-${r}`,ariaControls:"advanced-layer-panel"}));return o`
      <div class="movement-live" aria-live="polite">
        ${this.movementAnnouncement}
      </div>

      <section class="card layer-card">
        <govee-reorderable-strip
          .items=${t}
          .activeIndex=${this.activeLayerIndex}
          ariaLabel="Effect layers"
          itemRole="tab"
          addLabel="Add layer"
          .addDisabled=${this.disabled||this.content.layers.length>=W}
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
                    ?disabled=${this.disabled||this.content.layers.length>=W}
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

        ${this.content.layers.length>=W?o`
              <p class="limit-note">
                ${this.content.layers.length>W?`This loaded effect has ${this.content.layers.length} layers. All are preserved, but adding and copying are unavailable while five or more remain.`:"Advanced effects can author up to five layers."}
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
    `}get activeLayer(){return this.content.layers[this.activeLayerIndex]}renderAppliedArea(e){const t=e.area.start_tenths>=0&&e.area.start_tenths<=9&&e.area.width_tenths>=1&&e.area.width_tenths<=10-e.area.start_tenths,i=q(e.area.start_tenths,0,9),r=i+e.area.width_tenths;return o`
      <section class="card wide-card">
        <h3>Applied area</h3>
        <div class="area-control">
          <div
            class="coverage"
            aria-label="Applied area, 10 steps"
          >
            ${Array.from({length:10},(n,a)=>o`
                <span
                  class=${t&&a>=i&&a<r?"covered":""}
                  aria-hidden="true"
                ></span>
              `)}
          </div>
          ${t?o`
                <input
                  class="area-boundary area-start"
                  type="range"
                  min="0"
                  .max=${String(r-1)}
                  step="1"
                  .value=${String(i)}
                  aria-label="Applied area start"
                  aria-valuetext="${i*10}%"
                  ?disabled=${this.disabled}
                  @input=${n=>{const a=Number(n.target.value);this.updateLayer({area:{start_tenths:a,width_tenths:r-a}})}}
                />
                <input
                  class="area-boundary area-end"
                  type="range"
                  .min=${String(i+1)}
                  max="10"
                  step="1"
                  .value=${String(r)}
                  aria-label="Applied area end"
                  aria-valuetext="${r*10}%"
                  ?disabled=${this.disabled}
                  @input=${n=>{const a=Number(n.target.value);this.updateLayer({area:{start_tenths:i,width_tenths:a-i}})}}
                />
              `:l}
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
    `}renderSelectionControls(e){const t=e.selection,i=Xi(t.type);return o`
      <div class="selection-controls">
        <h4>Selection</h4>
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
                  ${Vi[r]}
                </option>`)}
            ${i?l:o`
                  <option value=${t.type} .selected=${!0}>
                    Raw type ${t.type} (0x${Ie(t.type)})
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
      </div>
    `}renderPalette(e){return o`
      <section class="card">
        <h3>Colours</h3>
        <govee-palette-editor
          .palette=${e.palette}
          .minColours=${1}
          .maxColours=${St}
          .disabled=${this.disabled}
          @palette-changed=${t=>this.updateLayer({palette:t.detail.palette.map(i=>[...i])})}
        ></govee-palette-editor>
        ${e.palette.length>St?o`
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
        ${this.rangeField("Colour speed",e.colour_speed,0,255,ce(e.colour_speed),i=>this.updateLayer({colour_speed:i}))}
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
      `;const t=q(this.activePatternIndex,0,e.brightness_patterns.length-1),i=e.brightness_patterns[t],r=Yi(i.order);return o`
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
                    ${Gi[n]}
                  </option>`)}
              ${r?l:o`
                    <option value=${i.order} .selected=${!0}>
                      Raw order ${i.order} (0x${Ie(i.order)})
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
          ${this.rangeField("Scope low",i.scope_low,0,255,ce(i.scope_low),n=>this.updateBrightnessPattern({scope_low:n}))}
          ${this.rangeField("Scope high",i.scope_high,0,255,ce(i.scope_high),n=>this.updateBrightnessPattern({scope_high:n}))}
          ${this.rangeField("Changing speed",i.change_speed,0,255,ce(i.change_speed),n=>this.updateBrightnessPattern({change_speed:n}))}
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
              ${this.rangeField("Speed",r.speed,0,255,ce(r.speed),n=>this.updateMovement(t,{speed:n},`${i} speed ${ei(n)} per cent.`))}
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
          .value=${String(q(t,i,r))}
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
          @change=${a=>n(q(Number(a.target.value),i,r))}
        />
      </label>
    `}hexByteField(e,t,i,r=255){return o`
      <label class="field">
        <span>${e}</span>
        <input
          type="text"
          inputmode="text"
          spellcheck="false"
          .value=${Ie(t)}
          ?disabled=${this.disabled}
          @change=${n=>{const a=n.target,d=Ji(a.value);if(d===void 0){a.setCustomValidity("Enter one byte from 00 to FF."),a.reportValidity();return}if((d&~r)!==0){a.setCustomValidity(`Known flag bits are controlled elsewhere. Allowed mask: ${Ie(r)}.`),a.reportValidity();return}a.setCustomValidity(""),i(d)}}
        />
      </label>
    `}updateLayer(e){if(!this.content||this.disabled)return;const t=this.content.layers.map((i,r)=>r===this.activeLayerIndex?N({...i,...e}):N(i));this.emitContent({kind:"advanced",layers:t})}updateSelection(e){this.updateLayer({selection:{...this.activeLayer.selection,...e}})}updateBrightnessPattern(e){const t=this.activeLayer.brightness_patterns.map((i,r)=>r===this.activePatternIndex?{...i,...e}:{...i});this.updateLayer({brightness_patterns:t})}updateMovement(e,t,i){this.updateLayer({[e]:{...this.activeLayer[e],...t}}),i&&(this.movementAnnouncement=i)}addLayer(){if(!this.content||this.disabled||this.content.layers.length>=W)return;const e=[...this.content.layers.map(N),Zt()];this.installContent({kind:"advanced",layers:e}),this.activeLayerIndex=e.length-1,this.activePatternIndex=0,this.layerActionsIndex=void 0,this.focusActiveTab()}copyLayer(){if(!this.content||this.disabled||this.content.layers.length>=W)return;const e=this.content.layers.map(N);e.splice(this.activeLayerIndex+1,0,N(this.activeLayer)),this.installContent({kind:"advanced",layers:e}),this.activeLayerIndex+=1,this.activePatternIndex=0,this.layerActionsIndex=this.activeLayerIndex,this.focusActiveTab()}deleteLayer(){if(!this.content||this.disabled||this.content.layers.length===1)return;const e=this.content.layers.filter((t,i)=>i!==this.activeLayerIndex).map(N);this.activeLayerIndex=Math.min(this.activeLayerIndex,e.length-1),this.activePatternIndex=0,this.layerActionsIndex=void 0,this.emitContent({kind:"advanced",layers:e}),this.focusActiveTab()}reorderLayer(e,t){if(!this.content||this.disabled||e<0||e>=this.content.layers.length||t<0||t>=this.content.layers.length||e===t)return;const i=this.content.layers.map(N),[r]=i.splice(e,1);i.splice(t,0,r),this.activeLayerIndex=It(this.activeLayerIndex,e,t),this.layerActionsIndex!==void 0&&(this.layerActionsIndex=It(this.layerActionsIndex,e,t)),this.emitContent({kind:"advanced",layers:i})}addBrightnessPattern(){if(this.disabled||this.activeLayer.brightness_patterns.length>=3)return;const e=[...this.activeLayer.brightness_patterns.map(t=>({...t})),Qt()];this.activePatternIndex=e.length-1,this.updateLayer({brightness_patterns:e})}deleteBrightnessPattern(){if(this.disabled||this.activeLayer.brightness_patterns.length===1)return;const e=this.activeLayer.brightness_patterns.filter((t,i)=>i!==this.activePatternIndex).map(t=>({...t}));this.activePatternIndex=Math.min(this.activePatternIndex,e.length-1),this.updateLayer({brightness_patterns:e})}selectLayer(e){if(e===this.activeLayerIndex){this.layerActionsIndex=this.layerActionsIndex===e?void 0:e;return}this.activeLayerIndex=e,this.activePatternIndex=0,this.layerActionsIndex=e}patternTabKeyPressed(e,t){const i=this.activeLayer.brightness_patterns.length;let r;t.key==="ArrowLeft"?r=e===0?i-1:e-1:t.key==="ArrowRight"?r=e===i-1?0:e+1:t.key==="Home"?r=0:t.key==="End"&&(r=i-1),r!==void 0&&(t.preventDefault(),this.activePatternIndex=r,this.updateComplete.then(()=>{this.shadowRoot?.querySelectorAll(".pattern-tabs button")[r]?.focus()}))}focusActiveTab(){this.updateComplete.then(()=>{this.shadowRoot?.querySelector("govee-reorderable-strip")?.focusItem(this.activeLayerIndex)})}excessChanged(e){const t=e.value.replace(/\s+/g,"").toLowerCase();if(!/^(?:[0-9a-f]{2})*$/.test(t)){e.setCustomValidity("Enter an even number of hexadecimal digits."),e.reportValidity();return}e.setCustomValidity(""),this.updateLayer({excess:t})}emitContent(e){this.dispatchEvent(new CustomEvent("content-changed",{detail:{content:e},bubbles:!0,composed:!0}))}installContent(e){this.content=e,this.emitContent(e)}static{this.styles=V`
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

    .layer-actions-popover {
      --strip-popover-width: 220px;
      display: grid;
      gap: 8px;
    }

    .layer-actions-popover .secondary {
      width: 100%;
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

    .area-control {
      position: relative;
      margin-bottom: 16px;
      padding: 10px 0;
    }

    .coverage {
      display: grid;
      grid-template-columns: repeat(10, minmax(0, 1fr));
      gap: 4px;
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

    .area-boundary {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 64px;
      min-height: 0;
      margin: 0;
      padding: 0;
      appearance: none;
      background: transparent;
      pointer-events: none;
    }

    .area-start {
      z-index: 2;
    }

    .area-end {
      z-index: 3;
    }

    .area-boundary::-webkit-slider-runnable-track {
      height: 44px;
      border: 0;
      background: transparent;
    }

    .area-boundary::-webkit-slider-thumb {
      width: 16px;
      height: 56px;
      margin-top: -6px;
      border: 3px solid var(--studio-blue);
      border-radius: 8px;
      appearance: none;
      background: var(--studio-card);
      box-shadow: 0 2px 7px rgb(0 0 0 / 24%);
      cursor: ew-resize;
      pointer-events: auto;
    }

    .area-boundary::-moz-range-track {
      height: 44px;
      border: 0;
      background: transparent;
    }

    .area-boundary::-moz-range-thumb {
      width: 10px;
      height: 50px;
      border: 3px solid var(--studio-blue);
      border-radius: 8px;
      background: var(--studio-card);
      box-shadow: 0 2px 7px rgb(0 0 0 / 24%);
      cursor: ew-resize;
      pointer-events: auto;
    }

    .area-boundary:focus-visible {
      outline: none;
    }

    .area-boundary:focus-visible::-webkit-slider-thumb {
      outline: 3px solid var(--studio-blue);
      outline-offset: 2px;
    }

    .area-boundary:focus-visible::-moz-range-thumb {
      outline: 3px solid var(--studio-blue);
      outline-offset: 2px;
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
  `}}de([y({attribute:!1})],K.prototype,"content");de([y({type:Boolean})],K.prototype,"disabled");de([h()],K.prototype,"activeLayerIndex");de([h()],K.prototype,"activePatternIndex");de([h()],K.prototype,"movementAnnouncement");de([h()],K.prototype,"layerActionsIndex");function It(s,e,t){return s===e?t:e<t&&s>e&&s<=t?s-1:t<e&&s>=t&&s<e?s+1:s}function Ki(){return{kind:"advanced",layers:[Zt()]}}function $e(s){return{kind:"advanced",layers:s.layers.map(N)}}function Zt(){return{area:{start_tenths:0,width_tenths:10},selection:{type:0,param_1:0,param_2:1},brightness_gradient:!1,brightness_patterns:[Qt()],distribution:{method:1,backwards:!1},colour_speed:128,colour_retention:20,palette:[[255,0,0],[0,0,255]],selected_movement:Ct(),overall_movement:Ct(),priority:0,unknown_flags:0,excess:""}}function Qt(){return{scope_high:255,scope_low:0,order:0,change_speed:128,brightest_retention:20,darkest_retention:20}}function Ct(){return{enabled:!1,enter_exit:!1,direction:0,distance:1,speed:128,unknown_flags:0}}function N(s){return{...s,area:{...s.area},selection:{...s.selection},brightness_patterns:s.brightness_patterns.map(e=>({...e})),distribution:{...s.distribution},palette:s.palette.map(e=>[...e]),selected_movement:{...s.selected_movement},overall_movement:{...s.overall_movement}}}function Xi(s){return Jt.includes(s)}function Yi(s){return Wt.includes(s)}function ei(s){return Math.round(q(s,0,255)/255*100)}function ce(s){return`${ei(s)}% · ${s}`}function Ie(s){return s.toString(16).padStart(2,"0").toUpperCase()}function Ji(s){const e=s.trim().replace(/^0x/i,"");if(/^[0-9a-f]{1,2}$/i.test(e))return Number.parseInt(e,16)}function q(s,e,t){return Math.min(t,Math.max(e,Math.round(s)))}customElements.get("govee-advanced-effect-editor")||customElements.define("govee-advanced-effect-editor",K);const Wi=1,ti=1,Zi=1,L=128,X=65536,ii=512,si=256,ri=32,ni=128,ai=512,x=255,Qi=64,es=262144,At=16,ts=4096,is=16384,H=1024,Ve=16384,dt=Number.MAX_SAFE_INTEGER,ss=4335,rs=232,ns=253;function as(s){const e=m(s,"editor info"),t=m(e.limits,"editor limits");return{api_version:p(e.api_version,"API version",1),effect_schema_version:p(e.effect_schema_version,"effect schema version",1),compiler_version:p(e.compiler_version,"compiler version",1),limits:{effect_name:M(t.effect_name,L,"effect-name limit"),effect_document_bytes:M(t.effect_document_bytes,X,"effect-document limit"),devices:M(t.devices,ii,"device limit"),library_items:M(t.library_items,si,"library-item limit"),drafts_per_owner:M(t.drafts_per_owner,ri,"draft limit"),deployment_records:M(t.deployment_records,ni,"deployment limit"),scene_catalogue_entries:M(t.scene_catalogue_entries,ai,"scene catalogue limit")}}}function os(s){const e=E(s,"devices",ii).map((t,i)=>{const r=m(t,`devices[${i}]`),n=m(r.custom_effects,`devices[${i}].custom_effects`);return{config_entry_id:v(r.config_entry_id,`devices[${i}].config_entry_id`,x),model:v(r.model,`devices[${i}].model`,x),display_name:v(r.display_name,`devices[${i}].display_name`,x),segment_count:p(r.segment_count,`devices[${i}].segment_count`,0,65535),custom_effects:{painted:te(n.painted,"painted capability"),single:te(n.single,"single capability"),multi:te(n.multi,"multi capability"),advanced:te(n.advanced,"advanced capability")},readback:v(r.readback,`devices[${i}].readback`,x)}});return Fe(e,t=>t.config_entry_id,"device IDs"),e}function ds(s){J(s,"custom-effect catalogue",X);const e=m(s,"custom-effect catalogue"),t=m(e.limits,"custom-effect limits"),i=m(e.apply,"custom-effect Apply capabilities");return{schema_version:p(e.schema_version,"catalogue schema",1),sku:Y(e.sku,"catalogue SKU"),painted_effects:E(e.painted_effects,"painted-effect templates",H).map((r,n)=>{const a=m(r,`painted-effect templates[${n}]`);return{id:pi(a.id,["cycle","clockwise","counter_clockwise","twinkle","gradient","breathe"],"painted-effect ID"),label:v(a.label,"painted-effect label",L)}}),effects:E(e.effects,"custom-effect templates",H).map((r,n)=>{const a=m(r,`custom-effect templates[${n}]`);return{id:v(a.id,"template ID",x),label:v(a.label,"template label",L),family:p(a.family,"template family",0,255),variant:p(a.variant,"template variant",0,255)}}),limits:{palette_min:p(t.palette_min,"minimum palette",1,255),palette_max:p(t.palette_max,"maximum palette",1,255),multi_max:p(t.multi_max,"maximum Multi effects",1,255)},apply:{single:te(i.single,"Single Apply capability"),multi:te(i.multi,"Multi Apply capability")}}}function Pt(s){const e=m(s,"library snapshot"),t={library_revision:O(e.library_revision,"library revision",0),items:E(e.items,"library items",si).map((i,r)=>{const n=m(i,`library items[${r}]`),a=n.template===void 0?void 0:Re(n.template,`library items[${r}].template`);return{id:v(n.id,"library item ID",x),revision:O(n.revision,"library item revision",1),name:v(n.name,"library item name",L),kind:v(n.kind,"library item kind",x),...a?{template:a}:{}}})};return Fe(t.items,i=>i.id,"library item IDs"),t}function Te(s){J(s,"library item",X);const e=m(s,"library item"),t=e.target_hint===void 0?void 0:m(e.target_hint,"target hint");return{schema_version:M(e.schema_version,ti,"effect schema version"),id:v(e.id,"effect ID",x),revision:O(e.revision,"effect revision",1),name:v(e.name,"effect name",L),content:oi(e.content),provenance:Dt(e.provenance,"effect provenance"),extensions:Dt(e.extensions,"effect extensions"),...t?{target_hint:{model:t.model===null?null:v(t.model,"target model",x),segment_count:t.segment_count===null?null:p(t.segment_count,"target segment count",1,65535)}}:{}}}function ls(s){const e=E(s,"draft summaries",ri).map((t,i)=>{const r=m(t,`draft summaries[${i}]`);return{id:v(r.id,"draft ID",x),revision:O(r.revision,"draft revision",1),name:v(r.name,"draft name",L),updated_at:ct(r.updated_at,"draft timestamp"),selected_config_entry_id:xe(r.selected_config_entry_id,"draft config entry ID")}});return Fe(e,t=>t.id,"draft IDs"),e}function Ge(s){const e=m(s,"effect draft");return{id:v(e.id,"draft ID",x),owner_id:v(e.owner_id,"draft owner",x),revision:O(e.revision,"draft revision",1),item:Te(e.item),updated_at:ct(e.updated_at,"draft timestamp"),selected_config_entry_id:xe(e.selected_config_entry_id,"draft config entry ID"),base_item_id:xe(e.base_item_id,"draft base item ID"),base_item_revision:e.base_item_revision===null?null:O(e.base_item_revision,"draft base item revision",1)}}function We(s){const e=m(s,"deployment"),t=Y(e.phase,"deployment phase");t!=="pending"&&t!=="uploading"&&t!=="verifying"&&t!=="confirmed"&&t!=="failed"&&t!=="interrupted"&&t!=="unknown"&&f("deployment phase is invalid");const i={operation_id:v(e.operation_id,"deployment operation ID",x),config_entry_id:v(e.config_entry_id,"deployment config entry ID",x),diy_code:p(e.diy_code,"deployment DIY code",0,65535),phase:t,updated_at:ct(e.updated_at,"deployment timestamp"),item_id:xe(e.item_id,"deployment item ID"),item_revision:e.item_revision===null?null:O(e.item_revision,"deployment item revision",1),error_code:xe(e.error_code,"deployment error code"),progress_current:p(e.progress_current,"deployment progress",0,1024),progress_total:p(e.progress_total,"deployment progress total",0,1024)};return i.progress_current>i.progress_total&&f("deployment progress exceeds its total"),i}function cs(s){const e=m(s,"deployment snapshot"),t={revision:O(e.revision,"deployment revision",0),deployments:E(e.deployments,"deployments",ni).map(We)};return Fe(t.deployments,i=>i.operation_id,"deployment operation IDs"),t}function ps(s){J(s,"scene catalogue",es,is);const e=m(s,"scene catalogue");return{schema_version:p(e.schema_version,"scene catalogue schema",1),sku:v(e.sku,"scene catalogue SKU",x),enabled:ae(e.enabled,"scene catalogue enabled"),categories:E(e.categories,"scene categories",H).map((t,i)=>{const r=m(t,`scene categories[${i}]`);return{id:p(r.id,"scene category ID",0,65535),name:v(r.name,"scene category name",L)}}),scenes:E(e.scenes,"scenes",ai).map(lt)}}function us(s){const e=m(s,"scene detail");J({scene:e.scene,content:e.content},"scene detail",X);const t=oi(e.content);return t.kind!=="scene_builtin"&&t.kind!=="scene_palette"&&t.kind!=="scene_layered"&&f("scene detail content is unsupported"),{scene:lt(e.scene),content:t}}function oi(s){J(s,"effect content",X);const e=m(s,"effect content"),t=v(e.kind,"effect content kind",x);switch(t){case"h617a_painted":return{kind:t,effect:pi(e.effect,["cycle","clockwise","counter_clockwise","twinkle","gradient","breathe"],"painted effect"),speed:p(e.speed,"painted speed",0,100),brightness:p(e.brightness,"painted brightness",0,100),background:_e(e.background,"painted background"),groups:E(e.groups,"paint groups",15).map((i,r)=>{const n=m(i,`paint groups[${r}]`);return{fill:_e(n.fill,"paint-group fill"),segments:E(n.segments,"painted segments",15).map(a=>p(a,"painted segment",0,14))}})};case"h617a_single":return{kind:t,family:p(e.family,"Single family",0,254),variant:p(e.variant,"Single variant",0,255),speed:p(e.speed,"Single speed",0,100),palette:Oe(e.palette,"Single palette",8)};case"h617a_multi":return{kind:t,effects:E(e.effects,"Multi effects",4).map((i,r)=>{const n=m(i,`Multi effects[${r}]`);return{family:p(n.family,"Multi family",0,254),variant:p(n.variant,"Multi variant",0,255)}}),speed:p(e.speed,"Multi speed",0,100),palette:Oe(e.palette,"Multi palette",8)};case"advanced":return{kind:t,layers:Lt(e.layers,"Advanced layers")};case"scene_builtin":return{kind:t,template:Re(e.template,"scene template"),speed_index:Ze(e.speed_index,"scene speed index",0,255)};case"scene_palette":return hs(e);case"scene_layered":{const i=m(e.effect,"layered scene effect"),r=di(e.trailing_padding,"layered scene trailing padding");return{kind:t,template:Re(e.template,"layered scene template"),effect:{layers:Lt(i.layers,"layered scene layers")},speed_index:Ze(e.speed_index,"layered scene speed index",0,255),raw_param:li(e.raw_param,"layered scene raw parameter"),...r===void 0?{}:{trailing_padding:r}}}default:{const{kind:i,...r}=e;return{kind:"opaque",source_kind:t,body:r}}}}function di(s,e){if(s!==void 0)return p(s,e,0,ss)}function hs(s){const t=p(s.layout,"palette scene layout",0,1)===0?0:1,i=E(s.steps,"palette scene steps",255).map((d,c)=>{const u=m(d,`palette scene steps[${c}]`),g=t===0?(u.inline_colour!==null&&f(`palette scene steps[${c}].inline_colour must be null for layout 0`),null):_e(u.inline_colour,`palette scene steps[${c}].inline_colour`);return{value:p(u.value,`palette scene steps[${c}].value`,0,65535),colour:_e(u.colour,`palette scene steps[${c}].colour`),inline_colour:g}}),r=Oe(s.palette,"palette scene shared palette",255,!0);t===1&&r.length!==0&&f("palette scene layout 1 must not have a shared palette");let n;s.config_flags!==void 0&&(n=p(s.config_flags,"palette scene config flags",0,255),n&-9&&f("palette scene config flags must only set reserved config bits"));const a=di(s.trailing_padding,"palette scene trailing padding");return{kind:"scene_palette",template:Re(s.template,"palette scene template"),layout:t,brightness_flag:ae(s.brightness_flag,"palette scene brightness flag"),steps:i,palette:r,speed_index:Ze(s.speed_index,"palette scene speed index",0,255),...n===void 0?{}:{config_flags:n},...a===void 0?{}:{trailing_padding:a}}}function pe(s){return s.kind!=="opaque"?s:(J(s.body,"opaque content",X),{...s.body,kind:v(s.source_kind,"opaque source kind",x)})}function lt(s){const e=m(s,"scene"),t=Y(e.parameter_kind,"scene parameter kind");t!=="none"&&t!=="palette"&&t!=="layers"&&t!=="opaque"&&f("scene parameter kind is invalid");const i=e.speed===null?null:(()=>{const r=m(e.speed,"scene speed");return{option_count:p(r.option_count,"scene speed option count",1,256),default_index:p(r.default_index,"scene default speed",0,255)}})();return{scene_id:p(e.scene_id,"scene ID",0,65535),effect_id:p(e.effect_id,"scene effect ID",0,65535),category_id:p(e.category_id,"scene category ID",0,65535),category:v(e.category,"scene category",L),name:v(e.name,"scene name",L),variant:fs(e.variant,"scene variant",x),display_name:v(e.display_name,"scene display name",L),scene_type:p(e.scene_type,"scene type",0,255),parameter_kind:t,speed:i}}function Lt(s,e){return E(s,e,255).map((t,i)=>ms(t,`${e}[${i}]`))}function ms(s,e){const t=m(s,e),i=m(t.area,`${e}.area`),r=m(t.selection,`${e}.selection`),n=m(t.distribution,`${e}.distribution`);return{area:{start_tenths:p(i.start_tenths,`${e}.area.start_tenths`,0,15),width_tenths:p(i.width_tenths,`${e}.area.width_tenths`,0,15)},selection:{type:C(r.type,`${e}.selection.type`),param_1:C(r.param_1,`${e}.selection.param_1`),param_2:C(r.param_2,`${e}.selection.param_2`)},brightness_gradient:ae(t.brightness_gradient,`${e}.brightness_gradient`),brightness_patterns:E(t.brightness_patterns,`${e}.brightness_patterns`,255).map((a,d)=>{const c=m(a,`${e}.brightness_patterns[${d}]`);return{scope_high:C(c.scope_high,"brightness scope high"),scope_low:C(c.scope_low,"brightness scope low"),order:C(c.order,"brightness order"),change_speed:C(c.change_speed,"brightness change speed"),brightest_retention:C(c.brightest_retention,"brightest retention"),darkest_retention:C(c.darkest_retention,"darkest retention")}}),distribution:{method:p(n.method,`${e}.distribution.method`,0,127),backwards:ae(n.backwards,`${e}.distribution.backwards`)},colour_speed:C(t.colour_speed,`${e}.colour_speed`),colour_retention:C(t.colour_retention,`${e}.colour_retention`),palette:Oe(t.palette,`${e}.palette`,255,!0),selected_movement:Tt(t.selected_movement,`${e}.selected_movement`),overall_movement:Tt(t.overall_movement,`${e}.overall_movement`),priority:C(t.priority,`${e}.priority`),unknown_flags:ci(t.unknown_flags,ns,`${e}.unknown_flags`),excess:li(t.excess,`${e}.excess`)}}function Tt(s,e){const t=m(s,e);return{enabled:ae(t.enabled,`${e}.enabled`),enter_exit:ae(t.enter_exit,`${e}.enter_exit`),direction:p(t.direction,`${e}.direction`,0,3),distance:C(t.distance,`${e}.distance`),speed:C(t.speed,`${e}.speed`),unknown_flags:ci(t.unknown_flags,rs,`${e}.unknown_flags`)}}function Re(s,e){const t=m(s,e);return{sku:v(t.sku,`${e}.sku`,x),scene_id:p(t.scene_id,`${e}.scene_id`,0,65535),effect_id:p(t.effect_id,`${e}.effect_id`,0,65535),catalogue_schema_version:p(t.catalogue_schema_version,`${e}.catalogue_schema_version`,1,dt)}}function Oe(s,e,t,i=!1){const r=E(s,e,t);return!i&&r.length===0&&f(`${e} must not be empty`),r.map((n,a)=>_e(n,`${e}[${a}]`))}function _e(s,e){const t=E(s,e,3);return t.length!==3&&f(`${e} must contain three channels`),t.map(i=>p(i,`${e} channel`,0,255))}function te(s,e){return s!=="supported"&&s!=="unsupported"&&s!=="evidence_gap"&&f(`${e} is invalid`),s}function Dt(s,e){return J(s,e,X),m(s,e)}function xe(s,e){return s===null?null:v(s,e,x)}function ct(s,e){const t=v(s,e,Qi);return(!/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(t)||Number.isNaN(Date.parse(t)))&&f(`${e} must be an ISO 8601 timestamp with a UTC offset`),t}function v(s,e,t){const i=Y(s,e);return(i.length===0||i.length>t)&&f(`${e} must contain 1 to ${t} characters`),i}function fs(s,e,t){const i=Y(s,e);return i.length>t&&f(`${e} must not exceed ${t} characters`),i}function li(s,e){const t=Y(s,e);return(t.length%2!==0||!/^[0-9a-f]*$/i.test(t))&&f(`${e} must be hexadecimal`),t}function Y(s,e){return typeof s!="string"&&f(`${e} must be a string`),s}function ae(s,e){return typeof s!="boolean"&&f(`${e} must be a boolean`),s}function p(s,e,t,i=dt){return(typeof s!="number"||!Number.isSafeInteger(s)||s<t||s>i)&&f(`${e} must be an integer from ${t} to ${i}`),s}function O(s,e,t){return p(s,e,t,dt)}function M(s,e,t){const i=p(s,t,1);return i!==e&&f(`${t} is incompatible with this editor`),i}function Ze(s,e,t,i){return s===null?null:p(s,e,t,i)}function C(s,e){return p(s,e,0,255)}function ci(s,e,t){const i=C(s,t);return i&~e&&f(`${t} must only set reserved bits, not bits explicit fields carry`),i}function pi(s,e,t){const i=Y(s,t);return e.includes(i)||f(`${t} is invalid`),i}function m(s,e){return(typeof s!="object"||s===null||Array.isArray(s))&&f(`${e} must be an object`),s}function E(s,e,t){return Array.isArray(s)||f(`${e} must be an array`),s.length>t&&f(`${e} must not exceed ${t} items`),s}function Fe(s,e,t){const i=s.map(e);new Set(i).size!==i.length&&f(`${t} must be unique`)}function J(s,e,t,i=ts){let r=0;const n=(d,c,u)=>{if(r+=1,r>i&&f(`${e} must not exceed ${i} JSON values`),u>At&&f(`${e} must not exceed ${At} nested levels`),!(d===null||typeof d=="boolean")){if(typeof d=="number"){(!Number.isFinite(d)||Number.isInteger(d)&&!Number.isSafeInteger(d))&&f(`${c} must be a finite JSON number`);return}if(typeof d=="string"){d.length>Ve&&f(`${c} must not exceed ${Ve} characters`);return}if(Array.isArray(d)){d.length>H&&f(`${c} must not exceed ${H} items`),d.forEach((g,b)=>n(g,`${c}[${b}]`,u+1));return}if(typeof d=="object"&&d!==null){const g=Object.entries(d);g.length>H&&f(`${c} must not exceed ${H} fields`),g.forEach(([b,A])=>{b.length>Ve&&f(`${c} contains an oversized key`),n(A,`${c}.${b}`,u+1)});return}f(`${c} contains a non-JSON value`)}};n(s,e,0);const a=JSON.stringify(s);a===void 0&&f(`${e} must contain JSON values`),new TextEncoder().encode(a).byteLength>t&&f(`${e} must not exceed ${t} bytes`)}function f(s){throw new Error(`Malformed Effect Studio server payload: ${s}.`)}function gs(s){return s.api_version===Wi&&s.effect_schema_version===ti&&s.compiler_version===Zi}const Ke="ha_govee_led_ble/editor";class bs{constructor(e){this.hass=e}async info(){return as(await this.call("info"))}async devices(){const e=await this.call("devices");return os(S(e,"devices"))}async customCatalogue(){const e=await this.call("custom/catalogue");return ds(S(e,"catalogue"))}async library(){return Pt(await this.call("library/list"))}async item(e){const t=await this.call("library/get",{item_id:e});return Te(S(t,"item"))}async createItem(e,t,i){const r=await this.call("library/create",{name:e,content:pe(t),expected_library_revision:i});return{item:Te(S(r,"item")),library_revision:Nt(r)}}async updateItem(e,t,i,r){const n=await this.call("library/update",{item_id:e.id,name:t,content:pe(i),expected_revision:e.revision,expected_library_revision:r});return{item:Te(S(n,"item")),library_revision:Nt(n)}}async drafts(){const e=await this.call("draft/list");return ls(S(e,"drafts"))}async draft(e){const t=await this.call("draft/get",{draft_id:e});return Ge(S(t,"draft"))}async createDraft(e,t,i,r){const n=await this.call("draft/create",{name:e,content:pe(t),updated_at:new Date().toISOString(),selected_config_entry_id:i,...r?{base_item_id:r.id,base_item_revision:r.revision}:{}});return Ge(S(n,"draft"))}async updateDraft(e,t,i,r){const n=await this.call("draft/update",{draft_id:e.id,expected_revision:e.revision,name:t,content:pe(i),updated_at:new Date().toISOString(),selected_config_entry_id:r});return Ge(S(n,"draft"))}async deleteDraft(e){await this.call("draft/delete",{draft_id:e.id,expected_revision:e.revision})}async applySaved(e,t){const i=await this.call("apply",{config_entry_id:e,item_id:t.id,revision:t.revision,updated_at:new Date().toISOString()});return We(S(i,"deployment"))}async applySnapshot(e,t,i){const r=await this.call("apply_snapshot",{config_entry_id:e,name:t,content:pe(i),updated_at:new Date().toISOString()});return We(S(r,"deployment"))}async sceneCatalogue(e){const t=await this.call("scene/catalogue/list",{config_entry_id:e});return ps(S(t,"catalogue"))}sceneDetail(e,t,i){return this.call("scene/catalogue/get",{config_entry_id:e,scene_id:t,effect_id:i}).then(us)}async applyScene(e,t,i){const r=await this.call("scene/apply",{config_entry_id:e,scene_id:t.scene_id,effect_id:t.effect_id,...i===null?{}:{speed_index:i}}),n=lt(S(r,"scene")),a=S(r,"readback");if(a!=="scene_identity_only")throw new Error("Malformed Effect Studio server payload: scene Apply readback is invalid.");const d=S(r,"speed_index");if(d!==null&&(typeof d!="number"||!Number.isSafeInteger(d)||d<0||d>255))throw new Error("Malformed Effect Studio server payload: scene Apply speed is invalid.");return{scene:n,speed_index:d,readback:a}}subscribeLibrary(e,t){return this.hass.connection.subscribeMessage(i=>{try{e(Pt(i))}catch(r){t?.(Mt(r))}},{type:`${Ke}/library/subscribe`})}subscribeDeployments(e,t){return this.hass.connection.subscribeMessage(i=>{try{e(cs(i))}catch(r){t?.(Mt(r))}},{type:`${Ke}/deployment/subscribe`})}call(e,t={}){return this.hass.callWS({type:`${Ke}/${e}`,...t})}}function S(s,e){if(typeof s!="object"||s===null||Array.isArray(s))throw new Error("Malformed Effect Studio server payload: response must be an object.");if(!(e in s))throw new Error(`Malformed Effect Studio server payload: response is missing ${e}.`);return s[e]}function Nt(s){const e=S(s,"library_revision");if(typeof e!="number"||!Number.isSafeInteger(e)||e<0)throw new Error("Malformed Effect Studio server payload: library revision is invalid.");return e}function Mt(s){return s instanceof Error?s:new Error("Malformed Effect Studio server payload.")}var vs=Object.defineProperty,qe=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&vs(e,t,r),r};class Se extends P{constructor(){super(...arguments),this.disabled=!1,this.windowKeyPressed=e=>{e.key==="Escape"&&this.pickerIndex!==void 0&&(e.preventDefault(),this.closePicker())}}connectedCallback(){super.connectedCallback(),window.addEventListener("keydown",this.windowKeyPressed)}disconnectedCallback(){window.removeEventListener("keydown",this.windowKeyPressed),super.disconnectedCallback()}updated(e){e.has("pickerIndex")&&this.pickerIndex!==void 0&&this.shadowRoot?.querySelector(".modal-close")?.focus()}render(){return!this.content||!this.catalogue?l:o`
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
        @palette-changed=${e=>{this.emitContent({...this.content,palette:ys(e.detail.palette)})}}
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
            ${this.catalogue.effects.map(t=>{const i=e!==void 0&&Ce(t)===Ce(e);return o`
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
    `}selectEffect(e){if(!this.content||this.pickerIndex===void 0)return;const t={family:e.family,variant:e.variant};if(this.content.kind==="h617a_single")this.emitContent({...this.content,...t});else{const i=this.content.effects.map((r,n)=>n===this.pickerIndex?t:r);this.emitContent({...this.content,effects:i})}this.closePicker()}addEffect(){if(!this.content||this.content.kind!=="h617a_multi")return;const e=this.catalogue?.effects[this.content.effects.length]??this.catalogue?.effects[0];if(!e)return;const t=[...this.content.effects,{family:e.family,variant:e.variant}];this.emitContent({...this.content,effects:t})}removeEffect(e){if(!this.content||this.content.kind!=="h617a_multi")return;const t=this.content.effects.filter((i,r)=>r!==e);this.emitContent({...this.content,effects:t})}moveEffect(e,t){if(!this.content||this.content.kind!=="h617a_multi")return;const i=e+t;i<0||i>=this.content.effects.length||this.reorderEffect(e,i)}reorderEffect(e,t){if(!this.content||this.content.kind!=="h617a_multi"||e===t)return;const i=[...this.content.effects],[r]=i.splice(e,1);i.splice(t,0,r),this.emitContent({...this.content,effects:i})}effectDragStarted(e,t){this.draggedEffectIndex=e,t.dataTransfer?.setData("text/plain",String(e))}effectDropped(e,t){t.preventDefault(),this.draggedEffectIndex!==void 0&&(this.reorderEffect(this.draggedEffectIndex,e),this.draggedEffectIndex=void 0)}closeDetails(e){e.currentTarget.closest("details")?.removeAttribute("open")}openPicker(e){this.pickerIndex=e}closePicker(){const e=this.pickerIndex;this.pickerIndex=void 0,this.updateComplete.then(()=>{e!==void 0&&this.shadowRoot?.querySelector(`[data-effect-index="${e}"]`)?.focus()})}modalKeyPressed(e){if(e.key!=="Tab")return;const i=[...e.currentTarget.querySelectorAll("button:not([disabled])")];if(!i.length)return;const r=i[0],n=i[i.length-1],a=this.shadowRoot?.activeElement;e.shiftKey&&a===r?(e.preventDefault(),n.focus()):!e.shiftKey&&a===n&&(e.preventDefault(),r.focus())}effectLabel(e){return this.catalogue?.effects.find(t=>Ce(t)===Ce(e))?.label??"Unknown catalogue effect"}emitContent(e){this.dispatchEvent(new CustomEvent("content-changed",{detail:{content:e},bubbles:!0,composed:!0}))}static{this.styles=V`
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
  `}}qe([y({attribute:!1})],Se.prototype,"content");qe([y({attribute:!1})],Se.prototype,"catalogue");qe([y({type:Boolean})],Se.prototype,"disabled");qe([h()],Se.prototype,"pickerIndex");function Ce(s){return`${s.family}:${s.variant}`}function ys(s){return s.map(e=>[...e])}customElements.get("govee-custom-effect-editor")||customElements.define("govee-custom-effect-editor",Se);var $s=Object.defineProperty,ui=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&$s(e,t,r),r};class pt extends P{constructor(){super(...arguments),this.colours=[],this.disabled=!1}render(){return o`
      <section class="card" aria-labelledby="painted-segments-heading">
        <h3 id="painted-segments-heading">Painted segments</h3>
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
    `}pointerStarted(e,t){this.disabled||(t.preventDefault(),this.paintingPointerId=t.pointerId,this.lastPaintedSegment=e,t.currentTarget.setPointerCapture(t.pointerId),this.selectSegment(e))}pointerMoved(e){if(e.pointerId!==this.paintingPointerId||!this.shadowRoot)return;const t=this.shadowRoot.elementFromPoint(e.clientX,e.clientY)?.closest("[data-segment]"),i=Number(t?.dataset.segment);Number.isInteger(i)&&i!==this.lastPaintedSegment&&(this.lastPaintedSegment=i,this.selectSegment(i))}pointerFinished(e){if(e.pointerId!==this.paintingPointerId)return;const t=this.shadowRoot?.querySelector(`[data-segment="${this.lastPaintedSegment}"]`);t?.hasPointerCapture(e.pointerId)&&t.releasePointerCapture(e.pointerId),this.paintingPointerId=void 0,this.lastPaintedSegment=void 0}segmentClicked(e,t){!this.disabled&&t.detail===0&&this.selectSegment(e)}selectSegment(e){this.dispatchEvent(new CustomEvent("segment-selected",{detail:{index:e},bubbles:!0,composed:!0}))}static{this.styles=V`
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
  `}}ui([y({attribute:!1})],pt.prototype,"colours");ui([y({type:Boolean})],pt.prototype,"disabled");customElements.get("govee-painted-segment-editor")||customElements.define("govee-painted-segment-editor",pt);var _s=Object.defineProperty,I=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&_s(e,t,r),r};class k extends P{constructor(){super(...arguments),this.library={library_revision:0,items:[]},this.isAdmin=!1,this.category="all",this.name="",this.speedIndex=null,this.loading=!1,this.saving=!1,this.applying=!1,this.requestGeneration=0}willUpdate(e){(e.has("device")||e.has("api"))&&(this.invalidateRequests(),this.catalogue=void 0,this.category="all",this.selectedScene=void 0,this.selectedItem=void 0,this.content=void 0,this.notice=void 0,this.error=void 0,this.loading=!!(this.api&&this.device))}updated(e){(e.has("device")||e.has("api"))&&this.api&&this.device&&this.loadCatalogue()}render(){return this.device?this.loading?o`<div class="status" role="status">Loading scenes...</div>`:this.error||!this.catalogue?o`
        <section class="empty">
          <h2>Scenes are unavailable</h2>
          <p role="alert">${this.error??"The scene catalogue could not be loaded."}</p>
        </section>
      `:o`
      <aside class="categories" aria-label="Scene categories">
        ${this.sortedCategories.map(e=>this.categoryButton(e.id,e.label))}
      </aside>

      <aside class="scenes" aria-label="Scenes">
        ${this.filteredSceneEntries.map(e=>e.kind==="custom"?this.sceneButton(`custom:${e.item.id}`,e.label,()=>this.selectCustom(e.item)):this.sceneButton(Z(e.scene),e.label,()=>this.selectBuiltin(e.scene)))}
        ${this.filteredSceneEntries.length?l:o`<p class="empty-list">No scenes in this category.</p>`}
      </aside>

      <section class="detail">
        ${this.notice?o`<div class="notice" role="status">${this.notice}</div>`:l}
        ${this.selectedScene&&this.content?this.renderDetail():l}
      </section>
    `:o`
        <section class="empty">
          <h2>No loaded device</h2>
          <p>Load a Govee light before browsing its native scenes.</p>
        </section>
      `}get sortedCategories(){return[{id:"all",label:"All scenes"},{id:"custom",label:"Custom"},...this.catalogue?.categories.map(e=>({id:e.id,label:e.name}))??[]].sort((e,t)=>Rt(e.label,t.label))}get compatibleCustomScenes(){return this.library.items.filter(e=>(e.kind==="scene_builtin"||e.kind==="scene_palette")&&e.template?.sku===this.catalogue?.sku)}get filteredCustomScenes(){return this.category==="all"||this.category==="custom"?this.compatibleCustomScenes:[]}get filteredBuiltinScenes(){return!this.catalogue||this.category==="custom"?[]:this.category==="all"?this.catalogue.scenes:this.catalogue.scenes.filter(e=>e.category_id===this.category)}get filteredSceneEntries(){return[...this.filteredCustomScenes.map(e=>({kind:"custom",item:e,label:e.name})),...this.filteredBuiltinScenes.map(e=>({kind:"builtin",scene:e,label:e.display_name}))].sort((e,t)=>Rt(e.label,t.label))}get selectionKey(){return this.selectedItem?`custom:${this.selectedItem.id}`:this.selectedScene?Z(this.selectedScene):void 0}categoryButton(e,t){const i=this.category===e;return o`
      <button
        class="selector ${i?"selected":""}"
        type="button"
        aria-current=${i?"page":l}
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
    `}renderDetail(){const e=this.selectedScene,t=e.speed,i=this.speedIndex??t?.default_index??0,r=this.selectedItem!==void 0;return o`
      <header class="detail-heading">
        <div>
          ${r?o`
                <input
                  class="name"
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
            class="secondary"
            type="button"
            ?disabled=${!this.isAdmin||this.saving||!this.hasCurrentSceneContent()||this.content?.kind==="scene_layered"}
            @click=${this.save}
          >
            ${this.saving?"Saving...":r?"Save":"Save copy"}
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
              `:l}
          <button
            class="primary"
            type="button"
            aria-describedby=${r&&this.content?.kind==="scene_palette"?"palette-apply-reason":l}
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

      ${r&&this.content?.kind==="scene_palette"?o`
            <div class="callout" id="palette-apply-reason" role="note">
              Saved palette scene copies cannot be applied. Apply the native
              catalogue scene through its scene identity instead.
            </div>
          `:l}

      ${t?o`
            <section class="card">
              <h3>Common settings</h3>
              <label class="range-field">
                <span>Speed</span>
                <input
                  type="range"
                  aria-label="Scene speed"
                  min="0"
                  max=${t.option_count-1}
                  step="1"
                  .value=${String(i)}
                  ?disabled=${!this.isAdmin}
                  @input=${n=>{this.speedIndex=Number(n.target.value)}}
                />
                <output>
                  ${xs(i,t.default_index)}
                </output>
              </label>
            </section>
          `:l}

      ${this.content?.kind==="scene_palette"?this.renderPaletteParameters(this.content):l}
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
                      style="--scene-colour: ${w(t)}"
                      aria-label="Colour ${i+1}, ${w(t)}"
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
    `}async loadCatalogue(){if(!this.api||!this.device)return;const e=this.beginRequest();this.loading=!0,this.error=void 0,this.notice=void 0,this.selectedScene=void 0,this.selectedItem=void 0,this.content=void 0;try{const t=await e.api.sceneCatalogue(e.deviceId);if(!this.requestIsCurrent(e))return;this.catalogue=t,this.category="all"}catch(t){this.requestIsCurrent(e)&&(this.error=ue(t))}finally{this.requestIsCurrent(e)&&(this.loading=!1)}}selectCategory(e){this.invalidateRequests(),this.category=e,this.selectedScene=void 0,this.selectedItem=void 0,this.content=void 0,this.notice=void 0}async selectBuiltin(e){if(!this.api||!this.device)return;const t=Z(e),i=this.beginRequest(t);this.notice=void 0,this.selectedScene=e,this.selectedItem=void 0,this.content=void 0,this.name=e.display_name,this.speedIndex=e.speed?.default_index??null;try{const r=await i.api.sceneDetail(i.deviceId,e.scene_id,e.effect_id);if(!this.requestIsCurrent(i)||Z(r.scene)!==t)return;this.selectedScene=r.scene,this.content=r.content,this.name=r.scene.display_name,this.speedIndex=r.content.speed_index}catch(r){this.requestIsCurrent(i)&&(this.notice=ue(r))}}async selectCustom(e){if(!this.api||!this.device||!this.catalogue)return;const t=this.catalogue,i=this.beginRequest(`custom:${e.id}`);this.notice=void 0,this.selectedScene=void 0,this.selectedItem=void 0,this.content=void 0,this.name=e.name;try{const r=await i.api.item(e.id);if(!this.requestIsCurrent(i))return;if(r.content.kind!=="scene_builtin"&&r.content.kind!=="scene_palette")throw new Error("This custom scene uses an unsupported definition.");const n=r.content;if(n.template.sku!==t.sku)throw new Error(`This custom scene targets ${n.template.sku}, not ${t.sku}.`);const a=t.scenes.find(c=>c.scene_id===n.template.scene_id&&c.effect_id===n.template.effect_id);if(!a)throw new Error("The source scene is not in this device catalogue.");const d=await i.api.sceneDetail(i.deviceId,n.template.scene_id,n.template.effect_id);if(!this.requestIsCurrent(i)||Z(d.scene)!==Z(a))return;this.selectedScene=a,this.selectedItem=r,this.content=n,this.name=r.name,this.speedIndex=n.speed_index??a.speed?.default_index??null}catch(r){this.requestIsCurrent(i)&&(this.notice=ue(r))}}async save(){if(!this.api||!this.device||!this.catalogue||!this.selectedScene||!this.content||!this.hasCurrentSceneContent()||this.content.kind!=="scene_builtin"&&this.content.kind!=="scene_palette"||!this.isAdmin||this.saving)return;const e=(this.selectedItem?this.name.trim():`${this.selectedScene.display_name} copy`).trim();if(!e){this.notice="Give this custom scene a name before saving.";return}const t=this.content.kind==="scene_palette"?ks({...this.content,speed_index:this.speedIndex}):{...this.content,speed_index:this.speedIndex},i=this.captureRequest();this.saving=!0,this.notice=void 0;try{const r=this.selectedItem?await this.api.updateItem(this.selectedItem,e,t,this.library.library_revision):await this.api.createItem(e,t,this.library.library_revision);if(r.item.content.kind!=="scene_builtin"&&r.item.content.kind!=="scene_palette")throw new Error("The saved scene returned an unsupported definition.");if(this.dispatchEvent(new CustomEvent("library-item-saved",{detail:{item:r.item,library_revision:r.library_revision},bubbles:!0,composed:!0})),!this.requestIsCurrent(i))return;this.requestGeneration+=1,this.activeSelectionIdentity=`custom:${r.item.id}`,this.selectedItem=r.item,this.content=r.item.content,this.name=r.item.name,this.category="custom",this.notice="Custom scene saved."}catch(r){this.requestIsCurrent(i)&&(this.notice=Ss(r)==="conflict"?"The library changed elsewhere. Reload the scene before saving.":`Save failed: ${ue(r)}`)}finally{this.saving=!1}}useAsTemplate(){!this.isAdmin||!this.selectedScene||this.selectedScene.scene_type!==2||this.content?.kind!=="scene_layered"||!this.hasCurrentSceneContent()||this.dispatchEvent(new CustomEvent("scene-template-selected",{detail:{content:ws({...this.content,speed_index:this.speedIndex}),config_entry_id:this.device.config_entry_id,name:`${this.selectedScene.display_name} layered`},bubbles:!0,composed:!0}))}async apply(){if(!this.api||!this.device||!this.selectedScene||!this.hasCurrentSceneContent()||!this.isAdmin||!this.catalogue?.enabled||this.selectedItem!==void 0&&this.content?.kind!=="scene_builtin"||this.applying)return;const e=this.captureRequest(),t=this.device,i=this.selectedScene,r=this.speedIndex;this.applying=!0,this.notice=void 0;try{await e.api.applyScene(e.deviceId,i,r),this.requestIsCurrent(e)&&(this.notice=`Applied to ${t.display_name}. Scene identity can be read back; the selected speed remains optimistic.`)}catch(n){this.requestIsCurrent(e)&&(this.notice=`Apply failed: ${ue(n)}`)}finally{this.applying=!1}}beginRequest(e){return this.requestGeneration+=1,this.activeSelectionIdentity=e,this.captureRequest()}captureRequest(){return{generation:this.requestGeneration,api:this.api,deviceId:this.device.config_entry_id,category:this.category,selectionIdentity:this.activeSelectionIdentity}}invalidateRequests(){this.requestGeneration+=1,this.activeSelectionIdentity=void 0}requestIsCurrent(e){return e.generation===this.requestGeneration&&e.api===this.api&&e.deviceId===this.device?.config_entry_id&&e.category===this.category&&e.selectionIdentity===this.activeSelectionIdentity}hasCurrentSceneContent(){return!this.catalogue||!this.selectedScene||!this.content||this.content.template.sku!==this.catalogue.sku||this.content.template.scene_id!==this.selectedScene.scene_id||this.content.template.effect_id!==this.selectedScene.effect_id?!1:this.activeSelectionIdentity===this.selectionKey}static{this.styles=V`
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

    .range-field {
      display: grid;
      grid-template-columns: 80px minmax(100px, 1fr) 72px;
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
  `}}I([y({attribute:!1})],k.prototype,"api");I([y({attribute:!1})],k.prototype,"device");I([y({attribute:!1})],k.prototype,"library");I([y({type:Boolean})],k.prototype,"isAdmin");I([h()],k.prototype,"catalogue");I([h()],k.prototype,"category");I([h()],k.prototype,"selectedScene");I([h()],k.prototype,"selectedItem");I([h()],k.prototype,"content");I([h()],k.prototype,"name");I([h()],k.prototype,"speedIndex");I([h()],k.prototype,"loading");I([h()],k.prototype,"saving");I([h()],k.prototype,"applying");I([h()],k.prototype,"notice");I([h()],k.prototype,"error");function Z(s){return`builtin:${s.scene_id}:${s.effect_id}`}function xs(s,e){const t=s-e;if(t===0)return"Default";const i=Math.abs(t);return`${t<0?"Slower":"Faster"}${i>1?` ${i}`:""}`}function Rt(s,e){return s.localeCompare(e,"en-AU",{sensitivity:"base"})}function ws(s){return{...s,template:{...s.template},effect:{layers:$e({layers:s.effect.layers}).layers}}}function ks(s){return{...s,template:{...s.template},steps:s.steps.map(e=>({...e,colour:[...e.colour],inline_colour:e.inline_colour===null?null:[...e.inline_colour]})),palette:s.palette.map(e=>[...e])}}function ue(s){return s instanceof Error||typeof s=="object"&&s!==null&&"message"in s&&typeof s.message=="string"?s.message:"An unexpected error occurred."}function Ss(s){if(typeof s=="object"&&s!==null&&"code"in s&&typeof s.code=="string")return s.code}customElements.get("govee-scene-browser")||customElements.define("govee-scene-browser",k);var Es=Object.defineProperty,_=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&Es(e,t,r),r};const Qe=15;class $ extends P{constructor(){super(...arguments),this.loading=!0,this.devices=[],this.section="custom",this.customEffectCategory="all",this.library={library_revision:0,items:[]},this.name="",this.content=De(),this.foreground="#2f80ed",this.brushUsesBackground=!1,this.saving=!1,this.applying=!1,this.deployments=[],this.editorTransitionEpoch=0,this.loadEpoch=0,this.deploymentRevision=-1}get isAdmin(){return this.hass?.user?.is_admin===!0}get selectedDevice(){return this.devices.find(e=>e.config_entry_id===this.selectedDeviceId)}get dirty(){return Q(this.content)?this.savedBaseline!==F(this.name,this.content):!1}get applyCapability(){if(!T(this.content))return;const e=this.selectedDevice?.custom_effects;if(e)switch(this.content.kind){case"h617a_painted":return e.painted;case"h617a_single":return e.single;case"h617a_multi":return e.multi}}get canApply(){return T(this.content)&&this.isAdmin&&!this.applying&&this.name.trim().length>0&&this.applyCapability==="supported"}get activeDeployment(){const e=this.deployments.find(t=>t.operation_id===this.activeOperationId);return e||!this.applying?e:this.latestDeployment(["pending","uploading","verifying"])}connectedCallback(){super.connectedCallback(),this.hass&&!this.api&&this.load()}disconnectedCallback(){super.disconnectedCallback(),this.loadEpoch+=1,this.beginEditorTransition(),this.stopSubscriptions(),this.api=void 0}updated(e){e.has("hass")&&this.hass&&!this.api&&this.load()}render(){return this.loading?o`<div class="centred" role="status">Loading effect studio...</div>`:this.error?this.renderFatalError():o`
      <header class="topbar">
        <div>
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

      <main
        class="studio ${this.section==="scenes"?"scenes-mode":"custom-mode"}"
      >
        <nav class="primary-nav" aria-label="Create">
          ${this.navButton("scenes","Scenes")}
          ${this.navButton("custom","My Effects")}
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
        ${this.section==="custom"?this.renderCustomEffects():l}
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
      <aside class="effect-categories" aria-label="Effect categories">
        ${this.customEffectCategoryButton("all","All")}
        ${this.customEffectCategoryButton("single-layer","Single Layer")}
        ${this.customEffectCategoryButton("multi-layer","Multi Layer")}
        ${this.customEffectCategoryButton("advanced","Advanced")}
      </aside>

      <aside class="library" aria-label="My effects">
        ${this.customEffectEntries.map(e=>this.customEffectListButton(e))}
      </aside>

      <section class="editor">
        ${this.name||this.currentItem?T(this.content)?this.content.kind==="h617a_painted"?this.renderPaintedEditor():this.renderPaletteEffectEditor():me(this.content)?this.renderAdvancedEditor():this.content.kind==="opaque"?this.renderOpaqueEditor(this.content):l:l}
      </section>
    `}get customEffectEntries(){return[{kind:"paint",key:"template:paint",label:"Paint",category:"single-layer"},...this.customCatalogue?.effects.map(t=>({kind:"single",key:`template:single:${t.family}:${t.variant}`,label:t.label,category:"single-layer",family:t.family,variant:t.variant}))??[],{kind:"multi",key:"template:mix",label:"Mix",category:"multi-layer"},{kind:"advanced",key:"template:advanced",label:"Layered",category:"advanced"},...this.library.items.filter(t=>Ft(t.kind)).map(t=>({kind:"saved",key:`saved:${t.id}`,label:t.name,category:Ns(t.kind),item:t}))].filter(t=>this.customEffectCategory==="all"||t.category===this.customEffectCategory).sort((t,i)=>Ds(t.label,i.label))}customEffectCategoryButton(e,t){const i=this.customEffectCategory===e;return o`
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
        <small>${Ms(e.category)}</small>
      </button>
    `}selectCustomEffectEntry(e){if(e.kind==="saved"){this.selectItem(e.item.id);return}if(e.kind==="advanced"){this.newEffect("advanced"),this.customTemplateSelection=e.key;return}if(this.customCatalogue){if(e.kind==="paint"){this.newEffect("h617a_painted",void 0,{name:"New Paint effect",content:De(),selectionIdentity:e.key});return}if(e.kind==="single"){const t=he("h617a_single",this.customCatalogue);this.newEffect("h617a_single",void 0,{name:`New ${e.label} effect`,content:{...t,family:e.family,variant:e.variant},selectionIdentity:e.key});return}this.newEffect("h617a_multi",void 0,{name:"New Mix effect",content:he("h617a_multi",this.customCatalogue),selectionIdentity:e.key})}}renderAdvancedEditor(){if(!me(this.content))return l;const e=this.content.kind==="scene_layered";return o`
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
        .content=${As(this.content)}
        .disabled=${!this.isAdmin}
        @content-changed=${t=>{me(this.content)&&(this.content=Ps(this.content,t.detail.content))}}
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
    `}renderPaintedEditor(){if(this.content.kind!=="h617a_painted")return l;const e=this.content.effect,t=this.activeDeployment;return o`
      <div class="editor-heading">
        <div>
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
        .colours=${et(this.content)}
        .disabled=${!this.isAdmin}
        @segment-selected=${i=>this.setSegmentColour(i.detail.index)}
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
          <h3>Effect</h3>
          <label class="field">
            <span>Effect</span>
            <select
              ?disabled=${!this.isAdmin}
              @change=${this.effectChanged}
            >
              ${this.customCatalogue?.painted_effects.map(i=>o`
                  <option
                    value=${i.id}
                    ?selected=${i.id===e}
                  >
                    ${i.label}
                  </option>
                `)}
            </select>
          </label>
          ${this.rangeField("Speed","speed",this.content.speed)}
          ${this.rangeField("Brightness","brightness",this.content.brightness)}
        </section>
      </div>

      ${t?this.renderDeployment(t):l}
    `}renderPaletteEffectEditor(){if(this.content.kind!=="h617a_single"&&this.content.kind!=="h617a_multi")return l;const e=this.content,t=this.activeDeployment;return o`
      <div class="editor-heading">
        <div>
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
        @content-changed=${i=>{this.content=hi(i.detail.content)}}
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
        ${this.customModeButton("h617a_painted","Paint")}
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
    `}async selectSection(e){const t=this.beginEditorTransition();if(e===this.section||(this.section=e,this.notice=void 0,e==="scenes")||T(this.content)||me(this.content)||this.content.kind==="opaque")return;const i=this.library.items.find(r=>Ft(r.kind));if(i){await this.selectItem(i.id,t);return}this.isAdmin?this.newEffect("h617a_painted",t):(this.currentItem=void 0,this.name="")}async load(){const e=this.loadEpoch+1;this.loadEpoch=e,this.loading=!0,this.error=void 0,this.deploymentRevision=-1;const t=new bs(this.hass);this.api=t;try{const[i,r,n,a]=await Promise.all([t.info(),t.devices(),t.library(),t.customCatalogue()]);if(!this.loadIsCurrent(e,t))return;if(!gs(i))throw new Error("This editor bundle is not compatible with the installed backend.");this.devices=r,this.library=n,this.customCatalogue=a,this.selectedDeviceId=this.deviceIdFromPath()??r.find(u=>u.custom_effects.painted==="supported")?.config_entry_id??r[0]?.config_entry_id;const d=await t.subscribeLibrary(u=>{this.libraryChanged(u)},u=>this.subscriptionFailed(u,e,t));if(!this.loadIsCurrent(e,t)||this.error){d();return}if(this.unsubscribeLibrary=d,this.isAdmin){const u=await t.subscribeDeployments(g=>{g.revision<this.deploymentRevision||(this.deploymentRevision=g.revision,this.deployments=g.deployments,this.activeOperationId||(this.activeOperationId=this.latestDeployment(["pending","uploading","verifying","interrupted"])?.operation_id))},g=>this.subscriptionFailed(g,e,t));if(!this.loadIsCurrent(e,t)||this.error){u();return}this.unsubscribeDeployments=u}const c=n.items.find(u=>ze(u.kind));c?await this.selectItem(c.id):this.isAdmin&&this.newEffect("h617a_painted")}catch(i){this.loadIsCurrent(e,t)&&(this.stopSubscriptions(),this.error=fe(i))}finally{this.loadIsCurrent(e,t)&&(this.loading=!1)}}loadIsCurrent(e,t){return this.isConnected&&this.loadEpoch===e&&this.api===t}subscriptionFailed(e,t,i){this.loadIsCurrent(t,i)&&(this.error=e.message,this.loading=!1,queueMicrotask(()=>{this.loadIsCurrent(t,i)&&this.stopSubscriptions()}))}stopSubscriptions(){this.unsubscribeLibrary?.(),this.unsubscribeDeployments?.(),this.unsubscribeLibrary=void 0,this.unsubscribeDeployments=void 0}deviceIdFromPath(){const e=window.location.pathname.match(/\/ha-govee-led-ble\/editor\/([^/]+)/);return e?.[1]?decodeURIComponent(e[1]):void 0}async libraryChanged(e){const t=this.library.library_revision;if(e.library_revision<t||(this.library=e,!this.currentItem||e.library_revision===t))return;const i=e.items.find(a=>a.id===this.currentItem?.id);if(!i){this.notice="This effect was removed from the shared library.";return}if(i.revision===this.currentItem.revision)return;if(this.dirty){this.notice="This effect changed elsewhere. Reload it before saving.";return}const r=this.beginEditorTransition();await this.selectItem(i.id,r)&&this.editorTransitionIsCurrent(r)&&(this.notice="Loaded the latest shared revision.")}sceneLibraryItemSaved(e){this.library={library_revision:e.detail.library_revision,items:zt(this.library.items,e.detail.item)}}sceneTemplateSelected(e){!this.isAdmin||e.detail.config_entry_id!==this.selectedDeviceId||(this.beginEditorTransition(),this.currentItem=void 0,this.name=e.detail.name.trim()||"Layered scene template",this.content=ut(e.detail.content),this.savedBaseline=void 0,this.section="custom",this.customEffectCategory="advanced",this.customTemplateSelection=void 0,this.notice=void 0)}backToScenes(){this.beginEditorTransition(),this.section="scenes",this.notice=void 0}beginEditorTransition(){return this.editorTransitionEpoch+=1,this.editorTransitionEpoch}editorTransitionIsCurrent(e){return e===this.editorTransitionEpoch}deviceChanged(e){this.beginEditorTransition(),this.selectedDeviceId=e.target.value,this.activeOperationId=void 0,this.activeOperationId=this.latestDeployment(["pending","uploading","verifying","interrupted"])?.operation_id,this.notice=this.applyAvailabilityNotice()}switchCustomMode(e){if(!this.isAdmin||!this.customCatalogue||!T(this.content)||this.content.kind===e)return;const t=this.content;if(e==="h617a_single"&&t.kind==="h617a_multi"&&t.effects.length>1)return;let i;if(e==="h617a_painted"){const r=t.kind==="h617a_painted"?Ae(this.foreground):t.palette[0]?[...t.palette[0]]:[47,111,237];i={...De(),speed:t.speed,groups:[{fill:[...r],segments:Array.from({length:Qe},(n,a)=>a)}]},this.foreground=Ut(r)}else if(t.kind==="h617a_painted"){const r=Ls(t);if(e==="h617a_single"){const n=he(e,this.customCatalogue);i={...n,speed:t.speed,palette:r.length?r:n.palette}}else{const n=he("h617a_multi",this.customCatalogue);i={...n,speed:t.speed,palette:r.length?r:n.palette}}}else if(e==="h617a_multi"&&t.kind==="h617a_single")i={kind:e,effects:[{family:t.family,variant:t.variant}],speed:t.speed,palette:t.palette.map(r=>[...r])};else if(e==="h617a_single"&&t.kind==="h617a_multi"){const r=t.effects[0];i={kind:e,family:r.family,variant:r.variant,speed:t.speed,palette:t.palette.map(n=>[...n])}}else return;this.content=i,this.customTemplateSelection=e==="h617a_painted"?"template:paint":void 0,/^New (Paint|Painted|Single|Multi) effect$/.test(this.name)&&(this.name=`New ${Ye(e)} effect`),this.notice=this.applyAvailabilityNotice()}newEffect(e,t,i){t??this.beginEditorTransition(),!(!this.api||!this.isAdmin||e!=="advanced"&&!this.customCatalogue)&&(this.currentItem=void 0,this.customTemplateSelection=e==="advanced"?void 0:i?.selectionIdentity??(e==="h617a_painted"?"template:paint":void 0),this.name=i?.name??`New ${Ye(e)} effect`,this.content=i?.content??(e==="advanced"?Ki():he(e,this.customCatalogue)),this.savedBaseline=void 0,this.notice=this.applyAvailabilityNotice())}async selectItem(e,t){const i=t??this.beginEditorTransition();if(!this.api)return!1;try{const r=await this.api.item(e);return this.editorTransitionIsCurrent(i)?r.content.kind==="opaque"?(this.currentItem=r,this.customTemplateSelection=void 0,this.name=r.name,this.content=Cs(r.content),this.savedBaseline=void 0,this.notice="This effect definition is preserved, but this editor cannot change or apply it.",!0):Q(r.content)?(this.currentItem=r,this.customTemplateSelection=void 0,this.name=r.name,this.content=Xe(r.content),this.savedBaseline=F(r.name,r.content),this.notice=this.applyAvailabilityNotice(),!0):(this.notice="This item cannot be edited here.",!1):!1}catch(r){return this.editorTransitionIsCurrent(i)&&(this.notice=fe(r)),!1}}nameChanged(e){this.name=e.target.value}foregroundChanged(e){this.foreground=e.target.value,this.brushUsesBackground=!1}backgroundChanged(e){this.updateContent({background:Ae(e.target.value)})}effectChanged(e){this.updateContent({effect:e.target.value})}setSegmentColour(e){if(this.content.kind!=="h617a_painted")return;const t=et(this.content);t[e]=this.brushUsesBackground?[...this.content.background]:Ae(this.foreground),this.content={...this.content,groups:Bt(t,this.content.background)}}paintAll(){if(this.content.kind!=="h617a_painted")return;const e=this.brushUsesBackground?this.content.background:Ae(this.foreground);this.content={...this.content,groups:Bt(Array.from({length:Qe},()=>[...e]),this.content.background)}}resetPaint(){this.content.kind==="h617a_painted"&&(this.content={...this.content,groups:[]})}updateContent(e){this.content.kind==="h617a_painted"&&(this.content={...this.content,...e})}async save(){if(!this.api||!this.isAdmin||!this.dirty||this.saving||!Q(this.content))return;const e=this.api,t=this.name.trim();if(!t){this.notice="Give this effect a name before saving.";return}const i=this.beginEditorTransition(),r=this.currentItem,n=Xe(this.content),a=this.library.library_revision;this.saving=!0,this.notice=void 0;try{const d=r?await e.updateItem(r,t,n,a):await e.createItem(t,n,a);if(!Q(d.item.content))throw new Error("The saved effect returned an unsupported definition.");const c=d.item.content;d.library_revision>=this.library.library_revision&&(this.library={library_revision:d.library_revision,items:zt(this.library.items,d.item)}),this.editorTransitionIsCurrent(i)&&qt(this.currentItem,r)&&Q(this.content)&&F(this.name,this.content)===F(t,n)&&(this.currentItem=d.item,this.customTemplateSelection=void 0,this.name=d.item.name,this.content=Xe(c),this.savedBaseline=F(this.name,this.content)),this.editorTransitionIsCurrent(i)&&qt(this.currentItem,d.item)&&Q(this.content)&&F(this.name,this.content)===F(d.item.name,c)&&(this.notice="Saved.")}catch(d){if(Rs(d)==="conflict"){const c="This effect or library changed elsewhere. Reload before saving.";this.editorTransitionIsCurrent(i)&&(this.notice=c);try{const u=await e.library();u.library_revision>=this.library.library_revision&&(this.library=u)}catch(u){this.editorTransitionIsCurrent(i)&&(this.notice=`${c} Library refresh failed: `+fe(u))}}else this.editorTransitionIsCurrent(i)&&(this.notice=`Save failed: ${fe(d)}`)}finally{this.saving=!1}}async apply(){if(!this.api||!this.canApply||!T(this.content)||!this.selectedDeviceId)return;const e=this.name.trim(),t=this.selectedDeviceId,i=this.editorTransitionEpoch;this.activeOperationId=void 0,this.applying=!0,this.notice=void 0;try{const r=!this.dirty&&this.currentItem?await this.api.applySaved(t,this.currentItem):await this.api.applySnapshot(t,e,this.content);if(i!==this.editorTransitionEpoch||t!==this.selectedDeviceId)return;this.activeOperationId=r.operation_id,this.deployments=[r,...this.deployments.filter(n=>n.operation_id!==r.operation_id)]}catch(r){i===this.editorTransitionEpoch&&t===this.selectedDeviceId&&(this.notice=`Apply failed: ${fe(r)}`)}finally{this.applying=!1}}applyAvailabilityNotice(){if(!me(this.content))return this.selectedDeviceId&&!this.selectedDevice?"This device is temporarily unavailable in Home Assistant. Apply is disabled until it is loaded.":this.applyCapability==="supported"?void 0:`${Ye(this.content.kind)} effects cannot be applied to this device.`}latestDeployment(e){return[...this.deployments].filter(t=>t.config_entry_id===this.selectedDeviceId&&e.includes(t.phase)).sort((t,i)=>i.updated_at.localeCompare(t.updated_at))[0]}static{this.styles=V`
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

    .eyebrow {
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

    .studio.scenes-mode,
    .studio.custom-mode {
      grid-template-columns: 190px 190px 230px minmax(0, 1fr);
    }

    .primary-nav,
    .effect-categories,
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

    .effect-categories {
      overflow: auto;
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

    .library {
      overflow: auto;
      background: var(--primary-background-color);
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

    .card {
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

      .effect-categories {
        display: flex;
        gap: 6px;
        overflow-x: auto;
        padding: 12px 16px;
        border-inline-end: 0;
        border-bottom: 1px solid var(--studio-border);
      }

      .effect-categories .selector {
        flex: 0 0 auto;
        width: auto;
        white-space: nowrap;
      }

      .library {
        max-height: 340px;
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
        grid-template-columns: repeat(2, 1fr);
        padding: 10px 16px;
        border-inline-end: 0;
        border-bottom: 1px solid var(--studio-border);
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
  `}}_([y({attribute:!1})],$.prototype,"hass");_([y({attribute:!1})],$.prototype,"panel");_([h()],$.prototype,"loading");_([h()],$.prototype,"error");_([h()],$.prototype,"notice");_([h()],$.prototype,"devices");_([h()],$.prototype,"selectedDeviceId");_([h()],$.prototype,"section");_([h()],$.prototype,"customEffectCategory");_([h()],$.prototype,"customTemplateSelection");_([h()],$.prototype,"library");_([h()],$.prototype,"customCatalogue");_([h()],$.prototype,"currentItem");_([h()],$.prototype,"name");_([h()],$.prototype,"content");_([h()],$.prototype,"foreground");_([h()],$.prototype,"brushUsesBackground");_([h()],$.prototype,"saving");_([h()],$.prototype,"applying");_([h()],$.prototype,"deployments");_([h()],$.prototype,"activeOperationId");function De(){return{kind:"h617a_painted",effect:"clockwise",speed:50,brightness:100,background:[0,0,0],groups:[]}}function he(s,e){if(s==="h617a_painted")return De();const t=e.effects[0],i={family:t.family,variant:t.variant};return s==="h617a_single"?{kind:s,...i,speed:50,palette:Ot()}:{kind:s,effects:[i],speed:50,palette:Ot()}}function Is(s){return{...s,background:[...s.background],groups:s.groups.map(e=>({fill:[...e.fill],segments:[...e.segments]}))}}function hi(s){return s.kind==="h617a_painted"?Is(s):s.kind==="h617a_single"?{...s,palette:s.palette.map(e=>[...e])}:{...s,effects:s.effects.map(e=>({...e})),palette:s.palette.map(e=>[...e])}}function Xe(s){return s.kind==="advanced"?$e(s):s.kind==="scene_layered"?ut(s):hi(s)}function Cs(s){return{...s,body:structuredClone(s.body)}}function ut(s){return{...s,template:{...s.template},effect:{layers:$e({layers:s.effect.layers}).layers}}}function As(s){return s.kind==="advanced"?s:{kind:"advanced",layers:s.effect.layers}}function Ps(s,e){return s.kind==="advanced"?$e(e):{...ut(s),effect:{layers:$e(e).layers}}}function Ot(){return[[255,0,0],[255,127,0],[255,255,0],[0,255,0],[0,0,255],[0,255,255],[139,0,255]]}function et(s){const e=Array.from({length:Qe},()=>[...s.background]);for(const t of s.groups)for(const i of t.segments)e[i]=[...t.fill];return e}function Bt(s,e){const t=new Map;return s.forEach((i,r)=>{if(tt(i,e))return;const n=i.join(","),a=t.get(n);a?a.segments.push(r):t.set(n,{fill:[...i],segments:[r]})}),[...t.values()]}function Ls(s){const e=[];for(const t of et(s))if(!tt(t,s.background)&&!e.some(i=>tt(i,t))&&e.push([...t]),e.length===8)break;return e}function tt(s,e){return s[0]===e[0]&&s[1]===e[1]&&s[2]===e[2]}function Ut(s){return`#${s.map(e=>e.toString(16).padStart(2,"0")).join("")}`}function Ae(s){return[Number.parseInt(s.slice(1,3),16),Number.parseInt(s.slice(3,5),16),Number.parseInt(s.slice(5,7),16)]}function F(s,e){return JSON.stringify({name:s.trim(),content:e})}function ze(s){return s==="h617a_painted"||s==="h617a_single"||s==="h617a_multi"}function T(s){return typeof s=="object"&&s!==null&&"kind"in s&&ze(s.kind)}function Q(s){return T(s)||typeof s=="object"&&s!==null&&"kind"in s&&He(s.kind)}function He(s){return s==="advanced"||s==="scene_layered"}function me(s){return He(s.kind)}function Ts(s){return ze(s)||He(s)||s==="scene_builtin"||s==="scene_palette"}function Ye(s){switch(s){case"h617a_painted":return"Paint";case"h617a_single":return"Single";case"h617a_multi":return"Multi";case"advanced":return"Layered";default:return"Custom"}}function Ds(s,e){return s.localeCompare(e,"en-AU",{sensitivity:"base"})}function Ft(s){return ze(s)||He(s)||!Ts(s)}function Ns(s){return s==="h617a_multi"?"multi-layer":s==="h617a_painted"||s==="h617a_single"?"single-layer":"advanced"}function Ms(s){switch(s){case"single-layer":return"Single Layer";case"multi-layer":return"Multi Layer";case"advanced":return"Advanced"}}function qt(s,e){return s?.id===e?.id&&s?.revision===e?.revision}function zt(s,e){return[...s.filter(t=>t.id!==e.id),{id:e.id,revision:e.revision,name:e.name,kind:e.content.kind==="opaque"?e.content.source_kind:e.content.kind,..."template"in e.content?{template:e.content.template}:{}}].sort((t,i)=>t.name.localeCompare(i.name))}function fe(s){return s instanceof Error||typeof s=="object"&&s!==null&&"message"in s&&typeof s.message=="string"?s.message:"An unexpected error occurred."}function Rs(s){if(typeof s=="object"&&s!==null&&"code"in s&&typeof s.code=="string")return s.code}customElements.get("ha-govee-led-ble-editor")||customElements.define("ha-govee-led-ble-editor",$);
