<template>
<page title="AJAX Demos">
  <panel>
    <h1 slot="header-left">AJAX Demos</h1>
  </panel>
</page>
</template>

<script>
import { resolve } from 'path';

export default {

  /**
   * 默认数据
   */
  data() {
    return {}
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
      }),
      params,
      res2,
      res3,
      res4,
      undefined,
      response1,
      response2

    /**
     * * DEMO 2
     * this.$ajax.get(...)
     */
    params = {
      foo: 111,
      bar: 222
    }
    res2 = await this.$ajax.get(`/vue/data.json?abc=${ params.foo }&xyz=${ params.bar }`)
    res3 = await this.$ajax.get('/vue/data.json', {
      params: {
        foo: 1,
        bar: 2
      }
    })

    /**
     * * DEMO 3
     * this.$ajax.post(...)
     */
    res4 = await this.$ajax.get('/vue/data.json', {
      data: {
        foo: 1,
        bar: 2
      }
    });

    /**
     * * DEMO 4
     * 批量请求
     */
    [a, b, c] = await this.$ajax.seine([
      '/vue/data.json',
      '/vue/datas-404.json',
      '/vue/data.json'
    ]);

    /**
     * * DEMO 5
     * 批量请求
     */
    [x, y, z] = await this.$ajax.seine([

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
    ])

    /**
     * * DEMO 6
     *
     */
    response1 = await this.$ajax.get('/vue/data.json')
    response2 = await this.$ajax.get(`/vue/data.json?foo=${ response1.data }`)

    console.log(response2)

    console.log(a, b, c, x, y, z, res1, res2, res3, res4)
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
