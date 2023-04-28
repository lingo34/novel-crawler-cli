const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const prompt = require('prompt-sync')()
var Hjson = require('hjson');

const version = "1.0.1"

main()

// 測試數據
// getBook("https://www.xbiquge.tw/book/54510/38637143.html", '风起龙城')

async function main() {
    console.log("\nNovel-Crawler 爬虫 v" + version)
    console.log("GitHub: https://github.com/lingo34/novel-crawler-cli\n")
    let url = prompt('請輸入开始章节網址: ')
    if (url == '') {
        console.log("url為空，退出程序...")
        return;
    }

    let startIndex = prompt('請輸入起始章節(1): ')
    let endIndex = prompt('請輸入結束章節(2000): ')
    if (startIndex == '')
        startIndex = 1;
    if (endIndex == '')
        endIndex = 2000;

    let dir = prompt('請輸入小说存放資料夾(当前目录)/书名: ')
    if (dir == '') {
        dir = './'
    }
    // console.log(`小说将儲存到: ${dir}小说名/`)

    // 书源文件
    let bookSourceName;
    // 列出所有书源文件
    // console.log("\n>> 列出所有书源文件 << \n")
    // fs.readdirSync('./bookSource', (err, files) => {
    //     if (err) {
    //         console.error(err);
    //         return;
    //     }
    //     files.forEach(file => {
    //         console.log(file);
    //     });
    // });

    bookSourceName = prompt('請指定书源文件, 不指定则根据url自动匹配: ')
    // bookSourceName = './bookSource/' + bookSourceName
    console.log(`书源文件: ${'./bookSource/' + bookSourceName}`)

    await getBook(url, startIndex, endIndex, dir, bookSourceName)
}



