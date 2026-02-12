/** Consolidated Logic for: YemaPT **/

// --- From Module: 11_download_clients.js (Snippet 1) ---
else if (forward_site == 'YemaPT') {
    $('#fileList').wait(function () {
      ant_form_instance?.context?.setFieldsValue({ 'fileList': [...container.files].map(f => { f.originFileObj = f; return f }) }); //files要转为数组，并且添加originFileObj属性为自身
    });
  }

// --- From Module: 14_origin_site_parsing1.js (Snippet 2) ---
else if (origin_site == 'YemaPT') {
  delete Array.prototype.remove;
}

// --- From Module: 17_forward_site_filling1.js (Snippet 3) ---
if (['CMCT', 'PTsbao', 'HDCity', 'BLU', 'UHD', 'HDSpace', 'HDB', 'iTS', 'PTP', 'BYR', 'GPW', 'HDTime', 'HD-Only', 'HDfans',
      'SC', 'MTV', 'NBL', 'avz', 'PHD', 'CNZ', 'ANT', 'TVV', 'xthor', 'HDF', 'OpenCD', 'PigGo', 'RED', 'Tik', 'Aither', 'SugoiMusic', 'CG',
      'ZHUQUE', 'MTeam', 'FNP', 'OnlyEncodes', 'YemaPT', 'DarkLand', '影', 'PTLGS', 'ReelFliX', 'RouSi'].indexOf(forward_site) < 0) {
      if (forward_site == 'HDT') {
        descr_box[0].style.height = '600px';
        var mediainfo_hdt = get_mediainfo_picture_from_descr(raw_info.descr);
        descr_box[0].value = '[quote]' + simplifyMI(mediainfo_hdt.mediainfo, 'HDT') + '[/quote]\n' + mediainfo_hdt.pic_info.replace(/\n/g, '');
      } else if (forward_site != 'HaiDan') {
        if (forward_site != 'OpenCD') {
          descr_box[0].style.height = '800px';
          if ($('textarea[name="technical_info"]').length) {
            descr_box[0].style.height = '460px';
          }
        }
        if (forward_site == 'OPS' && raw_info.origin_site == 'jpop') {
          descr_box[0].style.height = '400px';
          raw_info.descr = raw_info.descr.replace(/^\[.*?\/img\]/, '').trim();
        }
        if (forward_site == 'PTer') {
          if (raw_info.full_mediainfo) {
            if (raw_info.full_mediainfo.match(/mpls/i)) {
              try {
                raw_info.full_mediainfo = raw_info.full_mediainfo.match(/QUICK SUMMARY:([\s\S]*)/)[1].trim();
              } catch (err) { }
            }
            try {
              var info = get_mediainfo_picture_from_descr(raw_info.descr);
              raw_info.descr = raw_info.descr.replace(info.mediainfo, raw_info.full_mediainfo);
            } catch (err) { }
          }
          try {
            raw_info.descr.match(/\[quote\][\s\S]*?\[\/quote\]/g).map((e) => {
              if (e.match(/General.{0,2}\n?(Unique|Complete name)/)) {
                var ee = e.replace('[quote]', '[hide=mediainfo]').replace('[/quote]', '[/hide]');
                raw_info.descr = raw_info.descr.replace(e, ee);
              } else if (e.match(/Disc Title|Disc Info|Disc Label/)) {
                var ee = e.replace('[quote]', '[hide=bdinfo]').replace('[/quote]', '[/hide]');
                raw_info.descr = raw_info.descr.replace(e, ee);
              }
            });
          } catch (err) { }
        } else if (forward_site == 'Audiences' || forward_site == 'TJUPT' || forward_site == 'NexusHD') {
          try {
            raw_info.descr.match(/\[quote\][\s\S]*?\[\/quote\]/g).map((e) => {
              if (e.match(/General|Disc Title|Disc Info|Disc Label|RELEASE.NAME|RELEASE DATE|Unique ID|RESOLUTiON|Bitrate|帧　率|音频码率|视频码率/i)) {
                var ee = e.replace('[quote]', '[Mediainfo]').replace('[/quote]', '[/Mediainfo]');
                if (raw_info.full_mediainfo) {
                  ee = `[Mediainfo]${raw_info.full_mediainfo}[/Mediainfo]`;
                }
                if (forward_site == 'TJUPT') {
                  ee = ee.replace('[Mediainfo]', '[mediainfo]').replace('[/Mediainfo]', '[/mediainfo]');
                }
                raw_info.descr = raw_info.descr.replace(e, ee);
              }
            });
          } catch (err) { }
        }
        descr_box[0].value = raw_info.descr;
        if (forward_site == 'BHD') {
          document.getElementById('mediainfo').dispatchEvent(evt);
        }
        if (forward_site == 'TCCF') {
          $('span:contains("[bbcode]")').click();
          descr_box[0].value = raw_info.descr;
          $('span:contains("[bbcode]")').click();
        }
      } else {
        descr_box[2].value = raw_info.descr;
      }
    }

