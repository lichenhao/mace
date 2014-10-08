var util = require('../');
var debug = util.debug;
'1234567890'.split('').forEach(function (i) {
  debug('test:debug'+i)('this is test debug %s',i);
});

console.log(process.env, __dirname, require('path').resolve('./'));