<?php


namespace fast;
use think\Cache;
use think\Db;

/**
 * 温县稳压源处理类
 */
class Wyy
{
    public function up($data){
        if(isset($data['open']) && isset($data['volt']) && isset($data['out'])){
            $info = [
                'devid'=>$data['devid'],
                'time'=>date("Y-m-d H:i:s"),
                'open'=>$data['open'],
                'volt'=>$data['volt'],
                'out'=>$data['out'],
            ];
            Cache::set('info:'.$data['devid'],$info,3600);
        }
        if(isset($data['data'])){
            $info = Cache::get('info:'.$data['devid']); 
            if($data['data']=='01060000000089CA'){
                $info['open'] = 0;
            } elseif($data['data']=='010600000001480A') {
                $info['open'] = 1;
            }
            Cache::set('info:'.$data['devid'],$info,3600);
        }
        return 'success';
    }

    public function down_tran_msg($data){

        $device['devid']=$data['devid'];
        $device['cmd']='down_tran_msg';
        $device['time']=time();
        $device['sign']='sign';
        if($data['devid'] == 'dev001' or $data['devid']=='dev002'){
            if($data['open']){
                $device['data'] = '02 06 00 00 00 01 48 39 ';//不供电
            } else {
                $device['data'] = '02 06 00 00 00 00 89 F9 ';//供电
            }
        } else {
            if($data['open']){
                $device['data'] = '01 06 00 00 00 01 48 0A ';//不供电
            } else {
                $device['data'] = '01 06 00 00 00 00 89 CA ';//供电
            }
        }
        
        return $device;
    }
}