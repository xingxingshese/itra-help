import CryptoJS from './crypto-js-4.2.0/crypto-js';

const utils = {

  decryptString(response1Base64, response2Base64, response3Base64) {
    try {
      // 将Base64字符串转换为ArrayBuffer
      const [response1, response2, response3] = [
        this.base64ToArrayBuffer(response1Base64),
        this.base64ToArrayBuffer(response2Base64), 
        this.base64ToArrayBuffer(response3Base64)
      ];
     

      // 创建解密器
      
      const keyWords = CryptoJS.lib.WordArray.create(response3);
      const ivWords = CryptoJS.lib.WordArray.create(response2);
      const encWords = CryptoJS.lib.WordArray.create(response1);

      // 解密
      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: encWords },
        keyWords,
        {
          iv: ivWords,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }
      );

      // 转换为字符串
      return decrypted.toString(CryptoJS.enc.Utf8);

    } catch (error) {
      console.error('解密失败:', error);
      throw new Error('查询异常');
    }
  },

  base64ToArrayBuffer(base64) {
    try {
      const binary_string = wx.base64ToArrayBuffer(base64);
      return binary_string;
    } catch (error) {
      console.error('Base64转换失败:', error);
      throw new Error('数据转换异常');
    }
  }

}


/**
 * 扩展 wx 全局对象，切记不要与原用 api 重名
 */
wx.utils = utils
/**
 * 模块化导出
 */
export default utils