// this function crawl the content of a novel
// url: 網址, startIndex: 起始章節, endIndex: 結束章節, 
// dir: 存放資料夾, 地址带/结尾, bookSourceDir: 书源文件路径, 为空则根据url自动匹配
async function getBook(url, startIndex, endIndex, dir, bookSourceName) {

    console.log("获取书籍信息, 启动浏览器...")

    // 启动浏览器
    const browser = await puppeteer.launch(
        {
            headless: "new", // 默认是无头模式，new 是新版无头
            //args: ["--user-data-dir=./chromeTemp"]
            args: [
                // "--user-data-dir=./chromeTemp" // 保存登录状态
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled',
            ],
            dumpio: false,
        }
    )



    // ------ 传入参数初始化/格式化 ------

    // 1. 根据url 判断书源
    let bookSourcePath = null;
    if (bookSourceName == '' || !bookSourceName) { // 未指定书源文件
        console.log("未指定书源文件，根据url自动匹配...")
        try {
            bookSourcePath = await deduceBookSourceFromUrl(url, "./bookSource")
        } catch (error) {
            console.log(">> 根据url自动匹配书源失败，退出程序... <<")
            console.log(error)
            return;
        }
    } else { // 指定书源文件
        bookSourcePath = './bookSource/' + bookSourceName;
    }

    console.log(">> 获取书源...")
    console.log(">> 书源文件: " + bookSourcePath)
    // 书源 json, {bookSourceName, bookSourceUrl, getBookInfo, getBookContent}
    bookSource = Hjson.parse(fs.readFileSync(bookSourcePath, 'utf8'))
    console.log(`>> 书源已确定: "${bookSource.bookSourceName}", "${bookSource.bookSourceUrl}"`)

    // 将 json 中的两个 函数字符串转换为可执行函数
    // 但这两个函数字符串转换必须要放在 下面的 page.evaluate 回调函数中，否则会报错
    // bookSource.getBookInfo = new Function(bookSource.getBookInfo.arguments, bookSource.getBookInfo.body);
    // bookSource.getContent = new Function(bookSource.getContent.arguments, bookSource.getContent.body);

    // 这里初始化一下不在 page.evaluate 中使用的工具函数
    // 从章节url中获取书籍id的函数
    bookSource.getBookID = new Function(bookSource.getBookID.arguments, bookSource.getBookID.body);
    // 获取书籍主页url的函数
    bookSource.getHomeUrl = new Function(bookSource.getHomeUrl.arguments, bookSource.getHomeUrl.body);
    // 格式化小说正文内容的函数
    bookSource.formatContentText = new Function(bookSource.formatContentText.arguments, bookSource.formatContentText.body);
    
    console.log(">> 书源初始化完成\n")
    // 如果有书源注释信息，打印注释信息
    if(bookSource.note) console.log("书源信息: \n" + bookSource.note + "\n")



    // 2. 獲取書籍資訊, js object, {bookname, img, author, intro, homeUrl}
    console.log("啟動浏览器, 获取书籍信息...")
    let bookInfo = await getBookInfo(browser, bookSource, url)
    let bookname = bookInfo.bookname

    bookInfo.bookSourceVersion = bookSource.version // 往书籍信息中添加书源版本号
    bookInfo.crawlerVersion = `lingo34/novel-crawler-cli:v${version}` // 往书籍信息中添加本软件版本号
    
    console.log("书籍信息:\n" + JSON.stringify(bookInfo, null, 4))



    // 3. 格式化資料夾名稱
    // 如果dir目录不是以 / 结尾，添加 /
    if (dir[dir.length - 1] != "/") {
        dir += '/'
    }
    dir += bookname + '/' // 小说名稱資料夾
    console.log(`\n >> 小说将儲存到: (${dir})`)

    // 如果不把 startIndex, endIndex 转换为数字，会出现错误, 例如 532 <= 2500 为 false
    startIndex = parseInt(startIndex)
    endIndex = parseInt(endIndex)


    // ------ 传入参数格式化 end ------

    {
        n = prompt('按任意鍵繼續... 输入 n 退出')
        if (n == 'n') {
            console.log("退出程序...")
            browser.close()
            return;
        }
    }

    // 創建資料夾
    // fs.mkdirSync(`${dir}`, function (err) {
    // })

    try {
        fs.mkdirSync(`${dir}`, { recursive: true }) // 创建小说名稱資料夾
        console.log(`创建目录"${dir}"成功。`)
    } catch (error) {
        if(error.code == 'EEXIST')
            console.log("目录已存在，无需创建。")
        else
        {
            console.log("创建目录失败，未知错误... 打印错误信息:")
            console.log(error)
        }
    }


    // 写入 000 介绍檔案
    // 如果从小说第一页开始爬取，添加 000 小说介绍文件, <= 1 是因为可以填负数
    if (startIndex <= 1) {
        console.log("创建 000 介绍文件...")
        
        // 寫入 000 介绍檔案
        writeFile(`${dir}`, `000.txt`, JSON.stringify(bookInfo, null, 4),
            ` --> ${bookInfo.bookname} / 000 介绍文件 已儲存`, ` #####! <-- 000 介绍文件寫入錯誤 !!!!!  退出程序...######`)
    }

    // 爬取書籍內容
    // 控制浏览器打开新标签页面
    const page = await browser.newPage()
    console.log("标签页已啟動, 开始爬取小说内容...")

    let lastPageData = null; // 上一章的页面
    // 循环爬取小说每一章
    for (pageNum = startIndex; pageNum <= endIndex; pageNum++) {
        // 前往章节页面
        // 检查 url
        if (!url || url == "") {
            console.error(` #####! <-- ${dir} 第${pageNum}章 url为空 !!!!!  退出程序...######`)
            console.log(` url為: "${url}" index 為: ${pageNum}\n`)
            break;
        }
        await page.goto(url).catch(err => {
            console.error(` #####! <-- ${dir} 第${pageNum}章 访问失败 !!!!!  退出程序...######`)
            console.log(` url為: ${url} index 為: ${pageNum}\n`)
            console.log(err)
            return;
        })

        let contentPageData = null; // store the data of the page, js object, {content, title, nextPageUrl}
        // 在新标签中打开要爬取的网页

        // 如果出错，要重試10次
        for (errCount = 0; errCount < 10; errCount++) {
            if (errCount > 9) {
                console.error(` #####! <-- ${dir} 第${pageNum}章 爬取失敗 !!!!!  退出程序...######`)
                console.log(` url為: ${url} index 為: ${pageNum}`)
                return;
            }

            try {
                // 使用evaluate方法在浏览器中执行传入函数（完全的浏览器环境，所以函数内可以直接使用window、document等所有对象和方法）
                // =================== 此处已被替换为hjson, 为content evaluate 函数 ===================
                contentPageData = await page.evaluate((bookSource) => {
                    bookSource.getContent = new Function(bookSource.getContent.arguments, bookSource.getContent.body);
                    return bookSource.getContent(document);
                }, bookSource)
                // 格式化小说正文内容
                contentPageData.content = bookSource.formatContentText(contentPageData.content)
            } catch (err) {
                if (page.url() == bookInfo.homeUrl) {
                    console.log(" #####! <-- 爬取完畢, 本页是目录页: home url.  退出程序...######")
                    return;
                }
                console.error(` #####! <-- ${dir} 第${pageNum}章 爬取失敗，正在重試... ${errCount + 1}/10`)
                await page.reload();
                continue;
            }

            break;
        }

        // 检查 contentPageData 是否存在
        if(!contentPageData){
            console.error(` #####! <-- ${dir} 第${pageNum}章 爬取失敗 !!!!! contentPageData 为空 退出程序...######`)
            console.log(` url為: ${url} index 為: ${pageNum}`)
            console.log(`上一个页面的数据为: ${JSON.stringify(lastPageData, null, 4)}`)
            break;
        }
        // 检查 contentPageData 各个属性是否存在
        if(!contentPageData.content || !contentPageData.title){
            console.error(` #####! <-- ${dir} 第${pageNum}章 爬取失敗 !!!!! contentPageData 小说正文/标题/下一页url爬取失败  退出程序...######`)
            console.log(` url為: ${url} index 為: ${pageNum}`)
            console.log(`contentPageData 为 ${JSON.stringify(contentPageData, null, 4)}`)
            console.log(`上一个页面的数据为: ${JSON.stringify(lastPageData, null, 4)}`)
        }


        // 如果本页标题与上一页标题相同, 应当是同章分页, 合并内容
        if(lastPageData && contentPageData.title == lastPageData.title){
            console.log(` <-- ! ${dir} 第${pageNum}章: ${contentPageData.title} - 與上一章 ${pageNum-1} 標題相同, 写入同一个文件`)
            contentPageData.content = lastPageData.content + '\n' + contentPageData.content // 合并内容
            pageNum--; // 页数减一
        }

        // 寫入檔案
        //          (目录位置/, 檔案名稱, 檔案內容, 成功訊息, 失敗訊息)
        writeFile(`${dir}`, `${pageNum.toString().padStart(2, '0')} ${contentPageData.title}.txt`,
            contentPageData.content,
            ` --> ${dir} 第${pageNum}章: ${contentPageData.title} 已儲存`,
            ` #####! <-- ${dir}/ 第${pageNum}章: 寫入錯誤或data為空 !!!!!  退出程序...######`)

        // 前往下一页
        
        if (!contentPageData.nextPageUrl || contentPageData.nextPageUrl == bookInfo.homeUrl) {
            console.log(` #####! <-- 爬取完畢. 下一页url不存在或下一页是返回目录页\n 下一页url = "${contentPageData.nextPageUrl}"  退出程序...######`)
            break;
        }
        url = contentPageData.nextPageUrl;
        lastPageData = contentPageData;

        //await sleep(200);
    }




    // 关闭浏览器
    await browser.close()

    console.log(" --- 任務完成 --- ")
}



