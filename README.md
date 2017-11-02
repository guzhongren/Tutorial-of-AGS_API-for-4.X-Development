# AGS Project

## 获取代码
```
https://github.com/guzhongren/Tutorial-of-AGS_API-for-4.X-Development.git
```
将下载下来的文件目录copy至Web容器下即可。

## 配置AGS API

在[官网](https://developers.arcgis.com/javascript/latest/guide/get-api/index.html)下载4.X版本的API,解压后将4.X目录下的所有文件拷贝至Web-Root/arcgis_js_api目录下；按照官方文档修改init.js和dojo.js中的路径，本文修改如下,将
```
[HOSTNAME_AND_PATH_TO_JSAPI]
```
替换为
```
/arcgis_js_api/
```
结果显示如下

![api 配置结果](./gitImage/AGS_API_config.png)

## 全局安装httpserver
```
npm install httpserver -g  # yarn add global httpserver
```
## 启动项目
在当前目录运行如下命令，并在浏览器打开命令中提示的网址
```
httpserver
```
