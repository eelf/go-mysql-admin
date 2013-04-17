function drawResponse(data) {
  $('#query-ms').html(Math.floor(data['time_ns'] / 1000000))
  $('#affected-rows').html(data['affected_rows'])

  if (data.err) {
    $('#result').html('<b>Error:</b> ' + data.err);
    return;
  }

  if (!data.fields.length) {
    $('#result').html('<i>Query executed successfully. Got empty resultset</i>');
    return;
  }

  var response = [];
  var fields = data.fields;
  response.push("<table class='table table-striped table-bordered table-condensed'><thead><tr>");
  for (var i = 0; i < fields.length; i++) {
    response.push("<th>" + fields[i] + "</th>");
  }
  response.push("</tr></thead><tbody>");

  var rows = data.rows;
  for (var i = 0; i < rows.length; i++) {
    response.push("<tr>")
    var row = rows[i]
    for (var j = 0; j < row.length; j++) {
      if (row[j] == null) {
        response.push("<td><i>NULL</i></td>");
      } else {
        response.push("<td>" + htmlspecialchars(row[j]) + "</td>");
      }
    }
    response.push("</tr>")
  }

  response.push("</tbody></tr></table>")
  $('#result').html(response.join("\n"));
}

function string_utf8_len(str) {
  var len = 0, l = str.length;

  for (var i = 0; i < l; i++) {
    var c = str.charCodeAt(i);
    if (c <= 0x0000007F) len++;
    else if (c >= 0x00000080 && c <= 0x000007FF) len += 2;
    else if (c >= 0x00000800 && c <= 0x0000FFFF) len += 3;
    else len += 4;
  }

  return len;
}

function indent(str) {
  str = '' + str
  while (str.length < 8) str += ' '
  return str
}

function send_cmd(val) {
  $('#execute-btn').attr('disabled', true);
  ws.send(indent(string_utf8_len(val + ''), 8) + val)
}

function htmlspecialchars (string, quote_style, charset, double_encode) {
  // http://kevin.vanzonneveld.net
  // +   original by: Mirek Slugen
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   bugfixed by: Nathan
  // +   bugfixed by: Arno
  // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +    bugfixed by: Brett Zamir (http://brett-zamir.me)
  // +      input by: Ratheous
  // +      input by: Mailfaker (http://www.weedem.fr/)
  // +      reimplemented by: Brett Zamir (http://brett-zamir.me)
  // +      input by: felix
  // +    bugfixed by: Brett Zamir (http://brett-zamir.me)
  // %        note 1: charset argument not supported
  // *     example 1: htmlspecialchars("<a href='test'>Test</a>", 'ENT_QUOTES');
  // *     returns 1: '&lt;a href=&#039;test&#039;&gt;Test&lt;/a&gt;'
  // *     example 2: htmlspecialchars("ab\"c'd", ['ENT_NOQUOTES', 'ENT_QUOTES']);
  // *     returns 2: 'ab"c&#039;d'
  // *     example 3: htmlspecialchars("my "&entity;" is still here", null, null, false);
  // *     returns 3: 'my &quot;&entity;&quot; is still here'
  var optTemp = 0,
    i = 0,
    noquotes = false;
  if (typeof quote_style === 'undefined' || quote_style === null) {
    quote_style = 2;
  }
  string = string.toString();
  if (double_encode !== false) { // Put this first to avoid double-encoding
    string = string.replace(/&/g, '&amp;');
  }
  string = string.replace(/</g, '&lt;').replace(/>/g, '&gt;');

  var OPTS = {
    'ENT_NOQUOTES': 0,
    'ENT_HTML_QUOTE_SINGLE': 1,
    'ENT_HTML_QUOTE_DOUBLE': 2,
    'ENT_COMPAT': 2,
    'ENT_QUOTES': 3,
    'ENT_IGNORE': 4
  };
  if (quote_style === 0) {
    noquotes = true;
  }
  if (typeof quote_style !== 'number') { // Allow for a single string or an array of string flags
    quote_style = [].concat(quote_style);
    for (i = 0; i < quote_style.length; i++) {
      // Resolve string input to bitwise e.g. 'ENT_IGNORE' becomes 4
      if (OPTS[quote_style[i]] === 0) {
        noquotes = true;
      }
      else if (OPTS[quote_style[i]]) {
        optTemp = optTemp | OPTS[quote_style[i]];
      }
    }
    quote_style = optTemp;
  }
  if (quote_style & OPTS.ENT_HTML_QUOTE_SINGLE) {
    string = string.replace(/'/g, '&#039;');
  }
  if (!noquotes) {
    string = string.replace(/"/g, '&quot;');
  }

  return string;
}