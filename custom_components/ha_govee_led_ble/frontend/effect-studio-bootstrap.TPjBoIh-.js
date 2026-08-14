const Ae=globalThis,it=Ae.ShadowRoot&&(Ae.ShadyCSS===void 0||Ae.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,st=Symbol(),mt=new WeakMap;let Kt=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==st)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(it&&e===void 0){const i=t!==void 0&&t.length===1;i&&(e=mt.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&mt.set(t,e))}return e}toString(){return this.cssText}};const vi=s=>new Kt(typeof s=="string"?s:s+"",void 0,st),J=(s,...e)=>{const t=s.length===1?s[0]:e.reduce((i,r,n)=>i+(a=>{if(a._$cssResult$===!0)return a.cssText;if(typeof a=="number")return a;throw Error("Value passed to 'css' function must be a 'css' function result: "+a+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+s[n+1],s[0]);return new Kt(t,s,st)},yi=(s,e)=>{if(it)s.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const i=document.createElement("style"),r=Ae.litNonce;r!==void 0&&i.setAttribute("nonce",r),i.textContent=t.cssText,s.appendChild(i)}},ft=it?s=>s:s=>s instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return vi(t)})(s):s;const{is:$i,defineProperty:_i,getOwnPropertyDescriptor:xi,getOwnPropertyNames:wi,getOwnPropertySymbols:ki,getPrototypeOf:Si}=Object,Oe=globalThis,gt=Oe.trustedTypes,Ei=gt?gt.emptyScript:"",Ii=Oe.reactiveElementPolyfillSupport,ve=(s,e)=>s,De={toAttribute(s,e){switch(e){case Boolean:s=s?Ei:null;break;case Object:case Array:s=s==null?s:JSON.stringify(s)}return s},fromAttribute(s,e){let t=s;switch(e){case Boolean:t=s!==null;break;case Number:t=s===null?null:Number(s);break;case Object:case Array:try{t=JSON.parse(s)}catch{t=null}}return t}},rt=(s,e)=>!$i(s,e),bt={attribute:!0,type:String,converter:De,reflect:!1,useDefault:!1,hasChanged:rt};Symbol.metadata??=Symbol("metadata"),Oe.litPropertyMetadata??=new WeakMap;let ne=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=bt){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),r=this.getPropertyDescriptor(e,i,t);r!==void 0&&_i(this.prototype,e,r)}}static getPropertyDescriptor(e,t,i){const{get:r,set:n}=xi(this.prototype,e)??{get(){return this[t]},set(a){this[t]=a}};return{get:r,set(a){const d=r?.call(this);n?.call(this,a),this.requestUpdate(e,d,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??bt}static _$Ei(){if(this.hasOwnProperty(ve("elementProperties")))return;const e=Si(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(ve("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(ve("properties"))){const t=this.properties,i=[...wi(t),...ki(t)];for(const r of i)this.createProperty(r,t[r])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[i,r]of t)this.elementProperties.set(i,r)}this._$Eh=new Map;for(const[t,i]of this.elementProperties){const r=this._$Eu(t,i);r!==void 0&&this._$Eh.set(r,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const r of i)t.unshift(ft(r))}else e!==void 0&&t.push(ft(e));return t}static _$Eu(e,t){const i=t.attribute;return i===!1?void 0:typeof i=="string"?i:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return yi(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,i);if(r!==void 0&&i.reflect===!0){const n=(i.converter?.toAttribute!==void 0?i.converter:De).toAttribute(t,i.type);this._$Em=e,n==null?this.removeAttribute(r):this.setAttribute(r,n),this._$Em=null}}_$AK(e,t){const i=this.constructor,r=i._$Eh.get(e);if(r!==void 0&&this._$Em!==r){const n=i.getPropertyOptions(r),a=typeof n.converter=="function"?{fromAttribute:n.converter}:n.converter?.fromAttribute!==void 0?n.converter:De;this._$Em=r;const d=a.fromAttribute(t,n.type);this[r]=d??this._$Ej?.get(r)??d,this._$Em=null}}requestUpdate(e,t,i,r=!1,n){if(e!==void 0){const a=this.constructor;if(r===!1&&(n=this[e]),i??=a.getPropertyOptions(e),!((i.hasChanged??rt)(n,t)||i.useDefault&&i.reflect&&n===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,i))))return;this.C(e,t,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:r,wrapped:n},a){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),n!==!0||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),r===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[r,n]of this._$Ep)this[r]=n;this._$Ep=void 0}const i=this.constructor.elementProperties;if(i.size>0)for(const[r,n]of i){const{wrapped:a}=n,d=this[r];a!==!0||this._$AL.has(r)||d===void 0||this.C(r,void 0,n,d)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(i=>i.hostUpdate?.()),this.update(t)):this._$EM()}catch(i){throw e=!1,this._$EM(),i}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};ne.elementStyles=[],ne.shadowRootOptions={mode:"open"},ne[ve("elementProperties")]=new Map,ne[ve("finalized")]=new Map,Ii?.({ReactiveElement:ne}),(Oe.reactiveElementVersions??=[]).push("2.1.2");const nt=globalThis,vt=s=>s,Te=nt.trustedTypes,yt=Te?Te.createPolicy("lit-html",{createHTML:s=>s}):void 0,Yt="$lit$",U=`lit$${Math.random().toFixed(9).slice(2)}$`,Wt="?"+U,Ci=`<${Wt}>`,Y=document,ye=()=>Y.createComment(""),$e=s=>s===null||typeof s!="object"&&typeof s!="function",at=Array.isArray,Ai=s=>at(s)||typeof s?.[Symbol.iterator]=="function",He=`[ 	
\f\r]`,ue=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,$t=/-->/g,_t=/>/g,j=RegExp(`>|${He}(?:([^\\s"'>=/]+)(${He}*=${He}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),xt=/'/g,wt=/"/g,Jt=/^(?:script|style|textarea|title)$/i,Pi=s=>(e,...t)=>({_$litType$:s,strings:e,values:t}),o=Pi(1),ce=Symbol.for("lit-noChange"),c=Symbol.for("lit-nothing"),kt=new WeakMap,K=Y.createTreeWalker(Y,129);function Zt(s,e){if(!at(s)||!s.hasOwnProperty("raw"))throw Error("invalid template strings array");return yt!==void 0?yt.createHTML(e):e}const Li=(s,e)=>{const t=s.length-1,i=[];let r,n=e===2?"<svg>":e===3?"<math>":"",a=ue;for(let d=0;d<t;d++){const l=s[d];let u,f,y=-1,P=0;for(;P<l.length&&(a.lastIndex=P,f=a.exec(l),f!==null);)P=a.lastIndex,a===ue?f[1]==="!--"?a=$t:f[1]!==void 0?a=_t:f[2]!==void 0?(Jt.test(f[2])&&(r=RegExp("</"+f[2],"g")),a=j):f[3]!==void 0&&(a=j):a===j?f[0]===">"?(a=r??ue,y=-1):f[1]===void 0?y=-2:(y=a.lastIndex-f[2].length,u=f[1],a=f[3]===void 0?j:f[3]==='"'?wt:xt):a===wt||a===xt?a=j:a===$t||a===_t?a=ue:(a=j,r=void 0);const M=a===j&&s[d+1].startsWith("/>")?" ":"";n+=a===ue?l+Ci:y>=0?(i.push(u),l.slice(0,y)+Yt+l.slice(y)+U+M):l+U+(y===-2?d:M)}return[Zt(s,n+(s[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),i]};class _e{constructor({strings:e,_$litType$:t},i){let r;this.parts=[];let n=0,a=0;const d=e.length-1,l=this.parts,[u,f]=Li(e,t);if(this.el=_e.createElement(u,i),K.currentNode=this.el.content,t===2||t===3){const y=this.el.content.firstChild;y.replaceWith(...y.childNodes)}for(;(r=K.nextNode())!==null&&l.length<d;){if(r.nodeType===1){if(r.hasAttributes())for(const y of r.getAttributeNames())if(y.endsWith(Yt)){const P=f[a++],M=r.getAttribute(y).split(U),Ie=/([.?@])?(.*)/.exec(P);l.push({type:1,index:n,name:Ie[2],strings:M,ctor:Ie[1]==="."?Ti:Ie[1]==="?"?Ni:Ie[1]==="@"?Mi:Fe}),r.removeAttribute(y)}else y.startsWith(U)&&(l.push({type:6,index:n}),r.removeAttribute(y));if(Jt.test(r.tagName)){const y=r.textContent.split(U),P=y.length-1;if(P>0){r.textContent=Te?Te.emptyScript:"";for(let M=0;M<P;M++)r.append(y[M],ye()),K.nextNode(),l.push({type:2,index:++n});r.append(y[P],ye())}}}else if(r.nodeType===8)if(r.data===Wt)l.push({type:2,index:n});else{let y=-1;for(;(y=r.data.indexOf(U,y+1))!==-1;)l.push({type:7,index:n}),y+=U.length-1}n++}}static createElement(e,t){const i=Y.createElement("template");return i.innerHTML=e,i}}function pe(s,e,t=s,i){if(e===ce)return e;let r=i!==void 0?t._$Co?.[i]:t._$Cl;const n=$e(e)?void 0:e._$litDirective$;return r?.constructor!==n&&(r?._$AO?.(!1),n===void 0?r=void 0:(r=new n(s),r._$AT(s,t,i)),i!==void 0?(t._$Co??=[])[i]=r:t._$Cl=r),r!==void 0&&(e=pe(s,r._$AS(s,e.values),r,i)),e}class Di{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,r=(e?.creationScope??Y).importNode(t,!0);K.currentNode=r;let n=K.nextNode(),a=0,d=0,l=i[0];for(;l!==void 0;){if(a===l.index){let u;l.type===2?u=new Se(n,n.nextSibling,this,e):l.type===1?u=new l.ctor(n,l.name,l.strings,this,e):l.type===6&&(u=new Bi(n,this,e)),this._$AV.push(u),l=i[++d]}a!==l?.index&&(n=K.nextNode(),a++)}return K.currentNode=Y,r}p(e){let t=0;for(const i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class Se{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,r){this.type=2,this._$AH=c,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=pe(this,e,t),$e(e)?e===c||e==null||e===""?(this._$AH!==c&&this._$AR(),this._$AH=c):e!==this._$AH&&e!==ce&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Ai(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==c&&$e(this._$AH)?this._$AA.nextSibling.data=e:this.T(Y.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,r=typeof i=="number"?this._$AC(e):(i.el===void 0&&(i.el=_e.createElement(Zt(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===r)this._$AH.p(t);else{const n=new Di(r,this),a=n.u(this.options);n.p(t),this.T(a),this._$AH=n}}_$AC(e){let t=kt.get(e.strings);return t===void 0&&kt.set(e.strings,t=new _e(e)),t}k(e){at(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,r=0;for(const n of e)r===t.length?t.push(i=new Se(this.O(ye()),this.O(ye()),this,this.options)):i=t[r],i._$AI(n),r++;r<t.length&&(this._$AR(i&&i._$AB.nextSibling,r),t.length=r)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const i=vt(e).nextSibling;vt(e).remove(),e=i}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}}class Fe{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,r,n){this.type=1,this._$AH=c,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=n,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=c}_$AI(e,t=this,i,r){const n=this.strings;let a=!1;if(n===void 0)e=pe(this,e,t,0),a=!$e(e)||e!==this._$AH&&e!==ce,a&&(this._$AH=e);else{const d=e;let l,u;for(e=n[0],l=0;l<n.length-1;l++)u=pe(this,d[i+l],t,l),u===ce&&(u=this._$AH[l]),a||=!$e(u)||u!==this._$AH[l],u===c?e=c:e!==c&&(e+=(u??"")+n[l+1]),this._$AH[l]=u}a&&!r&&this.j(e)}j(e){e===c?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class Ti extends Fe{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===c?void 0:e}}class Ni extends Fe{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==c)}}class Mi extends Fe{constructor(e,t,i,r,n){super(e,t,i,r,n),this.type=5}_$AI(e,t=this){if((e=pe(this,e,t,0)??c)===ce)return;const i=this._$AH,r=e===c&&i!==c||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,n=e!==c&&(i===c||r);r&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class Bi{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){pe(this,e)}}const Ri=nt.litHtmlPolyfillSupport;Ri?.(_e,Se),(nt.litHtmlVersions??=[]).push("3.3.3");const Oi=(s,e,t)=>{const i=t?.renderBefore??e;let r=i._$litPart$;if(r===void 0){const n=t?.renderBefore??null;i._$litPart$=r=new Se(e.insertBefore(ye(),n),n,void 0,t??{})}return r._$AI(s),r};const ot=globalThis;class L extends ne{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Oi(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return ce}}L._$litElement$=!0,L.finalized=!0,ot.litElementHydrateSupport?.({LitElement:L});const Fi=ot.litElementPolyfillSupport;Fi?.({LitElement:L});(ot.litElementVersions??=[]).push("4.2.2");const Ui={attribute:!0,type:String,converter:De,reflect:!1,hasChanged:rt},qi=(s=Ui,e,t)=>{const{kind:i,metadata:r}=t;let n=globalThis.litPropertyMetadata.get(r);if(n===void 0&&globalThis.litPropertyMetadata.set(r,n=new Map),i==="setter"&&((s=Object.create(s)).wrapped=!0),n.set(t.name,s),i==="accessor"){const{name:a}=t;return{set(d){const l=e.get.call(this);e.set.call(this,d),this.requestUpdate(a,l,s,!0,d)},init(d){return d!==void 0&&this.C(a,void 0,s,d),d}}}if(i==="setter"){const{name:a}=t;return function(d){const l=this[a];e.call(this,d),this.requestUpdate(a,l,s,!0,d)}}throw Error("Unsupported decorator location: "+i)};function v(s){return(e,t)=>typeof t=="object"?qi(s,e,t):((i,r,n)=>{const a=r.hasOwnProperty(n);return r.constructor.createProperty(n,i),a?Object.getOwnPropertyDescriptor(r,n):void 0})(s,e,t)}function h(s){return v({...s,state:!0,attribute:!1})}var zi=Object.defineProperty,Z=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&zi(e,t,r),r};class H extends L{constructor(){super(...arguments),this.items=[],this.ariaLabel="Items",this.itemRole="button",this.addLabel="Add item",this.addDisabled=!1,this.reorderDisabled=!1,this.pointerX=0,this.pointerY=0,this.pointerMoved=!1,this.suppressClick=!1}render(){const e=this.itemRole==="tab";return o`
      <ul
        class="item-list"
        aria-label=${this.ariaLabel}
        role=${e?"tablist":c}
      >
        ${this.items.map((t,i)=>o`
            <li
              class="item-wrapper"
              role=${e?"presentation":c}
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
                id=${t.id??c}
                class="item ${t.colour?"colour":"label"} ${i===this.activeIndex?"selected":""} ${t.removeReady?"remove-ready":""}"
                type="button"
                role=${e?"tab":c}
                aria-label=${t.ariaLabel}
                aria-selected=${e?String(i===this.activeIndex):c}
                aria-controls=${t.ariaControls??c}
                tabindex=${e?i===this.activeIndex?"0":"-1":c}
                style=${t.colour?`--item-colour: ${t.colour}`:c}
                ?disabled=${t.disabled}
                @click=${()=>this.itemClicked(i)}
                @keydown=${r=>this.keyPressed(i,r)}
              >
                ${t.colour?c:t.label}
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
    `}focusItem(e){this.updateComplete.then(()=>{this.shadowRoot?.querySelectorAll(".item")[e]?.focus()})}itemClicked(e){if(this.suppressClick){this.suppressClick=!1;return}this.dispatchEvent(new CustomEvent("item-selected",{detail:{index:e},bubbles:!0,composed:!0}))}addClicked(){this.dispatchEvent(new CustomEvent("item-added",{bubbles:!0,composed:!0}))}dragStarted(e,t){this.reorderDisabled||(this.draggedIndex=e,t.dataTransfer?.setData("text/plain",String(e)))}dropped(e,t){t.preventDefault(),this.draggedIndex!==void 0&&(this.reorder(this.draggedIndex,e),this.draggedIndex=void 0)}keyPressed(e,t){if(t.key!=="ArrowLeft"&&t.key!=="ArrowRight")return;t.preventDefault();const i=e+(t.key==="ArrowLeft"?-1:1);if(!(i<0||i>=this.items.length)){if(this.reorderDisabled){this.itemRole==="tab"&&(this.itemClicked(i),this.focusItem(i));return}this.reorder(e,i,!0)}}pointerStarted(e,t){this.reorderDisabled||t.pointerType==="mouse"||t.target.closest(".strip-popover")||(this.pointerId=t.pointerId,this.pointerIndex=e,this.pointerX=t.clientX,this.pointerY=t.clientY,this.pointerMoved=!1,t.currentTarget.setPointerCapture(t.pointerId))}pointerMovedOver(e){if(e.pointerId!==this.pointerId||this.pointerIndex===void 0)return;const t=e.clientX-this.pointerX,i=e.clientY-this.pointerY;if(!this.pointerMoved){if(Math.abs(i)>Math.abs(t)||Math.abs(t)<10)return;this.pointerMoved=!0}e.preventDefault();const r=this.shadowRoot?.elementFromPoint(e.clientX,e.clientY)?.closest("[data-item-index]"),n=Number(r?.dataset.itemIndex);!Number.isInteger(n)||n===this.pointerIndex||(this.reorder(this.pointerIndex,n),this.pointerIndex=n)}pointerFinished(e){if(e.pointerId!==this.pointerId)return;const t=e.currentTarget;t.hasPointerCapture(e.pointerId)&&t.releasePointerCapture(e.pointerId),this.suppressClick=this.pointerMoved,this.pointerId=void 0,this.pointerIndex=void 0,this.pointerMoved=!1}reorder(e,t,i=!1){this.reorderDisabled||e===t||(this.dispatchEvent(new CustomEvent("items-reordered",{detail:{from:e,to:t},bubbles:!0,composed:!0})),i&&this.focusItem(t))}static{this.styles=J`
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
  `}}Z([v({attribute:!1})],H.prototype,"items");Z([v({attribute:!1})],H.prototype,"activeIndex");Z([v()],H.prototype,"ariaLabel");Z([v()],H.prototype,"itemRole");Z([v()],H.prototype,"addLabel");Z([v({type:Boolean})],H.prototype,"addDisabled");Z([v({type:Boolean})],H.prototype,"reorderDisabled");customElements.get("govee-reorderable-strip")||customElements.define("govee-reorderable-strip",H);var Hi=Object.defineProperty,N=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&Hi(e,t,r),r};const We=17,Qt="ha_govee_led_ble/effect_studio/recent_colours",Pe=[[255,69,58],[255,159,10],[255,214,10],[48,209,88],[99,230,226],[100,210,255],[10,132,255],[94,92,230],[191,90,242],[255,45,85],[172,142,104],[255,255,255],[174,174,178],[99,99,102],[28,28,30],[255,127,0],[139,0,255]];let de=Vi();class T extends L{constructor(){super(...arguments),this.palette=[],this.minColours=1,this.maxColours=8,this.disabled=!1,this.persistentPicker=!1,this.ariaLabel="Colours",this.itemName="colour",this.windowPointerDown=e=>{this.editingIndex!==void 0&&!e.composedPath().includes(this)&&(this.editingIndex=void 0)}}connectedCallback(){super.connectedCallback(),window.addEventListener("pointerdown",this.windowPointerDown)}disconnectedCallback(){window.removeEventListener("pointerdown",this.windowPointerDown),super.disconnectedCallback()}willUpdate(e){e.has("palette")&&this.editingIndex!==void 0&&this.editingIndex>=this.palette.length&&(this.editingIndex=void 0)}render(){const e=this.persistentPicker?this.selectedIndex:this.editingIndex,t=this.palette.map((i,r)=>({key:`${r}-${x(i)}`,label:`${St(this.itemName)} ${r+1}`,ariaLabel:this.itemAriaLabel(i,r),colour:x(i),removeReady:!this.persistentPicker&&this.editingIndex===r&&this.palette.length>this.minColours,disabled:this.disabled}));return o`
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
        ${this.persistentPicker||this.editingIndex===void 0?c:o`
              <div
                slot="item-${this.editingIndex}"
                class="strip-popover colour-popover"
                role="dialog"
                aria-label="Edit colour"
                @keydown=${i=>this.popoverKeyPressed(this.editingIndex,i)}
              >
                ${this.renderPopover(this.editingIndex,this.palette[this.editingIndex])}
              </div>
            `}
      </govee-reorderable-strip>
      ${this.persistentPicker&&e!==void 0?o`
            <div
              class="persistent-picker"
              role="group"
              aria-label="Edit ${this.itemName} ${e+1}"
            >
              ${this.renderPopover(e,this.palette[e])}
            </div>
          `:c}
    `}itemAriaLabel(e,t){const i=`${St(this.itemName)} ${t+1}`;return this.persistentPicker?`${i}, ${x(e)}${t===this.selectedIndex?", selected":""}`:this.editingIndex===t&&this.palette.length>this.minColours?`Remove colour ${t+1}`:`Edit colour ${t+1}, ${x(e)}. Drag to reorder or use arrow keys.`}renderPopover(e,t){return o`
      <div class="preset-grid">
        ${de.map(i=>o`
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
            @input=${i=>this.updateColour(e,It(i.target.value))}
            @change=${i=>this.commitColour(e,It(i.target.value))}
          />
        </label>
      </div>
    `}commitColour(e,t){ji(t),this.updateColour(e,t),!this.persistentPicker&&(this.editingIndex=void 0,this.focusSwatchAfterUpdate(e))}updateColour(e,t){const i=le(this.palette);i[e]=[...t],this.emitPalette(i)}addColour(){if(this.disabled||this.palette.length>=this.maxColours)return;const e=this.palette[this.palette.length-1]??de[this.palette.length%de.length],t=[...le(this.palette),[...e]],i=t.length-1;this.persistentPicker?this.selectColour(i,t[i]):this.editingIndex=i,this.emitPalette(t)}removeColour(e){if(this.disabled||this.palette.length<=this.minColours)return;const t=this.palette.filter((r,n)=>n!==e).map(r=>[...r]),i=Math.min(e,t.length-1);this.editingIndex=void 0,this.emitPalette(t),this.focusSwatchAfterUpdate(i)}reorder(e,t){if(this.disabled||e===t)return;const i=le(this.palette),[r]=i.splice(e,1);if(i.splice(t,0,r),this.editingIndex=this.editingIndex===e?t:Et(this.editingIndex,e,t),this.persistentPicker){const n=Et(this.selectedIndex,e,t);n!==void 0&&this.selectColour(n,i[n])}this.emitPalette(i)}focusSwatchAfterUpdate(e){this.updateComplete.then(()=>{this.shadowRoot?.querySelector("govee-reorderable-strip")?.focusItem(e)})}popoverKeyPressed(e,t){t.key==="Escape"&&(t.preventDefault(),t.stopPropagation(),this.editingIndex=void 0,this.focusSwatchAfterUpdate(e))}swatchClicked(e){if(this.persistentPicker){this.selectColour(e,this.palette[e]);return}if(this.editingIndex===e&&this.palette.length>this.minColours){this.removeColour(e);return}this.editingIndex=this.editingIndex===e?void 0:e}selectColour(e,t){this.selectedIndex=e,this.dispatchEvent(new CustomEvent("colour-selected",{detail:{index:e,colour:[...t]},bubbles:!0,composed:!0}))}emitPalette(e){this.palette=e,this.dispatchEvent(new CustomEvent("palette-changed",{detail:{palette:e},bubbles:!0,composed:!0}))}static{this.styles=J`
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

    .persistent-picker {
      margin-top: 14px;
      padding-top: 14px;
      border-top: 1px solid var(--studio-border);
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

  `}}N([v({attribute:!1})],T.prototype,"palette");N([v({type:Number})],T.prototype,"minColours");N([v({type:Number})],T.prototype,"maxColours");N([v({type:Boolean})],T.prototype,"disabled");N([v({type:Boolean})],T.prototype,"persistentPicker");N([v({type:Number})],T.prototype,"selectedIndex");N([v()],T.prototype,"ariaLabel");N([v()],T.prototype,"itemName");N([h()],T.prototype,"editingIndex");function le(s){return s.map(e=>[...e])}function St(s){return s.charAt(0).toUpperCase()+s.slice(1)}function Vi(){const s=localStorage.getItem(Qt);if(!s)return le(Pe);let e;try{e=JSON.parse(s)}catch(i){if(i instanceof SyntaxError)return le(Pe);throw i}if(!Array.isArray(e))return le(Pe);const t=e.filter(Gi).map(i=>[...i]).slice(0,We);return ei(t)}function ji(s){const e=x(s);de=ei([[...s],...de.filter(t=>x(t)!==e)]),localStorage.setItem(Qt,JSON.stringify(de))}function ei(s){const e=s.map(t=>[...t]);for(const t of Pe)e.length>=We||e.some(i=>x(i)===x(t))||e.push([...t]);return e.slice(0,We)}function Gi(s){return Array.isArray(s)&&s.length===3&&s.every(e=>Number.isInteger(e)&&e>=0&&e<=255)}function Et(s,e,t){return s===void 0||e===t?s:s===e?t:e<t&&s>e&&s<=t?s-1:t<e&&s>=t&&s<e?s+1:s}function x(s){return`#${s.map(e=>e.toString(16).padStart(2,"0")).join("")}`}function It(s){return[Number.parseInt(s.slice(1,3),16),Number.parseInt(s.slice(3,5),16),Number.parseInt(s.slice(5,7),16)]}customElements.get("govee-palette-editor")||customElements.define("govee-palette-editor",T);var Xi=Object.defineProperty,Q=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&Xi(e,t,r),r};const se=5,Ct=8,At=15,ti=[1,2,0,3],ii=[0,1,2,3],Ki={0:"Segment",1:"Continuous",2:"Random",3:"Custom"},Yi={0:"Brightest to darkest",1:"Brightest, darkest, brightest",2:"Darkest to brightest",3:"Darkest, brightest, darkest"},Pt={0:"Forward",1:"Backward",2:"Forward and back",3:"Back and forward"};class V extends L{constructor(){super(...arguments),this.disabled=!1,this.segmentCount=At,this.activeLayerIndex=0,this.activePatternIndex=0,this.movementAnnouncement=""}willUpdate(e){if(!(!e.has("content")||!this.content)){if(this.content.layers.length===0){this.activeLayerIndex=0,this.activePatternIndex=0;return}if(this.activeLayerIndex=A(this.activeLayerIndex,0,this.content.layers.length-1),this.activeLayer.brightness_patterns.length===0){this.activePatternIndex=0;return}this.activePatternIndex=A(this.activePatternIndex,0,this.activeLayer.brightness_patterns.length-1)}}render(){if(!this.content)return c;if(this.content.layers.length===0)return this.renderEmptyLayers();const e=this.activeLayer,t=this.content.layers.map((i,r)=>({key:`layer-${r}`,label:`Layer ${r+1}`,ariaLabel:`Layer ${r+1}. Drag to reorder or use arrow keys.`,id:`advanced-layer-tab-${r}`,ariaControls:"advanced-layer-panel"}));return o`
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
          .addDisabled=${this.disabled||this.content.layers.length>=se}
          .reorderDisabled=${this.disabled}
          @item-selected=${i=>this.selectLayer(i.detail.index)}
          @items-reordered=${i=>this.reorderLayer(i.detail.from,i.detail.to)}
          @item-added=${this.addLayer}
        >
          ${this.layerActionsIndex===void 0?c:o`
                <div
                  slot="item-${this.layerActionsIndex}"
                  class="strip-popover layer-actions-popover"
                  role="dialog"
                  aria-label="Layer actions"
                >
                  <button
                    class="secondary"
                    type="button"
                    ?disabled=${this.disabled||this.content.layers.length>=se}
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

        ${this.content.layers.length>=se?o`
              <p class="limit-note">
                ${this.content.layers.length>se?`This loaded effect has ${this.content.layers.length} layers. All are preserved, but adding and copying are unavailable while five or more remain.`:"Advanced effects can author up to five layers."}
              </p>
            `:c}
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
    `}get activeLayer(){return this.content.layers[this.activeLayerIndex]}renderAppliedArea(e){const t=e.area.start_tenths>=0&&e.area.start_tenths<=9&&e.area.width_tenths>=1&&e.area.width_tenths<=10-e.area.start_tenths,i=A(e.area.start_tenths,0,9),r=i+e.area.width_tenths,n=Number.isInteger(this.segmentCount)&&this.segmentCount>0?this.segmentCount:At,a=x(e.palette[0]??[47,111,237]);return o`
      <section class="card wide-card">
        <h3>Applied area</h3>
        <div class="area-control">
          <div
            class="area-track"
            style="--area-segment-count: ${n}; --area-colour: ${a};"
          >
            <div
              class="area-segments"
              aria-label="Applied area, ${n} segments"
            >
              ${Array.from({length:n},(d,l)=>o`
                  <span
                    class=${t&&Qi(l,n,i,r)?"covered":""}
                    aria-hidden="true"
                  ></span>
                `)}
            </div>
            ${t?o`
                  <div
                    class="area-selection"
                    style="--area-start: ${i*10}%; --area-width: ${(r-i)*10}%"
                  >
                    <button
                      class="area-handle area-handle-start"
                      type="button"
                      role="slider"
                      aria-label="Applied area start"
                      aria-orientation="horizontal"
                      aria-valuemin="0"
                      aria-valuemax=${r-1}
                      aria-valuenow=${i}
                      aria-valuetext="${i*10}%"
                      ?disabled=${this.disabled}
                      @pointerdown=${d=>this.areaPointerStarted("start",i,r,d)}
                      @pointermove=${this.areaPointerMoved}
                      @pointerup=${this.areaPointerFinished}
                      @pointercancel=${this.areaPointerFinished}
                      @lostpointercapture=${this.areaPointerFinished}
                      @keydown=${d=>this.areaBoundaryKeyDown("start",i,r,d)}
                    >
                      <span aria-hidden="true"></span>
                    </button>
                    <button
                      class="area-selection-body"
                      type="button"
                      aria-label="Move applied area, ${i*10}% to ${r*10}%"
                      ?disabled=${this.disabled}
                      @pointerdown=${d=>this.areaPointerStarted("move",i,r,d)}
                      @pointermove=${this.areaPointerMoved}
                      @pointerup=${this.areaPointerFinished}
                      @pointercancel=${this.areaPointerFinished}
                      @lostpointercapture=${this.areaPointerFinished}
                      @keydown=${d=>this.areaPositionKeyDown(i,r,d)}
                    ></button>
                    <button
                      class="area-handle area-handle-end"
                      type="button"
                      role="slider"
                      aria-label="Applied area end"
                      aria-orientation="horizontal"
                      aria-valuemin=${i+1}
                      aria-valuemax="10"
                      aria-valuenow=${r}
                      aria-valuetext="${r*10}%"
                      ?disabled=${this.disabled}
                      @pointerdown=${d=>this.areaPointerStarted("end",i,r,d)}
                      @pointermove=${this.areaPointerMoved}
                      @pointerup=${this.areaPointerFinished}
                      @pointercancel=${this.areaPointerFinished}
                      @lostpointercapture=${this.areaPointerFinished}
                      @keydown=${d=>this.areaBoundaryKeyDown("end",i,r,d)}
                    >
                      <span aria-hidden="true"></span>
                    </button>
                  </div>
                `:c}
          </div>
        </div>
        ${t?c:o`
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
    `}areaPointerStarted(e,t,i,r){if(this.disabled)return;const n=this.shadowRoot?.querySelector(".area-track");if(!n)return;const a=n.getBoundingClientRect();if(a.width<=0)return;const d=r.currentTarget,l=e==="start"?t:e==="end"?i:t;r.preventDefault(),r.stopPropagation(),d.focus(),d.setPointerCapture(r.pointerId),this.areaDrag={pointerId:r.pointerId,mode:e,initialStart:t,initialEnd:i,currentStart:t,currentEnd:i,originX:r.clientX,pointerOffsetX:e==="move"?0:r.clientX-(a.left+l/10*a.width),trackLeft:a.left,trackWidth:a.width,captureTarget:d}}areaPointerMoved(e){const t=this.areaDrag;if(!t||t.pointerId!==e.pointerId)return;e.preventDefault();let i=t.initialStart,r=t.initialEnd;if(t.mode==="move"){const n=t.initialEnd-t.initialStart,a=Math.round((e.clientX-t.originX)/t.trackWidth*10);i=A(t.initialStart+a,0,10-n),r=i+n}else{const n=Math.round((e.clientX-t.pointerOffsetX-t.trackLeft)/t.trackWidth*10);t.mode==="start"?i=A(n,0,t.initialEnd-1):r=A(n,t.initialStart+1,10)}i===t.currentStart&&r===t.currentEnd||(t.currentStart=i,t.currentEnd=r,this.setAppliedArea(i,r))}areaPointerFinished(e){const t=this.areaDrag;!t||t.pointerId!==e.pointerId||(t.captureTarget.hasPointerCapture(e.pointerId)&&t.captureTarget.releasePointerCapture(e.pointerId),this.areaDrag=void 0)}areaBoundaryKeyDown(e,t,i,r){const n=e==="start"?0:t+1,a=e==="start"?i-1:10,d=e==="start"?t:i,l=Nt(r.key,d,n,a);l!==void 0&&(r.preventDefault(),this.setAppliedArea(e==="start"?l:t,e==="end"?l:i))}areaPositionKeyDown(e,t,i){const r=t-e,n=Nt(i.key,e,0,10-r);n!==void 0&&(i.preventDefault(),this.setAppliedArea(n,n+r))}setAppliedArea(e,t){this.updateLayer({area:{start_tenths:e,width_tenths:t-e}})}renderSelectionControls(e){const t=e.selection,i=Wi(t.type);return o`
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
            ${ti.map(r=>o`<option
                  value=${r}
                  .selected=${t.type===r}
                >
                  ${Ki[r]}
                </option>`)}
            ${i?c:o`
                  <option value=${t.type} .selected=${!0}>
                    Raw type ${t.type} (0x${Ce(t.type)})
                  </option>
                `}
          </select>
        </label>
        ${i?c:o`
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
          .maxColours=${Ct}
          .disabled=${this.disabled}
          @palette-changed=${t=>this.updateLayer({palette:t.detail.palette.map(i=>[...i])})}
        ></govee-palette-editor>
        ${e.palette.length>Ct?o`
              <p class="muted">
                All ${e.palette.length} loaded colours are preserved.
                Adding remains unavailable until fewer than eight remain.
              </p>
            `:c}
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
            ${t>2?o`<option value=${t}>Raw method ${t}</option>`:c}
          </select>
        </label>
        ${t>2?this.numberField("Method (raw 7-bit value)",t,0,127,i=>this.updateLayer({distribution:{...e.distribution,method:i}})):c}
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
            `:c}
        ${this.rangeField("Colour speed",e.colour_speed,0,255,he(e.colour_speed),i=>this.updateLayer({colour_speed:i}))}
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
      `;const t=A(this.activePatternIndex,0,e.brightness_patterns.length-1),i=e.brightness_patterns[t],r=Ji(i.order);return o`
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
              ${ii.map(n=>o`<option value=${n}>
                    ${Yi[n]}
                  </option>`)}
              ${r?c:o`
                    <option value=${i.order} .selected=${!0}>
                      Raw order ${i.order} (0x${Ce(i.order)})
                    </option>
                  `}
            </select>
          </label>
          ${r?c:o`
                <p class="muted raw-value-note">
                  Brightness order ${i.order} is not defined by the
                  known schema. Its raw value remains preserved.
                </p>
                ${this.byteNumberField("Order (raw byte)",i.order,n=>this.updateBrightnessPattern({order:n}))}
              `}
          ${this.rangeField("Scope low",i.scope_low,0,255,he(i.scope_low),n=>this.updateBrightnessPattern({scope_low:n}))}
          ${this.rangeField("Scope high",i.scope_high,0,255,he(i.scope_high),n=>this.updateBrightnessPattern({scope_high:n}))}
          ${this.rangeField("Changing speed",i.change_speed,0,255,he(i.change_speed),n=>this.updateBrightnessPattern({change_speed:n}))}
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
                  @change=${n=>{const a=Number(n.target.value);this.updateMovement(t,{direction:a},`${i} direction ${Pt[a]}.`)}}
                >
                  ${Object.entries(Pt).map(([n,a])=>o`<option value=${n}>${a}</option>`)}
                </select>
              </label>
              ${this.rangeField("Speed",r.speed,0,255,he(r.speed),n=>this.updateMovement(t,{speed:n},`${i} speed ${ni(n)} per cent.`))}
              <label class="check-field">
                <input
                  type="checkbox"
                  .checked=${r.enter_exit}
                  ?disabled=${this.disabled}
                  @change=${n=>{const a=n.target.checked;this.updateMovement(t,{enter_exit:a},`${i} enter and exit ${a?"enabled":"disabled"}.`)}}
                />
                <span>Enter and exit</span>
              </label>
            `:c}
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
              ${e.priority>5?this.byteNumberField("Priority (raw byte)",e.priority,i=>this.updateLayer({priority:i})):c}
            `:c}
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
          .value=${String(A(t,i,r))}
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
          @change=${a=>n(A(Number(a.target.value),i,r))}
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
          @change=${n=>{const a=n.target,d=Zi(a.value);if(d===void 0){a.setCustomValidity("Enter one byte from 00 to FF."),a.reportValidity();return}if((d&~r)!==0){a.setCustomValidity(`Known flag bits are controlled elsewhere. Allowed mask: ${Ce(r)}.`),a.reportValidity();return}a.setCustomValidity(""),i(d)}}
        />
      </label>
    `}updateLayer(e){if(!this.content||this.disabled)return;const t=this.content.layers.map((i,r)=>r===this.activeLayerIndex?R({...i,...e}):R(i));this.emitContent({kind:"advanced",layers:t})}updateSelection(e){this.updateLayer({selection:{...this.activeLayer.selection,...e}})}updateBrightnessPattern(e){const t=this.activeLayer.brightness_patterns.map((i,r)=>r===this.activePatternIndex?{...i,...e}:{...i});this.updateLayer({brightness_patterns:t})}updateMovement(e,t,i){this.updateLayer({[e]:{...this.activeLayer[e],...t}}),i&&(this.movementAnnouncement=i)}addLayer(){if(!this.content||this.disabled||this.content.layers.length>=se)return;const e=[...this.content.layers.map(R),si()];this.installContent({kind:"advanced",layers:e}),this.activeLayerIndex=e.length-1,this.activePatternIndex=0,this.layerActionsIndex=void 0,this.focusActiveTab()}copyLayer(){if(!this.content||this.disabled||this.content.layers.length>=se)return;const e=this.content.layers.map(R);e.splice(this.activeLayerIndex+1,0,R(this.activeLayer)),this.installContent({kind:"advanced",layers:e}),this.activeLayerIndex+=1,this.activePatternIndex=0,this.layerActionsIndex=this.activeLayerIndex,this.focusActiveTab()}deleteLayer(){if(!this.content||this.disabled||this.content.layers.length===1)return;const e=this.content.layers.filter((t,i)=>i!==this.activeLayerIndex).map(R);this.activeLayerIndex=Math.min(this.activeLayerIndex,e.length-1),this.activePatternIndex=0,this.layerActionsIndex=void 0,this.emitContent({kind:"advanced",layers:e}),this.focusActiveTab()}reorderLayer(e,t){if(!this.content||this.disabled||e<0||e>=this.content.layers.length||t<0||t>=this.content.layers.length||e===t)return;const i=this.content.layers.map(R),[r]=i.splice(e,1);i.splice(t,0,r),this.activeLayerIndex=Lt(this.activeLayerIndex,e,t),this.layerActionsIndex!==void 0&&(this.layerActionsIndex=Lt(this.layerActionsIndex,e,t)),this.emitContent({kind:"advanced",layers:i})}addBrightnessPattern(){if(this.disabled||this.activeLayer.brightness_patterns.length>=3)return;const e=[...this.activeLayer.brightness_patterns.map(t=>({...t})),ri()];this.activePatternIndex=e.length-1,this.updateLayer({brightness_patterns:e})}deleteBrightnessPattern(){if(this.disabled||this.activeLayer.brightness_patterns.length===1)return;const e=this.activeLayer.brightness_patterns.filter((t,i)=>i!==this.activePatternIndex).map(t=>({...t}));this.activePatternIndex=Math.min(this.activePatternIndex,e.length-1),this.updateLayer({brightness_patterns:e})}selectLayer(e){if(e===this.activeLayerIndex){this.layerActionsIndex=this.layerActionsIndex===e?void 0:e;return}this.activeLayerIndex=e,this.activePatternIndex=0,this.layerActionsIndex=e}patternTabKeyPressed(e,t){const i=this.activeLayer.brightness_patterns.length;let r;t.key==="ArrowLeft"?r=e===0?i-1:e-1:t.key==="ArrowRight"?r=e===i-1?0:e+1:t.key==="Home"?r=0:t.key==="End"&&(r=i-1),r!==void 0&&(t.preventDefault(),this.activePatternIndex=r,this.updateComplete.then(()=>{this.shadowRoot?.querySelectorAll(".pattern-tabs button")[r]?.focus()}))}focusActiveTab(){this.updateComplete.then(()=>{this.shadowRoot?.querySelector("govee-reorderable-strip")?.focusItem(this.activeLayerIndex)})}excessChanged(e){const t=e.value.replace(/\s+/g,"").toLowerCase();if(!/^(?:[0-9a-f]{2})*$/.test(t)){e.setCustomValidity("Enter an even number of hexadecimal digits."),e.reportValidity();return}e.setCustomValidity(""),this.updateLayer({excess:t})}emitContent(e){this.dispatchEvent(new CustomEvent("content-changed",{detail:{content:e},bubbles:!0,composed:!0}))}installContent(e){this.content=e,this.emitContent(e)}static{this.styles=J`
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
      --area-trim: var(--warning-color, #f4c542);
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
  `}}Q([v({attribute:!1})],V.prototype,"content");Q([v({type:Boolean})],V.prototype,"disabled");Q([v({type:Number})],V.prototype,"segmentCount");Q([h()],V.prototype,"activeLayerIndex");Q([h()],V.prototype,"activePatternIndex");Q([h()],V.prototype,"movementAnnouncement");Q([h()],V.prototype,"layerActionsIndex");function Lt(s,e,t){return s===e?t:e<t&&s>e&&s<=t?s-1:t<e&&s>=t&&s<e?s+1:s}function Dt(){return{kind:"advanced",layers:[si()]}}function xe(s){return{kind:"advanced",layers:s.layers.map(R)}}function si(){return{area:{start_tenths:0,width_tenths:10},selection:{type:0,param_1:0,param_2:1},brightness_gradient:!1,brightness_patterns:[ri()],distribution:{method:1,backwards:!1},colour_speed:128,colour_retention:20,palette:[[255,0,0],[0,0,255]],selected_movement:Tt(),overall_movement:Tt(),priority:0,unknown_flags:0,excess:""}}function ri(){return{scope_high:255,scope_low:0,order:0,change_speed:128,brightest_retention:20,darkest_retention:20}}function Tt(){return{enabled:!1,enter_exit:!1,direction:0,distance:1,speed:128,unknown_flags:0}}function R(s){return{...s,area:{...s.area},selection:{...s.selection},brightness_patterns:s.brightness_patterns.map(e=>({...e})),distribution:{...s.distribution},palette:s.palette.map(e=>[...e]),selected_movement:{...s.selected_movement},overall_movement:{...s.overall_movement}}}function Wi(s){return ti.includes(s)}function Ji(s){return ii.includes(s)}function ni(s){return Math.round(A(s,0,255)/255*100)}function he(s){return`${ni(s)}% · ${s}`}function Ce(s){return s.toString(16).padStart(2,"0").toUpperCase()}function Zi(s){const e=s.trim().replace(/^0x/i,"");if(/^[0-9a-f]{1,2}$/i.test(e))return Number.parseInt(e,16)}function Qi(s,e,t,i){const r=s*10/e;return(s+1)*10/e>t&&r<i}function Nt(s,e,t,i){if(s==="Home")return t;if(s==="End")return i;if(s==="ArrowLeft"||s==="ArrowDown")return A(e-1,t,i);if(s==="ArrowRight"||s==="ArrowUp")return A(e+1,t,i)}function A(s,e,t){return Math.min(t,Math.max(e,Math.round(s)))}customElements.get("govee-advanced-effect-editor")||customElements.define("govee-advanced-effect-editor",V);const es=1,ai=1,ts=1,D=128,ee=65536,oi=512,di=256,li=32,ci=128,pi=512,w=255,is=64,ss=262144,Mt=16,rs=4096,ns=16384,q=1024,Ve=16384,dt=Number.MAX_SAFE_INTEGER,as=4335,os=232,ds=253;function ls(s){const e=m(s,"editor info"),t=m(e.limits,"editor limits");return{api_version:p(e.api_version,"API version",1),effect_schema_version:p(e.effect_schema_version,"effect schema version",1),compiler_version:p(e.compiler_version,"compiler version",1),limits:{effect_name:O(t.effect_name,D,"effect-name limit"),effect_document_bytes:O(t.effect_document_bytes,ee,"effect-document limit"),devices:O(t.devices,oi,"device limit"),library_items:O(t.library_items,di,"library-item limit"),drafts_per_owner:O(t.drafts_per_owner,li,"draft limit"),deployment_records:O(t.deployment_records,ci,"deployment limit"),scene_catalogue_entries:O(t.scene_catalogue_entries,pi,"scene catalogue limit")}}}function cs(s){const e=k(s,"devices",oi).map((t,i)=>{const r=m(t,`devices[${i}]`),n=m(r.custom_effects,`devices[${i}].custom_effects`);return{config_entry_id:b(r.config_entry_id,`devices[${i}].config_entry_id`,w),model:b(r.model,`devices[${i}].model`,w),display_name:b(r.display_name,`devices[${i}].display_name`,w),segment_count:p(r.segment_count,`devices[${i}].segment_count`,0,65535),custom_effects:{painted:oe(n.painted,"painted capability"),single:oe(n.single,"single capability"),multi:oe(n.multi,"multi capability"),advanced:oe(n.advanced,"advanced capability")},readback:b(r.readback,`devices[${i}].readback`,w)}});return Ue(e,t=>t.config_entry_id,"device IDs"),e}function ps(s){ie(s,"custom-effect catalogue",ee);const e=m(s,"custom-effect catalogue"),t=m(e.limits,"custom-effect limits"),i=m(e.apply,"custom-effect Apply capabilities");return{schema_version:p(e.schema_version,"catalogue schema",1),sku:te(e.sku,"catalogue SKU"),painted_effects:k(e.painted_effects,"painted-effect templates",q).map((r,n)=>{const a=m(r,`painted-effect templates[${n}]`);return{id:Qe(a.id,["cycle","clockwise","counter_clockwise","twinkle","gradient","breathe"],"painted-effect ID"),label:b(a.label,"painted-effect label",D)}}),effects:k(e.effects,"custom-effect templates",q).map((r,n)=>{const a=m(r,`custom-effect templates[${n}]`),d=k(a.variations,"template variations",q);if(d.length===0)throw new Error("Malformed Effect Studio server payload: custom-effect template has no variations.");return{id:b(a.id,"template ID",w),label:b(a.label,"template label",D),family:p(a.family,"template family",0,255),variations:d.map((l,u)=>{const f=m(l,`custom-effect templates[${n}].variations[${u}]`);return{id:b(f.id,"variation ID",w),label:b(f.label,"variation label",D),variant:p(f.variant,"template variant",0,255)}}),supports_multi:W(a.supports_multi,"Multi support"),rate:Qe(a.rate,["speed","sensitivity"],"rate parameter")}}),limits:{palette_min:p(t.palette_min,"minimum palette",1,255),palette_max:p(t.palette_max,"maximum palette",1,255),multi_max:p(t.multi_max,"maximum Multi effects",1,255)},apply:{single:oe(i.single,"Single Apply capability"),multi:oe(i.multi,"Multi Apply capability")}}}function Bt(s){const e=m(s,"library snapshot"),t={library_revision:z(e.library_revision,"library revision",0),items:k(e.items,"library items",di).map((i,r)=>{const n=m(i,`library items[${r}]`),a=n.template===void 0?void 0:Ne(n.template,`library items[${r}].template`);return{id:b(n.id,"library item ID",w),revision:z(n.revision,"library item revision",1),name:b(n.name,"library item name",D),kind:b(n.kind,"library item kind",w),...a?{template:a}:{}}})};return Ue(t.items,i=>i.id,"library item IDs"),t}function Le(s){ie(s,"library item",ee);const e=m(s,"library item"),t=e.target_hint===void 0?void 0:m(e.target_hint,"target hint");return{schema_version:O(e.schema_version,ai,"effect schema version"),id:b(e.id,"effect ID",w),revision:z(e.revision,"effect revision",1),name:b(e.name,"effect name",D),content:ui(e.content),provenance:Ft(e.provenance,"effect provenance"),extensions:Ft(e.extensions,"effect extensions"),...t?{target_hint:{model:t.model===null?null:b(t.model,"target model",w),segment_count:t.segment_count===null?null:p(t.segment_count,"target segment count",1,65535)}}:{}}}function us(s){const e=k(s,"draft summaries",li).map((t,i)=>{const r=m(t,`draft summaries[${i}]`);return{id:b(r.id,"draft ID",w),revision:z(r.revision,"draft revision",1),name:b(r.name,"draft name",D),updated_at:ct(r.updated_at,"draft timestamp"),selected_config_entry_id:ke(r.selected_config_entry_id,"draft config entry ID")}});return Ue(e,t=>t.id,"draft IDs"),e}function je(s){const e=m(s,"effect draft");return{id:b(e.id,"draft ID",w),owner_id:b(e.owner_id,"draft owner",w),revision:z(e.revision,"draft revision",1),item:Le(e.item),updated_at:ct(e.updated_at,"draft timestamp"),selected_config_entry_id:ke(e.selected_config_entry_id,"draft config entry ID"),base_item_id:ke(e.base_item_id,"draft base item ID"),base_item_revision:e.base_item_revision===null?null:z(e.base_item_revision,"draft base item revision",1)}}function Je(s){const e=m(s,"deployment"),t=te(e.phase,"deployment phase");t!=="pending"&&t!=="uploading"&&t!=="verifying"&&t!=="confirmed"&&t!=="failed"&&t!=="interrupted"&&t!=="unknown"&&g("deployment phase is invalid");const i={operation_id:b(e.operation_id,"deployment operation ID",w),config_entry_id:b(e.config_entry_id,"deployment config entry ID",w),diy_code:p(e.diy_code,"deployment DIY code",0,65535),phase:t,updated_at:ct(e.updated_at,"deployment timestamp"),item_id:ke(e.item_id,"deployment item ID"),item_revision:e.item_revision===null?null:z(e.item_revision,"deployment item revision",1),error_code:ke(e.error_code,"deployment error code"),progress_current:p(e.progress_current,"deployment progress",0,1024),progress_total:p(e.progress_total,"deployment progress total",0,1024)};return i.progress_current>i.progress_total&&g("deployment progress exceeds its total"),i}function hs(s){const e=m(s,"deployment snapshot"),t={revision:z(e.revision,"deployment revision",0),deployments:k(e.deployments,"deployments",ci).map(Je)};return Ue(t.deployments,i=>i.operation_id,"deployment operation IDs"),t}function ms(s){ie(s,"scene catalogue",ss,ns);const e=m(s,"scene catalogue");return{schema_version:p(e.schema_version,"scene catalogue schema",1),sku:b(e.sku,"scene catalogue SKU",w),enabled:W(e.enabled,"scene catalogue enabled"),categories:k(e.categories,"scene categories",q).map((t,i)=>{const r=m(t,`scene categories[${i}]`);return{id:p(r.id,"scene category ID",0,65535),name:b(r.name,"scene category name",D)}}),scenes:k(e.scenes,"scenes",pi).map(lt)}}function fs(s){const e=m(s,"scene detail");ie({scene:e.scene,content:e.content},"scene detail",ee);const t=ui(e.content);return t.kind!=="scene_builtin"&&t.kind!=="scene_palette"&&t.kind!=="scene_layered"&&g("scene detail content is unsupported"),{scene:lt(e.scene),content:t}}function ui(s){ie(s,"effect content",ee);const e=m(s,"effect content"),t=b(e.kind,"effect content kind",w);switch(t){case"h617a_painted":return{kind:t,effect:Qe(e.effect,["cycle","clockwise","counter_clockwise","twinkle","gradient","breathe"],"painted effect"),speed:p(e.speed,"painted speed",0,100),brightness:p(e.brightness,"painted brightness",0,100),background:we(e.background,"painted background"),groups:k(e.groups,"paint groups",15).map((i,r)=>{const n=m(i,`paint groups[${r}]`);return{fill:we(n.fill,"paint-group fill"),segments:k(n.segments,"painted segments",15).map(a=>p(a,"painted segment",0,14))}})};case"h617a_single":return{kind:t,family:p(e.family,"Single family",0,254),variant:p(e.variant,"Single variant",0,255),speed:p(e.speed,"Single speed",0,100),palette:Me(e.palette,"Single palette",8)};case"h617a_multi":return{kind:t,effects:k(e.effects,"Multi effects",4).map((i,r)=>{const n=m(i,`Multi effects[${r}]`);return{family:p(n.family,"Multi family",0,254),variant:p(n.variant,"Multi variant",0,255)}}),speed:p(e.speed,"Multi speed",0,100),palette:Me(e.palette,"Multi palette",8)};case"advanced":return{kind:t,layers:Rt(e.layers,"Advanced layers")};case"scene_builtin":return{kind:t,template:Ne(e.template,"scene template"),speed_index:Ze(e.speed_index,"scene speed index",0,255)};case"scene_palette":return gs(e);case"scene_layered":{const i=m(e.effect,"layered scene effect"),r=hi(e.trailing_padding,"layered scene trailing padding");return{kind:t,template:Ne(e.template,"layered scene template"),effect:{layers:Rt(i.layers,"layered scene layers")},speed_index:Ze(e.speed_index,"layered scene speed index",0,255),raw_param:mi(e.raw_param,"layered scene raw parameter"),...r===void 0?{}:{trailing_padding:r}}}default:{const{kind:i,...r}=e;return{kind:"opaque",source_kind:t,body:r}}}}function hi(s,e){if(s!==void 0)return p(s,e,0,as)}function gs(s){const t=p(s.layout,"palette scene layout",0,1)===0?0:1,i=k(s.steps,"palette scene steps",255).map((d,l)=>{const u=m(d,`palette scene steps[${l}]`),f=t===0?(u.inline_colour!==null&&g(`palette scene steps[${l}].inline_colour must be null for layout 0`),null):we(u.inline_colour,`palette scene steps[${l}].inline_colour`);return{value:p(u.value,`palette scene steps[${l}].value`,0,65535),colour:we(u.colour,`palette scene steps[${l}].colour`),inline_colour:f}}),r=Me(s.palette,"palette scene shared palette",255,!0);t===1&&r.length!==0&&g("palette scene layout 1 must not have a shared palette");let n;s.config_flags!==void 0&&(n=p(s.config_flags,"palette scene config flags",0,255),n&-9&&g("palette scene config flags must only set reserved config bits"));const a=hi(s.trailing_padding,"palette scene trailing padding");return{kind:"scene_palette",template:Ne(s.template,"palette scene template"),layout:t,brightness_flag:W(s.brightness_flag,"palette scene brightness flag"),steps:i,palette:r,speed_index:Ze(s.speed_index,"palette scene speed index",0,255),...n===void 0?{}:{config_flags:n},...a===void 0?{}:{trailing_padding:a}}}function me(s){return s.kind!=="opaque"?s:(ie(s.body,"opaque content",ee),{...s.body,kind:b(s.source_kind,"opaque source kind",w)})}function lt(s){const e=m(s,"scene"),t=te(e.parameter_kind,"scene parameter kind");t!=="none"&&t!=="palette"&&t!=="layers"&&t!=="opaque"&&g("scene parameter kind is invalid");const i=e.speed===null?null:(()=>{const r=m(e.speed,"scene speed");return{option_count:p(r.option_count,"scene speed option count",1,256),default_index:p(r.default_index,"scene default speed",0,255)}})();return{scene_id:p(e.scene_id,"scene ID",0,65535),effect_id:p(e.effect_id,"scene effect ID",0,65535),category_id:p(e.category_id,"scene category ID",0,65535),category:b(e.category,"scene category",D),name:b(e.name,"scene name",D),variant:vs(e.variant,"scene variant",w),display_name:b(e.display_name,"scene display name",D),scene_type:p(e.scene_type,"scene type",0,255),parameter_kind:t,speed:i}}function Rt(s,e){return k(s,e,255).map((t,i)=>bs(t,`${e}[${i}]`))}function bs(s,e){const t=m(s,e),i=m(t.area,`${e}.area`),r=m(t.selection,`${e}.selection`),n=m(t.distribution,`${e}.distribution`);return{area:{start_tenths:p(i.start_tenths,`${e}.area.start_tenths`,0,15),width_tenths:p(i.width_tenths,`${e}.area.width_tenths`,0,15)},selection:{type:C(r.type,`${e}.selection.type`),param_1:C(r.param_1,`${e}.selection.param_1`),param_2:C(r.param_2,`${e}.selection.param_2`)},brightness_gradient:W(t.brightness_gradient,`${e}.brightness_gradient`),brightness_patterns:k(t.brightness_patterns,`${e}.brightness_patterns`,255).map((a,d)=>{const l=m(a,`${e}.brightness_patterns[${d}]`);return{scope_high:C(l.scope_high,"brightness scope high"),scope_low:C(l.scope_low,"brightness scope low"),order:C(l.order,"brightness order"),change_speed:C(l.change_speed,"brightness change speed"),brightest_retention:C(l.brightest_retention,"brightest retention"),darkest_retention:C(l.darkest_retention,"darkest retention")}}),distribution:{method:p(n.method,`${e}.distribution.method`,0,127),backwards:W(n.backwards,`${e}.distribution.backwards`)},colour_speed:C(t.colour_speed,`${e}.colour_speed`),colour_retention:C(t.colour_retention,`${e}.colour_retention`),palette:Me(t.palette,`${e}.palette`,255,!0),selected_movement:Ot(t.selected_movement,`${e}.selected_movement`),overall_movement:Ot(t.overall_movement,`${e}.overall_movement`),priority:C(t.priority,`${e}.priority`),unknown_flags:fi(t.unknown_flags,ds,`${e}.unknown_flags`),excess:mi(t.excess,`${e}.excess`)}}function Ot(s,e){const t=m(s,e);return{enabled:W(t.enabled,`${e}.enabled`),enter_exit:W(t.enter_exit,`${e}.enter_exit`),direction:p(t.direction,`${e}.direction`,0,3),distance:C(t.distance,`${e}.distance`),speed:C(t.speed,`${e}.speed`),unknown_flags:fi(t.unknown_flags,os,`${e}.unknown_flags`)}}function Ne(s,e){const t=m(s,e);return{sku:b(t.sku,`${e}.sku`,w),scene_id:p(t.scene_id,`${e}.scene_id`,0,65535),effect_id:p(t.effect_id,`${e}.effect_id`,0,65535),catalogue_schema_version:p(t.catalogue_schema_version,`${e}.catalogue_schema_version`,1,dt)}}function Me(s,e,t,i=!1){const r=k(s,e,t);return!i&&r.length===0&&g(`${e} must not be empty`),r.map((n,a)=>we(n,`${e}[${a}]`))}function we(s,e){const t=k(s,e,3);return t.length!==3&&g(`${e} must contain three channels`),t.map(i=>p(i,`${e} channel`,0,255))}function oe(s,e){return s!=="supported"&&s!=="unsupported"&&s!=="evidence_gap"&&g(`${e} is invalid`),s}function Ft(s,e){return ie(s,e,ee),m(s,e)}function ke(s,e){return s===null?null:b(s,e,w)}function ct(s,e){const t=b(s,e,is);return(!/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(t)||Number.isNaN(Date.parse(t)))&&g(`${e} must be an ISO 8601 timestamp with a UTC offset`),t}function b(s,e,t){const i=te(s,e);return(i.length===0||i.length>t)&&g(`${e} must contain 1 to ${t} characters`),i}function vs(s,e,t){const i=te(s,e);return i.length>t&&g(`${e} must not exceed ${t} characters`),i}function mi(s,e){const t=te(s,e);return(t.length%2!==0||!/^[0-9a-f]*$/i.test(t))&&g(`${e} must be hexadecimal`),t}function te(s,e){return typeof s!="string"&&g(`${e} must be a string`),s}function W(s,e){return typeof s!="boolean"&&g(`${e} must be a boolean`),s}function p(s,e,t,i=dt){return(typeof s!="number"||!Number.isSafeInteger(s)||s<t||s>i)&&g(`${e} must be an integer from ${t} to ${i}`),s}function z(s,e,t){return p(s,e,t,dt)}function O(s,e,t){const i=p(s,t,1);return i!==e&&g(`${t} is incompatible with this editor`),i}function Ze(s,e,t,i){return s===null?null:p(s,e,t,i)}function C(s,e){return p(s,e,0,255)}function fi(s,e,t){const i=C(s,t);return i&~e&&g(`${t} must only set reserved bits, not bits explicit fields carry`),i}function Qe(s,e,t){const i=te(s,t);return e.includes(i)||g(`${t} is invalid`),i}function m(s,e){return(typeof s!="object"||s===null||Array.isArray(s))&&g(`${e} must be an object`),s}function k(s,e,t){return Array.isArray(s)||g(`${e} must be an array`),s.length>t&&g(`${e} must not exceed ${t} items`),s}function Ue(s,e,t){const i=s.map(e);new Set(i).size!==i.length&&g(`${t} must be unique`)}function ie(s,e,t,i=rs){let r=0;const n=(d,l,u)=>{if(r+=1,r>i&&g(`${e} must not exceed ${i} JSON values`),u>Mt&&g(`${e} must not exceed ${Mt} nested levels`),!(d===null||typeof d=="boolean")){if(typeof d=="number"){(!Number.isFinite(d)||Number.isInteger(d)&&!Number.isSafeInteger(d))&&g(`${l} must be a finite JSON number`);return}if(typeof d=="string"){d.length>Ve&&g(`${l} must not exceed ${Ve} characters`);return}if(Array.isArray(d)){d.length>q&&g(`${l} must not exceed ${q} items`),d.forEach((f,y)=>n(f,`${l}[${y}]`,u+1));return}if(typeof d=="object"&&d!==null){const f=Object.entries(d);f.length>q&&g(`${l} must not exceed ${q} fields`),f.forEach(([y,P])=>{y.length>Ve&&g(`${l} contains an oversized key`),n(P,`${l}.${y}`,u+1)});return}g(`${l} contains a non-JSON value`)}};n(s,e,0);const a=JSON.stringify(s);a===void 0&&g(`${e} must contain JSON values`),new TextEncoder().encode(a).byteLength>t&&g(`${e} must not exceed ${t} bytes`)}function g(s){throw new Error(`Malformed Effect Studio server payload: ${s}.`)}function ys(s){return s.api_version===es&&s.effect_schema_version===ai&&s.compiler_version===ts}const Ge="ha_govee_led_ble/editor";class $s{constructor(e){this.hass=e}async info(){return ls(await this.call("info"))}async devices(){const e=await this.call("devices");return cs(E(e,"devices"))}async customCatalogue(){const e=await this.call("custom/catalogue");return ps(E(e,"catalogue"))}async library(){return Bt(await this.call("library/list"))}async item(e){const t=await this.call("library/get",{item_id:e});return Le(E(t,"item"))}async createItem(e,t,i){const r=await this.call("library/create",{name:e,content:me(t),expected_library_revision:i});return{item:Le(E(r,"item")),library_revision:Xe(r)}}async updateItem(e,t,i,r){const n=await this.call("library/update",{item_id:e.id,name:t,content:me(i),expected_revision:e.revision,expected_library_revision:r});return{item:Le(E(n,"item")),library_revision:Xe(n)}}async deleteItem(e,t){const i=await this.call("library/delete",{item_id:e.id,expected_revision:e.revision,expected_library_revision:t});return Xe(i)}async drafts(){const e=await this.call("draft/list");return us(E(e,"drafts"))}async draft(e){const t=await this.call("draft/get",{draft_id:e});return je(E(t,"draft"))}async createDraft(e,t,i,r){const n=await this.call("draft/create",{name:e,content:me(t),updated_at:new Date().toISOString(),selected_config_entry_id:i,...r?{base_item_id:r.id,base_item_revision:r.revision}:{}});return je(E(n,"draft"))}async updateDraft(e,t,i,r){const n=await this.call("draft/update",{draft_id:e.id,expected_revision:e.revision,name:t,content:me(i),updated_at:new Date().toISOString(),selected_config_entry_id:r});return je(E(n,"draft"))}async deleteDraft(e){await this.call("draft/delete",{draft_id:e.id,expected_revision:e.revision})}async applySaved(e,t){const i=await this.call("apply",{config_entry_id:e,item_id:t.id,revision:t.revision,updated_at:new Date().toISOString()});return Je(E(i,"deployment"))}async applySnapshot(e,t,i){const r=await this.call("apply_snapshot",{config_entry_id:e,name:t,content:me(i),updated_at:new Date().toISOString()});return Je(E(r,"deployment"))}async sceneCatalogue(e){const t=await this.call("scene/catalogue/list",{config_entry_id:e});return ms(E(t,"catalogue"))}sceneDetail(e,t,i){return this.call("scene/catalogue/get",{config_entry_id:e,scene_id:t,effect_id:i}).then(fs)}async applyScene(e,t,i){const r=await this.call("scene/apply",{config_entry_id:e,scene_id:t.scene_id,effect_id:t.effect_id,...i===null?{}:{speed_index:i}}),n=lt(E(r,"scene")),a=E(r,"readback");if(a!=="scene_identity_only")throw new Error("Malformed Effect Studio server payload: scene Apply readback is invalid.");const d=E(r,"speed_index");if(d!==null&&(typeof d!="number"||!Number.isSafeInteger(d)||d<0||d>255))throw new Error("Malformed Effect Studio server payload: scene Apply speed is invalid.");return{scene:n,speed_index:d,readback:a}}subscribeLibrary(e,t){return this.hass.connection.subscribeMessage(i=>{try{e(Bt(i))}catch(r){t?.(Ut(r))}},{type:`${Ge}/library/subscribe`})}subscribeDeployments(e,t){return this.hass.connection.subscribeMessage(i=>{try{e(hs(i))}catch(r){t?.(Ut(r))}},{type:`${Ge}/deployment/subscribe`})}call(e,t={}){return this.hass.callWS({type:`${Ge}/${e}`,...t})}}function E(s,e){if(typeof s!="object"||s===null||Array.isArray(s))throw new Error("Malformed Effect Studio server payload: response must be an object.");if(!(e in s))throw new Error(`Malformed Effect Studio server payload: response is missing ${e}.`);return s[e]}function Xe(s){const e=E(s,"library_revision");if(typeof e!="number"||!Number.isSafeInteger(e)||e<0)throw new Error("Malformed Effect Studio server payload: library revision is invalid.");return e}function Ut(s){return s instanceof Error?s:new Error("Malformed Effect Studio server payload.")}var _s=Object.defineProperty,pt=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&_s(e,t,r),r};class qe extends L{constructor(){super(...arguments),this.disabled=!1}updated(){!this.content||this.content.kind!=="h617a_multi"||this.content.effects.forEach((e,t)=>{const i=this.effectFamily(e,!0),r=this.shadowRoot?.querySelector(`select[data-effect-index="${t}"]`),n=this.shadowRoot?.querySelector(`select[data-variation-index="${t}"]`);r&&(r.value=i?.id??`unknown:${e.family}`),n&&(n.value=String(e.variant))})}render(){if(!this.content||!this.catalogue)return c;const e=this.content.kind==="h617a_single"&&this.effectFamily(this.content)?.rate==="sensitivity"?"Sensitivity":"Speed";return o`
      ${this.content.kind==="h617a_multi"?o`
            <section class="card effect-card">
              <h3>Effects</h3>
              ${this.renderSequence(this.content)}
            </section>
          `:c}

      <section class="card parameters-card">
        <h3>Parameters</h3>
        <div class="parameter-group">
          <h4>Colours</h4>
          ${this.renderPalette()}
        </div>
        <div class="parameter-group speed-group">
          <h4>${e}</h4>
          <label class="range-field">
            <span>${e}</span>
            <input
              type="range"
              min="0"
              max="100"
              .value=${String(this.content.speed)}
              ?disabled=${this.disabled}
              @input=${t=>this.emitContent({...this.content,speed:Number(t.target.value)})}
            />
            <output>${this.content.speed}%</output>
          </label>
        </div>
      </section>
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
    `}effectRow(e,t){const i=this.effectFamily(e,!0),r=i?.variations??[];return o`
      <li
        class="effect-row"
        draggable=${this.disabled?"false":"true"}
        @dragstart=${n=>this.effectDragStarted(t,n)}
        @dragover=${n=>{this.disabled||n.preventDefault()}}
        @drop=${n=>this.effectDropped(t,n)}
      >
        <div class="effect-fields">
          <label>
            <span>Effect</span>
            <select
              aria-label="Effect ${t+1}"
              data-effect-index=${t}
              .value=${i?.id??`unknown:${e.family}`}
              ?disabled=${this.disabled}
              @change=${n=>this.effectFamilyChanged(t,n.target.value)}
            >
              ${i?c:o`
                    <option value=${`unknown:${e.family}`}>
                      Unknown effect ${e.family}
                    </option>
                  `}
              ${this.multiFamilies.map(n=>o`
                  <option value=${n.id}>${n.label}</option>
                `)}
            </select>
          </label>
          <label>
            <span>Variation</span>
            <select
              aria-label="Variation ${t+1}"
              data-variation-index=${t}
              .value=${String(e.variant)}
              ?disabled=${this.disabled}
              @change=${n=>this.effectVariationChanged(t,Number(n.target.value))}
            >
              ${r.some(n=>n.variant===e.variant)?c:o`
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
        ${this.disabled?c:o`
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
        @palette-changed=${e=>{this.emitContent({...this.content,palette:xs(e.detail.palette)})}}
      ></govee-palette-editor>
    `}effectFamilyChanged(e,t){const i=this.multiFamilies.find(n=>n.id===t),r=i?.variations[0];!i||!r||this.replaceEffect(e,{family:i.family,variant:r.variant})}effectVariationChanged(e,t){if(!this.content||this.content.kind!=="h617a_multi")return;const i=this.content.effects[e];i&&this.replaceEffect(e,{...i,variant:t})}replaceEffect(e,t){if(!this.content||this.content.kind!=="h617a_multi")return;const i=this.content.effects.map((r,n)=>n===e?t:r);this.emitContent({...this.content,effects:i})}addEffect(){if(!this.content||this.content.kind!=="h617a_multi")return;const e=this.multiFamilies[this.content.effects.length]??this.multiFamilies[0],t=e?.variations[0];if(!e||!t)return;const i=[...this.content.effects,{family:e.family,variant:t.variant}];this.emitContent({...this.content,effects:i})}removeEffect(e){if(!this.content||this.content.kind!=="h617a_multi")return;const t=this.content.effects.filter((i,r)=>r!==e);this.emitContent({...this.content,effects:t})}moveEffect(e,t){if(!this.content||this.content.kind!=="h617a_multi")return;const i=e+t;i<0||i>=this.content.effects.length||this.reorderEffect(e,i)}reorderEffect(e,t){if(!this.content||this.content.kind!=="h617a_multi"||e===t)return;const i=[...this.content.effects],[r]=i.splice(e,1);i.splice(t,0,r),this.emitContent({...this.content,effects:i})}effectDragStarted(e,t){this.draggedEffectIndex=e,t.dataTransfer?.setData("text/plain",String(e))}effectDropped(e,t){t.preventDefault(),this.draggedEffectIndex!==void 0&&(this.reorderEffect(this.draggedEffectIndex,e),this.draggedEffectIndex=void 0)}closeDetails(e){e.currentTarget.closest("details")?.removeAttribute("open")}effectFamily(e,t=!1){return(t?this.multiFamilies:this.catalogue?.effects)?.find(i=>i.family===e.family)}emitContent(e){this.dispatchEvent(new CustomEvent("content-changed",{detail:{content:e},bubbles:!0,composed:!0}))}static{this.styles=J`
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

    .effect-fields {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      flex: 1;
      gap: 10px;
      min-width: 0;
    }

    .effect-fields label {
      display: grid;
      gap: 6px;
      color: var(--studio-muted);
      font-size: 12px;
      font-weight: 650;
    }

    .effect-fields select {
      width: 100%;
      min-height: 44px;
      padding: 8px 10px;
      border: 1px solid var(--studio-border);
      border-radius: 8px;
      color: var(--primary-text-color);
      background: var(--secondary-background-color, #f5f6f8);
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

    @media (max-width: 560px) {
      .effect-fields {
        grid-template-columns: 1fr;
      }
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
  `}}pt([v({attribute:!1})],qe.prototype,"content");pt([v({attribute:!1})],qe.prototype,"catalogue");pt([v({type:Boolean})],qe.prototype,"disabled");function xs(s){return s.map(e=>[...e])}customElements.get("govee-custom-effect-editor")||customElements.define("govee-custom-effect-editor",qe);var ws=Object.defineProperty,gi=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&ws(e,t,r),r};class ut extends L{constructor(){super(...arguments),this.colours=[],this.disabled=!1}render(){return o`
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
    `}pointerStarted(e,t){this.disabled||(t.preventDefault(),this.paintingPointerId=t.pointerId,this.lastPaintedSegment=e,t.currentTarget.setPointerCapture(t.pointerId),this.selectSegment(e))}pointerMoved(e){if(e.pointerId!==this.paintingPointerId||!this.shadowRoot)return;const t=this.shadowRoot.elementFromPoint(e.clientX,e.clientY)?.closest("[data-segment]"),i=Number(t?.dataset.segment);Number.isInteger(i)&&i!==this.lastPaintedSegment&&(this.lastPaintedSegment=i,this.selectSegment(i))}pointerFinished(e){if(e.pointerId!==this.paintingPointerId)return;const t=this.shadowRoot?.querySelector(`[data-segment="${this.lastPaintedSegment}"]`);t?.hasPointerCapture(e.pointerId)&&t.releasePointerCapture(e.pointerId),this.paintingPointerId=void 0,this.lastPaintedSegment=void 0}segmentClicked(e,t){!this.disabled&&t.detail===0&&this.selectSegment(e)}selectSegment(e){this.dispatchEvent(new CustomEvent("segment-selected",{detail:{index:e},bubbles:!0,composed:!0}))}static{this.styles=J`
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
  `}}gi([v({attribute:!1})],ut.prototype,"colours");gi([v({type:Boolean})],ut.prototype,"disabled");customElements.get("govee-painted-segment-editor")||customElements.define("govee-painted-segment-editor",ut);var ks=Object.defineProperty,I=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&ks(e,t,r),r};class S extends L{constructor(){super(...arguments),this.library={library_revision:0,items:[]},this.isAdmin=!1,this.category="all",this.name="",this.speedIndex=null,this.loading=!1,this.saving=!1,this.applying=!1,this.requestGeneration=0}willUpdate(e){(e.has("device")||e.has("api"))&&(this.invalidateRequests(),this.catalogue=void 0,this.category="all",this.selectedScene=void 0,this.selectedItem=void 0,this.content=void 0,this.notice=void 0,this.error=void 0,this.loading=!!(this.api&&this.device))}updated(e){(e.has("device")||e.has("api"))&&this.api&&this.device&&this.loadCatalogue()}render(){return this.device?this.loading?o`<div class="status" role="status">Loading scenes...</div>`:this.error||!this.catalogue?o`
        <section class="empty">
          <h2>Scenes are unavailable</h2>
          <p role="alert">${this.error??"The scene catalogue could not be loaded."}</p>
        </section>
      `:o`
      <aside class="categories" aria-label="Scene categories">
        ${this.sortedCategories.map(e=>this.categoryButton(e.id,e.label))}
      </aside>

      <aside class="scenes" aria-label="Scenes">
        ${this.filteredSceneEntries.map(e=>e.kind==="custom"?this.sceneButton(`custom:${e.item.id}`,e.label,()=>this.selectCustom(e.item)):this.sceneButton(re(e.scene),e.label,()=>this.selectBuiltin(e.scene)))}
      </aside>

      <section class="detail">
        ${this.notice?o`<div class="notice" role="status">${this.notice}</div>`:c}
        ${this.selectedScene&&this.content?this.renderDetail():c}
      </section>
    `:o`
        <section class="empty">
          <h2>No loaded device</h2>
          <p>Load a Govee light before browsing its native scenes.</p>
        </section>
      `}get sortedCategories(){const e=[];return this.catalogue?.scenes.length&&e.push({id:"all",label:"All scenes"}),this.compatibleCustomScenes.length&&e.push({id:"custom",label:"Custom"}),e.push(...this.catalogue?.categories.filter(t=>this.catalogue?.scenes.some(i=>i.category_id===t.id)).map(t=>({id:t.id,label:t.name}))??[]),e.sort((t,i)=>qt(t.label,i.label))}get compatibleCustomScenes(){return this.library.items.filter(e=>(e.kind==="scene_builtin"||e.kind==="scene_palette")&&e.template?.sku===this.catalogue?.sku)}get filteredCustomScenes(){return this.category==="all"||this.category==="custom"?this.compatibleCustomScenes:[]}get filteredBuiltinScenes(){return!this.catalogue||this.category==="custom"?[]:this.category==="all"?this.catalogue.scenes:this.catalogue.scenes.filter(e=>e.category_id===this.category)}get filteredSceneEntries(){return[...this.filteredCustomScenes.map(e=>({kind:"custom",item:e,label:e.name})),...this.filteredBuiltinScenes.map(e=>({kind:"builtin",scene:e,label:e.display_name}))].sort((e,t)=>qt(e.label,t.label))}get selectionKey(){return this.selectedItem?`custom:${this.selectedItem.id}`:this.selectedScene?re(this.selectedScene):void 0}categoryButton(e,t){const i=this.category===e;return o`
      <button
        class="selector ${i?"selected":""}"
        type="button"
        aria-current=${i?"page":c}
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
            class="primary"
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
              `:c}
          <button
            class="secondary"
            type="button"
            aria-describedby=${r&&this.content?.kind==="scene_palette"?"palette-apply-reason":c}
            ?disabled=${!this.isAdmin||!this.catalogue?.enabled||!this.hasCurrentSceneContent()||this.selectedItem!==void 0&&this.content?.kind!=="scene_builtin"||this.applying}
            @click=${this.apply}
          >
            ${this.applying?"Applying...":"Apply"}
          </button>
        </div>
      </header>

      ${this.catalogue?.enabled?c:o`
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
          `:c}

      ${t||this.content?.kind==="scene_palette"?this.renderParameters(t,i):c}
    `}renderParameters(e,t){const i=this.content?.kind==="scene_palette"?this.content:void 0;return o`
      <div class="card scene-parameters">
        <div class="parameter-list">
          ${e?o`
                <label class="speed-parameter">
                  <span class="parameter-heading">
                    <span>Speed</span>
                    <output>
                      ${Ss(t,e.default_index)}
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
                    @input=${r=>{this.speedIndex=Number(r.target.value)}}
                  />
                </label>
              `:c}
          ${i?this.renderPaletteParameters(i):c}
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
          `:c}
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
                    `:c}
              </span>
            </li>
          `)}
        </ol>
      </section>
    `}async loadCatalogue(){if(!this.api||!this.device)return;const e=this.beginRequest();this.loading=!0,this.error=void 0,this.notice=void 0,this.selectedScene=void 0,this.selectedItem=void 0,this.content=void 0;try{const t=await e.api.sceneCatalogue(e.deviceId);if(!this.requestIsCurrent(e))return;this.catalogue=t,this.category="all"}catch(t){this.requestIsCurrent(e)&&(this.error=fe(t))}finally{this.requestIsCurrent(e)&&(this.loading=!1)}}selectCategory(e){this.invalidateRequests(),this.category=e,this.selectedScene=void 0,this.selectedItem=void 0,this.content=void 0,this.notice=void 0}async selectBuiltin(e){if(!this.api||!this.device)return;const t=re(e),i=this.beginRequest(t);this.notice=void 0,this.selectedScene=e,this.selectedItem=void 0,this.content=void 0,this.name=e.display_name,this.speedIndex=e.speed?.default_index??null;try{const r=await i.api.sceneDetail(i.deviceId,e.scene_id,e.effect_id);if(!this.requestIsCurrent(i)||re(r.scene)!==t)return;this.selectedScene=r.scene,this.content=r.content,this.name=r.scene.display_name,this.speedIndex=r.content.speed_index}catch(r){this.requestIsCurrent(i)&&(this.notice=fe(r))}}async selectCustom(e){if(!this.api||!this.device||!this.catalogue)return;const t=this.catalogue,i=this.beginRequest(`custom:${e.id}`);this.notice=void 0,this.selectedScene=void 0,this.selectedItem=void 0,this.content=void 0,this.name=e.name;try{const r=await i.api.item(e.id);if(!this.requestIsCurrent(i))return;if(r.content.kind!=="scene_builtin"&&r.content.kind!=="scene_palette")throw new Error("This custom scene uses an unsupported definition.");const n=r.content;if(n.template.sku!==t.sku)throw new Error(`This custom scene targets ${n.template.sku}, not ${t.sku}.`);const a=t.scenes.find(l=>l.scene_id===n.template.scene_id&&l.effect_id===n.template.effect_id);if(!a)throw new Error("The source scene is not in this device catalogue.");const d=await i.api.sceneDetail(i.deviceId,n.template.scene_id,n.template.effect_id);if(!this.requestIsCurrent(i)||re(d.scene)!==re(a))return;this.selectedScene=a,this.selectedItem=r,this.content=n,this.name=r.name,this.speedIndex=n.speed_index??a.speed?.default_index??null}catch(r){this.requestIsCurrent(i)&&(this.notice=fe(r))}}async save(){if(!this.api||!this.device||!this.catalogue||!this.selectedScene||!this.content||!this.hasCurrentSceneContent()||this.content.kind!=="scene_builtin"&&this.content.kind!=="scene_palette"||!this.isAdmin||this.saving)return;const e=(this.selectedItem?this.name.trim():`${this.selectedScene.display_name} copy`).trim();if(!e){this.notice="Give this custom scene a name before saving.";return}const t=this.content.kind==="scene_palette"?Is({...this.content,speed_index:this.speedIndex}):{...this.content,speed_index:this.speedIndex},i=this.captureRequest();this.saving=!0,this.notice=void 0;try{const r=this.selectedItem?await this.api.updateItem(this.selectedItem,e,t,this.library.library_revision):await this.api.createItem(e,t,this.library.library_revision);if(r.item.content.kind!=="scene_builtin"&&r.item.content.kind!=="scene_palette")throw new Error("The saved scene returned an unsupported definition.");if(this.dispatchEvent(new CustomEvent("library-item-saved",{detail:{item:r.item,library_revision:r.library_revision},bubbles:!0,composed:!0})),!this.requestIsCurrent(i))return;this.requestGeneration+=1,this.activeSelectionIdentity=`custom:${r.item.id}`,this.selectedItem=r.item,this.content=r.item.content,this.name=r.item.name,this.category="custom",this.notice="Custom scene saved."}catch(r){this.requestIsCurrent(i)&&(this.notice=Cs(r)==="conflict"?"The library changed elsewhere. Reload the scene before saving.":`Save failed: ${fe(r)}`)}finally{this.saving=!1}}useAsTemplate(){!this.isAdmin||!this.selectedScene||this.selectedScene.scene_type!==2||this.content?.kind!=="scene_layered"||!this.hasCurrentSceneContent()||this.dispatchEvent(new CustomEvent("scene-template-selected",{detail:{content:Es({...this.content,speed_index:this.speedIndex}),config_entry_id:this.device.config_entry_id,name:`${this.selectedScene.display_name} layered`},bubbles:!0,composed:!0}))}async apply(){if(!this.api||!this.device||!this.selectedScene||!this.hasCurrentSceneContent()||!this.isAdmin||!this.catalogue?.enabled||this.selectedItem!==void 0&&this.content?.kind!=="scene_builtin"||this.applying)return;const e=this.captureRequest(),t=this.device,i=this.selectedScene,r=this.speedIndex;this.applying=!0,this.notice=void 0;try{await e.api.applyScene(e.deviceId,i,r),this.requestIsCurrent(e)&&(this.notice=`Applied to ${t.display_name}. Scene identity can be read back; the selected speed remains optimistic.`)}catch(n){this.requestIsCurrent(e)&&(this.notice=`Apply failed: ${fe(n)}`)}finally{this.applying=!1}}beginRequest(e){return this.requestGeneration+=1,this.activeSelectionIdentity=e,this.captureRequest()}captureRequest(){return{generation:this.requestGeneration,api:this.api,deviceId:this.device.config_entry_id,category:this.category,selectionIdentity:this.activeSelectionIdentity}}invalidateRequests(){this.requestGeneration+=1,this.activeSelectionIdentity=void 0}requestIsCurrent(e){return e.generation===this.requestGeneration&&e.api===this.api&&e.deviceId===this.device?.config_entry_id&&e.category===this.category&&e.selectionIdentity===this.activeSelectionIdentity}hasCurrentSceneContent(){return!this.catalogue||!this.selectedScene||!this.content||this.content.template.sku!==this.catalogue.sku||this.content.template.scene_id!==this.selectedScene.scene_id||this.content.template.effect_id!==this.selectedScene.effect_id?!1:this.activeSelectionIdentity===this.selectionKey}static{this.styles=J`
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

    h4 {
      margin: 0;
      font-size: 13px;
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

      .parameter-summary {
        grid-template-columns: 1fr;
      }
    }
  `}}I([v({attribute:!1})],S.prototype,"api");I([v({attribute:!1})],S.prototype,"device");I([v({attribute:!1})],S.prototype,"library");I([v({type:Boolean})],S.prototype,"isAdmin");I([h()],S.prototype,"catalogue");I([h()],S.prototype,"category");I([h()],S.prototype,"selectedScene");I([h()],S.prototype,"selectedItem");I([h()],S.prototype,"content");I([h()],S.prototype,"name");I([h()],S.prototype,"speedIndex");I([h()],S.prototype,"loading");I([h()],S.prototype,"saving");I([h()],S.prototype,"applying");I([h()],S.prototype,"notice");I([h()],S.prototype,"error");function re(s){return`builtin:${s.scene_id}:${s.effect_id}`}function Ss(s,e){const t=s-e;if(t===0)return"Default";const i=Math.abs(t);return`${t<0?"Slower":"Faster"}${i>1?` ${i}`:""}`}function qt(s,e){return s.localeCompare(e,"en-AU",{sensitivity:"base"})}function Es(s){return{...s,template:{...s.template},effect:{layers:xe({layers:s.effect.layers}).layers}}}function Is(s){return{...s,template:{...s.template},steps:s.steps.map(e=>({...e,colour:[...e.colour],inline_colour:e.inline_colour===null?null:[...e.inline_colour]})),palette:s.palette.map(e=>[...e])}}function fe(s){return s instanceof Error||typeof s=="object"&&s!==null&&"message"in s&&typeof s.message=="string"?s.message:"An unexpected error occurred."}function Cs(s){if(typeof s=="object"&&s!==null&&"code"in s&&typeof s.code=="string")return s.code}customElements.get("govee-scene-browser")||customElements.define("govee-scene-browser",S);var As=Object.defineProperty,_=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&As(e,t,r),r};const et=15;class $ extends L{constructor(){super(...arguments),this.showDevicePicker=!1,this.loading=!0,this.devices=[],this.section="custom",this.customEffectCategory="all",this.customCopyStarted=!1,this.library={library_revision:0,items:[]},this.name="",this.content=ae(),this.paintBrushes=Be(),this.selectedPaintBrush=0,this.brushUsesBackground=!1,this.saving=!1,this.applying=!1,this.deployments=[],this.editorTransitionEpoch=0,this.loadEpoch=0,this.deploymentRevision=-1}get isAdmin(){return this.hass?.user?.is_admin===!0}get selectedDevice(){return this.devices.find(e=>e.config_entry_id===this.selectedDeviceId)}get dirty(){return B(this.content)?this.savedBaseline!==G(this.name,this.content):!1}get applyCapability(){if(!F(this.content))return;const e=this.selectedDevice?.custom_effects;if(e)switch(this.content.kind){case"h617a_painted":return e.painted;case"h617a_single":return e.single;case"h617a_multi":return e.multi}}get canApply(){return F(this.content)&&this.isAdmin&&!this.applying&&!this.deletingCurrentItem&&this.name.trim().length>0&&this.applyCapability==="supported"}get deletingCurrentItem(){return this.deletingItemId!==void 0&&this.currentItem?.id===this.deletingItemId}get activeDeployment(){const e=this.deployments.find(t=>t.operation_id===this.activeOperationId);return e||!this.applying?e:this.latestDeployment(["pending","uploading","verifying"])}connectedCallback(){super.connectedCallback(),this.hass&&!this.api&&this.load()}disconnectedCallback(){super.disconnectedCallback(),this.loadEpoch+=1,this.beginEditorTransition(),this.stopSubscriptions(),this.api=void 0}updated(e){e.has("hass")&&this.hass&&!this.api&&this.load(),this.syncSingleEffectSelects()}render(){return this.loading?o`<div class="centred" role="status">Loading effect studio...</div>`:this.error?this.renderFatalError():o`
      <h1 class="visually-hidden">Effect Studio</h1>

      ${this.notice?o`<div class="notice" role="status">${this.notice}</div>`:c}

      <main
        class="studio ${this.section==="scenes"?"scenes-mode":"custom-mode"}"
      >
        <nav class="primary-nav" aria-label="Create">
          ${this.navButton("scenes","Scenes")}
          ${this.navButton("custom","Effects")}
          ${this.showDevicePicker?this.renderDevicePicker():c}
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
        ${this.section==="custom"?this.renderCustomEffects():c}
      </main>
      ${this.deleteCandidate?this.renderDeleteConfirmation():c}
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
              `:c}
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
        aria-current=${this.section===e?"page":c}
        @click=${()=>{this.selectSection(e)}}
      >
        ${t}
      </button>
    `}renderCustomEffects(){return o`
      <aside class="effect-categories" aria-label="Effect categories">
        <button
          class="selector"
          type="button"
          ?disabled=${!this.isAdmin}
          @click=${()=>this.newEffect("h617a_single")}
        >
          New
        </button>
        ${this.customEffectCategoryButton("all","All")}
        ${this.customEffectCategoryButton("single-layer","Single Layer")}
        ${this.customEffectCategoryButton("multi-layer","Multi Layer")}
        ${this.customEffectCategoryButton("advanced","Advanced")}
      </aside>

      <aside class="library" aria-label="Effects">
        ${this.customEffectEntries.map(e=>this.customEffectListButton(e))}
      </aside>

      <section class="editor">
        ${this.name||this.currentItem?F(this.content)?this.content.kind==="h617a_painted"?this.renderPaintedEditor():this.renderPaletteEffectEditor():be(this.content)?this.renderAdvancedEditor():this.content.kind==="opaque"?this.renderOpaqueEditor(this.content):c:c}
      </section>
    `}get customEffectEntries(){return[{kind:"paint",key:"template:paint",label:"Paint",category:"single-layer"},...this.customCatalogue?.effects.map(t=>({kind:"single",key:`template:single:${t.family}:${t.variations[0].variant}`,label:t.label,category:"single-layer",family:t.family,variant:t.variations[0].variant}))??[],{kind:"multi",key:"template:mix",label:"Mix",category:"multi-layer"},{kind:"advanced",key:"template:advanced",label:"Layered",category:"advanced"},...this.library.items.filter(t=>Vt(t.kind)).map(t=>({kind:"saved",key:`saved:${t.id}`,label:t.name,category:Us(t.kind),item:t}))].filter(t=>this.customEffectCategory==="all"||t.category===this.customEffectCategory).sort((t,i)=>Fs(t.label,i.label))}customEffectCategoryButton(e,t){const i=this.customEffectCategory===e;return o`
      <button
        class="selector ${i?"selected":""}"
        type="button"
        aria-current=${i?"page":c}
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
            `:c}
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
          ${t?o`<p>Unsaved changes in the open effect will be discarded.</p>`:c}
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
    `}selectCustomEffectEntry(e){if(e.kind==="saved"){this.selectItem(e.item.id);return}if(e.kind==="advanced"){this.newEffect("advanced",void 0,{name:e.label,content:Dt(),selectionIdentity:e.key,templateLabel:e.label}),this.customTemplateSelection=e.key;return}if(this.customCatalogue){if(e.kind==="paint"){this.newEffect("h617a_painted",void 0,{name:e.label,content:ae(),selectionIdentity:e.key,templateLabel:e.label});return}if(e.kind==="single"){const t=ge("h617a_single",this.customCatalogue);this.newEffect("h617a_single",void 0,{name:e.label,content:{...t,family:e.family,variant:e.variant},selectionIdentity:e.key,templateLabel:e.label});return}this.newEffect("h617a_multi",void 0,{name:e.label,content:ge("h617a_multi",this.customCatalogue),selectionIdentity:e.key,templateLabel:e.label})}}renderAdvancedEditor(){if(!be(this.content))return c;const e=this.content.kind==="scene_layered";return o`
      ${e?o`
            <button
              class="back-button"
              type="button"
              @click=${this.backToScenes}
            >
              ← Back to Scenes
            </button>
          `:c}
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

      ${this.isAdmin?c:o`
            <div class="read-only" role="note">
              You can inspect shared effects. An administrator is required to
              edit or save them.
            </div>
          `}

      ${e?o`
            <div class="source-note" role="note">
              Source parameter bytes remain immutable provenance. Layer edits
              are saved separately and may diverge from those bytes.
            </div>
          `:c}

      <govee-advanced-effect-editor
        .content=${Ds(this.content)}
        .disabled=${!this.isAdmin}
        .segmentCount=${this.selectedDevice?.segment_count??15}
        @content-changed=${t=>{be(this.content)&&(this.content=Ts(this.content,t.detail.content))}}
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
    `}renderPaintedEditor(){if(this.content.kind!=="h617a_painted")return c;const e=this.activeDeployment;return o`
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

      ${this.isAdmin?c:o`
            <div class="read-only" role="note">
              You can inspect shared effects. An administrator is required to
              edit or apply them.
            </div>
          `}

      ${this.renderSingleEffectSettings()}

      <govee-painted-segment-editor
        .colours=${tt(this.content)}
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
            <label>
              <span>Background</span>
              <input
                type="color"
                .value=${Bs(this.content.background)}
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
          <h3>Parameters</h3>
          ${this.rangeField("Speed","speed",this.content.speed)}
          ${this.rangeField("Brightness","brightness",this.content.brightness)}
        </section>
      </div>

      ${e?this.renderDeployment(e):c}
    `}renderPaletteEffectEditor(){if(this.content.kind!=="h617a_single"&&this.content.kind!=="h617a_multi")return c;const e=this.content,t=this.activeDeployment;return o`
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

      ${this.isAdmin?c:o`
            <div class="read-only" role="note">
              You can inspect shared effects. An administrator is required to
              edit them.
            </div>
          `}

      ${this.renderSingleEffectSettings()}

      <govee-custom-effect-editor
        .content=${e}
        .catalogue=${this.customCatalogue}
        .disabled=${!this.isAdmin}
        @content-changed=${i=>{this.content=bi(i.detail.content)}}
      ></govee-custom-effect-editor>

      ${t?this.renderDeployment(t):c}
    `}renderSingleEffectSettings(){if(!this.customCatalogue||this.content.kind!=="h617a_painted"&&this.content.kind!=="h617a_single")return c;const e=this.selectedSingleEffectFamily,t=this.content.kind==="h617a_painted"?"paint":e?.id??`unknown:${this.content.family}`,i=this.content.kind==="h617a_painted"?this.content.effect:String(this.content.variant),r=this.content.kind==="h617a_painted"?this.customCatalogue.painted_effects.map(l=>({value:l.id,label:l.label})):e?.variations.map(l=>({value:String(l.variant),label:l.label}))??[],n=this.currentItem?.content.kind!=="h617a_single",a=this.currentItem?.content.kind==="h617a_painted"?[]:this.customCatalogue.effects,d=r.some(l=>l.value===i);return o`
      <section class="card single-effect-settings">
        <h3>Effect</h3>
        <div class="single-effect-fields">
          <label>
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
                  `:c}
              ${n?o`
                    <option
                      value="paint"
                      ?selected=${t==="paint"}
                    >
                      Paint
                    </option>
                  `:c}
              ${a.map(l=>o`
                  <option
                    value=${l.id}
                    ?selected=${t===l.id}
                  >
                    ${l.label}
                  </option>
                `)}
            </select>
          </label>
          <label>
            <span>Variation</span>
            <select
              aria-label="Variation"
              .value=${i}
              ?disabled=${!this.isAdmin}
              @change=${this.singleEffectVariationChanged}
            >
              ${d?c:o`
                    <option value=${i}>
                      Unknown variation ${i}
                    </option>
                  `}
              ${r.map(l=>o`
                  <option
                    value=${l.value}
                    ?selected=${l.value===i}
                  >
                    ${l.label}
                  </option>
                `)}
            </select>
          </label>
        </div>
      </section>
    `}renderEffectName(){return this.templateSourceLabel?o`<h2>${this.templateSourceLabel}</h2>`:o`
          <input
            class="name-input"
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
        `}get selectedSingleEffectFamily(){if(this.content.kind!=="h617a_single")return;const e=this.content.family;return this.customCatalogue?.effects.find(t=>t.family===e)}syncSingleEffectSelects(){if(this.content.kind!=="h617a_painted"&&this.content.kind!=="h617a_single")return;const e=this.shadowRoot?.querySelector('select[aria-label="Effect"]'),t=this.shadowRoot?.querySelector('select[aria-label="Variation"]');e&&(e.value=this.content.kind==="h617a_painted"?"paint":this.selectedSingleEffectFamily?.id??`unknown:${this.content.family}`),t&&(t.value=this.content.kind==="h617a_painted"?this.content.effect:String(this.content.variant))}rangeField(e,t,i){return o`
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
    `}renderNewEffectTypeTabs(){return this.currentItem||this.templateSourceLabel||this.customCopyStarted||!B(this.content)?c:o`
      <div class="custom-mode-tabs" role="tablist" aria-label="Custom effect type">
        ${this.newEffectTypeButton("single","Single")}
        ${this.newEffectTypeButton("multi","Multi")}
        ${this.newEffectTypeButton("advanced","Advanced")}
      </div>
    `}newEffectTypeButton(e,t){const i=Ht(this.content)===e,r=e==="single"&&this.content.kind==="h617a_multi"&&this.content.effects.length>1;return o`
      <button
        type="button"
        role="tab"
        aria-selected=${i}
        class=${i?"selected":""}
        title=${r?"Remove all but one effect before switching to Single":c}
        ?disabled=${!this.isAdmin||r}
        @click=${()=>this.switchNewEffectType(e)}
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
    `}async selectSection(e){const t=this.beginEditorTransition();if(e===this.section||(this.section=e,this.notice=void 0,e==="scenes")||F(this.content)||be(this.content)||this.content.kind==="opaque")return;const i=this.library.items.find(r=>Vt(r.kind));if(i){await this.selectItem(i.id,t);return}this.isAdmin?this.openDefaultTemplate(t):(this.currentItem=void 0,this.name="")}async load(){const e=this.loadEpoch+1;this.loadEpoch=e,this.loading=!0,this.error=void 0,this.deploymentRevision=-1;const t=new $s(this.hass);this.api=t;try{const[i,r,n,a]=await Promise.all([t.info(),t.devices(),t.library(),t.customCatalogue()]);if(!this.loadIsCurrent(e,t))return;if(!ys(i))throw new Error("This editor bundle is not compatible with the installed backend.");this.devices=r,this.library=n,this.customCatalogue=a,this.selectedDeviceId=this.deviceIdFromPath()??r.find(u=>u.custom_effects.painted==="supported")?.config_entry_id??r[0]?.config_entry_id;const d=await t.subscribeLibrary(u=>{this.libraryChanged(u)},u=>this.subscriptionFailed(u,e,t));if(!this.loadIsCurrent(e,t)||this.error){d();return}if(this.unsubscribeLibrary=d,this.isAdmin){const u=await t.subscribeDeployments(f=>{f.revision<this.deploymentRevision||(this.deploymentRevision=f.revision,this.deployments=f.deployments,this.activeOperationId||(this.activeOperationId=this.latestDeployment(["pending","uploading","verifying","interrupted"])?.operation_id))},f=>this.subscriptionFailed(f,e,t));if(!this.loadIsCurrent(e,t)||this.error){u();return}this.unsubscribeDeployments=u}const l=n.items.find(u=>ze(u.kind));l?await this.selectItem(l.id):this.isAdmin&&this.openDefaultTemplate()}catch(i){this.loadIsCurrent(e,t)&&(this.stopSubscriptions(),this.error=X(i))}finally{this.loadIsCurrent(e,t)&&(this.loading=!1)}}openDefaultTemplate(e){this.newEffect("h617a_painted",e,{name:"Paint",content:ae(),selectionIdentity:"template:paint",templateLabel:"Paint"})}loadIsCurrent(e,t){return this.isConnected&&this.loadEpoch===e&&this.api===t}subscriptionFailed(e,t,i){this.loadIsCurrent(t,i)&&(this.error=e.message,this.loading=!1,queueMicrotask(()=>{this.loadIsCurrent(t,i)&&this.stopSubscriptions()}))}stopSubscriptions(){this.unsubscribeLibrary?.(),this.unsubscribeDeployments?.(),this.unsubscribeLibrary=void 0,this.unsubscribeDeployments=void 0}deviceIdFromPath(){const e=window.location.pathname.match(/\/ha-govee-led-ble\/editor\/([^/]+)/);return e?.[1]?decodeURIComponent(e[1]):void 0}async libraryChanged(e){const t=this.library.library_revision;if(e.library_revision<t||(this.library=e,!this.currentItem||e.library_revision===t))return;const i=e.items.find(a=>a.id===this.currentItem?.id);if(!i){if(this.deletingItemId===this.currentItem.id)return;this.notice="This effect was removed from the shared library.";return}if(i.revision===this.currentItem.revision)return;if(this.dirty){this.notice="This effect changed elsewhere. Reload it before saving.";return}const r=this.beginEditorTransition();await this.selectItem(i.id,r)&&this.editorTransitionIsCurrent(r)&&(this.notice="Loaded the latest shared revision.")}sceneLibraryItemSaved(e){this.library={library_revision:e.detail.library_revision,items:Gt(this.library.items,e.detail.item)}}sceneTemplateSelected(e){if(!this.isAdmin||e.detail.config_entry_id!==this.selectedDeviceId)return;const t=this.beginEditorTransition();this.currentItem=void 0,this.templateSourceLabel=void 0,this.customCopyStarted=!0,this.name=e.detail.name.trim()||"Layered scene template",this.content=ht(e.detail.content),this.savedBaseline=void 0,this.section="custom",this.customEffectCategory="all",this.customTemplateSelection=void 0,this.notice=void 0,this.selectNewEffectName(t)}backToScenes(){this.beginEditorTransition(),this.section="scenes",this.notice=void 0}beginEditorTransition(){return this.editorTransitionEpoch+=1,this.editorTransitionEpoch}editorTransitionIsCurrent(e){return e===this.editorTransitionEpoch}deviceChanged(e){this.beginEditorTransition(),this.selectedDeviceId=e.target.value,this.activeOperationId=void 0,this.activeOperationId=this.latestDeployment(["pending","uploading","verifying","interrupted"])?.operation_id,this.notice=this.applyAvailabilityNotice()}switchNewEffectType(e){if(!this.isAdmin||this.currentItem||this.templateSourceLabel||!B(this.content)||Ht(this.content)===e)return;if(e==="advanced"){this.newEffect("advanced");return}const t=e==="single"?"h617a_single":"h617a_multi";if(F(this.content)){this.switchCustomMode(t);return}this.newEffect(t)}switchCustomMode(e){if(!this.isAdmin||!this.customCatalogue||!F(this.content)||this.content.kind===e)return;const t=this.content;if(e==="h617a_single"&&t.kind==="h617a_multi"&&t.effects.length>1)return;let i;if(e==="h617a_painted"){const r=t.kind==="h617a_painted"?this.activePaintBrush:t.palette[0]?[...t.palette[0]]:[47,111,237];i={...ae(),speed:t.speed,groups:[{fill:[...r],segments:Array.from({length:et},(n,a)=>a)}]},t.kind!=="h617a_painted"&&(this.paintBrushes=Ns(t.palette),this.selectedPaintBrush=0),this.brushUsesBackground=!1}else if(t.kind==="h617a_painted"){const r=Ms(t);if(e==="h617a_single"){const n=ge(e,this.customCatalogue);i={...n,speed:t.speed,palette:r.length?r:n.palette}}else{const n=ge("h617a_multi",this.customCatalogue);i={...n,speed:t.speed,palette:r.length?r:n.palette}}}else if(e==="h617a_multi"&&t.kind==="h617a_single")i={kind:e,effects:[{family:t.family,variant:t.variant}],speed:t.speed,palette:t.palette.map(r=>[...r])};else if(e==="h617a_single"&&t.kind==="h617a_multi"){const r=t.effects[0];i={kind:e,family:r.family,variant:r.variant,speed:t.speed,palette:t.palette.map(n=>[...n])}}else return;this.content=i,/^New (Paint|Painted|Single|Multi) effect$/.test(this.name)&&(this.name=`New ${Ye(e)} effect`),this.notice=this.applyAvailabilityNotice()}newEffect(e,t,i){const r=t??this.beginEditorTransition();!this.api||!this.isAdmin||e!=="advanced"&&!this.customCatalogue||(this.currentItem=void 0,this.templateSourceLabel=i?.templateLabel,this.customCopyStarted=i?.templateLabel!==void 0,this.customTemplateSelection=e==="advanced"?void 0:i?.selectionIdentity??(e==="h617a_painted"?"template:paint":void 0),this.name=i?.name??`New ${Ye(e)} effect`,this.content=i?.content??(e==="advanced"?Dt():ge(e,this.customCatalogue)),e==="h617a_painted"&&(this.brushUsesBackground=!1),this.savedBaseline=void 0,this.notice=this.applyAvailabilityNotice(),this.selectNewEffectName(r))}selectNewEffectName(e){this.updateComplete.then(()=>{if(!this.editorTransitionIsCurrent(e)||this.currentItem||this.templateSourceLabel)return;const t=this.shadowRoot?.querySelector(".editor .name-input");t?.focus(),t?.select()})}renderEditorDeleteButton(){return!this.isAdmin||!this.currentItem?c:o`
      <button
        class="danger"
        type="button"
        ?disabled=${this.deletingItemId!==void 0||this.saving||this.applying}
        @click=${e=>this.requestDelete({id:this.currentItem.id,revision:this.currentItem.revision,name:this.currentItem.name},e.currentTarget)}
      >
        ${this.deletingCurrentItem?"Deleting...":"Delete"}
      </button>
    `}requestDelete(e,t){!this.api||!this.isAdmin||this.deletingItemId!==void 0||this.saving||this.applying||(this.deleteCandidate={...e},this.deleteReturnFocus=t,this.notice=void 0,this.updateComplete.then(()=>{this.shadowRoot?.querySelector(".delete-dialog .danger")?.focus()}))}cancelDelete(){const e=this.deleteReturnFocus;this.deleteCandidate=void 0,this.deleteReturnFocus=void 0,this.updateComplete.then(()=>{e?.isConnected&&e.focus()})}deleteDialogKeyDown(e){e.key==="Escape"&&(e.preventDefault(),this.cancelDelete())}async confirmDelete(){const e=this.deleteCandidate,t=this.api;if(!e||!t||!this.isAdmin||this.deletingItemId!==void 0)return;const i=this.library.library_revision;this.deleteCandidate=void 0,this.deleteReturnFocus=void 0,this.deletingItemId=e.id,this.notice=void 0;try{const r=await t.deleteItem(e,i);r>=this.library.library_revision&&(this.library={library_revision:r,items:this.library.items.filter(n=>n.id!==e.id)}),this.currentItem?.id===e.id&&this.currentItem.revision===e.revision&&(this.beginEditorTransition(),this.currentItem=void 0,this.templateSourceLabel=void 0,this.customCopyStarted=!1,this.customTemplateSelection=void 0,this.name="",this.content=ae(),this.savedBaseline=void 0),this.notice=`Deleted ${e.name}.`}catch(r){const n=Xt(r)==="conflict";if(this.notice=n?"This effect or library changed elsewhere. Reload before deleting.":`Delete failed: ${X(r)}`,n)try{const a=await t.library();a.library_revision>=this.library.library_revision&&(this.library=a)}catch(a){this.notice+=` Library refresh failed: ${X(a)}`}}finally{this.deletingItemId=void 0}}async selectItem(e,t){const i=t??this.beginEditorTransition();if(!this.api)return!1;try{const r=await this.api.item(e);return this.editorTransitionIsCurrent(i)?r.content.kind==="opaque"?(this.currentItem=r,this.templateSourceLabel=void 0,this.customCopyStarted=!1,this.customTemplateSelection=void 0,this.name=r.name,this.content=Ls(r.content),this.savedBaseline=void 0,this.notice="This effect definition is preserved, but this editor cannot change or apply it.",!0):B(r.content)?(this.currentItem=r,this.templateSourceLabel=void 0,this.customCopyStarted=!1,this.customTemplateSelection=void 0,this.name=r.name,this.content=Ke(r.content),r.content.kind==="h617a_painted"&&(this.brushUsesBackground=!1),this.savedBaseline=G(r.name,r.content),this.notice=this.applyAvailabilityNotice(),!0):(this.notice="This item cannot be edited here.",!1):!1}catch(r){return this.editorTransitionIsCurrent(i)&&(this.notice=X(r)),!1}}nameChanged(e){this.name=e.target.value}saveAsCustom(){const e=this.templateSourceLabel;if(!e||!this.isAdmin)return;const t=this.beginEditorTransition();this.templateSourceLabel=void 0,this.customTemplateSelection=void 0,this.customCopyStarted=!0,this.name=`Custom ${e}`,this.savedBaseline=void 0,this.selectNewEffectName(t)}paintBrushesChanged(e){this.paintBrushes=e.detail.palette.map(t=>[...t]),this.selectedPaintBrush=Math.max(0,Math.min(this.selectedPaintBrush,this.paintBrushes.length-1)),this.brushUsesBackground=!1}paintBrushSelected(e){this.selectedPaintBrush=e.detail.index,this.brushUsesBackground=!1}get activePaintBrush(){return[...this.paintBrushes[this.selectedPaintBrush]??this.paintBrushes[0]??[47,111,237]]}backgroundChanged(e){this.updateContent({background:Rs(e.target.value)})}singleEffectChanged(e){if(!this.customCatalogue||this.currentItem?.content.kind==="opaque")return;const t=e.target.value;if(this.currentItem&&(this.content.kind==="h617a_painted"&&t!=="paint"||this.content.kind==="h617a_single"&&t==="paint"))return;const i=this.templateSourceLabel!==void 0||this.customTemplateSelection!==void 0;if(t==="paint"){this.content.kind!=="h617a_painted"&&this.switchCustomMode("h617a_painted"),i&&(this.customTemplateSelection="template:paint"),this.updateGeneratedEffectName("Paint");return}const r=this.customCatalogue.effects.find(a=>a.id===t),n=r?.variations[0];!r||!n||(this.content.kind==="h617a_painted"&&this.switchCustomMode("h617a_single"),this.content.kind==="h617a_single"&&(this.content={...this.content,family:r.family,variant:n.variant},i&&(this.customTemplateSelection=`template:single:${r.family}:${n.variant}`),this.updateGeneratedEffectName(r.label)))}singleEffectVariationChanged(e){const t=e.target.value;if(this.content.kind==="h617a_painted"){this.updateContent({effect:t});return}this.content.kind==="h617a_single"&&(this.content={...this.content,variant:Number(t)})}updateGeneratedEffectName(e){if(this.templateSourceLabel){this.templateSourceLabel=e,this.name=e;return}!this.currentItem&&/^New .+ effect$/.test(this.name)&&(this.name=`New ${e} effect`)}setSegmentColour(e){if(this.content.kind!=="h617a_painted")return;const t=tt(this.content);t[e]=this.brushUsesBackground?[...this.content.background]:this.activePaintBrush,this.content={...this.content,groups:zt(t,this.content.background)}}paintAll(){if(this.content.kind!=="h617a_painted")return;const e=this.brushUsesBackground?this.content.background:this.activePaintBrush;this.content={...this.content,groups:zt(Array.from({length:et},()=>[...e]),this.content.background)}}resetPaint(){this.content.kind==="h617a_painted"&&(this.content={...this.content,groups:[]})}updateContent(e){this.content.kind==="h617a_painted"&&(this.content={...this.content,...e})}async save(){if(!this.api||!this.isAdmin||!this.dirty||this.saving||this.deletingCurrentItem||!B(this.content))return;const e=this.api,t=this.name.trim();if(!t){this.notice="Give this effect a name before saving.";return}const i=this.beginEditorTransition(),r=this.currentItem,n=Ke(this.content),a=this.library.library_revision;this.saving=!0,this.notice=void 0;try{const d=r?await e.updateItem(r,t,n,a):await e.createItem(t,n,a);if(!B(d.item.content))throw new Error("The saved effect returned an unsupported definition.");const l=d.item.content;d.library_revision>=this.library.library_revision&&(this.library={library_revision:d.library_revision,items:Gt(this.library.items,d.item)}),this.editorTransitionIsCurrent(i)&&jt(this.currentItem,r)&&B(this.content)&&G(this.name,this.content)===G(t,n)&&(this.currentItem=d.item,this.customTemplateSelection=void 0,this.name=d.item.name,this.content=Ke(l),this.savedBaseline=G(this.name,this.content)),this.editorTransitionIsCurrent(i)&&jt(this.currentItem,d.item)&&B(this.content)&&G(this.name,this.content)===G(d.item.name,l)&&(this.notice="Saved.")}catch(d){if(Xt(d)==="conflict"){const l="This effect or library changed elsewhere. Reload before saving.";this.editorTransitionIsCurrent(i)&&(this.notice=l);try{const u=await e.library();u.library_revision>=this.library.library_revision&&(this.library=u)}catch(u){this.editorTransitionIsCurrent(i)&&(this.notice=`${l} Library refresh failed: `+X(u))}}else this.editorTransitionIsCurrent(i)&&(this.notice=`Save failed: ${X(d)}`)}finally{this.saving=!1}}async apply(){if(!this.api||!this.canApply||!F(this.content)||!this.selectedDeviceId)return;const e=this.name.trim(),t=this.selectedDeviceId,i=this.editorTransitionEpoch;this.activeOperationId=void 0,this.applying=!0,this.notice=void 0;try{const r=!this.dirty&&this.currentItem?await this.api.applySaved(t,this.currentItem):await this.api.applySnapshot(t,e,this.content);if(i!==this.editorTransitionEpoch||t!==this.selectedDeviceId)return;this.activeOperationId=r.operation_id,this.deployments=[r,...this.deployments.filter(n=>n.operation_id!==r.operation_id)]}catch(r){i===this.editorTransitionEpoch&&t===this.selectedDeviceId&&(this.notice=`Apply failed: ${X(r)}`)}finally{this.applying=!1}}applyAvailabilityNotice(){if(!be(this.content))return this.selectedDeviceId&&!this.selectedDevice?"This device is temporarily unavailable in Home Assistant. Apply is disabled until it is loaded.":this.applyCapability==="supported"?void 0:`${Ye(this.content.kind)} effects cannot be applied to this device.`}latestDeployment(e){return[...this.deployments].filter(t=>t.config_entry_id===this.selectedDeviceId&&e.includes(t.phase)).sort((t,i)=>i.updated_at.localeCompare(t.updated_at))[0]}static{this.styles=J`
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
      min-height: 100vh;
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

    .visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      margin: -1px;
      padding: 0;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
      border: 0;
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

    .danger {
      padding: 8px 17px;
      border: 1px solid var(--error-color, #db4437);
      border-radius: 9px;
      color: var(--error-color, #db4437);
      background: var(--studio-card);
      font-weight: 600;
      cursor: pointer;
    }

    .danger:hover,
    .danger:focus-visible {
      color: var(--text-primary-color, #fff);
      background: var(--error-color, #db4437);
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

    .read-only,
    .source-note,
    .deployment {
      margin-bottom: 18px;
      padding: 12px 14px;
      border: 1px solid var(--studio-border);
      border-radius: 9px;
      background: var(--studio-card);
      line-height: 1.45;
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

    .single-effect-settings {
      margin-bottom: 18px;
    }

    .single-effect-fields {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
    }

    .single-effect-fields label {
      display: grid;
      gap: 7px;
      color: var(--studio-muted);
      font-size: 13px;
      font-weight: 600;
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

    .background-colour label {
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

      .single-effect-fields {
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
  `}}_([v({attribute:!1})],$.prototype,"hass");_([v({attribute:!1})],$.prototype,"panel");_([v({type:Boolean})],$.prototype,"showDevicePicker");_([h()],$.prototype,"loading");_([h()],$.prototype,"error");_([h()],$.prototype,"notice");_([h()],$.prototype,"devices");_([h()],$.prototype,"selectedDeviceId");_([h()],$.prototype,"section");_([h()],$.prototype,"customEffectCategory");_([h()],$.prototype,"customTemplateSelection");_([h()],$.prototype,"templateSourceLabel");_([h()],$.prototype,"customCopyStarted");_([h()],$.prototype,"library");_([h()],$.prototype,"customCatalogue");_([h()],$.prototype,"currentItem");_([h()],$.prototype,"name");_([h()],$.prototype,"content");_([h()],$.prototype,"paintBrushes");_([h()],$.prototype,"selectedPaintBrush");_([h()],$.prototype,"brushUsesBackground");_([h()],$.prototype,"saving");_([h()],$.prototype,"applying");_([h()],$.prototype,"deleteCandidate");_([h()],$.prototype,"deletingItemId");_([h()],$.prototype,"deployments");_([h()],$.prototype,"activeOperationId");function ae(){return{kind:"h617a_painted",effect:"clockwise",speed:50,brightness:100,background:[0,0,0],groups:[]}}function ge(s,e){if(s==="h617a_painted")return ae();const t=s==="h617a_multi"?e.effects.find(n=>n.supports_multi):e.effects[0];if(!t)throw new Error("The custom-effect catalogue has no compatible effects.");const i=t.variations[0],r={family:t.family,variant:i.variant};return s==="h617a_single"?{kind:s,...r,speed:50,palette:Be()}:{kind:s,effects:[r],speed:50,palette:Be()}}function Ps(s){return{...s,background:[...s.background],groups:s.groups.map(e=>({fill:[...e.fill],segments:[...e.segments]}))}}function bi(s){return s.kind==="h617a_painted"?Ps(s):s.kind==="h617a_single"?{...s,palette:s.palette.map(e=>[...e])}:{...s,effects:s.effects.map(e=>({...e})),palette:s.palette.map(e=>[...e])}}function Ke(s){return s.kind==="advanced"?xe(s):s.kind==="scene_layered"?ht(s):bi(s)}function Ls(s){return{...s,body:structuredClone(s.body)}}function ht(s){return{...s,template:{...s.template},effect:{layers:xe({layers:s.effect.layers}).layers}}}function Ds(s){return s.kind==="advanced"?s:{kind:"advanced",layers:s.effect.layers}}function Ts(s,e){return s.kind==="advanced"?xe(e):{...ht(s),effect:{layers:xe(e).layers}}}function Be(){return[[255,0,0],[255,127,0],[255,255,0],[0,255,0],[0,0,255],[0,255,255],[139,0,255]]}function Ns(s){const e=[];for(const t of[...s,...Be()])if(e.some(i=>Re(i,t))||e.push([...t]),e.length===8)break;return e}function tt(s){const e=Array.from({length:et},()=>[...s.background]);for(const t of s.groups)for(const i of t.segments)e[i]=[...t.fill];return e}function zt(s,e){const t=new Map;return s.forEach((i,r)=>{if(Re(i,e))return;const n=i.join(","),a=t.get(n);a?a.segments.push(r):t.set(n,{fill:[...i],segments:[r]})}),[...t.values()]}function Ms(s){const e=[];for(const t of tt(s))if(!Re(t,s.background)&&!e.some(i=>Re(i,t))&&e.push([...t]),e.length===8)break;return e}function Re(s,e){return s[0]===e[0]&&s[1]===e[1]&&s[2]===e[2]}function Bs(s){return`#${s.map(e=>e.toString(16).padStart(2,"0")).join("")}`}function Rs(s){return[Number.parseInt(s.slice(1,3),16),Number.parseInt(s.slice(3,5),16),Number.parseInt(s.slice(5,7),16)]}function G(s,e){return JSON.stringify({name:s.trim(),content:e})}function ze(s){return s==="h617a_painted"||s==="h617a_single"||s==="h617a_multi"}function F(s){return typeof s=="object"&&s!==null&&"kind"in s&&ze(s.kind)}function B(s){return F(s)||typeof s=="object"&&s!==null&&"kind"in s&&Ee(s.kind)}function Ht(s){return s.kind==="h617a_multi"?"multi":Ee(s.kind)?"advanced":s.kind==="h617a_painted"||s.kind==="h617a_single"?"single":void 0}function Ee(s){return s==="advanced"||s==="scene_layered"}function be(s){return Ee(s.kind)}function Os(s){return ze(s)||Ee(s)||s==="scene_builtin"||s==="scene_palette"}function Ye(s){switch(s){case"h617a_painted":return"Paint";case"h617a_single":return"Single";case"h617a_multi":return"Multi";case"advanced":return"Layered";default:return"Custom"}}function Fs(s,e){return s.localeCompare(e,"en-AU",{sensitivity:"base"})}function Vt(s){return ze(s)||Ee(s)||!Os(s)}function Us(s){return s==="h617a_multi"?"multi-layer":s==="h617a_painted"||s==="h617a_single"?"single-layer":"advanced"}function jt(s,e){return s?.id===e?.id&&s?.revision===e?.revision}function Gt(s,e){return[...s.filter(t=>t.id!==e.id),{id:e.id,revision:e.revision,name:e.name,kind:e.content.kind==="opaque"?e.content.source_kind:e.content.kind,..."template"in e.content?{template:e.content.template}:{}}].sort((t,i)=>t.name.localeCompare(i.name))}function X(s){return s instanceof Error||typeof s=="object"&&s!==null&&"message"in s&&typeof s.message=="string"?s.message:"An unexpected error occurred."}function Xt(s){if(typeof s=="object"&&s!==null&&"code"in s&&typeof s.code=="string")return s.code}customElements.get("ha-govee-led-ble-editor")||customElements.define("ha-govee-led-ble-editor",$);
