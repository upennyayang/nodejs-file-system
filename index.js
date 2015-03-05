let http = require('http')
let fs = require('fs')
let url = require('url')
var querystring = require('querystring')
let path = require('path')
let _ = require('lodash')
let Dropbox = require('dropbox')

require('songbird')

const DROPBOX_KEY = 'gcdo9qr6gl1yeh2'
const DROPBOX_SECRET = 'y4viuwev7rzso30'
const DROPBOX_TOKEN = 'XvTHGkH7ucYAAAAAAAAGjMDhlk-hpEQkttbSGoF3-ad2yjunPith6ISzKH-ki-No'

let dropboxClient = new Dropbox.Client({
    key: DROPBOX_KEY,
    secret: DROPBOX_SECRET,
    token: DROPBOX_TOKEN
})

async function main() {
    await dropboxClient.promise.authenticate()

    http.createServer((req, res) => {

        async() => {
          res.setHeader('Content-Type', 'application/json')
          let urlobject = url.parse(req.url)
          let pathname = urlobject.pathname
          let query = urlobject.query

          // parse querystring
          let store = querystring.parse(query).store

          console.log("--- Store: " + store + "---")
          if(store === 'local' || store == 'dropbox') {
            let files = await readDir(pathname, store)
            res.end(files)
           } else {
            res.statusCode = 400
            res.end('400')
          }

        }().catch(e => console.log(e.stack))

    }).listen(8000, '127.0.0.1')

}

async function readDir(dirPath, store) {
    let isDir = await isDirectory(dirPath, store)
    if(!isDir) return [dirPath]

    if(store === 'local') {
        let promises = []
        for(let name of await fs.promise.readdir(dirPath)) {
            // console.log(name, ":", path.join(dirPath, name))
            let promise = readDir(path.join(dirPath, name))
            promises.push(promise)
        }
        return JSON.stringify(_.flatten(await promises))

    } else if (store === 'dropbox') {
        console.log("come here")
        console.log(dropboxClient.readdir(dirPath))
        return JSON.stringify(dropboxClient.readdir(dirPath))
    }

}

async function isDirectory(dirPath, store) {
    let isDir = false
    if(store === 'local') {
        let stat = await fs.promise.stat(dirPath)
        isDir = stat.isDirectory()

    } else if(store === 'dropbox') {
        // isDir = await Dropbox.File.Stat.isFolder(dirPath)
        // #TODO: what is the dropbox API?
        isDir = true

    } else {
        isDir = false
    }
    return isDir
}



console.log('Server running at http://127.0.0.1:8000/')

async() => {
  await main()
}()