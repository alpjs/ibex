'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _querystring = require('querystring');

exports.default = {
  get search() {
    return location.search;
  },
  get path() {
    return location.pathname;
  },
  get port() {
    return location.port;
  },
  get url() {
    return location.url;
  },
  get origin() {
    return location.origin;
  },
  get protocol() {
    return location.protocol;
  },
  get query() {
    return (0, _querystring.parse)(location.search);
  },
  get searchParams() {
    return new URLSearchParams(location.search.length === 0 ? location.search : location.search.substr(1));
  },
  get href() {
    return location.href;
  },
  get host() {
    return location.host;
  },
  get hostname() {
    return location.hostname;
  }
}; /* global location, URLSearchParams */
//# sourceMappingURL=request.js.map