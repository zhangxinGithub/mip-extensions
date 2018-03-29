define(function (require) {
    var customElem = require('customElement').create();

    (function () {
        var in_production = location.hostname.indexOf('kanzhun.com') >= 0 ||
            location.hostname.indexOf("bosszhipin") >= 0 ||
            location.hostname.indexOf("mip.kanzhun.com") >= 0 ||
            location.hostname.indexOf(".zhipin.com") >= 0 ||
            location.hostname.indexOf('nnhfg.com') >= 0 ||
            location.hostname.indexOf('dianzhangzhipin') >= 0;
        // var DOMAIN = in_production ? 't.kanzhun.com' : '192.168.1.251';
        var DOMAIN = in_production ? 't.kanzhun.com' : 'localhost:8088';

        // 从uri中获取主机名，如http://www.kanzhun.com => kanzhun.com
        var getHostname = (function () {
            var link = document.createElement("a");
            return function (uri) {
                if (uri) {
                    link.href = uri;
                    return link.hostname;
                } else {
                    return "";
                }
            };
        })();

        /**
         * 获取url中指定参数的值
         * @param  {string} variable 参数名
         * @return {string}          获取的参数名
         */
        function getQueryVariable(variable) {
            var query = window.location.search.substring(1);
            var vars = query.split('&');
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split('=');
                if (pair.length == 2 && decodeURIComponent(pair[0]) == variable) {
                    return decodeURIComponent(pair[1]);
                }
            }
            return '';
        }

        /**
         * 将参数对象整合为一个参数字符串
         * @param  {object} params    参数对象
         * @param  {string} seperator 参数分隔符
         * @return {string}           合并完成的参数字符串，例name=wangxiaoer&age=20
         */
        function packParams(params, seperator) {
            seperator = seperator || '&';
            var qs = [];
            for (var key in params) {
                qs.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
            }
            return qs.join(seperator);
        }

        /**
         * 解析url参数
         * @param  {string} str       要解析的url字符串
         * @param  {string} seperator url参数分隔符
         * @return {object}           提取的url参数对象
         */
        function parseParams(str, seperator) {
            var params = {};
            if (str) {
                // 出现冒号处理str
                if (str.indexOf("%22") === 0) {
                    str = str.substr(3, str.length - 6);
                }
                var parts = str.split(seperator);
                for (var i = 0; i < parts.length; i++) {
                    var kv = parts[i].split('=');
                    if (kv.length == 2) {
                        params[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1]);
                    }
                }
            }
            return params;
        }

        /**
         * 加载图片并附上额外参数
         * @param  {string} src    图片名称
         * @param  {object} params 请求图片附带的参数
         */
        function loadImg(src, params) {
            var img = new Image();
            // 做一次签名。 后续的code，需要判断这个签名
            var __a = params['__a'],
                __t = Math.floor(params['_'] / 100);

            console.log(__a, __t);

            if (__a && __t) {

                var s = __a + __t,
                    sign = 0;
                for (var i = 0; i < s.length; i++) {
                    sign += s.charCodeAt(i);
                }

                //console.log(__t, params['_'], __t * 100 + sign % 100)

                // console.log(sign);
                // console.log(__t * 100 + sign % 100)
                params['_'] = __t * 100 + sign % 100;
            }

            console.log('http://' + DOMAIN + src + '?' + packParams(params));
            //console.log(__a, t, s, params['_'], sign);
            // browser will load the image. tested on FF, IE8, Chrome
            img.src = 'http://' + DOMAIN + src + '?' + packParams(params);
        }

        /**
         * 创建cookie
         * 代码原文地址：http://www.quirksmode.org/js/cookies.html#script
         * @param  {string} name   cookie名
         * @param  {string} value  cookie值
         * @param  {number} days   cookie有效天数
         * @param  {string} domain cookie生效的域名
         */
        function createCookie(name, value, days, domain) {
            console.log('----------------', name, value)
            var expires = "";
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toGMTString();
            }

            if (days && domain) {
                removeCookie(name);
            }

            var myCookie = name + "=" + value + expires + "; path=/";
            if (domain) {
                myCookie += ';domain=' + domain;
            }

            document.cookie = myCookie;
        }

        /**
         * 删除cookie
         * @param  {string} name cookie名
         */
        function removeCookie(name) {
            var myCookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            var domains = [
                ".kanzhun.com",

                "www.kanzhun.com",
                ".www.kanzhun.com",

                "bosszhipin.kanzhun.com",
                ".bosszhipin.kanzhun.com",

                "m.kanzhun.com",
                ".m.kanzhun.com",

                "t.kanzhun.com",
                ".t.kanzhun.com",

                "wx.kanzhun.com",
                ".wx.kanzhun.com"
            ];

            for (var i = 0; i < domains.length; i++) {
                // remove all possible domains
                document.cookie = myCookie + "domain=" + domains[i];
                document.cookie = myCookie + "domain=" + domains[i] + "; path=/";
                //console.log(myCookie + "domain=" + domains[i]);
            }

            // remove cookie without domain
            document.cookie = myCookie;
            document.cookie = myCookie + "; path=/";
        }

        /**
         * 读取cookie
         * @param  {string} name 需要读取的cookie名字
         * @return {string}      读取到的cookie值
         */
        function readCookie(name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        }

        // 过去当前时间的秒数
        function currentTimeInSecond() {
            return Math.round(new Date().getTime() / 1000);
        }

        /**
         * 删除域名
         * @param  {string} url 要删除域名的url
         * @return {string}     删除过域名的url
         * http://www.kanzhun.com -> www.kanzhun.com
         */
        function removeDomain(url) {
            if (url.indexOf('http') == 0) {
                var idx = url.indexOf('/', 7);
                if (idx > 0) {
                    url = url.substr(idx);
                }
            }

            return url;
        }

        var now_millions = new Date().getTime();

        /**
         * 获取参数
         * @param  {object}  extras   额外的参数
         * @param  {Boolean} is_event 是否带事件（在点击ka元素、js出错时为true）
         * @return {object}           完整的参数
         */
        function getParams(extras, is_event) {
            console.log('getParams');
            console.log(extras, is_event);

            var cookie_names = [UTMA, LAND_FROM, AD_C, 't', 'ab_t'];

            console.log(cookie_names);

            var params = {};

            for (var i = 0; i < cookie_names.length; i++) {
                // console.log(cookie_names[i]);
                var name = cookie_names[i];
                var c = readCookie(name);
                if (c) {
                    params[name] = c;
                }
            }

            console.log(params);

            var referrer = document.referrer;
            console.log(referrer);
            if (referrer) {
                if (location.hostname == getHostname(referrer)) {
                    referrer = removeDomain(referrer, location.hostname);
                }
            }
            console.log(referrer);

            if (is_event) {
                params['e'] = new Date().getTime() - now_millions;
            } else {
                console.log(11111);
                console.log(window.performance);
                if (window.performance && window.performance.timing) {
                    var t = window.performance.timing;
                    if (t.fetchStart) {
                        // 端到端时间
                        params['e'] = now_millions - t.fetchStart;
                    }
                }
            }

            params.r = referrer;
            params['_'] = currentTimeInSecond();

            // 页面可以指定page_key
            var pk = document.getElementById('page_key_name');
            if (pk) {
                pk = pk.getAttribute('value');
                if (pk) {
                    params['pk'] = pk;
                }
            }

            if (extras) { // merge
                for (var key in extras) {
                    params[key] = extras[key];
                }
            }

            console.log(params);

            return params;
        }


        /*
         cookies:

         __l: session cookie: landing page of current session
         __s: session cookie, injected when session start, it's value is current sessions
         __a: uniqueId, initVisitTime, previousSessionTime, currentSessionTime, totalPages, sessions, sessionPages(concat by ., expire in the far future: 10 years

         totolPages:   total pages this visitor has visit this site, duplicate count.
         sessions:     no. of sessions
         sessionPages: how many pages this visitor has visit since the start of this session
         */
        var UTMA = '__a',  //
            UTMC = "__c",  // 当前session开始时间
            LAND_FROM = '__l',// landing页面: {s: session_landing, g: sid_landing}
            AD_C = '__g'; // 广告sid

        var cookie_modify_called = false;

        // 设置与修改Cookie，在统计发生时会被调用
        function setAndModifyCookiesIfNeeded() {
            console.log(cookie_modify_called);
            if (cookie_modify_called) {
                return;
            }
            cookie_modify_called = true;

            var utma = readCookie(UTMA);
            var utmc = readCookie(UTMC); // session cookie

            console.log('__a：' + utma, '__c：' + utmc);

            var landings = parseParams(readCookie(LAND_FROM), '&');
            console.log(landings);

            var seconds = currentTimeInSecond();

            if (!utmc || !landings.l) {
                landings.l = removeDomain(location.href);  // session 着陆页
            }

            // 用户新landing，把landing的referrer记录下来
            if (!utmc) {
                landings.r = document.referrer;
            }

            // 创建新session
            if (!utmc) {
                createCookie(UTMC, seconds);
                utmc = seconds + ''; // to string
            }

            // 广告
            var sid = getQueryVariable('sid');
            var is_new_sid = false;

            console.log(sid);

            if (sid) {
                // 更新sid
                if (sid !== readCookie(AD_C)) {
                    is_new_sid = true;
                }
                createCookie(AD_C, sid);
                landings.g = removeDomain(location.href);
            } else {
                // 创建广告sid Cookie
                sid = readCookie(AD_C);
                // TODO
                if (!sid) { // we always has a sid
                    sid = '-';
                    createCookie(AD_C, sid);
                }
            }

            // 创建landing Cookie
            createCookie(LAND_FROM, packParams(landings, '&'));

            var uniqueId,
                initVisitTime,
                previousSessionTime,
                currentSessionTime,
                totalSeq,
                sessions,
                sessionSeq,
                sidSeq;

            if (utma && utma.split('.').length == 8) {
                // old user
                var parts = utma.split('.');
                uniqueId = parts[0];
                initVisitTime = parts[1];
                previousSessionTime = parts[2];
                currentSessionTime = parts[3];
                totalSeq = +parts[4]; // convert to int
                sessions = +parts[5];
                sessionSeq = +parts[6];
                sidSeq = +parts[7];

                totalSeq += 1;

                if (currentSessionTime != utmc) { // a new session
                    previousSessionTime = currentSessionTime;
                    currentSessionTime = utmc;
                    sessions += 1;
                    sessionSeq = 1;
                } else {
                    sessionSeq += 1;
                }
            } else {             // new user
                uniqueId = Math.floor(Math.random() * 100000000);   // 8 digits
                initVisitTime = seconds;
                previousSessionTime = '';
                currentSessionTime = utmc;
                totalSeq = 1;
                sessions = 1;
                sessionSeq = 1;
                sidSeq = 0;
            }

            if (is_new_sid) {
                sidSeq = 0;
            }

            sidSeq += 1;

            utma = [uniqueId, initVisitTime, previousSessionTime, currentSessionTime, totalSeq, sessions, sessionSeq, sidSeq].join('.');

            // 创建UTMA Cookie
            if (in_production) {
                if (location.hostname.indexOf('kanzhun.com') >= 0) {
                    createCookie(UTMA, utma, 365 * 10, '.kanzhun.com'); // 10 years
                } else {
                    // do not erase cookie
                    createCookie(UTMA, utma, 365 * 10); // 10 years
                }
            } else {
                createCookie(UTMA, utma, 365 * 10); // 10 years
            }
        }

        // 统计页面PV，此方法是公共方法，可导出调用，默认在页面一进来就会调用一次
        function sendPageView() {
            console.log('统计页面PV');
            setAndModifyCookiesIfNeeded();
            loadImg('/_.gif', getParams());
        }

        // 'button', 'click', 'nav buttons', 4
        /**
         * 统计点击与js报错
         * @param  {string} label 统计字段（ka值、errrorjs、impression）
         * @param  {[type]} p1    [description]
         * @param  {[type]} p2    [description]
         * @param  {[type]} p3    [description]
         */
        function sendEvent(label, p1, p2, p3) {
            console.log(label, p1, p2, p3);
            if (!label) {
                throw "event track's label params is required";
            }
            setAndModifyCookiesIfNeeded();
            var toSent = {'ca': label};

            function add(data, key, value) {
                value = cleanEventParams(value);
                if (value) {
                    data[key] = value;
                }
            }

            function cleanEventParams(val) {
                if (!val || val.indexOf('javascript') === 0) {
                    return '';
                }
                return val;
            }

            // 添加参数
            add(toSent, 'p1', p1);
            add(toSent, 'p2', p2);
            add(toSent, 'p3', p3);

            // 获取所有并发送统计
            var params = getParams(toSent, true);
            console.error('错误统计');
            console.log(params);
            loadImg('/e.gif', params);
        }

        // 设置广告显示
        function sendImpression() {
            // 广告显示
            var imElements = document.getElementsByTagName("impression");
            if (imElements.length) {
                var vals = [];
                var i = 0;
                while (i < imElements.length) {
                    vals.push(imElements[i].getAttribute("value"));
                    i = i + 1;
                }

                if (vals.length == 1) {
                    sendEvent('impression', vals[0]);
                } else if (vals.length == 2) {
                    sendEvent('impression', vals[0], vals[1]);
                } else if (vals.length == 3) {
                    sendEvent('impression', vals[0], vals[1], vals[2]);
                }
            }
        }

        var _oldTrack = window._T; // save old value

        // 设置全局变量
        window._T = {
            config: function (args) {
                args = args || {};
                DOMAIN = args['domain'] || DOMAIN;
            },
            sendPageView: sendPageView,
            sendEvent: sendEvent
        };

        // 统计PV
        sendPageView();
        // 统计广告
        sendImpression();

        // // 拦截js异常报错
        // window.onerror = function (msg, url, line, col, error) {
        //     // 没有URL不上报！上报也不知道错误
        //     if (msg != "Script error." && !url) {
        //         return true;
        //     }

        //     // 采用异步的方式
        //     // 我遇到过在window.onunload进行ajax的堵塞上报
        //     // 由于客户端强制关闭webview导致这次堵塞上报有Network Error
        //     // 我猜测这里window.onerror的执行流在关闭前是必然执行的
        //     // 而离开文章之后的上报对于业务来说是可丢失的
        //     // 所以我把这里的执行流放到异步事件去执行
        //     // 脚本的异常数降低了10倍
        //     setTimeout(function () {
        //         var data = {};
        //         //不一定所有浏览器都支持col参数
        //         col = col || (window.event && window.event.errorCharacter) || 0;

        //         data.url = url;
        //         data.line = line;
        //         data.col = col;
        //         if (!!error && !!error.stack) {
        //             //如果浏览器有堆栈信息
        //             //直接使用
        //             data.msg = error.stack.toString();
        //         } else if (!!arguments.callee) {
        //             //尝试通过callee拿堆栈信息
        //             var ext = [];
        //             var f = arguments.callee.caller, c = 3;
        //             //这里只拿3层堆栈信息
        //             while (f && (--c > 0)) {
        //                 ext.push(f.toString());
        //                 if (f === f.caller) {
        //                     break;//如果有环
        //                 }
        //                 f = f.caller;
        //             }
        //             ext = ext.join(",");
        //             data.msg = ext;
        //         }

        //         // 把data上报到后台！
        //         sendEvent('errorjs', data.url + ':' + data.line + ':' + data.col, data.msg);
        //     }, 0);
        // };

        window.onerror = function (errorMessage, scriptURI, lineNumber, columnNumber, errorObj) {
            var params = '';
            var img = new Image();
            img.crossOrigin = 'Anonymous';

            params += 'm=' + encodeURIComponent(errorMessage) || '';
            params += '&su=' + encodeURIComponent(scriptURI) || '';
            params += '&ln=' + lineNumber || '';
            params += '&cn=' + columnNumber || '';
            params += '&s=' + (errorObj && encodeURIComponent(errorObj.stack));
            params += '&w=' + document.documentElement.clientWidth;
            params += '&h=' + document.documentElement.clientHeight;

            img.src = 'http://localhost:8088/e.gif?' + params;
        };

        // 在生产环境中调用
        if (in_production) {
            // fix a bug. will create 2 cookies. Can't login
            var login = readCookie('t');
            if (login && location.hostname) {
                removeCookie("t");
                createCookie('t', login, 365 * 10);
            }

            // 这里并没有被调用
            var load = function () {
                (function (i, s, o, g, r, a, m) {
                    i['GoogleAnalyticsObject'] = r;
                    i[r] = i[r] || function () {
                        (i[r].q = i[r].q || []).push(arguments)
                    }, i[r].l = 1 * new Date();
                    a = s.createElement(o),
                        m = s.getElementsByTagName(o)[0];
                    a.async = 1;
                    a.src = g;
                    m.parentNode.insertBefore(a, m)
                })(window, document, 'script', '//www.google-analytics.com/analytics.js', '_gaq');

                _gaq('create', 'UA-50477013-1', 'kanzhun.com');
                _gaq('send', 'pageview');
            };
        }

    })();
    (function (win) {
        win.upp = function (url) {
            this._url = url;
            this._init();
        };
        upp.prototype = {

            // 初始化
            _init: function () {
                this._params = {};

                // 锚点
                var urlArr = this._url.split('#');
                var anthor = urlArr[1];

                if (anthor) {
                    this._params.__anthor = anthor;
                }

                var addressPair = urlArr[0].split('?'),
                    i = 0,
                    keypairs = [];
                this.host = addressPair[0].replace(/#.+/, '');

                if (addressPair.length > 1) {
                    keypairs = addressPair[1].split('&');
                    for (; i < keypairs.length; i++) {
                        var keypair = keypairs[i].split('=');
                        if (keypair.length === 2) {
                            this.add(keypair[0], keypair[1]);
                        }
                    }
                }
            },

            // 添加参数
            add: function (_key, _value) {
                this._params[_key] = _value;
                return this;
            },

            // 删除参数
            remove: function (key) {
                delete this._params[key];
                return this;
            },

            // 是否存在参数
            contains: function (key, value) {
                return this._params[key] !== undefined;
            },

            // 更新参数
            update: function (key, value) {
                this._params[key] = value;
            },

            // 获取参数
            get: function (key) {
                return this._params[key];
            },

            // 获取所有参数
            all: function () {
                return this._params;
            },

            // 将参数转换为url
            url: function () {
                var queryStrings = [],
                    anthor = '';
                for (var key in this._params) {
                    if (key !== '__anthor') {
                        queryStrings.push(key + '=' + this._params[key]);
                    } else {
                        anthor = '#' + this._params[key];
                    }
                }
                return this.host + (queryStrings.length > 0 ? '?' : '') + queryStrings.join('&') + anthor;
            }
        };
    })(window);

    (function () {
        if (window._T) {
            var _body = document.getElementsByTagName('body')[0],
                addEvent = function (obj, type, fn) {
                    if (obj.addEventListener) {
                        obj.addEventListener(type, fn, false);
                    } else if (obj.attachEvent) {
                        //保存指针 供removeEvent时使用
                        obj["e" + type + fn] = fn;
                        obj.attachEvent("on" + type, function () {
                            obj["e" + type + fn].call(obj, window.event);
                        });
                    }
                };
            if (_body) {
                addEvent(_body, 'click', function (e) {
                    var target = e.target || e.srcElement;
                    while (target !== document && target !== document.body && !target.getAttribute('ka') && !target.getAttribute('p2') && !target.getAttribute('p3') && target.parentNode) {
                        target = target.parentNode;
                    }
                    var k = target.getAttribute('ka');
                    var p2 = target.getAttribute('p2');
                    var p3 = target.getAttribute('p3') || '';

                    if (k) {
                        var p = target.getAttribute('href') || '';

                        if (p && p.indexOf('#') !== 0 && p.indexOf('javascript:;') === -1 && !target.getAttribute('noa')) {
                            var u = new window.upp(p);

                            // 加白名单判断--start
                            var whiteLlist = ['bosszhipin.com', 'kanzhun.com', 'weizhipin.com'];
                            var len = whiteLlist.length;
                            var flag = false;
                            if (p.indexOf('http://') >= 0 || p.indexOf('https://') >= 0) {
                                for (var i = 0; i < len; i++) {
                                    if (p.indexOf(whiteLlist[i]) >= 0) {
                                        flag = true;
                                        break;
                                    }
                                }
                            } else {
                                flag = true;
                            }
                            if (flag) {
                                u.add('ka', encodeURIComponent(k));
                            }
                            // 加白名单判断--end

                            target.setAttribute('href', u.url());
                        }

                        _T.sendEvent(k, '', p2, p3, p);
                    }
                });
            }
        }
    })();

    return customElem;
});