//! ---- Novel Tools ----
// 根据小说目录页的url，推断小说源, 并返回小说源文件的相对路径, 如果找不到，返回null
async function deduceBookSourceFromUrl(url, bookSourceDir)
{
    url = new URL(url);

    // 从小说目录页的url推断小说源
    // ? 我想删除子域名, 只搜索主域名, 但是不知道怎么做
    let host = url.hostname.replace("www.", "");

    let bookSource = findBookSourceByHost(bookSourceDir, host)[0]
    if (!bookSource || bookSource == "") {
        console.error(" #####! <-- 未找到匹配的小说源, 退出程序...######")
        return null;
    }
    return bookSource;
}



// 获取小说封面、作者、简介，并生成 000 小说介绍文件所需的字符串
// 返回 {bookname, img, author, intro, homeUrl}
async function getBookInfo(browser, bookSource, chapterUrl) {

    console.log(" --- 正在获取小说信息 --- ")
    // 获取小说主页url
    let homeUrl = bookSource.getHomeUrl(bookSource.getBookID(chapterUrl));

    // 控制浏览器打开新标签页面
    const page = await browser.newPage()
    await page.goto(homeUrl)

    let data = null;

    try {
        // 使用evaluate方法在浏览器中执行传入函数
        //  ==================== 已被替换为 hjson get book info. 为 evaluate 函数 ====================
        data = await page.evaluate((bookSource) => {
            // 书源中的函数，用于获取小说信息
            // ## 为什么必须要在 page.evaluate 内部进行 JSON 函数的转换？
            // 大概是因为page.evaluate的js代码是在浏览器中执行的，而不是在nodejs中执行的
            // 如果有传递参数, 比如这里的 bookSource (object), 会被转换成 JSON string
            // 但是 JSON 不能传递函数, JSON string 中的函数是不能被执行的
            // 所以不能在 page.evaluate 外面把书源JSON提供的string格式函数提前转换成可执行函数再进来
            // 要在 page.evaluate 内部把书源JSON提供的string格式函数转换成可执行函数函数
            bookSource.getBookInfo = new Function(bookSource.getBookInfo.arguments, bookSource.getBookInfo.body);

            return bookSource.getBookInfo(document); // 调用书源中的函数来获取小说信息， 传入document对象
        }, bookSource)
    } catch (err) {
        console.error(` #####! <-- 000 介绍文件 爬取失敗，正在报错...`)
        throw err;
    }
    data.homeUrl = homeUrl;
    data.intro = convertToPlainText(data.intro);

    page.close(); // 关闭页面
    return data;

}


