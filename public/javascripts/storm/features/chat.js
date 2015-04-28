/**
 * To handle sending/receiving and showing user chat
 */

define(["storm", "underscore"], function(storm, _) {

    var emoticons = {
        '>:(': 'emoticon-grumpy',
        '3:)': 'emoticon-devil',
        'O:)': 'emoticon-angel',
        '>:O': 'emoticon-upset',
        ':)': 'emoticon-smile',
        ':(': 'emoticon-sad',
        ':p': 'emoticon-tongue',
        ':d': 'emoticon-big-smile',
        ':O': 'emoticon-gasp',
        ';)': 'emoticon-wink',
        'B)': 'emoticon-glasses',
        'B|': 'emoticon-sunglasses',
        ':/': 'emoticon-unsure',
        ":'(": 'emoticon-cry',
        ':*': 'emoticon-kiss',
        '<3': 'emoticon-heart',
        '^_^': 'emoticon-kiki',
        '-_-': 'emoticon-squint',
        'o.O': 'emoticon-confused',
        ':v': 'emoticon-pacman',
        ':3': 'emoticon-curlylips',
        '(y)': 'emoticon-like',
        '(n)': 'emoticon-dislike'
    }, patterns = [],
        metachars = /[[\]{}()*+?.\\|^$\-,&#\s]/g;

    var urlPattern = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/ig;

    var chat = {
        init: function() {
            storm.comm.socket.on("sendMessage",function(data) {
                if(data && data.message) {
                    showMessage(data);
                }
            });

            for (var i in emoticons) {
                if (emoticons.hasOwnProperty(i)){ // escape metacharacters
                    var key = i.replace(metachars, "\\$&");
                    patterns.push('(^'+key+"|\\s"+key+"\\s|"+key+'$)');
                }
            }
            bindEvents();
        },

        sendMessage: sendMessage
    }

    function replaceEmoticon(message) {

        // build a regex pattern for each defined property


        // build the regular expression and replace
        return message.replace(new RegExp(patterns.join('|'),'ig'), function(match) {
            var key = match.toLowerCase().trim();
            return typeof emoticons[key] != 'undefined' ?
                ' <span class="'+emoticons[key]+'"></span> ' : match;
        });
    }

    function replaceUrl(message) {
        return message.replace(urlPattern, function(match) {
            return '<a href="'+match+'" target="_blank">'+match+'<a>';
        });
    }

    function str_replace(find,replace,str) {
       return str.split(find).join(replace);
    }

    function checkTime(i) {
        if (i<10) i = "0"+i;
        return i;
    }

    function showMessage(data) {
        var t = new Date(data.createdTime);
        var formattedTime = checkTime(t.getHours())+":"+checkTime(t.getMinutes());
        if(t.toLocaleDateString() != new Date().toLocaleDateString()) {
        formattedTime = t.getFullYear()+"/"+checkTime(t.getMonth())+"/"+checkTime(t.getDate()) + " " + formattedTime;
        }

        // var formattedTime = createdTime.toLocaleTimeString();
        var message = str_replace("\n","</br>",data.message);
        message = replaceEmoticon(message);
        message = replaceUrl(message);
        $("#chattext").append('<li><span class="sender">['+formattedTime+'] '+data.createdBy+': </span>' + message + '</li>');
        $(".listChat").scrollTop($(".listChat #chattext").height());
    }

    function sendMessage(message) {
        var dataMes = {boardId:storm.parentBoardId, createdBy:storm.user.name,message:message, createdTime: new Date().getTime()}
        showMessage(dataMes);
        storm.comm.socket.emit("sendMessage", storm.parentBoardId, dataMes);

    }



    function bindEvents() {
        var shiftStatus =false;
        $(window).keydown(function(e) {
            if(e.keyCode ==16) {
             shiftStatus = true;
            }
        }).keyup( function(e){
            if(e.keyCode ==16) {
             shiftStatus = false;
            }
        });
        $('#chat').keypress(function(e) {
            if(e.keyCode == 13) {  // enter key
                if(shiftStatus==false){
                    if($("#chat").val()) {
                        sendMessage($("#chat").val());
                        $("#chat").val('').focus();
                    }

                    $(".listChat").scrollTop($(".listChat #chattext").height());
                    return false;
                }
            }
        });
    }

   return chat;
});