var TableFixed = function (element, options) {
	this.options             = options || {}
	this.$body               = top.$(document.body)
	this.$element            = $(element)
	this.$originElement		 = this.$element.clone() // 保存原始表格，重置表格时有用

	this.$parent			 = this.$element.parent(); // 最外层dom对象
	this.$bodyDiv			 = null; // 主体表格所在div
	this.$headDiv            = null; // 固定表头dom对象
	this.$leftDiv            = null; // 左侧固定dom对象
	this.$leftHeadDiv        = null; // 左侧固定表头dom对象
	this.headFixed			 = this.options.headFixed || false; // 表头固定
	this.leftFixedNum		 = this.options.leftFixedNum || 0; // 左侧固定列数
	this.isHscroll			 = false; // 是否有横向滚动条
	this.isVscroll			 = false; // 是否有垂直滚动条
	this.th_first_row		 = '', // th第一列，用来设置宽度
	this.td_first_row		 = '', // td第一列，用来设置宽度
	this.resizeTimer	     = -1; // resize时的timer

	this.init();
	this.setFixed();
}

TableFixed.prototype.init = function () {
	var self = this;

	// 判断是否有横向、纵向滚动条
	if (self.$parent[0].scrollWidth > self.$parent[0].offsetWidth) {
		self.isHscroll = true;
	}
	if (self.$parent[0].scrollHeight > self.$parent[0].offsetHeight) {
		self.isVscroll = true;
	}

	if (self.leftFixedNum > 0) { // 左侧有固定时表头默认固定
		self.headFixed = true;
	}

	// 重置宽度，有些宽度不足的100%的会自适应，这里重新设置自适应后的宽度
	self.th_first_row = '<tr class="tableFixed-first-row">';
	self.td_first_row = '<tr class="tableFixed-first-row">';
	self.$element.find(".tableFixed-first-row th").each(function () {
		var width = $(this).width();
		self.th_first_row  += '<th width="' + width + '" /></th>';
		self.td_first_row  += '<td width="' + width + '" /></td>';
	})
	self.th_first_row += '</tr>';
	self.td_first_row += '</tr>';
	self.$element.find(".tableFixed-first-row").replaceWith(self.th_first_row);
}

/**
 * [setFixed 设置固定]
 */
