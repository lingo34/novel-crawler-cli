
## 书源是什么
这里是借用了开源阅读app的用语。
在这里, 书源指的是模块化的爬虫配置。

因为各个网站的html 写的不一样, 爬虫要寻找的 html元素也会不一样, 因此, 一个爬虫不能用于所有网站

为了让本程序适配更多网站, 并简化适配流程, 我把 puppeteer 处理html 的部分拉了出来, 放在书源中

由于原生 json 格式不支持多行 string, 这里使用的是 [hjson (human json)](https://hjson.github.io/)

如果你不想学hjson, 我猜json 格式文件直接重新命名为 json 大概也没问题

## 推荐的书源命名规范
技术上来说, 命名不是很重要, 起码随意命名书源应该不会弄坏什么东西
不过我这里还是写一个命名规范, 存在这个repo 里的书源应该都会遵守这个格式
比如 url 为 `https://www.xbiquge.tw` 的书源
可以命名为 `xbiquge-tw.hjson`
- 把 `.` 换成 `-`
- 不要加上 `www` 和 `http/https`



## 如何创建书源
首先, 所有书源文件都存在 `./bookSource` 目录下.
如果想创建新的书源, 可以参考我创建的第一个书源 `xbiquge-tw.hjson`
里面有注释

~~~ hjson
    getContent:
    {
        arguments:"document",
        body:
        '''
            let content = document.querySelector('#content').innerHTML; // 获取小说内容 
            let title = document.querySelector('.bookname h1').innerHTML; // 获取小说标题 
            let nextPageUrl = document.getElementById('link-next').href; // 获取下一页的链接 
            return {content, title, nextPageUrl} 
        ''',
    }
~~~


## 实现这个功能参考的相关文档 (因此不包括copilot 或bingGPT 或 chatGPT)

为了在 json 中储存 JavaScript 代码, 这里使用了 new Function() 的方式,
我参考了 
- [How to store a javascript function in JSON](https://stackoverflow.com/questions/36517173/how-to-store-a-javascript-function-in-json)
- [Is it possible to pass a function to Puppeteer's page.evaluate()](https://stackoverflow.com/questions/58040196/is-it-possible-to-pass-a-function-to-puppeteers-page-evaluate/58040978#58040978)
