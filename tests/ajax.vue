<template>
<page title="AJAX Demos">
    <panel>
        <h1 slot="header-left">AJAX Demos</h1>
    </panel>
</page>
</template>

<script>
import { resolve } from 'path';

let {alert, location} = window
let [aaa, bbbb] = [1, 2]

let funca = () => {
}

let funcb = (a) => a + 1

async function funcc() {
  let a = await $.ajax.get({
    url: '?x=12'
  })
}

class a extends Event {
  constructor() {
    return a
  }
  static a = 2
  get adas() {
    return 2
  }
  async a(a) {
    return a * a
  }
}

var a = 1
var bb = 2
var b = 2

let x = 1
let y = 23
let z = {
  a: 2,
  bb: 2,
}

export default {

  /**
   * 默认数据
   */
  data() {
    return {};
  },

  /**
   * AJAX Examples
   */
  async created() {

    /**
     * DEMO 1
     * this.$ajax(...)
     */
    let res1 = await this.$ajax({
      url: '/vue/data.json',

      method: 'get', // 'post',

      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      },

      // 做为 URL parameters
      params: {
        foo: 1,
        baz: 2
      },

      // data 为 request body
      data: {
        foo: 1,
        baz: 2
      }
    });

    /**
     * * DEMO 2
     * this.$ajax.get(...)
     */
    let params = {
      foo: 111,
      bar: 222
    };
    let res2 = await this.$ajax.get(`/vue/data.json?abc=${ params.foo }&xyz=${ params.bar }`);
    let res3 = await this.$ajax.get('/vue/data.json', {
      params: {
        foo: 1,
        bar: 2
      }
    });

    /**
     * * DEMO 3
     * this.$ajax.post(...)
     */
    let res4 = await this.$ajax.get('/vue/data.json', {
      data: {
        foo: 1,
        bar: 2
      }
    });

    /**
     * * DEMO 4
     * 批量请求
     */
    let [a, b, c] = await this.$ajax.seine([
      '/vue/data.json',
      '/vue/datas-404.json',
      '/vue/data.json'
    ]);

    /**
     * * DEMO 5
     * 批量请求
     */
    let [x, y, z] = await this.$ajax.seine([

      // api 1, 直接填 url
      '/vue/data.json?x=22222',

      // api 2
      this.$ajax.get('/vue/data.json'),

      // api 3
      // this.$ajax.post('/vue/data.json', {data: {foo: 1, bar: 2}}),

      // api 4
      // 复杂的请求配置，
      // 配置项请参考：https://www.npmjs.com/package/axios#request-config
      {
        url: '/vue/data.json',
        method: 'post',

        // request body
        data: {
          foo: 1,
          baz: 2
        }
      }
    ]);

    /**
     * * DEMO 6
     *
     */
    let response1 = await this.$ajax.get('/vue/data.json');
    let response2 = await this.$ajax.get(`/vue/data.json?foo=${ response1.data }`);

    console.log(response2);

    console.log(a, b, c, x, y, z, res1, res2, res3, res4);
  }
}

</script>

<style lang="less" scoped="">
.animate-number {
    border-bottom: 1px solid #ccc;
    padding: 2rem 1rem;
    display: block;
    &amp;
    .hide {
        display: none;
    }
}
</style>
