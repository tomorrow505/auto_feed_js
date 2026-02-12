const us_ue = [
    '阿尔巴尼亚|安道尔|奥地利|俄罗斯|比利时|波黑|保加利亚|克罗地亚|塞浦路斯|捷克|丹麦|爱沙尼亚|法罗群岛[丹]|冰岛|芬兰|法国|德国|希腊|匈牙利|爱尔兰|意大利|拉脱维亚|列支敦士登|立陶宛|卢森堡|马其顿|马耳他|摩尔多瓦|摩纳哥|荷兰|挪威|波兰|葡萄牙|罗马尼亚|俄罗斯|圣马力诺|塞黑|斯洛伐克|斯洛文尼亚|西班牙|瑞典|瑞士|乌克兰|英国|梵蒂冈|美国|加拿大|澳大利亚|新西兰|西德|苏联|秘鲁|阿根廷|墨西哥'
];

const us_ue_english = [
    'Albania|Andorra|Austria|Russia|Belgium|Bosnia and Herzegovina|Bulgaria|Croatia|Cyprus|Czechia|Denmark|Estonia|Faroe Islands (Denmark)|Iceland|Finland|France|Germany|Greece|Hungary|Ireland|Italy|Latvia|Liechtenstein|Lithuania|Luxembourg|North Macedonia|Malta|Moldova|Monaco|Netherlands|Norway|Poland|Portugal|Romania|Russia|San Marino|Serbia|Slovakia|Slovenia|Spain|Sweden|Switzerland|Ukraine|United Kingdom|Vatican City|United States|Canada|Australia|New Zealand|West Germany|Soviet Union|Peru|Argentina|Mexico'
];

export function numToChinese(num: number): string {
    const chnNumChar = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    const chnUnitChar = ['', '十', '百', '千'];
    let chnstr = '';
    if (num > 0 && num < 100) {
        const v = num % 10;
        const q = Math.floor(num / 10);
        if (num < 10) {
            chnstr = chnNumChar[v] + chnstr;
        } else if (num === 10) {
            chnstr = chnUnitChar[1];
        } else if (num > 10 && num < 20) {
            chnstr = '十' + chnNumChar[v];
        } else {
            if (v === 0) chnstr = chnNumChar[q] + '十';
            else chnstr = chnNumChar[q] + '十' + chnNumChar[v];
        }
    }
    return chnstr;
}

export function getSmallDescrFromDescr(descr: string, name: string): string {
    let smallDescr = '';
    let videoname = '';
    let subStr = '';
    let typeStr = '';

    if (descr.match(/译.{0,5}名[^\r\n]+/)) {
        videoname = descr.match(/译.*?名([^\r\n]+)/)?.[1] || '';
        if (!/.*[\u4e00-\u9fa5]+.*/.test(videoname) || videoname.trim() === '') {
            try {
                videoname = descr.match(/片.*?名([^\r\n]+)/)?.[1] || '';
            } catch {}
        }
        videoname = videoname.trim();
        if (name.match(/S\d{2}E\d{2}/i)) {
            const match = name.match(/S(\d{2})E(\d{2})/i);
            if (match) {
                subStr = ` *第${numToChinese(parseInt(match[1], 10))}季 第${parseInt(match[2], 10)}集*`;
            }
        } else if (name.match(/S\d{2}/)) {
            const match = name.match(/S(\d{2})/i);
            if (match) {
                subStr = ` *第${numToChinese(parseInt(match[1], 10))}季`;
                if (descr.match(/◎集.{1,10}数.*?(\d+)/)) {
                    subStr += ` 全${parseInt(descr.match(/◎集.{1,10}数.*?(\d+)/)?.[1] || '0', 10)}集*`;
                } else {
                    subStr += '*';
                }
            }
        }
        smallDescr = videoname + subStr;
    }

    if (descr.match(/类.{0,5}别[^\r\n]+/)) {
        typeStr = descr.match(/类.*别([^\r\n]+)/)?.[1] || '';
        typeStr = typeStr.trim();
        typeStr = typeStr.replace(/\//g, '');
        smallDescr = smallDescr + ' | 类别：' + typeStr;
    }

    return smallDescr.trim();
}

export function getSourceSelFromDescr(descr: string): string {
    let region = '';
    let regRegion = descr.match(/◎(地.{0,10}?区|国.{0,10}?家|产.{0,10}?地|◎產.{0,5}?地)([^\r\n]+)/);
    if (!regRegion) {
        regRegion = descr.match(/(地.{0,10}?区|国.{0,10}?家|产.{0,10}?地|◎產.{0,5}?地)([^\r\n]+)/);
    }
    if (regRegion) {
        region = regRegion[2].split('/')[0].trim();
        const reg = new RegExp(us_ue.join('|'), 'i');
        if (region.match(/香港/)) {
            region = '香港';
        } else if (region.match(/台湾|臺灣/)) {
            region = '台湾';
        } else if (region.match(/日本/)) {
            region = '日本';
        } else if (region.match(/韩国/)) {
            region = '韩国';
        } else if (region.match(/印度/) && !region.match(/印度尼西亚/)) {
            region = '印度';
        } else if (region.match(/中国|大陆/)) {
            region = '大陆';
        } else if (region.match(reg)) {
            region = '欧美';
        }
    } else {
        regRegion = descr.match(/Country: (.*)/);
        if (regRegion) {
            region = regRegion[1].trim();
            const reg = new RegExp(us_ue_english.join('|'), 'i');
            if (region.match(reg)) {
                region = '欧美';
            }
        }
    }
    return region;
}

export function getSizeFromDescr(descr: string): number {
    let size = 0;
    try {
        if (descr.match(/disc.{1,10}size.*?([\d, ]+).*?bytes/i)) {
            let val = descr.match(/disc.{1,10}size.*?([\d,\. ]+).*?bytes/i)?.[1] || '';
            val = val.replace(/,|\.| /g, '');
            size = parseInt(val, 10) / 1024 / 1024 / 1024;
        } else if (descr.match(/size[^\d]{0,20}(\d+(?:\.\d+)?).+GiB/i)) {
            size = parseFloat(descr.match(/size[^\d]{0,20}(\d+(?:\.\d+)?).+GiB/i)?.[1] || '0');
        }
    } catch {}
    return size;
}

export function dealImg350(picInfo: string): string {
    const imgs = picInfo.match(/\[img\].*?(jpg|png).*?\[\/img\]/g);
    if (imgs) {
        imgs.forEach((item) => {
            const imgUrl = item.match(/http.*?(png|jpg)/)?.[0] || '';
            if (imgUrl.match(/ptpimg/)) {
                const newImgs = `[url=${imgUrl}]${item.replace('[img]', '[img=350x350]')}[/url]`;
                picInfo = picInfo.replace(item, newImgs);
            }
        });
    }
    return picInfo;
}

export function dealImg350Ptpimg(picInfo: string): string {
    const imgs = picInfo.match(/\[img\].*?(jpg|png).*?\[\/img\]/g);
    if (imgs) {
        imgs.forEach((item) => {
            const imgUrl = item.match(/http.*?(png|jpg)/)?.[0] || '';
            if (imgUrl.match(/ptpimg.me/)) {
                const newImgs = `[url=${imgUrl}]${item.replace('[img]', '[img=350]')}[/url]`;
                picInfo = picInfo.replace(item, newImgs);
            }
        });
    }
    return picInfo;
}
