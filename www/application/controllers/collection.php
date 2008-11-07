<?php

class Collection extends Controller {

	function __construct() {
		parent::Controller();
		
		$this->load->model('Collection_model', 'collection');
		$this->load->model('Schedule_model', 'schedule');
		$this->load->model('Dimension_model', 'dimension');
		$this->load->model('Layout_collection_model', 'layout_collection');
		$this->load->model('Collection_schedule_model', 'collection_schedule');
		
		//$this->output->enable_profiler(TRUE);
	}



	function index() {
		$view['data'] = $this->collection->get_list();
		$view['page_menu_code'] = 'collection';
		$view['page_submenu'] = array($this->router->class .'/add'=>'Add New '. humanize($this->router->class));
		$view['page_content'] = $this->load->view('table_view', $view, True);
		$this->load->view('main_page_view', $view);
	}



	function edit($id = NULL) {
		
		if($this->input->post('save')) {
			$this->collection->update();
			redirect($this->uri->segment(1));
		}

		if($this->input->post('save_layout')) {
			$this->layout_collection->update();
		}

		if($this->input->post('save_schedule')) {
			$this->collection_schedule->update();
		}

		if($this->input->post('delete')) {
			$this->collection->delete($this->input->post('id'));
			redirect($this->uri->segment(1));
		}
		
		if($this->input->post('delete_layout')) {
			$this->layout_collection->delete(current(array_keys($this->input->post('delete_layout'))));
		}
		
		if($this->input->post('delete_schedule')) {
			$this->collection_schedule->delete(current(array_keys($this->input->post('delete_schedule'))));
		}
		
		if($this->input->post('cancel')) {
			redirect($this->uri->segment(1));
		}
		
		$data = $this->collection->get_one($id);
		
		if(isset($id)) {
			$data_m2m['layout'] = $this->layout_collection->get_list(NULL, $id);
			foreach($data_m2m['layout'] as &$row):
				$row['layout']['value'] = $row['layout_id'];
				$row['layout']['list'][0] = 'Chose...';
				foreach($this->layout->get_names_list() as $media_key => $media_value) {
					$row['layout']['list'][$media_key] = $media_value;
				}
				unset($row['layout_id']);
			endforeach;

			$data_m2m['schedule'] = $this->collection_schedule->get_list($id, NULL);
			foreach($data_m2m['schedule'] as &$row):
				$row['schedule']['value'] = $row['schedule_id'];
				$row['schedule']['list'][0] = 'Chose...';
				foreach($this->schedule->get_names_list() as $media_key => $media_value) {
					$row['schedule']['list'][$media_key] = $media_value;
				}
				unset($row['schedule_id']);
			endforeach;

			$view['data_m2m'] = $data_m2m;
		}

		$data['dimension']['value'] = $data['dimension_id'];
		unset($data['dimension_id']);
		foreach($this->dimension->get_names_list() as $dimension_key => $dimension_value) {
			$data['dimension']['list'][$dimension_key] = $dimension_value;
		}
		
		$view['data'] = $data;
		$view['page_menu_code'] = 'collection';
		$view['page_content'] = $this->load->view('edit_view', $view, True);
		$this->load->view('main_page_view', $view);
	}



	function add() {
		$this->edit();
	}

}
?>
