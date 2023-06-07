// https://gist.github.com/lingo34/2c5546155f7d65cede8a0a6e10946e02
// 此函数将cookie字符串转换为标准的json格式
// 把你从浏览器中复制出来的cookie字符串粘贴到命令行中，然后按回车，就会得到标准的json格式的cookie
// 比如, 如果你在浏览器中执行 document.cookie, 就会得到像这样的字符串:
// 'newstatisticUUID=123456_56789876543; _csrfToken=7JHGYUi87yhj93ieuhd; fu=23432; supportWebp=true; traffic_utm_referer=; navWelfareTime=23454322345; _gid=GA1.2.2345432.34543234; Hm_lvt_3we4ret543erwfd=23432; supportwebp=true; _yep_uuid=2134re-3ew-we-were-4wret; Hm_lpvt_q3wewsrdf=343234; e1=3ewrf32ewde43wer; _ga=GA1.1.2343.3243542; _ga_FZMMH98S83=GS1.1.123454.2.0.123452.0.0.0; _ga_w4rgsLV3P=GS1.1.3243.2.0.3242343.0.0.0; e2=4wegrvsf_4wfgr'
// 本程序可以把这种字符串转换为标准的json格式, 你可以把它保存到cookie.json文件中, 然后在其他程序中使用

// This function converts a cookie string to a standard JSON format.
// Copy the cookie string from your browser and paste it into the command line, then press Enter. You will get the cookie in standard JSON format.
// For example, if you execute document.cookie in the browser, you will get a string like this:
// 'newstatisticUUID=123456_56789876543; _csrfToken=7JHGYUi87yhj93ieuhd; fu=23432; supportWebp=true; traffic_utm_referer=; navWelfareTime=23454322345; _gid=GA1.2.2345432.34543234; Hm_lvt_3we4ret543erwfd=23432; supportwebp=true; _yep_uuid=2134re-3ew-we-were-4wret; Hm_lpvt_q3wewsrdf=343234; e1=3ewrf32ewde43wer; _ga=GA1.1.2343.3243542; _ga_FZMMH98S83=GS1.1.123454.2.0.123452.0.0.0; _ga_w4rgsLV3P=GS1.1.3243.2.0.3242343.0.0.0; e2=4wegrvsf_4wfgr'
// This program can convert such a string into a standard JSON format. You can save it to a file named cookie.json and use it in other programs.
function cookieStringToJsonText()
{
    const cookieString = "put_your_cookies_string_here";

    const cookiePairs = cookieString.replaceAll("'", "").split('; ');
    const cookies = [];

    for (const pair of cookiePairs) {
    const [name, value] = pair.split('=');
    const cookie = {
        name: name.trim(),
        value: value.trim()
    };
    cookies.push(cookie);
    }

    console.log("\n\n\n")
    console.log(JSON.stringify(cookies));
    return cookies;
}

cookieStringToJsonText();
