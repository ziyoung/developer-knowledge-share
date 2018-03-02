## JSON parse

### 希望能创建出一个更好的氛围

年前说，希望新年后能多开几次分享会，促进公司的开发者之间的交流。

我希望能在交流会上分享出更多的业务之外的通用知识。什么样的项目符合这个要求呢？我认为 JSON 字符串的解析挺合适的:

1. 大家对 JSON 比较熟悉，在项目中又是经常用到。

2. 编写一个解析 JSON 字符串的函数代码量不大，可以在 1 个小时内可以讲完。

这个项目很简单，为了不引入过多的知识，从而更加专注于项目本身，我们这里也不使用 gulp 或者 jest 等。


### 简介

[JSON](http://JSON.org)是一种轻量级的数据交换格式。我们开发者对 JSON 再熟悉不过了。后台的接口返回的数据大都是 JSON 格式的。常见的编程语言对 JSON 都有着非常好的支持，比如在 javascript 中可以直接使用 [JSON.parse](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse) 来解析 JSON 字符串，使用 [JSON.stringify](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)将一个 javaScript 值转换为 JSON 字符串。

假设我们不使用第三方库或者内置的 API ，那么该如何解析 JSON 字符串或者对数据进行序列化呢？😅

这个问题也并没有想象的那么困难。😂 [json_parse.js](https://github.com/douglascrockford/JSON-js/blob/master/json_parse.js) 中包括代码包含注释的话也超过 400 行！

所以今天我们就使用 js 来编写一个 JSON 的解析与序列化小型库。

[PPT地址](https://ppt.baomitu.com/d/901a1db0)