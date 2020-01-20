# tableFixed
table fixed cols or thead
## 例子
[Demo](https://lemonliuchen.github.io/tableFixed/table_th_group.html)
## 基本结构
```html
<table>
	<!-- colgroup用来设置列宽度 -->
	<colgroup>
        <col width="150"/>
        <col width="150"/>
    </colgroup>
    <!-- thead表头 -->
    <thead>
		<tr>
			<th>第一列</th>
			<th>第二列</th>
		</tr>
	</thead>
    <!-- tbody内容 -->
    <tbody>
		<tr>
			<td>第一列</td>
			<td>第二列</td>
		</tr>
	</tbody>
</table>
```
## options
```javascript
headFixed: true, // 表头固定
leftFixedNum: 1, // 左侧固定列数
```

## example
```javascript
var myTableFixed = null;
$(function () {
	myTableFixed = new TableFixed("#example", {
		headFixed: true, // 表头固定
		leftFixedNum: 1, // 左侧固定列数
	});
})
```
