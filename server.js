//原生模块
var http = require('http');
var fs = require('fs');
var url = require('url');
//自定义模块
var router = require('./router.js');

http.createServer(function (request, response) {
    //获取客户端访问的路径
    var pathname = url.parse(request.url).pathname;
    //如果用户只输入域名就改变访问路径，并发送主页的内容给客户端
    if (pathname == "/") {
        pathname = "/index.html";
    }
    //获取当前请求客户端的IP地址
    var ipv4 = get_client_ipv4(request);
    //输出日志到控制台
    showLog(ipv4, ("请求" + decodeURI(pathname)));
    //判断文件是否存在
    fs.exists(__dirname + decodeURI(pathname), function (exists) {
        if (exists) {
            //使用router模块的函数
            router.readFileBySuffixName(pathname, fs, request, response);
        } else {
            console.log(decodeURI(pathname) + "文件不存在！");
            //文件不存在，向客户端发送404状态码，并发送该文件不存在的字符串
            response.writeHead(404, {
                "Content-Type": "text/plain"
            });
            response.end(pathname + "文件不存在！");
        }
    });
}).listen(80); //监听80端口

console.log('web服务已运行！');

/**
 * @desc 获取IPV4地址
 * @param req htttp.request
 * @return string 32位IP地址
 */
function get_client_ipv4(req) {
    //获取任意浏览器的IP地址，
    var ip = req.headers['x-forwarded-for'] ||
        req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress || '';
    //获取到的IP地址中存在IPV4和IPV6的地址，我们只需要IPV4的地址
    if (ip.split(',').length > 0) {
        ip = (ip.split(',')[0]).match(/(\d+\.\d+\.\d+\.\d+)/)[0];
    }
    return ip;
};

/**
 * @desc 向控制台输出日志，自动在头部添加时间、地址
 * @param ipv4 string
 * @param message string
 */
function showLog(ipv4, message) {
    //获取当前时间
    var date = new Date();
    //转换为本地时间的字符串形式并输入到控制台
    console.log(date.toLocaleDateString() + " " + date.toLocaleTimeString() +
        " " + ipv4 + " " + message);
}