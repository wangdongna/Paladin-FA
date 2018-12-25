# Paladin
UI Automation Monitor for Login, only supporting both SSO and Product Main Page

# 代码结构

```
src
   index.ts        //主文件
   logConfig.ts    //日志配置文件
   notification.ts //通知（发邮件，短信）
   prodConfig.ts   //产品配置信息
test               //测试文件夹
Dockerfile         //Docker打包文件
.gitignore         //git上传忽略文件  
package.json       //node的包描述文件
tsconfig.json      //ts的配置文件
yarn.lock          //yarn生成的文件
.env               //开发时用的环境变量，需要问开发要，不上传git
dist/              //生成的JS的文件夹
log/               //生成的log的文件夹
```

# 所需环境变量

```PALADIN_EA_MAIN_URI``` 云能效首页URI

```PALADIN_EA_USERNAME``` 云能效用户名

```PALADIN_EA_PASSWORD``` 云能效密码

```PALADIN_FA_MAIN_URI``` 千里眼首页URI

```PALADIN_FA_USERNAME``` 千里眼用户名

```PALADIN_FA_PASSWORD``` 千里眼密码

```PALADIN_MA_MAIN_URI``` 机器顾问首页URI

```PALADIN_MA_USERNAME``` 机器顾问用户名

```PALADIN_MA_PASSWORD``` 机器顾问密码

```PALADIN_DA_MAIN_URI``` 变频顾问首页URI

```PALADIN_DA_USERNAME``` 变频顾问用户名

```PALADIN_DA_PASSWORD``` 变频顾问密码

```PALADIN_ITA_MAIN_URI``` 信息顾问首页URI

```PALADIN_ITA_USERNAME``` 信息顾问用户名

```PALADIN_ITA_PASSWORD``` 信息顾问密码

```PALADIN_METAL_HOST``` Metal地址，如：http://pft-mt.hz.ds.se.com

```PALADIN_ALERT_EMAIL``` 异常后发送邮件的地址，可以逗号（半角）隔开，如：tan-tt.tan@se.com

```PALADIN_ALERT_PHONE``` 异常后发送短信的电话号码，可以逗号（半角）隔开，如：13810001000

```PALADIN_ALERT_COUNTER``` 异常后发送短信或邮件的次数，如：50

```ALI_SDK_OSS_ENDPOINT``` OSS的地址，如：oss-cn-hangzhou.aliyuncs.com

```ALI_SDK_STS_SECRET``` 阿里云的Secret

```ALI_SDK_STS_ID``` 阿里云ID

```OSS_DATA_BUCKET``` 阿里云OSS的bucket的名字，用来存储测试的截图，如：se-test-data

```LOG_LEVEL``` LOG的级别，默认是DEBUG，生产环境应该是INFO

```NODE_ENV``` 环境，在开发环境下是：development，生产环境下是production

```MEMCACHIER_SERVERS``` OCS的地址，如： m-bp12bb4ee91a8ac4.memcache.rds.aliyuncs.com:11211

```MEMCACHIER_USERNAME``` OCS的用户名，如：m-bp12bb4ee91a8ac4

```MEMCACHIER_PASSWORD``` OCS的密码


# 如何运行开发环境
1. 需要进行node包的安装，运行 ```yarn```
2. 打开一个Terminal，运行```npm run watch```，这步把TS编译成JS
3. 打开另一个Terminal，运行```npm run dev```，这步启动NodeJS


# 如何打包成Docker
1. 打包成镜像的命令
```sudo docker build -t paladin-1.0.0 .```

