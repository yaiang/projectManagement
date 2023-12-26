<?php


namespace fast;
use think\Cache;
use think\Db;

/**
 * 蝶阀控制器处理类
 */
class Df
{
    
    /**
     * 返回结果
     */
    public function  resuly($data){
        $data['time']=time();
        $data['sign']= time();
        return $data;
    }
    /**
     * 设备休眠报处理
     */
    public function up_sleep($data){
        $device = Cache::get('device:'.$data['devid']);
        $ret=[
            'code'=>200,
            'cmd'=>'up_sleep_resp',
            'devid'=>$device['devicekey'],
            'sleep'=>$device['sleep'],
            'sn'=>$data['sn']
        ];;
        
        return $this->resuly($ret);
    }	
    /**
     * 设备异常报处理
     */
    public function up_abnormal($data){
        $device = Cache::get('device:'.$data['devid']);
        $alram_code = $data['alram_code'];
        $device['is_abnormal']=0;
        if($alram_code){
            $device['is_abnormal']=$alram_code;
            $alram_code = decbin($alram_code);
            //异常码处理（待异常码完善以后）

            $device['abnormal_msg']='异常';
        }
        Cache::set('device:'.$device['devicekey'],$device);
    }
    /**
     * 召测命令设备状态
     */
    public function down_device($data){
        $data['sn']=uniqid($data['devid'],true);
        $data['cmd']='down_device';
        return $this->resuly($data);
    }
    /**
     * 召测命令设备状态回应处理
     */
    public function down_device_resp($data){
        $info = [
            'devid'=>$data['devid'],
            'card'=>$data['card'],
            'all_water'=>$data['all_water']/1000,
            'device_type'=>$data['device_type'],
            'value'=>$data['device_type']==1?$data['value']:'',
            'longitude'=>$data['longitude'],
            'latitude'=>$data['latitude'],
            'voltBat'=>$data['voltBat'],
            'version'=>$data['version'],
            'iccid'=>$data['iccid'],
            'signal'=>$data['signal']
        ];
        Cache::set('info:'.$data['devid'],$info,10);
    }
    /**
     * 召测命令设备配置
     */
    public function down_basics($data){
        $data['sn']=uniqid($data['devid'],true);
        $data['cmd']='down_basics';
        return $this->resuly($data);
    }
    /**
     * 召测命令设备配置回应处理
     */
    public function down_basics_resp($data){
        $device=Cache::Get('device:'.$data['devid']);
        $device['info'] = [
            'devid'=>$data['devid'],
            'device_sn'=>$data['device_sn'],
            'power_out_put'=>$data['power_out_put'],
            'device_type'=>$data['device_type'],
            'sleep_loop'=>$data['sleep_loop'],
            'open_loop'=>$data['open_loop'],
            'lowBatV'=>$data['lowBatV'],
            'lowBatRecV'=>$data['lowBatRecV'],
            'moto_max_run_sec'=>$data['moto_max_run_sec'],
            'moto_min_angle_per5s'=>$data['moto_min_angle_per5s'],
            'server1'=>$data['server1'],
            'server2'=>$data['server2'],
            'server3'=>$data['server3'],
            'server'=>$data['server'],
        ];
        Cache::set('device:'.$data['devid'],$device);
        Db::name('device')->where(['devicekey'=>$data['devid']])->update(['info'=>json_encode($device['info'])]);
    }
    /**
     * 远程配置
     */
    public function down_set_basics($data){
        $device=[];
        if(isset($data['device_sn']))$device['device_sn']=$data['device_sn'];
        if(isset($data['power_out_put']))$device['power_out_put']=$data['power_out_put'];
        if(isset($data['device_type']))$device['device_type']=$data['device_type'];
        if(isset($data['sleep_loop']))$device['sleep_loop']=$data['sleep_loop'];
        if(isset($data['open_loop']))$device['open_loop']=$data['open_loop'];

        if(isset($data['lowBatV']))$device['lowBatV']=$data['lowBatV'];
        if(isset($data['lowBatRecV']))$device['lowBatRecV']=$data['lowBatRecV'];
        if(isset($data['moto_max_run_sec']))$device['moto_max_run_sec']=$data['moto_max_run_sec'];
        if(isset($data['moto_min_angle_per5s']))$device['moto_min_angle_per5s']=$data['moto_min_angle_per5s'];

        if(isset($data['device_sn']))$device['device_sn']=$data['device_sn'];
        if(isset($data['server1']))$device['server1']=$data['server1'];
        if(isset($data['server2']))$device['server2']=$data['server2'];
        if(isset($data['server3']))$device['server3']=$data['server3'];
        if(isset($data['server']))$device['server']=$data['server'];
        $device['devid'] = $data['devid'];
        $device['cmd'] = 'down_set_basics';
        $device['sn']=uniqid($data['devid'],true);

        return $this->resuly($device);
    }
    /**
     * 远程配置回应处理
     */
    public function down_set_basics_resp($data){
        $device = Cache::Get('device:'.$data['devid']);
        $info=$device['info'];
        if(isset($data['devid']))$info['devid']=$data['devid'];
        if(isset($data['device_sn']))$info['device_sn']=$data['device_sn'];
        if(isset($data['power_out_put']))$info['power_out_put']=$data['power_out_put'];
        if(isset($data['device_type']))$info['device_type']=$data['device_type'];
        if(isset($data['sleep_loop']))$info['sleep_loop']=$data['sleep_loop'];
        if(isset($data['open_loop']))$info['open_loop']=$data['open_loop'];
        if(isset($data['device_sn']))$info['device_sn']=$data['device_sn'];
        if(isset($data['server1']))$info['server1']=$data['server1'];
        if(isset($data['server2']))$info['server2']=$data['server2'];
        if(isset($data['server3']))$info['server3']=$data['server3'];
        if(isset($data['server']))$info['server']=$data['server'];
        $device['info']=$info;
        Cache::set('device:'.$data['devid'],$device);
        Db::name('device')->where(['devicekey'=>$info])->update(['info'=>json_encode($info)]);
    }
    /**
     * 远程操作
     */
    public function down_open($data){
        $data['must'] = uniqid($data['devid'], true);
        $data['angle'] = (int)($data['angle']*10);
        $data['cmd'] = 'down_open';
        $data['sn'] = uniqid($data['devid'],true);

        return $this->resuly($data);
    }
    /**
     * 远程控制回应
     */
    public function down_open_resp($data){
        Cache::set('open:'.$data['devid'],$data,10);
    }
    /**
     * 远程升级处理
     */
    public function down_upgrade($data){
        $data['sn']=uniqid($data['devid'],true);
        $data['cmd']='down_upgrade';
        return $this->resuly($data);
    }
    /**
     * 设备重启
     */
    public function down_restart($data){
        $data['sn']=uniqid($data['devid'],true);
        $data['cmd']='down_restart';

        return $this->resuly($data);
    }
    /**
     * 调试矫正
     */
    public function down_debug($data){
        $data['sn']=uniqid($data['devid'],true);
        $data['cmd']='down_debug';
        $data['angle']=$data['angle']==0?0:900;

        return $this->resuly($data);
    }
    /**
     * 调试矫正回应处理
     */
    public function down_debug_resp($data){
        Cache::set('debug:'.$data['devid'],['is_check'=>1],15);
    }
    /**
     * 采集要素
     */
    public function down_set_element($data){
        $data['sn']=uniqid($data['devid'],true);
        $data['cmd']='down_set_element';
        $data['rs485']=is_array($data['rs485'])?json_encode($data['rs485']):$data['rs485'];

        return $this->resuly($data);

    }
    /**
     * 采集要素回应处理
     */
    public function down_set_element_resp($data){
        Cache::set('element:'.$data['devid'],['rs485'=>json_decode($data['rs485'],true)],30);
    }
    /**
     * 读取要素
     */
    public function down_get_element($data){
        $data['sn']=uniqid($data['devid'],true);
        $data['cmd']='down_get_element';
        return $this->resuly($data);
    }
    /**
     * 读取要素回应处理
     */
    public function down_get_element_resp($data, $obj){
        Cache::set('element:'.$data['devid'],['rs485'=>json_decode($data['rs485'],true)],30);
    }
    /**
     * 调试modbus
     */
    public function down_modbus($data){

        $hex = pack('H*', $data['modbus']);
        $crc = 0xFFFF;
        for ($x = 0; $x < strlen ($hex); $x++) {
            $crc = $crc ^ ord($hex[$x]);
            for ($y = 0; $y < 8; $y++) {
                if (($crc & 0x0001) == 0x0001) {
                    $crc = (($crc >> 1) ^ 0xA001);
                } else { $crc = $crc >> 1; }
            }
        }
        $a=dechex($crc %256);
        if($crc %256 < 16){
            $a = '0'.$a;
        }
        $b=dechex(floor($crc /256));
        if(floor($crc /256)<16){
            $b = '0'.$b;
        }
        $count = strlen($data['modbus']);
        $str = '';
        for ($i=0;$i<$count;$i=$i+2){
            $str .= $data['modbus'][$i].$data['modbus'][$i+1].' ';
        }
        $data['sn']=uniqid($data['devid'],true);
        $data['cmd']='down_modbus';
        $data['modbus']=strtoupper($str.$a.' '.$b);

        return $this->resuly($data);
    }
    /**
     * 调试modbus回应处理
     */
    public function down_modbus_resp($data){
        Cache::set('modbus:'.$data['devid'],['modbus'=>$data['modbus'],'result'=>$data['result']],60);
    }

