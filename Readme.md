
# node-netdna-parser

This parses the docs page at NetDNA and converts it to markdown with gfm.

Save everything inside `<article id="api-resources"></article>` to "docs.html" from <https://developer.netdna.com/api/docs>

A simple copy HTML using Chrome Tools does the trick.  I could have used `cheerio` and `request` for this, but this is a little easier to use a local file for now.
