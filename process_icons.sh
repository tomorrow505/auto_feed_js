#!/bin/bash

# 创建临时目录
mkdir -p temp_icons
touch icon_base64.txt

echo "const site_img_info_base64 = {" >> icon_base64.txt
# 下载并处理图标
process_icon() {
    site=$1
    url=$2
    wget -O "temp_icons/${site}.ico" "$url"
    magick "temp_icons/${site}.ico" -coalesce  -resize 16x16 -depth 8 -dither FloydSteinberg "temp_icons/${site}_resized.png"

    if [ -e "temp_icons/${site}_resized-0.png" ]; then
        base64_icon=$(base64 -i "temp_icons/${site}_resized-0.png" | tr -d '\n')
    else
        base64_icon=$(base64 -i "temp_icons/${site}_resized.png" | tr -d '\n')
	fi
    echo "    '$site': 'data:image/png;base64,$base64_icon'," >> icon_base64.txt
}

# 处理每个图标
# duckduckgo 是可靠数据源
process_icon	"1PTBA"				"https://external-content.duckduckgo.com/ip3/1ptba.com.ico"
process_icon	"52PT"				"https://external-content.duckduckgo.com/ip3/52pt.site.ico"
process_icon	"ACM"				"https://external-content.duckduckgo.com/ip3/eiga.moi.ico"
process_icon	"ANT"				"https://external-content.duckduckgo.com/ip3/anthelion.me.ico"
process_icon	"Audiences"			"https://external-content.duckduckgo.com/ip3/audiences.me.ico"
process_icon	"BHD"				"https://external-content.duckduckgo.com/ip3/beyond-hd.me.ico"
process_icon	"Aither"			"https://external-content.duckduckgo.com/ip3/aither.cc.ico"
process_icon	"BLU"				"https://external-content.duckduckgo.com/ip3/blutopia.cc.ico"
process_icon	"BTN"				"https://external-content.duckduckgo.com/ip3/broadcasthe.net.ico"
process_icon	"CarPt"				"https://external-content.duckduckgo.com/ip3/carpt.net.ico"
process_icon	"CMCT"				"https://external-content.duckduckgo.com/ip3/springsunday.net.ico"
process_icon	"CHDBits"			"https://external-content.duckduckgo.com/ip3/ptchdbits.co.ico"
process_icon	"DiscFan"			"https://external-content.duckduckgo.com/ip3/discfan.net.ico"
process_icon	"Dragon"			"https://external-content.duckduckgo.com/ip3/www.dragonhd.xyz.ico"
process_icon	"FreeFarm"			"https://external-content.duckduckgo.com/ip3/pt.0ff.cc.ico"
process_icon	"GPW"				"https://external-content.duckduckgo.com/ip3/greatposterwall.com.ico"
process_icon	"HaresClub"			"https://external-content.duckduckgo.com/ip3/club.hares.top.ico"
process_icon	"HD4FANS"			"https://external-content.duckduckgo.com/ip3/pt.hd4fans.org.ico"
process_icon	"HDAtmos"			"https://external-content.duckduckgo.com/ip3/hdatmos.club.ico"
process_icon	"HDB"				"https://external-content.duckduckgo.com/ip3/hdbits.org.ico"
process_icon	"HDCity"			"https://external-content.duckduckgo.com/ip3/hdcity.city.ico"
process_icon	"HDF"				"https://external-content.duckduckgo.com/ip3/hdf.world.ico"
process_icon	"HDPost"			"https://external-content.duckduckgo.com/ip3/pt.hdpost.top.ico"
process_icon	"DarkLand"			"https://external-content.duckduckgo.com/ip3/darkland.top.ico"
process_icon	"HDSky"				"https://external-content.duckduckgo.com/ip3/hdsky.me.ico"
process_icon	"HDSpace"			"https://external-content.duckduckgo.com/ip3/hd-space.org.ico"
process_icon	"HDTime"			"https://external-content.duckduckgo.com/ip3/hdtime.org.ico"
process_icon	"HDU"				"https://external-content.duckduckgo.com/ip3/pt.hdupt.com.ico"
process_icon	"HDVideo"			"https://external-content.duckduckgo.com/ip3/hdvideo.one.ico"
process_icon	"HITPT"				"https://external-content.duckduckgo.com/ip3/www.hitpt.com.ico"
process_icon	"iTS"				"https://external-content.duckduckgo.com/ip3/shadowthein.net.ico"
process_icon	"KG"				"https://external-content.duckduckgo.com/ip3/karagarga.in.ico"
process_icon	"MTV"				"https://external-content.duckduckgo.com/ip3/www.morethantv.me.ico"
process_icon	"NBL"				"https://external-content.duckduckgo.com/ip3/nebulance.io.ico"
process_icon	"OpenCD"			"https://external-content.duckduckgo.com/ip3/open.cd.ico"
process_icon	"OPS"				"https://external-content.duckduckgo.com/ip3/orpheus.network.ico"
process_icon	"PigGo"				"https://external-content.duckduckgo.com/ip3/piggo.me.ico"
process_icon	"PTCafe"			"https://external-content.duckduckgo.com/ip3/ptcafe.club.ico"
process_icon	"PTChina"			"https://external-content.duckduckgo.com/ip3/ptchina.org.ico"
process_icon	"PThome"			"https://external-content.duckduckgo.com/ip3/www.pthome.net.ico"
process_icon	"PTP"				"https://external-content.duckduckgo.com/ip3/passthepopcorn.me.ico"
process_icon	"PTsbao"			"https://external-content.duckduckgo.com/ip3/ptsbao.club.ico"
process_icon	"PTT"				"https://external-content.duckduckgo.com/ip3/www.pttime.org.ico"
process_icon	"PuTao"				"https://external-content.duckduckgo.com/ip3/pt.sjtu.edu.cn.ico"
process_icon	"RED"				"https://external-content.duckduckgo.com/ip3/redacted.ch.ico"
process_icon	"SC"				"https://external-content.duckduckgo.com/ip3/secret-cinema.pw.ico"
process_icon	"SoulVoice"			"https://external-content.duckduckgo.com/ip3/pt.soulvoice.club.ico"
process_icon	"TCCF"				"https://external-content.duckduckgo.com/ip3/et8.org.ico"
process_icon	"Tik"				"https://external-content.duckduckgo.com/ip3/cinematik.net.ico"
process_icon	"TTG"				"https://external-content.duckduckgo.com/ip3/totheglory.im.ico"
process_icon	"UHD"				"https://external-content.duckduckgo.com/ip3/uhdbits.org.ico"
process_icon	"UltraHD"			"https://external-content.duckduckgo.com/ip3/ultrahd.net.ico"
process_icon	"WT-Sakura"			"https://external-content.duckduckgo.com/ip3/wintersakura.net.ico"
process_icon	"xthor"				"https://external-content.duckduckgo.com/ip3/xthor.tk.ico"
process_icon	"ITZMX"				"https://external-content.duckduckgo.com/ip3/pt.itzmx.com.ico"
process_icon	"HDPt"				"https://external-content.duckduckgo.com/ip3/hdpt.xyz.ico"
process_icon	"JPTV"				"https://external-content.duckduckgo.com/ip3/jptv.club.ico"
process_icon	"Monika"			"https://external-content.duckduckgo.com/ip3/monikadesign.uk.ico"
process_icon	"ZMPT"				"https://external-content.duckduckgo.com/ip3/zmpt.cc.ico"
process_icon	"红叶"				"https://external-content.duckduckgo.com/ip3/leaves.red.ico"
process_icon	"ICC"				"https://external-content.duckduckgo.com/ip3/www.icc2022.com.ico"
process_icon	"CyanBug"			"https://external-content.duckduckgo.com/ip3/cyanbug.net.ico"
process_icon	"海棠"				"https://external-content.duckduckgo.com/ip3/www.htpt.cc.ico"
process_icon	"杏林"				"https://external-content.duckduckgo.com/ip3/xingtan.one.ico"
process_icon	"SRVFI"				"https://external-content.duckduckgo.com/ip3/srvfi.top.ico"
process_icon	"UBits"				"https://external-content.duckduckgo.com/ip3/ubits.club.ico"
process_icon	"OKPT"				"https://external-content.duckduckgo.com/ip3/www.okpt.net.ico"
process_icon	"GGPT"				"https://external-content.duckduckgo.com/ip3/www.gamegamept.com.ico"
process_icon	"KuFei"				"https://external-content.duckduckgo.com/ip3/kufei.org.ico"
process_icon	"RouSi"				"https://external-content.duckduckgo.com/ip3/rousi.zip.ico"
process_icon	"悟空"				"https://external-content.duckduckgo.com/ip3/wukongwendao.top.ico"
process_icon	"GTK"				"https://external-content.duckduckgo.com/ip3/pt.gtk.pw.ico"
process_icon	"麒麟"				"https://external-content.duckduckgo.com/ip3/www.hdkyl.in.ico"
process_icon	"AGSV"				"https://external-content.duckduckgo.com/ip3/www.agsvpt.com.ico"
process_icon	"iloli"				"https://external-content.duckduckgo.com/ip3/share.ilolicon.com.ico"
process_icon	"CrabPt"			"https://external-content.duckduckgo.com/ip3/crabpt.vip.ico"
process_icon	"QingWa"			"https://external-content.duckduckgo.com/ip3/qingwapt.com.ico"
process_icon	"FNP"				"https://external-content.duckduckgo.com/ip3/fearnopeer.com.ico"
process_icon	"OnlyEncodes"		"https://external-content.duckduckgo.com/ip3/onlyencodes.cc.ico"
process_icon	"ToSky"				"https://external-content.duckduckgo.com/ip3/t.tosky.club.ico"
process_icon	"PTFans"			"https://external-content.duckduckgo.com/ip3/ptfans.cc.ico"

