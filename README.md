> :warning: If you don't understand Chinese, this repo is useless for you.
> This program aims to crawl Chinese novel websites, so almost everything (like comments) is written in Chinese

## 这是啥
这是年轻人的第一个爬虫项目, 是一个基于Node.JS 与puppeteer的纯命令行软件，以爬取免费小说网站上的免费小说资源。

没用python 是因为不会。用node 是因为1. 熟 2. 偶然看到了 puppeteer 这个库

目标成为一个通用小说爬虫框架，以支持更多网站。或许有机会再写个webui 也不是不行，不过那就是另一个项目了。



## 为什么我会想写一个爬虫？
随着我们进入大语言模型的时代，难道你不觉得这一大批的网络小说很适合拿来炼丹嘛？

小说平台自己又不练，我们只好自己练了

既然打算自己练，不如就先写个爬虫回去数据吧。可是我不会写爬虫，所以就只能先学了。

## 一点点声明

这个项目只是一个爬虫项目，爬取某些**免费小说**网站上的**免费**资源，此工具本身并*不*提供破解或是小说解锁功能。

所有本工具能爬取的数据皆为网络上的公开资料，如有版权纠纷，请联系数据来源。

## 怎么用这玩意儿
首先你需要
1. 命令行
2. Node.js (开发用的是v20.0.0, 其他版本没测试但应该问题不大吧...)
3. npm (装node.js 时会一起获得)

找个资料夹, clone 一下这个repo
~~~ sh
# clone 一下 这个repo
https://github.com/lingo34/novel-crawler-cli

# 然后 npm install 一下
npm install
~~~

然后再用node 执行 index.js
~~~sh
node index.js
~~~

就可以了

关于开始章节网址，请输入第一章的网址。我能搞到目录的地址，但搞不到第一章的地址。
如果你打算从某一章开始爬取，比如第30章(可能是因为之前爬一半中断了)， 直接写第30章的地址。
另外看到小说档案名前的数字了吗？重新开始时记得把那个数字设置为开始数字。这个数字与章节不一定相同。

## Supported Websites 目前支持的网站

目前支持的网站
| url | name | 书源档案 |
| --- | ---- | ------ |
| https://www.xbiquge.tw/   | 笔趣阁    | xbiquge-tw.hjson      |
| https://www.shukw.com/    | 书库网    | shukw-com.hjson       |
| https://www.bifengzw.com  | 东流小说  | bifengzw-com.hjson    |

打算支持的网站
- ...更多笔趣阁

## 限制
由于储存格式为纯文本, 这个爬虫并不能爬取图片或表格等富文本信息, 或许有一天会添加表格或是将html 语法转换成markdown 格式的功能, 不过目前不在计划当中, 如果有人愿意的话请务必开个pr



## 目前进度
目前本项目才刚刚起步, 支持网站有限, 有时新增不同网站时也会有一些bug, 不过大致框架基本已经完成, 已经可以开心的爬取小说了
## todo

适配更多网站, 简化适配流程

- [x] ~~拆分并模块化html解析模块~~
- [x] ~~弄一种匹配机制，如果是已适配的网站，直接用对应库~~
- [ ] 适配更多网站，或尝试适配书源语法
- [ ] 解决必须提供第一章url的问题, 或者说, 支持提供目录url

为webui 做准备

- [ ] 优化代码, 函数式编程化, 提供更多可用函数
- [ ] 迁移web
- [ ] docker?





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





