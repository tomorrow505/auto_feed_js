export const regTeamName: Record<string, RegExp> = {
    MTeam: /-(.*mteam|mpad|tnp|BMDru|MWEB)/i,
    CMCT: /-(CMCT|cmctv)/i,
    HDSky: /-(hds|.*@HDSky)/i,
    CHDBits: /-(CHD|.*@CHDBits)|@CHDWEB/i,
    OurBits: /(-Ao|-.*OurBits|-FLTTH|-IloveTV|OurTV|-IloveHD|OurPad|-MGs)$/i,
    TTG: /-(WiKi|DoA|.*TTG|NGB|ARiN)/i,
    HDChina: /-(HDC)/i,
    PTer: /-(Pter|.*Pter)/i,
    HDHome: /(-hdh|.*@HDHome)/i,
    PThome: /(-pthome|-pth|.*@pth)/i,
    Audiences: /(-Audies|.*@Audies|-ADE|-ADWeb|.*@ADWeb)/i,
    PTLGS: /(-PTLGS|.*@PTLGS)/i,
    PuTao: /-putao/i,
    NanYang: /-nytv/i,
    TLFbits: /-tlf/i,
    HDDolby: /-DBTV|-QHstudIo|Dream$|.*@dream/i,
    FRDS: /-FRDS|@FRDS/i,
    PigGo: /PigoHD|PigoWeb|PiGoNF/i,
    CarPt: /CarPT/i,
    HDVideo: /(-HDVWEB|-HDVMV)/i,
    HDfans: /HDFans/i,
    'WT-Sakura': /SakuraWEB|SakuraSUB|WScode/i,
    HHClub: /HHWEB/i,
    HaresClub: /Hares?WEB|HaresTV|DIY@Hares|-hares/i,
    HDPt: /hdptweb/i,
    Panda: /AilMWeb|-PANDA|@Panda/i,
    UBits: /@UBits|-UBits|-UBWEB/i,
    PTCafe: /CafeWEB|CafeTV|DIY@PTCafe/i,
    影: /Ying(WEB|DIY|TV|MV|MUSIC)?$/i,
    DaJiao: /DJWEB|DJTV/i,
    OKPT: /OK(WEB|Web)?$/i,
    AGSV: /AGSV(PT|E|WEB|REMUX|Rip|TV|DIY|MUS)?$/i,
    TJUPT: /TJUPT$/i,
    FileList: /Play(HD|SD|WEB|TV)$/i,
    CrabPt: /XHBWeb$/i,
    红叶: /(RLWEB|RLeaves|RLTV|-R²)$/i,
    QingWa: /(FROG|FROGE|FROGWeb)$/i,
    ZMPT: /ZmWeb|ZmPT/i,
    LemonHD: /(-LHD|League(WEB|CD|NF|HD|TV|MV))$/i,
    ptsbao: /-(FFans|sBao|FHDMV|OPS)/i,
    麒麟: /-HDK(WEB|TV|MV|Game|DIY|ylin)/i,
    '13City': /-(13City|.*13City)/i
};

export function addThanks(descr: string, title: string): string {
    const thanksStr = '[quote][b][color=blue]{site}官组作品，感谢原制作者发布。[/color][/b][/quote]\n\n{descr}';
    for (const key in regTeamName) {
        if (title.match(regTeamName[key]) && !title.match(/PandaMoon|HDSpace|HDClub|LCHD/i)) {
            descr = thanksStr.replace('{site}', key).replace('{descr}', descr);
        }
    }
    return descr;
}
