export const skipImg: string[] = [
    '[img]https://pic.imgdb.cn/item/6170004c2ab3f51d91c77825.png[/img]',
    '[img]https://pic.imgdb.cn/item/6170004c2ab3f51d91c7782a.png[/img]',
    '[img]https://images2.imgbox.com/04/6b/Ggp5ReQb_o.png[/img]',
    '[img]https://www.z4a.net/images/2019/09/13/info.png[/img]',
    '[img]https://www.z4a.net/images/2019/09/13/screens.png[/img]',
    '[img]https://i.loli.net/2019/03/28/5c9cb8f8216d7.png[/img]',
    '[img]https://hdsky.me/attachments/201410/20141003100205b81803ac0903724ad88de90649c5a36e.jpg[/img]',
    '[img]https://hdsky.me/adv/hds_logo.png[/img]',
    '[img]https://iili.io/XF9HEQ.png[/img]',
    '[img]https://img.pterclub.net/images/2022/03/24/58ef34eb1c04aa6f87442e439d103b29.png[/img]',
    '[img]https://img.pterclub.net/images/2021/07/14/78c58ee6b3e092d0c5a7fa02f3a1905e.png[/img]',
    '[img]https://pterclub.net/pic/CS.png[/img]',
    '[img]https://pterclub.net/pic/GDJT.png[/img]',
    '[img]http://img.pterclub.net/images/CS.png[/img]',
    '[img]https://img.pterclub.net/images/GDJT.png[/img]',
    '[img]https://kp.m-team.cc/logo.png[/img]',
    '[img]http://tpimg.ccache.org/images/2015/03/08/c736743e65f95c4b68a8acd3f3e2d599.png[/img]',
    '[img]https://ourbits.club/pic/Ourbits_info.png[/img]',
    '[img]https://ourbits.club/pic/Ourbits_MoreScreens.png[/img]',
    '[img]https://images2.imgbox.com/ce/e7/KCmGFMOB_o.png[/img]',
    '[img]https://img.m-team.cc/images/2016/12/05/d3be0d6f0cf8738edfa3b8074744c8e8.png[/img]',
    '[img]https://pic.imgdb.cn/item/6170004c2ab3f51d91c77825.png[/img]',
    '[img]https://pic.imgdb.cn/item/6170004c2ab3f51d91c7782a.png[/img]'
];

export function getMediainfoPictureFromDescr(
    descr: string,
    options?: { mediumSel?: string; skipImgList?: string[] }
): { mediainfo: string; picInfo: string; multiMediainfos?: string; coverImg?: string } {
    const info: { mediainfo: string; picInfo: string; multiMediainfos?: string; coverImg?: string } = {
        mediainfo: '',
        picInfo: ''
    };
    let imgInfo = '';
    let mediainfo = '';
    const imgUrls = descr.match(/(\[url=.*?\])?\[img\].*?\[\/img\](\[\/url\])?/gi);
    let indexOfInfo = 0;
    if (descr.match(/◎译.{2,10}名|◎片.{2,10}名|片.{2,10}名/)) {
        indexOfInfo = descr.match(/◎译.{2,10}名|◎片.{2,10}名|片.{2,10}名/)?.index || 0;
    }
    try {
        if (imgUrls) {
            for (let i = 0; i < imgUrls.length; i++) {
                if (descr.indexOf(imgUrls[i]) < 10 || descr.indexOf(imgUrls[i]) < indexOfInfo) {
                    info.coverImg = imgUrls[i];
                } else {
                    descr = descr.replace(imgUrls[i], '');
                    imgInfo += imgUrls[i].match(/(\[url=.*?\])?\[img\].*?\[\/img\](\[\/url\])?/)?.[0] || '';
                }
            }
        }
    } catch (err) {
        imgInfo = '';
    }
    descr = `${descr}\n\n${imgInfo}`;

    try {
        if (descr.match(/DISC INFO:|.MPLS|Video Codec|Disc Label/i) && (options?.mediumSel === 'UHD' || options?.mediumSel === 'BluRay' || options?.mediumSel === 'Blu-ray')) {
            mediainfo = descr.match(/\[quote.*?\][\s\S]*?(DISC INFO|.MPLS|Video Codec|Disc Label)[\s\S]*?\[\/quote\]/i)?.[0] || '';
        } else if (descr.match(/General|RELEASE.NAME|RELEASE DATE|Unique ID|RESOLUTiON|Bitrate|帧　率|音频码率|视频码率/i)) {
            const matches = descr.match(/\[quote.*?\][\s\S]*?(General|RELEASE.NAME|RELEASE DATE|Unique ID|RESOLUTiON|Bitrate|帧　率|音频码率|视频码率)[\s\S]*?\[\/quote\]/gi);
            mediainfo = matches ? matches.join('\n\n') : '';
            if (mediainfo.match(/\.VOB|\.IFO/i)) {
                info.multiMediainfos = mediainfo.replace(/\[\/?quote\]/g, '');
            }
        }
    } catch (err) {
        if (descr.match(/\n.*DISC INFO:[\s\S]*kbps.*/)) {
            mediainfo = descr.match(/\n.*DISC INFO:[\s\S]*kbps.*/)?.[0].trim() || '';
        }
    }

    mediainfo = mediainfo.replace(/\[quote.*?\]/gi, '[quote]');
    while (mediainfo.match(/\[quote\]/i)) {
        mediainfo = mediainfo.slice(mediainfo.search(/\[quote\]/) + 7);
    }
    mediainfo = mediainfo.replace(/\[\/quote\]/i, '');
    mediainfo = mediainfo.replace(/\[\/?(font|size|quote|color).{0,80}?\]/gi, '');

    let imgs = descr.split(/\[\/quote\]/).pop() || '';
    const imgMatches = imgs.match(/(\[url=.*?\])?\[img\].*?\[\/img\](\[\/url\])?/g);
    try {
        if (imgMatches) {
            const skipList = options?.skipImgList || skipImg;
            imgs = imgMatches
                .filter((item) => skipList.indexOf(item) < 0 && !item.match(/m.media-amazon.com\/images/))
                .join(' ');
        } else {
            imgs = '';
        }
    } catch (err) {
        imgs = '';
    }
    info.mediainfo = mediainfo.trim();
    info.picInfo = imgs.trim();
    return info;
}
