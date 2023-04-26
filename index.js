const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const prompt = require('prompt-sync')()
var Hjson = require('hjson');

main()

// 測試數據
// getBook("https://www.xbiquge.tw/book/54510/38637143.html", '风起龙城')

async function main()
{
    let url = prompt('請輸入开始章节網址: ')
    if(url == '')
    {
        console.log("url為空，退出程序...")
        return;
    }

    let startIndex = prompt('請輸入起始章節(1): ')
    let endIndex = prompt('請輸入結束章節(2000): ')
    if(startIndex == '')
        startIndex = 1;
    if(endIndex == '')
        endIndex = 2000;

    let dir = prompt('請輸入小说存放資料夾(当前目录)/书名: ')
    if(dir == '')
    {
        dir = './'
    }
    console.log(`小说将儲存到: ${dir}小说名/`)

    // 书源文件
    let bookSourceName;
    // 列出所有书源文件
    console.log("\n>> 列出所有书源文件 << \n")
    fs.readdirSync('./bookSource', (err, files) => {
        if (err) {
          console.error(err);
          return;
        }
        files.forEach(file => {
          console.log(file);
        });
    });
    
    bookSourceName = prompt('請指定书源文件, 不指定则根据url自动匹配: ')
    // bookSourceName = './bookSource/' + bookSourceName
    console.log(`书源文件: ${'./bookSource/' + bookSourceName}`)
    
    await getBook(url, startIndex, endIndex, dir, bookSourceName)
}



