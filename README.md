# Federal data inventory

Government agencies have starting publishing dataset "inventories," generally available as JSON files named `data.json` at agency domain roots (e.g. http://nsf.gov/data.json).

These files provide some basic information about datasets/databases the agency possesses, like the dataset name, how frequently it's updated, and whether it's public.

This repo consists of a scraper to get the data for yourself and includes some of the results, excluding large files.

## Install/run for the first time

Make sure you have [NodeJS](http://nodejs.org/) installed.

Clone this repo, then install and run the scraper:

```
$ git clone https://github.com/datanews/data-inventories.git
$ cd data-inventories
$ npm install
$ node process.js
```

This scraper will do the following:

* Go through all the federal .gov domains in the CSV [provided by 18F](https://18f.gsa.gov/2014/12/18/a-complete-list-of-gov-domains/) and look for ones with a `/data.json`.  The list of inventories found will be saved as `data/inventory-list.json`.
* Download all those `data.json` files into the `data/agencies/` directory (e.g. `data/agencies/nsf.gov.data.json`).

Note that some `data.json` files are duplicates.  For example, the Consumer Financial Protection Bureau currently posts its data inventory in at least nine places:

```
http://consumerprotection.gov/data.json
http://consumerprotectionbureau.gov/data.json
http://consumerfinancialbureau.gov/data.json
http://consumerfinancial.gov/data.json
http://consumerfinance.gov/data.json
http://consumerbureau.gov/data.json
http://cfpb.gov/data.json
http://cfpa.gov/data.json
http://bcfp.gov/data.json
```

Also, some `data.json` files might just be random junk and not a dataset inventory, like what's currently at `http://census.gov/data.json`.

* Create `data/master-inventory.csv`, a single combined CSV file with all of the datasets across all the inventories, de-duped.  It only includes a few fields, but it's a good starting point to browse for datasets.
* Create `data/master-inventory.json`, a single combined JSON file with all of the datasets across all the inventories, de-duped.  This is a big file so it's not committed to the repo.  You'll have to run the scraper yourself to generate it.

## Refresh EVERYTHING

By default, the scraper will use any existing generated files, like the list of .gov domains.  If you want it to fetch everything from scratch (much slower), add the `refresh` parameter:

```
$ node process.js refresh
```

## Credits/License

By [Alan Palazzolo](https://github.com/zzolo) and [Noah Veltman](https://github.com/veltman)

Available under the MIT license.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions.

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.