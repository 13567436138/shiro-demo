var dataTree ;
$(function(){
    setCsrfToken("_csrf-form");
});

function setCsrfToken(formId) {
    var csrfToken = $('#' + formId).find('input[name="csrfToken"]').val();
    $(document).on('ajaxSend', function (elem, xhr, s) {
        if (s.type.toUpperCase() == 'POST') {
        	xhr.setRequestHeader('csrfToken', csrfToken);
        }else {
            s.url += (s.url.indexOf("?") == -1) ? "?" : "&";
            s.url += "csrfToken=" + csrfToken;
        }
    });
}
$(function(){
	
	var path=document.getElementById("base").href;
	$.post(path+"/menu/getMenuTopLever",{}, function(data) {
		dataTree=convertJson(data);
		if(dataTree.code==403){
			document.location=path+"/common/login"
		}
		InitLeftMenu(dataTree);
		tabClose();
		tabCloseEven();
	});
	
	
})

function convertJson(data){
	if(typeof data === 'string'){
		data = jQuery.parseJSON(data);
	}
	return data;
}


function InitLeftMenu(dataTree) {
	var path=document.getElementById("base").href;
	$("#nav").accordion({animate:false});
    $.each(dataTree, function(i, n) {
    	$.ajax({
    		  type: 'POST',
    		  url: path+"/menu/getMenuChildren",
    		  data: {pid:n.id},
    		  dataType: "json",
    		  success: function(data) {
    	    		var children=convertJson(data);
    	    		var menulist ='';
    	    		menulist +='<ul>';
    	            $.each(children, function(j, o) {
    	            	menulist += '<li><div><a  ref="'+o.id+'" href="javascript:void(0);" rel="'+path + o.link + '" mark="'+o.menuName+'" ><span class="icon '+o.icon+'" >&nbsp;</span><span class="nav">' + o.menuName + '</span></a></div></li> ';
    	            })
    	    		menulist += '</ul>';

    	    		$('#nav').accordion('add', {
    	                title: n.menuName,
    	                content: menulist,
    	                iconCls: 'icon ' + n.icon
    	            });
    	    	}
    		  
    		});
    	
    });

    $("body").on("click",".easyui-accordion li a",function(){
		var tabTitle = $(this).children('.nav').text();
		var url = $(this).attr("rel");
		var menuid = $(this).attr("ref");
		var icon = ""

		addTab(tabTitle,url,icon);
		$('.easyui-accordion li div').removeClass("selected");
		$(this).parent().addClass("selected");
	})
	$("body").on("hover",".easyui-accordion li a",function(){
		$(this).parent().addClass("hover");
	},function(){
		$(this).parent().removeClass("hover");
	});

	var panels = $('#nav').accordion('panels');
	//var t = panels[0].panel('options').title;
    //$('#nav').accordion('select', t);
}

function getIcon(menuid){
	var icon = 'icon ';
	$.each(dataTree, function(i, n) {
		 $.each(n.menus, function(j, o) {
		 	if(o.menuid==menuid){
				icon += o.icon;
			}
		 })
	})

	return icon;
}

function addTab(subtitle,url,icon){
	if(!$('#tabs').tabs('exists',subtitle)){
		$('#tabs').tabs('add',{
			title:subtitle,
			content:createFrame(url),
			closable:true,
			icon:icon
		});
	}else{
		$('#tabs').tabs('select',subtitle);
		$('#mm-tabupdate').click();
	}
	tabClose();
}

function createFrame(url)
{
	var s = '<iframe scrolling="auto" frameborder="0"  src="'+url+'" style="width:100%;height:100%;"></iframe>';
	return s;
}

function tabClose()
{
	
	$(".tabs-inner").dblclick(function(){
		var subtitle = $(this).children(".tabs-closable").text();
		$('#tabs').tabs('close',subtitle);
	})
	
	$(".tabs-inner").bind('contextmenu',function(e){
		$('#mm').menu('show', {
			left: e.pageX,
			top: e.pageY
		});

		var subtitle =$(this).children(".tabs-closable").text();

		$('#mm').data("currtab",subtitle);
		$('#tabs').tabs('select',subtitle);
		return false;
	});
}