// this function crawl the content of a novel
// url: 網址, startIndex: 起始章節, endIndex: 結束章節, 
// dir: 存放資料夾, 地址带/结尾, bookSourceDir: 书源文件路径, 为空则根据url自动匹配
async function getBook(url, startIndex, endIndex, dir, bookSourceName)
{
    
    console.log("获取书籍信息, 启动浏览器...")
    
    // 启动浏览器
    const browser = await puppeteer.launch(
        {
            headless: false, // 默认是无头模式，这里为了示范所以使用正常模式
            //args: ["--user-data-dir=./chromeTemp"]
        }
    )

    

    // ------ 传入参数初始化/格式化 ------

    // 1. 根据url 判断书源
    let bookSourcePath = null;
    if(bookSourceName == '' || !bookSourceName)
    { // 未指定书源文件
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
    
    console.log("书源文件: " + bookSourcePath)
    bookSource = null; // 书源 json, {bookSourceName, bookSourceUrl, getBookInfo, getBookContent}
    console.log("获取书源...")

    bookSource = Hjson.parse(fs.readFileSync(bookSourcePath, 'utf8'))
    console.log("\n书源: " + JSON.stringify(bookSource, null, 4) + "\n\n")

    // 将 json 中的两个 函数字符串转换为可执行函数
    // 但这两个函数字符串转换必须要放在 下面的 page.evaluate 回调函数中，否则会报错
    // bookSource.getBookInfo = new Function(bookSource.getBookInfo.arguments, bookSource.getBookInfo.body);
    // bookSource.getContent = new Function(bookSource.getContent.arguments, bookSource.getContent.body);
    // 不过转换个 test 无伤大雅
    bookSource.test = new Function(bookSource.test.arguments, bookSource.test.body);

    console.log("浏览器已啟動, 获取书籍信息...")
    
    
    // 2. 獲取書籍資訊, js object, {bookname, img, author, intro, homeUrl}
    let bookInfo = await getBookInfo(browser, bookSource, url) 
    let bookname = bookInfo.bookname
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
        if(n == 'n')
        {
            browser.close()
            return;
        }
    }

    // 創建資料夾
    fs.mkdir(`${dir}`, function(err) {
        if (err) {
            console.log("目录已存在，无需创建。")
            console.log(err)
        } else {
            console.log(`创建目录"${dir}"成功。`)
        }
    })

    // 如果从小说第一页开始爬取，添加 000 小说介绍文件, <= 1 是因为可以填负数
    if(startIndex <= 1)
    {
        // 寫入 000 介绍檔案
        writeFile(`${dir}`, `000.txt`, JSON.stringify(bookInfo, null, 4), 
        ` --> ${bookInfo.bookname} / 000 介绍文件 已儲存`, ` #####! <-- 000 介绍文件寫入錯誤 !!!!!  退出程序...######`)
    }

    // 控制浏览器打开新标签页面
    const page = await browser.newPage()
    console.log("标签页已啟動, 开始爬取小说内容...")

    // ? debug --------------------------------

    console.log(`startIndex = ${startIndex} endIndex = ${endIndex}`)
    console.log(`typeof startIndex = ${typeof startIndex} endIndex = ${typeof endIndex}, for if else is ${startIndex <= endIndex}`)
    
    // 循环爬取小说每一章
    for(pageNum = startIndex; pageNum <= endIndex; pageNum++)
    {
        // 前往章节页面
        await page.goto(url).catch(err => {
            console.error(` #####! <-- ${dir} 第${pageNum}章 访问失败 !!!!!  退出程序...######`)
            console.log(` url為: ${url} index 為: ${pageNum}\n`)
            console.log(err)
            return;
        })
        // ---- A Page ----
        let data = null; // store the data of the page, js object, {content, title, nextPageUrl}
        // 在新标签中打开要爬取的网页

        // 如果出错，要重試10次
        for(errCount = 0; errCount < 10; errCount++)
        {
            if(errCount > 9)
            {
                console.error(` #####! <-- ${dir} 第${pageNum}章 爬取失敗 !!!!!  退出程序...######`)
                console.log(` url為: ${url} index 為: ${pageNum}`)
                return;
            }

            try{
                // 使用evaluate方法在浏览器中执行传入函数（完全的浏览器环境，所以函数内可以直接使用window、document等所有对象和方法）
                //! =================== 此处应被替换为hjson ===================
                data = await page.evaluate((bookSource) => {
                    
                    // let content = document.querySelector('#content').innerHTML; // 获取小说内容
                    // let title = document.querySelector('.bookname h1').innerHTML; // 获取小说标题
                    // let nextPageUrl = document.getElementById("link-next").href; // 获取下一页的链接
                    bookSource.getContent = new Function(bookSource.getContent.arguments, bookSource.getContent.body);
                    return bookSource.getContent(document);
                }, bookSource)
            } catch (err) {
                if(page.url() == bookInfo.homeUrl)
                {
                    console.log(" #####! <-- 爬取完畢, 本页是目录页: home url.  退出程序...######")
                    return;
                }
                console.error(` #####! <-- ${dir} 第${pageNum}章 爬取失敗，正在重試... ${errCount+1}/10`)
                await page.reload();
                continue;
            }
            
            break;
        }
    
        // 寫入檔案
        //          (目录位置/, 檔案名稱, 檔案內容, 成功訊息, 失敗訊息)
        writeFile(`${dir}`, `${pageNum.toString().padStart(2, '0')} ${data.title}.txt`, 
                    convertToPlainText(data.content, bookname), 
                    ` --> ${dir} 第${pageNum}章: ${data.title} 已儲存`, 
                    ` #####! <-- ${dir}/ 第${pageNum}章: 寫入錯誤或data為空 !!!!!  退出程序...######`)
        
        // 前往下一页
        url = data.nextPageUrl;
        
        if(url == null || url == bookInfo.homeUrl)
        {
            console.log(` #####! <-- 爬取完畢, 本页是目录页: url == "${url}."  退出程序...######`)
            return;
        }

        //await sleep(200);
    }

    

    
    // 关闭浏览器
    await browser.close()

    console.log(" --- 任務完成 --- ")
}



