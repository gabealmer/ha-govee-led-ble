"""H617A scene catalogue — generated from Govee API for H617A."""

import base64
import json
import zlib
from dataclasses import dataclass
from typing import cast


@dataclass(frozen=True, slots=True)
class ScenePage:
    """One adjustable page of a scene: the body record it names, and that record's Speed options.

    ``page`` is the record index inside the scene body, not the entry's position in the
    catalogue config array (see tools/ble/kaitai/scene_body.ksy). ``move_in`` and ``move_all``
    are the option lists for ``selected_area_movement.speed`` and ``overall_movement.speed``;
    a page carries one or both.
    """

    page: int
    move_in: tuple[int, ...] = ()
    move_all: tuple[int, ...] = ()


@dataclass(frozen=True, slots=True)
class SceneSpeed:
    """The vendor Speed slider for one scene: one shared position written across every page."""

    default_index: int
    pages: tuple[ScenePage, ...]


@dataclass(frozen=True, slots=True)
class SceneEntry:
    code: int
    param: str = ""
    scene_type: int = 2  # multi-frame body prefix: 2 (default), 0 (simple), 1 (e.g. Halloween/Sweet)
    speed: SceneSpeed | None = None

    @property
    def is_simple(self) -> bool:
        return not self.param


_SCENES_PAYLOAD = "c-pmE+jHVdkN;Ov^Rf@5s__LdTXi1V7ceIw!AZy@nK}<ZjByN@0TKtc_J3cgZ@yqA`M%vv9Zyc$l3T4-OZrLuUq5#5>utOXfBfgK=H-tcm(71JacCFrVMLQ7^K={Ta75SI#^n!sc&0R<S2XfTKj=4|D0L2Y&?Cg6bVS$>{$7qO+N1rS6n~r{rIFP`o*wl(Fk&~N)U$zR56>O&n8+`G?3DeB^mgD6dUoJ+7J*Gi1seL-Uq3*+$@@0lPPlj`h!<1EI*dH_N8@eaGFA}l_XqsW9IC{k)a6TY+c?sQs5b{ua5?FSF9k$~cP?R5Uh0>>;6KpMFWu-|>ZW<Aw?I$7{=uKiAImse?AP%+;v%&`r27?!<1vvag(vVFav1iRrr@XgyB9nSz2NCau26mPVv66?JJ#h7`z}r7GUvgFfQH~N&=3<7mj};XuElxeTW4q@*iDDac14jU0vaxhLp|yr=^{;Y8t0TI@=dyECOOTB*uY7$)WNwV9eV<yLQo&7@gJ#01D-DE@0Y;`O&ta-P^~WXy4z2-+rz~!IdH|c)m}TO)PB%2hi?Pt;KE+x0{sr*3#GJRf-chHexgZ{hk>UAygiobh4Ocst=h{DT0f{gN_*U7_=mx~`s5f<VxWl$3k9=@GpT1W{ldJ$=}E>-6iv+v=qoYC6pf!Wca)0&=4Lnf-cj!We-Fgc9Q-~Zr>9`|zFLJ_E+&`<Y?<16F&!nxfjz{PD(io)ibO%A9uol%GK$2edJ<X@CjfoIWVz&%b<a<RI>{$X>L%+~*Dv3B)SVS4%;NQ4tgi#Uihkx(IuSSsno`(JZj#xl%3-sk9-3@GJ*3&gv-u$8m9W!2@B+UJN3w=KJ)sBM0hqj{yn(^J0W)QA2F!B7q+14>vtIK;n)G%Oucv9o4z=>O@iyek)bNxuD*zwb%ZAZy2aQ&{1H;u4pD)!V9$MLbvPQ>&>R1KW<muByOX*9mLiDCjn($;MJkj4?<XRqDW}Ga5r2lO`>Neo%(s=38MKI>O$vlGHUIcyeIc9Y1Ie?7W?1AlO=349|91`xesPZIs`%ds3f!>69G?Vd>%<_Ag+d?a_i;lNha1dS4W((D<6-RXDjTtrkamgRE#AFCpqZ?hdDV)iagC_Gx%CBdW53w;iy7Zy)Ji=s^H({PfcoQ%4Ep<$#tu#;VLCx|ShMS9B$m3ZD!|g&kg8bkZ=m`1`Wq*YsGfLTsxT5|OKd=J`nT?-SXOT>{yZyyXEy%1!^<E;Q`bPln5nMZIJ<~OW&K`!tsFxJZ^ay!gsJ~)94XnT(aX*Ouk2F6Bobj;avm6nkAv+jG?h36M_*^;!rS&^3epE${mXld59RS2s+kqey&=+n=E<ykJf}vbGFFe?hP>*9jen~4;$=B55wAYN5d<K1_JBig|3{F#9IMWiJLBTIo_zFB*TCwVCI&pb6$B5EteDNCY!Y$9sIxHAE7|9Q))nz0M#SYx%+khV2j5gtSZY*F_(byKjFzfXoiY3nuMljL|PNK^yP1h_7;j>{JjO~cW!Cvx0?SvhGJ2V!IPmM^f*P~A}YU@I>Ug8VMfY!legxc+>G+X(UYpv#`)`c`cZ;GYQmuVJmFXnN$eC5($xQh=FX#WK*aT&SyOqz)L&A<*xHl#$)SSVxbgG1B}Tp=AO#{Mm&^A0^B2Uw$h%<T9?GUHS-4Sj`_?lsNUoAh1SX&3Eun9(S(rCrcy0MZ1WvWLQ<@B+69_BRF^TiPlO0!j|geMwc#6&YXV&Z*Od+-vNzIoLdmzjHN&yyVmD)5=egpFR9c9$;>tM*V4oxpQ{=GRLf`kn8d1)En#CCHHBjuv;9|U;rQ8kU8A@dd<@}iv@Az+CH<)W;tvUVU9zDYqR--QE-t6I`<0c=ARG+)f#LF$`E0`Lx+(lD5vo%KASu?mxH!h2-qL#ayD6~d<7Vv?{Clx^>`Y>0R);A+87uV#d8Q7Kzotj;>x~x{1!a}9RC*mza|f!Op(nx+*`6OMjGUS^YM4x$;`u7x9F+FpmJY&-Jns&4nY^)IzD<+%N?CixCA~ORQYoTOLT>S6PBfAR!=3KhaFE}G|vYo`w28-aL&e`c~YPABt9&e^VpgTJRZXq5$9=UmV-Rx6TXdymC-eqJQM97+`xV4-zAjMH8B-pDwK3@ijEfOjwz>$1YI>#(Asc-+TwI+1$EcH(8XEQ!7K5|QBZsB3$y+OQ~xa8u5(XoLE>XCnpO4F7M`&t;5~DIKI|YO%;AJ?A?WmBk*@hoI{oatked|f3RqQs&#d|0ZxxfAD90=#01e*VLso0`O51v28%_q<7D#34MfF!H&C@}q_EoqK)9uA>fuWA8-e71Kt(fA{erE&WI?HJc{C^uDy9NqS+w=u(tJa-M`CAf}R{>79;1=i0gT%;|Dg1i$43qb}&(UZIxupAvdy3h8_WWp57rd0)vN4H{#<*A0p8?WY?(r`0IuCCRLU#WBt<kuhw_bC4nK$~wBfV<CcWEbic8T78Cfe|Zbfb?_odHDKZ^IB2IeFzUOS4+Vl)Aru3~n24)}VkwoYzq+9FM?=RZK*z|BQ5_yJ&Q62PtJ}rP0h<r2Ce~Ql8sFvh{{BS7uGKMTixP=`!8z($$X7-!9JI%VwgUVqiJqINy_O+EDYWEY0ioBaW6Lq|>)Xckt2RwHH^bmZkoYW>wfgQ9{{<lNFZ(bGT3aj!hKxUn8)1Q6F-Cl7{wpzlF?jWO6yuK<G=`2b>OaV*7gYkmm&UZ}BakJkaYqS!)VMofjJsBXu{YQ3MQ$K`kq{{cXJ2EIBT*c%6$@5F^V+N;NEd6V%c$tbz!V(LA1|p^_#&<o1=*IHPW+zH^sqXJ|U=J3+ZHP&ng-kf)z}VVrwm*1r(A5y1e9lUlRcYzaiiYXaB9Z1gus>Qb!Je!?j{&H!hp{5Skv(q!g2RV{&M^h=torSW{F0a=xrtY0r8EOYFHVAA}v03vHY!p#+efqNKc#2mkgvZFx@TmJ@riqX-T4Q_l=N<~!>m@mJrwVRlD->3>vKNvYqG;~^T1J5Paz{%#sCU1bJr(l%VCPggb+&FT!KE3TY(XG=u4m{GmIULL<;*LMa_@nXSMLv9ZlmNX~ribr83_Scc&Vk>?IbbD2{{5GJ4Sf%3kO%3J&lp*EFvlz7QI2FA@Aj*Sa3S4)tqh6TMV=t$RnUImuK=dnz{kpvvO><Gv)=|OW(unFaM}<@-<6pY@_2z$3zAB<T7tAEFSIU<G!ZRm1*o@}ED`L5Yur^<42iNS>0*A%mNllNu_iWxPGaHMMh{>N6bjhX1G|QVF2$%0Dv9WiOAS>C7P$;1mhH-_+ce(p7q1hJO}dCpVoNCaS}554|E>4R!fLz?vviyAt?p{fkn1WP9{*}x1>@%NTl7((;(@)HV#Ona6=vn=CV6@F0wg}e$F-325#zedSB(O^1jY(^xrv+%3P{E)A<S$Fy@J9Zvz*OjyBB+j#X77*<6f}C;*D8#;4`>pD->8$Bt&el@)cl>#}a=_ZDp$F)enXgR}K5>|LI$>GlO#7%R3;#;u=d`@(GM+OIR?h9wv>)5Htn7*(?_~HQl<zr<6RtPS&&VqM!kmIu@no8u&`;|ILa|>qmRYh5loAp^jLwQ^$^oCo7xaTXwV!hx%CR-oO(_s=7JA^a5!OnE7bYaydozD5{gTs^wHKFQ*o)Ta{B!C$#G($`<iHypTRcYqnU^uMoXRo?O`gRvOjlwF4)&=T5GPPR=L$kp-y;z!1Chn>z0ni1r4i_!oC#+jKQq@8cP;bfgDcr5`b-O{Qw(f+tz?b>}(fRjFW&_(^yLPuVE?t)SGW0UP!5dMDp)z)_7lr?2dkKgH^RDzuAYys+1`sw;LoO3ofuG3}uLlhskh{;Z{p`B_4Y0d)Qo(xE}*)>qTYTZZ9=&xAEYjwWEH-f)<ynOs&QM6}qUHFeOf>g;yAC2JZCqh2y(wbp@CtPY<R=le~hJ6D{a%=h7Tou+K>P>p9>0H?DwPg(#C)XVUR)Y>h?89s@I_S!sY;x#tUY?8Mc=4BY~-g&D^Z|c>)JE!bE3|OYX%CAPD?~Y|B(XJZu+6uLBL6BO5)>lZ!3VLTcY=xeU1kA7TezK3H(wNH|N_o~dqM|)r4!tYP{T9cDolG0H@j(D5&y?~+17s-5WK4O~Hd&!Mb4u%<rOR|Xe_!$m(Vg8t^NfM_#6tWe<|-#0PHoXqQ9lzOgRJDhztmFArK^JLa6kf&G&he#8!tA1Qy)J*PTa^VqPu0Bh)roLC3v`~G0)ZAeUy6Ma@4?+G8}hA)`GP{Q3Z}7VQIrIB5V?QuC%n9-5O?f-%n?S1@Kur0<#6OImU4-;zd20lU{&WP~1(Zp&^}_-wXUd(;O4u3$EL2OU}_`)0bW#R&`hOeH^i5tagM^EWELU2cuNiHj4e2yqjC;$y8tHMMP^>E1st>c(j(<lO@isLT>p{1gzAgUXLH8vCnf(w~%i-yqS-galS?v^m;0i<GleuXw04@lDq#7Pr`X5vWu!$VCryf9YPJ);Wi3+)Y95AN^Q33JbjnOV=0rp;w9;UboHXMx+QctXQt>C5zSe8NKLPK`pHwzI+S9bLn)^(*g}54$1GZdyj>MW2HbBz7+3@d5Zvj9MYTD9JdCGB$2-}wDvYk7cR#TFepFom+ik=zfL&Sv)jf7b#e%<}w<0=I^y)4Zc3Y{u5M>k7Kg~9)_5E@uvPK!$j^j(g7;>LbR#X*!eYi-lgTtGrS0mVu2SRIqL`+H7kqEE4rYl=;lx~;crH=z;3%ksjlH;g)$49g?MtEt)hH&h?30vR|=`~T;(!{)r$!5dduV!F}A>lhp`BkQuet@Y314Jx25EtF#5y8t8>|=}cF2~AwNm-^O?9Rwt`cOwB(-lGUSW6?ICeU=x(~$f-LDkZ`m#5bqv_iqR5LOl7I(=c(yf8$4s*Zz4=)(@unmB#maXqvAKPi;<eAF|A<IRDmaB))KB~THc*&idP=N4DlpNQ}FHe8029S@QkhTHfhkZuskUMRo%pdf*`a)sXp*V*Nk_VV~`9_m`PhpaZV)LjaRCMzK>i|L}SSIp#(1Ld_Pnq*C-%<rnJUab6I&r`h7@VzT5MvY%MxyusoW+|7uBQU5aS;>kB{QeSyf}=Nits!;!!N%GKlfQo=KjnQ(mO$3j8vZH9ZmZbV$U`%iJ>Bf%RlMWj3Kk#%L%`CAWs8@=5z4znk8cS1`@KJEyVaCz5dsdMh7%qyv>Y;s29+n1I{;$yj!j0SRQ#7$VCgL{y3?_vDsPoW$7~UXDj(HZcU=qe=-$t}2f{Y;>_~h3BV8uw?giqaz5O(BTS9Pt<HH=U*|CdUv+jn#_iwiBG8q8yN}PQ^jH=x{$nHGZZPcj!B)Wf=2mtX}dVNUEjJ8N8L3$ZWlRwcLk?kQ41p1DkU!A1~IkdojByF?!{q#@toq#5!Gsx-Bx(L0Bq|IudT@Gr+tg}jKo(_sIKG`j}+7Ub5Pf+cHQW0RmuXuBKJZ7e$XZD~+g^T&ZyYXox*2m<kw7VpeZTV+UdIavstvvTE?A9rL?)ZC=L^HWH{E?pZ?3~i>e(`-tpMHnlD|SUnr=on#@Za8D?Tf36yZvOAsB_h-mfraG9b699W#|R1+$uj4{F&C1wd4w5FW9dt<uZx(aLg0d=Cf1@9+1#}5wZ%Js$p$nj_CC^yZI62*V%6=f>Y}gtkTRtGSh#an~>GE-|fz}0nW`7E!<djfvDo?OCEmN^tlUg@nKJ=4RCgnFUh+{f^U)YIitpJd%tZszR}RKDJjgiI^iqMmrZ)zU``%aQ)0KTNnyV9Pkh#+OKg2jVBR}tWR28(wT@O-E!7HKwTdQH9W?3&&C@~Nrd=HN3l3s*el0#ZX|GbRFUyPaD6<TlmAWNtUDEt|9Eb0%2-clFPi^dq2|nIxK@^AAH{2I`zwFoZmFH7@)IAoX<#d^*LV9d6J4u!w2mUp-+alwijoK62@JaWMOQZm_le~S&cQ_KV@EeRzm06PImwX!VWphK!C;5!8`PRe|np5-rA2^=o`LF^%|NTF!p8zx"  # noqa: E501


