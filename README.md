Spiderpig
=========

Spiderpig is a website crawler designed to archive your own sites as flat HTML files. It works great for Wordpress or other dynamic sites, collapsing the site into a folder of HTML files.


## Usage

```
./spider.js example.com
```

This will crawl example.com, look for any links in &lt;a&gt; tags, and download all pages it finds to a folder called "example.com". It will also find images, Javascript and CSS files that are linked from any HTML pages or even other CSS files. However any content loaded via Javascript won't be discovered by the script.


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