//! ---- Novel Tools ----
// 根据小说目录页的url，推断小说源, 并返回小说源文件的相对路径, 如果找不到，返回null
async function deduceBookSourceFromUrl(url, bookSourceDir) //!! 未完成 ================================== OOOOO
{
    url = new URL(url);
    
    // 从小说目录页的url推断小说源
    // ? 我想删除子域名, 只搜索主域名, 但是不知道怎么做
    let host = url.hostname.replace("www.", "");

    let bookSource = findStringInFiles(bookSourceDir, host)[0]
    if(!bookSource || bookSource == "")
    {
        console.error(" #####! <-- 未找到匹配的小说源, 退出程序...######")
        return null;
    }
    return bookSource;
}



// 获取小说封面、作者、简介，并生成 000 小说介绍文件所需的字符串
// 返回 {bookname, img, author, intro, homeUrl}
async function getBookInfo(browser, bookSource, chapterUrl)
{
    
    // get home url
    var arr = chapterUrl.split("/");
    arr.pop();
    var homeUrl = arr.join("/");
    console.log(homeUrl); // "https://www.xbiquge.tw/book"

    // 控制浏览器打开新标签页面
    const page = await browser.newPage()
    await page.goto(homeUrl)

    let data = null;

    try{
        // 使用evaluate方法在浏览器中执行传入函数
        // ? ==================== 应被替换为 hjson get book info ====================
        data = await page.evaluate((bookSource) => {
            // let bookname = document.querySelector('#info h1').innerHTML; // 获取小说名字
            // let img = document.querySelector('#fmimg img').src; // 获取小说封面
            // let author = document.querySelector('#info p').textContent; // 获取小说作者
            // let intro = document.querySelector('#intro').innerHTML; // 获取小说简介
            // return {bookname, img, author, intro}

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
    data.intro = convertToPlainText(data.intro, data.bookname);
    
    page.close(); // 关闭页面
    return data;
    
}


//convert html to plain text
function convertToPlainText(str, bookname) {
    try{
        // 將 <br/> 和 <br> 轉換為換行符
        str = str.replace(/<br\s*\/?>/g, "\n");
        // 將 &nbsp; 轉換為空格
        str = str.replace(/&nbsp;/g, "");
        // 刪除首行水印
        str = str.replace(new RegExp(`笔趣阁 www.xbiquge.tw，最快更新${bookname} ！`), '');
    }catch(err){
        console.log(err)
    }
    return str;
  }



//! ---- General Tools ----

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 递归查找目录下的所有文件中是否包含指定字符串
// 返回包含指定字符串的文件路径数组
function findStringInFiles(dir, str) 
{
    const files = fs.readdirSync(dir);
    const result = [];
  
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
  
      if (stat.isDirectory()) {
        result.push(...findStringInFiles(filePath, str));
      } else if (stat.isFile() && path.extname(file) === '.hjson') {
        const content = fs.readFileSync(filePath, 'utf8');
  
        if (content.indexOf(str) !== -1) {
          return result.push(filePath);
        }
      }
    });
  
    return result;
  }

// 封装fs.writeFile
// dir: 檔案目录, fileName: 檔案名稱, data: 檔案內容, successMessage: 成功訊息, errMessage: 失敗訊息
function writeFile(dir, fileName, data, successMessage, errMessage)
{
    // 如果失败, 重試10次
    for(let i = 1; i <= 11; i++)
    {
        try {
            fs.writeFile(`${dir}${sanitizeFileName(fileName)}`, data, function (err) 
                {
                    if (err) {
                        console.log(errMessage)
                        throw err
                    };
                    console.log(successMessage);
                    return;
                });
            
        } catch (err) {
            if(i >= 10)
            {
                console.log(` #####! --- 寫入錯誤, 第10重试失敗, 退出程序... ######`)
                console.error(err);
                return
            }
            console.log(` #####! --- 寫入錯誤, 正在重试: ${i}/10 ######`)
            continue;
        }
        break
    }
    //console.log(` #####! --- 未知问题发生，此处不应被抵达, 看起来似乎有bug... ######`)
}


function sanitizeFileName(str) {
    return str.replace(/[\\/:*?"<>|]/g, '_');
}