    /**
     * 定义轮询
     */
    public function down_set_modbus($data)
    {
        $data['sn']=uniqid($data['devid'],true);
        $data['cmd']='down_set_modbus';
        return $this->resuly($data);
    }

    /**
     * 定义轮询响应
     */
    public function down_set_modbus_resp($data)
    {
        Cache::set('set_modbus:'.$data['devid'],
            [
                'pub_time'=>$data['pub_time'],
                'modbus_1'=>isset($data['modbus_1'])?$data['modbus_1']:'',
                'modbus_2'=>isset($data['modbus_2'])?$data['modbus_2']:'',
                'modbus_3'=>isset($data['modbus_3'])?$data['modbus_3']:'',
                'modbus_4'=>isset($data['modbus_4'])?$data['modbus_4']:'',
                'modbus_5'=>isset($data['modbus_5'])?$data['modbus_5']:'',
                'modbus_6'=>isset($data['modbus_6'])?$data['modbus_6']:'',
                'modbus_7'=>isset($data['modbus_7'])?$data['modbus_7']:'',
                'modbus_8'=>isset($data['modbus_8'])?$data['modbus_8']:'',
                'modbus_9'=>isset($data['modbus_9'])?$data['modbus_9']:'',
                'modbus_10'=>isset($data['modbus_10'])?$data['modbus_10']:'',
                'time'=>date("Y-m-d H:i:s"),
            ]);
    }

