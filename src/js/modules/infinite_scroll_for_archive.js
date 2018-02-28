import jQuery from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';
import Hogan from 'hogan.js';
import IsManager from '../modules/IsManager.js';
const $ = jQuery;

/*
 * ここからアーカイブページのオートロード
 */

/* eslint no-unused-vars: 0 */
var pageNumberModel;
var pageNumberView;
var pageNum;
var isPushState;
var ARCHIVE_TEMPLATE = '#archive_template';
var POST_PER_PAGE = 4;

$(window).on({
  load: function () {
    if ($('#list-inner').length > 0) {
      pageNum = $('#paged_offset').attr('value');
      if (_.isNaN(pageNum)) pageNum = 1;

      isPushState = true;
      if (!history.pushState) {
        isPushState = false;
      }

      pageNumberModel = new PageNumberModel();
      pageNumberView = new PageNumberView({
        model: pageNumberModel
      });
      /* eslint no-new: 0 */
      new InfiniteScrollForArchive();
      new PageNumberObserve();

      changeThumbnail();
    }
  },
  resize: function () {
    changeThumbnail();
  }
});

/*
 * オートロードしているときにページ番号を監視して
 * ページ数を監視しているModelに伝えるクラス
 */
var PageNumberObserve = function () {
  this.initialize();
};

PageNumberObserve.prototype = {

  initialize: function () {
    $(window).on('scroll', this.observe);
  },
  observe: function () {
    var pageHeads = [];
    var $pageHeads = $('div.page-head');
    $('div.page-head').each(function (idx) {
      if ($(this).offset().top - $(window).scrollTop() < 0) {
        // var pageHeads = $(this).attr('data-page');
        pageHeads[pageHeads.length] = $(this);
      }
      if (idx === $pageHeads.length - 1) {
        if (pageHeads.length < 1) return;
        if (_.last(pageHeads).attr('data-page') !== pageNumberModel.toJSON().number) {
          pageNumberModel.set({
            number: _.last(pageHeads).attr('data-page')
          });
        }
        // console.log(_.last( pageHeads ).attr('data-page'))
      }
    });
  }

};

/*
 *ページ数を管理するModel
 */
var PageNumberModel = Backbone.Model.extend({
  defaults: {
    number: pageNum
  }
});

/*
 *ページ数をURLに反映するView
 */
var PageNumberView = Backbone.View.extend({

  initialize: function () {
    this.model.on('change', this.render, this);
    this.isPushState = true;
    if (!history.pushState) {
      this.isPushState = false;
    }
  },

  render: function () {
    // pushStateを使用出来るか否かで処理を分けます。
    if (this.isPushState) {
      this.pushStateFunc();
    } else {
      this.hashFunc();
    }
  },

  pushStateFunc: function () {
    if ($('#sort_type').val() === 's') {
      this.search();
    } else {
      this.normal();
    }
  },

  hashFunc: function () {
    location.hash = '/page/' + this.model.toJSON().number;
  },

  search: function () {
    var crntUrl = location.href.split('/');

    if (crntUrl[crntUrl.length - 2] === 'page') {
      crntUrl.splice(crntUrl.length - 2, 2);
    } else if (crntUrl[crntUrl.length - 3] === 'page') {
      crntUrl.splice(crntUrl.length - 3, 3);
    }

    history.pushState(null, null, crntUrl[0] + '//' + crntUrl[2] + '/page/' + this.model.toJSON().number + '?s=' + $('#sort_value').val());
  },

  normal: function () {
    var crntUrl = location.href.split('/');
    crntUrl.splice(crntUrl.length - 1, 1);
    if (crntUrl[crntUrl.length - 2] === 'page') {
      crntUrl.splice(crntUrl.length - 2, 2);
    } else if (crntUrl[crntUrl.length - 3] === 'page') {
      crntUrl.splice(crntUrl.length - 3, 3);
    }
    history.pushState(null, null, crntUrl.join('/') + '/page/' + this.model.toJSON().number + '/');
  }

});