//convert html to plain text
function convertToPlainText(str) {
    try {
        // 將 <br/> 和 <br> 轉換為換行符
        str = str.replace(/<br\s*\/?>/g, "\n");
        // 將 &nbsp; 轉換為空格
        str = str.replace(/&nbsp;/g, "");
    } catch (err) {
        console.log(err)
    }
    return str;
}

async function getFullHtml(browser, url)
{

    // 控制浏览器打开新标签页面
    const page = await browser.newPage()
    await page.goto(url)

    let data = null;

    // await page.screenshot({
    //     path: 'jojojojo.png',
    //     type: 'png',
    //     // quality: 100, 只对jpg有效
    //     fullPage: true,
    //     // 指定区域截图，clip和fullPage两者只能设置一个
    //     // clip: {
    //     //   x: 0,
    //     //   y: 0,
    //     //   width: 1000,
    //     //   height: 40
    //     // }
    //   });

    

    try {
        // 使用evaluate方法在浏览器中执行传入函数
        //  ==================== 已被替换为 hjson get book info. 为 evaluate 函数 ====================
        data = await page.evaluate(() => {

            return document.body.innerHTML; // 直接回传页面的html, 用于测试
        })
    } catch (err) {
        console.error(`\n\n #####! <-- 页面 "${url}" 爬取失敗，正在报错...\n\n`)
        throw err;
    }
    // console,log(data)
    page.close(); // 关闭页面

    return data;
}



//! ---- General Tools ----

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 递归查找目录下的所有hjson 文件中的bookSourceUrl 字段是否包含host
// 返回包含指定host字符串的书源文件路径数组
function findBookSourceByHost(dir, host) {
    const files = fs.readdirSync(dir);
    const result = [];

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            result.push(...findBookSourceByHost(filePath, host));
        } else if (stat.isFile() && path.extname(file) === '.hjson') {
            const currentBookSource = Hjson.parse( fs.readFileSync(filePath, 'utf8') );

            if (currentBookSource.bookSourceUrl.indexOf(host) !== -1) {
                return result.push(filePath);
            }
        }
    });

    return result;
}

// 封装fs.writeFile, 如果写入错误, 递归重试10次
// dir: 檔案目录, fileName: 檔案名稱, data: 檔案內容, 
// successMessage: 成功訊息, errMessage: 失敗訊息, 
// attempts: 重試次數, 调用时不用传参
function writeFile(dir, fileName, data, successMessage, errMessage, attempts = 1) {
    
    // 如果失败, 重試10次
    fs.writeFile(`${dir}${sanitizeFileName(fileName)}`, data, function (err) {
        if (err) {
            console.log(errMessage)
            console.log(err);
            if (attempts >= 10) {
                console.log(` #####! --- 寫入錯誤, 第10重试失敗, 退出程序... ######`)
                return false
            }
            else
            {
                console.log(` #####! --- 寫入錯誤, 正在重试: ${attempts+1}/10 ######`)
                return writeFile(dir, fileName, data, successMessage, errMessage, attempts + 1);
            }
        };
        console.log(successMessage);
        return true;
    });

        
        
        // try {
            

        // } catch (err) {
        //     if (i >= 10) {
        //         console.log(` #####! --- 寫入錯誤, 第10重试失敗, 退出程序... ######`)
        //         console.error(err);
        //         return
        //     }
        //     console.log(` #####! --- 寫入錯誤, 正在重试: ${i}/10 ######`)
        //     sleep(500); // 等待0.5秒后重试
        //     continue;
        // }
}


function sanitizeFileName(str) {
    return str.replace(/[\\/:*?"<>|]/g, '_');
}