def _load_speed(data: list[object]) -> SceneSpeed | None:
    if len(data) < 4:
        return None
    default_index, raw_pages = cast(tuple[int, list[list[object]]], data[3])
    pages = tuple(
        ScenePage(
            page=cast(int, entry[0]),
            move_in=tuple(cast(list[int], entry[1])),
            move_all=tuple(cast(list[int], entry[2])),
        )
        for entry in raw_pages
    )
    return SceneSpeed(default_index=default_index, pages=pages)


def _load_scenes() -> dict[str, SceneEntry]:
    raw: dict[str, list[object]] = json.loads(zlib.decompress(base64.b85decode(_SCENES_PAYLOAD)))
    scenes: dict[str, SceneEntry] = {}
    for name, data in raw.items():
        code = data[0]
        if not isinstance(code, int):
            raise ValueError(f"Invalid scene code for {name}: {code!r}")
        param = data[1] if len(data) > 1 else ""
        scene_type = data[2] if len(data) > 2 else 2
        if not isinstance(scene_type, int):
            raise ValueError(f"Invalid scene_type for {name}: {scene_type!r}")
        scenes[name] = SceneEntry(
            code,
            param if isinstance(param, str) else str(param),
            scene_type,
            _load_speed(data),
        )
    return scenes


SCENES = _load_scenes()


def get_scene_names() -> list[str]:
    return sorted(SCENES)
