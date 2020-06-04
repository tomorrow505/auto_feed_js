// ==UserScript==
// @name         auto_feed_v1.3
// @author       tomorrow505
// @contributor  daoshuailx/hollips/PatrickCao
// @description  一键克隆种子信息
// @namespace    Violentmonkey Scripts
// @include      http*://*/details.php*
// @include      http*://*/upload.*php*
// @include      http*://totheglory.im/t/*
// @include      https://api.douban.com/v2/movie/*
// @include      http*://privatehd.to/torrent/*
// @include      http*://avistaz.to/torrent/*
// @include      http*://www.morethan.tv/torrents.php?id*
// @include      http*://www.bfdz.ink/tools/ptgen*
// @icon         https://pt.m-team.cc//favicon.ico
// @run-at       document-end
// @version      v1.3
// @grant        GM_xmlhttpRequest
// ==/UserScript==

//获取网页地址，有两种可能，一种匹配上发布页面，一种匹配上源页面，源页面进行解析，跳转发布页面进行填写
var site_url = decodeURI(location.href);
var seperator = '#seperator#'; //用来拼接发布站点的url和字符串,也可用于识别发布页和源页面

//添加一下ptgen跳转
if (site_url.match('ptgen')){
    url = site_url.split('?')[1];
    document.getElementById('input_value').value = url;
    document.getElementById('query_btn').click();
}

/*
    -----------------------------part 1 用户变量层-------------------------------------------------------
*/

/*
    支持发布的站点信息，使用字典的数据结构 1、只写域名也可做match用; 2、键值统一并且尽量简明
*/
var site_info = {
    'MTeam': "https://pt.m-team.cc/",
    'CMCT': "https://springsunday.net/",
    'HDSky': "https://hdsky.me/",
    'CHDBits': "https://chdbits.co/",
    'OurBits': "https://ourbits.club/",
    'TTG': "https://totheglory.im/",
    'HDChina': "https://hdchina.org/",
    'PTer': "https://pterclub.com/",
    'LeagueHD': "https://leaguehd.com/",
    'HDHome': "https://hdhome.org/",
    'PThome': "https://www.pthome.net/",
    'PuTao': "https://pt.sjtu.edu.cn/",
    'NanYang': "https://nanyangpt.com/",
    'TJUPT': 'https://www.tjupt.org/',
    'TLFbits': "http://pt.eastgame.org/",
    'HDDolby': 'https://www.hddolby.com/',
    'Moecat': 'https://moecat.best/',
    'HDstreet': 'https://hdstreet.club/',
    'BTSchool': 'https://pt.btschool.club/',
    'HDArea': 'https://www.hdarea.co/',
    'ptsbao': 'https://ptsbao.club/'
};

//常用站点列表，可以自行更换
var common_sites = ['MTeam', 'PTer', 'CMCT'];

//部分站点加载图标会有问题
var site_img_info = {
    'HDHome': 'https://img.pterclub.com/images/2020/04/21/hdhfavicon.png',
    'TJUPT': 'https://img.pterclub.com/images/2020/04/21/hdhfavicon.png',
    'HDChina': 'https://img.pterclub.com/images/2020/04/21/hdcfavicon.png',
    'HDArea': 'https://img.pterclub.com/images/2020/04/21/hdafavicon.png',
    'BTSchool': 'https://img.pterclub.com/images/2020/05/05/bts.png',
    'Moecat': 'https://img.pterclub.com/images/2020/05/05/moe.png'
};

//用于作为源站点但是不是转发站点的字典包含特殊的朋友和外站
var o_site_info = {
    'FRDS': 'https://pt.keepfrds.com/',
    'BeiTai': 'https://www.beitai.pt/',
    'avz': 'https://avistaz.to/',
    'PHD': 'https://privatehd.to/',
    'hdt': 'https://hd-torrents.org/',
    'MTV': 'https://www.morethan.tv/'
};

//官种匹配，可以自行增减
reg_team_name = {
    'MTeam': /-(.*mteam|mpad|tnp|BMDru)/i,
    'CMCT': /-(CMCT|cmctv)/i,
    'HDSky': /-(hds|.*@HDSky)/i,
    'CHDBits': /-(CHD|.*@CHDBits)/i,
    'OurBits': /(-Ao|-.*OurBits|-FLTTH|-IloveTV)/i,
    'TTG': /-(WiKi|DoA|.*TTG|NGB|ARiN)/i,
    'HDChina': /-(HDC)/i,
    'PTer': /-(Pter|.*Pter)/i,
    'LeagueHD': /-(LHD|i18n|League.*)/i,
    'HDHome': /-hdh/i,
    'PThome': /-pthome/i,
    'PuTao': /-putao/i,
    'NanYang': /-nytv/i,
    'TLFbits': /-tlf/i,
    'HDDolby': /-DBTV/i,
    'FRDS': /-FRDS|@FRDS/i,
    'BeiTai': /-BeiTai/i
};


/*
    -------------------------------------part 2 函数定义层-----------------------------------------------------
*/

//第一第二个函数用来豆瓣信息搜索时候进行处理
var numToChn = function(num) {
    var chnNumChar = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
    var index = num.toString().indexOf(".");
    if (index != -1) {
        var str = num.toString().slice(index);
        var a = "点";
        for (var i = 1; i < str.length; i++) {
            a += chnNumChar[parseInt(str[i])];
        }
        return a;
    } else {
        return;
    }
};

function numToChinese(num) { //定义在每个小节的内部进行转化的方法，其他部分则与小节内部转化方法相同
    var chnNumChar = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
    var chnUnitChar = ["", "十", "百", "千"];
    var str = '',
        chnstr = '',
        zero = false,
        count = 0; //zero为是否进行补零， 第一次进行取余由于为个位数，默认不补零
    if (num > 0 && num < 100) {
        var v = num % 10;
        var q = Math.floor(num / 10);

        if (num < 10) { //如果数字为零，则对字符串进行补零
            chnstr = chnNumChar[v] + chnstr;

        } else if (num == 10) chnstr = chnUnitChar[1];
        else if (num > 10 && num < 20) chnstr = "十" + chnNumChar[v];
        else {
            if (v == 0) chnstr = chnNumChar[q] + "十";
            else chnstr = chnNumChar[q] + "十" + chnNumChar[v];
        }

    }
    return chnstr;
}

//用来判断地址属于哪个站点（国内发布站点，国外源站点，或其他）
function find_origin_site(url){

    var domain; //域名
    var reg;    //正则匹配表达式
    var key;
    //先从发布站点找
    for (key in site_info){
        //获取域名
        domain = site_info[key].split('//')[1].replace('/', '');
        reg = new RegExp(domain, 'i');
        if (url.match(reg)){
            return key;
        }
    }
    //再从特殊源站点找
    for (key in o_site_info){
        //获取域名
        domain = o_site_info[key].split('//')[1].replace('/', '');
        reg = new RegExp(domain, 'i');
        if (url.match(reg)){
            return key;
        }
    }

    return 'other';
}

//标签及其字标签转换为字符串，主要用于获取简介等等
function walkDOM(n) {

    do {
        //    alert(n.nodeName)
        if (n.nodeName == 'FONT') {
            if (n.color != '') {
                n.innerHTML = '[color=' + n.color + ']' + n.innerHTML + '[/color]';
            }
            if (n.size != '') {
                n.innerHTML = '[size=' + n.size + ']' + n.innerHTML + '[/size]';
            }
            if (n.face != '') {
                n.innerHTML = '[font=' + n.face + ']' + n.innerHTML + '[/font]';
            }
        }
        if (n.nodeName == 'SPAN') {
            if (n.style.color != '') {
                n.innerHTML = '[color=' + n.style.color + ']' + n.innerHTML + '[/color]';
            }
        }
        if (n.nodeName == 'U'){
            n.innerHTML = '[u]' + n.innerHTML + '[/u]';
        }
        if (n.nodeName == 'A') {
            if (n.innerHTML != "") {
                if (site_url.match(/http(s*):\/\/chdbits.co\/details.php.*/i)) {
                    if (n.innerHTML.match(/pic\/hdl\.gif/g)) {

                    } else {
                        n.innerHTML = '[url=' + n.href + ']' + n.innerHTML + '[/url]';
                    }
                } else {
                    n.innerHTML = '[url=' + n.href + ']' + n.innerHTML + '[/url]';
                }
            }
        }
        if (n.nodeName == 'TABLE') {
            if (n.innerHTML != "") {
                if (site_url.match(/http(s*):\/\/totheglory.im.*/i)) {
                    n.innerHTML = '[quote]' + n.innerHTML + '[/quote]';
                }
            }
        }
        if (n.nodeName == 'P') {
            //  alert(n.innerHTML)
            if (n.innerHTML != "") {
                if (site_url.match(/http(s*):\/\/totheglory.im.*/i)) {
                    n.innerHTML = '';
                }
            }
        }
        if (n.nodeName == 'FIELDSET' || n.nodeName == 'BLOCKQUOTE') {
            n.innerHTML = '[quote]' + n.innerHTML + '[/quote]';
        }
        if (n.nodeName == 'DIV' && n.innerHTML == '代码') {
            n.innerHTML = '';
            n.nextSibling.innerHTML = '[code]' + n.nextSibling.innerHTML + '[/code]';
        }
        if (n.nodeName == 'BR') {
            if (site_url.match(/http(s*):\/\/ourbits.club\/details.php.*/i) || site_url.match(/http(s*):\/\/totheglory.im.*/i)) {
                n.innerHTML = '\r\n';
            }
        }
        if (n.nodeName == 'LEGEND') {
            n.innerHTML = '';
        }
        if (n.nodeName == 'FIELDSET' && n.textContent.match(/(温馨提示|郑重声明|您的保种|商业盈利)/g)) {
            n.innerHTML = '';
        } else {
            if (n.hasChildNodes()) {
                walkDOM(n.firstChild);
            } else {
                if (n.nodeType == 1) {
                    if (n.nodeName == 'IMG') {
                        //   alert(n.src)
                        if (site_url.match(/http(s*):\/\/chdbits.co\/details.php.*/i)) {
                            if (n.src.match(/pic\/hdl\.gif/g)) {

                            } else {
                                raw_info.descr = raw_info.descr + '[img]' + n.src + '[/img]';
                            }
                        } else {
                            raw_info.descr = raw_info.descr + '[img]' + n.src + '[/img]';
                        }

                    }
                } else {
                    raw_info.descr = raw_info.descr + n.textContent;

                }
            }
        }
        n = n.nextSibling;
    } while (n);

    return raw_info.descr;
}

//为了春天获取简介而写的定制节点转文本
function walk_cmct(n) {

    do {
        if (n.nodeName == 'SPAN') {
            if (n.style.color != '') {
                n.innerHTML = '[color=' + n.style.color + ']' + n.innerHTML + '[/color]';
            }
        }
        if (n.nodeName == 'A') {
            if (n.innerHTML != "") {
                n.innerHTML = n.innerHTML;
            }
        }

        if (n.nodeName == 'BR') {
            n.innerHTML = '\r\n';
        }

        if (n.hasChildNodes()) {
            walk_cmct(n.firstChild);
        } else {
            if (n.nodeType !=1){
                raw_info.descr = raw_info.descr + n.textContent;
            }
        }
        n = n.nextSibling;
    } while (n);

    return raw_info.descr;
}


//标签节点连带转换成字符串
function domToString (node) {
    var tmpNode = document.createElement('div');
    tmpNode.appendChild(node);
    var str = tmpNode.innerHTML;
    tmpNode = node = null; // 解除引用，以便于垃圾回收
    return str;
}

