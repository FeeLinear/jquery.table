/**
 * Jquery.table plugin
 * Version 2.3.2 - 03 Jan 2018
 * Copyright (c) 2018 by Feelinear:
 * 1、新增双击表格添加数据方法
 * 
 *
 * self.jQueryTableContentBox  最外层BOX
 * self.jQueryTableLeftBox    左侧BOX
 * self.jQueryTableRightBox   右侧BOX
 * self.jQueryTNameBox    左上角表头
 * self.jQueryXHeadTableBox   上侧表格父BOX
 * self.jQueryYHeadTableBox   左侧表格父BOX
 * self.jQueryInnerTableBox   中间表格父BOX
 * self.jQueryContentPosBox   定位元素父BOX
 * self.jQueryInnerTableWidth    主表格宽度
 * self.xScrollTrue    x轴滚动条
 * self.yScrollTrue    y轴滚动条
 */
;(function($){
    function SetJQueryTable(jsDom, xData, yData, cData, options){
        this.jsDom = $(jsDom);
        this.xData = xData;
        this.yData = yData;
        this.cData = cData;
		this.idKey = options.keyGroup.idKey;
		this.xIdKey = options.keyGroup.xIdKey;
		this.yIdKey = options.keyGroup.yIdKey;
		this.tmpCData = JSON.parse(JSON.stringify(cData)); //缓存数据：目的是为了不改变原始数据
        this.options = $.extend(true, {}, this._default, options);
        this._init();
    }
    SetJQueryTable.prototype = {
        _default: {
			keyGroup: {
				idKey: "id",
				xIdKey: "xId", 
				yIdKey: "yId",
				txtKey: "txt",
				xTxtKey: "xTxt",
				yTxtKey: "yTxt"
			},
            tName: {
                xName: "",
                yName: ""
            },
            cssProperty: {
                tdHeight: 80,
                tdWidth: 200,
                tHeadHeight: 0,
                tHeadWidth: 0,
				tdRrightPadding: 20
            },
			canDrag: true,
			fixedXScroll: false, //到存在横向滚动条时，是否需要在屏幕上始终显示横向滚动条
			theme: {
				itemColor: ""  //item背景色
			}
        },
		
        _init: function(){
            this.addStylesheet();//初始化宽高
            this.renderContentBox();//渲染外层盒子
	
            this.renderLeftAndRightBox();//渲染左右侧盒子
	
            this.renderTNameTable();//渲染左上角表名

            this.renderXHeadTable();//渲染上方表头

            this.renderYHeadTable();//渲染左侧表头
	
			this.renderContentTable();//渲染内部表格
	
			this.jQueryScrollTableFun();//自定义滚条计算
	
			this.renderContentPosBox();//渲染数据定位所参考的盒子
	
			this.getArrByXIdKeyAndRel(this.tmpCData);//按xIdKey分类后再按交集圈分类结果
	
			this.orientationPosition(this.totalKindArr);//排列组合数据保存
		
			this.setContentPosBox();//设置宽度、高度、以及位置
	
			this.resizeWindowRefreshContentBox();//改变窗口大小调整显示位置
		
			this.options.canDrag ? this.dragContentBoxEvent() : "";//拖拽事件
		
			this.bindSelfEvent();//绑定自定义事件
	
			this.doubleClickTdEvent();//双击表格弹窗
			
        },
		//判断两数组是否有交集
		rel : function(arr1,arr2) {
			for(var i=0; i<arr1.length; i++){
				for(var j=0; j<arr2.length; j++){
					if(arr1[i]===arr2[j]){
						return true;
					}
				}
			}
			return false;
		},
		//数组去重复项
		unique :function (arr) {
			var newX = [];
			for(var i=0; i<arr.length; i++){
				var items = arr[i];
				if($.inArray(items,newX)==-1){
					newX.push(items);
				}
			}
			return newX;
		},
		//获得数组最大重复数量
		getMost: function(arrT) {
			var self = this;
			var newA = self.unique(arrT);
			var newNumA = [];
			newNumA.length = newA.length;
			for(var g=0; g<newNumA.length; g++){
				newNumA[g] = 0;
			}
			//console.log(newA);
			for(var k=0; k<newA.length; k++){
				for(var f=0; f<arrT.length; f++){
					if(newA[k]==arrT[f]){
						newNumA[k]++;
					}
				}
			}
			var maxNum = 0;
			for(var e=0; e<newNumA.length; e++){
				if(newNumA[e]>maxNum){
					maxNum = newNumA[e];
				}
			}
			return maxNum;
		},
        addStylesheet: function () {
            var self = this;
			self.options.cssProperty.tdHeight = parseInt(self.options.cssProperty.tdHeight);
			self.options.cssProperty.tdWidth = parseInt(self.options.cssProperty.tdWidth);
			self.options.cssProperty.tHeadHeight = parseInt(self.options.cssProperty.tHeadHeight);
			self.options.cssProperty.tHeadWidth = parseInt(self.options.cssProperty.tHeadWidth);
			self.options.cssProperty.tdRrightPadding = parseInt(self.options.cssProperty.tdRrightPadding);
			
            self.jsDom.css("box-sizing", "border-box");
			if(!self.options.cssProperty.tHeadHeight && !self.options.cssProperty.tdHeight){//未设置表头高度和TD高度
				self.options.cssProperty.tdHeight = self.options.cssProperty.tHeadHeight = 40;
			}else if(self.options.cssProperty.tHeadHeight && !self.options.cssProperty.tdHeight){//只设置了表头高度，则默认TD高度等于表头高度
				self.options.cssProperty.tdHeight = self.options.cssProperty.tHeadHeight
			}else if(!self.options.cssProperty.tHeadHeight && self.options.cssProperty.tdHeight){//只设置了TD高度，则默认表头高度等于TD高度
				self.options.cssProperty.tHeadHeight = self.options.cssProperty.tdHeight;
			}
			if(!self.options.cssProperty.tdWidth && !self.options.cssProperty.tHeadWidth){//左侧表头与TD宽度都未设置，则默认TD宽度等于左侧表头宽度
				self.options.cssProperty.tdWidth = self.options.cssProperty.tHeadWidth = Math.floor((self.jsDom.width()-16)/(self.xData.length+1));
			}else if(self.options.cssProperty.tdWidth && !self.options.cssProperty.tHeadWidth){//只设置了左侧表头宽度，则默认TD宽度等于左侧表头宽度
				self.options.cssProperty.tHeadWidth = self.options.cssProperty.tdWidth;
			}
			if(self.options.cssProperty.tdRrightPadding <= 2 || self.options.cssProperty.tdRrightPadding > self.options.cssProperty.tdWidth - 4){
				self.options.cssProperty.tdRrightPadding = 2;
			}
        },
        renderContentBox: function(){
            var self = this;
			self.jsDom.empty();
            self.jQueryTableContentBox = $("<div class=jquery_table_content_box>");
			
			if(self.jsDom.height() && self.jsDom.height() < self.options.cssProperty.tHeadHeight + self.options.cssProperty.tdHeight*self.yData.length)
				self.jQueryTableContentBox.css("padding-right", "16px");
			
			if(self.jsDom.width() && self.jsDom.width() < self.options.cssProperty.tHeadWidth + self.options.cssProperty.tdWidth*self.xData.length)
				self.jQueryTableContentBox.css("padding-bottom", "16px");
			
            self.jsDom.append(self.jQueryTableContentBox);
        },
        renderLeftAndRightBox: function () {
            var self = this;
            self.jQueryTableLeftBox = $("<div class=jquery_table_left_box>");
            self.jQueryTableLeftBox.css({"width": self.options.cssProperty.tHeadWidth, "padding-top": self.options.cssProperty.tHeadHeight});
            self.jQueryTableContentBox.append(self.jQueryTableLeftBox);
            self.jQueryTableRightBox = $("<div class=jquery_table_right_box>");
            self.jQueryTableRightBox.css({"margin-left": self.options.cssProperty.tHeadWidth,"padding-top": self.options.cssProperty.tHeadHeight});
            self.jQueryTableContentBox.append(self.jQueryTableRightBox);
        },
        renderTNameTable: function(){
            var self = this;
            var tHeadWidth = self.options.cssProperty.tHeadWidth;
            var tHeadHeight = self.options.cssProperty.tHeadHeight;
            self.jQueryTNameBox = $("<div class=jquery_t_name_box><span class=jquery_x_t_name></span><span class=jquery_y_t_name></span><canvas class=jquery_x_y_cross></canvas></div>");
            self.jQueryTNameBox.css({
                "width": tHeadWidth,
                "height": tHeadHeight,
				"line-height": tHeadHeight/2 + "px"
            });
            self.jQueryTNameBox.find(".jquery_x_t_name").text(self.options.tName.xName).attr("title", self.options.tName.xName);
            self.jQueryTNameBox.find(".jquery_y_t_name").text(self.options.tName.yName).attr("title", self.options.tName.yName);
            //self.jQueryTNameBox.find(".jquery_x_y_cross").css("transform", "rotate(" + Math.atan(tHeadHeight/tHeadWidth)*180/Math.PI +"deg)");
            //绘制斜线
            self.jQueryTNameBox.find(".jquery_x_y_cross").attr({
                width: tHeadWidth,
                height: tHeadHeight
            })
			self.jQueryTableLeftBox.append(self.jQueryTNameBox);
			if(navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.match(/8./i)=="8."){return;}
            var jqueryXyCross = self.jQueryTNameBox.find(".jquery_x_y_cross").get(0);
            var xyCrossCxt = jqueryXyCross.getContext("2d");
            xyCrossCxt.strokeStyle="#cccccc";
            xyCrossCxt.moveTo(0,0);
            xyCrossCxt.lineTo(tHeadWidth,tHeadHeight);
            xyCrossCxt.stroke();
            //绘制斜线结束
            
        },
        renderXHeadTable: function () {
            var self = this;
            if(!self.xData)
                return false;
            self.jQueryXHeadTableBox = $("<div class=jquery_x_head_table_box><table class=jquery_x_head_table><tr></tr></table></div>");
            $.each(self.xData, function (index, data) {
				if(data){
					var tdDom = $("<td class=x_head_table_td><div class=x_head_td_div></div></td>");
					tdDom.data("domData", data).attr({"x_id": data[self.xIdKey], "x": index}).find(".x_head_td_div").text(data[self.options.keyGroup.xTxtKey]).attr("title", data[self.options.keyGroup.xTxtKey]);
					tdDom.css("min-width", self.options.cssProperty.tdWidth);
					self.jQueryXHeadTableBox.find("tr").append(tdDom);
				}
                
            });
            self.jQueryXHeadTableBox.find("table").css({
				"height": self.options.cssProperty.tHeadHeight,
				"line-height": self.options.cssProperty.tHeadHeight-6+"px"
			});
            self.jQueryTableRightBox.append(self.jQueryXHeadTableBox);
        },
        renderYHeadTable: function(){
            var self = this;
            if(!self.yData)
                return false;
            self.jQueryYHeadTableBox = $("<div class=jquery_y_head_table_box><table class=jquery_y_head_table></table></div>");
            $.each(self.yData, function (index, data) {
                var trDom = $("<tr><td class=y_head_table_td><div class=y_head_td_div></div></td></tr>");
                trDom.find("td").data("domData", data).attr({"y_id": data[self.yIdKey], "y": index}).find(".y_head_td_div").text(data[self.options.keyGroup.yTxtKey]).attr("title", data[self.options.keyGroup.yTxtKey]);
                trDom.find("td").css({
					"height": self.options.cssProperty.tdHeight,
					"line-height": self.options.cssProperty.tdHeight-6+"px"
				});
                self.jQueryYHeadTableBox.find("table").append(trDom);
            });
            self.jQueryTableLeftBox.append(self.jQueryYHeadTableBox);
        },
		renderContentTable: function(){
			var self = this;
			self.jQueryInnerTableBox = $("<div class=jquery_content_inner_box><table class=jquery_content_inner_table></table></div>");
			var rows = self.yData.length;
			var cols = self.xData.length;
			while(rows--){
				var tempTr = $("<tr></tr>", {"height":self.options.cssProperty.tdHeight});
				var tempTd = "";
				var tempCols = cols;
				while(tempCols--){
					if(!rows)
						tempTd += "<td style=min-width:" + self.options.cssProperty.tdWidth + "px></td>";
					else
						tempTd += "<td></td>";
				}
				tempTr.append(tempTd);
				self.jQueryInnerTableBox.find("table").append(tempTr);
			}
			self.jQueryTableRightBox.append(self.jQueryInnerTableBox);
		},
		jQueryScrollTableFun: function(){
			var self = this;
			var jQueryInnerTable = self.jQueryInnerTable = self.jQueryInnerTableBox.find("table");
			
			var createXScrollTrue = $("<div class=x_scroll_table_box_wrap><div class=x_scroll_table_box_true><div class=x_scroll_table_true></div></div></div>");
			var createYScrollTrue = $("<div class=y_scroll_table_box_wrap><div class=y_scroll_table_box_true><div class=y_scroll_table_true></div></div></div>");
			
			self.jQueryTableContentBox.append(createXScrollTrue);
			self.jQueryTableContentBox.append(createYScrollTrue);
			self.xScrollTrue = createXScrollTrue.find(".x_scroll_table_box_true");
			self.yScrollTrue = createYScrollTrue.find(".y_scroll_table_box_true");
			createXScrollTrue.css({
				//"padding-left": self.options.cssProperty.tHeadWidth,  //滚动条样式优化
				//"padding-right": self.jQueryTableContentBox.css("padding-right"),
				"top": Math.min(self.jQueryInnerTableBox.outerHeight(), self.jQueryInnerTable.outerHeight()) + self.options.cssProperty.tHeadHeight
			});
			/*
			createYScrollTrue.css({
				"padding-top": self.options.cssProperty.tHeadHeight,
				"padding-bottom": self.jQueryTableContentBox.css("padding-bottom")
			});
			*/
			self.xScrollTrue.on("scroll", function (e) {
				self.jQueryInnerTableBox.scrollLeft($(this).scrollLeft());
				self.jQueryXHeadTableBox.scrollLeft($(this).scrollLeft());
			});
			self.yScrollTrue.on("scroll", function (e) {
				self.jQueryInnerTableBox.scrollTop($(this).scrollTop());
				self.jQueryYHeadTableBox.scrollTop($(this).scrollTop());
			});
			function judgeXScrollPosition(){
				
				if(self.jQueryInnerTableBox.offset().top + self.jQueryInnerTableBox.height() - $(window).scrollTop() > $(window).height() - 16){
					createXScrollTrue.css({
						"top": "inherit",
						"position": "fixed",
						"bottom": 0
					});
				}else{
					createXScrollTrue.css({
						"top": Math.min(self.jQueryInnerTableBox.outerHeight(), self.jQueryInnerTable.outerHeight()) + self.options.cssProperty.tHeadHeight,
						"position": "absolute",
						"bottom": "inherit"
					});
				}
				createXScrollTrue.find(".x_scroll_table_true").animate({
					"width": self.xScrollTrue.width() + jQueryInnerTable.width() - self.jQueryInnerTableBox.width()
				});
			}
			function refreshScroll(){
				if(jQueryInnerTable.outerWidth()-1 > self.jQueryInnerTableBox.width()){//表格宽度已超出
					self.jQueryTableContentBox.css("padding-bottom", "16px");
					createYScrollTrue.css("padding-bottom", "16px");
					createXScrollTrue.css({
						"display": "block",
						"top": Math.min(self.jQueryInnerTableBox.outerHeight(), self.jQueryInnerTable.outerHeight()) + self.options.cssProperty.tHeadHeight
					});
					createXScrollTrue.find(".x_scroll_table_true").animate({
						"width": self.xScrollTrue.width() + jQueryInnerTable.width() - self.jQueryInnerTableBox.width()
					});
					if(self.options.fixedXScroll){
						judgeXScrollPosition();
					}
				}else{
					createXScrollTrue.hide();
					self.jQueryTableContentBox.css("padding-bottom", "0");
					createYScrollTrue.css("padding-bottom", "0");
				}
				if(jQueryInnerTable.outerHeight()-1 > self.jQueryInnerTableBox.height()){//表格高度已超出
					self.jQueryTableContentBox.css("padding-right", "16px");
					createXScrollTrue.css("padding-right", "16px");
					createYScrollTrue.css("display", "block");
					createYScrollTrue.find(".y_scroll_table_true").animate({
						"height": self.yScrollTrue.height() + jQueryInnerTable.height() - self.jQueryInnerTableBox.height()
					});
					self.jQueryTableContentBox.find(".jquery_y_head_table_box, .jquery_content_inner_box").off('wheel mousewheel DOMMouseScroll').on('wheel mousewheel DOMMouseScroll', function (e) {
						self.mousewheelEvent = true;
						var e = e.originalEvent;
						var delta = 1;
						e.preventDefault();
						if (e.deltaY) {
							delta = e.deltaY > 0 ? 1 : -1;
						} else if (e.wheelDelta) {
							delta = -e.wheelDelta / 120;
						} else if (e.detail) {
							delta = e.detail > 0 ? 1 : -1;
						}
						self.yScrollTrue.stop(true).animate({
							"scrollTop": self.yScrollTrue.scrollTop() + delta*self.options.cssProperty.tdHeight
						},30, function(){
							self.mousewheelEvent = false;
						});
					});
				}else{
					createYScrollTrue.hide();
					self.jQueryTableContentBox.css("padding-right", "0");
					createXScrollTrue.css("padding-right", "0");
				}
			}
			
			refreshScroll();
			var timer = null;
			$(window).on("resize", function(){
				clearTimeout(timer);
				timer = setTimeout(function(){
					refreshScroll();
				}, 100);
			});
			if(self.options.fixedXScroll){
				$(window).on("scroll", function(){
					clearTimeout(timer);
					timer = setTimeout(function(){
						judgeXScrollPosition();
					}, 300)
				})
			}
		},
		renderContentPosBox: function(){
			var self = this;
			self.jQueryContentPosBox = $("<div class=jquery_content_pos_box></div>");
			self.jQueryInnerTableBox.append(self.jQueryContentPosBox);
		},
		getArrByXIdKeyAndRel: function(tmpCData){
			var self = this;
			//1、获取数据所有列信息
			var cols = [];
			var cData = tmpCData
			//过滤无法展示在表格的数据
			var allXIdArr = [];
			var allYIdArr = [];
			var needDelIndexArr = [];//标记需要删除的索引
			for(var u=0; u < self.xData.length; u++){
				allXIdArr.push(self.xData[u][self.xIdKey]);
			}
			for(var v=0; v < self.yData.length; v++){
				allYIdArr.push(self.yData[v][self.yIdKey]);
			}
			outerFor: for(var s=0; s<cData.length; s++){
				if(allXIdArr.indexOf(cData[s][self.xIdKey]) == -1){
					needDelIndexArr.push(s);
					continue outerFor;
				}
				for(var w=0; w<cData[s][self.yIdKey].length; w++){
					if(allYIdArr.indexOf(cData[s][self.yIdKey][w]) == -1){
						needDelIndexArr.push(s);
						continue outerFor;
					}
				}
			}
			var delArrLength = needDelIndexArr.length;
			//移除需要删除对应的索引
			while(delArrLength--){
				cData.splice(needDelIndexArr[delArrLength], 1);
			}
			
			$.each(cData, function(index, data){
				cols.push(data[self.xIdKey]);
			})
		
			cols = self.unique(cols);//去重
			//按xIdKey分类：
			var kindArr = [];
			for(var i=0; i<cols.length; i++){
				var itemArr = [];
				for(var j=0; j<cData.length; j++){
					if(cols[i] === cData[j][self.xIdKey]){
						itemArr.push(cData[j]);
					}
				}
				kindArr.push(itemArr);
			}
			//console.log(kindArr);//[[{xIdKey:"a",yIdKey:["y1","y2"]},{xIdKey:"a",yIdKey:["y1","y2","y3"]}],[{xIdKey:"b",yIdKey:["y1","y2"]},{xIdKey:"b",yIdKey:["y1","y2","y3"]}]]
			//按xIdKey分类后再按交集圈分类
			self.totalKindArr = [];
			for(var k=0; k<kindArr.length; k++){
				var unKindTmpArr = JSON.parse(JSON.stringify(kindArr[k]));//[{xIdKey:"a",yIdKey:["y1","y2"]},{xIdKey:"a",yIdKey:["y1","y2","y3"]}]
				var kindTmpArr = [[]];
				function flagFor(){
					for(var m=0; m<unKindTmpArr.length; m++){
						var hasKind = false;
						for(var n=0; n<kindTmpArr.length; n++){
							if(kindTmpArr[n].length==0){
								hasKind = true;
								kindTmpArr[n].push(unKindTmpArr[m]);
								unKindTmpArr.splice(m, 1);
								flagFor();
								return;
							}else{
								for(var o=0; o<kindTmpArr[n].length; o++){
									if(self.rel(unKindTmpArr[m][self.yIdKey], kindTmpArr[n][o][self.yIdKey])){
										hasKind = true;
										kindTmpArr[n].push(unKindTmpArr[m]);
										unKindTmpArr.splice(m, 1);
										flagFor();
										return;
									}
								}
							}
						}
						if(!hasKind && m == unKindTmpArr.length-1){
							var newInnerArr = [];
							kindTmpArr.push(newInnerArr);
							flagFor();
							return;
						}
					}
				}
				
				flagFor();
				self.totalKindArr.push(kindTmpArr);
			}
			//console.log(self.totalKindArr);//按xIdKey分类后再按交集圈分类结果[[[{}],[{}]],[[{}],[{}]]]
		},
		//自适应排列组合
		orientationPosition: function(totalKindArr){
			var self = this;
			//保存属性参数
			var propertyData = [];
			//propertyData.length = totalKindArr.length;
			self.jQueryContentPosBox.empty();
			for(var i=0; i<totalKindArr.length; i++){
				propertyData[i] = [];
				for(var j=0; j<totalKindArr[i].length; j++){
					propertyData[i][j] = {};
					var yIdArr = [];
					for(var m=0; m<totalKindArr[i][j].length; m++){
						var jQueryContentPosItems = $("<div class=jquery_content_pos_item><div class=jquery_content_pos_item_name></div></div>");
						jQueryContentPosItems.data("domData", totalKindArr[i][j][m]).data("i", i).data("j", j).attr("data-value", totalKindArr[i][j][m][self.idKey]);
						jQueryContentPosItems.find(".jquery_content_pos_item_name").text(totalKindArr[i][j][m][self.options.keyGroup.txtKey]);
						self.jQueryContentPosBox.append(jQueryContentPosItems);
						yIdArr = yIdArr.concat(totalKindArr[i][j][m][self.yIdKey]);
					}
					if(self.options.theme.itemColor){
						$(".jquery_content_pos_item").css("background-color", self.options.theme.itemColor);
					}
					propertyData[i][j].mostNum = self.getMost(yIdArr);
					//console.log(self.getMost(yIdArr))
					uniqueYIdArr = self.unique(yIdArr);
					propertyData[i][j].Matrix = {};
					for(var n=0; n<uniqueYIdArr.length; n++){
						var mostNum = propertyData[i][j].mostNum;
						propertyData[i][j].Matrix[uniqueYIdArr[n]] = [];
						while(mostNum--){
							propertyData[i][j].Matrix[uniqueYIdArr[n]][mostNum] = 0;
						}
					}
				}
			}
			/*propertyData[i][j].Matrix:交集圈矩阵标记
			**{
			**	y1:[0,0,0,0,0],
			**	y2:[0,0,0,0,0],
			**	y3:[0,0,0,0,0],
			**	y4:[0,0,0,0,0]
			**}
			*/
			//console.log(propertyData);
			self.jQueryContentPosBox.find(".jquery_content_pos_item").each(function(index){
				var index1 = $(this).data("i");
				var index2 = $(this).data("j");
				var domData = $(this).data("domData");
				outerLoop: for(var r=0; r<propertyData[index1][index2].mostNum; r++){
					var itemYLength = domData[self.yIdKey].length;
					while(itemYLength--){
						if(propertyData[index1][index2].Matrix[domData[self.yIdKey][itemYLength]][r] === 1){
							continue outerLoop;
						}
					}
					itemYLength = domData[self.yIdKey].length;
					while(itemYLength--){
						propertyData[index1][index2].Matrix[domData[self.yIdKey][itemYLength]][r] = 1;
					}
					$(this).data("Xn", r);
					break;
				}
			});
			self.propertyData = propertyData;
			//console.log(propertyData);//[[{mostNum:4,Matrix:{y1:[],y2:[]},{}],[{},{}]]
			
		},
		//设置宽度、高度、以及位置
		setContentPosBox: function(){
			var self = this;
			var tdWidth = self.jQueryInnerTableBox.find("td").eq(0).outerWidth();
			var tdHeight = self.jQueryInnerTableBox.find("td").eq(0).outerHeight();
			self.jQueryContentPosBox.find(".jquery_content_pos_item").each(function(index){
				var index1 = $(this).data("i");
				var index2 = $(this).data("j");
				var mostNum = self.propertyData[index1][index2].mostNum;
				var domData = $(this).data("domData");
				var x = parseInt(self.jQueryXHeadTableBox.find("td.x_head_table_td[x_id=" + domData[self.xIdKey] + "]").attr("x"));
				var y = parseInt(self.jQueryYHeadTableBox.find("td.y_head_table_td[y_id=" + domData[self.yIdKey][0] + "]").attr("y"));
				var Xn = $(this).data("Xn");
				var domWidth = (tdWidth - self.options.cssProperty.tdRrightPadding) / mostNum;
				var domHeight = domData[self.yIdKey].length * tdHeight;
				var domTop = self.jQueryInnerTableBox.find("tr").eq(y).offset().top - self.jQueryInnerTableBox.find("table").offset().top;
				var domLeft = self.jQueryInnerTableBox.find("tr").eq(0).find("td").eq(x).offset().left - self.jQueryInnerTableBox.find("table").offset().left + Xn * domWidth;
				$(this).css({
					"height": domHeight - 4,
					"top": domTop + 2,
					"left": domLeft + 2,
					"width": domWidth - 2
				}).attr({
					"x": x,
					"y": y
				});
			});
		},
		resizeWindowRefreshContentBox: function(){
			var self = this;
			if(self.jsDom.data("notFirstTime"))
				return;
			self.jQueryInnerTableWidth = self.jQueryInnerTable.outerWidth(); //记录表格宽度
			self.resizeTimer = null;
			$(window).on("resize", function(){
				clearTimeout(self.resizeTimer);
				self.resizeTimer = setTimeout(function(){
					if(self.jQueryInnerTable.outerWidth() != self.jQueryInnerTableWidth){
						self.setContentPosBox();//重新设置宽度、高度、以及位置
						self.jQueryInnerTableWidth = self.jQueryInnerTable.outerWidth();
					}
				}, 50);
			})
		},
		dragContentBoxEvent: function(){
			var self = this;
			var judgeDevice = /Android|webOS|iPhone|iPad|BlackBerry/i.test(navigator.userAgent);
			if(judgeDevice){
				self.dragContentBoxEventMoblie();
				return;
			}
			var isMove = false;
			var dragDom = $("<div class=jquery_table_drag_box><i class=drag_pull_up></i><b class=drag_pull_move></b><i class=drag_pull_down></i></div>");
			self.jQueryContentPosBox.find(".jquery_content_pos_item").append(dragDom);
			//拖动事件
			self.jQueryContentPosBox.find(".jquery_content_pos_item .drag_pull_move").on("mousedown", function(e){
				var posItem = $(this).parents(".jquery_content_pos_item");
				var dataId = posItem.data("domData")[self.idKey];
				var yLength = posItem.data("domData")[self.yIdKey].length;
				var tdWidth = self.jQueryInnerTableBox.find("td").eq(0).outerWidth();
				var tdHeight = self.jQueryInnerTableBox.find("td").eq(0).outerHeight();
				var tableWidth = self.jQueryInnerTableBox.find("table").outerWidth();
				var tableHeight = self.jQueryInnerTableBox.find("table").outerHeight();
				var xGap, yGap, newCols, newRows;
				if(posItem.hasClass("disabled_drag"))
					return;
				posItem.css({
					"width": tdWidth - 4,
					"left": parseInt(posItem.attr("x")) * tdWidth + 2,
					"opacity": 0.5,
					"z-index": 1
				})/*,100, function(){
					xGap = e.clientX - posItem.offset().left ;
					yGap = e.clientY - posItem.offset().top ;
				})*/
				xGap = e.clientX - posItem.offset().left ;
				yGap = e.clientY - posItem.offset().top ;
				//var timer = null;
				$(document).on("mousemove",function (e) {
					isMove = true;
					e.preventDefault();
					//clearTimeout(timer);
					//timer = setTimeout(function(){
						var aimX = e.clientX /*- xGap*/ - self.jQueryContentPosBox.offset().left + $(window).scrollLeft();
						var aimY = e.clientY /*- yGap*/ - self.jQueryContentPosBox.offset().top + $(window).scrollTop();
						aimX < 0 ? aimX = 0 : "";
						aimY < 0 ? aimY = 0 : "";
						aimX > tableWidth - tdWidth ? aimX = tableWidth - tdWidth : "";
						aimY > tableHeight - tdHeight*yLength ? aimY = tableHeight - tdHeight*yLength : "";
						newCols =  Math.floor(aimX/tdWidth);
						newRows = Math.floor(aimY/tdHeight);
						aimX = self.jQueryXHeadTableBox.find("td.x_head_table_td").eq(newCols).offset().left - self.jQueryXHeadTableBox.find("table").offset().left + 2
						aimY = self.jQueryYHeadTableBox.find("td.y_head_table_td").eq(newRows).offset().top - self.jQueryYHeadTableBox.find("table").offset().top + 2
						posItem.css({
							"left": aimX,
							"top": aimY
						})
						if(posItem.offset().left < self.jQueryInnerTableBox.offset().left){
							self.xScrollTrue.stop(true).animate({
								"scrollLeft": self.xScrollTrue.scrollLeft()- tdWidth
							},30);
						}else if(posItem.offset().left + tdWidth > self.jQueryInnerTableBox.offset().left + self.jQueryInnerTableBox.outerWidth()){
							self.xScrollTrue.stop(true).animate({
								"scrollLeft": self.xScrollTrue.scrollLeft()+ tdWidth
							},30);
						}
						self.scrollUpOrDown(e, tdHeight);
					//},30)
					
				});
				$(document).on("mouseup",function () {
                    $(document).off("mousemove");
                    $(document).off("mouseup");
					if(!isMove){
						self.refreshTableContent();//重新排列组合
						return;
					}
					isMove = false;
                    for(var i=0; i<self.tmpCData.length; i++){
						if(self.tmpCData[i][self.idKey] === dataId){
							self.tmpCData[i][self.xIdKey] = self.jQueryXHeadTableBox.find("td.x_head_table_td").eq(newCols).attr("x_id");
							self.tmpCData[i][self.yIdKey] = [];
							for(var j=0; j<yLength; j++){
								self.tmpCData[i][self.yIdKey].push(self.jQueryYHeadTableBox.find("td.y_head_table_td").eq(newRows + j).attr("y_id"))
							}
							break;
						}
					}
					self.refreshTableContent();//刷新数据重新排列组合
                });
			});
			//下拉事件
			self.jQueryContentPosBox.find(".jquery_content_pos_item .drag_pull_down").on("mousedown", function(e){
				var oY = e.clientY - self.jQueryInnerTableBox.find("table").offset().top;
				var posItem = $(this).parents(".jquery_content_pos_item");
				var dataId = posItem.data("domData")[self.idKey];
				var oStartRow = parseInt(posItem.attr("y"));
				var totalTableRow = self.yData.length;
				var yLength = posItem.data("domData")[self.yIdKey].length;
				var tdHeight = self.jQueryInnerTableBox.find("td").eq(0).outerHeight();
				var oHeight = yLength*tdHeight;
				var aimHeight = 0;
				var addRows = 0;
				var aimY = 0;
				posItem.css({
					"opacity": 0.5,
					"z-index": 1
				})
				//self.jQueryInnerTableBox
				$(document).on("mousemove", function (e) {
					e.preventDefault();
					isMove = true;
					aimY = e.clientY - self.jQueryInnerTableBox.find("table").offset().top;
					addRows = Math.round((aimY - oY)/tdHeight);
					addRows < 1 - yLength ? addRows = 1 - yLength : "";
					addRows > totalTableRow - oStartRow - yLength  ? addRows = totalTableRow - oStartRow - yLength : "";
					aimHeight = oHeight + addRows * tdHeight;
					posItem.css("height", aimHeight - 4);
					self.scrollUpOrDown(e, tdHeight);
				});
				$(document).on("mouseup",function () {
                    $(document).off("mousemove");
                    $(document).off("mouseup");
					if(!isMove){
						self.refreshTableContent();//重新排列组合
						return;
					}
					isMove = false;
                    for(var i=0; i<self.tmpCData.length; i++){
						if(self.tmpCData[i][self.idKey] === dataId){
							if(addRows < 0){
								while(addRows++){
									self.tmpCData[i][self.yIdKey].pop();
								}
							}else if(addRows > 0){
								for(var j=0; j<addRows; j++){
									self.tmpCData[i][self.yIdKey].push(self.jQueryYHeadTableBox.find("td.y_head_table_td").eq(oStartRow + yLength + j).attr("y_id"));
								}
							}
							break;
						}
					}
					self.refreshTableContent();//刷新数据重新排列组合
                });
			});
			//上拉事件
			self.jQueryContentPosBox.find(".jquery_content_pos_item .drag_pull_up").on("mousedown", function(e){
				var oY = e.clientY - self.jQueryInnerTableBox.find("table").offset().top;
				var posItem = $(this).parents(".jquery_content_pos_item");
				var dataId = posItem.data("domData")[self.idKey];
				var oStartRow = parseInt(posItem.attr("y"));
				var yLength = posItem.data("domData")[self.yIdKey].length;
				var tdHeight = self.jQueryInnerTableBox.find("td").eq(0).outerHeight();
				var oHeight = yLength*tdHeight;
				var oTop = parseInt(posItem.css("top"));
				var aimHeight = 0;
				var addRows = 0;
				var aimY = 0;
				posItem.css({
					"opacity": 0.5,
					"z-index": 1
				})
				$(document).on("mousemove", function (e) {
					e.preventDefault();
					isMove = true;
					aimY = e.clientY - self.jQueryInnerTableBox.find("table").offset().top;
					addRows = Math.round((oY - aimY)/tdHeight);
					addRows < 1 - yLength ? addRows = 1 - yLength : "";
					addRows > oStartRow ? addRows =  oStartRow : "";
					aimTop = oTop - addRows * tdHeight;
					aimHeight = oHeight + addRows * tdHeight;
					posItem.css({
						"height": aimHeight - 4,
						"top":  aimTop
					});
					self.scrollUpOrDown(e, tdHeight);
				});
				$(document).on("mouseup",function () {
                    $(document).off("mousemove");
                    $(document).off("mouseup");
					if(!isMove){
						self.refreshTableContent();//重新排列组合
						return;
					}
					isMove = false;
                    for(var i=0; i<self.tmpCData.length; i++){
						if(self.tmpCData[i][self.idKey] === dataId){
							if(addRows < 0){
								while(addRows++){
									self.tmpCData[i][self.yIdKey].shift();
								}
							}else if(addRows > 0){
								for(var j=0; j<addRows; j++){
									self.tmpCData[i][self.yIdKey].unshift(self.jQueryYHeadTableBox.find("td.y_head_table_td").eq(oStartRow - j - 1).attr("y_id"));
								}
							}
							break;
						}
					}
					self.refreshTableContent();//刷新数据重新排列组合
                });
			});
			
		},
	    
		dragContentBoxEventMoblie: function(){
			document.body.ontouchmove = function(e){
				e.preventDefault();//微信浏览禁用下拉显示来源
			}
			var self = this;
			var isMove = false;
			var dragDom = $("<div class=jquery_table_drag_box><i class=drag_pull_up></i><b class=drag_pull_move></b><i class=drag_pull_down></i></div>");
			self.jQueryContentPosBox.find(".jquery_content_pos_item").append(dragDom);
			//拖动事件
			self.jQueryContentPosBox.find(".jquery_content_pos_item .drag_pull_move").on("touchstart", function(e){
				var touch = e.touches[0];
				var mX = Number(touch.pageX);
				var mY = Number(touch.pageY);
				var posItem = $(this).parents(".jquery_content_pos_item");
				var dataId = posItem.data("domData")[self.idKey];
				var yLength = posItem.data("domData")[self.yIdKey].length;
				var tdWidth = self.jQueryInnerTableBox.find("td").eq(0).outerWidth();
				var tdHeight = self.jQueryInnerTableBox.find("td").eq(0).outerHeight();
				var tableWidth = self.jQueryInnerTableBox.find("table").outerWidth();
				var tableHeight = self.jQueryInnerTableBox.find("table").outerHeight();
				var xGap, yGap, newCols, newRows;
				if(posItem.hasClass("disabled_drag"))
					return;
				posItem.css({
					"width": tdWidth - 4,
					"left": parseInt(posItem.attr("x")) * tdWidth + 2,
					"opacity": 0.5,
					"z-index": 1
				})/*,100, function(){
					xGap = e.clientX - posItem.offset().left ;
					yGap = e.clientY - posItem.offset().top ;
				})*/
				xGap = mX - posItem.offset().left ;
				yGap = mY - posItem.offset().top ;
				//var timer = null;
				$(document).on("touchmove",function (e) {
					var touch = e.touches[0];
					var mX = Number(touch.pageX);
					var mY = Number(touch.pageY);
					isMove = true;
					e.preventDefault();
					//clearTimeout(timer);
					//timer = setTimeout(function(){
						var aimX = mX /*- xGap*/ - self.jQueryContentPosBox.offset().left + $(window).scrollLeft();
						var aimY = mY /*- yGap*/ - self.jQueryContentPosBox.offset().top + $(window).scrollTop();
						aimX < 0 ? aimX = 0 : "";
						aimY < 0 ? aimY = 0 : "";
						aimX > tableWidth - tdWidth ? aimX = tableWidth - tdWidth : "";
						aimY > tableHeight - tdHeight*yLength ? aimY = tableHeight - tdHeight*yLength : "";
						newCols =  Math.floor(aimX/tdWidth);
						newRows = Math.floor(aimY/tdHeight);
						aimX = self.jQueryXHeadTableBox.find("td.x_head_table_td").eq(newCols).offset().left - self.jQueryXHeadTableBox.find("table").offset().left + 2
						aimY = self.jQueryYHeadTableBox.find("td.y_head_table_td").eq(newRows).offset().top - self.jQueryYHeadTableBox.find("table").offset().top + 2
						posItem.css({
							"left": aimX,
							"top": aimY
						})
						if(posItem.offset().left < self.jQueryInnerTableBox.offset().left){
							self.xScrollTrue.stop(true).animate({
								"scrollLeft": self.xScrollTrue.scrollLeft()- tdWidth
							},30);
						}else if(posItem.offset().left + tdWidth > self.jQueryInnerTableBox.offset().left + self.jQueryInnerTableBox.outerWidth()){
							self.xScrollTrue.stop(true).animate({
								"scrollLeft": self.xScrollTrue.scrollLeft()+ tdWidth
							},30);
						}
						self.scrollUpOrDown(e, tdHeight);
					//},30)
					
				});
				$(document).on("touchend",function () {
                    $(document).off("touchmove");
                    $(document).off("touchend");
					if(!isMove){
						self.refreshTableContent();//重新排列组合
						return;
					}
					isMove = false;
                    for(var i=0; i<self.tmpCData.length; i++){
						if(self.tmpCData[i][self.idKey] === dataId){
							self.tmpCData[i][self.xIdKey] = self.jQueryXHeadTableBox.find("td.x_head_table_td").eq(newCols).attr("x_id");
							self.tmpCData[i][self.yIdKey] = [];
							for(var j=0; j<yLength; j++){
								self.tmpCData[i][self.yIdKey].push(self.jQueryYHeadTableBox.find("td.y_head_table_td").eq(newRows + j).attr("y_id"))
							}
							break;
						}
					}
					self.refreshTableContent();//刷新数据重新排列组合
                });
			});
			//下拉事件
			self.jQueryContentPosBox.find(".jquery_content_pos_item .drag_pull_down").on("touchstart", function(e){
				var touch = e.touches[0];
				var mX = Number(touch.pageX);
				var mY = Number(touch.pageY);
				var oY = mY - self.jQueryInnerTableBox.find("table").offset().top;
				var posItem = $(this).parents(".jquery_content_pos_item");
				var dataId = posItem.data("domData")[self.idKey];
				var oStartRow = parseInt(posItem.attr("y"));
				var totalTableRow = self.yData.length;
				var yLength = posItem.data("domData")[self.yIdKey].length;
				var tdHeight = self.jQueryInnerTableBox.find("td").eq(0).outerHeight();
				var oHeight = yLength*tdHeight;
				var aimHeight = 0;
				var addRows = 0;
				var aimY = 0;
				posItem.css({
					"opacity": 0.5,
					"z-index": 1
				})
				//self.jQueryInnerTableBox
				$(document).on("touchmove", function (e) {
					var touch = e.touches[0];
					var mX = Number(touch.pageX);
					var mY = Number(touch.pageY);
					e.preventDefault();
					isMove = true;
					aimY = mY - self.jQueryInnerTableBox.find("table").offset().top;
					addRows = Math.round((aimY - oY)/tdHeight);
					addRows < 1 - yLength ? addRows = 1 - yLength : "";
					addRows > totalTableRow - oStartRow - yLength  ? addRows = totalTableRow - oStartRow - yLength : "";
					aimHeight = oHeight + addRows * tdHeight;
					posItem.css("height", aimHeight - 4);
					self.scrollUpOrDown(e, tdHeight);
				});
				$(document).on("touchend",function () {
                    $(document).off("touchmove");
                    $(document).off("touchend");
					if(!isMove){
						self.refreshTableContent();//重新排列组合
						return;
					}
					isMove = false;
                    for(var i=0; i<self.tmpCData.length; i++){
						if(self.tmpCData[i][self.idKey] === dataId){
							if(addRows < 0){
								while(addRows++){
									self.tmpCData[i][self.yIdKey].pop();
								}
							}else if(addRows > 0){
								for(var j=0; j<addRows; j++){
									self.tmpCData[i][self.yIdKey].push(self.jQueryYHeadTableBox.find("td.y_head_table_td").eq(oStartRow + yLength + j).attr("y_id"));
								}
							}
							break;
						}
					}
					self.refreshTableContent();//刷新数据重新排列组合
                });
			});
			//上拉事件
			self.jQueryContentPosBox.find(".jquery_content_pos_item .drag_pull_up").on("touchstart", function(e){
				var touch = e.touches[0];
				var mX = Number(touch.pageX);
				var mY = Number(touch.pageY);
				var oY = mY - self.jQueryInnerTableBox.find("table").offset().top;
				var posItem = $(this).parents(".jquery_content_pos_item");
				var dataId = posItem.data("domData")[self.idKey];
				var oStartRow = parseInt(posItem.attr("y"));
				var yLength = posItem.data("domData")[self.yIdKey].length;
				var tdHeight = self.jQueryInnerTableBox.find("td").eq(0).outerHeight();
				var oHeight = yLength*tdHeight;
				var oTop = parseInt(posItem.css("top"));
				var aimHeight = 0;
				var addRows = 0;
				var aimY = 0;
				posItem.css({
					"opacity": 0.5,
					"z-index": 1
				})
				$(document).on("touchmove", function (e) {
					var touch = e.touches[0];
					var mX = Number(touch.pageX);
					var mY = Number(touch.pageY);
					e.preventDefault();
					isMove = true;
					aimY = mY - self.jQueryInnerTableBox.find("table").offset().top;
					addRows = Math.round((oY - aimY)/tdHeight);
					addRows < 1 - yLength ? addRows = 1 - yLength : "";
					addRows > oStartRow ? addRows =  oStartRow : "";
					aimTop = oTop - addRows * tdHeight;
					aimHeight = oHeight + addRows * tdHeight;
					posItem.css({
						"height": aimHeight - 4,
						"top":  aimTop
					});
					self.scrollUpOrDown(e, tdHeight);
				});
				$(document).on("touchend",function () {
                    $(document).off("touchmove");
                    $(document).off("touchend");
					if(!isMove){
						self.refreshTableContent();//重新排列组合
						return;
					}
					isMove = false;
                    for(var i=0; i<self.tmpCData.length; i++){
						if(self.tmpCData[i][self.idKey] === dataId){
							if(addRows < 0){
								while(addRows++){
									self.tmpCData[i][self.yIdKey].shift();
								}
							}else if(addRows > 0){
								for(var j=0; j<addRows; j++){
									self.tmpCData[i][self.yIdKey].unshift(self.jQueryYHeadTableBox.find("td.y_head_table_td").eq(oStartRow - j - 1).attr("y_id"));
								}
							}
							break;
						}
					}
					self.refreshTableContent();//刷新数据重新排列组合
                });
			});
			
		},
		refreshTableContent: function(){
			this.getArrByXIdKeyAndRel(this.tmpCData);//按xIdKey分类后再按交集圈分类结果
			this.orientationPosition(this.totalKindArr);//排列组合数据保存
			this.setContentPosBox();//设置宽度、高度、以及位置
			this.options.canDrag ? this.dragContentBoxEvent() : "";//拖拽事件
		},
		scrollUpOrDown: function (e, tdHeight){
			var self = this;
			if(e.clientY + $(window).scrollTop() < self.jQueryInnerTableBox.offset().top && !self.mousewheelEvent){
				self.yScrollTrue.stop(true).animate({
					"scrollTop": self.yScrollTrue.scrollTop() - tdHeight
				},30);
			}else if(e.clientY + $(window).scrollTop() > self.jQueryInnerTableBox.offset().top + self.jQueryInnerTableBox.outerHeight() && !self.mousewheelEvent){
				self.yScrollTrue.stop(true).animate({
					"scrollTop": self.yScrollTrue.scrollTop() + tdHeight
				},30);
			}
		},
		scrollToPoint: function(xId, yId){
			var self = this, aimXTd, aimYTd;
			if(xId){
				aimXTd = self.jQueryXHeadTableBox.find("td[x_id="+xId+"]");
				if(aimXTd.length !== 0){
					self.xScrollTrue.stop(true).animate({
						"scrollLeft": aimXTd.offset().left - self.jQueryXHeadTableBox.find("table").offset().left
					},500);
				}
			}
			if(yId){
				aimYTd = self.jQueryYHeadTableBox.find("td[y_id="+yId+"]");
				if(aimYTd.length !== 0){
					self.yScrollTrue.stop(true).animate({
						"scrollTop": aimYTd.offset().top - self.jQueryYHeadTableBox.find("table").offset().top
					},500);
				}
			}
		},
		bindSelfEvent: function(){
			var self = this;
			if(self.jsDom.data("notFirstTime"))
				return;
			self.jsDom.on("refreshTableByCData", function(e, cData){
				self.cData = cData;
				self.tmpCData = JSON.parse(JSON.stringify(cData));
				self.refreshTableContent();
			});
			self.jsDom.on("refreshTableByAllData", function(e, xData, yData, cData, options){
				self.xData = xData;
				self.yData = yData;
				self.cData = cData;
				self.idKey = options.keyGroup.idKey;
				self.xIdKey = options.keyGroup.xIdKey;
				self.yIdKey = options.keyGroup.yIdKey;
				self.tmpCData = JSON.parse(JSON.stringify(cData)); //缓存数据：目的是为了不改变原始数据
				self.options = $.extend(true, {}, self._default, options);
				self._init();
			});
			self.jsDom.on("scrollToPoint", function(e, xId, yId){
				self.scrollToPoint(xId, yId);
			});
			self.jsDom.on("fillContentByKeywords", function(e, keywords){
				self.fillContentByKeywords(keywords);
			});
			self.jsDom.on("addNewCDataItem", function(e, data, callback){
				if(!(data instanceof Object) && !data){
					return;
				}
				self.tmpCData.push(data);
				self.refreshTableContent();
				var thisItemBox = self.jQueryContentPosBox.find(".jquery_content_pos_item[data-value=" + data[self.idKey] + "]");
				callback ? callback(data, thisItemBox) : "";
			});
		},
		fillContentByKeywords: function(keywords){
			var self = this;
			for(var i=0; i<self.yData.length; i++){
				var y = self.jQueryYHeadTableBox.find("td[y_id="+self.yData[i][self.yIdKey]+"]").attr("y");
				if(self.yData[i][keywords]){
					var keywordsObj = self.yData[i][keywords];
					for(var j in keywordsObj){
						var x = self.jQueryXHeadTableBox.find("td[x_id="+j+"]").attr("x");
						var aimTd = self.jQueryInnerTableBox.find("tr").eq(y).find("td").eq(x);
						keywordsObj[j] ? aimTd.text(keywordsObj[j]) : "";
					}
				}
			}
		},
		doubleClickTdEvent: function(){
			var self = this;
			var addCdataWindowDom = '\
				<div class="add_cdata_window_bg">\
				  <div class="add_cdata_window">\
					<i class="add_cdata_window_close">×</i>\
					<div class="add_cdata_line clearfix">\
					  <span class="data_name_label" id="xdata_name_label">医生：</span>\
					  <select class="jq_table_common_select x_data_name_select" id="x_data_name_select">\
					  </select>\
					</div>\
					<div class="add_cdata_line clearfix">\
					  <span class="data_name_label" id="ydata_name_label">时段：</span>\
					  <select class="jq_table_common_select y_data_name_select_start" id="y_data_name_select_start">\
					  </select>\
					  <span class="data_name_label">至：</span>\
					  <select class="jq_table_common_select y_data_name_select_end" id="y_data_name_select_end">\
					  </select>\
					</div>\
					<div class="add_cdata_line clearfix">\
					  <span class="data_name_label" id="cdata_name_label">姓名：</span>\
					  <input type="text" class="c_data_name_input" id="c_data_name_input">\
					</div>\
					<div class="add_cdata_line clearfix">\
					  <span class="data_name_label">备注：</span>\
					  <textarea id="cdata_remark" class="cdata_remark"></textarea>\
					</div>\
					<div class="add_cdata_line clearfix">\
					  <span class="add_cdata_save">保存</span>\
					  <span class="add_cdata_cancel">取消</span>\
					</div>\
				  </div>\
				</div>\
			';
			$(".add_cdata_window_bg").length == 0 ? $("body").append($(addCdataWindowDom)) : "";
			self.jQueryInnerTableBox.find("table td").on("dblclick", function(){
				var clickXIndex = $(this).index();//获得点击行
				var clickYIndex = $(this).parent().index();//获得点击列
				var xDataOption = "";
				var yDataOption = "";
				$.each(self.xData, function(index, data){
					xDataOption += "<option value=" + data[self.xIdKey] + ">" + data[self.options.keyGroup.xTxtKey] + "</option>"
				});
				$.each(self.yData, function(index, data){
					yDataOption += "<option value=" + data[self.yIdKey] + ">" + data[self.options.keyGroup.yTxtKey] + "</option>"
				});
				$("#x_data_name_select").empty().append(xDataOption);
				$("#y_data_name_select_start, #y_data_name_select_end").empty().append(yDataOption);
				$("#x_data_name_select").find("option").eq(clickXIndex).attr("selected", "selected");
				$("#y_data_name_select_start").find("option").eq(clickYIndex).attr("selected", "selected");
				$("#y_data_name_select_end").find("option").eq(clickYIndex).attr("selected", "selected");
				
				$("#xdata_name_label").text(self.options.tName.xName + "：");
				$("#ydata_name_label").text(self.options.tName.yName + "：");
				$("#c_data_name_input").val("");
				$(".add_cdata_window_close").off("click").on("click", function(){
					$(".add_cdata_window_bg").hide();
				})
				$(".add_cdata_cancel").off("click").on("click", function(){
					$(".add_cdata_window_bg").hide();
				})
				$(".add_cdata_save").off("click").on("click", function(){
					var newCData = {};
					var randomId = "";
					var i=4;
					while(i--){
						randomId += String.fromCharCode(97 + parseInt(Math.random()*26)) + parseInt(Math.random()*10);
					}
					var newXIdKey = $("#x_data_name_select option:selected").val();
					var newYIdKey = [];
					var newYIdKeyStartIndex = $("#y_data_name_select_start").get(0).selectedIndex;
					var newYIdKeyEndIndex = $("#y_data_name_select_end").get(0).selectedIndex;
					for(var index=newYIdKeyStartIndex; index<=newYIdKeyEndIndex; index++){
						newYIdKey.push($("#y_data_name_select_start").get(0).options[index].value);
					}
					var newCDataName = $("#c_data_name_input").val();
					newCData[self.options.keyGroup.idKey] = randomId;
					newCData[self.options.keyGroup.xIdKey] = newXIdKey;
					newCData[self.options.keyGroup.yIdKey] = newYIdKey;
					newCData[self.options.keyGroup.txtKey] = newCDataName;
					self.jsDom.addNewCDataItem(newCData, self.options.addNewCDataCallBack);
				})
				$(".add_cdata_window_bg").fadeIn();
			})
			
			
		}
		
		
    }
    $.fn.extend({
        setJQueryTable: function(xData, yData, cData, options){
		    var start = new Date().getTime();
			
			if($(this).data("notFirstTime"))
				$(this).trigger("refreshTableByAllData", [xData, yData, cData, options]);
			else
				new SetJQueryTable(this, xData, yData, cData, options);
			$(this).data("notFirstTime", true);
			
			var end = new Date().getTime();
			console.log((end - start)+"ms 载入已完成");
			return $(this);
        },
		refreshTableByCData: function(cData){
			var start = new Date().getTime();
			
			$(this).trigger("refreshTableByCData", [cData]);
			
			var end = new Date().getTime();
			console.log((end - start)+"ms 载入已完成");
			return $(this);
		},
		scrollToPoint: function(xId, yId){
			var start = new Date().getTime();
			
			$(this).trigger("scrollToPoint", [xId, yId]);
			
			var end = new Date().getTime();
			console.log((end - start)+"ms 载入已完成");
			return $(this);
		},
		fillContentByKeywords: function(keywords){
			var start = new Date().getTime();
			
			$(this).trigger("fillContentByKeywords", [keywords]);
			
			var end = new Date().getTime();
			console.log((end - start)+"ms 载入已完成");
			return $(this);
		},
		addNewCDataItem: function(data, callback){
			var start = new Date().getTime();
			
			$(this).trigger("addNewCDataItem", [data, callback]);
			$(".add_cdata_window_bg").fadeOut();
			
			var end = new Date().getTime();
			console.log((end - start)+"ms 载入已完成");
			return $(this);
		}
    })
})(jQuery);
