<?php


namespace fast;

use think\Cache;
use think\Db;

/**
 * 物联网中转层对接类
 */
class Iot
{
    public $upUrl='http://nz.cnipc.top:1222';
    public $downUrl='http://nz.cnipc.top:1223';
    public $otherUrl='http://nz.cnipc.top:1234';

    /**
     * 返回结果
     */
    public function  resuly($data){
        $data['time']=time();
        $data['sign']= time();
        return $data;
    }

    /**
     * 设备信息查询接口
     */
    public function up_get_devinfo($data){
        $device = Cache::get('device:'.$data['devid']);
        $group = Cache::get("devgroup:".$device['group_id']);
        if(!$group){
            $group= Db::name('device_group')->where(['id'=>$device['group_id']])->find();
            if($group){
                Cache::set("devgroup:".$device['group_id'],$group);
            }
            
        }
        $ret=[
            "cmd"=>"up_get_devinfo_resp",
            "devid"=>$data['devid'],
            "group_tags"=>$group['group_tags'],
            "url"=>$group['url'],
            "white_list"=>$group['white_list'],
            "code"=> 0
        ];
        return $this->resuly($ret);
    }
    /**
     * 设备状态通知
     */
    public function up_set_devstatus($data){
        $device = Cache::get('device:'.$data['devid']);
        if($data['status']){
            $device['status'] = $data['status'];
            $device['online_time'] = date('Y-m-d H:i:s');
            Db::name('device')->where(['devicekey'=>$data['devid']])->update(['status'=>$data['status'],'online_time'=>date('Y-m-d H:i:s')]);
        }else{
            $device['status'] = $data['status'];
            $device['offline_time'] = date('Y-m-d H:i:s');
            Db::name('device')->where(['devicekey'=>$data['devid']])->update(['status'=>$data['status'],'offline_time'=>date('Y-m-d H:i:s')]);
        }
        Cache::set('device:'.$data['devid'],$device);
    }
}