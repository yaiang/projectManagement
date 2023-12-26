<?php

namespace app\api\controller;

use app\common\controller\Api;
use fast\Http;
use think\Cache;
use think\Db;
use fast\Df;
use fast\Wyy;
use fast\Iot;
use think\exception\HttpResponseException;
use think\Response;

class Device extends Api
{
    protected $noNeedLogin = ['*'];
    protected $noNeedRight = ['*'];

    public function post(){
        $param = $this->request->getInput();
        //{"cmd":"up_set_devstatus","time":1700496398,"devid":"230505f7245cf6","status":1,"id":1070}
        file_put_contents(RUNTIME_PATH.'/df/'.date('Y-m-d').'.log',date('Y-m-d H:i:s').'|'.$param.PHP_EOL,FILE_APPEND);
        $param = json_decode($param, true);
        if((!is_array($param)) or (!isset($param['devid'])) or ($param['devid'] == '')){
            $this->fanhui([],1,'json',['Content-Length'=>strlen(json_encode([]))]);
        }
        

        $device = Cache::get('device:'.$param['devid']);
        if(!$device){
            $device = Db::name('device')->where(['devicekey'=>$param['devid']])->find();
            if(!$device){
                $this->fanhui([],1,'json',['Content-Length'=>strlen(json_encode([]))]);              
            }
            Cache::set('device:'.$param['devid'],($device));
        } else{
            $device['status']=1;
            Cache::set('device:'.$param['devid'],$device);
        }
        Db::name('log')->insert(['device_id'=>$device['id'],'devicekey'=>$device['devicekey'],'log'=>json_encode($param),'time'=>date('Y-m-d H:i:s')]);
        $data = "";
        $iot = new Iot();
        if(isset($param['cmd']) && ($param['cmd'] == 'up_get_devinfo'))$data = $iot->up_get_devinfo($param);
        if(isset($param['cmd']) && ($param['cmd'] == 'up_set_devstatus'))$data = $iot->up_set_devstatus($param);
        
        switch ($device['type']){
            case 'zidingyidf':
                $Df = new Df();
                $cmd = $param['cmd'];
                if(method_exists($Df,$cmd)){
                    $data = $Df->$cmd($param);
                }
                break;
            case 'wyy':
                    $Wyy = new Wyy();
                    if(!isset($param['cmd'])){
                        $data = $Wyy->up($param);
                    }             
                    break;
        }
        if($data){
            $this->fanhui($data,0,'json',['Content-Length'=>strlen(json_encode($data))]);
        }
    }
    public function send(){
        $param = $this->request->post();
        $cmd = $this->request->post('cmd');
        $devid = $this->request->post('devid');
        $device = Cache::get('device:'.$devid);
        if(!$device){
            $device = Db::name('device')->where(['devicekey'=>$param['devid']])->find();
            Cache::set('device:'.$param['devid'],($device));
        }
        $data = "";
        switch ($device['type']){
            case 'zidingyidf':
                $iot = new Df();
                $cmd = $param['cmd'];
                if(method_exists($iot,$cmd) and (strpos($cmd,'down')!==false) and (strpos($cmd,'resp')===false)){
                    $data = $iot->$cmd($param);
                }
                break;
            case 'wyy':
                $Wyy = new Wyy();
                $cmd = $param['cmd'];
                if(method_exists($Wyy,$cmd)){
                    $data = $Wyy->$cmd($param);
                }
                break;    
        }
        $ret=['errno'=>0];
        if(is_array($data) and $data){
            $ret = Http::post((new Iot())->downUrl,json_encode($data));
        }

        if(!isset($ret['errno'])){
            $this->success('请求成功');
        } else{
            $this->error('请求失败');
        }
    }
    public function get(){
        $ckey = $this->request->post('ckey');
        $devid = $this->request->post('devid');
        $data ='';
        if($ckey == 'device_test'){
            $data = Cache::get('info:'.$devid);
        } elseif($ckey == 'device_basics'){
            $data = Cache::get('device:'.$devid);
            $data = $data['info'];
        } elseif($ckey == 'device_set_basics'){
            $data = Cache::get('device:'.$devid);
            $data = $data['info'];
        } elseif($ckey == 'open'){
            $data = Cache::get('open:'.$devid);
        } elseif ($ckey == 'device_debug'){
            $data = Cache::get('debug:'.$devid);
        } elseif ($ckey == 'device_modbus'){
            $data = Cache::get('modbus:'.$devid);
        } elseif ($ckey == 'device_get_element'){
            $data = Cache::get('element:'.$devid);
        } elseif ($ckey == 'set_modbus'){
            $data = Cache::get('set_modbus:'.$devid);
        } elseif($ckey == 'down_agreement'){
            $data = Cache::get('down_agreement:'.$devid);
        }
        if($data){
            $this->success('请求成功',$data);
        } else{
            $this->error('请求失败');
        }

    }
    /**
     * 返回封装后的 API 数据到客户端
     * @access protected
     * @param mixed  $data   要返回的数据
     * @param int    $code   错误码，默认为0
     * @param string $type   输出类型，支持json/xml/jsonp
     * @param array  $header 发送的 Header 信息
     * @return void
     * @throws HttpResponseException
     */
    protected function fanhui($data = null, $code = 0, $type = null, array $header = [])
    {
        $result = $data;
        // 如果未设置类型则自动判断
        $type = $type ? $type : ($this->request->param(config('var_jsonp_handler')) ? 'jsonp' : $this->responseType);

        if (isset($header['statuscode'])) {
            $code = $header['statuscode'];
            unset($header['statuscode']);
        } else {
            //未设置状态码,根据code值判断
            $code = $code >= 1000 || $code < 200 ? 200 : $code;
        }
        $response = Response::create($result, $type, $code)->header($header);
        throw new HttpResponseException($response);
    }
}