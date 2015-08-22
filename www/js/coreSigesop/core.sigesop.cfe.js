sigesop = {
	ipServidor: '',

	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},

	raizServidor: '',

	/**
	* The workhorse; converts an object to x-www-form-urlencoded serialization.
	* @param {Object} obj
	* @return {String}
	*/ 
	param: function ( obj ) {
		var query = '', name, value, fullSubName, subName, subValue, innerObj, i;

		for(name in obj) {
			value = obj[name];

			if(value instanceof Array) {
				for(i=0; i<value.length; ++i) {
					subValue = value[i];
					fullSubName = name + '[' + i + ']';
					innerObj = {};
					innerObj[fullSubName] = subValue;
					query += this.param(innerObj) + '&';
				}
			}
			else if(value instanceof Object) {
				for(subName in value) {
					subValue = value[subName];
					fullSubName = name + '[' + subName + ']';
					innerObj = {};
					innerObj[fullSubName] = subValue;
					query += this.param(innerObj) + '&';
				}
			}
			else if(value !== undefined && value !== null)
			query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
		}

		return query.length ? query.substr(0, query.length - 1) : query;
	},

	query: function ( $http, opt ) {
		/* type
		 * data
		 * class
		 * queryType
		 * query
		 * async
		 * beforeSend
		 * error
		 */

		opt.file = opt.file || 'ajax';
		opt.queryType = opt.queryType || 'getData';

		var

		type = opt.type || 'GET',

		data = opt.data || {},

		url = this.raizServidor + opt.file + '.php?class=' + opt.class +
		'&action=' + opt.query,

		sendData = function( data ) {
			if ( !jQuery.isEmptyObject( data ) ) {
				var
					std = null,
					msj = '';

				if ( typeof data == 'string' ) {
					std = data;
					msj = data;
				}
				else if ( typeof data == 'object' ) {
					std = data.status.transaccion;
					msj = data.status.msj;
				}

				switch( std ) {
					case 'OK':
						typeof opt.OK === 'function' ? opt.OK( msj, data.eventos ) : console.log( 'Function: insertarDatosSistema, OK is null' );
						break;
					case 'NA':
						typeof opt.NA === 'function' ? opt.NA( msj, data.eventos ) : console.log( 'Function: insertarDatosSistema, NA is null' );
						break;
					default:
						typeof opt.DEFAULT === 'function' ? opt.DEFAULT( msj, data.eventos ) : console.log( 'Function: insertarDatosSistema, DEFAULT is null' );
						break;
				}
			}

			else {
				console.log( 'Function query, [data] is null' );
				return -1;
			}
		},

		success = function ( data, status, headers, config, statusText ) {
			switch ( opt.queryType ) {
				case 'getData': opt.success( data ); break;
				case 'sendData': sendData( data ); break;
				case 'sendGetData': opt.success( data ); break;
				default: console.log( 'Function: query, [queryType] is undefined' ); break;
			}
		},

		error = function( data, status, headers, config, statusText ) {
			// sigesop.msgBlockUI( 'Comunicación al servidor abortada', 'error' );
			console.log( "Funcion: " + opt.query + "()\n" + "Estado: " + status + "\nError: " + statusText );
			typeof opt.error !== 'undefined' ? opt.error() : null;
		};

		/* Concatenamos los datos al query string si se trata de
		 * una solicitud tipo GET				
		 */
		if ( type === 'GET' ) {
			url += '&' + sigesop.param( opt.data );
			data = {};
		}					

		/* Ejecutamos solicitud				
		 */
		$http({
			method: type,
			data: data,
			url: url
		})
		.success ( success )
		.error ( error );
	},

	utf8_encode: function ( argString ) {
		/* discuss at: http://phpjs.org/functions/utf8_encode/
		 * original by: Webtoolkit.info (http://www.webtoolkit.info/)
		 * improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		 * improved by: sowberry
		 * improved by: Jack
		 * improved by: Yves Sucaet
		 * improved by: kirilloid
		 * bugfixed by: Onno Marsman
		 * bugfixed by: Onno Marsman
		 * bugfixed by: Ulrich
		 * bugfixed by: Rafal Kukawski
		 * bugfixed by: kirilloid
		 * example 1: utf8_encode('Kevin van Zonneveld');
		 * returns 1: 'Kevin van Zonneveld'
		 */

		argString = argString || this;

		if (argString === null || typeof argString === 'undefined') {
			return '';
		}

		var string = (argString + ''); // .replace(/\r\n/g, "\n").replace(/\r/g, "\n");
		var utftext = '',
		start, end, stringl = 0;

		start = end = 0;
		stringl = string.length;
		for (var n = 0; n < stringl; n++)
		{
			var c1 = string.charCodeAt(n);
			var enc = null;

			if (c1 < 128) {
			  end++;
			} else if (c1 > 127 && c1 < 2048) {
			  enc = String.fromCharCode(
			    (c1 >> 6) | 192, (c1 & 63) | 128
			  );
			} else if ((c1 & 0xF800) != 0xD800) {
			  enc = String.fromCharCode(
			    (c1 >> 12) | 224, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128
			  );
			} else { // surrogate pairs
			  if ((c1 & 0xFC00) != 0xD800) {
			    throw new RangeError('Unmatched trail surrogate at ' + n);
			  }
			  var c2 = string.charCodeAt(++n);
			  if ((c2 & 0xFC00) != 0xDC00) {
			    throw new RangeError('Unmatched lead surrogate at ' + (n - 1));
			  }
			  c1 = ((c1 & 0x3FF) << 10) + (c2 & 0x3FF) + 0x10000;
			  enc = String.fromCharCode(
			    (c1 >> 18) | 240, ((c1 >> 12) & 63) | 128, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128
			  );
			}
			if (enc !== null) {
			  if (end > start) {
			    utftext += string.slice(start, end);
			  }
			  utftext += enc;
			  start = end = n + 1;
			}
		}

		if (end > start) {
			utftext += string.slice(start, stringl);
		}

		return utftext;
	},

	utf8_decode: function ( str_data ) {
		//  discuss at: http://phpjs.org/functions/utf8_decode/
		// original by: Webtoolkit.info (http://www.webtoolkit.info/)
		//    input by: Aman Gupta
		//    input by: Brett Zamir (http://brett-zamir.me)
		// improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		// improved by: Norman "zEh" Fuchs
		// bugfixed by: hitwork
		// bugfixed by: Onno Marsman
		// bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		// bugfixed by: kirilloid
		//   example 1: utf8_decode('Kevin van Zonneveld');
		//   returns 1: 'Kevin van Zonneveld'

		if( str_data === null ) return '';			
		if ( typeof str_data === 'undefined')
			str_data = this;

		var tmp_arr = [],
		i = 0,
		ac = 0,
		c1 = 0,
		c2 = 0,
		c3 = 0,
		c4 = 0;

		str_data += '';

		while (i < str_data.length)
		{
			c1 = str_data.charCodeAt(i);
			if (c1 <= 191) {
			  tmp_arr[ac++] = String.fromCharCode(c1);
			  i++;
			} else if (c1 <= 223) {
			  c2 = str_data.charCodeAt(i + 1);
			  tmp_arr[ac++] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
			  i += 2;
			} else if (c1 <= 239) {
			  // http://en.wikipedia.org/wiki/UTF-8#Codepage_layout
			  c2 = str_data.charCodeAt(i + 1);
			  c3 = str_data.charCodeAt(i + 2);
			  tmp_arr[ac++] = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
			  i += 3;
			} else {
			  c2 = str_data.charCodeAt(i + 1);
			  c3 = str_data.charCodeAt(i + 2);
			  c4 = str_data.charCodeAt(i + 3);
			  c1 = ((c1 & 7) << 18) | ((c2 & 63) << 12) | ((c3 & 63) << 6) | (c4 & 63);
			  c1 -= 0x10000;
			  tmp_arr[ac++] = String.fromCharCode(0xD800 | ((c1 >> 10) & 0x3FF));
			  tmp_arr[ac++] = String.fromCharCode(0xDC00 | (c1 & 0x3FF));
			  i += 4;
			}
		}

		return tmp_arr.join('');
	},

	SHA1: function ( str ) {
		str = str || this;
		//  discuss at: http://phpjs.org/functions/sha1/
		// original by: Webtoolkit.info (http://www.webtoolkit.info/)
		// improved by: Michael White (http://getsprink.com)
		// improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		//    input by: Brett Zamir (http://brett-zamir.me)
		//  depends on: utf8_encode
		//   example 1: sha1('Kevin van Zonneveld');
		//   returns 1: '54916d2e62f65b3afa6e192e6a601cdbe5cb5897'

		var rotate_left = function(n, s) {
			var t4 = (n << s) | (n >>> (32 - s));
			return t4;
		};

		/*var lsb_hex = function (val) { // Not in use; needed?
			var str="";
			var i;
			var vh;
			var vl;

			for ( i=0; i<=6; i+=2 ) {
				vh = (val>>>(i*4+4))&0x0f;
				vl = (val>>>(i*4))&0x0f;
				str += vh.toString(16) + vl.toString(16);
			}
			return str;
		};*/

		var cvt_hex = function(val) {
			var str = '';
			var i;
			var v;

			for (i = 7; i >= 0; i--) {
				v = (val >>> (i * 4)) & 0x0f;
				str += v.toString(16);
			}
			return str;
		};

		var blockstart;
		var i, j;
		var W = new Array(80);
		var H0 = 0x67452301;
		var H1 = 0xEFCDAB89;
		var H2 = 0x98BADCFE;
		var H3 = 0x10325476;
		var H4 = 0xC3D2E1F0;
		var A, B, C, D, E;
		var temp;

		str = this.utf8_encode(str);
		var str_len = str.length;

		var word_array = [];
		for (i = 0; i < str_len - 3; i += 4) {
			j = str.charCodeAt(i) << 24 | str.charCodeAt(i + 1) << 16 | str.charCodeAt(i + 2) << 8 | str.charCodeAt(i + 3);
			word_array.push(j);
		}

		switch (str_len % 4) {
			case 0:
				i = 0x080000000;
				break;
			case 1:
				i = str.charCodeAt(str_len - 1) << 24 | 0x0800000;
				break;
			case 2:
				i = str.charCodeAt(str_len - 2) << 24 | str.charCodeAt(str_len - 1) << 16 | 0x08000;
				break;
			case 3:
				i = str.charCodeAt(str_len - 3) << 24 | str.charCodeAt(str_len - 2) << 16 | str.charCodeAt(str_len - 1) <<
				8 | 0x80;
				break;
		}

		word_array.push(i);

		while ((word_array.length % 16) != 14) {
			word_array.push(0);
		}

		word_array.push(str_len >>> 29);
		word_array.push((str_len << 3) & 0x0ffffffff);

		for (blockstart = 0; blockstart < word_array.length; blockstart += 16) {
			for (i = 0; i < 16; i++) {
				W[i] = word_array[blockstart + i];
			}
			for (i = 16; i <= 79; i++) {
				W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
			}

			A = H0;
			B = H1;
			C = H2;
			D = H3;
			E = H4;

			for (i = 0; i <= 19; i++) {
				temp = (rotate_left(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
				E = D;
				D = C;
				C = rotate_left(B, 30);
				B = A;
				A = temp;
			}

			for (i = 20; i <= 39; i++) {
				temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
				E = D;
				D = C;
				C = rotate_left(B, 30);
				B = A;
				A = temp;
			}

			for (i = 40; i <= 59; i++) {
				temp = (rotate_left(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
				E = D;
				D = C;
				C = rotate_left(B, 30);
				B = A;
				A = temp;
			}

			for (i = 60; i <= 79; i++) {
				temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
				E = D;
				D = C;
				C = rotate_left(B, 30);
				B = A;
				A = temp;
			}

			H0 = (H0 + A) & 0x0ffffffff;
			H1 = (H1 + B) & 0x0ffffffff;
			H2 = (H2 + C) & 0x0ffffffff;
			H3 = (H3 + D) & 0x0ffffffff;
			H4 = (H4 + E) & 0x0ffffffff;
		}

		temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);
		return temp.toLowerCase();
	},

	getOwnPropertyNames: function ( obj ) {
		return Object.getOwnPropertyNames( obj ).sort();
	},

	alerts: function ( opt ) {
		if ( !opt.popUp || !opt.timeOut ) {
			// return -1;
			throw new Error('variables requeridas');
		}

		var
		popUp = opt.popUp,
		timeOut = opt.timeOut,
		title = opt.title || '' , 
		subtitle = opt.subtitle || '', 
		time = opt.time || 1000;

		var myPopup = popUp.alert({
      		title: title,
      		subTitle: subtitle,
      		cssClass: 'popUp-format'
    	});


    	timeOut(function() {
       		myPopup.close(); //cerramos la ventana
    	}, time); 
	},

	splitParametros: function ( del ) {
		if ( !this ) return [];

		var array = [],
			m = this.split( del );

		for( var i = 0, lon = m.length; i < lon; i++ ) array.push( m[ i ].trim() );
		return array;
	}
}

angular.extend( String.prototype,
	{
		flushChar: function ( character ) {
			return this && character ?
				this.replace( character, '' ) : '';
		},

		utf8_encode: sigesop.utf8_encode,

		utf8_decode: sigesop.utf8_decode,

		SHA1: function ( str ) {
			str = str || this;
			//  discuss at: http://phpjs.org/functions/sha1/
			// original by: Webtoolkit.info (http://www.webtoolkit.info/)
			// improved by: Michael White (http://getsprink.com)
			// improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
			//    input by: Brett Zamir (http://brett-zamir.me)
			//  depends on: utf8_encode
			//   example 1: sha1('Kevin van Zonneveld');
			//   returns 1: '54916d2e62f65b3afa6e192e6a601cdbe5cb5897'

			var rotate_left = function(n, s) {
				var t4 = (n << s) | (n >>> (32 - s));
				return t4;
			};

			/*var lsb_hex = function (val) { // Not in use; needed?
				var str="";
				var i;
				var vh;
				var vl;

				for ( i=0; i<=6; i+=2 ) {
					vh = (val>>>(i*4+4))&0x0f;
					vl = (val>>>(i*4))&0x0f;
					str += vh.toString(16) + vl.toString(16);
				}
				return str;
			};*/

			var cvt_hex = function(val) {
				var str = '';
				var i;
				var v;

				for (i = 7; i >= 0; i--) {
					v = (val >>> (i * 4)) & 0x0f;
					str += v.toString(16);
				}
				return str;
			};

			var blockstart;
			var i, j;
			var W = new Array(80);
			var H0 = 0x67452301;
			var H1 = 0xEFCDAB89;
			var H2 = 0x98BADCFE;
			var H3 = 0x10325476;
			var H4 = 0xC3D2E1F0;
			var A, B, C, D, E;
			var temp;

			str = this.utf8_encode(str);
			var str_len = str.length;

			var word_array = [];
			for (i = 0; i < str_len - 3; i += 4) {
				j = str.charCodeAt(i) << 24 | str.charCodeAt(i + 1) << 16 | str.charCodeAt(i + 2) << 8 | str.charCodeAt(i + 3);
				word_array.push(j);
			}

			switch (str_len % 4) {
				case 0:
					i = 0x080000000;
					break;
				case 1:
					i = str.charCodeAt(str_len - 1) << 24 | 0x0800000;
					break;
				case 2:
					i = str.charCodeAt(str_len - 2) << 24 | str.charCodeAt(str_len - 1) << 16 | 0x08000;
					break;
				case 3:
					i = str.charCodeAt(str_len - 3) << 24 | str.charCodeAt(str_len - 2) << 16 | str.charCodeAt(str_len - 1) <<
					8 | 0x80;
					break;
			}

			word_array.push(i);

			while ((word_array.length % 16) != 14) {
				word_array.push(0);
			}

			word_array.push(str_len >>> 29);
			word_array.push((str_len << 3) & 0x0ffffffff);

			for (blockstart = 0; blockstart < word_array.length; blockstart += 16) {
				for (i = 0; i < 16; i++) {
					W[i] = word_array[blockstart + i];
				}
				for (i = 16; i <= 79; i++) {
					W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
				}

				A = H0;
				B = H1;
				C = H2;
				D = H3;
				E = H4;

				for (i = 0; i <= 19; i++) {
					temp = (rotate_left(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
					E = D;
					D = C;
					C = rotate_left(B, 30);
					B = A;
					A = temp;
				}

				for (i = 20; i <= 39; i++) {
					temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
					E = D;
					D = C;
					C = rotate_left(B, 30);
					B = A;
					A = temp;
				}

				for (i = 40; i <= 59; i++) {
					temp = (rotate_left(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
					E = D;
					D = C;
					C = rotate_left(B, 30);
					B = A;
					A = temp;
				}

				for (i = 60; i <= 79; i++) {
					temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
					E = D;
					D = C;
					C = rotate_left(B, 30);
					B = A;
					A = temp;
				}

				H0 = (H0 + A) & 0x0ffffffff;
				H1 = (H1 + B) & 0x0ffffffff;
				H2 = (H2 + C) & 0x0ffffffff;
				H3 = (H3 + D) & 0x0ffffffff;
				H4 = (H4 + E) & 0x0ffffffff;
			}

			temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);
			return temp.toLowerCase();
		},

		splitParametros: function ( del ) {
			if ( !this ) return [];

			var array = [],
				m = this.split( del );

			for( var i = 0, lon = m.length; i < lon; i++ ) array.push( m[ i ].trim() );
			return array;
		}
	}
);