Page({
  data: {
    qname: '',
    lastName: '',
    firstName: '',
    canSearch: false,
    results: [],
    start: 1,
    count: 5,
    loading: false,
    noMore: false,
    isLoadingMore: false,
    isFixed: false
  },

  onLoad: function(options) {
    if (options.qName) {
      console.log(decodeURIComponent(options.qName));
      this.setData({
        qname: decodeURIComponent(options.qName)
      });
    }
    this.loadMoreRunners();
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

    console.log(this.data.qname);
    const echoToken = Math.random().toString();

    wx.request({
      url: 'https://itra.run/api/runner/find',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        name: this.data.qname,
        start: this.data.start,
        count: this.data.count,
        echoToken: echoToken
      },
      success: (res) => {
        if (res.statusCode === 200) {
          const newResults = res.data.results;
          this.setData({
            results: [...this.data.results, ...newResults],
            start: this.data.start + this.data.count,
            noMore: newResults.length < this.data.count
            // noMore: true
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