
## 书源是什么
这里是借用了开源阅读app的用语。
在这里, 书源指的是模块化的爬虫配置。

因为各个网站的html 写的不一样, 爬虫要寻找的 html元素也会不一样, 因此, 一个爬虫不能用于所有网站

为了让本程序适配更多网站, 并简化适配流程, 我把 puppeteer 处理html 的部分拉了出来, 放在书源中

由于原生 json 格式不支持多行 string, 这里使用的是 [hjson (human json)](https://hjson.github.io/)

如果你不想学hjson, 我猜json 格式文件直接重新命名为 json 大概也没问题

