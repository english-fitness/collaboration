define(["storm", "boards", "underscore", "features/popup","storm.util"], function(storm, boards, _, popup,util) {
    var raising=false;
    var listUsers = {
        init: function() {
            startGreeting(friendsView());

            bindEvents();
        },

        setMicroStatus: function(userId, status) {
            var user = storm.users[userId];
            if(user === undefined) return;
            //if(storm.user.userId == userId) return;
            var microClass = status && status != '' ? 'micro board-icon-micro-'+status : 'micro board-icon-micro-nospeaking';
            if(user.role === storm.roles.TEACHER) {
                $('#teacher_area .micro').attr('class', microClass);
                
            } else {
                $('#user'+userId+' div .micro').attr('class', microClass);
            }
        },
        setGioTayStatus: function(userId, status) {
            var user = storm.users[userId];
            if(user == undefined) return;
            if (userId === storm.user.userId){
                if(status===''){
                    raising=false;
                }else{
                    raising=true;
                }
            }
            // console.log('Status rase: '+status);
            if(status===''){
                 document.getElementById('myTune-off').play();
                 //console.log('Bo gio tay');
            }
            else{
              //  console.log('Gio tay');
                document.getElementById('myTune-on').play();
            }
            var gioTayClass = status && status != '' ? 'raisehand board-icon-raisehand-'+status : 'raisehand';
            $('#user'+userId+' div .raisehand').attr('class', gioTayClass);
            
        },
    };

    function startGreeting(view) {
        var io = storm.comm.socket;

        function addUser(user) {
            if(user.role == storm.roles.STUDENT) {
                storm.students[user.userId] = user;
            } else if(user.role == storm.roles.TEACHER) {
                storm.teachers[user.userId] = user;
            }

            storm.users[user.userId] = user;
            view.add(user);
        }

        function removeUser(user) {
            if(user.role == storm.roles.STUDENT) {
                delete storm.students[user.userId];
            } else if(user.role == storm.roles.TEACHER) {
                delete storm.teachers[user.userId];
            }

            delete storm.users[user.userId];
        }

        io.on('hello', function(user) {
            addUser(user);
        });

        io.on('bye', function(user) {
            removeUser(user);
            view.remove(user);
        });

        io.on("joined", function (data) {
            storm.users = {};
            // addUser(storm.user);

            _.each(data, function(user, key) { addUser(user)});

            io.emit('hello', storm.user);

            popup.showWelcome();
        });
   }

    var friendsView = function() {
        function addUserToList(ul, user) {
            var name = user.role == storm.roles.TEACHER ? user.name : user.name;
            if(raising==true){
                storm.comm.socket.emit('raiseHand', storm.parentBoardId, {userId:storm.user.userId, status:'raising'});
            }
            if(user.role == storm.roles.TEACHER && !$('#teacher_area').attr('data')) {
                $('#teacher_area .name').text(name);
                $('#teacher_area').attr('data', user.userId);
                $('#teacher_area .name').attr('style', 'color: red');
            } else {
                if($('li#user'+ user.userId).length === 0){
                    ul.append('<li id="user' + user.userId + '"><span id="'+user.userId+'">' 
                            + name + '</span><div class="action"><div class="micro board-icon-micro-nospeaking"></div><div class="raisehand"></div></div></li>');
                    if(user.userId === storm.user.userId) {
                        $('#user'+user.userId).attr('style', 'color: #245ba7');
                    }
                    bindPopover(user.userId);
                }
            }
        }

        function removeUserFromList(user) {
            if($('#teacher_area').attr('data') == user.userId) {
                $('#teacher_area .name').text('');
                $('#teacher_area').removeAttr('data');
                $('#teacher_area .micro').attr('class', 'micro');
            } else {
                $('#user' + user.userId).remove();
            }
        }

        return {
            ul: $('.list-user'),

            add: function(user) {
               addUserToList(this.ul, user);
            },

            remove: function(user) {
               removeUserFromList(user);
            },
        };
    };

    function bindEvents() {
        $('.list-user').on('click', 'li', function(event) {
            if(storm.user.canKickUser()) {
                var span = this;
                $('.list-user li span').each(function(index, element) {
                    if($(element).html() != $(span).html()) $(element).popover('hide');
                });
                $(this).popover('toggle');
            } else if (storm.user.isTeacher()&&util.getMode()==='1') {
                var userId = $(this).attr('id').substring(4);
                storm.comm.socket.emit('changeSpeakingStudent', storm.parentBoardId, {userId:userId});
                listUsers.setGioTayStatus(userId,'');
            }
        });
        $('.list-user').on('click', 'button.close', function(event) {
            var userId = $(this).attr('data');
            $('#user'+userId+' span').popover('hide');
        });

        $('.list-user').on('click', 'button.js-leave', function(event) {
            var userId = $(this).attr('data');
            var name = storm.users[userId].name;
            if(confirm('Bạn có chắc chắn loại học sinh '+name+' ra khỏi lớp không?')) {
                var data = {'boardId': storm.parentBoardId, }
                storm.comm.socket.emit('kickUser', storm.parentBoardId, { userId: userId });
                $('#user'+userId+' span').popover('hide');
            }
        });
    }

    function bindPopover(userId) {
        $('#user'+userId+' span').popover({
            placement: 'left',
            html: true,
            trigger: 'manual',
            container: '.list-user',
            title: function() {
                var button = '<button type="button" class="close" data="'+userId+'">&times;</button>';
                var name = $(this).html();

                return '<div>'+name+'&nbsp'+button+'</div>';
            },
            content: '<button type="button" class="btn btn-default js-leave" data="'+userId+'">Rời lớp</button>'
        });
    }

    return listUsers;
});
