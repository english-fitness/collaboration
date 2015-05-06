define(["storm","storm.util","storm.comm"], function (storm,util,comm) {
var math  =  {

  /*
  * div math editor id*/
  mathEditID: $("#editable-math"),

  latexSource: $('#latex-source'),

//print the HTML source as an indented tree. TODO: syntax highlight


  /* latex code */
  latex: null,

  /* init */
  init: function(){
    var self = this;
    setTimeout(function(){
        self.createTools();
        self.eventActionClick();
        self.uploadLatex();

    },1500);

    return self;

  },

  /*
  * upload latex
  */
  uploadLatex: function() {
      var self = this;
      self.mathEditID.bind('keydown keyup', function(){
          setTimeout(function(){
              self.latex = self.mathEditID.mathquill('latex');
              self.latexSource.val(self.latex);

          });
      }).keydown().focus();

      self.latexSource.bind('keydown keypress, change', function() {
        setTimeout(function() {
            var newtext = self.latexSource.val();
            self.mathEditID.mathquill('latex', newtext);
            self.latex = newtext;
        });
    });
  },

  /* update latex code*/
  updateLatex: function(){
      this.latex = this.mathEditID.mathquill('latex');
  },

  /* object */
  object: null,

  /*
  * if action tools  by math, the present popup
  * */
  eventActionClick: function() {
      var self= this;
      $('.math_quill').on("click",".math_save",function(e) {
         e.preventDefault();
         if(self.latex){
             self.saveLatexAndCreateObject();
             self.resetEditor();
             $(".s-pointer").click();
         }else{
             alert("Please enter content before saving");
         }
      });
      $('.math_quill').on("click",".math_cancel",function(e) {
          e.preventDefault();
          self.hiddenEditor();
          self.resetEditor();
      });

  },
  resetEditor:function(){
      /* @TODO reset editor here */
  },

  /*hidden editor*/
  hiddenEditor: function() {
      $(".math_quill").hide();
  },
  /*
   save Latex And Create Object
  */
  saveLatexAndCreateObject: function() {
      this.hiddenEditor();

      if(canvas.getActiveObject()){
          return this.update();
      }else{
          return this.create();
      }
  },

  /*
  create math editor
  */
  createMathEditor: function(value,x,y) {
      var xValue = (x>190)?(x-190):x;
      var yValue = (y>120)?(y-120):y;
      $(".math_quill").css({
          left:300,
          top:100
      });
      this.latexSource.val(value);
      this.latexSource.trigger('change');
      $(".math_quill").show();

  },

  /*
  * get Url */
  getUrl: function() {
      if(this.latex)
            //return 'http://chart.apis.google.com/chart?cht=tx&chof=png&chs=50&chl='+encodeURIComponent(this.latex);
            return 'https://chart.googleapis.com/chart?cht=tx&chs=32&chl='+encodeURIComponent(this.latex);
  },

  /*create */
  create:function() {
      var file_url = '';
      file_url = this.getUrl();
      var self = this;
      var imgObj = util.getDefaultDataFromArray(storm.palette['components'].shapes['image'].properties);
      imgObj.uid = util.uniqid();

      var obj = [imgObj];
      obj[0].name = 'image';
      obj[0].src = file_url;
      obj[0].source = file_url;
      obj[0].latex = self.latex;
      obj[0].top = storm.mathY;
      obj[0].left = storm.mathX;
      obj[0].type = "math";
      obj[0].showEditIcon =  true;
      obj[0].scale = 1;
      obj[0].palette = 'components';
      obj[0].opacity = 1;

	  storm.palette['components'].shapes['image'].toolAction.apply(this, obj);

	  storm.comm.sendDrawMsg({
		  palette: 'components',
		  action: 'image',
		  args: obj
	  });
  },

  /*update*/
  update: function() {

      var object = canvas.getActiveObject();
      if(this.latex != ''){
          var url = this.getUrl();

          var imgObj = util.getDefaultDataFromArray(storm.palette['components'].shapes['image'].properties);
          var obj = [imgObj];
          object.latex  = this.latex;
          object.src = url;
          object.showEditIcon =  true;
          obj[0].name = 'image';
          object.palette = 'components';
          obj[0].name = 'image';
          obj[0].palette = 'components';
          obj[0].uid = object.uid;
          obj[0].object = object;
          obj[0].width = object.width;
          obj[0].height = object.height;
          obj[0].top = object.top;
          obj[0].left = object.left;
          obj[0].scaleX = object.scaleX;
          obj[0].scaleY = object.scaleY;
          obj[0].latex = this.latex;
          obj[0].showEditIcon =  true;
          obj[0].src =  url;

          storm.palette['components'].shapes['image'].modifyAction.apply(this, obj);

          storm.comm.sendDrawMsg({
              palette: 'components',
              action: 'modified',
              args: [{
                  uid:object.uid,
                  object:obj[0]
              }]
          });
      }

  },

  /*insert  math latex*/
  writeMathLatex: function(latex) {
      this.mathEditID.mathquill("write",latex);
  },

  /* create icon tools*/
  createIconTool: function(classs) {
    return '<i class="'+classs+'">&nbsp;</i> ';
  },
  /* tools latex */
  toolsLatex:[{
      tabName:'basic',
      htmlValue:'Basic',
      active:true,
      button:[{
          htmlOptions:{style:"width:72px"},
          button_tools:[{
              latex:'\\frac{}{}',
              class:"latex-icon-fraction ",
              htmlOptions:{style:"width:30px;height:30px;"}
          },{
              latex:'\\sqrt{}',
              class:"latex-icon-square-root",
              htmlOptions:{style:"width:30px;height:30px;"}
          },{
              latex:'{}/{}',
              class:"latex-icon-bevelled-fraction",
              htmlOptions:{style:"width:30px;height:30px;"}
          },{
              latex:'\\sqrt[]{}',
              class:"latex-icon-root",
              htmlOptions:{style:"width:30px;height:30px;"}
          }]
      },{
          htmlOptions:{style:"width:30px;border-right:none"},
          button_tools:[{
              latex:'{}^{}',
              class:"latex-icon-superscript",
              htmlOptions:{style:"width:30px;height:30px;"}
          },{
              latex:'{}_{}',
              class:"latex-icon-suberscript",
              htmlOptions:{style:"width:30px;height:30px;"}
          }]
      },{
          htmlOptions:{style:"width:72px;"},
          button_tools:[{
              latex:'\\left(\\right)',
              class:"latex-icon-parentheses",
              htmlOptions:{style:"width:30px;height:30px;"}
          },{
              latex:'\\left[\\right] ',
              class:"latex-icon-square-brackets",
              htmlOptions:{style:"width:30px;height:30px;"}
          },{
              latex:'\\left|\\right|',
              class:"latex-icon-vertical-bars",
              htmlOptions:{style:"width:30px;height:30px;"}
          },{
              latex:'\\left\\{\\right\\}',
              class:"latex-icon-curly-brackets",
              htmlOptions:{style:"width:30px;height:30px;"}
          }]
      },{
          htmlOptions:{style:"width:30px;border-right:none"},
          button_tools:[{
              latex:'\\int{}',
              class:"latex-icon-integral",
              htmlOptions:{style:"width:30px;height:30px;"}
          },{
              latex:'\\int^{}_{}',
              class:"latex-icon-integral__",
              htmlOptions:{style:"width:30px;height:30px;"}
          }]
      },{
          htmlOptions:{style:"width:108px"},
          button_tools:[{
              latex:'\\sin({})',
              class:"latex-icon-sin",
              htmlOptions:{style:"width:30px;height:30px;"}
          },{
              latex:'\\cos({})',
              class:"latex-icon-cos",
              htmlOptions:{style:"width:30px;height:30px;"}
          },{
              latex:'\\tan({})',
              class:"latex-icon-tan",
              htmlOptions:{style:"width:30px;height:30px;"}
          },{
              latex:'\\log',
              class:"latex-icon-log",
              htmlOptions:{style:"width:30px;height:30px;"}
          },{
              latex:'\\log_{}',
              class:"latex-icon-log_",
              htmlOptions:{style:"width:30px;height:30px;"}
          },{
              latex:'\\ln({})',
              class:"latex-icon-ln",
              htmlOptions:{style:"width:30px;height:30px;"}
          }]
      },{
          htmlOptions:{style:"width:72px;border-right:none"},
          button_tools:[{
              latex:'\\sum',
              class:"latex-icon-sum",
              htmlOptions:{style:"width:30px;height:30px;"}
          },{
              latex:'\\sum^{}_{}',
              class:"latex-icon-sum__",
              htmlOptions:{style:"width:30px;height:30px;"}
          },{
              latex:'\\prod{}',
              class:"latex-icon-coprod",
              htmlOptions:{style:"width:30px;height:30px;"}
          },{
              latex:'\\prod^{}_{}{}',
              class:"latex-icon-coprod__",
              htmlOptions:{style:"width:30px;height:30px;"}
          }]
      }]
  },{
      tabName:'dau',
      htmlValue:'Operator',
      button:[{
          htmlOptions:{style:"width:55px"},
          button_tools:[{
              latex:'+',
              class:"latex-icon-plus-sign",
              htmlOptions:{style:"width:20px;height:20px;"}
          },{
              latex:'-',
              class:"latex-icon-minus-sign",
              htmlOptions:{style:"width:20px;height:20px;"}
          },{
              latex:'\\times',
              class:"latex-icon-multiplication-sign",
              htmlOptions:{style:"width:20px;height:20px;"}
          },{
              latex:'\\div',
              class:"latex-icon-division-sign",
              htmlOptions:{style:"width:20px;height:20px;"}
          },{
              latex:'\\pm',
              class:"latex-icon-plus-minus-sign",
              htmlOptions:{style:"width:20px;height:20px;"}
          },{
              latex:'/',
              class:'latex-icon-forward-slash',
              htmlOptions:{style:"width:20px;height:20px;"}
          }]
      },{
          htmlOptions:{style:"width:52px"},
          button_tools:[{
              latex:'\\leftarrow',
              class:"latex-icon-leftwards-arrow",
              htmlOptions:{style:"width:20px;height:20px;"}
          },{
              latex:'\\rightarrow',
              class:"latex-icon-rightwards-arrow",
              htmlOptions:{style:"width:20px;height:20px;"}
          },{
              latex:'\\leftrightarrow',
              class:"latex-icon-left-right-arrow",
              htmlOptions:{style:"width:20px;height:20px;"}
          },{
              latex:'\\Leftarrow',
              class:"latex-icon-leftwards-double-arrow",
              htmlOptions:{style:"width:20px;height:20px;"}
          },{
              latex:'\\Rightarrow',
              class:"latex-icon-rightwards-double-arrow",
              htmlOptions:{style:"width:20px;height:20px;"}
          },{
              latex:'\\Leftrightarrow',
              class:"latex-icon-left-right-double-arrow",
              htmlOptions:{style:"width:20px;height:20px;"}
          }]
      },{
          htmlOptions:{style:"width:78px"},
          button_tools:[{
              latex:'\\lt',
              class:"latex-icon-lt",
              htmlOptions:{style:"width:20px;height:20px;"}
          },{
              latex:'\\gt',
              class:"latex-icon-gt",
              htmlOptions:{style:"width:20px;height:20px;"}
          },{
              latex:'\\le',
              class:"latex-icon-le",
              htmlOptions:{style:"width:20px;height:20px;"}
          },{
              latex:'\\ge',
              class:"latex-icon-ge",
              htmlOptions:{style:"width:20px;height:20px;"}
          },{
              latex:'\\neq',
              class:"latex-icon-neq",
              htmlOptions:{style:"width:20px;height:20px;"}
          },{
              latex:'\\sim',
              class:"latex-icon-sim",
              htmlOptions:{style:"width:20px;height:20px;"}
          },{
              latex:'\\infty',
              class:"latex-icon-infty",
              htmlOptions:{style:"width:20px;height:20px;"}
          },{
              latex:'\\equiv',
              class:"latex-icon-equiv",
              htmlOptions:{style:"width:20px;height:20px;"}
          },{
              latex:'=',
              htmlValue:"=",
              htmlOptions:{style:"width:20px;height:20px;"}
          }]
      },{
          htmlOptions:{style:"width:78px;border-right:none"},
          button_tools:[{
              latex:'\\in',
              class:"latex-icon-in",
              htmlOptions:{style:"width:20px;height:20px;"}
          },{
              latex:'\\ni',
              class:"latex-icon-ni",
              htmlOptions:{style:"width:20px;height:20px;"}
          },{
              latex:'\\notin',
              class:"latex-icon-notin",
              htmlOptions:{style:"width:20px;height:20px;"}
          },{
              latex:'\\notni',
              class:"latex-icon-notni",
              htmlOptions:{style:"width:20px;height:20px;"}
          },{
              latex:'\\subset',
              class:"latex-icon-subset",
              htmlOptions:{style:"width:20px;height:20px;"}
          },{
              latex:'\\supset',
              class:"latex-icon-supset",
              htmlOptions:{style:"width:20px;height:20px;"}
          },{
              latex:'\\cap',
              class:"latex-icon-cap",
              htmlOptions:{style:"width:20px;height:20px;"}
          },{
              latex:'\\cup',
              class:"latex-icon-cup",
              htmlOptions:{style:"width:20px;height:20px;"}
          }]
      }]
  }],

  /*create tools latex*/
  createToolsTabLatex: function() {
     var html = '<ul class="nav nav-tabs">',active;
     (this.toolsLatex).forEach(function(value){
         active = value.active?'class="active"':'';
         html +='<li '+active+'><a href="#'+value.tabName+'_tab" data-toggle="tab">'+value.htmlValue+'</a></li>';
     });
     html += '</ul>';
     return html;
  },

  /*
  * html option latex*/
  htmlOptionLatex: function(arrOptions) {
      var htmlOptions = "";
      if(!arrOptions) return htmlOptions;
      $.each(arrOptions,function(index,value){
          htmlOptions += ' '+index+' = '+value+' ';
      });
      return htmlOptions;
  },

  /*
  * create tools*/
  createToolsTabContentLatex: function() {
      var html = '<div class="tab-content">',active,_this = this,htmlValue,htmlOptions,ulHtmlOptions;
      (this.toolsLatex).forEach(function(value){
          active = value.active?'active':'';
          html +='<div class="tab-pane '+active+'" id="'+value.tabName+'_tab">';
          (value.button).forEach(function(button_value){
                 html +='<ul class="ul_tools_latex" '+_this.htmlOptionLatex(button_value.htmlOptions)+'>';
                (button_value.button_tools).forEach(function(button_tools){
                    htmlValue =button_tools.class?_this.createIconTool(button_tools.class):button_tools.htmlValue;
                    html += '<li><button '+_this.htmlOptionLatex(button_tools.htmlOptions)+' type="button" latex="'+button_tools.latex+'">'+htmlValue+'</button></li>';
                });
             html += '</ul>';
         });
         html +='<div style="clear: both"></div></div>';
      });
      html += '</div>';
      return html;
  },

  /*
  * create tools*/
  createTools: function() {
     var _this = this,latex;
     $("#mathTools").append(this.createToolsTabLatex());
     $("#mathTools").append(this.createToolsTabContentLatex());
     $(".ul_tools_latex li button").click(function(){
        latex = $(this).attr("latex");
        _this.writeMathLatex(latex);
        _this.latex = _this.mathEditID.mathquill('latex');
        _this.latexSource.val( _this.latex);
     });
  }
}
return math.init();
});