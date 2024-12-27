Page({
  data: {
    lastName: '',
    firstName: '',
    canSearch: false,
    results: [],
    pageNumber: 1,
    pageSize: 5,
    loading: false,
    noMore: false,
    isLoadingMore: false,
    isFixed: false
  },

  onLoad: function(options) {
    if (options.data) {
      const data = JSON.parse(decodeURIComponent(options.data));
      this.setData({
        results: data.results,
        noMore: data.results.length < this.data.pageSize
      });
    }
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
      this.loadMoreRunners();
    }
  },

  loadMoreRunners: function() {
    if (this.data.loading || this.data.noMore) return;

    this.setData({ loading: true });

    const name = `${this.data.lastName} ${this.data.firstName}`;
    const echoToken = Math.random().toString();

    wx.request({
      url: 'https://itra.run/api/runner/find',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        name: name,
        start: this.data.pageNumber,
        count: this.data.pageSize,
        echoToken: echoToken
      },
      success: (res) => {
        if (res.statusCode === 200) {
          const newResults = res.data.results;
          this.setData({
            results: [...this.data.results, ...newResults],
            pageNumber: this.data.pageNumber + 1,
            // noMore: newResults.length < this.data.pageSize
            noMore: true
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
        this.setData({ isLoadingMore: false });  
      },
      timeout: 5000
    });
  },

  onRacesClick(e) {
    const runnerId = e.currentTarget.dataset.runnerId;
    const runner = this.data.results.find(item => item.runnerId === runnerId);
    
    wx.navigateTo({
      url: `/pages/races/races?runnerId=${runnerId}&firstName=${runner.firstName}&lastName=${runner.lastName}&profilePic=${encodeURIComponent(runner.profilePic)}&pi=${runner.pi}`
    });
  }
});