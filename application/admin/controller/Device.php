<?php

namespace app\admin\controller;

use app\common\controller\Backend;
use think\Db;
use fast\Iot;
use fast\Http;
use think\Cache;
use think\exception\PDOException;
use think\exception\ValidateException;

/**
 * 设备管理
 *
 * @icon fa fa-circle-o
 */
class Device extends Backend
{

    /**
     * Device模型对象
     * @var \app\admin\model\Device
     */
    protected $model = null;
    
    protected $searchFields = 'deviceName,nickName';
    
    protected $childrenAdminIds = [];

    public function _initialize()
    {
        parent::_initialize();
        $this->childrenAdminIds = $this->auth->getChildrenAdminIds(true);
        $this->model = new \app\admin\model\Device;
        $this->view->assign("typeList", $this->model->getTypeList());
    }

    /**
     * 查看
     */
    public function index()
    {
        //设置过滤方法
        $this->request->filter(['strip_tags', 'trim']);
        if ($this->request->isAjax()) {
            //如果发送的来源是Selectpage，则转发到Selectpage
            if ($this->request->request('keyField')) {
                $_REQUEST['custom']=[
                    'admin_id'=>['in',$this->childrenAdminIds]
                ];
                return $this->selectpage();
            }
            list($where, $sort, $order, $offset, $limit) = $this->buildparams();
            $list = $this->model
                    ->where($where)
                    ->where('admin_id','in',$this->childrenAdminIds)
                    ->order($sort, $order)
                    ->paginate($limit);
            $online =0;
            $offline =0;
            $count =0;

            $devices = Db::name('device')->where('admin_id','in',$this->childrenAdminIds)->field('devicekey as devid')->select();
            $data=[
                'cmd'=>'down_select_devstatus',
                'devices'=>$devices,
                'time'=>time(),
                'sign'=>'sign'
            ];
            $res = Http::post((new Iot())->downUrl,json_encode($data));
            $res = json_decode($res,true);
            if($res){
                $res['devices'] = isset($res['devices'])?array_column($res['devices'],'devid'):[];
                $count = @count($res['devices']);
            }
            foreach ($list as $row) {
                if(in_array($row->getData('devicekey'),$res['devices'])){
                    $row->data('status',1);
                    $online++;
                } else {
                    $row->data('status',0);
                    $offline++;
                }
            }
            $result = array(
                "total" => $list->total(),
                 "rows" => $list->items(),
                 "extend" => ['online' => $online,'offline'=>$offline,'count'=>$count]
            );
            return json($result);
        }
        return $this->view->fetch();
    }

    /**
     * 编辑
     *
     * @param $ids
     * @return string
     * @throws DbException
     * @throws \think\Exception
     */
    public function edit($ids = null)
    {
        $row = $this->model->get(['id'=>$ids,'admin_id'=>['in',$this->childrenAdminIds]]);
        if (!$row) {
            $this->error(__('No Results were found'));
        }
        $adminIds = $this->getDataLimitAdminIds();
        if (is_array($adminIds) && !in_array($row[$this->dataLimitField], $adminIds)) {
            $this->error(__('You have no permission'));
        }
        if (false === $this->request->isPost()) {
            $this->view->assign('row', $row);
            return $this->view->fetch();
        }
        $params = $this->request->post('row/a');
        if (empty($params)) {
            $this->error(__('Parameter %s can not be empty', ''));
        }
        $params = $this->preExcludeFields($params);
        $result = false;
        Db::startTrans();
        try {
            //是否采用模型验证
            if ($this->modelValidate) {
                $name = str_replace("\\model\\", "\\validate\\", get_class($this->model));
                $validate = is_bool($this->modelValidate) ? ($this->modelSceneValidate ? $name . '.edit' : $name) : $this->modelValidate;
                $row->validateFailException()->validate($validate);
            }
            $result = $row->allowField(true)->save($params);
            Cache::rm('device:'.$row['devicekey']);
            Db::commit();
        } catch (ValidateException|PDOException|Exception $e) {
            Db::rollback();
            $this->error($e->getMessage());
        }
        if (false === $result) {
            $this->error(__('No rows were updated'));
        }
        $this->success();
    }