TableFixed.prototype.setFixed = function () {
	var self = this;
	var allHeight = self.$parent[0].offsetHeight; // 外层高度
	var headHeight = 30;
	var $elementCopy = self.$element.clone();
	if (self.headFixed) {
		// 创建并添加表头
		var tempObj = $elementCopy.clone();
		tempObj.attr("id", "");
		tempObj.children("tbody").remove();
		self.$headDiv = $('<div class="tableFixed-hdiv"></div>');
		self.$headDiv.append(tempObj);
		self.$parent.prepend(self.$headDiv);

		headHeight = self.$headDiv.outerHeight(); // 表头高度

		// 主体表格去掉表头
		self.$element.children("thead").remove();
		self.$element.children("tbody").prepend(self.td_first_row);
		// 给主体表格添加一个包裹div，并设置包裹div的高度为外层高度减去表头高度，top为表头高度-1， -1是为了防止表头和内容的边框重叠
		self.$element.wrap('<div class="tableFixed-bdiv" style="height: ' + (allHeight - headHeight) + 'px; top: ' + (headHeight - 1) + 'px;"></div>');
		self.$bodyDiv = self.$element.parent();

		/*var width = self.$bodyDiv.width();
		self.$headDiv.width(width);*/ // 设置表头div的宽度和内容宽度一致，防止有滚动条时宽度不一致导致错位

		if (self.isVscroll) {
			// 有纵向滚动条时给表头加滚动条宽度的列,保持和滚动条宽度一致
			var scrollbarWidth = self.$bodyDiv[0].offsetWidth - self.$bodyDiv[0].clientWidth;
			var rowspan = 1;
			if (self.$originElement.children("thead").children("tr").length > 2) {
				rowspan = self.$originElement.children("thead").children("tr").length - 1;
			}
			self.$headDiv.find("thead tr").eq(1).append("<th rowspan='" + rowspan + "'></th>");
			self.$headDiv.find(".tableFixed-first-row").append("<th width='" + (scrollbarWidth) + "'  class='tableFixed-place-th'></th>");
		}
	}

	if (self.leftFixedNum > 0) {
		// 创建左侧固定
		var tempBodyObj = $elementCopy.clone();
		tempBodyObj.attr("id", "");
		tempBodyObj.children("thead").remove();
		tempBodyObj.children("tbody").prepend(self.td_first_row);
		tempBodyObj.children("tbody").children('tr').find("td:gt(" + (self.leftFixedNum-1) + ")").remove();

		var height = self.$bodyDiv.height();
		self.$leftDiv = $('<div class="tableFixed-bdiv-lfixed" style="height: ' + height + 'px; top: ' + (headHeight - 1) + 'px;"></div>');
		self.$leftDiv.append(tempBodyObj);
		self.$parent.append(self.$leftDiv);

		var tempHeadObj = $elementCopy.clone();
		tempHeadObj.attr("id", "");
		tempHeadObj.children("tbody").remove();
		var tempHeadTr = tempHeadObj.children("thead").children('tr');
		tempHeadTr.find("th:gt(" + (self.leftFixedNum-1) + ")").remove();
		for (var i = 1; i < tempHeadTr.length-1; i++) {
			if ($(tempHeadTr[i]).children("th").length > 0) {
				var colspan = 0;
				for (var j = 0; j < $(tempHeadTr[i]).children("th").length; j++) {
					var tempObj = $(tempHeadTr[i]).children("th")[j];
					if (typeof $(tempObj).attr("rowspan") != 'undefined' && $(tempObj).attr("rowspan") > 1) {
						var rowspan = parseInt($(tempObj).attr("rowspan"));
						$(tempHeadTr[i]).nextAll().filter(":lt(" + rowspan + ")").children("th:last-child").remove();
					}
					if (typeof $(tempObj).attr("colspan") != 'undefined') {
						colspan += parseInt($(tempObj).attr("colspan"));
					} else {
						colspan++;
					}
				}
				if (colspan > 1) {
					$(tempHeadTr[i]).children("th:gt(" + (colspan-1) + ")").remove();
				}
			}
		}


		self.$leftHeadDiv = $('<div class="tableFixed-hdiv-lfixed"></div>');
		self.$leftHeadDiv.append(tempHeadObj);
		self.$parent.append(self.$leftHeadDiv);
		self.$headDiv.find('tr:not(.tableFixed-first-row)').each(function (argument) {
			var trHeight = $(this).height();
			var index = $(this).index();
			self.$leftHeadDiv.find('tr').eq(index).height(trHeight);
		})

		self.$parent.addClass("is-scroll-left"); // 初始滚动条在左侧
	}

	if (self.headFixed) {
		self.scrollTable();

		$(window).resize(function () {
			clearTimeout(self.resizeTimer);
			// 设置延时，避免窗口变化过程出现卡顿
			self.resizeTimer = setTimeout(function () {
				self.unsetFixed();
				self.setFixed();
			}, 100);
		})
	}
}

/**
 * [unsetFixed 取消固定]
 * @return {[type]} [description]
 */
TableFixed.prototype.unsetFixed = function () {
	var self = this;
	self.reset();
}

/**
 * [unsetFixed 取消固定]
 * @return {[type]} [description]
 */
TableFixed.prototype.resetFixed = function () {
	var self = this;
	self.reset();
	self.setFixed();
}

TableFixed.prototype.scrollTable = function () {
	var self = this;
	if (self.headFixed && self.$headDiv) { // 
		self.$element.parent().scroll(function () {
			var scrollLeft = $(this).scrollLeft();
			self.$headDiv.scrollLeft(scrollLeft);

			if (scrollLeft > 0) {
				self.$parent.removeClass("is-scroll-left");
			} else {
				self.$parent.addClass("is-scroll-left");
			}

			if (self.leftFixedNum > 0 && self.$leftDiv) {
				var scrollTop = $(this).scrollTop();
				self.$leftDiv.scrollTop(scrollTop);
			}
		})
	}
}

TableFixed.prototype.reset = function () {
	var self = this;
	clearTimeout(self.resizeTimer);
	self.$element            = self.$originElement.clone()
	self.$parent.html(self.$element);
	self.headFixed			 = self.options.headFixed || false; // 表头固定
	self.$bodyDiv			 = null; // 主体表格所在div
	self.$headDiv            = null; // 固定表头dom对象
	self.$leftDiv            = null; // 左侧固定dom对象
	self.$leftHeadDiv        = null; // 左侧固定表头dom对象
	self.isHscroll			 = false; // 是否有横向滚动条
	self.isVscroll			 = false; // 是否有垂直滚动条
	self.resizeTimer	     = -1; // resize时的timer
	self.init();
}