Spiderpig
=========

Spiderpig is a website crawler designed to archive your own sites as flat HTML files. It works great for Wordpress or other dynamic sites, collapsing the site into a folder of HTML files, images and JS and CSS assets.


## Usage

```
./spider.js example.com
```

This will crawl example.com, look for any links in &lt;a&gt; tags, and download all pages it finds to a folder called "example.com". It will also find images, Javascript and CSS files that are linked from any HTML pages or even other CSS files. However any content loaded via Javascript won't be discovered by the script.


## Why not just use `wget --mirror`?

Here is what Spiderpig does that Wget does not:

* Ensures all filenames on disk are called "index.html" so that the URLs to the content don't change (aside from sometimes adding a trailing slash).
* Ensures URLs such as `/example` and `/example/1` do not conflict with each other, which they would if you were to write a file to disk named `/example` because then `/example` would be a filename and it would try to write a file named `1` into the folder `/example` which is a problem.
* Spiderpig will parse CSS files looking for images referenced from the CSS file and download those images.
* Keeps track of HTTP redirects it encounters, saving them to a file, so you can generate .htaccess or nginx rewrite rules to ensure all your existing redirects stay intact.
* Query strings are ignored completely, since URLs with query strings can't be reliably served from disk. Also, cool URLs don't have query strings.

## License

Copyright 2014 Esri, Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

> http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

A copy of the license is available in the repository's [LICENSE.txt] file.

