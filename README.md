### Objective of the project:

Building a simple Search Engine page to apply my knowledge of Algolia's platform to a real life example and overall showcase my technical capabilities.

### Methodology:

I used the Best Buy .json product catalogue.

I used the Instant Search library as a template.

I added my Application ID and my Search Only API Key.

I personalized the logo.

I applied a color scheme and fonts similar to algolia.com's.

I personalized the facets so that they match my product attributes.

Default sorting is by relevancy.

I personalized the sorting / ranking options to include 'Most relevant, Best Sellers, Prices Asc and Prices Desc. To do this I used replicas of my main index.

I added a badgeProducts() function to automatically badge Best Sellers (products that have a BestSellingRank below 2000).

Badges will only appear when the sorting option selected is not 'Best Seller' as it would not add value in that case.

The goal of the badge is to drive more conversions on the eCommerce website by using social proof to boost conversion rate:

![alt text](https://i.ibb.co/4V3Qnh0/Capture-d-cran-2019-11-17-05-12-18.png)

Search keywords are underlined in the results.

Descriptions are uneven in the product catalogue .json so I excluded them from the search results for a better layout.
