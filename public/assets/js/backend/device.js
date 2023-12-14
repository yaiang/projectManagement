define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {
    var aaa = $.ajax({
        url:"device_group/getJson",
        type:'GET',
        dataType:'json',
        async:false
    });

    var Controller = {
        index: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'device/index' + location.search,
                    add_url: 'device/add',
                    edit_url: 'device/edit',
                    table: 'device',
                }
            });

            var table = $("#table");

            // 初始化表格
            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'id',
                fixedColumns: true,
                fixedRightNumber: 1,
                searchFormVisible:true,
                columns: [
                    [
                        {checkbox: true},
                        {field: 'deviceName', title: __('Devicename'), operate: 'LIKE'},
                        {field: 'nickName', title: __('Nickname'), operate: 'LIKE'},
                        {field: 'group_id', title: __('device_group.group_name'), operate: '=',searchList:aaa.responseJSON,formatter: Table.api.formatter.label},
                        {field: 'status', title: __('Status'),searchList: {0:__('离线'),1:__('在线')}, formatter: Table.api.formatter.status},
                        {field: 'sleep', title: __('Sleep'),searchList: {0:__('否'),1:__('是')},formatter:Table.api.formatter.flag,operate:false},
                        {field: 'is_abnormal', title: __('Is_abnormal'),searchList: {0:__('正常')},custom:{0: 'info'}, formatter: Table.api.formatter.status,operate:false},
                        {field: 'online_time', title: __('Online_time'), operate:'RANGE', addclass:'datetimerange', autocomplete:false,operate:false},
                        {field: 'offline_time', title: __('Offline_time'), operate:'RANGE', addclass:'datetimerange', autocomplete:false,operate:false},
                        {
                            field: 'buttons',
                            width: "120px",
                            title: __('配置'),
                            table: table,
                            operate:false,
                            events: Table.api.events.operate,
                            buttons: [
                                {
                                    name: 'detail',
                                    text: __('调试')  ,
                                    title: __('调试'),
                                    classname: 'btn btn-xs btn-primary btn-dialog',
                                    url: 'device/config',
                                },
                                {
                                    name: 'ajax',
                                    text: __('休眠'),
                                    title: __('休眠'),
                                    classname: 'btn btn-xs btn-success btn-magic btn-ajax',
                                    url: 'device/sleep',
                                    confirm: '设置设备休眠？',
                                    refresh:true,
                                    error: function (data, ret) {
                                        Layer.alert(ret.msg);
                                        return false;
                                    }
                                }
                            ],
                            formatter: Table.api.formatter.buttons
                        },
                        {field: 'operate', title: __('Operate'), table: table, events: Table.api.events.operate, formatter: Table.api.formatter.operate}
                    ]
                ]
            });
            table.on('load-success.bs.table', function (e, data) {
                $("#online").text(data.extend.online);
                $("#count").text(data.extend.count);
                $("#offline").text(data.extend.offline);
            });
            // 为表格绑定事件
            Table.api.bindevent(table);
        },
        add: function () {
            Controller.api.bindevent();
        },
        edit: function () {
            Controller.api.bindevent();
        },
        fenpei: function () {
            Controller.api.bindevent();
        },
        config: function () {
            Controller.api.bindevent();

            function dopen1() {
                $('.el-overlay').show();
                var devid = getCookie('devid')
                if(!devid){
                    $('.el-overlay').hide();
                    alert("请设置设备序列号")
                    return '';
                }
                var angle = $('.angle1').val();
                $.ajax({
                    async:true,
                    url:'http://tiotv3.mingdingkeji.com/App/Df/send',
                    type:'POST',
                    data:{
                        "devid":devid,
                        "cmd":"down_open",
                        "sn":"upBddsdfx0001",
                        "time":1684230719,
                        "sign":"dXBCZGRzZGZ4MDAwMSMxNjg0#dXBCZGRzZGZ4",
                        "angle":angle,
                        "card":"XNC00001",
                    },
                    dataType:'JSON',
                    timeout:5000,
                    success:function (obj) {
                        var data = obj.data;
                        if(data.code == 200){
                            var i=0;
                            timer = setInterval(function () {
                                i++
                                if(i>15){
                                    clearInterval(timer);
                                    $('.el-overlay').hide();
                                    alert("获取失败未返回数据");
                                }
                                $.ajax({
                                    async:true,
                                    url:'http://tiotv3.mingdingkeji.com/App/Site/GetData',
                                    type:'POST',
                                    data:{
                                        "devid":devid,
                                        "ckey":"open",
                                    },
                                    dataType:'JSON',
                                    timeout:5000,
                                    success:function (obj) {
                                        var data = obj.data;
                                        if(data){
                                            clearInterval(timer);
                                            $('.el-overlay').hide();
                                            alert("设备操作成功");
                                        }
                                    }
                                });
                            },1000);
                        }
                        else{
                            $('.el-overlay').hide();
                            alert("API请求失败");
                        }
                    },
                    error:function () {
                        $('.el-overlay').hide();
                        alert("API请求失败");
                    }
                });
            }
            function dopen2(){
                $('.el-overlay').show();
                var devid = getCookie('devid')
                if(!devid){
                    $('.el-overlay').hide();
                    alert("请设置设备序列号")
                    return '';
                }
                var opennum = $('.opennum').val();
                opennum=opennum*2;
                var aaa = 0;
                var open=0;
                var opentimer = setInterval(function(){
                    aaa++;
                    if(open == 0){
                        open=90;
                    } else {
                        open=0;
                    }
                    $.ajax({
                        async:true,
                        url:'http://tiotv3.mingdingkeji.com/App/Df/send',
                        type:'POST',
                        data:{
                            "devid":devid,
                            "cmd":"down_open",
                            "sn":"asadsa" + Math.round(new Date().getTime()/1000),
                            "time":Math.round(new Date().getTime()/1000),
                            "sign":Math.round(new Date().getTime()/1000),
                            "angle":open,
                            "card":"XNC00001",
                        },
                        dataType:'JSON',
                        timeout:5000,
                        success:function (obj) {
                            var data = obj.data;
                            if(data.code == 200){
                                var i=0;
                                timer = setInterval(function () {
                                    i++
                                    if(i>15){
                                        clearInterval(timer);
                                        console.log("第"+ Math.ceil(aaa/2) +"次" + (open==90?"开":"关") + "获取失败未返回数据");
                                    }
                                    $.ajax({
                                        async:true,
                                        url:'http://tiotv3.mingdingkeji.com/App/Site/GetData',
                                        type:'POST',
                                        data:{
                                            "devid":devid,
                                            "ckey":"open",
                                        },
                                        dataType:'JSON',
                                        timeout:5000,
                                        success:function (obj) {
                                            var data = obj.data;
                                            if(data){
                                                clearInterval(timer);
                                                console.log("第"+ Math.ceil(aaa/2) +"次" + (open==90?"开":"关") + '设备操作成功');
                                            }
                                        }
                                    });
                                },1000);
                            }
                            else{
                                console.log("第"+ Math.ceil(aaa/2) +"次" + (open==90?"开":"关") + '设备操作失败');
                            }
                        },
                        error:function () {
                            alert("第"+ Math.ceil(aaa/2) +"次" + (open==90?"开":"关") + "API请求失败");
                        }
                    });

                    if(aaa == opennum){
                        $('.el-overlay').hide();
                        clearInterval(opentimer);
                    }
                },35000);

            }
            function ddebug() {
                $('.el-overlay').show();
                var devid = getCookie('devid')
                if(!devid){
                    $('.el-overlay').hide();
                    alert("请设置设备序列号")
                    return '';
                }
                var angle = $('.angle2').val();
                $.ajax({
                    async:true,
                    url:'http://tiotv3.mingdingkeji.com/App/Df/send',
                    type:'POST',
                    data:{
                        "devid":devid,
                        "cmd":"down_debug",
                        "sn":"upBddsdfx0001",
                        "time":1684230719,
                        "sign":"dXBCZGRzZGZ4MDAwMSMxNjg0#dXBCZGRzZGZ4",
                        "angle":angle,
                        "card":"XNC00001",
                    },
                    dataType:'JSON',
                    timeout:5000,
                    success:function (obj) {
                        var data = obj.data;
                        if(data.code == 200){
                            var i=0;
                            timer = setInterval(function () {
                                i++
                                if(i>15){
                                    clearInterval(timer);
                                    $('.el-overlay').hide();
                                    alert("获取失败未返回数据");
                                }
                                $.ajax({
                                    async:true,
                                    url:'http://tiotv3.mingdingkeji.com/App/Site/GetData',
                                    type:'POST',
                                    data:{
                                        "devid":devid,
                                        "ckey":"device_debug",
                                    },
                                    dataType:'JSON',
                                    timeout:5000,
                                    success:function (obj) {
                                        var data = obj.data;
                                        if(data){
                                            clearInterval(timer);
                                            $('.el-overlay').hide();
                                            alert("设备操作成功");
                                        }
                                    }
                                });
                            },1000);
                        }
                    },
                    error:function () {
                        $('.el-overlay').hide();
                        alert("API请求失败");
                    }
                });
            }
            function restart() {
                $('.el-overlay').show();
                var devid = getCookie('devid')
                if(!devid){
                    $('.el-overlay').hide();
                    alert("请设置设备序列号")
                    return '';
                }
                $.ajax({
                    async:true,
                    url:'http://tiotv3.mingdingkeji.com/App/Df/send',
                    type:'POST',
                    data:{
                        "devid":devid,
                        "cmd":"down_restart",
                        "sn":"upBddsdfx0001",
                        "time":1684230719,
                        "sign":"dXBCZGRzZGZ4MDAwMSMxNjg0#dXBCZGRzZGZ4",
                    },
                    dataType:'JSON',
                    timeout:5000,
                    success:function (obj) {
                        var data = obj.data;
                        if(data.code == 200){
                            $('.el-overlay').hide();
                            alert("重启命令下发成功");
                        }
                    },
                    error:function () {
                        $('.el-overlay').hide();
                        alert("API请求失败");
                    }
                });
            }
            function upgrade() {
                $('.el-overlay').show();
                var devid = getCookie('devid')
                if(!devid){
                    $('.el-overlay').hide();
                    alert("请设置设备序列号")
                    return '';
                }
                var version= $('.version1').val()
                var upgrade =$('.upgrade').val()
                if(!version || !upgrade){
                    $('.el-overlay').hide();
                    alert('版本号和升级包不能为空');
                    return '';
                }
                $.ajax({
                    async:true,
                    url:'http://tiotv3.mingdingkeji.com/App/Df/send',
                    type:'POST',
                    data:{
                        "devid":devid,
                        "cmd":"down_restart",
                        "sn":"upBddsdfx0001",
                        "time":1684230719,
                        "sign":"dXBCZGRzZGZ4MDAwMSMxNjg0#dXBCZGRzZGZ4",
                        "version":version,
                        "upgrade_package":upgrade,
                    },
                    dataType:'JSON',
                    timeout:5000,
                    success:function (obj) {
                        var data = obj.data;
                        if(data.code == 200){
                            $('.el-overlay').hide();
                            alert("升级命令已下发");
                        }
                    },
                    error:function () {
                        $('.el-overlay').hide();
                        alert("API请求失败");
                    }
                });
            }
            function modbus() {
                $('.el-overlay').show();
                var devid = getCookie('devid')
                if(!devid){
                    $('.el-overlay').hide();
                    alert("请设置设备序列号")
                    return '';
                }
                var modbus= $('.modbus').val()
                if(!modbus){
                    $('.el-overlay').hide();
                    alert('modbus命令不能为空');
                    return '';
                }
                $.ajax({
                    async:true,
                    url:'http://tiotv3.mingdingkeji.com/App/Df/send',
                    type:'POST',
                    data:{
                        "devid":devid,
                        "cmd":"down_modbus",
                        "sn":"upBddsdfx0001",
                        "time":1684230719,
                        "sign":"dXBCZGRzZGZ4MDAwMSMxNjg0#dXBCZGRzZGZ4",
                        "modbus":modbus
                    },
                    dataType:'JSON',
                    timeout:5000,
                    success:function (obj) {
                        var data = obj.data;
                        if(data.code == 200){
                            var i=0;
                            timer = setInterval(function () {
                                i++
                                if(i>15){
                                    clearInterval(timer);
                                    $('.el-overlay').hide();
                                    alert("获取失败未返回数据");
                                }
                                $.ajax({
                                    async:true,
                                    url:'http://tiotv3.mingdingkeji.com/App/Site/GetData',
                                    type:'POST',
                                    data:{
                                        "devid":devid,
                                        "ckey":"device_modbus",
                                    },
                                    dataType:'JSON',
                                    timeout:5000,
                                    success:function (obj) {
                                        var data = obj.data;
                                        if(data){
                                            clearInterval(timer);
                                            $('.el-overlay').hide();
                                            $('.modbus').val(data.modbus)
                                            $('.result').val(data.result)
                                            alert("获取数据成功");
                                        }
                                    }
                                });
                            },1000);
                        }
                    },
                    error:function () {
                        $('.el-overlay').hide();
                        alert("API请求失败");
                    }
                });
            }
            function getelement() {
                $('.el-overlay').show();
                var devid = getCookie('devid')
                if(!devid){
                    $('.el-overlay').hide();
                    alert("请设置设备序列号")
                    return '';
                }
                $('.obj').text('');
                elementnum=0;
                $.ajax({
                    async:true,
                    url:'http://tiotv3.mingdingkeji.com/App/Df/send',
                    type:'POST',
                    data:{
                        "devid":devid,
                        "cmd":"down_get_element",
                        "sn":"upBddsdfx0001",
                        "time":1684230719,
                        "sign":"dXBCZGRzZGZ4MDAwMSMxNjg0#dXBCZGRzZGZ4",
                    },
                    dataType:'JSON',
                    timeout:5000,
                    success:function (obj) {
                        var data = obj.data;
                        if(data.code == 200){
                            var i=0;
                            timer = setInterval(function () {
                                i++
                                if(i>15){
                                    clearInterval(timer);
                                    $('.el-overlay').hide();
                                    alert("获取失败未返回数据");
                                }
                                $.ajax({
                                    async:true,
                                    url:'http://tiotv3.mingdingkeji.com/App/Site/GetData',
                                    type:'POST',
                                    data:{
                                        "devid":devid,
                                        "ckey":"device_get_element",
                                    },
                                    dataType:'JSON',
                                    timeout:5000,
                                    success:function (obj) {
                                        var data = obj.data;
                                        if(data){
                                            clearInterval(timer);
                                            $('.el-overlay').hide();
                                            elementnum=0
                                            $.each(data.elements,function (index,obj) {
                                                $('#yaosu').html('');
                                                elementnum += 1;
                                                $('#yaosu').append(
                                                    '<label class="label-'+ index +'" style="display: block;font-size: 18px;padding: 5px;">\n' +
                                                    '    <span style="display: block;">要素标识&nbsp;&nbsp;&nbsp;&nbsp;：<input type="text" style="font-size: 18px;" value="'+ obj.name +'" class="name-'+ index +'"></span>\n' +
                                                    '    <span style="display: block;">从站地址&nbsp;&nbsp;&nbsp;&nbsp;：<input type="text" style="font-size: 18px;" value="'+ obj.stand +'" class="stand-'+ index +'"></span>\n' +
                                                    '    <span style="display: block;">功能码&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;：\n' +
                                                    '        <select style="font-size: 18px;" value="'+ obj.func +'" class="func-'+ index +'">\n' +
                                                    '            <option value="1">01</option>\n' +
                                                    '            <option value="2">02</option>\n' +
                                                    '            <option value="3" selected>03</option>\n' +
                                                    '            <option value="4">04</option>\n' +
                                                    '        </select>\n' +
                                                    '    </span>\n' +
                                                    '    <span style="display: block;">寄存器地址：<input type="text" style="font-size: 18px;" value="'+ obj.addr +'" class="addr-'+ index +'"></span>\n' +
                                                    '    <span style="display: block;">数据个数&nbsp;&nbsp;&nbsp;&nbsp;：<input type="text" style="font-size: 18px;" value="'+ obj.num +'"  class="num-'+ index +'"></span>\n' +
                                                    '    <span style="display: block;">数据格式&nbsp;&nbsp;&nbsp;&nbsp;：\n' +
                                                    '        <select style="font-size: 18px;" value="'+ obj.format +'" class="format-'+ index +'">\n' +
                                                    '            <option value="UINT16">UINT16</option>\n' +
                                                    '            <option value="INT16">INT16</option>\n' +
                                                    '            <option value="UINT32">UINT32</option>\n' +
                                                    '            <option value="INT32">INT32</option>\n' +
                                                    '        </select>\n' +
                                                    '    </span>\n' +
                                                    '    <span style="display: block;">字节顺序&nbsp;&nbsp;&nbsp;&nbsp;：\n' +
                                                    '        <select style="font-size: 18px;" value="'+ obj.order +'" class="order-'+ index +'">\n' +
                                                    '            <option value="AB">AB</option>\n' +
                                                    '            <option value="BA">BA</option>\n' +
                                                    '            <option value="ABCD">ABCD</option>\n' +
                                                    '            <option value="DCBA">DCBA</option>\n' +
                                                    '            <option value="BADC">BADC</option>\n' +
                                                    '            <option value="CDAB">CDAB</option>\n' +
                                                    '        </select>\n' +
                                                    '    </span>\n' +
                                                    '    <span style="display: block;">倍率系数&nbsp;&nbsp;&nbsp;&nbsp;：<input type="text" style="font-size: 18px;" value="'+ obj.rate +'" class="rate-'+ index +'"></span>\n' +
                                                    '    <span style="display: block;">串口号&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;：<input type="text" style="font-size: 18px;" value="'+ obj.serialno +'" class="serialno-'+ index +'"></span>\n' +
                                                    '    <span style="display: block;">波特率&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;：<input type="text" style="font-size: 18px;" value="'+ obj.baudrate +'" class="baudrate-'+ index +'"></span>\n' +
                                                    '    <span style="display: block;">位数&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;：<input type="text" style="font-size: 18px;" value="'+ obj.databit +'" class="databit-'+ index +'"></span>\n' +
                                                    '    <span style="display: block;">停止位&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;：<input type="text" style="font-size: 18px;" value="'+ obj.stopbit +'" class="stopbit-'+ index +'"></span>\n' +
                                                    '    <span style="display: block;">校验位&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;：\n' +
                                                    '        <select style="font-size: 18px;" value="'+ obj.parity +'" class="parity-'+ index +'">\n' +
                                                    '            <option value="None">None</option>\n' +
                                                    '            <option value="Odd">Odd</option>\n' +
                                                    '            <option value="Even">Even</option>\n' +
                                                    '        </select>\n' +
                                                    '    </span>\n' +
                                                    '    <h1>-------------------------------------------</h1>\n' +
                                                    '</label>'
                                                );

                                            });
                                            alert("获取数据成功");
                                        }
                                    }
                                });
                            },1000);
                        }
                    },
                    error:function () {
                        $('.el-overlay').hide();
                        alert("API请求失败");
                    }
                });
            }
            function setelement() {
                $('.el-overlay').show();
                $('.obj').text('');
                var devid = getCookie('devid')
                if(!devid){
                    $('.el-overlay').hide();
                    alert("请设置设备序列号")
                    return '';
                }
                var elements=[]
                for(var i=0;i<elementnum;i++){
                    var elem={
                        "name":$('.name-'+i).val(),
                        "stand":$('.stand-'+i).val(),
                        "func":$('.func-'+i).val(),
                        "addr":$('.addr-'+i).val(),
                        "num":$('.num-'+i).val(),
                        "format":$('.format-'+i).val(),
                        "order":$('.order-'+i).val(),
                        "rate":$('.rate-'+i).val(),
                        "serialno":$('.serialno-'+i).val(),
                        "baudrate":$('.baudrate-'+i).val(),
                        "databit":$('.databit-'+i).val(),
                        "stopbit":$('.stopbit-'+i).val(),
                        "parity":$('.parity-'+i).val()
                    }
                    elements.push(elem);
                }
                if(!elements.length){
                    $('.el-overlay').hide();
                    alert('请添加要素')
                    return ""
                }

                $.ajax({
                    async:true,
                    url:'http://tiotv3.mingdingkeji.com/App/Df/send',
                    type:'POST',
                    data:{
                        "devid":devid,
                        "cmd":"down_set_element",
                        "sn":"upBddsdfx0001",
                        "time":1684230719,
                        "sign":"dXBCZGRzZGZ4MDAwMSMxNjg0#dXBCZGRzZGZ4",
                        "elements":elements
                    },
                    dataType:'JSON',
                    timeout:5000,
                    success:function (obj) {
                        var data = obj.data;
                        if(data.code == 200){
                            var i=0;
                            timer = setInterval(function () {
                                i++
                                if(i>15){
                                    clearInterval(timer);
                                    $('.el-overlay').hide();
                                    alert("获取失败未返回数据");
                                }
                                $.ajax({
                                    async:true,
                                    url:'http://tiotv3.mingdingkeji.com/App/Site/GetData',
                                    type:'POST',
                                    data:{
                                        "devid":devid,
                                        "ckey":"device_set_element",
                                    },
                                    dataType:'JSON',
                                    timeout:5000,
                                    success:function (obj) {
                                        var data = obj.data;
                                        if(data){
                                            clearInterval(timer);
                                            $('.el-overlay').hide();
                                            $('.obj').text(data.toString());
                                            alert("获取数据成功");
                                        }
                                    }
                                });
                            },1000);
                        }
                    },
                    error:function () {
                        $('.el-overlay').hide();
                        alert("API请求失败");
                    }
                });
            }
            function add() {
                $('.obj').text('');
                $('#yaosu').append(
                    '<label class="label-'+ elementnum +'" style="display: block;font-size: 18px;padding: 5px;">\n' +
                    '                    <span style="display: block;">要素标识&nbsp;&nbsp;&nbsp;&nbsp;：<input type="text" style="font-size: 18px;" class="name-'+ elementnum +'"></span>\n' +
                    '                    <span style="display: block;">从站地址&nbsp;&nbsp;&nbsp;&nbsp;：<input type="text" style="font-size: 18px;" class="stand-'+ elementnum +'"></span>\n' +
                    '                    <span style="display: block;">功能码&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;：\n' +
                    '                        <select style="font-size: 18px;" class="func-'+ elementnum +'">\n' +
                    '                            <option value="1">01</option>\n' +
                    '                            <option value="2">02</option>\n' +
                    '                            <option value="3" selected>03</option>\n' +
                    '                            <option value="4">04</option>\n' +
                    '                        </select>\n' +
                    '                    </span>\n' +
                    '                    <span style="display: block;">寄存器地址：<input type="text" style="font-size: 18px;" class="addr-'+ elementnum +'"></span>\n' +
                    '                    <span style="display: block;">数据个数&nbsp;&nbsp;&nbsp;&nbsp;：<input type="text" style="font-size: 18px;"  class="num-'+ elementnum +'"></span>\n' +
                    '                    <span style="display: block;">数据格式&nbsp;&nbsp;&nbsp;&nbsp;：\n' +
                    '                        <select style="font-size: 18px;" class="format-'+ elementnum +'">\n' +
                    '                            <option value="UINT16">UINT16</option>\n' +
                    '                            <option value="INT16">INT16</option>\n' +
                    '                            <option value="UINT32">UINT32</option>\n' +
                    '                            <option value="INT32">INT32</option>\n' +
                    '                        </select>\n' +
                    '                    </span>\n' +
                    '                    <span style="display: block;">字节顺序&nbsp;&nbsp;&nbsp;&nbsp;：\n' +
                    '                        <select style="font-size: 18px;" class="order-'+ elementnum +'">\n' +
                    '                            <option value="AB">AB</option>\n' +
                    '                            <option value="BA">BA</option>\n' +
                    '                            <option value="ABCD">ABCD</option>\n' +
                    '                            <option value="DCBA">DCBA</option>\n' +
                    '                            <option value="BADC">BADC</option>\n' +
                    '                            <option value="CDAB">CDAB</option>\n' +
                    '                        </select>\n' +
                    '                    </span>\n' +
                    '                    <span style="display: block;">倍率系数&nbsp;&nbsp;&nbsp;&nbsp;：<input type="text" style="font-size: 18px;" class="rate-'+ elementnum +'"></span>\n' +
                    '                    <span style="display: block;">串口号&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;：<input type="text" style="font-size: 18px;" class="serialno-'+ elementnum +'"></span>\n' +
                    '                    <span style="display: block;">波特率&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;：<input type="text" style="font-size: 18px;" class="baudrate-'+ elementnum +'"></span>\n' +
                    '                    <span style="display: block;">位数&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;：<input type="text" style="font-size: 18px;" class="databit-'+ elementnum +'"></span>\n' +
                    '                    <span style="display: block;">停止位&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;：<input type="text" style="font-size: 18px;" class="stopbit-'+ elementnum +'"></span>\n' +
                    '                    <span style="display: block;">校验位&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;：\n' +
                    '                        <select style="font-size: 18px;" class="parity-'+ elementnum +'">\n' +
                    '                            <option value="None">None</option>\n' +
                    '                            <option value="Odd">Odd</option>\n' +
                    '                            <option value="Even">Even</option>\n' +
                    '                        </select>\n' +
                    '                    </span>\n' +
                    '                    <h1>-------------------------------------------</h1>\n' +
                    '                </label>'
                );
                elementnum += 1;

            }
            function del() {
                $('.obj').text('');
                elementnum -= 1;
                if(elementnum<0){
                    elementnum=0
                }
                $('.label-'+elementnum).remove();
            }

        },
        api: {
            bindevent: function () {
                Form.api.bindevent($("form[role=form]"));
            }
        }
    };
    return Controller;
});
