### 介绍
和消息交换平台进行数据交换的javascript客户端，为网页之间的消息交换提供API，帮助工程师能够快速的搭建基于消息的网页应用。

### 接口
* Router(url)

创建数据路由对象。

* router.publish(exchange)

生成用于发布消息的数据管道，返回channel。

* router.subscribe(exchange, callback)

生成用于订阅消息的数据管道，返回channel。

* channel.push(message)

通过管道向消息交换平台推送消息。

* channel.fetch()

通过管道从消息交换平台接收消息。
