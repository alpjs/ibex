'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var delegate = _interopDefault(require('delegates'));
var querystring = require('querystring');
var events = require('events');
var Logger = _interopDefault(require('nightingale-logger'));

// create lib
function compose(middlewares) {
  return function (ctx) {
    var index = -1;
    return function dispatch(i) {
      if (i <= index) {
        return Promise.reject(new Error(false));
      }
      index = i;

      var fn = middlewares[i];

      var called = false;
      try {
        return Promise.resolve(fn.call(ctx, ctx, function () {
          if (called) throw new Error(false);
          called = true;
          return dispatch(i + 1);
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    }(0);
  };
}

var proto = {};

delegate(proto, 'response').access('body').method('redirect');

delegate(proto, 'request').getter('host').getter('hostname').getter('href').getter('origin').getter('path').getter('protocol').getter('query').getter('url').getter('search').getter('searchParams');

var request = {
  get search() {
    return window.location.search;
  },
  get path() {
    return window.location.pathname;
  },
  get port() {
    return window.location.port;
  },
  get url() {
    return window.location.url;
  },
  get origin() {
    return window.location.origin;
  },
  get protocol() {
    return window.location.protocol;
  },
  get query() {
    return querystring.parse(window.location.search);
  },
  get searchParams() {
    return new URLSearchParams(window.location.search.length === 0 ? window.location.search : window.location.search.substr(1));
  },
  get href() {
    return window.location.href;
  },
  get host() {
    return window.location.host;
  },
  get hostname() {
    return window.location.hostname;
  }
};

var response = {
  redirect: function redirect(url) {
    if (this.app.emit('redirect', url) === false) {
      window.location.href = url;
    }
  }
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var logger = new Logger('ibex');

function respond(ctx) {
  // allow bypassing
  if (ctx.respond === false) {
    return;
  }

  var body = ctx.body;
  if (body == null) return;

  // const code = ctx.status;

  if (typeof body === 'string') {
    document.body.innerHTML = body;
    return;
  }

  if (body.nodeType) {
    document.body.innerHTML = '';
    document.body.appendChild(body);
  }

  throw new Error('Invalid body result');
}

var Application = function (_EventEmitter) {
  inherits(Application, _EventEmitter);

  function Application() {
    classCallCheck(this, Application);

    var _this = possibleConstructorReturn(this, (Application.__proto__ || Object.getPrototypeOf(Application)).call(this));

    _this.middleware = [];
    _this.context = Object.create(proto);

    _this.context.app = _this;
    _this.context.state = {};
    return _this;
  }

  createClass(Application, [{
    key: 'use',
    value: function use(fn) {
      logger.debug('use', { name: fn.name || '-' });
      this.middleware.push(fn);
      return this;
    }
  }, {
    key: 'onerror',
    value: function onerror(e) {
      logger.error(e);
    }
  }, {
    key: 'run',
    value: function run(url) {
      if (!this.listeners('error').length) {
        this.on('error', this.onerror);
      }

      this.callback = compose(this.middleware);

      if (url) {
        this.load(url);
      }
    }
  }, {
    key: 'createContext',
    value: function createContext() {
      var context = Object.create(this.context);
      context.request = Object.create(request);
      context.response = Object.create(response);
      // eslint-disable-next-line no-multi-assign
      context.request.app = context.response.app = this;
      return context;
    }
  }, {
    key: 'load',
    value: function load(url) {
      var _this2 = this;

      logger.debug('load', { url: url });

      if (url.startsWith('?')) {
        url = window.location.pathname + url;
      }

      var context = this.createContext();
      return this.callback(context).then(function () {
        return respond(context);
      }).catch(function (err) {
        return _this2.emit('error', err);
      });
    }
  }, {
    key: 'environment',
    get: function get$$1() {
      return this.env;
    }
  }]);
  return Application;
}(events.EventEmitter);

module.exports = Application;
//# sourceMappingURL=index-browser.cjs.js.map