# archive 是可靠数据源
process_icon	"YDY"				"https://web.archive.org/web/20230709174452if_/https://pt.hdbd.us/favicon.ico"
process_icon	"2xFree"			"https://web.archive.org//web/20230202135311im_/https://pt.2xfree.org/favicon.ico"
process_icon	"HD-Only"			"https://web.archive.org/web/20240903065630if_/https://hd-only.org/favicon.ico"
process_icon	"HDMaYi"			"https://web.archive.org//web/20230819031241im_/https://hdmayi.com/favicon.ico"
process_icon	"HDZone"			"https://web.archive.org/web/20230719132450im_/http://hdfun.me/favicon.ico"

# 网站无法访问, 待替换
process_icon	"ECUST"				"https://web.archive.org/web/20240903072619if_/https://img.airl.cc/i/2024/09/03/p88thr.webp"
process_icon	"KIMOJI"			"https://web.archive.org/web/20240903072758if_/https://img.airl.cc/i/2024/09/03/p9ccd7.webp"
process_icon	"NPUPT"				"https://web.archive.org/web/20240903072838if_/https://img.airl.cc/i/2024/09/03/p9tmdu.webp"
process_icon	"RS"				"https://wsrv.nl/?url=https://emoji.aranja.com/static/emoji-data/img-apple-160/2603-fe0f.png"
# wsrv 是可靠数据源
process_icon	"CG"				"https://wsrv.nl/?url=http://cinemageddon.net/favicon.ico"
process_icon	"HDfans"			"https://wsrv.nl/?url=http://hdfans.org/favicon.ico"
process_icon	"Oshen"				"https://wsrv.nl/?url=http://www.oshen.win/favicon.ico"
process_icon	"TLFbits"			"https://wsrv.nl/?url=http://pt.eastgame.org/favicon.ico"
process_icon	"TVV"				"https://wsrv.nl/?url=http://tv-vault.me/favicon.ico"

