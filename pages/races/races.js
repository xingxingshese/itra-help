Page({
  data: {
    runnerId: '',
    firstName: '',
    lastName: '',
    avatarUrl: '',
    pi: '',
    pageNumber: 1,
    pageSize: 3,
    raceList: [],
    loading: false,
    noMore: false,
    isFixed: false,
    isLoadingMore: false
  },

  onLoad: function(options) {
    this.setData({
      runnerId: options.runnerId,
      firstName: options.firstName,
      lastName: options.lastName
    });
    
    // 先执行loadRunnerInfo，完成后再执行loadRaces
    this.loadRunnerInfo(options.runnerUrl, this.data.runnerId, this.data.firstName, this.data.lastName)
      .then(() => {
        this.loadRaces();
      });
  },

  loadRunnerInfo: function(runnerUrl, runnerId, firstName, lastName) {
    return new Promise((resolve, reject) => {
      let url = '';
      if(runnerUrl){
        url = decodeURIComponent(runnerUrl);
      }else{
        url = `https://itra.run/RunnerSpace/${lastName}.${firstName}/${runnerId}`;
      }

      wx.request({
        url: url,
        method: 'GET',
        success: (res) => {
          if (res.statusCode === 200) {
            this.parseHtml(res.data);
            resolve();
          } else {
            wx.showToast({
              title: '加载失败',
              icon: 'none'
            });
            reject();
          }
        },
        fail: () => {
          wx.showToast({
            title: '网络错误',
            icon: 'none'
          });
          reject();
        },
        complete: () => {
          this.setData({ loading: false });
        }
      });
    });
  },

  // 监听页面滚动
  onPageScroll: function(e) {
    const isFixed = e.scrollTop > 15;
    if (this.data.isFixed !== isFixed) {
      this.setData({
        isFixed
      });
    }
  },

  onReachBottom: function() {
    if (!this.data.loading && !this.data.noMore) {
      this.loadMoreRaces();
    }
  },

  loadRaces: function() {
    if (this.data.loading) return;
    if (this.data.noMore) return;
    this.setData({ loading: true });
    
    wx.request({
      url: 'https://itra.run/api/Race/GetRaceResultsData',
      method: 'GET',
      data: {
        runnerId: this.data.runnerId,
        pageNumber: this.data.pageNumber,
        pageSize: this.data.pageSize,
        raceYear: '',
        categoryId: ''
      },
      success: (res) => {
        if (res.statusCode === 200 )
          if (res.data.raceResults) {
            
          this.setData({
            raceList: [...this.data.raceList, ...res.data.raceResults],
            noMore: res.data.raceResults.length < this.data.pageSize
          });
        }
        // else{
          this.setData({
            noMore: true
          });
        // }

      },
      fail: () => {
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        });
      },
      complete: () => {
        this.setData({ loading: false });
        this.setData({ isLoadingMore: false });  
      },
      timeout: 5000
    });
  },

  loadMoreRaces: function() {
    if (this.data.isLoadingMore || this.data.noMore) return;
    
    this.setData({ isLoadingMore: true });
    
    this.setData({
      pageNumber: this.data.pageNumber + 1
    }, () => {
      this.loadRaces();
    });
  },

  onRaceClick(e) {
    const race = e.currentTarget.dataset.race;
    const year = race.date.split('-')[0];
    
    wx.navigateTo({
      url: `/pages/race-results/race-results?raceName=${encodeURIComponent(race.name)}&category=${race.distanceCategory}&year=${year}&raceYearId=${race.raceYearId}`
    });
  },

  parseHtml: function(html) {
    try {
     
        // 提取选手姓名
        const nameMatch = html.match(/<h4[^>]*>([^<]+)<\/h4>/);
       
        const runnerName = nameMatch ? nameMatch[1].trim() : '';
        // 处理HTML实体编码的名字
        const runnerDecodedName = runnerName.replace(/&#x([0-9a-fA-F]+);/g, (match, p1) => {
          return String.fromCharCode(parseInt(p1, 16));
        });
       
        // 提取头像URL
        const avatarUrlMatch = html.match(/\/Files\/Photos\/[a-zA-Z0-9]+\.jpg/);
        const avatarUrl = avatarUrlMatch ? avatarUrlMatch[0] : '';
        console.log(avatarUrl);
        // 提取分数
        const levelMatch = html.match(/<span class="level-count">(\d+)<\/span>/);
        const level = levelMatch ? levelMatch[1] : '';
       
        // 提取 ITRA ID
        const itraIdMatch = html.match(/ITRA ID:\s*<span><b>(\d+)<\/b><\/span>/);
        const runnerId = itraIdMatch ? itraIdMatch[1] : '';

     

        this.setData({
          pi:level,
          runner: runnerDecodedName,
          avatarUrl: avatarUrl,
          runnerId: runnerId
        });

        console.log('1===='  + this.data.runnerId);



    } catch (error) {
      console.error('解析错误:', error);
      return [];
    }
  },
}); 