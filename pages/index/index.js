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
    wx.navigateTo({
      url: `/pages/runner/runner?qName=${encodeURIComponent(name)}`
    })
  }
});
