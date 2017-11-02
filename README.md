#AGS Project

## 获取代码
```
git clone https://github.com/guzhongren/YanqiProject.git
```
将下载下来的文件目录copy至Web容器下即可。

## 配置ags api

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


