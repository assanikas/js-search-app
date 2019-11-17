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

Search keywords are underlined in the results.

I added a badgeProducts() function to automatically badge Best Sellers (products that have a BestSellingRank below 2000).

Badges will only appear when the sorting option selected is not 'Best Seller' as it would not add value in that case.

The goal of the badge is to drive more conversions on the eCommerce website by using the power of social proof to reassure shoppers during their purchase journey:

![alt text](https://i.ibb.co/Xx16VfJ/Capture-d-e-cran-2019-11-17-a-22-01-36.png)

I added an elipsis to make sure that all product names are abbreviated if they're too long.

Descriptions are uneven in the .json product catalogue so I excluded them from the search results for a better layout.
