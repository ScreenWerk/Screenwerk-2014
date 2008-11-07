<?php

class Bundle extends Controller {

	function __construct() {
		parent::Controller();
		
		$this->load->model('Bundle_model', 'bundle');
		$this->load->model('Media_model', 'media');
		$this->load->model('Media_bundle_model', 'media_bundle');
		$this->load->model('Bundle_layout_model', 'bundle_layout');
		$this->load->model('Dimension_model', 'dimension');
		$this->load->model('Layout_model', 'layout');
		
		//$this->output->enable_profiler(TRUE);
	}



	function index() {
		$view['data'] = $this->bundle->get_list();
		$view['page_menu_code'] = 'bundle';
		$view['page_submenu'] = array($this->router->class .'/add'=>'Add New '. humanize($this->router->class));
		$view['page_content'] = $this->load->view('table_view', $view, True);
		$this->load->view('main_page_view', $view);
	}



	function edit($id = NULL) {
		
		if($this->input->post('save')) {
			$this->bundle->update();
			redirect($this->uri->segment(1));
		}

		if($this->input->post('save_media')) {
			$this->media_bundle->update();
		}

		if($this->input->post('save_layout')) {
			$this->bundle_layout->update();
		}

		if($this->input->post('delete')) {
			$this->bundle->delete($this->input->post('id'));
			redirect($this->uri->segment(1));
		}
		
		if($this->input->post('delete_media')) {
			$this->media_bundle->delete(current(array_keys($this->input->post('delete_media'))));
		}
		
		if($this->input->post('delete_layout')) {
			$this->bundle_layout->delete(current(array_keys($this->input->post('delete_layout'))));
		}
		
		if($this->input->post('cancel')) {
			redirect($this->uri->segment(1));
		}

		$data = $this->bundle->get_one($id);
		
		if(isset($id)) {
			$data_m2m['media'] = $this->media_bundle->get_list(NULL, $id);
			foreach($data_m2m['media'] as &$row):
				$row['media']['value'] = $row['media_id'];
				$row['media']['list'][0] = 'Chose...';
				foreach($this->media->get_names_list() as $media_key => $media_value) {
					$row['media']['list'][$media_key] = $media_value;
				}
				unset($row['media_id']);
			endforeach;
			
			$data_m2m['layout'] = $this->bundle_layout->get_list($id, NULL);
			foreach($data_m2m['layout'] as &$row):
				$row['layout']['value'] = $row['layout_id'];
				$row['layout']['list'][0] = 'Chose...';
				foreach($this->layout->get_names_list() as $media_key => $media_value) {
					$row['layout']['list'][$media_key] = $media_value;
				}
				unset($row['layout_id']);
				
				$row['dimension']['value'] = $row['dimension_id'];
				$row['dimension']['list'][0] = 'Chose...';
				foreach($this->dimension->get_names_list() as $media_key => $media_value) {
					$row['dimension']['list'][$media_key] = $media_value;
				}
				unset($row['dimension_id']);
			endforeach;

			$view['data_m2m'] = $data_m2m;
		}
		
		$view['data'] = $data;
		$view['page_menu_code'] = 'bundle';
		$view['page_content'] = $this->load->view('edit_view', $view, True);
		$this->load->view('main_page_view', $view);
	}



	function add() {
		$this->edit();
	}

}
?>
