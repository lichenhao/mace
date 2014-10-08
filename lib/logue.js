var util = exports;
var lang = require('./util.js');
var color = require('./color.js');
var colors = color.tinyColors;
var config = {
  'logue': {
    'color': 'white'
  },
  'log': {
    'stamp': true,
    'color': 'white'
  },
  'done': {
    'stamp': true,
    'color': 'green'
  },
  'error': {
    'stamp': true,
    'color': 'bgRed',
    'line': true
  },
  'warn': {
    'stamp': true,
    'color': 'yellow'
  },
  'info': {
    'stamp': true,
    'color': 'cyan'
  },
  'trace': {
    'stamp': true,
    'color': 'magenta'
  }
};
function getStack (n) {
  var orig = Error.prepareStackTrace;
  Error.prepareStackTrace = function (err, stack) {
    return stack;
  };
  var err = new Error();
  Error.captureStackTrace(err, arguments.callee);
  var stack = err.stack;
  Error.prepareStackTrace = orig;
  return stack[n];
}
function _line (n) {
  return function () {
    var frame = getStack(n);
    // https://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
    // return frame.getFileName().replace(process.cwd(), '.') + ':'+ frame.getLineNumber() + ':' + frame.getColumnNumber();
    return frame.getFileName() + ':'+ frame.getLineNumber() + ':' + frame.getColumnNumber();
  }
}

function _log (name, conf) {
  var tabsize = 2;
  var deep = 0;
  var stamp = conf.stamp ? (conf.stamp === true ? 'hh:mm:ss' : conf.stamp) : '';
  var split = color.styles.grey(' - ');
  var tab = new Array(tabsize * (conf.tab || 0) + 1).join(' ');
  var name = color.styles[conf.color](lang.pad(name));
  var disabled = !!conf.disabled;
  var line = util._line(2);

  var output = function () {
    if (disabled) {
      return;
    }
    var args = lang.makeArray(arguments);
    var str = '';
    if (typeof args[0] === 'string') {
      str = args.shift();
    }
    var ret = tab + split;
    if (stamp) {
      ret += color.styles.black(lang.stamp(new Date, stamp)) + split;
    }
    ret += name + split + color.format(str, args);
    if (conf.time) {
      var now = +new Date;
      output.time = output.time || now;
      ret += ' ' + color.styles.grey((now - output.time)+'ms');
      output.time = now;
    }
    if (conf.line) {
      ret += color.styles.red('    Line: ' + line());
    } else {
      ret = ret.replace('$LINE$',line());
    }
    ret += '\r\n';
    return process.stdout.write(ret);
  }
  output.time = +new Date;
  Object.defineProperty(output, 'disabled', {
    get: function () {
      return disabled;
    },
    set: function (v) {
      disabled = !!v;
    }
  });
  return output;
}

util.line = _line(1);
util._line = _line;
util.stringify = color.stringify;
util.format = color.format;
util.tripColors = color.tripColors;
util.dye = function (s, maxs, p) {
  maxs = maxs || [5, 3, 5];
  p = p || 0.2;
  var ret = '';
  var soules = color.soules;
  for (var i = 0; i < s.length; i += 1) {
    ret += s[i];
    for (var k = 0; k < soules.length; k += 1) {
      var _ss = [];
      if (maxs[k] && p > Math.random()) {
        soules[k].reduce(function (acc, v) {
          var r = random(0, acc);
          _ss[acc] = _ss[r];
          _ss[r] = v;
          return acc + 1;
        }, 0);
      }
      ret += _ss.slice(0, random(1, Math.min(maxs[k], soules[k].length))).join('')
    }
  }
  return ret;
};
util.debug = (function (models) {
  var color = 0;
  // var colors = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'grey','black'];
  function getNameSpace (ns) {
    return ns.split(/\-|\_|\:|\s|(?=[A-Z])/);
  }
  function getName (ns) {
    return ns.replace(/[^a-zA-Z]([a-z])/ig, function (s,m) {
      return ':' + m.toLowerCase();
    });
  }
  function debug (ns, disabled) {
    var DEBUG = process.env.DEBUG;
    var id = lang.camelCase(ns);
    return models[id] = models[id] || _log(getName(ns), {
      // 是关闭并且不是全局开启
      disabled: disabled === true || (DEBUG !== '*' && DEBUG !== id),
      time: true,
      tab: 2,
      line: true,
      color: colors[color++ % colors.length]
    });
  }
  debug.enable = function (ns) {
    var model = models[lang.camelCase(ns)];
    if (model) {
      model.enabled = true;
    }
  };
  debug.disable = function (ns) {
    var model = models[lang.camelCase(ns)];
    if (model) {
      model.enabled = false;
    }
  };
  return debug;
})({});

Object.keys(config).forEach(function (name) {
  util[name] = _log(name, config[name]);
});