function tabCloseEven()
{
	
	$('#mm-tabupdate').click(function(){
		var currTab = $('#tabs').tabs('getSelected');
		var url = $(currTab.panel('options').content).attr('src');
		$('#tabs').tabs('update',{
			tab:currTab,
			options:{
				content:createFrame(url)
			}
		})
	})
	
	$('#mm-tabclose').click(function(){
		var currtab_title = $('#mm').data("currtab");
		$('#tabs').tabs('close',currtab_title);
	})

	$('#mm-tabcloseall').click(function(){
		$('.tabs-inner span').each(function(i,n){
			var t = $(n).text();
			$('#tabs').tabs('close',t);
		});
	});
	
	$('#mm-tabcloseother').click(function(){
		$('#mm-tabcloseright').click();
		$('#mm-tabcloseleft').click();
	});
	
	$('#mm-tabcloseright').click(function(){
		var nextall = $('.tabs-selected').nextAll();
		if(nextall.length==0){
			//msgShow('ϵͳ��ʾ','���û����~~','error');
			$.messager.alert('��ʾ��','����û����~~','warning');
			return false;
		}
		nextall.each(function(i,n){
			var t=$('a:eq(0) span',$(n)).text();
			$('#tabs').tabs('close',t);
		});
		return false;
	});
	
	$('#mm-tabcloseleft').click(function(){
		var prevall = $('.tabs-selected').prevAll();
		if(prevall.length==0){
			$.messager.alert('��ʾ��','��ͷ����ǰ��û����~~','warning');
			return false;
		}
		prevall.each(function(i,n){
			var t=$('a:eq(0) span',$(n)).text();
			$('#tabs').tabs('close',t);
		});
		return false;
	});

	
	$("#mm-exit").click(function(){
		$('#mm').menu('hide');
	})
}


function msgShow(title, msgString, msgType) {
	$.messager.alert(title, msgString, msgType);
}


//加载系统配置文件设置列表
function loadList(pageNumber, searchForm, datagridId, pageSize) {
	if (isEmpty(searchForm)) {
		searchForm = 'searchForm';
	}
	if (isEmpty(datagridId)) {
		datagridId = 'dataList';
	}
	var pager = $('#' + datagridId).datagrid('getPager');
	var rows = pager.pagination('options').pageSize;
	if (!isEmpty(pageSize)) {
		rows = pageSize;
		
	}
	var searchP = getFormJson(searchForm);

	$(searchP).attr('pageSize', rows);
	$(searchP).attr('currentPage', pageNumber);
	/*var url = $('#' + datagridId).datagrid("options").url;
	if (isEmpty(url)) {
		url = searchUrl;
	}*/
	$('#' + datagridId).datagrid('load',searchP);
	/*$.post(url, searchP, function(response) {
		response = convertJson(response);
		refreshDatagrid(datagridId, pageNumber, pageSize);
		$('#' + datagridId).datagrid('loadData', response);
	});*/
}

/**
 * 刷新DataGrid
 */
function refreshDatagrid(dgid,pageNumber,pageSize){
	$('#'+dgid).datagrid('options').pageNumber = pageNumber;
	if(isEmpty(pageSize)){
		$('#'+dgid).datagrid('getPager').pagination({pageNumber:pageNumber});
	}else{
		$('#'+dgid).datagrid('options').pageSize=pageSize;
		$('#'+dgid).datagrid('getPager').pagination({pageNumber:pageNumber,pageSize:pageSize});
	}
	
}

/**
 * 判断是否为空
 * @param exp
 * @returns {Boolean}
 */
function isEmpty(exp){
	var bl = false;
	if (typeof exp === "undefined" )
	{
		bl = true;
	}else if(typeof exp === "string" && !exp){
		bl = true;
	}
	
	return bl;
}

/**
 * 合并数组
 * @param result
 * @param src
 * @returns
 */
function extend(result,src){
		$(src).each(function(index,row){
			 $(result).attr(row.name,row.value);
		})
	   return result;
	}


function getFormJson(formId){
	var data = $("#"+formId).serializeArray();
	var result = {};
	extend(result,data);
	return result;
}

/**
 * 提示框
 * @returns
 */
var showBox = function (title,content,m_type,id){
	$.messager.alert(title,content,m_type,function(){
		if(!isEmpty(id)){
			$("#"+id).focus();
		}
	});
};

function closeWindow(id){
	$("#"+id).window("close");
}