    /**
     * 删除
     *
     * @param $ids
     * @return void
     * @throws DbException
     * @throws DataNotFoundException
     * @throws ModelNotFoundException
     */
    public function del($ids = null)
    {
        if (false === $this->request->isPost()) {
            $this->error(__("Invalid parameters"));
        }
        $ids = $ids ?: $this->request->post("ids");
        if (empty($ids)) {
            $this->error(__('Parameter %s can not be empty', 'ids'));
        }
        $pk = $this->model->getPk();
        $adminIds = $this->getDataLimitAdminIds();
        if (is_array($adminIds)) {
            $this->model->where($this->dataLimitField, 'in', $adminIds);
        }
        $list = $this->model->where($pk, 'in', $ids)->where('id',$this->auth->id)->select();

        $count = 0;
        Db::startTrans();
        try {
            foreach ($list as $item) {
                $count += $item->delete();
            }
            Db::commit();
        } catch (PDOException|Exception $e) {
            Db::rollback();
            $this->error($e->getMessage());
        }
        if ($count) {
            $this->success();
        }
        $this->error(__('No rows were deleted'));
    }

    /**
     * 配置
     */
    public function config($ids = null){
        $row = $this->model->get(['id'=>$ids,'admin_id'=>['in',$this->childrenAdminIds]]);
        if (!$row) {
            $this->error(__('No Results were found'));
        }
        $adminIds = $this->getDataLimitAdminIds();
        if (is_array($adminIds) && !in_array($row[$this->dataLimitField], $adminIds)) {
            $this->error(__('You have no permission'));
        }
        $this->view->assign('row', $row);
        if($row['type'] == 'zidingyidf')return $this->view->fetch();
        if($row['type'] == 'wyy')return $this->view->fetch('configWyy');
        if($row['type'] == 'zidingyi')return $this->view->fetch();
        if($row['type'] == 'aliyun')return $this->view->fetch();
        if($row['type'] == 'kaichuang')return $this->view->fetch();
        if($row['type'] == 'hongxi')return $this->view->fetch();
    }
    /**
     * 休眠
     */
    public function sleep($ids = null){
        $row = $this->model->get(['id'=>$ids,'admin_id'=>['in',$this->childrenAdminIds]]);
        if (!$row) {
            $this->error(__('No Results were found'));
        }
        $adminIds = $this->getDataLimitAdminIds();
        if (is_array($adminIds) && !in_array($row[$this->dataLimitField], $adminIds)) {
            $this->error(__('You have no permission'));
        }
        if (false === $this->request->isPost()) {
            $this->view->assign('row', $row);
            return $this->view->fetch();
        }
        $result = false;
        $device = Cache::get('device:'.$row['devicekey']);
        Db::startTrans();
        try {
            //是否采用模型验证
            if ($this->modelValidate) {
                $name = str_replace("\\model\\", "\\validate\\", get_class($this->model));
                $validate = is_bool($this->modelValidate) ? ($this->modelSceneValidate ? $name . '.edit' : $name) : $this->modelValidate;
                $row->validateFailException()->validate($validate);
            }
            switch ($row['sleep']){
                case 0:
                    $device['sleep'] =1;
                    $params['sleep'] =1;
                    break;
                case 1:
                    $device['sleep'] =0;
                    $params['sleep'] =0;
                    break;
            }
            Cache::set('device:'.$row['devicekey'],$device);
            $result = $row->allowField(true)->save($params);
            Db::commit();
        } catch (ValidateException|PDOException|Exception $e) {
            Db::rollback();
            $this->error($e->getMessage());
        }
        if (false === $result) {
            $this->error(__('No rows were updated'));
        }
        $this->success();
    }

}
