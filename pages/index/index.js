// index.js
Page({
  data: {
    lastName: '',
    firstName: '',
    canSearch: false
  },

  onLastNameInput(e) {
    const lastName = e.detail.value;
    this.setData({
      lastName
    });
    // 保存到缓存
    wx.setStorageSync('lastName', lastName);
    this.checkCanSearch();
  },

  onFirstNameInput(e) {
    const firstName = e.detail.value;
    this.setData({
      firstName
    });
    // 保存到缓存
    wx.setStorageSync('firstName', firstName);
    this.checkCanSearch();
  },

  checkCanSearch() {
    const canSearch = this.data.lastName.trim() !== '' && this.data.firstName.trim() !== '';
    this.setData({
      canSearch
    });
  },

  onSearch() {
    const name = `${this.data.lastName} ${this.data.firstName}`;
    const echoToken = Math.random().toString();
    
    wx.showLoading({
      title: '查询中...'
    });

    wx.request({
      url: 'https://itra.run/api/runner/find',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        name: name,
        start: 1,
        count: 10,
        echoToken: echoToken
      },
      timeout: 5000,
      success: (res) => {
        wx.hideLoading();
        console.log('res.data', res.data);
        if (res.statusCode === 200 && res.data.results.length > 0) {
          wx.navigateTo({
            url: `/pages/runner/runner?data=${encodeURIComponent(JSON.stringify(res.data))}`
          });
        } else {
          console.log('res.data', res.data);
          wx.showToast({
            title: '查询失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  }
});