# 官方数据源, 但小心网站宕机将无法访问
process_icon	"JoyHD"				"https://www.joyhd.net/favicon.ico"
process_icon	"HHClub"			"https://hhanclub.top/favicon.ico"
process_icon	"NanYang"			"https://nanyangpt.com/favicon.ico"
process_icon	"HDT"				"https://hd-torrents.org/favicon.ico"
process_icon	"ZHUQUE"			"https://zhuque.in/assets/images/512.png"
process_icon	"影"				"https://star-space.net/favicon.ico"

# 待替换为可靠数据源
process_icon	"PTer"				"https://pterclub.com/favicon.ico"
process_icon	"avz"				"https://img.pterclub.com/images/2022/04/24/favicon.png"
process_icon	"BYR"				"https://img.pterclub.com/images/2021/09/07/byr.jpg"
process_icon	"BTSchool"			"https://img.pterclub.com/images/2020/05/05/bts.png"
process_icon	"CNZ"				"https://img.pterclub.com/images/2022/04/24/cnz.png"
process_icon	"HDArea"			"https://img.pterclub.com/images/2020/04/21/hdafavicon.png"
process_icon	"HDChina"			"https://img.pterclub.com/images/2020/04/21/hdcfavicon.png"
process_icon	"HDHome"			"https://img.pterclub.com/images/2020/04/21/hdhfavicon.png"
process_icon	"HUDBT"				"https://img.pterclub.com/images/2020/07/15/favicon.png"
process_icon	"OurBits"			"https://img.pterclub.com/images/2022/02/19/favicon.png"
process_icon	"PHD"				"https://img.pterclub.com/images/2022/04/24/phd.png"
process_icon	"TJUPT"				"https://img.pterclub.com/images/2020/04/21/hdhfavicon.png"

process_icon	"DaJiao"			"https://www.z4a.net/images/2023/11/20/35c0bb255890b394e4ce76f5718ef1a4.png"
process_icon	"HaiDan"			"https://www.haidan.video/public/pic/favicon.ico"
process_icon	"HDDolby"			"https://s1.ax1x.com/2020/09/27/0A8NNV.png"
process_icon	"HDRoute"			"https://s1.ax1x.com/2020/09/27/0A8UhT.png"
process_icon	"MTeam"				"https://i.endpot.com/image/4BLSA/favicon.jpg"
process_icon	"YemaPT"			"https://www.z4a.net/images/2024/05/21/yemapt.png"
process_icon	"Panda"				"https://i.ibb.co/K9bkd8M/favicon.png"
process_icon	"象岛"				"https://img.picgo.net/2023/10/04/ptvicomo0b533c8e4626fe8f.png"

# 结束图标数据
echo '}' >> icon_base64.txt

cat icon_base64.txt >> auto_feed.user.js

# 清理临时文件
rm icon_base64.txt
rm -r temp_icons

echo "图标数据已更新到 auto_feed.user.js"