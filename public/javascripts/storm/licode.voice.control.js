define(["storm", "underscore"], function(storm, _) {
    var voiceTable = {}, users = {};
    var voiceControl = {

        init: function() {
            storm.comm.socket.on('voice', function(data) {
                voiceTable = data;
                if(voiceControl.syncVoiceTable) {
                    voiceControl.syncVoiceTable();
                }
            });

            bindButtons();
        },

        addVoiceButton: function() {
            if(storm.user.role != storm.roles.STUDENT) {
                $('#friendsicon .title .board-icon-voice').remove();
                $('#friendsicon .title').append('<div class="board-icon-voice"></div>');
            }
        },

        syncVoiceTable: null,

        getVoiceTable: function() {
            return voiceTable;
        },

        renderHtml: function() {
            var title = 'Bảng điều khiển âm thanh';
            var html = '<div class="listUserRender"><div class="titleName">'+title+'</div> ',_this = this;
            html +='<div class="hind">Lựa chọn mỗi người có thể nói cho những ai nghe</div>';
            _(voiceTable).each(function(value, userId) {
                html +=_this.renderUserColumn(userId,value);
            });

            html += '<div class="clearfix"></div> </div>';

            return html;
        },

        renderUserColumn: function(userId, voiceOptions) {
            var html = '<div class="row" uid="'+userId+'">',_this = this,user;
            html +='<div class="fullName">'+getUserName(userId)+'</div>';
            html += 'Có thể nói với:'
            html +='<div class="option">';
            html += '<input type="checkbox" value="1" id="userCheckAll"/><span class="limitText">Tất cả</span> ';
            html += '</div>'

            _(voiceOptions).each(function(value, otherUserId) {
                html +='<div class="option">';
                html += _this.renderVoiceOption(otherUserId, userId, value);
                html += '</div>';
            });

            html +='</div>';
            return html;
        },

        renderVoiceOption: function(otherUserId, userId, status) {
            var html ='<div class="checkBox">',checked = '';

            checked = (status==1)?'checked="checked"':"";
            html += '<input uid="'+userId+'" name="optionVoice" '+checked+' type="checkbox" value="'+otherUserId+'"/>';
            html +='<span class="limitText">'+getUserName(otherUserId)+'</span>';
            html +='</div>';
            return html;
        },

    };

    function bindButtons() {
        $("#voiceTable").on("click","#userCheckAll",function() {
            $(this).parent().parent().find("input").prop("checked",this.checked);
        });
        $("#friendsicon .title").on("click", ".board-icon-voice", function() {
            $("#voiceTable").modal('show');
            $("#voiceTable .modal-body").html(voiceControl.renderHtml());
        });
        $("#saveVoiceTable").click(function() {
            var elements  = $("#voiceTable .listUserRender input[name='optionVoice']");
            if(elements) {
                _(elements).each(function(element) {
                    var uid = $(element).attr("uid"),
                    checked = $(element).is(':checked'),
                    val = $(element).val();
                    checked = checked?1:0;
                    if(uid) {
                        voiceTable[uid][$(element).val()] = checked;
                    }
                });
                if(voiceControl.syncVoiceTable) {
                    voiceControl.syncVoiceTable();
                    storm.comm.socket.emit('voice', storm.parentBoardId, voiceTable);
                    $(".loadNotification").html("Lưu cấu hình âm thanh thành công");
                    setTimeout(function() {
                        $(".loadNotification").html("");
                        $("#closeVoiceTable").click();
                    }, 00);
                }
            }
        });
    };



    function getUserName(userId) {
        if(_(users).isEmpty()) {
            users = storm.dataBoards[storm.parentBoardId].users;
        }
        if(_(users).has(userId)) return users[userId].name; else return userId;
    }

    return voiceControl;

});