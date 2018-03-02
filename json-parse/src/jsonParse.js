// JSON parser

class JsonParser {
  // 
  constructor(text = '') {
    this.text = text
    this.currentChar = ' '
    this.currentIndex = 0
    this.escapes = {
      '"': '"',
      '\\': '\\',
      '/': '/',
      n: '\n',
      r: '\r',
      t: '\t'
    }
  }
  expect(ch, expectCh) {
    if (ch !== expectCh) {
      console.error(`期望值: ${expectCh} 实际值: ${ch}，索引值: ${this.currentIndex}`)
      throw new Error('SyntaxError')
    }
  }
  parse () {
    const value = this.value()
    this.skipWhite()
    if (this.currentChar) {
      // null123
      throw new Error(`存在多余的字符 ${this.text.substr(this.currentIndex - 1)}`)
    }
    return value
  }
  value() {
    this.skipWhite()
    switch (this.currentChar) {
      case '{':
        return this.parseObject()
      case '[':
        return this.parseArray()
      case '"':
        return this.parseString()
      case '-':
        return this.parseNumber()
      default:
        // 在 parseWord 中，需要判断异常
        return this.isDigit(this.currentChar) ? this.parseNumber() : this.parseWord()
    }
  }
  // 跳过空白字符
  skipWhite() {
    while (this.currentChar && this.currentChar <= ' ') {
      this.next()
    }
  }
  isDigit(char) {
    return char >= '0' && char <= '9'
  }
  next() {
    // 获取当前的 char
    this.currentChar = this.text.charAt(this.currentIndex)
    // 移动到下一位
    this.currentIndex += 1
    return this.currentChar
  }
  /**
   * 解析数字
   * 语法规则: http://json.org/number.gif
   * 几种特殊的情况:
   * -0
   * 123e01 // 科学计数法后面的指数第一位可以为 0
  */
  parseNumber() {
    let num = 0 // 最终的返回值
    let str = '' // 数字
    if (this.currentChar === '-') {
      str = '-'
      // - 之后必须是数字
      this.next()
      // 直接使用 this.currentChar 也是一样的
      if (!this.isDigit(this.currentChar)) {
        throw new Error('- 号后面必须是数字')
      }
    }
    if (this.currentChar === '0') {
      str += '0'
      this.next()
      if (this.isDigit(this.currentChar)) {
        throw new Error('0 号后面不能是数字')
      }
    }
    // 获取整数部分的数字
    while (this.isDigit(this.currentChar)) {
      str += this.currentChar
      this.next()
    }
    // 小数部分
    if (this.currentChar === '.') {
      str += '.'
      this.next()
      if (!this.isDigit(this.currentChar)) {
        throw new Error('. 后面必须是数字')
      }
      // do while 更好一些
      while (this.isDigit(this.currentChar)) {
        str += this.currentChar
        this.next()
      }
    }
    // 处理 e 或者 E 后面的部分
    // 注意 类似这样的是合法的 1234E01
    if (this.currentChar === 'e' || this.currentChar === 'E') {
      str += this.currentChar
      this.next()
      if (this.currentChar === '-' || this.currentChar === '+') {
        str += this.currentChar
      }
      if (!this.isDigit(this.currentChar)) {
        throw new Error(`${str.substr(-1)}后面必须是数字`)
      }
      // do while ??
      while (this.isDigit(this.currentChar)) {
        str += this.currentChar
        this.next()
      }
    }
    // console.log(`str ==> ${str}`)
    num = parseFloat(str)
    if (!isFinite(num)) {
      throw new Error('数字的大小超出了可解析的范围')
    }
    return num
  }

  parseString() {
    let str = ''
    if (this.currentChar === '"') {
      while (this.next()) {
        if (this.currentChar === '"') {
          this.next()
          return str
        }
        // 转义字符
        if (this.currentChar === '\\') {
          this.next()
          // unicode 编码
          if (this.currentChar === 'u') {
            let hex = 0
            let ufff = 0
            // four-hex-digits
            for (let index = 0; index < 4; index++) {
              this.next() // 手动向前移动四位
              hex = parseInt(this.currentChar, 16)
              if (typeof hex !== number) {
                throw new Error('unicode 码不符合规范')
              }
              // ufff = ufff * 16 + hex
              ufff = hex * Math.pow(16, 4 - index) + ufff
            }
            str += String.fromCharCode(ufff)
          } else if (typeof this.escapes[this.currentChar] === 'string') {
            str += this.escapes[this.currentChar]
          } else {
            throw new Error('存在非法的转义字符')
          }
        } else {
          str += this.currentChar
        }
      }
      throw new Error('缺少一个 " 号')
    }
  }

  // 解析 true false 或者 null
  parseWord() {
    switch (this.currentChar) {
      case 't':
        this.expect(this.next(), 'r')
        this.expect(this.next(), 'u')
        this.expect(this.next(), 'e')
        this.next()
        return true
      case 'f':
        this.expect(this.next(), 'a')
        this.expect(this.next(), 'l')
        this.expect(this.next(), 's')
        this.expect(this.next(), 'e')
        this.next()
        return false
      case 'n':
        this.expect(this.next(), 'u')
        this.expect(this.next(), 'l')
        this.expect(this.next(), 'l')
        this.next()

        return null
      default:
        break
    }
    throw new Error('非法的字符')
  }

  parseArray() {
    const arr = []
    if (this.currentChar === '[') {
      this.next()
      this.skipWhite()
      // 先判断数组是否为空
      if (this.currentChar === ']') {
        this.next()
        return arr
      }
      // 非空的数组元素之间有 , 分隔符
      while (this.currentChar) {
        arr.push(this.value())
        this.skipWhite()
        if (this.currentChar === ']') {
          this.next()
          return arr
        }
        this.expect(this.currentChar, ',')
        this.next()
        this.skipWhite()
      }
    }
    throw new Error('非法的数组')
  }
  parseObject() {
    const obj = {}
    if (this.currentChar === '{') {
      this.next()
      if (this.currentChar === '}') {
        this.next()
        return obj
      }
      while (this.currentChar) {
        // 解析对象的 key
        const key = this.parseString()
        this.skipWhite()
        // 接下来是 :
        this.expect(this.currentChar, ':')
        this.next()
        if (typeof obj[key] !== 'undefined') {
          throw new Error('object 存在重复的 key ')
        }
        obj[key] = this.value()
        this.skipWhite()
        if (this.currentChar === '}') {
          this.next()
          return obj
        }
        this.expect(this.currentChar, ',')
        this.next()
        this.skipWhite()
      }
    }
  }
}