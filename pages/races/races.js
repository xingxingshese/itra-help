Page({
  data: {
    runnerId: '',
    firstName: '',
    lastName: '',
    profilePic: '',
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
      lastName: options.lastName,
      profilePic: decodeURIComponent(options.profilePic),
      pi: options.pi
    });
    this.loadRaces();
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
  }
}); 