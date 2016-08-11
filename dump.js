let path = require('path');

let Promise = require('bluebird');
let fs      = Promise.promisifyAll(require('fs'))

let startingDir = process.argv[2];

function isDirectory(path_string) {
  return fs.lstatSync(path_string).isDirectory()
}

function parseDirectories(dir) {
  return Promise.all(fs.readdirAsync(dir)
    .map(file => {
      let filePath = path.resolve(__dirname, dir, file)
      if (isDirectory(filePath)) {
        return parseDirectories(filePath);
      } else {
        return file;
      }
    })
  )
  .then(function(contents) {
    return {
      dir: `${dir.match(/([^\/]*)\/*$/)[1]}/`,
      contents: contents
    }
  })
}

function indentAndPrint(arr, indent) {
  arr.forEach(file => {
    if (typeof file == "object") {
      console.log(`${indent}${file.dir}`);
      indentAndPrint(file.contents, `${indent}  `)
    } else {
      console.log(`${indent}${file}`);
    }
  })
}

parseDirectories(startingDir)
  .then(res => {
    return res.contents
  })
  .then(projectStructure => indentAndPrint(projectStructure, ""))
