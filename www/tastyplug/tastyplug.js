/*
    Copyright (c) 2013-2014 by Olivier Houle (Fungus) // Thomas Albrighton (ThatTomPerson)
    Please do not copy or modify without my permission.
*/
SockJS.prototype.msg = function(a){this.send(JSON.stringify(a))};
Array.prototype.isArray = true;
var tastyPlugShutDown;
if (tastyPlugShutDown != undefined) tastyPlugShutDown();
(function(){
    var sock, afktime = Date.now(), mousett = false, cd = false, reconint = 2, pms = false, drag = false, version = '1.1.4', commands = {}, tos = {},
    settings = {
        show: true,
        autowoot: false,
        autojoin: false,
        chatmentions: false,
        joinnotifs: {toggle:false,ranks:false,friends:false,fans:false},
        joinmode: 1,
        msgs: [],
        afkalert: false,
        friend: {username:null,id:null},
        lastPM: null,
        uipos: {'top':'54px','left':'0'},
        boothalert: false,
        histalert: false,
        chatimgs: false,
        notification: false
    };
    if (Notification && Notification.permission !== "granted") {
        Notification.requestPermission(function (status) {
            if (Notification.permission !== status) {
                Notification.permission = status;
            }
        });
    }
    function notify(){
        if (Notification && Notification.permission === "granted") {
      var n = new Notification("Hi!");
    }
    }
    function socket() {
        sock = new SockJS('http://fungustime.pw:4957');
        sock.onopen = function() {
            reconint = 2;
            console.log('[TastyPlug v' + version + '] Connected to socket!');
            return sock.msg({z:'userjoin',a:API.getUser(),r:location.pathname});
        };
        sock.onmessage = function(data) {
            data = JSON.parse(data.data);
            switch (data.z) {
                case 'load':
                    $('#tp-antiAfk span.result').text(data.a.antiAfk?'on':'off');
                    $('#tp-antiAfkLimit span.result').text(data.a.antiAfkLimit);
                    $('#tp-lottery span.result').text(data.a.lottery?'on':'off');
                    $('#tp-lotTime span.result').text(60-new Date().getMinutes());
                    $('#tp-userCmds span.result').text(data.a.userCmds?'on':'off');
                    $('#tp-duels span.result').text(data.a.duels?'on':'off');
                    return console.log('[TastyPlug v' + version + '] Loaded TastyBot settings.');
                case 'settupdate':
                    if (typeof data.b == 'boolean') data.b = data.b ? 'on' : 'off';
                    else if (data.a == 'lottime') data.b = 60 - data.b;
                    return $('#tp-' + data.a + ' span.result').text(data.b);
                case 'cmderr':
                    return Chat('error', data.e);
                case 'afkwarning':
                    if (!settings.afkalert) return;
                    if (data.m) {
                        Chat('error', data.m);
                        chatSound();
                    }
                    else clearInterval(tos.afkalert);
                    if (data.n) tos.afkalert = setInterval(chatSound,4000);
                    return;
                case 'clientmsg':
                    return Chat('info', data.a);
                case 'pm':
                    if (API.getUser(data.user.id).relationship != 3) return;
                    settings.lastPM = data.user.username;
                    chatSound();
                    return ChatPM(data.user.username, data.m);
                case 'reload':
                    return commands.reset();
                default:
                    return console.log('[TastyPlug v' + version + '] Unknown socket command');
            }
        };
        sock.onclose = function() {
            console.log('[TastyPlug v' + version + '] Disconnected from socket!');
            tos.reconnect = setTimeout(function(){
                if (sock.readyState == 3) socket();
                if (reconint < 6) reconint++;
            },Math.pow(2,reconint)*1000);
        };
    }
    function startup() {
        loadSettings();
        loadUI();
        loadEvents();
        if (location.pathname != '/tastycat/') {
            $('#tp-roominfo').remove();
            $('#tp-afkalert').remove();
        } else {
            eta();
            tos.lottery = setInterval(function(){
                var lot = $('#tp-lotTime span.result'), num = +lot.text();
                --num;
                if (num < 0) num = 59;
                lot.text(num);
            },60000);
        }
        $('#chat-popout-button').hide();
        if (settings.autowoot) $('#woot').click();
        if (settings.autojoin) {
            afkCheck();
            if (!getLocked() && API.getWaitListPosition() == -1) API.djJoin();
        }
        socket();
        var hist = API.getHistory();
        Chat('init', 'TastyPlug v' + version + ' now running!');
        console.log('[TastyPlug v' + version + '] Now running.');
    }
    function loadSettings() {
        var a = JSON.parse(localStorage.getItem('tastyPlugSettings'));
        if (a) {
            var b = Object.keys(settings);
            for (var i = 0; i < b.length; i++) {
                if (a[b[i]] !== undefined) {
                    if (a[b[i]] !== null && a[b[i]].isArray && settings[b[i]] !== null && settings[b[i]].isArray) settings[b[i]] = a[b[i]];
                    else if (typeof settings[b[i]] == 'object' && settings[b[i]] !== null) {
                        var c = Object.keys(settings[b[i]]);
                        for (var j = 0; j < c.length; j++) {
                            if (a[b[i]][c[j]] !== undefined) settings[b[i]][c[j]] = a[b[i]][c[j]];
                        }
                    } else settings[b[i]] = a[b[i]];
                }
            }
        }
    }
    function loadUI() {
        $('head').append('<style type="text/css" id="tastyplug-css">#tastyplug-ui{-moz-user-select:none;-webkit-user-select:none;position:absolute;width:150px;border-radius:10px;background-color:#1C1F25;background-image:-webkit-gradient(linear,left bottom,left top,color-stop(0,#1C1F25),color-stop(1,#282D33));background-image:-o-linear-gradient(top,#1C1F25 0,#282D33 100%);background-image:-moz-linear-gradient(top,#1C1F25 0,#282D33 100%);background-image:-webkit-linear-gradient(top,#1C1F25 0,#282D33 100%);background-image:-ms-linear-gradient(top,#1C1F25 0,#282D33 100%);background-image:linear-gradient(to top,#1C1F25 0,#282D33 100%);z-index:9;padding-bottom:1.5px;color:#DDD}.tastyplug-icon{position:relative;float:right}#tastyplug-ui .tp-toggle{color:#F04F30}#tastyplug-ui .tp-toggle.button-on{color:#1CC7ED}#tp-title{margin:0 15px;padding:3px 0;color:#A874FC;font-size:19px;cursor:pointer}.tp-mainbutton,.tp-secbutton{margin:0 15px;padding:2px 0 3px;font-size:15px;border-top:1px solid rgba(56,60,68,.85);cursor:pointer}.tp-highlight{background-color:rgba(168,116,252,.33)}.tp-secbutton{padding-left:8px}.tp-infobutt{margin:0 15px;padding:1px 0 2px;font-size:12px;border-top:1px solid rgba(56,60,68,.85);cursor:default}.tp-infobutt span{font-weight:700}.tp-infobutt .result{font-weight:400}#tastyplug-ui .icon-drag-handle{position:relative;float:right;top:3px;height:14px;width:14px;background-position:-183px -113px}#waitlist-button .eta{position:relative;top:33px;left:57px;font-size:10px}#chat-messages .tastyplug-pm .icon{top:-1px;left:-3px}#chat-pm-button{left:204px}#chat-messages .tastyplug-pm{border-left-style:solid;border-left-width:3px;border-color:#F59425}#chat-messages .tastyplug-pm .from{color:#F59425;font-weight:700}#user-lists .list.room .user .icon-meh{left:auto;right:8px;top:-1px}#chat-messages .id-50aeafd9d6e4a94f77473433 .icon{top:7px;left:6px;background-position:-145px -287px;width:18px;height:16px}#chat-messages .mention.id-50aeafd9d6e4a94f77473433 .icon{left:3px}.id-50aeafd9d6e4a94f77473433{background-color:#2D002D}#chat .emote:nth-child(2n+1).id-50aeafd9d6e4a94f77473433,#chat .mention:nth-child(2n+1).id-50aeafd9d6e4a94f77473433,#chat .message:nth-child(2n+1).id-50aeafd9d6e4a94f77473433{background-color:#240024}#chat .emote.id-50aeafd9d6e4a94f77473433 .text,#chat .mention.id-50aeafd9d6e4a94f77473433 .text,#chat .message.id-50aeafd9d6e4a94f77473433 .text{font-weight:700;color:#CFCFCF}#chat .emote.id-50aeafd9d6e4a94f77473433 .text{font-style:normal}.tp-info{border-left:3px solid #1CC7ED}#chat .update.tp-info .text{color:#1CC7ED}#chat .update.tp-info .text span{color:#EEE}.tp-error{border-left:3px solid red}#chat .update.tp-error .text{color:red}.tp-init{border-left:3px solid #D1D119}#chat .update.tp-init .text{color:#D1D119}.tp-join-admin{border-left:3px solid #1CC7ED}#chat .update.tp-join-admin .text{color:#1CC7ED}.tp-join-ba{border-left:3px solid #088C30}#chat .update.tp-join-ba .text{color:#088C30}.tp-join-host{border-left:3px solid #D1D119}#chat .update.tp-join-host .text{color:#D1D119}.tp-join-cohost{border-left:3px solid #F59425}#chat .update.tp-join-cohost .text{color:#F59425}.tp-join-staff{border-left:3px solid #C322E3}#chat .update.tp-join-staff .text{color:#C322E3}.tp-join-friend{border-left:3px solid #009CDD}#chat .update.tp-join-friend .text{color:#009CDD}.tp-join-fan{border-left:3px solid #1F5DFF}#chat .update.tp-join-fan .text{color:#1F5DFF}.tp-img.wide{width:280px;height:auto}.tp-img.high{height:600px;width:auto}</style>')
        $('body').append('<div id="tastyplug-ui"><div id="tp-title"> TastyPlug <img class="tastyplug-icon" src="http://fungustime.pw/tastyplug/tastyplug.png"></div><div class="tp-mainbutton tp-toggle button-on" id="tp-autowoot"><span>Autowoot</span></div><div class="tp-mainbutton tp-toggle button-on" id="tp-autojoin"><span>Autojoin</span></div><div class="tp-mainbutton tp-toggle button-on" id="tp-afkalert"><span>AFK Alert</span></div><div class="tp-mainbutton tp-toggle button-on" id="tp-stream"><span>Stream</span></div><div class="tp-mainbutton tp-toggle button-on" id="tp-boothalert"><span>Booth Alert</span></div><div class="tp-mainbutton tp-toggle button-on" id="tp-histalert"><span>History Alert</span></div><div class="tp-mainbutton tp-toggle button-on" id="tp-chatimgs"><span>Chat Images</span></div><div class="tp-mainbutton tp-toggle button-on" id="tp-mentions"><div class="icon icon-drag-handle"></div><span>Chat Mentions</span></div><div class="tp-secbutton tp-secmention" id="tp-addmention"><span>Add</span></div><div class="tp-secbutton tp-secmention" id="tp-delmention"><span>Delete</span></div><div class="tp-secbutton tp-secmention" id="tp-listmention"><span>List</span></div><div class="tp-mainbutton tp-toggle button-on" id="tp-joinnotifs"><div class="icon icon-drag-handle"></div><span>Join Notifs</span></div><div class="tp-secbutton tp-secjoin tp-toggle button-on" id="tp-joinranks"><span>Ranks</span></div><div class="tp-secbutton tp-secjoin tp-toggle button-on" id="tp-joinfriends"><span>Friends</span></div><div class="tp-secbutton tp-secjoin tp-toggle button-on" id="tp-joinfans"><span>Fans</span></div><div class="tp-mainbutton" id="tp-roominfo"><div class="icon icon-drag-handle"></div><span>Room Info</span></div><div class="tp-infobutt" id="tp-antiAfk"><span>AntiAFK: <span class="result">off</span></span></div><div class="tp-infobutt" id="tp-antiAfkLimit"><span>AFK Limit: <span class="result">0</span> mins</span></div><div class="tp-infobutt" id="tp-lottery"><span>Lottery: <span class="result">off</span></span></div><div class="tp-infobutt" id="tp-lotTime"><span>Next Lottery: <span class="result">0</span>m</span></div><div class="tp-infobutt" id="tp-userCmds"><span>User Cmds: <span class="result">off</span></span></div><div class="tp-infobutt" id="tp-duels"><span>Duels: <span class="result">off</span></span></div></div>');
        if (location.pathname == '/tastycat/') $('#waitlist-button').append('<span class="eta" >ETA: N/A</span>');
        $('#chat-header').append('<div id="chat-pm-button" class="chat-header-button"><i class="icon icon-ignore"></i></div>');
        if (!settings.autowoot) $('#tp-autowoot').removeClass('button-on');
        if (!settings.autojoin) $('#tp-autojoin').removeClass('button-on');
        if (!settings.afkalert) $('#tp-afkalert').removeClass('button-on');
        if (!getStream()) $('#tp-stream').removeClass('button-on');
        if (!settings.boothalert) $('#tp-boothalert').removeClass('button-on');
        if (!settings.histalert) $('#tp-histalert').removeClass('button-on');
        if (!settings.chatimgs) $('#tp-chatimgs').removeClass('button-on');
        if (!settings.chatmentions) $('#tp-mentions').removeClass('button-on');
        if (!settings.joinnotifs.toggle) $('#tp-joinnotifs').removeClass('button-on');
        if (!settings.joinnotifs.ranks) $('#tp-joinranks').removeClass('button-on');
        if (!settings.joinnotifs.friends) $('#tp-joinfriends').removeClass('button-on');
        if (!settings.joinnotifs.fans) $('#tp-joinfans').removeClass('button-on');
        if (!settings.show) {
            $('.tp-mainbutton').hide();
            $('#tastyplug-ui').css('padding-bottom','0');
        }
        if (API.getUser().permission < 2) $('#tp-histalert').remove();
        $('.tp-secbutton,.tp-infobutt').hide();
        $('#tastyplug-ui').css(settings.uipos);
    }
    function loadEvents() {
        _$context.on('chat:receive',chatHTML);
        _$context.on('settings:show',showSettings);
        API.on(API.CHAT,eventChat);
        API.on(API.USER_JOIN,eventJoin);
        API.on(API.FAN_JOIN,eventFaJoin);
        API.on(API.FRIEND_JOIN,eventFrJoin);
        API.on(API.WAIT_LIST_UPDATE,eventDjUpdate);
        API.on(API.DJ_ADVANCE,eventDjAdvance);
        API.on(API.CHAT_COMMAND,eventCommand);
        $(window).resize(resize);
        if (API.getUser().permission >= 2) {
            API.on(API.VOTE_UPDATE,refreshMehs);
            $('#users-button:not(.selected)').click(refreshMehs);
        }
        //make it draggable
        var dragopts = {
            distance:20,
            handle:'#tp-title',
            snap:'#playback-container',
            snapMode:'outer',
            containment:'#room',
            scroll:false,
            start:function(){
                drag = true
            },
            stop:function(e,ui){
                drag = false;
                settings.uipos = ui.position;
                saveSettings();
            }
        };
        if ($.ui == undefined) {
            $.getScript('http://fungustime.pw/jquery-ui-1.10.4.custom.min.js',function(){
                $('#tastyplug-ui').draggable(dragopts);
            });
         } else {
            $('#tastyplug-ui').draggable(dragopts);
        }
        //history check next song
        $('#next-media-title .bar-value').hover(
            function(){
                var a = false, b = API.getHistory(), c = API.getNextMedia().media.id;
                for (var i = 0; i < b.length; i++) if (b[i].media.id == c) {a = true; break;}
                var d = a ? "This song is on the history!" : "This song isn't on the history!";
                var e = a ? 'orange' : 'blue';
                _$context.trigger('tooltip:show',d,$(this),false,false,e);
            },
            function(){
                _$context.trigger('tooltip:show','',$(this),false);
                _$context.trigger('tooltip:hide');
            }
        );
        //song tooltip
        $('#now-playing-media').hover(
            function(){
                _$context.trigger('tooltip:show', API.getMedia().author + ' - ' + API.getMedia().title, $('#now-playing-dj .dark-label'),false);
                mousett = true;
            },function(){
                _$context.trigger('tooltip:hide');
                mousett = false;
            }
        );
        //quick reply to pm
        $('#chat-messages').on('click','.pm-from', function(){
            if ($('#chat-input-field').val()) return;
            var a = '/pm @' + $(this).text();
            $('#chat-input-field').val(a);
            $('#chat-input-field').focus();
        });
        //pm button
        $('#chat-pm-button i').click(function(){
            pms = !pms;
            $('#chat-pm-button i').attr('class',(pms ? 'icon icon-unignore' : 'icon icon-ignore'));
            $('#chat-messages').children().not('.tastyplug-pm').toggle();
            $('#chat-messages').scrollTop(20000);
        });
        $('#chat-pm-button i').hover(
            function(){
                _$context.trigger('tooltip:show','Only shows PMs received with TastyPlug',$(this),true);
            },function(){
                _$context.trigger('tooltip:hide');
            }
        );
        //highlight ui buttons
        $('.tp-mainbutton,.tp-secbutton,.tp-infobutt').hover(
            function(){$(this).addClass('tp-highlight')},
            function(){$(this).removeClass('tp-highlight')}
        );
        //tp title
        $('#tp-title').mouseup(function(){
            if (!drag) {
                settings.show = !settings.show;
                if (!settings.show) {
                    $('#tastyplug-ui').css('padding-bottom','0');
                    $('.tp-mainbutton').css('border-top','0');
                    $('.tp-secbutton').css('border-top','0');
                }
                $('#tastyplug-ui .tp-mainbutton').slideToggle(function(){
                    if (settings.show) {
                        $('#tastyplug-ui').css('padding-bottom','');
                        $('.tp-mainbutton').css('border-top','');
                        $('.tp-secbutton').css('border-top','');
                    }
                });
                $('.tp-secbutton,.tp-infobutt').slideUp();
                saveSettings();
            }
        });
        //tp autowoot
        $('#tp-autowoot').click(function(){
            settings.autowoot = !settings.autowoot;
            $(this).toggleClass('button-on');
            if (settings.autowoot) $('#woot').click();
            saveSettings();
        });
        //autojoin
        $('#tp-autojoin').click(function(){
            settings.autojoin = !settings.autojoin;
            $(this).toggleClass('button-on');
            if (settings.autojoin && !getLocked() && API.getWaitListPosition() == -1) API.djJoin();
            afkCheck();
            saveSettings();
        });
        //afk alert
        $('#tp-afkalert').click(function(){
            settings.afkalert = !settings.afkalert;
            $(this).toggleClass('button-on');
            saveSettings();
        });
        //stream
        $('#tp-stream').click(function(){
            toggleStream();
            $(this).toggleClass('button-on');
            saveSettings();
        });
        //booth alert
        $('#tp-boothalert').click(function(){
            settings.boothalert = !settings.boothalert;
            $(this).toggleClass('button-on');
            saveSettings();
        });
        //history alert
        $('#tp-histalert').click(function(){
            settings.histalert = !settings.histalert;
            $(this).toggleClass('button-on');
            saveSettings();
        });
        //chat images
        $('#tp-chatimgs').click(function(){
            settings.chatimgs = !settings.chatimgs;
            $(this).toggleClass('button-on');
            saveSettings();
        });
        //chat mentions
        $('#tp-mentions span').click(function(){
            settings.chatmentions = !settings.chatmentions;
            $(this).parent().toggleClass('button-on');
            saveSettings();
        });
        $('#tp-addmention').click(function(){
            var len = settings.msgs.length;
            var a = prompt('Add words to the chat mentions list! Separate them with a comma.').trim().split(',');
            if (!a) return Chat('error', 'Please enter at least one word!');
            for (var i = 0; i < a.length; i++) {
                a[i] = a[i].trim().toLowerCase();
                if (a[i].length < 3) Chat('error', 'Did not add: ' + _.escape(a[i]) + ' (too short)');
                else if (settings.msgs.indexOf(a[i]) > -1) Chat('error', 'Did not add: ' + _.escape(a[i]) + ' (already on list)');
                else settings.msgs.push(a[i]);
            }
            if (settings.msgs.length > len) {
                Chat('info', 'Added word(s) to chat mentions list');
                saveSettings();
            }
        });
        $('#tp-delmention').click(function(){
            var a = prompt('Which word would you like to remove from the mentions list?');
            if (settings.msgs.indexOf(a) > -1) {
                settings.msgs.splice(settings.msgs.indexOf(a),1);
                Chat('info', 'Removed "' + _.escape(a) + '" from the chat mentions list');
                saveSettings();
            } else Chat('error', 'That word isn\'t in the mentions list!');
        });
        $('#tp-listmention').click(function(){
            var a = settings.msgs;
            for (var i = 0; i < a.length; i++) a[i] = _.escape(a[i]);
            if (a.length) return Chat('info', 'Chat mentions list:<br>' + a.join('<br>'));
            return Chat('error', 'You don\'t have anything in your chat mentions list!');
        });
        $('#tp-mentions .icon-drag-handle').click(function(){
            $('.tp-secmention').slideToggle();
        });
        //join notifs
        $('#tp-joinnotifs span').click(function(){
            settings.joinnotifs.toggle = !settings.joinnotifs.toggle;
            $(this).parent().toggleClass('button-on');
            saveSettings();
        });
        $('#tp-joinranks').click(function(){
            settings.joinnotifs.ranks = !settings.joinnotifs.ranks;
            $(this).toggleClass('button-on');
            saveSettings();
        });
        $('#tp-joinfriends').click(function(){
            settings.joinnotifs.friends = !settings.joinnotifs.friends;
            $(this).toggleClass('button-on');
            saveSettings();
        });
        $('#tp-joinfans').click(function(){
            settings.joinnotifs.fans = !settings.joinnotifs.fans;
            $(this).toggleClass('button-on');
            saveSettings();
        });
        $('#tp-joinnotifs .icon-drag-handle').click(function(){
            $('.tp-secjoin').slideToggle();
        });
        //room info
        $('#tp-roominfo').click(function(){
            $('.tp-infobutt').slideToggle();
        });
    }
    tastyPlugShutDown = function() {
        _$context.off('chat:receive',chatHTML);
        _$context.off('settings:show',showSettings);
        API.off(API.CHAT,eventChat);
        API.off(API.USER_JOIN,eventJoin);
        API.off(API.FAN_JOIN,eventFaJoin);
        API.off(API.FRIEND_JOIN,eventFrJoin);
        API.off(API.WAIT_LIST_UPDATE,eventDjUpdate);
        API.off(API.DJ_ADVANCE,eventDjAdvance);
        API.off(API.CHAT_COMMAND,eventCommand);
        $(window).off('resize',resize);
        API.off(API.VOTE_UPDATE,refreshMehs);
        $('#users-button').off('click',refreshMehs);
        $('#next-media-title .bar-value').off('mouseenter mouseleave');
        $('#now-playing-media').off('mouseenter mouseleave');
        $('#chat-messages .pm-from').off('click');
        $('#chat-pm-button').remove();
        $('#waitlist-button').find('.eta').remove();
        $('#tastyplug-ui').remove();
        $('#tastyplug-css').remove();
        var a = Object.keys(tos);
        for (var i = 0; i < a.length; i++) clearInterval(tos[a[i]]);
        saveSettings();
        if (sock) sock.close();
        console.log('[TastyPlug v' + version + '] Shut down.');
    };
    function chatHTML(a) {
        var msg = $('#chat-messages').children().last();
        if (pms && !msg.hasClass('.tastyplug-pm')) msg.hide();
        if (a.type != 'message' && a.type != 'emote' && a.type != 'mention') return;
        msg.addClass('id-' + a.from.id);
        if (settings.chatimgs && a.from.id != '50aeafd9d6e4a94f77473433') {
            var txt = msg.find('.text'), txts = txt.text().trim().split(' ');
            for (var i = 0; i < txts.length; i++) if (!txts[i].indexOf('http://') || !txts[i].indexOf('https://')) return checkImg(txts[i],txt);
        }
    }
    function eventChat(a) {
        if (a.fromID == API.getUser().id) {
            afktime = Date.now();
            clearInterval(tos.afkalert);
            if (API.getUser().status == 1) API.setStatus(0);
            if (!a.message.toLowerCase().indexOf('!afk')) API.setStatus(1);
        }
        if (!settings.chatmentions || a.fromID == API.getUser().id) return;
        for (var i = 0; i < settings.msgs.length; i++) {
            if (a.message.toLowerCase().indexOf(settings.msgs[i]) > -1) return chatSound();
        }
    }
    function eventJoin(user) {
        var rank = API.getUser(user.id).permission, a;
        if (!settings.joinnotifs.toggle || !rank || (!settings.joinnotifs.ranks && !settings.joinnotifs.friends && !settings.joinnotifs.fans)) return;
        switch (rank) {
            case 10: a = 'admin'; break;
            case 8:  a = 'ba'; break;
            case 5:  a = 'host'; break;
            case 4:  a = 'cohost'; break;
            case 3:case 2:case 1: a = 'staff'; break;
            default: a = 'undefined';
        }
        return Chat('join-' + a, _.escape(user.username) + ' joined the room');
    }
    function eventFaJoin(user) {
        if (!settings.joinnotifs.toggle || user.permission || !settings.joinnotifs.fans) return;
        return Chat('join-fan', _.escape(user.username) + ' joined the room');
    }
    function eventFrJoin(user) {
        if (!settings.joinnotifs.toggle || user.permission || !settings.joinnotifs.friends) return;
        return Chat('join-friend', _.escape(user.username) + ' joined the room');
    }
    function eventDjUpdate() {
        if (settings.autojoin && !getLocked() && API.getWaitListPosition() == -1)
            API.djJoin();
    }
    function eventDjAdvance(a) {
        if (settings.autojoin && !getLocked() && API.getWaitListPosition() == -1) API.djJoin();
        if (settings.autowoot) setTimeout(function(){$('#woot').click()},1500);
        if (mousett) {
            _$context.trigger('tooltip:hide');
            _$context.trigger('tooltip:show', API.getMedia().author + ' - ' + API.getMedia().title, $('#now-playing-dj .dark-label'),false,false);
        }
        if (settings.boothalert && API.getWaitListPosition() == 2) {
            chatSound();
            Chat('info','It\'s almost your turn to DJ! Make sure to pick a song!');
        }
        if (settings.histalert && API.getUser().permission >= 2) {
            var hist = API.getHistory();
            for (var i = 0; i < hist.length; i++) {
                if (hist[i].media.id == a.media.id) {
                    chatSound();
                    Chat('error','This song is on the history! (played ' + (i + 1) + ' song' + (i == 0 ? '' : 's') + ' ago)');
                    break;
                }
            }
        }
    }
    function eventCommand(a) {
        var cmd = a.trim().substr(1).split(' ')[0].toLowerCase();
        if (cmd == 'afk' || cmd == 'away') API.setStatus(1);
        else if (cmd == 'work' || cmd == 'working') API.setStatus(2);
        else if (cmd == 'gaming' || cmd == 'game' || cmd == 'ingame') API.setStatus(3);
        var data = {
            fromID: API.getUser().id,
            from: API.getUser().username,
            message: a.trim(),
            room: location.pathname
        }, a;
        if (commands[cmd]) a = commands[cmd](data);
        else if (location.pathname == '/tastycat/' && sock.readyState == 1) {
            sock.msg({z:'command',a:data});
            a = true;
        }
        if (a) {
            cd = true;
            setTimeout(function(){cd = false},2000);
        }
    }
    function refreshMehs() {
        if ($('#users-button').hasClass('selected') && $('.button.room').hasClass('selected')) {
            $('#user-lists .list.room i.icon.icon-meh').remove();
            var users = $(API.getUsers()).filter(function(){return this.vote == -1 && !this.curated;});
            users.each(function(i){
                $('#user-lists .list.room .user span').filter(function(){return $(this).text() == users[i].username;}).parent().append('<i class="icon icon-meh"></i>');
            });
        }
    }
    commands.lock = function() {
        if (API.getUser().permission < 3) return;
        API.moderateLockWaitList(true);
    };
    commands.unlock = function() {
        if (API.getUser().permission < 3) return;
        API.moderateLockWaitList(false);
    };
    commands.cycle = function() {
        if (API.getUser().permission < 3) return;
        $('.cycle-toggle').click();
    };
    commands.ban = function(a) {
        if (API.getUser().permission < 3) return;
        var user = getUser(a.message.substr(a.message.indexOf('@')+1));
        if (!user) return Chat('error', 'User not found.');
        if (user.permission) return Chat('error', 'You shouldn\'t ban those with ranks!');
        API.moderateBanUser(user.id,0,-1);
    };
    commands.kick = function(a) {
        if (API.getUser().permission < 2) return;
        var msg = a.split(' '), user, dur;
        if (msg[msg.length-1] != 'day' && msg[msg.length-1] != 'hour') {
            user = getUser(a.message.substr(a.message.indexOf('@')+1));
            dur = 60;
        } else {
            user = getUser(msg.slice(1,msg.length-1).join(' ').substr(1));
            dur = msg[msg.length-1] == 'day' ? 1440 : 60;
        }
        if (!user) return Chat('error', 'User not found.');
        if (user.permission) return Chat('error', 'You shouldn\'t kick those with ranks!');
        API.moderateBanUser(user.id,0,dur);
    };
    commands.pm = function(a) {
        if (cd) return Chat('error', 'PMs have a 2 second slow-mode!');
        if (sock.readyState != 1) return Chat('error', 'Not connected to TastyPlug\'s server!');
        if (a.message.split(' ').length == 1) return Chat('info', 'Usage: /pm @user message<br>Sends a private message to the user if they are using Tastyplug and you are each other\'s fans');
        var str = a.message.split(' '), msg = str.slice(2).join(' '), user = getUser(str[1].substr(1));
        if (!user) return Chat('error', 'User not found.');
        if (user.id == API.getUser().id) return Chat('error', 'You can\'t PM yourself!');
        if (user.relationship != 3) return Chat('error', 'You can only private message a user if you are each other\'s fans!');
        if (!msg) return Chat('error', 'Please input a message to send!');
        sock.msg({z:'pm',m:msg,f:API.getUser(),t:user})
        ChatPM('To: ' + user.username,msg);
        return true;
    };
    commands.r = function(a) {
        if (settings.lastPM) eventCommand('/pm @' + settings.lastPM + ' ' + a.message.split(' ').slice(1).join(' '));
        else Chat('error', 'Nobody has PMed you yet!');
    };
    commands.stream = function() {
        toggleStream();
        $('#tp-stream').toggleClass('button-on');
        saveSettings();
    };
    commands.opcheck = function(a) {
        if (cd) return Chat('error', '/opcheck has a 2 second slow-mode!');
        if (location.pathname != '/tastycat/') return;
        if (sock.readyState != 1) return Chat('error', 'Not connected to TastyPlug\'s server!');
        sock.msg({z:'songcheck',id:API.getNextMedia().media.id,song:'Next on your playlist'});
        return true;
    };
    commands.reset = function() {
        Chat('init', 'Reloading...');
        setTimeout(function(){$.getScript('http://fungustime.pw/tastyplug/tastyplug.js')},1500);
    };
    commands.commands = function() {
        Chat('info', 'TastyBot commands: <a href="http://fungustime.pw/tastybot" target="_blank">Click Here</a>');
        Chat('info', 'TastyPlug commands: ' + Object.keys(commands).join(', '));
    };
    commands.whois = function(a) {
        var user = getUser(a.message.split(' ').slice(1).join(' ').substr(1)), rank;
        if (!user) return Chat('error','User not found.');
        switch (user.permission) {
            case 10: rank = 'plug.dj Admin'; break;
            case 8: rank = 'Brand Ambassador'; break;
            case 5: rank = 'Host'; break;
            case 4: rank = 'Co-Host'; break;
            case 3: rank = 'Manager'; break;
            case 2: rank = 'Bouncer'; break;
            case 1: rank = 'Resident DJ'; break;
            case 0: rank = 'User'; break;
            default: rank = 'Unknown';
        }
        Chat('info','Username: <span>' + user.username + '</span><br>ID: <span>' + user.id + '</span><br>Points: <span>' + (user.listenerPoints+user.djPoints+user.curatorPoints) +
            '</span><br>Fans: <span>' + user.fans + '</span><br>Rank: <span>' + rank + '</span><br>Relation: <span>' + (user.relationship ? (user.relationship > 1 ? 'Friend' : 'Fan') : 'None') + '</span>');
    };
    commands.link = function() {
        var b = API.getMedia(), str = '';
        if (b.format == '1') Chat('info', 'Current song: <a href="http://youtu.be/' + b.cid + '" target="_blank">Click Here</a>');
        else SC.get('/tracks/' + b.cid, function(c) {
            Chat('info', 'Current song: ' + (c.permalink_url ? ('<a href="' + c.permalink_url + '" target="_blank">Click Here') : 'Link not found'));
        });
    };
    function Chat(type, m) {
        var chat = $('#chat-messages'), a = chat.scrollTop() > chat[0].scrollHeight - chat.height() - 28;
        chat.append('<div class="update tp-' + type + '"><span class="text">' + m + '</span></div>');
        if (a) chat.scrollTop(chat[0].scrollHeight);
        if (chat.children().length >= 512) chat.children().first().remove();
    }
    function ChatPM(user, msg) {
        var chat = $('#chat-messages'), a = chat.scrollTop() > chat[0].scrollHeight - chat.height() - 28,
        c = !user.indexOf('To: ') ? '-to' : '-from clickable'
        d = $('#chat-timestamp-button .icon').attr('class').substr(21),
        e = d == 'off' ? 'none' : 'block',
        f = new Date().toTimeString().substr(0,5), j = false,
        k = !user.indexOf('To: ') ? ' message' : ' mention';
        if (d == '12') {
            var g = parseInt(f),
                h = g >= 12 ? 'pm' : 'am',
                i = g%12 == 0 ? '12' : g%12;
            f = i + f.substr(2) + h;
        }
        if (f.charAt(0) == '0') f = f.substr(1);
        msg = urlFix(_.escape(msg));
        if (!msg.indexOf('&#x2F;me')) { msg = msg.replace('&#x2F;me','<em>'); j = true; }
        else if (!msg.indexOf('&#x2F;em')) { msg = msg.replace('&#x2F;em','<em>'); j = true; }
        j = j ? '' : '&nbsp;';
        chat.append('<div class="tastyplug-pm' + k + '"><i class="icon icon-ignored"></i><div class="timestamp" style="display:' + e + '">' + f + '</div><span class="from pm' + c + '">' + user + ' </span><span class="text">' + j + msg + '</span></div>');
        if (a) chat.scrollTop(chat[0].scrollHeight);
        if (chat.children().length >= 512) chat.children().first().remove();
    }
    function eta() {
        tos.eta = setInterval(function(){
            var pos = API.getWaitListPosition(), str = 'ETA: ';
            str += pos == -1 ? 'N/A' : getTime(pos*1000*60*(25/6) + API.getTimeRemaining()*1000);
            $('#waitlist-button').find('.eta').text(str);
        },60000);
    }
    function resize() {
        var room = $('#room'), rpos = room.position(), rwidth = room.width(), rheight = room.height(),
            ui = $('#tastyplug-ui'), uipos = ui.position(), uiwidth = ui.width(), uiheight = ui.height(), a = Object.keys(rpos);
        for (var i = 0; i < a.length; i++) {
            if (uipos[a[i]] < rpos[a[i]]) {
                ui.css({i:rpos[a[i]]});
            }
        }
        if (uiwidth + uipos.left > rwidth) ui.css({'left':rwidth-uiwidth});
        if (uiheight + uipos.top > rheight) ui.css({'top':rheight-uiheight});
        settings.uipos = ui.position();
        saveSettings();
    }
    function getUser(a) {
        a = a.trim();
        var b = API.getUsers();
        for (var i = 0; i < b.length; i++) if (b[i].username == a) return b[i];
        return null;
    }
    function getTime(a) {
        a = Math.floor(a/60000);
        var minutes = (a-Math.floor(a/60)*60);
        var hours = (a-minutes)/60;
        var str = '';
        str += hours + 'h';
        str += minutes<10?'0':'';
        str += minutes;
        return str;
    }
    function urlFix(a) {
        if (a.indexOf('http') == -1) return a;
        a = a.split(' ');
        for (var i = 0; i < a.length; i++) if (!a[i].indexOf('http')) a[i] = '<a href="' + a[i] + '" target="_blank">' + a[i] + '</a>';
        return a.join(' ');
    }
    function afkCheck() {
        if (settings.autojoin) tos.afkInt = setInterval(function(){
            if (Date.now() - afktime >= 1000*60*10) {
                settings.autojoin = false;
                $('#tp-autojoin').removeClass('button-on');
                clearInterval(tos.afkInt);
            }
        },6E4);
        else clearInterval(tos.afkInt);
    }
    function toggleStream() {
        _$context.trigger('settings:show');
        $('#settings').hide();
        $('.item.s-av').click();
        _$context.trigger('settings:hide');
    }
    function getStream() {
        _$context.trigger('settings:show');
        $('#settings').hide();
        var a = $('.item.s-av').hasClass('selected');
        _$context.trigger('settings:hide');
        return a;
    }
    function checkImg(a,b) {
        var img = new Image();
        img.onload =  function() {
            img.className += 'tp-img';
            if (280*img.height/img.width > 400) return;
            if (img.width > 280) img.className += ' wide';
            else if (img.height > 400) img.className += ' high';
            var c = b.html().replace('<a href="' + a + '" target="_blank">' + a + '</a>', '<br><a href="' + a + '" target="_blank">' + img.outerHTML + '</div></a>');
            var chat = $('#chat-messages'), d = chat.scrollTop() > chat[0].scrollHeight - chat.height() - 28;
            b.html(c);
            if (d) chat.scrollTop(chat[0].scrollHeight);
        };
        img.src = a;
    }
    function saveSettings(){localStorage.setItem('tastyPlugSettings',JSON.stringify(settings))}
    function showSettings(){$('#settings').show()}
    function getChatMentions(){return !$('.icon-mention-off').length}
    function getLocked(){return $('.lock-toggle .icon').hasClass('icon-locked')}
    function chatSound(){document.getElementById('chat-sound').playChatSound()}
    function startWooting(){"API.sendChat("} //anti plugcubed lol, they don't work together anyway
    startup();
})();