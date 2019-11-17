/* global $, Hogan, algoliasearch, algoliasearchHelper */

$(document).ready(function () {
  // INITIALIZATION
  // ==============

  // Replace with your own values
  var APPLICATION_ID = 'ZQV69JHSX9';
  var SEARCH_ONLY_API_KEY = 'b601b5b5c78eacc35be826ef70b25b8f';
  var INDEX_NAME = 'kassim_index_01';
  var PARAMS = {
    facets: ['type'],
    disjunctiveFacets: ['categories', 'manufacturer', 'salePrice']
  };
  var FACETS_SLIDER = ['salePrice'];
  var SEARCHABLE_FACETS = ['manufacturer'];
  var FACETS_ORDER_OF_DISPLAY = ['categories', 'manufacturer', 'salePrice', 'type'];
  var FACETS_LABELS = {categories: 'Category', manufacturer: 'Brand', salePrice: 'Price', type: 'Type'};

  // Client + Helper initialization
  var algolia = algoliasearch(APPLICATION_ID, SEARCH_ONLY_API_KEY);
  var algoliaHelper = algoliasearchHelper(algolia, INDEX_NAME, PARAMS);

  // DOM BINDING
  var $searchInput = $('#search-input');
  var $searchInputIcon = $('#search-input-icon');
  var $main = $('main');
  var $sortBySelect = $('#sort-by-select');
  var $hits = $('#hits');
  var $stats = $('#stats');
  var $facets = $('#facets');
  var $pagination = $('#pagination');

  // Hogan templates binding
  var hitTemplate = Hogan.compile($('#hit-template').text());
  var statsTemplate = Hogan.compile($('#stats-template').text());
  var facetTemplate = Hogan.compile($('#facet-template').text());
  var sffvTemplate = Hogan.compile($('#sffv-template').text());
  var sffvResultsTemplate = Hogan.compile($('#sffv-results-template').text());
  var sliderTemplate = Hogan.compile($('#slider-template').text());
  var paginationTemplate = Hogan.compile($('#pagination-template').text());
  var noResultsTemplate = Hogan.compile($('#no-results-template').text());

  // SEARCH BINDING
  // ==============

  // Input binding
  $searchInput
  .on('input propertychange', function (e) {
    var query = e.currentTarget.value;

    toggleIconEmptyInput(query);
    algoliaHelper.setQuery(query).search();
  })
  .focus();

  // Search for facet value input binding
  $(document).on('input', '.sffv-input', function () {
    var $this = $(this);
    var query = $this.val();
    if (query === '') {
      algoliaHelper.search();
    } else {
      var facet = $this.data('facet');
      var isDisjunctive = PARAMS.disjunctiveFacets.indexOf(facet) !== -1;
      var $resultList = $('.facet-list-' + facet);
      algoliaHelper.searchForFacetValues(facet, query).then(function (content) {
        content.facet = facet;
        content.disjunctive = isDisjunctive;
        $resultList.html(sffvResultsTemplate.render(content));
      });
    }
  });

  // Search errors
  algoliaHelper.on('error', function (error) {
    /* eslint-disable no-console */
    console.log(error);
    /* eslint-enable no-console */
  });

  // Update URL
  algoliaHelper.on('change', function () {
    setURLParams();
  });

  // Search results
  algoliaHelper.on('result', function (content, state) {
    renderStats(content);
    renderHits(content);
    renderFacets(content, state);
    bindSearchObjects(state);
    renderPagination(content);
    handleNoResults(content);
  });

  // Initial search
  initFromURLParams();
  algoliaHelper.search();

  // RENDER SEARCH COMPONENTS
  // ========================

  function renderStats(content) {
    var stats = {
      nbHits: content.nbHits,
      nbHits_plural: content.nbHits !== 1,
      processingTimeMS: content.processingTimeMS
    };
    $stats.html(statsTemplate.render(stats));
  }

  function renderHits(content) {
  // BADGING CODE
  // ============


  function badgeProducts() {
      var productsToBadge = ''
      var $html = $(`
      <div class="productBadge">
        <div class="productBadgeMessage">Best Seller!</div>
      </div>
    `.replace(/>\s+</g, '><').trim())
      $container = $('.hit-price')
      $container.css('position', 'relative')
      if (!document.location.search.match('bestSelling_desc')) {
          for (var k = 0; k < $('.hit-price').length; k++) {
              if ($('.hit-image > img:eq(' + k + ')').attr('class') <= 2000) {
                  productsToBadge += '.hit-price:eq(' + k + ')' + ','
                  $(productsToBadge.slice(0, -1)).prepend($html)
              }
          }
      }
  }
    $hits.html(hitTemplate.render(content));
    badgeProducts()
  }

  function renderFacets(content, state) {
    var facetsHtml = '';
    for (var facetIndex = 0; facetIndex < FACETS_ORDER_OF_DISPLAY.length; ++facetIndex) {
      var facetName = FACETS_ORDER_OF_DISPLAY[facetIndex];
      var facetResult = content.getFacetByName(facetName);
      if (!facetResult) continue;
      var facetContent = {};

      // Slider facets
      if ($.inArray(facetName, FACETS_SLIDER) !== -1) {
        facetContent = {
          facet: facetName,
          title: FACETS_LABELS[facetName]
        };
        facetContent.min = facetResult.stats.min;
        facetContent.max = facetResult.stats.max;
        var from = state.getNumericRefinement(facetName, '>=') || facetContent.min;
        var to = state.getNumericRefinement(facetName, '<=') || facetContent.max;
        facetContent.from = Math.min(facetContent.max, Math.max(facetContent.min, from));
        facetContent.to = Math.min(facetContent.max, Math.max(facetContent.min, to));
        facetsHtml += sliderTemplate.render(facetContent);
      } else if ($.inArray(facetName, SEARCHABLE_FACETS) !== -1) {
        // Search in facet values
        facetContent = {
          facet: facetName,
          title: FACETS_LABELS[facetName],
          values: content.getFacetValues(facetName, {sortBy: ['isRefined:desc', 'count:desc']}),
          disjunctive: $.inArray(facetName, PARAMS.disjunctiveFacets) !== -1
        };
        facetsHtml += sffvTemplate.render(facetContent);
      } else {
        // Conjunctive + Disjunctive facets
        facetContent = {
          facet: facetName,
          title: FACETS_LABELS[facetName],
          values: content.getFacetValues(facetName, {sortBy: ['isRefined:desc', 'count:desc']}),
          disjunctive: $.inArray(facetName, PARAMS.disjunctiveFacets) !== -1
        };
        facetsHtml += facetTemplate.render(facetContent);
      }
    }
    $facets.html(facetsHtml);
  }

  function bindSearchObjects(state) {
    // Bind Sliders
    function prettify(num) {
      return '$' + parseInt(num, 10);
    }

    function onFinish(facetName) {
      return function (data) {
        var lowerBound = state.getNumericRefinement(facetName, '>=');
        lowerBound = lowerBound && lowerBound[0] || data.min;
        if (data.from !== lowerBound) {
          algoliaHelper.removeNumericRefinement(facetName, '>=');
          algoliaHelper.addNumericRefinement(facetName, '>=', data.from).search();
        }
        var upperBound = state.getNumericRefinement(facetName, '<=');
        upperBound = upperBound && upperBound[0] || data.max;
        if (data.to !== upperBound) {
          algoliaHelper.removeNumericRefinement(facetName, '<=');
          algoliaHelper.addNumericRefinement(facetName, '<=', data.to).search();
        }
      };
    }

    for (var facetIndex = 0; facetIndex < FACETS_SLIDER.length; ++facetIndex) {
      var facetName = FACETS_SLIDER[facetIndex];
      var slider = $('#' + facetName + '-slider');
      var sliderOptions = {
        type: 'double',
        grid: true,
        min: slider.data('min'),
        max: slider.data('max'),
        from: slider.data('from'),
        to: slider.data('to'),
        prettify: prettify,
        onFinish: onFinish(facetName)
      };
      slider.ionRangeSlider(sliderOptions);
    }
  }

  function renderPagination(content) {
    var pages = [];
    if (content.page > 3) {
      pages.push({current: false, number: 1});
      pages.push({current: false, number: '...', disabled: true});
    }
    for (var p = content.page - 3; p < content.page + 3; ++p) {
      if (p < 0 || p >= content.nbPages) continue;
      pages.push({current: content.page === p, number: p + 1});
    }
    if (content.page + 3 < content.nbPages) {
      pages.push({current: false, number: '...', disabled: true});
      pages.push({current: false, number: content.nbPages});
    }
    var pagination = {
      pages: pages,
      prev_page: content.page > 0 ? content.page : false,
      next_page: content.page + 1 < content.nbPages ? content.page + 2 : false
    };
    $pagination.html(paginationTemplate.render(pagination));
  }

  // NO RESULTS
  // ==========

  function handleNoResults(content) {
    if (content.nbHits > 0) {
      $main.removeClass('no-results');
      return;
    }
    $main.addClass('no-results');

    var facetRefinements = algoliaHelper.state.facetsRefinements;
    var disjunctiveFacetsRefinements = algoliaHelper.state.disjunctiveFacetsRefinements;
    var numericRefinements = algoliaHelper.state.numericRefinements;

    var filters = [];

    Object.keys(facetRefinements).forEach(function (facetName) {
      var facetValue = facetRefinements[facetName];
      filters.push({
        'class': 'toggle-refine',
        facet: facetName,
        facet_value: facetValue,
        label: FACETS_LABELS[facetName] + ': ',
        label_value: facetValue
      });
    });

    Object.keys(disjunctiveFacetsRefinements).forEach(function (facetName) {
      var facetValues = disjunctiveFacetsRefinements[facetName];
      facetValues.forEach(function (facetValue) {
        filters.push({
          'class': 'toggle-refine',
          facet: facetName,
          facet_value: facetValue,
          label: FACETS_LABELS[facetName] + ': ',
          label_value: facetValue
        });
      });
    });

    Object.keys(numericRefinements).forEach(function (attributeName) {
      var operators = numericRefinements[attributeName];
      Object.keys(operators).forEach(function (operator) {
        var values = operators[operator];
        filters.push({
          'class': 'remove-numeric-refine',
          facet: attributeName,
          facet_value: operator,
          label: FACETS_LABELS[attributeName] + ' ',
          label_value: operator + ' ' + values
        });
      });
    });

    $hits.html(noResultsTemplate.render({query: content.query, filters: filters}));
  }

  // EVENTS BINDING
  // ==============

  $(document).on('click', '.toggle-refine', function (e) {
    e.preventDefault();
    algoliaHelper.toggleRefine($(this).data('facet'), $(this).data('value')).search();
  });
  $(document).on('click', '.go-to-page', function (e) {
    e.preventDefault();
    $('html, body').animate({scrollTop: 0}, '500', 'swing');
    algoliaHelper.setCurrentPage(+$(this).data('page') - 1).search();
  });
  $sortBySelect.on('change', function (e) {
    e.preventDefault();
    algoliaHelper.setIndex(INDEX_NAME + $(this).val()).search();
  });
  $searchInputIcon.on('click', function (e) {
    e.preventDefault();
    $searchInput.val('').keyup().focus();
  });
  $(document).on('click', '.remove-numeric-refine', function (e) {
    e.preventDefault();
    algoliaHelper.removeNumericRefinement($(this).data('facet'), $(this).data('value')).search();
  });
  $(document).on('click', '.clear-all', function (e) {
    e.preventDefault();
    $searchInput.val('').focus();
    algoliaHelper.setQuery('').clearRefinements().search();
  });

  // URL MANAGEMENT
  // ==============

  function initFromURLParams() {
    var URLString = window.location.search.slice(1);
    var URLParams = algoliasearchHelper.url.getStateFromQueryString(URLString);
    if (URLParams.query) $searchInput.val(URLParams.query);
    if (URLParams.index) $sortBySelect.val(URLParams.index.replace(INDEX_NAME, ''));
    algoliaHelper.overrideStateWithoutTriggeringChangeEvent(
      algoliaHelper.state.setQueryParameters(URLParams)
    );
  }

  var URLHistoryTimer = Date.now();
  var URLHistoryThreshold = 700;
  function setURLParams() {
    var trackedParameters = ['attribute:*'];
    if (algoliaHelper.state.query.trim() !== '') trackedParameters.push('query');
    if (algoliaHelper.state.page !== 0) trackedParameters.push('page');
    if (algoliaHelper.state.index !== INDEX_NAME) trackedParameters.push('index');

    var URLParams = window.location.search.slice(1);
    var nonAlgoliaURLParams = algoliasearchHelper.url.getUnrecognizedParametersInQueryString(URLParams);
    var nonAlgoliaURLHash = window.location.hash;
    var helperParams = algoliaHelper.getStateAsQueryString({
      filters: trackedParameters,
      moreAttributes: nonAlgoliaURLParams
    });
    if (URLParams === helperParams) return;

    var now = Date.now();
    if (URLHistoryTimer > now) {
      window.history.replaceState(null, '', '?' + helperParams + nonAlgoliaURLHash);
    } else {
      window.history.pushState(null, '', '?' + helperParams + nonAlgoliaURLHash);
    }
    URLHistoryTimer = now + URLHistoryThreshold;
  }

  window.addEventListener('popstate', function () {
    initFromURLParams();
    algoliaHelper.search();
  });

  // HELPER METHODS
  // ==============

  function toggleIconEmptyInput(query) {
    $searchInputIcon.toggleClass('empty', query.trim() !== '');
  }



});
