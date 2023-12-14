<?php

namespace app\admin\model;

use think\Model;


class Device extends Model
{

    

    

    // 表名
    protected $name = 'device';
    
    // 自动写入时间戳字段
    protected $autoWriteTimestamp = 'int';

    // 定义时间戳字段名
    protected $createTime = 'add_time';
    protected $updateTime = 'edit_time';
    protected $deleteTime = false;

    // 追加属性
    protected $append = [
        'type_text',
        'add_time_text',
        'edit_time_text'
    ];
    

    
    public function getTypeList()
    {
        return [
            'kaichuang' => __('开创协议'),
            'hongxi' => __('虹吸协议'),
            'zidingyi' => __('自定义协议'),
            'zidingyidf' => __('蝶阀协议'),
            'aliyun' => __('阿里云协议'),
            'zidingyiwyy' => __('稳压源协议'),
        ];
    }


    public function getTypeTextAttr($value, $data)
    {
        $value = $value ? $value : (isset($data['type']) ? $data['type'] : '');
        $list = $this->getTypeList();
        return isset($list[$value]) ? $list[$value] : '';
    }


    public function getAddTimeTextAttr($value, $data)
    {
        $value = $value ? $value : (isset($data['add_time']) ? $data['add_time'] : '');
        return is_numeric($value) ? date("Y-m-d H:i:s", $value) : $value;
    }


    public function getEditTimeTextAttr(    $value, $data)
    {
        $value = $value ? $value : (isset($data['edit_time']) ? $data['edit_time'] : '');
        return is_numeric($value) ? date("Y-m-d H:i:s", $value) : $value;
    }

    protected function setAddTimeAttr($value)
    {
        return $value === '' ? null : ($value && !is_numeric($value) ? strtotime($value) : $value);
    }

    protected function setEditTimeAttr($value)
    {
        return $value === '' ? null : ($value && !is_numeric($value) ? strtotime($value) : $value);
    }
}
