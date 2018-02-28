window.$ = window.jQuery = require('jquery');
var jQuery = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
var Hogan = require('hogan.js');

// IsManager.js
// @depends jQuery, underscore, backbone

var _IS_CONTENT_DEFAULT_OPTIONS = {
  fetchImmediately: true
};

var IsContent = function (name, c, containerSelector, options) {
  this.name = name;
  this.collection = c;
  this.$container = $(containerSelector);
  this.options = options || {};
  this.initialize();
};

IsContent.prototype = {
  name: '',
  page: 1,
  height: 0,
  paused: false,
  pageFrom: 1,
  isLastPage: false,

  $container: null,

  collection: null,

  initialize: function () {
    this.options.postsPerPage = this.options.postsPerPage || m.postsPerPage || POSTS_PER_PAGE;

    var initialNumPosts = this.options.initialNumPosts || m.initialNumPosts;
    /* eslint no-undef: 0 */
    if (initialNumPosts) {
      if (typeof __IS_SHOW_POSTS__ !== 'undefined' && initialNumPosts < __IS_SHOW_POSTS__) {
        this.isLastPage = true;
      }

      this.page = Math.floor(initialNumPosts / this.options.postsPerPage) + 1;
      this.pageFrom = this.page;
    }

    this.updateHeight();
  },

  offset: function () {
    return (this.page - 1) * this.options.postsPerPage;
  },

  updateHeight: function () {
    this.height = this.$container.height();
  }
};
/* eslint no-unused-vars: 0 */
var INITIAL_NUM_POSTS = 0;
var POSTS_PER_PAGE = 4;

var _defaultSettings = {
  container: '#is-contents-container',
  template: '#is-template',
  url: '/bst-api'
};

var _contexts = {};
var _xhrs = {};

var _defaultContext;

var __slice = Array.prototype.slice;

var eventName = [
  'touchmove' in document ? 'touchmove' : 'scroll',
  'onwheel' in document ? 'wheel' : 'onmousewheel' in document ? 'mousewheel' : ''
].join(' ');

// internal --

// collectionでfetchするときのcallback
// thisはIsContentのインスタンス想定です
function collectionDidLoad (collection, response, options) {
  (this.options.onLoad || function () {})();

  // すこし手前でfetchを開始したいので
  // render前に高さを測ります。
  this.updateHeight();

  if (collection.length === 0) {
    if (this.page === this.pageFrom && typeof this.options.noResult === 'function') {
      this.options.noResult();
    }
    this.isLastPage = true;
  } else {
    /* eslint new-cap: 0 */
    _.each(collection.models, function (model, index) {
      (new collection.view({
        model: model
      })).render();
    });

    var model = collection.models[0];
    if (this.page === model.attributes[m.maxNumPages]) {
      if (typeof this.options.last === 'function') {
        this.options.last();
      }
      this.isLastPage = true;
    }
  }

  if (!this.isLastPage) {
    this.page++;
  }

  _xhrs[this.name] = null;

  (this.options.complete || function () {})();
}

// collectionでfetchするときのcallback
// thisはIsContentのインスタンス想定です
function collectionLoadFailed () {
  // if (_xhrs[this.name].status !== 0) {} else {
  //  'aborted by user';
  // }
}

function fetch (context) {
  if (context == null) {
    context = _defaultContext;
  }

  if (!_contexts[context]) {
    return;
  }

  var con = _contexts[context];

  if (con.paused) {
    return;
  } else if (con.isLastPage) {
    return;
  }

  var params = {
    context: context,
    query: {
      offset: con.offset(),
      posts_per_page: con.options.postsPerPage
    }
  };

  if ((con.options.params || {}).query) {
    params = $.extend(true, params, con.options.params);
  }

  var options = {
    data: params,
    success: $.proxy(collectionDidLoad, con),
    error: $.proxy(collectionLoadFailed, con)
  };

  (con.options.beforeFetch || function () {})();

  var xhr = con.collection.fetch(options);

  if (xhr) {
    _xhrs[context] = xhr;
  } else {
    // error
  }
}

// public --

function _register (name, collection, containerSelector, options) {
  options = $.extend(true, {}, _IS_CONTENT_DEFAULT_OPTIONS, options || {});

  _contexts[name] = new IsContent(name, collection, containerSelector, options);

  if (options.fetchImmediately) {
    _fetch(name);
  }

  return this;
}

function _registerWithDefaultContext (collection, containerSelector, options) {
  if (_.isEmpty(_defaultContext)) {
    throw new Error('default context not set.');
  }

  return _register.call(m, _defaultContext, collection, containerSelector, options);
}