/*
 * archiveのModel。デフォルトをカスタム
 */
var ArchiveModel = Backbone.Model.extend({

  defaults: {
    pageHead: '',
    pageNum: ''
  }

});

/*
 * archiveのView。デフォルトをカスタム
 */
var ArchiveView = Backbone.View.extend({

  el: '#list-inner',
  initialize: function () {
    this.postsPerPage = POST_PER_PAGE;
    this.pageNum = $('#paged_offset').attr('value');
    this.template = Hogan.compile($(ARCHIVE_TEMPLATE).html());
  },

  render: function () {
    if (this.model.attributes.error) {
      return;
    }

    if (this.$el.find('div.list-blog-bloc').not('article.adbox').length % this.postsPerPage === 0) {
      pageNum++;
      this.model.set({
        pageHead: 'page-head',
        pageNum: pageNum
      });
    }

    var html = $(this.template.render(this.model.toJSON()));
    html.attr('data-is-rendered', 'yes');

    this.$el.append(html);

    return this;
  }

});

/*
 * アーカイブページのオートロードのクラス
 */
var InfiniteScrollForArchive = function () {
  this.sort_key = $('#sort_value').attr('value');
  this.sort_type = $('#sort_type').attr('value');
  this.post_type = $('#post_type').attr('value');
  this.paged = $('#paged_offset').attr('value');
  this.container = '#list-inner';
  this.$container = $(this.container);
  this.$loading = $('.loading');
  this.initialize();
};

InfiniteScrollForArchive.prototype = {

  initialize: function () {
    if ($(ARCHIVE_TEMPLATE).length < 1) return;
    var self = this;

    this.$container.find('div').eq(0).addClass('page-head').attr('data-page', pageNum);

    // queryのオブジェクトを作る
    var obj = {};
    obj[this.sort_type] = this.sort_key;
    // obj['offset']       = pageNum * 4;

    this.IsConfig = {
      params: {
        query: obj
      },
      contextName: 'archive',
      container: this.container,
      $container: $(this.container),
      template: ARCHIVE_TEMPLATE,
      Model: ArchiveModel,
      View: ArchiveView,
      postsPerPage: POST_PER_PAGE
    };

    if (this.sort_type === 'author_name') {
      this.IsConfig.contextName = 'author';
    }

    if (this.sort_type === 'date') {
      this.IsConfig.contextName = 'date';
      this.IsConfig.params.query.post_type = this.post_type;
      var dateArray = obj.date.split('-');
      this.IsConfig.params.query.year = dateArray[0];
      this.IsConfig.params.query.monthnum = dateArray[1];
    }

    if (this.sort_type === 'year') {
      this.IsConfig.contextName = 'date';
      this.IsConfig.params.query.post_type = this.post_type;
    }

    if (this.sort_type === 's') {
      this.IsConfig.params.query.post_type = this.post_type;
    }

    if (this.IsConfig.$container.find('div').length < this.IsConfig.postsPerPage) return;

    this.is = IsManager.create(this.IsConfig);

    this.options = {

      params: self.IsConfig.params,
      initialNumPosts: pageNum * this.IsConfig.postsPerPage,
      fetchImmediately: false,
      beforeFetch: function () {
        self.$loading.removeClass('is-none');
      },
      complete: function () {
        var rendered = self.IsConfig.$container.find('[data-is-rendered]')
          .hide().removeAttr('data-is-rendered');
        // archiveImg();

        rendered.fadeIn(300);
        changeThumbnail();
        self.$loading.addClass('is-none');
      }
    };

    IsManager.register(this.IsConfig.contextName, new this.is.Collection(), this.IsConfig.container, this.options).observe();
  }
};

var changeThumbnail = function () {
  var $thumbnailAnchor = $('.img-box').find('a');
  $thumbnailAnchor.each(function () {
    if ($(window).width() < 601) {
      $(this).find('img').attr('src', $(this).data('thumbnail'));
    } else {
      $(this).find('img').attr('src', $(this).data('origin'));
    }
  });
};
