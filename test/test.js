var mace = require(__dirname + '/../lib/mace.js');

function  A () {}
mace.klass(A, require('events').EventEmitter, {
  get name() {
    return A.N;
  },
  set name(n) {
    A.N = n;
  }
}, {
  get N() {
    return this._n;
  },
  set N(n) {
    this._n = n;
  }
});

var ret = new A;

ret.name = 'adfadf';

console.log(ret, require('events').EventEmitter);
