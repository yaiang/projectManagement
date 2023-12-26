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
        },
        api: {
            bindevent: function () {
                Form.api.bindevent($("form[role=form]"));
            }
        }
    };
    return Controller;
});