    /**
     * 轮询上报
     */
    public function up_modbus_data($data)
    {
        Cache::set('up_modbus:'.$data['devid'],
            [
                'modbus_1'=>isset($data['modbus_1'])?$data['modbus_1']:'',
                'modbus_2'=>isset($data['modbus_2'])?$data['modbus_2']:'',
                'modbus_3'=>isset($data['modbus_3'])?$data['modbus_3']:'',
                'modbus_4'=>isset($data['modbus_4'])?$data['modbus_4']:'',
                'modbus_5'=>isset($data['modbus_5'])?$data['modbus_5']:'',
                'modbus_6'=>isset($data['modbus_6'])?$data['modbus_6']:'',
                'modbus_7'=>isset($data['modbus_7'])?$data['modbus_7']:'',
                'modbus_8'=>isset($data['modbus_8'])?$data['modbus_8']:'',
                'modbus_9'=>isset($data['modbus_9'])?$data['modbus_9']:'',
                'modbus_10'=>isset($data['modbus_10'])?$data['modbus_10']:'',
                'data_1'=>isset($data['data_1'])?$data['data_1']:'',
                'data_2'=>isset($data['data_2'])?$data['data_2']:'',
                'data_3'=>isset($data['data_3'])?$data['data_3']:'',
                'data_4'=>isset($data['data_4'])?$data['data_4']:'',
                'data_5'=>isset($data['data_5'])?$data['data_5']:'',
                'data_6'=>isset($data['data_6'])?$data['data_6']:'',
                'data_7'=>isset($data['data_7'])?$data['data_7']:'',
                'data_8'=>isset($data['data_8'])?$data['data_8']:'',
                'data_9'=>isset($data['data_9'])?$data['data_9']:'',
                'data_10'=>isset($data['data_10'])?$data['data_10']:'',
            ]);
    }

    /**
     * 协议透传
     */
    public function down_agreement_data($data)
    {
        $data['sn']=uniqid($data['devid'],true);
        $data['cmd']='down_agreement_data';
        return $this->resuly($data);
    }

    /**
     * 透传回应
     */
    public function down_agreement_data_resp($data)
    {
        Cache::set('down_agreement:'.$data['devid'],
            [
                'host'=>$data['host'],
                'data'=>$data['data'],
                'result'=>$data['result'],
            ]);
    }
}