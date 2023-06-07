> :warning: If you don't understand Chinese, this repo is useless for you.
> This program aims to crawl Chinese novel websites, so almost everything (like comments) is written in Chinese

> ⚠️ 本软件仅供学习使用，请在下载后24小时内删除

## 这是啥
这是年轻人的第一个爬虫项目, 是一个基于Node.JS 与puppeteer的纯命令行软件，以爬取免费小说网站上的免费小说资源。

没用python 是因为不会。用node 是因为1. 熟 2. 偶然看到了 puppeteer 这个库

目标成为一个通用小说爬虫框架，以支持更多网站。或许有机会再写个webui 也不是不行，不过那就是另一个项目了。



## 为什么我会想写一个爬虫？
随着我们进入大语言模型的时代，难道你不觉得这一大批的网络小说很适合拿来炼丹嘛？

小说平台自己又不练，我们只好自己练了

既然打算自己练，不如就先写个爬虫回去数据吧。可是我不会写爬虫，所以就只能先学了。

## 一点点声明

这个项目只是一个爬虫项目，本身并*不*提供破解或是小说解锁功能。

所有本工具能爬取的数据大多为网络上的公开资料，如有版权纠纷，请联系数据来源。

## 怎么用这玩意儿
首先你需要
1. 命令行
2. Node.js (开发用的是v20.0.0, 其他版本没测试但应该问题不大吧...)
3. npm (装node.js 时会一起获得)
4. 一个chrome 浏览器? 这我还要实验, 不过有总比没有好...

找个资料夹, clone 一下这个repo
~~~ sh
# clone 一下 这个repo
https://github.com/lingo34/novel-crawler-cli

# 然后 npm install 一下
npm install
~~~
大约280mb 的chromium 浏览器会在此时被下载到程序目录下的 .cache文件夹，如果你希望使用自己的chrome，可以删除程序目录下的`.puppeteerrc.cjs`文件(参考[官方文档](https://pptr.dev/guides/configuration#changing-the-default-cache-directory))，并修改`const browser = await puppeteer.launch()`中的参数(参考[官方文档](https://pptr.dev/#default-runtime-settings)) (未来某个时候将会模块化成config.hjson文件，不过未来的事嘛，明天再说)

然后再用node 执行 index.js
~~~sh
node index.js
~~~

就可以了

关于开始章节网址，请输入第一章的网址。我能搞到目录的地址，但搞不到第一章的地址。
如果你打算从某一章开始爬取，比如第30章(可能是因为之前爬一半中断了)， 直接写第30章的地址。
另外看到小说档案名前的数字了吗？重新开始时记得把那个数字设置为开始数字。这个数字与章节不一定相同。

## 解除安装
几乎所有跟本程序相关的档案都只会出现在本程序的文件夹内，当然，如果你是为了跑这个程序才装的`node.js`, 记得把它给删了。
不过如果你删除了`.puppeteerrc.cjs` 文件，`puppeteer`会把`Chrome For Testing` 放在 `$HOME/.cache/puppeteer` (mac/linux/unix)
参考[官方文档](https://pptr.dev/#installation)

## Supported Websites 目前支持的网站
如果你有想要添加的网站, 可以开个issue 或是联系我 `lingo34@skiff.com`, 我心情好而且很闲的时候就有机会加一下

目前支持的网站
| url | name | 书源档案 | 备注 |
| --- | ---- | ------ | ---- |
| https://www.xbiquge.tw/   | 笔趣阁    | xbiquge-tw.hjson       | |
| https://www.shukw.com/    | 书库网    | shukw-com.hjson        | |
| https://www.bifengzw.com  | 东流小说  | bifengzw-com.hjson      | |
| https://zh.wikisource.org | 维基文库  | zh-wikisource-org.hjson | 维基文库的格式十分复杂, 有时会有表格和图片这种本爬虫无法处理内容|
| https://www.qidian.com/   | qd中文网  | www-qidian-com.hjson   | 这东西不太稳定, 很玄, 如果失败了就多试几次。支持cookie 登入|

打算支持的网站
- ...更多笔趣阁
- 番茄
- esj 轻之国度

## 如果我想自己写一个书源, 我该怎么做？
你需要什么
- 一点点关于JavaScript, 特别是关于css 选择器的内容 (你不需要会JavaScript或node.js)
- 或许还有JavaScript中关于文字处理的内容以及正则表达式... 不过没关系, 可以让chatGPT帮你写
- debug 的能力

本程序的书源是用hjson格式写的, 具体爬取的网页分析代码是javascript浏览器代码。
如果你想自己写一个书源, 最简单的方式就是复制一个写好的书源, 然后根据注释修改代码。这里面储存的JavaScript 代码都是会透过puppeteer, 在爬虫的无头浏览器中运行的。因此你唯一需要知道的知识, 就是JavaScript 中关于css 选择器的内容


## 限制
由于储存格式为纯文本, 这个爬虫并不能爬取图片或表格等富文本信息, 或许有一天会添加表格或是将html 语法转换成markdown 格式的功能, 不过目前不在计划当中, 如果有人愿意的话请务必开个pr


## 关于Cookie
有些网站或许会要求登入, 而众所周知, cookie 是储存登入状态的好地方。
所以只要从你的浏览器获取cookie, 再把cookie 导入到本程序里就可以了。

关于如何从浏览器中获取cookie, 可以使用像是[EditThisCookie](https://chrome.google.com/webstore/detail/editthiscookie/fngmhnnpilhplaeedifhccceomclgfbg) (chrome) 或是 [CookieEditor](https://addons.mozilla.org/zh-CN/firefox/addon/cookie-editor/) (FireFox)之类的插件。 看这篇文章 [Puppeteer cookie 使用，免登录 CSDN 简书 掘金](https://guozh.net/puppeteer-cookie-login/)

获取到 json 格式的cookie 之后, 把它贴到本程序目录下的 `cookie.json` 文件中。如果这个文件不存在，就自己创建一个。


## 目前进度
目前本项目才刚刚起步, 支持网站有限, 有时新增不同网站时也会有一些bug, 不过大致框架基本已经完成, 已经可以开心的爬取小说了
## todo

适配更多网站, 简化适配流程

- [x] ~~拆分并模块化html解析模块~~
- [x] ~~弄一种匹配机制，如果是已适配的网站，直接用对应库~~
- [x] ~~cookies 登入~~
- [ ] 更新书源
- [ ] 解决必须提供第一章url的问题, 或者说, 支持提供目录url
- [ ] 写一个用来给书源debug 的程序, 只包含必要代码以及debug 工具
- [ ] docker 支持
- [ ] 把浏览器 argument 的定义交给书源?

长期目标
- [ ] 适配更多网站，或尝试适配书源语法

为webui 做准备

- [ ] 优化代码, 函数式编程化, 提供更多可用函数
- [ ] 迁移web





## 致谢
[node.js爬虫入门（二）爬取动态页面(puppeteer)](https://peal.cc/blog/3)
- 教会了我怎么写爬虫, 贡献了 1/3 的代码

chatGPT & Bing GPT
- 帮我写了 1/3 的代码

GitHub Copilot
- 帮我写了剩下 1/3 的代码

## 使用的 Library
- puppeteer, Apache 2.0 协议
- prompt-sync, mit 协议
- hjson, mit 协议



## 一些别的

小说文件名





