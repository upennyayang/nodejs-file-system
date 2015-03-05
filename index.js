let http = require('http')
let fs = require('fs')
let url = require('url')
var querystring = require('querystring')
let path = require('path')
let _ = require('lodash')


require('songbird')
async function ls(dirPath) {
    let stat = await fs.promise.stat(dirPath)
    if(!stat.isDirectory()) return [dirPath]

    let promises = []
    for(let name of await fs.promise.readdir(dirPath)) {
        // console.log(name, ":", path.join(dirPath, name))
        let promise = ls(path.join(dirPath, name))
        promises.push(promise)
    }
    return JSON.stringify(_.flatten(await promises))
}

http.createServer((req, res) => {

    async() => {
      res.setHeader('Content-Type', 'application/json')
      let urlobject = url.parse(req.url)
      let pathname = urlobject.pathname
      let query = urlobject.query

      // parse querystring
      let store = querystring.parse(query).store

      if(store === 'local') {
        let files = await ls(pathname)
        res.end(files)

      } else if(store === 'dropbox') {
        res.end('dropbox')
      }

    }().catch(e => console.log(e.stack))

}).listen(8000, '127.0.0.1')

console.log('Server running at http://127.0.0.1:8000/')


