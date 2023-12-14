define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'device_group/index' + location.search,
                    add_url: 'device_group/add',
                    edit_url: 'device_group/edit',
                    del_url: 'device_group/del',
                    multi_url: 'device_group/multi',
                    import_url: 'device_group/import',
                    table: 'device_group',
                }
            });

            var table = $("#table");

            // 初始化表格
            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'id',
                columns: [
                    [
                        {checkbox: true},
                        {field: 'id', title: __('Id')},
                        {field: 'group_name', title: __('Group_name'), operate: 'LIKE'},
                        {field: 'group_tags', title: __('Group_tags'), operate: 'LIKE'},
                        {field: 'url', title: __('Url'), operate: false, formatter: Table.api.formatter.url},
                        {field: 'white_list', title: __('White_list'), operate: false},
                        {field: 'add_time', title: __('Add_time'), operate:'RANGE', addclass:'datetimerange', autocomplete:false},
                        {field: 'operate', title: __('Operate'), table: table, events: Table.api.events.operate, formatter: Table.api.formatter.operate}
                    ]
                ]
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
        api: {
            bindevent: function () {
                Form.api.bindevent($("form[role=form]"));
            }
        }
    };
    return Controller;
});
