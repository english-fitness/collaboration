define(["storm"], function(storm) {
    function init() {
        storm.comm.socket.on('createQuestion', function (data) {
            if(data && data.question) {
                showQuestion(data);
            }
        });

        storm.comm.socket.on('setQuestionDone', function (data) {
            var current_li = $('#question_'+ data.questionId);
            setQuestionPosition(current_li, data.done);
        });

        storm.comm.socket.on('deleteQuestion', function (data) {
            $('#question_'+ data.questionId).fadeOut('slow').remove();
            updateNumberQuestions();
        });

        bindButtons();
    }

    function str_replace(find,replace,str){
        return str.split(find).join(replace);
    }

    function checkTime(i) {
        if (i<10) i = "0"+i;
        return i;
    }

    function showQuestion(data) {
        var ownerId = data.user.userId;
        var t = new Date(data.createdTime);

        var formattedTime = checkTime(t.getHours())+":"+checkTime(t.getMinutes());
        if(t.toLocaleDateString() != new Date().toLocaleDateString()) {
            formattedTime = t.getFullYear()+"/"+checkTime(t.getMonth())+"/"+checkTime(t.getDate()) + " " + formattedTime;
        }

        $("#questions").append('<li id="question_'+ data.questionId +'"><span class="remove" ></span><input class="check_done" type="checkbox" data-owner="'+ownerId +'"  name="question_'+ data.questionId + '"/><span class="sender">'+data.user.name+" ["+formattedTime+ '] : </span><p>' + str_replace("\n","</br>",data.question) + '</p></li>');
        var current_li = $('#question_'+data.questionId);
        setQuestionPosition(current_li, data.done);

        $(".ask-content .listChat").scrollTop($(".listChat #questions").height());
        if(data.done == 0){
            if(!$('.tab-items .tab-ask').hasClass('active') && !$('.tab-items .tab-ask').hasClass('in-coming')){
                $('.tab-items .tab-ask').addClass('in-coming');
            }
        }
    }

    function updateNumberQuestions() {
        var asking = $("#questions li.asking-question").length;
        $('#tab-title .tab-items .tab-ask span').html('Câu hỏi ('+asking+')');
    }

    function sendQuestion() {
        if($("#ask").val()) {
            var question = $("#ask").val();
            var dataAsk = {boardId:storm.parentBoardId, user:storm.user,question:question, createdTime: new Date().getTime()}
            createQuestion(dataAsk);
        }
        $("#ask").val('').focus();
    }

    function createQuestion(data) {
        storm.comm.socket.emit("createQuestion", storm.parentBoardId, data);
    };

    function setQuestionDone(data) {
        data.boardId = storm.parentBoardId;
        storm.comm.socket.emit("setQuestionDone", storm.parentBoardId, data);
    };

    function deleteQuestion(data) {
        data.boardId = storm.parentBoardId;
        storm.comm.socket.emit("deleteQuestion", storm.parentBoardId, data);
        updateNumberQuestions();
    };


    function bindButtons() {
        $('.askSend #send').click(function(e) {
            sendQuestion();
            $(".ask-content .listChat").scrollTop($(".listChat #questions").height());
            $('.askSend').hide();
            $('.showAsk').fadeIn('slow');
            return false;
        });

        $('.askSend #discard').click(function(e) {
            $('#ask').val('');
           $('.askSend').hide();
            $('.showAsk').fadeIn('slow');
        });
        $('#questions').on('click','input.check_done',function(e) {
            if(storm.user.role  == storm.roles.STUDENT && storm.user.userId != $(this).attr('data-owner')){
                e.preventDefault();
                return false;
            }
        });

        $('#questions').on('click','.remove',function(e) {
            var check = $(this).parent().find('input[type=checkbox]');
            if(storm.user.role  == storm.roles.STUDENT && check.attr('data-owner') != storm.user.userId){
                e.preventDefault();
                return false;
            }
            var self = $(this);
            var li = self.parent();

            if(window.confirm('Bạn có chắc muốn xóa câu hỏi này không?')){
                var li_id = li.attr('id');
                var temp = li_id.split('_');
                var questionId = temp[1];
                deleteQuestion({questionId:questionId});
            }
        });


        $('#questions').on('change','input.check_done',function(e) {
            if(storm.user.role  == storm.roles.STUDENT){
                e.preventDefault();
                return false;
            }
            var inputName = $(this).attr('name');
            var temp = inputName.split('_');
            var questionId = temp[1];
            var done = this.checked ? 1 : 0;
            var current_li = $('#question_'+ questionId);
            setQuestionPosition(current_li, done);
            setQuestionDone({questionId: questionId, done: done});
        });
    }

    function setQuestionPosition(current_li, done) {
        if(done == 1){
            if($("#questions li.done-question").length) {
                current_li.removeClass('asking-question').insertBefore($('.done-question').first()).addClass('done-question');
            } else {
                current_li.appendTo('#questions').removeClass('asking-question').addClass('done-question');
            }

            current_li.find('input[type=checkbox]').prop('checked', true);
        }else{
            if($("#questions li.asking-question").length){
                current_li.insertAfter('#questions li.asking-question:last').removeClass('done-question').addClass('asking-question');
            }else{
                current_li.prependTo('#questions').removeClass('done-question').addClass('asking-question');
            }
            current_li.find('input[type=checkbox]').prop('checked', false);
        }

        updateNumberQuestions();
    }

   return {
       init: function() { init(); }
   };
});