//方便进行判断是否是源站点，不然太长了,属于源站点进入逻辑业务层
function judge_if_the_site_as_source() {

    if (site_url.match(/http(s*):\/\/.*\/(upload|offer).*php#seperator#/i)) {
        return 0;
    }
    if (site_url.match(/http(s*):\/\/.*\/details.php.*/i)) {
        return 1;
    }
    if (site_url.match(/http(s*):\/\/totheglory.im\/t\/.*/i)) {
        return 1;
    }
    if (site_url.match(/http(s*):\/\/privatehd.to\/torrent/i)) {
        return 1;
    }
    if (site_url.match(/http(s*):\/\/avistaz.to\/torrent/i)) {
        return 1;
    }
    if (site_url.match(/http(s*):\/\/www.morethan.tv\/torrents.php\?id/i)) {
        return 1;
    }

}

//判断是否是国内的站点，国内站点架构基本一致且不需要额外获取豆瓣信息
function judge_if_the_site_in_domestic() {

    var domain; //域名
    var reg;    //正则匹配表达式
    var key;
    for (key in o_site_info){
        if (key != 'FRDS' && key != 'BeiTai'){
            domain = o_site_info[key].split('//')[1].replace('/', '');
            reg = new RegExp(domain, 'i');
            if (site_url.match(reg)){
                return 0;
            }
        }
    }
    return 1;
}

//处理标题业务封装进函数
function deal_with_title(title){

    title = title.replace(/\./g, ' ');

    if (title.match(/[^\d](2 0|5 1|7 1|1 0)/)) {
        title = title.replace(/[^\d](2 0|5 1|7 1|1 0)/, function(data){
            return data.slice(0,2)+'.'+ data.slice(3,data.length);
        });
    }

    if (title.match(/H 264/)) {
        title = title.replace("H 264", "H.264");
    }
    if (title.match(/H264/)) {
        title = title.replace("H264", "H.264");
    }

    title = title.replace(/x265[.-]10bit/i, 'x265 10bit');
    //处理免费后缀等等写在后边
    title = title.replace(/\s+\[2?x?(免费|free)\].*$|\(限时.*\)|\(限時.*\)/ig, '');
    title = title.replace(/\[.*\]/i, '');
    title = title.replace(/剩余时间.*/i, '');
    title = title.replace(/\(|\)/i, '');
    title = title.trim();

    return title;
}

//处理副标题逻辑业务封装进函数
function deal_with_subtitle(subtitle){
    //去除中括号等等
    subtitle = subtitle.replace(/(\[|\])/g, "");
    subtitle = subtitle.replace(/autoup/i, '');
    return subtitle;
}

//字典转成字符串传达到跳转页面
function dictToString(my_dict){
    var tmp_string = '';
    var link_str = '#linkstr#';
    var key;
    for (key in my_dict){
        tmp_string += key + link_str + my_dict[key] + link_str;
    }
    return tmp_string.slice(0, tmp_string.length-9);
}

//字符串转换成字典回来填充发布页面
function stringToDict(my_string){
    var link_str = '#linkstr#';

    var tmp_array = my_string.split(link_str);

    var tmp_dict = {};
    for (i = 0; i < tmp_array.length; i++) {
        if (i % 2 == 0) {
            tmp_dict[tmp_array[i]] = tmp_array[i + 1];
        }
    }
    return tmp_dict;
}


//下面两个函数用来为字符串赋予format方法：例如——'thank you {site}'.format({'site':'ttg'}) => 'thank you ttg'
String.prototype.replaceAll = function (exp, newStr) {
    return this.replace(new RegExp(exp, "gm"), newStr);
};

String.prototype.format = function(args) {
    var result = this;
    if (arguments.length < 1) {
        return result;
    }

    var data = arguments; // 如果模板参数是数组
    if (arguments.length == 1 && typeof (args) == "object") {
        // 如果模板参数是对象
        data = args;
    }
    for ( var key in data) {
        var value = data[key];
        if (undefined != value) {
            result = result.replaceAll("\\{" + key + "\\}", value);
        }
    }
    return result;
};


//下面几个函数为字符串赋予获取各种编码信息的方法——适用于页面基本信息和字符串
String.prototype.medium_sel = function() { //媒介

    var result = this;

    if (result.match(/(UHD|UltraHD)/i)) {
        result = 'UHD';
    } else if (result.match(/(Encode|Matroska|MP4)/i)) {
        result = 'Encode';
    }  else if (result.match(/(DVDRip|DVD)/i)) {
        result = 'DVD';
    } else if (result.match(/(Webdl|Web-dl)/i)) {
        result = 'WEB-DL';
    } else if (result.match(/(HDTV)/i)) {
        result = 'HDTV';
    } else if (result.match(/(Remux)/i)) {
        result = 'Remux';
    } else if (result.match(/(Blu-ray|.MPLS)/i)) {
        result = 'Blu-ray';
    }  else {
        result = '';
    }
    return result;
};

String.prototype.codec_sel = function() { //编码

    var result = this;

    if (result.match(/(H264|H\.264|AVC)/i)) {
        result = 'H264';
    } else if (result.match(/(HEVC|H265)/i)) {
        result = 'H265';
    } else if (result.match(/(X265)/i)) {
        result = 'X265';
    } else if (result.match(/(X264)/i)) {
        result = 'X264';
    } else if (result.match(/(VC-1)/i)) {
        result = 'VC-1';
    } else if (result.match(/(MPEG-2)/i)) {
        result = 'MPEG-2';
    } else if (result.match(/(MPEG-4)/i)) {
        result = 'MPEG-4';
    } else if (result.match(/(XVID)/i)) {
        result = 'XVID';
    } else {
        result = '';
    }

    return result;
};

String.prototype.audiocodec_sel = function() { //音频编码

    var result = this;
    if (result.match(/(DD|AC3|AC-3|Dolby Digital)/i)) {
        result = 'AC3';
    } else if (result.match(/(AAC)/i)) {
        result = 'AAC';
    } else if (result.match(/(DTS-HDMA:X 7\.1)/i)){
        result = 'DTS-HDMA:X 7.1';
    } else if (result.match(/(DTS-HD.?MA)/i)) {
        result = 'DTS-HDMA';
    } else if (result.match(/(DTS-HD)/i)) {
        result = 'DTS-HD'; 
    } else if (result.match(/(TrueHD Atmos)/i)) {
        result = 'TrueHD Atmos';
    } else if (result.match(/(Atmos)/i)) {
        result = 'Atmos';
    } else if (result.match(/(TrueHD)/i)) {
        result = 'TrueHD';
    } else if (result.match(/(DTS)/i)) {
        result = 'DTS';
    } else if (result.match(/(LPCM)/i)) {
        result = 'LPCM';
    } else if (result.match(/(Flac)/i)) {
        result = 'Flac';
    } else if (result.match(/(APE)/i)) {
        result = 'APE';
    } else if (result.match(/(MP3)/i)) {
        result = 'MP3';
    } else if (result.match(/(WAV)/i)) {
        result = 'WAV';
    } else {
        result = '';
    }
    return result;
};

String.prototype.standard_sel = function() {

    var result = this;
    if (result.match(/(2160p|4k)/i)){
        result = '4K';
    } else if (result.match(/(1080p|2K)/i)){
        result = '1080p';
    } else if (result.match(/(720p)/i)){
        result = '720p';
    } else if (result.match(/(1080i)/i)){
        result = '1080i';
    } else if (result.match(/(576p|480p)/i)){
        result = 'SD';
    } else {
        result = '';
    }
    return result;
};

//获取类型
String.prototype.get_type = function() {

    var result = this;
    if (result.match(/(Movie|电影|UHD原盘)/i)) {
        result = '电影';
    } else if (result.match(/(TV.*Series|剧|TV-PACK|TV-Episode)/i)) {
        result = '剧集';
    } else if (result.match(/(Docu|纪录)/i)) {
        result = '纪录';
    } else if (result.match(/(Animations|动漫)/i)) {
        result = '动漫';
    } else if (result.match(/(TV.*Show|综艺)/i)) {
        result = '综艺';
    } else if (result.match(/(Music|音乐)/i)) {
        result = '音乐';
    } else if (result.match(/(Sport|体育)/i)) {
        result = '体育';
    } else if (result.match(/(学习|资料|Study)/i)) {
        result = '学习';
    } else if (result.match(/(Software|软件)/i)) {
        result = '软件';
    } else if (result.match(/(Game|游戏)/i)) {
        result = '游戏';
    } else {
        result = '';
    }

    return result;
};

//获取副标题或是否中字、国语、粤语
String.prototype.get_label = function(){
    var my_string = this;
    var labels = {'gy': false, 'yy': false, 'zz': false};
    //先从副标题开始写
    if (my_string.match(/([简繁].{0,12}字幕|[简繁中].{0,3}字|DIY.{1,5}字|内封.{0,3}[繁中字])/i)){
        labels.zz = true;
    }
    if (my_string.match(/(国.{0,3}语|国.{0,3}配|台.{0,3}语|台.{0,3}配)/i)){
         labels.gy = true;
    }
    if (my_string.match(/(粤.{0,3}语|粤.{0,3}配)/i)){
        labels.yy = true;
    }
    if (my_string.match(/DIY/i)){
         labels.diy = true;
    }
    return labels;
};

function set_selected_option_by_value(my_id, value){

    var box = document.getElementById(my_id);
    for (i=0; i < box.options.length; i++){
        if ( box.options[i].value == value){
            box.options[i].selected = true;
        }
    }
}

//从简介和名称获取副标题
function get_small_descr_from_descr(descr, name){

    var small_descr = '';
    var vidoename = ''; //译名
    var sub_str = '';   //剧集季集信息
    var type_str = '';  //类别信息

    if (descr.match(/译.{0,5}名[^\r\n]+/)) {

        vidoename = descr.match(/译.*?名([^\r\n]+)/)[1];
        videoname = vidoename.trim(); //去除首尾空格

        if (name.match(/S\d{2}E\d{2}/ig)) { //电视剧单集
            sub_str = name.match(/(S\d{2}E\d{2})/ig)[0];
            sub_str = sub_str.replace(/S/i, '*第');
            sub_str = sub_str.replace(/E/i, '季 第') + '集*';
        }
        small_descr = vidoename + sub_str;
    }
    if (descr.match(/类.{0,5}}别[^\r\n]+/)) {
        type_str = descr.match(/类.*别([^\r\n]+)/)[1];
        type_str = type_str.trim(); //去除首尾空格
        type_str = type_str.replace(/\//g, ''); //去除/

        small_descr = small_descr + type_str;

    }

    return small_descr.trim();
}

//根据简介获取来源，也就是地区国家产地之类的——尤其分类是日韩或者港台的，有的站点需要明确一下
function get_source_sel_from_descr(descr){

    var region = '';
    var reg_region = descr.match(/(地.{0,5}?区|国.{0,5}?家|产.{0,5}?地)([^\r\n]+)/);
    if (reg_region) {
        region = reg_region[2];
        region = region.trim(); //去除首尾空格

        reg_region = RegExp(us_ue, 'i');
        if (region.match(reg_region)){
            region = '欧美';
        } else if (region.match(/香港/)){
            region = '香港';
        } else if (region.match(/台湾/)){
            region = '台湾';
        } else if (region.match(/日本/)){
            region = '日本';
        } else if (region.match(/韩国/)){
            region = '韩国';
        } else if (region.match(/印度/)){
            region = '印度';
        } else if (region.match(/中国|大陆/)){
            region = '大陆';
        }
    }
    return region;
}

//为获取豆瓣信息提供链接简化 promise-
function create_site_url_for_douban_info(raw_info, is_douban_search_needed){
    var p = new Promise(function(resolve, reject){
        if (is_douban_search_needed){
            season = raw_info.name.match(/S(\d{2})/ig)[0];
            season = season.slice(1,season.length);
            season = parseInt(season);

            var season_chinese = "第" + numToChinese(season) + "季";
            var search_name = raw_info.name.split(raw_info.name.match(/S\d{2}/ig)[0])[0];
            search_name = search_name.replace(/\d{4}/ig, '').trim(); //去除首尾空格和年份
            api_key = '&apikey=0dad551ec0f84ed02907ff5c42e8ec70';

            GM_xmlhttpRequest({
                method: 'GET',
                url: "http://api.douban.com/v2/movie/search?q=" + search_name + api_key,
                onload: function(res) {
                    var response = JSON.parse(res.responseText);
                    for (var i = 0; i < response.subjects.length; i++) {
                        if (response.subjects[i].title.match(season_chinese)) {
                            raw_info.dburl = response.subjects[i].alt;
                            break;
                        }
                    }
                    resolve(raw_info);
                }
            });
        } else {
             resolve(raw_info);
        }

    });

    return p;
}

/*
    ---------------------------------------part 3 页面逻辑处理（源网页）------------------------------------------
*/

if (judge_if_the_site_as_source() == 1) {

    //需要从源网页获取的信息，有些可能没有
    var raw_info = {
        //填充类信息
        'name': '', //主标题
        'small_descr': '', //副标题
        'url': '', //imdb链接
        'dburl': '', //豆瓣链接
        'descr': '',

        //选择类信息
        'type': '',  //type:可取值——电影/纪录/体育/剧集/动画/综艺……
        'source_sel': '', //来源(地区)：可取值——欧美/大陆/港台/日本/韩国/印度……
        'standard_sel': '',  //分辨率：可取值——4K/1080p/1080i/720p/SD
        'audiocodec_sel': '',  //音频：可取值——AAC/AC3/DTS…………
        'codec_sel': '', //编码：可取值——H264/H265……
        'medium_sel': '', //媒介：可取值——web-dl/remux/encode……

        //其他
        'origin_site': '', //记录源站点用于跳转后识别
        'mediainfo_cmct': '',
        'img_info_cmct': ''
    };


    //用来识别是哪个站点
    var origin_site = find_origin_site(site_url);
    raw_info.origin_site = origin_site;

    var title; //主标题对应的标签
    var small_descr; //副标题对应的标签
    var descr; //简介对应的标签

    var tbody; //tbody对应的标签
    var frds_nfo; //朋友的nfo对应的标签
    var cmct_mode = 1; //cmct页面——1原始页面；2新页面
    var torrent_id = "";//mtv种子id
    var thanks_str = "[quote]转自{site}，感谢原制作者发布。[/quote]\n\n{descr}";
    var douban_button_needed = false;

    var is_inserted = false;

    //----------------------------------标题简介获取——国内站点-------------------------------------------
    if (judge_if_the_site_in_domestic(site_url)) {

        if (origin_site == 'TTG' || origin_site == 'PuTao' || origin_site == 'HDArea') {
            title = document.getElementsByTagName("h1")[0];
        }else{
            title = document.getElementById("top");
        }

        for (i = 0; i < title.childNodes.length; i++) {
            raw_info.name = raw_info.name + title.childNodes[i].textContent;
        }

        if (origin_site == 'TTG') {
            descr = document.getElementById("kt_d");
        }
        else {
            descr = document.getElementById("kdescr"); //kdescr
            if (!descr && origin_site == 'CMCT') {
                descr = document.getElementById("kposter");
                cmct_mode = 2;
            }
            if (origin_site == 'FRDS') {
                frds_nfo = document.getElementById("knfo"); //kdescr
            }
        }

        //获取最外层table
        tbody = descr.parentNode.parentNode.parentNode;

        descr = descr.cloneNode(true);

        try{
            var codemain = descr.getElementsByClassName('codemain');
            var codetop = descr.getElementsByClassName('codetop');
            if (codetop.length>0) {
                descr.removeChild(codetop[0]);
            }
            if (codemain.length>0) {
                codemain[0].innerHTML = '[quote]{mediainfo}[/quote]'.format({ 'mediainfo': codemain[0].innerHTML });
            }

            //pter官种去除table
            if (origin_site == 'PTer' && descr.getElementsByTagName('table')[0]){
                var descr_table = descr.getElementsByTagName('table')[0];
                if (descr_table.textContent.match(/general/i)){
                    descr.removeChild(descr_table);
                }
            }
        }catch(err){
            console.log(err);
        }

        //遍历简介标签获取简介字符串
        raw_info.descr = walkDOM(descr);

        if (origin_site == 'FRDS') {
            if (frds_nfo != null) {
                raw_info.descr = raw_info.descr + "[quote]" + frds_nfo.textContent + "[/quote]";
            }
        }

        //ourbits没有简介的话补充简介
        if (origin_site == 'OurBits') {
            try{
                var imdbnew2 = document.getElementsByClassName("imdbnew2")[0];
                var reg_imdb = imdbnew2.innerHTML.match(/http(s*):\/\/www.imdb.com\/title\/tt\d+/i);
                if (reg_imdb){
                    raw_info.url = reg_imdb[0] + '/';
                }
            } catch(err){
                console.log(err);
            }

            if (raw_info.descr.search(/主.*演/i) < 0 && raw_info.descr.search(/类.*别/i) < 0) {
                try{
                    var doubanimg = document.getElementsByClassName("doubannew")[0];
                    doubanimg = doubanimg.getElementsByTagName("img")[0].src;
                    var douban = document.getElementsByClassName("doubaninfo")[0];
                    var douban_new = douban.cloneNode(true);
                    douban = domToString(douban_new);
                    douban = douban.replace(/<br>/g, '\n');
                    douban = douban.replace('<div class="doubaninfo">', '');
                    douban = douban.replace('</div>', '');
                    raw_info.descr = '[img]' + doubanimg + '[/img]\n' + douban + '\n\n' + raw_info.descr;
                } catch(err){
                    if (raw_info.url) {
                        douban_button_needed = true;
                    }
                }
            }
        }

        if (origin_site == 'HDChina'){
            if (raw_info.descr.search(/主.*演/i) < 0 && raw_info.descr.search(/类.*别/i) < 0){
                var douban_content = document.getElementsByClassName('douban_content');
                if (douban_content[0]){
                    if (douban_content[0].textContent.match(/http(s*):\/\/.*?douban.com\/subject\/(\d+)/i)){
                        raw_info.dburl = douban_content[0].textContent.match(/http(s*):\/\/.*?douban.com\/subject\/(\d+)/i)[0]+ '/';
                        douban_button_needed = true;
                    }
                }
            }
        }
    }

    //--------------------------------------国外站点table获取(简介后续单独处理)-------------------------------------------

    if (origin_site == 'hdt') {
        tbody = document.getElementById("Torrent'sdetailsHideShowTR");
        tbody = tbody.getElementsByTagName('tbody')[0];
    }

    if (origin_site == 'PHD' || origin_site == 'avz') {
        tbody = document.getElementsByTagName("tbody")[0];
    }

    if (origin_site == 'MTV') {
        if (site_url.match(/torrentid=(\d+)/)) {
            torrent_id = site_url.match(/torrentid=(\d+)/)[1];
        }
        var imdb_box = document.getElementsByClassName('box torrent_description')[0];
        if (imdb_box.innerHTML.match(/http(s*):\/\/www.imdb.com\/title\/tt(\d+)/i)){
            raw_info.url = imdb_box.innerHTML.match(/http(s*):\/\/www.imdb.com\/title\/tt(\d+)/i)[0];
        }
        tbody = document.getElementById('torrent_details');
    }

    
    //-------------------------------------根据table获取其他信息——包含插入节点（混合）-------------------------------------------

    var tds = tbody.getElementsByTagName("td");

    var table;
    var insert_row;
    var douban_box;

    //循环处理所有信息
    for (i = 0; i < tds.length; i++) {

        if (origin_site == 'PHD' || origin_site == 'avz') {
            if (i == 1 && tds[i].innerHTML.match(/Movie$/i)) {
                raw_info.type = '电影';
            }
            if (i == 1 && tds[i].innerHTML.match(/TV-Show$/i)) {
                raw_info.type = '剧集';
            }
            if (i == 3) {
                raw_info.name = tds[i].innerHTML;
            }
            if (tds[i].textContent == 'Video Quality') {
                raw_info.standard_sel = tds[i + 1].innerHTML.trim();
            }
            if (tds[i].textContent == 'Description') {
                raw_info.descr += walkDOM(tds[i + 1]);
            }
            if (tds[i].textContent == 'Rip Type') {
                var tmp_type = tds[i + 1].innerHTML.trim();
                if (tmp_type.match(/BluRay Raw/i)){
                    raw_info.medium_sel = 'Blu-ray';
                } else if (tmp_type.match(/BluRay/i)){
                    raw_info.medium_sel = 'Encode';
                }
            }

            if (tds[i].textContent == 'Filename') {
                table = tds[i].parentNode.parentNode;
                insert_row = table.insertRow(i / 2 + 1); //insert_row用来加转发图标
                douban_box = table.insertRow(i / 2 + 1); //再加一行来获取豆瓣
            }
        }

        if (origin_site == 'hdt') {
            if (tds[i].textContent.match(/Category:/i) && i>1) {
                if(tds[i+1].textContent.match(/Movie/i)){
                    raw_info.type = '电影';
                } else if (tds[i+1].textContent.match(/TV Show/i)) {
                    raw_info.type = '剧集';
                }
                if (tds[i+1].textContent.medium_sel()) {
                    raw_info.medium_sel = tds[i+1].textContent.medium_sel();
                }

            }

            if (i < 5 && tds[i].textContent.match(/Torrent/)) {
                raw_info.name = tds[i+1].textContent;
            }
            if (i < 8 && tds[i].innerHTML.match(/http(s*):\/\/www.imdb.com\/title\/tt(\d+)/i)) {
                raw_info.url = tds[i].innerHTML.match(/http(s*):\/\/www.imdb.com\/title\/tt(\d+)/i)[0] + '/';
            }
        }


        if (origin_site == 'MTV') {
            raw_info.type = '剧集';
            if (tds[i].innerHTML.match('torrent_' + torrent_id)) {

                table = tds[i].parentNode.parentNode;
                var child_nodes = table.childNodes;
                var rowcount = 0;
                for (k = 0; k < child_nodes.length; k++) {
                    if (child_nodes[k].nodeName == 'TR') {
                        rowcount = rowcount + 1;
                        if (child_nodes[k].id.match('torrent_' + torrent_id)) {
                            break;
                        }
                    }
                }
                insert_row = table.insertRow(rowcount - 1);
            }
        }

        //瓷器好像有时候也没有豆瓣简介，可能有必要获取一下豆瓣？
        if (origin_site == 'HDChina') {
            if (tds[i].innerHTML == '字幕') {
                table = tds[i].parentNode.parentNode;
                insert_row = table.insertRow(i / 2 + 1);
                if (douban_button_needed){
                    douban_box = table.insertRow(i / 2 + 1);
                }
            }
        } 
        else {
            if (['行为', '小货车', '行為'].indexOf(tds[i].innerHTML) >-1 || tds[i].textContent.match(/Tools/i)) {
                if (!is_inserted){
                    if (origin_site != 'MTV') {
                        table = tds[i].parentNode.parentNode;
                        if (origin_site == 'TTG'){
                            insert_row = table.insertRow(i / 2 - 1);
                        } else {
                            insert_row = table.insertRow(i / 2 + 1);
                        }
                    }
                    if (origin_site == 'hdt') {
                        douban_box = table.insertRow(i / 2 + 1);
                    } else if (origin_site == 'OurBits' && douban_button_needed) {
                        douban_box = table.insertRow(i / 2 + 1);
                    }
                    is_inserted = true;
                }
            }
        }

        if (['副标题','副標題','<span class="nobr">副标题</span>'].indexOf(tds[i].innerHTML) > -1) {
            raw_info.small_descr = tds[i].parentNode.lastChild.textContent;
        }

        //主要是类型、medium_sel、地区等等信息
        if (tds[i].innerHTML == '基本信息' || tds[i].innerHTML == '类型' || tds[i].innerHTML == '基本資訊') {
            if (i + 1 < tds.length) {
                //来源就在这里获取
                if (tds[i + 1].textContent.match(/(大陆|China|中国|CN)/i)) {
                    raw_info.source_sel = '大陆';
                } else if (tds[i + 1].textContent.match(/(HK&TW|港台)/i)) {
                    raw_info.source_sel = '港台';
                } else if (tds[i + 1].textContent.match(/(EU&US|欧美|US\/EU)/i)) {
                    raw_info.source_sel = '欧美';
                } else if (tds[i + 1].textContent.match(/(JP&KR|日韩)/i)) {
                    raw_info.source_sel = '日韩';
                } else if (tds[i + 1].textContent.match(/(香港)/i)) {
                    raw_info.source_sel = '香港';
                } else if (tds[i + 1].textContent.match(/(台湾)/i)) {
                    raw_info.source_sel = '台湾';
                } else if (tds[i + 1].textContent.match(/(日本|JP)/i)) {
                    raw_info.source_sel = '日本';
                } else if (tds[i + 1].textContent.match(/(韩国|KR)/i)) {
                    raw_info.source_sel = '韩国';
                } else if (tds[i + 1].textContent.match(/(印度)/i)) {
                    raw_info.source_sel = '印度';
                }

                //选择类信息获取，使用开始定义好的函数即可
                if (tds[i + 1].textContent.get_type()){
                    raw_info.type = tds[i + 1].textContent.get_type();
                }

                if(tds[i + 1].textContent.medium_sel()){
                    raw_info.medium_sel = tds[i + 1].textContent.medium_sel();
                }


                if (tds[i + 1].textContent.codec_sel()){
                    raw_info.codec_sel = tds[i + 1].textContent.codec_sel();
                }
                if (tds[i + 1].textContent.audiocodec_sel()){
                    raw_info.audiocodec_sel = tds[i + 1].textContent.audiocodec_sel();
                }
                if (origin_site != 'TTG'){
                    if (tds[i + 1].textContent.standard_sel()){
                        raw_info.standard_sel = tds[i + 1].textContent.standard_sel();
                    }
                }
            }
        }

        if (tds[i].innerHTML == '详细信息' && origin_site == 'TJUPT') {
            if (tds[i+1].innerHTML.match(/英文名:(.*)/i)){
                raw_info.name = tds[i+1].innerHTML.match(/英文名:<\/b>(.*?)<br>/i)[1];
            }
        }
    }

    //------------------------------------国外站点简介单独处理，最后辅以豆瓣按钮----------------------------------------------
    //phd和avz简介及imdb处理
    if (origin_site == 'PHD' || origin_site == 'avz') {

        var mediainfo = document.getElementById('collapseMediaInfo').innerHTML;
        mediainfo = mediainfo.replace('<pre>', '');
        mediainfo = mediainfo.replace('</pre>', '');

        var picture_info = document.getElementById('collapseScreens');
        var imgs = picture_info.getElementsByTagName('img');
        var img_urls = '';
        for (i = 0; i < imgs.length; i++) {
            img_urls += '[url='+ imgs[i].parentNode.href +'][img]' + imgs[i].src + '[/img][/url]\n';
        }
        picture_info = img_urls;

        raw_info.descr = '[quote]' + mediainfo + '[/quote]\n\n' + picture_info;
        var movie_detail = document.getElementsByClassName('movie-details')[0];
        var movie_as = movie_detail.getElementsByTagName('a');
        for (i = 0; i < movie_as.length; i++) {
            if (movie_as[i].href.match(/www.imdb.com/i)) {
                raw_info.url = 'http://www.imdb.com/title/' + movie_as[i].innerHTML;
                break;
            }
        }
    }

    //hdt简介处理
    if (origin_site == 'hdt'){
        var descr = document.getElementById('technicalInfoHideShowTR');
        descr = descr.cloneNode(true);
        descr = walkDOM(descr);

        var reg_img = descr.match(/\[url=.*?]\[img\].*?\[\/img\]/i);
        if (reg_img) {
            var replace_str = '[/quote]\n\n' + reg_img[0];
            raw_info.descr = '[quote]\n{descr}\n\n'.format({'descr': descr.replace(reg_img, replace_str)});
        }
        else{
            raw_info.descr = '[quote]\n{descr}\n[/quote]\n\n'.format({'descr': raw_info.descr});
        }
        raw_info.descr = raw_info.descr.replace("Torrent:", "");
        raw_info.descr = raw_info.descr.replace("Quote:", "");

		var quotes = '';
        var mediainfo = '';
        quotes = raw_info.descr.match(/\[quote\][\s\S]*?\[\/quote\]/g);
        mediainfo = quotes[quotes.length-1];
        raw_info.mediainfo_cmct = mediainfo;
        raw_info.mediainfo_cmct = mediainfo.replace(/\[.?quote\]/ig, '');
        var imgs = '';
        imgs = raw_info.descr.match(/\[url=.*?\]\[img\].*?\[\/img\]\[\/url\]/g);
        var imginfo = '';

        //从0开始，海报不在上述匹配模式里
        for (i = 0; i < imgs.length; i++) {
            if (!imgs[i].match(/(kralimarko)/i)) {
                imginfo += imgs[i] + '\n';
            }
        }
        raw_info.imgs_cmct = imginfo;

    }

    if (origin_site == 'MTV'){

        var file_box = document.getElementById('files_' + torrent_id);
        var filelist_path = file_box.getElementsByClassName('filelist_path')[0];
        if (filelist_path.innerHTML){
            raw_info.name = filelist_path.innerHTML.replace(/\//g, '').trim();
        } else {
            var h2 = document.getElementsByTagName('h2')[0];
            raw_info.name = h2.getElementsByTagName('span')[0].textContent;
        }

        // alert(raw_info.name);
        var torrent_info_box = document.getElementById('torrent_' + torrent_id);
        var torrent_info = torrent_info_box.getElementsByClassName('hidden spoiler');
        var img_info = '';
        var text_info = '';

        //很奇怪图片和视频mediainfo在一起输出了，不管了
        for (i=0; i< torrent_info.length; i++){
            text_info = torrent_info[i].previousElementSibling.previousElementSibling;
            if (text_info.textContent == 'Screenshots'){
                img_info = walkDOM(torrent_info[i]);
                img_info = img_info.replace('[url=javascript:void(0);]Show[/url]', '');
            }
            if (torrent_info[i].previousElementSibling.textContent == '[url=javascript:void(0);]Show[/url]'){
                torrent_info[i].previousElementSibling.textContent = 'Show';
            }
        }

        raw_info.descr = img_info;
    }

    //-----------------------------------------对获取的信息进行一些修复---------------------------------------------------

    if (origin_site == 'TTG') {
        raw_info.small_descr = raw_info.name.split('[')[1].replace(']', '');
        raw_info.small_descr = raw_info.small_descr.replace('「', '');
        raw_info.small_descr = raw_info.small_descr.replace('」', '');
        raw_info.name = raw_info.name.split('[')[0];

        // var reg_img = raw_info.descr.match(/\[img\]http(s*):\/\/totheglory.im\/pic\/ico_(free|half|30).gif\[\/img\].*/i);
        // if (reg_img) {
        //     raw_info.descr = raw_info.descr.replace(reg_img[0], '');
        // }

        // console.log(raw_info.descr);

        //替换官种简介顺序
        // var reg_source = raw_info.descr.match(/\[color=.*?\]\.Comparisons[\s\S]*(thumb\.png|ajax-loader\.gif)\[\/img\]\[\/url\][\s\S]*?\[\/quote\]/im);
        // if (reg_source){
        //     reg_source = reg_source[0];
        //     raw_info.descr = raw_info.descr.replace(reg_source, '');
        //     if (reg_source.match(/\[size=3\].*\[\/size\]/)) {
        //         var tmp_name = reg_source.match(/\[size=3\].*\[\/size\]/)[0];
        //         reg_source = reg_source.split(tmp_name);
        //         reg_source[0] = reg_source[0].replace(/http/g, 'https').replace(/httpss/g, 'https');
        //         reg_source = tmp_name + reg_source[1] + '\n\n' + reg_source[0];
        //     }

        //     raw_info.descr = raw_info.descr + reg_source;
        //     raw_info.descr = raw_info.descr.replace(/\n{3,5}/ig, '\n\n');

        // }

        // //简单匹配encode
        // if (!raw_info.name.medium_sel()){
        //     raw_info.medium_sel = 'Encode';
        // }
    }

    if (origin_site == 'FRDS') {
        var temp = ""; //主副标题互换
        temp = raw_info.name;
        raw_info.name = raw_info.small_descr;
        raw_info.small_descr = temp;

        raw_info.small_descr = raw_info.small_descr.replace(/免费|50%/g, "");
        raw_info.small_descr = raw_info.small_descr.trim(); //去除首尾空格
        raw_info.medium_sel = 'Encode';
    }

    if (origin_site == 'HDHome') {
        raw_info.small_descr = raw_info.small_descr.replace(/【|】/g, " ");
        raw_info.small_descr = raw_info.small_descr.replace(/diy/i, "【DIY】");

        //DIY图文换序兼顾圆盘补quote
        var img_info = '';
        if (raw_info.name.match(/DIY/i)){
            var img_urls = raw_info.descr.match(/\[img\].*?\[\/img\]/ig);
            for (i=0; i<img_urls.length; i++){
                if (raw_info.descr.indexOf(img_urls[i])<10){
                } else{
                    raw_info.descr = raw_info.descr.replace(img_urls[i], '');
                    img_info += img_urls[i];
                }
            }
        }

        raw_info.descr = raw_info.descr.replace(/\n{3,10}/g, '\n\n');

        //圆盘补quote
        var tem_str = "";
        if (raw_info.descr.match(/DISC INFO/i)) {
            tem_str = raw_info.descr.slice(raw_info.descr.indexOf('DISC INFO') - 10, raw_info.descr.length);
            if (!tem_str.match(/quote/i)) {
                raw_info.descr = raw_info.descr.replace("DISC INFO", "[img]https://images2.imgbox.com/04/6b/Ggp5ReQb_o.png[/img]\n\n[quote]\rDISC INFO");
                raw_info.descr = raw_info.descr + "\r" + "[/quote]";
            }
        }

        raw_info.descr = raw_info.descr + '\n\n' + img_info;
    }

    if (origin_site == 'PTer'){
        raw_info.descr = raw_info.descr.replace(/https:\/\/pterclub.com\/link.php\?sign=.*?&target=/ig, '');
    }

    if (origin_site == 'TJUPT'){
        raw_info.descr = raw_info.descr.replace(/站外链接 :: /ig, '');
    }

    //修复瓷器副标题和基本信息
    if (origin_site == 'HDChina') {
        raw_info.small_descr = document.getElementsByTagName("h3")[0].textContent;
        var movie_info = $('.info_box')[0].innerHTML;
        raw_info.type = movie_info.get_type();
        raw_info.medium_sel = movie_info.medium_sel();
        raw_info.codec_sel = movie_info.codec_sel();
        raw_info.audiocodec_sel = movie_info.audiocodec_sel();
        raw_info.standard_sel = movie_info.standard_sel();
    }

    if (origin_site  == 'LeagueHD'){
        raw_info.descr = raw_info.descr.slice(0, raw_info.descr.search(/\[color=green\]\[size=3\]本站提供的所有影视作品/));
    }

    if (origin_site  == 'HDArea'){
        raw_info.descr = raw_info.descr.slice(0, raw_info.descr.search(/\[quote\]\[color=red\]\[size=2\]\[font=Tahoma\] 本站列出的文件并没有保存在本站的服务器上/));
    }

    if (origin_site == 'CMCT' || origin_site == 'NanYang' || origin_site == 'CHDBits') {
        raw_info.name = raw_info.name.replace(/\d\.\d\/10.*$/g, '');
    }

    raw_info.name = deal_with_title(raw_info.name);
    raw_info.small_descr = deal_with_subtitle(raw_info.small_descr);

    //判断官种表达感谢
    if (reg_team_name.hasOwnProperty(origin_site) && raw_info.name.match(reg_team_name[origin_site])){
        raw_info.descr = thanks_str.format({'site': origin_site, 'descr': raw_info.descr});
    }

    //获取跳转的字符串
    var jump_str = dictToString(raw_info);

    // -----------------------------part 4 界面展示层： 插入节点，获取转发字符串部署跳转功能--------------------------------

    //转发行的左边和右边
    var forward_l;
    var forward_r;

    if (origin_site == 'MTV') {
        //插入行左右调换，这里右边实则为左边跳转图标
        var forward_r = insert_row.insertCell(0);
        forward_r.colSpan="2";
        forward_r.style.paddingLeft = '12px';
        forward_r.style.paddingTop = '10px';
        forward_r.style.paddingBottom = '10px';

        //右边豆瓣按钮
        var forward_l = insert_row.insertCell(1);
        forward_l.colSpan="3";
        var douban_button = document.createElement("input");
        douban_button.type = "button";
        douban_button.value = "点击获取";
        douban_button.id = 'douban_button';

        //匹配站点样式，为了美观
        if (origin_site == 'MTV'){
            douban_button.style.backgroundColor = '#262626';
        } else {
            douban_button.style.border = "1px solid #333333";
            douban_button.style.backgroundColor = '#333333';
            douban_button.style.color = '#FFFFFF';
        }
        forward_l.align = 'center';
        forward_l.appendChild(douban_button);

    } else {
        var forward_l = insert_row.insertCell(0);
        var forward_r = insert_row.insertCell(1);

        forward_l.innerHTML = "转发种子";
        forward_l.valign = "top";
        forward_l.style.fontWeight = "bold";

        if (!judge_if_the_site_in_domestic() || douban_button_needed) {
            var direct;
            if (origin_site == 'PHD' || origin_site == 'avz') {
                direct = "left";
            } else {
                direct = "right";
            }
            forward_l.align = direct;

            var box_left = douban_box.insertCell(0);
            var box_right = douban_box.insertCell(1);

            box_left.innerHTML = '获取豆瓣信息';
            box_left.align = direct;
            box_left.style.fontWeight = "bold";

            var douban_button = document.createElement("input");
            douban_button.type = "button";
            douban_button.value = "点击获取";
            douban_button.id = 'douban_button';
            box_right.appendChild(douban_button);
        } 
        else {
            forward_l.align = "right";
        }
    }


    forward_r.innerHTML = "";
    forward_r.valign = "top";
    forward_r.align = "left";

    //样式美化
    if (origin_site == 'CMCT' || origin_site == 'OurBits' || origin_site == 'TJUPT') {
        if (origin_site == 'TJUPT'){
            // forward_l.style.border = "1px solid #FFFFFF";
            forward_r.style.border = "2px solid #FFFFFF";
        } else {
            forward_l.style.border = "1px solid #D0D0D0";
            forward_r.style.border = "1px solid #D0D0D0";
        }
        if (douban_button_needed){
            box_left.style.border = "1px solid #D0D0D0";
            box_right.style.border = "1px solid #D0D0D0";
        }
    }

    if (origin_site == 'hdt') {
        forward_l.style.backgroundColor = "#D7D7D7";
        forward_r.style.backgroundColor = "#D7D7D7";
        box_left.style.backgroundColor = "#D7D7D7";
        box_right.style.backgroundColor = "#D7D7D7";

        forward_l.style.border = "0.2px solid #A4A4A4";
        forward_r.style.border = "0.2px solid #A4A4A4";
        box_left.style.border = "0.2px solid #A4A4A4";
        box_right.style.border = "0.2px solid #A4A4A4";
    }

    //循环部署转发节点，根据自己情况进行增加或删减
    var para; //Cimg;

    //设置图标样式
    var style = document.createElement("style");
    style.type = "text/css";
    var text = document.createTextNode(".round_icon{ width: 15px;height: 15px;border-radius: 75%;} #douban_button {outline:none;}");
    style.appendChild(text);
    var head = document.getElementsByTagName("head")[0];
    head.appendChild(style);

    var img_url;
    var forward_url;
    var key;
    for (key in site_info) {
        if (forward_r.innerHTML) {
            forward_r.innerHTML = forward_r.innerHTML + ' | ';
        }
        // Cimg = document.createElement("img");
        para = document.createElement("a");
        para.setAttribute('class', 'forward_a');

        forward_r.appendChild(para);
        para.target = "_blank";
        para.id = key;
        
        if(site_img_info.hasOwnProperty(key)){
            img_url = site_img_info[key];
        }
        else{
            img_url = site_info[key] + 'favicon.ico';
        }
        if (key == 'CMCT'){
            forward_url = site_info[key] + 'upload.new.php';
        } else {
            forward_url = site_info[key] + 'upload.php';
        }
        para.innerHTML = '<img src='+ img_url+ ' class="round_icon">' + ' ' + key;
        para.href = forward_url + seperator + encodeURI(jump_str);
    }

    //添加ptgen跳转
    if (raw_info.url == ''){
        var url = raw_info.descr.match(/http(s*):\/\/www.imdb.com\/title\/tt(\d+)/i);
        if (url){
            raw_info.url = url[0] + '/';
        }
    }
    if (raw_info.dburl == ''){
        var dburl = raw_info.descr.match(/http(s*):\/\/.*?douban.com\/subject\/(\d+)/i);
        if (dburl){
            raw_info.dburl = dburl[0] + '/';
        }
    }

    forward_r.innerHTML = forward_r.innerHTML + ' | ';
    var ptgen = document.createElement('a');
    ptgen.innerHTML = 'PTgen';
    ptgen.id = 'ptgen';
    if (raw_info.dburl){
        ptgen.href = 'https://www.bfdz.ink/tools/ptgen/?' + raw_info.dburl;
    } else if (raw_info.url) {
        ptgen.href = 'https://www.bfdz.ink/tools/ptgen/?' + raw_info.url;
    }
    ptgen.target = '_blank';
    forward_r.appendChild(ptgen);

    //添加常用链接跳转
    if (common_sites.length > 0){
        forward_r.innerHTML = forward_r.innerHTML + ' | ';

        var common_link = document.createElement('a');
        forward_r.appendChild(common_link);
        common_link.id = 'common_link';
        common_link.setAttribute('class', 'forward_a');

        common_link.href = '#common_link';
        window.scrollBy(0, -150);
        common_link.innerHTML = '常用站点';
        if (origin_site != 'CMCT' || cmct_mode == 1){
            common_link.onclick = function(){
                var key;
                for (key in common_sites){
                    if (origin_site != common_sites[key]){
                        var site_href = document.getElementById(common_sites[key]).href;
                        window.open(site_href, '_blank');
                    }
                    // window.open(site_href, '_blank').location;
                }
            };
        }
    }

    //修复cmct延迟加载mediainfo获取不到的bug
    if (origin_site == 'CMCT' && cmct_mode == 2){
        $('.forward_a').click(function(e){
            e.preventDefault();
            raw_info.descr = '';
            //海报和简介
            var img_address = document.getElementById("kposter").getElementsByTagName("img")[0].src;

            //方案1：
            // var copy_elements = document.getElementsByClassName("copy");
            // descr = copy_elements[0].cloneNode(true);
            // raw_info.descr = walkDOM(descr);
            // if (!raw_info.descr.match(img_address)){
            //     raw_info.descr = '[img]' + img_address + '[/img]' + raw_info.descr;
            // }
            // raw_info.descr = raw_info.descr.replace('[/img]', '[/img]\n\n');

            // raw_info.descr = raw_info.descr.slice(0, raw_info.descr.search(/◎◎◎◎!!!!资料转载请注明出处!!!!◎◎◎◎/i));
            
            // raw_info.descr = raw_info.descr.replace(/\[url=.*?\]\[url=https:\/\/movie.douban.com.*?\](.*?)\[\/url\]\[\/url\]/ig, function(data){
            //     return data.match(/\[url=https:\/\/movie.douban.com.*?\](.*?)\[\/url\]/i)[1];
            // });

            // raw_info.descr = raw_info.descr.replace(/\[url=https:\/\/movie.douban.com.*?\](.*?)\[\/url\]/ig, function(data){
            //     return data.match(/\[url=https:\/\/movie.douban.com.*?\](.*?)\[\/url\]/i)[1];
            // });

            //方案2：
            var descr_box = document.getElementsByClassName('info douban-info')[0];
            var descr_node = descr_box.getElementsByTagName('artical')[0];
            descr_node = descr_node.cloneNode(true);
            raw_info.descr = walk_cmct(descr_node);
            raw_info.descr = '[img]' + img_address + '[/img]\n\n' + raw_info.descr + '\n\n';

            //mediainfo——短
            try{
                var mediainfo = document.getElementsByClassName("codemain")[0];
                mediainfo = domToString(mediainfo.cloneNode(true));
                mediainfo = mediainfo.replace(/(<div class="codemain">|<\/div>)/g, '');
                mediainfo = mediainfo.replace(/<br>/g, '\n');
                raw_info.descr += '[quote]' + mediainfo + '[/quote]\n\n';
            } catch(err){
                console.log('获取mediainfo失败：'+err);
            }

            //mediainfo加长，隐藏
            if (this.id == 'PTer'){
                try{
                    var mediainfo1 = document.getElementsByClassName("codemain")[1];
                    mediainfo1 = domToString(mediainfo1.cloneNode(true));
                    mediainfo1 = mediainfo1.replace(/(<div class="codemain">|<\/div>)/g, '');
                    mediainfo1 = mediainfo1.replace(/<br>/g, '\n');
                    raw_info.descr += '[hide]' + mediainfo1 + '[/hide]\n\n';
                } catch(err){
                    console.log('获取mediainfo失败：'+err);
                }
            }

            //截图
            var screenshot = document.getElementsByClassName("screenshots-container");
            for (i = 0; i < screenshot.length; i++) {
                var img = screenshot[i].getElementsByTagName("img");
                for (j=0; j<img.length;j++){
                    if (img[j] && img[j].src.search(/detail/i) < 0) {
                        raw_info.descr = raw_info.descr + '[img]' + img[j].src + '[/img]\n';
                    }
                }
            }


            raw_info.descr = thanks_str.format({'site': origin_site, 'descr': raw_info.descr});
            jump_str = dictToString(raw_info);

            if (this.id != 'common_link'){
                this.href = decodeURI(this.href).split(seperator)[0] + seperator + encodeURI(jump_str);
                window.open(this.href, '_blank');
            } else{
                var key;
                for (key in common_sites){
                    if (origin_site != common_sites[key]){
                        var site_href = document.getElementById(common_sites[key]).href;
                        site_href = decodeURI(site_href).split(seperator)[0] + seperator + encodeURI(jump_str);
                        window.open(site_href, '_blank');
                    }
                    // window.open(site_href, '_blank').location;
                }
            }
        });
    }

    if (origin_site == 'TTG') {
        $('.forward_a').click(function(e){
            e.preventDefault();

            raw_info.descr = '';

            if (reg_team_name.hasOwnProperty(origin_site) && raw_info.name.match(reg_team_name[origin_site])){
                raw_info.descr = thanks_str.format({'site': origin_site, 'descr': raw_info.descr});
            }

            descr = document.getElementById('kt_d');
            descr_box = descr.cloneNode(true);
            raw_info.descr = walkDOM(descr_box);

            var reg_img = raw_info.descr.match(/\[img\]http(s*):\/\/totheglory.im\/pic\/ico_(free|half|30).gif\[\/img\].*/i);
            if (reg_img) {
                raw_info.descr = raw_info.descr.replace(reg_img[0], '');
            }

            // console.log(raw_info.descr);

            //替换官种简介顺序
            var reg_source = raw_info.descr.match(/\[color=.*?\]\.Comparisons[\s\S]*(thumb\.png|ajax-loader\.gif)\[\/img\]\[\/url\][\s\S]*?\[\/quote\]/im);
            if (reg_source){
                reg_source = reg_source[0];
                raw_info.descr = raw_info.descr.replace(reg_source, '');
                if (reg_source.match(/\[size=3\].*\[\/size\]/)) {
                    var tmp_name = reg_source.match(/\[size=3\].*\[\/size\]/)[0];
                    reg_source = reg_source.split(tmp_name);
                    reg_source[0] = reg_source[0].replace(/http/g, 'https').replace(/httpss/g, 'https');
                    reg_source = tmp_name + reg_source[1] + '\n\n' + reg_source[0];
                }

                raw_info.descr = raw_info.descr + reg_source;
                raw_info.descr = raw_info.descr.replace(/\n{3,5}/ig, '\n\n');
            }

            jump_str = dictToString(raw_info);

            if (this.id != 'common_link'){
                this.href = decodeURI(this.href).split(seperator)[0] + seperator + encodeURI(jump_str);
                window.open(this.href, '_blank');
            } else{
                var key;
                for (key in common_sites){
                    if (origin_site != common_sites[key]){
                        var site_href = document.getElementById(common_sites[key]).href;
                        site_href = decodeURI(site_href).split(seperator)[0] + seperator + encodeURI(jump_str);
                        window.open(site_href, '_blank');
                    }
                    // window.open(site_href, '_blank').location;
                }
            }
        });
    }

    //----------------------------------界面部署层逻辑：获取豆瓣链接button绑定点击事件-------------------------------------------------

    //由于是异步处理，所以代码写得比较繁复。
    if (!judge_if_the_site_in_domestic() || douban_button_needed){

        douban_button.addEventListener('click', function() {

            var douban_info = '';
            if (origin_site == 'MTV'){
                douban_button.value = '获取中……';
            }
            else{
                box_right.innerHTML = box_right.innerHTML + '  获取中……';
            }
            var is_douban_needed = false;

            if (raw_info.name.match(/S\d{2}E\d{2}/ig) || raw_info.type == '剧集') {

                if(raw_info.name.match(/S\d{2}/ig)){
                    if(!raw_info.name.match(/S01/ig)){
                        is_douban_needed = true;
                    }
                }
            }

            if (douban_button_needed && raw_info.url == '' && raw_info.dburl == ''){
                is_douban_needed = true;
            }

            //不是第一季电视剧,需要用豆瓣先搜索一次
            create_site_url_for_douban_info(raw_info, is_douban_needed)
            .then(function(data){
                //从豆瓣/imdb链接获取豆瓣信息
                if (raw_info.dburl){
                    url_data = {
                        'url': raw_info.dburl
                    };
                    url_to_search = '?url=' + raw_info.dburl;
                } else{
                    url_data = {
                        'site': 'douban',
                        'sid': raw_info.url.match(/tt\d+/)[0]
                    };
                    url_to_search = '?site=douban&sid=' + raw_info.url.match(/tt\d+/)[0];
                }

                // $.ajaxSettings.async = false;
                // jQuery.getJSON("https://api.rhilip.info/tool/movieinfo/gen", url_data).done(function(data) {
                //     douban_info = data.success ? data.format : "";
                //     douban_info = douban_info.replace("[/img][/center]", "[/img]");
                //     douban_info = douban_info.replace("hongleyou.cn", "doubanio.com");
                //     douban_info = douban_info.replace("img3.doubanio.com", "img1.doubanio.com");
                //     douban_info = douban_info.replace("https://img1.doubanio.com", "http://img1.doubanio.com");
                // });

                GM_xmlhttpRequest({
                    method: 'GET',
                    url: "https://api.nas.ink/infogen" + url_to_search,
                    onload: function(res) {
                        res = JSON.parse(res.responseText);
                        var douban_info = res.success ? res.format : "";
                        douban_info = douban_info.replace("[/img][/center]", "[/img]");
                        douban_info = douban_info.replace("hongleyou.cn", "doubanio.com");
                        douban_info = douban_info.replace("img3.doubanio.com", "img1.doubanio.com");
                        douban_info = douban_info.replace("https://img1.doubanio.com", "http://img1.doubanio.com");
                        if (douban_info != '') {
                            raw_info.descr = douban_info + '\n\n' + raw_info.descr;

                    if (is_douban_needed && raw_info.descr.match(/http(s*):\/\/www.imdb.com\/title\/tt(\d+)/i)){
                            raw_info.url = raw_info.descr.match(/http(s*):\/\/www.imdb.com\/title\/tt(\d+)/i)[0] + '/';
                    }

                            jump_str = dictToString(raw_info);
                            if (origin_site == 'MTV' || origin_site == 'PTP'){
                                douban_button.value = '获取成功';
                            } else {
                                box_right.innerHTML = box_right.innerHTML.replace('  获取中……', '  获取成功');
                            }
                            tag_aa = forward_r.getElementsByTagName('a');
                            for (i = 0; i < tag_aa.length; i++) {
                                if (tag_aa[i].textContent != '常用站点' && tag_aa[i].textContent != 'PTgen'){
                                            tag_aa[i].href = decodeURI(tag_aa[i]).split(seperator)[0] + seperator + encodeURI(jump_str);
                                }
                            }
                        } else {
                            if (origin_site == 'MTV' || origin_site == 'PTP'){
                                douban_button.value = '获取失败';
                            } else {
                                box_right.innerHTML = box_right.innerHTML.replace('  获取中……', '  获取失败');
                            }
                        }
                    }
                });

            })
            .catch(function(err){
                console.log(err);
            });

        }, false);
    }
}


/*
    ---------------------------------------part 5 页面逻辑处理（发布页）--------------------------------------
*/
else if (judge_if_the_site_as_source() == 0){

    //---------------------------------获取数据------------------------------

    var upload_site = site_url.split(seperator)[0]; //转发的站点
    raw_info = stringToDict(site_url.split(seperator)[1]); //将弄回来的字符串转成字典
    var forward_site = find_origin_site(upload_site);
    raw_info.descr = raw_info.descr.replace(/\%2F/g, '/');
    raw_info.descr = raw_info.descr.replace(/\%3A/g, ':');

    //更新url
    // window.history.pushState(null, null, "/upload.php");


    //地区转换列表
    var us_ue = ['挪威|丹麦|瑞典|芬兰|英国|爱尔兰|荷兰|比利时|卢森堡|法国|西班牙|葡萄牙|德国|地利|瑞士|美国|加拿大|澳大利亚|意大利|波兰|新西兰'];


    //--------------------------------------调用函数完善数据----------------------------------------

    //标题肯定都有，副标题可能没有，从简介获取
    if (raw_info.small_descr == ''){
        raw_info.small_descr = get_small_descr_from_descr(raw_info.descr, raw_info.name);
    }

    //类型肯定有的，不然就不选择

    //补充imdb和豆瓣链接
    if (raw_info.url == ''){
        var url = raw_info.descr.match(/http(s*):\/\/www.imdb.com\/title\/tt(\d+)/i);
        if (url){
            raw_info.url = url[0] + '/';
        }
    }
    if (raw_info.dburl == ''){
        var dburl = raw_info.descr.match(/http(s*):\/\/.*?douban.com\/subject\/(\d+)/i);
        if (dburl){
            raw_info.dburl = dburl[0] + '/';
        }
    }

    //没有来源或者指向不明
    if (raw_info.source_sel == '' || raw_info.source_sel.match(/(港台|日韩)/)){
        var region = get_source_sel_from_descr(raw_info.descr);
        if (region != ''){
            raw_info.source_sel = region;
        }
    }

    //如果没有媒介, 从标题获取
    if (raw_info.medium_sel == ''){
        raw_info.medium_sel = raw_info.name.medium_sel();
    }

    //如果没有编码信息
    if (raw_info.codec_sel == ''){
        raw_info.codec_sel = raw_info.name.codec_sel();
    }

    //没有音频编码, 从标题获取，最后从简介获取
    if (raw_info.audiocodec_sel == ''){
        raw_info.audiocodec_sel = raw_info.name.audiocodec_sel();
        if (raw_info.audiocodec_sel == ''){
            raw_info.audiocodec_sel = raw_info.descr.audiocodec_sel();
        }
    }

    //没有分辨率
    if (raw_info.standard_sel == ''){
        raw_info.standard_sel = raw_info.name.standard_sel();
    }


    //-------------------------------------数据填充到指定位置--------------------------------------

    //输入框一般包含4个，特殊站点进行特殊处理，先不写全，到时候遇到问题慢慢补

    var allinput = document.getElementsByTagName("input");

    for (i = 0; i < allinput.length; i++) {

        if (allinput[i].name == 'name') { //填充标题

            if (forward_site.match(/(HDChina|NanYang|CMCT)/i)) { //hdc NY CMCT
                raw_info.name = raw_info.name.replace(/\s/g, "."); //中间空格换成"."
            } else if (forward_site == 'TTG') {
                raw_info.name = '{name} [{small_descr}]'.format({
                    'name': raw_info.name,
                    'small_descr': raw_info.small_descr
                });
            } else if (forward_site == 'PuTao'){
                raw_info.name = '[{chines}] {english}'.format({
                    'english': raw_info.name,
                    'chines': raw_info.small_descr
                });
            }
            allinput[i].value = raw_info.name;
        }

        if (allinput[i].name == 'small_descr') { //填充副标题
            allinput[i].value = raw_info.small_descr;
        }

        if (allinput[i].name == 'url' && allinput[i].type == "text") { //填充imdb信息
            //ob没有imdb也可以用豆瓣
            if (forward_site == 'OurBits' && raw_info.url == ''){
                if (raw_info.dburl){
                    raw_info.url = raw_info.dburl;
                }
            }
            if (forward_site == 'Moecat' || forward_site == 'HDstreet'){
                if (raw_info.dburl){
                    allinput[i].value = raw_info.dburl;
                } else {
                    allinput[i].value = raw_info.url;
                }
            } else{
                allinput[i].value = raw_info.url;
            }
        }

        if (['url_douban', 'douban', 'dburl', 'douban_url'].indexOf(allinput[i].name)>-1) { //豆瓣信息
            allinput[i].value = raw_info.dburl;
        }

        if (forward_site == 'HDDolby' && allinput[i].name == 'douban_id' && raw_info.dburl){
            allinput[i].value = raw_info.dburl.match(/\d+/i)[0];
        }

        if (forward_site == 'BTSchool' && allinput[i].name == 'imdbid' && raw_info.url){
            allinput[i].value = raw_info.url.match(/tt\d+/i)[0];
        }

        if (forward_site == 'BTSchool' && allinput[i].name == 'doubanid' && raw_info.dburl){
            allinput[i].value = raw_info.dburl.match(/\d+/i)[0];
        }

        if (forward_site == 'Moecat' && allinput[i].name == 'external_url'){
            allinput[i].value = raw_info.url? raw_info.url:raw_info.dburl;
        }
    }

    //填写简介，一般都是textarea，特殊情况后续处理--CMCT改版兼容
    var descr_box = document.getElementsByTagName('textarea');
    if (forward_site != 'CMCT'){
        descr_box[0].style.height = '800px';
        descr_box[0].value = raw_info.descr;
    }


    //-----------------------------------------------选择类填写------------------------------------------------

    /*
        这一部分不同站点大不一样，所以分站点写
    */

    if (forward_site == 'PTer'){

        var browsecat = document.getElementById('browsecat');
        var type_dict = {'电影': 1, '剧集': 2, '动漫': 3, '综艺': 4, '音乐': 6, '纪录': 7,
                         '体育': 8, '软件': 11, '学习': 12};
        //如果当前类型在上述字典中
        if (type_dict.hasOwnProperty(raw_info.type)){
            var index = type_dict[raw_info.type];
            browsecat.options[index].selected = true;
        }

        var source_box = document.getElementsByTagName('select')[4];

        switch(raw_info.medium_sel){
            case 'UHD': source_box.options[1].selected = true; break;
            case 'Blu-ray': source_box.options[2].selected = true; break;
            case 'Remux': source_box.options[3].selected = true; break;
            case 'HDTV': source_box.options[4].selected = true; break;
            case 'WEB-DL': source_box.options[5].selected = true; break;
            case 'Encode': source_box.options[6].selected = true; break;
            case 'DVD': source_box.options[7].selected = true;
        }

        switch(raw_info.audiocodec_sel){
            case 'Flac': source_box.options[8].selected = true; break;
            case 'WAV': source_box.options[9].selected = true;
        }


        var team_box = document.getElementsByTagName('select')[5];
        var team_dict = {'欧美': 4, '大陆': 1, '香港': 2, '台湾': 3, '日本': 6, '韩国': 5,
                         '印度': 7 };
        if (team_dict.hasOwnProperty(raw_info.source_sel)){
            var index = team_dict[raw_info.source_sel];
            team_box.options[index].selected = true;
        }

        //勾选匿名
        document.getElementsByName('uplver')[0].checked = true;
    }

    else if (forward_site == 'MTeam'){

        //type分类太杂了,这里的选项有点问题，直接用jQuery
        var browsecat = document.getElementById('browsecat');
        switch (raw_info.type){
            case '电影':
                if (raw_info.medium_sel == 'Blu-ray' || raw_info.medium_sel == 'UHD'){
                    browsecat.options[3].selected = true;
                } else if (raw_info.medium_sel == 'Remux'){
                    browsecat.options[4].selected = true;
                } else if (raw_info.medium_sel == 'DVD' || raw_info.medium_sel == 'DVDRip'){
                    browsecat.options[2].selected = true;
                } else {
                    if (raw_info.standard_sel != 'SD'){
                        browsecat.options[1].selected = true;
                    } else{
                        browsecat.options[0].selected = true;
                    }
                }
                break;
            case '剧集': case '综艺':
                if (raw_info.medium_sel == 'Blu-ray' || raw_info.medium_sel == 'UHD'){
                    browsecat.options[8].selected = true;
                } else if (raw_info.medium_sel == 'DVD' || raw_info.medium_sel == 'DVDRip'){
                    browsecat.options[7].selected = true;
                } else {

                    if (raw_info.standard_sel != 'SD'){
                        browsecat.options[6].selected = true;
                    } else{
                        browsecat.options[5].selected = true;
                    }
                }
                break;

            case '纪录': case '学习':
                browsecat.options[9].selected = true; break;
            case '动漫': browsecat.options[10].selected = true; break;
            case '音乐':
                if(raw_info.name.match(/(flac|ape)/i)){
                    $('#browsecat').val('13');
                } else if (raw_info.name.match(/mv/i)){
                    browsecat.options[11].selected = true;
                } else {
                    browsecat.options[12].selected = true;
                }
                break;
            case '体育': browsecat.options[14].selected = true; break;
            case '软件': browsecat.options[15].selected = true;
        }

        //编码，馒头有两种标准——音频和视频先匹配音频，视频就会覆盖音频
        /*
            这里演示两种写法，一种是根据设计的字典键值去匹配，另外一种是用switch，类似于if else
        */
        var codec_box = document.getElementsByTagName('select')[1];
        var audiocodec_dict = {'Flac': 5, 'APE': 6, 'DTS': 7, 'AC3': 8, 'WAV': 9, 'MP3': 10,
                               'AAC': 14 };
        if (audiocodec_dict.hasOwnProperty(raw_info.audiocodec_sel)){
            var index = audiocodec_dict[raw_info.audiocodec_sel];
            codec_box.options[index].selected = true;
        }

        switch (raw_info.codec_sel){
            case 'H264': case 'X264':
                codec_box.options[1].selected = true; break;
            case 'VC-1':
                codec_box.options[2].selected = true; break;
            case 'XVID':
                codec_box.options[3].selected = true; break;
            case 'MPEG-2':
                codec_box.options[4].selected = true; break;
            case 'MPEG-4':
                codec_box.options[11].selected = true; break;
            case 'H265': case 'X265':
                codec_box.options[12].selected = true;
        }

        //分辨率最简单了
        var standard_box = document.getElementsByTagName('select')[2];
        var standard_dict = {
            '4K': 5, '1080p': 1, '1080i': 2, '720p': 3, 'SD': 4, '': 0
        };
        if (standard_dict.hasOwnProperty(raw_info.standard_sel)){
            var index = standard_dict[raw_info.standard_sel];
            standard_box.options[index].selected = true;
        }

        //地区
        var processing_box = document.getElementsByTagName('select')[3];
        var processing_dict = {'欧美': 2, '大陆': 1, '香港': 3, '台湾': 3, '日本': 4, '韩国': 5, 
                               '印度': 6, '': 6, '港台': 3};
        if (processing_dict.hasOwnProperty(raw_info.source_sel)){
            var index = processing_dict[raw_info.source_sel];
            processing_box.options[index].selected = true;
        }
    }

    else if (forward_site == 'CMCT'){

        //type
        var browsecat = document.getElementById('browsecat');
        var type_dict = {'电影': 1, '剧集': 2, '动漫': 4, '综艺': 5, '音乐': 8, '纪录': 3, 
                         '体育': 6, '软件': 9, '学习': 9, '': 9};
        //如果当前类型在上述字典中
        if (type_dict.hasOwnProperty(raw_info.type)){
            var index = type_dict[raw_info.type];
            browsecat.options[index].selected = true;
        }

        //处理媒介
        var medium_box = document.getElementsByName('medium_sel')[0];

        //多了mkv和MP4的分类, 如果不在列表所列的这里,尝试从简介里扑腾一下
        if (['UHD', 'Blu-ray', 'DVD', 'Remux', 'HDTV'].indexOf(raw_info.medium_sel) < 0){
            if (raw_info.descr.match(/(mkv|mp4)/i)){
                raw_info.medium_sel = raw_info.descr.match(/(mkv|mp4)/i)[0];
                if (raw_info.medium_sel.match(/mkv/i)){
                    raw_info.medium_sel = 'Matroska';
                } else {
                    raw_info.medium_sel = 'MP4';
                }
            }
        }

        switch(raw_info.medium_sel){
            case 'UHD': case 'Blu-ray':
                medium_box.options[1].selected = true; break;
            case 'DVD': medium_box.options[3].selected = true; break;
            case 'Remux': medium_box.options[4].selected = true; break;
            case 'HDTV': medium_box.options[5].selected = true; break;
            case 'Matroska': medium_box.options[6].selected = true; break;
            case 'MP4': medium_box.options[7].selected = true;

        }

        //视频编码
        var codec_box = document.getElementsByName('codec_sel')[0];
        switch (raw_info.codec_sel){
            case 'H265': case 'X265':
                codec_box.options[1].selected = true; break;
            case 'H264': case 'X264':
                codec_box.options[2].selected = true; break;
            case 'XVID':
                codec_box.options[3].selected = true; break;
            case 'MPEG-2': case 'MPEG-4':
                codec_box.options[4].selected = true;
        }

        //音频编码
        var audiocodec_box = document.getElementsByName('audiocodec_sel')[0];
        switch (raw_info.audiocodec_sel){

            case 'DTS-HD': case 'DTS-HDMA:X 7.1': case 'DTS-HDMA':
                audiocodec_box.options[1].selected = true; break;
            case 'TrueHD': case 'Atmos':
                audiocodec_box.options[2].selected = true; break;
            case 'LPCM':
                audiocodec_box.options[3].selected = true; break;
            case 'DTS':
                audiocodec_box.options[4].selected = true; break;
            case 'AC3':
                audiocodec_box.options[5].selected = true; break;
            case 'AAC':
                audiocodec_box.options[6].selected = true; break;
            case 'Flac':
                audiocodec_box.options[7].selected = true; break;
            case 'APE':
                audiocodec_box.options[8].selected = true; break;
            case 'WAV':
                audiocodec_box.options[9].selected = true;
        }

        //分辨率
        var standard_box = document.getElementsByName('standard_sel')[0];
        var standard_dict = {
            '4K': 1, '1080p': 2, '1080i': 3, '720p': 4, 'SD': 5, '': 0
        };
        if (standard_dict.hasOwnProperty(raw_info.standard_sel)){
            var index = standard_dict[raw_info.standard_sel];
            standard_box.options[index].selected = true;
        }

        //地区
        var source_box = document.getElementsByName('source_sel')[0];
        var source_dict = {'欧美': 3, '大陆': 1, '香港': 2, '台湾': 2, '日本': 4, '韩国': 4, '日韩': 4,
                           '印度': 5, '': 5, '港台': 2};
        if (source_dict.hasOwnProperty(raw_info.source_sel)){
            var index = source_dict[raw_info.source_sel];
            source_box.options[index].selected = true;
        }

        //勾选匿名发布
        $("input[name='uplver']").attr('checked','true');

        //简介分成了三个框——所以先暂时都放在最后一个框，然后把它们都调高一点，手动剪切粘贴
        //后期可以自由发挥
        descr_box[0].style.height = '120px';
        descr_box[1].style.height = '200px';
        descr_box[2].style.height = '800px';

        var quotes = '';
        var mediainfo = '';
        quotes = raw_info.descr.match(/\[quote\][\s\S]*?\[\/quote\]/g);
        mediainfo = quotes[quotes.length-1];
        raw_info.mediainfo_cmct = mediainfo.replace(/\[.?quote\]/ig, '');

        var imgs = '';
        imgs = raw_info.descr.match(/\[url=.*?\]\[img\].*?\[\/img\]\[\/url\]/g);
        var imginfo = '';

        //从0开始，海报不在上述匹配模式里
        for (i = 0; i < imgs.length; i++) {
            if (!imgs[i].match(/(kralimarko)/i)) {
                imginfo += imgs[i] + '\n';
            }
        }
        raw_info.imgs_cmct = imginfo;

        descr_box[0].value = raw_info.imgs_cmct;
        descr_box[1].value = raw_info.mediainfo_cmct;

    }

    else if (forward_site == 'TTG'){

        //类型，混乱
        var browsecat = document.getElementsByTagName('select')[0];
        switch (raw_info.type){
            case '电影':
                if (raw_info.medium_sel == 'Blu-ray'){
                    browsecat.options[24].selected = true;
                } else if (raw_info.medium_sel == 'UHD') {
                    browsecat.options[26].selected = true;
                } else if (raw_info.medium_sel == 'DVD' || raw_info.medium_sel == 'DVDRip'){
                    browsecat.options[21].selected = true;
                } else {
                    if (raw_info.standard_sel == '720p'){
                        browsecat.options[22].selected = true;
                    } else if (raw_info.standard_sel == '1080p' || raw_info.standard_sel == '1080i'){
                        browsecat.options[23].selected = true;
                    } else if (raw_info.standard_sel == '4K'){
                        browsecat.options[25].selected = true;
                    }
                }
                break;

            case '纪录':
                if (raw_info.medium_sel == 'Blu-ray' || raw_info.medium_sel == 'UHD'){
                    browsecat.options[29].selected = true;
                } else {
                    if (raw_info.standard_sel == '720p'){
                        browsecat.options[27].selected = true;
                    } else if (raw_info.standard_sel == '1080p' || raw_info.standard_sel == '1080i'){
                        browsecat.options[28].selected = true;
                    } else if (raw_info.standard_sel == '4K'){
                        browsecat.options[25].selected = true;
                    }
                }
                break;

            case '剧集':
                switch (raw_info.source_sel){

                    case '大陆': case '台湾': case '香港': case '港台':
                        //是否合集
                        if (raw_info.name.match(/(complete|S\d{2}^E)/i)) {
                            browsecat.options[39].selected = true;
                        } else {
                            if (raw_info.standard_sel == '720p'){
                                browsecat.options[34].selected = true;
                            } else if (raw_info.standard_sel == '1080p' || raw_info.standard_sel == '1080i'){
                                browsecat.options[35].selected = true;
                            }
                        }
                        break;

                    case '日本':
                        if (raw_info.name.match(/(complete|S\d{2}^E)/i)) {
                            browsecat.options[37].selected = true;
                        } else {
                            browsecat.options[32].selected = true;
                        }
                        break;
                    case '韩国':
                        if (raw_info.name.match(/(complete|S\d{2}^E)/i)) {
                            browsecat.options[38].selected = true;
                        } else {
                            browsecat.options[33].selected = true;
                        }
                        break;

                    case '欧美':
                        //单集
                        if (raw_info.name.match(/(S\d{2}E\d{2})/i)) {
                            if (raw_info.standard_sel == '720p'){
                                browsecat.options[30].selected = true;
                            } else if (raw_info.standard_sel == '1080p' || raw_info.standard_sel == '1080i'){
                                browsecat.options[31].selected = true;
                            }
                        } else {
                            browsecat.options[36].selected = true;
                        }
                        break;
                }
                break;

            case '综艺':
                if (raw_info.source_sel == '日本'){
                    browsecat.options[50].selected = true;
                } else if (raw_info.source_sel == '韩国'){
                    browsecat.options[48].selected = true;
                } else {
                    browsecat.options[49].selected = true;
                }

                break;

            case '动漫':
                browsecat.options[47].selected = true; break;
            case '音乐':
                if (raw_info.name.match(/(Flac|APE)/i)){
                    browsecat.options[44].selected = true;
                } else {
                    browsecat.options[45].selected = true;
                }
                break;

            case '体育': browsecat.options[46].selected = true; break;
            case '软件': browsecat.options[56].selected = true; break;
            case '学习': browsecat.options[55].selected = true;
        }

        //ipad的简单判定
        if (raw_info.name.match(/(pad$|ipad)/i)){
            browsecat.options[53].selected = true;
        }

        //匿名发布
        $("select[name='anonymity']").find("option[value='yes']").attr("selected",true);
        // document.getElementsByName('anonymity')[0].options[1].selected = true;

        //imdb编号填写
        if (raw_info.url != ''){
            $("input[name='imdb_c']").val(raw_info.url.match(/tt\d+/i));
        }
    }

    else if (forward_site == 'OurBits'){
        //type
        var browsecat = document.getElementById('browsecat');
        switch (raw_info.type){
            case '电影':
                if (raw_info.name.match(/3D/i)){
                    browsecat.options[2].selected = true;
                } else {
                    browsecat.options[1].selected = true;
                }
                break;
            case '剧集':
                if (raw_info.name.match(/(S\d{2}^E|complete)/i)){
                    browsecat.options[5].selected = true;
                } else {
                    browsecat.options[4].selected = true;
                }
                break;
            case '音乐':
                if (raw_info.small_descr.match(/音乐会/i)){
                    browsecat.options[3].selected = true;
                } else if (raw_info.name.match(/MV/i)) {
                    browsecat.options[10].selected = true;
                } else {
                    browsecat.options[11].selected = true;
                }
                break;

            case '综艺': browsecat.options[6].selected = true; break;
            case '纪录': browsecat.options[7].selected = true; break;
            case '动漫': browsecat.options[8].selected = true; break;
            case '体育': browsecat.options[9].selected = true;
        }

        // 媒介 -- 尝试使用jQuery写
        switch(raw_info.medium_sel){
            case 'UHD': $("select[name='medium_sel']").val('12'); break;
            case 'Blu-ray': $("select[name='medium_sel']").val('1'); break;
            case 'HDTV': $("select[name='medium_sel']").val('5'); break;
            case 'WEB-DL': $("select[name='medium_sel']").val('9'); break;
            case 'Encode': $("select[name='medium_sel']").val('7'); break;
            case 'DVD': $("select[name='medium_sel']").val('2');
        }

        //视频编码
        switch (raw_info.codec_sel){
            case 'H265': case 'X265':
                $("select[name='codec_sel']").val('14'); break;
            case 'H264': case 'X264':
                $("select[name='codec_sel']").val('12'); break;
            case 'XVID':
                $("select[name='codec_sel']").val('17'); break;
            case 'VC-1':
                $("select[name='codec_sel']").val('16'); break;
            case 'MPEG-2': case 'MPEG-4':
                $("select[name='codec_sel']").val('15'); break;
            case '':
                $("select[name='codec_sel']").val('18');
        }

        //音频编码
        switch (raw_info.audiocodec_sel){
            case 'DTS-HDMA:X 7.1': case 'DTS-HDMA': case 'DTS-HD':
                $("select[name='audiocodec_sel']").val('1'); break;
            case 'Atmos':
                $("select[name='audiocodec_sel']").val('14'); break;
            case 'TrueHD':
                $("select[name='audiocodec_sel']").val('2'); break;
            case 'LPCM':
                $("select[name='audiocodec_sel']").val('5'); break;
            case 'DTS':
                if (raw_info.name.match(/DTS.?X[^ \d]/i)){
                    $("select[name='audiocodec_sel']").val('21');
                } else {
                    $("select[name='audiocodec_sel']").val('4');
                }
                break;
            case 'AC3':
                $("select[name='audiocodec_sel']").val('6'); break;
            case 'AAC':
                $("select[name='audiocodec_sel']").val('7'); break;
            case 'Flac':
                $("select[name='audiocodec_sel']").val('13'); break;
            case 'APE':
                $("select[name='audiocodec_sel']").val('12'); break;
            case 'WAV':
                $("select[name='audiocodec_sel']").val('11');
        }

        //分辨率
        var standard_dict = {
            '4K': '5', '1080p': '1', '1080i': '2', '720p': '3', 'SD': '4', '': '0'
        };
        if (standard_dict.hasOwnProperty(raw_info.standard_sel)){
            var index = standard_dict[raw_info.standard_sel];
            $("select[name='standard_sel']").val(index);
        }

        //地区
        var source_dict = {'欧美': '2', '大陆': '1', '香港': '3', '台湾': '3', '日本': '4', '韩国': '5'};
        if (source_dict.hasOwnProperty(raw_info.source_sel)){
            var index = source_dict[raw_info.source_sel];
            $("select[name='processing_sel']").val(index);
        }

        //勾选匿名发布
        $("input[name='uplver']").attr('checked','true');
    }

    //尝试全部用jquery实现
    else if (forward_site == 'HDChina'){

        //类型
        switch (raw_info.type){
            case '电影':
                if (raw_info.medium_sel == 'Blu-ray' || raw_info.medium_sel == 'UHD'){
                    if (raw_info.standard_sel == '4K'){
                        $('#browsecat').val('410');
                    } else{
                        $('#browsecat').val('20');
                    }
                } else {
                    if (raw_info.standard_sel == '720p'){
                        $('#browsecat').val('9');
                    } else if(raw_info.standard_sel == '1080i'){
                        $('#browsecat').val('16');
                    } else if (raw_info.standard_sel == '1080p'){
                        $('#browsecat').val('17');
                    }
                }
                break;
            case '剧集':
                switch (raw_info.source_sel){

                    case '大陆': case '台湾': case '香港': case '港台':
                        //是否合集
                        if (raw_info.name.match(/(complete|S\d{2}^E)/i)) { //合集
                            $('#browsecat').val('22');
                        } else {
                            $('#browsecat').val('25');
                        }
                        break;

                    case '日本':
                        if (raw_info.name.match(/(complete|S\d{2}^E)/i)) {
                            $('#browsecat').val('23');
                        } else {
                            $('#browsecat').val('24');
                        }
                        break;
                    case '韩国':
                        if (raw_info.name.match(/(complete|S\d{2}^E)/i)) {
                            $('#browsecat').val('23');
                        } else {
                            $('#browsecat').val('24');
                        }
                        break;

                    case '欧美':
                        //单集
                        if (raw_info.name.match(/(S\d{2}E\d{2})/i)) {
                            $('#browsecat').val('13');
                        } else {
                            $('#browsecat').val('21');
                        }
                        break;
                }
                break;
            case '音乐':
                if (raw_info.small_descr.match(/音乐会/i)){
                    $('#browsecat').val('402');
                } else if (raw_info.name.match(/MV/i)) {
                    $('#browsecat').val('406');
                } else {
                    $('#browsecat').val('408');
                }
                break;

            case '综艺': $('#browsecat').val('21');  break;
            case '纪录': $('#browsecat').val('401');  break;
            case '动漫': $('#browsecat').val('14');  break;
            case '学习': $('#browsecat').val('404');  break;
            case '纪录': $('#browsecat').val('401');  break;
            case '动漫': $('#browsecat').val('14');  break;
            case '体育': $('#browsecat').val('15');
        }
        //ipad的简单判定
        if (raw_info.name.match(/(pad$|ipad)/i)){
            $('#browsecat').val('27');
        }

        //欢迎转载
        $('#share_rule').val('3');

        //格式
        $("select[name='standard_sel']").val('10'); //默认其它
        if (raw_info.medium_sel == 'Blu-ray' || raw_info.medium_sel == 'UHD'){
            $("select[name='standard_sel']").val('2');
        } else {
            switch (raw_info.standard_sel){
                case '4K': $("select[name='standard_sel']").val('17'); break;
                case '1080p': $("select[name='standard_sel']").val('11'); break;
                case '1080i': $("select[name='standard_sel']").val('12'); break;
                case '720p': $("select[name='standard_sel']").val('13'); break;
                case 'SD': $("select[name='standard_sel']").val('15'); 

            }
        }

        //媒介
        $("select[name='medium_sel']").val('15');  //默认其它
        if (raw_info.name.match(/MiniBD/i)) {
            $("select[name='medium_sel']").val('2');
        }
        else {
            switch (raw_info.medium_sel){
                case 'UHD': case 'Blu-ray':
                    $("select[name='medium_sel']").val('11'); break;
                case 'HDTV': $("select[name='medium_sel']").val('13'); break;
                case 'WEB-DL': $("select[name='medium_sel']").val('21'); break;
                case 'Encode': $("select[name='medium_sel']").val('5'); break;
                case 'Remux': $("select[name='medium_sel']").val('6'); break;
                case 'DVD':
                    if (raw_info.name.match(/DVDR/i)) {
                        $("select[name='medium_sel']").val('4');
                    } else if (raw_info.name.match(/HD.?DVD/i)){
                        $("select[name='medium_sel']").val('12');
                    } else {
                        $("select[name='medium_sel']").val('14');
                    }
            }
        }

        //视频编码
        switch (raw_info.codec_sel){
            case 'H265': case 'X265':
                $("select[name='codec_sel']").val('10'); break;
            case 'H264':
                $("select[name='codec_sel']").val('1'); break;
            case 'X264':
                $("select[name='codec_sel']").val('6'); break;
            case 'XVID':
                $("select[name='codec_sel']").val('3'); break;
            case 'VC-1':
                $("select[name='codec_sel']").val('2'); break;
            case 'MPEG-2': case 'MPEG-4':
                $("select[name='codec_sel']").val('4'); break;
            case '':
                $("select[name='codec_sel']").val('5');
        }

        //音频编码
        $("select[name='audiocodec_sel']").val('7'); //默认其它
        switch (raw_info.audiocodec_sel){
            case 'DTS-HDMA:X 7.1': case 'DTS-HDMA':
                $("select[name='audiocodec_sel']").val('12'); break;
            case 'Atmos':
                $("select[name='audiocodec_sel']").val('15'); break;
            case 'TrueHD':
                $("select[name='audiocodec_sel']").val('13'); break;
            case 'LPCM':
                $("select[name='audiocodec_sel']").val('11'); break;
            case 'DTS': case 'DTS-HD':
                if (raw_info.name.match(/DTS.?X[^ \d]/i)){
                    $("select[name='audiocodec_sel']").val('14');
                } else {
                    $("select[name='audiocodec_sel']").val('3');
                }
                break;
            case 'AC3':
                $("select[name='audiocodec_sel']").val('8'); break;
            case 'AAC':
                $("select[name='audiocodec_sel']").val('6'); break;
            case 'Flac':
                $("select[name='audiocodec_sel']").val('1'); break;
            case 'APE':
                $("select[name='audiocodec_sel']").val('2'); break;
            case 'MP3':
                $("select[name='audiocodec_sel']").val('4'); break;
            case 'WAV':
                $("select[name='audiocodec_sel']").val('9');
        }


        //海报，从简介获取
        reg_img = raw_info.descr.match(/\[img\](.*?)\[\/img\][\s\S]+?(主.{0,6}演|译.{0,6}名)/i);
        if (reg_img){
            $('#cover').val(reg_img[1]);
        }

        //勾选匿名发布
        $("input[name='uplver']").attr('checked','true');
    }

    else if (forward_site == 'PThome'){
        var browsecat = document.getElementById('browsecat');
        var type_dict = {'电影': 1, '剧集': 4, '动漫': 3, '综艺': 5, '音乐': 8, '纪录': 2,
                         '体育': 7, '软件': 10, '学习': 11};
        //如果当前类型在上述字典中
        browsecat.options[12].selected = true;//默认其他
        if (type_dict.hasOwnProperty(raw_info.type)){
            var index = type_dict[raw_info.type];
            browsecat.options[index].selected = true;
        }
        if (raw_info.type == '音乐' && raw_info.name.match(/mv/i)){
            browsecat.options[6].selected = true;
        }
            if (raw_info.name.match(/-HDSPad/i)){
                 browsecat.options[1].selected = true;
            }
        //媒介
        var medium_box = document.getElementsByName('medium_sel')[0];
        medium_box.options[12].selected = true; //默认其他
        switch(raw_info.medium_sel){
            case 'UHD':
                if (raw_info.name.match(/DIY|@/i)){
                    medium_box.options[1].selected = true;
                } else{
                    medium_box.options[1].selected = true;
                }
                break;
            case 'Blu-ray':
                if (raw_info.name.match(/DIY|@/i)){
                    medium_box.options[4].selected = true;
                } else{
                    medium_box.options[3].selected = true;
                }
                break;

            case 'DVD': medium_box.options[9].selected = true; break;
            case 'Remux': medium_box.options[5].selected = true; break;
            case 'HDTV': medium_box.options[6].selected = true; break;
            case 'Encode': medium_box.options[7].selected = true; break;
            case 'WEB-DL': medium_box.options[8].selected = true;
        }

        //视频编码
        var codec_box = document.getElementsByName('codec_sel')[0];
        codec_box.options[5].selected = true;
        switch (raw_info.codec_sel){
            case 'H265': case 'X265':
                codec_box.options[1].selected = true; break;
            case 'H264': case 'X264':
                codec_box.options[2].selected = true; break;
            case 'VC-1':
                codec_box.options[3].selected = true; break;
            case 'MPEG-2': case 'MPEG-4':
                codec_box.options[4].selected = true;
        }

        //音频编码
        var audiocodec_box = document.getElementsByName('audiocodec_sel')[0];
        audiocodec_box.options[10].selected = true;

        switch (raw_info.audiocodec_sel){
            case 'DTS-HD': case 'DTS-HDMA:X 7.1': case 'DTS-HDMA':
                audiocodec_box.options[1].selected = true; break;
            case 'TrueHD': case 'Atmos':
                audiocodec_box.options[2].selected = true; break;
            case 'LPCM':
                audiocodec_box.options[3].selected = true; break;
            case 'DTS':
                audiocodec_box.options[4].selected = true; break;
            case 'AC3':
                audiocodec_box.options[5].selected = true; break;
            case 'AAC':
                audiocodec_box.options[6].selected = true; break;
            case 'Flac':
                audiocodec_box.options[7].selected = true; break;
            case 'APE':
                audiocodec_box.options[8].selected = true; break;
            case 'WAV':
                audiocodec_box.options[9].selected = true;
        }
        if (raw_info.name.match(/Atmos/i)){
            audiocodec_box.options[2].selected = true;
        }
        //alert (raw_info.audiocodec_sel)
        //分辨率
        var standard_box = document.getElementsByName('standard_sel')[0];
        var standard_dict = {
            '4K': 1, '1080p': 2, '1080i': 3, '720p': 4, 'SD': 5, '': 0
        };
        if (standard_dict.hasOwnProperty(raw_info.standard_sel)){
            var index = standard_dict[raw_info.standard_sel];
            standard_box.options[index].selected = true;
        }

        //勾选匿名发布
        document.getElementsByName('uplver')[0].checked = true;
    }

    else if (forward_site == 'HDHome'){
        //类型
        var is_pad = false;
        if (raw_info.name.match(/pad$|ipad/i)){
            is_pad = true;
        }
        switch (raw_info.type){

            case '电影':
                if (raw_info.medium_sel == 'Blu-ray'){
                    set_selected_option_by_value('browsecat','450');
                } else if(raw_info.medium_sel == 'UHD'){
                    set_selected_option_by_value('browsecat','499');
                } else if(raw_info.medium_sel == 'Remux'){
                    set_selected_option_by_value('browsecat','415');
                } else {
                    if (is_pad){
                        set_selected_option_by_value('browsecat','412');
                    } else{
                        if (raw_info.standard_sel == '720p'){
                            set_selected_option_by_value('browsecat','413');
                        } else if(raw_info.standard_sel == '1080i' || raw_info.standard_sel == '1080p'){
                            set_selected_option_by_value('browsecat','414');
                        } else if (raw_info.standard_sel == '4K'){
                            set_selected_option_by_value('browsecat','416');
                        } else if (raw_info.standard_sel == 'SD'){
                            set_selected_option_by_value('browsecat','411');
                        }
                    }

                }
                break;
            case '剧集':
                if (raw_info.medium_sel == 'Blu-ray' || raw_info.medium_sel == 'UHD'){
                    if (raw_info.standard_sel == '4K'){
                        set_selected_option_by_value('browsecat','502');
                    } else{
                        set_selected_option_by_value('browsecat','453');
                    }
                }  else if(raw_info.medium_sel == 'Remux'){
                    set_selected_option_by_value('browsecat','437');
                } else {
                    if (is_pad){
                        set_selected_option_by_value('browsecat','433');
                    } else{
                        if (raw_info.standard_sel == '720p'){
                            set_selected_option_by_value('browsecat','434');
                        } else if(raw_info.standard_sel == '1080i'){
                            set_selected_option_by_value('browsecat','435');
                        } else if (raw_info.standard_sel == '1080p'){
                            set_selected_option_by_value('browsecat','436');
                        } else if (raw_info.standard_sel == '4K'){
                            set_selected_option_by_value('browsecat','438');
                        } else if (raw_info.standard_sel == 'SD'){
                            set_selected_option_by_value('browsecat','432');
                        }
                    }

                }

                break;
            case '音乐':
                if (raw_info.name.match(/MV/i)) {
                    set_selected_option_by_value('browsecat','441');
                } else if (raw_info.name.match(/APE/i)) {
                    set_selected_option_by_value('browsecat','439');
                } else if (raw_info.name.match(/Flac/i)) {
                    set_selected_option_by_value('browsecat','440');
                }
                break;

            case '综艺':
                if (raw_info.medium_sel == 'Blu-ray' || raw_info.medium_sel == 'UHD'){
                    set_selected_option_by_value('browsecat','452');
                } else if(raw_info.medium_sel == 'Remux'){
                    set_selected_option_by_value('browsecat','430');
                } else {
                    if (is_pad){
                        set_selected_option_by_value('browsecat','426');
                    } else{
                        if (raw_info.standard_sel == '720p'){
                            set_selected_option_by_value('browsecat','427');
                        } else if(raw_info.standard_sel == '1080i'){
                            set_selected_option_by_value('browsecat','428');
                        } else if (raw_info.standard_sel == '1080p'){
                            set_selected_option_by_value('browsecat','429');
                        } else if (raw_info.standard_sel == '4K'){
                            set_selected_option_by_value('browsecat','431');
                        } else if (raw_info.standard_sel == 'SD'){
                            set_selected_option_by_value('browsecat','425');
                        }
                    }

                }
                break;
            case '纪录':
                if (raw_info.medium_sel == 'Blu-ray'){
                    set_selected_option_by_value('browsecat','451');
                } else if (raw_info.medium_sel == 'UHD'){
                    set_selected_option_by_value('browsecat','500');
                } else if(raw_info.medium_sel == 'Remux'){
                    set_selected_option_by_value('browsecat','421');
                } else {
                    if (is_pad){
                        set_selected_option_by_value('browsecat','418');
                    } else{
                        if (raw_info.standard_sel == '720p'){
                            set_selected_option_by_value('browsecat','419');
                        } else if(raw_info.standard_sel == '1080i' || raw_info.standard_sel == '1080p'){
                            set_selected_option_by_value('browsecat','420');
                        } else if (raw_info.standard_sel == '4K'){
                            set_selected_option_by_value('browsecat','422');
                        } else if (raw_info.standard_sel == 'SD'){
                            set_selected_option_by_value('browsecat','417');
                        }
                    }

                }

                break;

            case '动漫':
                if (raw_info.medium_sel == 'Blu-ray'){
                    set_selected_option_by_value('browsecat','454');
                } else if (raw_info.medium_sel == 'UHD'){
                    set_selected_option_by_value('browsecat','501');
                } else if(raw_info.medium_sel == 'Remux'){
                    set_selected_option_by_value('browsecat','448');
                } else {
                    if (is_pad){
                        set_selected_option_by_value('browsecat','445');
                    } else{
                        if (raw_info.standard_sel == '720p'){
                            set_selected_option_by_value('browsecat','446');
                        } else if(raw_info.standard_sel == '1080i' || raw_info.standard_sel == '1080p'){
                            set_selected_option_by_value('browsecat','447');
                        } else if (raw_info.standard_sel == '4K'){
                            set_selected_option_by_value('browsecat','449');
                        } else if (raw_info.standard_sel == 'SD'){
                            set_selected_option_by_value('browsecat','444');
                        }
                    }

                }
                break;
            case '学习': set_selected_option_by_value('browsecat','409');  break;
            case '体育':
                if (raw_info.standard_sel == '720p'){
                    set_selected_option_by_value('browsecat','442');
                } else if(raw_info.standard_sel == '1080i' || raw_info.standard_sel == '1080p'){
                    set_selected_option_by_value('browsecat','443');
                }
        }

        disableother('browsecat','specialcat');

        //来源
        var source_box = document.getElementsByName('source_sel')[0];
        source_box.options[5].selected=true;
        switch(raw_info.medium_sel){
            case 'UHD': source_box.options[1].selected=true; break;
            case 'Blu-ray': source_box.options[2].selected=true; break;
            case 'HDTV': source_box.options[3].selected=true; break;
            case 'WEB-DL': source_box.options[5].selected=true; break;
            case 'DVD': source_box.options[4].selected=true;
        }

        //媒介
        var medium_box = document.getElementsByName('medium_sel')[0];
        switch(raw_info.medium_sel){
            case 'UHD': medium_box.options[1].selected = true; break;
            case 'Blu-ray': medium_box.options[2].selected = true; break;
            case 'DVD': medium_box.options[6].selected = true; break;
            case 'Remux': medium_box.options[3].selected = true; break;
            case 'HDTV': medium_box.options[5].selected = true; break;
            case 'Encode': medium_box.options[4].selected = true; break;
            case 'WEB-DL': medium_box.options[8].selected = true;
        }
        if (raw_info.name.match(/MiniBD/i)){
            medium_box.options[7].selected = true;
        }

        //视频编码
        var codec_box = document.getElementsByName('codec_sel')[0];
        codec_box.options[5].selected = true;
        switch (raw_info.codec_sel){
            case 'H265': case 'X265':
                if (raw_info.name.match(/HEVC/i)){
                    codec_box.options[6].selected = true;
                } else {
                    codec_box.options[2].selected = true;
                }
                break;
            case 'H264': case 'X264':
                codec_box.options[1].selected = true; break;
            case 'VC-1':
                codec_box.options[3].selected = true; break;
            case 'MPEG-2': case 'MPEG-4':
                codec_box.options[4].selected = true;
        }

        //音频编码
        var audiocodec_box = document.getElementsByName('audiocodec_sel')[0];
        audiocodec_box.options[13].selected = true;

        switch (raw_info.audiocodec_sel){
            case 'DTS-HD': audiocodec_box.options[1].selected = true; break;
            case 'DTS-HDMA:X 7.1': audiocodec_box.options[12].selected = true; break;
            case 'DTS-HDMA': audiocodec_box.options[9].selected = true; break;
            case 'TrueHD': audiocodec_box.options[7].selected = true; break;
            case 'Atmos': audiocodec_box.options[11].selected = true; break;
            case 'LPCM': audiocodec_box.options[8].selected = true; break;
            case 'DTS': audiocodec_box.options[6].selected = true; break;
            case 'AC3': audiocodec_box.options[2].selected = true; break;
            case 'AAC': audiocodec_box.options[1].selected = true; break;
            case 'Flac': audiocodec_box.options[5].selected = true; break;
            case 'APE': audiocodec_box.options[3].selected = true; break;
            case 'WAV': audiocodec_box.options[4].selected = true;
        }

        if (raw_info.name.match(/DTS-?HD.?HRA/i)){
            audiocodec_box.options[10].selected = true;
        }

        //分辨率
        var standard_box = document.getElementsByName('standard_sel')[0];
        var standard_dict = {
            '4K': 1, '1080p': 2, '1080i': 3, '720p': 4, 'SD': 5, '': 0
        };
        if (standard_dict.hasOwnProperty(raw_info.standard_sel)){
            var index = standard_dict[raw_info.standard_sel];
            standard_box.options[index].selected = true;
        }

        //勾选匿名
        document.getElementsByName('uplver')[0].checked = true;
    }

    else if (forward_site == 'HDSky'){
        try{
            var browsecat = document.getElementById('browsecat');

            switch (raw_info.type){

                case '电影': browsecat.options[1].selected = true;  break;
                case '剧集': browsecat.options[6].selected = true;  break;
                case '纪录': browsecat.options[2].selected = true;  break;
                case '动漫': browsecat.options[4].selected = true;  break;
                case '综艺': browsecat.options[7].selected = true;  break;
                case '音乐': browsecat.options[8].selected = true;  break;
                case '体育': browsecat.options[9].selected = true;  break;
                case '学习': browsecat.options[11].selected = true;  break;
                case '软件': browsecat.options[11].selected = true;

            }
            if (raw_info.name.match(/(pad$|ipad)/i)){
                browsecat.options[3].selected = true;
            }

            //音频编码
            //var codec_box = document.getElementsByName('audiocodec_sel')[0]
            var audiocodec_box = document.getElementsByName('audiocodec_sel')[0];
            //alert(audiocodec_box.innerHTML)
            var audiocodec_dict = {'Flac': 7, 'APE': 8, 'DTS': 5, 'AC3': 12, 'WAV': 15, 'MP3': 9,
                                   'AAC': 11, 'DTS-HDMA': 1, 'TrueHD Atmos': 3, 'TrueHD': 4, 'LPCM': 6};
            if (audiocodec_dict.hasOwnProperty(raw_info.audiocodec_sel)){
                var index = audiocodec_dict[raw_info.audiocodec_sel];
                audiocodec_box.options[index].selected = true;
            }

            //分辨率
            var standard_box = document.getElementsByName('standard_sel')[0];
            var standard_dict = {'4K': 1, '1080p': 2, '1080i': 3, '720p': 4, 'SD': 5, '': 0 };
            if (standard_dict.hasOwnProperty(raw_info.standard_sel)){
                var index = standard_dict[raw_info.standard_sel];
                standard_box.options[index].selected = true;
            }

            //视频编码
            var codec_box = document.getElementsByName('codec_sel')[0];
            //alert(codec_box.innerHTML)
            var codec_dict = {'H264': 1, 'X265': 2, 'X264': 3, 'H265': 4, 'VC-1': 5, 'MPEG-2': 6, 'Xvid': 7, '': 8 };
            if (codec_dict.hasOwnProperty(raw_info.codec_sel)){
                var index = codec_dict[raw_info.codec_sel];
                codec_box.options[index].selected = true;
            }
            //单独对x264和x265匹配
            if (raw_info.codec_sel == 'H264'){
                if (raw_info.name.match(/X264/i)){
                    codec_box.options[3].selected = true;
                }
            }
            if (raw_info.codec_sel == 'H265'){
                if (raw_info.name.match(/X265/i)){
                    codec_box.options[2].selected = true;
                }
            }

            //媒介
            var medium_box = document.getElementsByName('medium_sel')[0];
            var medium_dict = {'UHD': 1, 'Blu-ray': 3, 'Encode': 6, 'HDTV': 7, 'WEB-DL': 12, 'Remux': 5};
            if (medium_dict.hasOwnProperty(raw_info.medium_sel)){
                var index = medium_dict[raw_info.medium_sel];
                medium_box.options[index].selected = true;
            }
            switch (raw_info.medium_sel){
                case 'UHD':
                    if (raw_info.name.match(/(diy|@)/i)) {
                        medium_box.options[2].selected = true;
                    }
                    break;
                case 'Blu-ray':
                    if (raw_info.name.match(/(diy|@)/i)) {
                        medium_box.options[4].selected = true;
                    }
            }

            //勾选匿名
            document.getElementsByName('uplver')[0].checked = true;

        } catch(err) {
            alert(err);
        }
    }

    else if (forward_site == 'CHDBits') {
        try {
            var browsecat = document.getElementById('browsecat');
            var type_dict = {
                '电影': 1,
                '剧集': 4,
                '动漫': 3,
                '综艺': 5,
                '音乐': 6,
                '纪录': 2,
                '体育': 7,
                '软件': 11,
                '学习': 12
            };
            //如果当前类型在上述字典中
            if (type_dict.hasOwnProperty(raw_info.type)) {
                var index = type_dict[raw_info.type];
                browsecat.options[index].selected = true;
            }
            //var codec_box = document.getElementsByName('audiocodec_sel')[0]
            var audiocodec_box = document.getElementsByName('audiocodec_sel')[0];
            //alert(audiocodec_box.innerHTML)
            var audiocodec_dict = {
                'Flac': 6,
                'APE': 7,
                'AC3': 2,
                'WAV': 8,
                'Atmos': 3,
                'AAC': 9,
                'DTS-HDMA': 3,
                'TrueHD Atmos': 4,
                'TrueHD': 4,
                'DTS': 1,
                'LPCM': 5,
                'DTS-HDMA:X 7.1': 2
            };
            if (audiocodec_dict.hasOwnProperty(raw_info.audiocodec_sel)) {
                var index = audiocodec_dict[raw_info.audiocodec_sel];
                audiocodec_box.options[index].selected = true;
            }
            var standard_box = document.getElementsByName('standard_sel')[0];
            var standard_dict = {
                '4K': 5,
                '1080p': 1,
                '1080i': 2,
                '720p': 3,
                'SD': 4,
                '': 4
            };
            if (standard_dict.hasOwnProperty(raw_info.standard_sel)) {
                var index = standard_dict[raw_info.standard_sel];
                standard_box.options[index].selected = true;
            }

            var codec_box = document.getElementsByName('codec_sel')[0];
            var codec_dict = { 'H264': 1, 'X265': 4, 'X264': 1, 'H265': 4, 'VC-1': 2, 'MPEG-2': 3 };
            if (codec_dict.hasOwnProperty(raw_info.codec_sel)) {
                var index = codec_dict[raw_info.codec_sel];
                codec_box.options[index].selected = true;
            }

            var medium_box = document.getElementsByName('medium_sel')[0];
            var medium_dict = { 'UHD': 2, 'Blu-ray': 1, 'Encode': 4, 'HDTV': 5, 'WEB-DL': 6, 'Remux': 3 };
            if (medium_dict.hasOwnProperty(raw_info.medium_sel)) {
                var index = medium_dict[raw_info.medium_sel];
                medium_box.options[index].selected = true;
            }
            switch (raw_info.medium_sel) {
                case 'UHD':
                    if (raw_info.name.match(/(diy|@)/i)) {
                        medium_box.options[2].selected = true;
                    }
                    break;
                case 'Blu-ray':
                    if (raw_info.name.match(/(diy|@)/i)) {
                        medium_box.options[4].selected = true;
                    }
            }

            var team_box = document.getElementsByName('processing_sel')[0];
            var team_dict = {
                '欧美': 2,
                '大陆': 7,
                '香港': 4,
                '台湾': 8,
                '日本': 3,
                '韩国': 5,
                '印度': 7
            };
            if (team_dict.hasOwnProperty(raw_info.source_sel)) {
                var index = team_dict[raw_info.source_sel];
                team_box.options[index].selected = true;
            }
                document.getElementsByName('uplver')[0].checked = true;

        } catch (err) {
            alert(err);
        }
    }

    else if (forward_site == 'LeagueHD'){
        try{
            switch (raw_info.type){
                case '电影':
                    if (raw_info.medium_sel == 'UHD') {
                        set_selected_option_by_value('browsecat', '300');
                    } else if (raw_info.medium_sel == 'Blu-ray') {
                        set_selected_option_by_value('browsecat', '401');
                    } else if (raw_info.medium_sel == 'Remux') {
                        if (raw_info.standard_sel == '4K'){
                            set_selected_option_by_value('browsecat', '420');
                        } else{
                            set_selected_option_by_value('browsecat', '415');
                        }
                    } else if (raw_info.medium_sel == 'WEB-DL') {
                        set_selected_option_by_value('browsecat', '412');
                    } else if (raw_info.medium_sel == 'HDTV') {
                        set_selected_option_by_value('browsecat', '413');
                    } else if (raw_info.medium_sel == 'DVD') {
                        set_selected_option_by_value('browsecat', '414');
                    } else {
                        if (raw_info.name.match(/pad$|ipad/i)){
                            set_selected_option_by_value('browsecat', '417');
                        } else{
                            if (raw_info.standard_sel == '4K') {
                                set_selected_option_by_value('browsecat', '301');
                            } else if (raw_info.standard_sel == '1080p') {
                                set_selected_option_by_value('browsecat', '410');
                            } else if (raw_info.standard_sel == '720p') {
                                set_selected_option_by_value('browsecat', '411');
                            }  
                        }
                    }
                    break;
                case '剧集': set_selected_option_by_value('browsecat', '402');  break;
                case '纪录': set_selected_option_by_value('browsecat', '404');  break;
                case '动漫': set_selected_option_by_value('browsecat', '405');  break;
                case '综艺': set_selected_option_by_value('browsecat', '403');  break;
                case '音乐': 
                    if (raw_info.name.match(/mv/i)){
                        set_selected_option_by_value('browsecat', '406');
                    }
                    else{
                        set_selected_option_by_value('browsecat', '408');
                    }

                    break;
                case '体育': set_selected_option_by_value('browsecat', '407'); break;
                case '学习': set_selected_option_by_value('browsecat', '421'); break;
                case '游戏': set_selected_option_by_value('browsecat', '422'); break;

                default:
                    set_selected_option_by_value('browsecat', '409');

            }
    
            var audiocodec_box = document.getElementsByName('audiocodec_sel')[0];
            var audiocodec_dict = {'Flac': 7, 'APE': 13, 'AC3': 9, 'WAV': 14, 'Atmos': 1,
                                   'AAC': 8, 'DTS-HDMA': 4, 'TrueHD Atmos': 1, 'TrueHD': 2, 'DTS': 6,
                                   'LPCM': 10, 'DTS-HDMA:X 7.1': 4, '':15};
            if (audiocodec_dict.hasOwnProperty(raw_info.audiocodec_sel)){
                var index = audiocodec_dict[raw_info.audiocodec_sel];
                audiocodec_box.options[index].selected = true;
            }
            if (raw_info.audiocodec_sel == 'DTS-HD'){
                if (raw_info.name.match(/DTS-HD.?HR/i)){
                    audiocodec_box.options[5].selected = true;
                } else if(raw_info.name.match(/DTS.?X[^\d]/i)){
                    audiocodec_box.options[3].selected = true;
                }
            }

            var standard_box = document.getElementsByName('standard_sel')[0];
            var standard_dict = {'4K': 2, '1080p': 3, '1080i': 4, '720p': 5, 'SD': 6, '': 7};
            if (standard_dict.hasOwnProperty(raw_info.standard_sel)){
                var index = standard_dict[raw_info.standard_sel];
                standard_box.options[index].selected = true;
            }
            var codec_box = document.getElementsByName('codec_sel')[0];
            //alert(codec_box.innerHTML)
            var codec_dict = {'H264': 1, 'X265': 5, 'X264': 6, 'H265': 2, 'VC-1': 3, 'MPEG-2': 4};
            if (codec_dict.hasOwnProperty(raw_info.codec_sel)){
                var index = codec_dict[raw_info.codec_sel];
                codec_box.options[index].selected = true;
            }
            if (raw_info.codec_sel == 'H264'){
                if (raw_info.name.match(/X264/i)){
                    codec_box.options[6].selected = true;
                }
            }
            if (raw_info.codec_sel == 'H265'){
                if (raw_info.name.match(/X265/i)){
                    codec_box.options[5].selected = true;
                }
            }

            var medium_box = document.getElementsByName('medium_sel')[0];
            var medium_dict = {'UHD': 1, 'Blu-ray': 2, 'Encode': 4, 'HDTV': 5, 'WEB-DL': 6, 'Remux': 3 };
            if (medium_dict.hasOwnProperty(raw_info.medium_sel)){
                var index = medium_dict[raw_info.medium_sel];
                medium_box.options[index].selected = true;
            }


            var team_box = document.getElementsByName('processing_sel')[0];
            var team_dict = {'欧美': 3, '大陆': 1, '香港': 2, '台湾': 8, '日本': 4, '韩国': 4, '': 6 };
            if (team_dict.hasOwnProperty(raw_info.source_sel)){
                var index = team_dict[raw_info.source_sel];
                team_box.options[index].selected = true;
            }     

        } catch(err){
            alert(err);
        }
    }

    else if (forward_site == 'NanYang'){
        var browsecat = document.getElementById('browsecat');
        var type_dict = {'电影': 1, '剧集': 2, '动漫': 3, '综艺': 4, '音乐': 7, '纪录': 6, 
                         '体育': 5, '软件': 9, '学习': 8, '': 11};
        //如果当前类型在上述字典中
        if (type_dict.hasOwnProperty(raw_info.type)){
            var index = type_dict[raw_info.type];
            browsecat.options[index].selected = true;
        }

        //勾选匿名
        document.getElementsByName('uplver')[0].checked = true;
    }

    else if (forward_site == 'PuTao'){
        //类型
        switch (raw_info.type){
            case '电影':
                if (raw_info.source_sel == '欧美'){
                    set_selected_option_by_value('browsecat', '402');
                } else if (['大陆', '港台', '香港', '台湾'].indexOf(raw_info.source_sel)>-1){
                    set_selected_option_by_value('browsecat', '401');
                } else if (['日本', '韩国', '日韩', '印度'].indexOf(raw_info.source_sel)>-1){
                    set_selected_option_by_value('browsecat', '403');
                }
                break;

            case '纪录': set_selected_option_by_value('browsecat', '406'); break;

            case '剧集':
                switch (raw_info.source_sel){
                    case '大陆': set_selected_option_by_value('browsecat', '409'); break;
                    case '台湾': case '香港': case '港台':
                        set_selected_option_by_value('browsecat', '407'); break;
                    case '日本': case '韩国': case '日韩': case '印度':
                        set_selected_option_by_value('browsecat', '408'); break;
                    case '欧美': set_selected_option_by_value('browsecat', '410');
                }
                break;

            case '综艺':
                switch (raw_info.source_sel){
                    case '大陆': set_selected_option_by_value('browsecat', '411'); break;
                    case '台湾': case '香港': case '港台':
                        set_selected_option_by_value('browsecat', '412');
                        break;
                    case '日本': case '韩国': case '日韩':
                        set_selected_option_by_value('browsecat', '414');
                        break;
                    case '欧美': set_selected_option_by_value('browsecat', '413');
                }
                break;

            case '动漫': set_selected_option_by_value('browsecat', '431'); break;
            //太乱，随便匹配一个
            case '音乐': set_selected_option_by_value('browsecat', '423'); break;

            case '体育': set_selected_option_by_value('browsecat', '432'); break;
            case '软件': set_selected_option_by_value('browsecat', '434'); break;
            case '学习': set_selected_option_by_value('browsecat', '435');
        }

        //视频编码, 跟馒头一样视频音频混合
        var codec_box = document.getElementsByName('codec_sel')[0];
        //alert(codec_box.innerHTML)
        var audiocodec_dict = {'Flac': 5, 'APE': 6, 'DTS': 7, 'AC3': 8, 'WAV': 9, 'MP3': 9,
                               'AAC': 9 };
        if (audiocodec_dict.hasOwnProperty(raw_info.audiocodec_sel)){
            var index = audiocodec_dict[raw_info.audiocodec_sel];
            codec_box.options[index].selected = true;
        }
        var codec_dict = {'H264': 1, 'X265': 10, 'X264': 1, 'H265': 10, 'VC-1': 2, 'MPEG-2': 4, 'Xvid': 3};
        if (codec_dict.hasOwnProperty(raw_info.codec_sel)){
            var index = codec_dict[raw_info.codec_sel];
            codec_box.options[index].selected = true;
        }

        //分辨率
        var standard_box = document.getElementsByName('standard_sel')[0];
        var standard_dict = {'4K': 6, '1080p': 1, '1080i': 2, '720p': 3, 'SD': 4, '': 5 };
        if (standard_dict.hasOwnProperty(raw_info.standard_sel)){
            var index = standard_dict[raw_info.standard_sel];
            standard_box.options[index].selected = true;
        }
    }

    else if (forward_site == 'TLFbits'){
        //类型
        var browsecat = document.getElementById('browsecat');
        var type_dict = {'电影': 1, '剧集': 2, '动漫': 3, '综艺': 4, '音乐': 6, '纪录': 4,
                         '体育': 5, '软件': 8, '学习': 9, '': 10};
        //如果当前类型在上述字典中
        if (type_dict.hasOwnProperty(raw_info.type)){
            var index = type_dict[raw_info.type];
            browsecat.options[index].selected = true;
        }

        //质量类型
        document.getElementsByName('source_sel')[0].options[2].selected = true;

        //媒介
        var medium_box = document.getElementsByName('medium_sel')[0];
        var medium_dict = {'UHD': 2, 'Blu-ray': 3, 'Encode': 1, 'HDTV': 6, 'WEB-DL': 5, 'Remux': 4, 'DVD': 7, '': 9 };
        if (medium_dict.hasOwnProperty(raw_info.medium_sel)){
            var index = medium_dict[raw_info.medium_sel];
            medium_box.options[index].selected = true;
        }

        //视频编码
        var codec_box = document.getElementsByName('codec_sel')[0];
        var codec_dict = {'H264': 1, 'X265': 2, 'X264': 1, 'H265': 2, 'VC-1': 4, 'MPEG-2': 3, 'Xvid': 5, '': 6};
        if (codec_dict.hasOwnProperty(raw_info.codec_sel)){
            var index = codec_dict[raw_info.codec_sel];
            codec_box.options[index].selected = true;
        }

        //音频编码
        var audiocodec_box = document.getElementsByName('audiocodec_sel')[0];
        //alert(audiocodec_box.innerHTML)
        var audiocodec_dict = {'Flac': 8, 'APE': 9, 'DTS': 7, 'AC3': 4, 'WAV': 10, 'MP3': 13,
                               'AAC': 11, 'DTS-HDMA': 5, 'TrueHD Atmos': 2, 'TrueHD': 3, 'LPCM': 1};
        if (audiocodec_dict.hasOwnProperty(raw_info.audiocodec_sel)){
            var index = audiocodec_dict[raw_info.audiocodec_sel];
            audiocodec_box.options[index].selected = true;
        }

        //分辨率
        var standard_box = document.getElementsByName('standard_sel')[0];
        var standard_dict = {'4K': 6, '1080p': 4, '1080i': 3, '720p': 2, 'SD': 1, '': 7 };
        if (standard_dict.hasOwnProperty(raw_info.standard_sel)){
            var index = standard_dict[raw_info.standard_sel];
            standard_box.options[index].selected = true;
        }

        //地区
        var processing_box = document.getElementsByName('processing_sel')[0];
        var processing_dict = {'欧美': 5, '大陆': 1, '香港': 2, '台湾': 2, '日本': 3, '韩国': 4, '': 6 };
        if (processing_dict.hasOwnProperty(raw_info.source_sel)){
            var index = processing_dict[raw_info.source_sel];
            processing_box.options[index].selected = true;
        }

        //选择其他组
        document.getElementsByName('team_sel')[0].options[4].selected = true;
        //勾选匿名
        document.getElementsByName('uplver')[0].checked = true;
    }

    else if (forward_site == 'HDDolby'){
        //类型
        var browsecat = document.getElementById('browsecat');
        var type_dict = {'电影': 1, '剧集': 2, '动漫': 4, '综艺': 5, '音乐': 8, '纪录': 3,
                         '体育': 7, '软件': 8, '学习': 10, '': 11};
        //如果当前类型在上述字典中
        if (type_dict.hasOwnProperty(raw_info.type)){
            var index = type_dict[raw_info.type];
            browsecat.options[index].selected = true;
        }
            if (raw_info.name.match(/-HDSPad/i)){
                 browsecat.options[1].selected = true;
            }

        //媒介
        var medium_box = document.getElementsByName('medium_sel')[0];
        switch(raw_info.medium_sel){
            case 'UHD': medium_box.options[1].selected = true; break;
            case 'Blu-ray': medium_box.options[2].selected = true; break;
            case 'DVD': medium_box.options[8].selected = true; break;
            case 'Remux': medium_box.options[3].selected = true; break;
            case 'HDTV': medium_box.options[5].selected = true; break;
            case 'WEB-DL':
                if (raw_info.name.match(/webrip/i)){
                    medium_box.options[7].selected = true;
                } else {
                    medium_box.options[6].selected = true;
                }
                break;
            case 'Encode': medium_box.options[10].selected = true; break;
            default: medium_box.options[11].selected = true; break;
        }

        //视频编码和音频混合了
        var codec_box = document.getElementsByName('codec_sel')[0];

        var audiocodec_dict = {'Flac': 7, 'APE': 8};
        if (audiocodec_dict.hasOwnProperty(raw_info.audiocodec_sel)){
            var index = audiocodec_dict[raw_info.audiocodec_sel];
            codec_box.options[index].selected = true;
        }

        var codec_dict = {'H264': 1, 'X265': 4, 'X264': 3, 'H265': 2, 'VC-1': 5, 'MPEG-2': 6, 'Xvid': 5, '': 6};
        if (codec_dict.hasOwnProperty(raw_info.codec_sel)){
            var index = codec_dict[raw_info.codec_sel];
            codec_box.options[index].selected = true;
        }

        //分辨率
        var standard_box = document.getElementsByName('standard_sel')[0];
        var standard_dict = {'4K': 1, '1080p': 2, '1080i': 3, '720p': 4, 'SD': 5, '': 5 };
        if (standard_dict.hasOwnProperty(raw_info.standard_sel)){
            var index = standard_dict[raw_info.standard_sel];
            standard_box.options[index].selected = true;
        }

        //勾选匿名
        //document.getElementsByName('uplver')[0].checked = true;
    }

    else if (forward_site == 'Moecat'){
        var browsecat = document.getElementById('browsecat');
        var type_dict = {'电影': 1, '剧集': 3, '动漫': 5, '综艺': 4, '音乐': 7, '纪录': 6,
                         '体育': 9, '软件': 8, '学习': 11, '': 12};
        //如果当前类型在上述字典中
        if (type_dict.hasOwnProperty(raw_info.type)){
            var index = type_dict[raw_info.type];
            browsecat.options[index].selected = true;
        }

        secondtype();
        notechange();

        //编码
        var codec_box = document.getElementsByName('codec_sel')[0];
        var codec_dict = {'H264': 1, 'X265': 5, 'X264': 1, 'H265': 5, 'VC-1': 3, 'MPEG-2': 4, 'Xvid': 6, '': 7};
        if (codec_dict.hasOwnProperty(raw_info.codec_sel)){
            var index = codec_dict[raw_info.codec_sel];
            codec_box.options[index].selected = true;
        }

        //地区
        var source_box = document.getElementById('idsource_sel');

        var source_dict = {'欧美': 3, '大陆': 1, '香港': 2, '台湾': 2, '日本': 4, '韩国': 4, '': 5 };
        if (source_dict.hasOwnProperty(raw_info.source_sel)){
            var index = source_dict[raw_info.source_sel];
            source_box.options[index].selected = true;
        }

        //分辨率
        var standard_box = document.getElementById('idstandard_sel');
        var standard_dict = {'4K': 4, '1080p': 1, '1080i': 1, '720p': 2, 'SD': 3, '': 7 };
        if (standard_dict.hasOwnProperty(raw_info.standard_sel)){
            var index = standard_dict[raw_info.standard_sel];
            standard_box.options[index].selected = true;
        }

        //勾选匿名
        document.getElementsByName('uplver')[0].checked = true;
    }

    else if (forward_site == 'HDstreet'){
        //type
        switch (raw_info.type){
            case '电影':
                if (['大陆', '港台', '台湾', '香港'].indexOf(raw_info.source_sel)>-1){
                    set_selected_option_by_value('browsecat', '401');
                } else {
                    set_selected_option_by_value('browsecat', '403');
                }
                break;
            case '剧集':
                if (['大陆', '港台', '台湾', '香港'].indexOf(raw_info.source_sel)>-1){
                    set_selected_option_by_value('browsecat', '402');
                } else {
                    set_selected_option_by_value('browsecat', '404');
                }
                break;
            case '动漫':
                if (['大陆', '港台', '台湾', '香港'].indexOf(raw_info.source_sel)>-1){
                    set_selected_option_by_value('browsecat', '408');
                } else {
                    set_selected_option_by_value('browsecat', '411');
                }
                break;
            case '综艺':
                if (['大陆', '港台', '台湾', '香港'].indexOf(raw_info.source_sel)>-1){
                    set_selected_option_by_value('browsecat', '406');
                } else {
                    set_selected_option_by_value('browsecat', '405');
                }
                break;
            case '音乐':
                if (['大陆', '港台', '台湾', '香港'].indexOf(raw_info.source_sel)>-1){
                    set_selected_option_by_value('browsecat', '409');
                } else {
                    set_selected_option_by_value('browsecat', '412');
                }
                break;
            case '纪录':
                if (['大陆', '港台', '台湾', '香港'].indexOf(raw_info.source_sel)>-1){
                    set_selected_option_by_value('browsecat', '407');
                } else {
                    set_selected_option_by_value('browsecat', '413');
                }
        }

        secondtype();
        notechange();

        //地区——新家坡什么的少数，自己勾选
        var source_box = document.getElementById('idsource_sel');
        var source_dict = {'欧美': 5, '大陆': 1, '香港': 2, '台湾': 3, '日本': 6, '韩国': 6, '印度':'8'};
        if (source_dict.hasOwnProperty(raw_info.source_sel)){
            var index = source_dict[raw_info.source_sel];
            source_box.options[index].selected = true;
        }

        //分辨率
        var standard_box = document.getElementById('idstandard_sel');
        var standard_dict = {'4K': 1, '1080p': 2, '1080i': 4, '720p': 3, 'SD': 6};
        if (standard_dict.hasOwnProperty(raw_info.standard_sel)){
            var index = standard_dict[raw_info.standard_sel];
            standard_box.options[index].selected = true;
        }

        //勾选匿名
        // document.getElementsByName('uplver')[0].checked = true;
    }

    //高清视界
    else if (forward_site == 'HDArea'){
        try{
            //类型
            switch (raw_info.type){
                case '电影':
                    if (raw_info.medium_sel == 'UHD') {
                        set_selected_option_by_value('browsecat', '300');
                    } else if (raw_info.medium_sel == 'Blu-ray') {
                        set_selected_option_by_value('browsecat', '401');
                    } else if (raw_info.medium_sel == 'Remux') {
                        set_selected_option_by_value('browsecat', '415');
                    } else if (raw_info.medium_sel == 'WEB-DL') {
                        set_selected_option_by_value('browsecat', '412');
                    } else if (raw_info.medium_sel == 'HDTV') {
                        set_selected_option_by_value('browsecat', '413');
                    } else if (raw_info.medium_sel == 'DVD') {
                        set_selected_option_by_value('browsecat', '414');
                    } else {
                        if (raw_info.name.match(/pad$|ipad/i)){
                            set_selected_option_by_value('browsecat', '417');
                        } else{
                            if (raw_info.standard_sel == '4K') {
                                set_selected_option_by_value('browsecat', '300');
                            } else if (raw_info.standard_sel == '1080p') {
                                set_selected_option_by_value('browsecat', '410');
                            } else if (raw_info.standard_sel == '720p') {
                                set_selected_option_by_value('browsecat', '411');
                            }
                        }
                    }
                    break;
                case '剧集': set_selected_option_by_value('browsecat', '402');  break;
                case '纪录': set_selected_option_by_value('browsecat', '404');  break;
                case '动漫': set_selected_option_by_value('browsecat', '405');  break;
                case '综艺': set_selected_option_by_value('browsecat', '403');  break;
                case '音乐':
                    if (raw_info.name.match(/mv/i)){
                        set_selected_option_by_value('browsecat', '406');
                    }
                    else{
                        set_selected_option_by_value('browsecat', '408');
                    }

                    break;
                case '体育': set_selected_option_by_value('browsecat', '407'); break;

                default:
                    set_selected_option_by_value('browsecat', '409');
            }

            //媒介
            var medium_box = document.getElementsByName('medium_sel')[0];
            switch(raw_info.medium_sel){
                case 'UHD': medium_box.options[1].selected = true; break;
                case 'Blu-ray': medium_box.options[1].selected = true; break;
                case 'Remux': medium_box.options[2].selected = true; break;
                case 'Encode': medium_box.options[3].selected = true; break;
                case 'HDTV': medium_box.options[6].selected = true; break;
                case 'WEB-DL': medium_box.options[4].selected = true; break;
                case 'DVD': medium_box.options[8].selected = true;
            }
            if (raw_info.name.match(/MiniBD/i)){
                medium_box.options[5].selected = true;
            }

            //视频编码
            var codec_box = document.getElementsByName('codec_sel')[0];
            codec_box.options[6].selected = true;
            switch (raw_info.codec_sel){
                case 'H264': case 'MPEG-4': codec_box.options[2].selected = true; break;
                case 'H265': case 'X265': codec_box.options[3].selected = true; break;
                case 'VC-1': codec_box.options[6].selected = true; break;
                case 'MPEG-2': codec_box.options[4].selected = true; break;
                case 'X264': codec_box.options[1].selected = true; break;
                case 'XVID': codec_box.options[5].selected = true;
            }
            //单独对x264匹配
            if (raw_info.codec_sel == 'H264'){
                if (raw_info.name.match(/X264/i)){
                    codec_box.options[1].selected = true;
                }
            }

            //音频编码
            var audiocodec_box = document.getElementsByName('audiocodec_sel')[0];
            var audiocodec_dict = { 'AAC': 1, 'AC3': 2, 'TrueHD': 3,
                                    'DTS': 4, 'DTS-HD': 5, 'DTS-HDMA': 5, 'DTS-HDMA:X 7.1': 5,
                                    'LPCM': 6, 'WAV': 7, 'APE': 8, 'Flac': 9, 'Atmos': 10, 'TrueHD Atmos': 10};
            if (audiocodec_dict.hasOwnProperty(raw_info.audiocodec_sel)){
                var index = audiocodec_dict[raw_info.audiocodec_sel];
                audiocodec_box.options[index].selected = true;
            }
            if (raw_info.audiocodec_sel == 'AC3'){
                if (raw_info.name.match(/DD.?2.0/i)){
                    audiocodec_box.options[11].selected = true;
                }
            }

            //分辨率
            var standard_box = document.getElementsByName('standard_sel')[0];
            var standard_dict = {'4K': 5, '1080p': 2, '1080i': 4, '720p': 1, 'SD': 3};
            if (standard_dict.hasOwnProperty(raw_info.standard_sel)){
                var index = standard_dict[raw_info.standard_sel];
                standard_box.options[index].selected = true;
            }

            //勾选匿名
            document.getElementsByName('uplver')[0].checked = true;

        } catch(err){
            alert(err);
        }
    }

    //学校
    else if (forward_site == 'BTSchool'){
        //类型
        var browsecat = document.getElementById('browsecat');
        var type_dict = {'电影': 1, '剧集': 2, '动漫': 3, '纪录': 4, '综艺': 5, '软件': 6,
                         '学习': 7, '游戏': 8, '音乐': 9, '体育': 10, '': 11};
        //如果当前类型在上述字典中
        if (type_dict.hasOwnProperty(raw_info.type)){
            var index = type_dict[raw_info.type];
            browsecat.options[index].selected = true;
        }

        //媒介
        var medium_box = document.getElementsByName('medium_sel')[0];
        switch(raw_info.medium_sel){
            case 'UHD': medium_box.options[2].selected = true; break;
            case 'Blu-ray': medium_box.options[1].selected = true; break;
            case 'DVD': medium_box.options[7].selected = true; break;
            case 'Remux': medium_box.options[5].selected = true; break;
            case 'HDTV': medium_box.options[6].selected = true; break;
            case 'WEB-DL': medium_box.options[4].selected = true; break;
            case 'Encode': medium_box.options[3].selected = true; break;
            default: medium_box.options[9].selected = true;
        }

        //视频编码
        var codec_box = document.getElementsByName('codec_sel')[0];
        codec_box.options[6].selected = true;
        switch (raw_info.codec_sel){
            case 'H264': case 'MPEG-4': case 'X264': codec_box.options[1].selected = true; break;
            case 'H265': case 'X265': codec_box.options[2].selected = true; break;
            case 'VC-1': codec_box.options[4].selected = true; break;
            case 'MPEG-2': codec_box.options[3].selected = true; break;
            case 'XVID': codec_box.options[5].selected = true;
        }

        //音频编码
        var audiocodec_box = document.getElementsByName('audiocodec_sel')[0];
        var audiocodec_dict = { 'TrueHD': 1, 'Atmos': 1, 'TrueHD Atmos': 1,
                                'DTS': 2, 'DTS-HD': 2, 'DTS-HDMA': 2, 'DTS-HDMA:X 7.1': 2,
                                'AC3': 3, 'LPCM': 4, 'Flac': 5, 'MP3': 6, 'AAC': 7, 'APE': 8, '': 9 };
        if (audiocodec_dict.hasOwnProperty(raw_info.audiocodec_sel)){
            var index = audiocodec_dict[raw_info.audiocodec_sel];
            audiocodec_box.options[index].selected = true;
        }

        //分辨率
        var standard_box = document.getElementsByName('standard_sel')[0];
        var standard_dict = {'4K': 1, '1080p': 2, '1080i': 2, '720p': 3, 'SD': 4, '': 5 };
        if (standard_dict.hasOwnProperty(raw_info.standard_sel)){
            var index = standard_dict[raw_info.standard_sel];
            standard_box.options[index].selected = true;
        }

        //勾选匿名
        document.getElementsByName('uplver')[0].checked = true;
    }

    //-------------------------------------------勾选国语粤语中字等标签--------------------------------------------------------
    var labels = raw_info.small_descr.get_label();
    if (!labels.zz){
        //简单使用简介匹配一下中字
        if (raw_info.descr.match(/(Text.*?#\d+[\s\S]*?Chinese|subtitles.*chs)/i)){
            labels.zz = true;
        }
    }
    if (!labels.gy){
        if (raw_info.descr.match(/(Audio.*Chinese|mandarin)/i)){
            labels.gy = true;
        }
    }
    if (!labels.yy){
        if (raw_info.descr.match(/cantonese/i)){
            labels.yy = true;
        }
    }

    switch (forward_site){
        case 'PTer':
            if (labels.gy){ document.getElementById('guoyu').checked=true; }
            if (labels.yy){ document.getElementById('yueyu').checked=true; }
            if (labels.zz){ document.getElementById('zhongzi').checked=true; }
            break;
        case 'CHDBits':
            if (labels.gy){ document.getElementsByName('cnlang')[0].checked=true; }
            if (labels.zz){ document.getElementsByName('cnsub')[0].checked=true; }
            if (labels.diy){ document.getElementsByName('diy')[0].checked=true; }
            break;
        case 'OurBits':
            if (labels.gy){ document.getElementById('tagGY').checked=true; }
            if (labels.yy){ document.getElementById('tagGY').checked=true; }
            if (labels.zz){ document.getElementById('tagZZ').checked=true; }
            break;
        case 'MTeam':
            if (labels.gy){ document.getElementById('l_dub').checked=true; }
            if (labels.yy){ document.getElementById('l_dub').checked=true; }
            if (labels.zz){ document.getElementById('l_sub').checked=true; }
            break;
        case 'HDSky':
            if (labels.gy){ document.getElementsByName('option_sel[]')[4].checked=true; }
            if (labels.yy){ document.getElementsByName('option_sel[]')[5].checked=true; }
            if (labels.zz){ document.getElementsByName('option_sel[]')[6].checked=true; }
            break;
        case 'PThome':
            if (labels.gy){ document.getElementsByName('tags[]')[1].checked=true; }
            if (labels.yy){ document.getElementsByName('tags[]')[2].checked=true; }
            if (labels.zz){ document.getElementsByName('tags[]')[4].checked=true; }
            break;
        case 'HDDolby':
            if (labels.gy){ document.getElementsByName('tags[]')[1].checked=true; }
            if (labels.yy){ document.getElementsByName('tags[]')[2].checked=true; }
            if (labels.zz){ document.getElementsByName('tags[]')[4].checked=true; }
            break;
        case 'Moecat':
            if (labels.gy){ document.getElementsByName('tags[]')[4].checked=true; }
            if (labels.yy){ document.getElementsByName('tags[]')[4].checked=true; }
            if (labels.zz){ document.getElementsByName('tags[]')[5].checked=true; }
            break;
        case 'LeagueHD':
            if (labels.gy){ document.getElementsByName('tag_gy')[0].checked=true; }
            if (labels.yy){ document.getElementsByName('tag_yy')[0].checked=true; }
            if (labels.zz){ document.getElementsByName('tag_zz')[0].checked=true; }
    }

    //---------------------------------------干掉选择种子后主标题变化的bug------------------------------------------
    var torrent_box = document.getElementById("torrent");
    if (forward_site == 'CHDBits') {
        torrent_box.parentNode.innerHTML = '<input type="file" class="file" id="torrent" name="torrentfile" accept=".torrent">';
    } else {
        torrent_box.parentNode.innerHTML = '<input type="file" class="file" id="torrent" name="file" accept=".torrent">';        
    }
}

/*
说明：
    由于之前使用的一键转载脚本不易维护和扩展，所以加入个人理解开发此版本。版本号去除日期归为定为：aoto_feed_vX.X;
    使用脚本大体思路与之前的版本如出一辙，国外站点获取数据流程上做了一些优化。
    混合使用了JavaScript和jQuery。jQuery在部分站点会有不如意的bug，所以可能后期还会调整。
    
    国内源站点框架基本一致，所以在作为源站点的时候数据获取基本问题不大。

    发布站点可以自己扩展，模板参照：馒头、猫站、春天、听歌、瓷器、我堡； 
    定位页面元素的时候使用了$符号的便是jQuery。

日志：
    版本 v1.0
    20200417：新增支持外站PHD和avz作为源站点; 
    20200420：新增馒头、猫站、春天、听歌、瓷器、我堡发布页面填写匹配 (by tomorrow505)
    20200422：新增pthome、hdhome发布页面填写匹配; 修复我堡部分bug (by tomorrow505)
              新增天空、岛、联盟发布页面匹配 (by hollips)
    
    版本 v1.1
    20200424：新增MTV作为源站点 (by tomorrow505) 
    20200425：新增一键打开常用站点的功能，需要设置common_sites (by tomorrow505)
    20200427：修复CMCT新种子页面mediainfo信息异步加载获取不到的bug (by tomorrow505)
              添加ptgen跳转，主要是为了方便外站查询信息 (by tomorrow505)
    
    版本 v1.2
    20200429：修改获取豆瓣信息的代码，使用promise进行链式简化 (by tomorrow505)
              从副标题匹配是否包含国语粤语中字等信息并勾选标签 (by tomorrow505)
              修复league(柠檬)分类更新导致错误分类的bug (by tomorrow505)
              修复hdt有多个重复发布的资源获取类别错误的bug (by tomorrow505)
    20200430：新增支持南洋、葡萄、TLF、杜比发布页填写匹配 (by tomorrow505)
              完善官种感谢机制，在reg_team_name补充官方小组后缀名即可 (by tomorrow505)
    20200501：修复插入节点不在常规位置的bug;修复cmct因为图片元素节点更名获取不到图片的bug (by tomorrow505)
              修复hdt部分bug; 修复豆瓣获取button部分bug (by tomorrow505)
              新增：瓷器没有豆瓣信息插入获取豆瓣获取button (by tomorrow505)
              萌猫——匹配一部分，因为是二级勾选，然后比较繁琐, 有两项需要手动……
    版本 v1.3
    20200503：感谢群友,修复一堆不知名bug。 (by tomorrow505)
              由于cmct获取新版页面豆瓣信息时部分群友会有莫名bug, 此版本进行修复。 (by tomorrow505)
    20200505：高清街匹配一部分，二级勾选没有完全匹配上，可以自由发挥…… (by tomorrow505)
              春天新的发布界面进行修复——自动化程度打一定折扣，部分内容需要自行判断。 (by tomorrow505)
              HDArea和学校适配发布页选项 (by PatrickCao)
    20200512：修复TTG转出字体颜色及下划线消失的bug (by tomorrow505)

    20200531: 修复TTG官种wiki转出图片未加载的bug. (by tomorrow505)
              修复猫站转出带站点转出链接提示的bug. (by tomorrow505)
              增加北洋作为源站点的部分修复。

总结：
    当前支持的源站点：国内大部分；国外(HDT、PHD、AVZ、MTV)
    当前匹配发布站点：馒头、猫站、春天、听歌、瓷器、我堡、pthome、hdhome、天空、岛、柠檬、南洋、葡萄、TLF、杜比
*/

