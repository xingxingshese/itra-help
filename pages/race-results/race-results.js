Page({
  data: {
    raceName: '',
    raceCategory: '',
    raceYear: '',
    results: [],
    filteredResults: [],
    searchText: '',
    loading: false,
    noMore: false
  },
  onLoad: function(options) {
    
    
      const { raceName, category, year, raceYearId } = options;
      
      this.setData({
      raceName: decodeURIComponent(raceName),
      raceCategory: category,
      raceYear: year
    });

    const cacheKey = `raceResults_${category}_${year}_${raceYearId}`;
    // 出现loading
    this.setData({ loading: true });
    //等待1s
    setTimeout(() => {
      const cachedData = wx.getStorageSync(cacheKey);    
      if (cachedData && this.isCacheValid(cachedData.timestamp)) {
        // 使用缓存数据
        this.setData({
          results: cachedData.results,
          filteredResults: cachedData.results,
          noMore: true,
          loading: false
        });
      } else {
        // 加载新数据
          this.loadRaceResults(category, year, raceYearId, cacheKey);
        }
    }, 500);
  },

  isCacheValid: function(timestamp) {
    const now = Date.now();
    const twoDays = 2 * 24 * 60 * 60 * 1000; // 两天的毫秒数
    return (now - timestamp) < twoDays;
  },

  loadRaceResults: function(category, year, raceYearId, cacheKey) {
    this.setData({ loading: true });
    const url = `https://itra.run/Races/RaceResults/${category}/${year}/${raceYearId}`;
    
    // const url = "https://apifoxmock.com/m2/5573821-5251513-default/241526272"
    console.log('url',url);
    wx.request({
      url: url,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) {
          const results = this.parseHtmlTable(res.data);
          this.setData({
            results,
            filteredResults: results,
            noMore: true
          });

          // 缓存结果
          wx.setStorageSync(cacheKey, {
            results,
            timestamp: Date.now()
          });
        } else {
          wx.showToast({
            title: '加载失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      },
      complete: () => {
        this.setData({ loading: false });
      }
    });
  },



  parseHtmlTable: function(html) {
    try {
     
      const tableStart = html.indexOf('<table');
      const tableEnd = html.indexOf('</table>', tableStart);
      const tableHtml = html.substring(tableStart, tableEnd + 8);

      const rows = tableHtml.split('<tr>').filter(row => row.includes('</tr>'));
      
      const results = [];
      // 跳过表头行
      for (let i = 1; i < rows.length; i++) {
       
        const row = rows[i];
          // 提取序号
        const rankMatch = row.match(/<td>(\d+)<\/td>/);
        const rank = rankMatch ? rankMatch[1] : '';
        
        // 提取头像URL
        const imgMatch = row.match(/src="([^"]+)"\s+style="width: 3em/);
        const avatarUrl = imgMatch ? imgMatch[1] : '';
        // 提取选手ID
        const runnerIdMatch = row.match(/\/RunnerSpace\/[^\/]+\/(\d+)/);
        const runnerId = runnerIdMatch ? runnerIdMatch[1] : '';

        const runnerUrlMatch = row.match(/\/RunnerSpace\/([^\/]+)\/(\d+)/);
        const runnerUrl = runnerUrlMatch ? runnerUrlMatch[0] : '';
        
        // 提取选手姓名
        const nameMatch = row.match(/<a[^>]+>\s*(?:<img[^>]+>\s*)?([^<]+)\s*<\/a>/);
        const runnerName = nameMatch ? nameMatch[1].trim() : '';
        // 处理HTML实体编码的名字
        const runnerDecodedName = runnerName.replace(/&#x([0-9a-fA-F]+);/g, (match, p1) => {
          return String.fromCharCode(parseInt(p1, 16));
        });
       
       
        // 提取完成时间
        const timeMatch = row.match(/<td>(\d+:\d+:\d+)<\/td>/);
        const time = timeMatch ? timeMatch[1] : '';

        if (runnerName && time) {
          results.push({
            rank:rank,
            runner: runnerDecodedName,
            avatarUrl: 'https://itra.run'+avatarUrl,
            time: time,
            runnerId: runnerId,
            runnerUrl: 'https://itra.run'+runnerUrl
          });
        }
      }
      
      return results;

    } catch (error) {
      console.error('解析错误:', error);
      return [];
    }
  },

  extractText: function(html) {
    if(!html) return html;
    // 移除HTML标签，获取文本内容
    return html.replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
  },

  onSearch: function(e) {
    const searchText = e.detail.value.toLowerCase();
    this.setData({
      searchText,
      filteredResults: this.data.results.filter(item => 
        item.runner.toLowerCase().includes(searchText)
      )
    });
  },

  htmlTransform: function(htmlStr) {
    const str = htmlStr.replace(/\n/g, "");
    let result = { nodeName: "root", children: [] };
    let use_line = [0];               
    let current_index = 0;            // 记录当前插入children的下标
    let node = result;                // 当前操作的节点
    let sign = "";                    // 标记标签字符串（可能包含属性字符）、文本信息
    let status = "";                  // 当前状态，为空的时候我们认为是在读取当前节点（node）的文本信息
    for (var i = 0; i < str.length; i++) {
      var current = str.charAt(i);
      var next = str.charAt(i + 1);
      if (current === "<") {
        // 在开始标签完成后记录文本信息到当前节点
        if (sign && status === sign_enum.SIGN_START_OK) {
          node.text = sign;
          sign = "";
        }
        // 根据“</”来区分是 结束标签的（</xxx>）读取中  还是开始的标签(<xxx>) 读取中
        if (next === "/") {
          status = sign_enum.SIGN_END;
        } else {
          status = sign_enum.SIGN_START;
        }
      } else if (current === ">") {
        // (<xxx>) 读取中，遇到“>”， (<xxx>) 读取中完成
        if (status === sign_enum.SIGN_START) {
          // 记录当前node所在的位置，并更改node
          node = result;
          use_line.map((_, index) => {
            if (!node.children) node.children = [];
            if (index === use_line.length - 1) {
              sign = sign.replace(/^\s*/g, "").replace(/\"/g, "");
              let mark = sign.match(/^[a-zA-Z0-9]*\s*/)[0].replace(/\s/g, ""); // 记录标签
              // 标签上定义的属性获取
              let attributeStr = sign.replace(mark, '').replace(/\s+/g, ",").split(",");
              let attrbuteObj = {};
              let style = {};
              attributeStr.map(attr => {
                if (attr) {
                  let value = attr.split("=")[1];
                  let key = attr.split("=")[0];
                  if (key === "style") {
                    value.split(";").map(s => {
                      if (s) {
                        style[s.split(":")[0]] = s.split(":")[1]
                      }
                    })
                    return attrbuteObj[key] = style;
                  }
                  attrbuteObj[key] = value;
                }
              })
              node.children.push({ nodeName: mark, children: [], ...attrbuteObj })
            }
            current_index = node.children.length - 1;
            node = node.children[current_index];
          });
          use_line.push(current_index);
          sign = "";
          status = sign_enum.SIGN_START_OK;
        }
        // (</xxx>) 读取中，遇到“>”， (</xxx>) 读取中完成
        if (status === sign_enum.SIGN_END) {
          use_line.pop();
          node = result;
          // 重新寻找操作的node
          use_line.map((i) => {
            node = node.children[i];
          });
          sign = "";
          status = sign_enum.SIGN_END_OK;
        }
      } else {
        sign = sign + current;
      }
    }
    return result;
  },

  onRaceClick: function(e) {
    const item = e.currentTarget.dataset.item;  // 获取传递的数据
    console.log('clicked item:', item);
    if (item && item.runnerUrl) {
      wx.navigateTo({
        url: `/pages/races/races?runnerUrl=${encodeURIComponent(item.runnerUrl)}`
      });
    }
  }


}); 