function _unregister (/* ..names */) {
  var names = __slice.call(arguments);

  if (_.isEmpty(names) && _defaultContext) {
    names.push(_defaultContext);
  }

  _.each(names, function (name) {
    _abort(name);
    if (_contexts[name]) {
      delete _contexts[name];
    }
    if (_xhrs[name]) {
      delete _xhrs[name];
    }
  });

  return this;
}

function _fetch (/* ...names */) {
  var names = __slice.call(arguments);

  if (_.isEmpty(names) && _defaultContext) {
    names.push(_defaultContext);
  }

  _.each(names, function (name) {
    if (!_xhrs[name] || _xhrs[name].readyState === 4) {
      fetch(name);
    }
  });

  return this;
}

function _empty (/* ...names */) {
  var names = __slice.call(arguments);

  if (_.isEmpty(names) && _defaultContext) {
    names.push(_defaultContext);
  }

  _.each(names, function (name) {
    if (_contexts[name]) {
      _contexts[name].$container.empty();
    }
  });

  return this;
}

function _abort (/* ...names */) {
  var names = __slice.call(arguments);

  if (_.isEmpty(names) && _defaultContext) {
    names.push(_defaultContext);
  }

  _.each(names, function (name) {
    if (_xhrs[name]) {
      _xhrs[name].abort();
    }
  });

  return this;
}

function _observe () {
  $(window).on(eventName, _observeIs);
  return this;
}

function _observeIs () {
  var scrollTop = $(window).scrollTop();
  var hiddenHead = scrollTop + m.scrollOffset;

  if (hiddenHead < 0) {
    hiddenHead = 0;
  }

  var willFetch = [];
  _.each(_contexts, function (con) {
    if (con.height < hiddenHead) {
      willFetch.push(con.name);
    }
  });

  if (willFetch.length !== 0) {
    _fetch.apply(null, willFetch);
  } else {
    var documentHeight = $(document).height();
    var scrollPosition = $(window).height() + scrollTop;
    var hitBottom = (documentHeight - scrollPosition) / documentHeight <= 0;
    if (hitBottom) {
      var con = _.max(_contexts, function (con) {
        return con.height;
      });
      _fetch(con.name);
    }
  }
}

function _stopObserving () {
  $(window).off(eventName, _observeIs);
}

function _pause (name) {
  name = name || _defaultContext;

  if (_contexts[name]) {
    _contexts[name].paused = true;
  }

  return this;
}

function _resume (name) {
  name = name || _defaultContext;

  if (_contexts[name]) {
    _contexts[name].paused = false;
  }

  return this;
}

function _pauseAll () {
  _.each(_contexts, function (context, name) {
    _pause(name);
  });

  return this;
}

function _resumeAll () {
  _.each(_contexts, function (context, name) {
    _resume(name);
  });

  return this;
}

function _create (settings) {
  settings = $.extend({}, _defaultSettings, settings);

  // view
  var IsView = settings.View || Backbone.View.extend({
    el: settings.container,
    template: Hogan.compile($(settings.template).html()),
    render: function () {
      if (this.model.attributes.error) {
        return;
      }
      var isEventh = !(this.$el.children().length % 2);
      this.model.attributes.isEventh = isEventh;
      var html = $(this.template.render(this.model.attributes));
      html.attr('data-is-rendered', 'yes');
      this.$el.append(html);
      return this;
    }
  });

  // model
  var IsModel = settings.Model || Backbone.Model.extend({});

  // collection
  var IsCollection = settings.Collection || Backbone.Collection.extend({
    url: settings.url,
    model: IsModel,
    view: IsView
  });

  return {
    'View': IsView,
    'Model': IsModel,
    'Collection': IsCollection
  };
}

var m = {
  settings: _defaultSettings,
  maxNumPages: 'max_num_pages',
  scrollOffset: 0,

  register: _register,
  registerWithDefaultContext: _registerWithDefaultContext,
  unregister: _unregister,
  empty: _empty,
  abort: _abort,
  fetch: _fetch,
  observe: _observe,
  stopObserving: _stopObserving,
  pause: _pause,
  resume: _resume,
  pauseAll: _pauseAll,
  resumeAll: _resumeAll,
  setDefaultContext: function (name) {
    _defaultContext = name;
    return this;
  },
  create: _create,

  list: function () {
    return $.extend({}, _contexts);
  }
};
module.exports = m;
