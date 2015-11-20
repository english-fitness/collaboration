define(function () {
    "use strict";
	return {
		fillColor : "",
		points : {},
		palette: {},
		layout: {},
        sync:true,
        locked:false,
        type_upload:'',
        mathX:100,
        mathY:100,
        canMove:true,
        activeDrag:null,
        eraseMode:false,
        highlightMode:false,
        processingPdf:false,
        pathMode:false,
        currentCanvas:null,
        currentBoardId:null,
        user: {},
        users: {},
        roles: {TEACHER: 'role_teacher', STUDENT: 'role_student', MONITOR: 'role_monitor', ADMIN: 'role_admin'},
        teachers: {},
        students: {},
		sessionId: null,
        sessionStatus: 0,
        enableDraw: true,
        timer_started: false,
        myTimer:null,
        parentBoardId:null,
        boardLoaded:{},
        canvases:{},
        dataBoards:[],
        canvasHeights:[],
        loadedPdf:[],
        loadedBackground:[],
        currentPages:[],
        currentBoardPage:[],
        currentBoardScale:[],
        totalPages:[],
        panigationInit:false,
        pdfObj: [],
        currentScale:[],
        drawText:false,
        eraserSize:20,
        eraserCorlor:'#FFF',
        highlightSize:16,
        highlightCorlor:'rgba(250,212,10,0.3)',
        modifyText:false,
        currentCursor:'default',
        showingLoad:false,
        lastTimeClick:0,
        canScaling:true,
		containers: {},
		textEl: null,
		drawShape : false,
		action: null,
		shapeArgs: null,
		currTool: null,
		xPoints : [],
		yPoints : [],
		xOffset: null,
        topScroll:0,
		yOffset: null,
		paletteName: null,
		associateText: {},
		focusInput: "stroke",
		palettes: {},
		Properties: {},
		$currActiveIcon: null,
		main: {},
		comm: {},
		events: {},
		hLine: {},
		vLine: {},
		horIndent : 1,
		verIndent : 1,
		indentMultiplier : 10,
		imageTag: null,
		containerName: null,
		eventObj: {},
		layoutURL: null,
		undoStack: [],
		redoStack: [],
		groupCopyMode: false,
		isUpdatingProperties: false,
        started: false,
        x:0,
        y:0,
        currentObj:{},
        reloadConfirm: true,
        resetValue: function() {
            this.type_upload='';
            this.canMove=true;
            this.activeDrag=null;
            this.eraseMode=false;
            this.currentCanvas=null;
            this.currentBoardId=null;
            this.parentBoardId=null;
            this.boardLoaded={};
            this.canvases={};
            this.dataBoards=[];
            this.canvasHeights=[];
            this.loadedPdf=[];
            this.loadedBackground=[];
            this.currentPages=[];
            this.currentBoardPage=[];
            this.totalPages=[];
            this.panigationInit=false;
            this.pdfObj=[];
            this.drawText=false;
            this.modifyText=false;
            this.currentCursor='default';
            this.showingLoad=false;
            this.currentObj = {};
            this.undoStack= [];
            this.redoStack= [];
        }
	};
});