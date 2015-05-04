let http = require('http')
let fs = require('fs')

http.createServer((req, res) => {

    async() => {
      res.setHeader('Content-Type', 'application/json')
      let files = await ls(__dirname)

      res.end(files)
    }().catch(e => console.log(e.stack))

}).listen(8000, '127.0.0.1')

console.log('Server running at http://127.0.0.1:8000/')

require('songbird')
async function ls(dirPath) {
    let files = await fs.promise.readdir(dirPath)

    return JSON.stringify(files)
}
