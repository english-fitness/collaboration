define(["storm"], function(storm) {
	var user = {
		canViewInvisibleImage: function() {
			return storm.user.role == storm.roles.STUDENT ? false : true;
		},
		canChangeInvisibleImage: function() {
			return storm.user.role == storm.roles.STUDENT ? false : true;
		},
		canKickUser: function() {
			return storm.user.role == storm.roles.ADMIN || storm.user.role == storm.roles.MONITOR;
		},
		isStudent: function() {
			return storm.user.role == storm.roles.STUDENT;
		},
		isTeacher: function() {
			return storm.user.role == storm.roles.TEACHER;
		}
	};

	return user;
});