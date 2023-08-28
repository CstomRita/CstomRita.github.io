(function () {
    //依赖https://github.com/brix/crypto-js
    if (!window.$docsify || !window.CryptoJS) {
        return;
    }


    /**
   * AES-256-ECB对称解密
   * @param textBase64 {string} 要解密的密文，Base64格式
   * @param secretKey {string} 密钥，43位随机大小写与数字
   * @returns {string} 解密后的明文
   */
  


    /**
     * @description: 等待用户输入密钥后使用指定算法解密
     * @param {string} algorithm 算法
     * @param {string} content 文档内容
     * @return {string} 解密后文档内容
     */
    function inputSecretKeydecryptContent(algorithm, content) {
        // if (!CryptoJS[algorithm]) {
        //     return "# 不支持的加密算法 `~_~`";
        // }
        let secretKey = prompt('请输入密钥：');
        try {
            return CryptoJS.AES.decrypt(content, CryptoJS.enc.Utf8.parse(secretKey), {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7
            }).toString(CryptoJS.enc.Utf8);
            // return CryptoJS.AES.decrypt(content,secretKey).toString(CryptoJS.enc.Utf8);
            // return Decrypt(content,secretKey);
            //return CryptoJS[algorithm].decrypt(content, secretKey);
        } catch (err) {
            console.log(err);
            return "# 解密失败 `~_~`";
        }
    }

    const beforeEachHook = function (hook, vm) {
        hook.beforeEach(function (content) {
            //格式：ENCRYPTED.加密方式(加密内容)
            let matchResult = content.match(/ENCRYPTED\(([\s\S]+)\)/);
            console.log(matchResult)
            if (matchResult) {
                return inputSecretKeydecryptContent(matchResult[1]);
            }
            return content;
        });
    }

    //侧边栏加图标
    const linkLockIconMarkdown = function (marked, renderer) {
        const normalLink = renderer.link;
        renderer.link = function (href, title, text) {
            if (':encrypted' === title) {
                //侧边栏加锁图标
                let html = normalLink(href, '', text);
                return html.substring(0, html.length - 4) + ' <img class="emoji" src="https://github.githubassets.com/images/icons/emoji/unicode/1f512.png" alt="100">' + '</a>'
            }
            return normalLink(href, title, text);
        }
        marked.use({ renderer });
        return marked
    }

    window.$docsify.plugins = [beforeEachHook].concat(window.$docsify.plugins || []);
    // window.$docsify.markdown = window.$docsify.markdown ? function (marked, renderer) {
    //     marked = window.$docsify.markdown(marked, renderer);
    //     return linkLockIconMarkdown(marked, renderer);
    // } : linkLockIconMarkdown;
})();