// --- From Module: 18_forward_site_filling2.js (Snippet 4) ---
else if (forward_site == 'YemaPT') {
      delete Array.prototype.remove;
      var type_code = '未分类';
      switch (raw_info.type) {
        case '电影': case '剧集': case '综艺': case '动漫': case '体育': case '短剧': case '软件': case '游戏': case '书籍': case '音乐':
          type_code = raw_info.type; break;
        case '纪录': type_code = '纪录片'; break;
        case '动漫': type_code = '動畫'; break;
        case 'MV': type_code = 'MV/演唱会'; break;
      }
      var medium_code = 'Other';
      switch (raw_info.medium_sel) {
        case 'UHD': medium_code = 'Blu-rayUHD'; break;
        case 'Blu-ray': case 'Remux': case 'Encode': case 'CD':
          medium_code = raw_info.medium_sel;
          break;
        case 'HDTV': medium_code = 'HDTV/TV'; break;
        case 'WEB-DL': medium_code = 'Web-dl'; break;
        case 'DVD':
          if (raw_info.name.match(/dvdrip/i)) {
            medium_code = 'DVDrip';
          } else {
            medium_code = 'DVD';
          }
          break;
      }
      var videoCodec = 'Other';
      switch (raw_info.codec_sel) {
        case 'H264': case 'X264':
          videoCodec = 'H.264(x264/AVC)';
          if (raw_info.medium_sel == 'Blu-ray' || raw_info.medium_sel == 'UHD') {
            videoCodec = 'Bluray(AVC)';
          }
          break;
        case 'VC-1': videoCodec = 'Bluray(VC1)'; break;
        case 'XVID': videoCodec = 'Xvid'; break;
        case 'MPEG-2': videoCodec = 'MPEG-2'; break;
        case 'H265': case 'X265':
          videoCodec = 'H.265(x265/HEVC)';
          if (raw_info.medium_sel == 'Blu-ray' || raw_info.medium_sel == 'UHD') {
            videoCodec = 'Bluray(HEVC)';
          }
          break;
        case 'AV1': videoCodec = 'AV1';
      }
      var audioCodec = 'Other';
      switch (raw_info.audiocodec_sel) {
        case 'DTS-HD': case 'DTS-HDMA:X 7.1': case 'DTS-HDMA': case 'DTS-HDHR':
          audioCodec = 'DTS-HD MA';
          break;
        case 'TrueHD': audioCodec = 'TrueHD'; break;
        case 'Atmos':
          audioCodec = 'TrueHD Atmos';
          break;
        case 'AC3':
          audioCodec = 'AC3(DD)';
          if (raw_info.name.match(/DDP|DD\+/)) {
            audioCodec = 'E-AC3(DDP)';
            if (raw_info.name.match(/Atoms/)) {
              audioCodec = 'E-AC3 Atoms Atoms';
            }
          }
          break;
        case 'LPCM': case 'DTS': case 'AAC': case 'Flac': case 'APE': case 'WAV': case 'MP3':
          audioCodec = raw_info.audiocodec_sel.toUpperCase();
      }
      var standard_code = 'Other';
      var standard_dict = {
        '4K': '2160p/4K', '1080p': '1080p', '1080i': '1080i', '720p': '720p', 'SD': 'SD'
      };
      if (standard_dict.hasOwnProperty(raw_info.standard_sel)) {
        standard_code = standard_dict[raw_info.standard_sel];
      }

      var source_code = 'Other';
      var source_dict = { '大陆': 'CN(中国)', '香港': 'HK/CN(香港)', '台湾': 'TW/CN(台湾)', '日本': 'JP(日本)', '韩国': 'KR(韩国)' };
      if (source_dict.hasOwnProperty(raw_info.source_sel)) {
        source_code = source_dict[raw_info.source_sel];
      }
      const europeanCountries = ["阿尔巴尼亚", "安道尔", "奥地利", "白俄罗斯", "比利时", "波斯尼亚和黑塞哥维那", "保加利亚", "克罗地亚", "塞浦路斯", "捷克", "丹麦", "爱沙尼亚", "芬兰", "法国", "德国", "希腊", "匈牙利", "冰岛", "爱尔兰", "意大利", "科索沃", "拉脱维亚", "列支敦士登", "立陶宛", "卢森堡", "马耳他", "摩尔多瓦", "摩纳哥", "黑山", "荷兰", "北马其顿", "挪威", "波兰", "葡萄牙", "罗马尼亚", "俄罗斯", "圣马力诺", "塞尔维亚", "斯洛伐克", "斯洛文尼亚", "西班牙", "瑞典", "瑞士", "乌克兰", "英国", "梵蒂冈", "挪威"];
      if (raw_info.source_sel == '欧美') {
        var reg_region = raw_info.descr.match(/(地.{0,5}?区|国.{0,5}?家|产.{0,5}?地|◎產.{0,5}?地)([^\r\n]+)/);
        if (reg_region) {
          var region = reg_region[2].trim();
          region = region.split("/")[0].trim();
          if (region.match('美国')) {
            source_code = 'US(美国)';
          } else if (europeanCountries.indexOf(region) > -1) {
            source_code = 'EU(欧洲)';
          }
        }
      }
      const team_dict = ['OurBits', 'BtsHD', 'BtsTV', 'HDChina', 'CMCT', 'HHWEB', 'FRDS', 'MTeam', 'QHstudio', 'UBits'];
      // 查找逻辑
      var team_code = team_dict.find(group => raw_info.name.includes(group));
      if (team_code === undefined) team_code = 'Other';
      console.log(team_code)

      var tags = [];
      if (labels.gy) { tags.push('国语'); }
      if (labels.zz) { tags.push('中字'); }
      if (labels.yy) { tags.push('粤语'); }
      if (labels.yz) { tags.push('英字'); }
      if (labels.hdr10 || labels.hdr10plus) { tags.push('HDR10'); }
      if (labels.db) { tags.push('杜比视界'); }
      if (!labels.complete && raw_info.name.match(/E\d+/i)) { tags.push('分集'); }
      if (labels.complete) { tags.push('完结'); }

      async function runSequence(medium_code, standard_code, videoCodec, audioCodec, source_code, team_code, tags, type_code) {
        try {
          await selectDropdownOption('medium', 0, medium_code);
          await selectDropdownOption('standard', 1, standard_code);
          await selectDropdownOption('codec', 2, videoCodec);
          await selectDropdownOption('audiocodec', 3, audioCodec);
          await selectDropdownOption('region', 4, source_code);
          await selectDropdownOption('team', 5, team_code);
          await selectDropdownOption('tagList', 6, tags);
          await selectDropdownOption('categoryId', 7, type_code);
        } catch (error) {
          console.error("执行过程中出错:", error);
        }
      }

      $('#shortDesc').wait(function () {
        const ant_form = document.querySelector('form.ant-form')
        const __reactFiber = getReactFiberNode(ant_form);
        const instance = getReactComponentInstance(__reactFiber);
        if (instance) ant_form_instance = instance;
        instance?.context?.setFieldsValue({ 'showName': raw_info.name });
        instance?.context?.setFieldsValue({ 'shortDesc': raw_info.small_descr });
        try {
          const cover_img = raw_info.descr?.split('[/img]')?.at(0).split('[img]')?.at(1).trim();
          instance?.context?.setFieldsValue({ 'picture': cover_img });
        } catch (err) { }

        setTimeout(function () {
          addTorrent(raw_info.torrent_url, raw_info.torrent_name, forward_site, null);
        }, 200);

        function bbcode2markdown(text) {
          text = text.replace(/\[size=\d\]/ig, '').replace(/\[\/size\]/ig, '');
          text = text.replace(/\[font=.+?\]/ig, '').replace(/\[\/font\]/ig, '');
          text = text.replace(/\[color=.+?\]/ig, '').replace(/\[\/color\]/ig, '');
          text = text.replace(/\[img\](.*?)\[\/img\]/ig, '![_]($1)');
          text = text.replace(/\[b\]\s*/ig, '**').replace(/\s*\[\/b\]/ig, '**');
          text = text.replace(/\[i\]\s*/ig, '*').replace(/\s*\[\/i\]/ig, '*');
          text = text.replace(/\[url=([^\]]*?)\](.*?)\[\/url\]/ig, '[$2]($1)');
          text = text.replace(/\[quote\](.*?)\[\/quote\]/isg, (m, n) => '> ' + n.split('\n').join('\n> ') + '\n\n');
          return text;
        }
        instance?.context?.setFieldsValue({ 'longDesc': bbcode2markdown(raw_info.descr) });
        $('#longDesc').css({ 'height': '800px' });

        // 匿名
        if (if_uplver) {
          $('input[class="ant-radio-input"][value="y"]').click();
        }

        if (raw_info.dburl) {
          try {
            const dbid = raw_info.dburl.match(/subject\/(\d+)/)[1];
            instance?.context?.setFieldsValue({ 'douban': dbid });
          } catch (err) { }
        }
        if (raw_info.url) {
          try {
            const imdbid = raw_info.url.match(/title\/tt(\d+)/)[1];
            instance?.context?.setFieldsValue({ 'imdb': imdbid });
          } catch (err) { }
        }
        runSequence(medium_code, standard_code, videoCodec, audioCodec, source_code, team_code, tags, type_code);
      }, 1000/*次*/, 200/*毫秒/次*/);
    }

