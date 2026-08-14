const De=globalThis,st=De.ShadowRoot&&(De.ShadyCSS===void 0||De.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,rt=Symbol(),mt=new WeakMap;let Gt=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==rt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(st&&e===void 0){const i=t!==void 0&&t.length===1;i&&(e=mt.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&mt.set(t,e))}return e}toString(){return this.cssText}};const vi=s=>new Gt(typeof s=="string"?s:s+"",void 0,rt),W=(s,...e)=>{const t=s.length===1?s[0]:e.reduce((i,r,n)=>i+(a=>{if(a._$cssResult$===!0)return a.cssText;if(typeof a=="number")return a;throw Error("Value passed to 'css' function must be a 'css' function result: "+a+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+s[n+1],s[0]);return new Gt(t,s,rt)},yi=(s,e)=>{if(st)s.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const i=document.createElement("style"),r=De.litNonce;r!==void 0&&i.setAttribute("nonce",r),i.textContent=t.cssText,s.appendChild(i)}},ft=st?s=>s:s=>s instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return vi(t)})(s):s;const{is:$i,defineProperty:xi,getOwnPropertyDescriptor:_i,getOwnPropertyNames:wi,getOwnPropertySymbols:ki,getPrototypeOf:Ii}=Object,Ue=globalThis,gt=Ue.trustedTypes,Ei=gt?gt.emptyScript:"",Ci=Ue.reactiveElementPolyfillSupport,ve=(s,e)=>s,Ne={toAttribute(s,e){switch(e){case Boolean:s=s?Ei:null;break;case Object:case Array:s=s==null?s:JSON.stringify(s)}return s},fromAttribute(s,e){let t=s;switch(e){case Boolean:t=s!==null;break;case Number:t=s===null?null:Number(s);break;case Object:case Array:try{t=JSON.parse(s)}catch{t=null}}return t}},nt=(s,e)=>!$i(s,e),bt={attribute:!0,type:String,converter:Ne,reflect:!1,useDefault:!1,hasChanged:nt};Symbol.metadata??=Symbol("metadata"),Ue.litPropertyMetadata??=new WeakMap;let re=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=bt){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),r=this.getPropertyDescriptor(e,i,t);r!==void 0&&xi(this.prototype,e,r)}}static getPropertyDescriptor(e,t,i){const{get:r,set:n}=_i(this.prototype,e)??{get(){return this[t]},set(a){this[t]=a}};return{get:r,set(a){const d=r?.call(this);n?.call(this,a),this.requestUpdate(e,d,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??bt}static _$Ei(){if(this.hasOwnProperty(ve("elementProperties")))return;const e=Ii(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(ve("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(ve("properties"))){const t=this.properties,i=[...wi(t),...ki(t)];for(const r of i)this.createProperty(r,t[r])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[i,r]of t)this.elementProperties.set(i,r)}this._$Eh=new Map;for(const[t,i]of this.elementProperties){const r=this._$Eu(t,i);r!==void 0&&this._$Eh.set(r,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const r of i)t.unshift(ft(r))}else e!==void 0&&t.push(ft(e));return t}static _$Eu(e,t){const i=t.attribute;return i===!1?void 0:typeof i=="string"?i:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return yi(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,i);if(r!==void 0&&i.reflect===!0){const n=(i.converter?.toAttribute!==void 0?i.converter:Ne).toAttribute(t,i.type);this._$Em=e,n==null?this.removeAttribute(r):this.setAttribute(r,n),this._$Em=null}}_$AK(e,t){const i=this.constructor,r=i._$Eh.get(e);if(r!==void 0&&this._$Em!==r){const n=i.getPropertyOptions(r),a=typeof n.converter=="function"?{fromAttribute:n.converter}:n.converter?.fromAttribute!==void 0?n.converter:Ne;this._$Em=r;const d=a.fromAttribute(t,n.type);this[r]=d??this._$Ej?.get(r)??d,this._$Em=null}}requestUpdate(e,t,i,r=!1,n){if(e!==void 0){const a=this.constructor;if(r===!1&&(n=this[e]),i??=a.getPropertyOptions(e),!((i.hasChanged??nt)(n,t)||i.useDefault&&i.reflect&&n===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,i))))return;this.C(e,t,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:r,wrapped:n},a){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),n!==!0||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),r===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[r,n]of this._$Ep)this[r]=n;this._$Ep=void 0}const i=this.constructor.elementProperties;if(i.size>0)for(const[r,n]of i){const{wrapped:a}=n,d=this[r];a!==!0||this._$AL.has(r)||d===void 0||this.C(r,void 0,n,d)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(i=>i.hostUpdate?.()),this.update(t)):this._$EM()}catch(i){throw e=!1,this._$EM(),i}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};re.elementStyles=[],re.shadowRootOptions={mode:"open"},re[ve("elementProperties")]=new Map,re[ve("finalized")]=new Map,Ci?.({ReactiveElement:re}),(Ue.reactiveElementVersions??=[]).push("2.1.2");const at=globalThis,vt=s=>s,Me=at.trustedTypes,yt=Me?Me.createPolicy("lit-html",{createHTML:s=>s}):void 0,Xt="$lit$",U=`lit$${Math.random().toFixed(9).slice(2)}$`,Yt="?"+U,Si=`<${Yt}>`,Y=document,ye=()=>Y.createComment(""),$e=s=>s===null||typeof s!="object"&&typeof s!="function",ot=Array.isArray,Ai=s=>ot(s)||typeof s?.[Symbol.iterator]=="function",Ke=`[ 	
\f\r]`,pe=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,$t=/-->/g,xt=/>/g,j=RegExp(`>|${Ke}(?:([^\\s"'>=/]+)(${Ke}*=${Ke}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),_t=/'/g,wt=/"/g,Wt=/^(?:script|style|textarea|title)$/i,Pi=s=>(e,...t)=>({_$litType$:s,strings:e,values:t}),o=Pi(1),de=Symbol.for("lit-noChange"),l=Symbol.for("lit-nothing"),kt=new WeakMap,G=Y.createTreeWalker(Y,129);function Jt(s,e){if(!ot(s)||!s.hasOwnProperty("raw"))throw Error("invalid template strings array");return yt!==void 0?yt.createHTML(e):e}const Di=(s,e)=>{const t=s.length-1,i=[];let r,n=e===2?"<svg>":e===3?"<math>":"",a=pe;for(let d=0;d<t;d++){const c=s[d];let u,b,v=-1,P=0;for(;P<c.length&&(a.lastIndex=P,b=a.exec(c),b!==null);)P=a.lastIndex,a===pe?b[1]==="!--"?a=$t:b[1]!==void 0?a=xt:b[2]!==void 0?(Wt.test(b[2])&&(r=RegExp("</"+b[2],"g")),a=j):b[3]!==void 0&&(a=j):a===j?b[0]===">"?(a=r??pe,v=-1):b[1]===void 0?v=-2:(v=a.lastIndex-b[2].length,u=b[1],a=b[3]===void 0?j:b[3]==='"'?wt:_t):a===wt||a===_t?a=j:a===$t||a===xt?a=pe:(a=j,r=void 0);const M=a===j&&s[d+1].startsWith("/>")?" ":"";n+=a===pe?c+Si:v>=0?(i.push(u),c.slice(0,v)+Xt+c.slice(v)+U+M):c+U+(v===-2?d:M)}return[Jt(s,n+(s[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),i]};class xe{constructor({strings:e,_$litType$:t},i){let r;this.parts=[];let n=0,a=0;const d=e.length-1,c=this.parts,[u,b]=Di(e,t);if(this.el=xe.createElement(u,i),G.currentNode=this.el.content,t===2||t===3){const v=this.el.content.firstChild;v.replaceWith(...v.childNodes)}for(;(r=G.nextNode())!==null&&c.length<d;){if(r.nodeType===1){if(r.hasAttributes())for(const v of r.getAttributeNames())if(v.endsWith(Xt)){const P=b[a++],M=r.getAttribute(v).split(U),Se=/([.?@])?(.*)/.exec(P);c.push({type:1,index:n,name:Se[2],strings:M,ctor:Se[1]==="."?Li:Se[1]==="?"?Ni:Se[1]==="@"?Mi:qe}),r.removeAttribute(v)}else v.startsWith(U)&&(c.push({type:6,index:n}),r.removeAttribute(v));if(Wt.test(r.tagName)){const v=r.textContent.split(U),P=v.length-1;if(P>0){r.textContent=Me?Me.emptyScript:"";for(let M=0;M<P;M++)r.append(v[M],ye()),G.nextNode(),c.push({type:2,index:++n});r.append(v[P],ye())}}}else if(r.nodeType===8)if(r.data===Yt)c.push({type:2,index:n});else{let v=-1;for(;(v=r.data.indexOf(U,v+1))!==-1;)c.push({type:7,index:n}),v+=U.length-1}n++}}static createElement(e,t){const i=Y.createElement("template");return i.innerHTML=e,i}}function le(s,e,t=s,i){if(e===de)return e;let r=i!==void 0?t._$Co?.[i]:t._$Cl;const n=$e(e)?void 0:e._$litDirective$;return r?.constructor!==n&&(r?._$AO?.(!1),n===void 0?r=void 0:(r=new n(s),r._$AT(s,t,i)),i!==void 0?(t._$Co??=[])[i]=r:t._$Cl=r),r!==void 0&&(e=le(s,r._$AS(s,e.values),r,i)),e}class Ti{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,r=(e?.creationScope??Y).importNode(t,!0);G.currentNode=r;let n=G.nextNode(),a=0,d=0,c=i[0];for(;c!==void 0;){if(a===c.index){let u;c.type===2?u=new Ie(n,n.nextSibling,this,e):c.type===1?u=new c.ctor(n,c.name,c.strings,this,e):c.type===6&&(u=new Bi(n,this,e)),this._$AV.push(u),c=i[++d]}a!==c?.index&&(n=G.nextNode(),a++)}return G.currentNode=Y,r}p(e){let t=0;for(const i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class Ie{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,r){this.type=2,this._$AH=l,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=le(this,e,t),$e(e)?e===l||e==null||e===""?(this._$AH!==l&&this._$AR(),this._$AH=l):e!==this._$AH&&e!==de&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Ai(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==l&&$e(this._$AH)?this._$AA.nextSibling.data=e:this.T(Y.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,r=typeof i=="number"?this._$AC(e):(i.el===void 0&&(i.el=xe.createElement(Jt(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===r)this._$AH.p(t);else{const n=new Ti(r,this),a=n.u(this.options);n.p(t),this.T(a),this._$AH=n}}_$AC(e){let t=kt.get(e.strings);return t===void 0&&kt.set(e.strings,t=new xe(e)),t}k(e){ot(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,r=0;for(const n of e)r===t.length?t.push(i=new Ie(this.O(ye()),this.O(ye()),this,this.options)):i=t[r],i._$AI(n),r++;r<t.length&&(this._$AR(i&&i._$AB.nextSibling,r),t.length=r)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const i=vt(e).nextSibling;vt(e).remove(),e=i}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}}class qe{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,r,n){this.type=1,this._$AH=l,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=n,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=l}_$AI(e,t=this,i,r){const n=this.strings;let a=!1;if(n===void 0)e=le(this,e,t,0),a=!$e(e)||e!==this._$AH&&e!==de,a&&(this._$AH=e);else{const d=e;let c,u;for(e=n[0],c=0;c<n.length-1;c++)u=le(this,d[i+c],t,c),u===de&&(u=this._$AH[c]),a||=!$e(u)||u!==this._$AH[c],u===l?e=l:e!==l&&(e+=(u??"")+n[c+1]),this._$AH[c]=u}a&&!r&&this.j(e)}j(e){e===l?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class Li extends qe{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===l?void 0:e}}class Ni extends qe{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==l)}}class Mi extends qe{constructor(e,t,i,r,n){super(e,t,i,r,n),this.type=5}_$AI(e,t=this){if((e=le(this,e,t,0)??l)===de)return;const i=this._$AH,r=e===l&&i!==l||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,n=e!==l&&(i===l||r);r&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class Bi{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){le(this,e)}}const Ri=at.litHtmlPolyfillSupport;Ri?.(xe,Ie),(at.litHtmlVersions??=[]).push("3.3.3");const Oi=(s,e,t)=>{const i=t?.renderBefore??e;let r=i._$litPart$;if(r===void 0){const n=t?.renderBefore??null;i._$litPart$=r=new Ie(e.insertBefore(ye(),n),n,void 0,t??{})}return r._$AI(s),r};const dt=globalThis;class D extends re{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Oi(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return de}}D._$litElement$=!0,D.finalized=!0,dt.litElementHydrateSupport?.({LitElement:D});const Fi=dt.litElementPolyfillSupport;Fi?.({LitElement:D});(dt.litElementVersions??=[]).push("4.2.2");const Ui={attribute:!0,type:String,converter:Ne,reflect:!1,hasChanged:nt},qi=(s=Ui,e,t)=>{const{kind:i,metadata:r}=t;let n=globalThis.litPropertyMetadata.get(r);if(n===void 0&&globalThis.litPropertyMetadata.set(r,n=new Map),i==="setter"&&((s=Object.create(s)).wrapped=!0),n.set(t.name,s),i==="accessor"){const{name:a}=t;return{set(d){const c=e.get.call(this);e.set.call(this,d),this.requestUpdate(a,c,s,!0,d)},init(d){return d!==void 0&&this.C(a,void 0,s,d),d}}}if(i==="setter"){const{name:a}=t;return function(d){const c=this[a];e.call(this,d),this.requestUpdate(a,c,s,!0,d)}}throw Error("Unsupported decorator location: "+i)};function g(s){return(e,t)=>typeof t=="object"?qi(s,e,t):((i,r,n)=>{const a=r.hasOwnProperty(n);return r.constructor.createProperty(n,i),a?Object.getOwnPropertyDescriptor(r,n):void 0})(s,e,t)}function h(s){return g({...s,state:!0,attribute:!1})}var zi=Object.defineProperty,J=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&zi(e,t,r),r};class z extends D{constructor(){super(...arguments),this.items=[],this.ariaLabel="Items",this.itemRole="button",this.addLabel="Add item",this.addDisabled=!1,this.reorderDisabled=!1,this.pointerX=0,this.pointerY=0,this.pointerMoved=!1,this.suppressClick=!1}render(){const e=this.itemRole==="tab";return o`
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
    `}focusItem(e){this.updateComplete.then(()=>{this.shadowRoot?.querySelectorAll(".item")[e]?.focus()})}itemClicked(e){if(this.suppressClick){this.suppressClick=!1;return}this.dispatchEvent(new CustomEvent("item-selected",{detail:{index:e},bubbles:!0,composed:!0}))}addClicked(){this.dispatchEvent(new CustomEvent("item-added",{bubbles:!0,composed:!0}))}dragStarted(e,t){this.reorderDisabled||(this.draggedIndex=e,t.dataTransfer?.setData("text/plain",String(e)))}dropped(e,t){t.preventDefault(),this.draggedIndex!==void 0&&(this.reorder(this.draggedIndex,e),this.draggedIndex=void 0)}keyPressed(e,t){if(t.key!=="ArrowLeft"&&t.key!=="ArrowRight")return;t.preventDefault();const i=e+(t.key==="ArrowLeft"?-1:1);if(!(i<0||i>=this.items.length)){if(this.reorderDisabled){this.itemRole==="tab"&&(this.itemClicked(i),this.focusItem(i));return}this.reorder(e,i,!0)}}pointerStarted(e,t){this.reorderDisabled||t.pointerType==="mouse"||t.target.closest(".strip-popover")||(this.pointerId=t.pointerId,this.pointerIndex=e,this.pointerX=t.clientX,this.pointerY=t.clientY,this.pointerMoved=!1,t.currentTarget.setPointerCapture(t.pointerId))}pointerMovedOver(e){if(e.pointerId!==this.pointerId||this.pointerIndex===void 0)return;const t=e.clientX-this.pointerX,i=e.clientY-this.pointerY;if(!this.pointerMoved){if(Math.abs(i)>Math.abs(t)||Math.abs(t)<10)return;this.pointerMoved=!0}e.preventDefault();const r=this.shadowRoot?.elementFromPoint(e.clientX,e.clientY)?.closest("[data-item-index]"),n=Number(r?.dataset.itemIndex);!Number.isInteger(n)||n===this.pointerIndex||(this.reorder(this.pointerIndex,n),this.pointerIndex=n)}pointerFinished(e){if(e.pointerId!==this.pointerId)return;const t=e.currentTarget;t.hasPointerCapture(e.pointerId)&&t.releasePointerCapture(e.pointerId),this.suppressClick=this.pointerMoved,this.pointerId=void 0,this.pointerIndex=void 0,this.pointerMoved=!1}reorder(e,t,i=!1){this.reorderDisabled||e===t||(this.dispatchEvent(new CustomEvent("items-reordered",{detail:{from:e,to:t},bubbles:!0,composed:!0})),i&&this.focusItem(t))}static{this.styles=W`
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
  `}}J([g({attribute:!1})],z.prototype,"items");J([g({attribute:!1})],z.prototype,"activeIndex");J([g()],z.prototype,"ariaLabel");J([g()],z.prototype,"itemRole");J([g()],z.prototype,"addLabel");J([g({type:Boolean})],z.prototype,"addDisabled");J([g({type:Boolean})],z.prototype,"reorderDisabled");customElements.get("govee-reorderable-strip")||customElements.define("govee-reorderable-strip",z);var Hi=Object.defineProperty,N=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&Hi(e,t,r),r};const Ze=17,Zt="ha_govee_led_ble/effect_studio/recent_colours",Te=[[255,69,58],[255,159,10],[255,214,10],[48,209,88],[99,230,226],[100,210,255],[10,132,255],[94,92,230],[191,90,242],[255,45,85],[172,142,104],[255,255,255],[174,174,178],[99,99,102],[28,28,30],[255,127,0],[139,0,255]];let ae=ji();class L extends D{constructor(){super(...arguments),this.palette=[],this.minColours=1,this.maxColours=8,this.disabled=!1,this.persistentPicker=!1,this.ariaLabel="Colours",this.itemName="colour",this.windowPointerDown=e=>{this.editingIndex!==void 0&&!e.composedPath().includes(this)&&(this.editingIndex=void 0)}}connectedCallback(){super.connectedCallback(),window.addEventListener("pointerdown",this.windowPointerDown)}disconnectedCallback(){window.removeEventListener("pointerdown",this.windowPointerDown),super.disconnectedCallback()}willUpdate(e){e.has("palette")&&this.editingIndex!==void 0&&this.editingIndex>=this.palette.length&&(this.editingIndex=void 0)}render(){const e=this.persistentPicker?this.selectedIndex:this.editingIndex,t=this.palette.map((i,r)=>({key:`${r}-${_(i)}`,label:`${It(this.itemName)} ${r+1}`,ariaLabel:this.itemAriaLabel(i,r),colour:_(i),removeReady:!this.persistentPicker&&this.editingIndex===r&&this.palette.length>this.minColours,disabled:this.disabled}));return o`
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
          `:l}
    `}itemAriaLabel(e,t){const i=`${It(this.itemName)} ${t+1}`;return this.persistentPicker?`${i}, ${_(e)}${t===this.selectedIndex?", selected":""}`:this.editingIndex===t&&this.palette.length>this.minColours?`Remove colour ${t+1}`:`Edit colour ${t+1}, ${_(e)}. Drag to reorder or use arrow keys.`}renderPopover(e,t){return o`
      <div class="preset-grid">
        ${ae.map(i=>o`
            <button
              type="button"
              style="--preset-colour: ${_(i)}"
              aria-label="Use ${_(i)}"
              ?disabled=${this.disabled}
              @click=${()=>this.commitColour(e,i)}
            ></button>
          `)}
        <label
          class="custom-colour"
          style="--custom-colour: ${_(t)}"
        >
          <input
            type="color"
            aria-label="Custom colour"
            .value=${_(t)}
            ?disabled=${this.disabled}
            @input=${i=>this.updateColour(e,Ct(i.target.value))}
            @change=${i=>this.commitColour(e,Ct(i.target.value))}
          />
        </label>
      </div>
    `}commitColour(e,t){Ki(t),this.updateColour(e,t),!this.persistentPicker&&(this.editingIndex=void 0,this.focusSwatchAfterUpdate(e))}updateColour(e,t){const i=oe(this.palette);i[e]=[...t],this.emitPalette(i)}addColour(){if(this.disabled||this.palette.length>=this.maxColours)return;const e=this.palette[this.palette.length-1]??ae[this.palette.length%ae.length],t=[...oe(this.palette),[...e]],i=t.length-1;this.persistentPicker?this.selectColour(i,t[i]):this.editingIndex=i,this.emitPalette(t)}removeColour(e){if(this.disabled||this.palette.length<=this.minColours)return;const t=this.palette.filter((r,n)=>n!==e).map(r=>[...r]),i=Math.min(e,t.length-1);this.editingIndex=void 0,this.emitPalette(t),this.focusSwatchAfterUpdate(i)}reorder(e,t){if(this.disabled||e===t)return;const i=oe(this.palette),[r]=i.splice(e,1);if(i.splice(t,0,r),this.editingIndex=this.editingIndex===e?t:Et(this.editingIndex,e,t),this.persistentPicker){const n=Et(this.selectedIndex,e,t);n!==void 0&&this.selectColour(n,i[n])}this.emitPalette(i)}focusSwatchAfterUpdate(e){this.updateComplete.then(()=>{this.shadowRoot?.querySelector("govee-reorderable-strip")?.focusItem(e)})}popoverKeyPressed(e,t){t.key==="Escape"&&(t.preventDefault(),t.stopPropagation(),this.editingIndex=void 0,this.focusSwatchAfterUpdate(e))}swatchClicked(e){if(this.persistentPicker){this.selectColour(e,this.palette[e]);return}if(this.editingIndex===e&&this.palette.length>this.minColours){this.removeColour(e);return}this.editingIndex=this.editingIndex===e?void 0:e}selectColour(e,t){this.selectedIndex=e,this.dispatchEvent(new CustomEvent("colour-selected",{detail:{index:e,colour:[...t]},bubbles:!0,composed:!0}))}emitPalette(e){this.palette=e,this.dispatchEvent(new CustomEvent("palette-changed",{detail:{palette:e},bubbles:!0,composed:!0}))}static{this.styles=W`
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

  `}}N([g({attribute:!1})],L.prototype,"palette");N([g({type:Number})],L.prototype,"minColours");N([g({type:Number})],L.prototype,"maxColours");N([g({type:Boolean})],L.prototype,"disabled");N([g({type:Boolean})],L.prototype,"persistentPicker");N([g({type:Number})],L.prototype,"selectedIndex");N([g()],L.prototype,"ariaLabel");N([g()],L.prototype,"itemName");N([h()],L.prototype,"editingIndex");function oe(s){return s.map(e=>[...e])}function It(s){return s.charAt(0).toUpperCase()+s.slice(1)}function ji(){const s=localStorage.getItem(Zt);if(!s)return oe(Te);let e;try{e=JSON.parse(s)}catch(i){if(i instanceof SyntaxError)return oe(Te);throw i}if(!Array.isArray(e))return oe(Te);const t=e.filter(Vi).map(i=>[...i]).slice(0,Ze);return Qt(t)}function Ki(s){const e=_(s);ae=Qt([[...s],...ae.filter(t=>_(t)!==e)]),localStorage.setItem(Zt,JSON.stringify(ae))}function Qt(s){const e=s.map(t=>[...t]);for(const t of Te)e.length>=Ze||e.some(i=>_(i)===_(t))||e.push([...t]);return e.slice(0,Ze)}function Vi(s){return Array.isArray(s)&&s.length===3&&s.every(e=>Number.isInteger(e)&&e>=0&&e<=255)}function Et(s,e,t){return s===void 0||e===t?s:s===e?t:e<t&&s>e&&s<=t?s-1:t<e&&s>=t&&s<e?s+1:s}function _(s){return`#${s.map(e=>e.toString(16).padStart(2,"0")).join("")}`}function Ct(s){return[Number.parseInt(s.slice(1,3),16),Number.parseInt(s.slice(3,5),16),Number.parseInt(s.slice(5,7),16)]}customElements.get("govee-palette-editor")||customElements.define("govee-palette-editor",L);var Gi=Object.defineProperty,Z=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&Gi(e,t,r),r};const ie=5,St=8,At=15,ei=[1,2,0,3],ti=[0,1,2,3],Xi={0:"Segment",1:"Continuous",2:"Random",3:"Custom"},Yi={0:"Brightest to darkest",1:"Brightest, darkest, brightest",2:"Darkest to brightest",3:"Darkest, brightest, darkest"},Pt={0:"Forward",1:"Backward",2:"Forward and back",3:"Back and forward"};class H extends D{constructor(){super(...arguments),this.disabled=!1,this.segmentCount=At,this.activeLayerIndex=0,this.activePatternIndex=0,this.movementAnnouncement=""}willUpdate(e){if(!(!e.has("content")||!this.content)){if(this.content.layers.length===0){this.activeLayerIndex=0,this.activePatternIndex=0;return}if(this.activeLayerIndex=A(this.activeLayerIndex,0,this.content.layers.length-1),this.activeLayer.brightness_patterns.length===0){this.activePatternIndex=0;return}this.activePatternIndex=A(this.activePatternIndex,0,this.activeLayer.brightness_patterns.length-1)}}render(){if(!this.content)return l;if(this.content.layers.length===0)return this.renderEmptyLayers();const e=this.activeLayer,t=this.content.layers.map((i,r)=>({key:`layer-${r}`,label:`Layer ${r+1}`,ariaLabel:`Layer ${r+1}. Drag to reorder or use arrow keys.`,id:`advanced-layer-tab-${r}`,ariaControls:"advanced-layer-panel"}));return o`
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
          .addDisabled=${this.disabled||this.content.layers.length>=ie}
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
                    ?disabled=${this.disabled||this.content.layers.length>=ie}
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

        ${this.content.layers.length>=ie?o`
              <p class="limit-note">
                ${this.content.layers.length>ie?`This loaded effect has ${this.content.layers.length} layers. All are preserved, but adding and copying are unavailable while five or more remain.`:"Advanced effects can author up to five layers."}
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
    `}get activeLayer(){return this.content.layers[this.activeLayerIndex]}renderAppliedArea(e){const t=e.area.start_tenths>=0&&e.area.start_tenths<=9&&e.area.width_tenths>=1&&e.area.width_tenths<=10-e.area.start_tenths,i=A(e.area.start_tenths,0,9),r=i+e.area.width_tenths,n=Number.isInteger(this.segmentCount)&&this.segmentCount>0?this.segmentCount:At,a=_(e.palette[0]??[47,111,237]);return o`
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
              ${Array.from({length:n},(d,c)=>o`
                  <span
                    class=${t&&es(c,n,i,r)?"covered":""}
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
    `}areaPointerStarted(e,t,i,r){if(this.disabled)return;const n=this.shadowRoot?.querySelector(".area-track");if(!n)return;const a=n.getBoundingClientRect();if(a.width<=0)return;const d=r.currentTarget,c=e==="start"?t:e==="end"?i:t;r.preventDefault(),r.stopPropagation(),d.focus(),d.setPointerCapture(r.pointerId),this.areaDrag={pointerId:r.pointerId,mode:e,initialStart:t,initialEnd:i,currentStart:t,currentEnd:i,originX:r.clientX,pointerOffsetX:e==="move"?0:r.clientX-(a.left+c/10*a.width),trackLeft:a.left,trackWidth:a.width,captureTarget:d}}areaPointerMoved(e){const t=this.areaDrag;if(!t||t.pointerId!==e.pointerId)return;e.preventDefault();let i=t.initialStart,r=t.initialEnd;if(t.mode==="move"){const n=t.initialEnd-t.initialStart,a=Math.round((e.clientX-t.originX)/t.trackWidth*10);i=A(t.initialStart+a,0,10-n),r=i+n}else{const n=Math.round((e.clientX-t.pointerOffsetX-t.trackLeft)/t.trackWidth*10);t.mode==="start"?i=A(n,0,t.initialEnd-1):r=A(n,t.initialStart+1,10)}i===t.currentStart&&r===t.currentEnd||(t.currentStart=i,t.currentEnd=r,this.setAppliedArea(i,r))}areaPointerFinished(e){const t=this.areaDrag;!t||t.pointerId!==e.pointerId||(t.captureTarget.hasPointerCapture(e.pointerId)&&t.captureTarget.releasePointerCapture(e.pointerId),this.areaDrag=void 0)}areaBoundaryKeyDown(e,t,i,r){const n=e==="start"?0:t+1,a=e==="start"?i-1:10,d=e==="start"?t:i,c=Lt(r.key,d,n,a);c!==void 0&&(r.preventDefault(),this.setAppliedArea(e==="start"?c:t,e==="end"?c:i))}areaPositionKeyDown(e,t,i){const r=t-e,n=Lt(i.key,e,0,10-r);n!==void 0&&(i.preventDefault(),this.setAppliedArea(n,n+r))}setAppliedArea(e,t){this.updateLayer({area:{start_tenths:e,width_tenths:t-e}})}renderSelectionControls(e){const t=e.selection,i=Ji(t.type);return o`
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
            ${ei.map(r=>o`<option
                  value=${r}
                  .selected=${t.type===r}
                >
                  ${Xi[r]}
                </option>`)}
            ${i?l:o`
                  <option value=${t.type} .selected=${!0}>
                    Raw type ${t.type} (0x${Ae(t.type)})
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
        ${this.rangeField("Colour speed",e.colour_speed,0,255,ue(e.colour_speed),i=>this.updateLayer({colour_speed:i}))}
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
      `;const t=A(this.activePatternIndex,0,e.brightness_patterns.length-1),i=e.brightness_patterns[t],r=Zi(i.order);return o`
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
              ${ti.map(n=>o`<option value=${n}>
                    ${Yi[n]}
                  </option>`)}
              ${r?l:o`
                    <option value=${i.order} .selected=${!0}>
                      Raw order ${i.order} (0x${Ae(i.order)})
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
          ${this.rangeField("Scope low",i.scope_low,0,255,ue(i.scope_low),n=>this.updateBrightnessPattern({scope_low:n}))}
          ${this.rangeField("Scope high",i.scope_high,0,255,ue(i.scope_high),n=>this.updateBrightnessPattern({scope_high:n}))}
          ${this.rangeField("Changing speed",i.change_speed,0,255,ue(i.change_speed),n=>this.updateBrightnessPattern({change_speed:n}))}
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
              ${this.rangeField("Speed",r.speed,0,255,ue(r.speed),n=>this.updateMovement(t,{speed:n},`${i} speed ${ri(n)} per cent.`))}
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
          .value=${Ae(t)}
          ?disabled=${this.disabled}
          @change=${n=>{const a=n.target,d=Qi(a.value);if(d===void 0){a.setCustomValidity("Enter one byte from 00 to FF."),a.reportValidity();return}if((d&~r)!==0){a.setCustomValidity(`Known flag bits are controlled elsewhere. Allowed mask: ${Ae(r)}.`),a.reportValidity();return}a.setCustomValidity(""),i(d)}}
        />
      </label>
    `}updateLayer(e){if(!this.content||this.disabled)return;const t=this.content.layers.map((i,r)=>r===this.activeLayerIndex?R({...i,...e}):R(i));this.emitContent({kind:"advanced",layers:t})}updateSelection(e){this.updateLayer({selection:{...this.activeLayer.selection,...e}})}updateBrightnessPattern(e){const t=this.activeLayer.brightness_patterns.map((i,r)=>r===this.activePatternIndex?{...i,...e}:{...i});this.updateLayer({brightness_patterns:t})}updateMovement(e,t,i){this.updateLayer({[e]:{...this.activeLayer[e],...t}}),i&&(this.movementAnnouncement=i)}addLayer(){if(!this.content||this.disabled||this.content.layers.length>=ie)return;const e=[...this.content.layers.map(R),ii()];this.installContent({kind:"advanced",layers:e}),this.activeLayerIndex=e.length-1,this.activePatternIndex=0,this.layerActionsIndex=void 0,this.focusActiveTab()}copyLayer(){if(!this.content||this.disabled||this.content.layers.length>=ie)return;const e=this.content.layers.map(R);e.splice(this.activeLayerIndex+1,0,R(this.activeLayer)),this.installContent({kind:"advanced",layers:e}),this.activeLayerIndex+=1,this.activePatternIndex=0,this.layerActionsIndex=this.activeLayerIndex,this.focusActiveTab()}deleteLayer(){if(!this.content||this.disabled||this.content.layers.length===1)return;const e=this.content.layers.filter((t,i)=>i!==this.activeLayerIndex).map(R);this.activeLayerIndex=Math.min(this.activeLayerIndex,e.length-1),this.activePatternIndex=0,this.layerActionsIndex=void 0,this.emitContent({kind:"advanced",layers:e}),this.focusActiveTab()}reorderLayer(e,t){if(!this.content||this.disabled||e<0||e>=this.content.layers.length||t<0||t>=this.content.layers.length||e===t)return;const i=this.content.layers.map(R),[r]=i.splice(e,1);i.splice(t,0,r),this.activeLayerIndex=Dt(this.activeLayerIndex,e,t),this.layerActionsIndex!==void 0&&(this.layerActionsIndex=Dt(this.layerActionsIndex,e,t)),this.emitContent({kind:"advanced",layers:i})}addBrightnessPattern(){if(this.disabled||this.activeLayer.brightness_patterns.length>=3)return;const e=[...this.activeLayer.brightness_patterns.map(t=>({...t})),si()];this.activePatternIndex=e.length-1,this.updateLayer({brightness_patterns:e})}deleteBrightnessPattern(){if(this.disabled||this.activeLayer.brightness_patterns.length===1)return;const e=this.activeLayer.brightness_patterns.filter((t,i)=>i!==this.activePatternIndex).map(t=>({...t}));this.activePatternIndex=Math.min(this.activePatternIndex,e.length-1),this.updateLayer({brightness_patterns:e})}selectLayer(e){if(e===this.activeLayerIndex){this.layerActionsIndex=this.layerActionsIndex===e?void 0:e;return}this.activeLayerIndex=e,this.activePatternIndex=0,this.layerActionsIndex=e}patternTabKeyPressed(e,t){const i=this.activeLayer.brightness_patterns.length;let r;t.key==="ArrowLeft"?r=e===0?i-1:e-1:t.key==="ArrowRight"?r=e===i-1?0:e+1:t.key==="Home"?r=0:t.key==="End"&&(r=i-1),r!==void 0&&(t.preventDefault(),this.activePatternIndex=r,this.updateComplete.then(()=>{this.shadowRoot?.querySelectorAll(".pattern-tabs button")[r]?.focus()}))}focusActiveTab(){this.updateComplete.then(()=>{this.shadowRoot?.querySelector("govee-reorderable-strip")?.focusItem(this.activeLayerIndex)})}excessChanged(e){const t=e.value.replace(/\s+/g,"").toLowerCase();if(!/^(?:[0-9a-f]{2})*$/.test(t)){e.setCustomValidity("Enter an even number of hexadecimal digits."),e.reportValidity();return}e.setCustomValidity(""),this.updateLayer({excess:t})}emitContent(e){this.dispatchEvent(new CustomEvent("content-changed",{detail:{content:e},bubbles:!0,composed:!0}))}installContent(e){this.content=e,this.emitContent(e)}static{this.styles=W`
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
  `}}Z([g({attribute:!1})],H.prototype,"content");Z([g({type:Boolean})],H.prototype,"disabled");Z([g({type:Number})],H.prototype,"segmentCount");Z([h()],H.prototype,"activeLayerIndex");Z([h()],H.prototype,"activePatternIndex");Z([h()],H.prototype,"movementAnnouncement");Z([h()],H.prototype,"layerActionsIndex");function Dt(s,e,t){return s===e?t:e<t&&s>e&&s<=t?s-1:t<e&&s>=t&&s<e?s+1:s}function Wi(){return{kind:"advanced",layers:[ii()]}}function _e(s){return{kind:"advanced",layers:s.layers.map(R)}}function ii(){return{area:{start_tenths:0,width_tenths:10},selection:{type:0,param_1:0,param_2:1},brightness_gradient:!1,brightness_patterns:[si()],distribution:{method:1,backwards:!1},colour_speed:128,colour_retention:20,palette:[[255,0,0],[0,0,255]],selected_movement:Tt(),overall_movement:Tt(),priority:0,unknown_flags:0,excess:""}}function si(){return{scope_high:255,scope_low:0,order:0,change_speed:128,brightest_retention:20,darkest_retention:20}}function Tt(){return{enabled:!1,enter_exit:!1,direction:0,distance:1,speed:128,unknown_flags:0}}function R(s){return{...s,area:{...s.area},selection:{...s.selection},brightness_patterns:s.brightness_patterns.map(e=>({...e})),distribution:{...s.distribution},palette:s.palette.map(e=>[...e]),selected_movement:{...s.selected_movement},overall_movement:{...s.overall_movement}}}function Ji(s){return ei.includes(s)}function Zi(s){return ti.includes(s)}function ri(s){return Math.round(A(s,0,255)/255*100)}function ue(s){return`${ri(s)}% · ${s}`}function Ae(s){return s.toString(16).padStart(2,"0").toUpperCase()}function Qi(s){const e=s.trim().replace(/^0x/i,"");if(/^[0-9a-f]{1,2}$/i.test(e))return Number.parseInt(e,16)}function es(s,e,t,i){const r=s*10/e;return(s+1)*10/e>t&&r<i}function Lt(s,e,t,i){if(s==="Home")return t;if(s==="End")return i;if(s==="ArrowLeft"||s==="ArrowDown")return A(e-1,t,i);if(s==="ArrowRight"||s==="ArrowUp")return A(e+1,t,i)}function A(s,e,t){return Math.min(t,Math.max(e,Math.round(s)))}customElements.get("govee-advanced-effect-editor")||customElements.define("govee-advanced-effect-editor",H);const ts=1,ni=1,is=1,T=128,Q=65536,ai=512,oi=256,di=32,li=128,ci=512,w=255,ss=64,rs=262144,Nt=16,ns=4096,as=16384,X=1024,Ve=16384,lt=Number.MAX_SAFE_INTEGER,os=4335,ds=232,ls=253;function cs(s){const e=m(s,"editor info"),t=m(e.limits,"editor limits");return{api_version:p(e.api_version,"API version",1),effect_schema_version:p(e.effect_schema_version,"effect schema version",1),compiler_version:p(e.compiler_version,"compiler version",1),limits:{effect_name:O(t.effect_name,T,"effect-name limit"),effect_document_bytes:O(t.effect_document_bytes,Q,"effect-document limit"),devices:O(t.devices,ai,"device limit"),library_items:O(t.library_items,oi,"library-item limit"),drafts_per_owner:O(t.drafts_per_owner,di,"draft limit"),deployment_records:O(t.deployment_records,li,"deployment limit"),scene_catalogue_entries:O(t.scene_catalogue_entries,ci,"scene catalogue limit")}}}function ps(s){const e=E(s,"devices",ai).map((t,i)=>{const r=m(t,`devices[${i}]`),n=m(r.custom_effects,`devices[${i}].custom_effects`);return{config_entry_id:y(r.config_entry_id,`devices[${i}].config_entry_id`,w),model:y(r.model,`devices[${i}].model`,w),display_name:y(r.display_name,`devices[${i}].display_name`,w),segment_count:p(r.segment_count,`devices[${i}].segment_count`,0,65535),custom_effects:{painted:ne(n.painted,"painted capability"),single:ne(n.single,"single capability"),multi:ne(n.multi,"multi capability"),advanced:ne(n.advanced,"advanced capability")},readback:y(r.readback,`devices[${i}].readback`,w)}});return ze(e,t=>t.config_entry_id,"device IDs"),e}function us(s){te(s,"custom-effect catalogue",Q);const e=m(s,"custom-effect catalogue"),t=m(e.limits,"custom-effect limits"),i=m(e.apply,"custom-effect Apply capabilities");return{schema_version:p(e.schema_version,"catalogue schema",1),sku:ee(e.sku,"catalogue SKU"),painted_effects:E(e.painted_effects,"painted-effect templates",X).map((r,n)=>{const a=m(r,`painted-effect templates[${n}]`);return{id:fi(a.id,["cycle","clockwise","counter_clockwise","twinkle","gradient","breathe"],"painted-effect ID"),label:y(a.label,"painted-effect label",T)}}),effects:E(e.effects,"custom-effect templates",X).map((r,n)=>{const a=m(r,`custom-effect templates[${n}]`);return{id:y(a.id,"template ID",w),label:y(a.label,"template label",T),family:p(a.family,"template family",0,255),variant:p(a.variant,"template variant",0,255)}}),limits:{palette_min:p(t.palette_min,"minimum palette",1,255),palette_max:p(t.palette_max,"maximum palette",1,255),multi_max:p(t.multi_max,"maximum Multi effects",1,255)},apply:{single:ne(i.single,"Single Apply capability"),multi:ne(i.multi,"Multi Apply capability")}}}function Mt(s){const e=m(s,"library snapshot"),t={library_revision:q(e.library_revision,"library revision",0),items:E(e.items,"library items",oi).map((i,r)=>{const n=m(i,`library items[${r}]`),a=n.template===void 0?void 0:Be(n.template,`library items[${r}].template`);return{id:y(n.id,"library item ID",w),revision:q(n.revision,"library item revision",1),name:y(n.name,"library item name",T),kind:y(n.kind,"library item kind",w),...a?{template:a}:{}}})};return ze(t.items,i=>i.id,"library item IDs"),t}function Le(s){te(s,"library item",Q);const e=m(s,"library item"),t=e.target_hint===void 0?void 0:m(e.target_hint,"target hint");return{schema_version:O(e.schema_version,ni,"effect schema version"),id:y(e.id,"effect ID",w),revision:q(e.revision,"effect revision",1),name:y(e.name,"effect name",T),content:pi(e.content),provenance:Ot(e.provenance,"effect provenance"),extensions:Ot(e.extensions,"effect extensions"),...t?{target_hint:{model:t.model===null?null:y(t.model,"target model",w),segment_count:t.segment_count===null?null:p(t.segment_count,"target segment count",1,65535)}}:{}}}function hs(s){const e=E(s,"draft summaries",di).map((t,i)=>{const r=m(t,`draft summaries[${i}]`);return{id:y(r.id,"draft ID",w),revision:q(r.revision,"draft revision",1),name:y(r.name,"draft name",T),updated_at:pt(r.updated_at,"draft timestamp"),selected_config_entry_id:ke(r.selected_config_entry_id,"draft config entry ID")}});return ze(e,t=>t.id,"draft IDs"),e}function Ge(s){const e=m(s,"effect draft");return{id:y(e.id,"draft ID",w),owner_id:y(e.owner_id,"draft owner",w),revision:q(e.revision,"draft revision",1),item:Le(e.item),updated_at:pt(e.updated_at,"draft timestamp"),selected_config_entry_id:ke(e.selected_config_entry_id,"draft config entry ID"),base_item_id:ke(e.base_item_id,"draft base item ID"),base_item_revision:e.base_item_revision===null?null:q(e.base_item_revision,"draft base item revision",1)}}function Qe(s){const e=m(s,"deployment"),t=ee(e.phase,"deployment phase");t!=="pending"&&t!=="uploading"&&t!=="verifying"&&t!=="confirmed"&&t!=="failed"&&t!=="interrupted"&&t!=="unknown"&&f("deployment phase is invalid");const i={operation_id:y(e.operation_id,"deployment operation ID",w),config_entry_id:y(e.config_entry_id,"deployment config entry ID",w),diy_code:p(e.diy_code,"deployment DIY code",0,65535),phase:t,updated_at:pt(e.updated_at,"deployment timestamp"),item_id:ke(e.item_id,"deployment item ID"),item_revision:e.item_revision===null?null:q(e.item_revision,"deployment item revision",1),error_code:ke(e.error_code,"deployment error code"),progress_current:p(e.progress_current,"deployment progress",0,1024),progress_total:p(e.progress_total,"deployment progress total",0,1024)};return i.progress_current>i.progress_total&&f("deployment progress exceeds its total"),i}function ms(s){const e=m(s,"deployment snapshot"),t={revision:q(e.revision,"deployment revision",0),deployments:E(e.deployments,"deployments",li).map(Qe)};return ze(t.deployments,i=>i.operation_id,"deployment operation IDs"),t}function fs(s){te(s,"scene catalogue",rs,as);const e=m(s,"scene catalogue");return{schema_version:p(e.schema_version,"scene catalogue schema",1),sku:y(e.sku,"scene catalogue SKU",w),enabled:ce(e.enabled,"scene catalogue enabled"),categories:E(e.categories,"scene categories",X).map((t,i)=>{const r=m(t,`scene categories[${i}]`);return{id:p(r.id,"scene category ID",0,65535),name:y(r.name,"scene category name",T)}}),scenes:E(e.scenes,"scenes",ci).map(ct)}}function gs(s){const e=m(s,"scene detail");te({scene:e.scene,content:e.content},"scene detail",Q);const t=pi(e.content);return t.kind!=="scene_builtin"&&t.kind!=="scene_palette"&&t.kind!=="scene_layered"&&f("scene detail content is unsupported"),{scene:ct(e.scene),content:t}}function pi(s){te(s,"effect content",Q);const e=m(s,"effect content"),t=y(e.kind,"effect content kind",w);switch(t){case"h617a_painted":return{kind:t,effect:fi(e.effect,["cycle","clockwise","counter_clockwise","twinkle","gradient","breathe"],"painted effect"),speed:p(e.speed,"painted speed",0,100),brightness:p(e.brightness,"painted brightness",0,100),background:we(e.background,"painted background"),groups:E(e.groups,"paint groups",15).map((i,r)=>{const n=m(i,`paint groups[${r}]`);return{fill:we(n.fill,"paint-group fill"),segments:E(n.segments,"painted segments",15).map(a=>p(a,"painted segment",0,14))}})};case"h617a_single":return{kind:t,family:p(e.family,"Single family",0,254),variant:p(e.variant,"Single variant",0,255),speed:p(e.speed,"Single speed",0,100),palette:Re(e.palette,"Single palette",8)};case"h617a_multi":return{kind:t,effects:E(e.effects,"Multi effects",4).map((i,r)=>{const n=m(i,`Multi effects[${r}]`);return{family:p(n.family,"Multi family",0,254),variant:p(n.variant,"Multi variant",0,255)}}),speed:p(e.speed,"Multi speed",0,100),palette:Re(e.palette,"Multi palette",8)};case"advanced":return{kind:t,layers:Bt(e.layers,"Advanced layers")};case"scene_builtin":return{kind:t,template:Be(e.template,"scene template"),speed_index:et(e.speed_index,"scene speed index",0,255)};case"scene_palette":return bs(e);case"scene_layered":{const i=m(e.effect,"layered scene effect"),r=ui(e.trailing_padding,"layered scene trailing padding");return{kind:t,template:Be(e.template,"layered scene template"),effect:{layers:Bt(i.layers,"layered scene layers")},speed_index:et(e.speed_index,"layered scene speed index",0,255),raw_param:hi(e.raw_param,"layered scene raw parameter"),...r===void 0?{}:{trailing_padding:r}}}default:{const{kind:i,...r}=e;return{kind:"opaque",source_kind:t,body:r}}}}function ui(s,e){if(s!==void 0)return p(s,e,0,os)}function bs(s){const t=p(s.layout,"palette scene layout",0,1)===0?0:1,i=E(s.steps,"palette scene steps",255).map((d,c)=>{const u=m(d,`palette scene steps[${c}]`),b=t===0?(u.inline_colour!==null&&f(`palette scene steps[${c}].inline_colour must be null for layout 0`),null):we(u.inline_colour,`palette scene steps[${c}].inline_colour`);return{value:p(u.value,`palette scene steps[${c}].value`,0,65535),colour:we(u.colour,`palette scene steps[${c}].colour`),inline_colour:b}}),r=Re(s.palette,"palette scene shared palette",255,!0);t===1&&r.length!==0&&f("palette scene layout 1 must not have a shared palette");let n;s.config_flags!==void 0&&(n=p(s.config_flags,"palette scene config flags",0,255),n&-9&&f("palette scene config flags must only set reserved config bits"));const a=ui(s.trailing_padding,"palette scene trailing padding");return{kind:"scene_palette",template:Be(s.template,"palette scene template"),layout:t,brightness_flag:ce(s.brightness_flag,"palette scene brightness flag"),steps:i,palette:r,speed_index:et(s.speed_index,"palette scene speed index",0,255),...n===void 0?{}:{config_flags:n},...a===void 0?{}:{trailing_padding:a}}}function he(s){return s.kind!=="opaque"?s:(te(s.body,"opaque content",Q),{...s.body,kind:y(s.source_kind,"opaque source kind",w)})}function ct(s){const e=m(s,"scene"),t=ee(e.parameter_kind,"scene parameter kind");t!=="none"&&t!=="palette"&&t!=="layers"&&t!=="opaque"&&f("scene parameter kind is invalid");const i=e.speed===null?null:(()=>{const r=m(e.speed,"scene speed");return{option_count:p(r.option_count,"scene speed option count",1,256),default_index:p(r.default_index,"scene default speed",0,255)}})();return{scene_id:p(e.scene_id,"scene ID",0,65535),effect_id:p(e.effect_id,"scene effect ID",0,65535),category_id:p(e.category_id,"scene category ID",0,65535),category:y(e.category,"scene category",T),name:y(e.name,"scene name",T),variant:ys(e.variant,"scene variant",w),display_name:y(e.display_name,"scene display name",T),scene_type:p(e.scene_type,"scene type",0,255),parameter_kind:t,speed:i}}function Bt(s,e){return E(s,e,255).map((t,i)=>vs(t,`${e}[${i}]`))}function vs(s,e){const t=m(s,e),i=m(t.area,`${e}.area`),r=m(t.selection,`${e}.selection`),n=m(t.distribution,`${e}.distribution`);return{area:{start_tenths:p(i.start_tenths,`${e}.area.start_tenths`,0,15),width_tenths:p(i.width_tenths,`${e}.area.width_tenths`,0,15)},selection:{type:S(r.type,`${e}.selection.type`),param_1:S(r.param_1,`${e}.selection.param_1`),param_2:S(r.param_2,`${e}.selection.param_2`)},brightness_gradient:ce(t.brightness_gradient,`${e}.brightness_gradient`),brightness_patterns:E(t.brightness_patterns,`${e}.brightness_patterns`,255).map((a,d)=>{const c=m(a,`${e}.brightness_patterns[${d}]`);return{scope_high:S(c.scope_high,"brightness scope high"),scope_low:S(c.scope_low,"brightness scope low"),order:S(c.order,"brightness order"),change_speed:S(c.change_speed,"brightness change speed"),brightest_retention:S(c.brightest_retention,"brightest retention"),darkest_retention:S(c.darkest_retention,"darkest retention")}}),distribution:{method:p(n.method,`${e}.distribution.method`,0,127),backwards:ce(n.backwards,`${e}.distribution.backwards`)},colour_speed:S(t.colour_speed,`${e}.colour_speed`),colour_retention:S(t.colour_retention,`${e}.colour_retention`),palette:Re(t.palette,`${e}.palette`,255,!0),selected_movement:Rt(t.selected_movement,`${e}.selected_movement`),overall_movement:Rt(t.overall_movement,`${e}.overall_movement`),priority:S(t.priority,`${e}.priority`),unknown_flags:mi(t.unknown_flags,ls,`${e}.unknown_flags`),excess:hi(t.excess,`${e}.excess`)}}function Rt(s,e){const t=m(s,e);return{enabled:ce(t.enabled,`${e}.enabled`),enter_exit:ce(t.enter_exit,`${e}.enter_exit`),direction:p(t.direction,`${e}.direction`,0,3),distance:S(t.distance,`${e}.distance`),speed:S(t.speed,`${e}.speed`),unknown_flags:mi(t.unknown_flags,ds,`${e}.unknown_flags`)}}function Be(s,e){const t=m(s,e);return{sku:y(t.sku,`${e}.sku`,w),scene_id:p(t.scene_id,`${e}.scene_id`,0,65535),effect_id:p(t.effect_id,`${e}.effect_id`,0,65535),catalogue_schema_version:p(t.catalogue_schema_version,`${e}.catalogue_schema_version`,1,lt)}}function Re(s,e,t,i=!1){const r=E(s,e,t);return!i&&r.length===0&&f(`${e} must not be empty`),r.map((n,a)=>we(n,`${e}[${a}]`))}function we(s,e){const t=E(s,e,3);return t.length!==3&&f(`${e} must contain three channels`),t.map(i=>p(i,`${e} channel`,0,255))}function ne(s,e){return s!=="supported"&&s!=="unsupported"&&s!=="evidence_gap"&&f(`${e} is invalid`),s}function Ot(s,e){return te(s,e,Q),m(s,e)}function ke(s,e){return s===null?null:y(s,e,w)}function pt(s,e){const t=y(s,e,ss);return(!/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(t)||Number.isNaN(Date.parse(t)))&&f(`${e} must be an ISO 8601 timestamp with a UTC offset`),t}function y(s,e,t){const i=ee(s,e);return(i.length===0||i.length>t)&&f(`${e} must contain 1 to ${t} characters`),i}function ys(s,e,t){const i=ee(s,e);return i.length>t&&f(`${e} must not exceed ${t} characters`),i}function hi(s,e){const t=ee(s,e);return(t.length%2!==0||!/^[0-9a-f]*$/i.test(t))&&f(`${e} must be hexadecimal`),t}function ee(s,e){return typeof s!="string"&&f(`${e} must be a string`),s}function ce(s,e){return typeof s!="boolean"&&f(`${e} must be a boolean`),s}function p(s,e,t,i=lt){return(typeof s!="number"||!Number.isSafeInteger(s)||s<t||s>i)&&f(`${e} must be an integer from ${t} to ${i}`),s}function q(s,e,t){return p(s,e,t,lt)}function O(s,e,t){const i=p(s,t,1);return i!==e&&f(`${t} is incompatible with this editor`),i}function et(s,e,t,i){return s===null?null:p(s,e,t,i)}function S(s,e){return p(s,e,0,255)}function mi(s,e,t){const i=S(s,t);return i&~e&&f(`${t} must only set reserved bits, not bits explicit fields carry`),i}function fi(s,e,t){const i=ee(s,t);return e.includes(i)||f(`${t} is invalid`),i}function m(s,e){return(typeof s!="object"||s===null||Array.isArray(s))&&f(`${e} must be an object`),s}function E(s,e,t){return Array.isArray(s)||f(`${e} must be an array`),s.length>t&&f(`${e} must not exceed ${t} items`),s}function ze(s,e,t){const i=s.map(e);new Set(i).size!==i.length&&f(`${t} must be unique`)}function te(s,e,t,i=ns){let r=0;const n=(d,c,u)=>{if(r+=1,r>i&&f(`${e} must not exceed ${i} JSON values`),u>Nt&&f(`${e} must not exceed ${Nt} nested levels`),!(d===null||typeof d=="boolean")){if(typeof d=="number"){(!Number.isFinite(d)||Number.isInteger(d)&&!Number.isSafeInteger(d))&&f(`${c} must be a finite JSON number`);return}if(typeof d=="string"){d.length>Ve&&f(`${c} must not exceed ${Ve} characters`);return}if(Array.isArray(d)){d.length>X&&f(`${c} must not exceed ${X} items`),d.forEach((b,v)=>n(b,`${c}[${v}]`,u+1));return}if(typeof d=="object"&&d!==null){const b=Object.entries(d);b.length>X&&f(`${c} must not exceed ${X} fields`),b.forEach(([v,P])=>{v.length>Ve&&f(`${c} contains an oversized key`),n(P,`${c}.${v}`,u+1)});return}f(`${c} contains a non-JSON value`)}};n(s,e,0);const a=JSON.stringify(s);a===void 0&&f(`${e} must contain JSON values`),new TextEncoder().encode(a).byteLength>t&&f(`${e} must not exceed ${t} bytes`)}function f(s){throw new Error(`Malformed Effect Studio server payload: ${s}.`)}function $s(s){return s.api_version===ts&&s.effect_schema_version===ni&&s.compiler_version===is}const Xe="ha_govee_led_ble/editor";class xs{constructor(e){this.hass=e}async info(){return cs(await this.call("info"))}async devices(){const e=await this.call("devices");return ps(I(e,"devices"))}async customCatalogue(){const e=await this.call("custom/catalogue");return us(I(e,"catalogue"))}async library(){return Mt(await this.call("library/list"))}async item(e){const t=await this.call("library/get",{item_id:e});return Le(I(t,"item"))}async createItem(e,t,i){const r=await this.call("library/create",{name:e,content:he(t),expected_library_revision:i});return{item:Le(I(r,"item")),library_revision:Ye(r)}}async updateItem(e,t,i,r){const n=await this.call("library/update",{item_id:e.id,name:t,content:he(i),expected_revision:e.revision,expected_library_revision:r});return{item:Le(I(n,"item")),library_revision:Ye(n)}}async deleteItem(e,t){const i=await this.call("library/delete",{item_id:e.id,expected_revision:e.revision,expected_library_revision:t});return Ye(i)}async drafts(){const e=await this.call("draft/list");return hs(I(e,"drafts"))}async draft(e){const t=await this.call("draft/get",{draft_id:e});return Ge(I(t,"draft"))}async createDraft(e,t,i,r){const n=await this.call("draft/create",{name:e,content:he(t),updated_at:new Date().toISOString(),selected_config_entry_id:i,...r?{base_item_id:r.id,base_item_revision:r.revision}:{}});return Ge(I(n,"draft"))}async updateDraft(e,t,i,r){const n=await this.call("draft/update",{draft_id:e.id,expected_revision:e.revision,name:t,content:he(i),updated_at:new Date().toISOString(),selected_config_entry_id:r});return Ge(I(n,"draft"))}async deleteDraft(e){await this.call("draft/delete",{draft_id:e.id,expected_revision:e.revision})}async applySaved(e,t){const i=await this.call("apply",{config_entry_id:e,item_id:t.id,revision:t.revision,updated_at:new Date().toISOString()});return Qe(I(i,"deployment"))}async applySnapshot(e,t,i){const r=await this.call("apply_snapshot",{config_entry_id:e,name:t,content:he(i),updated_at:new Date().toISOString()});return Qe(I(r,"deployment"))}async sceneCatalogue(e){const t=await this.call("scene/catalogue/list",{config_entry_id:e});return fs(I(t,"catalogue"))}sceneDetail(e,t,i){return this.call("scene/catalogue/get",{config_entry_id:e,scene_id:t,effect_id:i}).then(gs)}async applyScene(e,t,i){const r=await this.call("scene/apply",{config_entry_id:e,scene_id:t.scene_id,effect_id:t.effect_id,...i===null?{}:{speed_index:i}}),n=ct(I(r,"scene")),a=I(r,"readback");if(a!=="scene_identity_only")throw new Error("Malformed Effect Studio server payload: scene Apply readback is invalid.");const d=I(r,"speed_index");if(d!==null&&(typeof d!="number"||!Number.isSafeInteger(d)||d<0||d>255))throw new Error("Malformed Effect Studio server payload: scene Apply speed is invalid.");return{scene:n,speed_index:d,readback:a}}subscribeLibrary(e,t){return this.hass.connection.subscribeMessage(i=>{try{e(Mt(i))}catch(r){t?.(Ft(r))}},{type:`${Xe}/library/subscribe`})}subscribeDeployments(e,t){return this.hass.connection.subscribeMessage(i=>{try{e(ms(i))}catch(r){t?.(Ft(r))}},{type:`${Xe}/deployment/subscribe`})}call(e,t={}){return this.hass.callWS({type:`${Xe}/${e}`,...t})}}function I(s,e){if(typeof s!="object"||s===null||Array.isArray(s))throw new Error("Malformed Effect Studio server payload: response must be an object.");if(!(e in s))throw new Error(`Malformed Effect Studio server payload: response is missing ${e}.`);return s[e]}function Ye(s){const e=I(s,"library_revision");if(typeof e!="number"||!Number.isSafeInteger(e)||e<0)throw new Error("Malformed Effect Studio server payload: library revision is invalid.");return e}function Ft(s){return s instanceof Error?s:new Error("Malformed Effect Studio server payload.")}var _s=Object.defineProperty,He=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&_s(e,t,r),r};class Ee extends D{constructor(){super(...arguments),this.disabled=!1,this.windowKeyPressed=e=>{e.key==="Escape"&&this.pickerIndex!==void 0&&(e.preventDefault(),this.closePicker())}}connectedCallback(){super.connectedCallback(),window.addEventListener("keydown",this.windowKeyPressed)}disconnectedCallback(){window.removeEventListener("keydown",this.windowKeyPressed),super.disconnectedCallback()}updated(e){e.has("pickerIndex")&&this.pickerIndex!==void 0&&this.shadowRoot?.querySelector(".modal-close")?.focus()}render(){return!this.content||!this.catalogue?l:o`
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
        @palette-changed=${e=>{this.emitContent({...this.content,palette:ws(e.detail.palette)})}}
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
            ${this.catalogue.effects.map(t=>{const i=e!==void 0&&Pe(t)===Pe(e);return o`
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
    `}selectEffect(e){if(!this.content||this.pickerIndex===void 0)return;const t={family:e.family,variant:e.variant};if(this.content.kind==="h617a_single")this.emitContent({...this.content,...t});else{const i=this.content.effects.map((r,n)=>n===this.pickerIndex?t:r);this.emitContent({...this.content,effects:i})}this.closePicker()}addEffect(){if(!this.content||this.content.kind!=="h617a_multi")return;const e=this.catalogue?.effects[this.content.effects.length]??this.catalogue?.effects[0];if(!e)return;const t=[...this.content.effects,{family:e.family,variant:e.variant}];this.emitContent({...this.content,effects:t})}removeEffect(e){if(!this.content||this.content.kind!=="h617a_multi")return;const t=this.content.effects.filter((i,r)=>r!==e);this.emitContent({...this.content,effects:t})}moveEffect(e,t){if(!this.content||this.content.kind!=="h617a_multi")return;const i=e+t;i<0||i>=this.content.effects.length||this.reorderEffect(e,i)}reorderEffect(e,t){if(!this.content||this.content.kind!=="h617a_multi"||e===t)return;const i=[...this.content.effects],[r]=i.splice(e,1);i.splice(t,0,r),this.emitContent({...this.content,effects:i})}effectDragStarted(e,t){this.draggedEffectIndex=e,t.dataTransfer?.setData("text/plain",String(e))}effectDropped(e,t){t.preventDefault(),this.draggedEffectIndex!==void 0&&(this.reorderEffect(this.draggedEffectIndex,e),this.draggedEffectIndex=void 0)}closeDetails(e){e.currentTarget.closest("details")?.removeAttribute("open")}openPicker(e){this.pickerIndex=e}closePicker(){const e=this.pickerIndex;this.pickerIndex=void 0,this.updateComplete.then(()=>{e!==void 0&&this.shadowRoot?.querySelector(`[data-effect-index="${e}"]`)?.focus()})}modalKeyPressed(e){if(e.key!=="Tab")return;const i=[...e.currentTarget.querySelectorAll("button:not([disabled])")];if(!i.length)return;const r=i[0],n=i[i.length-1],a=this.shadowRoot?.activeElement;e.shiftKey&&a===r?(e.preventDefault(),n.focus()):!e.shiftKey&&a===n&&(e.preventDefault(),r.focus())}effectLabel(e){return this.catalogue?.effects.find(t=>Pe(t)===Pe(e))?.label??"Unknown catalogue effect"}emitContent(e){this.dispatchEvent(new CustomEvent("content-changed",{detail:{content:e},bubbles:!0,composed:!0}))}static{this.styles=W`
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
  `}}He([g({attribute:!1})],Ee.prototype,"content");He([g({attribute:!1})],Ee.prototype,"catalogue");He([g({type:Boolean})],Ee.prototype,"disabled");He([h()],Ee.prototype,"pickerIndex");function Pe(s){return`${s.family}:${s.variant}`}function ws(s){return s.map(e=>[...e])}customElements.get("govee-custom-effect-editor")||customElements.define("govee-custom-effect-editor",Ee);var ks=Object.defineProperty,gi=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&ks(e,t,r),r};class ut extends D{constructor(){super(...arguments),this.colours=[],this.disabled=!1}render(){return o`
      <section class="card" aria-labelledby="painted-segments-heading">
        <h3 id="painted-segments-heading">Painted segments</h3>
        <div class="segments">
          ${this.colours.map((e,t)=>o`
              <button
                type="button"
                data-segment=${t}
                style="--segment-colour: ${_(e)}"
                aria-label="Segment ${t+1}, ${_(e)}"
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
    `}pointerStarted(e,t){this.disabled||(t.preventDefault(),this.paintingPointerId=t.pointerId,this.lastPaintedSegment=e,t.currentTarget.setPointerCapture(t.pointerId),this.selectSegment(e))}pointerMoved(e){if(e.pointerId!==this.paintingPointerId||!this.shadowRoot)return;const t=this.shadowRoot.elementFromPoint(e.clientX,e.clientY)?.closest("[data-segment]"),i=Number(t?.dataset.segment);Number.isInteger(i)&&i!==this.lastPaintedSegment&&(this.lastPaintedSegment=i,this.selectSegment(i))}pointerFinished(e){if(e.pointerId!==this.paintingPointerId)return;const t=this.shadowRoot?.querySelector(`[data-segment="${this.lastPaintedSegment}"]`);t?.hasPointerCapture(e.pointerId)&&t.releasePointerCapture(e.pointerId),this.paintingPointerId=void 0,this.lastPaintedSegment=void 0}segmentClicked(e,t){!this.disabled&&t.detail===0&&this.selectSegment(e)}selectSegment(e){this.dispatchEvent(new CustomEvent("segment-selected",{detail:{index:e},bubbles:!0,composed:!0}))}static{this.styles=W`
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
  `}}gi([g({attribute:!1})],ut.prototype,"colours");gi([g({type:Boolean})],ut.prototype,"disabled");customElements.get("govee-painted-segment-editor")||customElements.define("govee-painted-segment-editor",ut);var Is=Object.defineProperty,C=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&Is(e,t,r),r};class k extends D{constructor(){super(...arguments),this.library={library_revision:0,items:[]},this.isAdmin=!1,this.category="all",this.name="",this.speedIndex=null,this.loading=!1,this.saving=!1,this.applying=!1,this.requestGeneration=0}willUpdate(e){(e.has("device")||e.has("api"))&&(this.invalidateRequests(),this.catalogue=void 0,this.category="all",this.selectedScene=void 0,this.selectedItem=void 0,this.content=void 0,this.notice=void 0,this.error=void 0,this.loading=!!(this.api&&this.device))}updated(e){(e.has("device")||e.has("api"))&&this.api&&this.device&&this.loadCatalogue()}render(){return this.device?this.loading?o`<div class="status" role="status">Loading scenes...</div>`:this.error||!this.catalogue?o`
        <section class="empty">
          <h2>Scenes are unavailable</h2>
          <p role="alert">${this.error??"The scene catalogue could not be loaded."}</p>
        </section>
      `:o`
      <aside class="categories" aria-label="Scene categories">
        ${this.sortedCategories.map(e=>this.categoryButton(e.id,e.label))}
      </aside>

      <aside class="scenes" aria-label="Scenes">
        ${this.filteredSceneEntries.map(e=>e.kind==="custom"?this.sceneButton(`custom:${e.item.id}`,e.label,()=>this.selectCustom(e.item)):this.sceneButton(se(e.scene),e.label,()=>this.selectBuiltin(e.scene)))}
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
      `}get sortedCategories(){return[{id:"all",label:"All scenes"},{id:"custom",label:"Custom"},...this.catalogue?.categories.map(e=>({id:e.id,label:e.name}))??[]].sort((e,t)=>Ut(e.label,t.label))}get compatibleCustomScenes(){return this.library.items.filter(e=>(e.kind==="scene_builtin"||e.kind==="scene_palette")&&e.template?.sku===this.catalogue?.sku)}get filteredCustomScenes(){return this.category==="all"||this.category==="custom"?this.compatibleCustomScenes:[]}get filteredBuiltinScenes(){return!this.catalogue||this.category==="custom"?[]:this.category==="all"?this.catalogue.scenes:this.catalogue.scenes.filter(e=>e.category_id===this.category)}get filteredSceneEntries(){return[...this.filteredCustomScenes.map(e=>({kind:"custom",item:e,label:e.name})),...this.filteredBuiltinScenes.map(e=>({kind:"builtin",scene:e,label:e.display_name}))].sort((e,t)=>Ut(e.label,t.label))}get selectionKey(){return this.selectedItem?`custom:${this.selectedItem.id}`:this.selectedScene?se(this.selectedScene):void 0}categoryButton(e,t){const i=this.category===e;return o`
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
              `:l}
          <button
            class="secondary"
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

      ${t||this.content?.kind==="scene_palette"?this.renderParameters(t,i):l}
    `}renderParameters(e,t){const i=this.content?.kind==="scene_palette"?this.content:void 0;return o`
      <div class="card scene-parameters">
        <div class="parameter-list">
          ${e?o`
                <label class="parameter-entry speed-parameter">
                  <span class="parameter-heading">
                    <span>Speed</span>
                    <output>
                      ${Es(t,e.default_index)}
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
              <h4>Palette</h4>
              <div class="scene-palette" role="list" aria-label="Scene palette">
                ${e.palette.map((t,i)=>o`
                  <span
                    role="listitem"
                    style="--scene-colour: ${_(t)}"
                    aria-label="Colour ${i+1}, ${_(t)}"
                  ></span>
                `)}
              </div>
            </section>
          `:l}
      <section class="parameter-entry visual-parameter">
        <h4>Sequence</h4>
        <ol class="scene-steps" aria-label="Ordered scene steps">
          ${e.steps.map((t,i)=>o`
            <li>
              <span class="step-order">${i+1}</span>
              <span
                class="step-colour"
                style="--scene-colour: ${_(t.colour)}"
                aria-label="Step colour ${_(t.colour)}"
              ></span>
              <span>
                <strong>Raw value ${t.value}</strong>
                <small>Step colour ${_(t.colour)}</small>
                ${t.inline_colour?o`
                      <small>
                        Inline colour ${_(t.inline_colour)}
                      </small>
                    `:l}
              </span>
            </li>
          `)}
        </ol>
      </section>
    `}async loadCatalogue(){if(!this.api||!this.device)return;const e=this.beginRequest();this.loading=!0,this.error=void 0,this.notice=void 0,this.selectedScene=void 0,this.selectedItem=void 0,this.content=void 0;try{const t=await e.api.sceneCatalogue(e.deviceId);if(!this.requestIsCurrent(e))return;this.catalogue=t,this.category="all"}catch(t){this.requestIsCurrent(e)&&(this.error=me(t))}finally{this.requestIsCurrent(e)&&(this.loading=!1)}}selectCategory(e){this.invalidateRequests(),this.category=e,this.selectedScene=void 0,this.selectedItem=void 0,this.content=void 0,this.notice=void 0}async selectBuiltin(e){if(!this.api||!this.device)return;const t=se(e),i=this.beginRequest(t);this.notice=void 0,this.selectedScene=e,this.selectedItem=void 0,this.content=void 0,this.name=e.display_name,this.speedIndex=e.speed?.default_index??null;try{const r=await i.api.sceneDetail(i.deviceId,e.scene_id,e.effect_id);if(!this.requestIsCurrent(i)||se(r.scene)!==t)return;this.selectedScene=r.scene,this.content=r.content,this.name=r.scene.display_name,this.speedIndex=r.content.speed_index}catch(r){this.requestIsCurrent(i)&&(this.notice=me(r))}}async selectCustom(e){if(!this.api||!this.device||!this.catalogue)return;const t=this.catalogue,i=this.beginRequest(`custom:${e.id}`);this.notice=void 0,this.selectedScene=void 0,this.selectedItem=void 0,this.content=void 0,this.name=e.name;try{const r=await i.api.item(e.id);if(!this.requestIsCurrent(i))return;if(r.content.kind!=="scene_builtin"&&r.content.kind!=="scene_palette")throw new Error("This custom scene uses an unsupported definition.");const n=r.content;if(n.template.sku!==t.sku)throw new Error(`This custom scene targets ${n.template.sku}, not ${t.sku}.`);const a=t.scenes.find(c=>c.scene_id===n.template.scene_id&&c.effect_id===n.template.effect_id);if(!a)throw new Error("The source scene is not in this device catalogue.");const d=await i.api.sceneDetail(i.deviceId,n.template.scene_id,n.template.effect_id);if(!this.requestIsCurrent(i)||se(d.scene)!==se(a))return;this.selectedScene=a,this.selectedItem=r,this.content=n,this.name=r.name,this.speedIndex=n.speed_index??a.speed?.default_index??null}catch(r){this.requestIsCurrent(i)&&(this.notice=me(r))}}async save(){if(!this.api||!this.device||!this.catalogue||!this.selectedScene||!this.content||!this.hasCurrentSceneContent()||this.content.kind!=="scene_builtin"&&this.content.kind!=="scene_palette"||!this.isAdmin||this.saving)return;const e=(this.selectedItem?this.name.trim():`${this.selectedScene.display_name} copy`).trim();if(!e){this.notice="Give this custom scene a name before saving.";return}const t=this.content.kind==="scene_palette"?Ss({...this.content,speed_index:this.speedIndex}):{...this.content,speed_index:this.speedIndex},i=this.captureRequest();this.saving=!0,this.notice=void 0;try{const r=this.selectedItem?await this.api.updateItem(this.selectedItem,e,t,this.library.library_revision):await this.api.createItem(e,t,this.library.library_revision);if(r.item.content.kind!=="scene_builtin"&&r.item.content.kind!=="scene_palette")throw new Error("The saved scene returned an unsupported definition.");if(this.dispatchEvent(new CustomEvent("library-item-saved",{detail:{item:r.item,library_revision:r.library_revision},bubbles:!0,composed:!0})),!this.requestIsCurrent(i))return;this.requestGeneration+=1,this.activeSelectionIdentity=`custom:${r.item.id}`,this.selectedItem=r.item,this.content=r.item.content,this.name=r.item.name,this.category="custom",this.notice="Custom scene saved."}catch(r){this.requestIsCurrent(i)&&(this.notice=As(r)==="conflict"?"The library changed elsewhere. Reload the scene before saving.":`Save failed: ${me(r)}`)}finally{this.saving=!1}}useAsTemplate(){!this.isAdmin||!this.selectedScene||this.selectedScene.scene_type!==2||this.content?.kind!=="scene_layered"||!this.hasCurrentSceneContent()||this.dispatchEvent(new CustomEvent("scene-template-selected",{detail:{content:Cs({...this.content,speed_index:this.speedIndex}),config_entry_id:this.device.config_entry_id,name:`${this.selectedScene.display_name} layered`},bubbles:!0,composed:!0}))}async apply(){if(!this.api||!this.device||!this.selectedScene||!this.hasCurrentSceneContent()||!this.isAdmin||!this.catalogue?.enabled||this.selectedItem!==void 0&&this.content?.kind!=="scene_builtin"||this.applying)return;const e=this.captureRequest(),t=this.device,i=this.selectedScene,r=this.speedIndex;this.applying=!0,this.notice=void 0;try{await e.api.applyScene(e.deviceId,i,r),this.requestIsCurrent(e)&&(this.notice=`Applied to ${t.display_name}. Scene identity can be read back; the selected speed remains optimistic.`)}catch(n){this.requestIsCurrent(e)&&(this.notice=`Apply failed: ${me(n)}`)}finally{this.applying=!1}}beginRequest(e){return this.requestGeneration+=1,this.activeSelectionIdentity=e,this.captureRequest()}captureRequest(){return{generation:this.requestGeneration,api:this.api,deviceId:this.device.config_entry_id,category:this.category,selectionIdentity:this.activeSelectionIdentity}}invalidateRequests(){this.requestGeneration+=1,this.activeSelectionIdentity=void 0}requestIsCurrent(e){return e.generation===this.requestGeneration&&e.api===this.api&&e.deviceId===this.device?.config_entry_id&&e.category===this.category&&e.selectionIdentity===this.activeSelectionIdentity}hasCurrentSceneContent(){return!this.catalogue||!this.selectedScene||!this.content||this.content.template.sku!==this.catalogue.sku||this.content.template.scene_id!==this.selectedScene.scene_id||this.content.template.effect_id!==this.selectedScene.effect_id?!1:this.activeSelectionIdentity===this.selectionKey}static{this.styles=W`
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
  `}}C([g({attribute:!1})],k.prototype,"api");C([g({attribute:!1})],k.prototype,"device");C([g({attribute:!1})],k.prototype,"library");C([g({type:Boolean})],k.prototype,"isAdmin");C([h()],k.prototype,"catalogue");C([h()],k.prototype,"category");C([h()],k.prototype,"selectedScene");C([h()],k.prototype,"selectedItem");C([h()],k.prototype,"content");C([h()],k.prototype,"name");C([h()],k.prototype,"speedIndex");C([h()],k.prototype,"loading");C([h()],k.prototype,"saving");C([h()],k.prototype,"applying");C([h()],k.prototype,"notice");C([h()],k.prototype,"error");function se(s){return`builtin:${s.scene_id}:${s.effect_id}`}function Es(s,e){const t=s-e;if(t===0)return"Default";const i=Math.abs(t);return`${t<0?"Slower":"Faster"}${i>1?` ${i}`:""}`}function Ut(s,e){return s.localeCompare(e,"en-AU",{sensitivity:"base"})}function Cs(s){return{...s,template:{...s.template},effect:{layers:_e({layers:s.effect.layers}).layers}}}function Ss(s){return{...s,template:{...s.template},steps:s.steps.map(e=>({...e,colour:[...e.colour],inline_colour:e.inline_colour===null?null:[...e.inline_colour]})),palette:s.palette.map(e=>[...e])}}function me(s){return s instanceof Error||typeof s=="object"&&s!==null&&"message"in s&&typeof s.message=="string"?s.message:"An unexpected error occurred."}function As(s){if(typeof s=="object"&&s!==null&&"code"in s&&typeof s.code=="string")return s.code}customElements.get("govee-scene-browser")||customElements.define("govee-scene-browser",k);var Ps=Object.defineProperty,x=(s,e,t,i)=>{for(var r=void 0,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=a(e,t,r)||r);return r&&Ps(e,t,r),r};const tt=15;class $ extends D{constructor(){super(...arguments),this.showDevicePicker=!1,this.loading=!0,this.devices=[],this.section="custom",this.customEffectCategory="all",this.library={library_revision:0,items:[]},this.name="",this.content=be(),this.paintBrushes=Oe(),this.selectedPaintBrush=0,this.brushUsesBackground=!1,this.saving=!1,this.applying=!1,this.deployments=[],this.editorTransitionEpoch=0,this.loadEpoch=0,this.deploymentRevision=-1}get isAdmin(){return this.hass?.user?.is_admin===!0}get selectedDevice(){return this.devices.find(e=>e.config_entry_id===this.selectedDeviceId)}get dirty(){return B(this.content)?this.savedBaseline!==K(this.name,this.content):!1}get applyCapability(){if(!F(this.content))return;const e=this.selectedDevice?.custom_effects;if(e)switch(this.content.kind){case"h617a_painted":return e.painted;case"h617a_single":return e.single;case"h617a_multi":return e.multi}}get canApply(){return F(this.content)&&this.isAdmin&&!this.applying&&!this.deletingCurrentItem&&this.name.trim().length>0&&this.applyCapability==="supported"}get deletingCurrentItem(){return this.deletingItemId!==void 0&&this.currentItem?.id===this.deletingItemId}get activeDeployment(){const e=this.deployments.find(t=>t.operation_id===this.activeOperationId);return e||!this.applying?e:this.latestDeployment(["pending","uploading","verifying"])}connectedCallback(){super.connectedCallback(),this.hass&&!this.api&&this.load()}disconnectedCallback(){super.disconnectedCallback(),this.loadEpoch+=1,this.beginEditorTransition(),this.stopSubscriptions(),this.api=void 0}updated(e){e.has("hass")&&this.hass&&!this.api&&this.load()}render(){return this.loading?o`<div class="centred" role="status">Loading effect studio...</div>`:this.error?this.renderFatalError():o`
      <h1 class="visually-hidden">Effect Studio</h1>

      ${this.notice?o`<div class="notice" role="status">${this.notice}</div>`:l}

      <main
        class="studio ${this.section==="scenes"?"scenes-mode":"custom-mode"}"
      >
        <nav class="primary-nav" aria-label="Create">
          ${this.navButton("scenes","Scenes")}
          ${this.navButton("custom","Effects")}
          ${this.showDevicePicker?this.renderDevicePicker():l}
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
      ${this.deleteCandidate?this.renderDeleteConfirmation():l}
    `}renderDevicePicker(){return o`
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
        ${this.name||this.currentItem?F(this.content)?this.content.kind==="h617a_painted"?this.renderPaintedEditor():this.renderPaletteEffectEditor():ge(this.content)?this.renderAdvancedEditor():this.content.kind==="opaque"?this.renderOpaqueEditor(this.content):l:l}
      </section>
    `}get customEffectEntries(){return[{kind:"paint",key:"template:paint",label:"Paint",category:"single-layer"},...this.customCatalogue?.effects.map(t=>({kind:"single",key:`template:single:${t.family}:${t.variant}`,label:t.label,category:"single-layer",family:t.family,variant:t.variant}))??[],{kind:"multi",key:"template:mix",label:"Mix",category:"multi-layer"},{kind:"advanced",key:"template:advanced",label:"Layered",category:"advanced"},...this.library.items.filter(t=>Ht(t.kind)).map(t=>({kind:"saved",key:`saved:${t.id}`,label:t.name,category:qs(t.kind),item:t}))].filter(t=>this.customEffectCategory==="all"||t.category===this.customEffectCategory).sort((t,i)=>Us(t.label,i.label))}customEffectCategoryButton(e,t){const i=this.customEffectCategory===e;return o`
      <button
        class="selector ${i?"selected":""}"
        type="button"
        aria-current=${i?"page":l}
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
            `:l}
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
    `}selectCustomEffectEntry(e){if(e.kind==="saved"){this.selectItem(e.item.id);return}if(e.kind==="advanced"){this.newEffect("advanced"),this.customTemplateSelection=e.key;return}if(this.customCatalogue){if(e.kind==="paint"){this.newEffect("h617a_painted",void 0,{name:"New Paint effect",content:be(),selectionIdentity:e.key});return}if(e.kind==="single"){const t=fe("h617a_single",this.customCatalogue);this.newEffect("h617a_single",void 0,{name:`New ${e.label} effect`,content:{...t,family:e.family,variant:e.variant},selectionIdentity:e.key});return}this.newEffect("h617a_multi",void 0,{name:"New Mix effect",content:fe("h617a_multi",this.customCatalogue),selectionIdentity:e.key})}}renderAdvancedEditor(){if(!ge(this.content))return l;const e=this.content.kind==="scene_layered";return o`
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
            ?disabled=${!this.isAdmin||!this.dirty||this.saving||this.deletingCurrentItem}
            @click=${this.save}
          >
            ${this.saving?"Saving...":"Save"}
          </button>
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

      ${this.isAdmin?l:o`
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
          `:l}

      <govee-advanced-effect-editor
        .content=${Ls(this.content)}
        .disabled=${!this.isAdmin}
        .segmentCount=${this.selectedDevice?.segment_count??15}
        @content-changed=${t=>{ge(this.content)&&(this.content=Ns(this.content,t.detail.content))}}
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
            ?disabled=${!this.isAdmin||!this.dirty||this.saving||this.deletingCurrentItem}
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
          ${this.renderEditorDeleteButton()}
        </div>
      </div>

      ${this.renderNewEffectTypeTabs()}

      ${this.isAdmin?l:o`
            <div class="read-only" role="note">
              You can inspect shared effects. An administrator is required to
              edit or apply them.
            </div>
          `}

      <govee-painted-segment-editor
        .colours=${it(this.content)}
        .disabled=${!this.isAdmin}
        @segment-selected=${i=>this.setSegmentColour(i.detail.index)}
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
                .value=${Rs(this.content.background)}
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
            ?disabled=${!this.isAdmin||!this.dirty||this.saving||this.deletingCurrentItem}
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
          ${this.renderEditorDeleteButton()}
        </div>
      </div>

      ${this.renderNewEffectTypeTabs()}

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
        @content-changed=${i=>{this.content=bi(i.detail.content)}}
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
    `}renderNewEffectTypeTabs(){return this.currentItem||!B(this.content)?l:o`
      <div class="custom-mode-tabs" role="tablist" aria-label="Custom effect type">
        ${this.newEffectTypeButton("single","Single")}
        ${this.newEffectTypeButton("multi","Multi")}
        ${this.newEffectTypeButton("advanced","Advanced")}
      </div>
    `}newEffectTypeButton(e,t){const i=zt(this.content)===e,r=e==="single"&&this.content.kind==="h617a_multi"&&this.content.effects.length>1;return o`
      <button
        type="button"
        role="tab"
        aria-selected=${i}
        class=${i?"selected":""}
        title=${r?"Remove all but one effect before switching to Single":l}
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
    `}async selectSection(e){const t=this.beginEditorTransition();if(e===this.section||(this.section=e,this.notice=void 0,e==="scenes")||F(this.content)||ge(this.content)||this.content.kind==="opaque")return;const i=this.library.items.find(r=>Ht(r.kind));if(i){await this.selectItem(i.id,t);return}this.isAdmin?this.newEffect("h617a_painted",t):(this.currentItem=void 0,this.name="")}async load(){const e=this.loadEpoch+1;this.loadEpoch=e,this.loading=!0,this.error=void 0,this.deploymentRevision=-1;const t=new xs(this.hass);this.api=t;try{const[i,r,n,a]=await Promise.all([t.info(),t.devices(),t.library(),t.customCatalogue()]);if(!this.loadIsCurrent(e,t))return;if(!$s(i))throw new Error("This editor bundle is not compatible with the installed backend.");this.devices=r,this.library=n,this.customCatalogue=a,this.selectedDeviceId=this.deviceIdFromPath()??r.find(u=>u.custom_effects.painted==="supported")?.config_entry_id??r[0]?.config_entry_id;const d=await t.subscribeLibrary(u=>{this.libraryChanged(u)},u=>this.subscriptionFailed(u,e,t));if(!this.loadIsCurrent(e,t)||this.error){d();return}if(this.unsubscribeLibrary=d,this.isAdmin){const u=await t.subscribeDeployments(b=>{b.revision<this.deploymentRevision||(this.deploymentRevision=b.revision,this.deployments=b.deployments,this.activeOperationId||(this.activeOperationId=this.latestDeployment(["pending","uploading","verifying","interrupted"])?.operation_id))},b=>this.subscriptionFailed(b,e,t));if(!this.loadIsCurrent(e,t)||this.error){u();return}this.unsubscribeDeployments=u}const c=n.items.find(u=>je(u.kind));c?await this.selectItem(c.id):this.isAdmin&&this.newEffect("h617a_painted")}catch(i){this.loadIsCurrent(e,t)&&(this.stopSubscriptions(),this.error=V(i))}finally{this.loadIsCurrent(e,t)&&(this.loading=!1)}}loadIsCurrent(e,t){return this.isConnected&&this.loadEpoch===e&&this.api===t}subscriptionFailed(e,t,i){this.loadIsCurrent(t,i)&&(this.error=e.message,this.loading=!1,queueMicrotask(()=>{this.loadIsCurrent(t,i)&&this.stopSubscriptions()}))}stopSubscriptions(){this.unsubscribeLibrary?.(),this.unsubscribeDeployments?.(),this.unsubscribeLibrary=void 0,this.unsubscribeDeployments=void 0}deviceIdFromPath(){const e=window.location.pathname.match(/\/ha-govee-led-ble\/editor\/([^/]+)/);return e?.[1]?decodeURIComponent(e[1]):void 0}async libraryChanged(e){const t=this.library.library_revision;if(e.library_revision<t||(this.library=e,!this.currentItem||e.library_revision===t))return;const i=e.items.find(a=>a.id===this.currentItem?.id);if(!i){if(this.deletingItemId===this.currentItem.id)return;this.notice="This effect was removed from the shared library.";return}if(i.revision===this.currentItem.revision)return;if(this.dirty){this.notice="This effect changed elsewhere. Reload it before saving.";return}const r=this.beginEditorTransition();await this.selectItem(i.id,r)&&this.editorTransitionIsCurrent(r)&&(this.notice="Loaded the latest shared revision.")}sceneLibraryItemSaved(e){this.library={library_revision:e.detail.library_revision,items:Kt(this.library.items,e.detail.item)}}sceneTemplateSelected(e){if(!this.isAdmin||e.detail.config_entry_id!==this.selectedDeviceId)return;const t=this.beginEditorTransition();this.currentItem=void 0,this.name=e.detail.name.trim()||"Layered scene template",this.content=ht(e.detail.content),this.savedBaseline=void 0,this.section="custom",this.customEffectCategory="all",this.customTemplateSelection=void 0,this.notice=void 0,this.selectNewEffectName(t)}backToScenes(){this.beginEditorTransition(),this.section="scenes",this.notice=void 0}beginEditorTransition(){return this.editorTransitionEpoch+=1,this.editorTransitionEpoch}editorTransitionIsCurrent(e){return e===this.editorTransitionEpoch}deviceChanged(e){this.beginEditorTransition(),this.selectedDeviceId=e.target.value,this.activeOperationId=void 0,this.activeOperationId=this.latestDeployment(["pending","uploading","verifying","interrupted"])?.operation_id,this.notice=this.applyAvailabilityNotice()}switchNewEffectType(e){if(!this.isAdmin||this.currentItem||!B(this.content)||zt(this.content)===e)return;if(e==="advanced"){this.newEffect("advanced");return}const t=e==="single"?"h617a_single":"h617a_multi";if(F(this.content)){this.switchCustomMode(t);return}this.newEffect(t)}switchCustomMode(e){if(!this.isAdmin||!this.customCatalogue||!F(this.content)||this.content.kind===e)return;const t=this.content;if(e==="h617a_single"&&t.kind==="h617a_multi"&&t.effects.length>1)return;let i;if(e==="h617a_painted"){const r=t.kind==="h617a_painted"?this.activePaintBrush:t.palette[0]?[...t.palette[0]]:[47,111,237];i={...be(),speed:t.speed,groups:[{fill:[...r],segments:Array.from({length:tt},(n,a)=>a)}]},t.kind!=="h617a_painted"&&(this.paintBrushes=Ms(t.palette),this.selectedPaintBrush=0),this.brushUsesBackground=!1}else if(t.kind==="h617a_painted"){const r=Bs(t);if(e==="h617a_single"){const n=fe(e,this.customCatalogue);i={...n,speed:t.speed,palette:r.length?r:n.palette}}else{const n=fe("h617a_multi",this.customCatalogue);i={...n,speed:t.speed,palette:r.length?r:n.palette}}}else if(e==="h617a_multi"&&t.kind==="h617a_single")i={kind:e,effects:[{family:t.family,variant:t.variant}],speed:t.speed,palette:t.palette.map(r=>[...r])};else if(e==="h617a_single"&&t.kind==="h617a_multi"){const r=t.effects[0];i={kind:e,family:r.family,variant:r.variant,speed:t.speed,palette:t.palette.map(n=>[...n])}}else return;this.content=i,this.customTemplateSelection=e==="h617a_painted"?"template:paint":void 0,/^New (Paint|Painted|Single|Multi) effect$/.test(this.name)&&(this.name=`New ${Je(e)} effect`),this.notice=this.applyAvailabilityNotice()}newEffect(e,t,i){const r=t??this.beginEditorTransition();!this.api||!this.isAdmin||e!=="advanced"&&!this.customCatalogue||(this.currentItem=void 0,this.customTemplateSelection=e==="advanced"?void 0:i?.selectionIdentity??(e==="h617a_painted"?"template:paint":void 0),this.name=i?.name??`New ${Je(e)} effect`,this.content=i?.content??(e==="advanced"?Wi():fe(e,this.customCatalogue)),e==="h617a_painted"&&(this.brushUsesBackground=!1),this.savedBaseline=void 0,this.notice=this.applyAvailabilityNotice(),this.selectNewEffectName(r))}selectNewEffectName(e){this.updateComplete.then(()=>{if(!this.editorTransitionIsCurrent(e)||this.currentItem)return;const t=this.shadowRoot?.querySelector(".editor .name-input");t?.focus(),t?.select()})}renderEditorDeleteButton(){return!this.isAdmin||!this.currentItem?l:o`
      <button
        class="danger"
        type="button"
        ?disabled=${this.deletingItemId!==void 0||this.saving||this.applying}
        @click=${e=>this.requestDelete({id:this.currentItem.id,revision:this.currentItem.revision,name:this.currentItem.name},e.currentTarget)}
      >
        ${this.deletingCurrentItem?"Deleting...":"Delete"}
      </button>
    `}requestDelete(e,t){!this.api||!this.isAdmin||this.deletingItemId!==void 0||this.saving||this.applying||(this.deleteCandidate={...e},this.deleteReturnFocus=t,this.notice=void 0,this.updateComplete.then(()=>{this.shadowRoot?.querySelector(".delete-dialog .danger")?.focus()}))}cancelDelete(){const e=this.deleteReturnFocus;this.deleteCandidate=void 0,this.deleteReturnFocus=void 0,this.updateComplete.then(()=>{e?.isConnected&&e.focus()})}deleteDialogKeyDown(e){e.key==="Escape"&&(e.preventDefault(),this.cancelDelete())}async confirmDelete(){const e=this.deleteCandidate,t=this.api;if(!e||!t||!this.isAdmin||this.deletingItemId!==void 0)return;const i=this.library.library_revision;this.deleteCandidate=void 0,this.deleteReturnFocus=void 0,this.deletingItemId=e.id,this.notice=void 0;try{const r=await t.deleteItem(e,i);r>=this.library.library_revision&&(this.library={library_revision:r,items:this.library.items.filter(n=>n.id!==e.id)}),this.currentItem?.id===e.id&&this.currentItem.revision===e.revision&&(this.beginEditorTransition(),this.currentItem=void 0,this.customTemplateSelection=void 0,this.name="",this.content=be(),this.savedBaseline=void 0),this.notice=`Deleted ${e.name}.`}catch(r){const n=Vt(r)==="conflict";if(this.notice=n?"This effect or library changed elsewhere. Reload before deleting.":`Delete failed: ${V(r)}`,n)try{const a=await t.library();a.library_revision>=this.library.library_revision&&(this.library=a)}catch(a){this.notice+=` Library refresh failed: ${V(a)}`}}finally{this.deletingItemId=void 0}}async selectItem(e,t){const i=t??this.beginEditorTransition();if(!this.api)return!1;try{const r=await this.api.item(e);return this.editorTransitionIsCurrent(i)?r.content.kind==="opaque"?(this.currentItem=r,this.customTemplateSelection=void 0,this.name=r.name,this.content=Ts(r.content),this.savedBaseline=void 0,this.notice="This effect definition is preserved, but this editor cannot change or apply it.",!0):B(r.content)?(this.currentItem=r,this.customTemplateSelection=void 0,this.name=r.name,this.content=We(r.content),r.content.kind==="h617a_painted"&&(this.brushUsesBackground=!1),this.savedBaseline=K(r.name,r.content),this.notice=this.applyAvailabilityNotice(),!0):(this.notice="This item cannot be edited here.",!1):!1}catch(r){return this.editorTransitionIsCurrent(i)&&(this.notice=V(r)),!1}}nameChanged(e){this.name=e.target.value}paintBrushesChanged(e){this.paintBrushes=e.detail.palette.map(t=>[...t]),this.selectedPaintBrush=Math.max(0,Math.min(this.selectedPaintBrush,this.paintBrushes.length-1)),this.brushUsesBackground=!1}paintBrushSelected(e){this.selectedPaintBrush=e.detail.index,this.brushUsesBackground=!1}get activePaintBrush(){return[...this.paintBrushes[this.selectedPaintBrush]??this.paintBrushes[0]??[47,111,237]]}backgroundChanged(e){this.updateContent({background:Os(e.target.value)})}effectChanged(e){this.updateContent({effect:e.target.value})}setSegmentColour(e){if(this.content.kind!=="h617a_painted")return;const t=it(this.content);t[e]=this.brushUsesBackground?[...this.content.background]:this.activePaintBrush,this.content={...this.content,groups:qt(t,this.content.background)}}paintAll(){if(this.content.kind!=="h617a_painted")return;const e=this.brushUsesBackground?this.content.background:this.activePaintBrush;this.content={...this.content,groups:qt(Array.from({length:tt},()=>[...e]),this.content.background)}}resetPaint(){this.content.kind==="h617a_painted"&&(this.content={...this.content,groups:[]})}updateContent(e){this.content.kind==="h617a_painted"&&(this.content={...this.content,...e})}async save(){if(!this.api||!this.isAdmin||!this.dirty||this.saving||this.deletingCurrentItem||!B(this.content))return;const e=this.api,t=this.name.trim();if(!t){this.notice="Give this effect a name before saving.";return}const i=this.beginEditorTransition(),r=this.currentItem,n=We(this.content),a=this.library.library_revision;this.saving=!0,this.notice=void 0;try{const d=r?await e.updateItem(r,t,n,a):await e.createItem(t,n,a);if(!B(d.item.content))throw new Error("The saved effect returned an unsupported definition.");const c=d.item.content;d.library_revision>=this.library.library_revision&&(this.library={library_revision:d.library_revision,items:Kt(this.library.items,d.item)}),this.editorTransitionIsCurrent(i)&&jt(this.currentItem,r)&&B(this.content)&&K(this.name,this.content)===K(t,n)&&(this.currentItem=d.item,this.customTemplateSelection=void 0,this.name=d.item.name,this.content=We(c),this.savedBaseline=K(this.name,this.content)),this.editorTransitionIsCurrent(i)&&jt(this.currentItem,d.item)&&B(this.content)&&K(this.name,this.content)===K(d.item.name,c)&&(this.notice="Saved.")}catch(d){if(Vt(d)==="conflict"){const c="This effect or library changed elsewhere. Reload before saving.";this.editorTransitionIsCurrent(i)&&(this.notice=c);try{const u=await e.library();u.library_revision>=this.library.library_revision&&(this.library=u)}catch(u){this.editorTransitionIsCurrent(i)&&(this.notice=`${c} Library refresh failed: `+V(u))}}else this.editorTransitionIsCurrent(i)&&(this.notice=`Save failed: ${V(d)}`)}finally{this.saving=!1}}async apply(){if(!this.api||!this.canApply||!F(this.content)||!this.selectedDeviceId)return;const e=this.name.trim(),t=this.selectedDeviceId,i=this.editorTransitionEpoch;this.activeOperationId=void 0,this.applying=!0,this.notice=void 0;try{const r=!this.dirty&&this.currentItem?await this.api.applySaved(t,this.currentItem):await this.api.applySnapshot(t,e,this.content);if(i!==this.editorTransitionEpoch||t!==this.selectedDeviceId)return;this.activeOperationId=r.operation_id,this.deployments=[r,...this.deployments.filter(n=>n.operation_id!==r.operation_id)]}catch(r){i===this.editorTransitionEpoch&&t===this.selectedDeviceId&&(this.notice=`Apply failed: ${V(r)}`)}finally{this.applying=!1}}applyAvailabilityNotice(){if(!ge(this.content))return this.selectedDeviceId&&!this.selectedDevice?"This device is temporarily unavailable in Home Assistant. Apply is disabled until it is loaded.":this.applyCapability==="supported"?void 0:`${Je(this.content.kind)} effects cannot be applied to this device.`}latestDeployment(e){return[...this.deployments].filter(t=>t.config_entry_id===this.selectedDeviceId&&e.includes(t.phase)).sort((t,i)=>i.updated_at.localeCompare(t.updated_at))[0]}static{this.styles=W`
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
      display: grid;
      gap: 6px;
      margin-top: auto;
      padding-top: 18px;
      border-top: 1px solid var(--studio-border);
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
  `}}x([g({attribute:!1})],$.prototype,"hass");x([g({attribute:!1})],$.prototype,"panel");x([g({type:Boolean})],$.prototype,"showDevicePicker");x([h()],$.prototype,"loading");x([h()],$.prototype,"error");x([h()],$.prototype,"notice");x([h()],$.prototype,"devices");x([h()],$.prototype,"selectedDeviceId");x([h()],$.prototype,"section");x([h()],$.prototype,"customEffectCategory");x([h()],$.prototype,"customTemplateSelection");x([h()],$.prototype,"library");x([h()],$.prototype,"customCatalogue");x([h()],$.prototype,"currentItem");x([h()],$.prototype,"name");x([h()],$.prototype,"content");x([h()],$.prototype,"paintBrushes");x([h()],$.prototype,"selectedPaintBrush");x([h()],$.prototype,"brushUsesBackground");x([h()],$.prototype,"saving");x([h()],$.prototype,"applying");x([h()],$.prototype,"deleteCandidate");x([h()],$.prototype,"deletingItemId");x([h()],$.prototype,"deployments");x([h()],$.prototype,"activeOperationId");function be(){return{kind:"h617a_painted",effect:"clockwise",speed:50,brightness:100,background:[0,0,0],groups:[]}}function fe(s,e){if(s==="h617a_painted")return be();const t=e.effects[0],i={family:t.family,variant:t.variant};return s==="h617a_single"?{kind:s,...i,speed:50,palette:Oe()}:{kind:s,effects:[i],speed:50,palette:Oe()}}function Ds(s){return{...s,background:[...s.background],groups:s.groups.map(e=>({fill:[...e.fill],segments:[...e.segments]}))}}function bi(s){return s.kind==="h617a_painted"?Ds(s):s.kind==="h617a_single"?{...s,palette:s.palette.map(e=>[...e])}:{...s,effects:s.effects.map(e=>({...e})),palette:s.palette.map(e=>[...e])}}function We(s){return s.kind==="advanced"?_e(s):s.kind==="scene_layered"?ht(s):bi(s)}function Ts(s){return{...s,body:structuredClone(s.body)}}function ht(s){return{...s,template:{...s.template},effect:{layers:_e({layers:s.effect.layers}).layers}}}function Ls(s){return s.kind==="advanced"?s:{kind:"advanced",layers:s.effect.layers}}function Ns(s,e){return s.kind==="advanced"?_e(e):{...ht(s),effect:{layers:_e(e).layers}}}function Oe(){return[[255,0,0],[255,127,0],[255,255,0],[0,255,0],[0,0,255],[0,255,255],[139,0,255]]}function Ms(s){const e=[];for(const t of[...s,...Oe()])if(e.some(i=>Fe(i,t))||e.push([...t]),e.length===8)break;return e}function it(s){const e=Array.from({length:tt},()=>[...s.background]);for(const t of s.groups)for(const i of t.segments)e[i]=[...t.fill];return e}function qt(s,e){const t=new Map;return s.forEach((i,r)=>{if(Fe(i,e))return;const n=i.join(","),a=t.get(n);a?a.segments.push(r):t.set(n,{fill:[...i],segments:[r]})}),[...t.values()]}function Bs(s){const e=[];for(const t of it(s))if(!Fe(t,s.background)&&!e.some(i=>Fe(i,t))&&e.push([...t]),e.length===8)break;return e}function Fe(s,e){return s[0]===e[0]&&s[1]===e[1]&&s[2]===e[2]}function Rs(s){return`#${s.map(e=>e.toString(16).padStart(2,"0")).join("")}`}function Os(s){return[Number.parseInt(s.slice(1,3),16),Number.parseInt(s.slice(3,5),16),Number.parseInt(s.slice(5,7),16)]}function K(s,e){return JSON.stringify({name:s.trim(),content:e})}function je(s){return s==="h617a_painted"||s==="h617a_single"||s==="h617a_multi"}function F(s){return typeof s=="object"&&s!==null&&"kind"in s&&je(s.kind)}function B(s){return F(s)||typeof s=="object"&&s!==null&&"kind"in s&&Ce(s.kind)}function zt(s){return s.kind==="h617a_multi"?"multi":Ce(s.kind)?"advanced":s.kind==="h617a_painted"||s.kind==="h617a_single"?"single":void 0}function Ce(s){return s==="advanced"||s==="scene_layered"}function ge(s){return Ce(s.kind)}function Fs(s){return je(s)||Ce(s)||s==="scene_builtin"||s==="scene_palette"}function Je(s){switch(s){case"h617a_painted":return"Paint";case"h617a_single":return"Single";case"h617a_multi":return"Multi";case"advanced":return"Layered";default:return"Custom"}}function Us(s,e){return s.localeCompare(e,"en-AU",{sensitivity:"base"})}function Ht(s){return je(s)||Ce(s)||!Fs(s)}function qs(s){return s==="h617a_multi"?"multi-layer":s==="h617a_painted"||s==="h617a_single"?"single-layer":"advanced"}function jt(s,e){return s?.id===e?.id&&s?.revision===e?.revision}function Kt(s,e){return[...s.filter(t=>t.id!==e.id),{id:e.id,revision:e.revision,name:e.name,kind:e.content.kind==="opaque"?e.content.source_kind:e.content.kind,..."template"in e.content?{template:e.content.template}:{}}].sort((t,i)=>t.name.localeCompare(i.name))}function V(s){return s instanceof Error||typeof s=="object"&&s!==null&&"message"in s&&typeof s.message=="string"?s.message:"An unexpected error occurred."}function Vt(s){if(typeof s=="object"&&s!==null&&"code"in s&&typeof s.code=="string")return s.code}customElements.get("ha-govee-led-ble-editor")||customElements.define("ha-govee-led-ble-editor",$);
