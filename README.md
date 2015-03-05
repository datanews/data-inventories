# Federal data inventory

Government agencies have published `data.json` files at their top-level domains.  These files describe basics about datasets (or databases).  Up until early 2015, these were just datasets that were already provided publicly, but now this included information about databases that are not publicly available.

This repo is both the data and a scraper to get the data.

## Data

* List of `.gov` websites in CSV format [provided by 18F](https://18f.gsa.gov/2014/12/18/a-complete-list-of-gov-domains/): `data/dotgov.csv`.
* List of `.gov` data inventories that were resolved when last run is saved as `data/data/data-inventories.json`
    * Note that some domains are redirects, so some inventories are duplicated.
    * Note that the DOI's file has had issues of not resolving, and it is a huge file.
* Limited, combined, and de-dupped CSV of all data inventories: `data/data-inventory.csv`
    * This only includes some of the metadata for the inventories but is a good place to look for datasets.
* Complete, combined, and de-dupped JSON of all data inventories: `data/data-inventory.json`
    * This file is not committed to this repository.
* Each individual `XXX.gov/data.json` is provided in: `data/json`
    * Note that some domains are redirects, so some inventories are duplicated.
    * This file is not committed to this repository.

## Updating

As this data can (and should) change, it will be good to update.

* Make sure that you have [NodeJS](http://nodejs.org/) installed and do `npm install` to get dependencies.
* The following will update what has not been processed yet: `node process.js`
* To force a refresh and overwrite data do the following (this will take some time): `node process refresh`
