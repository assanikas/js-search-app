# js-search-app
I used the Best Buy .json product catalogue.
I used the Instant Search library as a template.
I added my Application ID and my Search Only API Key.
I personalized the logo.
I applied a color scheme and fonts similar to algolia.com's.
I personalized the facets so that they match my product attributes.
Default sorting is by relevancy.
I personalized the sorting / ranking options to include 'Most relevant, Best Sellers, Prices Asc and Prices Desc. To do this I've used replicas of my main index.
I added a badgeProducts() function to automatically badge Best Sellers (products that have a BestSellingRank below 2000).
Badges will only appear when the sorting option selected is not 'Best Seller' as it would not add value in that case.
Search keywords are underlined in the results.
Descriptions are uneven so I excluded them from the search results.

