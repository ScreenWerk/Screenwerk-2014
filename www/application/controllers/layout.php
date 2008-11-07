<?php

class Layout extends Controller {

	function __construct() {
		parent::Controller();
		
		$this->load->model('Layout_model', 'layout');
		$this->load->model('Bundle_model', 'bundle');
		$this->load->model('Dimension_model', 'dimension');
		$this->load->model('Bundle_layout_model', 'bundle_layout');
		$this->load->model('Layout_collection_model', 'layout_collection');
		
		//$this->output->enable_profiler(TRUE);
	}



	function index() {
		$view['data'] = $this->layout->get_list();
		$view['page_menu_code'] = 'layout';
		$view['page_submenu'] = array($this->router->class .'/add'=>'Add New '. humanize($this->router->class));
		$view['page_content'] = $this->load->view('table_view', $view, True);
		$this->load->view('main_page_view', $view);
	}



	function edit($id = NULL) {
		
		if($this->input->post('save')) {
			$this->layout->update();
			redirect($this->uri->segment(1));
		}

		if($this->input->post('save_bundle')) {
			$this->bundle_layout->update();
		}

		if($this->input->post('save_collection')) {
			$this->layout_collection->update();
		}

		if($this->input->post('delete')) {
			$this->layout->delete($this->input->post('id'));
			redirect($this->uri->segment(1));
		}
		
		if($this->input->post('delete_bundle')) {
			$this->bundle_layout->delete(current(array_keys($this->input->post('delete_bundle'))));
		}
		
		if($this->input->post('delete_collection')) {
			$this->layout_collection->delete(current(array_keys($this->input->post('delete_collection'))));
		}
		
		if($this->input->post('cancel')) {
			redirect($this->uri->segment(1));
		}
		
		$data = $this->layout->get_one($id);
		
		if(isset($id)) {
			$data_m2m['bundle'] = $this->bundle_layout->get_list(NULL, $id);
			foreach($data_m2m['bundle'] as &$row):
				$row['bundle']['value'] = $row['bundle_id'];
				$row['bundle']['list'][0] = 'Chose...';
				foreach($this->bundle->get_names_list() as $media_key => $media_value) {
					$row['bundle']['list'][$media_key] = $media_value;
				}
				unset($row['bundle_id']);
				
				$row['dimension']['value'] = $row['dimension_id'];
				$row['dimension']['list'][0] = 'Chose...';
				foreach($this->dimension->get_names_list() as $media_key => $media_value) {
					$row['dimension']['list'][$media_key] = $media_value;
				}
				unset($row['dimension_id']);
			endforeach;

			$data_m2m['collection'] = $this->layout_collection->get_list($id, NULL);
			foreach($data_m2m['collection'] as &$row):
				$row['collection']['value'] = $row['collection_id'];
				$row['collection']['list'][0] = 'Chose...';
				foreach($this->collection->get_names_list() as $media_key => $media_value) {
					$row['collection']['list'][$media_key] = $media_value;
				}
				unset($row['collection_id']);
			endforeach;

			$view['data_m2m'] = $data_m2m;
		}
		
		$data['dimension']['value'] = $data['dimension_id'];
		unset($data['dimension_id']);
		foreach($this->dimension->get_names_list() as $dimension_key => $dimension_value) {
			$data['dimension']['list'][$dimension_key] = $dimension_value;
		}
		
		$view['data'] = $data;
		$view['page_menu_code'] = 'layout';
		$view['page_content'] = $this->load->view('edit_view', $view, True);
		$this->load->view('main_page_view', $view);
	}



	function add() {
		$this->edit();
	}

}
?>
