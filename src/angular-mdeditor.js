/**
* harrie.mdeditor Module
*
* Description
* a markdown editor for angular
* https://github.com/varHarrie/angular-mdeditor
*/
angular.module('harrie.mdeditor', [
])
.config(function(){
	if(angular.isUndefined(window.marked)){throw(new Error('Require marked!'));}
	if(angular.isUndefined(window.hljs)){throw(new Error('Require hljs!'));}
	String.prototype.startWith=function(str,doTrim){
		var s=(typeof doTrim!=='undefined'&&!!doTrim)?this.trim():this;
		return (typeof str==='string') && s.length>=str.length && s.substr(0,str.length)===str;
	}
	String.prototype.endWith=function(str,doTrim){
		var s=(typeof doTrim!=='undefined'&&!!doTrim)?this.trim():this;
		return (typeof str==='string') && s.length>=str.length && s.substr(s.length-str.length)===str;
	}

})
.constant('mdeditorConfig',{
	classNames:{
		wrapper:'mdeditor',
		toolbar:'mdeditor-toolbar',
		toolbarItem:'mdeditor-toolbar-item',
		separator:'mdeditor-toolbar-separator',
		textarea:'mdeditor-textarea',
		preview:'mdeditor-preview'
	},
	toolbar:[
		{action:'bold',icon:'fa fa-bold',tip:'加粗(Ctrl+B)'},
		{action:'italic',icon:'fa fa-italic',tip:'斜体(Ctrl+I)'},
		{action:'header',icon:'fa fa-header',tip:'标题(Ctrl+H)'},
		{separator:true},
		{action:'ul',icon:'fa fa-list-ul',tip:'无序列表(Ctrl+U)'},
		{action:'ol',icon:'fa fa-list-ol',tip:'有序列表(Ctrl+O)'},
		{action:'code',icon:'fa fa-code',tip:'代码(Ctrl+K)'},
		{action:'quote',icon:'fa fa-quote-left',tip:'引用(Ctrl+Q)'},
		//{action:'indent',icon:'fa fa-indent',tip:'缩进(Tab)',keycode:9,ctrl:false},
		//{action:'outdent',icon:'fa fa-outdent',tip:'减小缩进(Tab)',keycode:9,ctrl:false,shift:true},
		{separator:true},
		{action:'link',icon:'fa fa-link',tip:'连接(Ctrl+L)'},
		{action:'img',icon:'fa fa-picture-o',tip:'图片(Ctrl+G)'},
		/*{action:'file',icon:'fa fa-file-o',tip:'文件',keycode:'',ctrl:true},*/
		{separator:true},
		{action:'undo',icon:'fa fa-undo',tip:'撤销'},
		{action:'redo',icon:'fa fa-repeat',tip:'重做'},
		{action:'preview',icon:'fa fa-eye',tip:'浏览'},
		{action:'fullscreen',icon:'fa fa-arrows-alt',tip:'全屏'}
	],
	shortcut:{
		'Ctrl-B':'bold',
		'Ctrl-I':'italic',
		'Ctrl-H':'header',
		'Ctrl-U':'ul',
		'Ctrl-O':'ol',
		'Ctrl-K':'code',
		'Ctrl-Q':'quote',
		'Ctrl-L':'link',
		'Ctrl-G':'img'
	}
})
.factory('actions', [function(){
	var syntax={
		bold:{prefix:'**',postfix:'**'},
		italic:{prefix:'_',postfix:'_'},
		code:{prefix:'```\n',postfix:'\n```'},
		link:{prefix:'[',postfix:'](src)'},
		img:{prefix:'![',postfix:'](src)'},

		header:{prefix:'### ',postfix:''},
		quote:{prefix:'> ',postfix:''},
		ul:{prefix:'- ',postfix:''},
		//ol:{},
		//indent:{},
		//outdent:{},
	};
	function inlineAction(cm,actionName,canStartWithSpace){
		var texts=cm.getSelections();
		var replacements=[];
		var prefix=syntax[actionName].prefix;
		var postfix=syntax[actionName].postfix;
		texts.forEach(function(text){
			if( text.length>=prefix.length+postfix.length &&
				text.startWith(prefix,canStartWithSpace) &&
				text.endWith(postfix)){
				replacements.push(text.substr(prefix.length,text.length-prefix.length-postfix.length));
			}else{
				replacements.push(prefix+text+postfix);
			}
		});
		cm.replaceSelections(replacements,'around');
	}
	function rowAction(cm,actionName){
		//select row
		var selections=cm.listSelections();
		selections.forEach(function(range){
			var num1=range.anchor.line,num2=range.head.line;
			var start=num1<num2?num1:num2,end=num1>num2?num1:num2;
			cm.addSelection({line:start,ch:0},{line:end});
		});
		var prefix=syntax[actionName].prefix;
		var replacements=[];
		selections=cm.getSelections();
		selections.forEach(function(text){
			replacements.push(
				text.split('\n').map(function(line){
					if(line.startWith(prefix,true)){
						var startAt=line.indexOf(prefix);
						startChars=line.substr(0,startAt);
						endChars=line.substr(startAt+prefix.length);
						return startChars+endChars;
					}else{
						return prefix+line;
					}
				}).join('\n')
			);
		});
		cm.replaceSelections(replacements,'around');
	}
	return{
		//inline actions
		bold:function(cm){inlineAction(cm,'bold');},
		italic:function(cm){inlineAction(cm,'italic');},
		code:function(cm){inlineAction(cm,'code');},
		link:function(cm){inlineAction(cm,'link');},
		img:function(cm){inlineAction(cm,'img');},
		//row actions
		header:function(cm){rowAction(cm,'header');},
		quote:function(cm){rowAction(cm,'quote');},
		ul:function(cm){rowAction(cm,'ul');},
		ol:function(cm){
			var selections=cm.listSelections();
			selections.forEach(function(range){
				var num1=range.anchor.line,num2=range.head.line;
				var start=num1<num2?num1:num2,end=num1>num2?num1:num2;
				cm.addSelection({line:start,ch:0},{line:end});
			});
			var replacements=[];
			selections=cm.getSelections();
			selections.forEach(function(text){
				if(/^\s*\d+\.\s/m.test(text)){
					replacements.push(text.replace(/^\s*\d+\.\s/mg,''));
				}else{
					replacements.push(
						text.split('\n').map(function(line,i){ return (i+1)+'. '+line; }).join('\n')
					);
				}
			});
			cm.replaceSelections(replacements,'around');
		},
		undo:function(cm){cm.undo();},
		redo:function(cm){cm.redo();}
	}
}])
.provider('hljsServ',function(){
	var _options={};
	return {
		setOptions:function(options){
			angular.extend(_options,options);
		},
		getOptions:function(){
			return angular.copy(_options);
		},
		$get:function(){
			hljs.configure(_options);
			return hljs;
		}
	}
})
.filter('markdown',['$sce','hljsServ',function($sce,hljsServ){
	var marked=(function(marked){
		/*marked.setOptions({
		  renderer: new marked.Renderer(),
		  gfm: true,
		  tables: true,
		  breaks: false,
		  pedantic: false,
		  sanitize: true,
		  smartLists: true,
		  smartypants: false
		});*/
		marked.setOptions({
			highlight:function(code){
				return hljsServ.highlightAuto(code).value;
			}
		})
		return marked;
	})(window.marked);
	
	return function(input){
		if(!input||typeof input!=='string') return '';
		return $sce.trustAsHtml(marked(input));
	}
}])
.directive('mdeditor', ['mdeditorConfig','actions', function(mdeditorConfig,actions){
	return {
		restrict:'AE',
		scope:{
			text:'=',
			options:'=',
			classNames:'=',
			toolbar:'=',
			shortcut:'='
		},
		template:['<div class="{{classNames.wrapper}}">',
					'<ul class="{{classNames.toolbar}}">',
						'<li ng-repeat="item in toolbar | filter:toolbarFilter track by $index" ng-click="callAction(item.action)" class="{{item.separator?classNames.separator:classNames.toolbarItem}}" title="{{item.tip}}">',
							'<i class="{{item.icon}}" ng-if="!item.separator"></i>',
							'<span ng-if="item.separator">|</span>',
						'</li>',
					'</ul>',
					'<textarea class="{{classNames.textarea}}" ng-show="!preview"></textarea>',
					'<div class="{{classNames.preview}}" ng-bind-html="text | markdown" ng-if="preview"></div>',
				'</div>'].join(''),
		replace:true,
		compile:function(tElm,tAttrs){
			if(angular.isUndefined(window.CodeMirror)){throw(new Error('Require CodeMirror!'));}
			var theme=tAttrs.theme||'default';
			var textarea = tElm.find('textarea');
			var codemirror = new window.CodeMirror(function(cm_el){
				angular.forEach(textarea.prop('attributes'),function(attr){
					if(attr.name=='class')
						cm_el.className+=' '+attr.textContent;
					else
					cm_el.setAttribute(attr.name,attr.textContent);
				});
				textarea.replaceWith(cm_el);
			},{
				mode:'gfm',
				lineWrapping:true,
				theme:theme
			});

			return function postlink($scope, iElm, iAttrs){
				$scope.preview=false;
				$scope.classNames=$scope.classNames||mdeditorConfig.classNames;
				$scope.toolbar=$scope.toolbar||mdeditorConfig.toolbar;
				var options=$scope.options||{};
				for(var key in options){
					codemirror.setOption(key,options[key]);
				}
				var shortcut=$scope.shortcut||mdeditorConfig.shortcut;
				var keyMap={};
				for(var key in shortcut){
					if(typeof key=='string'&&actions[shortcut[key]])
						keyMap[key]=actions[shortcut[key]];
				}

				keyMap['Enter']="newlineAndIndentContinueMarkdownList";
				keyMap['Tab']='tabAndIndentContinueMarkdownList';
				keyMap['Shift-Tab']='shiftTabAndIndentContinueMarkdownList';

				codemirror.setOption("extraKeys",keyMap);

				$scope.callAction=function(actionName){
					if(!actionName)return;
					else if(actions[actionName])
						actions[actionName](codemirror);
					else if(actionName=='preview'){
						$scope.preview=!$scope.preview;
					}
					else if(actionName=='fullscreen'){
						var el=iElm[0];
						var rfs=el.requestFullScreen|| el.webkitRequestFullScreen|| el.mozRequestFullScreen;
						if(rfs) rfs.call(el);
					}
					codemirror.focus();
				}

				if($scope.text){
					codemirror.setValue($scope.text);
				}

				codemirror.on('change',function(instance){
					var val=instance.getValue();
					if($scope.text!==val){
						$scope.text=instance.getValue();
						var phase=$scope.$root.$$phase;
						if(phase!=='$apply'&&phase!=='digest'){
							$scope.$apply();
						}
					}
				});
			}
		}
	}
}]);