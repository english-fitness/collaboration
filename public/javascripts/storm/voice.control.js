define(["storm", "underscore", "webrtcsupport"], function(storm, _, webrtcsupport) {
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
            var title = 'Audio Control';
            var html = '<div class="listUserRender"><div class="titleName">'+title+'</div> ',_this = this;
            html +='<div class="hind">Select who can speak with whom</div>';
            _(voiceTable).each(function(value, userId) {
                html +=_this.renderUserColumn(userId,value);
            });

            html += '<div class="clearfix"></div> </div>';

            return html;
        },

        renderUserColumn: function(userId, voiceOptions) {
            var html = '<div class="row" uid="'+userId+'">',_this = this,user;
            html +='<div class="fullName">'+getUserName(userId)+'</div>';
            html += 'Can speak to:'
            html +='<div class="option">';
            html += '<input type="checkbox" value="1" id="userCheckAll"/><span class="limitText">All</span> ';
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

        gainController: function(stream){
            return new GainController(stream);
        }
    };

    function GainController(stream){
        this.support = webrtcsupport.webAudio && webrtcsupport.mediaStream;

        this.gain = 1;

        if (this.support){
            var context = this.context = new webrtcsupport.AudioContext();
            this.microphone = context.createMediaStreamSource(stream);
            this.gainFilter = context.createGain();
            this.destination = context.createMediaStreamDestination();
            this.outputStream = this.destination.stream;
            this.microphone.connect(this.gainFilter);
            this.gainFilter.connect(this.destination);
            stream.addTrack(this.outputStream.getAudioTracks()[0]);
            this.originalTrack = stream.getAudioTracks()[0];
            stream.removeTrack(this.originalTrack);
        }
        this.stream = stream;
    }

    GainController.prototype.setGain = function(value){
        if (!this.support)
            return;
        this.gainFilter.gain.value = value;
        this.gain = value;
    }

    GainController.prototype.getGain = function(){
        return this.gain;
    }

    GainController.prototype.resetGain = function(){
        this.setGain(1);
    }

    GainController.prototype.mute = function(){
        this.setGain(0);
    }

    GainController.prototype.restoreTrack = function(){
        if (this.support){
            var stream = this.stream;
            stream.removeTrack(stream.getAudioTracks()[0]);
            stream.addTrack(this.originalTrack);
        }
    }

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
                    $(".loadNotification").html("Audio configuration saved successfully");
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