
// Copyright like wut.

var cheerio = require('cheerio')
  , marked = require('marked')
  , fs = require('fs')
  , path = require('path')
  , toMarkdown = require('to-markdown').toMarkdown
  , tidy = require('htmltidy').tidy
  , parse = require('htmlparser2')

fs.readFile(path.join(__dirname, 'docs.html'), 'utf8', tidyPage)

var opts = {
  "show-body-only": true
}

function tidyPage(err, body) {
  tidy(body, opts, loadPage)
}

function parseTable(table) {
  table = table.replace(/\n/g, '')
  var md = ''
  var count = 0
    , currentTag
  var parser = new parse.Parser({
      onopentag: function (name, attr) {
        currentTag = name
      }
    , ontext: function (text) {
        md += text
        if (currentTag === 'th' || currentTag === 'td') {
          md += ' | '
          count += 1
        }
      }
    , onclosetag: function (name) {
        currentTag = ''
        if (name === 'thead') {
          for (var i = 0; i < count; i += 1) {
            md += '---'
            if (i !== count - 1) md += ' | '
            else md += '\n'
          }
          count = 0
        }

        if (name === 'tr') {
          md += '\n'
        }
      }
  })
  parser.write(table)
  parser.done()
  return md
}


function loadPage(err, body) {

  var $ = cheerio.load(body)

  $('table').removeAttr('style')
  $('table').removeAttr('class')

  $('th').removeAttr('style')
  $('tbody').removeAttr('id')

  // insert a line break before h1's
  $('h1').before('<hr />')

  var $divs = $('div')

  for(var i=0; i<$divs.length; i++) {
    var $div = $($divs[i])
    var html = $div.html()
    $div.replaceWith(html)
  }

  /*
  $divs = $('div')
  for(var z=0; z<$divs.length; z++) {
    var $div2 = $($divs[z])
    var html2 = $div2.html()
    $div2.replaceWith(html2)
  }
  */


  $('img').remove()

  // fix all h1's
  var $h1s = $('h1')
  for(var h=0; h<$h1s.length; h++) {
    var $h1 = $($h1s[h])
    $h1.replaceWith('<h1>' + $h1.text().replace(/\n/g, ' ') + '</h1>')
  }

  var $as = $('a')
  // fix all h2's
  for (var a=0; a<$as.length; a++) {
    var $a = $($as[a])
    if ($a.find('h2').length > 0) {
      var str = $a.find('h2').text().trim()
      str = '<h2>' + str + '</h2>'
      str = str.replace(/\n/g, ' ')
      $a.replaceWith(str)
    }
  }


  body = $.html()

  var md = toMarkdown(body)

  md = md.split('* * *').join('---')

  // strip <div class="heading"> and </div>
  md = md.replace(/---\n\n<div class="heading">/g, '')
  md = md.replace(/\n\n<\/div>/g, '')
  md = md.replace(/\n\n<div class="heading">/g, '')

  // remove double ---
  md = md.replace(/---\n\n---/g, '---')

  md = md.replace(/<span class="label important">required<\/span>/g, 'required')

  md = md.replace(/<table>(?:(?:(?!<\/table>)[\s\S])*?)<\/table>/g, function(html) {
    return parseTable(html)
  })

  md = md.replace(/\| required/g, '| <span class="label important">required</span><br />')

  fs.writeFileSync(path.join(__dirname, 'docs.md'), md)

}
